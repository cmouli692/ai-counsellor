# AI Counsellor Hackathon - MVP Checklist

**Project Stage:** Submission-Ready MVP  
**Date:** January 26, 2026  
**Status:** Pre-Implementation

---

## 🎯 Locked User Flow (Strict Sequence)

```
Landing Page 
    ↓
Auth (Login/Sign-up)
    ↓
Onboarding (Student Profile)
    ↓
Dashboard (Hub)
    ↓
AI Counsellor (Conversation)
    ↓
University Discovery/Shortlist (Browse & Select)
    ↓
University Lock (Confirm Final List)
    ↓
Applications + Tasks (Submit & Track)
```

**NO SKIPPING STAGES.** Navigation must follow this exact sequence.

---

## 📋 Stage-by-Stage Checklist

### 1️⃣ LANDING PAGE
**Must Work:**
- [ ] Clean, professional landing page with app title & one-liner description
- [ ] "Get Started" button that routes to Auth
- [ ] Mobile responsive design

**Can Be Placeholder:**
- [ ] Detailed feature descriptions
- [ ] Animations/hero video
- [ ] FAQ section

---

### 2️⃣ AUTH (Login/Sign-up)
**Must Work:**
- [ ] Sign-up form (email + password minimum)
- [ ] Login form (email + password)
- [ ] Basic validation (email format, password length ≥6 chars)
- [ ] Session persistence (localStorage or JWT)
- [ ] Redirect authenticated users away from auth page
- [ ] Error messages for failed login/duplicate signup

**Can Be Placeholder:**
- [ ] OAuth (Google/Microsoft)
- [ ] Email verification
- [ ] Password reset
- [ ] Social login

---

### 3️⃣ ONBOARDING (Student Profile)
**Must Work:**
- [ ] Form with required fields:
  - Full name
  - Grade/Year (e.g., 10th, 11th, 12th, Undergrad)
  - Stream (Science/Commerce/Arts)
  - Interests (multi-select: min 2, max 5)
  - Career aspirations (free text)
- [ ] Form validation (no empty required fields)
- [ ] Save profile to backend
- [ ] One-time flow (redirect to dashboard if profile exists)
- [ ] Progress indicator (Step 1/3 style optional)

**Can Be Placeholder:**
- [ ] Profile photo upload
- [ ] Advanced preferences
- [ ] Document uploads
- [ ] Progress bar animations

---

### 4️⃣ DASHBOARD (Hub)
**Must Work:**
- [ ] Display student name greeting
- [ ] 4 action cards linking to:
  - AI Counsellor (blue button)
  - University Discovery (green button)
  - My Shortlist (orange button)
  - Applications & Tasks (red button)
- [ ] Quick stats: "Universities Shortlisted: X", "Applications: Y"
- [ ] Logout button
- [ ] Profile edit link

**Can Be Placeholder:**
- [ ] Widgets/analytics
- [ ] Notifications
- [ ] Recent activity feed
- [ ] Dashboard customization

---

### 5️⃣ AI COUNSELLOR (Conversation)
**Must Work:**
- [ ] Chat interface (message input + send button)
- [ ] Display user message + AI response in chat history
- [ ] Show typing indicator while waiting for response
- [ ] At least 3 predefined responses/scenarios:
  - "Help me choose a career path" → Provide suggestion based on profile
  - "Which universities should I apply to?" → Suggest 3-5 based on interests
  - "What's my profile strength?" → Feedback summary
- [ ] Option to end conversation and return to dashboard
- [ ] Messages persist during session

**Can Be Placeholder:**
- [ ] Advanced NLP/ML
- [ ] Real GPT/Claude API integration
- [ ] Conversation history across sessions
- [ ] Typing animations

**Implementation Note:** Mock AI responses based on student profile + predefined templates.

---

### 6️⃣ UNIVERSITY DISCOVERY/SHORTLIST (Browse & Select)
**Must Work:**
- [ ] Display list of 20-30 universities (hardcoded JSON is fine)
- [ ] Each university card shows:
  - Name
  - Location
  - Brief description (1 line)
  - "Add to Shortlist" button
- [ ] Search/filter by:
  - Location (dropdown)
  - Stream/Major (dropdown)
- [ ] Visual feedback when university added (button → "✓ Added")
- [ ] Counter: "X of 5 universities shortlisted"
- [ ] Can only shortlist max 5 universities
- [ ] "View Shortlist" button routes to stage 7

**Can Be Placeholder:**
- [ ] Detailed university profiles
- [ ] Ranking/rating system
- [ ] Reviews from students
- [ ] Advanced filtering

---

### 7️⃣ UNIVERSITY LOCK (Confirm Final List)
**Must Work:**
- [ ] Display all 5 shortlisted universities
- [ ] Each with: Name, Location, Brief Description
- [ ] "Lock This List" button (red/prominent)
- [ ] Confirmation dialog: "You cannot change this after locking. Confirm?"
- [ ] Lock status saved to backend
- [ ] After lock: Disable removal/editing, show "🔒 LOCKED" badge
- [ ] "Proceed to Applications" button → Stage 8

**Can Be Placeholder:**
- [ ] Reordering before lock
- [ ] Comparison table
- [ ] Export as PDF
- [ ] Recommendation engine refinement

---

### 8️⃣ APPLICATIONS + TASKS (Submit & Track)
**Must Work:**
- [ ] For each locked university, display:
  - University name
  - Application deadline (hardcoded date)
  - Status: "Not Started" | "In Progress" | "Submitted"
  - Action button: "Start Application" or "View"
- [ ] Simple application form with:
  - Personal statement (text area)
  - Upload resume/CV (file input)
  - Submit button
- [ ] Upon submission:
  - Status changes to "Submitted"
  - Timestamp saved
  - Button disabled
- [ ] Task checklist:
  - [ ] Complete all applications
  - [ ] Submit by deadline
  - [ ] Review shortlist (with link back)
- [ ] Success message after all submitted
- [ ] Download summary button (export as PDF or text)

**Can Be Placeholder:**
- [ ] Email reminders
- [ ] Interview scheduling
- [ ] Offer tracking
- [ ] Detailed application templates
- [ ] Multiple file uploads

---

## 🔴 CRITICAL PATH REQUIREMENTS

### Backend/Database Must-Haves:
- [ ] User authentication system (basic JWT/session)
- [ ] User profile storage (name, grade, stream, interests)
- [ ] Shortlist persistence (user → selected universities)
- [ ] Lock status tracking (is_locked boolean)
- [ ] Applications storage (user → university → application + status)
- [ ] At least 20-30 hardcoded universities in DB

### Frontend Must-Haves:
- [ ] Strict route protection (cannot skip stages)
- [ ] Session validation on every page load
- [ ] Form validation & error handling
- [ ] Loading states (spinners, disabled buttons)
- [ ] Mobile responsive (minimum 375px width)
- [ ] No console errors on happy path

### Testing:
- [ ] User can complete full flow end-to-end
- [ ] Cannot access dashboard without auth
- [ ] Cannot skip to University Discovery before onboarding
- [ ] Cannot edit shortlist after lock
- [ ] Cannot delete application after submission
- [ ] All form submissions succeed

---

## 🎨 UI/UX Minimum Standards

**Must Have:**
- [ ] Consistent color scheme (3-5 colors max)
- [ ] Clear stage indicator (breadcrumb or step counter)
- [ ] "Back" button on every stage (except landing)
- [ ] Logout accessible from every page
- [ ] Form validation errors are visible
- [ ] Buttons are clearly clickable (min 44px height)
- [ ] Mobile menu if needed (hamburger nav)

**Can Be Placeholder:**
- [ ] Animations
- [ ] Custom fonts
- [ ] Dark mode
- [ ] Accessibility (WCAG AAA)

---

## 📊 Data Model (Minimum)

```javascript
User {
  id: UUID,
  email: string,
  password: hashed,
  name: string,
  grade: string,
  stream: string,
  interests: string[],
  career_aspirations: string,
  profile_complete: boolean,
  created_at: timestamp
}

Shortlist {
  id: UUID,
  user_id: UUID,
  university_id: UUID,
  is_locked: boolean,
  locked_at: timestamp,
  created_at: timestamp
}

Application {
  id: UUID,
  user_id: UUID,
  university_id: UUID,
  personal_statement: string,
  resume_url: string,
  status: "not_started" | "in_progress" | "submitted",
  submitted_at: timestamp,
  created_at: timestamp
}

University {
  id: UUID,
  name: string,
  location: string,
  description: string,
  stream_tags: string[],
  application_deadline: date
}
```

---

## ✅ Submission Readiness Checklist

Before submitting, verify:

- [ ] All 8 stages are navigable in exact sequence
- [ ] No stage can be skipped (route guards implemented)
- [ ] Full end-to-end flow works without errors
- [ ] Profile persists after logout/login
- [ ] Shortlist persists and cannot be edited after lock
- [ ] Applications cannot be modified after submission
- [ ] UI is responsive on mobile (tested on 375px width)
- [ ] No console errors on happy path
- [ ] All CTAs (buttons) are functional
- [ ] Database is seeded with demo data
- [ ] Demo account exists (email: demo@test.com, pwd: demo123)
- [ ] README has clear setup & demo instructions
- [ ] Deployed or runnable locally without build issues

---

## ⏱️ Estimated Timeline (Team of 2-3)

- **Auth + Basic UI:** 4-6 hours
- **Onboarding + Profile:** 3-4 hours
- **Dashboard + Routing:** 2-3 hours
- **AI Counsellor (mock):** 3-4 hours
- **University Discovery + Shortlist:** 4-5 hours
- **University Lock:** 2-3 hours
- **Applications + Tasks:** 5-6 hours
- **Database + Backend:** 8-10 hours
- **Testing + Polish:** 3-4 hours

**Total: 34-42 hours** (tight, but doable for MVP)

---

## 🚀 Post-MVP (Out of Scope for Hackathon)

- Real AI/LLM integration
- Email notifications
- Payment processing
- Advanced analytics
- Admin dashboard
- Social features
- API documentation

---

## Notes for Team

✋ **DO NOT ADD:** OAuth, real ML, complex animations, or advanced features.  
✋ **FOCUS:** Make the critical path bulletproof.  
✋ **TEST:** Every stage transition must work.  
✋ **DEMO:** Have a pre-registered test user ready.  
✋ **DEPLOY:** Get it live 24 hours before submission.

---

**Approved by:** Senior Engineer  
**Version:** 1.0  
**Last Updated:** January 26, 2026
