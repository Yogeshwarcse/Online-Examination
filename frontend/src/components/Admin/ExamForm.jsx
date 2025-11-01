import { useState } from 'react';
import { createExam, updateExam } from '../../api/exams';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function ExamForm({ exam, onClose }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(exam?.title || '');
  const [description, setDescription] = useState(exam?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(exam?.durationMinutes || 30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (exam?._id) {
        await updateExam(exam._id, { title, description, durationMinutes });
      } else {
        await createExam({ title, description, durationMinutes });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gold-card p-8 animate-scale-in max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gold-gradient-text">{exam ? 'Edit Exam' : 'Create New Exam'}</h2>
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
          <label htmlFor="title" className="block text-sm font-semibold text-gold mb-2">Exam Title</label>
          <input 
            id="title" 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="gold-input w-full" 
            placeholder="e.g., Mathematics Final Exam" 
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gold mb-2">Description</label>
          <textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={4} 
            className="gold-input w-full resize-none" 
            placeholder="Brief description of the exam..." 
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-semibold text-gold mb-2">Duration (minutes)</label>
          <input 
            id="duration" 
            type="number" 
            value={durationMinutes} 
            onChange={(e) => setDurationMinutes(Number(e.target.value))} 
            required 
            min={1} 
            max={300} 
            className="gold-input w-full" 
          />
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
              exam ? 'Update Exam' : 'Create Exam'
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
