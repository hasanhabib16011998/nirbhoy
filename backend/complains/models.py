from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SosAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sos_alerts')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    responders = models.ManyToManyField(User, related_name='responding_to', blank=True)

    def __str__(self):
        return f"SOS: {self.user.username} at {self.timestamp}"