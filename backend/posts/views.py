
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, parsers, generics
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import *
from django.shortcuts import get_object_or_404


class CreatePostView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # 1. Save the main Post (this triggers the `create` method in the serializer)
            post = serializer.save()
            
            # 2. Extract the list of files from the request
            # Make sure your frontend uses 'attachments' as the key when appending to FormData
            files = request.FILES.getlist('attachments')
            
            # 3. Create generic attachments for this specific post
            for file in files:
                post.attachments.create(file=file)
                
            # 4. Re-serialize the post so the response includes the newly created attachments
            response_serializer = PostSerializer(post, context={'request': request})
            
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecentPostsView(generics.ListAPIView):
    # Retrieve all posts, order by created_at descending (-), and take the first 20
    queryset = Post.objects.filter(is_verified=True).order_by('-created_at')[:20]
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
    
class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    # Crucial: Pass 'request' context so the serializer can calculate 'is_saved'
    def get_serializer_context(self):
        return {'request': self.request}
    
class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 1. Get the user ID from the URL parameter (we'll name it 'uid' in urls.py)
        user_id = self.kwargs['uid']
        # 2. Filter posts by this author and order by newest first
        return Post.objects.filter(author__id=user_id).order_by('-created_at')

    def get_serializer_context(self):
        # Ensure the serializer has context to check 'is_saved' and 'likes'
        return {'request': self.request}
    
class UserSavedPostsView(generics.ListAPIView):
    serializer_class = SavedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedPost.objects.filter(user=self.request.user).order_by('-created_at')
    

class PostCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        # 1. Fetch the post, return 404 automatically if it doesn't exist
        post = get_object_or_404(Post, id=post_id)

        # 2. Use the GenericRelation to fetch all comments for this specific post
        comments = post.comments.all()
        
        # 3. Serialize and return
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id):
        # 1. Fetch the post
        post = get_object_or_404(Post, id=post_id)

        # 2. Validate the comment text
        text = request.data.get('text')
        if not text or not text.strip():
            return Response({"error": "Comment text cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Create the comment using the GenericRelation.
        # Django automatically fills in the 'content_type' and 'object_id' for you!
        comment = post.comments.create(
            user=request.user,
            text=text.strip()
        )
        
        # 4. Return the newly created comment
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class GenericCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, model_name, object_id):
        try:
            # Resolves the generic model (e.g., 'legalaidapplication')
            content_type = ContentType.objects.get(model=model_name.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Invalid model name."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch comments in chronological order
        comments = Comment.objects.filter(
            content_type=content_type, 
            object_id=object_id
        ).order_by('created_at')
        
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, model_name, object_id):
        try:
            content_type = ContentType.objects.get(model=model_name.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Invalid model name."}, status=status.HTTP_400_BAD_REQUEST)

        text = request.data.get("text")
        if not text:
            return Response({"error": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the new comment
        comment = Comment.objects.create(
            user=request.user,
            text=text,
            content_type=content_type,
            object_id=object_id
        )
        
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)