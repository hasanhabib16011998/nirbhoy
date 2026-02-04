from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('create/', CreatePostView.as_view(), name='create-post'),
    path('recent/', RecentPostsView.as_view(), name='recent-posts'),
]