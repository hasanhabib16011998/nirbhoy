from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from .models import SosAlert, LegalAidApplication
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from django.contrib.contenttypes.models import ContentType


class ReceiveSosAPIView(APIView):
    # This ensures only logged-in users can trigger an SOS
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        print(request.data)
        serializer = SosAlertSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the alert and automatically attach the user who made the request
            serializer.save(user=request.user, is_active=True)
            
            # TODO in the future: Trigger a notification to volunteers here
            
            return Response(
                {"message": "SOS Alert broadcasted successfully", "data": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ActiveUserSosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch the most recent active alert for the logged-in user
        alert = SosAlert.objects.filter(user=request.user, is_active=True).order_by('-timestamp').first()
        
        if alert:
            # We use the Details serializer so responders are included immediately
            serializer = SosAlertDetailsSerializer(alert)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return Response({"message": "No active SOS found."}, status=status.HTTP_404_NOT_FOUND)

# View to mark a specific alert as resolved
class ResolveSosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # Find the alert by its ID
        alert = get_object_or_404(SosAlert, pk=pk, is_active=True)
        
        # Mark it as resolved
        alert.is_active = False
        alert.save()
        
        return Response({"message": "Emergency marked as resolved."})
    

class RespondSosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # Find the active alert
        alert = get_object_or_404(SosAlert, pk=pk, is_active=True)
        
        # Add the logged-in volunteer to the responders list
        alert.responders.add(request.user)
        
        return Response(
            {"message": "You have been marked as responding to this emergency."},
            status=status.HTTP_200_OK
        )
    

class SosAlertDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # Fetch the alert or return a 404 if it doesn't exist
        alert = get_object_or_404(SosAlert, pk=pk)
        
        # Serialize the data and send it back to the React frontend
        serializer = SosAlertDetailsSerializer(alert)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SOSDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Safely determine the user's role (convert to lowercase for safe checking)
        role = user.groups.first().name if user.groups.exists() else "survivor"
        
        # Define which roles are allowed to respond to emergencies
        responder_roles = ['Volunteer', 'Survivor']

        # 2. Dynamically set the querysets based on the role
        if role in responder_roles:
            if role == 'Volunteer':
                # 🚨 VOLUNTEER VIEW
                # Active: All currently active emergencies
                active_alerts = SosAlert.objects.filter(is_active=True).order_by('-timestamp')
                
                # History: Emergencies where THIS volunteer is in the responders list
                history_alerts = SosAlert.objects.filter(responders=user).order_by('-timestamp')
            
            else:
                # 🛡️ SURVIVOR VIEW
                # Active: Only the active emergencies created by THIS user
                active_alerts = SosAlert.objects.filter(user=user, is_active=True).order_by('-timestamp')
                
                # History: Emergencies created by THIS user that are now resolved (is_active=False)
                history_alerts = SosAlert.objects.filter(user=user, is_active=False).order_by('-timestamp')

        # 3. Serialize the data
        active_serializer = SosAlertSerializer(active_alerts, many=True)
        history_serializer = SosAlertSerializer(history_alerts, many=True)
        
        # 4. Return combined data
        return Response({
            "active": active_serializer.data,
            "history": history_serializer.data
        }, status=status.HTTP_200_OK)
    
class ApplyForLegalAidView(APIView):
    """
    POST API to create a Legal Aid Application with multiple generic attachments.
    Written using APIView for explicit control over the request flow.
    """
    permission_classes = [IsAuthenticated]
    
    # Crucial: Tells Django to expect form data (text + files) instead of raw JSON
    parser_classes = [MultiPartParser, FormParser] 

    def post(self, request, *args, **kwargs):
        # 1. Pass the incoming data to the serializer
        serializer = LegalAidApplicationSerializer(data=request.data)
        
        # 2. Check if the text data is valid
        if serializer.is_valid():
            
            # 3. Save the application and attach the currently logged-in user
            application = serializer.save(applicant=request.user)
            
            # 4. Extract the list of files from the request
            # 'attachments' is the key your React frontend must use to append the files
            files = request.FILES.getlist('attachments')
            
            # 5. Loop through the files and create the generic attachments
            # Since we used GenericRelation, Django handles ContentType/ObjectID automatically!
            for file in files:
                application.attachments.create(file=file)
                
            # 6. Return success response with the serialized data (which now includes the files)
            return Response(
                {
                    "message": "Legal Aid Application submitted successfully.", 
                    "data": serializer.data
                }, 
                status=status.HTTP_201_CREATED
            )
            
        # 7. If validation fails, return the errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LegalAidDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. FIXED: Actually convert to lowercase for safe checking!
        role = user.groups.first().name.lower() if user.groups.exists() else "survivor"
        
        # Define roles in lowercase to match
        responder_roles = ['lawyer', 'survivor']

        # Fallback empty querysets to prevent UnboundLocalError if a user has a weird role
        active_aids = LegalAidApplication.objects.none()
        aids_history = LegalAidApplication.objects.none()

        # 2. Dynamically set the querysets based on the role
        if role in responder_roles:
            if role == 'lawyer':
                # 🚨 LAWYER VIEW
                active_aids = LegalAidApplication.objects.filter(status='Pending').order_by('-created_at')
                aids_history = LegalAidApplication.objects.filter(responders=user).exclude(status='Pending').order_by('-created_at')
            
            else:
                # 🛡️ SURVIVOR VIEW
                # Active: Only the active emergencies created by THIS user
                active_aids = LegalAidApplication.objects.filter(applicant=user, status='Pending').order_by('-created_at')
                
                # History: Emergencies created by THIS user that are now resolved
                aids_history = LegalAidApplication.objects.filter(applicant=user).exclude(status='Pending').order_by('-created_at')

        # 3. Serialize the data
        active_serializer = LegalAidDashbordSerializer(active_aids, many=True)
        history_serializer = LegalAidDashbordSerializer(aids_history, many=True)
        
        # 4. Return combined data
        return Response({
            "active": active_serializer.data,
            "history": history_serializer.data
        }, status=status.HTTP_200_OK)
    
class LegalAidDetailAPIView(generics.RetrieveAPIView):
    queryset = LegalAidApplication.objects.all()
    serializer_class = LegalAidDetailsSerializer
    permission_classes = [IsAuthenticated]
    
    # We pass the request context so image URLs are absolute!
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
class ResolveStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_content_type(self, model_name):
        try:
            return ContentType.objects.get(model=model_name.lower())
        except ContentType.DoesNotExist:
            return None

    def get(self, request, model_name, object_id):
        content_type = self.get_content_type(model_name)
        if not content_type:
            return Response({"error": "Invalid model name."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the status if it exists, otherwise return an empty 200 response
        resolve_status = ResolveStatus.objects.filter(content_type=content_type, object_id=object_id).first()
        if not resolve_status:
            return Response(None, status=status.HTTP_200_OK)
            
        serializer = ResolveStatusSerializer(resolve_status)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, model_name, object_id):
        content_type = self.get_content_type(model_name)
        if not content_type:
            return Response({"error": "Invalid model name."}, status=status.HTTP_400_BAD_REQUEST)

        # get_or_create ensures that the first person to resolve creates the record,
        # and the second person simply updates it.
        resolve_status, created = ResolveStatus.objects.get_or_create(
            content_type=content_type,
            object_id=object_id
        )

        # partial=True allows sending only specific fields (e.g., just the responder's review)
        serializer = ResolveStatusSerializer(resolve_status, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)