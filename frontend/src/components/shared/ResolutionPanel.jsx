import React, { useState } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useGetResolveStatus, useUpdateResolveStatus } from '@/lib/react-query/queriesAndMutations';
import { Button } from '@/components/ui/button';

const ResolutionPanel = ({ modelName, objectId, onResolveParent, isMainActive }) => {
  const { user } = useUserContext();
  const [review, setReview] = useState('');
  const [isResolved, setIsResolved] = useState(true);

  const { data: resolveStatus, isLoading } = useGetResolveStatus(modelName, objectId);
  const { mutateAsync: updateStatus, isPending } = useUpdateResolveStatus();

  // Determine role
  const role = user?.role || 'Survivor';
  const isSurvivor = role === 'Survivor';
  const isResponder = role === 'Lawyer' || role === 'Volunteer';

  const handleResolve = async () => {
    if (!review.trim()) return alert("Please provide a brief resolution note or review.");

    // ✅ Include the explicit submission flags in the payload
    const updateData = isSurvivor
      ? { is_resolved_user: isResolved, user_review: review, user_submitted_resolve: true }
      : { is_resolved_responder: isResolved, responder_review: review, responder_submitted_resolve: true };

    try {
      await updateStatus({ modelName, objectId, updateData });
      
      if (onResolveParent && isMainActive) {
         await onResolveParent(); 
      }
    } catch (error) {
      console.error("Failed to update resolve status", error);
    }
  };

  if (isLoading) return <div className="animate-pulse h-16 bg-dark-4 rounded-lg w-full mt-4"></div>;

  // ✅ Clean and accurate submission checks based on your new DB fields!
  const hasSurvivorSubmitted = resolveStatus?.user_submitted_resolve;
  const hasResponderSubmitted = resolveStatus?.responder_submitted_resolve;

  return (
    <div className="mt-2 flex flex-col gap-4 border-t border-dark-4 pt-4">
      <h3 className="h3-bold text-light-1">Status Report</h3>

      {isSurvivor ? (
        hasSurvivorSubmitted ? (
           <div className="p-4 bg-dark-4 border border-dark-4 rounded-lg">
             <p className="text-light-1 small-medium mb-2">Your Submitted Review:</p>
             <div className="flex items-center gap-2 mb-2">
               <span className={`px-2 py-1 text-xs rounded-md ${resolveStatus.is_resolved_user ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                 {resolveStatus.is_resolved_user ? '✅ Resolved' : '❌ Not Resolved'}
               </span>
             </div>
             <p className="text-light-2 body-medium mt-1">{resolveStatus.user_review}</p>
           </div>
        ) : (
           <div className="flex flex-col gap-4">
             <div className="flex gap-6 p-3 bg-dark-3 border border-dark-4 rounded-lg">
               <label className="flex items-center gap-2 text-light-1 cursor-pointer">
                 <input 
                   type="radio" 
                   name="survivor_status" 
                   checked={isResolved === true} 
                   onChange={() => setIsResolved(true)} 
                   className="accent-primary-500 w-4 h-4"
                 />
                 Resolved
               </label>
               <label className="flex items-center gap-2 text-light-1 cursor-pointer">
                 <input 
                   type="radio" 
                   name="survivor_status" 
                   checked={isResolved === false} 
                   onChange={() => setIsResolved(false)} 
                   className="accent-primary-500 w-4 h-4"
                 />
                 Not Resolved
               </label>
             </div>

             <textarea
               value={review}
               onChange={(e) => setReview(e.target.value)}
               placeholder="Leave your feedback..."
               className="w-full p-3 rounded-lg bg-dark-3 text-light-1 border border-dark-4 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24"
             />
             <Button onClick={handleResolve} disabled={isPending} className="shad-button_primary w-full py-6">
               {isPending ? "Submitting..." : "Give feedback to Nirbhoy"}
             </Button>
           </div>
        )
      ) : isResponder ? (
        hasResponderSubmitted ? (
           <div className="p-4 bg-dark-4 border border-dark-4 rounded-lg">
             <p className="text-light-1 small-medium mb-2">Your Submitted Report:</p>
             <div className="flex items-center gap-2 mb-2">
               <span className={`px-2 py-1 text-xs rounded-md ${resolveStatus.is_resolved_responder ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                 {resolveStatus.is_resolved_responder ? '✅ Resolved' : '❌ Not Resolved'}
               </span>
             </div>
             <p className="text-light-2 body-medium mt-1">{resolveStatus.responder_review}</p>
           </div>
        ) : (
           <div className="flex flex-col gap-4">
             <div className="flex gap-6 p-3 bg-dark-3 border border-dark-4 rounded-lg">
               <label className="flex items-center gap-2 text-light-1 cursor-pointer">
                 <input 
                   type="radio" 
                   name="responder_status" 
                   checked={isResolved === true} 
                   onChange={() => setIsResolved(true)} 
                   className="accent-red-500 w-4 h-4"
                 />
                 Resolved
               </label>
               <label className="flex items-center gap-2 text-light-1 cursor-pointer">
                 <input 
                   type="radio" 
                   name="responder_status" 
                   checked={isResolved === false} 
                   onChange={() => setIsResolved(false)} 
                   className="accent-red-500 w-4 h-4"
                 />
                 Not Resolved
               </label>
             </div>

             <textarea
               value={review}
               onChange={(e) => setReview(e.target.value)}
               placeholder="Provide details about the situation..."
               className="w-full p-3 rounded-lg bg-dark-3 text-light-1 border border-dark-4 focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
             />
             <Button onClick={handleResolve} disabled={isPending} className="bg-dark-4 border border-red-500 hover:bg-red-600 text-white w-full py-6 transition-colors">
               {isPending ? "Submitting..." : "Give feedback to Nirbhoy"}
             </Button>
           </div>
        )
      ) : null}
    </div>
  );
};

export default ResolutionPanel;