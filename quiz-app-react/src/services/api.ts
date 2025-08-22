// API service for handling HTTP requests to the backend

const API_BASE_URL = '/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  user?: {
    userID?: number;
    username?: string;
    email?: string;
    roleID?: number;
    roleName?: string;
    createdAt?: string;
  };
  error?: string;
  // Allow for different response structures
  [key: string]: unknown;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export interface CreateUserResponse {
  username: string;
  email: string;
  roleId: number;
  userID?: number;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  categories?: string;
  createdBy: number;
  timeLimitMinutes: number;
}

export interface UpdateQuizRequest {
  title: string;
  description: string;
  categories?: string;
  timeLimitMinutes: number;
}

export interface CreateQuizResponse {
  success?: boolean;
  message?: string;
  quizId?: number;
  quizID?: number; // Add quizID with capital ID to match backend response
  error?: string;
}

export interface UpdateQuizResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface DeleteQuizResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface Category {
  categoryID: number;
  name: string;
}

export interface GetCategoriesResponse {
  success?: boolean;
  message?: string;
  categories?: Category[];
  error?: string;
}

export interface QuizOverviewRequest {
  page?: number;
  pageSize?: number;
  title?: string;
  createdBy?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuizOverviewResponse {
  success?: boolean;
  message?: string;
  quizzes?: Array<{
    quizID?: number;
    title?: string;
    description?: string;
    createdBy?: string;
    categories?: string | null;
    timeLimitMinutes?: number;
    createdAt?: string;
  }>;
  items?: Array<{
    quizID?: number;
    title?: string;
    description?: string;
    createdBy?: string;
    categories?: string | null;
    timeLimitMinutes?: number;
    createdAt?: string;
  }>;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface QuizDetailsResponse {
  success?: boolean;
  message?: string;
  quiz?: {
    quizID?: number;
    title?: string;
    description?: string;
    createdBy?: string;
    categories?: string | null;
    timeLimitMinutes?: number;
    createdAt?: string;
    questions?: Array<{
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
    }>;
  };
  error?: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  quizId: number;
  difficultyID: number;
  timeLimitSeconds: number;
}

export interface CreateQuestionResponse {
  success?: boolean;
  message?: string;
  questionID?: number;
  error?: string;
}

export interface UpdateQuestionRequest {
  questionText: string;
  quizId: number;
  difficultyID: number;
  timeLimitSeconds: number;
}

export interface UpdateQuestionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface DeleteQuestionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface CreateAnswerRequest {
  answerText: string;
  isCorrect: boolean;
}

export interface UpdateAnswerRequest {
  answerText: string;
  isCorrect: boolean;
}

export interface CreateAnswerResponse {
  success?: boolean;
  message?: string;
  answerID?: number;
  error?: string;
}

export interface UpdateAnswerResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface DeleteAnswerResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface SaveQuestionWithAnswersRequest {
  questionID?: number; // null/undefined for new questions, existing ID for updates
  sequenceId?: number; // Required by backend
  sequenceNum?: number; // Required by backend
  quizID: number;
  questionText: string;
  difficultyID?: number; // Numeric difficulty ID
  difficulty?: string; // String difficulty
  timeLimitSeconds: number;
  answers: Array<{
    answerID?: number; // null/undefined for new answers, existing ID for updates
    answerText: string;
    isCorrect: boolean;
  }>;
}

export interface SaveQuestionWithAnswersResponse {
  success?: boolean;
  message?: string;
  questionID?: number;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('API Request URL:', url);
      console.log('API Request Options:', defaultOptions);
      
      const response = await fetch(url, defaultOptions);
      
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      let responseData;
      try {
        const responseText = await response.text();
        console.log('API Response Text:', responseText);
        
        if (responseText.trim()) {
          responseData = JSON.parse(responseText);
        } else {
          console.log('Empty response body received');
          responseData = {};
        }
      } catch (jsonError) {
        console.log('Failed to parse JSON response, using empty object:', jsonError);
        responseData = {};
      }
      console.log('API Response Data:', responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `HTTP error! status: ${response.status}`;
        console.error('API Error Response:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Check if we got an empty response for a POST/PUT request
      if ((response.status === 200 || response.status === 201) && Object.keys(responseData).length === 0) {
        console.log('Empty response received for successful request, this might be normal for some endpoints');
      }

      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof Error) {
        // Check if it's a network error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to the server. Please check if the backend API is running at https://localhost:44334 or try using the proxy configuration.');
        }
        // Check if it's a CORS error
        if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
          throw new Error('CORS error: The backend server may not be configured to allow requests from this origin.');
        }
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/User/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/User/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    return this.makeRequest<CreateUserResponse>('/User/CreateUser', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createQuiz(quizData: CreateQuizRequest): Promise<CreateQuizResponse> {
    return this.makeRequest<CreateQuizResponse>('/QuizAdmin/CreateQuiz', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(quizId: number, quizData: UpdateQuizRequest): Promise<UpdateQuizResponse> {
    console.log('API Service - Update Quiz Request:', {
      quizId,
      quizData,
      url: `/QuizAdmin/UpdateQuiz/${quizId}`,
      body: JSON.stringify(quizData)
    });
    
    return this.makeRequest<UpdateQuizResponse>(`/QuizAdmin/UpdateQuiz/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(quizId: number): Promise<DeleteQuizResponse> {
    console.log('API Service - Delete Quiz Request:', {
      quizId,
      url: `/QuizAdmin/DeleteQuiz/${quizId}`
    });
    
    return this.makeRequest<DeleteQuizResponse>(`/QuizAdmin/DeleteQuiz/${quizId}`, {
      method: 'DELETE',
    });
  }

  async tagQuizWithCategory(quizId: number, categoryId: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    console.log('API Service - Tag Quiz With Category Request:', {
      quizId,
      categoryId
    });
    
    // Try different endpoint variations and methods
    const endpoints = [
      {
        url: `/QuizAdmin/TagQuizWithCategory/${quizId}/categories/${categoryId}`,
        method: 'POST',
        body: null
      },
      {
        url: `/QuizAdmin/TagQuizWithCategory/${quizId}/categories/${categoryId}`,
        method: 'PUT',
        body: null
      },
      {
        url: `/QuizAdmin/TagQuizWithCategory/${quizId}`,
        method: 'POST',
        body: JSON.stringify({ categoryId })
      },
      {
        url: `/QuizAdmin/TagQuizWithCategory/${quizId}`,
        method: 'PUT',
        body: JSON.stringify({ categoryId })
      }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint.method} ${endpoint.url}`);
        const options: RequestInit = {
          method: endpoint.method,
        };
        
        if (endpoint.body) {
          options.body = endpoint.body;
        }
        
        return await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(endpoint.url, options);
      } catch (error) {
        console.log(`Failed with ${endpoint.method} ${endpoint.url}:`, error);
        // Continue to next endpoint
      }
    }
    
    // If all attempts fail, throw the last error
    throw new Error('All tagging endpoint attempts failed');
  }

  async getCategories(): Promise<GetCategoriesResponse> {
    console.log('API Service - Get Categories Request');
    
    try {
      const response = await this.makeRequest<unknown>('/QuizAdmin/GetCategories', {
        method: 'GET',
      });
      console.log('API Service - Get Categories Response:', response);
      console.log('API Service - Response type:', typeof response);
      console.log('API Service - Is array:', Array.isArray(response));
      
      // Type guard to check if response is an object
      const responseObj = response as Record<string, unknown>;
      console.log('API Service - Response keys:', Object.keys(responseObj));
      
      // Return in expected format
      return {
        success: true,
        categories: Array.isArray(response) ? response : (responseObj.$values || responseObj.categories || responseObj.data || responseObj.items || []) as Category[]
      };
    } catch (error) {
      console.error('API Service - Get Categories Error:', error);
      throw error;
    }
  }

  async getQuizOverview(params: QuizOverviewRequest = {}): Promise<QuizOverviewResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.title) queryParams.append('title', params.title);
    if (params.createdBy) queryParams.append('createdBy', params.createdBy);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const endpoint = `/QuizAdmin/QuizOverview${queryString ? `?${queryString}` : ''}`;
    
    console.log('Quiz Overview API call:', {
      endpoint,
      params,
      queryString,
      fullUrl: `${API_BASE_URL}${endpoint}`
    });
    
    return this.makeRequest<QuizOverviewResponse>(endpoint, {
      method: 'GET',
    });
  }

  async getQuizById(quizId: number): Promise<QuizDetailsResponse> {
    console.log('API Service - Get Quiz By ID Request:', {
      quizId,
      url: `/QuizAdmin/GetQuizById/${quizId}`
    });
    
    const response = await this.makeRequest<QuizDetailsResponse>(`/QuizAdmin/GetQuizById/${quizId}`, {
      method: 'GET',
    });
    
    console.log('API Service - Get Quiz By ID Response:', response);
    console.log('API Service - Response type:', typeof response);
    console.log('API Service - Response keys:', Object.keys(response));
    
    return response;
  }

  async createQuestion(quizId: number, questionData: CreateQuestionRequest): Promise<CreateQuestionResponse> {
    console.log('API Service - Create Question Request:', {
      quizId,
      questionData,
      url: `/QuizAdmin/CreateQuestion/${quizId}/questions`
    });
    
    // Try the endpoint as specified
    try {
      const response = await this.makeRequest<CreateQuestionResponse>(`/QuizAdmin/CreateQuestion/${quizId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      console.log('API Service - Create Question Response:', response);
      return response;
    } catch (error) {
      console.log('First attempt failed, trying alternative endpoint...', error);
      
      // Try alternative endpoint format
      const response = await this.makeRequest<CreateQuestionResponse>(`/QuizAdmin/CreateQuestion/${quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      console.log('API Service - Create Question Response (alternative):', response);
      return response;
    }
  }

  async updateQuestion(questionId: number, questionData: UpdateQuestionRequest): Promise<UpdateQuestionResponse> {
    console.log('API Service - Update Question Request:', {
      questionId,
      questionData,
      url: `/QuizAdmin/UpdateQuestion/${questionId}`
    });
    
    const response = await this.makeRequest<UpdateQuestionResponse>(`/QuizAdmin/UpdateQuestion/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });
    
    console.log('API Service - Update Question Response:', response);
    
    return response;
  }

  async deleteQuestion(questionId: number): Promise<DeleteQuestionResponse> {
    console.log('API Service - Delete Question Request:', {
      questionId,
      url: `/QuizAdmin/DeleteQuestion/${questionId}`
    });
    
    const response = await this.makeRequest<DeleteQuestionResponse>(`/QuizAdmin/DeleteQuestion/${questionId}`, {
      method: 'DELETE',
    });
    
    console.log('API Service - Delete Question Response:', response);
    
    return response;
  }

  async createAnswer(questionId: number, answerData: CreateAnswerRequest): Promise<CreateAnswerResponse> {
    console.log('API Service - Create Answer Request:', {
      questionId,
      answerData,
      url: `/QuizAdmin/CreateAnswer/${questionId}/answers`
    });
    
    // Try the endpoint as specified
    try {
      const response = await this.makeRequest<CreateAnswerResponse>(`/QuizAdmin/CreateAnswer/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });
      
      console.log('API Service - Create Answer Response:', response);
      return response;
    } catch (error) {
      console.log('First attempt failed, trying alternative endpoint...', error);
      
      // Try alternative endpoint format
      const response = await this.makeRequest<CreateAnswerResponse>(`/QuizAdmin/CreateAnswer/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });
      
      console.log('API Service - Create Answer Response (alternative):', response);
      return response;
    }
  }

  async updateAnswer(answerId: number, answerData: UpdateAnswerRequest): Promise<UpdateAnswerResponse> {
    console.log('API Service - Update Answer Request:', {
      answerId,
      answerData,
      url: `/QuizAdmin/UpdateAnswer/${answerId}`
    });
    
    const response = await this.makeRequest<UpdateAnswerResponse>(`/QuizAdmin/UpdateAnswer/${answerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answerData),
    });
    
    console.log('API Service - Update Answer Response:', response);
    
    return response;
  }

  async deleteAnswer(answerId: number): Promise<DeleteAnswerResponse> {
    console.log('API Service - Delete Answer Request:', {
      answerId,
      url: `/QuizAdmin/DeleteAnswer/${answerId}`
    });
    
    const response = await this.makeRequest<DeleteAnswerResponse>(`/QuizAdmin/DeleteAnswer/${answerId}`, {
      method: 'DELETE',
    });
    
    console.log('API Service - Delete Answer Response:', response);
    
    return response;
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      console.log('Checking server health at:', `${API_BASE_URL}/health`);
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Server health check response:', response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  async swapQuestionSequence(questionId1: number, questionId2: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    try {
      console.log('API Service - Swap Question Sequence Request:', {
        questionId1,
        questionId2,
        url: `/QuizAdmin/SwapQuestionSequence`
      });
      
      const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
        `/QuizAdmin/SwapQuestionSequence`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId1,
            questionId2
          }),
        }
      );
      
      console.log('API Service - Swap Question Sequence Response:', response);
      return response;
    } catch (error) {
      console.error('Error swapping question sequence:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to swap question sequence'
      };
    }
  }

  async createQuestionSequence(sequenceNum: number, quizID: number, questionID: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    try {
      console.log('API Service - Create Question Sequence Request:', {
        sequenceNum,
        quizID,
        questionID,
        url: `/QuestionSequence/CreateSequence`
      });
      
      const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
        `/QuestionSequence/CreateSequence`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sequenceNum,
            quizID,
            questionID
          }),
        }
      );
      
      console.log('API Service - Create Question Sequence Response:', response);
      return response;
    } catch (error) {
      console.error('Error creating question sequence:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create question sequence'
      };
    }
  }

  async saveQuestionWithAnswers(request: SaveQuestionWithAnswersRequest): Promise<SaveQuestionWithAnswersResponse> {
    try {
      console.log('API Service - Save Question With Answers Request:', {
        request,
        url: `/QuizAdmin/SaveQuestionWithAnswers`
      });
      
      const response = await this.makeRequest<SaveQuestionWithAnswersResponse>(
        `/QuizAdmin/SaveQuestionWithAnswers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );
      
      console.log('API Service - Save Question With Answers Response:', response);
      return response;
    } catch (error) {
      console.error('Error saving question with answers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save question with answers'
      };
    }
  }

  // Update question sequence number
  async updateQuestionSequence(sequenceId: number, sequenceNum: number): Promise<{ success?: boolean; error?: string; message?: string }> {
    console.log('API Service - Update Question Sequence Request:', {
      sequenceId,
      sequenceNum,
      url: `/QuestionSequence/UpdateSequence?sequenceId=${sequenceId}&sequenceNum=${sequenceNum}`
    });
    
    const response = await this.makeRequest<{ success?: boolean; error?: string; message?: string }>(`/QuestionSequence/UpdateSequence?sequenceId=${sequenceId}&sequenceNum=${sequenceNum}`, {
      method: 'PUT',
    });
    
    return response;
  }

  // Get quiz header for test taking
  async getQuizHeader(quizId: number): Promise<{
    quizID: number;
    quizName: string;
    description: string;
    timeLimitMinutes: number;
    totalQuestions: number;
  }> {
    console.log('API Service - Get Quiz Header Request:', {
      quizId,
      url: `/Quiz/${quizId}/header`
    });
    
    const response = await this.makeRequest<{
      quizID: number;
      quizName: string;
      description: string;
      timeLimitMinutes: number;
      totalQuestions: number;
    }>(`/Quiz/${quizId}/header`, {
      method: 'GET',
    });
    
    return response;
  }

  // Get next question by sequence number
  async getNextQuestion(quizId: number, sequenceNum: number): Promise<{
    questionID: number;
    sequenceId: number;
    sequenceNum: number;
    quizID: number;
    questionText: string;
    difficultyID: number;
    difficulty: string | null;
    timeLimitSeconds: number;
    answers: {
      answerID: number;
      answerText: string;
      isCorrect: boolean;
    }[];
  }> {
    console.log('API Service - Get Next Question Request:', {
      quizId,
      sequenceNum,
      url: `/Quiz/NextQuestionSequence?quizId=${quizId}&sequenceNum=${sequenceNum}`
    });
    
    const response = await this.makeRequest<{
      questionID: number;
      sequenceId: number;
      sequenceNum: number;
      quizID: number;
      questionText: string;
      difficultyID: number;
      difficulty: string | null;
      timeLimitSeconds: number;
      answers: {
        answerID: number;
        answerText: string;
        isCorrect: boolean;
      }[];
    }>(`/Quiz/NextQuestionSequence?quizId=${quizId}&sequenceNum=${sequenceNum}`, {
      method: 'GET',
    });
    
    return response;
  }

  // Submit answer for a question
  async submitAnswer(userID: number, quizID: number, questionID: number, answerID: number, responseTimeSeconds: number, answerTimedOut: boolean = false, resultID?: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    console.log('API Service - Submit Answer Request:', {
      userID,
      quizID,
      questionID,
      answerID,
      responseTimeSeconds,
      answerTimedOut,
      resultID,
      url: `/Quiz/submit-answer`
    });
    
    const requestBody: {
      userID: number;
      quizID: number;
      questionID: number;
      answerID: number;
      responseTimeSeconds: number;
      answerTimedOut: boolean;
      resultID?: number;
    } = {
      userID,
      quizID,
      questionID,
      answerID,
      responseTimeSeconds,
      answerTimedOut
    };

    // Add resultID to request body if provided
    if (resultID !== undefined) {
      requestBody.resultID = resultID;
    }
    
    const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
      `/Quiz/submit-answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    console.log('API Service - Submit Answer Response:', response);
    return response;
  }



  // Start quiz for a user
  async startQuiz(resultId: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    console.log('API Service - Start Quiz Request:', {
      resultId,
      url: `/Quiz/StartQuiz/${resultId}`
    });
    
    const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
      `/Quiz/StartQuiz/${resultId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '', // Empty body as per the curl example
      }
    );
    
    console.log('API Service - Start Quiz Response:', response);
    return response;
  }

  // Submit quiz completion
  async submitQuiz(resultId: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    console.log('API Service - Submit Quiz Request:', {
      resultId,
      url: `/Quiz/submit-quiz/${resultId}`
    });
    
    const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
      `/Quiz/submit-quiz/${resultId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '', // Empty body since resultId is in the URL
      }
    );
    
    console.log('API Service - Submit Quiz Response:', response);
    return response;
  }

  // Get quiz results
  async getQuizResults(resultId: number, weightByDifficulty: boolean = true): Promise<{
    summary: {
      takenAt: string;
      score: number;
      numberOfQuestions: number;
      numberOfCorrectAnswers: number;
    };
    details: {
      $values: {
        questionText: string;
        isCorrect: boolean;
      }[];
    };
  }> {
    console.log('API Service - Get Quiz Results Request:', {
      resultId,
      weightByDifficulty,
      url: `/Quiz/ScoreResult?resultId=${resultId}&weightByDifficulty=${weightByDifficulty}`
    });
    
    const response = await this.makeRequest<{
      summary: {
        takenAt: string;
        score: number;
        numberOfQuestions: number;
        numberOfCorrectAnswers: number;
      };
      details: {
        $values: {
          questionText: string;
          isCorrect: boolean;
        }[];
      };
    }>(`/Quiz/ScoreResult?resultId=${resultId}&weightByDifficulty=${weightByDifficulty}`, {
      method: 'GET',
    });
    
    console.log('API Service - Get Quiz Results Response:', response);
    return response;
  }

  // Get all users for quiz assignment
  async getUsers(): Promise<{
    $values: {
      userID: number;
      username: string;
      email: string;
      roleName: string;
    }[];
  }> {
    console.log('API Service - Get Users Request');
    
    const response = await this.makeRequest<{
      $values: {
        userID: number;
        username: string;
        email: string;
        roleName: string;
      }[];
    }>('/User/GetUsers', {
      method: 'GET',
    });
    
    console.log('API Service - Get Users Response:', response);
    return response;
  }

  // Get quiz headers for assignment (paginated)
  async getQuizHeadersPaginated(page: number = 1, pageSize: number = 10, searchTerm?: string): Promise<{
    $values: {
      quizID: number;
      quizName: string;
      description: string;
      timeLimitMinutes: number;
      totalQuestions: number;
    }[];
  }> {
    console.log('API Service - Get Quiz Headers Paginated Request:', { page, pageSize, searchTerm });
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('pageSize', pageSize.toString());
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    
    const endpoint = `/Quiz/RetrievesQuizHeaders?${queryParams.toString()}`;
    
    try {
      const response = await this.makeRequest<{
        $values: {
          quizID: number;
          quizName: string;
          description: string;
          timeLimitMinutes: number;
          totalQuestions: number;
        }[];
      }>(endpoint, {
        method: 'GET',
      });
      
      console.log('API Service - Get Quiz Headers Paginated Response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get quiz headers paginated:', error);
      // Fallback to non-paginated version
      return this.getQuizHeaders();
    }
  }

 
  async getQuizHeaders(): Promise<{
    $values: {
      quizID: number;
      quizName: string;
      description: string;
      timeLimitMinutes: number;
      totalQuestions: number;
    }[];
  }> {
    console.log('API Service - Get Quiz Headers Request');
    
    // Try different possible endpoint names based on the SQL query
    const endpoints = [
      '/Quiz/GetQuizHeaders',
      '/Quiz/RetrievesQuizHeaders',
      '/Quiz/QuizHeaders',
      '/QuizAdmin/GetQuizHeaders',
      '/QuizAdmin/RetrievesQuizHeaders',
      '/QuizAdmin/QuizHeaders'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await this.makeRequest<{
          $values: {
            quizID: number;
            quizName: string;
            description: string;
            timeLimitMinutes: number;
            totalQuestions: number;
          }[];
        }>(endpoint, {
          method: 'GET',
        });
        
        console.log('API Service - Get Quiz Headers Response:', response);
        return response;
      } catch (error) {
        console.log(`Failed with endpoint ${endpoint}:`, error);
        // Continue to next endpoint
      }
    }
    
    // If all attempts fail, try using the quiz overview as fallback
    console.log('All quiz headers endpoints failed, trying quiz overview as fallback');
    try {
      const fallbackResponse = await this.getQuizOverview();
      console.log('API Service - Get Quiz Headers Fallback Response:', fallbackResponse);
      console.log('Fallback response type:', typeof fallbackResponse);
      console.log('Fallback response keys:', Object.keys(fallbackResponse));
      
      // Transform the quiz overview response to match the expected format
      const quizzes = fallbackResponse.quizzes || fallbackResponse.items || [];
      console.log('Quizzes extracted:', quizzes);
      console.log('Quizzes type:', typeof quizzes);
      console.log('Is quizzes array:', Array.isArray(quizzes));
      
      // Ensure quizzes is an array
      if (!Array.isArray(quizzes)) {
        console.log('Quizzes is not an array, returning empty array');
        return {
          $values: []
        };
      }
      
      return {
        $values: quizzes.map((quiz) => ({
          quizID: quiz.quizID || 0,
          quizName: quiz.title || '',
          description: quiz.description || '',
          timeLimitMinutes: quiz.timeLimitMinutes || 0,
          totalQuestions: 0 // This might not be available in overview
        }))
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw new Error('All quiz headers endpoint attempts failed');
    }
  }

  // Assign quiz to users
  async assignQuizToUsers(quizId: number, userIds: number[]): Promise<{ success?: boolean; message?: string; error?: string }> {
    console.log('API Service - Assign Quiz to Users Request:', {
      quizId,
      userIds,
      url: '/User/AssignQuizToUser'
    });
    
    // Assign quiz to each user individually
    const results = [];
    for (const userId of userIds) {
      try {
        const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
          '/User/AssignQuizToUser',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userId,
              quizID: quizId
            }),
          }
        );
        
        console.log(`API Service - Assign Quiz to User ${userId} Response:`, response);
        results.push({ userId, success: true, response });
      } catch (error) {
        console.error(`API Service - Assign Quiz to User ${userId} Error:`, error);
        results.push({ userId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    // Check if all assignments were successful
    const failedAssignments = results.filter(r => !r.success);
    const successfulAssignments = results.filter(r => r.success);
    
    if (failedAssignments.length === 0) {
      return {
        success: true,
        message: `Quiz successfully assigned to ${successfulAssignments.length} user(s)`
      };
    } else if (successfulAssignments.length === 0) {
      return {
        success: false,
        error: `Failed to assign quiz to any users. Errors: ${failedAssignments.map(f => f.error).join(', ')}`
      };
    } else {
      return {
        success: false,
        error: `Partially successful. Assigned to ${successfulAssignments.length} users, failed for ${failedAssignments.length} users. Errors: ${failedAssignments.map(f => f.error).join(', ')}`
      };
    }
  }

  // Get assigned quizzes for a user
  async getAssignedQuizzes(userId: number): Promise<{
    $values: {
      quizID: number;
      quizName: string;
      assignedDate: string;
      isCompleted: boolean;
    }[];
  }> {
    console.log('API Service - Get Assigned Quizzes Request:', {
      userId,
      url: `/Quiz/GetAssignedQuizzes/${userId}`
    });
    
    const response = await this.makeRequest<{
      $values: {
        quizID: number;
        quizName: string;
        assignedDate: string;
        isCompleted: boolean;
      }[];
    }>(`/Quiz/GetAssignedQuizzes/${userId}`, {
      method: 'GET',
    });
    
    console.log('API Service - Get Assigned Quizzes Response:', response);
    return response;
  }

  // Get quiz headers for a user (new endpoint)
  async getQuizHeadersUser(userId: number): Promise<{
    $values: {
      resultID?: number;
      quizID: number;
      title: string;
      description: string;
      createdBy: number;
      assignedOn: string | null;
      takenAt: string | null;
      score: number | null;
    }[];
  }> {
    console.log('API Service - Get Quiz Headers User Request:', {
      userId,
      url: `/Quiz/QuizHeadersuser/${userId}`
    });
    
    const response = await this.makeRequest<{
      $values: {
        quizID: number;
        title: string;
        description: string;
        createdBy: number;
        assignedOn: string | null;
        takenAt: string | null;
        score: number | null;
      }[];
    }>(`/Quiz/QuizHeadersuser/${userId}`, {
      method: 'GET',
    });
    
    console.log('API Service - Get Quiz Headers User Response:', response);
    return response;
  }

  // Promote user to admin
  async promoteUserToAdmin(userId: number): Promise<{ success?: boolean; message?: string; error?: string }> {
    console.log('API Service - Promote User to Admin Request:', {
      userId,
      url: `/User/promote-to-admin/${userId}`
    });
    
    const response = await this.makeRequest<{ success?: boolean; message?: string; error?: string }>(
      `/User/promote-to-admin/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '', // Empty body as per the curl example
      }
    );
    
    console.log('API Service - Promote User to Admin Response:', response);
    return response;
  }

  // Get test responses for a result
  async getTestResponses(resultId: number): Promise<{
    $values: {
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
    }[];
  }> {
    console.log('API Service - Get Test Responses Request:', {
      resultId,
      url: `/Quiz/Result/Responses/${resultId}`
    });
    
    const response = await this.makeRequest<{
      $values: {
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
      }[];
    }>(`/Quiz/Result/Responses/${resultId}`, {
      method: 'GET',
    });
    
    console.log('API Service - Get Test Responses Response:', response);
    return response;
  }
}

export { ApiService };
export const apiService = new ApiService();
export default apiService; 