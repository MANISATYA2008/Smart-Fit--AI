import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* --------------------------------
   CONFIG
--------------------------------- */



const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-change-me";

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

/*
  IMPORTANT:
  Vercel filesystem is read-only except /tmp.

  Local:
    project/database/smartfit.db

  Vercel:
    /tmp/smartfit.db
*/

let databasePath;

if (isVercel) {
  databasePath = "/tmp/smartfit.db";
} else {
  const databaseDir = path.resolve(
    process.cwd(),
    "database"
  );

  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, {
      recursive: true
    });
  }

  databasePath = path.join(
    databaseDir,
    "smartfit.db"
  );
}

/*
  Extra safety for Vercel.
*/
const databaseParent =
  path.dirname(databasePath);

if (!fs.existsSync(databaseParent)) {
  fs.mkdirSync(databaseParent, {
    recursive: true
  });
}

console.log(
  "Environment:",
  isVercel ? "Vercel" : "Local"
);

console.log(
  "Database path:",
  databasePath
);

/* --------------------------------
   DATABASE
--------------------------------- */

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.pragma("journal_mode = WAL");

/* --------------------------------
   DATABASE SCHEMA
--------------------------------- */

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  age INTEGER,
  height_cm REAL,
  weight_kg REAL,
  experience TEXT,
  goal TEXT,
  workout_days INTEGER,
  workout_minutes INTEGER,
  location TEXT,
  equipment TEXT,
  vegetarian_type TEXT,
  preferred_foods TEXT,
  avoided_foods TEXT,
  allergies TEXT,
  meals_per_day INTEGER,
  food_budget REAL,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  instructions TEXT NOT NULL,
  mistakes TEXT NOT NULL,
  tutorial_url TEXT
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  workout_date TEXT NOT NULL,
  split_name TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  completed_exercises INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`;

db.exec(schema);

/* --------------------------------
   EXERCISE SEED DATA
--------------------------------- */

const exerciseSeed = [
  [
    "Bodyweight Squat",
    "Legs",
    "Bodyweight",
    "Beginner",
    "Stand with feet comfortable, sit back under control, then stand tall.",
    "Knees collapsing inward; rushing the movement."
  ],
  [
    "Push-Up",
    "Chest",
    "Bodyweight",
    "Beginner",
    "Keep a straight body line, lower under control, and press back up.",
    "Sagging hips; flaring elbows excessively."
  ],
  [
    "Dumbbell Goblet Squat",
    "Legs",
    "Dumbbells",
    "Beginner",
    "Hold one dumbbell near the chest and squat under control.",
    "Rounding the back; losing foot contact."
  ],
  [
    "Dumbbell Row",
    "Back",
    "Dumbbells",
    "Beginner",
    "Brace your torso and pull the dumbbell toward your hip.",
    "Twisting the torso; jerking the weight."
  ],
  [
    "Dumbbell Shoulder Press",
    "Shoulders",
    "Dumbbells",
    "Beginner",
    "Press dumbbells overhead while keeping your trunk stable.",
    "Overarching the lower back; uncontrolled lowering."
  ],
  [
    "Dumbbell Biceps Curl",
    "Arms",
    "Dumbbells",
    "Beginner",
    "Curl the weights while keeping upper arms mostly still.",
    "Swinging the body; dropping the weight quickly."
  ],
  [
    "Dumbbell Triceps Extension",
    "Arms",
    "Dumbbells",
    "Beginner",
    "Use a controlled elbow extension with the upper arms stable.",
    "Excessive elbow flare; rushing."
  ],
  [
    "Calf Raise",
    "Calves",
    "Bodyweight",
    "Beginner",
    "Rise onto the balls of the feet and lower slowly.",
    "Bouncing; using momentum."
  ],
  [
    "Glute Bridge",
    "Glutes",
    "Bodyweight",
    "Beginner",
    "Lie on your back, drive through your feet, and lift your hips comfortably.",
    "Overarching the back; moving too fast."
  ],
  [
    "Plank",
    "Core",
    "Bodyweight",
    "Beginner",
    "Maintain a comfortable straight-line position and brace the core.",
    "Holding breath; letting hips sag."
  ]
];

const seed = db.prepare(`
  INSERT INTO exercises (
    name,
    muscle_group,
    equipment,
    difficulty,
    instructions,
    mistakes
  )
  SELECT ?, ?, ?, ?, ?, ?
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises
    WHERE name = ?
  )
`);

for (const e of exerciseSeed) {
  seed.run(
    e[0],
    e[1],
    e[2],
    e[3],
    e[4],
    e[5],
    e[0]
  );
}

/* --------------------------------
   MIDDLEWARE
--------------------------------- */

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

/*
  Serve frontend locally if it exists.
*/
const frontendPath = path.resolve(
  __dirname,
  "../frontend"
);

if (fs.existsSync(frontendPath)) {
  app.use(
    express.static(frontendPath)
  );
}

/* --------------------------------
   AUTH MIDDLEWARE
--------------------------------- */

function auth(req, res, next) {
  const authHeader =
    req.headers.authorization || "";

  const token =
    authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

  if (!token) {
    return res.status(401).json({
      error: "Please log in."
    });
  }

  try {
    req.user = jwt.verify(
      token,
      JWT_SECRET
    );

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Please log in."
    });
  }
}

/* --------------------------------
   HELPERS
--------------------------------- */

function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function getUserProfile(userId) {
  return db
    .prepare(`
      SELECT *
      FROM profiles
      WHERE user_id = ?
    `)
    .get(userId);
}

/* --------------------------------
   RULE BASED WORKOUT PLAN
--------------------------------- */

function buildRulePlan(profile) {
  const days = Math.min(
    6,
    Math.max(
      2,
      Number(profile.workout_days || 3)
    )
  );

  const templates = {
    2: [
      "Full Body A",
      "Full Body B"
    ],

    3: [
      "Full Body A",
      "Upper Body",
      "Lower Body"
    ],

    4: [
      "Upper Body",
      "Lower Body",
      "Upper Body",
      "Lower Body"
    ],

    5: [
      "Chest & Triceps",
      "Back & Biceps",
      "Legs",
      "Shoulders & Core",
      "Full Body"
    ],

    6: [
      "Chest",
      "Back",
      "Shoulders",
      "Arms",
      "Legs",
      "Core & Conditioning"
    ]
  };

  const names =
    templates[days] || templates[3];

  const map = {
    "Chest & Triceps": [
      "Push-Up",
      "Dumbbell Triceps Extension"
    ],

    "Back & Biceps": [
      "Dumbbell Row",
      "Dumbbell Biceps Curl"
    ],

    Legs: [
      "Dumbbell Goblet Squat",
      "Glute Bridge",
      "Calf Raise"
    ],

    "Shoulders & Core": [
      "Dumbbell Shoulder Press",
      "Plank"
    ],

    Chest: [
      "Push-Up"
    ],

    Back: [
      "Dumbbell Row"
    ],

    Shoulders: [
      "Dumbbell Shoulder Press",
      "Plank"
    ],

    Arms: [
      "Dumbbell Biceps Curl",
      "Dumbbell Triceps Extension"
    ],

    "Core & Conditioning": [
      "Plank",
      "Glute Bridge"
    ],

    "Full Body": [
      "Bodyweight Squat",
      "Push-Up",
      "Dumbbell Row",
      "Plank"
    ],

    "Full Body A": [
      "Bodyweight Squat",
      "Push-Up",
      "Dumbbell Row"
    ],

    "Full Body B": [
      "Glute Bridge",
      "Dumbbell Shoulder Press",
      "Plank"
    ],

    "Upper Body": [
      "Push-Up",
      "Dumbbell Row",
      "Dumbbell Shoulder Press"
    ],

    "Lower Body": [
      "Dumbbell Goblet Squat",
      "Glute Bridge",
      "Calf Raise"
    ]
  };

  const equipment =
    String(
      profile.equipment || ""
    ).toLowerCase();

  const noEquipment =
    equipment.includes("no equipment");

  const homeWithoutEquipment =
    String(profile.location || "")
      .toLowerCase() === "home" &&
    !equipment;

  return names.map(
    (name, index) => {
      let exercises =
        map[name] || [
          "Bodyweight Squat",
          "Push-Up",
          "Plank"
        ];

      if (
        noEquipment ||
        homeWithoutEquipment
      ) {
        exercises =
          exercises.filter(
            x =>
              !x
                .toLowerCase()
                .includes("dumbbell")
          );
      }

      if (
        !equipment.includes("dumbbell") &&
        String(profile.location || "")
          .toLowerCase() !== "gym"
      ) {
        exercises =
          exercises.filter(
            x =>
              !x
                .toLowerCase()
                .includes("dumbbell")
          );
      }

      return {
        day: index + 1,
        split: name,
        rest: false,

        exercises:
          exercises.map(
            exerciseName => ({
              name: exerciseName,
              sets: 3,
              reps: "8-12"
            })
          )
      };
    }
  );
}

/* --------------------------------
   NUTRITION
--------------------------------- */

function nutrition(profile) {
  const veg =
    profile.vegetarian_type ||
    "Not specified";

  return {
    note:
      "Balanced meal suggestions only. Adjust to your needs and follow professional advice for allergies, medical conditions, or injuries.",

    breakfast:
      veg === "Vegan"
        ? "Oats with fruit and a plant-based protein source"
        : "Eggs or a protein-rich alternative with whole grains and fruit",

    preWorkout:
      "Fruit plus a simple carbohydrate/protein option if hungry",

    postWorkout:
      "A balanced meal with a protein source, carbohydrate, and vegetables",

    lunch:
      "Rice or chapati + vegetables + a suitable protein source",

    evening:
      "Fruit, yogurt/curd or a suitable plant-based alternative",

    dinner:
      "Balanced meal with vegetables and a protein source",

    hydration:
      "Drink water regularly; needs vary with activity and climate.",

    preference: veg
  };
}

/* --------------------------------
   GEMINI AI PLAN
--------------------------------- */

async function geminiPlan(profile) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const ai = new GoogleGenAI({
    apiKey:
      process.env.GEMINI_API_KEY
  });

  const prompt = `
You are a cautious fitness planning assistant.

Create a beginner-safe and balanced weekly fitness plan.

Do not:
- diagnose medical conditions
- prescribe treatment
- recommend extreme dieting
- recommend aggressive weight-loss targets

Return valid JSON only.

Required JSON structure:

{
  "summary": "...",
  "weekly_plan": [
    {
      "day": 1,
      "split": "...",
      "exercises": [
        {
          "name": "...",
          "sets": 3,
          "reps": "8-12"
        }
      ]
    }
  ],
  "nutrition_notes": [],
  "safety_notes": []
}

User profile:
${JSON.stringify(profile)}
`;

  const response =
    await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-2.5-flash",

      contents: prompt,

      config: {
        responseMimeType:
          "application/json"
      }
    });

  const text =
    response.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  return JSON.parse(text);
}

/* --------------------------------
   HEALTH CHECK
--------------------------------- */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      status: "ok",
      message:
        "SMART FIT AI server is running.",
      environment:
        isVercel
          ? "vercel"
          : "local",
      database:
        databasePath,
      time:
        new Date().toISOString()
    });
  }
);

/* --------------------------------
   REGISTER
--------------------------------- */

app.post(
  "/api/auth/register",
  async (req, res) => {
    const {
      name,
      email,
      password
    } = req.body || {};

    if (
      !name ||
      !email ||
      !password ||
      String(password).length < 6
    ) {
      return res.status(400).json({
        error:
          "Name, email and a password of at least 6 characters are required."
      });
    }

    try {
      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const cleanName =
        String(name).trim();

      const hash =
        await bcrypt.hash(
          String(password),
          10
        );

      const info =
        db.prepare(`
          INSERT INTO users (
            name,
            email,
            password_hash
          )
          VALUES (?, ?, ?)
        `).run(
          cleanName,
          normalizedEmail,
          hash
        );

      const userId =
        Number(
          info.lastInsertRowid
        );

      const token =
        jwt.sign(
          {
            id: userId,
            name: cleanName,
            role: "user"
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );

      return res.json({
        token,

        user: {
          id: userId,
          name: cleanName,
          email: normalizedEmail
        }
      });
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      return res.status(400).json({
        error:
          "Email may already be registered."
      });
    }
  }
);

/* --------------------------------
   LOGIN
--------------------------------- */

app.post(
  "/api/auth/login",
  async (req, res) => {
    const {
      email,
      password
    } = req.body || {};

    const normalizedEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const user =
      db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
      `).get(normalizedEmail);

    if (
      !user ||
      !(await bcrypt.compare(
        String(password || ""),
        user.password_hash
      ))
    ) {
      return res.status(401).json({
        error:
          "Invalid email or password."
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          name: user.name,
          role: user.role
        },
        JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    return res.json({
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  }
);

/* --------------------------------
   CURRENT USER
--------------------------------- */

app.get(
  "/api/me",
  auth,
  (req, res) => {
    const user =
      db.prepare(`
        SELECT
          id,
          name,
          email,
          role
        FROM users
        WHERE id = ?
      `).get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    const profile =
      getUserProfile(
        req.user.id
      );

    return res.json({
      user,
      profile
    });
  }
);

/* --------------------------------
   SAVE PROFILE
--------------------------------- */

app.post(
  "/api/profile",
  auth,
  (req, res) => {
    const p =
      req.body || {};

    try {
      db.prepare(`
        INSERT INTO profiles (
          user_id,
          age,
          height_cm,
          weight_kg,
          experience,
          goal,
          workout_days,
          workout_minutes,
          location,
          equipment,
          vegetarian_type,
          preferred_foods,
          avoided_foods,
          allergies,
          meals_per_day,
          food_budget
        )
        VALUES (
          @user_id,
          @age,
          @height_cm,
          @weight_kg,
          @experience,
          @goal,
          @workout_days,
          @workout_minutes,
          @location,
          @equipment,
          @vegetarian_type,
          @preferred_foods,
          @avoided_foods,
          @allergies,
          @meals_per_day,
          @food_budget
        )

        ON CONFLICT(user_id)
        DO UPDATE SET
          age = @age,
          height_cm = @height_cm,
          weight_kg = @weight_kg,
          experience = @experience,
          goal = @goal,
          workout_days = @workout_days,
          workout_minutes = @workout_minutes,
          location = @location,
          equipment = @equipment,
          vegetarian_type = @vegetarian_type,
          preferred_foods = @preferred_foods,
          avoided_foods = @avoided_foods,
          allergies = @allergies,
          meals_per_day = @meals_per_day,
          food_budget = @food_budget
      `).run({
        user_id:
          req.user.id,

        age:
          p.age ?? null,

        height_cm:
          p.height_cm ?? null,

        weight_kg:
          p.weight_kg ?? null,

        experience:
          p.experience ?? null,

        goal:
          p.goal ?? null,

        workout_days:
          p.workout_days ?? null,

        workout_minutes:
          p.workout_minutes ?? null,

        location:
          p.location ?? null,

        equipment:
          p.equipment ?? null,

        vegetarian_type:
          p.vegetarian_type ?? null,

        preferred_foods:
          p.preferred_foods ?? null,

        avoided_foods:
          p.avoided_foods ?? null,

        allergies:
          p.allergies ?? null,

        meals_per_day:
          p.meals_per_day ?? null,

        food_budget:
          p.food_budget ?? null
      });

      return res.json({
        message:
          "Profile saved."
      });
    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error
      );

      return res.status(400).json({
        error:
          "Could not save profile."
      });
    }
  }
);

/* --------------------------------
   TODAY WORKOUT
--------------------------------- */

app.get(
  "/api/workout/today",
  auth,
  (req, res) => {
    const profile =
      getUserProfile(
        req.user.id
      );

    if (!profile) {
      return res.status(400).json({
        error:
          "Complete your profile first."
      });
    }

    const plan =
      buildRulePlan(profile);

    const day =
      ((new Date().getDay() + 6) % 7) + 1;

    const active =
      plan[
        (day - 1) %
          plan.length
      ];

    return res.json({
      plan,
      today:
         active
    });
  });
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SMART FIT AI server running on port ${PORT}`);
});

export default app;
