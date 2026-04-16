from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_anonymous_user = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    def __str__(self):
        return self.email
    
    @property
    def get_full_image_url(self):
        if self.profile_image:
            base_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
            return f"{base_url}{self.profile_image.url}"
        return None

class LawyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    bar_council_id = models.CharField(max_length=50, unique=True)
    bar_council_id_image = models.ImageField(upload_to='lawyer_docs/')
    specialization = models.CharField(max_length=100, default="General")

    def __str__(self):
        return f"Advocate {self.user.last_name}"
    
class VolunteerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    nid_image = models.ImageField(upload_to='volunteer_docs/')

    def __str__(self):
        return f"Volunteer {self.user.last_name}"