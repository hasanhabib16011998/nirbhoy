
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, parsers, generics
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import *
from django.shortcuts import get_object_or_404

class CreatePostView(APIView):
    permission_classes = [IsAuthenticated]
    # These parsers allow Django to read image files and form data
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RecentPostsView(generics.ListAPIView):
    # Retrieve all posts, order by created_at descending (-), and take the first 20
    queryset = Post.objects.all().order_by('-created_at')[:20]
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}
    

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        
        # Get the list of IDs from the request: { "likes": ["1", "2"] }
        likes_ids = request.data.get('likes', [])

        # Filter out invalid values and ensure they are integers
        valid_ids = []
        for user_id in likes_ids:
            try:
                valid_ids.append(int(user_id))
            except (ValueError, TypeError):
                continue

        # Update the ManyToMany field directly
        post.likes.set(valid_ids)
        
        return Response({'status': 'success', 'likes_count': post.likes.count()})

class SavePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        user = request.user

        saved_post = SavedPost.objects.filter(user=user, post=post).first()

        if saved_post:
            # If it exists, DELETE it (Unsave)
            saved_post.delete()
            return Response({'status': 'unsaved', 'is_saved': False})
        else:
            # If it doesn't exist, CREATE it (Save)
            SavedPost.objects.create(user=user, post=post)
            return Response({'status': 'saved', 'is_saved': True})

class UserSavedPostsView(generics.ListAPIView):
    serializer_class = SavedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedPost.objects.filter(user=self.request.user).order_by('-created_at')