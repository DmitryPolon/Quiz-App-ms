import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './TestScreen.css';

interface QuizHeader {
  quizID: number;
  quizName: string;
  description: string;
  timeLimitMinutes: number;
  totalQuestions: number;
}

interface Answer {
  answerID: number;
  answerText: string;
  isCorrect: boolean;
}

interface QuestionData {
  questionID: number;
  sequenceId: number;
  sequenceNum: number;
  quizID: number;
  questionText: string;
  difficultyID: number;
  difficulty: string | null;
  timeLimitSeconds: number;
  answers: Answer[] | {
    $id: string;
    $values: Answer[];
  };
}

interface TestScreenProps {
  testId: number;
  resultId?: number; // Add resultId prop
  onBack: () => void;
  onTestComplete: (resultId: number) => void; // Add callback for test completion
  userID?: number; // Add userID prop for submitting answers
}

const TestScreen: React.FC<TestScreenProps> = ({ testId, resultId: initialResultId, onBack, onTestComplete, userID = 1 }) => {
  const [quizHeader, setQuizHeader] = useState<QuizHeader | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [currentSequenceNum, setCurrentSequenceNum] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testTimeRemaining, setTestTimeRemaining] = useState<number | null>(null);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [sequenceNum: number]: number[] }>({});
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [resultId] = useState<number | null>(initialResultId || null);

  // Fetch quiz header when component mounts
  useEffect(() => {
    const fetchQuizHeader = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the existing API service to avoid CORS issues
        const data = await apiService.getQuizHeader(testId);
        setQuizHeader(data);
        
        if (data.timeLimitMinutes) {
          setTestTimeRemaining(data.timeLimitMinutes * 60); // Convert to seconds
        }
      } catch (err) {
        console.error('Error fetching quiz header:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizHeader();
  }, [testId]);

  // Fetch current question when sequence number changes
  useEffect(() => {
    if (!testStarted || !quizHeader) return;

    const fetchCurrentQuestion = async () => {
      try {
        // Use the existing API service to avoid CORS issues
        const data = await apiService.getNextQuestion(testId, currentSequenceNum);
        console.log('Question data received:', data);
        console.log('Answers structure:', data.answers);
        console.log('Answers type:', typeof data.answers);
        console.log('Is answers array?', Array.isArray(data.answers));
        
        setCurrentQuestion(data);
        
        if (data.timeLimitSeconds && data.timeLimitSeconds > 0) {
          setQuestionTimeRemaining(data.timeLimitSeconds);
        } else {
          setQuestionTimeRemaining(null);
        }

        // Load previously answered answers for this question
        const previousAnswers = answeredQuestions[currentSequenceNum] || [];
        setSelectedAnswers(previousAnswers);
        
        // Set question start time for response time tracking
        setQuestionStartTime(Date.now());
      } catch (err) {
        console.error('Error fetching question:', err);
        setError(err instanceof Error ? err.message : 'Failed to load question');
      }
    };

    fetchCurrentQuestion();
  }, [testStarted, currentSequenceNum, testId, quizHeader, answeredQuestions]);

  // Test timer effect
  useEffect(() => {
    if (!testStarted || testTimeRemaining === null || testTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTestTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testTimeRemaining]);

  // Question timer effect
  useEffect(() => {
    if (!testStarted || questionTimeRemaining === null || questionTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleQuestionTimeout(); // Handle timeout with answer submission
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, questionTimeRemaining]);

  const handleStartTest = async () => {
    try {
      if (resultId) {
        // Call StartQuiz with the resultId
        await apiService.startQuiz(resultId);
        console.log('Quiz started successfully with resultId:', resultId);
      } else {
        console.log('Quiz started successfully (no resultId available)');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      // Continue with test start even if the API call fails
    }
    
    setTestStarted(true);
    setCurrentSequenceNum(1);
  };

  const handleQuestionTimeout = async () => {
    // Submit current answers if any are selected (even if user didn't select any, submit empty response)
    if (currentQuestion && questionStartTime) {
      const responseTimeSeconds = Math.round((Date.now() - questionStartTime) / 1000);
      
      try {
        if (selectedAnswers.length > 0) {
          // Submit each selected answer with timeout flag
          for (const answerID of selectedAnswers) {
            await apiService.submitAnswer(
              userID,
              testId,
              currentQuestion.questionID,
              answerID,
              responseTimeSeconds,
              true, // answerTimedOut = true
              resultId || undefined
            );
          }
        } else {
          // Submit a "no answer" response with timeout flag
          await apiService.submitAnswer(
            userID,
            testId,
            currentQuestion.questionID,
            0, // Indicates no answer selected
            responseTimeSeconds,
            true, // answerTimedOut = true
            resultId || undefined
          );
        }
      } catch (error) {
        console.error('Error submitting answer on timeout:', error);
        // Continue with navigation even if submission fails
      }
    }

    // Save current answers to local state
    if (selectedAnswers.length > 0) {
      setAnsweredQuestions(prev => ({
        ...prev,
        [currentSequenceNum]: selectedAnswers
      }));
    }

    // Advance to next question or end test
    if (currentSequenceNum < (quizHeader?.totalQuestions || 0)) {
      setCurrentSequenceNum(currentSequenceNum + 1);
      setSelectedAnswers([]);
    } else {
      // Reached the end, submit test
      handleSubmitTest();
    }
  };

  const handleAnswerSelect = (answerId: number, isMultipleChoice: boolean = false) => {
    setSelectedAnswers(prev => {
      if (isMultipleChoice) {
        // For multiple choice questions, toggle the answer
        return prev.includes(answerId)
          ? prev.filter(id => id !== answerId)
          : [...prev, answerId];
      } else {
        // For single choice questions, replace the answer
        return [answerId];
      }
    });
  };

  const handleNextQuestion = async () => {
    // Check if any answer is selected
    if (selectedAnswers.length === 0) {
      const proceed = window.confirm('⚠️ Warning: No answer selected!\n\nYou must select an answer before proceeding to the next question.\n\nDo you want to continue without answering this question?');
      if (!proceed) {
        return;
      }
    }

    // Submit current answers if any are selected
    if (selectedAnswers.length > 0 && currentQuestion && questionStartTime) {
      const responseTimeSeconds = Math.round((Date.now() - questionStartTime) / 1000);
      
      try {
        // Submit each selected answer
        for (const answerID of selectedAnswers) {
          await apiService.submitAnswer(
            userID,
            testId,
            currentQuestion.questionID,
            answerID,
            responseTimeSeconds,
            false, // answerTimedOut = false (manual submission)
            resultId || undefined
          );
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
        // Continue with navigation even if submission fails
      }
    }

    // Save current answers to local state
    if (selectedAnswers.length > 0) {
      setAnsweredQuestions(prev => ({
        ...prev,
        [currentSequenceNum]: selectedAnswers
      }));
    }

    if (currentSequenceNum < (quizHeader?.totalQuestions || 0)) {
      setCurrentSequenceNum(currentSequenceNum + 1);
      setSelectedAnswers([]);
    } else {
      // Reached the end, submit test
      handleSubmitTest();
    }
  };



  const handleSubmitTest = async () => {
    // Submit final answers if any are selected
    if (selectedAnswers.length > 0 && currentQuestion && questionStartTime) {
      const responseTimeSeconds = Math.round((Date.now() - questionStartTime) / 1000);
      
      try {
        // Submit each selected answer
        for (const answerID of selectedAnswers) {
          await apiService.submitAnswer(
            userID,
            testId,
            currentQuestion.questionID,
            answerID,
            responseTimeSeconds,
            false, // answerTimedOut = false (manual submission)
            resultId || undefined
          );
        }
      } catch (error) {
        console.error('Error submitting final answer:', error);
        // Continue with test completion even if submission fails
      }
    }

    // Save final answers to local state
    if (selectedAnswers.length > 0) {
      setAnsweredQuestions(prev => ({
        ...prev,
        [currentSequenceNum]: selectedAnswers
      }));
    }

    // Submit quiz completion to backend
    try {
      const submitResponse = await apiService.submitQuiz(resultId || 0);
      console.log('Quiz submitted successfully, response:', submitResponse);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Continue with test completion even if submission fails
    }

    // Use the resultId from the quiz session
    const finalResultId = resultId || 5; // Fallback to hardcoded value if needed
    console.log('Using resultId for results page:', finalResultId);

    // Navigate to results page
    console.log('Navigating to results page with resultId:', finalResultId);
    onTestComplete(finalResultId);
  };

  const handleExitTest = async () => {
    const confirmed = window.confirm('Are you sure you want to exit the test? Your progress will be lost.');
    if (confirmed) {
      // Submit quiz completion to backend even when exiting early
      try {
        await apiService.submitQuiz(resultId || 0);
        console.log('Quiz submitted successfully (early exit)');
      } catch (error) {
        console.error('Error submitting quiz (early exit):', error);
        // Continue with exit even if submission fails
      }
      
      // Reset test state
      setTestStarted(false);
      setCurrentSequenceNum(1);
      setSelectedAnswers([]);
      setAnsweredQuestions({});
      setTestTimeRemaining(null);
      setQuestionTimeRemaining(null);
      onBack();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>Loading Test...</h2>
        </div>
        <div className="loading-message">
          <p>Please wait while we load your test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>Error Loading Test</h2>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={onBack} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!quizHeader) {
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>Test Not Found</h2>
        </div>
        <div className="error-message">
          <p>The test you're looking for doesn't exist.</p>
          <button onClick={onBack} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>{quizHeader.quizName}</h2>
          <button onClick={onBack} className="back-button">
            Back to Home
          </button>
        </div>
        
        <div className="test-info">
          <div className="info-card">
            <h3>Test Information</h3>
            <p><strong>Description:</strong> {quizHeader.description}</p>
            <p><strong>Questions:</strong> {quizHeader.totalQuestions}</p>
            {quizHeader.timeLimitMinutes && (
              <p><strong>Time Limit:</strong> {quizHeader.timeLimitMinutes} minutes</p>
            )}
          </div>
          
          <div className="test-instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Read each question carefully</li>
              <li>Select the correct answer(s)</li>
              <li>You can navigate between questions using the Previous/Next buttons</li>
              <li>Submit your test when you're finished</li>
              {quizHeader.timeLimitMinutes && (
                <li>You have {quizHeader.timeLimitMinutes} minutes to complete the test</li>
              )}
              <li>Some questions may have individual time limits</li>
            </ul>
          </div>
          
          <button onClick={handleStartTest} className="start-test-button">
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>Loading Question...</h2>
        </div>
        <div className="loading-message">
          <p>Please wait while we load the question...</p>
        </div>
      </div>
    );
  }

  // Additional safety check for question data
  if (!currentQuestion.questionText) {
    return (
      <div className="test-screen">
        <div className="test-header">
          <h2>Question Error</h2>
        </div>
        <div className="error-message">
          <p>This question appears to be incomplete or corrupted.</p>
          <button onClick={onBack} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Handle the nested $values structure from the API
  const answers = Array.isArray(currentQuestion.answers) 
    ? currentQuestion.answers 
    : (currentQuestion.answers && '$values' in currentQuestion.answers && Array.isArray(currentQuestion.answers.$values))
      ? currentQuestion.answers.$values
      : [];
  
  // Safely check for multiple correct answers
  const hasMultipleCorrect = answers && answers.length > 0 
    ? answers.filter((a: Answer) => a && a.isCorrect).length > 1
    : false;

  return (
    <div className="test-screen">
      <div className="test-header">
        <h2>{quizHeader.quizName}</h2>
        <div className="test-progress">
          <span>Question {currentSequenceNum} of {quizHeader.totalQuestions}</span>
          {testTimeRemaining !== null && (
            <span className="timer test-timer">Test Time: {formatTime(testTimeRemaining)}</span>
          )}
        </div>
        <button onClick={handleExitTest} className="exit-test-button">
          Exit Test
        </button>
      </div>

      <div className="question-container">
        <div className="question-header">
          <h3>Question {currentSequenceNum}</h3>
          {questionTimeRemaining !== null && questionTimeRemaining > 0 && (
            <span className="timer question-timer">
              Question Time: {formatTime(questionTimeRemaining)}
            </span>
          )}
        </div>

        <div className="question-text">
          <p>{currentQuestion.questionText}</p>
        </div>

        <div className="answers-container">
          {answers && answers.length > 0 ? (
            answers.map((answer, answerIndex) => {
              if (!answer || !answer.answerID || !answer.answerText) {
                return null; // Skip invalid answers
              }
              
              const isSelected = selectedAnswers.includes(answer.answerID);
              
              return (
                <div
                  key={answer.answerID}
                  className={`answer-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(answer.answerID, hasMultipleCorrect)}
                >
                  <input
                    type={hasMultipleCorrect ? 'checkbox' : 'radio'}
                    checked={isSelected}
                    onChange={() => {}} // Handled by onClick
                    name={`question-${currentQuestion.questionID}`}
                    value={answer.answerID}
                    id={`answer-${currentQuestion.questionID}-${answer.answerID}`}
                    aria-label={`Answer ${String.fromCharCode(65 + answerIndex)}: ${answer.answerText}`}
                  />
                  <label htmlFor={`answer-${currentQuestion.questionID}-${answer.answerID}`}>
                    {String.fromCharCode(65 + answerIndex)}. {answer.answerText}
                  </label>
                </div>
              );
            }).filter(Boolean) // Remove null entries
          ) : (
            <div className="no-answers-message">
              <p>No answers available for this question.</p>
            </div>
          )}
        </div>

        <div className="question-navigation">
          <span className="question-counter">
            {currentSequenceNum} / {quizHeader.totalQuestions}
          </span>
          
          {currentSequenceNum === quizHeader.totalQuestions ? (
            <button onClick={handleSubmitTest} className="submit-button">
              Submit Test
            </button>
          ) : (
            <button onClick={handleNextQuestion} className="nav-button">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
