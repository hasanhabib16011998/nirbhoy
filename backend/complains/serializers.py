# emergencies/serializers.py
from rest_framework import serializers
from .models import SosAlert, LegalAidApplication
from users.models import User
from posts.serializers import AttachmentSerializer
from posts.serializers import UserTinySerializer
from users.serializers import UserProfileSerializer

class SosAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SosAlert
        fields = ['id', 'user', 'latitude', 'longitude', 'message', 'timestamp', 'is_active']
        read_only_fields = ['user', 'timestamp', 'id']

class SosVictimSerializer(serializers.ModelSerializer):
    profile_image = serializers.ReadOnlyField(source='get_full_image_url')

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'address', 'profile_image']

class SosAlertDetailsSerializer(serializers.ModelSerializer):
    user = SosVictimSerializer(read_only=True)
    responders = SosVictimSerializer(many=True, read_only=True)
    class Meta:
        model = SosAlert
        fields = ['id', 'user', 'latitude', 'longitude', 'message', 'timestamp', 'is_active', 'responders']
        read_only_fields = ['user', 'timestamp', 'id']

class LegalAidApplicationSerializer(serializers.ModelSerializer):
    # This matches the 'attachments = GenericRelation(Attachment)' variable name in the model
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = LegalAidApplication
        fields = ['id', 'applicant', 'caption', 'description', 'status', 'attachments', 'created_at']
        read_only_fields = ['applicant', 'status', 'created_at']

class LegalAidDashbordSerializer(serializers.ModelSerializer):
    # Nesting the tiny serializers so the frontend gets full objects, not just IDs
    applicant = UserTinySerializer(read_only=True)
    responders = UserTinySerializer(many=True, read_only=True)
    
    # Matches the 'attachments = GenericRelation(Attachment)' in your model
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = LegalAidApplication
        fields = [
            'id', 
            'applicant', 
            'caption', 
            'description', 
            'status', 
            'responders', 
            'attachments', 
            'created_at'
        ]

class LegalAidDetailsSerializer(serializers.ModelSerializer):
    # Nesting the tiny serializers so the frontend gets full objects, not just IDs
    applicant = UserProfileSerializer(read_only=True)
    responders = UserProfileSerializer(many=True, read_only=True)
    
    # Matches the 'attachments = GenericRelation(Attachment)' in your model
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = LegalAidApplication
        fields = [
            'id', 
            'applicant', 
            'caption', 
            'description', 
            'status', 
            'responders', 
            'attachments', 
            'created_at'
        ]