import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Stories = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/stories')
      .then(res => res.json())
      .then(data => setStories(data))
      .catch(console.error);
  }, []);

  const handleNewPost = (newPost) => {
    setStories([newPost, ...stories]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">Student Stories</h1>
      <CreatePost onPostSuccess={handleNewPost} apiEndpoint="http://localhost:5000/api/stories" placeholder="Share your campus story..." />
      
      <div className="space-y-6">
        {stories.map((story) => (
          <PostCard key={story.id} post={story} onDelete={(id) => setStories(stories.filter(p => p.id !== id))} />
        ))}
      </div>
    </div>
  );
};

export default Stories;
