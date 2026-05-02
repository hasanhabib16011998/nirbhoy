from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from .models import SosAlert
from .serializers import SosAlertSerializer, SosAlertDetailsSerializer

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
    

class ActiveSosListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only fetch alerts where is_active is True, newest first
        active_alerts = SosAlert.objects.filter(is_active=True).order_by('-timestamp')
        serializer = SosAlertSerializer(active_alerts, many=True)
        return Response(serializer.data)

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
    
class SosHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all alerts where the current user is in the 'responders' ManyToMany field
        # Order by newest first
        history_alerts = SosAlert.objects.filter(responders=request.user).order_by('-timestamp')
        
        # Use your standard serializer (make sure it's imported!)
        serializer = SosAlertSerializer(history_alerts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)