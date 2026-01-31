# Frontend API Layer - Minimal Implementation

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js                  [Axios instance + JWT + 401 handler]
│   │   ├── authService.js            [Login/signup]
│   │   ├── profileService.js         [Create/update profile]
│   │   ├── stageService.js           [Get stage]
│   │   ├── universityService.js      [Get universities]
│   │   ├── shortlistService.js       [Add/remove/lock]
│   │   └── counsellorService.js      [Chat + context]
│   │
│   ├── hooks/
│   │   ├── useAuth.js                [User state + logout]
│   │   ├── useApi.js                 [Wrapper for API calls]
│   │   └── useStage.js               [Stage check]
│   │
│   └── ...rest of app
```

---

## 🔌 1. src/api/axios.js

**Purpose:** Centralized axios instance with JWT + 401 handling

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      
      // Dispatch logout event for app to catch
      window.dispatchEvent(new CustomEvent('logout'));
      
      // Optional: Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 🔐 2. src/api/authService.js

**Purpose:** Authentication (signup, login)

```javascript
import axiosInstance from './axios.js';

export const authService = {
  // POST /auth/signup
  signup: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/signup', {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Store token
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
      }
      
      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Signup failed';
      return { success: false, error: message };
    }
  },

  // POST /auth/login
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Store token
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
      }
      
      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return { success: true };
  },
};
```

---

## 👤 3. src/api/profileService.js

**Purpose:** Profile CRUD (create, read, update)

```javascript
import axiosInstance from './axios.js';

export const profileService = {
  // POST /profile (create)
  createProfile: async (profileData) => {
    try {
      const response = await axiosInstance.post('/profile', profileData);
      return { success: true, profile: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Profile creation failed';
      return { success: false, error: message };
    }
  },

  // PATCH /profile (update)
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.patch('/profile', profileData);
      return { success: true, profile: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Profile update failed';
      return { success: false, error: message };
    }
  },

  // GET /profile (read)
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/profile');
      return { success: true, profile: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch profile';
      return { success: false, error: message };
    }
  },
};
```

---

## 📊 4. src/api/stageService.js

**Purpose:** Get current user stage

```javascript
import axiosInstance from './axios.js';

export const stageService = {
  // GET /stage
  getStage: async () => {
    try {
      const response = await axiosInstance.get('/stage');
      return { success: true, stage: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch stage';
      return { success: false, error: message };
    }
  },
};
```

---

## 🎓 5. src/api/universityService.js

**Purpose:** Browse universities

```javascript
import axiosInstance from './axios.js';

export const universityService = {
  // GET /universities (list all or filtered)
  getUniversities: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `/universities?${params}` : '/universities';
      const response = await axiosInstance.get(url);
      return { success: true, universities: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch universities';
      return { success: false, error: message };
    }
  },

  // GET /universities/:id (single university detail - optional for MVP)
  // SKIP: Not needed for MVP, can use university from list
};
```

---

## ⭐ 6. src/api/shortlistService.js

**Purpose:** Shortlist management + university lock

```javascript
import axiosInstance from './axios.js';

export const shortlistService = {
  // GET /shortlist
  getShortlist: async () => {
    try {
      const response = await axiosInstance.get('/shortlist');
      return { success: true, shortlist: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch shortlist';
      return { success: false, error: message };
    }
  },

  // POST /shortlist
  addToShortlist: async (universityId) => {
    try {
      const response = await axiosInstance.post('/shortlist', {
        universityId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to add to shortlist';
      return { success: false, error: message };
    }
  },

  // DELETE /shortlist/:universityId
  removeFromShortlist: async (universityId) => {
    try {
      const response = await axiosInstance.delete(`/shortlist/${universityId}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to remove from shortlist';
      return { success: false, error: message };
    }
  },

  // POST /lock/:universityId
  lockUniversity: async (universityId) => {
    try {
      const response = await axiosInstance.post(`/lock/${universityId}`);
      return { success: true, locked: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to lock university';
      return { success: false, error: message };
    }
  },
};
```

---

## 🤖 7. src/api/counsellorService.js

**Purpose:** AI counsellor chat + context

```javascript
import axiosInstance from './axios.js';

export const counsellorService = {
  // GET /ai/counsellor/context
  getContext: async () => {
    try {
      const response = await axiosInstance.get('/ai/counsellor/context');
      return { success: true, context: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch context';
      return { success: false, error: message };
    }
  },

  // POST /ai/counsellor
  sendMessage: async (message) => {
    try {
      const response = await axiosInstance.post('/ai/counsellor', {
        message,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to send message';
      return { success: false, error: message };
    }
  },
};
```

---

## 🎣 Custom Hooks (Optional but Recommended)

### src/hooks/useAuth.js
```javascript
import { useState, useCallback, useEffect } from 'react';
import { authService } from '../api/authService.js';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      setIsAuthenticated(true);
      // Optionally fetch user profile here
    }
    
    setLoading(false);
  }, []);

  // Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return result;
  }, []);

  const signup = useCallback(async (email, password) => {
    setLoading(true);
    const result = await authService.signup(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    loading,
    user,
    login,
    signup,
    logout,
  };
};
```

---

## 💡 Example Usage in Components

### Login Component
```javascript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

export const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};
```

---

### Universities Component
```javascript
import { useState, useEffect } from 'react';
import { universityService } from '../api/universityService.js';
import { shortlistService } from '../api/shortlistService.js';

export const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load universities and shortlist on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Get universities
      const uniResult = await universityService.getUniversities();
      if (uniResult.success) {
        setUniversities(uniResult.universities);
      } else {
        setError(uniResult.error);
      }

      // Get shortlist
      const shortlistResult = await shortlistService.getShortlist();
      if (shortlistResult.success) {
        setShortlist(shortlistResult.shortlist);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleAddToShortlist = async (universityId) => {
    const result = await shortlistService.addToShortlist(universityId);
    
    if (result.success) {
      // Update local state
      setShortlist([...shortlist, { id: universityId }]);
    } else {
      setError(result.error);
    }
  };

  const handleRemoveFromShortlist = async (universityId) => {
    const result = await shortlistService.removeFromShortlist(universityId);
    
    if (result.success) {
      setShortlist(shortlist.filter(u => u.id !== universityId));
    } else {
      setError(result.error);
    }
  };

  const handleLock = async (universityId) => {
    const result = await shortlistService.lockUniversity(universityId);
    
    if (result.success) {
      // Redirect to counsellor or show success
      window.location.href = '/counsellor';
    } else {
      setError(result.error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const shortlistIds = shortlist.map(u => u.id);

  return (
    <div className="universities">
      <h2>Universities</h2>
      
      {universities.map((uni) => (
        <div key={uni.id} className="university-card">
          <h3>{uni.name}</h3>
          <p>{uni.country} • {uni.program}</p>
          
          <button
            onClick={() =>
              shortlistIds.includes(uni.id)
                ? handleRemoveFromShortlist(uni.id)
                : handleAddToShortlist(uni.id)
            }
          >
            {shortlistIds.includes(uni.id) ? '✓ Shortlisted' : '+ Add'}
          </button>
        </div>
      ))}

      {shortlist.length > 0 && (
        <button onClick={() => handleLock(shortlist[0].id)}>
          Lock & Continue
        </button>
      )}
    </div>
  );
};
```

---

### Counsellor Component
```javascript
import { useState, useEffect } from 'react';
import { counsellorService } from '../api/counsellorService.js';

export const Counsellor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);

  // Load context on mount
  useEffect(() => {
    const loadContext = async () => {
      const result = await counsellorService.getContext();
      if (result.success) {
        setContext(result.context);
      }
    };

    loadContext();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message to UI
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setLoading(true);

    // Send to counsellor
    const result = await counsellorService.sendMessage(input);

    if (result.success) {
      const { data } = result;
      
      // Add AI response to UI
      setMessages(m => [
        ...m,
        {
          role: 'counsellor',
          text: data.counsellor.message,
          recommended: data.counsellor.recommended,
          actions: data.counsellor.actions,
        },
      ]);

      // Update context with fresh data
      if (data.user) {
        setContext(data.user);
      }
    }

    setLoading(false);
  };

  return (
    <div className="counsellor">
      <h2>AI Counsellor</h2>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
            
            {msg.recommended && (
              <div className="recommended">
                <h4>Recommended Universities</h4>
                <div className="dream">
                  <h5>Dream</h5>
                  {msg.recommended.dream?.map(u => (
                    <p key={u.id}>{u.name}</p>
                  ))}
                </div>
                <div className="target">
                  <h5>Target</h5>
                  {msg.recommended.target?.map(u => (
                    <p key={u.id}>{u.name}</p>
                  ))}
                </div>
              </div>
            )}

            {msg.actions && (
              <div className="actions">
                <h5>Executed Actions</h5>
                {msg.actions.map((action, j) => (
                  <p key={j}>
                    {action.executed ? '✓' : '✗'} {action.type}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for advice..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
```

---

## .env Setup

**.env.example**
```
VITE_API_URL=http://localhost:5000/api
```

**.env** (local development)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 What's Skipped (Unnecessary for MVP)

❌ **stageService.getStageHistory()** - Only need current stage  
❌ **universityService.getUniversityById()** - University data comes from list  
❌ **universityService.searchUniversities()** - Client-side filtering good enough  
❌ **shortlistService.bulkAdd()** - Not needed for MVP  
❌ **counsellorService.getCounsellorHistory()** - Not needed for hackathon  
❌ **Error boundaries** - Keep it simple  
❌ **Retry logic** - Just show error and let user retry  
❌ **Caching** - Fetch fresh data always  
❌ **Request deduplication** - Not needed for MVP  
❌ **Rate limiting** - Not needed for hackathon  

---

## 📋 Minimal Service File Template

```javascript
import axiosInstance from './axios.js';

export const myService = {
  // GET /endpoint
  fetchData: async () => {
    try {
      const response = await axiosInstance.get('/endpoint');
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch data';
      return { success: false, error: message };
    }
  },

  // POST /endpoint
  createData: async (payload) => {
    try {
      const response = await axiosInstance.post('/endpoint', payload);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to create data';
      return { success: false, error: message };
    }
  },
};
```

---

## ✅ Implementation Checklist

```
API Layer Setup:
✅ npm install axios react-router-dom

API Files (7):
✅ src/api/axios.js
✅ src/api/authService.js
✅ src/api/profileService.js
✅ src/api/stageService.js
✅ src/api/universityService.js
✅ src/api/shortlistService.js
✅ src/api/counsellorService.js

Hooks (1):
✅ src/hooks/useAuth.js

Setup:
✅ .env with VITE_API_URL
✅ Backend running on :5000

Testing:
✅ Login → token saved to localStorage
✅ 401 response → token cleared + redirect
✅ Each service method returns { success, data/error }
✅ Components only call service methods (no direct axios)

Ready to Build:
✅ No try/catch in components
✅ All errors handled in services
✅ JWT auto-attached to requests
✅ Auto-logout on 401
✅ Simple error message display in UI
```

---

## 🚀 Next Steps

1. Create the 7 API files in `src/api/`
2. Create `src/hooks/useAuth.js`
3. Create `.env` with `VITE_API_URL`
4. Create pages using the example components above
5. Wire up React Router with pages
6. Test login → should save token and redirect
7. Test API calls → should attach JWT automatically
8. Test 401 → should clear token and redirect to login

---

**Status:** Copy-paste ready  
**Complexity:** Minimal (300 LOC total)  
**Time to implement:** 30 minutes  

