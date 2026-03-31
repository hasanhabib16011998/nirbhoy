from django.urls import path
from .views import ReceiveSosAPIView

urlpatterns = [
    path('trigger/', ReceiveSosAPIView.as_view(), name='trigger-sos'),
]