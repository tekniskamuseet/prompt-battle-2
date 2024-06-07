const getElement = (id) => document.getElementById(id);

const elements = {
    nameForm: getElement("nameForm"),
    promptForm: getElement("promptForm"),
    score: getElement("score"),
    imageResult: getElement("imageResult"),
    userNameSpan: getElement("userName"),
    nameInput: getElement("nameInput"),
    resetClientsButton: getElement("resetClientsButton"),
    nameSubmitButton: getElement("nameSubmitButton"),
    textInput: getElement("textInput"),
    promptSubmitButton: getElement("promptSubmitButton"),
    generatedImage: getElement("generatedImage"),
    tryAgainButton: getElement("tryAgainButton"),
    colorChangeButton: getElement("colorChangeButton"),
    restartButton: getElement("restartButton"),
    errorMessage: getElement("errorMessage"),
    timerDisplay: getElement("timer"),
};

let countdown;
let socket = new WebSocket("wss://prompt-battle-server.glitch.me");
let userName = "";

const startTimer = () => {
    let timeLeft = 60;
    elements.timerDisplay.textContent = timeLeft;

    countdown = setInterval(() => {
        elements.timerDisplay.textContent = --timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            submitPrompt();
        }
    }, 1000);
};

const clearTimer = () => clearInterval(countdown);

const focusInput = (input) => input.focus();

const handleKeyPress = (input, button) => {
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            button.click();
        }
    });
};

const resetForm = (fullReset = false) => {
    clearTimer();
    elements.textInput.value = "";
    elements.generatedImage.src = "";
    elements.imageResult.style.display = "none";
    elements.promptForm.style.display = "block";
    elements.textInput.disabled = false;
    elements.promptSubmitButton.disabled = false;
    elements.errorMessage.textContent = "";
    if (fullReset) {
        elements.nameInput.value = "";
        elements.nameInput.focus();
        elements.errorMessage.textContent = "";
        elements.timerDisplay.textContent = "60";
        elements.nameForm.style.display = "block";
        elements.promptForm.style.display = "none";
    } else {
        startTimer();
    }
};

const submitPrompt = () => {
    const promptText = elements.textInput.value.trim();
    if (!promptText) {
        alert("Please enter your prompt.");
        return;
    }

    elements.textInput.disabled = true;
    elements.promptSubmitButton.disabled = true;
    elements.errorMessage.textContent = "";
    clearTimer();

    socket.send(
        JSON.stringify({
            type: "generateImage",
            payload: { prompt: promptText },
        })
    );
};

const handleSocketMessage = (event) => {
    console.log(event)
    const data = JSON.parse(event.data);
    const type = data.type;

    switch (type) {
        case "imageGenerated":
            elements.imageResult.querySelector("h1").textContent = `"${data.prompt}"`;
            elements.generatedImage.src = data.imageUrl;
            elements.promptForm.style.display = "none";
            elements.imageResult.style.display = "block";
            break;
        case "reset":
            location.reload()
            break;
        case "setScore":
            elements.score.textContent = data.score;
            break;
        case "error":
            elements.errorMessage.textContent = data.message;
            elements.textInput.disabled = false;
            elements.promptSubmitButton.disabled = false;
            break;
        default:
            console.warn("Unknown message type received:", type);
            break;
    }
};

// Event listeners for UI interactions
elements.nameSubmitButton.addEventListener("click", () => {
    userName = elements.nameInput.value.trim();
    if (!userName) {
        alert("Please enter your name.");
        return;
    }
    elements.userNameSpan.textContent = userName;
    elements.nameForm.style.display = "none";
    elements.promptForm.style.display = "block";
    focusInput(elements.textInput);
    startTimer();
});

elements.promptSubmitButton.addEventListener("click", submitPrompt);
elements.tryAgainButton.addEventListener("click", () => resetForm());
elements.restartButton.addEventListener("click", () => resetForm(true));
elements.colorChangeButton.addEventListener("click", () => document.body.classList.toggle("player-2"));

handleKeyPress(elements.nameInput, elements.nameSubmitButton);
handleKeyPress(elements.textInput, elements.promptSubmitButton);

// WebSocket event listeners
socket.addEventListener("open", () => console.log("WebSocket connection established."));
socket.addEventListener("message", handleSocketMessage);
socket.addEventListener("close", () => console.log("WebSocket connection closed."));
socket.addEventListener("error", (error) => console.error("WebSocket error:", error));
