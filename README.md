# SMART FIT AI

A beginner-friendly full-stack fitness project based on the SMART FIT AI concept.

## Stack
- HTML/CSS/JavaScript frontend
- Node.js + Express backend
- SQLite database (easy local setup)
- Gemini API integration using the current Google GenAI JavaScript SDK

## Run
1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your Gemini API key in `.env` if you want AI plan generation.
6. Run `npm start`.
7. Open `http://localhost:3000`.

The server automatically creates `database/smartfit.db`.

## Features in this starter
- Registration/login
- Fitness profile
- Food preferences
- Rule-based personalized workout split
- Exercise database
- Daily dashboard
- Workout completion logs
- Progress page
- Weekly feedback
- Gemini AI weekly plan endpoint

## Notes
- The app intentionally uses SQLite for the runnable starter because it requires no separate database server. The included `database/schema.sql` is portable to SQLite and can be adapted to MySQL later.
- The AI key stays on the server; do not put it in frontend JavaScript.
- Nutrition is general wellness guidance, not medical advice.
- Camera/pose form checking is not included in this starter; it should be developed and tested separately after the core app works.
