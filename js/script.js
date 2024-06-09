const getElement = (id) => document.querySelector(id);

const elements = {
    step1: getElement("#step-1"),
    step2: getElement("#step-2"),
    step3: getElement("#step-3"),
    playerScore: getElement("#playerScore"),
    playerName: getElement("#playerName"),
    timer: getElement("#timer"),
    imageResult: getElement("#imageResult"),
    nameInput: getElement("#nameInput"),
    resetClientsButton: getElement("#resetClientsButton"),
    nameSubmitButton: getElement("#nameSubmitButton"),
    promptInput: getElement("#promptInput"),
    promptText: getElement("#promptText"),
    promptSubmitButton: getElement("#promptSubmitButton"),
    generatedImage: getElement("#generatedImage"),
    tryAgainButton: getElement("#tryAgainButton"),
    restartButton: getElement("#restartButton"),
    errorMessage: getElement("#errorMessage"),
    scoreIncreaseAudio: getElement("#scoreIncreaseAudio"),
    generatingImageAudio: getElement("#generatingImageAudio"),
};

let p1_color = localStorage.getItem("p1_color") || "red";
let p2_color = localStorage.getItem("p2_color") || "blue";
document.documentElement.style.setProperty("--p1_color", p1_color);
document.documentElement.style.setProperty("--p2_color", p2_color);

let p1_score = localStorage.getItem("p1_score") || 0;
let p2_score = localStorage.getItem("p2_score") || 0;
document.documentElement.style.setProperty("--p1_score", `"${p1_score}"`);
document.documentElement.style.setProperty("--p2_score", `"${p2_score}"`);

let pid = localStorage.getItem("pid");

while (pid !== "1" && pid !== "2") {
    pid = prompt("Vilket spelar-ID är du (ange 1 eller 2)");
}

localStorage.setItem("pid", parseInt(pid));
document.body.setAttribute("data-pid", pid);
document.documentElement.style.setProperty("--pid", `"${pid}"`);
elements.playerName.textContent = `Spelare #${pid}:`;

let socket = new WebSocket("wss://prompt-battle-server.glitch.me");

/* Start Game */

const submitName = () => {
    playerName = elements.nameInput.value.trim();
    if (!playerName) {
        alert("Fyll i ditt namn.");
        return;
    }
    document.documentElement.style.setProperty("--player_name", `"${playerName}"`);
    document.body.setAttribute("data-step", 2);
    focusInput(elements.promptInput);
    startTimer();
};

/* Timer Logic */

let countdown;
let duration = 60;

const startTimer = () => {
    let timeLeft = duration;
    setTimer(timeLeft);

    countdown = setInterval(() => {
        setTimer(--timeLeft);
        if (timeLeft <= 0) {
            clearInterval(countdown);
            submitPrompt();
        }
    }, 1000);
};

const setTimer = (timeLeft) => {
    elements.timer.textContent = `Du har ${--timeLeft} sekunder kvar…`;
};

const clearTimer = () => clearInterval(countdown);

/* UX */

const focusInput = (input) => input.focus();

const handleKeyPress = (input, button) => {
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            button.click();
        }
    });
};

/* Reset Logic */

const resetForm = (fullReset = false) => {
    document.body.setAttribute("data-step", 2);
    clearTimer();
    elements.errorMessage.textContent = "";
    elements.promptInput.value = "";
    elements.generatedImage.src = "";
    elements.promptInput.disabled = false;
    elements.promptSubmitButton.disabled = false;
    elements.errorMessage.textContent = "";
    startTimer();
};

/* AI Logic */

const submitPrompt = () => {
    const promptText = elements.promptInput.value.trim();
    if (!promptText) {
        alert("Fyll i din prompt.");
        return;
    }

    elements.timer.textContent = `Bilden genereras…`;
    generatingImageAudio.play();
    elements.promptText.textContent = promptText;
    elements.promptInput.disabled = true;
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

/* LISTENER */

elements.nameSubmitButton.addEventListener("click", () => submitName());
elements.promptSubmitButton.addEventListener("click", () => submitPrompt());
elements.tryAgainButton.addEventListener("click", () => resetForm());
elements.restartButton.addEventListener("click", () => location.reload());

handleKeyPress(elements.nameInput, elements.nameSubmitButton);
handleKeyPress(elements.promptInput, elements.promptSubmitButton);

/* socket logic */

const handleSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    const type = data.type;
    const payload = data.payload;
    console.log(payload)

    switch (type) {
        case "imageGenerated":
            elements.generatedImage.src = data.imageUrl;
            elements.timer.textContent = "";
            generatingImageAudio.pause();
            generatingImageAudio.currentTime = 0;
            document.body.setAttribute("data-step", 3);
            break;
        case "reset":
            localStorage.clear();
            location.reload();
            break;
        case "updateColor":
            document.documentElement.style.setProperty(
                "--p1_color",
                payload.p1_color
            );
            document.documentElement.style.setProperty(
                "--p2_color",
                payload.p2_color
            );
            localStorage.setItem("p1_color", payload.p1_color);
            localStorage.setItem("p2_color", payload.p2_color);
            break;
        case "updateScore":
            document.documentElement.style.setProperty(
                "--p1_score",
                `"${payload.p1_score}"`
            );
            document.documentElement.style.setProperty(
                "--p2_score",
                `"${payload.p2_score}"`
            );
            payload.p1_score = parseInt(payload.p1_score);
            payload.p2_score = parseInt(payload.p2_score);
            if (pid == 1 && payload.p1_score > p1_score) {
                playSound("scoreIncreaseAudio");
            }
            if (pid == 2 && payload.p2_score > p2_score) {
                playSound("scoreIncreaseAudio");
            }
            localStorage.setItem("p1_score", payload.p1_score);
            localStorage.setItem("p2_score", payload.p2_score);
            p1_score = payload.p1_score;
            p2_score = payload.p2_score;
            break;
        case "setDuration":
            duration = payload.duration;
            localStorage.setItem("duration", `"${payload.duration}"`);
            break;
        case "error":
            elements.errorMessage.textContent = data.message;
            elements.promptInput.disabled = false;
            elements.promptSubmitButton.disabled = false;
            break;
        default:
            console.warn("Unknown message type received:", type);
            break;
    }
};

socket.addEventListener("open", () => {
    console.log("WebSocket connection established.");
});
socket.addEventListener("message", handleSocketMessage);
socket.addEventListener("close", () =>
    console.log("WebSocket connection closed.")
);
socket.addEventListener("error", (error) =>
    console.error("WebSocket error:", error)
);

const playSound = (sound) => {
    console.log("playSound", sound);
    elements[sound].play();
};

focusInput(elements.nameInput);