from django.db import models
from users.models import User
# Create your models here.

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    caption = models.TextField()
    image = models.ImageField(upload_to='post_images/') 
    location = models.CharField(max_length=255, blank=True)
    tags = models.CharField(max_length=255, blank=True) # Storing tags as comma-separated string
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author.username} - {self.caption[:20]}"