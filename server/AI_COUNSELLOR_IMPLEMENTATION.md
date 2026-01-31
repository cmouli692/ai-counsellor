# AI Counsellor API - Complete Implementation

## Overview

A sophisticated **AI-powered university counselling system** that:
- Reads user profile, stage, shortlist, locked university, and tasks
- Provides intelligent recommendations using Gemini API (with rule-based fallback)
- Executes structured actions (CREATE_TASK, SHORTLIST_UNIVERSITY, LOCK_UNIVERSITY)
- Returns comprehensive JSON response with updated user state

---

## 🎯 Features

✅ **AI Integration** - Gemini API for intelligent counselling  
✅ **Fallback System** - Rule-based AI when Gemini unavailable  
✅ **Recommendations** - Dream, Target, Safe university categories  
✅ **Action Execution** - Automatically execute recommended actions  
✅ **State Management** - Return updated user data after actions  
✅ **Context-Aware** - Considers user's current stage and progress  
✅ **Error Handling** - Graceful degradation and error responses  

---

## API Endpoints

### POST /api/ai/counsellor

**Purpose:** Get AI counselling with recommendations and actions

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "I'm starting my university search. What should I do?"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Counsellor response generated",
  "data": {
    "counsellor": {
      "message": "👋 Welcome! Let's start your university journey...",
      "recommended": {
        "dream": [
          {
            "name": "MIT",
            "country": "USA",
            "field": "Computer Science",
            "reason": "Top-tier institution"
          }
        ],
        "target": [
          {
            "name": "UC Berkeley",
            "country": "USA",
            "field": "Computer Science",
            "reason": "Strong program"
          }
        ],
        "safe": [
          {
            "name": "University of Toronto",
            "country": "Canada",
            "field": "Computer Science",
            "reason": "Good safety option"
          }
        ]
      },
      "actions": [
        {
          "type": "CREATE_TASK",
          "data": { "title": "Research Entrance Requirements" },
          "executed": true,
          "result": { "success": true }
        },
        {
          "type": "SHORTLIST_UNIVERSITY",
          "data": { "universityId": 1 },
          "executed": true,
          "result": { "success": true }
        }
      ],
      "usedGemini": true
    },
    "user": {
      "stage": {
        "stage_number": 2,
        "gate_features": { "applications": false }
      },
      "shortlist": [
        {
          "id": 1,
          "university_id": 1,
          "name": "MIT",
          "country": "USA"
        }
      ],
      "lockedUniversity": null,
      "tasks": [
        {
          "id": 1,
          "title": "Research Entrance Requirements",
          "status": "pending"
        }
      ],
      "stats": {
        "totalTasks": 1,
        "completedTasks": 0,
        "pendingTasks": 1
      }
    }
  }
}
```

**Error Responses:**
- 400: Invalid message (empty or not string)
- 404: User not found
- 500: Server error

---

### GET /api/ai/counsellor/context

**Purpose:** Get user's counsellor context without AI interaction

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Counsellor context retrieved",
  "data": {
    "profile": {
      "name": "John Doe",
      "targetCountries": ["USA", "UK", "Canada"],
      "preferredFields": ["Computer Science", "Data Science"],
      "preferredIntakeSession": "Fall"
    },
    "stage": 2,
    "shortlist": [
      {
        "id": 1,
        "university_id": 1,
        "name": "MIT",
        "country": "USA"
      }
    ],
    "lockedUniversity": null,
    "tasks": [],
    "stats": {
      "shortlistCount": 1,
      "completedTasks": 0,
      "pendingTasks": 0,
      "totalTasks": 0
    }
  }
}
```

---

## Data Model

### Counsellor Response

```javascript
{
  message: string,              // AI's counselling message
  recommended: {
    dream: [{                   // Top-tier universities
      name: string,
      country: string,
      field: string,
      reason: string
    }],
    target: [{...}],            // Good-fit universities
    safe: [{...}]               // Backup options
  },
  actions: [{                   // Actions to execute
    type: string,               // CREATE_TASK | SHORTLIST_UNIVERSITY | LOCK_UNIVERSITY
    data: object,               // Action-specific data
    executed: boolean,          // Whether it was executed
    result: object,             // Execution result
    error: string               // Error if execution failed
  }],
  usedGemini: boolean           // Whether Gemini was used (vs rule-based)
}
```

---

## Action Types

### CREATE_TASK

**Data:**
```json
{
  "type": "CREATE_TASK",
  "data": {
    "title": "Statement of Purpose",
    "description": "Write a compelling SOP"
  }
}
```

**Effect:** Creates task for locked university

---

### SHORTLIST_UNIVERSITY

**Data:**
```json
{
  "type": "SHORTLIST_UNIVERSITY",
  "data": {
    "universityId": 1
  }
}
```

**Effect:** Adds university to shortlist

---

### LOCK_UNIVERSITY

**Data:**
```json
{
  "type": "LOCK_UNIVERSITY",
  "data": {
    "universityId": 1
  }
}
```

**Effect:**
- Adds to shortlist (if not already there)
- Locks university
- Auto-generates 5 default tasks

---

## AI Integration

### Gemini API

When `GEMINI_API_KEY` is set:
1. Generates context-aware prompt from user data
2. Calls Gemini Pro API
3. Parses JSON response
4. Executes returned actions
5. Returns structured response

**Setup:**
```bash
export GEMINI_API_KEY="your_api_key_here"
```

### Rule-Based Fallback

When Gemini unavailable:
1. Analyzes user profile and stage
2. Provides stage-appropriate recommendations
3. Suggests next logical steps
4. Returns same JSON structure

**No setup required** - works with or without API key

---

## Code Structure

### Model: `src/models/counsellorModel.js`

**Functions:**
- `getUserCompleteData(userId)` - Fetch all user data
- `executeCounsellorAction(userId, action)` - Execute single action
- `getUserStageInfo(userId)` - Get stage information
- `getUpdatedUserData(userId)` - Fetch updated state after actions

### Service: `src/utils/aiService.js`

**Functions:**
- `callGemini(prompt)` - Call Gemini API
- `ruleBasedCounsellor(profile, data)` - Rule-based AI
- `parseAIResponse(response)` - Parse JSON from AI
- `generateCounsellorPrompt(profile, data, message)` - Create prompt

### Controller: `src/controllers/counsellorController.js`

**Handlers:**
- `counsellorHandler` - POST /api/ai/counsellor
- `getCounsellorContextHandler` - GET /api/ai/counsellor/context

### Routes: `src/routes/counsellorRoutes.js`

- POST /api/ai/counsellor
- GET /api/ai/counsellor/context

---

## Database Queries

### Get User Complete Data

```sql
-- User profile
SELECT first_name, last_name, email, target_countries, 
       preferred_intake_session, preferred_fields
FROM users WHERE id = $1;

-- User stage
SELECT stage_number, gate_features FROM user_stages WHERE user_id = $1;

-- Shortlist
SELECT s.id, s.university_id, u.name, u.country, u.program
FROM shortlist s
JOIN universities u ON s.university_id = u.id
WHERE s.user_id = $1;

-- Locked university
SELECT lu.university_id, u.name, u.country, u.program
FROM locked_university lu
JOIN universities u ON lu.university_id = u.id
WHERE lu.user_id = $1;

-- Tasks
SELECT id, university_id, title, description, status
FROM tasks WHERE user_id = $1;
```

---

## Example Workflows

### Workflow 1: New User Starting Journey

**Request:**
```bash
POST /api/ai/counsellor
{
  "message": "I'm just starting. What should I do?"
}
```

**Response:**
- Message: "Welcome! Let's build your university shortlist"
- Recommended: Dream/Target/Safe universities
- Actions: Suggests universities to add to shortlist
- User Stage: Updated to stage 2 (building shortlist)

---

### Workflow 2: User Ready to Lock

**Request:**
```bash
POST /api/ai/counsellor
{
  "message": "I've selected 5 universities. Which one should I lock for applications?"
}
```

**Response:**
- Message: "Great! Based on your profile, MIT is an excellent choice"
- Recommended: Top 3 choices with reasoning
- Actions: Lock recommended university, auto-generate 5 tasks
- User Stage: Updated to stage 4 (applications)
- Tasks: 5 new tasks created

---

### Workflow 3: Application Preparation

**Request:**
```bash
POST /api/ai/counsellor
{
  "message": "I have 3 pending tasks. How should I prioritize them?"
}
```

**Response:**
- Message: "I recommend prioritizing SOP first..."
- Recommended: Empty (already locked)
- Actions: Suggest task completion order
- User Stats: Show current progress

---

## Security

✅ **Authentication:** All endpoints require JWT token  
✅ **Authorization:** Users only see their own data  
✅ **Input Validation:** Message validated (non-empty string)  
✅ **SQL Safety:** Parameterized queries (no SQL injection)  
✅ **API Key Security:** Gemini key in .env (not hardcoded)  

---

## Error Handling

| Status | Scenario | Message |
|--------|----------|---------|
| 200 | Success | "Counsellor response generated" |
| 400 | Invalid message | "Message is required..." |
| 404 | User not found | "User profile not found" |
| 500 | Server error | "Counsellor error" |

---

## Performance

**Query Optimization:**
- Indexes on user_id, university_id
- Efficient JOINs with universities table
- Minimal round-trips to database

**AI Optimization:**
- Gemini response cached (optional)
- Rule-based fallback is instant
- No unnecessary API calls

---

## Testing

Run comprehensive test suite:

```bash
node scripts/testCounsellorAPI.js
```

**Test Coverage:**
- User authentication
- Profile completion
- Context retrieval
- Multiple counselling prompts
- Action execution
- Error handling
- Updated state verification

---

## Configuration

### Environment Variables

```bash
# Gemini API (optional)
GEMINI_API_KEY=your_api_key_here

# Database (already configured)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_counsellor_dev
DB_USER=postgres
DB_PASSWORD=password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## Deployment

1. **Install dependencies** (if needed)
   ```bash
   npm install node-fetch (for Gemini integration)
   ```

2. **Set environment variables**
   ```bash
   export GEMINI_API_KEY="..."
   ```

3. **Restart server**
   ```bash
   npm start
   ```

4. **Test**
   ```bash
   node scripts/testCounsellorAPI.js
   ```

---

## Future Enhancements

- [ ] Multi-turn conversations (conversation history)
- [ ] Personalized score calculation for universities
- [ ] Timeline-based action suggestions
- [ ] Email notifications for recommended actions
- [ ] Success stories & case studies
- [ ] Integration with external data (rankings, fees)
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Calendar integration for deadlines

---

## Files Created

1. `src/utils/aiService.js` - AI integration & rule-based fallback
2. `src/models/counsellorModel.js` - Database operations
3. `src/controllers/counsellorController.js` - HTTP handlers
4. `src/routes/counsellorRoutes.js` - Route definitions
5. `scripts/testCounsellorAPI.js` - Comprehensive test suite

## Files Modified

1. `src/app.js` - Added counsellor routes

---

## Usage Examples

### cURL Examples

#### Get Counselling

```bash
curl -X POST http://localhost:5000/api/ai/counsellor \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have 3 universities. Which should I lock?"
  }'
```

#### Get Context

```bash
curl -X GET http://localhost:5000/api/ai/counsellor/context \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript Example

```javascript
// Get counselling
const response = await fetch('http://localhost:5000/api/ai/counsellor', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Help me choose a university'
  })
});

const data = await response.json();
console.log(data.data.counsellor.message);
console.log(data.data.counsellor.recommended);
```

---

**Status:** ✅ COMPLETE & TESTED

Ready for production deployment!
