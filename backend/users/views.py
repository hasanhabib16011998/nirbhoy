from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from .models import *
import random
from django.core.cache import cache

# 1. Registration APIView
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Fetch role for response
            role = user.groups.first().name if user.groups.exists() else "None"

            #send OTP
            otp = str(random.randint(1000, 9999))
            cache_key = f"otp:{user.phone_number}"
            cache.set(cache_key, otp, timeout=300)
            
            # TODO: Integrate actual Email or SMS sending logic here
            print(f"--- MOCK SMS --- Sent OTP {otp} to {user.phone_number}")
            
            return Response({
                "message": "Registration successful",
                "user": {
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "role": role,
                    "is_verified": user.is_verified,
                    "username": user.username
                }
            }, status=status.HTTP_201_CREATED)

        
        error_lists = list(serializer.errors.values())
        
        if error_lists and len(error_lists[0]) > 0:
            clean_error_message = error_lists[0][0]
        else:
            clean_error_message = "Invalid data provided."

        return Response(
            {"message": clean_error_message}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
class ProRegisterView(APIView):
    permission_classes = [AllowAny]
    # Tell Django to expect files in the request
    parser_classes = (MultiPartParser, FormParser) 

    def post(self, request):
        serializer = ProRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            role = user.groups.first().name if user.groups.exists() else "Unknown"

            #send OTP
            otp = str(random.randint(1000, 9999))
            cache_key = f"otp:{user.phone_number}"
            cache.set(cache_key, otp, timeout=300)
            
            # TODO: Integrate actual Email or SMS sending logic here
            print(f"--- MOCK SMS --- Sent OTP {otp} to {user.phone_number}")
            
            return Response({
                "message": f"{role} application submitted successfully. Pending admin approval.",
                "user": {"email": user.email, "phone_number": user.phone_number, "role": role, "is_verified": False}
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyUserOTPView(APIView):
    """
    Receives user data and OTP from the frontend, checks it against Redis,
    and marks the user as verified if it matches.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Extract data sent from the React frontend
        phone_number = request.data.get('phone_number')
        submitted_otp = request.data.get('otp')

        if not phone_number or not submitted_otp:
            return Response(
                {"message": "Phone number and OTP are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Fetch the stored OTP from Redis using the same key format
        cache_key = f"otp:{phone_number}"
        stored_otp = cache.get(cache_key)

        # 2. Check if the OTP exists or has expired
        if not stored_otp:
            return Response(
                {"message": "OTP has expired or does not exist. Please request a new one."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Compare the submitted OTP with the stored OTP
        if str(stored_otp) == str(submitted_otp):
            try:
                # Find the user and update their verification status
                user = User.objects.get(phone_number=phone_number)
                user.is_verified = True
                user.save()

                # Clean up: Delete the OTP from Redis so it can't be reused
                cache.delete(cache_key)

                return Response(
                    {"message": "Account successfully verified. You can now log in."}, 
                    status=status.HTTP_200_OK
                )
                
            except User.DoesNotExist:
                return Response(
                    {"message": "User not found."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # OTP did not match
            return Response(
                {"message": "Invalid OTP. Please check the code and try again."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
# 2. Login APIView
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            password = serializer.validated_data['password']

            # Authenticate using email (since USERNAME_FIELD = 'email')
            user = User.objects.filter(phone_number=phone_number).first()

            if user is not None and user.check_password(password):
                # Generate JWT Tokens Manually
                refresh = RefreshToken.for_user(user)
                
                # Get Role
                role = user.groups.first().name if user.groups.exists() else "No Role"

                return Response({
                    "refresh_token": str(refresh),
                    "access_token": str(refresh.access_token),
                    "user_id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "role": role,
                    "is_verified": user.is_verified
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        
        if not phone_number:
            return Response({"error": "Phone number is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists
        user = User.objects.filter(phone_number=phone_number).first()
        if not user:
            return Response({"error": "No account found with this phone number."}, status=status.HTTP_404_NOT_FOUND)

        # Generate and store OTP
        otp = str(random.randint(1000, 9999))
        cache_key = f"otp:{phone_number}" # Using phone_number for the cache key now!
        cache.set(cache_key, otp, timeout=300)

        # MOCK SMS LOGIC
        print(f"--- MOCK SMS --- Sent OTP {otp} to {phone_number} for Password Reset")

        return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)
    
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        new_password = request.data.get('new_password')

        if not phone_number or not new_password:
            return Response({"error": "Phone number and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone_number=phone_number).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Set the new password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Determine Role
        role = user.groups.first().name if user.groups.exists() else "None"

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role,
            "is_verified": user.is_verified,
            "imageUrl": user.get_full_image_url,
        })
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the refresh token from the request body
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            
            # Blacklist the token (requires 'rest_framework_simplejwt.token_blacklist' in INSTALLED_APPS)
            token.blacklist()

            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        # 1. Order by creation date descending (newest first)
        queryset = User.objects.filter(lawyer_profile__isnull=False).order_by('-date_joined')
        
        # 2. Check for 'limit' parameter in the URL
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                return queryset[:int(limit)]
            except ValueError:
                pass # If limit isn't a number, ignore it
        
        return queryset
    
class UserListByGroupView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by Group Name
        group_name = self.request.query_params.get('group')
        if group_name:
            queryset = queryset.filter(groups__name__iexact=group_name)
        
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                return queryset[:int(limit)]
            except ValueError:
                pass
        
        return queryset
    
class UserDetailView(generics.RetrieveUpdateAPIView):
    # This acts as the "Pool" of users we can search in.
    queryset = User.objects.all()
    
    # This serializer ensures the group logic & nested posts are applied
    serializer_class = UserProfileSerializer
    
    # Only logged-in users can view profiles
    permission_classes = [IsAuthenticated]