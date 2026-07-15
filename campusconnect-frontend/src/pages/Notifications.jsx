import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, Search, Share2, Bell, Check, X } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  
  const fetchData = async () => {
    if (!currentUser.id) return;
    try {
      const [notifsRes, connRes, usersRes] = await Promise.all([
        fetch('https://campusconnectbyd.onrender.com/api/notifications'),
        fetch('https://campusconnectbyd.onrender.com/api/connections'),
        fetch('https://campusconnectbyd.onrender.com/api/users')
      ]);
      const notifs = await notifsRes.json();
      const conns = await connRes.json();
      const users = await usersRes.json();

      // Filter notifications for current user
      const userNotifs = notifs.filter(n => n.userId === currentUser.id);

      // Map pending connections to notifications
      const pendingConns = conns.filter(c => c.toUserId === currentUser.id && c.status === 'pending');
      const connNotifs = pendingConns.map(c => {
        const actor = users.find(u => u.id === c.fromUserId) || {};
        return {
          id: `conn_${c.id}`,
          originalId: c.fromUserId,
          type: 'connection_request',
          actorName: actor.name,
          actorAvatar: actor.avatar,
          message: 'requested to follow you.',
          createdAt: c.createdAt,
          isRead: false
        };
      });

      setNotifications([...userNotifs, ...connNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const markAsRead = async (id, isRead) => {
    if (isRead || id.startsWith('conn_')) return;
    try {
      await fetch(`https://campusconnectbyd.onrender.com/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectionAction = async (fromUserId, action) => {
    try {
      await fetch('https://campusconnectbyd.onrender.com/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId: currentUser.id, action })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getGroup = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return 'Earlier';
  };

  const groupedNotifs = notifications.reduce((acc, notif) => {
    const group = getGroup(notif.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={16} className="text-red-500" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500" />;
      case 'lost_found': return <Search size={16} className="text-orange-500" />;
      case 'connection_request': return <UserPlus size={16} className="text-primary" />;
      case 'connection_accepted': return <UserPlus size={16} className="text-green-500" />;
      case 'share': return <Share2 size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const NotificationCard = ({ notif }) => (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => markAsRead(notif.id, notif.read || notif.isRead)}
      className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-colors ${!(notif.read || notif.isRead) ? 'bg-primary/5' : 'cursor-default'}`}
    >
      <div className="relative">
        <img src={notif.actorAvatar || notif.avatar || `https://ui-avatars.com/api/?name=User`} alt="User" className="w-12 h-12 rounded-full object-cover" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
          {getIcon(notif.type)}
        </div>
        {!(notif.read || notif.isRead) && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>}
      </div>
      <div className="flex-1">
        <p className="text-gray-800 text-sm md:text-base">
          <span className="font-bold">{notif.actorName || 'Someone'}</span> {notif.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
        
        {notif.type === 'connection_request' && (
          <div className="flex gap-2 mt-3">
            <button 
              onClick={(e) => { e.stopPropagation(); handleConnectionAction(notif.originalId, 'accept'); }}
              className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-opacity-90"
            >
              <Check size={14} /> Accept
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleConnectionAction(notif.originalId, 'decline'); }}
              className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-gray-200"
            >
              <X size={14} /> Decline
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">Notifications</h1>
      
      {['Today', 'Yesterday', 'Earlier'].map(group => (
        groupedNotifs[group] && groupedNotifs[group].length > 0 && (
          <div key={group} className="space-y-4 mb-8">
            <h2 className="font-bold text-gray-500 uppercase text-sm tracking-wider pl-2">{group}</h2>
            <div className="space-y-2">
              {groupedNotifs[group].map(n => <NotificationCard key={n.id} notif={n} />)}
            </div>
          </div>
        )
      ))}

      {notifications.length === 0 && (
        <div className="text-center py-10 text-gray-500 bg-white rounded-[24px] border border-gray-100">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p>No notifications yet.</p>
        </div>
      )}
    </div>
  );
};
export default Notifications;
