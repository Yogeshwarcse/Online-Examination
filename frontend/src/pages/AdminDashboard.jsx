import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LogOut, FileText, Users, BarChart } from 'lucide-react';
import ExamManagement from '../components/Admin/ExamManagement.jsx';
import ResultsView from '../components/Admin/ResultsView.jsx';

export default function AdminDashboard() {
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
                <FileText className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gold-gradient-text">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">Examination Management System</p>
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
            <Users className="w-5 h-5" />
            Manage Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'results' 
                ? 'gold-button shadow-gold-glow' 
                : 'gold-button-outline hover:bg-gold/10'
            }`}
          >
            <BarChart className="w-5 h-5" />
            View Results
          </button>
        </div>

        <div className="animate-scale-in">
          {activeTab === 'exams' && <ExamManagement />}
          {activeTab === 'results' && <ResultsView />}
        </div>
      </div>
    </div>
  );
}


