import React, { useState, useEffect } from 'react';
// import { fetchComments, postComment } from '../API/CommentAPI';

const CommentSection = ({ taskGuid, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      try {
        // const data = await fetchComments(taskGuid);
        // setComments(data);
        console.log("Fetching comments for GUID:", taskGuid);
      } catch (err) {
        console.error("Error loading comments:", err);
      }
    };
    loadComments();
  }, [taskGuid]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSending(true);
    try {
      const newComment = {
        taskId: taskGuid,
        userId: currentUserId,
        content: commentText,
        createdAt: new Date().toISOString()
      };
      
      // await postComment(newComment);
      setComments([...comments, { ...newComment, id: Date.now(), userName: "You" }]);
      setCommentText('');
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[250px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 max-h-64">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className={`flex flex-col ${c.userId === currentUserId ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                c.userId === currentUserId 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="font-bold text-[10px] mb-1 opacity-70">
                  {c.userName || 'User'} • {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                {c.content}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center mt-10">No comments yet. Start a discussion!</p>
        )}
      </div>

      <form onSubmit={handleSendComment} className="mt-auto pt-4 border-t border-gray-100">
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows="2"
            className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-gray-50"
          />
          <button
            type="submit"
            disabled={isSending || !commentText.trim()}
            className="absolute right-2 bottom-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all"
          >
            {isSending ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;