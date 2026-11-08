var SOUND = {
    GameOver: "sound7",
    NoLife: "sound7",
    GameLoaded: "sound4",
    GameRepaired: "sound8",
    PieceSelected: "sound2",
    PiecePaired: "sound5",
    NoPath: "sound1"
};

function setAudioElement(pn, file) {
    if (typeof (file) == 'undefined')
        file = pn;
    var html = "<source src='sound/" + file + ".mp3' />";
    html += "<source src='sound/" + file + ".ogg' />";
    var audio = document.createElement("AUDIO");
    audio.id = pn;
    audio.innerHTML = html;
    document.body.appendChild(audio);
}

function playAudio(file) {
    if (!checksound) return;
    var pn = "audio" + file;
    var pid = document.getElementById(pn);
    if (!pid) {
        setAudioElement(pn, file);
        pid = document.getElementById(pn);
    }
    pid.play();

}

function changeSound(status) {
    if ([true, false].includes(status)) {
        checksound = status;
    }
    else {
        checksound = !checksound;
    }

    const statuses = new Map([
        [true, 'soundOn'],
        [false, 'soundOff'],
    ]);

    Array.from(statuses.values()).forEach(x => {
        document.getElementById("btnChangeSound").classList.remove(x);
    });

    document.getElementById("btnChangeSound").classList.add(statuses.get(checksound));
}

function repaint(id, value) {
    var el = document.getElementById(id);
    if (el.hasChildNodes())
        el.removeChild(el.firstChild);
    el.appendChild(document.createTextNode(value));
}

function getMouseButton(evt) {
    if (navigator.appName == 'Microsoft Internet Explorer') {
        if (window.event) {
            var tmp = evt.button;
            if (tmp == 1) return 0;
            if (tmp == 4) return 1;
            if (tmp == 2) return 2;
        } else {
            return evt.button;
        }
    } else {
        return evt.button;
    }
}

function getImagePath(index) {
    return "pieces/pieces" + index + ".png"
}