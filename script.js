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
const restartButton = getElement("restartButton");
const errorMessage = getElement("errorMessage");
const timerDisplay = getElement("timer");

let userName = "";
let countdown;
let apiKey = "";

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
        alert("Var god och skriv in din prompt.");
        return;
    }

    // Disable input and button
    textInput.disabled = true;
    promptSubmitButton.disabled = true;
    errorMessage.textContent = "";

    const url = "https://api.openai.com/v1/images/generations";

    const data = {
        prompt: promptText,
        n: 1,
        size: "1024x1024",
    };

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    if (errorData.error && errorData.error.message) {
                        throw new Error(errorData.error.message);
                    }
                });
            }
            return response.json();
        })
        .then((result) => {
            const imageUrl = result.data[0].url;

            generatedImage.src = imageUrl;
            promptForm.style.display = "none";
            imageResult.style.display = "flex";
        })
        .catch((error) => {
            console.error("Error:", error);
            alert(error);
        })
        .finally(() => {
            // Re-enable input and button
            textInput.disabled = false;
            promptSubmitButton.disabled = false;
        });
};

const resetPromptForm = () => {
    clearInterval(countdown); // Clear the timer when resetting the prompt form
    textInput.value = "";
    generatedImage.src = "";
    imageResult.style.display = "none";
    promptForm.style.display = "flex";
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
    nameForm.style.display = "flex";
};

nameSubmitButton.addEventListener("click", () => {
    userName = nameInput.value.trim();
    if (userName === "") {
        alert("Var god och skriv in ditt namn.");
        return;
    }
    userNameSpan.textContent = userName;
    nameForm.style.display = "none";
    promptForm.style.display = "flex";
    textInput.focus();
    startTimer();
});

promptSubmitButton.addEventListener("click", () => {
    clearInterval(countdown); // Clear the timer when "Submit Prompt" is clicked
    submitPrompt();
});

tryAgainButton.addEventListener("click", resetPromptForm);
restartButton.addEventListener("click", resetExperience);

// Load the API key from the external config.json file
fetch("config.json")
    .then((response) => response.json())
    .then((data) => {
        apiKey = data.OPENAI_API_KEY;
    })
    .catch((error) => {
        console.error("Error loading API key:", error);
    });
