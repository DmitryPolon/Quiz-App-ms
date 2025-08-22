import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import './ResultsScreen.css';

interface QuizSummary {
  takenAt: string;
  score: number;
  numberOfQuestions: number;
  numberOfCorrectAnswers: number;
}

interface QuestionDetail {
  questionText: string;
  isCorrect: boolean;
}

interface QuizResults {
  summary: QuizSummary;
  details: {
    $values: QuestionDetail[];
  };
}

interface ResultsScreenProps {
  resultId: number;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ resultId, onBack }) => {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = new ApiService();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await apiService.getQuizResults(resultId);
        setResults(response);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getScorePercentage = () => {
    if (!results?.summary) return 0;
    return Math.round((results.summary.numberOfCorrectAnswers / results.summary.numberOfQuestions) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#28a745'; // Green
    if (percentage >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const handleBackToHome = () => {
    onBack();
  };

  if (loading) {
    return (
      <div className="results-screen">
        <div className="loading-message">
          <p>Loading your quiz results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-screen">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleBackToHome} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-screen">
        <div className="error-message">
          <p>No results found</p>
          <button onClick={handleBackToHome} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = getScorePercentage();
  const scoreColor = getScoreColor(scorePercentage);

  return (
    <div className="results-screen">
      <div className="results-header">
        <h1>Quiz Results</h1>
        <button onClick={handleBackToHome} className="back-button">
          Back to Home
        </button>
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <h2>Test Summary</h2>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Score:</span>
              <span className="stat-value" style={{ color: scoreColor }}>
                {results.summary.score} / {results.summary.numberOfQuestions}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Percentage:</span>
              <span className="stat-value" style={{ color: scoreColor }}>
                {scorePercentage}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Answers:</span>
              <span className="stat-value">
                {results.summary.numberOfCorrectAnswers}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Questions:</span>
              <span className="stat-value">
                {results.summary.numberOfQuestions}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">
                {formatDate(results.summary.takenAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-details">
        <h2>Question Details</h2>
        <div className="questions-list">
          {results.details.$values.map((question, index) => (
            <div 
              key={index} 
              className={`question-item ${question.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className={`question-status ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                  {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              <div className="question-text">
                {question.questionText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
