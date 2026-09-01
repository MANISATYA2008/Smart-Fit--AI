/* =========================================
   SMART FIT AI - GYM CHATBOX
   General Fitness AI Assistant
========================================= */


/* =========================================
   SEND MESSAGE
========================================= */

function sendMessage() {

    const input = document.getElementById("userInput");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    addUserMessage(message);

    input.value = "";

    const thinkingId = addThinkingMessage();

    setTimeout(() => {

        removeThinkingMessage(thinkingId);

        const answer = generateGymAnswer(message);

        addBotMessage(answer);

    }, 500);

}


/* =========================================
   ENTER KEY
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("userInput");

    if (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        });

    }

});


/* =========================================
   QUICK QUESTION
========================================= */

function askQuestion(question) {

    const input = document.getElementById("userInput");

    if (!input) return;

    input.value = question;

    sendMessage();

}


/* =========================================
   USER MESSAGE
========================================= */

function addUserMessage(message) {

    const container =
        document.getElementById("chatMessages");

    if (!container) return;

    const div =
        document.createElement("div");

    div.className = "user-message";

    div.innerHTML = `

        <div class="user-message-content">

            ${escapeHTML(message)}

        </div>

    `;

    container.appendChild(div);

    scrollChat();

}


/* =========================================
   BOT MESSAGE
========================================= */

function addBotMessage(message) {

    const container =
        document.getElementById("chatMessages");

    if (!container) return;

    const div =
        document.createElement("div");

    div.className = "bot-message";

    div.innerHTML = `

        <div class="message-icon">
            🤖
        </div>

        <div class="message-content">

            <strong>Gym AI</strong>

            ${message}

        </div>

    `;

    container.appendChild(div);

    scrollChat();

}


/* =========================================
   THINKING MESSAGE
========================================= */

function addThinkingMessage() {

    const container =
        document.getElementById("chatMessages");

    if (!container) return null;

    const id =
        "thinking-" + Date.now();

    const div =
        document.createElement("div");

    div.id = id;

    div.className = "bot-message";

    div.innerHTML = `

        <div class="message-icon">
            🤖
        </div>

        <div class="message-content">

            <strong>Gym AI</strong>

            <p class="thinking-text">
                Thinking...
            </p>

        </div>

    `;

    container.appendChild(div);

    scrollChat();

    return id;

}


/* =========================================
   REMOVE THINKING
========================================= */

function removeThinkingMessage(id) {

    if (!id) return;

    const element =
        document.getElementById(id);

    if (element) {

        element.remove();

    }

}


/* =========================================
   SCROLL CHAT
========================================= */

function scrollChat() {

    const chat =
        document.getElementById("chatMessages");

    if (!chat) return;

    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================================
   MAIN AI BRAIN
========================================= */

function generateGymAnswer(message) {

    const text =
        message
        .toLowerCase()
        .trim();


    /* =====================================
       GREETINGS
    ===================================== */

    if (
        /^(hi|hello|hey|hii|helo|good morning|good afternoon|good evening)\b/
        .test(text)
    ) {

        return `

            <p>👋 <strong>Hello!</strong></p>

            <p>
                I'm <strong>Gym AI</strong>, your
                fitness assistant.
            </p>

            <p>
                You can ask me about workouts,
                exercises, nutrition, recovery,
                cardio, gym equipment, training
                plans, fitness terms and more.
            </p>

            <p>
                💬 Ask your question naturally.
            </p>

        `;

    }


    /* =====================================
       WHO ARE YOU
    ===================================== */

    if (
        text.includes("who are you") ||
        text.includes("what are you") ||
        text.includes("what can you do")
    ) {

        return `

            <p>
                🤖 I'm <strong>Gym AI</strong>,
                the fitness assistant inside
                SMART FIT AI.
            </p>

            <p>
                I can explain workouts, exercises,
                nutrition basics, recovery, cardio,
                gym equipment, training principles
                and general fitness topics.
            </p>

            <p>
                You can ask questions in your own
                words instead of selecting only
                predefined questions.
            </p>

        `;

    }


    /* =====================================
       SETS + REPS
    ===================================== */

    if (
        (
            text.includes("set") ||
            text.includes("sets")
        ) &&
        (
            text.includes("rep") ||
            text.includes("repetition")
        )
    ) {

        return `

            <p>
                💪 <strong>Sets</strong> are groups
                or rounds of an exercise.
            </p>

            <p>
                🔢 <strong>Reps</strong> means the
                number of times you perform a movement.
            </p>

            <p>
                Example:
                <strong>3 sets × 10 reps</strong>
                means doing 10 repetitions, resting,
                and repeating the set three times.
            </p>

        `;

    }


    /* =====================================
       REPS
    ===================================== */

    if (
        text.includes("what is a rep") ||
        text.includes("what are reps") ||
        text.includes("reps meaning") ||
        text.includes("repetition")
    ) {

        return `

            <p>
                🔢 A <strong>rep</strong> means one
                complete repetition of an exercise.
            </p>

            <p>
                For example, one complete squat
                counts as one rep.
            </p>

        `;

    }


    /* =====================================
       SETS
    ===================================== */

    if (
        text.includes("what is a set") ||
        text.includes("what are sets") ||
        text.includes("sets meaning")
    ) {

        return `

            <p>
                💪 A <strong>set</strong> is a group
                of repetitions performed together.
            </p>

            <p>
                Example:
                3 sets of 10 reps means doing
                10 reps, resting, then repeating.
            </p>

        `;

    }


    /* =====================================
       WARM UP
    ===================================== */

    if (
        text.includes("warm up") ||
        text.includes("warm-up") ||
        text.includes("before gym") ||
        text.includes("before workout")
    ) {

        return `

            <p>
                🔥 A warm-up prepares your body
                for exercise.
            </p>

            <p>
                You can begin with a few minutes
                of easy movement such as walking
                or cycling.
            </p>

            <p>
                Then use suitable dynamic movements
                and start your actual exercise
                gradually.
            </p>

        `;

    }


    /* =====================================
       AFTER WORKOUT
    ===================================== */

    if (
        text.includes("after workout") ||
        text.includes("post workout") ||
        text.includes("after gym")
    ) {

        return `

            <p>
                🥗 After training, focus on normal
                balanced nutrition and hydration.
            </p>

            <p>
                A balanced meal can include:
            </p>

            <p>
                💪 Protein<br>
                🍚 Carbohydrates<br>
                🥗 Vegetables or fruit<br>
                💧 Water
            </p>

            <p>
                Recovery also includes adequate
                rest and sleep.
            </p>

        `;

    }


    /* =====================================
       REST
    ===================================== */

    if (
        (
            text.includes("rest") ||
            text.includes("break")
        ) &&
        (
            text.includes("set") ||
            text.includes("between")
        )
    ) {

        return `

            <p>
                ⏱️ Rest between sets depends on
                the exercise and your training goal.
            </p>

            <p>
                For many resistance exercises,
                around <strong>1–3 minutes</strong>
                can be a useful general starting
                range.
            </p>

            <p>
                Rest enough to perform the next
                set with good technique.
            </p>

        `;

    }


    /* =====================================
       PROTEIN
    ===================================== */

    if (
        text.includes("protein") ||
        text.includes("high protein")
    ) {

        return `

            <p>
                💪 <strong>Protein</strong> is a
                nutrient that helps your body build
                and repair tissues.
            </p>

            <p>
                Common food sources include eggs,
                milk, curd, paneer, dal, beans,
                tofu, soy foods, chicken and fish.
            </p>

            <p>
                Your overall diet matters more than
                focusing on one food.
            </p>

        `;

    }


    /* =====================================
       CARBOHYDRATES
    ===================================== */

    if (
        text.includes("carbohydrate") ||
        text.includes("carbs") ||
        text.includes("carb")
    ) {

        return `

            <p>
                🍚 <strong>Carbohydrates</strong>
                are an important source of energy.
            </p>

            <p>
                Sources include rice, oats,
                potatoes, fruits, bread and chapati.
            </p>

            <p>
                Carbohydrates are not automatically
                bad. The appropriate amount depends
                on your overall diet and activity.
            </p>

        `;

    }


    /* =====================================
       CALORIES
    ===================================== */

    if (
        text.includes("calorie") ||
        text.includes("calories")
    ) {

        return `

            <p>
                🔥 <strong>Calories</strong> measure
                energy provided by food and drinks.
            </p>

            <p>
                Energy needs vary based on factors
                such as age, body size, activity level
                and training.
            </p>

            <p>
                There isn't one calorie target that
                works for everyone.
            </p>

        `;

    }


    /* =====================================
       CHEST
    ===================================== */

    if (
        text.includes("chest") ||
        text.includes("pec")
    ) {

        return `

            <p>
                🏋️ Common chest exercises include:
            </p>

            <p>
                • Machine chest press<br>
                • Dumbbell press<br>
                • Push-ups<br>
                • Cable or machine fly variations
            </p>

            <p>
                Focus on controlled movement and
                appropriate resistance.
            </p>

        `;

    }


    /* =====================================
       BACK
    ===================================== */

    if (
        text.includes("back workout") ||
        text.includes("back exercise") ||
        text.includes("lats")
    ) {

        return `

            <p>
                🏋️ Common back exercises include:
            </p>

            <p>
                • Lat pulldown<br>
                • Seated cable row<br>
                • Chest-supported row<br>
                • Assisted pull-up
            </p>

            <p>
                Focus on controlled movement instead
                of simply using heavier weights.
            </p>

        `;

    }


    /* =====================================
       SHOULDERS
    ===================================== */

    if (
        text.includes("shoulder")
    ) {

        return `

            <p>
                🏋️ Shoulder training can include:
            </p>

            <p>
                • Dumbbell shoulder press<br>
                • Machine shoulder press<br>
                • Lateral raises<br>
                • Rear-delt exercises
            </p>

            <p>
                Use manageable resistance and
                controlled movement.
            </p>

        `;

    }


    /* =====================================
       ARMS
    ===================================== */

    if (
        text.includes("bicep") ||
        text.includes("biceps") ||
        text.includes("tricep") ||
        text.includes("triceps") ||
        text.includes("arm workout")
    ) {

        return `

            <p>
                💪 Arm training can include:
            </p>

            <p>
                <strong>Biceps:</strong><br>
                • Dumbbell curls<br>
                • Cable curls
            </p>

            <p>
                <strong>Triceps:</strong><br>
                • Cable pushdowns<br>
                • Overhead extensions
            </p>

            <p>
                Keep the movement controlled.
            </p>

        `;

    }


    /* =====================================
       LEGS
    ===================================== */

    if (
        text.includes("leg") ||
        text.includes("quad") ||
        text.includes("hamstring") ||
        text.includes("calf")
    ) {

        return `

            <p>
                🦵 Leg training can involve several
                muscle groups.
            </p>

            <p>
                Examples:
            </p>

            <p>
                • Squats or suitable variations<br>
                • Leg press<br>
                • Leg curls<br>
                • Calf raises
            </p>

            <p>
                Learn the movement first and progress
                gradually.
            </p>

        `;

    }


    /* =====================================
       CARDIO
    ===================================== */

    if (
        text.includes("cardio") ||
        text.includes("treadmill") ||
        text.includes("running") ||
        text.includes("cycling") ||
        text.includes("walking")
    ) {

        return `

            <p>
                🏃 Cardio includes walking,
                cycling, jogging and swimming.
            </p>

            <p>
                Choose an intensity appropriate
                for your fitness level and gradually
                increase duration or intensity.
            </p>

            <p>
                You don't need to make every cardio
                session exhausting.
            </p>

        `;

    }


    /* =====================================
       MUSCLE BUILDING
    ===================================== */

    if (
        text.includes("build muscle") ||
        text.includes("gain muscle") ||
        text.includes("muscle growth") ||
        text.includes("hypertrophy")
    ) {

        return `

            <p>
                💪 Muscle development is supported by
                consistent resistance training,
                sufficient nutrition and recovery.
            </p>

            <p>
                Important principles include:
            </p>

            <p>
                • Good technique<br>
                • Gradual progression<br>
                • Adequate nutrition<br>
                • Enough recovery
            </p>

            <p>
                Results take time, so consistency
                matters.
            </p>

        `;

    }


    /* =====================================
       FAT LOSS
    ===================================== */

    if (
        text.includes("fat loss") ||
        text.includes("lose fat") ||
        text.includes("weight loss") ||
        text.includes("cutting")
    ) {

        return `

            <p>
                📉 Fat loss generally involves an
                energy deficit maintained over time.
            </p>

            <p>
                A balanced approach can include
                regular activity, resistance training,
                nutritious meals and adequate sleep.
            </p>

            <p>
                Avoid extreme dieting or rapid
                changes.
            </p>

        `;

    }


    /* =====================================
       WEIGHT GAIN
    ===================================== */

    if (
        text.includes("weight gain") ||
        text.includes("gain weight") ||
        text.includes("bulk")
    ) {

        return `

            <p>
                📈 Healthy weight gain can involve
                gradually increasing nutritious food
                intake.
            </p>

            <p>
                Resistance training can also support
                muscle development.
            </p>

            <p>
                Avoid relying only on highly processed
                foods.
            </p>

        `;

    }


    /* =====================================
       PROGRESSIVE OVERLOAD
    ===================================== */

    if (
        text.includes("progressive overload") ||
        text.includes("increase weight") ||
        text.includes("progression")
    ) {

        return `

            <p>
                📈 <strong>Progressive overload</strong>
                means gradually increasing the
                challenge of training.
            </p>

            <p>
                This can involve gradually increasing
                resistance, repetitions, sets,
                difficulty or improving technique.
            </p>

            <p>
                Don't change everything at once.
            </p>

        `;

    }


    /* =====================================
       HYDRATION
    ===================================== */

    if (
        text.includes("water") ||
        text.includes("hydration")
    ) {

        return `

            <p>
                💧 Hydration is important for normal
                body function and exercise performance.
            </p>

            <p>
                Drink regularly throughout the day
                and replace fluids lost through
                sweating.
            </p>

            <p>
                Needs vary depending on temperature,
                activity and sweat loss.
            </p>

        `;

    }


    /* =====================================
       SLEEP
    ===================================== */

    if (
        text.includes("sleep") ||
        text.includes("sleeping") ||
        text.includes("recovery")
    ) {

        return `

            <p>
                😴 Recovery is an important part
                of training.
            </p>

            <p>
                Good sleep supports normal physical
                recovery, energy and overall health.
            </p>

            <p>
                Maintain a consistent sleep schedule
                and allow enough recovery between
                demanding workouts.
            </p>

        `;

    }


    /* =====================================
       EQUIPMENT
    ===================================== */

    if (
        text.includes("equipment") ||
        text.includes("machine") ||
        text.includes("dumbbell") ||
        text.includes("barbell") ||
        text.includes("cable")
    ) {

        return `

            <p>
                🏋️ Gym equipment is designed for
                different types of resistance training.
            </p>

            <p>
                <strong>Dumbbells:</strong>
                useful for free-weight exercises.
            </p>

            <p>
                <strong>Machines:</strong>
                provide guided resistance for many
                exercises.
            </p>

            <p>
                <strong>Cables:</strong>
                provide adjustable resistance for
                many movement patterns.
            </p>

            <p>
                Tell me the name of a specific machine
                and I can explain its general use.
            </p>

        `;

    }


    /* =====================================
       WORKOUT PLAN
    ===================================== */

    if (
        text.includes("workout plan") ||
        text.includes("workout routine") ||
        text.includes("training plan") ||
        text.includes("workout schedule")
    ) {

        return `

            <p>
                🏋️ A workout plan depends on your
                goal, experience, available days,
                equipment and recovery.
            </p>

            <p>
                A balanced plan can include resistance
                training and appropriate cardiovascular
                activity.
            </p>

            <p>
                Tell me your goal, available days
                and training location and I can
                suggest a suitable structure.
            </p>

        `;

    }


    /* =====================================
       EXERCISE TECHNIQUE
    ===================================== */

    if (
        text.includes("form") ||
        text.includes("technique") ||
        text.includes("correct way") ||
        text.includes("how to do")
    ) {

        return `

            <p>
                🎯 Good exercise technique means
                controlling the movement and using
                a range of motion that you can perform
                safely.
            </p>

            <p>
                Avoid sacrificing technique just to
                lift more weight.
            </p>

            <p>
                Give me the exercise name and I can
                explain its general technique.
            </p>

        `;

    }


    /* =====================================
       MOTIVATION
    ===================================== */

    if (
        text.includes("motivation") ||
        text.includes("motivated") ||
        text.includes("lazy")
    ) {

        return `

            <p>
                🔥 Motivation changes from day to day,
                so don't depend on motivation alone.
            </p>

            <p>
                Build a simple routine, set realistic
                goals and focus on consistency.
            </p>

            <p>
                Small consistent steps can be more
                useful than waiting for perfect
                motivation.
            </p>

        `;

    }


    /* =====================================
       DIET / FOOD
    ===================================== */

    if (
        text.includes("diet") ||
        text.includes("food") ||
        text.includes("meal") ||
        text.includes("nutrition")
    ) {

        return `

            <p>
                🥗 A balanced fitness diet can include:
            </p>

            <p>
                💪 Protein sources<br>
                🍚 Carbohydrates<br>
                🥬 Vegetables<br>
                🍎 Fruits<br>
                🥛 Dairy or suitable alternatives<br>
                💧 Water
            </p>

            <p>
                The right amount depends on individual
                needs and goals.
            </p>

        `;

    }


    /* =====================================
       BEST WORKOUT TIME
    ===================================== */

    if (
        text.includes("when should i workout") ||
        text.includes("best time") ||
        text.includes("morning workout") ||
        text.includes("evening workout")
    ) {

        return `

            <p>
                🕐 There isn't one universally best
                workout time.
            </p>

            <p>
                The best time is generally one that
                fits your schedule and allows you to
                train consistently.
            </p>

            <p>
                Morning and evening workouts can both
                work well.
            </p>

        `;

    }


    /* =====================================
       DIZZINESS / SERIOUS SYMPTOMS
    ===================================== */

    if (
        text.includes("dizzy") ||
        text.includes("faint") ||
        text.includes("fainting") ||
        text.includes("severe pain") ||
        text.includes("chest pain") ||
        text.includes("difficulty breathing")
    ) {

        return `

            <p>
                ⚠️ If you feel seriously unwell during
                exercise, stop the activity.
            </p>

            <p>
                Tell a responsible adult and seek
                appropriate medical help, especially
                for severe or concerning symptoms.
            </p>

            <p>
                Gym AI cannot diagnose medical
                conditions.
            </p>

        `;

    }


    /* =====================================
       INJURY / PAIN
    ===================================== */

    if (
        text.includes("injury") ||
        text.includes("injured") ||
        text.includes("hurt") ||
        text.includes("pain")
    ) {

        return `

            <p>
                ⚠️ Pain during exercise shouldn't
                simply be ignored.
            </p>

            <p>
                Stop the movement if it causes sharp,
                severe or unusual pain.
            </p>

            <p>
                If the problem continues or concerns
                you, talk to a qualified healthcare
                professional.
            </p>

        `;

    }


    /* =====================================
       GENERAL FITNESS TERMS
    ===================================== */

    if (
        text.includes("fitness") ||
        text.includes("gym") ||
        text.includes("exercise") ||
        text.includes("training")
    ) {

        return `

            <p>
                🤖 <strong>Sure!</strong> I can help
                explain that fitness topic.
            </p>

            <p>
                You can ask me specifically about
                exercises, workouts, training,
                nutrition, recovery, cardio,
                equipment, sets, reps or technique.
            </p>

            <p>
                For example:
                <strong>
                    "How does progressive overload work?"
                </strong>
            </p>

        `;

    }


    /* =====================================
       THANK YOU
    ===================================== */

    if (
        text.includes("thank you") ||
        text.includes("thanks")
    ) {

        return `

            <p>
                😊 You're welcome!
            </p>

            <p>
                Ask me another fitness question
                whenever you want.
            </p>

        `;

    }


    /* =====================================
       DEFAULT
    ===================================== */

    return `

        <p>
            🤖 <strong>Good question!</strong>
        </p>

        <p>
            I can help with many general fitness
            topics, but I need a little more context
            to give you a useful answer.
        </p>

        <p>
            You can ask naturally about:
        </p>

        <p>
            🏋️ Exercises & workouts<br>
            💪 Muscle training<br>
            🥗 Nutrition & food<br>
            🍚 Protein & carbohydrates<br>
            🔥 Fat loss<br>
            📈 Muscle development<br>
            🏃 Cardio<br>
            🏋️ Gym equipment<br>
            🔢 Sets & reps<br>
            ⏱️ Rest & recovery<br>
            😴 Sleep<br>
            💧 Hydration<br>
            🎯 Exercise technique
        </p>

        <p>
            Example:
            <strong>
                "Why do my muscles feel tired after
                training?"
            </strong>
        </p>

    `;

}


/* =========================================
   SECURITY
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}