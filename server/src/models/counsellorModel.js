import db from "../config/database.js";

/**
 * Get user's complete profile data
 * Stage is DERIVED from data (Option A)
 */
export const getUserCompleteData = async (userId) => {
  const userData = {
    profile: null,
    stage: null,
    shortlist: [],
    lockedUniversity: null,
    tasks: [],
  };

  try {
    // 1️⃣ PROFILE (from onboarding + users)
   const profileQuery = `
  SELECT
    o.first_name,
    o.last_name,
    u.email,

    -- JSON extraction
    o.preferences->'target_countries' AS target_countries,
    o.preferences->'preferred_fields' AS preferred_fields,
    o.preferences->>'preferred_intake_session' AS preferred_intake_session,

    o.completed AS profile_complete,
    o.created_at
  FROM onboarding o
  JOIN users u ON u.id = o.user_id
  WHERE o.user_id = $1;
`;

    // const profileResult = await db.query(profileQuery, [userId]);
    // userData.profile = profileResult.rows[0] || null;

    let profileResult = await db.query(profileQuery, [userId]);

// 🔑 Auto-create onboarding row if missing
if (profileResult.rows.length === 0) {
  await db.query(
    `
    INSERT INTO onboarding (user_id, completed, preferences)
    VALUES ($1, false, '{}'::jsonb)
    `,
    [userId]
  );

  // Re-fetch profile after insert
  profileResult = await db.query(profileQuery, [userId]);
}

userData.profile = profileResult.rows[0];


    // 2️⃣ SHORTLIST
    const shortlistQuery = `
      SELECT
        s.id,
        s.university_id,
        u.name,
        u.country,
        u.program
      FROM shortlist s
      JOIN universities u ON s.university_id = u.id
      WHERE s.user_id = $1;
    `;
    const shortlistResult = await db.query(shortlistQuery, [userId]);
    userData.shortlist = shortlistResult.rows || [];

    // 3️⃣ LOCKED UNIVERSITY
    const lockedQuery = `
      SELECT
        lu.university_id,
        u.name,
        u.country,
        u.program
      FROM locked_university lu
      JOIN universities u ON lu.university_id = u.id
      WHERE lu.user_id = $1;
    `;
    const lockedResult = await db.query(lockedQuery, [userId]);
    userData.lockedUniversity = lockedResult.rows[0] || null;

    // 4️⃣ TASKS (todos table)
 const tasksQuery = `
  SELECT
    id,
    title,
    created_at
  FROM todos
  WHERE user_id = $1
  ORDER BY created_at DESC;
`;


    const tasksResult = await db.query(tasksQuery, [userId]);
    userData.tasks = tasksResult.rows || [];

    // ============================================
    // 5️⃣ DERIVE STAGE (THIS IS WHERE IT BELONGS)
    // ============================================
    let stageNumber = 1; // Onboarding

    if (userData.profile?.profile_complete) {
      stageNumber = 2; // Discovering Universities
    }

    if (userData.shortlist.length > 0) {
      stageNumber = 3; // Finalizing Universities
    }

    if (userData.lockedUniversity) {
      stageNumber = 4; // Preparing Applications
    }

    userData.stage = { stage_number: stageNumber };

    return userData;
  } catch (error) {
    console.error("Error getting user complete data:", error);
    throw error;
  }
};


/**
 * Execute counsellor action
 * Handles CREATE_TASK, SHORTLIST_UNIVERSITY, LOCK_UNIVERSITY
 */
export const executeCounsellorAction = async (userId, action) => {
  const { type, data } = action;

  try {
    switch (type) {
case "CREATE_TASK": {
  const { title } = data;

  const taskRes = await db.query(
    `
    INSERT INTO todos (user_id, title)
    VALUES ($1, $2)
    RETURNING id, title;
    `,
    [userId, title]
  );

  return {
    success: true,
    action: "CREATE_TASK",
    data: taskRes.rows[0],
  };
}



      case "SHORTLIST_UNIVERSITY": {
        const { universityId } = data;

        await db.query(
          `
          INSERT INTO shortlist (user_id, university_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `,
          [userId, universityId]
        );

        return {
          success: true,
          action: "SHORTLIST_UNIVERSITY",
          data: { universityId },
        };
      }

      case "LOCK_UNIVERSITY": {
        const { universityId } = data;

        await db.query(
          `
          INSERT INTO locked_university (user_id, university_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id)
          DO UPDATE SET university_id = $2;
        `,
          [userId, universityId]
        );

        return {
          success: true,
          action: "LOCK_UNIVERSITY",
          data: { universityId },
        };
      }

      default:
        return {
          success: false,
          error: "Unknown action type",
        };
    }
  } catch (error) {
    console.error("executeCounsellorAction error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};


/**
 * Get updated user data after counsellor actions
 */
export const getUpdatedUserData = async (userId) => {
  const data = {
    stage: null,
    shortlist: [],
    lockedUniversity: null,
    tasks: [],
    stats: {},
  };

  // shortlist
  const shortlistRes = await db.query(
    `SELECT university_id FROM shortlist WHERE user_id = $1`,
    [userId]
  );
  data.shortlist = shortlistRes.rows;

  // locked university
  const lockedRes = await db.query(
    `SELECT university_id FROM locked_university WHERE user_id = $1`,
    [userId]
  );
  data.lockedUniversity = lockedRes.rows[0] || null;

  // tasks
 // tasks (todos table has NO status column)
const tasksRes = await db.query(
  `SELECT id FROM todos WHERE user_id = $1`,
  [userId]
);

data.tasks = tasksRes.rows;

// simple stats for MVP
data.stats = {
  totalTasks: data.tasks.length,
  completedTasks: 0,
  pendingTasks: data.tasks.length,
};


  // 🔑 derive stage again
 let stageNumber = 1;

if (data.tasks.length >= 0) stageNumber = 2;
if (data.shortlist.length > 0) stageNumber = 3;
if (data.lockedUniversity) stageNumber = 4;

data.stage = { stage_number: stageNumber };


  data.stage = { stage_number: stageNumber };

  return data;
};

