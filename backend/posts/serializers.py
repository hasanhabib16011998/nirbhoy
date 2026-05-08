from rest_framework import serializers
from .models import *
from users.models import User

class UserTinySerializer(serializers.ModelSerializer):
    profile_image = serializers.ReadOnlyField(source='get_full_image_url')
    role = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_image', 'role' ]
        
    def get_role(self, obj):
        # 'obj' represents the User instance
        return obj.groups.first().name if obj.groups.exists() else "Survivor"
    
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserTinySerializer(read_only=True)
    likes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    is_saved = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'caption', 'attachments', 'location','is_verified', 'tags', 'likes', 'comments_count', 'is_saved', 'created_at', 'updated_at']

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedPost.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class SavedPostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)

    class Meta:
        model = SavedPost
        fields = ['id', 'user', 'post', 'created_at']

class CommentUserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.ReadOnlyField(source='get_full_image_url')
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image_url']

class CommentSerializer(serializers.ModelSerializer):
    user = CommentUserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']