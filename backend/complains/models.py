from django.db import models
from django.contrib.auth import get_user_model
from posts.models import Attachment
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation

User = get_user_model()

class ResolveStatus(models.Model):
    # Generic Relation Fields
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    # Resolution Fields
    is_resolved_user = models.BooleanField(default=False)
    user_review = models.TextField(blank=True, null=True)
    user_submitted_resolve = models.BooleanField(default=False)
    
    is_resolved_responder = models.BooleanField(default=False)
    responder_review = models.TextField(blank=True, null=True)
    responder_submitted_resolve = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Resolve Statuses"
        # Ensures only one resolution status exists per SOS/Case
        unique_together = ('content_type', 'object_id') 
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return f"Resolution for {self.content_type.name} ID: {self.object_id}"

class SosAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sos_alerts')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    message = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    responders = models.ManyToManyField(User, related_name='responding_to', blank=True)

    def __str__(self):
        return f"SOS: {self.user.username} at {self.timestamp}"
    


class LegalAidApplication(models.Model):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='legal_aid_applications')
    caption = models.CharField(max_length=255)
    description = models.TextField()
    
    status_choices = [
        ('Pending', 'Pending'),
        ('Reviewed', 'Reviewed'),
        ('Accepted', 'Accepted'),
        ('Closed', 'Closed'),
    ]
    status = models.CharField(max_length=20, choices=status_choices, default='Pending')
    responders = models.ManyToManyField(User, related_name='responding_to_aid', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Reverse Generic Relation ---
    # This allows us to do: application.attachments.all() or application.attachments.create(...)
    attachments = GenericRelation(Attachment)

    def __str__(self):
        return f"{self.applicant.username} - {self.caption[:30]}"