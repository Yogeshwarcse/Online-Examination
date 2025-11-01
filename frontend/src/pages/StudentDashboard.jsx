import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LogOut, BookOpen, Award } from 'lucide-react';
import ExamList from '../components/Student/ExamList.jsx';
import MyResults from '../components/Student/MyResults';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('exams');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="glass-card border-b border-gold/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4 animate-slide-up">
              <div className="glass-card p-2 animate-glow">
                <BookOpen className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gold-gradient-text">Student Portal</h1>
                <p className="text-xs text-gray-400">Online Examination System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right glass-card px-4 py-2 rounded-2xl border border-gold/20">
                <p className="text-sm font-semibold text-gold">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button 
                onClick={handleSignOut} 
                className="gold-button-outline flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'exams' 
                ? 'gold-button shadow-gold-glow' 
                : 'gold-button-outline hover:bg-gold/10'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Available Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'results' 
                ? 'gold-button shadow-gold-glow' 
                : 'gold-button-outline hover:bg-gold/10'
            }`}
          >
            <Award className="w-5 h-5" />
            My Results
          </button>
        </div>

        <div className="animate-scale-in">
          {activeTab === 'exams' && <ExamList />}
          {activeTab === 'results' && <MyResults />}
        </div>
      </div>
    </div>
  );
}


