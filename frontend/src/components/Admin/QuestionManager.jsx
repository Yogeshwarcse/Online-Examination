import { useState, useEffect } from 'react';
import { getExam } from '../../api/exams';
import { getQuestionsByExam, deleteQuestion } from '../../api/questions';
import { uploadExamImage } from '../../api/exams';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Loader } from 'lucide-react';
import QuestionForm from './QuestionForm.jsx';

export default function QuestionManager({ examId, onClose }) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      const [examData, qs] = await Promise.all([
        getExam(examId),
        getQuestionsByExam(examId),
      ]);
      setExam(examData);
      setQuestions(qs || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(questionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuestion(null);
    loadData();
  };

  const handleAddManually = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, BMP, TIFF, or WebP)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit. Please use a smaller image.');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    
    try {
      const result = await uploadExamImage(examId, file);
      setUploadSuccess(`Successfully extracted ${result.questions?.length || 0} question(s)!`);
      await loadData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to process image. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please ensure the image contains clearly formatted MCQ questions with numbered questions and labeled options (A, B, C, D).';
      }
      
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mx-auto mb-4"></div>
        <p className="text-gold font-semibold">Loading questions...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <QuestionForm 
        examId={examId} 
        question={editingQuestion} 
        onClose={handleFormClose} 
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <button 
        onClick={onClose} 
        className="gold-button-outline flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Exams
      </button>

      <div className="gold-card mb-8">
        <h2 className="text-3xl font-bold gold-gradient-text mb-3">{exam?.title}</h2>
        <p className="text-gray-300 mb-2">{exam?.description}</p>
        <p className="text-sm text-gold font-semibold">Duration: {exam?.durationMinutes} minutes</p>
      </div>

      <div className="gold-card mb-6 p-6 border-2 border-gold/50">
        <h3 className="text-xl font-bold text-gold mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload MCQ Image
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Upload an image containing MCQ questions. The system will automatically extract questions using OCR.
        </p>
        
        <div className="bg-black/40 rounded-xl p-4 mb-4 border border-gold/20">
          <p className="text-gold font-semibold text-sm mb-2">📋 Supported Formats:</p>
          <p className="text-gray-400 text-xs mb-2">
            JPEG, PNG, GIF, BMP, TIFF, WebP (Max 10MB)
          </p>
          
          <p className="text-gold font-semibold text-sm mb-2 mt-4">✅ Best Practices:</p>
          <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
            <li>Use high-resolution images (300+ DPI recommended)</li>
            <li>Ensure clear, sharp text with good contrast</li>
            <li>Format: Numbered questions (1., 2., or Q1, Q2)</li>
            <li>Options clearly labeled (A), B), C), D))</li>
            <li>Mark correct answer: *, Answer: A, Ans: B, or Correct: C</li>
            <li>Avoid handwritten text (printed/digital works best)</li>
          </ul>
          
          <p className="text-gold font-semibold text-sm mb-2 mt-4">📝 Example Format:</p>
          <div className="bg-black/60 rounded-lg p-3 text-xs font-mono text-gray-300">
            <div>1. What is 2+2?</div>
            <div>A) 3</div>
            <div>B) 4 *</div>
            <div>C) 5</div>
            <div>D) 6</div>
          </div>
        </div>
        
        <label className="gold-button cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {uploading ? 'Processing...' : 'Choose Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        
        {uploading && (
          <div className="mt-4 flex items-center gap-3 text-gold">
            <Loader className="w-5 h-5 animate-spin" />
            <p className="text-sm">Extracting questions from image...</p>
          </div>
        )}
        
        {uploadError && (
          <div className="mt-4 bg-red-900/30 border-2 border-red-500/50 text-red-300 px-4 py-3 rounded-2xl animate-slide-up">
            <p className="text-sm">{uploadError}</p>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="mt-4 bg-green-900/30 border-2 border-green-500/50 text-green-300 px-4 py-3 rounded-2xl animate-slide-up">
            <p className="text-sm font-semibold">{uploadSuccess}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold gold-gradient-text">Questions ({questions.length})</h3>
        <button 
          onClick={handleAddManually}
          className="gold-button-outline flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Manually
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="gold-card text-center py-12 animate-slide-up">
          <p className="text-gray-300 text-lg mb-2">No questions added yet.</p>
          <p className="text-gray-400 text-sm">Upload an image above or click "Add Manually" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {questions.map((question, index) => (
            <div 
              key={question._id} 
              className="gold-card animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-gray-100 text-lg">
                  {index + 1}. {question.text}
                </h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(question)}
                    className="gold-button-outline p-2"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(question._id)} 
                    className="gold-button-outline p-2 text-red-400 border-red-500/50 hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options?.map((opt, idx) => {
                  const isCorrect = question.correctOptionIndex === idx;
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isCorrect 
                          ? 'bg-gold/20 border-gold text-gold font-semibold' 
                          : 'bg-black/20 border-gold/20 text-gray-300'
                      }`}
                    >
                      <span className="font-bold">{label}.</span> {opt}
                      {isCorrect && <span className="ml-2 text-xs">✓ Correct</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
