from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, LawyerProfile

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
            'fields': ('phone_number', 'is_verified', 'is_anonymous_user'),
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