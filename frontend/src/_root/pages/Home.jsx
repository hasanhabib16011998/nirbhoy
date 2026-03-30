import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { useGetRecentPosts, useGetUsersByGroup } from "@/lib/react-query/queriesAndMutations";

const Home = () => {
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  // Fetch Volunteers
  const { 
    data: volunteers, 
    isLoading: isVolunteersLoading,
    isError: isErrorVoluneers,
  } = useGetUsersByGroup(5, "Volunteer");

  // Fetch Lawyers
  const { 
    data: lawyers, 
    isLoading: isLawyersLoading,
    isError: isErrorLawyers, 
  } = useGetUsersByGroup(5, "Lawyer");

  if (isErrorPosts || isErrorVoluneers || isErrorLawyers) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts?.documents.map((post) => (
                <li key={post.id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="home-creators">
        {/* VOLUNTEERS SECTION */}
        <h3 className="h3-bold text-light-1">Top Volunteers</h3>
        {isVolunteersLoading && !volunteers ? (
          <Loader />
        ) : (
          <ul className="grid gap-6 mb-10">
            {volunteers?.documents.map((user) => (
              <li key={user.id}><UserCard user={user} /></li>
            ))}
          </ul>
        )}

        {/* LAWYERS SECTION */}
        <h3 className="h3-bold text-light-1">Verified Lawyers</h3>
        {isLawyersLoading && !lawyers ? (
          <Loader />
        ) : (
          <ul className="grid gap-6">
            {lawyers?.documents.map((user) => (
              <li key={user.id}><UserCard user={user} /></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;