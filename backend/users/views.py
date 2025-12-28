from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, LoginSerializer

# 1. Registration APIView
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Fetch role for response
            role = user.groups.first().name if user.groups.exists() else "None"
            
            return Response({
                "message": "Registration successful",
                "user": {
                    "email": user.email,
                    "role": role,
                    "is_verified": user.is_verified,
                    "username": user.username
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. Login APIView
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Authenticate using email (since USERNAME_FIELD = 'email')
            user = authenticate(request, username=email, password=password)

            if user is not None:
                # Generate JWT Tokens Manually
                refresh = RefreshToken.for_user(user)
                
                # Get Role
                role = user.groups.first().name if user.groups.exists() else "No Role"

                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user_id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "role": role,
                    "is_verified": user.is_verified
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)