import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Internships = () => {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    fetch('https://campusconnectbyd.onrender.com/api/internships')
      .then(res => res.json())
      .then(data => setInternships(data))
      .catch(console.error);
  }, []);

  const handleNewPost = (newPost) => {
    setInternships([newPost, ...internships]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">Opportunities</h1>
      <CreatePost onPostSuccess={handleNewPost} apiEndpoint="https://campusconnectbyd.onrender.com/api/internships" placeholder="Post a new internship opportunity..." />
      
      <div className="space-y-6">
        {internships.map((job) => (
          <PostCard key={job.id} post={job} onDelete={(id) => setInternships(internships.filter(p => p.id !== id))} />
        ))}
      </div>
    </div>
  );
};

export default Internships;
