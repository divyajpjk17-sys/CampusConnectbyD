import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit2, MapPin, Briefcase, GraduationCap, Link as LinkIcon, UserPlus, MessageSquare, Camera, X, Heart } from 'lucide-react';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  
  const profileId = id || currentUser.id;
  const isOwnProfile = profileId === currentUser.id;
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'none', 'pending', 'accepted'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('posts');
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const fetchData = () => {
    // Fetch user profile
    fetch(`http://localhost:5000/api/users/${profileId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) navigate('/feed');
        setProfile(data);
        setEditForm(data);
      })
      .catch(console.error);

    // Fetch posts
    fetch('http://localhost:5000/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data.filter(p => p.userId === profileId)))
      .catch(console.error);

    // Fetch saved posts
    if (isOwnProfile) {
      fetch('http://localhost:5000/api/saved')
        .then(res => res.json())
        .then(async savedData => {
            const allPosts = await fetch('http://localhost:5000/api/posts').then(r => r.json());
            const userSaved = savedData.filter(s => s.userId === currentUser.id);
            setSavedPosts(allPosts.filter(p => userSaved.some(s => s.postId === p.id)));
        });
    }

    // Fetch connections
    fetch('http://localhost:5000/api/connections')
      .then(res => res.json())
      .then(data => {
        if (!isOwnProfile && currentUser.id) {
          const conn = data.find(c => 
            c.fromUserId === currentUser.id && c.toUserId === profileId
          );
          setConnectionStatus(conn ? conn.status : 'none');
        }
        setFollowers(data.filter(c => c.toUserId === profileId && c.status === 'accepted').length);
        setFollowing(data.filter(c => c.fromUserId === profileId && c.status === 'accepted').length);
      });
  };

  useEffect(() => {
    fetchData();
  }, [profileId, currentUser.id, isOwnProfile, navigate]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setEditForm(prev => ({ ...prev, [type]: data.url }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    if (!currentUser.id) return navigate('/login');
    try {
      if (connectionStatus === 'accepted' || connectionStatus === 'pending') {
        await fetch('http://localhost:5000/api/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromUserId: currentUser.id, toUserId: profileId, action: 'decline' })
        });
        setConnectionStatus('none');
      } else {
        await fetch('http://localhost:5000/api/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromUserId: currentUser.id, toUserId: profileId, action: 'request' })
        });
        setConnectionStatus('pending');
      }
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      setProfile(data);
      localStorage.setItem('user', JSON.stringify(data));
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return <div className="text-center p-8 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cover & Profile Header */}
      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
        <div className="h-64 relative bg-gray-200">
          {(editForm.banner || profile.banner) ? (
             <img src={isEditing ? editForm.banner || profile.banner : profile.banner} alt="Banner" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40"></div>
          )}
          {isEditing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button onClick={() => bannerInputRef.current?.click()} className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all">
                <Camera size={18} /> Change Cover
              </button>
              <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'banner')} />
            </div>
          )}
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-start">
            <div className="-mt-20 relative z-10 group">
              <img src={isEditing ? editForm.avatar || profile.avatar : profile.avatar} alt={profile.name} className="w-40 h-40 rounded-full border-4 border-white bg-white object-cover shadow-md" />
              {isEditing && (
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={24} />
                </button>
              )}
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'avatar')} />
              {!isEditing && isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full hover:bg-opacity-90 shadow-lg"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            
            <div className="pt-4 flex gap-3">
              {!isOwnProfile && (
                <>
                  <button 
                    onClick={handleConnect}
                    className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-all ${
                      connectionStatus === 'accepted' ? 'bg-gray-100 text-gray-700' :
                      connectionStatus === 'pending' ? 'bg-gray-100 text-gray-700' :
                      'bg-primary text-white hover:bg-opacity-90'
                    }`}
                  >
                    {connectionStatus === 'accepted' ? 'Unfollow' : connectionStatus === 'pending' ? 'Requested' : <><UserPlus size={16} /> Follow</>}
                  </button>
                  <button 
                    onClick={() => navigate('/messages', { state: { recipientId: profile.id } })}
                    className="px-6 py-2 rounded-full font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <MessageSquare size={16} /> Message
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-6 space-y-4 max-w-lg">
              <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg" placeholder="Name" />
              <input type="text" value={editForm.college} onChange={e => setEditForm({...editForm, college: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg" placeholder="College" />
              <input type="text" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg" placeholder="Department (e.g. B.Tech CSE)" />
              <input type="text" value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg" placeholder="Year (e.g. 3rd Year)" />
              <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg h-24" placeholder="Bio"></textarea>
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} className="bg-primary text-white px-6 py-2 rounded-full font-medium">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-medium">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <h1 className="text-3xl font-poppins font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <GraduationCap size={18} /> {profile.department} • {profile.year}
                </p>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <MapPin size={16} /> {profile.college}
                </p>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 flex gap-8 border-t border-gray-100 pt-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{posts.length}</span>
              <span className="text-sm text-gray-500 font-medium">Posts</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{followers}</span>
              <span className="text-sm text-gray-500 font-medium">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{following}</span>
              <span className="text-sm text-gray-500 font-medium">Following</span>
            </div>
            {isOwnProfile && (
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">{savedPosts.length}</span>
                <span className="text-sm text-gray-500 font-medium">Saved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'posts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Activity
        </button>
        {isOwnProfile && (
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'saved' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Saved Posts
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="aspect-square bg-white cursor-pointer overflow-hidden group relative rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all"
                onClick={() => setSelectedPost(post)}
              >
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className={`w-full h-full p-4 flex flex-col ${
                    post.category === 'Feed' ? 'border-t-4 border-blue-400' :
                    post.category === 'Internship' ? 'border-t-4 border-purple-400' :
                    post.category === 'Blog' ? 'border-t-4 border-green-400' :
                    (post.category === 'Lost & Found' || post.category === 'Lost') ? 'border-t-4 border-orange-400' :
                    'border-t-4 border-gray-400'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.category === 'Feed' ? 'bg-blue-50 text-blue-600' :
                        post.category === 'Internship' ? 'bg-purple-50 text-purple-600' :
                        post.category === 'Blog' ? 'bg-green-50 text-green-600' :
                        (post.category === 'Lost & Found' || post.category === 'Lost') ? 'bg-orange-50 text-orange-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {post.category || 'Post'}
                      </span>
                      <span className="text-[10px] text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="line-clamp-4 text-xs md:text-sm text-gray-700 flex-1 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-3 text-gray-400 text-xs mt-2 border-t border-gray-50 pt-2">
                      <span className="flex items-center gap-1"><Heart size={14} /> {post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.comments || 0}</span>
                    </div>
                  </div>
                )}
                {post.imageUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold gap-4">
                    <span className="flex items-center gap-1"><Heart size={18} /> {post.likes || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={18} /> {post.comments || 0}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {savedPosts.map(post => (
              <div 
                key={post.id} 
                className="aspect-square bg-white cursor-pointer overflow-hidden group relative rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all"
                onClick={() => setSelectedPost(post)}
              >
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className={`w-full h-full p-4 flex flex-col ${
                    post.category === 'Feed' ? 'border-t-4 border-blue-400' :
                    post.category === 'Internship' ? 'border-t-4 border-purple-400' :
                    post.category === 'Blog' ? 'border-t-4 border-green-400' :
                    (post.category === 'Lost & Found' || post.category === 'Lost') ? 'border-t-4 border-orange-400' :
                    'border-t-4 border-gray-400'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.category === 'Feed' ? 'bg-blue-50 text-blue-600' :
                        post.category === 'Internship' ? 'bg-purple-50 text-purple-600' :
                        post.category === 'Blog' ? 'bg-green-50 text-green-600' :
                        (post.category === 'Lost & Found' || post.category === 'Lost') ? 'bg-orange-50 text-orange-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {post.category || 'Post'}
                      </span>
                      <span className="text-[10px] text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="line-clamp-4 text-xs md:text-sm text-gray-700 flex-1 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-3 text-gray-400 text-xs mt-2 border-t border-gray-50 pt-2">
                      <span className="flex items-center gap-1"><Heart size={14} /> {post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.comments || 0}</span>
                    </div>
                  </div>
                )}
                {post.imageUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold gap-4">
                    <span className="flex items-center gap-1"><Heart size={18} /> {post.likes || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={18} /> {post.comments || 0}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'posts' && posts.length === 0 && <p className="text-gray-500 text-center py-8">No posts yet.</p>}
        {activeTab === 'saved' && savedPosts.length === 0 && <p className="text-gray-500 text-center py-8">No saved posts.</p>}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setSelectedPost(null); fetchData(); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[24px]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-2 sticky top-0 bg-white/80 backdrop-blur z-10 border-b border-gray-100">
              <button onClick={() => { setSelectedPost(null); fetchData(); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
            </div>
            <div className="p-2 pb-6">
              <PostCard post={selectedPost} onDelete={(id) => { 
                setPosts(posts.filter(p => p.id !== id)); 
                setSavedPosts(savedPosts.filter(p => p.id !== id));
                setSelectedPost(null); 
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
