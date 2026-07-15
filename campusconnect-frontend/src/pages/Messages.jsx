import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, User as UserIcon, Image as ImageIcon, Check, CheckCheck, MessageCircle } from 'lucide-react';

const Messages = () => {
  const { state } = useLocation();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUserId, setActiveUserId] = useState(state?.recipientId || null);
  const [newMessage, setNewMessage] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    // Fetch all users to show in sidebar
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => u.id !== currentUser.id)))
      .catch(console.error);

    // Fetch messages
    fetch('http://localhost:5000/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);
  }, [currentUser.id]);

  const activeUser = users.find(u => u.id === activeUserId);
  
  const currentMessages = messages.filter(m => 
    (m.fromUserId === currentUser.id && m.toUserId === activeUserId) ||
    (m.fromUserId === activeUserId && m.toUserId === currentUser.id)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !image) || !activeUserId) return;
    
    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      try {
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      } catch (err) {
        console.error(err);
      }
    }

    const msgData = {
      fromUserId: currentUser.id,
      toUserId: activeUserId,
      content: newMessage,
      imageUrl
    };

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      const savedMsg = await res.json();
      setMessages([...messages, savedMsg]);
      setNewMessage('');
      setImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const sortedUsers = [...users].filter(u => {
    if (u.id === activeUserId) return true;
    return messages.some(m => 
      (m.fromUserId === currentUser.id && m.toUserId === u.id) || 
      (m.fromUserId === u.id && m.toUserId === currentUser.id)
    );
  }).sort((a, b) => {
    const lastMsgA = messages
      .filter(m => (m.fromUserId === currentUser.id && m.toUserId === a.id) || (m.fromUserId === a.id && m.toUserId === currentUser.id))
      .sort((m1, m2) => new Date(m2.createdAt) - new Date(m1.createdAt))[0];
    const lastMsgB = messages
      .filter(m => (m.fromUserId === currentUser.id && m.toUserId === b.id) || (m.fromUserId === b.id && m.toUserId === currentUser.id))
      .sort((m1, m2) => new Date(m2.createdAt) - new Date(m1.createdAt))[0];
      
    const timeA = lastMsgA ? new Date(lastMsgA.createdAt).getTime() : 0;
    const timeB = lastMsgB ? new Date(lastMsgB.createdAt).getTime() : 0;
    
    return timeB - timeA;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex h-[80vh] overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold font-poppins">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <MessageCircle size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No conversations yet. Connect with others to start your conversation now!</p>
            </div>
          ) : (
            sortedUsers.map(user => {
            const lastMsg = messages
              .filter(m => (m.fromUserId === currentUser.id && m.toUserId === user.id) || (m.fromUserId === user.id && m.toUserId === currentUser.id))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
              
            return (
              <div 
                key={user.id} 
                onClick={() => setActiveUserId(user.id)}
                className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 ${activeUserId === user.id ? 'bg-accent/30' : 'hover:bg-gray-100'}`}
              >
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover bg-white" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{user.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{lastMsg ? lastMsg.content : 'Start a conversation'}</p>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <img src={activeUser?.avatar} alt={activeUser?.name} className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-bold text-gray-900">{activeUser?.name}</h3>
                <p className="text-xs text-gray-500">{activeUser?.college}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <UserIcon size={48} className="opacity-50" />
                  <p>Say hi to {activeUser?.name}!</p>
                </div>
              ) : (
                currentMessages.map(msg => {
                  const isMine = msg.fromUserId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="Attachment" className="w-full h-auto rounded-lg mb-2" />
                        )}
                        {msg.content && <p>{msg.content}</p>}
                        <div className={`flex items-center gap-1 text-[10px] mt-1 ${isMine ? 'text-primary-100 justify-end' : 'text-gray-400 justify-start'}`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && (
                            msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              {image && (
                <div className="mb-2 relative inline-block">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="h-16 rounded-lg" />
                  <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">x</button>
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files[0]) setImage(e.target.files[0]);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-primary p-2 transition-colors"
                >
                  <ImageIcon size={20} />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message (emoji supported 😎)..."
                  className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() && !image}
                  className="bg-primary text-white p-2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-opacity-90 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
            <MessageCircle size={64} className="opacity-20 mb-4" />
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
