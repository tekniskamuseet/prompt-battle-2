const getElement = (id) => document.getElementById(id);

const elements = {
    duration: "duration",
    p1_score: "p1_score",
    p2_score: "p2_score",
    p1_color: "p1_color",
    p2_color: "p2_color",
};

const socket = new WebSocket("wss://prompt-battle-server.glitch.me");

socket.addEventListener("open", () => {
    console.log("WebSocket connection established.");
});

const reset = () => send("reset");
const updateColor = () =>
    send("updateColor", {
        p1_color: elements.p1_color.value,
        p2_color: elements.p2_color.value,
    });
const updateScore = () =>
    send("updateScore", {
        p1_score: elements.p1_score.value,
        p2_score: elements.p2_score.value,
    });
const setDuration = () =>
    send("setDuration", {
        duration: elements.duration.value,
    });

const send = (type, data) => {
    console.log(type, data)
    socket.send(JSON.stringify({ type: type, payload: data }));
};

// Initialize elements with DOM elements
Object.keys(elements).forEach((key) => {
    elements[key] = getElement(elements[key]);
});
