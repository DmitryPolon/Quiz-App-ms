import React, { useState, useEffect } from 'react';
import apiService, { type QuizDetailsResponse } from '../services/api';
import QuestionModal from './QuestionModal';
import './ViewQuiz.css';
import { type QuizData, type QuestionFormData, type AnswerOption } from '../types/quiz';

interface ViewQuizProps {
  quiz: QuizData;
  onBack: () => void;
}

const ViewQuiz: React.FC<ViewQuizProps> = ({ quiz, onBack }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [modalQuestionData, setModalQuestionData] = useState<QuestionFormData | null>(null);
  const [modalAnswerOptions, setModalAnswerOptions] = useState<AnswerOption[]>([]);

  // const [isQuestionFormEnabled, setIsQuestionFormEnabled] = useState(false);
  // const [isAnswerOptionsEnabled, setIsAnswerOptionsEnabled] = useState(false);

  // Shared function to clean quiz data
  const processQuizData = (rawQuizData: unknown): QuizData | null => {
    if (!rawQuizData) return null;

    const cleanData: QuizData = { ...rawQuizData as QuizData };

           // Handle categories - they might be in an object with $values structure
    if (cleanData.categories && typeof cleanData.categories === 'object' && cleanData.categories !== null) {
      if ('$values' in cleanData.categories && Array.isArray((cleanData.categories as { $values: unknown[] }).$values)) {
        const categoriesArray = (cleanData.categories as { $values: unknown[] }).$values;
               if (categoriesArray.length > 0 && typeof categoriesArray[0] === 'object' && categoriesArray[0] !== null && 'name' in (categoriesArray[0] as object)) {
          cleanData.categories = (categoriesArray[0] as { name: string }).name;
               }
             }
           }
           
           // Handle questions - they might be in an object with $values structure
    if (cleanData.questions) {
                           let questionsArray: Array<{
                questionID?: number;
        sequenceNum?: number | null;
        sequenceId?: number | null;
                questionText?: string;
                difficulty?: string;
                difficultyID?: number;
                timeLimitSeconds?: number;
                answers?: Array<{
                  answerID?: number;
                  answerText?: string;
                  isCorrect?: boolean;
                }>;
              }> = [];
             
      if (Array.isArray(cleanData.questions)) {
               // If it's already an array, filter out problematic items
        questionsArray = cleanData.questions.filter(question => 
                 typeof question === 'object' && 
                 question !== null && 
                 'questionID' in question &&
                 !('$values' in question) // Allow $id but not $values
               );
      } else if (typeof cleanData.questions === 'object' && cleanData.questions !== null) {
               // If it's an object, check if it has $values property
        if ('$values' in cleanData.questions && Array.isArray((cleanData.questions as { $values: unknown[] }).$values)) {
          questionsArray = (cleanData.questions as { $values: unknown[] }).$values.filter((question: unknown) => 
                   typeof question === 'object' && 
                   question !== null && 
                   question !== undefined &&
                   'questionID' in (question as object) &&
                   !('$values' in (question as object))
                 ) as typeof questionsArray;
               } else {
                 // Try to convert object to array
          const values = Object.values(cleanData.questions);
                 questionsArray = values.filter(item => 
                   typeof item === 'object' && 
                   item !== null && 
                   item !== undefined &&
                   'questionID' in (item as object) &&
                   !('$values' in (item as object))
                 ) as typeof questionsArray;
               }
             }
             
             // Clean answers array for each question and map difficulty
             questionsArray.forEach(question => {
        // Difficulty is now a string from the API, no mapping needed
        if (!question.difficulty && question.difficultyID) {
                 const difficultyMap: { [key: number]: string } = {
                   1: 'Easy',
                   2: 'Medium', 
                   3: 'Hard'
                 };
                 question.difficulty = difficultyMap[question.difficultyID] || 'Unknown';
               }
               
               if (question.answers) {
                 let answersArray: Array<{
                   answerID?: number;
                   answerText?: string;
                   isCorrect?: boolean;
                 }> = [];
                 
                 if (Array.isArray(question.answers)) {
                   answersArray = question.answers.filter(answer =>
                     typeof answer === 'object' &&
                     answer !== null &&
                     answer !== undefined &&
                     'answerID' in (answer as object) &&
                     !('$values' in (answer as object))
                   ) as typeof answersArray;
                 } else if (typeof question.answers === 'object' && question.answers !== null) {
                   // If answers is an object, check if it has $values property
                   if ('$values' in question.answers && Array.isArray((question.answers as { $values: unknown[] }).$values)) {
                     answersArray = (question.answers as { $values: unknown[] }).$values.filter((answer: unknown) =>
                       typeof answer === 'object' &&
                       answer !== null &&
                       answer !== undefined &&
                       'answerID' in (answer as object) &&
                       !('$values' in (answer as object))
                     ) as typeof answersArray;
                   } else {
                     // Try to convert object to array
                     const values = Object.values(question.answers);
                     answersArray = values.filter(item =>
                       typeof item === 'object' &&
                       item !== null &&
                       item !== undefined &&
                       'answerID' in (item as object) &&
                       !('$values' in (item as object))
                     ) as typeof answersArray;
                   }
                 }
                 
          // Remove duplicate answers using Set for better performance
          const seen = new Set<string>();
          const uniqueAnswers = answersArray.filter(answer => {
            const key = `${answer.answerID}-${answer.answerText}`;
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          });
          
          question.answers = uniqueAnswers;
        }
      });
      
      // Sort questions by sequenceNum to ensure proper order
      questionsArray.sort((a, b) => {
        const seqA = a.sequenceNum ?? Number.MAX_SAFE_INTEGER;
        const seqB = b.sequenceNum ?? Number.MAX_SAFE_INTEGER;
        return seqA - seqB;
      });
      
      cleanData.questions = questionsArray;
    }

    return cleanData;
  };

  // Fetch quiz data when component mounts or quiz ID changes
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quiz?.quizID) {
        setError('No quiz ID provided');
      return;
    }

      setLoading(true);
      setError(null);

      try {
        const response: QuizDetailsResponse = await apiService.getQuizById(quiz.quizID);
        
        // Reduced logging for better performance
        console.log('ViewQuiz - API response received');
        
        // Handle different possible response structures and clean the data
        let processedQuizData: QuizData | null = null;
        
        if (response.success && response.quiz) {
          processedQuizData = response.quiz;
        } else if (response.quiz) {
          // If quiz data exists but no success flag
          processedQuizData = response.quiz;
        } else if (response && typeof response === 'object' && !response.error) {
          // If the response itself might be the quiz data
          processedQuizData = response as QuizData;
      } else {
          // If API call fails, use the quiz data from props as fallback
          console.log('API call failed, using quiz data from props as fallback');
          processedQuizData = quiz;
        }

        // Clean the quiz data to remove problematic objects
        if (processedQuizData) {
          // Apply the shared cleaning function
          const cleanedData = processQuizData(processedQuizData);
          console.log('ViewQuiz - Quiz data processed successfully');
          setQuizData(cleanedData);
      } else {
          setQuizData(quiz);
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        // If API call fails, use the quiz data from props as fallback
        console.log('API call failed, using quiz data from props as fallback');
        setQuizData(quiz);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quiz?.quizID, quiz]);

  const refreshQuizData = async () => {
    if (quiz?.quizID) {
      console.log('refreshQuizData: Fetching quiz data for quiz ID:', quiz.quizID);
      const updatedResponse = await apiService.getQuizById(quiz.quizID);
      
      // Apply the same data cleaning logic as in the initial useEffect
      let updatedQuizData: QuizData | null = null;
      
      if (updatedResponse.success && updatedResponse.quiz) {
        updatedQuizData = updatedResponse.quiz;
        console.log('refreshQuizData: Using success.quiz path');
      } else if (updatedResponse.quiz) {
        updatedQuizData = updatedResponse.quiz;
        console.log('refreshQuizData: Using quiz path');
      } else if (updatedResponse && typeof updatedResponse === 'object' && !updatedResponse.error) {
        updatedQuizData = updatedResponse as QuizData;
        console.log('refreshQuizData: Using fallback path');
      }

      if (updatedQuizData) {
        // Clean the quiz data to remove problematic objects - using the shared function
        const cleanedData = processQuizData(updatedQuizData);
        if (cleanedData) {
          updatedQuizData = cleanedData;
        }

        setQuizData(updatedQuizData);
        console.log('refreshQuizData: Quiz data refreshed successfully');
                } else {
        console.log('refreshQuizData: No valid quiz data found in response');
      }
            } else {
      console.log('refreshQuizData: No quiz ID available');
    }
  };



  const handleDeleteQuestion = async (question: NonNullable<QuizData['questions']>[number]) => {
    try {
      if (!question.questionID) {
        alert('No question ID available');
        return;
      }

      const response = await apiService.deleteQuestion(question.questionID);
      
      if (response.success || !response.error) {
        // Refresh quiz data to show updated state
        await refreshQuizData();
        console.log('Question deleted successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete question. Please try again.');
    }
  };

  const handleEditQuestion = (question: NonNullable<QuizData['questions']>[number]) => {
    // Populate modal with existing question data
    setModalQuestionData({
      questionText: question.questionText || '',
      difficulty: question.difficultyID || 2, // Use difficultyID (numeric) instead of difficulty (string)
      timeLimitSeconds: question.timeLimitSeconds ?? 0
    });

    // Populate answer options with existing data
    if (question.answers && question.answers.length > 0) {
      const options = question.answers.map((answer, index) => ({
        id: answer.answerID ? `existing_${answer.answerID}` : (index + 1).toString(),
        text: answer.answerText || '',
        isCorrect: answer.isCorrect || false
      }));
      setModalAnswerOptions(options);
    } else {
      setModalAnswerOptions([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
      ]);
    }

    setIsEditMode(true);
    setEditingQuestionId(question.questionID || null);
    
    // Open modal
    setIsModalOpen(true);
  };

  const handleSaveQuestionWithAnswers = async (questionData: QuestionFormData, answerOptions: AnswerOption[]) => {
    try {
      if (!quiz?.quizID) {
        throw new Error('No quiz ID available');
      }

      // Convert difficulty string to ID
      // Convert numeric difficulty to string for SaveQuestionWithAnswers endpoint
      const difficultyString = questionData.difficulty === 1 ? 'Easy' : 
                              questionData.difficulty === 2 ? 'Medium' : 
                              questionData.difficulty === 3 ? 'Hard' : 'Medium';
      
      if (!questionData.difficulty || questionData.difficulty < 1 || questionData.difficulty > 3) {
        throw new Error(`Invalid difficulty value: ${questionData.difficulty}. Must be 1, 2, or 3.`);
      }

      // Validate required fields
      if (!questionData.questionText || questionData.questionText.trim() === '') {
        throw new Error('Question text is required');
      }

      if (questionData.timeLimitSeconds < 0) {
        throw new Error('Time limit cannot be negative');
      }

      if (!answerOptions || answerOptions.length === 0) {
        throw new Error('At least one answer option is required');
      }

      // Validate that at least one answer is marked as correct
      const hasCorrectAnswer = answerOptions.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        throw new Error('At least one answer must be marked as correct');
      }

      // Prepare the request payload to match the working curl format
      const request = {
        questionID: isEditMode && editingQuestionId ? editingQuestionId : undefined,
        sequenceId: 0, // Required by backend
        sequenceNum: 0, // Required by backend
        quizID: quiz.quizID,
        questionText: questionData.questionText,
        difficultyID: questionData.difficulty, // Numeric difficulty ID
        difficulty: difficultyString, // String difficulty
        timeLimitSeconds: questionData.timeLimitSeconds,
        answers: answerOptions.map(option => ({
          answerID: isEditMode && option.id.startsWith('existing_') ? 
            parseInt(option.id.replace('existing_', '')) : undefined,
          answerText: option.text,
          isCorrect: option.isCorrect
        }))
      };

      console.log('Saving question with answers:', request);
      console.log('Request details:', {
        questionID: request.questionID,
        sequenceId: request.sequenceId,
        sequenceNum: request.sequenceNum,
        quizID: request.quizID,
        questionText: request.questionText,
        difficultyID: request.difficultyID,
        difficulty: request.difficulty,
        timeLimitSeconds: request.timeLimitSeconds,
        answersCount: request.answers.length,
        answers: request.answers
      });

      // Use the request as is, with string difficulty field
      const requestWithCorrectField = request;

      const response = await apiService.saveQuestionWithAnswers(requestWithCorrectField);
        
      if (response.success || !response.error) {
        // If this is a new question (not edit mode), create sequence
        if (!isEditMode && response.questionID) {
          try {
            // Get the next sequence number (count of existing questions + 1)
            const nextSequenceNum = quizData?.questions?.length ? quizData.questions.length + 1 : 1;
            
            console.log('Creating sequence for new question:', {
              questionID: response.questionID,
              quizID: quiz.quizID,
              sequenceNum: nextSequenceNum
            });
            
            const sequenceResponse = await apiService.createQuestionSequence(
              nextSequenceNum,
              quiz.quizID,
              response.questionID
            );
            
            if (!sequenceResponse.success) {
              console.warn('Failed to create sequence for new question:', sequenceResponse.error);
            } else {
              console.log('Sequence created successfully for new question');
            }
          } catch (sequenceError) {
            console.error('Error creating sequence for new question:', sequenceError);
          }
        }
        
        // Refresh quiz data
        await refreshQuizData();
        console.log('Question and answers saved successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to save question with answers');
      }
    } catch (error) {
      console.error('Failed to save question with answers:', error);
      alert(error instanceof Error ? error.message : 'Failed to save. Please try again.');
      throw error;
    }
  };

  const resequenceAllQuestions = async () => {
    try {
      if (!quizData?.questions || quizData.questions.length === 0) {
        return;
      }

      // Create a sorted copy of questions by their current sequence numbers
      const sortedQuestions = [...quizData.questions].sort((a, b) => {
        const seqA = a.sequenceNum ?? Number.MAX_SAFE_INTEGER;
        const seqB = b.sequenceNum ?? Number.MAX_SAFE_INTEGER;
        return seqA - seqB;
      });

      // Update sequence numbers to be consecutive starting from 1
      const updatePromises = sortedQuestions.map((question, index) => {
        if (question.sequenceId && question.sequenceNum !== index + 1) {
          return apiService.updateQuestionSequence(question.sequenceId, index + 1);
        }
        return Promise.resolve({ success: true });
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(result => result.success || !('error' in result ? result.error : false));
      
      if (!allSuccessful) {
        console.warn('Some sequence updates may have failed');
      }
    } catch (error) {
      console.error('Error resequencing questions:', error);
    }
  };

  const handleMoveQuestionUp = async (question: NonNullable<QuizData['questions']>[number]) => {
    try {
      if (!quiz?.quizID || !question.questionID || !question.sequenceId) {
        alert('No quiz ID, question ID, or sequence ID available');
        return;
      }

      // Find current question index
      const currentIndex = quizData?.questions?.findIndex(q => q.questionID === question.questionID);
      if (currentIndex === undefined || currentIndex <= 0) {
        alert('Cannot move question up');
        return;
      }

      // Get the question above
      const questionAbove = quizData?.questions?.[currentIndex - 1];
      if (!questionAbove?.questionID || !questionAbove?.sequenceId) {
        alert('No question above to swap with');
        return;
      }

      // Calculate new sequence numbers
      const currentSeq = question.sequenceNum || 0;
      const aboveSeq = questionAbove.sequenceNum || 0;
      
      // Update both questions' sequence numbers
      const updateCurrent = apiService.updateQuestionSequence(question.sequenceId, aboveSeq);
      const updateAbove = apiService.updateQuestionSequence(questionAbove.sequenceId, currentSeq);
      
      // Wait for both updates to complete
      const [currentResponse, aboveResponse] = await Promise.all([updateCurrent, updateAbove]);
      
      if ((currentResponse.success || !currentResponse.error) && (aboveResponse.success || !aboveResponse.error)) {
        // Resequence all questions to ensure consecutive numbering
        await resequenceAllQuestions();
        alert('Question moved up successfully!');
            await refreshQuizData();
          } else {
        alert('Failed to move question: ' + (currentResponse.error || aboveResponse.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error moving question up:', error);
      alert('Error moving question. Please try again.');
    }
  };

  const handleMoveQuestionDown = async (question: NonNullable<QuizData['questions']>[number]) => {
    try {
      if (!quiz?.quizID || !question.questionID || !question.sequenceId) {
        alert('No quiz ID, question ID, or sequence ID available');
        return;
      }

      // Find current question index
      const currentIndex = quizData?.questions?.findIndex(q => q.questionID === question.questionID);
      if (currentIndex === undefined || currentIndex >= (quizData?.questions?.length || 0) - 1) {
        alert('Cannot move question down');
      return;
    }

      // Get the question below
      const questionBelow = quizData?.questions?.[currentIndex + 1];
      if (!questionBelow?.questionID || !questionBelow?.sequenceId) {
        alert('No question below to swap with');
      return;
    }

      // Calculate new sequence numbers
      const currentSeq = question.sequenceNum || 0;
      const belowSeq = questionBelow.sequenceNum || 0;
      
      // Update both questions' sequence numbers
      const updateCurrent = apiService.updateQuestionSequence(question.sequenceId, belowSeq);
      const updateBelow = apiService.updateQuestionSequence(questionBelow.sequenceId, currentSeq);
      
      // Wait for both updates to complete
      const [currentResponse, belowResponse] = await Promise.all([updateCurrent, updateBelow]);
      
      if ((currentResponse.success || !currentResponse.error) && (belowResponse.success || !belowResponse.error)) {
        // Resequence all questions to ensure consecutive numbering
        await resequenceAllQuestions();
        alert('Question moved down successfully!');
        await refreshQuizData();
      } else {
        alert('Failed to move question: ' + (currentResponse.error || belowResponse.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error moving question down:', error);
      alert('Error moving question. Please try again.');
    }
  };

  const handleSequenceNumberClick = async (question: NonNullable<QuizData['questions']>[number]) => {
    try {
      if (!question.sequenceId) {
        alert('No sequence ID available for this question');
        return;
      }

      const newSequenceNum = prompt(`Enter new sequence number for question "${question.questionText?.substring(0, 50)}..."`, 
        question.sequenceNum?.toString() || '1');
      
      if (newSequenceNum === null) {
        return; // User cancelled
      }

      const parsedNum = parseInt(newSequenceNum);
      if (isNaN(parsedNum) || parsedNum < 1) {
        alert('Please enter a valid positive number');
        return;
      }

      // Update the sequence number
      const response = await apiService.updateQuestionSequence(question.sequenceId, parsedNum);
      
      if (response.success || !response.error) {
        // Resequence all questions to ensure consecutive numbering
        await resequenceAllQuestions();
        alert('Sequence number updated successfully!');
        await refreshQuizData();
      } else {
        alert('Failed to update sequence number: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating sequence number:', error);
      alert('Error updating sequence number. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="view-quiz">
        <div className="header">
          <h2>Loading Quiz...</h2>
          <button type="button" onClick={onBack} className="secondary-button">
            Back to Quiz Overview
          </button>
        </div>
        <div className="loading-message">
          <p>Please wait while we fetch the quiz data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="view-quiz">
        <div className="header">
          <h2>Error Loading Quiz</h2>
          <button type="button" onClick={onBack} className="secondary-button">
            Back to Quiz Overview
          </button>
        </div>
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // No quiz data state
  if (!quizData) {
    return (
      <div className="view-quiz">
        <div className="header">
          <h2>Quiz Not Found</h2>
          <button type="button" onClick={onBack} className="secondary-button">
            Back to Quiz Overview
          </button>
        </div>
        <div className="error-message">
          <p>No quiz data available. Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-quiz">
                           <div className="header">
                     <h2>View Quiz: {typeof quizData.title === 'string' ? quizData.title : 'N/A'}</h2>
          <div className="header-buttons">
          <button type="button" onClick={onBack} className="secondary-button">
              Back to Quiz Overview
            </button>
          </div>
        </div>

             <div className="quiz-info">
         <div className="info-row">
           <div className="info-cell">
             <strong>Description:</strong>
             <span>{typeof quizData.description === 'string' ? quizData.description : 'N/A'}</span>
           </div>
           <div className="info-cell">
            <strong>Time Limit:</strong>
            <span>{typeof quizData.timeLimitMinutes === 'number' ? `${quizData.timeLimitMinutes} minutes` : 'N/A'}</span>
           </div>
           <div className="info-cell">
             <strong>Category:</strong>
             <span>{typeof quizData.categories === 'string' ? quizData.categories : 'N/A'}</span>
           </div>
         </div>
         <div className="info-row">
           <div className="info-cell">
            <strong>Created By:</strong>
            <span>{typeof quizData.createdBy === 'number' ? quizData.createdBy : 'N/A'}</span>
           </div>
           <div className="info-cell">
            <strong>Created At:</strong>
             <span>{typeof quizData.createdAt === 'string' ? new Date(quizData.createdAt).toLocaleDateString() : 'N/A'}</span>
           </div>
           <div className="info-cell">
            <strong>Questions:</strong>
            <span>{quizData.questions ? quizData.questions.length : 0}</span>
           </div>
         </div>
       </div>

                                                                                                               <div className="questions-grid-section">
           <div className="section-header">
             <h3>Existing Questions</h3>
             <button 
            type="button"
               onClick={() => {
                 setIsEditMode(false);
                 setEditingQuestionId(null);
                 setModalQuestionData({
                   questionText: '',
                   difficulty: 2, // Default to medium (2)
                timeLimitSeconds: 0
                 });
                 setModalAnswerOptions([
                   { id: '1', text: '', isCorrect: false },
                   { id: '2', text: '', isCorrect: false }
                 ]);
                 setIsModalOpen(true);
               }} 
               className="primary-button"
             >
               Add Question
             </button>
           </div>
          <div className="questions-grid">
            {quizData.questions && quizData.questions.length > 0 ? (
              <table>
                                 <thead>
                   <tr>
                  <th className="hidden-column">QuestionID</th>
                  <th className="seq-header">Seq</th>
                  <th>Question</th>
                  <th>Time Limit<br/>(Seconds)</th>
                     <th>Difficulty</th>
                  <th className="hidden-column">AnswerID</th>
                  <th>Answer</th>
                  <th>IsCorrect</th>
                                     <th></th>
                   </tr>
                 </thead>
                 <tbody>
                   {quizData.questions.map((question) => (
                     <React.Fragment key={question.questionID}>
                       {question.answers && question.answers.length > 0 ? (
                         // If question has answers, render them
                         question.answers.map((answer, answerIndex) => (
                        <tr key={`${question.questionID}-${answer.answerID}-${answerIndex}`} className={answerIndex === 0 ? '' : 'answer-row'}>
                          <td className="hidden-column">{typeof question.questionID === 'number' ? question.questionID : 'N/A'}</td>
                          <td className="sequence-column">
                             {answerIndex === 0 && (
                              <div className="sequence-container">
                                <button
                                  type="button"
                                  className="sequence-btn"
                                  title="Move Up"
                                  onClick={() => handleMoveQuestionUp(question)}
                                >
                                  ▲
                                </button>
                                <span 
                                  className="sequence-number"
                                  onClick={() => handleSequenceNumberClick(question)}
                                  title="Click to change sequence number"
                                  style={{ cursor: 'pointer' }}
                                >
                                  {question.sequenceNum !== null && question.sequenceNum !== undefined
                                    ? question.sequenceNum.toString().padStart(2, '0')
                                    : '00'
                                  }
                                </span>
                                <button
                                  type="button"
                                  className="sequence-btn"
                                  title="Move Down"
                                  onClick={() => handleMoveQuestionDown(question)}
                                >
                                  ▼
                                </button>
                              </div>
                            )}
                          </td>
                          <td>{answerIndex === 0 ? (typeof question.questionText === 'string' ? question.questionText : 'N/A') : ''}</td>
                          <td>{answerIndex === 0 ? (typeof question.timeLimitSeconds === 'number' ? question.timeLimitSeconds : 'N/A') : ''}</td>
                          <td>{answerIndex === 0 ? (question.difficultyID ? 
                            (question.difficultyID === 1 ? 'Easy' : question.difficultyID === 2 ? 'Medium' : 'Hard') : 
                            'N/A') : ''}</td>
                          <td className="hidden-column">{typeof answer.answerID === 'number' ? answer.answerID : 'N/A'}</td>
                             <td>{typeof answer.answerText === 'string' ? answer.answerText : 'N/A'}</td>
                             <td className={answer.isCorrect ? 'correct-answer' : 'incorrect-answer'}>
                               {answer.isCorrect ? '✓' : '✗'}
                             </td>
                             <td className="actions-cell">
                               {answerIndex === 0 && (
                                 <div className="question-actions">
                                   <button 
                                     type="button"
                                     className="edit-question-btn" 
                                     title="Edit Question" 
                                     onClick={() => handleEditQuestion(question)}
                                   >
                                     ✏️
                                   </button>
                                   <button 
                                     type="button"
                                     className="delete-question-btn" 
                                     title="Delete Question"
                                     onClick={() => handleDeleteQuestion(question)}
                                   >
                                     🗑️
                                   </button>
                                 </div>
                               )}
                             </td>
                           </tr>
                         ))
                       ) : (
                         // If question has no answers, render just the question row
                         <tr key={question.questionID}>
                        <td className="hidden-column">{typeof question.questionID === 'number' ? question.questionID : 'N/A'}</td>
                        <td className="sequence-column">
                          <div className="sequence-container">
                            <button
                              type="button"
                              className="sequence-btn"
                              title="Move Up"
                              onClick={() => handleMoveQuestionUp(question)}
                            >
                              ▲
                            </button>
                            <span 
                              className="sequence-number"
                              onClick={() => handleSequenceNumberClick(question)}
                              title="Click to change sequence number"
                              style={{ cursor: 'pointer' }}
                            >
                              {question.sequenceNum !== null && question.sequenceNum !== undefined
                                ? question.sequenceNum.toString().padStart(2, '0')
                                : '00'
                              }
                            </span>
                            <button
                              type="button"
                              className="sequence-btn"
                              title="Move Down"
                              onClick={() => handleMoveQuestionDown(question)}
                            >
                              ▼
                            </button>
                          </div>
                        </td>
                           <td>{typeof question.questionText === 'string' ? question.questionText : 'N/A'}</td>
                           <td>{typeof question.timeLimitSeconds === 'number' ? question.timeLimitSeconds : 'N/A'}</td>
                           <td>{question.difficultyID ? 
                             (question.difficultyID === 1 ? 'Easy' : question.difficultyID === 2 ? 'Medium' : 'Hard') : 
                             'N/A'}</td>
                        <td className="hidden-column">N/A</td>
                        <td>No answers</td>
                        <td>N/A</td>
                        <td className="actions-cell">
                          <div className="question-actions">
                            <button 
                              type="button"
                              className="edit-question-btn" 
                              title="Edit Question" 
                              onClick={() => handleEditQuestion(question)}
                            >
                              ✏️
                            </button>
                            <button 
                              type="button"
                              className="delete-question-btn" 
                              title="Delete Question"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                         </tr>
                       )}
                     </React.Fragment>
                   ))}
                 </tbody>
              </table>
            ) : (
              <div className="no-questions-message">
                <p>No questions found for this quiz.</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Modal */}
        <QuestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        onSaveQuestionWithAnswers={handleSaveQuestionWithAnswers}
          isEditMode={isEditMode}
          initialQuestionData={modalQuestionData || undefined}
          initialAnswerOptions={modalAnswerOptions}
        editingQuestionId={editingQuestionId || undefined}
        />
     </div>
   );
 };

export default ViewQuiz; 
