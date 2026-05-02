# emergencies/serializers.py
from rest_framework import serializers
from .models import SosAlert

class SosAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SosAlert
        fields = ['id', 'user', 'latitude', 'longitude', 'message', 'timestamp', 'is_active']
        read_only_fields = ['user', 'timestamp', 'id']