import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const LostFound = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/lost-found')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(console.error);
  }, []);

  const handleNewPost = (newPost) => {
    setItems([newPost, ...items]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">Lost & Found</h1>
      <CreatePost onPostSuccess={handleNewPost} apiEndpoint="http://localhost:5000/api/lost-found" placeholder="Report a lost or found item..." />
      
      <div className="space-y-6">
        {items.map((item) => (
          <PostCard key={item.id} post={item} onDelete={(id) => setItems(items.filter(p => p.id !== id))} />
        ))}
      </div>
    </div>
  );
};

export default LostFound;
