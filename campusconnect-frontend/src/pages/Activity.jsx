import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser.id) {
      navigate('/login');
      return;
    }
    // Fetch all likes, comments, and posts to build an activity feed
    Promise.all([
      fetch('http://localhost:5000/api/likes').then(res => res.json()),
      fetch('http://localhost:5000/api/comments').then(res => res.json()),
      fetch('http://localhost:5000/api/posts').then(res => res.json())
    ]).then(([likes, comments, posts]) => {
      // Create a unified activity stream for current user
      const stream = [
        ...likes.filter(l => l.userId === currentUser.id).map(l => ({ ...l, action: 'like', icon: <Heart size={16} className="text-red-500" /> })),
        ...comments.filter(c => c.userId === currentUser.id).map(c => ({ ...c, action: 'comment', icon: <MessageCircle size={16} className="text-primary" /> })),
        ...posts.filter(p => p.userId === currentUser.id).map(p => ({ ...p, action: 'post', icon: <FileText size={16} className="text-blue-500" /> }))
      ];
      // Sort by date descending
      stream.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(stream);
    }).catch(console.error);
  }, [currentUser.id, navigate]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">Recent Activity</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No recent activity found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={`${item.action}-${item.id}`} 
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">
                    You 
                    {item.action === 'like' && ' liked a post.'}
                    {item.action === 'comment' && ` commented: "${item.content}"`}
                    {item.action === 'post' && ' created a new post.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
