import { useState, useEffect, useRef } from 'react';
import { getExam } from '../../api/exams';
import { getQuestionsByExam } from '../../api/questions';
import { submitResult } from '../../api/results';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Clock, AlertCircle, X, CheckCircle } from 'lucide-react';
import ResultDisplay from './ResultDisplay.jsx';

export default function ExamWindow({ examId, onClose }) {
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    loadExamData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { handleSubmit(true); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [timeLeft]);

  const loadExamData = async () => {
    try {
      const [examData, questionsData] = await Promise.all([
        getExam(examId),
        getQuestionsByExam(examId),
      ]);
      const shuffled = examData?.randomizeQuestions 
        ? [...(questionsData || [])].sort(() => Math.random() - 0.5)
        : (questionsData || []);
      setExam(examData);
      setQuestions(shuffled);
      setTimeLeft((examData?.durationMinutes || 0) * 60);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Failed to load exam');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting || submitted) return;
    if (!autoSubmit && !confirm('Are you sure you want to submit your exam?')) return;
    setSubmitting(true);
    try {
      const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const payload = {
        examId,
        answers: Object.entries(answers).map(([qId, val]) => ({ 
          qId, 
          selectedIndex: ['A','B','C','D'].indexOf(val) 
        })),
        startedAt: new Date(startTimeRef.current).toISOString(),
      };
      const data = await submitResult(payload);
      setSubmissionId(data._id);
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const getTimerColor = () => {
    const total = (exam?.durationMinutes || 0) * 60;
    const percentage = total ? (timeLeft / total) * 100 : 0;
    if (percentage <= 10) return 'text-red-400';
    if (percentage <= 25) return 'text-yellow-400';
    return 'text-gold';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mx-auto mb-4"></div>
          <p className="text-gold font-semibold">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (submitted && submissionId) return <ResultDisplay submissionId={submissionId} onClose={onClose} />;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div className="glass-card border-2 border-gold/30 animate-fade-in">
      <div className="sticky top-0 glass-card border-b-2 border-gold/30 p-6 flex justify-between items-center z-10 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold gold-gradient-text mb-2">{exam?.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${answeredCount === totalQuestions ? 'text-gold' : 'text-gray-500'}`} />
              {answeredCount} of {totalQuestions} answered
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 font-mono text-2xl font-bold ${getTimerColor()} glass-card px-4 py-2 rounded-xl`}>
            <Clock className="w-6 h-6" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={onClose} 
            className="gold-button-outline p-2"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto">
        {questions.map((question, index) => {
          const selectedAnswer = answers[question._id];
          return (
            <div 
              key={question._id} 
              className="gold-card animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <h3 className="text-xl font-bold text-gray-100 mb-6">
                Question {index + 1}: {question.text}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((option, optIdx) => {
                  const isSelected = selectedAnswer === option;
                  const optionText = question.options?.[optIdx] || '';
                  
                  return (
                    <button
                      key={option}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question._id]: option }))}
                      className={`
                        relative p-4 rounded-xl border-2 text-left transition-all duration-300
                        ${isSelected 
                          ? 'bg-gold/20 border-gold shadow-gold-glow scale-105' 
                          : 'bg-black/20 border-gold/30 hover:border-gold hover:bg-gold/10 hover:scale-105'
                        }
                      `}
                    >
                      <span className={`font-bold text-lg mr-3 ${isSelected ? 'text-gold' : 'text-gray-400'}`}>
                        {option}.
                      </span>
                      <span className={`${isSelected ? 'text-gray-100 font-semibold' : 'text-gray-300'}`}>
                        {optionText}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-black" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 glass-card border-t-2 border-gold/30 p-6 backdrop-blur-md">
        {answeredCount < totalQuestions && (
          <div className="flex items-center gap-2 text-yellow-400 mb-4 animate-pulse">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-semibold">
              You have {totalQuestions - answeredCount} unanswered question(s)
            </p>
          </div>
        )}
        <button 
          onClick={() => handleSubmit(false)} 
          disabled={submitting || answeredCount === 0} 
          className="gold-button w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </span>
          ) : (
            'Submit Exam'
          )}
        </button>
      </div>
    </div>
  );
}
