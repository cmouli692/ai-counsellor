# React Router v6 - Stage-Based Route Guards

## 📁 Folder Structure

```
frontend/src/
├── App.jsx                          [Main routing + Stage provider]
│
├── components/
│   ├── ProtectedRoute.jsx           [JWT check gate]
│   ├── OnboardingGate.jsx           [Profile completion check]
│   ├── LockGate.jsx                 [University lock check]
│   └── StageProvider.jsx            [Context + stage fetching]
│
├── context/
│   └── StageContext.jsx             [Stage state context]
│
├── pages/
│   ├── Login.jsx
│   ├── Onboarding.jsx
│   ├── Dashboard.jsx
│   ├── Universities.jsx
│   ├── Counsellor.jsx
│   ├── Applications.jsx
│   └── NotFound.jsx
│
├── api/
│   └── stageService.js              [Fetch stage from backend]
│
└── hooks/
    └── useStage.js                  [Access stage context]
```

---

## 🔒 1. src/context/StageContext.jsx

**Purpose:** Global stage state

```javascript
import { createContext } from 'react';

export const StageContext = createContext(null);
```

---

## 🎪 2. src/components/StageProvider.jsx

**Purpose:** Fetch stage data, provide context, expose refreshStage()

```javascript
import { useState, useEffect, useCallback } from 'react';
import { StageContext } from '../context/StageContext.jsx';
import { stageService } from '../api/stageService.js';

export const StageProvider = ({ children }) => {
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stage from backend
  const refreshStage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await stageService.getStage();

      if (result.success) {
        setStage({
          stageNumber: result.stage.stage_number || 0,
          stageName: result.stage.stage_name || '',
          profileCompleted: result.stage.profile_completed || false,
          shortlistCount: result.stage.shortlist_count || 0,
          lockedCount: result.stage.locked_count || 0,
        });
      } else {
        setError(result.error);
        setStage(null);
      }
    } catch (err) {
      setError(err.message);
      setStage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshStage();
    } else {
      setLoading(false);
    }
  }, [refreshStage]);

  const value = {
    stage,
    loading,
    error,
    refreshStage,
  };

  return (
    <StageContext.Provider value={value}>
      {children}
    </StageContext.Provider>
  );
};
```

---

## 🪝 3. src/hooks/useStage.js

**Purpose:** Access stage context in components

```javascript
import { useContext } from 'react';
import { StageContext } from '../context/StageContext.jsx';

export const useStage = () => {
  const context = useContext(StageContext);

  if (!context) {
    throw new Error('useStage must be used within StageProvider');
  }

  return context;
};
```

---

## 🔐 4. src/components/ProtectedRoute.jsx

**Purpose:** Check JWT token, block if not authenticated

```javascript
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## 📋 5. src/components/OnboardingGate.jsx

**Purpose:** Check profile completion, block if not done

```javascript
import { Navigate } from 'react-router-dom';
import { useStage } from '../hooks/useStage.js';

export const OnboardingGate = ({ children }) => {
  const { stage, loading } = useStage();

  if (loading) {
    return <div className="loading-gate">Loading...</div>;
  }

  // If profile not completed, redirect to onboarding
  if (!stage?.profileCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
```

---

## 🔒 6. src/components/LockGate.jsx

**Purpose:** Check university lock, block if none locked

```javascript
import { Navigate } from 'react-router-dom';
import { useStage } from '../hooks/useStage.js';

export const LockGate = ({ children }) => {
  const { stage, loading } = useStage();

  if (loading) {
    return <div className="loading-gate">Loading...</div>;
  }

  // If no university locked, redirect to universities
  if (!stage?.lockedCount || stage.lockedCount === 0) {
    return <Navigate to="/universities" replace />;
  }

  return children;
};
```

---

## 🛣️ 7. src/App.jsx

**Purpose:** Main routing with stage-based guards

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StageProvider } from './components/StageProvider.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { OnboardingGate } from './components/OnboardingGate.jsx';
import { LockGate } from './components/LockGate.jsx';

// Pages
import { Login } from './pages/Login.jsx';
import { Onboarding } from './pages/Onboarding.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Universities } from './pages/Universities.jsx';
import { Counsellor } from './pages/Counsellor.jsx';
import { Applications } from './pages/Applications.jsx';
import { NotFound } from './pages/NotFound.jsx';

export const App = () => {
  return (
    <Router>
      <StageProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Dashboard />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/universities"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Universities />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/counsellor"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <LockGate>
                    <Counsellor />
                  </LockGate>
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <LockGate>
                    <Applications />
                  </LockGate>
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          {/* CATCH ALL */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </StageProvider>
    </Router>
  );
};

export default App;
```

---

## 📄 8. Example Pages

### src/pages/Login.jsx

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService.js';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(email, password);

    if (result.success) {
      // JWT saved by authService, redirect to onboarding
      navigate('/onboarding');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};
```

---

### src/pages/Onboarding.jsx

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStage } from '../hooks/useStage.js';
import { profileService } from '../api/profileService.js';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { refreshStage } = useStage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    education: '',
    targetCountries: '',
    preferredFields: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await profileService.createProfile(formData);

    if (result.success) {
      // Refresh stage to update context
      await refreshStage();
      navigate('/universities');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="onboarding-page">
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <select
          name="education"
          value={formData.education}
          onChange={handleChange}
          required
        >
          <option value="">Select Education Level</option>
          <option value="high_school">High School</option>
          <option value="bachelors">Bachelor's Degree</option>
          <option value="masters">Master's Degree</option>
        </select>
        <input
          name="targetCountries"
          placeholder="Target Countries (comma-separated)"
          value={formData.targetCountries}
          onChange={handleChange}
        />
        <input
          name="preferredFields"
          placeholder="Preferred Fields (comma-separated)"
          value={formData.preferredFields}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};
```

---

### src/pages/Dashboard.jsx

```javascript
import { useNavigate } from 'react-router-dom';
import { useStage } from '../hooks/useStage.js';
import { authService } from '../api/authService.js';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { stage } = useStage();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      {stage && (
        <div className="stage-info">
          <p><strong>Stage:</strong> {stage.stageName}</p>
          <p><strong>Profile Completed:</strong> {stage.profileCompleted ? 'Yes' : 'No'}</p>
          <p><strong>Shortlisted Universities:</strong> {stage.shortlistCount}</p>
          <p><strong>Locked Universities:</strong> {stage.lockedCount}</p>
        </div>
      )}

      <div className="navigation">
        <button onClick={() => navigate('/universities')}>
          Browse Universities
        </button>
        {stage?.lockedCount > 0 && (
          <button onClick={() => navigate('/counsellor')}>
            Chat with Counsellor
          </button>
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};
```

---

### src/pages/Universities.jsx

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStage } from '../hooks/useStage.js';
import { universityService } from '../api/universityService.js';
import { shortlistService } from '../api/shortlistService.js';

export const Universities = () => {
  const navigate = useNavigate();
  const { refreshStage } = useStage();
  const [universities, setUniversities] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const uniResult = await universityService.getUniversities();
      if (uniResult.success) {
        setUniversities(uniResult.universities || []);
      } else {
        setError(uniResult.error);
      }

      const shortlistResult = await shortlistService.getShortlist();
      if (shortlistResult.success) {
        setShortlist(shortlistResult.shortlist || []);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const handleAddToShortlist = async (universityId) => {
    const result = await shortlistService.addToShortlist(universityId);
    if (result.success) {
      setShortlist([...shortlist, { id: universityId }]);
      await refreshStage();
    } else {
      setError(result.error);
    }
  };

  const handleRemoveFromShortlist = async (universityId) => {
    const result = await shortlistService.removeFromShortlist(universityId);
    if (result.success) {
      setShortlist(shortlist.filter(u => u.id !== universityId));
      await refreshStage();
    } else {
      setError(result.error);
    }
  };

  const handleLock = async (universityId) => {
    const result = await shortlistService.lockUniversity(universityId);
    if (result.success) {
      await refreshStage();
      navigate('/counsellor');
    } else {
      setError(result.error);
    }
  };

  if (loading) return <div>Loading universities...</div>;
  if (error) return <div className="error">{error}</div>;

  const shortlistIds = shortlist.map(u => u.id);

  return (
    <div className="universities-page">
      <h1>Universities</h1>

      <div className="universities-list">
        {universities.map(uni => (
          <div key={uni.id} className="university-card">
            <h3>{uni.name}</h3>
            <p>{uni.country}</p>
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
      </div>

      {shortlist.length > 0 && (
        <button
          className="lock-button"
          onClick={() => handleLock(shortlist[0].id)}
        >
          Lock University & Continue
        </button>
      )}
    </div>
  );
};
```

---

### src/pages/Counsellor.jsx

```javascript
import { useState, useEffect } from 'react';
import { useStage } from '../hooks/useStage.js';
import { counsellorService } from '../api/counsellorService.js';

export const Counsellor = () => {
  const { refreshStage } = useStage();
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

    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setLoading(true);

    const result = await counsellorService.sendMessage(input);

    if (result.success) {
      const { data } = result;
      setMessages(m => [
        ...m,
        {
          role: 'counsellor',
          text: data.counsellor.message,
          recommended: data.counsellor.recommended,
          actions: data.counsellor.actions,
        },
      ]);

      // Refresh stage after actions
      await refreshStage();
    }

    setLoading(false);
  };

  return (
    <div className="counsellor-page">
      <h1>AI Counsellor</h1>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
            {msg.recommended && (
              <div className="recommended">
                <h4>Recommended</h4>
                {msg.recommended.dream?.length > 0 && (
                  <div>
                    <h5>Dream</h5>
                    {msg.recommended.dream.map(u => (
                      <p key={u.id}>{u.name}</p>
                    ))}
                  </div>
                )}
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

### src/pages/Applications.jsx

```javascript
import { useStage } from '../hooks/useStage.js';

export const Applications = () => {
  const { stage } = useStage();

  return (
    <div className="applications-page">
      <h1>Applications</h1>
      <p>Locked University: {stage?.lockedCount > 0 ? 'Yes' : 'No'}</p>
      {/* Application tracking UI here */}
    </div>
  );
};
```

---

### src/pages/NotFound.jsx

```javascript
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  );
};
```

---

## 🔄 Stage Flow Diagram

```
User visits /
  ↓
Check token in localStorage
  ├─ No token → Redirect to /login
  └─ Has token → ProtectedRoute passes
    ↓
  Fetch /api/stage → StageProvider
    ↓
  Check profileCompleted (OnboardingGate)
  ├─ false → Redirect to /onboarding
  └─ true → Allow dashboard, universities
    ↓
  Check lockedCount (LockGate)
  ├─ 0 → Redirect to /universities
  └─ > 0 → Allow counsellor, applications
```

---

## 🧪 Testing Route Guards

### Test 1: Unauthenticated Access
```javascript
// Clear localStorage
localStorage.clear();

// Try to visit /dashboard
// Expected: Redirect to /login
```

### Test 2: Profile Not Completed
```javascript
// Token exists but profileCompleted = false
// Try to visit /universities
// Expected: Redirect to /onboarding
```

### Test 3: No University Locked
```javascript
// profileCompleted = true, lockedCount = 0
// Try to visit /counsellor
// Expected: Redirect to /universities
```

### Test 4: All Gates Passed
```javascript
// Token exists, profileCompleted = true, lockedCount > 0
// Visit /counsellor
// Expected: Page loads successfully
```

---

## 🎯 Route Guard Composition Pattern

```javascript
// Single gate
<Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

// Multiple gates (order matters)
<Route
  path="/counsellor"
  element={
    <ProtectedRoute>
      <OnboardingGate>
        <LockGate>
          <Counsellor />
        </LockGate>
      </OnboardingGate>
    </ProtectedRoute>
  }
/>

// Why this order?
// 1. ProtectedRoute → Check if logged in
// 2. OnboardingGate → Check if profile done
// 3. LockGate → Check if university locked
```

---

## 📋 Stage Data Structure

```javascript
// StageContext stores:
{
  stageNumber: 1,          // 1-4
  stageName: "Onboarding", // "Onboarding", "Shortlisting", etc.
  profileCompleted: false, // Boolean
  shortlistCount: 0,       // Int
  lockedCount: 0,          // Int
}
```

---

## ⚡ Key Features

✅ **No external auth library** - Just localStorage  
✅ **Single source of truth** - StageContext  
✅ **Automatic stage refresh** - After profile/lock updates  
✅ **Loading states on gates** - Show loader while fetching  
✅ **Simple composition** - Wrap routes with gates  
✅ **Copy-paste ready** - All code functional  
✅ **Hackathon simple** - ~200 LOC for all guards  

---

## ⚠️ Common Pitfalls (Avoid These)

❌ **Forgetting to call refreshStage()** after updates
```javascript
// ❌ WRONG
const handleLock = async (universityId) => {
  await shortlistService.lockUniversity(universityId);
  navigate('/counsellor'); // Stage not updated!
};

// ✅ CORRECT
const handleLock = async (universityId) => {
  await shortlistService.lockUniversity(universityId);
  await refreshStage(); // Update context
  navigate('/counsellor');
};
```

❌ **Using stage values before they load**
```javascript
// ❌ WRONG
const status = stage.profileCompleted ? 'Done' : 'Pending';

// ✅ CORRECT
const status = stage?.profileCompleted ? 'Done' : 'Pending';
```

❌ **Gates triggering infinite redirects**
```javascript
// ✅ Correct order
<ProtectedRoute>
  <OnboardingGate>
    <LockGate>
      <Page />
    </LockGate>
  </OnboardingGate>
</ProtectedRoute>

// ❌ WRONG - LockGate redirects to /universities which redirects back
```

---

## 🚀 Implementation Checklist

```
✅ Create StageContext.jsx (10 LOC)
✅ Create StageProvider.jsx (70 LOC)
✅ Create useStage.js hook (15 LOC)
✅ Create ProtectedRoute.jsx (20 LOC)
✅ Create OnboardingGate.jsx (25 LOC)
✅ Create LockGate.jsx (25 LOC)
✅ Create App.jsx with routes (100 LOC)
✅ Create example pages (300 LOC)

Total: ~565 LOC
Estimated time: 1-2 hours

Testing:
✅ Clear localStorage → redirects to /login
✅ Complete onboarding → stage refreshes
✅ Add to shortlist → stage refreshes
✅ Lock university → stage refreshes, redirects work
✅ All route guards working
```

---

## 📞 Integration with API Services

Make sure your services look like this:

**stageService.js**
```javascript
export const stageService = {
  getStage: async () => {
    try {
      const response = await axiosInstance.get('/stage');
      return { success: true, stage: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
```

**authService.js**
```javascript
export const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token } = response.data;
      if (token) localStorage.setItem('token', token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};
```

---

## 🎬 Complete Flow Example

```javascript
1. User visits app
   → No token → /login

2. User logs in
   → Token saved → ProtectedRoute passes
   → StageProvider fetches stage
   → profileCompleted = false
   → OnboardingGate redirects to /onboarding

3. User completes profile
   → calls refreshStage()
   → profileCompleted = true
   → Can now access /universities

4. User adds university to shortlist + locks
   → calls refreshStage()
   → lockedCount = 1
   → Can now access /counsellor

5. User visits /counsellor
   → All gates pass
   → Page loads
```

---

**Status: Copy-paste ready**  
**Complexity: Minimal**  
**Time: 30 minutes setup + testing**  
**Hackathon ready:** ✅

