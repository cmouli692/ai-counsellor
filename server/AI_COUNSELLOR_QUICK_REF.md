# AI Counsellor API - Quick Reference

## 🎯 What It Does

Posts user's question → AI reads profile/stage/tasks → Returns recommendations + executes actions → Returns updated state

```
User Message
    ↓
[Read: profile, stage, shortlist, locked, tasks]
    ↓
[Gemini API OR Rule-Based AI]
    ↓
[Execute actions: SHORTLIST, LOCK, CREATE_TASK]
    ↓
[Return: message, recommendations, updated state]
```

---

## 📡 API Endpoints

### POST /api/ai/counsellor

```bash
curl -X POST http://localhost:5000/api/ai/counsellor \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me choose a university"}'
```

**Request:**
```json
{ "message": "string" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "counsellor": {
      "message": "...",
      "recommended": { "dream": [], "target": [], "safe": [] },
      "actions": [...],
      "usedGemini": true/false
    },
    "user": {
      "stage": {...},
      "shortlist": [...],
      "lockedUniversity": {...},
      "tasks": [...],
      "stats": {...}
    }
  }
}
```

---

### GET /api/ai/counsellor/context

```bash
curl -X GET http://localhost:5000/api/ai/counsellor/context \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** User's profile, stage, shortlist, locked, tasks

---

## 🚀 Quick Start

### Setup

1. **Set Gemini API Key (optional)**
   ```bash
   export GEMINI_API_KEY="your_key_here"
   ```

2. **Restart Server**
   ```bash
   npm start
   ```

3. **Test**
   ```bash
   node scripts/testCounsellorAPI.js
   ```

---

## 💡 Example Prompts

### Stage 1-2 (Building Shortlist)
```
"I'm interested in Computer Science. What universities should I look at?"
"I have 2 universities in my shortlist. Should I add more?"
"Which universities are best for Data Science from USA?"
```

### Stage 3 (Ready to Lock)
```
"I have 5 universities. Which one should I lock for applications?"
"Help me compare these 3 universities"
"Which is the safest choice among my shortlist?"
```

### Stage 4 (Application Prep)
```
"Help me prioritize my tasks"
"I have 3 pending tasks. What should I do first?"
"Create a study plan for my entrance exams"
```

---

## 📊 Response Structure

### Counsellor Data
- **message** - AI's advice/recommendation
- **recommended** - Dream/Target/Safe universities
- **actions** - Actions executed (CREATE_TASK, SHORTLIST, LOCK)
- **usedGemini** - Whether real AI or fallback was used

### User Data
- **stage** - Current user stage (1-4)
- **shortlist** - Universities in shortlist
- **lockedUniversity** - Currently locked university
- **tasks** - User's tasks
- **stats** - Task completion stats

---

## 🎬 Action Types

| Type | Effect | Use Case |
|------|--------|----------|
| CREATE_TASK | Creates task for locked uni | Suggest preparation tasks |
| SHORTLIST_UNIVERSITY | Adds to shortlist | Recommend universities |
| LOCK_UNIVERSITY | Locks uni + auto-creates 5 tasks | Finalize university choice |

---

## 🤖 AI Integration

### Gemini (When API Key Set)
- Real AI using Google's Gemini Pro
- Context-aware recommendations
- Parses JSON response automatically
- Falls back gracefully if unavailable

### Rule-Based (Fallback)
- Deterministic recommendations
- Based on user profile & stage
- No API calls needed
- Same JSON output format

---

## 🔐 Security

✅ JWT authentication required  
✅ User data isolation  
✅ Parameterized SQL queries  
✅ Input validation  
✅ API key in environment (not hardcoded)  

---

## 📚 File Structure

```
server/
├── src/
│   ├── utils/aiService.js ............. AI integration
│   ├── models/counsellorModel.js ....... DB operations
│   ├── controllers/counsellorController.js ... HTTP handlers
│   ├── routes/counsellorRoutes.js ...... Route definitions
│   └── app.js (MODIFIED)
│
├── scripts/
│   └── testCounsellorAPI.js ........... Test suite
│
└── AI_COUNSELLOR_IMPLEMENTATION.md .... Full docs
```

---

## 🧪 Testing

```bash
# Run full test suite
node scripts/testCounsellorAPI.js

# Test specific endpoint with cURL
curl -X POST http://localhost:5000/api/ai/counsellor \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Help me start"}'
```

---

## ⚡ Example Workflow

### 1. User starts
```
POST /api/ai/counsellor
{"message": "I'm starting my university search"}
```

### 2. AI responds
```
{
  "message": "Welcome! Let's build your shortlist...",
  "recommended": {
    "dream": [...MIT, Stanford...],
    "target": [...UC Berkeley...],
    "safe": [...University of Toronto...]
  },
  "actions": [
    {"type": "SHORTLIST_UNIVERSITY", "data": {"universityId": 1}}
  ]
}
```

### 3. Actions execute
- University 1 added to shortlist
- User stage updated

### 4. Frontend gets updated data
- Updated shortlist count
- New stage status
- Available recommendations

---

## 🎯 Smart Features

✨ **Context-Aware** - Different responses based on user stage  
✨ **Action Execution** - Automatically updates database  
✨ **Graceful Fallback** - Works without Gemini API key  
✨ **Safe Recommendations** - Dream/Target/Safe categories  
✨ **State Management** - Returns complete user state after actions  

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty message error | Provide non-empty message string |
| 404 User not found | Ensure user exists and token is valid |
| No Gemini response | Check API key or use rule-based fallback |
| Actions not executing | Check locked university exists for tasks |
| Slow responses | Rule-based is instant, Gemini may take 2-3s |

---

## 🔄 Integration Points

- **Profile** - Read user's target countries & fields
- **Stage** - Understand user's current progress
- **Shortlist** - View/update university selections
- **Locked University** - Read current locked choice
- **Tasks** - Create preparation tasks

---

## 📈 Analytics (Optional)

Track:
- Most common user questions
- Highest recommended universities
- Most executed actions
- User progression rates
- Gemini vs Rule-Based usage

---

## 🌟 Pro Tips

1. **Start simple** - "Help me start" gets stage-appropriate advice
2. **Be specific** - "Computer Science in USA" gets better recommendations
3. **Check context** - `/context` endpoint shows what AI sees
4. **Trust the AI** - It considers your entire profile
5. **Execute actions** - AI recommends, you approve via actions

---

## ✅ Verified Working

✓ User authentication  
✓ Profile integration  
✓ Stage-aware responses  
✓ Action execution  
✓ Database updates  
✓ Error handling  
✓ Gemini integration  
✓ Rule-based fallback  

---

**Ready for Production** ✅

Use in your frontend:
```javascript
const response = await fetch('/api/ai/counsellor', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ message: userInput })
});
```

---

Created: January 28, 2026  
Status: ✅ COMPLETE
