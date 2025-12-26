import React, { useState, useEffect } from 'react';
import { fetchSubTasksByTask, createSubTask, updateSubTask } from '../API/SubTaskAPI';
import { fetchTaskComments, addComment } from '../API/CommentAPI';

const TaskDetailModal = ({ task, isOpen, onClose, currentUserId }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    if (isOpen && task) { loadDetails(); }
  }, [isOpen, task]);

  const loadDetails = async () => {
    try {
      // Use Task Guid (task.id) for relationships
      const [stData, cData] = await Promise.all([
        fetchSubTasksByTask(task.id),
        fetchTaskComments(task.id)
      ]);
      setSubtasks(stData);
      setComments(cData);
    } catch (err) {
      console.error("Error loading task details", err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    await createSubTask(task.id, { title: newSubtask });
    setNewSubtask("");
    loadDetails();
  };

  const toggleSubtask = async (st) => {
    await updateSubTask(st.subTaskId, { title: st.title, isCompleted: !st.isCompleted });
    loadDetails();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment({ text: newComment, TaskId: task.id, userId: currentUserId });
    setNewComment("");
    loadDetails();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Checklist</h3>
            <div className="space-y-2">
              {subtasks.map(st => (
                <div key={st.subTaskId} className="flex items-center gap-3">
                  <input type="checkbox" checked={st.isCompleted} onChange={() => toggleSubtask(st)} className="w-4 h-4" />
                  <span className={st.isCompleted ? "line-through text-gray-400" : ""}>{st.title}</span>
                </div>
              ))}
              <form onSubmit={handleAddSubtask}>
                <input type="text" placeholder="Add a step..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
                  className="w-full border rounded p-2 mt-2 text-sm" />
              </form>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Comments</h3>
            <div className="space-y-3 mb-4">
              {comments.map(c => (
                <div key={c.commentId} className="bg-gray-50 p-3 rounded">
                   <p className="text-xs font-bold text-blue-600">{c.username}</p>
                   <p className="text-sm">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment}>
              <textarea placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)}
                className="w-full border rounded p-2 text-sm" rows="2" />
              <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm">Post</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;