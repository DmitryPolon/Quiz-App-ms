import React, { useState, useEffect } from 'react';
import apiService, { type Category } from '../services/api';
import { type QuizData } from '../types/quiz';

interface CreateQuizFormProps {
  onBack: () => void;
  currentUser: { username: string; email: string; roleID?: number; userID?: number } | null;
  editingQuiz?: QuizData | null;
  isEditMode?: boolean;
}

interface QuizFormData {
  title: string;
  description: string;
  categoryId: number | null;
  timeLimitMinutes: number;
}

const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ onBack, currentUser, editingQuiz, isEditMode = false }) => {
  const [formData, setFormData] = useState<QuizFormData>({
    title: editingQuiz?.title || '',
    description: editingQuiz?.description || '',
    categoryId: null, // Will be set after categories load
    timeLimitMinutes: editingQuiz?.timeLimitMinutes ?? 0
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories when component mounts or when edit mode changes
  useEffect(() => {
    const fetchCategories = async () => {
      // Only fetch if we're not already loading
      if (!categoriesLoading) {
        setCategoriesLoading(true);
        try {
          console.log('CreateQuizForm - Fetching categories...');
          console.log('CreateQuizForm - Current state:', { isEditMode, editingQuiz });
          
          const response = await apiService.getCategories();
          console.log('CreateQuizForm - Categories response:', response);
          console.log('CreateQuizForm - Response type:', typeof response);
          console.log('CreateQuizForm - Is array:', Array.isArray(response));
          
          // Handle different possible response structures
          let categoriesData = null;
          
          if (response.success || response.categories) {
            categoriesData = response.categories;
            console.log('CreateQuizForm - Using response.categories:', categoriesData);
          } else if (Array.isArray(response)) {
            // Direct array response
            categoriesData = response;
            console.log('CreateQuizForm - Using direct array response:', categoriesData);
          } else if ((response as Record<string, unknown>).$values && Array.isArray((response as Record<string, unknown>).$values)) {
            // Wrapped in $values property (ASP.NET JSON format)
            categoriesData = (response as Record<string, unknown>).$values as Category[];
            console.log('CreateQuizForm - Using response.$values:', categoriesData);
          } else if ((response as Record<string, unknown>).data && Array.isArray((response as Record<string, unknown>).data)) {
            // Wrapped in data property
            categoriesData = (response as Record<string, unknown>).data as Category[];
            console.log('CreateQuizForm - Using response.data:', categoriesData);
          } else if ((response as Record<string, unknown>).items && Array.isArray((response as Record<string, unknown>).items)) {
            // Wrapped in items property
            categoriesData = (response as Record<string, unknown>).items as Category[];
            console.log('CreateQuizForm - Using response.items:', categoriesData);
          } else {
            console.log('CreateQuizForm - Response structure analysis:');
            console.log('CreateQuizForm - Response keys:', Object.keys(response));
            console.log('CreateQuizForm - Response values:', response);
          }
          
          if (categoriesData && Array.isArray(categoriesData)) {
            console.log('CreateQuizForm - Setting categories:', categoriesData);
            setCategories(categoriesData);
            
            // If in edit mode, find and set the category ID
            if (isEditMode && editingQuiz?.categories) {
              console.log('CreateQuizForm - Looking for category:', editingQuiz.categories);
              const matchingCategory = categoriesData.find(cat => cat.name === editingQuiz.categories);
              console.log('CreateQuizForm - Matching category:', matchingCategory);
              if (matchingCategory) {
                setFormData(prev => ({ ...prev, categoryId: matchingCategory.categoryID }));
                console.log('CreateQuizForm - Set category ID for edit mode:', matchingCategory.categoryID);
              } else {
                console.log('CreateQuizForm - No matching category found for:', editingQuiz.categories);
                console.log('CreateQuizForm - Available categories:', categoriesData.map(cat => cat.name));
              }
            }
          } else {
            console.error('CreateQuizForm - Failed to fetch categories - no valid data found');
            console.error('CreateQuizForm - Response structure:', response);
            console.error('CreateQuizForm - Available properties:', Object.keys(response));
          }
        } catch (error) {
          console.error('CreateQuizForm - Error fetching categories:', error);
          console.error('CreateQuizForm - Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories');
        } finally {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
  }, [isEditMode, editingQuiz?.categories]); // Depend on edit mode and quiz categories

  // Set category ID when categories are loaded and we're in edit mode
  useEffect(() => {
    if (categories.length > 0 && isEditMode && editingQuiz?.categories) {
      const matchingCategory = categories.find(cat => cat.name === editingQuiz.categories);
      if (matchingCategory) {
        setFormData(prev => ({ ...prev, categoryId: matchingCategory.categoryID }));
        console.log('Set category ID for edit mode (from loaded categories):', matchingCategory.categoryID);
      }
    }
  }, [categories, isEditMode, editingQuiz?.categories]);

  // Reset form data when editing quiz changes
  useEffect(() => {
    if (editingQuiz) {
      setFormData({
        title: editingQuiz.title || '',
        description: editingQuiz.description || '',
        categoryId: null, // Will be set after categories load
        timeLimitMinutes: editingQuiz.timeLimitMinutes ?? 0
      });
    }
  }, [editingQuiz]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 255) {
      newErrors.description = 'Description must be 255 characters or less';
    }

    if (formData.timeLimitMinutes < 0) {
      newErrors.timeLimitMinutes = 'Time limit cannot be negative';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if we have a valid user ID
    if (!currentUser?.userID) {
      alert('User ID not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Current user:', currentUser);
      console.log('User ID:', currentUser?.userID);
      console.log('Is edit mode:', isEditMode);
      
                   if (isEditMode && editingQuiz?.quizID) {
        // Update existing quiz
        const updateData = {
          title: formData.title,
          description: formData.description,
          timeLimitMinutes: formData.timeLimitMinutes
        };
        
        console.log('Updating quiz ID:', editingQuiz.quizID);
        console.log('Update data:', updateData);
        
        const response = await apiService.updateQuiz(editingQuiz.quizID, updateData);
        
        console.log('Update quiz response:', response);
        
        // Check for various success indicators
        if (response.success || 
            response.message === 'Quiz updated successfully' || 
            response.message?.toLowerCase().includes('success') ||
            !response.error) {
          
          // Tag quiz with category if selected
          if (formData.categoryId) {
            try {
              console.log('Tagging quiz with category ID:', formData.categoryId);
              const tagResponse = await apiService.tagQuizWithCategory(editingQuiz.quizID, formData.categoryId);
              console.log('Tag quiz response:', tagResponse);
              
              if (tagResponse.success || !tagResponse.error) {
                alert('Quiz updated and tagged with category successfully!');
              } else {
                alert('Quiz updated successfully, but failed to tag with category.');
              }
            } catch (tagError) {
              console.error('Failed to tag quiz with category:', tagError);
              alert('Quiz updated successfully, but failed to tag with category.');
            }
          } else {
            alert('Quiz updated successfully!');
          }
          
          onBack();
        } else {
          throw new Error(response.error || response.message || 'Failed to update quiz');
        }
      } else {
        // Create new quiz
        const quizData = {
          title: formData.title,
          description: formData.description,
          createdBy: currentUser?.userID || 0,
          timeLimitMinutes: formData.timeLimitMinutes
        };
        
        console.log('Creating quiz:', quizData);
        
        const response = await apiService.createQuiz(quizData);
        
        if (response.success || response.quizId || response.quizID) {
          const newQuizId = response.quizId || response.quizID;
          
          // Tag quiz with category if selected
          if (formData.categoryId && newQuizId) {
            try {
              console.log('Tagging new quiz with category ID:', formData.categoryId);
              const tagResponse = await apiService.tagQuizWithCategory(newQuizId, formData.categoryId);
              console.log('Tag quiz response:', tagResponse);
              
              if (tagResponse.success || !tagResponse.error) {
                alert('Quiz created and tagged with category successfully!');
              } else {
                alert('Quiz created successfully, but failed to tag with category.');
              }
            } catch (tagError) {
              console.error('Failed to tag quiz with category:', tagError);
              alert('Quiz created successfully, but failed to tag with category.');
            }
          } else {
            alert('Quiz created successfully!');
          }
          
          onBack();
        } else {
          throw new Error(response.error || response.message || 'Failed to create quiz');
        }
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert(error instanceof Error ? error.message : 'Failed to save quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuizFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="create-quiz-form">
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-group">
          <label htmlFor="title">Quiz Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={errors.title ? 'error' : ''}
            placeholder="Enter quiz title (max 100 characters)"
            maxLength={100}
            disabled={isLoading}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="char-count">{formData.title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={errors.description ? 'error' : ''}
            placeholder="Enter quiz description (max 255 characters)"
            maxLength={255}
            rows={4}
            disabled={isLoading}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-count">{formData.description.length}/255</span>
        </div>

                <div className="form-group">
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            value={formData.categoryId || ''}
            onChange={(e) => handleInputChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
            className={errors.categoryId ? 'error' : ''}
            disabled={isLoading || categoriesLoading}
          >
            <option value="">Select a category (optional)</option>
            {categories.map((category) => (
              <option key={category.categoryID} value={category.categoryID}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesLoading && <span className="loading-text">Loading categories...</span>}
          {categoriesError && (
            <div style={{ marginTop: '4px' }}>
              <span className="error-message">{categoriesError}</span>
              <button 
                type="button" 
                onClick={() => {
                  setCategoriesError(null);
                  setCategoriesLoading(false);
                  // Trigger a re-fetch by updating the dependency
                  setCategories([]);
                }}
                style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 8px' }}
              >
                Retry
              </button>
            </div>
          )}
          {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          {/* Debug info */}
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Debug: {categories.length} categories loaded, selected: {formData.categoryId || 'none'}
            {isEditMode && editingQuiz?.categories && `, quiz category: ${editingQuiz.categories}`}
            {categoriesError && `, error: ${categoriesError}`}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="timeLimitMinutes">Time Limit (minutes) - 0 = no time limit</label>
          <input
            type="number"
            id="timeLimitMinutes"
            value={formData.timeLimitMinutes}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseInt(value);
              handleInputChange('timeLimitMinutes', isNaN(numValue) ? 0 : numValue);
            }}
            className={errors.timeLimitMinutes ? 'error' : ''}
            placeholder="Enter time limit in minutes"
            min="0"
            max="480"
            disabled={isLoading}
          />
          {errors.timeLimitMinutes && <span className="error-message">{errors.timeLimitMinutes}</span>}
        </div>



        <div className="form-actions">
          <button 
            type="button" 
            onClick={onBack} 
            className="secondary-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? (isEditMode ? 'Updating Quiz...' : 'Creating Quiz...') : (isEditMode ? 'Update Quiz' : 'Create Quiz')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuizForm; 
