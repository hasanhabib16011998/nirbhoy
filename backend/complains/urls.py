from django.urls import path
from .views import *

urlpatterns = [
    path('trigger/', ReceiveSosAPIView.as_view(), name='trigger-sos'),
    path('<int:pk>/', SosAlertDetailAPIView.as_view(), name='sos-detail'),
    path('<int:pk>/resolve/', ResolveSosAPIView.as_view(), name='resolve-sos'),
    path('<int:pk>/respond/', RespondSosAPIView.as_view(), name='respond-sos'),
    path('dashboard/', SOSDashboardAPIView.as_view(), name='sos-dashboard'),
    path('legal-aid/apply/', ApplyForLegalAidView.as_view(), name='legal-aid'),
    path('legal-aid/dashboard/', LegalAidDashboardAPIView.as_view(), name='legal-aid-dashboard'),
    path('legal-aid/<int:pk>/', LegalAidDetailAPIView.as_view(), name='legal-aid-detail'),
]