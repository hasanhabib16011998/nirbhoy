import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  createUserAccount,
  signInAccount,
  signOutAccount,
  createPost,
  getRecentPosts,
  getPostById,
  getUsers,
  likePost,
  savePost,
  getCurrentUser,
  getUserPosts,
  getUserById,
  getSavedPosts,
  getUsersByGroup,
  updateUser,
  getSosData,
  fetchLegalAidDashboard,
  fetchLegalAidById,
  fetchComments,
  addComment,
  fetchResolveStatus,
  updateResolveStatus
} from "../api/index";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user) => signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRecentPosts"],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: ["getRecentPosts"],
    queryFn: getRecentPosts,
  });
};

export const useGetUsers = (limit) => {
  return useQuery({
    queryKey: ["getUsers"],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUsersByGroup = (limit, group) => {
  return useQuery({
    queryKey: ["getUsersByGroup", group, limit],
    queryFn: () => getUsersByGroup(limit, group),
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["getCurrentUser"],
    queryFn: getCurrentUser,
  });
};

export const useGetPostById = (postId) => {
  return useQuery({
    queryKey: ["getPostById", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Expects an object with postId and the new array
    mutationFn: ({ postId, likesArray }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getRecentPosts"] });
      queryClient.invalidateQueries({ queryKey: ["getPostById", data?.id] });
      queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => savePost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["getPostById", data?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["getRecentPosts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getCurrentUser"],
      });
    },
  });
};

export const useGetUserPosts = (userId) => {
  return useQuery({
    queryKey: ["getUserPosts", userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useGetSavedPosts = () => {
  return useQuery({
    queryKey: ["getSavedPosts"],
    queryFn: () => getSavedPosts(),
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId) => deleteSavedPost(savedRecordId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["getPostById", data?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["getRecentPosts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getCurrentUser"],
      });
    },
  });
};

export const useGetUserById = (userId) => {
  return useQuery({
    queryKey: ["getUserById", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateUser(data),
    onSuccess: (data) => {
      // This tells React Query to immediately refresh the profile page with new data
      queryClient.invalidateQueries({
        queryKey: ["getUserById", String(data.id)],
      });
    },
  });
};

export const useGetSosData = () => {
  return useQuery({
    queryKey: ['sosDashboardData'],
    queryFn: getSosData,
    refetchInterval: 10000, // ✅ Automatically polls the backend every 10 seconds!
  });
};

export const useGetLegalAidData = () => {
  return useQuery({
    queryKey: ['legalAidDashboard'],
    queryFn: fetchLegalAidDashboard,
  });
};

export const useGetLegalAidById = (id) => {
  return useQuery({
    queryKey: ['legalAidDetails', id],
    queryFn: () => fetchLegalAidById(id),
    enabled: !!id, // Only run the query if an ID actually exists
  });
};

export const useGetComments = (modelName, objectId) => {
  return useQuery({
    queryKey: ['comments', modelName, objectId],
    queryFn: () => fetchComments(modelName, objectId),
    enabled: !!modelName && !!objectId,
    refetchInterval: 5000, // Optional: Poll every 5 seconds for new messages
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addComment,
    onSuccess: (data, variables) => {
      // Instantly refresh the chat when a message is sent
      queryClient.invalidateQueries(['comments', variables.modelName, variables.objectId]);
    },
  });
};

export const useGetResolveStatus = (modelName, objectId) => {
  return useQuery({
    queryKey: ['resolveStatus', modelName, objectId],
    queryFn: () => fetchResolveStatus(modelName, objectId),
    enabled: !!modelName && !!objectId,
  });
};

export const useUpdateResolveStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateResolveStatus,
    onSuccess: (data, variables) => {
      // Invalidate the query so the UI instantly reflects the new status
      queryClient.invalidateQueries({
        queryKey: ['resolveStatus', variables.modelName, variables.objectId]
      });
    },
  });
};