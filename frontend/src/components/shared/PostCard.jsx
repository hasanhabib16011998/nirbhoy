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

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author.id}`}>
            <img
              src={
                post.author?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.author.username}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.created_at)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
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