import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, MessageSquare, Trash2, X, CheckCircle, Search, MoreHorizontal, AlertTriangle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onLike, onSave, onDelete }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(post.comments || 0);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [shareSearch, setShareSearch] = useState('');
  const [toast, setToast] = useState('');

  const [lfStatus, setLfStatus] = useState(post.status || 'Still Missing');
  
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const getResourceName = () => {
    if (post.category === 'Internship') return 'internships';
    if (post.category === 'Blog') return 'blogs';
    if (post.category === 'Lost & Found' || post.category === 'Lost') return 'lost-found';
    return 'posts';
  };
  
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial like/save status from APIs
    if (currentUser.id) {
      fetch(' https://campusconnectbyd.onrender.com/api/likes')
        .then(res => res.json())
        .then(data => setIsLiked(data.some(l => l.postId === post.id && l.userId === currentUser.id)));
      
      fetch('https://campusconnectbyd.onrender.com/api/saved')
        .then(res => res.json())
        .then(data => setIsSaved(data.some(s => s.postId === post.id && s.userId === currentUser.id)));
    }
  }, [post.id, currentUser.id]);

  const handleLike = async () => {
    if (!currentUser.id) return navigate('/login');
    try {
      const res = await fetch(' https://campusconnectbyd.onrender.com/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, userId: currentUser.id })
      });
      const data = await res.json();
      setIsLiked(data.liked);
      setLikes(data.currentLikes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!currentUser.id) return navigate('/login');
    try {
      const res = await fetch('https://campusconnectbyd.onrender.com/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, userId: currentUser.id })
      });
      const data = await res.json();
      setIsSaved(data.saved);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    try {
      const res = await fetch(`https://campusconnectbyd.onrender.com/api/comments/${post.id}`);
      const data = await res.json();
      setComments(data);
      setShowComments(true);
    } catch (e) {
      console.error(e);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || !currentUser.id) return;
    try {
      const res = await fetch('https://campusconnectbyd.onrender.com/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          content: newComment
        })
      });
      const data = await res.json();
      setComments([...comments, data]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await fetch(`https://campusconnectbyd.onrender.com/api/comments/${commentId}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const startMessage = () => {
    navigate('/messages', { state: { recipientId: post.userId } });
  };

  const openShareModal = async () => {
    setShowShareModal(true);
    try {
      const res = await fetch('https://campusconnectbyd.onrender.com/api/users');
      const data = await res.json();
      setShareUsers(data.filter(u => u.id !== currentUser.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async (recipientId) => {
    try {
      await fetch('https://campusconnectbyd.onrender.com/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId: recipientId,
          content: `Check out this post: ${post.content.substring(0, 30)}...`
        })
      });
      setToast('Shared successfully');
      setTimeout(() => setToast(''), 3000);
      setShowShareModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLfStatus = async (newStatus) => {
    try {
      await fetch(`https://campusconnectbyd.onrender.com/api/lost-found/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setLfStatus(newStatus);
      if (newStatus === 'Found') {
        setToast('This item has been recovered. Thank you everyone for helping.');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSave = async () => {
    try {
      await fetch(`https://campusconnectbyd.onrender.com/api/${getResourceName()}/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });
      post.content = editContent;
      setIsEditing(false);
      setToast('Post updated successfully');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`https://campusconnectbyd.onrender.com/api/${getResourceName()}/${post.id}`, {
        method: 'DELETE'
      });
      setIsDeleted(true);
      setShowDeleteConfirm(false);
      if (onDelete) onDelete(post.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow relative"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.userId}`)}
        >
          <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h3 className="font-bold text-gray-900 hover:text-primary transition-colors">{post.authorName}</h3>
            <p className="text-xs text-gray-500">
              {post.college} • {post.department}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
        {currentUser.id !== post.userId ? (
          <button 
            onClick={startMessage}
            className="hidden sm:flex items-center gap-2 bg-accent/50 text-primary px-3 py-1.5 rounded-full text-sm font-medium hover:bg-accent transition-colors"
          >
            <MessageSquare size={16} /> Message
          </button>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10"
                >
                  <button 
                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => { setShowDeleteConfirm(true); setShowOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {post.category && (
          <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
            post.category === 'Feed' ? 'bg-blue-100 text-blue-700' :
            post.category === 'Internship' ? 'bg-purple-100 text-purple-700' :
            post.category === 'Blog' ? 'bg-green-100 text-green-700' :
            (post.category === 'Lost & Found' || post.category === 'Lost') ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {post.category}
          </span>
        )}
        {(post.category === 'Lost & Found' || post.category === 'Lost' || post.type === 'lost') && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${lfStatus === 'Found' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700'}`}>
              {lfStatus === 'Found' ? (
                <span className="flex items-center gap-1"><CheckCircle size={12} /> Resolved</span>
              ) : lfStatus}
            </span>
            {currentUser.id === post.userId && (
              <div className="relative group">
                <button className="text-xs font-medium text-primary hover:underline px-2 py-1 bg-primary/5 rounded-md flex items-center gap-1">
                  <Edit2 size={12} /> Update Status
                </button>
                <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-10 w-32">
                  <button onClick={() => toggleLfStatus('Lost')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Lost</button>
                  <button onClick={() => toggleLfStatus('Still Missing')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Still Missing</button>
                  <button onClick={() => toggleLfStatus('Found')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-green-600 font-medium">Found</button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-opacity-90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden max-h-96">
            <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-gray-500">
        <div className="flex gap-6">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> 
            <span>{likes}</span>
          </motion.button>
          
          <button 
            onClick={fetchComments}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <MessageCircle size={20} /> 
            <span>{commentCount}</span>
          </button>
        </div>
        
        <div className="flex gap-4">
          <button onClick={openShareModal} className="hover:text-primary transition-colors">
            <Share2 size={20} />
          </button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`transition-colors ${isSaved ? 'text-primary' : 'hover:text-primary'}`}
          >
            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-gray-100 space-y-4 overflow-hidden"
          >
            {/* New Comment Input */}
            <div className="flex gap-3">
              <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full" />
              <div className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  onClick={postComment}
                  className="text-primary font-medium px-3 text-sm hover:bg-accent rounded-full transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
            
            {/* Comment List */}
            <div className="space-y-3 pl-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <img src={comment.authorAvatar} alt={comment.authorName} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-gray-900">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                  </div>
                  {currentUser.id === comment.userId && (
                    <button 
                      onClick={() => deleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 self-center transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Share Post</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={shareSearch}
                    onChange={(e) => setShareSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {shareUsers.filter(u => u.name.toLowerCase().includes(shareSearch.toLowerCase())).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => handleShare(u.id)}>
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold text-sm">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate w-40">{u.college}</p>
                        </div>
                      </div>
                      <button className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">Send</button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 flex items-center gap-2"
          >
            <CheckCircle size={16} className="text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-xl w-full max-w-sm overflow-hidden p-6 text-center"
            >
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Post</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 rounded-full font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-6 py-2 rounded-full font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
