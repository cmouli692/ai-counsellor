# Stage Engine - Quick Reference

## 4-Stage System

| Stage | Name | Requirement | Available | Progress |
|-------|------|-------------|-----------|----------|
| 1 | Onboarding | Profile = incomplete | None | 0% |
| 2 | Onboarding Complete | Profile = complete | Counsellor, Universities | 25% |
| 3 | Shortlist Created | Shortlist >= 1 | + Shortlist | 50% |
| 4 | University Locked | Locked >= 1 | + Applications | 75% |

---

## Endpoints

```
GET  /api/stage              → Current stage (protected)
GET  /api/stage/all          → All stage definitions (public)
GET  /api/stage/progress     → Detailed progress (protected)
GET  /api/stage/gates        → Feature availability (protected)
```

---

## Example Requests

### Get Current Stage
```bash
curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "stage": {
    "stageNumber": 2,
    "stageLabel": "Onboarding Complete",
    "nextStep": "Explore universities and build your shortlist",
    "isComplete": false,
    "data": {
      "profileCompleted": true,
      "shortlistCount": 0,
      "lockedCount": 0
    }
  }
}
```

---

### Check Feature Availability
```bash
curl -X GET http://localhost:5000/api/stage/gates \
  -H "Authorization: Bearer $TOKEN"
```

---

### Get Progress
```bash
curl -X GET http://localhost:5000/api/stage/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Response Includes:**
- progressPercentage (25, 50, 75, 100)
- currentStage (1, 2, 3, 4)
- Completion status of each component
- Details of profile, shortlist, locked university

---

## Frontend Integration

### Redirect Based on Stage
```javascript
const stage = await getStage();

if (stage.stageNumber === 1) navigate('/onboarding');
else if (stage.stageNumber === 2) navigate('/universities');
else if (stage.stageNumber === 3) navigate('/shortlist');
else if (stage.stageNumber === 4) navigate('/applications');
```

### Gate Features
```javascript
const gates = await getFeatureGates();

if (gates.features.universities.available) {
  showUniversitiesPage();
}
```

### Show Progress Bar
```javascript
const progress = await getProgress();

// Progress: 25% (Stage 2)
// Show 25% filled progress bar
```

---

## Feature Availability by Stage

### Stage 1
- ❌ Counsellor
- ❌ Universities
- ❌ Shortlist
- ❌ Applications

### Stage 2
- ✅ Counsellor
- ✅ Universities
- ❌ Shortlist
- ❌ Applications

### Stage 3
- ✅ Counsellor
- ✅ Universities
- ✅ Shortlist
- ❌ Applications

### Stage 4
- ✅ Counsellor
- ✅ Universities
- ✅ Shortlist
- ✅ Applications

---

## Database Queries

### Get User's Stage
```sql
SELECT 
  u.id,
  CASE 
    WHEN p.profile_completed = false THEN 1
    WHEN (SELECT COUNT(*) FROM shortlist WHERE user_id = u.id) = 0 THEN 2
    WHEN (SELECT COUNT(*) FROM locked_university WHERE user_id = u.id) = 0 THEN 3
    ELSE 4
  END as stage,
  p.profile_completed,
  (SELECT COUNT(*) FROM shortlist WHERE user_id = u.id) as shortlist_count,
  (SELECT COUNT(*) FROM locked_university WHERE user_id = u.id) as locked_count
FROM users u
LEFT JOIN profile p ON u.id = p.user_id
WHERE u.id = 'user-id';
```

### Count Users by Stage
```sql
SELECT 
  CASE 
    WHEN p.profile_completed = false THEN 1
    WHEN (SELECT COUNT(*) FROM shortlist WHERE user_id = u.id) = 0 THEN 2
    WHEN (SELECT COUNT(*) FROM locked_university WHERE user_id = u.id) = 0 THEN 3
    ELSE 4
  END as stage,
  COUNT(*) as user_count
FROM users u
LEFT JOIN profile p ON u.id = p.user_id
GROUP BY stage
ORDER BY stage;
```

---

## Test Commands

### Stage 1 (New User)
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"Test123!"}' | jq -r '.token')

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
# Returns: stageNumber: 1
```

### Stage 2 (After Onboarding)
```bash
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User", "grade": "12th", "stream": "Science",
    "interests": ["AI"], "career_aspirations": "Engineer",
    "budget_range": "50L-1Cr", "exam_readiness": "Prepared"
  }'

curl -X GET http://localhost:5000/api/stage \
  -H "Authorization: Bearer $TOKEN"
# Returns: stageNumber: 2
```

---

## Response Examples

### Stage 1 Response
```json
{
  "stageNumber": 1,
  "stageLabel": "Onboarding",
  "description": "Complete your profile to get started",
  "nextStep": "Fill out your academic background, interests, and goals",
  "isComplete": false,
  "gateFeatures": {
    "onboarding": false,
    "counsellor": false,
    "universities": false,
    "shortlist": false,
    "lockedUniversity": false,
    "applications": false
  }
}
```

### Stage 4 Response
```json
{
  "stageNumber": 4,
  "stageLabel": "University Locked",
  "description": "You have locked in your university choice",
  "nextStep": "View your locked university and complete applications",
  "isComplete": true,
  "gateFeatures": {
    "onboarding": true,
    "counsellor": true,
    "universities": true,
    "shortlist": true,
    "lockedUniversity": true,
    "applications": true
  }
}
```

---

## Error Responses

### Unauthorized (401)
```json
{
  "error": "Missing authorization header"
}
```

### Server Error (500)
```json
{
  "error": "Server Error",
  "message": "Failed to retrieve stage information"
}
```

---

## Transitions

```
1 → 2: Auto (profile complete)
2 → 3: Auto (shortlist >= 1)
3 → 4: Auto (locked >= 1)

3 → 2: If shortlist emptied
4 → 3: If all locked removed (rare)
```

---

## Monitoring Queries

### Active Users by Stage
```sql
SELECT 
  stage,
  COUNT(*) as users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
  SELECT 
    CASE 
      WHEN p.profile_completed = false THEN 1
      WHEN (SELECT COUNT(*) FROM shortlist WHERE user_id = u.id) = 0 THEN 2
      WHEN (SELECT COUNT(*) FROM locked_university WHERE user_id = u.id) = 0 THEN 3
      ELSE 4
    END as stage
  FROM users u
  LEFT JOIN profile p ON u.id = p.user_id
) t
GROUP BY stage
ORDER BY stage;
```

### Average Time to Each Stage
```sql
SELECT 
  'Stage 2' as milestone,
  ROUND(AVG(EXTRACT(DAY FROM (p.created_at - u.created_at))), 1) as avg_days
FROM users u
JOIN profile p ON u.id = p.user_id
WHERE p.profile_completed = true

UNION ALL

SELECT 
  'Stage 3',
  ROUND(AVG(EXTRACT(DAY FROM (MIN(s.created_at) - u.created_at))), 1)
FROM users u
JOIN shortlist s ON u.id = s.user_id
GROUP BY u.id
```

---

## Implementation Checklist

- [x] Stage calculation logic (stageEngine.js)
- [x] Stage controller (stageController.js)
- [x] Stage routes (stageRoutes.js)
- [x] App.js integration
- [x] Database queries (using existing tables)
- [x] API documentation (STAGE_ENGINE_API.md)
- [x] Test scenarios (STAGE_ENGINE_TESTS.md)
- [x] Error handling
- [x] Authorization (JWT)

---

## Next Steps

1. **Frontend:** Implement stage checking on app load
2. **Frontend:** Gate features based on stage
3. **Testing:** Run all test scenarios
4. **Monitoring:** Track user progression
5. **Analytics:** Monitor stage distribution

---

**Status:** ✅ Complete & Ready to Use  
**Last Updated:** January 27, 2026
