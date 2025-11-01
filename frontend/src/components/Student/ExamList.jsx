import { useState, useEffect } from 'react';
import { listExams } from '../../api/exams';
import { Clock, FileText, Play } from 'lucide-react';
import ExamWindow from './ExamWindow.jsx';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await listExams();
      setExams(data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedExam) {
    return <ExamWindow examId={selectedExam} onClose={() => { setSelectedExam(null); loadExams(); }} />;
  }

  if (loading) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mx-auto mb-4"></div>
        <p className="text-gold font-semibold">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold gold-gradient-text mb-8">Available Exams</h2>
      {exams.length === 0 ? (
        <div className="gold-card text-center py-12 animate-slide-up">
          <FileText className="w-16 h-16 text-gold/50 mx-auto mb-4" />
          <p className="text-gray-300 text-lg mb-2">No active exams available at the moment.</p>
          <p className="text-gray-400 text-sm">Check back later for new exams.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, index) => (
            <div 
              key={exam._id} 
              className="gold-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="glass-card p-3 animate-glow flex-shrink-0">
                  <FileText className="w-8 h-8 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-100 mb-2">{exam.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{exam.description || 'No description provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gold mb-6 font-semibold">
                <Clock className="w-4 h-4" />
                <span>{exam.durationMinutes} minutes</span>
              </div>
              <button 
                onClick={() => setSelectedExam(exam._id)} 
                className="gold-button w-full flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
