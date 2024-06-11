const elements = (() => {
    const ids = [
        "step-1",
        "step-2",
        "step-3",
        "playerScore",
        "playerName",
        "timer",
        "imageResult",
        "nameInput",
        "resetClientsButton",
        "nameSubmitButton",
        "promptInput",
        "promptText",
        "promptSubmitButton",
        "generatedImage",
        "tryAgainButton",
        "restartButton",
        "errorMessage",
        "scoreIncreaseAudio",
        "generatingImageAudio",
    ];
    const query = (id) => document.querySelector(`#${id}`);
    return ids.reduce((acc, id) => ({ ...acc, [id]: query(id) }), {});
})();

const {
    playerName,
    nameInput,
    promptInput,
    promptSubmitButton,
    timer,
    errorMessage,
    generatedImage,
    nameSubmitButton,
    tryAgainButton,
    restartButton,
} = elements;

const setProperty = (property, value) =>
    document.body.style.setProperty(property, value);

const p1_color = localStorage.getItem("p1_color") || "red";
const p2_color = localStorage.getItem("p2_color") || "blue";
setProperty("--p1_color", p1_color);
setProperty("--p2_color", p2_color);

let p1_score = localStorage.getItem("p1_score") || 0;
let p2_score = localStorage.getItem("p2_score") || 0;
setProperty("--p1_score", `"${p1_score}"`);
setProperty("--p2_score", `"${p2_score}"`);

let pid = localStorage.getItem("pid");

while (pid !== "1" && pid !== "2") {
    pid = prompt("Vilket spelar-ID är du (ange 1 eller 2)");
}

localStorage.setItem("pid", pid);
document.body.setAttribute("data-pid", pid);
setProperty("--pid", `"${pid}"`);
playerName.textContent = `Spelare #${pid}:`;

const socket = new WebSocket("wss://prompt-battle-server.glitch.me");

const submitName = () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Fyll i ditt namn.");
        return;
    }
    setProperty("--player_name", `"${name}"`);
    document.body.setAttribute("data-step", 2);
    focusInput(promptInput);
    startTimer();
};

let countdown;
const duration = 60;

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
    timer.textContent = timeLeft
        ? `Du har ${timeLeft} sekunder kvar…`
        : `Tiden är slut!`;
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

const resetForm = () => {
    document.body.setAttribute("data-step", 2);
    clearTimer();
    errorMessage.textContent = "";
    promptInput.textContent = "";
    generatedImage.src = "";
    promptInput.disabled = false;
    promptSubmitButton.disabled = false;
    startTimer();
};

const submitPrompt = () => {
    const promptText = promptInput.textContent.trim();
    if (!promptText) {
        // alert("Fyll i din prompt.");
        return;
    }

    elements.generatingImageAudio.play();
    elements.promptText.textContent = promptText;
    promptInput.disabled = true;
    promptSubmitButton.innerHTML = `<marquee scrollamount="10">Bilden genereras…</marquee>`;
    promptSubmitButton.disabled = true;
    clearTimer();
    timer.textContent = ""

    socket.send(
        JSON.stringify({
            type: "generateImage",
            payload: { prompt: promptText },
        })
    );
};

nameSubmitButton.addEventListener("click", submitName);
promptSubmitButton.addEventListener("click", submitPrompt);
tryAgainButton.addEventListener("click", resetForm);
restartButton.addEventListener("click", () => location.reload());

handleKeyPress(nameInput, nameSubmitButton);
handleKeyPress(promptInput, promptSubmitButton);

socket.addEventListener("open", () =>
    console.log("WebSocket connection established.")
);
socket.addEventListener("message", (event) => {
    const { type, payload, imageUrl } = JSON.parse(event.data);
    switch (type) {
        case "imageGenerated":
            generatedImage.src = imageUrl;
            timer.textContent = "";
            elements.generatingImageAudio.pause();
            elements.generatingImageAudio.currentTime = 0;
            document.body.setAttribute("data-step", 3);
            break;
        case "reset":
            localStorage.clear();
            location.reload();
            break;
        case "updateColor":
            setProperty("--p1_color", payload.p1_color);
            setProperty("--p2_color", payload.p2_color);
            localStorage.setItem("p1_color", payload.p1_color);
            localStorage.setItem("p2_color", payload.p2_color);
            break;
        case "updateScore":
            setProperty("--p1_score", `"${payload.p1_score}"`);
            setProperty("--p2_score", `"${payload.p2_score}"`);
            payload.p1_score = parseInt(payload.p1_score);
            payload.p2_score = parseInt(payload.p2_score);
            if (pid == 1 && payload.p1_score > p1_score)
                playSound("scoreIncreaseAudio");
            if (pid == 2 && payload.p2_score > p2_score)
                playSound("scoreIncreaseAudio");
            localStorage.setItem("p1_score", payload.p1_score);
            localStorage.setItem("p2_score", payload.p2_score);
            p1_score = payload.p1_score;
            p2_score = payload.p2_score;
            break;
        case "setDuration":
            localStorage.setItem("duration", `"${payload.duration}"`);
            break;
        case "error":
            alert(
                "Oops! Det verkar som att din prompt fick DALL-E att rodna. Städa upp och försök igen!"
            );
            promptSubmitButton.textContent =
                promptSubmitButton.getAttribute("alt");
            promptInput.disabled = false;
            promptSubmitButton.disabled = false;
            startTimer();
            break;
        default:
            console.warn("Unknown message type received:", type);
            break;
    }
});
socket.addEventListener("close", () =>
    console.log("WebSocket connection closed.")
);
socket.addEventListener("error", (error) =>
    console.error("WebSocket error:", error)
);

const playSound = (sound) => {
    elements[sound].play();
};

focusInput(nameInput);
