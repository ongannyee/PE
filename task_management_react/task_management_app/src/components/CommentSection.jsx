import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { fetchTaskComments, addComment, deleteComment } from '../API/CommentAPI';
import { fetchProjectMembers } from '../API/ProjectAPI';

const CommentSection = ({ taskGuid, taskName, currentUserId, projectId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Mention States
  const [users, setUsers] = useState([]); 
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    emailjs.init("eBjUNRbvoFsABoiPC"); 
  }, []);

  useEffect(() => {
    loadComments();
    if (projectId) loadMembers();
  }, [taskGuid, projectId]);

  const loadComments = async () => {
    if (!taskGuid || taskGuid === '00000000-0000-0000-0000-000000000000') return;
    try {
      const data = await fetchTaskComments(taskGuid);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error loading comments:", err); }
  };

  const loadMembers = async () => {
    try {
      const data = await fetchProjectMembers(projectId);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error loading members:", err); }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setCommentText(value);
    setCursorPos(selectionStart);

    const textBeforeCursor = value.substring(0, selectionStart);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match) {
      setMentionFilter(match[1].toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const textBeforeMention = commentText.substring(0, cursorPos).replace(/@\w*$/, '');
    const textAfterMention = commentText.substring(cursorPos);
    const newText = `${textBeforeMention}@${username} ${textAfterMention}`;
    setCommentText(newText);
    setShowMentions(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const sendEmailNotification = async (mentionedUser, authorName) => {
    const recipientEmail = mentionedUser.email || mentionedUser.Email;
    const recipientName = mentionedUser.username || mentionedUser.Username;

    if (!recipientEmail) {
      console.error("CRITICAL: Email is null for user", mentionedUser.username);
      alert(`Mentioned user ${recipientName} has no email address on file. Notification skipped.`);
      return;
    }

    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      from_name: authorName,
      task_name: taskName || "Project Task",
      message: commentText,
      task_link: window.location.href 
    };

    try {
      await emailjs.send(
        'service_vb2sbtt', 
        'template_2gacbks', 
        templateParams
      );
      console.log("Email successfully sent to:", recipientEmail);
    } catch (error) {
      console.error('EmailJS Error:', error);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await addComment({ 
        text: commentText.trim(), 
        taskId: taskGuid, 
        userId: currentUserId 
      });
      
      const authorName = res.username || res.Username || "A teammate";
      const mentions = commentText.match(/@(\w+)/g) || [];
      
      mentions.forEach(mention => {
        const usernameInComment = mention.substring(1).toLowerCase();
        const userToNotify = users.find(u => 
          (u.username || u.Username || "").toLowerCase() === usernameInComment
        );

        if (userToNotify) {
          sendEmailNotification(userToNotify, authorName);
        }
      });

      setCommentText('');
      await loadComments(); 
    } catch (err) { 
        console.error("Post Error:", err); 
    } finally { 
        setIsSending(false); 
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => (c.commentId || c.CommentId) !== commentId));
    } catch (err) { console.error(err); }
  };

  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const filteredUsers = users.filter(u => {
    const uname = u.username || u.Username || "";
    return uname.toLowerCase().includes(mentionFilter);
  });

  return (
    <div className="flex flex-col h-[600px] w-full bg-white rounded-3xl p-2 border border-slate-100 shadow-inner relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 mb-4 pr-4 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
        {comments.length > 0 ? (
          comments.map((c) => {
            const displayName = c.username || c.Username || "Unknown User";
            const isAuthor = (c.userId || c.UserId)?.toLowerCase() === currentUserId?.toLowerCase();
            const commentId = c.commentId || c.CommentId;
            return (
              <div key={commentId} className="flex gap-4 group">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-black text-blue-400 shadow-sm">
                    {getInitials(displayName)}
                  </div>
                  <div className="w-px flex-1 bg-slate-100 mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{displayName}</span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {new Date(c.createdAt || c.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isAuthor && (
                      <button onClick={() => handleDelete(commentId)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 px-2 py-1 bg-red-50 rounded-md">
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {c.text?.split(/(@\w+)/g).map((part, i) => 
                      part.startsWith('@') ? <span key={i} className="text-blue-600 font-bold">{part}</span> : part
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
            <span className="text-4xl mb-2">💬</span>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No activity yet</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSendComment} className="mt-auto relative pt-4 border-t border-slate-50">
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Project Members
            </div>
            <ul className="max-h-40 overflow-y-auto">
              {filteredUsers.map((user, idx) => {
                const uname = user.username || user.Username;
                const uid = user.userId || user.UserId || user.id || idx;
                return (
                  <li 
                    key={uid} 
                    onMouseDown={(e) => { e.preventDefault(); insertMention(uname); }}
                    className="px-4 py-3 text-sm text-slate-600 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-600">
                      {getInitials(uname)}
                    </div>
                    <span className="font-medium">{uname}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={commentText}
          onChange={handleInputChange}
          onBlur={() => setShowMentions(false)}
          placeholder="Type @ to mention someone..."
          rows="3"
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-16 text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-100 resize-none transition-all"
        />
        <button
          type="submit"
          disabled={isSending || !commentText.trim()}
          className="absolute right-3 bottom-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-100 transition-all shadow-md shadow-blue-100"
        >
          {isSending ? "..." : "Comment"}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;