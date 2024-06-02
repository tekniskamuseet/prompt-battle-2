const getElement = (id) => document.getElementById(id);

const nameForm = getElement("nameForm");
const promptForm = getElement("promptForm");
const imageResult = getElement("imageResult");
const userNameSpan = getElement("userName");
const nameInput = getElement("nameInput");
const nameSubmitButton = getElement("nameSubmitButton");
const textInput = getElement("textInput");
const promptSubmitButton = getElement("promptSubmitButton");
const generatedImage = getElement("generatedImage");
const tryAgainButton = getElement("tryAgainButton");
const colorChangeButton = getElement("colorChangeButton");
const restartButton = getElement("restartButton");
const errorMessage = getElement("errorMessage");
const timerDisplay = getElement("timer");

let userName = "";
let countdown;
let socket;

nameInput.focus();
textInput.focus();

nameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission behavior
        nameSubmitButton.click(); // Simulate a click on the submit button
    }
});

textInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission behavior
        promptSubmitButton.click(); // Simulate a click on the submit button
    }
});

const startTimer = () => {
    let timeLeft = 60;
    timerDisplay.textContent = timeLeft;

    countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            submitPrompt();
        }
    }, 1000);
};

const submitPrompt = () => {
    const promptText = textInput.value.trim();
    if (promptText === "") {
        alert("Please enter your prompt.");
        return;
    }

    // Disable input and button
    textInput.disabled = true;
    promptSubmitButton.disabled = true;
    errorMessage.textContent = "";

    const data = {
        prompt: promptText
    };

    console.log(data)

    socket.send(JSON.stringify(data));
};

const resetPromptForm = () => {
    clearInterval(countdown); // Clear the timer when resetting the prompt form
    textInput.value = "";
    generatedImage.src = "";
    imageResult.style.display = "none";
    promptForm.style.display = "block";
    startTimer();
};

const resetExperience = () => {
    clearInterval(countdown); // Clear the timer when resetting the experience
    textInput.value = "";
    nameInput.value = "";
    nameInput.focus();
    generatedImage.src = "";
    errorMessage.textContent = "";
    timerDisplay.textContent = "60";
    imageResult.style.display = "none";
    promptForm.style.display = "none";
    nameForm.style.display = "block";
};

const colorChange = () => {
    document.body.classList.toggle("player-2");
};

nameSubmitButton.addEventListener("click", () => {
    userName = nameInput.value.trim();
    if (userName === "") {
        alert("Please enter your name.");
        return;
    }
    userNameSpan.textContent = userName;
    nameForm.style.display = "none";
    promptForm.style.display = "block";
    textInput.focus();
    startTimer();
});

promptSubmitButton.addEventListener("click", () => {
    clearInterval(countdown); // Clear the timer when "Submit Prompt" is clicked
    submitPrompt();
});

tryAgainButton.addEventListener("click", resetPromptForm);
restartButton.addEventListener("click", resetExperience);

// WebSocket connection to Glitch server
socket = new WebSocket("wss://prompt-battle-server.glitch.me");

socket.onopen = function(event) {
    console.log("WebSocket connection established.");
};

socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    const promptText = message.prompt;
    const imageUrl = message.imageUrl;

    if (promptText && imageUrl) {
        imageResult.querySelector("h1").textContent = `"${promptText}"`;
        generatedImage.src = imageUrl;
        promptForm.style.display = "none";
        imageResult.style.display = "block";
    }
};

socket.onclose = function(event) {
    console.log("WebSocket connection closed.");
};

socket.onerror = function(error) {
    console.error("WebSocket error:", error);
};