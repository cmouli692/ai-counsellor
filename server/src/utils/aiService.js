/**
 * AI Service
 * Handles integration with Gemini or fallback rule-based AI
 */

import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Call Gemini API (if available)
 */
export const callGemini = async (prompt) => {
  if (!GEMINI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return content || null;
  } catch (error) {
    console.warn('Gemini API call failed:', error.message);
    return null;
  }
};

/**
 * Rule-Based AI Counsellor (Fallback)
 * Provides recommendations based on user profile and data
 */
export const ruleBasedCounsellor = (profile, aiData, userMessage = "") => {
  let message =
    "👋 Welcome! I'm your AI Counsellor. Let's start your university journey.";

  // 🔑 React to user's intent
  if (
    userMessage.toLowerCase().includes("computer") ||
    userMessage.toLowerCase().includes("cs")
  ) {
    message =
      "Great choice! Computer Science is a popular and competitive field. Based on your interest in CS, I can help you shortlist suitable universities once your preferences are finalized.";
  }

  if (userMessage.toLowerCase().includes("usa")) {
    message +=
      " The USA offers a wide range of universities with strong CS programs across different budget and risk levels.";
  }

  return {
    message,
    recommended: {
      dream: [],
      target: [],
      safe: [],
    },
    actions: [],
  };
};


/**
 * Parse AI response and extract structured actions
 * Attempts to extract JSON from AI response
 */
export const parseAIResponse = (aiResponse) => {
  if (!aiResponse) {
    return null;
  }

  try {
    // Try to find JSON in the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn('Failed to parse AI response:', error.message);
  }

  return null;
};

/**
 * Generate Gemini prompt for counsellor
 */
export const generateCounsellorPrompt = (userProfile, userData, userMessage) => {
  return `You are an expert university counsellor helping students with their applications.

User Profile:
- Target Countries: ${userData.targetCountries?.join(', ') || 'Not specified'}
- Preferred Fields: ${userData.preferredFields?.join(', ') || 'Not specified'}
- Preferred Intake: ${userData.preferredIntakeSession || 'Not specified'}

Current Status:
- Stage: ${userData.stage}/4
- Shortlisted Universities: ${userData.shortlistCount}
- Locked University: ${userData.lockedUniversityName || 'None'}
- Completed Tasks: ${userData.completedTasksCount}/${userData.totalTasks}
- Pending Tasks: ${userData.pendingTasksCount}

User's Question/Request: "${userMessage}"

Based on the user's profile and current status, provide:
1. A helpful, encouraging response (message)
2. Recommendations categorized as:
   - dream: Top-tier universities (MIT, Stanford, Oxford, etc.)
   - target: Good-fit universities
   - safe: Backup options
3. Suggested actions (if any)

Respond in this JSON format:
{
  "message": "Your counselling response here",
  "recommended": {
    "dream": [{"name": "...", "country": "...", "reason": "..."}],
    "target": [{"name": "...", "country": "...", "reason": "..."}],
    "safe": [{"name": "...", "country": "...", "reason": "..."}]
  },
  "actions": [
    {"type": "CREATE_TASK", "data": {"title": "..."}},
    {"type": "SHORTLIST_UNIVERSITY", "data": {"universityId": 1}},
    {"type": "LOCK_UNIVERSITY", "data": {"universityId": 1}}
  ]
}`;
};
