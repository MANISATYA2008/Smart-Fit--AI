PRAGMA foreign_keys = ON;

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
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO exercises
(id,name,muscle_group,equipment,difficulty,instructions,mistakes,tutorial_url) VALUES
(1,'Bodyweight Squat','Legs','Bodyweight','Beginner','Stand with feet comfortable, sit back under control, then stand tall.','Knees collapsing inward; rushing the movement.',''),
(2,'Push-Up','Chest','Bodyweight','Beginner','Keep a straight body line, lower under control, and press back up.','Sagging hips; flaring elbows excessively.',''),
(3,'Dumbbell Goblet Squat','Legs','Dumbbells','Beginner','Hold one dumbbell near the chest and squat under control.','Rounding the back; losing foot contact.',''),
(4,'Dumbbell Row','Back','Dumbbells','Beginner','Brace your torso and pull the dumbbell toward your hip.','Twisting the torso; jerking the weight.',''),
(5,'Dumbbell Shoulder Press','Shoulders','Dumbbells','Beginner','Press dumbbells overhead while keeping your trunk stable.','Overarching the lower back; uncontrolled lowering.',''),
(6,'Dumbbell Biceps Curl','Arms','Dumbbells','Beginner','Curl the weights while keeping upper arms mostly still.','Swinging the body; dropping the weight quickly.',''),
(7,'Dumbbell Triceps Extension','Arms','Dumbbells','Beginner','Use a controlled elbow extension with the upper arms stable.','Excessive elbow flare; rushing.',''),
(8,'Calf Raise','Calves','Bodyweight','Beginner','Rise onto the balls of the feet and lower slowly.','Bouncing; using momentum.',''),
(9,'Glute Bridge','Glutes','Bodyweight','Beginner','Lie on your back, drive through your feet, and lift your hips comfortably.','Overarching the back; moving too fast.',''),
(10,'Plank','Core','Bodyweight','Beginner','Maintain a comfortable straight-line position and brace the core.','Holding breath; letting hips sag.','');
