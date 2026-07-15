import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, User, Star, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary rounded-full filter blur-3xl opacity-70 translate-y-1/3 -translate-x-1/4"></div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">C</div>
            <span className="text-xl font-poppins font-bold text-primary">CampusConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block font-medium text-gray-700 hover:text-primary">Login</Link>
            <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-opacity-90 transition-all shadow-md">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center min-h-screen">
        <div className="md:w-1/2 z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white/50 text-sm font-medium text-gray-600"
          >
            <Star size={16} className="text-primary" />
            The new standard for student life
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-poppins font-bold text-primary leading-[1.1]"
          >
            One Campus.<br />One<br />Community.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-lg font-inter leading-relaxed"
          >
            A social platform blending the professional depth of LinkedIn, the casual energy of Threads, and the community warmth of Discord. Built by students, for students.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link to="/register" className="bg-primary text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all text-lg">
              Join the Community <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="bg-white text-gray-800 px-8 py-4 rounded-full font-semibold flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all text-lg">
              Login to Account
            </Link>
          </motion.div>
        </div>

        {/* Hero Visuals */}
        <div className="md:w-1/2 mt-16 md:mt-0 relative h-[600px] w-full z-10 flex items-center justify-center">
          {/* Main Image container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-lg aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl"
          >
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000" alt="Students studying" className="object-cover w-full h-full" />

            {/* Floating Card 1 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-1/4 -left-12 glass p-4 rounded-2xl shadow-xl flex items-center gap-4 bg-white/90 backdrop-blur-md hidden md:flex"
            >
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Briefcase className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Google Internship</p>
                <p className="text-sm text-gray-500">32 new comments</p>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 -right-8 glass p-4 rounded-2xl shadow-xl flex items-center gap-4 bg-white/90 backdrop-blur-md hidden md:flex"
            >
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <BookOpen className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Study Notes</p>
                <p className="text-sm text-gray-500">Computer Science 101</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
