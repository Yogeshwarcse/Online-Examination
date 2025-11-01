import { useState, useEffect } from 'react';
import { listExams, deleteExam, updateExam } from '../../api/exams';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import ExamForm from './ExamForm.jsx';
import QuestionManager from './QuestionManager.jsx';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [managingQuestions, setManagingQuestions] = useState(null);

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

  const handleDelete = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? All questions will be removed.')) return;
    try {
      await deleteExam(examId);
      await loadExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
    }
  };

  const handleToggleActive = async (exam) => {
    try {
      await updateExam(exam._id, { randomizeQuestions: !exam.randomizeQuestions });
      await loadExams();
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExam(null);
    loadExams();
  };

  if (managingQuestions) {
    return <QuestionManager examId={managingQuestions} onClose={() => setManagingQuestions(null)} />;
  }

  if (showForm) {
    return <ExamForm exam={editingExam} onClose={handleFormClose} />;
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gold-gradient-text">Exam Management</h2>
        <button 
          onClick={() => setShowForm(true)} 
          className="gold-button flex items-center gap-2 animate-scale-in"
        >
          <Plus className="w-5 h-5" />
          Create Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="gold-card text-center py-12 animate-slide-up">
          <p className="text-gray-300 text-lg mb-2">No exams created yet.</p>
          <p className="text-gray-400 text-sm">Click "Create Exam" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, index) => (
            <div 
              key={exam._id} 
              className="gold-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-100">{exam.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      exam.randomizeQuestions 
                        ? 'bg-gold/20 text-gold border-gold/50' 
                        : 'bg-gray-800 text-gray-300 border-gray-600'
                    }`}>
                      {exam.randomizeQuestions ? 'Randomized' : 'Fixed'}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3 line-clamp-2">{exam.description}</p>
                  <p className="text-sm text-gold font-semibold">Duration: {exam.durationMinutes} minutes</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gold/20">
                <button 
                  onClick={() => handleToggleActive(exam)} 
                  className="gold-button-outline p-2 text-sm"
                  title="Toggle Randomize"
                >
                  {exam.randomizeQuestions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setManagingQuestions(exam._id)} 
                  className="gold-button-outline px-4 py-2 text-sm flex-1"
                >
                  Manage Questions
                </button>
                <button 
                  onClick={() => { setEditingExam(exam); setShowForm(true); }} 
                  className="gold-button-outline p-2"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(exam._id)} 
                  className="gold-button-outline p-2 text-red-400 border-red-500/50 hover:bg-red-900/20 hover:border-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
