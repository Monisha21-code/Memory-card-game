// ======================================
// GET / CREATE USER DATA
// ======================================

function getUser() {

    let savedUser = localStorage.getItem("user");

    if (savedUser === null) {
        return null;
    }

    let user = JSON.parse(savedUser);

    // Fix old accounts
    if (typeof user.coins !== "number") {
        user.coins = 50;
    }

    if (typeof user.wins !== "number") {
        user.wins = 0;
    }

    if (typeof user.games !== "number") {
        user.games = 0;
    }

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    return user;
}


// ======================================
// SIGN UP
// ======================================

function signup() {

    let name =
        document.getElementById("signupName").value.trim();

    let email =
        document.getElementById("signupEmail").value.trim();

    let password =
        document.getElementById("signupPassword").value.trim();


    if (
        name === "" ||
        email === "" ||
        password === ""
    ) {

        alert("Please fill all fields.");

        return;
    }


    let user = {

        name: name,

        email: email,

        password: password,

        coins: 50,

        wins: 0,

        games: 0

    };


    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );


    alert(
        "Account created successfully! You received 50 coins 🪙"
    );


    window.location.href = "login.html";
}



// ======================================
// LOGIN
// ======================================

function login() {

    let email =
        document.getElementById("loginEmail").value.trim();

    let password =
        document.getElementById("loginPassword").value.trim();


    let user = getUser();


    if (user === null) {

        alert(
            "Please create an account first."
        );

        return;
    }


    if (
        email === user.email &&
        password === user.password
    ) {

        localStorage.setItem(
            "loggedIn",
            "true"
        );


        alert("Login successful! 🎮");


        window.location.href =
            "index.html";

    } else {

        alert(
            "Incorrect email or password."
        );

    }
}



// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem(
        "loggedIn"
    );

    window.location.href =
        "login.html";
}



// ======================================
// HOME PAGE
// ======================================

function loadHome() {

    let user = getUser();


    if (user === null) {
        return;
    }


    let homeName =
        document.getElementById("homeName");

    let homeCoins =
        document.getElementById("homeCoins");

    let coinStat =
        document.getElementById("coinStat");

    let winsStat =
        document.getElementById("winsStat");

    let gamesStat =
        document.getElementById("gamesStat");


    if (homeName) {
        homeName.textContent =
            user.name;
    }


    if (homeCoins) {
        homeCoins.textContent =
            user.coins;
    }


    if (coinStat) {
        coinStat.textContent =
            user.coins;
    }


    if (winsStat) {
        winsStat.textContent =
            user.wins;
    }


    if (gamesStat) {
        gamesStat.textContent =
            user.games;
    }

}



// ======================================
// MEMORY GAME VARIABLES
// ======================================

let cards = [

    "🍎", "🍎",

    "🍕", "🍕",

    "🐱", "🐱",

    "🚗", "🚗",

    "🌈", "🌈",

    "⭐", "⭐",

    "🍩", "🍩",

    "⚽", "⚽"

];


let firstCard = null;

let secondCard = null;

let lockBoard = false;

let matchedPairs = 0;

let moves = 0;

let earnedCoins = 0;

let seconds = 0;

let timerInterval = null;

let gameStarted = false;



// ======================================
// SHUFFLE CARDS
// ======================================

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        let j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

}



// ======================================
// START GAME
// ======================================

function startGame() {

    let board =
        document.getElementById(
            "gameBoard"
        );


    // If this is not the game page
    if (!board) {
        return;
    }


    // Hide win popup

    let popup =
        document.getElementById(
            "winPopup"
        );


    if (popup) {

        popup.style.display =
            "none";

    }


    // Reset game

    firstCard = null;

    secondCard = null;

    lockBoard = false;

    matchedPairs = 0;

    moves = 0;

    earnedCoins = 0;

    seconds = 0;


    clearInterval(
        timerInterval
    );


    // ==================================
    // COUNT GAME PLAYED
    // ==================================

    let user = getUser();


    if (user !== null) {

        /*
           Count the game only once
           when a new game starts.
        */

        if (!gameStarted) {

            user.games++;

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            gameStarted = true;
        }

    }


    // Reset displays

    let movesElement =
        document.getElementById(
            "moves"
        );

    let earnedElement =
        document.getElementById(
            "earnedCoins"
        );

    let timerElement =
        document.getElementById(
            "timer"
        );


    if (movesElement) {
        movesElement.textContent = "0";
    }


    if (earnedElement) {
        earnedElement.textContent = "0";
    }


    if (timerElement) {
        timerElement.textContent =
            "00:00";
    }


    // Shuffle

    let gameCards =
        [...cards];

    shuffle(gameCards);


    // Empty board

    board.innerHTML = "";


    // Create cards

    gameCards.forEach(
        function(symbol, index) {

            let card =
                document.createElement(
                    "div"
                );


            card.className =
                "memory-card";


            card.dataset.symbol =
                symbol;


            card.dataset.index =
                index;


            card.innerHTML = `

                <div class="card-inner">

                    <div class="card-front">
                        ?
                    </div>

                    <div class="card-back">
                        ${symbol}
                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                flipCard
            );


            board.appendChild(card);

        }
    );


    // Start timer

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );


    updateGameCoins();

}



// ======================================
// FLIP CARD
// ======================================

function flipCard() {

    if (lockBoard) {
        return;
    }


    if (this === firstCard) {
        return;
    }


    if (
        this.classList.contains(
            "matched"
        )
    ) {
        return;
    }


    this.classList.add(
        "flipped"
    );


    if (firstCard === null) {

        firstCard = this;

        return;
    }


    secondCard = this;

    moves++;


    let movesElement =
        document.getElementById(
            "moves"
        );


    if (movesElement) {

        movesElement.textContent =
            moves;

    }


    checkMatch();

}



// ======================================
// CHECK MATCH
// ======================================

function checkMatch() {

    let isMatch =
        firstCard.dataset.symbol ===
        secondCard.dataset.symbol;


    if (isMatch) {

        matchCards();

    } else {

        unflipCards();

    }

}



// ======================================
// CORRECT MATCH
// ======================================

function matchCards() {

    firstCard.classList.add(
        "matched"
    );

    secondCard.classList.add(
        "matched"
    );


    // ==================================
    // GIVE 10 COINS IMMEDIATELY
    // ==================================

    let user = getUser();


    if (user !== null) {

        user.coins += 10;


        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

    }


    // Add to game earned coins

    earnedCoins += 10;


    let earnedElement =
        document.getElementById(
            "earnedCoins"
        );


    if (earnedElement) {

        earnedElement.textContent =
            earnedCoins;

    }


    // Update total coins immediately

    updateGameCoins();


    matchedPairs++;


    resetBoard();


    // ==================================
    // CHECK WIN
    // ==================================

    if (matchedPairs === 8) {

        setTimeout(
            gameWon,
            500
        );

    }

}



// ======================================
// WRONG MATCH
// ======================================

function unflipCards() {

    lockBoard = true;


    setTimeout(
        function() {

            firstCard.classList.remove(
                "flipped"
            );


            secondCard.classList.remove(
                "flipped"
            );


            resetBoard();

        },

        800
    );

}



// ======================================
// RESET CARDS
// ======================================

function resetBoard() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

}



// ======================================
// GAME WON
// ======================================

function gameWon() {

    clearInterval(
        timerInterval
    );


    let user = getUser();


    if (user === null) {
        return;
    }


    // ==================================
    // WIN BONUS
    // ==================================

    let bonusCoins = 50;


    // Add winning bonus

    user.coins += bonusCoins;


    // Increase games won

    user.wins++;


    // Save user

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );


    // Total reward for THIS game

    let totalReward =
        earnedCoins + bonusCoins;


    // ==================================
    // SHOW WIN POPUP
    // ==================================

    let rewardElement =
        document.getElementById(
            "winReward"
        );


    let finalCoinsElement =
        document.getElementById(
            "finalCoins"
        );


    if (rewardElement) {

        rewardElement.textContent =
            "+" + totalReward;

    }


    if (finalCoinsElement) {

        finalCoinsElement.textContent =
            user.coins;

    }


    let popup =
        document.getElementById(
            "winPopup"
        );


    if (popup) {

        popup.style.display =
            "flex";

    }


    updateGameCoins();

}



// ======================================
// UPDATE GAME COINS
// ======================================

function updateGameCoins() {

    let user = getUser();


    if (user === null) {
        return;
    }


    let gameCoins =
        document.getElementById(
            "gameCoins"
        );


    if (gameCoins) {

        gameCoins.textContent =
            user.coins;

    }

}



// ======================================
// TIMER
// ======================================

function updateTimer() {

    seconds++;


    let minutes =
        Math.floor(
            seconds / 60
        );


    let remainingSeconds =
        seconds % 60;


    let formattedMinutes =
        String(minutes)
        .padStart(2, "0");


    let formattedSeconds =
        String(remainingSeconds)
        .padStart(2, "0");


    let timer =
        document.getElementById(
            "timer"
        );


    if (timer) {

        timer.textContent =
            formattedMinutes +
            ":" +
            formattedSeconds;

    }

}



// ======================================
// GO HOME
// ======================================

function goHome() {

    window.location.href =
        "index.html";

}



// ======================================
// PROFILE
// ======================================

function loadProfile() {

    let user = getUser();


    if (user === null) {
        return;
    }


    let name =
        document.getElementById(
            "profileName"
        );


    let email =
        document.getElementById(
            "profileEmail"
        );


    let coins =
        document.getElementById(
            "profileCoins"
        );


    let wins =
        document.getElementById(
            "profileWins"
        );


    let games =
        document.getElementById(
            "profileGames"
        );


    if (name) {

        name.value =
            user.name;

    }


    if (email) {

        email.value =
            user.email;

    }


    if (coins) {

        coins.textContent =
            user.coins;

    }


    if (wins) {

        wins.textContent =
            user.wins;

    }


    if (games) {

        games.textContent =
            user.games;

    }

}



// ======================================
// UPDATE PROFILE
// ======================================

function updateProfile() {

    let user = getUser();


    if (user === null) {
        return;
    }


    let name =
        document.getElementById(
            "profileName"
        ).value.trim();


    let email =
        document.getElementById(
            "profileEmail"
        ).value.trim();


    if (
        name === "" ||
        email === ""
    ) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    user.name = name;

    user.email = email;


    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );


    alert(
        "Profile updated successfully!"
    );

}



// ======================================
// PAGE LOAD
// ======================================

loadHome();

loadProfile();