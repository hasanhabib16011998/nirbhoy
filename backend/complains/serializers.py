# emergencies/serializers.py
from rest_framework import serializers
from .models import SosAlert
from users.models import User

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