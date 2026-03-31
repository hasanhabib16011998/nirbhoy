import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";

const Saved = () => {
  const { data: savedPosts, isLoading } = useGetSavedPosts();

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="save"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savedPosts?.length === 0 ? (
            <p className="text-light-4">No available posts</p>
          ) : (
            <GridPostList 
                // We map over the saved records to extract the actual 'post' object
                posts={savedPosts?.map((savePost) => ({
                    ...savePost.post,
                }))} 
                showStats={false} 
            />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;