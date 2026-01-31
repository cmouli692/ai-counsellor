# Frontend Architecture - AI Counsellor MVP

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.js                                  │
│              (Auth Check, Route Protection, State)              │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐          ┌──────────┐          ┌──────────┐
   │  LOGIN  │          │Protected │          │ Context  │
   │  Page   │          │ Routes   │          │ Provider │
   └─────────┘          └──────────┘          └──────────┘
                              │
        ┌─────────┬───────────┼───────────┬─────────┐
        │         │           │           │         │
        ▼         ▼           ▼           ▼         ▼
    Onboarding Dashboard Universities Counsellor  (Fallback)
      (Stage 1) (All)       (Stage 2+)   (Stage 3+)
```

---

## 📁 Folder Structure

```
frontend/
│
├── src/
│   ├── App.jsx                          [Root component, routing, auth]
│   ├── index.jsx                        [Entry point]
│   │
│   ├── pages/                           [Page components (5 pages)]
│   │   ├── Login.jsx                    [Public: Auth form]
│   │   ├── Onboarding.jsx               [Stage 1: Profile setup]
│   │   ├── Dashboard.jsx                [All stages: Home]
│   │   ├── Universities.jsx             [Stage 2+: Browse & shortlist]
│   │   ├── Counsellor.jsx               [Stage 3+: AI chat & actions]
│   │   └── Fallback.jsx                 [Stage gate: "Complete X first"]
│   │
│   ├── components/                      [Reusable UI components]
│   │   ├── ProtectedRoute.jsx           [Route protection by stage]
│   │   ├── UniversityCard.jsx           [University list item]
│   │   ├── TaskCard.jsx                 [Task display]
│   │   ├── StageIndicator.jsx           [Show current stage]
│   │   ├── LoadingSpinner.jsx           [Loading state]
│   │   └── Alert.jsx                    [Error/success messages]
│   │
│   ├── services/                        [API calls]
│   │   ├── apiClient.js                 [Axios instance + JWT]
│   │   ├── authService.js               [Login/signup APIs]
│   │   ├── profileService.js            [Profile CRUD]
│   │   ├── universityService.js         [University APIs]
│   │   ├── shortlistService.js          [Shortlist APIs]
│   │   ├── lockService.js               [Lock APIs]
│   │   ├── stageService.js              [Get current stage]
│   │   └── counsellorService.js         [Counsellor chat API]
│   │
│   ├── hooks/                           [Custom React hooks]
│   │   ├── useAuth.js                   [Auth state + logout]
│   │   ├── useUser.js                   [User data + refresh]
│   │   └── useStage.js                  [Stage check + gating]
│   │
│   ├── context/                         [State management]
│   │   └── AuthContext.jsx              [User state provider]
│   │
│   ├── utils/                           [Utilities]
│   │   ├── token.js                     [JWT get/set/clear]
│   │   └── validators.js                [Form validation]
│   │
│   ├── styles/                          [Global styles]
│   │   └── globals.css                  [Tailwind + custom CSS]
│   │
│   └── config/
│       └── api.js                       [API base URL]
│
├── index.html                           [HTML entry]
├── vite.config.js
├── package.json
├── .env.example
├── tailwind.config.js                   [If using Tailwind]
└── .gitignore
```

---

## 🛣️ Route Structure

| Route | Page | Public | Stage | Auth | Purpose |
|-------|------|--------|-------|------|---------|
| `/login` | Login.jsx | ✅ | - | ❌ | Sign up / Login |
| `/onboarding` | Onboarding.jsx | ❌ | 1+ | ✅ | Complete profile |
| `/dashboard` | Dashboard.jsx | ❌ | 1+ | ✅ | Home: Show status |
| `/universities` | Universities.jsx | ❌ | 2+ | ✅ | Browse & shortlist |
| `/counsellor` | Counsellor.jsx | ❌ | 3+ | ✅ | AI chat interface |
| `/stage-gate` | Fallback.jsx | ❌ | Any | ✅ | "Complete X first" |
| `*` | - | - | - | - | Redirect to `/login` |

---

## 📊 API Calls by Page

### Login.jsx
```javascript
// POST /api/auth/signup
POST signup(email, password)
  → { success: true, token, user }

// POST /api/auth/login
POST login(email, password)
  → { success: true, token, user, stage }
```

### Onboarding.jsx
```javascript
// POST /api/profile (create)
POST createProfile(profileData)
  → { success: true, profile }

// PATCH /api/profile (update)
PATCH updateProfile(profileData)
  → { success: true, profile, stage }

// GET /api/stage
GET checkStage()
  → { stage_number, stage_name }
```

### Dashboard.jsx
```javascript
// GET /api/profile
GET getProfile()
  → { firstName, lastName, stage, targetCountries }

// GET /api/stage
GET checkStage()
  → { stage_number, stage_name, progress }

// GET /api/shortlist
GET getShortlist()
  → [{ id, name, country }, ...]

// GET /api/lock/:id (implicit - profile includes locked)
```

### Universities.jsx
```javascript
// GET /api/universities
GET listUniversities(filters?)
  → [{ id, name, country, program }, ...]

// POST /api/shortlist
POST addToShortlist(universityId)
  → { success: true, shortlistCount }

// DELETE /api/shortlist/:universityId
DELETE removeFromShortlist(universityId)
  → { success: true }

// POST /api/lock/:universityId
POST lockUniversity(universityId)
  → { success: true, locked: true, generatedTasks: [...] }
```

### Counsellor.jsx
```javascript
// GET /api/ai/counsellor/context
GET getCounsellorContext()
  → { profile, stage, shortlist, locked, tasks, stats }

// POST /api/ai/counsellor
POST sendMessage(message)
  → {
      success: true,
      counsellor: {
        message,
        recommended: { dream, target, safe },
        actions: [{ type, data, executed }],
        usedGemini: true/false
      },
      user: { stage, shortlist, locked, tasks }
    }
```

---

## 💾 Data Management Strategy

### localStorage (Persistent)
```javascript
// Only store minimal auth data
localStorage.setItem('token', jwtToken);
localStorage.setItem('userId', userIdUUID);

// Clear on logout
localStorage.clear();
```

### React State (Session)
```javascript
// In App.js or AuthContext
const [user, setUser] = useState(null);
const [stage, setStage] = useState(null);
const [authenticated, setAuthenticated] = useState(false);
const [loading, setLoading] = useState(true);

// Per-page state (in individual pages)
const [universities, setUniversities] = useState([]);
const [shortlist, setShortlist] = useState([]);
const [counsellorMessages, setCounsellorMessages] = useState([]);
```

### What NOT to Store
❌ User profile (fetch on mount)  
❌ Shortlist (fetch on mount)  
❌ Tasks (get from counsellor response)  
❌ Locked university (fetch on mount)  
❌ User password  

---

## 🔐 Auth & Stage Gating Logic

### Flow Diagram
```
User visits URL
    ↓
Check localStorage.token
    ├─ No token → Redirect to /login
    └─ Token exists → Verify (GET /api/stage)
        ↓
    Get current stage
        ├─ Stage 0 → Redirect to /onboarding
        ├─ Stage 1 → Allow /onboarding, /dashboard
        ├─ Stage 2 → Allow /universities, /dashboard
        ├─ Stage 3 → Allow /counsellor, /dashboard
        ├─ Stage 4 → Allow all (lock + counsellor completed)
        └─ Invalid token → Clear & redirect to /login
```

### Stage Definitions
| Stage | Name | Requirements | Unlocks |
|-------|------|--------------|---------|
| 0 | Unauthenticated | - | /login |
| 1 | Profile Pending | Email + password verified | /onboarding, /dashboard |
| 2 | Shortlisting | Profile completed | /universities, /dashboard |
| 3 | Application Ready | Locked university selected | /counsellor, /dashboard |
| 4 | Consulting | Counsellor used | All features |

### ProtectedRoute Component
```javascript
// pages/ProtectedRoute.jsx
export const ProtectedRoute = ({ children, requiredStage }) => {
  const { stage, authenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to="/login" />;
  if (stage < requiredStage) return <Navigate to="/stage-gate" />;

  return children;
};

// Usage in App.jsx
<Route
  path="/universities"
  element={
    <ProtectedRoute requiredStage={2}>
      <Universities />
    </ProtectedRoute>
  }
/>
```

---

## 📄 Page Responsibilities

### 1. Login.jsx
**Purpose:** Authentication entry point  
**Inputs:** Email, password  
**API Calls:** POST /api/auth/signup, POST /api/auth/login  
**Outputs:** JWT token → localStorage, redirect to /onboarding  
**State:** Form inputs, loading, error  
**UI:** Email input, password input, signup/login toggle, submit button  

```javascript
// Minimal UI
<form onSubmit={handleLogin}>
  <input type="email" value={email} onChange={...} />
  <input type="password" value={password} onChange={...} />
  <button>Login</button>
  {error && <Alert>{error}</Alert>}
</form>
```

---

### 2. Onboarding.jsx
**Purpose:** Complete user profile (Stage 1 requirement)  
**Inputs:** First name, last name, education, target countries, preferred fields  
**API Calls:** POST /api/profile, PATCH /api/profile  
**Outputs:** Profile saved, stage → 2, redirect to /universities  
**State:** Form data, loading, validation errors  
**UI:** Form fields, progress bar showing which fields to fill  

```javascript
// Key fields
<form>
  <input name="firstName" required />
  <input name="lastName" required />
  <select name="education">
    <option>High School</option>
    <option>Bachelor's</option>
    <option>Master's</option>
  </select>
  <input name="targetCountries" placeholder="USA, Canada" />
  <input name="preferredFields" placeholder="CS, Engineering" />
  <button type="submit">Complete Profile</button>
</form>
```

---

### 3. Dashboard.jsx
**Purpose:** Home page - show status at any stage  
**Inputs:** None  
**API Calls:** GET /api/profile, GET /api/stage, GET /api/shortlist  
**Outputs:** User sees their progress  
**State:** User data, shortlist, stage  
**UI:** 
- Stage progress card
- Shortlist count
- Locked university (if set)
- Next action hint
- Quick links to /universities or /counsellor

```javascript
// Simple cards
<StageCard stage={stage} />
<ShortlistCard count={shortlist.length} />
<LockedCard university={locked} />
<ButtonGroup>
  {stage >= 2 && <Button to="/universities">Browse</Button>}
  {stage >= 3 && <Button to="/counsellor">Chat</Button>}
</ButtonGroup>
```

---

### 4. Universities.jsx
**Purpose:** Browse universities, manage shortlist, lock university  
**Inputs:** Search, filters (country, program)  
**API Calls:**
  - GET /api/universities (on mount)
  - POST /api/shortlist (add)
  - DELETE /api/shortlist/:id (remove)
  - POST /api/lock/:id (lock)
**Outputs:** Shortlist updated, locked set, redirect to /counsellor  
**State:** Universities list, shortlist, filters, loading  
**UI:**
- Search + filter bar
- University cards with add/remove buttons
- Shortlist counter
- Lock button (when ready)

```javascript
// Simple list + actions
<div className="universities">
  <input placeholder="Search..." onChange={...} />
  
  {universities.map(uni => (
    <UniversityCard key={uni.id}>
      <h3>{uni.name}</h3>
      <p>{uni.country} • {uni.program}</p>
      <button onClick={() => toggleShortlist(uni.id)}>
        {shortlist.includes(uni.id) ? '✓ Shortlisted' : '+ Add'}
      </button>
    </UniversityCard>
  ))}
  
  {shortlist.length >= 1 && (
    <button onClick={() => lockUniversity()}>
      Lock & Continue ({shortlist.length} selected)
    </button>
  )}
</div>
```

---

### 5. Counsellor.jsx
**Purpose:** AI chat for university selection advice  
**Inputs:** User messages  
**API Calls:**
  - GET /api/ai/counsellor/context (on mount)
  - POST /api/ai/counsellor (send message)
**Outputs:** AI response, auto-executed actions, updated shortlist/locked/tasks  
**State:** Messages, loading, last counsellor response, recommended universities  
**UI:**
- Chat messages display
- Input field
- Show recommended universities (dream/target/safe)
- Show executed actions (✓ Added to shortlist, etc.)
- Show tasks generated

```javascript
// Chat interface
<div className="counsellor">
  <MessageList messages={messages} />
  
  {lastResponse && (
    <RecommendedUniversities data={lastResponse.recommended} />
  )}
  
  {lastResponse?.actions && (
    <ActionsList actions={lastResponse.actions} />
  )}
  
  <input
    placeholder="Ask for advice..."
    onKeyPress={e => e.key === 'Enter' && sendMessage()}
  />
</div>
```

---

### 6. Fallback.jsx (Stage Gate)
**Purpose:** Show when user tries to access restricted stage  
**Inputs:** None  
**API Calls:** None  
**Outputs:** Display message, link to correct page  
**State:** None  
**UI:** "Complete X to unlock Y" message + button to correct page  

```javascript
// Simple blocker
<div className="stage-gate">
  <h2>Not Ready Yet</h2>
  <p>Complete your profile to browse universities</p>
  <Button to={getNextPage()}>Go to Onboarding</Button>
</div>
```

---

## 🔄 Data Flow Summary

### Login Flow
```
User enters email/password
  ↓
POST /api/auth/login
  ↓
Save token to localStorage
  ↓
Fetch stage from /api/stage
  ↓
Set user state
  ↓
Redirect based on stage
```

### Onboarding Flow
```
User fills profile form
  ↓
POST /api/profile
  ↓
Fetch /api/stage → stage becomes 2
  ↓
Redirect to /universities
```

### Universities Flow
```
On mount: GET /api/universities
  ↓
User clicks "Add to shortlist" → POST /api/shortlist
  ↓
Update local shortlist state
  ↓
User clicks "Lock" → POST /api/lock/:id
  ↓
Tasks auto-generated on backend
  ↓
Fetch stage → stage becomes 3
  ↓
Redirect to /counsellor
```

### Counsellor Flow
```
On mount: GET /api/ai/counsellor/context
  ↓
User types message + hits send
  ↓
POST /api/ai/counsellor { message }
  ↓
Backend executes actions (shortlist, lock, tasks)
  ↓
Response includes updated user data
  ↓
Update local state
  ↓
Display message + recommended universities + executed actions
```

---

## 🎯 What to Skip (Not Needed for MVP)

❌ **Redux** - Just use React context + local state  
❌ **Form library** (Formik/React-Hook-Form) - Native HTML forms work  
❌ **Component library** (MUI/Chakra) - Plain HTML + Tailwind  
❌ **Testing** - Manual testing only for hackathon  
❌ **TypeScript** - Use JSX only  
❌ **State persistence** - Only JWT in localStorage  
❌ **Task UI** - Tasks just show in counsellor response  
❌ **Real-time updates** - Polling/WebSockets not needed  
❌ **Infinite scroll** - Simple pagination or GET all universities  
❌ **Advanced animations** - Keep it minimal  

---

## ⚡ Quick Implementation Checklist

```
Frontend Setup:
✅ npm create vite@latest frontend -- --template react
✅ npm install axios react-router-dom
✅ npm install -D tailwindcss postcss autoprefixer

Folder Structure:
✅ Create /pages, /components, /services, /hooks, /context, /utils

Core Files:
✅ App.jsx (routing + ProtectedRoute)
✅ AuthContext.jsx (user state)
✅ apiClient.js (axios with JWT)
✅ useAuth.js hook
✅ useStage.js hook

Services (8 files):
✅ authService.js
✅ profileService.js
✅ universityService.js
✅ shortlistService.js
✅ lockService.js
✅ stageService.js
✅ counsellorService.js
✅ apiClient.js

Components (6 files):
✅ ProtectedRoute.jsx
✅ UniversityCard.jsx
✅ TaskCard.jsx
✅ StageIndicator.jsx
✅ LoadingSpinner.jsx
✅ Alert.jsx

Pages (6 files):
✅ Login.jsx
✅ Onboarding.jsx
✅ Dashboard.jsx
✅ Universities.jsx
✅ Counsellor.jsx
✅ Fallback.jsx

Ready to Code:
✅ Total files: ~25 (services + hooks + context + components + pages)
✅ LOC estimate: 500-800 lines of UI code
✅ Time estimate: 4-6 hours for hackathon
```

---

## 🚀 Environment Setup

**.env.example**
```
VITE_API_URL=http://localhost:5000
```

**vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 📋 Submission Checklist

- [ ] Folder structure matches design
- [ ] 5 pages fully functional
- [ ] All stage gating working
- [ ] JWT auth persistent
- [ ] All API calls made correctly
- [ ] Error handling for failed API calls
- [ ] Loading states on buttons
- [ ] No console errors
- [ ] Mobile responsive (min-height for inputs)
- [ ] README with setup instructions

---

**Status: Ready to Code**  
**Complexity: Minimal (Hackathon)**  
**Architecture: Clean & Scalable**  

---

## 📞 Backend Integration Checklist

Verify these exist on backend:
```
✅ POST /api/auth/signup
✅ POST /api/auth/login
✅ POST /api/profile
✅ PATCH /api/profile
✅ GET /api/profile
✅ GET /api/stage
✅ GET /api/universities
✅ POST /api/shortlist
✅ DELETE /api/shortlist/:universityId
✅ GET /api/shortlist
✅ POST /api/lock/:universityId
✅ GET /api/ai/counsellor/context
✅ POST /api/ai/counsellor

All 14 APIs mapped to frontend pages ✅
```

