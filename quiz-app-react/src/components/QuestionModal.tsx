import React, { useState, useEffect } from 'react';
import './QuestionModal.css';

interface QuestionFormData {
  questionText: string;
  difficulty: number; // Changed to number to store DifficultyID
  timeLimitSeconds: number;
}

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestionWithAnswers: (questionData: QuestionFormData, answerOptions: AnswerOption[]) => Promise<void>;
  isEditMode: boolean;
  initialQuestionData?: QuestionFormData;
  initialAnswerOptions?: AnswerOption[];
  editingQuestionId?: number;
}

const QuestionModal: React.FC<QuestionModalProps> = ({  
  isOpen,
  onClose,
  onSaveQuestionWithAnswers,
  isEditMode,
  initialQuestionData,
  initialAnswerOptions
}) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: '',
    difficulty: 1, // Default to Easy (1)
    timeLimitSeconds: 0 // Default to 0 seconds
  });
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false }
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const difficultyOptions = [
    { value: 1, label: 'Easy' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Hard' }
  ];

  // Initialize form data when modal opens or when editing
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialQuestionData) {
        setFormData(initialQuestionData);
      } else {
        setFormData({
          questionText: '',
          difficulty: 1, // Default to Easy (1)
          timeLimitSeconds: 0 // Default to 0 seconds
        });
      }

      if (isEditMode && initialAnswerOptions) {
        setAnswerOptions(initialAnswerOptions);
      } else {
        setAnswerOptions([
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ]);
      }

      setErrors({});
    }
  }, [isOpen, isEditMode, initialQuestionData, initialAnswerOptions]);



  const validateQuestionForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    } else if (formData.questionText.length > 500) {
      newErrors.questionText = 'Question text must be 500 characters or less';
    }

    if (!formData.difficulty || formData.difficulty < 1 || formData.difficulty > 3) {
      newErrors.difficulty = 'Difficulty is required';
    }

    if (formData.timeLimitSeconds < 0) {
      newErrors.timeLimitSeconds = 'Time limit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAnswerForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate answer options
    const validAnswers = answerOptions.filter(option => option.text.trim() !== '');
    if (validAnswers.length < 2) {
      newErrors.answerOptions = 'At least 2 answer options are required';
    }

    const correctAnswers = answerOptions.filter(option => option.isCorrect);
    if (correctAnswers.length === 0) {
      newErrors.answerOptions = 'At least one correct answer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveQuestion = async () => {
    console.log('Saving question with data:', formData);
    
    if (!validateQuestionForm()) {
      console.log('Question form validation failed');
      return;
    }

    if (!validateAnswerForm()) {
      console.log('Answer form validation failed');
      return;
    }

    setIsLoading(true);
    try {
      await onSaveQuestionWithAnswers(formData, answerOptions);
      // Close the modal after successful save
      onClose();
    } catch (error) {
      console.error('Failed to save question and answers:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuestionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAnswerChange = (id: string, text: string) => {
    setAnswerOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, text } : option
      )
    );
    if (errors.answerOptions) {
      setErrors(prev => ({ ...prev, answerOptions: '' }));
    }
  };

  const handleCorrectChange = (id: string, isCorrect: boolean) => {
    setAnswerOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, isCorrect } : option
      )
    );
    if (errors.answerOptions) {
      setErrors(prev => ({ ...prev, answerOptions: '' }));
    }
  };

  const addAnswerOption = () => {
    const newId = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setAnswerOptions(prev => [...prev, { id: newId, text: '', isCorrect: false }]);
  };

  const removeAnswerOption = () => {
    if (answerOptions.length > 2) {
      setAnswerOptions(prev => prev.slice(0, -1));
    }
  };

  const removeAnswerOptionById = (id: string) => {
    if (answerOptions.length > 1) {
      setAnswerOptions(prev => prev.filter(option => option.id !== id));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Question' : 'Add Question'}</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form className="modal-form">
          {/* Question Form Section */}
          <div className="form-section">
            <h3>Question Details</h3>
            
            <div className="form-group">
              <label htmlFor="questionText">Question Text *</label>
              <textarea
                id="questionText"
                value={formData.questionText}
                onChange={(e) => handleInputChange('questionText', e.target.value)}
                className={errors.questionText ? 'error' : ''}
                placeholder="Enter the question text (max 500 characters)"
                maxLength={500}
                rows={4}
                disabled={isLoading}
              />
              {errors.questionText && <span className="error-message">{errors.questionText}</span>}
              <span className="char-count">{formData.questionText.length}/500</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="difficulty">Difficulty *</label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                  className={errors.difficulty ? 'error' : ''}
                  disabled={isLoading}
                >
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.difficulty && <span className="error-message">{errors.difficulty}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="timeLimitSeconds">Time Limit (seconds) *</label>
                                 <input
                   type="number"
                   id="timeLimitSeconds"
                   value={formData.timeLimitSeconds}
                   onChange={(e) => {
                     const value = e.target.value;
                     const numValue = value === '' ? 0 : parseInt(value);
                     handleInputChange('timeLimitSeconds', isNaN(numValue) ? 0 : numValue);
                   }}
                   className={errors.timeLimitSeconds ? 'error' : ''}
                   placeholder="Enter time limit in seconds"
                   min="0"
                   max="3600"
                   disabled={isLoading}
                 />
                {errors.timeLimitSeconds && <span className="error-message">{errors.timeLimitSeconds}</span>}
              </div>
            </div>

            {/* Question Action Button */}
            <div className="question-action">
              {isEditMode && (
                <button 
                  type="button" 
                  onClick={handleSaveQuestion}
                  className="primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Question'}
                </button>
              )}
            </div>
          </div>

          {/* Answer Options Section */}
          <div className="form-section">
            <h3>Answer Options</h3>
            
            <div className="answer-options-list">
              {answerOptions.map((option, index) => (
                <div key={option.id} className="answer-option">
                  <div className="option-number">{String.fromCharCode(65 + index)}</div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleAnswerChange(option.id, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    disabled={isLoading}
                  />
                  <div className="correct-checkbox">
                    <input
                      type="checkbox"
                      id={`correct-${option.id}`}
                      checked={option.isCorrect}
                      onChange={(e) => handleCorrectChange(option.id, e.target.checked)}
                      disabled={isLoading}
                    />
                    <label htmlFor={`correct-${option.id}`}>Correct</label>
                  </div>
                  {answerOptions.length > 2 && (
                    <button
                      type="button"
                      className="delete-answer-btn"
                      onClick={() => {
                        console.log('Deleting answer with ID:', option.id);
                        removeAnswerOptionById(option.id);
                      }}
                      title="Delete this answer"
                      disabled={isLoading}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.answerOptions && <span className="error-message">{errors.answerOptions}</span>}

            <div className="answer-options-actions">
              <button
                type="button"
                className="add-answer-button"
                onClick={addAnswerOption}
                title="Add answer option"
                disabled={isLoading}
              >
                +
              </button>
              {answerOptions.length > 2 && (
                <button
                  type="button"
                  className="remove-answer-button"
                  onClick={removeAnswerOption}
                  title="Remove last option"
                  disabled={isLoading}
                >
                  −
                </button>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <div className="left-buttons">
              <button 
                type="button" 
                onClick={handleClose}
                className="secondary-button"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={handleSaveQuestion}
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
