import { useState, useEffect } from 'react';
import { getAllResults } from '../../api/results';
import { Trophy, Calendar, Clock } from 'lucide-react';

export default function ResultsView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await getAllResults();
      console.log('Raw results data:', data); // Debug log
      
      const normalized = (data || []).map((r) => {
        // Handle both populated and unpopulated data
        let userId, userName, userEmail, testId, examTitle, examDescription;
        
        if (typeof r.userId === 'object' && r.userId !== null) {
          // Populated user object
          userId = r.userId._id || r.userId;
          userName = r.userId.name || '';
          userEmail = r.userId.email || '';
        } else {
          // User ID string
          userId = r.userId;
          userName = '';
          userEmail = '';
        }
        
        if (typeof r.testId === 'object' && r.testId !== null) {
          // Populated test object
          testId = r.testId._id || r.testId;
          examTitle = r.testId.title || '';
          examDescription = r.testId.description || '';
        } else {
          // Test ID string
          testId = r.testId;
          examTitle = '';
          examDescription = '';
        }
        
        return {
          id: r._id,
          userId: userId,
          score: r.totalScore || 0,
          total_questions: r.maxScore || 0,
          time_taken_seconds: Math.max(0, Math.floor((new Date(r.submittedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)),
          submitted_at: r.submittedAt,
          exam: { 
            id: testId,
            title: examTitle || `Exam ${String(testId || '').substring(0, 8)}`,
            description: examDescription || ''
          },
          student: { 
            id: userId,
            name: userName || `User ${String(userId || '').substring(0, 8)}`,
            email: userEmail || ''
          },
        };
      });
      setResults(normalized);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const getScoreColor = (percentage) => {
    if (isNaN(percentage) || !isFinite(percentage)) return 'text-gray-400';
    if (percentage >= 80) return 'text-gold';
    if (percentage >= 60) return 'text-gold-300';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPercentage = (score, total) => {
    if (!total || total === 0) return 0;
    return (score / total) * 100;
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
      <h2 className="text-3xl font-bold gold-gradient-text mb-8">Student Results</h2>
      {results.length === 0 ? (
        <div className="gold-card text-center py-12 animate-slide-up">
          <Trophy className="w-16 h-16 text-gold/50 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">No exam submissions yet.</p>
        </div>
      ) : (
        <div className="gold-card overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gold/20">
              <thead className="bg-black/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold uppercase tracking-wider">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black/20 divide-y divide-gold/10">
                {results.map((result, index) => {
                  const percentage = getPercentage(result.score, result.total_questions);
                  const scoreColor = getScoreColor(percentage);
                  
                  return (
                    <tr 
                      key={result.id} 
                      className="hover:bg-gold/5 transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-xs font-mono text-gold/70 bg-black/40 px-2 py-1 rounded border border-gold/20 cursor-pointer hover:bg-black/60 transition-colors"
                          title={`Full ID: ${result.userId}`}
                          onClick={() => {
                            navigator.clipboard.writeText(result.userId);
                            alert('User ID copied to clipboard!');
                          }}
                        >
                          {String(result.userId || '').length > 12 
                            ? `${String(result.userId || '').substring(0, 12)}...` 
                            : String(result.userId || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-100">
                            {result.student.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {result.student.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-100">
                          {result.exam.title}
                        </div>
                        {result.exam.description && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                            {result.exam.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Trophy className={`w-4 h-4 ${scoreColor}`} />
                          <span className={`text-sm font-bold ${scoreColor}`}>
                            {result.score} / {result.total_questions}
                          </span>
                          <span className={`text-xs ${scoreColor} opacity-75`}>
                            ({result.total_questions > 0 ? percentage.toFixed(0) : 0}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gold/60" />
                          <span className="text-sm text-gray-300">
                            {formatTime(result.time_taken_seconds)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gold/60" />
                          <span className="text-sm text-gray-300">
                            {formatDate(result.submitted_at)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
