from django.db import models
from users.models import User
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import FileExtensionValidator


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # --- Generic Relation Fields ---
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at'] # Shows newest comments first
        indexes = [
            models.Index(fields=["content_type", "object_id"]), # Optimizes generic queries
        ]

    def __str__(self):
        return f"{self.user.username}: {self.text[:20]}"
    
    
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    caption = models.TextField()
    image = models.ImageField(upload_to='post_images/') 
    location = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)
    tags = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    comments = GenericRelation(Comment)

    def __str__(self):
        return f"{self.author.username} - {self.caption[:20]}"

    @property
    def total_likes(self):
        return self.likes.count()

class SavedPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post') # A user can't save the same post twice

    def __str__(self):
        return f"{self.user.username} saved {self.post.id}"
    

class Attachment(models.Model):
    """A generic model to handle file uploads for ANY other model in the app."""
    file = models.FileField(
        upload_to='attachments/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # --- Generic Relation Fields ---
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        indexes = [
            models.Index(fields=["content_type", "object_id"]), # Optimizes queries
        ]

    def __str__(self):
        return f"Attachment {self.id} for {self.content_type.model} {self.object_id}"
    

