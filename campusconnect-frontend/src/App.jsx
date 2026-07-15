import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Feed from './pages/Feed';
import Internships from './pages/Internships';
import Blogs from './pages/Blogs';
import LostFound from './pages/LostFound';
import Stories from './pages/Stories';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Activity from './pages/Activity';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
