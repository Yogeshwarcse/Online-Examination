import { useState, useEffect } from 'react';
import { getResultById } from '../../api/results';
import { getQuestionsByExam } from '../../api/questions';
import { Trophy, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

export default function ResultDisplay({ submissionId, onClose }) {
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadResults(); }, [submissionId]);

  const loadResults = async () => {
    try {
      const submissionData = await getResultById(submissionId);
      const questionsData = await getQuestionsByExam(submissionData.testId);
      const questionsWithAnswers = (questionsData || []).map((q) => {
        const userAns = submissionData.answers.find((a) => String(a.qId) === String(q._id));
        const userAnswerLabel = typeof userAns?.selectedIndex === 'number' ? ['A','B','C','D'][userAns.selectedIndex] : undefined;
        const correctLabel = typeof q.correctOptionIndex === 'number' ? ['A','B','C','D'][q.correctOptionIndex] : undefined;
        return {
          ...q,
          userAnswer: userAnswerLabel,
          isCorrect: userAns ? q.correctOptionIndex === userAns.selectedIndex : false,
          correctLabel,
        };
      });
      setSubmission({
        score: submissionData.totalScore,
        total_questions: submissionData.maxScore,
        time_taken_seconds: Math.max(0, Math.floor((new Date(submissionData.submittedAt).getTime() - new Date(submissionData.startedAt).getTime()) / 1000)),
      });
      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const getScorePercentage = () => (submission ? (submission.score / submission.total_questions) * 100 : 0);
  
  const getGrade = () => {
    const p = getScorePercentage();
    if (p >= 90) return { grade: 'A+', color: 'text-gold' };
    if (p >= 80) return { grade: 'A', color: 'text-gold' };
    if (p >= 70) return { grade: 'B', color: 'text-gold-300' };
    if (p >= 60) return { grade: 'C', color: 'text-yellow-400' };
    if (p >= 50) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  if (loading) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mx-auto mb-4"></div>
        <p className="text-gold font-semibold">Loading results...</p>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <div className="text-center py-12 text-red-400">
        Failed to load results
      </div>
    );
  }

  const { grade, color } = getGrade();
  const percentage = getScorePercentage();

  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="glass-card p-6 animate-glow">
            <Award className={`w-24 h-24 ${color}`} />
          </div>
        </div>
        <h2 className="text-4xl font-bold gold-gradient-text mb-3">Exam Completed!</h2>
        <p className="text-gray-300 text-lg">Here are your results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="gold-card text-center">
          <Trophy className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Score</p>
          <p className="text-3xl font-bold text-gold">{submission.score} / {submission.total_questions}</p>
        </div>
        <div className="gold-card text-center">
          <Award className={`w-10 h-10 ${color} mx-auto mb-3`} />
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Grade</p>
          <p className={`text-3xl font-bold ${color}`}>{grade}</p>
        </div>
        <div className="gold-card text-center">
          <div className="text-gold mx-auto mb-3 text-3xl font-bold">%</div>
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Percentage</p>
          <p className="text-3xl font-bold text-gold">{percentage.toFixed(1)}%</p>
        </div>
        <div className="gold-card text-center">
          <Clock className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Time Taken</p>
          <p className="text-3xl font-bold text-gold">{formatTime(submission.time_taken_seconds || 0)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold gold-gradient-text mb-6">Answer Review</h3>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div 
              key={question._id} 
              className={`gold-card border-2 ${
                question.isCorrect 
                  ? 'border-gold bg-gold/10' 
                  : 'border-red-500/50 bg-red-900/20'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                {question.isCorrect ? (
                  <CheckCircle className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-100 text-lg mb-4">
                    {index + 1}. {question.text}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((option, idx) => {
                      const isUserAnswer = question.userAnswer === option;
                      const isCorrectAnswer = question.correctLabel === option;
                      let className = 'p-3 rounded-xl border-2 ';
                      
                      if (isCorrectAnswer) {
                        className += 'bg-gold/20 border-gold text-gold font-semibold';
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        className += 'bg-red-900/30 border-red-500 text-red-300';
                      } else {
                        className += 'bg-black/20 border-gold/20 text-gray-300';
                      }
                      
                      return (
                        <div key={option} className={className}>
                          <strong className="mr-2">{option}.</strong>
                          {question.options?.[idx]}
                          {isCorrectAnswer && <span className="ml-2 text-xs text-gold">✓ Correct</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-xs text-red-400">Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onClose} 
        className="gold-button w-full"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
