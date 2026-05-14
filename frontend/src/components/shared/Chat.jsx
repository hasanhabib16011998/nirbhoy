import React, { useState, useEffect, useRef } from 'react';
import Loader from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetComments, useAddComment } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';

const Chat = ({ modelName, objectId, title = "Discussion" }) => {
  const { user } = useUserContext();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // TanStack Query Hooks (assuming you created these based on the previous steps)
  const { data: comments, isLoading } = useGetComments(modelName, objectId);
  const { mutateAsync: sendComment, isPending: isSending } = useAddComment();

  // Auto-scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendComment({ modelName, objectId, text });
      setText(""); // Clear input on success
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex flex-col bg-dark-2 border border-dark-4 rounded-[30px] overflow-hidden h-[600px] w-full">
      {/* Header */}
      <div className="p-4 border-b border-dark-4 bg-dark-3">
        <h3 className="h3-bold text-light-1">{title}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex-center w-full h-full"><Loader /></div>
        ) : comments?.length === 0 ? (
          <div className="flex-center w-full h-full text-light-3 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          comments?.map((comment) => {
            // Check against the nested user ID
            const isMe = String(comment.user?.id) === String(user?.id);

            return (
              <div key={comment.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                {!isMe && (
                  <img 
                    src={comment.user?.profile_image_url || "/assets/icons/profile-placeholder.svg"} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] min-w-0`}>
                  {!isMe && (
                    <span className="text-xs text-light-3 mb-1 ml-1">
                      {comment.user?.username}
                    </span>
                  )}
                  
                  <div className={`p-3 rounded-2xl max-w-full not-target:${
                    isMe 
                      ? 'bg-primary-500 text-white rounded-br-none' 
                      : 'bg-dark-4 text-light-1 border border-dark-4 rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>
                  </div>
                  <span className="text-[10px] text-light-3 mt-1">
                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-dark-4 bg-dark-3 flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="shad-input bg-dark-4!"
          disabled={isSending}
        />
        <Button 
          type="submit" 
          disabled={!text.trim() || isSending}
          className="shad-button_primary px-5"
        >
          {isSending ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
};

export default Chat;