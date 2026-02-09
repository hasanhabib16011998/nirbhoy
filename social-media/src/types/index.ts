export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role: 'Survivor' | 'Lawyer' | 'Volunteer';
  is_anonymous_user: boolean;
};

export type ISignInUser = {
  email: string;
  password: string;
};

export type IPost = {
  id: string;
  caption: string;
  image: string;
  location: string;
  tags: string;
  likes: number[];
  is_saved: boolean;
  author: IUser;
  created_at: string;
};

export type ISavedPost = {
  id: number;          // The ID of the SavedPost record itself
  user: number;        // The ID of the user who saved it
  post: IPost;         // The full nested Post object (because your serializer nests it)
  created_at: string;  // Date string
};