from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('create/', CreatePostView.as_view(), name='create-post'),
    path('recent/', RecentPostsView.as_view(), name='recent-posts'),
    path('<int:pk>/like/', LikePostView.as_view(), name='like-post'),
    path('<int:pk>/save/', SavePostView.as_view(), name='save-post'),
    path('saved/', UserSavedPostsView.as_view(), name='user-saved-posts'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('user/<int:uid>/', UserPostsView.as_view(), name='user-posts'),
]