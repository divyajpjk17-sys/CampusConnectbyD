import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('https://campusconnectbyd.onrender.com/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(console.error);
  }, []);

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onPostSuccess={handleNewPost} apiEndpoint="https://campusconnectbyd.onrender.com/api/posts" />
      
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={(id) => setPosts(posts.filter(p => p.id !== id))} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
