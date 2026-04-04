from django.urls import path
from .views import *

urlpatterns = [
    path('trigger/', ReceiveSosAPIView.as_view(), name='trigger-sos'),
    path('active/', ActiveSosListView.as_view(), name='active-sos'),
    path('<int:pk>/resolve/', ResolveSosAPIView.as_view(), name='resolve-sos'),
]