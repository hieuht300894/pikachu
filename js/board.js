/**
 * Created by Linh on 4/1/2017.
 */
function newBoard() {
    var div = document.createElement("div");
    div.lines = new Array;
    for (var i = 0; i < 3; i++) {
        div.lines[i] = document.createElement("div");
        div.lines[i].style.position = "absolute";
        div.lines[i].style.visibility = "hidden";
        div.lines[i].style.backgroundColor = "red";
        div.appendChild(div.lines[i]);
    }
    div.arrPiece = newArray(cols + 2);
    for (var i = 1; i <= cols; i++) {
        for (var j = 1; j <= rows; j++) {
            div.arrPiece[i][j] = newPiece(i, j, 0);
            div.appendChild(div.arrPiece[i][j]);
        }
    }
    div.style.position = "relative";
    div.style.width = PieceWidth * (cols + 2) + "px";
    div.style.height = PieceHeight * (rows + 2) + "px";

    div.setNewLevel = function (newLevel) {
        this.level = newLevel;
        this.score = 0;
        this.isWaiting = false;
        this.arrValue = engine.getNewMatrix();
        this.applyMatrix();
        this.saveGame();

        var style = ["level", Math.floor(Math.random() * 9) + 1].join('');
        document.body.setAttribute("class", style);

        // Print the accurate progress tracking text value
        if (gameMode === "random") {
            var dispLvl = localStorage.getItem("rand_display_level") || "1";
            repaint("txtLevel", dispLvl + "/" + maxLevel);
        } else {
            repaint("txtLevel", [this.level, maxLevel].join('/'));
        }

        repaint("txtLives", this.lives);
        repaint("txtScore", this.totalScore);
        onGameLoaded();
    };

    div.newGame = function() {
        this.totalScore = 0;
        this.setLives(10);
        
        if (gameMode === "random") {
            var pool = generateRandomLevelPool();
            localStorage.setItem("rand_display_level", 1);
            this.setNewLevel(pool);
        } else {
            this.setNewLevel(1);
        }
    };

     div.saveGame = function() {
        var prefix = (gameMode === "random") ? "rand_" : "seq_";
        localStorage.setItem(prefix + "level", this.level);
        localStorage.setItem(prefix + "lives", this.lives);
        localStorage.setItem(prefix + "totalscore", this.totalScore);
        
        if (gameMode === "random") {
            var poolStr = localStorage.getItem("rand_level_pool");
            var pool = poolStr ? JSON.parse(poolStr) : [];
            var completedCount = maxLevel - pool.length;
            localStorage.setItem("rand_display_level", completedCount + 1);
        }
    };

     div.loadGame = function() {
        var prefix = (gameMode === "random") ? "rand_" : "seq_";
        var savedLevel = localStorage.getItem(prefix + "level");
        
        if (savedLevel === null) {
            this.totalScore = 0;
            this.setLives(10);
            
            if (gameMode === "random") {
                var pool = generateRandomLevelPool();
                this.level = pool;
                localStorage.setItem("rand_display_level", 1);
                repaint("txtLevel", "1/" + maxLevel);
            } else {
                this.level = 1;
                repaint("txtLevel", "1/" + maxLevel);
            }
            this.setNewLevel(this.level);
        } else {
            this.lives = parseInt(localStorage.getItem(prefix + "lives"), 10);
            this.totalScore = parseInt(localStorage.getItem(prefix + "totalscore"), 10);
            this.level = parseInt(savedLevel, 10);
            
            this.setNewLevel(this.level);
            
            if (gameMode === "random") {
                var dispLvl = localStorage.getItem("rand_display_level") || "1";
                repaint("txtLevel", dispLvl + "/" + maxLevel);
            } else {
                repaint("txtLevel", this.level + "/" + maxLevel);
            }
        }
    };

    div.repairGame = function () {
        if (this.lives <= 0) {
            var ok = confirm("You have no lives. Click OK to add more life or Cancel to return.");
            if (ok) showAd();
        } else {
            engine.repairMatrix(_board.arrValue);
            this.applyMatrix();
            this.setLives(this.lives - 1);
            playAudio(SOUND.GameRepaired);
        }
    }

    div.applyMatrix = function () {
        var i, j;
        for (i = 1; i <= cols; i++) {
            for (j = 1; j <= rows; j++) {
                if (this.arrValue[i][j] == 0)
                    this.arrPiece[i][j].setVisible(false);
                else {
                    this.arrPiece[i][j].setVisible(true);
                    this.arrPiece[i][j].setSelected(100);
                    this.arrPiece[i][j].setImage(this.arrValue[i][j]);
                }
            }
        }
    }

    div.setLives = function (val) {
        if (val == null || val == undefined || val == NaN) val = 10;
        this.lives = val;
        localStorage.setItem("lives", this.lives);
        repaint("txtLives", this.lives);
        if (val > 0)
            document.getElementById("btnChange").disabled = false;
        else
            document.getElementById("btnChange").disabled = true;
    }

    div.addLife = function () {
        this.setLives(this.lives + 1);
    }

    div.drawPath = function (points) {
        var point1 = points[0];
        var point2;
        var centre1, centre2;
        var i, rect;
        for (i = 1; i < points.length; i++) {
            point2 = points[i];
            centre1 = new Point(point1.x * PieceWidth + PieceWidth / 2, point1.y * PieceHeight + PieceHeight / 2);
            centre2 = new Point(point2.x * PieceWidth + PieceWidth / 2, point2.y * PieceHeight + PieceHeight / 2);
            rect = getRRR(centre1, centre2);
            this.lines[i - 1].style.left = rect.x + offsetLeft + "px";
            this.lines[i - 1].style.top = rect.y + offsetTop + "px";
            this.lines[i - 1].style.width = rect.width + "px";
            this.lines[i - 1].style.height = rect.height + "px";
            point1 = point2;
        }
        for (i = 1; i < points.length; i++)
            this.lines[i - 1].style.visibility = "visible";
    }

    div.onClickPiece = function (evt, iClick, jClick) {
        playAudio(SOUND.PieceSelected);
        var mybutton = getMouseButton(evt);
        if (mybutton == 0) {
            if (this.isWaiting) {
                this.isWaiting = false;
                var list = engine.checkPath(this.arrValue, this.iFist, this.jFist, iClick, jClick);
                if (list != null) {
                    this.arrValue[this.iFist][this.jFist] = 0;
                    this.arrValue[iClick][jClick] = 0;
                    this.arrPiece[this.iFist][this.jFist].setVisible(false);
                    this.arrPiece[iClick][jClick].setVisible(false);
                    this.drawPath(list);
                    setTimeout("onPiecePaired()", 200);
                    playAudio(SOUND.PiecePaired);
                } else {
                    playAudio(SOUND.NoPath);
                    this.arrPiece[this.iFist][this.jFist].setSelected(100);
                }
            } else {
                this.iFist = iClick;
                this.jFist = jClick;
                this.arrPiece[iClick][jClick].setSelected(50);
                this.isWaiting = true;
            }
        }
    }

    div.onmousedown = function (evt) {
        if (window.event) evt = window.event;
        var tmp = getMouseButton(evt);
        if (tmp == 2 && this.isWaiting) {
            this.arrPiece[this.iFist][this.jFist].setSelected(100);
            this.isWaiting = false;
        } else if (tmp == 1) {
            var rect = engine.findCheat(this.arrValue);
            this.arrPiece[rect.x][rect.y].setSelected(50);
            this.arrPiece[rect.width][rect.height].setSelected(50);
        }
    }

    return div;
}

function getIntItem(key, defaultValue) {
    var val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    return parseInt(val);
}

function onPiecePaired() {
    // hide lines
    for (var i = 0; i < 3; i++)
        _board.lines[i].style.visibility = "hidden";
    // update score
    _board.score += 10;
    repaint("txtScore", _board.totalScore + _board.score);
    // check win
    if (_board.score == winScore) {
        _board.totalScore += _board.score + elTimebar.tmp;
        if (_board.level == maxLevel) {
            var player = prompt("You win. Please enter your name", "");
            if (player != null) {
                saveScore(player, _board.totalScore, _board.level, _board.newGame());
            }
            //_board.newGame();
        } else {
            alert(getString("txt_levelcompleted", lang));
            showAd();
            _board.addLife();
            _board.setNewLevel(_board.level + 1);
        }
        return;
    }
    // repaire matrix
    if (_board.level > 1) {
        engine.fixMatrix(_board.arrValue, _board.level);
        _board.applyMatrix();
    }
    // check no more pair
    if (engine.isEnd(_board.arrValue)) {
        if (_board.lives <= 0) {
            var ok = confirm("You have no lives. Click OK to add more life or Cancel to start new game.");
            if (ok) {
                showAd();
            } else {
                _board.newGame();
            }
        } else {
            alert(getString('txt_nopair', lang));
            _board.repairGame();
        }
    }
}