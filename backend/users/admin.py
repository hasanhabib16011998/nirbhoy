from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
from django.utils.html import format_html

class CustomUserAdmin(UserAdmin):
    model = User
    
    # 1. Columns to show in the list
    # We use 'get_groups' to show the group name
    list_display = ['email', 'username', 'get_groups', 'is_verified', 'is_anonymous_user', 'is_staff']
    
    # 2. Filters on the right sidebar
    list_filter = ['groups', 'is_verified', 'is_staff', 'is_anonymous_user']
    
    # 3. Search capability
    search_fields = ['email', 'username', 'phone_number']
    
    # 4. Edit User Page Layout
    # This adds your custom fields to the edit form
    fieldsets = UserAdmin.fieldsets + (
        ('Nirbhoy Custom Fields', {
            'fields': ('phone_number', 'profile_image', 'is_verified', 'is_anonymous_user', 'address'),
        }),
    )
    
    # 5. Add User Page Layout
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Nirbhoy Custom Fields', {
            'fields': ('phone_number', 'email'),
        }),
    )

    # 6. Helper to display groups (ManyToMany field)
    def get_groups(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])
    get_groups.short_description = 'Role (Group)'

admin.site.register(User, CustomUserAdmin)

class LawyerProfileAdmin(admin.ModelAdmin):
    # Columns for the Lawyer table
    list_display = ['get_user_name', 'bar_council_id', 'specialization']
    
    # Search by User's email or Bar ID
    search_fields = ['user__email', 'user__first_name', 'bar_council_id', 'specialization']
    
    # Filter by Specialization
    list_filter = ['specialization']

    # Helper to show the lawyer's name clearly
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name} ({obj.user.email})"
    get_user_name.short_description = 'Lawyer User'

admin.site.register(LawyerProfile, LawyerProfileAdmin)

@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    # What columns show up in the list view
    list_display = ('user', 'get_email', 'get_phone', 'is_user_verified')
    
    # Allow admins to search by the related user's email, name, or phone
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'user__phone_number')
    
    # Add a readonly field for the image preview so admins can see the NID easily
    readonly_fields = ('nid_image_preview',)

    # Organize the detail view layout
    fieldsets = (
        ('Volunteer Info', {
            'fields': ('user',)
        }),
        ('Verification Documents', {
            'fields': ('nid_image', 'nid_image_preview')
        }),
    )

    # --- Custom Methods to pull data from the related User model ---

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    def get_phone(self, obj):
        return obj.user.phone_number
    get_phone.short_description = 'Phone'

    def is_user_verified(self, obj):
        return obj.user.is_verified
    is_user_verified.boolean = True
    is_user_verified.short_description = 'Verified'

    # --- Custom Method to show the NID image inline ---

    def nid_image_preview(self, obj):
        if obj.nid_image:
            return format_html(
                '<a href="{0}" target="_blank">'
                '<img src="{0}" style="max-height: 200px; max-width: 300px; border-radius: 5px; border: 1px solid #ccc;" />'
                '</a>', 
                obj.nid_image.url
            )
        return "No NID uploaded yet."
    nid_image_preview.short_description = "NID Image Preview"