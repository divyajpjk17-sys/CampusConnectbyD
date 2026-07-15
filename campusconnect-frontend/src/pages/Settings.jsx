import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <button 
          onClick={handleLogout}
          className="w-full mt-4 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
export default Settings;
