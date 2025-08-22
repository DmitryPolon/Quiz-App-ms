import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './AssignQuizForm.css';

interface User {
  userID: number;
  username: string; // Changed from 'name' to match API response
  email: string;
  roleName: string; // Changed from 'roleId' to match API response
}

interface Quiz {
  quizID: number;
  quizName: string;
  description: string;
  timeLimitMinutes: number;
  totalQuestions: number;
}

interface AssignQuizFormProps {
  onBack: () => void;
  currentUser: { userID?: number; username?: string; email?: string; roleID?: number } | null;
}

const AssignQuizForm: React.FC<AssignQuizFormProps> = ({ onBack, currentUser }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<number | ''>('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Quiz pagination state
  const [currentQuizPage, setCurrentQuizPage] = useState(1);
  const [quizPageSize] = useState(10);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  
  // Quiz filter state
  const [quizSearchTerm, setQuizSearchTerm] = useState('');
  
  // User pagination state
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [userPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // User filter state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadQuizzes();
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentQuizPage(1); // Reset to first page when search term changes
  }, [quizSearchTerm]);

  useEffect(() => {
    loadQuizzes();
  }, [currentQuizPage, quizSearchTerm]);

  useEffect(() => {
    setCurrentUserPage(1); // Reset to first page when search term or role filter changes
  }, [userSearchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [currentUserPage, userSearchTerm, roleFilter]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuizHeadersPaginated(currentQuizPage, quizPageSize, quizSearchTerm);
      if (response.$values) {
        setQuizzes(response.$values);
        setTotalQuizzes(response.$values.length); // This might need adjustment based on actual API response
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setMessage({ type: 'error', text: 'Failed to load quizzes' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.$values) {
        let filteredUsers = response.$values.filter(user => 
          user.userID !== currentUser?.userID // Exclude current user only
        );

        // Apply search filter
        if (userSearchTerm) {
          filteredUsers = filteredUsers.filter(user =>
            user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
          );
        }

        // Apply role filter
        if (roleFilter !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.roleName.toLowerCase() === roleFilter.toLowerCase());
        }

        setTotalUsers(filteredUsers.length);
        
        // Apply pagination
        const startIndex = (currentUserPage - 1) * userPageSize;
        const endIndex = startIndex + userPageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.userID));
    }
  };

  const handleAssignQuiz = async () => {
    if (!selectedQuiz) {
      setMessage({ type: 'error', text: 'Please select a quiz' });
      return;
    }

    if (selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one user' });
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.assignQuizToUsers(selectedQuiz, selectedUsers);
      
      if (response.success) {
        setMessage({ type: 'success', text: `Quiz assigned to ${selectedUsers.length} user(s) successfully!` });
        setSelectedUsers([]);
        setSelectedQuiz('');
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to assign quiz' });
      }
    } catch (error) {
      console.error('Error assigning quiz:', error);
      setMessage({ type: 'error', text: 'Failed to assign quiz' });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => setMessage(null);

  const totalQuizPages = Math.ceil(totalQuizzes / quizPageSize);
  const totalUserPages = Math.ceil(totalUsers / userPageSize);

  const getRoleName = (roleName: string) => {
    return roleName || 'User';
  };

  const handlePromoteToAdmin = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to promote ${userName} to Admin?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.promoteUserToAdmin(userId);
      
      // Check if the response has a message (indicating success) or success property
      if (response.message || response.success) {
        setMessage({ 
          type: 'success', 
          text: response.message || `${userName} has been promoted to Admin successfully!` 
        });
        
        // Reload users to reflect the change
        loadUsers();
      } else {
        setMessage({ 
          type: 'error', 
          text: response.error || `Failed to promote ${userName} to Admin` 
        });
      }
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to promote ${userName} to Admin` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-quiz-container">
      <div className="assign-quiz-header">
        <h2>Assign Quiz To Users</h2>
        <p>Select a quiz and users to assign it to</p>
      </div>

      {message && (
        <div className={`message ${message.type}`} onClick={clearMessage}>
          <span>{message.text}</span>
          <button className="close-btn">&times;</button>
        </div>
      )}

      {/* Quiz Selection Section */}
      <div className="form-section">
        <div className="section-header">
          <h3>Select Quiz</h3>
          <div className="quiz-count">
            {selectedQuiz ? '1 quiz selected' : 'No quiz selected'}
          </div>
        </div>

        {/* Quiz Filters */}
        <div className="filters">
          <div className="search-filter">
            <label htmlFor="quiz-search-input">Search Quizzes:</label>
            <input
              id="quiz-search-input"
              type="text"
              placeholder="Search by quiz name or description..."
              value={quizSearchTerm}
              onChange={(e) => setQuizSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="quizzes-table-container">
          <table className="quizzes-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="radio"
                    name="quiz-selection"
                    checked={false}
                    onChange={() => {}}
                    disabled={true}
                    aria-label="Select all quizzes (disabled)"
                  />
                </th>
                <th>Quiz Name</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Time Limit</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr 
                  key={quiz.quizID} 
                  className={selectedQuiz === quiz.quizID ? 'selected' : ''}
                  onClick={() => setSelectedQuiz(quiz.quizID)}
                >
                  <td>
                    <input
                      type="radio"
                      name="quiz-selection"
                      checked={selectedQuiz === quiz.quizID}
                      onChange={() => setSelectedQuiz(quiz.quizID)}
                      disabled={loading}
                      aria-label={`Select quiz: ${quiz.quizName}`}
                    />
                  </td>
                  <td>{quiz.quizName}</td>
                  <td>{quiz.description}</td>
                  <td>{quiz.totalQuestions}</td>
                  <td>{quiz.timeLimitMinutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {quizzes.length === 0 && !loading && (
            <div className="no-quizzes">
              No quizzes found matching your criteria.
            </div>
          )}
        </div>

        {/* Quiz Pagination */}
        {totalQuizPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentQuizPage(prev => Math.max(1, prev - 1))}
              disabled={currentQuizPage === 1 || loading}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentQuizPage} of {totalQuizPages}
            </span>
            
            <button
              onClick={() => setCurrentQuizPage(prev => Math.min(totalQuizPages, prev + 1))}
              disabled={currentQuizPage === totalQuizPages || loading}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Users Selection Section */}
      <div className="form-section">
        <div className="section-header">
          <h3>Select Users</h3>
          <div className="user-count">
            {selectedUsers.length} of {totalUsers} users selected
          </div>
        </div>

        {/* User Filters */}
        <div className="filters">
          <div className="search-filter">
            <label htmlFor="user-search-input">Search Users:</label>
            <input
              id="user-search-input"
              type="text"
              placeholder="Search by name or email..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="role-filter">
            <label htmlFor="role-select">Role:</label>
            <select
              id="role-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="role-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    onChange={handleSelectAllUsers}
                    disabled={loading}
                    aria-label="Select all users"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userID}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.userID)}
                      onChange={() => handleUserToggle(user.userID)}
                      disabled={loading}
                      aria-label={`Select user: ${user.username}`}
                    />
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleName(user.roleName)}</td>
                  <td>
                    {user.roleName !== 'Admin' && (
                      <button
                        type="button"
                        onClick={() => handlePromoteToAdmin(user.userID, user.username)}
                        className="promote-btn"
                        disabled={loading}
                        title={`Promote ${user.username} to Admin`}
                        aria-label={`Promote ${user.username} to Admin`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && !loading && (
            <div className="no-users">
              No users found matching your criteria.
            </div>
          )}
        </div>

        {/* User Pagination */}
        {totalUserPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentUserPage(prev => Math.max(1, prev - 1))}
              disabled={currentUserPage === 1 || loading}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentUserPage} of {totalUserPages}
            </span>
            
            <button
              onClick={() => setCurrentUserPage(prev => Math.min(totalUserPages, prev + 1))}
              disabled={currentUserPage === totalUserPages || loading}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onBack}
          className="back-btn"
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleAssignQuiz}
          className="assign-btn"
          disabled={loading || !selectedQuiz || selectedUsers.length === 0}
        >
          {loading ? 'Assigning...' : `Assign Quiz to ${selectedUsers.length} User(s)`}
        </button>
      </div>
    </div>
  );
};

export default AssignQuizForm;
