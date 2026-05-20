import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const PostCard = ({ post }) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  
  // CAROUSEL STATE
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const MAX_CAPTION_LENGTH = 100;

  // =========================================================
  // TANSTACK QUERY LOGIC
  // =========================================================
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/posts/${post.id}/comments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: showComments, 
    staleTime: 1000 * 60 * 5, 
  });

  const { mutateAsync: postComment, isPending: isPostingComment } = useMutation({
    mutationFn: async (text) => {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`${API_BASE_URL}/posts/${post.id}/comments/`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(['comments', post.id], (oldComments) => {
        return [newComment, ...(Array.isArray(oldComments) ? oldComments : [])];
      });
      
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      setCommentInput(""); 
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    }
  });

  // =========================================================
  // HANDLERS & HELPERS
  // =========================================================

  if (!post.author) return;

  const tagsArray = typeof post.tags === 'string' 
    ? post.tags.split(',').filter(tag => tag.trim() !== '') 
    : Array.isArray(post.tags) ? post.tags : [];

  const shouldTruncate = post.caption?.length > MAX_CAPTION_LENGTH;
  const displayedCaption = isExpanded || !shouldTruncate 
    ? post.caption 
    : `${post.caption.slice(0, MAX_CAPTION_LENGTH)}...`;

  const roleColorMap = {
    admin: "text-red-500",        
    lawyer: "text-blue-500",      
    volunteer: "text-emerald-500", 
  };
  const authorRole = post.author?.role?.toLowerCase() || "";
  const isAnonymous = post.is_anonymous;
  const displayUsername = isAnonymous ? "Anonymous User" : post.author.username;
  const displayImage = isAnonymous 
    ? "/assets/icons/profile-placeholder.svg" 
    : (post.author?.profile_image || "/assets/icons/profile-placeholder.svg");

  const shouldShowBadge = roleColorMap.hasOwnProperty(authorRole);
  const displayBadge = isAnonymous ? false : shouldShowBadge;
  const iconColorClass = roleColorMap[authorRole] || "";

  const handleChatClick = (e) => {
    e.stopPropagation();
    setShowComments((prev) => !prev);
  };

  const handlePostComment = async () => {
    if (!commentInput.trim() || isPostingComment) return;
    await postComment(commentInput);
  };

  // MEDIA LOGIC
  const mediaList = post.attachments && post.attachments.length > 0 
    ? post.attachments 
    : post.image ? [{ id: 'legacy', file: post.image }] : [];

  const hasMultipleMedia = mediaList.length > 1;

  const nextMedia = (e) => {
    e.preventDefault(); 
    setCurrentMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const prevMedia = (e) => {
    e.preventDefault(); 
    setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|mov|webm|avi)(?:\?.*)?$/i);
  };

  return (
    <div className="post-card">
      {/* Header Profile Section */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          
          {/* If Anonymous, just show the image. If not, wrap it in a Link */}
          {isAnonymous ? (
            <img
              src={displayImage}
              alt="anonymous creator"
              className="w-12 lg:h-12 rounded-full object-cover"
            />
          ) : (
            <Link to={`/profile/${post.author.id}`}>
              <img
                src={displayImage}
                alt="creator"
                className="w-12 lg:h-12 rounded-full object-cover"
              />
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            <p className="base-medium lg:body-bold text-light-1">
              {displayUsername}
            </p>
            
            {displayBadge && (
              <span className={`${iconColorClass}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 lg:size-5" title={`${post.author.role} Verified`}>
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* The actual author can still see their edit button, even if they posted anonymously */}
        <Link
          to={`/update-post/${post.id}`}
          className={`${user.id !== post.author.id && "hidden"}`}>
          <img src={"/assets/icons/edit.svg"} alt="edit" width={20} height={20} />
        </Link>
      </div>

      <Link to={`/posts/${post.id}`}>
        {/* Caption */}
        <div className="small-medium lg:base-medium py-5">
          <p>
            {displayedCaption}
            {shouldTruncate && (
              <span
                onClick={(e) => {
                  e.preventDefault(); 
                  setIsExpanded(!isExpanded);
                }}
                className="text-primary-500 cursor-pointer ml-1 font-semibold text-sm hover:underline"
              >
                {isExpanded ? " Show less" : " See more"}
              </span>
            )}
          </p>
          <ul className="flex gap-1 mt-2">
            {tagsArray.map((tag, index) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag.trim()}
              </li>
            ))}
          </ul>
        </div>

        {/* CUSTOM CAROUSEL & DOTS WRAPPER */}
        {mediaList.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* CAROUSEL CONTAINER */}
            <div className="relative w-full h-64 xs:h-[400px] lg:h-[500px] overflow-hidden rounded-[24px] bg-dark-3 border border-dark-4">
              {mediaList.map((media, index) => (
                <div 
                  key={media.id || index} 
                  className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${index === currentMediaIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  {isVideo(media.file) ? (
                    <video 
                      src={media.file} 
                      className="w-full h-full object-cover" 
                      controls 
                      onClick={(e) => e.preventDefault()}
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

              {/* Left Arrow Button */}
              {hasMultipleMedia && (
                <button 
                  onClick={prevMedia}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-dark-4/70 hover:bg-dark-3 p-2 rounded-full transition-all"
                >
                  <img src="/assets/icons/back.svg" alt="prev" className="w-5 h-5 invert-white" />
                </button>
              )}

              {/* Right Arrow Button */}
              {hasMultipleMedia && (
                <button 
                  onClick={nextMedia}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-dark-4/70 hover:bg-dark-3 p-2 rounded-full transition-all rotate-180"
                >
                  <img src="/assets/icons/back.svg" alt="next" className="w-5 h-5 invert-white" />
                </button>
              )}
              
              {/* Counter Badge */}
              {hasMultipleMedia && (
                 <div className="absolute top-4 right-4 z-20 bg-dark-4/80 px-3 py-1 rounded-full text-light-1 text-xs font-semibold">
                   {currentMediaIndex + 1} / {mediaList.length}
                 </div>
              )}
            </div>

            {/* Dots / Indicators */}
            {hasMultipleMedia && (
              <div className="flex justify-center gap-1.5 w-full mt-1 mb-2">
                {mediaList.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentMediaIndex ? 'w-4 bg-primary-500' : 'w-1.5 bg-dark-4'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Post Stats */}
      <div className="mt-2">
        <PostStats post={post} userId={user.id} onChatClick={handleChatClick}/>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-5 pt-5 border-t border-dark-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4 mb-5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
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
                    className="w-8 h-8 rounded-full object-cover" 
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
  );
};

export default PostCard;