import { Link } from "react-router-dom";

// import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import { useState } from "react";


const PostCard = ({ post }) => {
  const { user } = useUserContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_CAPTION_LENGTH = 100;

  if (!post.author) return;

  const tagsArray = typeof post.tags === 'string' 
    ? post.tags.split(',').filter(tag => tag.trim() !== '') // Split and remove empty strings
    : Array.isArray(post.tags) ? post.tags : [];

  const shouldTruncate = post.caption?.length > MAX_CAPTION_LENGTH;

  //Determine what text to display based on state
  const displayedCaption = isExpanded || !shouldTruncate 
    ? post.caption 
    : `${post.caption.slice(0, MAX_CAPTION_LENGTH)}...`;

  //showing badge
  const roleColorMap = {
    admin: "text-red-500",        // Red check for admin
    lawyer: "text-blue-500",      // Blue check for lawyer
    volunteer: "text-emerald-500", // Green/Emerald for volunteer
  };
  const authorRole = post.author?.role?.toLowerCase() || "";
  const shouldShowBadge = roleColorMap.hasOwnProperty(authorRole);

  // ✅ Get the specific color class for this author's role
  const iconColorClass = roleColorMap[authorRole] || "";

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

      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;