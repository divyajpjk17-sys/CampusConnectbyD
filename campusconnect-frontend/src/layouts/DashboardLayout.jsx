import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Briefcase, FileText, Search as SearchIcon, BookOpen, User, Bell, Settings, LogOut, MessageSquare, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      // Simulate global search across users
      fetch('http://localhost:5000/api/users')
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())));
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { name: 'Feed', icon: <Home size={20} />, path: '/feed' },
    { name: 'Internships', icon: <Briefcase size={20} />, path: '/internships' },
    { name: 'Blogs', icon: <FileText size={20} />, path: '/blogs' },
    { name: 'Lost & Found', icon: <SearchIcon size={20} />, path: '/lost-found' },
    { name: 'Stories', icon: <BookOpen size={20} />, path: '/stories' },
  ];

  const bottomNavItems = [
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
    { name: 'Activity', icon: <Activity size={20} />, path: '/activity' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6">
          <Link to="/" className="text-2xl font-poppins font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shrink-0">C</div>
            <span className="truncate">CampusConnect</span>
          </Link>
        </div>
        
        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-accent hover:text-primary rounded-xl transition-colors">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal</p>
            {bottomNavItems.map((item) => (
              <Link key={item.name} to={item.path} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-accent hover:text-primary rounded-xl transition-colors">
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Desktop Header with Search */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-20 justify-between items-center px-8">
          <div className="relative w-96">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search users, posts, categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            
            {/* Search Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Users</p>
                      {searchResults.map(result => (
                        <div 
                          key={result.id} 
                          onClick={() => navigate(`/profile/${result.id}`)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <img src={result.avatar} alt={result.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{result.name}</p>
                            <p className="text-xs text-gray-500">{result.college}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors">
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
              <span className="font-medium text-sm text-gray-700 hidden lg:block">{user?.name}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-20 flex justify-between items-center">
          <Link to="/" className="text-xl font-poppins font-bold text-primary">CampusConnect</Link>
          <div className="flex gap-4">
            <Link to="/messages"><MessageSquare size={24} className="text-gray-600" /></Link>
            <Link to="/notifications"><Bell size={24} className="text-gray-600" /></Link>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-20 pb-safe">
        {navItems.slice(0, 4).map((item) => (
           <Link key={item.name} to={item.path} className="flex flex-col items-center p-2 text-gray-500 hover:text-primary">
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
        <Link to="/profile" className="flex flex-col items-center p-2 text-gray-500 hover:text-primary">
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default DashboardLayout;
