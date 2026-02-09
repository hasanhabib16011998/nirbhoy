from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User, LawyerProfile
import random
import string
from posts.serializers import PostSerializer

# Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)
    bar_council_id = serializers.CharField(write_only=True, required=False)
    specialization = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'role', 'is_anonymous_user', 'bar_council_id', 'specialization']

    def validate(self, data):
        role = data.get('role')
        valid_roles = ['Survivor', 'Lawyer', 'Volunteer', 'Admin']
        if role not in valid_roles:
            raise serializers.ValidationError({"role": f"Invalid role. Choose from: {valid_roles}"})

        if role == 'Lawyer' and not data.get('bar_council_id'):
            raise serializers.ValidationError({"bar_council_id": "Bar Council ID is required for Lawyers."})

        return data

    def create(self, validated_data):
        role_name = validated_data.pop('role')
        bar_id = validated_data.pop('bar_council_id', None)
        spec = validated_data.pop('specialization', None)
        password = validated_data.pop('password')

        # 1. Handle Username
        if validated_data.get('is_anonymous_user', False):
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            validated_data['username'] = f"user_{suffix}"
            validated_data['first_name'] = "Anonymous"
            validated_data['last_name'] = "User"
        else:
            validated_data['username'] = validated_data['email'].split('@')[0]

        # 2. Create User
        user = User(**validated_data)
        user.set_password(password)
        
        # 3. Verification Logic
        if role_name in ['Lawyer', 'Volunteer']:
            user.is_verified = False
        else:
            user.is_verified = True
        
        user.save()

        # 4. Group Assignment
        try:
            group = Group.objects.get(name=role_name)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass

        # 5. Lawyer Profile
        if role_name == 'Lawyer' and bar_id:
            LawyerProfile.objects.create(
                user=user, 
                bar_council_id=bar_id, 
                specialization=spec or "General"
            )

        return user

# Login Serializer (Just for validating credentials)
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    # 1. Nest the posts so the frontend can count them
    posts = PostSerializer(many=True, read_only=True)

    # 2. Add fields expected by your React Profile component
    name = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    
    # 3. Add placeholders for followers (until you implement that feature)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        # The frontend gets this exact JSON structure
        fields = [
            'id', 'username', 'email', 
            'name', 'imageUrl', 'bio', 
            'posts', 'followers_count', 'following_count',
            'is_verified'
        ]

    def get_name(self, obj):
        # Return "First Last" or fallback to Username
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username

    def get_imageUrl(self, obj):
        # Return None so frontend uses the default placeholder image
        return None 

    def get_bio(self, obj):
        """
        Dynamically generate the Bio based on the User's Django Group.
        """
        # Get list of group names this user belongs to
        groups = obj.groups.values_list('name', flat=True)

        if 'Lawyer' in groups:
            # Check if they actually have a profile created to avoid crashes
            if hasattr(obj, 'lawyer_profile'):
                return f"Advocate | {obj.lawyer_profile.specialization}"
            return "Advocate"
        
        elif 'Survivor' in groups:
            return "Survivor Community Member"
        
        elif 'Volunteer' in groups:
            return "Verified Volunteer"
        
        elif 'Admin' in groups or obj.is_staff:
            return "Community Administrator"

        # Default fallback for users with no group
        return "Community Member"

    def get_followers_count(self, obj):
        return 0 

    def get_following_count(self, obj):
        return 0