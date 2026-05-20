import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import GridPostList from "@/components/shared/GridPostList";

import {
  useGetPostById,
  useGetUserPosts,
} from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  // =========================================================
  // LOCAL STATE
  // =========================================================
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  // Default to true on the details page so comments are visible right away!
  const [showComments, setShowComments] = useState(true); 
  const [commentInput, setCommentInput] = useState("");

  // =========================================================
  // QUERIES
  // =========================================================
  const { data: post, isLoading } = useGetPostById(id || "");
  
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.author?.id 
  );

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', id], // Use URL id safely
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/posts/${id}/comments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!id && showComments, 
    staleTime: 1000 * 60 * 5, 
  });

  const { mutateAsync: postComment, isPending: isPostingComment } = useMutation({
    mutationFn: async (text) => {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`${API_BASE_URL}/posts/${id}/comments/`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(['comments', id], (oldComments) => {
        return [newComment, ...(Array.isArray(oldComments) ? oldComments : [])];
      });
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentInput(""); 
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    }
  });

  // =========================================================
  // DATA PARSING & HELPERS
  // =========================================================
  const tagsArray = post?.tags 
    ? (typeof post.tags === 'string' 
        ? post.tags.split(',').filter(tag => tag.trim() !== '') 
        : post.tags) 
    : [];

  const relatedPosts = userPosts?.documents?.filter(
    (userPost) => String(userPost.id) !== id
  );

  // MEDIA CAROUSEL LOGIC
  const mediaList = post?.attachments && post.attachments.length > 0 
    ? post.attachments 
    : post?.image ? [{ id: 'legacy', file: post.image }] : [];

  const hasMultipleMedia = mediaList.length > 1;

  const nextMedia = (e) => {
    if (e) e.preventDefault(); 
    setCurrentMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const prevMedia = (e) => {
    if (e) e.preventDefault(); 
    setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|mov|webm|avi)(?:\?.*)?$/i);
  };

  const handlePostComment = async () => {
    if (!commentInput.trim() || isPostingComment) return;
    await postComment(commentInput);
  };

  //Check if the post is anonymous
  const isAnonymous = post?.is_anonymous;

  //Set display values based on anonymity
  const displayUsername = isAnonymous ? "Anonymous User" : post?.author?.username;
  const displayImage = isAnonymous 
    ? "/assets/icons/profile-placeholder.svg" 
    : (post?.author?.profile_image || "/assets/icons/profile-placeholder.svg");

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          
          {/* ✅ CAROUSEL CONTAINER (Replacing the single image) */}
          <div className="post_details-img relative overflow-hidden bg-dark-3 flex flex-col">
            {mediaList.length > 0 ? (
              <div className="relative w-full h-full flex-1">
                {mediaList.map((media, index) => (
                  <div 
                    key={media.id || index} 
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out flex items-center justify-center ${index === currentMediaIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    {isVideo(media.file) ? (
                      <video 
                        src={media.file} 
                        className="w-full h-full object-contain bg-black" 
                        controls 
                      />
                    ) : (
                      <img
                        src={media.file}
                        alt={`post media ${index + 1}`}
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                ))}

                {/* Navigation Arrows */}
                {hasMultipleMedia && (
                  <>
                    <button 
                      onClick={prevMedia}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-dark-4/70 hover:bg-dark-3 p-2 rounded-full transition-all"
                    >
                      <img src="/assets/icons/back.svg" alt="prev" className="w-5 h-5 invert-white" />
                    </button>
                    <button 
                      onClick={nextMedia}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-dark-4/70 hover:bg-dark-3 p-2 rounded-full transition-all rotate-180"
                    >
                      <img src="/assets/icons/back.svg" alt="next" className="w-5 h-5 invert-white" />
                    </button>
                    
                    {/* Counter */}
                    <div className="absolute top-4 right-4 z-20 bg-dark-4/80 px-3 py-1 rounded-full text-light-1 text-xs font-semibold">
                      {currentMediaIndex + 1} / {mediaList.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
               <div className="flex items-center justify-center w-full h-full text-light-3">
                 No media available
               </div>
            )}

            {/* Dots under the image but inside the container */}
            {hasMultipleMedia && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 z-20">
                {mediaList.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentMediaIndex ? 'w-4 bg-primary-500 shadow-sm' : 'w-1.5 bg-light-3/80 shadow-sm'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="post_details-info flex flex-col justify-between">
            <div>
              <div className="flex-between w-full">
                {/*If Anonymous, use a standard div. Otherwise, use a Link */}
                {isAnonymous ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={displayImage}
                      alt="anonymous creator"
                      className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover"
                    />
                    <div className="flex gap-1 flex-col">
                      <p className="base-medium lg:body-bold text-light-1">
                        {displayUsername}
                      </p>
                      <div className="flex-center gap-2 text-light-3">
                        <p className="subtle-semibold lg:small-regular ">
                          {multiFormatDateString(post?.created_at)}
                        </p>
                        •
                        <p className="subtle-semibold lg:small-regular">
                          {post?.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/profile/${post?.author.id}`}
                    className="flex items-center gap-3">
                    <img
                      src={displayImage}
                      alt="creator"
                      className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover"
                    />
                    <div className="flex gap-1 flex-col">
                      <p className="base-medium lg:body-bold text-light-1">
                        {displayUsername}
                      </p>
                      <div className="flex-center gap-2 text-light-3">
                        <p className="subtle-semibold lg:small-regular ">
                          {multiFormatDateString(post?.created_at)}
                        </p>
                        •
                        <p className="subtle-semibold lg:small-regular">
                          {post?.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="flex-center gap-4">
                  {/* The actual author can still see the edit button */}
                  <Link
                    to={`/update-post/${post?.id}`}
                    className={`${String(user.id) !== String(post?.author.id) && "hidden"}`}>
                    <img
                      src={"/assets/icons/edit.svg"}
                      alt="edit"
                      width={24}
                      height={24}
                    />
                  </Link>
                </div>
              </div>

              <hr className="border w-full border-dark-4/80 my-5" />

              {/* Caption & Tags */}
              <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                <p>{post?.caption}</p>
                <ul className="flex gap-1 mt-2">
                  {tagsArray.map((tag, index) => (
                    <li
                      key={`${tag}${index}`}
                      className="text-light-3 small-regular">
                      #{tag.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="w-full mt-6">
              <PostStats post={post} userId={user.id} onChatClick={() => setShowComments(!showComments)} />
              
              {/* ✅ COMMENTS SECTION */}
              {showComments && (
                <div className="mt-5 pt-5 border-t border-dark-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col gap-4 mb-5 h-48 overflow-y-auto custom-scrollbar pr-2">
                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-light-4 small-regular text-center py-2">No comments yet. Be the first to reply!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <img 
                            src={comment.user.profile_image_url || "/assets/icons/profile-placeholder.svg"} 
                            alt="user" 
                            className="w-8 h-8 min-w-8 rounded-full object-cover" 
                          />
                          <div className="flex flex-col bg-dark-4 px-4 py-2.5 rounded-2xl rounded-tl-none w-full">
                            <div className="flex justify-between items-center">
                              <p className="small-semibold text-light-1">{comment.user.username}</p>
                              <p className="text-[10px] text-light-3">{multiFormatDateString(comment.created_at)}</p>
                            </div>
                            <p className="small-regular text-light-2 mt-0.5 break-words">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <img 
                      src={user.profile_image || "/assets/icons/profile-placeholder.svg"} 
                      alt="current user" 
                      className="w-9 h-9 min-w-9 rounded-full object-cover" 
                    />
                    <div className="flex items-center w-full bg-dark-4 rounded-full px-4 py-1.5">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                        className="flex-1 bg-transparent border-none outline-none text-light-1 small-regular placeholder:text-light-4"
                        disabled={isPostingComment}
                      />
                      <button 
                        onClick={handlePostComment}
                        disabled={isPostingComment || !commentInput.trim()}
                        className={`small-semibold ml-2 transition-colors ${
                          commentInput.trim() ? "text-primary-500 hover:text-primary-600 cursor-pointer" : "text-light-4 cursor-not-allowed"
                        }`}
                      >
                        {isPostingComment ? "..." : "Post"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;