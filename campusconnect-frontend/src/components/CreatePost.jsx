import { useState, useRef } from 'react';
import { Image as ImageIcon, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePost = ({ onPostSuccess, apiEndpoint = 'http://localhost:5000/api/posts', placeholder = "What's on your mind?" }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lfStatus, setLfStatus] = useState('Lost'); // Default status for Lost & Found
  const fileInputRef = useRef(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const getCategory = (endpoint) => {
    if (endpoint.includes('internships')) return 'Internship';
    if (endpoint.includes('blogs')) return 'Blog';
    if (endpoint.includes('lost-found')) return 'Lost & Found';
    return 'Feed';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if ((!content.trim() && !image) || !currentUser.id) return;
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const category = getCategory(apiEndpoint);
      
      const postData = {
        userId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        college: currentUser.college,
        department: currentUser.department,
        content,
        imageUrl,
        category,
        likes: 0,
        comments: 0
      };

      if (category === 'Lost & Found') {
        postData.status = lfStatus;
      }

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const data = await res.json();
      
      setContent('');
      removeImage();
      if (onPostSuccess) onPostSuccess(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser.id) return null;

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 relative z-0">
      <div className="flex gap-4">
        <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-50 rounded-2xl p-4 border-none focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[100px]"
          />
          
          <AnimatePresence>
            {preview && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative rounded-xl overflow-hidden"
              >
                <img src={preview} alt="Preview" className="w-full h-auto object-cover max-h-64" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-primary hover:bg-accent p-2 rounded-full transition-colors flex items-center gap-2"
              >
                <ImageIcon size={20} /> <span className="hidden sm:inline text-sm font-medium">Photo</span>
              </button>
              
              {getCategory(apiEndpoint) === 'Lost & Found' && (
                <select 
                  value={lfStatus} 
                  onChange={(e) => setLfStatus(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none"
                >
                  <option value="Lost">Lost</option>
                  <option value="Still Missing">Still Missing</option>
                  <option value="Found">Found</option>
                </select>
              )}
            </div>

            <button 
              onClick={handlePost} 
              disabled={isSubmitting || (!content.trim() && !image)}
              className="bg-primary text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post'} <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
