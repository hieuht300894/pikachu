/**
 * Created by Linh on 4/25/2017.
 */
var adLoaded = false;

function initAdmob() {
    admob.rewardvideo.config({
        id: 'ca-app-pub-6851043390764733/8245096009',
        isTesting: false,
        autoShow: false,
    });
    admob.rewardvideo.prepare();
}

function showAd() {
    // if (!adLoaded) {
    //     return;
    // } else {
    //     admob.rewardvideo.show();
    // }
}

function updateAdStatus(status) {
    adLoaded = status;
    document.getElementById("btnAddLife").disabled = !status;
}

document.addEventListener('admob.rewardvideo.events.LOAD_FAIL', function(event) {
    console.log(event);
    updateAdStatus(false);
    admob.rewardvideo.prepare();
});

document.addEventListener('admob.rewardvideo.events.LOAD', function(event) {
    console.log(event);
    updateAdStatus(true);
});

document.addEventListener('admob.rewardvideo.events.CLOSE', function(event) {
    console.log(event);
    admob.rewardvideo.prepare();
});

document.addEventListener('admob.rewardvideo.events.REWARD', function(event) {
    console.log(event);
    rewardLife();
});
