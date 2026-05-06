import { toast } from "sonner"
import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Link } from "react-router-dom"; // ✅ Added Link
import { Button } from "@/components/ui/button"; // ✅ Added Button

const AllUsers = () => {

  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return;
  }

  return (
    <div className="common-container">
      <div className="user-container">
        
        {/* ✅ Updated Header: Flex container to hold Title and Button */}
        <div className="flex justify-between items-center w-full">
          <h2 className="h3-bold md:h2-bold text-left">Verified Lawyers</h2>
          <Link to="/legal-aid">
            <Button className="shad-button_primary px-6 py-6">
              Apply for Legal Aid
            </Button>
          </Link>
        </div>

        {isLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {creators?.documents.map((creator) => (
              <li key={creator?.id} className="flex-1 min-w-50 w-full  ">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;