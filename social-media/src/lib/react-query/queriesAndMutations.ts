import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { createUserAccount, signInAccount, signOutAccount, createPost, getRecentPosts,getPostById, getUsers, likePost, savePost, getCurrentUser, getUserPosts } from '../appwrite/api';
import { type INewUser } from '@/types';
import { type INewPost } from '@/types';

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user)
  })
}

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string, password: string }) => signInAccount(user)
  })
}

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getRecentPosts'],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: ['getRecentPosts'],
    queryFn: getRecentPosts,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: ['getUsers'],
    queryFn: () => getUsers(limit),
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ['getCurrentUser'],
    queryFn: getCurrentUser,
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: ['getPostById', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Expects an object with postId and the new array
    mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) =>
      likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['getRecentPosts'] });
      queryClient.invalidateQueries({ queryKey: ['getPostById', data?.id] });
      queryClient.invalidateQueries({ queryKey: ['getCurrentUser'] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => savePost(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['getPostById', data?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['getRecentPosts'],
      })
      queryClient.invalidateQueries({
        queryKey: ['getCurrentUser'],
      })
    },
  });
};

export const useGetUserPosts = (userId?: number) => {
  return useQuery({
    queryKey: ['getUserPosts', userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId) => deleteSavedPost(savedRecordId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['getPostById', data?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['getRecentPosts'],
      })
      queryClient.invalidateQueries({
        queryKey: ['getCurrentUser'],
      })
    },
  });
};