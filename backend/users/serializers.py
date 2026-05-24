from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User, LawyerProfile, VolunteerProfile
from posts.serializers import PostSerializer

# Registration Serializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['username'] = validated_data['email'].split('@')[0]

        # Create normal user
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Default to Survivor role
        try:
            group = Group.objects.get(name='Survivor')
            user.groups.add(group)
        except Group.DoesNotExist:
            pass

        return user
    
# 2. PROFESSIONAL USER SERIALIZER (FormData & Images)
class ProRegistrationSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    # Document fields
    bar_council_id_file = serializers.FileField(write_only=True, required=False)
    nid_file = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'address', 'profile_image', 'role', 'bar_council_id_file', 'nid_file']

    def validate(self, data):
        role = data.get('role')
        if role not in ['Lawyer', 'Volunteer']:
            raise serializers.ValidationError("Invalid professional role")
            
        if role == 'Lawyer' and not data.get('bar_council_id_file'):
            raise serializers.ValidationError({"bar_council_id_file":"Bar Council ID Image is required"})
        
        if role == 'Volunteer' and not data.get('nid_file'):
            raise serializers.ValidationError({"nid_file":"NID Image is required."})

        return data

    def create(self, validated_data):
        role_name = validated_data.pop('role')
        password = validated_data.pop('password')
        bar_council_id_file = validated_data.pop('bar_council_id_file', None)
        nid_file = validated_data.pop('nid_file', None)

        validated_data['username'] = validated_data['email'].split('@')[0]

        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.is_verified = False # Pros must be manually verified by admins
        user.save()
        

        # Assign Role
        try:
            group = Group.objects.get(name='Survivor')
            user.groups.add(group)
        except Group.DoesNotExist:
            pass

        # Create specific profile
        if role_name == 'Lawyer':
            LawyerProfile.objects.create(user=user, bar_council_id_file=bar_council_id_file)
        elif role_name == 'Volunteer':
            VolunteerProfile.objects.create(user=user, nid_file=nid_file)

        return user

# Login Serializer (Just for validating credentials)
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UserListSerializer(serializers.ModelSerializer):
    imageUrl = serializers.ReadOnlyField(source='get_full_image_url')
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'date_joined', 'imageUrl']


class UserProfileSerializer(serializers.ModelSerializer):
    # 1. Nest the posts so the frontend can count them
    posts = PostSerializer(many=True, read_only=True)

    # 2. Add fields expected by your React Profile component
    name = serializers.SerializerMethodField()
    imageUrl = serializers.ReadOnlyField(source='get_full_image_url')
    bio = serializers.SerializerMethodField()
    
    # 3. Add placeholders for followers (until you implement that feature)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        # The frontend gets this exact JSON structure
        fields = [
            'id', 'username', 'email', 
            'first_name', 'last_name', 'phone_number', 'address', # ✅ Updatable fields
            'name', 'imageUrl', 'bio', 
            'posts', 'followers_count', 'following_count',
            'is_verified'
        ]

        read_only_fields = ['username', 'email', 'is_verified']

    def get_name(self, obj):
        # Return "First Last" or fallback to Username
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username


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
            return "Nirbhoy Community Member"
        
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
    
class UserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
    full_image_url = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'phone_number', 'email', 'first_name', 'last_name', 'profile_image','full_image_url','role','address' ]
        
    def get_role(self, obj):
        # 'obj' represents the User instance
        return obj.groups.first().name if obj.groups.exists() else "Survivor"
    
    def get_full_image_url(self, obj):
            return obj.get_full_image_url