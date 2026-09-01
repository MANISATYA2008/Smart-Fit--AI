import express from "express";
import path from "path";
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
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const db = new Database(path.join(__dirname, "../database/smartfit.db"));
db.pragma("foreign_keys = ON");

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
  age INTEGER, height_cm REAL, weight_kg REAL, experience TEXT, goal TEXT,
  workout_days INTEGER, workout_minutes INTEGER, location TEXT, equipment TEXT,
  vegetarian_type TEXT, preferred_foods TEXT, avoided_foods TEXT, allergies TEXT,
  meals_per_day INTEGER, food_budget REAL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL, difficulty TEXT NOT NULL, instructions TEXT NOT NULL,
  mistakes TEXT NOT NULL, tutorial_url TEXT
);
CREATE TABLE IF NOT EXISTS workout_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, workout_date TEXT NOT NULL,
  split_name TEXT NOT NULL, duration_minutes INTEGER DEFAULT 0,
  completed_exercises INTEGER DEFAULT 0, total_exercises INTEGER DEFAULT 0, completed INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, week_start TEXT NOT NULL,
  difficulty TEXT NOT NULL, comment TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ai_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, week_start TEXT NOT NULL,
  plan_json TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`;
db.exec(schema);

const exerciseSeed = [
["Bodyweight Squat","Legs","Bodyweight","Beginner","Stand with feet comfortable, sit back under control, then stand tall.","Knees collapsing inward; rushing the movement."],
["Push-Up","Chest","Bodyweight","Beginner","Keep a straight body line, lower under control, and press back up.","Sagging hips; flaring elbows excessively."],
["Dumbbell Goblet Squat","Legs","Dumbbells","Beginner","Hold one dumbbell near the chest and squat under control.","Rounding the back; losing foot contact."],
["Dumbbell Row","Back","Dumbbells","Beginner","Brace your torso and pull the dumbbell toward your hip.","Twisting the torso; jerking the weight."],
["Dumbbell Shoulder Press","Shoulders","Dumbbells","Beginner","Press dumbbells overhead while keeping your trunk stable.","Overarching the lower back; uncontrolled lowering."],
["Dumbbell Biceps Curl","Arms","Dumbbells","Beginner","Curl the weights while keeping upper arms mostly still.","Swinging the body; dropping the weight quickly."],
["Dumbbell Triceps Extension","Arms","Dumbbells","Beginner","Use a controlled elbow extension with the upper arms stable.","Excessive elbow flare; rushing."],
["Calf Raise","Calves","Bodyweight","Beginner","Rise onto the balls of the feet and lower slowly.","Bouncing; using momentum."],
["Glute Bridge","Glutes","Bodyweight","Beginner","Lie on your back, drive through your feet, and lift your hips comfortably.","Overarching the back; moving too fast."],
["Plank","Core","Bodyweight","Beginner","Maintain a comfortable straight-line position and brace the core.","Holding breath; letting hips sag."]
];
const seed = db.prepare(`INSERT INTO exercises(name,muscle_group,equipment,difficulty,instructions,mistakes)
SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name=?)`);
for (const e of exerciseSeed) seed.run(e[0],e[1],e[2],e[3],e[4],e[5],e[0]);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

function auth(req,res,next){
  const token = (req.headers.authorization || "").replace("Bearer ","");
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({error:"Please log in."}); }
}

function today(){ return new Date().toISOString().slice(0,10); }

function buildRulePlan(profile){
  const days = Math.min(6, Math.max(2, Number(profile.workout_days || 3)));
  const templates = {
    2:["Full Body A","Full Body B"],
    3:["Full Body A","Upper Body","Lower Body"],
    4:["Upper Body","Lower Body","Upper Body","Lower Body"],
    5:["Chest & Triceps","Back & Biceps","Legs","Shoulders & Core","Full Body"],
    6:["Chest","Back","Shoulders","Arms","Legs","Core & Conditioning"]
  };
  const names = templates[days] || templates[3];
  const map = {
    "Chest & Triceps":["Push-Up","Dumbbell Triceps Extension"],
    "Back & Biceps":["Dumbbell Row","Dumbbell Biceps Curl"],
    "Legs":["Dumbbell Goblet Squat","Glute Bridge","Calf Raise"],
    "Shoulders & Core":["Dumbbell Shoulder Press","Lateral Raise","Plank"],
    "Chest":["Push-Up"],
    "Back":["Dumbbell Row"],
    "Shoulders":["Dumbbell Shoulder Press","Plank"],
    "Arms":["Dumbbell Biceps Curl","Dumbbell Triceps Extension"],
    "Core & Conditioning":["Plank","Glute Bridge"],
    "Full Body":["Bodyweight Squat","Push-Up","Dumbbell Row","Plank"],
    "Full Body A":["Bodyweight Squat","Push-Up","Dumbbell Row"],
    "Full Body B":["Glute Bridge","Dumbbell Shoulder Press","Plank"],
    "Upper Body":["Push-Up","Dumbbell Row","Dumbbell Shoulder Press"],
    "Lower Body":["Dumbbell Goblet Squat","Glute Bridge","Calf Raise"]
  };
  const equipment = String(profile.equipment || "").toLowerCase();
  return names.map((name,i)=>({
    day:i+1, split:name, rest:false,
    exercises:(map[name] || ["Bodyweight Squat","Push-Up","Plank"]).filter(x=>{
      if (equipment.includes("no equipment") || profile.location==="Home" && !equipment) return !["Dumbbell","Press"].some(y=>x.includes(y));
      if (equipment.includes("dumbbell")) return true;
      return !x.includes("Dumbbell") || profile.location==="Gym";
    }).map(x=>({name:x,sets:3,reps:"8-12"}))
  }));
}

function nutrition(profile, split){
  const veg = profile.vegetarian_type || "Not specified";
  return {
    note:"Balanced meal suggestions only; adjust to your needs and follow professional advice for allergies, medical conditions, or injuries.",
    breakfast: veg==="Vegan" ? "Oats with fruit and a plant-based protein source" : "Eggs or a protein-rich alternative with whole grains and fruit",
    preWorkout:"Fruit plus a simple carbohydrate/protein option if hungry",
    postWorkout:"A balanced meal with a protein source, carbohydrate, and vegetables",
    lunch:"Rice or chapati + vegetables + a suitable protein source",
    evening:"Fruit, yogurt/curd or a suitable plant-based alternative",
    dinner:"Balanced meal with vegetables and a protein source",
    hydration:"Drink water regularly; needs vary with activity and climate.",
    preference:veg
  };
}

async function geminiPlan(profile){
  if(!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
  const prompt = `You are a cautious fitness planning assistant. Create a beginner-safe, balanced weekly fitness plan from this profile.
Do not diagnose medical conditions, prescribe treatment, recommend extreme dieting, or give aggressive weight-loss targets.
Return concise JSON with keys: summary, weekly_plan (array of {day,split,exercises:[{name,sets,reps}]}), nutrition_notes, safety_notes.
Profile: ${JSON.stringify(profile)}`;
  const response = await ai.models.generateContent({
    model:"gemini-3.7-flash",
    contents:prompt,
    config:{responseMimeType:"application/json"}
  });
  return JSON.parse(response.text);
}

app.post("/api/auth/register", async (req,res)=>{
  const {name,email,password}=req.body;
  if(!name||!email||!password||password.length<6) return res.status(400).json({error:"Name, email and a password of at least 6 characters are required."});
  try{
    const hash=await bcrypt.hash(password,10);
    const info=db.prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)").run(name,email.toLowerCase(),hash);
    const token=jwt.sign({id:Number(info.lastInsertRowid),name,role:"user"},JWT_SECRET,{expiresIn:"7d"});
    res.json({token,user:{id:Number(info.lastInsertRowid),name,email:email.toLowerCase()}});
  }catch(e){res.status(400).json({error:"Email may already be registered."});}
});

app.post("/api/auth/login", async (req,res)=>{
  const {email,password}=req.body;
  const user=db.prepare("SELECT * FROM users WHERE email=?").get((email||"").toLowerCase());
  if(!user || !(await bcrypt.compare(password||"",user.password_hash))) return res.status(401).json({error:"Invalid email or password."});
  const token=jwt.sign({id:user.id,name:user.name,role:user.role},JWT_SECRET,{expiresIn:"7d"});
  res.json({token,user:{id:user.id,name:user.name,email:user.email}});
});

app.get("/api/me",auth,(req,res)=>{
  const user=db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(req.user.id);
  const profile=db.prepare("SELECT * FROM profiles WHERE user_id=?").get(req.user.id);
  res.json({user,profile});
});

app.post("/api/profile",auth,(req,res)=>{
  const p=req.body;
  db.prepare(`INSERT INTO profiles(user_id,age,height_cm,weight_kg,experience,goal,workout_days,workout_minutes,location,equipment,vegetarian_type,preferred_foods,avoided_foods,allergies,meals_per_day,food_budget)
  VALUES(@user_id,@age,@height_cm,@weight_kg,@experience,@goal,@workout_days,@workout_minutes,@location,@equipment,@vegetarian_type,@preferred_foods,@avoided_foods,@allergies,@meals_per_day,@food_budget)
  ON CONFLICT(user_id) DO UPDATE SET age=@age,height_cm=@height_cm,weight_kg=@weight_kg,experience=@experience,goal=@goal,workout_days=@workout_days,workout_minutes=@workout_minutes,location=@location,equipment=@equipment,vegetarian_type=@vegetarian_type,preferred_foods=@preferred_foods,avoided_foods=@avoided_foods,allergies=@allergies,meals_per_day=@meals_per_day,food_budget=@food_budget`).run({...p,user_id:req.user.id});
  res.json({message:"Profile saved."});
});

app.get("/api/workout/today",auth,(req,res)=>{
  const profile=db.prepare("SELECT * FROM profiles WHERE user_id=?").get(req.user.id);
  if(!profile) return res.status(400).json({error:"Complete your profile first."});
  const plan=buildRulePlan(profile);
  const day=((new Date().getDay()+6)%7)+1;
  const active=plan[(day-1)%plan.length];
  res.json({plan,today:active,nutrition:nutrition(profile,active.split)});
});

app.post("/api/workout/complete",auth,(req,res)=>{
  const {split_name,duration_minutes,completed_exercises,total_exercises}=req.body;
  db.prepare(`INSERT INTO workout_logs(user_id,workout_date,split_name,duration_minutes,completed_exercises,total_exercises,completed)
  VALUES(?,?,?,?,?,?,1)`).run(req.user.id,today(),split_name||"Workout",duration_minutes||0,completed_exercises||0,total_exercises||0);
  res.json({message:"Workout saved."});
});

app.get("/api/progress",auth,(req,res)=>{
  const logs=db.prepare(`SELECT workout_date,split_name,duration_minutes,completed_exercises,total_exercises
  FROM workout_logs WHERE user_id=? ORDER BY workout_date DESC LIMIT 30`).all(req.user.id);
  const completed=logs.length;
  const minutes=logs.reduce((s,x)=>s+(x.duration_minutes||0),0);
  res.json({completed,minutes,logs});
});

app.post("/api/feedback",auth,(req,res)=>{
  const {difficulty,comment}=req.body;
  db.prepare("INSERT INTO feedback(user_id,week_start,difficulty,comment) VALUES(?,?,?,?)")
    .run(req.user.id,today(),difficulty||"moderate",comment||"");
  res.json({message:"Feedback saved."});
});

app.post("/api/ai/plan",auth,async(req,res)=>{
  const profile=db.prepare("SELECT * FROM profiles WHERE user_id=?").get(req.user.id);
  if(!profile) return res.status(400).json({error:"Complete your profile first."});
  try{
    const plan=await geminiPlan(profile);
    if(!plan) return res.json({source:"rules",plan:buildRulePlan(profile),message:"Gemini is not configured; showing the built-in personalized rule plan."});
    db.prepare("INSERT INTO ai_plans(user_id,week_start,plan_json) VALUES(?,?,?)").run(req.user.id,today(),JSON.stringify(plan));
    res.json({source:"gemini",plan});
  }catch(e){res.status(502).json({error:"AI plan could not be generated right now.",details:e.message});}
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"../frontend/index.html")));

app.listen(PORT,()=>console.log(`SMART FIT AI running at http://localhost:${PORT}`));
