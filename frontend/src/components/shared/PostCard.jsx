import { Link } from "react-router-dom";

// import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const PostCard = ({ post }) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const MAX_CAPTION_LENGTH = 100;

  // =========================================================
  // TANSTACK QUERY LOGIC
  // =========================================================

  // 1. Fetch Comments Query
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/posts/${post.id}/comments/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    // ✅ This is the magic part: it automatically fetches ONLY when showComments becomes true
    enabled: showComments, 
    staleTime: 1000 * 60 * 5, // Cache the comments for 5 minutes
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
  const shouldShowBadge = roleColorMap.hasOwnProperty(authorRole);
  const iconColorClass = roleColorMap[authorRole] || "";

  const handleChatClick = (e) => {
    e.stopPropagation();
    setShowComments((prev) => !prev);
  };

  const handlePostComment = async () => {
    if (!commentInput.trim() || isPostingComment) return;
    await postComment(commentInput);
  };

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author.id}`}>
            <img
              src={
                post.author?.profile_image ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full object-cover"
            />
          </Link>

          <div className="flex items-center gap-1.5">
              <p className="base-medium lg:body-bold text-light-1">
                {post.author.username}
              </p>
              
              {/* ✅ NEW: Render the colored verification checkmark conditionally */}
              {shouldShowBadge && (
                <span className={`${iconColorClass}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="size-4 lg:size-5" /* size-4 is 16px, size-5 is 20px */
                    title={`${post.author.role} Verified`}
                  >
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
        </div>

        <Link
          to={`/update-post/${post.id}`}
          className={`${user.id !== post.author.id && "hidden"}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={`/posts/${post.id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>
            {displayedCaption}
            {shouldTruncate && (
              <span
                onClick={(e) => {
                  e.preventDefault(); // Prevents the <Link> wrapper from firing!
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

        <img
          src={post.image || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
        />
      </Link>

      <PostStats post={post} userId={user.id} onChatClick={handleChatClick}/>

      {showComments && (
        <div className="mt-5 pt-5 border-t border-dark-4 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Dynamic Comments List */}
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

          {/* Comment Input */}
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