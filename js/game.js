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

    checksound = localStorage.getItem("checksound");
    if (checksound === null || checksound === undefined) {
        checksound = true;
    }
    changeSound();
    
    var list = [];
    for (var i = 1; i <= 36; i++) {
        list.push(getImagePath(i));
    }
    new ImagePreloader(list, play);
}

function play() {
    _board = newBoard();
    _board.loadGame();
    document.getElementById("board").appendChild(_board);
    document.getElementById("maintable").style.visibility = "visible";
    
    listElement = document.getElementById("list");
}

function replay() {
    _board.newGame();
}

function change() {
    _board.repairGame();
}

function showHighscore() {
    paused = true;
    if (scrollID > 0) clearTimeout(scrollID);
    
    if (listElement) listElement.innerHTML = "";
    scoreCount = 0;
    
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

// Loads scores straight from LocalStorage instead of a network request
function loadLocalHighscores() {
    if (!listElement) return;
    
    var localScores = localStorage.getItem("local_highscores");
    var scoresArray = localScores ? JSON.parse(localScores) : [];

    // Render all scores stored locally
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

// Cleaned up scroll list loop (infinite scroll logic removed since local scores load instantly)
function scrolllist() {
    // Kept structure intact in case other scripts rely on the scroll track loop presence
    scrollID = setTimeout(scrolllist, 1000);
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

// Saves score locally, automatically sorts the leaderboard, and keeps the top 100 entries
function saveScore(player, score, level, callback) {
    var localScores = localStorage.getItem("local_highscores");
    var scoresArray = localScores ? JSON.parse(localScores) : [];
    
    // Add new entry
    scoresArray.push({
        Player: player,
        Score: score,
        Level: level,
        Date: new Date().getTime()
    });
    
    // Sort array descending based on score
    scoresArray.sort(function(a, b) {
        return b.Score - a.Score;
    });
    
    // Optional: Trim list to Top 100 entries to optimize disk size
    if (scoresArray.length > 100) {
        scoresArray = scoresArray.slice(0, 100);
    }
    
    // Commit back to local storage
    localStorage.setItem("local_highscores", JSON.stringify(scoresArray));
    
    // Find player's new rank rank
    var playerRank = scoresArray.findIndex(function(item) {
        return item.Player === player && item.Score === score;
    }) + 1;

    alert(getString('txt_yourrankis', lang) + playerRank + ". " + getString('txt_playagain', lang));
    
    if (callback) callback();
}
