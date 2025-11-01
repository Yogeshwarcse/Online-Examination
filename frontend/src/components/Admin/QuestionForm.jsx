import { useState } from 'react';
import { createQuestion, updateQuestion } from '../../api/questions';
import { X } from 'lucide-react';

export default function QuestionForm({ examId, question, onClose }) {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [optionA, setOptionA] = useState(question?.options?.[0] || '');
  const [optionB, setOptionB] = useState(question?.options?.[1] || '');
  const [optionC, setOptionC] = useState(question?.options?.[2] || '');
  const [optionD, setOptionD] = useState(question?.options?.[3] || '');
  const [correctAnswer, setCorrectAnswer] = useState(
    typeof question?.correctOptionIndex === 'number' ? ['A','B','C','D'][question.correctOptionIndex] : 'A'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        examId,
        text: questionText,
        options: [optionA, optionB, optionC, optionD],
        correctOptionIndex: ['A','B','C','D'].indexOf(correctAnswer),
      };
      if (question?._id) {
        await updateQuestion(question._id, {
          text: payload.text,
          options: payload.options,
          correctOptionIndex: payload.correctOptionIndex,
        });
      } else {
        await createQuestion(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gold-card p-8 animate-scale-in max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gold-gradient-text">
          {question ? 'Edit Question' : 'Add New Question'}
        </h2>
        <button 
          onClick={onClose} 
          className="gold-button-outline p-2 hover:bg-red-900/20 hover:border-red-500"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border-2 border-red-500/50 text-red-300 px-4 py-3 rounded-2xl mb-6 animate-slide-up backdrop-blur-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="question" className="block text-sm font-semibold text-gold mb-2">
            Question Text
          </label>
          <textarea 
            id="question" 
            value={questionText} 
            onChange={(e) => setQuestionText(e.target.value)} 
            required 
            rows={4} 
            className="gold-input w-full resize-none" 
            placeholder="Enter the question..." 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="optionA" className="block text-sm font-semibold text-gold mb-2">
              Option A
            </label>
            <input 
              id="optionA" 
              type="text" 
              value={optionA} 
              onChange={(e) => setOptionA(e.target.value)} 
              required 
              className="gold-input w-full" 
              placeholder="First option" 
            />
          </div>
          <div>
            <label htmlFor="optionB" className="block text-sm font-semibold text-gold mb-2">
              Option B
            </label>
            <input 
              id="optionB" 
              type="text" 
              value={optionB} 
              onChange={(e) => setOptionB(e.target.value)} 
              required 
              className="gold-input w-full" 
              placeholder="Second option" 
            />
          </div>
          <div>
            <label htmlFor="optionC" className="block text-sm font-semibold text-gold mb-2">
              Option C
            </label>
            <input 
              id="optionC" 
              type="text" 
              value={optionC} 
              onChange={(e) => setOptionC(e.target.value)} 
              required 
              className="gold-input w-full" 
              placeholder="Third option" 
            />
          </div>
          <div>
            <label htmlFor="optionD" className="block text-sm font-semibold text-gold mb-2">
              Option D
            </label>
            <input 
              id="optionD" 
              type="text" 
              value={optionD} 
              onChange={(e) => setOptionD(e.target.value)} 
              required 
              className="gold-input w-full" 
              placeholder="Fourth option" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gold mb-3">Correct Answer</label>
          <div className="grid grid-cols-4 gap-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button 
                key={option} 
                type="button" 
                onClick={() => setCorrectAnswer(option)} 
                className={`
                  py-3 px-4 rounded-xl font-semibold transition-all duration-300
                  ${correctAnswer === option 
                    ? 'gold-button shadow-gold-glow' 
                    : 'gold-button-outline hover:bg-gold/10'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="gold-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              question ? 'Update Question' : 'Add Question'
            )}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="gold-button-outline px-6"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
