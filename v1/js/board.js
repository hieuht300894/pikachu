/**
 * Created by Linh on 4/1/2017.
 */
function newBoard() {
    var div = document.getElementById("board");

    div.arrPiece = newArray(cols + 2);
    for (var i = 1; i <= cols; i++) {
        for (var j = 1; j <= rows; j++) {
            div.arrPiece[i][j] = newPiece(i, j, 0);
            div.appendChild(div.arrPiece[i][j]);
        }
    }

    div.lines = new Array;
    for (var i = 0; i < 3; i++) {
        div.lines[i] = document.createElement("div");
        div.lines[i].classList.add('line-connector');
        div.lines[i].style.visibility = "hidden";
        div.appendChild(div.lines[i]);
    }

    div.style.position = 'relative';
    div.style.width = `${PieceWidth * (cols + 2)}px`;
    div.style.height = `${PieceHeight * (rows + 2)}px`;
    div.style.marginTop = `${PieceHeight * -0.5}px`;

    div.newGame = function () {
        if (!confirm("Are you sure you want to start a new game? This will reset your active level progress.")) {
            return;
        }

        const promptMessages = [
            'Select Game Mode:',
            `Enter ${gameModes.sequently.id} for ${gameModes.sequently.name}`,
            `Enter ${gameModes.shuffle.id} for ${gameModes.shuffle.name}`,
            `Enter ${gameModes.professional.id} for ${gameModes.professional.name}`,
        ];

        const gameModeId = Number.parseInt(prompt(promptMessages.join('\n'), gameModes.sequently.id));

        const choosenGameModes = [
            gameModes.sequently,
            gameModes.shuffle,
            gameModes.professional,
        ];

        const initialLevelQueues = new Map([
            [gameModes.sequently.id, initializeSequenceLevel],
            [gameModes.shuffle.id, initializeShuffleLevel],
            [gameModes.professional.id, initializeProfessionalLevel],
        ]);

        this.gameMode = JSON.parse(JSON.stringify(choosenGameModes.find(x => x.id === gameModeId) || gameModes.sequently));

        this.gameMode.levelQueue = initialLevelQueues.get(this.gameMode.id)() || [];
        this.gameMode.levelQueue.splice(this.gameMode.levelQueue.indexOf(this.gameMode.level), 1);
        this.gameMode.levelQueue.unshift(this.gameMode.level);

        localStorage.setItem("game_mode", JSON.stringify(this.gameMode));

        this.currentGame = {
            id: Date.now(),
            lives: this.gameMode.lives,
            level: this.gameMode.level,
            levelQueue: this.gameMode.levelQueue,
            score: 0,
            totalScore: 0,
        };

        this.saveGame();
        this.setLives(this.currentGame.lives);
        this.setNewLevel(this.currentGame.level);
    }

    div.saveGame = function () {
        localStorage.setItem("current_game", JSON.stringify(this.currentGame));
    }

    div.loadGame = function () {
        this.gameMode = JSON.parse(localStorage.getItem("game_mode") || JSON.stringify({}));
        this.currentGame = JSON.parse(localStorage.getItem("current_game") || JSON.stringify({}));

        if (!this.gameMode.id || !this.currentGame.id) {
            return this.newGame();
        }

        alert(['Your level is ', this.currentGame.levelQueue[this.currentGame.level - 1]].join(''));

        this.setLives(this.currentGame.lives);
        this.setNewLevel(this.currentGame.level);
    }

    div.repairGame = function () {
        if (this.currentGame.lives > 0) {
            engine.repairMatrix(this.arrValue);

            this.applyMatrix();
            this.setLives(this.currentGame.lives - 1);

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
        this.currentGame.lives = val;

        this.saveGame();

        repaint("txtLives", this.currentGame.lives);

        if (val > 0)
            document.getElementById("btnChange").disabled = false;
        else
            document.getElementById("btnChange").disabled = true;
    }

    div.addLife = function (total) {
        total = total || 1;

        this.setLives(this.currentGame.lives + total);
    }

    div.addMoreLives = function () {
        const promptValue = prompt('How many lives do you want to trade?', 1);
        if (promptValue === null) {
            return;
        }

        const tradeLives = Number.parseInt(promptValue);
        if (tradeLives <= 0) {
            return alert("The input must be greater than 0!");
        }

        const tradeScore = [...Array(tradeLives).keys()].map(x => x + 1).reduce((accumulator, currentValue) => accumulator + currentValue * pairedScore * 10, 0);

        if (this.currentGame.totalScore < tradeScore) {
            return alert("Not enough score!");
        }

        if (confirm(`Trade score for lives? You will get +${tradeLives} Lives and your score will decrease by ${tradeScore} points.`)) {
            this.currentGame.totalScore -= (tradeScore);

            repaint("txtScore", `${this.currentGame.totalScore} (+${this.currentGame.score})`);

            this.addLife(tradeLives);
        }
    }

    div.setNewLevel = function (newLevel) {
        this.currentGame.level = newLevel;
        this.currentGame.score = 0;
        this.isWaiting = false;
        this.arrValue = engine.getNewMatrix();
        this.applyMatrix();
        this.saveGame();

        document.body.setAttribute("class", ["level", Math.floor(Math.random() * 9) + 1].join(''));

        repaint("txtGameMode", this.gameMode.name);
        repaint("txtLives", this.currentGame.lives);
        repaint("txtLevel", `${this.currentGame.level}/${maxLevel}`);
        repaint("txtScore", `${this.currentGame.totalScore} (+${this.currentGame.score})`);

        onGameLoaded();
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
            this.arrPiece[iClick][jClick].setSelected(50);

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
                    this.arrPiece[this.iFist][this.jFist].setSelected(100);
                    this.arrPiece[iClick][jClick].setSelected(100);
                    playAudio(SOUND.NoPath);
                }
            } else {
                this.iFist = iClick;
                this.jFist = jClick;

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

function onPiecePaired() {
    // hide lines
    for (var i = 0; i < 3; i++)
        _board.lines[i].style.visibility = "hidden";

    // update score
    _board.currentGame.score += pairedScore;

    repaint("txtScore", `${_board.currentGame.totalScore} (+${_board.currentGame.score})`);

    // check win
    if (_board.currentGame.score == winScore) {
        _board.currentGame.totalScore += _board.currentGame.score + elTimebar.tmp;
        if (_board.currentGame.level == maxLevel) {
            var player = prompt("You win. Please enter your name", "");
            if (player != null) {
                _board.newGame();
            }
        } else {
            alert(['Level completed! Next level is ', _board.currentGame.levelQueue[_board.currentGame.level]].join(''));

            _board.addLife();
            _board.setNewLevel(_board.currentGame.level + 1);
        }
        return;
    }

    // repaire matrix
    if (_board.currentGame.level > 1) {
        engine.fixMatrix(_board.arrValue, _board.currentGame.levelQueue[_board.currentGame.level - 1]);
        _board.applyMatrix();
    }

    // check no more pair
    if (engine.isEnd(_board.arrValue)) {
        if (_board.currentGame.lives <= 0) {
            alert("You have no lives.");

            _board.newGame();
        } else {
            alert(getString('txt_nopair', lang));

            _board.repairGame();
        }
    }
}

function initializeSequenceLevel() {
    return [...Array(maxLevel).keys()].map(x => x + 1);
}

function initializeShuffleLevel() {
    return [...Array(maxLevel).keys()].map(x => x + 1).sort(() => Math.random() - 0.5);
}

function initializeProfessionalLevel() {
    return [
        // --- EASY LEVELS ---
        1,  // Classic / Static
        3,  // Global Slide DOWN
        2,  // Global Slide UP
        4,  // Global Slide LEFT
        5,  // Global Slide RIGHT

        // --- MEDIUM LEVELS ---
        6,  // Top UP, Bottom DOWN
        7,  // Top DOWN, Bottom UP
        8,  // Left LEFT, Right RIGHT
        9,  // Left RIGHT, Right LEFT
        10, // Top LEFT, Bottom RIGHT
        11, // Top RIGHT, Bottom LEFT
        12, // Left UP, Right DOWN
        13, // Left DOWN, Right UP
        14, // Horizontal Central Squeeze
        16, // Vertical Central Squeeze
        15, // Horizontal Outer Escape
        17, // Vertical Outer Escape
        33, // New Channel: Horizontal Central Squeeze
        35, // New Channel: Vertical Central Squeeze
        34, // New Channel: Horizontal Outer Escape
        36, // New Channel: Vertical Outer Escape

        // --- HARD LEVELS ---
        26, // 3-Way Column Divergence
        27, // 3-Way Column Alternation
        28, // 3-Way Row Sliding Interlock
        37, // Tiered Horizontal Zig-Zag
        38, // Tiered Horizontal Inverse Zig-Zag
        18, // Pinwheel Clockwise
        19, // Pinwheel Counter-Clockwise
        20, // Quadrants Collapse to Center
        21, // Quadrants Scatter Outwards
        29, // Slanted Cascade Variant A
        30, // Slanted Cascade Variant B

        // --- EXTREME LEVELS ---
        22, // Alternate Columns Interlocking Vertically (Odd UP / Even DOWN)
        23, // Alternate Rows Interlocking Horizontally (Odd LEFT / Even RIGHT)
        24, // Frame Borders Squeeze Inward
        25, // Inner Anchor Core Burst
        31, // Compound Slanted Cascade
        32, // Compound Cascade Vortex
        39, // Dual Cross-Corner Intersection Slices
        40  // Synchronized Multi-Boundary Compression Ripple (Hardest)
    ];
}