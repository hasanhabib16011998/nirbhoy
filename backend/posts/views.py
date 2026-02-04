
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, parsers, generics
from rest_framework.permissions import IsAuthenticated
from .serializers import PostSerializer
from .models import *

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