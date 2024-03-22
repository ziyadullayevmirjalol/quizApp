const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const nextButton = document.getElementById("next-button");
const scoreElement = document.getElementById("score");
const pointsGet = document.getElementById("points")

let points = 0;
let currentLevel = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let timerInterval;
let countriesData = [];

async function fetchCountriesData() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        countriesData = await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


function startGame() {
    fetchCountriesData().then(() => {
        initializeLevel();
        
    });
}

function initializeLevel() {
    pointsGet.textContent=`Points : ${points}`;
    resetUI();
    if (currentLevel < 10) {
        currentLevel++;
        setupLevel();
    } else {
        showResult();
    }
}


function resetUI() {
    messageElement.textContent = "";
    nextButton.style.display = "none";
    optionsElement.style.pointerEvents = "auto";
    optionsElement.innerHTML = "";
}

function setupLevel() {
    const randomCountry = getRandomCountry();
    const correctCapital = randomCountry.capital[0];
    const options = getRandomOptions(correctCapital);

    questionElement.textContent = `What is the capital of ${randomCountry.name.common}?`;

    optionsElement.innerHTML = "";
    options.forEach(option => {
        const optionButton = createOptionButton(option, correctCapital);
        optionsElement.appendChild(optionButton);
    });

    startTimer();
}

function getRandomCountry() {
    const randomCountryIndex = Math.floor(Math.random() * countriesData.length);
    return countriesData[randomCountryIndex];
}

function getRandomOptions(correctCapital) {
    const options = [correctCapital];
    while (options.length < 4) {
        const randomCountry = getRandomCountry();
        const randomCapital = randomCountry.capital[0];
        if (options.indexOf(randomCapital) === -1) {
            options.push(randomCapital);
        }
    }
    shuffleArray(options);
    return options;
}

function createOptionButton(option, correctCapital) {
    const optionButton = document.createElement("button");
    optionButton.className = "option";
    optionButton.textContent = option;
    optionButton.addEventListener("click", () => checkAnswer(option === correctCapital));
    return optionButton;
}

function startTimer() {
    let seconds = 15;
    timerElement.textContent = `Time left: ${seconds}s`;

    timerInterval = setInterval(() => {
        seconds--;
        timerElement.textContent = `Time left: ${seconds}s`;

        if (seconds === 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function checkAnswer(isCorrect) {
    clearInterval(timerInterval);
    optionsElement.style.pointerEvents = "none";

    if (isCorrect) {
        points++;
        correctAnswers++;
        messageElement.textContent = "Correct!";
    } else {
        incorrectAnswers++;
        messageElement.textContent = "Wrong!";
    }

    markCorrectAndIncorrectOptions();
    // Remove the click event listener from the options.
    optionsElement.querySelectorAll(".option").forEach(optionButton => {
        optionButton.removeEventListener("click", () => checkAnswer(false));
    });
    // Add a click event listener to the "Next" button.
    nextButton.style.display = "block";
    nextButton.addEventListener("click", initializeLevel);

    // Update the score display
    scoreElement.textContent = `Correct: ${correctAnswers},  | Incorrect: ${incorrectAnswers}`;
}

function markCorrectAndIncorrectOptions() {
    const correctCapital = getCurrentCorrectCapital();
    optionsElement.querySelectorAll(".option").forEach(optionButton => {
        if (optionButton.textContent === correctCapital) {
            
            optionButton.classList.add("correct");
        } else {
            optionButton.classList.add("incorrect");
        }
    });
}

function getCurrentCorrectCapital() {
    const questionText = questionElement.textContent;
    const countryName = questionText.replace("What is the capital of ", "").replace("?", "");
    const currentCountry = countriesData.find(country => country.name.common === countryName);
    return currentCountry.capital[0];
}

function handleTimeout() {
    optionsElement.style.pointerEvents = "none";
    messageElement.textContent = "Time's up!";
    // Remove the click event listener from the options.
    optionsElement.querySelectorAll(".option").forEach(optionButton => {
        optionButton.removeEventListener("click", () => checkAnswer(false));
    });
    // Add a click event listener to the "Next" button.
    nextButton.style.display = "block";
    nextButton.addEventListener("click", initializeLevel);
}

function showResult() {
    questionElement.textContent = "Game Over";
    optionsElement.innerHTML = "";
    timerElement.textContent = "";
    messageElement.textContent = getFinalMessage();
    nextButton.textContent = "Play Again";
    // Remove the click event listener from the "Next" button.
    nextButton.removeEventListener("click", initializeLevel);
    // Add a click event listener to the "Next" button.
    nextButton.addEventListener("click", resetGame);
    points=0;
    nextButton.style.display = "block";
}

function getFinalMessage() {
    if (correctAnswers === 10) {
        return "You are a genius!";
    } else if (correctAnswers >= 5) {
        return "You did well!";
    } else {
        return "Try harder next time";
    }

}

function resetGame() {
    currentLevel = 0;
    correctAnswers = 0;
    incorrectAnswers = 0; 
    // Remove the click event listener from the "Next" button.
    nextButton.removeEventListener("click", resetGame);
    initializeLevel();
}

// Shuffle array elements in place
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

startGame();
