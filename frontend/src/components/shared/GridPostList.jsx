import { Link } from "react-router-dom";

import PostStats from "./PostStats";
import { useUserContext } from "@/context/AuthContext";

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}) => {
  const { user } = useUserContext();

  // Helper to check if media is a video
  const isVideo = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|mov|webm|avi)(?:\?.*)?$/i);
  };

  return (
    <ul className="grid-container">
      {posts.map((post) => {
        // ✅ 1. Determine the thumbnail media (first attachment or legacy image)
        const mediaUrl = post.attachments && post.attachments.length > 0 
          ? post.attachments[0].file 
          : post.image;
        
        const isMediaVideo = isVideo(mediaUrl);
        const hasMultipleMedia = post.attachments && post.attachments.length > 1;

        return (
          <li key={post.id} className="relative min-w-80 h-80">
            <Link to={`/posts/${post.id}`} className="grid-post_link relative block h-full w-full">
              
              {/* ✅ 2. Render Video or Image based on type */}
              {isMediaVideo ? (
                <video
                  src={mediaUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={mediaUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="post thumbnail"
                  className="h-full w-full object-cover"
                />
              )}

              {/* ✅ 3. Visual Indicators (Top Right Corner) */}
              <div className="absolute top-3 right-3 z-10 pointer-events-none drop-shadow-md">
                {isMediaVideo ? (
                  // Video Play Icon
                  <span className="text-white text-xl">▶</span>
                ) : hasMultipleMedia ? (
                  // Multiple Images Icon (Stacked Squares)
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white opacity-90">
                    <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm15.75-1.5a.75.75 0 0 0-.75.75v10.5a4.5 4.5 0 0 1-4.5 4.5H4.5a.75.75 0 0 0 0 1.5h9A6 6 0 0 0 19.5 15.75V6a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            </Link>

            <div className="grid-post_user">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={
                      post.author.profile_image || post.author.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <p className="line-clamp-1">{post.author.username}</p>
                </div>
              )}
              {showStats && <PostStats post={post} userId={user.id} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;