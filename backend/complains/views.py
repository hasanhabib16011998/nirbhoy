from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import SosAlert
from .serializers import SosAlertSerializer

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