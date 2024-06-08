// timer.js

// Dependencies and variables
const startTime = 60;
let countdown;

// Function to update the timer display
const setTimer = (timeLeft) => {
    const timerDisplay = document.getElementById("timer");
    if (timerDisplay) {
        timerDisplay.textContent = timeLeft;
    }
};

// Function to handle prompt submission
const submitPrompt = () => {
    // Placeholder for the submitPrompt function
    console.log("Time's up! Submitting prompt...");
};

// Start Timer function
export const startTimer = () => {
    let timeLeft = startTime;
    setTimer(timeLeft);

    countdown = setInterval(() => {
        setTimer(--timeLeft);
        if (timeLeft <= 0) {
            clearInterval(countdown);
            submitPrompt();
        }
    }, 1000);
};