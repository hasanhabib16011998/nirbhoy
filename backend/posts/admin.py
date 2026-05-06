from django.contrib import admin
from .models import Post, Comment, Attachment
from django.contrib.contenttypes.admin import GenericTabularInline

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    # Columns to show in the list view
    list_display = ('id', 'author', 'short_caption','is_verified', 'location', 'created_at')
    
    # Add filters to the right sidebar
    list_filter = ('is_verified', 'created_at', 'updated_at')
    
    # Add a search bar
    search_fields = ('caption', 'author__username', 'location')
    
    # Make these fields read-only in the edit form
    readonly_fields = ('created_at', 'updated_at')

    # Helper to show a shortened caption in the list view
    def short_caption(self, obj):
        return obj.caption[:50] + "..." if len(obj.caption) > 50 else obj.caption
    short_caption.short_description = 'Caption'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    # Columns to show in the list view
    list_display = ('user', 'text', 'created_at')


class AttachmentInline(GenericTabularInline):
    model = Attachment
    extra = 1  # How many empty upload rows to show by default
    
    # Optional: You only need these if you named your ContentType fields 
    # something other than 'content_type' and 'object_id' in your Attachment model.
    # Included here just for clarity!
    ct_field = "content_type"
    ct_fk_field = "object_id"

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'content_type', 'object_id', 'uploaded_at')
    list_filter = ('content_type', 'uploaded_at')
    search_fields = ('file',)
    readonly_fields = ('uploaded_at',)
    
    