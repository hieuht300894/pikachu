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
var offsetTop = -26;//header height
var offsetLeft = 0;
var maxLevel = 40;
var winScore = 720;
var scoreCount = 0;

function init() {
    var minHeight = PieceHeight * (rows + 2);
    var windowHeight = window.innerHeight;
    if (windowHeight < minHeight) {
        scale = windowHeight / minHeight;
        document.body.style.zoom = scale;
    }

    offsetLeft  = ((screen.width / scale) - (PieceWidth * (cols + 2))) / 2;
    document.getElementById("header").style.visibility = "visible";

    checksound = localStorage.getItem("checksound");
    if (checksound == null || checksound == undefined) {
        checksound = true;
    }
    changeSound();
    var list = new Array;
    var i;
    for (i = 1; i <= 36; i++) list.push(getImagePath(i));
    var t = new ImagePreloader(list, play);
}

function play() {
    _board = newBoard();
    _board.loadGame();
    document.getElementById("board").appendChild(_board);
    document.getElementById("maintable").style.visibility = "visible";
}

function replay() {
    _board.newGame();
}

function change() {
    _board.repairGame();
}

function showHighscore() {
    paused = true;
    if (scrollID > 0) clearInterval(scrollID);
    $("#list").empty();
    scoreCount = 0;
    document.getElementById("scoreboard").style.top = PieceHeight +"px";
    document.getElementById("scoreboard").style.left = PieceWidth + offsetLeft +"px";
    document.getElementById("scoreboard").style.visibility = "visible";
    scrolllist();
}

function closeHighscore() {
    document.getElementById("scoreboard").style.visibility = "hidden";
    if (scrollID > 0) clearInterval(scrollID);
    paused = false;
}

function loadHighscore() {
    $.ajax({
        url: "http://games.songsinh.com/api/score/highscore?start=" + scoreCount + "&length=10",
        type: 'GET',
        contentType: 'application/json',
        data: "",
        dataType: "json",
        success: function (result) {
            $.each(result, function(index, row){
                var odd = true;
                if ((index % 2) == 0) odd = false;
                addHighscoreItem(scoreCount + index + 1, row.Player, row.Score, odd);
            });
            scoreCount += result.length;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            alert(getString('txt_gethighscorefailed', lang));
            closeHighscore();
        }
    });
}

function addHighscoreItem(rank, name, score, odd) {
    var div = document.createElement("div");
    if (odd) {
        div.className = "highscore-item odd";
    } else {
        div.className = "highscore-item even";
    }
    var divrank = document.createElement("div");
    divrank.className = "rank";
    divrank.innerHTML = rank;
    div.appendChild(divrank);
    var divname = document.createElement("div");
    divname.className = "player";
    divname.innerHTML = name;
    div.appendChild(divname);
    var divscore = document.createElement("div");
    divscore.className = "score";
    divscore.innerHTML = score;
    div.appendChild(divscore);
    document.getElementById("list").appendChild(div);
}

function scrolllist(){
    var scrolltop=$('#list').attr('scrollTop');
    var scrollheight=$('#list').attr('scrollHeight');
    var windowheight=$('#list').attr('clientHeight');
    var scrolloffset=2;
    if(scrolltop>=(scrollheight-(windowheight+scrolloffset)))
    {
        loadHighscore();
    }
    scrollID = setTimeout('scrolllist();', 1000);
}

function onGameLoaded() {
    playAudio(SOUND.GameLoaded);
    if (timeID > 0) clearInterval(timeID);
    elTimebar.tmp = maxTime;
    elTimebar.style.width = maxTime / 2 + "px";
    timeID = setInterval("decTime()", 1250);
}

function decTime() {
    if (paused) return;
    elTimebar.tmp--;
    elTimebar.style.width = elTimebar.tmp / 2 + "px";
    if (elTimebar.tmp == 0) {
        alert(getString('txt_gameover', lang));
        replay();
    }
}

function rewardLife() {
    _board.addLife();
}

function saveScore(player, score, level, callback) {
    NativePlugin.prepareScore(function(data) {
        var d = new Date();
        $.ajax({
            url: "http://games.songsinh.com/api/score/savescore",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                alert(getString('txt_yourrankis', lang) + result + ". " + getString('txt_playagain', lang));
            },
            error: function (jqXhr, textStatus, errorThrown) {
                alert(getString('txt_savescorefailed', lang));
            },
            complete: function () {
                if (callback) callback();
            }
        });

    }, function(error) {
        alert(getString('txt_savescorefailed', lang));
        if (callback) callback();
    }, player, "classic", level, score);
}