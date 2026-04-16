from rest_framework import serializers
from .models import Post, SavedPost
from users.models import User

class UserTinySerializer(serializers.ModelSerializer):
    profile_image = serializers.ReadOnlyField(source='get_full_image_url')
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_image' ] 

class PostSerializer(serializers.ModelSerializer):
    author = UserTinySerializer(read_only=True)
    likes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'caption', 'image', 'location','is_verified', 'tags', 'likes', 'is_saved', 'created_at', 'updated_at']

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedPost.objects.filter(user=request.user, post=obj).exists()
        return False

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class SavedPostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)

    class Meta:
        model = SavedPost
        fields = ['id', 'user', 'post', 'created_at']