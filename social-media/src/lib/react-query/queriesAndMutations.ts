import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { createUserAccount, signInAccount, signOutAccount, createPost, getRecentPosts, getUsers } from '../appwrite/api';
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