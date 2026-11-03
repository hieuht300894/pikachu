/* ==========================================================================
   Pikachu — Bảng xếp hạng (PHP + MySQL)

   Giao tiếp với game qua đúng một cửa: window.PikaLB
     .gameOver(payload)  — game gọi khi kết thúc ván, giữ điểm chờ đặt tên
     .mount(el, pending) — nhúng bảng vào hộp thoại kết thúc ván của game
     .open()             — mở hộp thoại riêng khi bấm nút 🏆

   Điểm được GIỮ LẠI cho tới khi người chơi lưu tên. Nếu họ bỏ qua hoặc đóng
   hộp thoại, điểm vẫn được gửi với tên mặc định — không ai mất điểm vì lười.
   ========================================================================== */
(function () {
'use strict';

/* Địa chỉ API. Cấu hình bằng window.PIKA_API trong index.html — nhờ vậy cùng một
   file JS deploy được lên mọi domain mà không phải sửa, và mọi domain dùng chung
   một bảng xếp hạng.

   Chạy trên máy cục bộ thì luôn quay về API cục bộ, kể cả khi PIKA_API đã trỏ ra
   ngoài: để lúc thử nghiệm không ghi nhầm vào dữ liệu thật của người chơi. */
var API = (function () {
    var u = (window.PIKA_API || '').trim();
    if (!u) { return 'leaderboard.php'; }
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) { return 'leaderboard.php'; }

    /* Cảnh báo sớm khi API khác nguồn với trang — đây là nguyên nhân của gần như
       mọi lỗi "không kết nối được máy chủ". Trình duyệt chỉ báo "CORS policy",
       không nói vì sao, nên in sẵn danh sách chỗ cần kiểm tra. */
    try {
        var a = new URL(u, location.href);
        if (a.origin === location.origin) { return u; }

        /* TỰ SỬA khi hai địa chỉ chỉ lệch mỗi "www".

           Đây luôn là cấu hình sai, không bao giờ là chủ ý: 'www.abc.com' và
           'abc.com' là hai nguồn khác nhau với trình duyệt, mà máy chủ lại gần
           như luôn 301 chuyển hướng giữa chúng — CORS không đi theo 301, nên
           request chết chắc. Dùng nguồn của chính trang thì luôn đúng.

           Tự sửa ở đây chứ không chỉ cảnh báo, vì index.html hay bị cache lâu
           (CDN, nginx thiếu cấu hình) và người sửa không có cách nào ép nó mới. */
        if (a.hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')) {
            console.warn('[Pikachu] PIKA_API lệch "www" so với trang — ĐÃ TỰ SỬA.\n' +
                '  cấu hình : ' + a.origin + '\n' +
                '  dùng     : ' + location.origin + '\n' +
                '  Nên sửa hẳn trong index.html: window.PIKA_API = \'\';');
            return location.origin + a.pathname + a.search;
        }

        console.warn(
            '[Pikachu] API KHÁC NGUỒN với trang — bảng xếp hạng có thể không tải được.\n' +
            '  trang: ' + location.origin + '\n' +
            '  API  : ' + a.origin + '\n' +
            '  Kiểm tra ba điều:\n' +
            '    1) máy chủ có 301 chuyển hướng địa chỉ API không — CORS KHÔNG đi theo 301\n' +
            '    2) domain của trang đã có trong $PIKA_ALLOWED_ORIGINS chưa\n' +
            '    3) phản hồi có header Access-Control-Allow-Origin chưa'
        );
    } catch (e) { /* URL không hợp lệ — cứ để fetch báo lỗi như bình thường */ }

    return u;
})();
var NAME_KEY = 'pikachu.name';
var PERIODS = [
    { k: 'day',   l: 'Hôm nay' },
    { k: 'week',  l: 'Tuần này' },
    { k: 'month', l: 'Tháng này' },
    { k: 'year',  l: 'Năm nay' }
];

var pending = null;      // điểm đang chờ tên: {score, level, cols, rows, duration}
var inflight = null;     // lời hứa của lần gửi điểm đang bay
var period = 'day';
var host = null;         // phần tử đang chứa bảng (trong hộp thoại game hoặc hộp thoại riêng)
var elList, elMine, elName, elTabs;

/* ------------------------------------------------------------- tiện ích */

function sid() { return window.PIKA_SESSION || ''; }

function token() {
    var hex = sid().replace(/[^0-9a-f]/gi, '');
    return (hex.length >= 4 ? hex.slice(-4) : '0000').toUpperCase();
}

function defaultName() { return 'Người chơi #' + token(); }

function getName() {
    try { return (localStorage.getItem(NAME_KEY) || '').trim(); } catch (e) { return ''; }
}

function setName(n) {
    n = String(n).replace(/<[^>]*>/g, '').trim().slice(0, 20);
    if (n) { try { localStorage.setItem(NAME_KEY, n); } catch (e) {} }
    return n;
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

/* --------------------------------------------------------------- gửi điểm */

function submitPending(then) {
    if (!pending) { if (then) then(); return; }

    var p = pending;
    pending = null;                                  // gửi đúng một lần
    var name = getName() || setName(defaultName());

    var body = 'action=submit'
        + '&session_id=' + encodeURIComponent(sid())
        + '&name=' + encodeURIComponent(name)
        + '&score=' + (p.score | 0) + '&level=' + (p.level | 0)
        + '&cols=' + (p.cols | 0) + '&rows=' + (p.rows | 0)
        + '&duration=' + (p.duration | 0);

    inflight = fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    }).catch(function () { /* mất mạng thì thôi, không chặn giao diện */ })
      .then(function () {
          inflight = null;
          if (then) then();
      });
}

/* ------------------------------------------------------------ dựng bảng */

function panelHtml(withName) {
    var tabs = PERIODS.map(function (p) {
        return '<button type="button" class="lb-tab' + (p.k === period ? ' on' : '') +
               '" data-p="' + p.k + '">' + p.l + '</button>';
    }).join('');

    return (withName
        ? '<div class="lb-namerow">' +
            '<input id="lbName" maxlength="20" autocomplete="off" spellcheck="false" placeholder="Nhập tên của bạn">' +
            '<button type="button" id="lbSave">Lưu</button>' +
          '</div>'
        : '') +
        '<div class="lb-tabs">' + tabs + '</div>' +
        '<div class="lb-list" id="lbList"><p class="lb-msg">Đang tải…</p></div>' +
        '<div class="lb-mine" id="lbMine"></div>';
}

function wire() {
    elList = host.querySelector('#lbList');
    elMine = host.querySelector('#lbMine');
    elName = host.querySelector('#lbName');
    elTabs = host.querySelector('.lb-tabs');

    elTabs.addEventListener('click', function (ev) {
        var b = ev.target.closest('.lb-tab');
        if (!b) return;
        period = b.dataset.p;
        var all = elTabs.querySelectorAll('.lb-tab');
        for (var i = 0; i < all.length; i++) all[i].classList.toggle('on', all[i] === b);
        load();
    });

    if (elName) {
        elName.value = getName();
        var save = host.querySelector('#lbSave');
        var doSave = function () {
            if (!elName.value.trim()) { elName.focus(); return; }
            setName(elName.value);
            save.textContent = 'Đã lưu';
            submitPending(load);
            setTimeout(function () { save.textContent = 'Lưu'; }, 1600);
        };
        save.addEventListener('click', doSave);
        elName.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') { ev.preventDefault(); doSave(); }
        });
    }
}

function load() {
    if (!elList) return;
    elList.innerHTML = '<p class="lb-msg">Đang tải…</p>';

    /* Nếu đang có lệnh gửi điểm bay dở thì phải đợi nó xong rồi mới đọc bảng.
       Không đợi thì người chơi vừa kết thúc ván sẽ thấy "chưa vào top" trong
       chớp mắt, rồi tên mới nhảy vào — trông như hỏng. */
    Promise.resolve(inflight).then(doLoad);
}

function doLoad() {
    if (!elList) return;

    fetch(API + '?action=rank&period=' + encodeURIComponent(period) +
          '&limit=10&session_id=' + encodeURIComponent(sid()))
        .then(function (r) { return r.json(); })
        .then(function (d) {
            if (!d || d.ok !== true) { fail('Không tải được bảng xếp hạng.'); return; }

            if (!d.list.length) {
                elList.innerHTML = '<p class="lb-msg">Chưa có ai ghi điểm trong kỳ này.<br>Chơi một ván để đứng đầu bảng!</p>';
            } else {
                var medal = ['🥇', '🥈', '🥉'];
                elList.innerHTML = d.list.map(function (r) {
                    return '<div class="lb-row' + (r.me ? ' me' : '') + '">' +
                        '<span class="lb-pos">' + (medal[r.rank - 1] || r.rank) + '</span>' +
                        '<span class="lb-nm">' + esc(r.name) + '</span>' +
                        '<span class="lb-sc">' + fmt(r.score) + '</span></div>';
                }).join('');
            }

            if (d.mine) {
                elMine.innerHTML = 'Bạn đang hạng <b>#' + d.mine.rank + '</b> với <b>' +
                                   fmt(d.mine.score) + '</b> điểm';
            } else if (pending) {
                elMine.innerHTML = 'Nhập tên rồi bấm <b>Lưu</b> để ghi điểm ván này.';
            } else {
                /* Máy chủ chỉ lưu top N của mỗi kỳ, nên không phân biệt được
                   "chưa chơi" với "đã chơi nhưng ngoài top". Nói chung chung
                   cho đúng cả hai trường hợp. */
                elMine.innerHTML = 'Bạn chưa vào top ' + (d.top || 50) + ' của kỳ này.';
            }
        })
        .catch(function () { fail('Không kết nối được máy chủ.'); });
}

function fail(msg) {
    elList.innerHTML = '<p class="lb-msg">' + msg + '</p>';
    if (elMine) elMine.innerHTML = '';
}

/* ----------------------------------------------------- hộp thoại riêng 🏆 */

var own = null;

function buildOwn() {
    if (own) return;
    own = document.createElement('div');
    own.id = 'lbModal';
    own.hidden = true;
    own.innerHTML =
        '<div class="card" role="dialog" aria-modal="true" aria-label="Bảng xếp hạng">' +
            '<div class="lb-head"><h2>🏆🏆 Daily Ranking</h2>' +
            '<button type="button" class="lb-x" id="lbClose" aria-label="Đóng">&times;</button></div>' +
            '<div id="lbBody"></div>' +
        '</div>';
    document.body.appendChild(own);

    own.addEventListener('click', function (ev) {
        if (ev.target === own) closeOwn();
    });
    own.querySelector('#lbClose').addEventListener('click', closeOwn);
}

function closeOwn() {
    if (elName && elName.value.trim()) setName(elName.value);
    submitPending();
    own.hidden = true;
    host = null; elList = elMine = elName = elTabs = null;
}

/* ------------------------------------------------------------ API công khai */

window.PikaLB = {
    /* Game gọi khi ván kết thúc. Nếu người chơi đã có tên từ trước thì gửi luôn,
       khỏi bắt nhập lại mỗi ván. */
    gameOver: function (payload) {
        pending = payload;
        if (getName()) submitPending();
    },

    /* Nhúng bảng vào hộp thoại kết thúc ván của game. */
    mount: function (el) {
        host = el;
        host.hidden = false;
        host.innerHTML = panelHtml(true);
        wire();
        load();
        if (!getName()) setTimeout(function () { try { elName.focus(); } catch (e) {} }, 250);
    },

    /* Người chơi bấm nút 🏆. Luôn hiện ô tên — đây là chỗ duy nhất để đổi tên
       sau này, nếu ẩn đi khi đã có tên thì không còn cách nào sửa. */
    open: function () {
        buildOwn();
        host = own.querySelector('#lbBody');
        host.innerHTML = panelHtml(true);
        wire();
        load();
        own.hidden = false;
    },

    /* Game gọi khi đóng hộp thoại kết thúc ván: chốt tên rồi gửi điểm còn treo. */
    flush: function () {
        if (elName && elName.value.trim()) setName(elName.value);
        submitPending();
        host = null; elList = elMine = elName = elTabs = null;
    }
};

})();
