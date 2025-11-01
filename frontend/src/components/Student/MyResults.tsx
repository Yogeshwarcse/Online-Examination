import { useState, useEffect } from 'react';
import { getMyResults } from '../../api/results';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Trophy, Calendar, Clock, Award } from 'lucide-react';

interface ResultWithExam {
  id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  submitted_at: string;
  exam: {
    title: string;
    description: string;
  };
}

export default function MyResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<ResultWithExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await getMyResults();
      console.log('Raw results data from API:', data); // Debug log
      
      const normalized: ResultWithExam[] = (data || []).map((r: any) => {
        // Handle both populated object and unpopulated ID
        let examTitle = '';
        let examDescription = '';
        
        if (r.testId) {
          if (typeof r.testId === 'object' && r.testId !== null) {
            // Populated test object
            examTitle = r.testId.title || '';
            examDescription = r.testId.description || '';
            console.log('Populated testId:', r.testId); // Debug log
          } else {
            // testId is just an ID string, not populated
            console.warn('testId not populated, got ID:', r.testId); // Debug log
            examTitle = '';
            examDescription = '';
          }
        }
        
        return {
          id: r._id,
          score: r.totalScore || 0,
          total_questions: r.maxScore || 0,
          time_taken_seconds: Math.max(0, Math.floor((new Date(r.submittedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)),
          submitted_at: r.submittedAt,
          exam: { 
            title: examTitle || 'Loading exam name...',
            description: examDescription || ''
          },
        };
      });
      
      console.log('Normalized results:', normalized); // Debug log
      setResults(normalized);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-gold';
    if (percentage >= 60) return 'text-gold-300';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mx-auto mb-4"></div>
        <p className="text-gold font-semibold">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold gold-gradient-text mb-8">My Results</h2>

      {results.length === 0 ? (
        <div className="gold-card text-center py-12 animate-slide-up">
          <Trophy className="w-16 h-16 text-gold/50 mx-auto mb-4" />
          <p className="text-gray-300 text-lg mb-2">You haven't taken any exams yet.</p>
          <p className="text-gray-400 text-sm">
            Go to "Available Exams" to start taking exams.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {results.map((result, index) => {
            const percentage = result.total_questions > 0 
              ? (result.score / result.total_questions) * 100 
              : 0;
            const grade = getGrade(percentage);
            const scoreColor = getScoreColor(percentage);

            return (
              <div 
                key={result.id} 
                className="gold-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-100 mb-3">
                      {result.exam.title || 'Exam'}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {result.exam.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gold" />
                        {formatDate(result.submitted_at)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-gold" />
                        {formatTime(result.time_taken_seconds)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-center glass-card p-4 min-w-[100px] border border-gold/30">
                      <Trophy className={`w-6 h-6 ${scoreColor} mx-auto mb-2`} />
                      <p className="text-xs text-gray-400 mb-1">Score</p>
                      <p className={`text-xl font-bold ${scoreColor}`}>
                        {result.score}/{result.total_questions}
                      </p>
                    </div>

                    <div className="text-center glass-card p-4 min-w-[100px] border border-gold/30">
                      <Award className={`w-6 h-6 ${scoreColor} mx-auto mb-2`} />
                      <p className="text-xs text-gray-400 mb-1">Grade</p>
                      <p className={`text-xl font-bold ${scoreColor}`}>{grade}</p>
                    </div>

                    <div className="text-center glass-card p-4 min-w-[100px] border border-gold/30">
                      <div className={`text-2xl font-bold ${scoreColor} mb-2`}>%</div>
                      <p className="text-xs text-gray-400 mb-1">Percentage</p>
                      <p className={`text-xl font-bold ${scoreColor}`}>
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
