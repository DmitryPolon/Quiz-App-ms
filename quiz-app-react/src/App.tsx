import { useState, useEffect } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'
import apiService, { type LoginRequest, type CreateUserRequest } from './services/api'
import CreateQuizForm from './components/CreateQuizForm'
import QuizOverview from './components/QuizOverview'
import ViewQuiz from './components/ViewQuiz'
import TestScreen from './components/TestScreen'
import ResultsScreen from './components/ResultsScreen'
import AssignQuizForm from './components/AssignQuizForm'
import UserDashboard from './components/UserDashboard'
import { type QuizData } from './types/quiz'

type Screen = 'login' | 'register' | 'quiz' | 'userDashboard' | 'createQuiz' | 'quizOverview' | 'viewQuiz' | 'editQuiz' | 'test' | 'results' | 'assignQuiz'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // If no user is saved, start with login screen
    const savedUser = localStorage.getItem('quizAppUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Navigate based on user role
        if (userData.roleID === 1) {
          return 'quiz'; // Admin goes to admin dashboard
        } else {
          return 'userDashboard'; // Regular users go to user dashboard
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('quizAppUser');
        return 'login';
      }
    }
    return 'login';
  })
  const [user, setUser] = useState<{ username: string; email: string; roleID?: number; userID?: number } | null>(() => {
    // Try to load user from localStorage on initial load
    const savedUser = localStorage.getItem('quizAppUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('quizAppUser');
      }
    }
    return null;
  })
  const [editingQuiz, setEditingQuiz] = useState<QuizData | null>(null)
  const [viewingQuiz, setViewingQuiz] = useState<QuizData | null>(null)
  const [testId, setTestId] = useState<number | null>(null)
  const [resultId, setResultId] = useState<number | null>(null)

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('quizAppUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('quizAppUser');
    }
  }, [user]);

  // Handle initial navigation based on user role when app loads
  useEffect(() => {
    if (user && (currentScreen === 'login' || !currentScreen)) {
      // Navigate based on user role
      if (user.roleID === 1) {
        setCurrentScreen('quiz'); // Admin goes to admin dashboard
      } else {
        setCurrentScreen('userDashboard'); // Regular users go to user dashboard
      }
    }
  }, [user, currentScreen]);

  // Prevent non-admin users from accessing admin screens
  useEffect(() => {
    if (user && user.roleID !== 1) {
      // If user is not admin and trying to access admin screens, redirect to userDashboard
      if (['quiz', 'createQuiz', 'quizOverview', 'viewQuiz', 'editQuiz', 'assignQuiz'].includes(currentScreen)) {
        setCurrentScreen('userDashboard');
      }
    }
  }, [user, currentScreen]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const credentials: LoginRequest = { username, password };
      const response = await apiService.login(credentials);
      
      console.log('Login response:', response);
      
              // Handle different possible response structures
        if (response.success || response.user || response.token) {
          const userName = String(response.user?.username || response.name || username || 'User');
          const userEmail = String(response.user?.email || response.email || '');
          const roleID = Number(response.user?.roleID || response.roleId || 2);
          const userID = response.user?.userID;
          console.log('Login response:', response);
          console.log('Extracted roleID:', roleID);
          console.log('User object:', response.user);
          console.log('User ID:', userID);
          setUser({ username: userName, email: userEmail, roleID, userID });
          // Navigate based on user role
          if (roleID === 1) {
            setCurrentScreen('quiz'); // Admin goes to admin dashboard
          } else {
            setCurrentScreen('userDashboard'); // Regular users go to user dashboard
          }
      } else {
        throw new Error(response.error || response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // You might want to show an error message to the user here
      throw error;
    }
  }

  const handleRegister = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Use the new CreateUser endpoint
      const createUserData: CreateUserRequest = {
        username: name,
        email: email,
        password: password,
        roleId: 2  // Always set RoleId to 2 for new users (regular users)
      };
      
      const response = await apiService.createUser(createUserData);
      
      // Handle the CreateUser response
      setUser({ 
        username: response.username, 
        email: response.email,
        roleID: response.roleId,
        userID: response.userID // Add userID if available in response
      });
      // New users are always regular users, so go to user dashboard
      setCurrentScreen('userDashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      // You might want to show an error message to the user here
      throw error;
    }
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentScreen('login')
  }

  const toggleAdmin = () => {
    if (user) {
      const newRoleID = user.roleID === 1 ? 2 : 1;
      setUser({ ...user, roleID: newRoleID });
      
      // Navigate based on new role
      if (newRoleID === 1) {
        setCurrentScreen('quiz'); // Admin dashboard
      } else {
        setCurrentScreen('userDashboard'); // User dashboard
      }
    }
  }

  const handleCreateQuiz = () => {
    setCurrentScreen('createQuiz')
  }

  const handleQuizOverview = () => {
    setCurrentScreen('quizOverview')
  }

  const handleAssignQuiz = () => {
    setCurrentScreen('assignQuiz')
  }

  const handleViewQuiz = (quizData: QuizData) => {
    console.log('Viewing quiz:', quizData)
    setViewingQuiz(quizData);
    setCurrentScreen('viewQuiz')
  }

  const handleEditQuiz = (quizData: QuizData) => {
    console.log('Editing quiz:', quizData)
    setEditingQuiz(quizData);
    setCurrentScreen('createQuiz')
  }

  const handleDeleteQuiz = (quizId: number) => {
    console.log('Deleting quiz:', quizId)
    // Delete functionality is now handled directly in QuizOverview component
  }

  const handleStartTest = (id: number, resultId?: number) => {
    setTestId(id);
    if (resultId) {
      setResultId(resultId);
    }
    setCurrentScreen('test');
  }

  const handleTestComplete = (id: number) => {
    setResultId(id);
    setCurrentScreen('results');
  }

  const renderScreen = () => {
    // Prevent non-admin users from accessing admin screens
    if (user && user.roleID !== 1) {
      if (['quiz', 'createQuiz', 'quizOverview', 'viewQuiz', 'editQuiz', 'assignQuiz'].includes(currentScreen)) {
        // Redirect to userDashboard if non-admin user tries to access admin screens
        return (
          <UserDashboard
            onBack={handleLogout}
            currentUser={user}
            onStartQuiz={handleStartTest}
            onViewResults={handleTestComplete}
            onToggleAdmin={toggleAdmin}
          />
        );
      }
    }

    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onRegisterClick={() => setCurrentScreen('register')}
          />
        )
      case 'register':
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onLoginClick={() => setCurrentScreen('login')}
          />
        )
      case 'userDashboard':
        return (
          <UserDashboard
            onBack={handleLogout}
            currentUser={user}
            onStartQuiz={handleStartTest}
            onViewResults={handleTestComplete}
            onToggleAdmin={toggleAdmin}
          />
        )
      case 'quiz':
        return (
          <div className="quiz-container">
            {user?.roleID === 1 && (
              <div className="admin-label">Admin</div>
            )}
            <div className="quiz-header">
              <h1>Welcome, {user?.username}!</h1>
              <p>You're now logged in to the Quiz App</p>
              <p>Debug - Role ID: {user?.roleID} (Admin: {user?.roleID === 1 ? 'Yes' : 'No'})</p>
              {user?.roleID === 1 && (
                <div className="admin-menu">
                  <button type="button" onClick={handleCreateQuiz} className="admin-menu-button">
                    Create Quiz
                  </button>
                  <button type="button" onClick={handleQuizOverview} className="admin-menu-button" style={{ marginLeft: '10px' }}>
                    Quiz Overview
                  </button>
                  <button type="button" onClick={handleAssignQuiz} className="admin-menu-button" style={{ marginLeft: '10px' }}>
                    Assign Quiz To Users
                  </button>
                  <button type="button" onClick={toggleAdmin} className="admin-menu-button" style={{ marginLeft: '10px' }}>
                    Toggle Admin Mode
                  </button>
                </div>
              )}
              <button type="button" onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
            <div className="quiz-content">
              <div className="welcome-message">
                <h2>Welcome to the Quiz App</h2>
                <p>Use the admin menu above to manage quizzes and assignments.</p>
              </div>
            </div>
          </div>
        )
      case 'createQuiz':
        return (
          <div className="quiz-container">
            <div className="admin-label">Admin</div>
            <div className="quiz-header">
              <h1>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h1>
              <p>{editingQuiz ? 'Edit the quiz details below' : 'Create a new quiz for users'}</p>
              <button type="button" onClick={() => {
                setEditingQuiz(null);
                setCurrentScreen('quizOverview');
              }} className="logout-button" style={{ marginRight: '10px' }}>
                Back to Quiz Overview
              </button>
              <button type="button" onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
            <CreateQuizForm 
              onBack={() => {
                setEditingQuiz(null);
                setCurrentScreen('quizOverview');
              }} 
              currentUser={user}
              editingQuiz={editingQuiz}
              isEditMode={!!editingQuiz}
            />
          </div>
        )
      case 'quizOverview':
        return (
          <div className="quiz-container">
            <div className="admin-label">Admin</div>
            <QuizOverview 
              onBack={() => setCurrentScreen('quiz')} 
              onCreateQuiz={() => setCurrentScreen('createQuiz')}
              onViewQuiz={handleViewQuiz}
              onEditQuiz={handleEditQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              currentUser={user} 
            />
          </div>
        )
      case 'viewQuiz':
        return (
          <div className="quiz-container">
            <div className="admin-label">Admin</div>
            {viewingQuiz && (
              <ViewQuiz 
                onBack={() => {
                  setViewingQuiz(null);
                  setCurrentScreen('quizOverview');
                }} 
                quiz={viewingQuiz}
              />
            )}
          </div>
        )
      case 'editQuiz':
        return (
          <div className="quiz-container">
            <div className="admin-label">Admin</div>
            <div className="quiz-header">
              <h1>Edit Quiz</h1>
              <p>Edit quiz details here</p>
              <button onClick={() => setCurrentScreen('quizOverview')} className="logout-button" style={{ marginRight: '10px' }}>
                Back to Overview
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        )
      case 'assignQuiz':
        return (
          <div className="quiz-container">
            <div className="admin-label">Admin</div>
            <AssignQuizForm 
              onBack={() => setCurrentScreen('quiz')} 
              currentUser={user}
            />
          </div>
        )
      case 'test':
        return (
          <div className="quiz-container">
            <TestScreen 
              testId={testId!}
              resultId={resultId || undefined}
              userID={user?.userID}
              onBack={() => {
                setTestId(null);
                setResultId(null);
                // Navigate back based on user role
                if (user?.roleID === 1) {
                  setCurrentScreen('quiz');
                } else {
                  setCurrentScreen('userDashboard');
                }
              }}
              onTestComplete={handleTestComplete}
            />
          </div>
        )
      case 'results':
        return (
          <div className="quiz-container">
            <ResultsScreen 
              resultId={resultId!}
              onBack={() => {
                setResultId(null);
                // Navigate back based on user role
                if (user?.roleID === 1) {
                  setCurrentScreen('quiz');
                } else {
                  setCurrentScreen('userDashboard');
                }
              }}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="App">
      {renderScreen()}
      {/* Debug info */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
        <div>Current Screen: {currentScreen}</div>
        <div>User: {user ? `${user.username} (${user.roleID})` : 'Not logged in'}</div>
        <div>Editing Quiz: {editingQuiz ? editingQuiz.quizID : 'None'}</div>
        <div>Viewing Quiz: {viewingQuiz ? viewingQuiz.quizID : 'None'}</div>
      </div>
    </div>
  )
}

export default App
