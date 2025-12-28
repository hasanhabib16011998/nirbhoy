from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):    
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    is_verified = models.BooleanField(default=False) # Important for Lawyers and volunteers
    is_anonymous_user = models.BooleanField(default=False)

    def __str__(self):
        return self.email

class LawyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    bar_council_id = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100)

    def __str__(self):
        return f"Advocate {self.user.last_name}"