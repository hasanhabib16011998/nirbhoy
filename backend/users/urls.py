from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register-pro/', ProRegisterView.as_view(), name='register-pro'),
    path('verify-user', VerifyUserOTPView.as_view(), name='verify-user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('list/', UserListView.as_view(), name='get-users'),
    path('group/', UserListByGroupView.as_view(), name='get-users-by-group'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
