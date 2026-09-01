/* =====================================================
   SMART FIT AI - MAIN SCRIPT
   Navigation + Common Functions
===================================================== */


/* =====================================================
   GO TO FITNESS PROFILE
===================================================== */

function goToProfile() {

    window.location.href = "profile.html";

}


/* =====================================================
   SCROLL TO FEATURES
===================================================== */

function scrollToFeatures() {

    const features =
        document.getElementById("features");

    if (features) {

        features.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =====================================================
   GO TO DASHBOARD
===================================================== */

function goToDashboard() {

    window.location.href = "dashboard.html";

}


/* =====================================================
   GO TO WORKOUT
===================================================== */

function goToWorkout() {

    window.location.href = "workout.html";

}


/* =====================================================
   GO TO NUTRITION
===================================================== */

function goToNutrition() {

    window.location.href = "nutrition.html";

}


/* =====================================================
   GO TO PROGRESS
===================================================== */

function goToProgress() {

    window.location.href = "progress.html";

}


/* =====================================================
   GO HOME
===================================================== */

function goToHome() {

    window.location.href = "index.html";

}


/* =====================================================
   GO BACK
===================================================== */

function goBack() {

    window.history.back();

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SMART FIT AI script loaded successfully."
        );

    }
);