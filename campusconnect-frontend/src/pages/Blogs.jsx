import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch('https://campusconnectbyd.onrender.com/api/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(console.error);
  }, []);

  const handleNewPost = (newPost) => {
    setBlogs([newPost, ...blogs]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-6">Student Blogs</h1>
      <CreatePost onPostSuccess={handleNewPost} apiEndpoint="https://campusconnectbyd.onrender.com/api/blogs" placeholder="Write a new article..." />
      
      <div className="space-y-6">
        {blogs.map((blog) => (
          <PostCard key={blog.id} post={blog} onDelete={(id) => setBlogs(blogs.filter(p => p.id !== id))} />
        ))}
      </div>
    </div>
  );
};

export default Blogs;
