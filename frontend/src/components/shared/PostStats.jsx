import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations";


const PostStats = ({ post, userId }) => {
  const location = useLocation();
  
  const likesList = post.likes.map((id) => String(id));
  const currentUserId = String(userId);

  const [likes, setLikes] = useState(likesList);

  const [isSaved, setIsSaved] = useState(post.is_saved);
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();

  const checkIsLiked = (likeList, id) => {
    return likeList.includes(id);
  };

  const handleLikePost = (e) => {
    e.stopPropagation();

    let newLikes = [...likes];
    const hasLiked = newLikes.includes(currentUserId);

    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== currentUserId);
    } else {
      newLikes.push(currentUserId);
    }

    setLikes(newLikes); 
    
    likePost({ postId: post.id, likesArray: newLikes });
  };



  const handleSavePost = (e) => {
    e.stopPropagation();
    
    // Optimistic UI Update
    setIsSaved((prev) => !prev);
    
    // ✅ FIX: Just pass the ID. Backend toggles based on Token + ID.
    savePost(post.id); 
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={checkIsLiked(likes, currentUserId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        {isSaving ? (
             // Simple loader while communicating with backend
             <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        ) : (
            <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={handleSavePost}
            />
        )}
      </div>
    </div>
  );
};

export default PostStats;