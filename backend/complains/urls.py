from django.urls import path
from .views import *

urlpatterns = [
    path('trigger/', ReceiveSosAPIView.as_view(), name='trigger-sos'),
    path('active/', ActiveSosListView.as_view(), name='active-sos'),
    path('<int:pk>/', SosAlertDetailAPIView.as_view(), name='sos-detail'),
    path('<int:pk>/resolve/', ResolveSosAPIView.as_view(), name='resolve-sos'),
    path('<int:pk>/respond/', RespondSosAPIView.as_view(), name='respond-sos'),
    path('history/', SosHistoryAPIView.as_view(), name='sos-history'),
]