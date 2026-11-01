var _board;
var checksound = true;
var timeID = 0;
var scrollID = 0;
var maxTime = 480;
var elTimebar = document.getElementById("timebar");
var PieceWidth = 42;
var PieceHeight = 52;
var cols = 16;
var rows = 9;
var offsetTop = 0;
var offsetLeft = 0;
var maxLevel = 40;
var winScore = 720;
var scoreCount = 0;

// Cached DOM element
var listElement = null;

var gameMode = "currently"; // Track game path mode tracks: 'currently' or 'random'

function init() {
    var boardWidth = PieceWidth * (cols + 2);
    var boardHeight = PieceHeight * (rows + 2);
    var headerHeight = 40; 
    
    var availableWidth = window.innerWidth;
    var availableHeight = window.innerHeight - headerHeight;

    var scaleX = availableWidth / boardWidth;
    var scaleY = availableHeight / boardHeight;
    var scale = Math.min(scaleX, scaleY, 1); 

    var boardContainer = document.getElementById("board");
    if (boardContainer) {
        boardContainer.style.transform = "scale(" + scale + ")";
        boardContainer.style.transformOrigin = "top center";
    }

    offsetTop = 0;
    offsetLeft = 0;

    document.getElementById("header").style.visibility = "visible";

    // Read saved configuration track profile
    gameMode = localStorage.getItem("active_game_mode") || "currently";

    checksound = localStorage.getItem("checksound");
    if (checksound == null || checksound == undefined) {
        checksound = true;
    }
    changeSound();
    
    var list = [];
    for (var i = 1; i <= 36; i++) list.push(getImagePath(i));
    new ImagePreloader(list, play);
}

function play() {
    _board = newBoard();
    _board.loadGame();
    document.getElementById("board").appendChild(_board);
    document.getElementById("maintable").style.visibility = "visible";

    listElement = document.getElementById("list");
}

// Locate this function in your js/game.js file and change it to:
function replay() {
    // Popup window presenting a dual game mode selection prompt to the player
    var choice = prompt("Select Game Mode:\nEnter 1 for Sequently Mode\nEnter 2 for Shuffled Random Mode", "1");
    
    if (choice === null) return; // User canceled the dialog prompt action
    
    if (choice === "1") {
        gameMode = "currently";
        localStorage.setItem("active_game_mode", "currently");
        _board.newGame(); // Triggers base data state clears for Sequently track
    } else if (choice === "2") {
        gameMode = "random";
        localStorage.setItem("active_game_mode", "random");
        _board.newGame(); // Triggers a new shuffled level pool track array configuration setup
    } else {
        alert("Invalid selection. Please choose either 1 or 2.");
        replay(); // Loop back if they input garbage characters
    }
}

function change() {
    _board.repairGame();
}

function showHighscore() {
    paused = true;
    if (scrollID > 0) clearTimeout(scrollID);

    if (listElement) listElement.innerHTML = "";

    var scoreboard = document.getElementById("scoreboard");
    scoreboard.style.top = PieceHeight + "px";
    scoreboard.style.left = (PieceWidth + offsetLeft) + "px";
    scoreboard.style.visibility = "visible";

    loadLocalHighscores();
}

function closeHighscore() {
    document.getElementById("scoreboard").style.visibility = "hidden";
    if (scrollID > 0) clearTimeout(scrollID);
    paused = false;
}

// Read scores from LocalStorage
function loadLocalHighscores() {
    if (!listElement) return;

    var localScores = localStorage.getItem("local_highscores");
    var scoresArray = localScores ? JSON.parse(localScores) : [];

    for (var index = 0; index < scoresArray.length; index++) {
        var row = scoresArray[index];
        var odd = (index % 2) !== 0;
        addHighscoreItem(index + 1, row.Player, row.Score, odd);
    }
}

function addHighscoreItem(rank, name, score, odd) {
    var div = document.createElement("div");
    div.className = "highscore-item " + (odd ? "odd" : "even");

    var divrank = document.createElement("div");
    divrank.className = "rank";
    divrank.textContent = rank;
    div.appendChild(divrank);

    var divname = document.createElement("div");
    divname.className = "player";
    divname.textContent = name;
    div.appendChild(divname);

    var divscore = document.createElement("div");
    divscore.className = "score";
    divscore.textContent = score;
    div.appendChild(divscore);

    if (listElement) listElement.appendChild(div);
}

function onGameLoaded() {
    playAudio(SOUND.GameLoaded);
    if (timeID > 0) clearInterval(timeID);
    elTimebar.tmp = maxTime;
    elTimebar.style.width = (maxTime / 2) + "px";
    timeID = setInterval(decTime, 1250);
}

function decTime() {
    if (paused) return;
    elTimebar.tmp--;
    elTimebar.style.width = (elTimebar.tmp / 2) + "px";
    if (elTimebar.tmp === 0) {
        alert(getString('txt_gameover', lang));
        replay();
    }
}

function rewardLife() {
    _board.addLife();
}

// Saves score locally, automatically sorts the leaderboard, and keeps top 50 entries
function saveScore(player, score, level, callback) {
    var localScores = localStorage.getItem("local_highscores");
    var scoresArray = localScores ? JSON.parse(localScores) : [];

    // Add new local highscore object
    scoresArray.push({
        Player: player,
        Score: score,
        Level: level
    });

    // Sort scores from highest to lowest
    scoresArray.sort(function (a, b) {
        return b.Score - a.Score;
    });

    // Cap leaderboard at top 50 scores for screen optimization
    if (scoresArray.length > 50) {
        scoresArray = scoresArray.slice(0, 50);
    }

    localStorage.setItem("local_highscores", JSON.stringify(scoresArray));

    // Find player's position rank
    var playerRank = scoresArray.findIndex(function (item) {
        return item.Player === player && item.Score === score;
    }) + 1;

    alert(getString('txt_yourrankis', lang) + playerRank + ". " + getString('txt_playagain', lang));

    if (callback) callback();
}

function changeGameMode(mode) {
    if (gameMode === mode) return;
    gameMode = mode;
    localStorage.setItem("active_game_mode", mode);

    var btnSeq = document.getElementById("btnModeSequently");
    var btnRand = document.getElementById("btnModeRandom");
    if (btnSeq && btnRand) {
        btnSeq.classList.toggle("active", mode === "currently");
        btnRand.classList.toggle("active", mode === "random");
    }

    if (_board) {
        _board.loadGame();
    }
}

// Shuffles an array containing IDs 1-40 to track unplayed random layouts
function generateRandomLevelPool() {
    var pool = [];
    for (var i = 1; i <= maxLevel; i++) {
        pool.push(i);
    }
    // Fisher-Yates Shuffle
    for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = pool[i];
        pool[i] = pool[j];
        pool[j] = temp;
    }
    localStorage.setItem("rand_level_pool", JSON.stringify(pool));
    return pool;
}

function onPiecePaired() {
    for (var i = 0; i < 3; i++) _board.lines[i].style.visibility = "hidden";
    
    _board.score += 10;
    repaint("txtScore", _board.totalScore + _board.score);
    
    if (_board.score == winScore) {
        _board.totalScore += _board.score + elTimebar.tmp;
        
        alert(getString("txt_levelcompleted", lang));
        _board.addLife();
        
        if (gameMode === "random") {
            var poolStr = localStorage.getItem("rand_level_pool");
            var pool = poolStr ? JSON.parse(poolStr) : [];
            
            var currentLevelIndex = pool.indexOf(_board.level);
            if (currentLevelIndex !== -1) {
                pool.splice(currentLevelIndex, 1);
            }
            
            localStorage.setItem("rand_level_pool", JSON.stringify(pool));
            
            if (pool.length === 0) {
                var player = prompt("Incredible! You completed all 40 random levels! Enter your name:", "");
                if (player != null) {
                    saveScore(player, _board.totalScore, maxLevel, function() { 
                        localStorage.removeItem("rand_level_pool");
                        _board.newGame(); 
                    });
                }
                return;
            }
            _board.setNewLevel(pool);
        } else {
            if (_board.level == maxLevel) {
                var player = prompt("You win the entire game! Enter your name:", "");
                if (player != null) {
                    saveScore(player, _board.totalScore, _board.level, function() { _board.newGame(); });
                }
                return;
            }
            _board.setNewLevel(_board.level + 1);
        }
        return;
    }
    
    if (_board.level > 1) {
        engine.fixMatrix(_board.arrValue, _board.level);
        _board.applyMatrix();
    }
    
    if (engine.isEnd(_board.arrValue)) {
        if (_board.lives <= 0) {
            if (confirm("You have no lives. Click OK to add more life or Cancel to start a new game.")) {
                _board.setLives(3);
                _board.setNewLevel(_board.level);
            } else {
                _board.newGame();
            }
        } else {
            alert(getString('txt_nopair', lang));
            _board.repairGame();
        }
    }
}