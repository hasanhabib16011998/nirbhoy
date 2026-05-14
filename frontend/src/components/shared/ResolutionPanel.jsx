import React, { useState } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useGetResolveStatus, useUpdateResolveStatus } from '@/lib/react-query/queriesAndMutations';
import { Button } from '@/components/ui/button';

const ResolutionPanel = ({ modelName, objectId, onResolveParent, isMainActive }) => {
  const { user } = useUserContext();
  const [review, setReview] = useState('');

  const { data: resolveStatus, isLoading } = useGetResolveStatus(modelName, objectId);
  const { mutateAsync: updateStatus, isPending } = useUpdateResolveStatus();

  // Determine role (Defaults to Survivor if no group is assigned)
  const role = user?.role || 'Survivor';
  const isSurvivor = role === 'Survivor';
  const isResponder = role === 'Lawyer' || role === 'Volunteer';

  const handleResolve = async () => {
    if (!review.trim()) return alert("Please provide a brief resolution note or review.");

    const updateData = isSurvivor
      ? { is_resolved_user: true, user_review: review }
      : { is_resolved_responder: true, responder_review: review };

    try {
      await updateStatus({ modelName, objectId, updateData });
      
      // Trigger the parent's resolve function to close the main SOS/Case ONLY if it is still active
      if (onResolveParent && isMainActive) {
         await onResolveParent(); 
      }
    } catch (error) {
      console.error("Failed to update resolve status", error);
    }
  };

  if (isLoading) return <div className="animate-pulse h-16 bg-dark-4 rounded-lg w-full mt-4"></div>;

  const hasUserResolved = resolveStatus?.is_resolved_user;
  const hasResponderResolved = resolveStatus?.is_resolved_responder;

  return (
    <div className="mt-2 flex flex-col gap-4 border-t border-dark-4 pt-4">
      <h3 className="h3-bold text-light-1">Resolution Status</h3>

      {/* Show the OTHER party's status if they have already resolved it */}
      {isSurvivor && hasResponderResolved && (
        <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
          <p className="text-green-500 body-bold">✅ Responder marked situation as safe.</p>
          <p className="text-light-2 small-medium mt-1">Responder Note: {resolveStatus.responder_review}</p>
        </div>
      )}
      {isResponder && hasUserResolved && (
        <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
          <p className="text-green-500 body-bold">✅ User marked situation as safe.</p>
          <p className="text-light-2 small-medium mt-1">User Note: {resolveStatus.user_review}</p>
        </div>
      )}

      {/* Show CURRENT party's input OR their submitted status */}
      {isSurvivor ? (
        hasUserResolved ? (
           <div className="p-4 bg-dark-4 border border-dark-4 rounded-lg">
             <p className="text-light-1 small-medium">Your Submitted Review:</p>
             <p className="text-light-2 body-medium mt-1">{resolveStatus.user_review}</p>
           </div>
        ) : (
           <div className="flex flex-col gap-3">
             <textarea
               value={review}
               onChange={(e) => setReview(e.target.value)}
               placeholder="I am safe now. The volunteer helped me with..."
               className="w-full p-3 rounded-lg bg-dark-3 text-light-1 border border-dark-4 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24"
             />
             <Button onClick={handleResolve} disabled={isPending} className="shad-button_primary w-full py-6">
               {isPending ? "Submitting..." : "Submit Review & Mark Resolved"}
             </Button>
           </div>
        )
      ) : isResponder ? (
        hasResponderResolved ? (
           <div className="p-4 bg-dark-4 border border-dark-4 rounded-lg">
             <p className="text-light-1 small-medium">Your Submitted Report:</p>
             <p className="text-light-2 body-medium mt-1">{resolveStatus.responder_review}</p>
           </div>
        ) : (
           <div className="flex flex-col gap-3">
             <textarea
               value={review}
               onChange={(e) => setReview(e.target.value)}
               placeholder="Situation secured. The user is safe..."
               className="w-full p-3 rounded-lg bg-dark-3 text-light-1 border border-dark-4 focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
             />
             <Button onClick={handleResolve} disabled={isPending} className="bg-dark-4 border border-red-500 hover:bg-red-600 text-white w-full py-6 transition-colors">
               {isPending ? "Submitting..." : "Submit Report & Mark Resolved"}
             </Button>
           </div>
        )
      ) : null}
    </div>
  );
};

export default ResolutionPanel;