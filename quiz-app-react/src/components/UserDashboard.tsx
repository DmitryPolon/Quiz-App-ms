import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import TestResultsModal from './TestResultsModal';
import './UserDashboard.css';

interface UserDashboardProps {
  onBack: () => void;
  currentUser: { username: string; email: string; roleID?: number; userID?: number } | null;
  onStartQuiz?: (quizId: number, resultId?: number) => void;
  onViewResults?: (resultId: number) => void;
  onToggleAdmin?: () => void;
}

interface AssignedQuiz {
  resultID?: number;
  quizID: number;
  title: string;
  description: string;
  createdBy: number;
  assignedOn: string | null;
  takenAt: string | null;
  score: number | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onBack, currentUser, onStartQuiz, onToggleAdmin }) => {
  const [assignedQuizzes, setAssignedQuizzes] = useState<AssignedQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  useEffect(() => {
    loadAssignedQuizzes();
  }, []);

  const loadAssignedQuizzes = async () => {
    try {
      setLoading(true);
      if (!currentUser?.userID) {
        setMessage({ type: 'error', text: 'User ID not available' });
        return;
      }
      const response = await apiService.getQuizHeadersUser(currentUser.userID);
      if (response.$values) {
        // Filter out any items with $ref properties (circular references)
        // Note: $id is a normal property in ASP.NET JSON responses and should be kept
        const validQuizzes = response.$values.filter(quiz => {
          // Check if the quiz object has any $ref properties (but not $id)
          const hasRef = Object.keys(quiz).some(key => key === '$ref');
          if (hasRef) {
            console.warn('Filtering out quiz with $ref properties:', quiz);
            return false;
          }
          return true;
        });

        // Sort quizzes: not taken first, then by taken date (most recent first)
        const sortedQuizzes = validQuizzes.sort((a, b) => {
          const aCompleted = a.takenAt !== null;
          const bCompleted = b.takenAt !== null;
          
          // If one is completed and the other isn't, put incomplete first
          if (aCompleted !== bCompleted) {
            return aCompleted ? 1 : -1;
          }
          
          // If both are completed, sort by taken date (most recent first)
          if (aCompleted && bCompleted) {
            return new Date(b.takenAt!).getTime() - new Date(a.takenAt!).getTime();
          }
          
          // If both are incomplete, sort by assigned date (most recent first)
          if (a.assignedOn && b.assignedOn) {
            return new Date(b.assignedOn).getTime() - new Date(a.assignedOn).getTime();
          }
          
          // If one has assigned date and the other doesn't, put assigned first
          if (a.assignedOn !== b.assignedOn) {
            return a.assignedOn ? -1 : 1;
          }
          
          // Default sort by quiz ID
          return a.quizID - b.quizID;
        });
        
        setAssignedQuizzes(sortedQuizzes);
      }
    } catch (error) {
      console.error('Error loading assigned quizzes:', error);
      setMessage({ type: 'error', text: 'Failed to load assigned quizzes' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quizId: number, resultId?: number) => {
    try {
      // If we have a resultId, use it (existing behavior)
      if (resultId) {
        if (onStartQuiz) {
          onStartQuiz(quizId, resultId);
        } else {
          console.log('Starting quiz:', quizId, 'with resultId:', resultId);
        }
        return;
      }

      // If no resultId, we need to handle this case
      // For now, we'll start the quiz without a resultId
      // The TestScreen will handle the case where resultId is undefined
      console.log('Starting quiz without resultId:', quizId);
      
      if (onStartQuiz) {
        onStartQuiz(quizId, undefined);
      } else {
        console.log('No onStartQuiz handler available');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setMessage({ type: 'error', text: 'Failed to start quiz. Please try again.' });
    }
  };

  const handleViewResults = (resultId: number) => {
    setSelectedResultId(resultId);
    setIsResultsModalOpen(true);
    
    // Note: Removed onViewResults call to prevent navigation to ResultsScreen
    // The TestResultsModal will handle displaying the detailed results
  };

  const handleCloseResultsModal = () => {
    setIsResultsModalOpen(false);
    setSelectedResultId(null);
  };

  const clearMessage = () => setMessage(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not assigned';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isQuizCompleted = (quiz: AssignedQuiz) => {
    return quiz.takenAt !== null;
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.username}!</h1>
        <p>Here are your assigned quizzes</p>
      </div>

      {message && (
        <div className={`message ${message.type}`} onClick={clearMessage}>
          <span>{message.text}</span>
          <button className="close-btn">&times;</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="quizzes-section">
          <h2>Your Quizzes</h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your quizzes...</p>
            </div>
          ) : assignedQuizzes.length === 0 ? (
            <div className="no-quizzes">
              <div className="no-quizzes-icon">📚</div>
              <h3>No quizzes assigned yet</h3>
              <p>You don't have any quizzes assigned to you at the moment.</p>
              <p>Contact your administrator to get started.</p>
            </div>
          ) : (
                         <div className="quizzes-grid">
                               {assignedQuizzes.map((quiz) => {
                  // Skip any quiz objects that have $ref properties (but not $id)
                  if (Object.keys(quiz).some(key => key === '$ref')) {
                    console.warn('Skipping quiz with $ref properties:', quiz);
                    return null;
                  }
                  
                  const completed = isQuizCompleted(quiz);
                  return (
                    <div key={`${quiz.quizID}-${quiz.resultID || 'no-result'}-${quiz.takenAt || 'not-taken'}`} className={`quiz-card ${completed ? 'completed' : 'pending'}`}>
                     <div className="quiz-card-header">
                       <h3>{quiz.title}</h3>
                       <div className={`status-badge ${completed ? 'completed' : 'pending'}`}>
                         {completed ? 'Completed' : 'Pending'}
                       </div>
                     </div>
                     
                     <div className="quiz-card-details">
                       <p><strong>Description:</strong> {quiz.description}</p>
                       <p><strong>Assigned:</strong> {formatDate(quiz.assignedOn)}</p>
                       {completed && (
                         <p><strong>Taken:</strong> {formatDate(quiz.takenAt)}</p>
                       )}
                       {completed && quiz.score !== null && (
                         <p><strong>Score:</strong> {quiz.score}%</p>
                       )}
                       {completed && quiz.score === null && (
                         <p><strong>Score:</strong> 0%</p>
                       )}
                     </div>
                     
                                           <div className="quiz-card-actions">
                        {!completed ? (
                          <button
                            type="button"
                            onClick={() => handleStartQuiz(quiz.quizID, quiz.resultID)}
                            className="start-quiz-btn"
                            disabled={loading}
                          >
                            Start Quiz
                          </button>
                        ) : quiz.resultID ? (
                          <button
                            type="button"
                            onClick={() => handleViewResults(quiz.resultID!)}
                            className="view-results-btn"
                            disabled={loading}
                          >
                            View Results
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="view-results-btn"
                            disabled={true}
                          >
                            Completed
                          </button>
                        )}
                      </div>
                   </div>
                 );
               })}
             </div>
          )}
        </div>

        <div className="user-info-section">
          <div className="user-info-card">
            <h3>Your Information</h3>
            <div className="user-details">
              <p><strong>Name:</strong> {currentUser?.username}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Role:</strong> User</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        {currentUser?.roleID === 1 && onToggleAdmin && (
          <button
            type="button"
            onClick={onToggleAdmin}
            className="toggle-admin-btn"
            disabled={loading}
          >
            Toggle Admin Mode
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="logout-btn"
          disabled={loading}
        >
          Logout
        </button>
      </div>

      {/* Test Results Modal */}
      {selectedResultId && (
        <TestResultsModal
          isOpen={isResultsModalOpen}
          onClose={handleCloseResultsModal}
          resultId={selectedResultId}
        />
      )}
    </div>
  );
};

export default UserDashboard;
