# emergencies/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import SosAlert

@admin.register(SosAlert)
class SosAlertAdmin(admin.ModelAdmin):
    # What columns show up in the list view
    list_display = ('user', 'timestamp', 'is_active', 'latitude', 'longitude')
    
    # Add filters to the right sidebar
    list_filter = ('is_active', 'timestamp')
    
    # Allow searching by user
    search_fields = ('user__username', 'user__email')
    
    # Make the fields read-only so admins don't accidentally move an SOS pin
    readonly_fields = ('user', 'latitude', 'longitude', 'timestamp', 'map_view')
    
    # Organize the detail view into sections
    fieldsets = (
        ('Alert Information', {
            'fields': ('user', 'timestamp', 'is_active', 'message')
        }),
        ('Location Data', {
            'fields': ('latitude', 'longitude', 'map_view')
        }),
        ('Responders', {
            'fields': ('responders',)
        }),
    )

    def map_view(self, obj):
        """
        Generates an HTML iframe embedding an OpenStreetMap centered on the coordinates.
        """
        if obj.latitude and obj.longitude:
            lat = float(obj.latitude)
            lng = float(obj.longitude)
            
            # Create a bounding box to set the zoom level
            offset = 0.005 
            bbox = f"{lng - offset},{lat - offset},{lng + offset},{lat + offset}"
            
            # Return an embedded OpenStreetMap iframe
            return format_html(
                '<iframe width="100%" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" '
                'src="https://www.openstreetmap.org/export/embed.html?bbox={}&amp;layer=mapnik&amp;marker={},{}">'
                '</iframe>'
                '<br/><br/>'
                '<a class="button" href="https://www.openstreetmap.org/?mlat={}&amp;mlon={}#map=16/{}/{}" target="_blank">'
                'Open in Full Map'
                '</a>',
                bbox, lat, lng, lat, lng, lat, lng
            )
        return "No location data available."
    
    map_view.short_description = "Live Map"