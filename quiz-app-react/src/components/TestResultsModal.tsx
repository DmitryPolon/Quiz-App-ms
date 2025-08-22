import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './TestResultsModal.css';

interface TestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: number;
}

interface UserResponse {
  userResponseID: number;
  resultID: number;
  questionID: number;
  answerID: number;
  respondedAt: string;
  isCorrect: boolean | null;
  questionText: string;
  answerText: string | null;
  timeTakenSeconds: number;
  answerTimedOut: boolean;
  difficultyID: number;
  levelName: string;
}

const TestResultsModal: React.FC<TestResultsModalProps> = ({ isOpen, onClose, resultId }) => {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && resultId) {
      loadTestResponses();
    }
  }, [isOpen, resultId]);

  const loadTestResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTestResponses(resultId);
      if (response.$values) {
        console.log(`Loaded ${response.$values.length} responses for resultID ${resultId}`);
        console.log('All responses:', response.$values);
        setResponses(response.$values);
      }
    } catch (err) {
      console.error('Error loading test responses:', err);
      setError('Failed to load test responses');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = (isCorrect: boolean | null, answerTimedOut: boolean) => {
    if (answerTimedOut) {
      return <span className="status-icon timeout">⏰</span>;
    }
    if (isCorrect === null) {
      return <span className="status-icon pending">❓</span>;
    }
    return isCorrect ? 
      <span className="status-icon correct">✓</span> : 
      <span className="status-icon incorrect">✗</span>;
  };

  const getStatusText = (isCorrect: boolean | null, answerTimedOut: boolean) => {
    if (answerTimedOut) {
      return 'Timed Out';
    }
    if (isCorrect === null) {
      return 'Pending';
    }
    return isCorrect ? 'Correct' : 'Incorrect';
  };

  const getStatusClass = (isCorrect: boolean | null, answerTimedOut: boolean) => {
    if (answerTimedOut) {
      return 'timeout';
    }
    if (isCorrect === null) {
      return 'pending';
    }
    return isCorrect ? 'correct' : 'incorrect';
  };

  // Filter responses to only show those for the specific resultID
  const filteredResponses = responses.filter(response => response.resultID === resultId);
  console.log(`Filtered to ${filteredResponses.length} responses for resultID ${resultId}`);
  
  // Group responses by question ID to show unique questions
  const groupedResponses = filteredResponses.reduce((acc, response) => {
    if (!acc[response.questionID]) {
      acc[response.questionID] = [];
    }
    acc[response.questionID].push(response);
    return acc;
  }, {} as Record<number, UserResponse[]>);

  // Get the latest response for each question
  const latestResponses = Object.values(groupedResponses).map(questionResponses => {
    return questionResponses.sort((a, b) => 
      new Date(b.respondedAt).getTime() - new Date(a.respondedAt).getTime()
    )[0];
  });
  
  console.log(`Showing ${latestResponses.length} unique questions for resultID ${resultId}`);

  // Calculate weighted score based on difficulty levels
  const calculateWeightedScore = () => {
    const difficultyWeights = {
      1: 1,    // Easy
      2: 2,    // Medium  
      3: 3     // Hard
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    latestResponses.forEach(response => {
      const weight = difficultyWeights[response.difficultyID as keyof typeof difficultyWeights] || 1;
      totalWeight += weight;
      
      if (response.isCorrect === true) {
        earnedWeight += weight;
      }
    });

    return {
      totalWeight,
      earnedWeight,
      percentage: totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0
    };
  };

  const weightedScore = calculateWeightedScore();

  if (!isOpen) return null;

  return (
    <div className="test-results-modal-overlay" onClick={onClose}>
      <div className="test-results-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Test Results Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading test results...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadTestResponses} className="retry-button">
                Retry
              </button>
            </div>
          ) : (
            <div className="results-content">
              <div className="results-summary">
                <h3>Summary</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Total Questions:</span>
                    <span className="stat-value">{latestResponses.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Correct Answers:</span>
                    <span className="stat-value correct">
                      {latestResponses.filter(r => r.isCorrect === true).length}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Incorrect Answers:</span>
                    <span className="stat-value incorrect">
                      {latestResponses.filter(r => r.isCorrect === false).length}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Timed Out:</span>
                    <span className="stat-value timeout">
                      {latestResponses.filter(r => r.answerTimedOut).length}
                    </span>
                  </div>
                </div>
                
                <div className="weighted-score-section">
                  <h4>Weighted Score Calculation</h4>
                  <div className="weighted-score-info">
                    <p><strong>Scoring System:</strong></p>
                    <ul>
                      <li>Easy Questions: 1 point each</li>
                      <li>Medium Questions: 2 points each</li>
                      <li>Hard Questions: 3 points each</li>
                    </ul>
                  </div>
                  <div className="weighted-score-stats">
                    <div className="stat">
                      <span className="stat-label">Earned Points:</span>
                      <span className="stat-value correct">{weightedScore.earnedWeight}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Possible Points:</span>
                      <span className="stat-value">{weightedScore.totalWeight}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Weighted Score:</span>
                      <span className="stat-value correct">{weightedScore.percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="questions-section">
                <h3>Question Details</h3>
                <div className="questions-list">
                  {latestResponses.map((response, index) => (
                    <div key={`${response.questionID}-${index}`} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Question {index + 1}</span>
                        <div className={`question-status ${getStatusClass(response.isCorrect, response.answerTimedOut)}`}>
                          {getStatusIcon(response.isCorrect, response.answerTimedOut)}
                          <span>{getStatusText(response.isCorrect, response.answerTimedOut)}</span>
                        </div>
                      </div>
                      
                      <div className="question-content">
                        <div className="question-text">
                          <strong>Question:</strong>
                          <p>{response.questionText}</p>
                          <div className="difficulty-info">
                            <span className="difficulty-badge difficulty-${response.levelName.toLowerCase()}">
                              {response.levelName} (ID: {response.difficultyID})
                            </span>
                          </div>
                        </div>
                        
                        <div className="answer-details">
                          <div className="answer-text">
                            <strong>Your Answer:</strong>
                            <p className={response.answerText ? '' : 'no-answer'}>
                              {response.answerText || 'No answer provided'}
                            </p>
                          </div>
                          
                          <div className="response-meta">
                            <div className="meta-item">
                              <span className="meta-label">Time Taken:</span>
                              <span className="meta-value">{formatTime(response.timeTakenSeconds)}</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Answered At:</span>
                              <span className="meta-value">{formatDate(response.respondedAt)}</span>
                            </div>
                            {response.answerTimedOut && (
                              <div className="meta-item">
                                <span className="meta-label warning">⚠️ Question timed out</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultsModal;
