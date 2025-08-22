import React, { useState, useEffect } from 'react';
import apiService, { type QuizOverviewRequest } from '../services/api';
import { type QuizData } from '../types/quiz';

interface QuizOverviewProps {
  onBack: () => void;
  onCreateQuiz: () => void;
  onViewQuiz: (quizData: QuizData) => void;
  onEditQuiz: (quizData: QuizData) => void;
  onDeleteQuiz: (quizId: number) => void;
  currentUser: { username: string; email: string; roleID?: number; userID?: number } | null;
}

interface SortConfig {
  key: keyof QuizData;
  direction: 'asc' | 'desc';
}

interface ApiResponseWithValues {
  $values: QuizData[];
}

const QuizOverview: React.FC<QuizOverviewProps> = ({ onBack, onCreateQuiz, onViewQuiz, onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<QuizOverviewRequest>({
    page: 1,
    pageSize: 10,
    title: '',
    createdBy: '',
    category: ''
  });
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching quizzes with filters:', filters);
      const response = await apiService.getQuizOverview(filters);
      console.log('Quiz overview response:', response);
      
      // Handle different response structures and ensure we always have an array
      let quizData: QuizData[] = [];
      
             if (response.success || response.quizzes || response.items) {
         // Try to extract quiz data from different possible response structures
         if (Array.isArray(response.quizzes)) {
           quizData = response.quizzes;
         } else if (Array.isArray(response.items)) {
           quizData = response.items;
         } else if (Array.isArray(response)) {
           // If the response itself is an array
           quizData = response;
                   } else if (response.items && typeof response.items === 'object' && '$values' in response.items && Array.isArray((response.items as ApiResponseWithValues).$values)) {
            // Handle the specific structure: { items: { $values: [...] } }
            quizData = (response.items as ApiResponseWithValues).$values;
          } else if (response.quizzes && typeof response.quizzes === 'object') {
            // If quizzes is an object, try to convert it to array
            const values = Object.values(response.quizzes);
            quizData = values.filter(item => typeof item === 'object' && item !== null);
          } else if (response.items && typeof response.items === 'object') {
            // If items is an object, check if it has $values property
            if ('$values' in response.items && Array.isArray((response.items as ApiResponseWithValues).$values)) {
              quizData = (response.items as ApiResponseWithValues).$values;
            } else {
              // Fallback: try to convert to array but filter out non-object values
              const values = Object.values(response.items);
              quizData = values.filter(item => typeof item === 'object' && item !== null);
            }
          }
        
        console.log('Extracted quiz data:', quizData);
        console.log('Quiz data type:', typeof quizData);
        console.log('Is array:', Array.isArray(quizData));
        
        // Additional debugging to see the structure
        if (Array.isArray(quizData)) {
          console.log('First quiz item:', quizData[0]);
          console.log('Quiz data length:', quizData.length);
          console.log('All quiz items are objects:', quizData.every(item => typeof item === 'object' && item !== null));
          
          // Check for problematic items
          quizData.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
              console.log(`Non-object item at index ${index}:`, item);
            }
          });
        }
        
        // Ensure we always set an array and filter out any non-object items
        const finalQuizData = Array.isArray(quizData) 
          ? quizData.filter(item => {
              // Check if it's a valid quiz object (has quizID property)
              // Note: Valid quiz objects can have $id property, but should not have $values property
              const isValid = typeof item === 'object' && 
                             item !== null && 
                             'quizID' in item && 
                             !('$values' in item);
              if (!isValid) {
                console.log('Filtering out invalid item:', item);
              }
              return isValid;
            })
          : [];
        setQuizzes(finalQuizData);
        setTotalCount(response.totalCount || finalQuizData.length || 0);
        console.log('Final quizzes loaded:', finalQuizData.length);
      } else {
        throw new Error(response.error || response.message || 'Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      // Set empty array on error to prevent map errors
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  // Sync sort config with filters when component loads
  useEffect(() => {
    if (filters.sortBy && filters.sortOrder) {
      setSortConfig({
        key: filters.sortBy as keyof QuizData,
        direction: filters.sortOrder
      });
    }
  }, []);

  const handleFilterChange = (field: keyof QuizOverviewRequest, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      title: '',
      createdBy: '',
      category: ''
    });
    setSortConfig(null); // Clear sorting when filters are cleared
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeLimit = (minutes?: number) => {
    if (!minutes || minutes <= 0) return 'No limit';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes === 60) {
      return '1 hour';
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  };

  const handleSort = (key: keyof QuizData) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    // Update filters to include sorting parameters
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: direction,
      page: 1 // Reset to first page when sorting changes
    }));
  };

  const getSortIcon = (key: keyof QuizData) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        console.log('Deleting quiz:', quizId);
        
        const response = await apiService.deleteQuiz(quizId);
        console.log('Delete quiz response:', response);
        
        if (response.success || response.message?.toLowerCase().includes('success') || !response.error) {
          alert('Quiz deleted successfully!');
          // Refresh the quiz list after deletion
          await fetchQuizzes();
        } else {
          throw new Error(response.error || response.message || 'Failed to delete quiz');
        }
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete quiz. Please try again.');
      }
    }
  };

  return (
    <div className="quiz-overview">
             <div className="overview-header">
         <h1>Quiz Overview</h1>
         <p>Manage and view all quizzes in the system</p>
         <div className="header-buttons">
           <button onClick={onBack} className="back-button">
             Back to Quiz
           </button>
           <button onClick={onCreateQuiz} className="create-quiz-button">
             Create Quiz
           </button>
         </div>
       </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="title-filter">Title:</label>
            <input
              type="text"
              id="title-filter"
              value={filters.title || ''}
              onChange={(e) => handleFilterChange('title', e.target.value)}
              placeholder="Search by title..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="createdBy-filter">Created By:</label>
            <input
              type="text"
              id="createdBy-filter"
              value={filters.createdBy || ''}
              onChange={(e) => handleFilterChange('createdBy', e.target.value)}
              placeholder="Search by creator..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <input
              type="text"
              id="category-filter"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="Search by category..."
            />
          </div>
          
          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-message">
          Loading quizzes...
        </div>
      )}

      {/* Quiz Grid */}
      {!loading && !error && (
        <div className="quiz-grid-container">
          <div className="quiz-grid">
                                                <div className="grid-header">
                         <div className="grid-cell sortable" onClick={() => handleSort('quizID')}>
                           ID {getSortIcon('quizID')}
                         </div>
                         <div className="grid-cell sortable" onClick={() => handleSort('title')}>
                           Title {getSortIcon('title')}
                         </div>
                         <div className="grid-cell sortable" onClick={() => handleSort('description')}>
                           Description {getSortIcon('description')}
                         </div>
                         <div className="grid-cell sortable" onClick={() => handleSort('createdBy')}>
                           Created By {getSortIcon('createdBy')}
                         </div>
                         <div className="grid-cell sortable" onClick={() => handleSort('categories')}>
                           Category {getSortIcon('categories')}
                         </div>
                         <div className="grid-cell sortable" onClick={() => handleSort('timeLimitMinutes')}>
                           Time Limit {getSortIcon('timeLimitMinutes')}
                         </div>
                         <div className="grid-cell sortable" onClick={() => handleSort('createdAt')}>
                           Created Date {getSortIcon('createdAt')}
                         </div>
                         <div className="grid-cell">
                           Actions
                         </div>
                       </div>
            
                         {!Array.isArray(quizzes) || quizzes.length === 0 ? (
               <div className="no-quizzes">
                 <p>No quizzes found matching your criteria.</p>
               </div>
                          ) : (
                                                                                                                                     quizzes
                                                                     .filter(quiz => typeof quiz === 'object' && quiz !== null && 'quizID' in quiz)
                                                                     .map((quiz, index) => (
                             <div key={quiz.quizID || `quiz-${index}`} className="grid-row">
                             <div className="grid-cell">
                                                               <button 
                                  className="quiz-id-link"
                                  onClick={() => onViewQuiz(quiz)}
                                >
                                  {typeof quiz.quizID === 'number' ? quiz.quizID : 'N/A'}
                                </button>
                             </div>
                                                           <div className="grid-cell">{typeof quiz.title === 'string' ? quiz.title : 'N/A'}</div>
                              <div className="grid-cell">{typeof quiz.description === 'string' ? quiz.description : 'N/A'}</div>
                              <div className="grid-cell">{typeof quiz.createdBy === 'string' ? quiz.createdBy : 'N/A'}</div>
                              <div className="grid-cell">{typeof quiz.categories === 'string' ? quiz.categories : 'N/A'}</div>
                              <div className="grid-cell">{formatTimeLimit(quiz.timeLimitMinutes)}</div>
                              <div className="grid-cell">{formatDate(quiz.createdAt)}</div>
                             <div className="grid-cell">
                               <div className="action-buttons">
                                 <button 
                                   className="edit-button"
                                   onClick={() => onEditQuiz(quiz)}
                                   title="Edit Quiz"
                                 >
                                   ✏️
                                 </button>
                                 <button 
                                   className="delete-button"
                                   onClick={() => handleDeleteQuiz(quiz.quizID!)}
                                   title="Delete Quiz"
                                 >
                                   🗑️
                                 </button>
                               </div>
                             </div>
                           </div>
                         ))
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalCount > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.pageSize || 10), totalCount)} of {totalCount} quizzes
          </div>
          
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={(filters.page || 1) <= 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {filters.page || 1} of {Math.ceil(totalCount / (filters.pageSize || 10))}
            </span>
            
            <button
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={(filters.page || 1) >= Math.ceil(totalCount / (filters.pageSize || 10))}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizOverview; 
