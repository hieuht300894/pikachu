/**
 * Created by Linh on 4/17/2017.
 */
var UU = new Array(0, 0, 1, -1);
var VV = new Array(1, -1, 0, 0);

function mixArray(a, n) {
    var b = generateHV(n);
    var c = new Array;
    for (var i = 0; i < n; i++)
        c[i] = a[b[i]];
    for (var i = 0; i < n; i++)
        a[i] = c[i];
}

function mixArray2(a, aa, n) {
    var b = generateHV(n);
    var c = new Array;
    var i;
    for (i = 0; i < n; i++)
        c[i] = a[b[i]];
    for (i = 0; i < n; i++)
        a[i] = c[i];
    for (i = 0; i < n; i++)
        c[i] = aa[b[i]];
    for (i = 0; i < n; i++)
        aa[i] = c[i];
}

function generateHV(n) {
    var a = new Array;
    var i, j, k, t;
    for (i = 0; i < n; i++) a[i] = n;
    j = n;
    for (i = 0; i < n; i++) {
        k = getRandom(j--) + 1;
        t = 0;
        while (k > 0) {
            if (a[t++] == n) k--;
        }
        a[t - 1] = i;
    }
    return a;
}

function swap(a, i1, j1, i2, j2) {
    var tmp = a[i1][j1];
    a[i1][j1] = a[i2][j2];
    a[i2][j2] = tmp;
}

function getRandom(n) {
    return Math.round(Math.random() * (n - 1));
}

function myInside(i, j) {
    return i >= 0 && i < 18 && j >= 0 && j < 11;
}

function createArrayList(dad, i, j) {
    arrayList = new Array;
    var p, q;
    do {
        arrayList.push(new Point(i, j));
        p = dad[i][j].x;
        q = dad[i][j].y;
        i = p;
        j = q;
    } while (i != -2);
    return arrayList;
}

function newArray(col) {
    var a = new Array;
    for (var i = 0; i < col; i++)
        a[i] = new Array;
    return a;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function getRRR(p1, p2) {
    var x1, y1, x2, y2;
    if (p1.x < p2.x) {
        x1 = p1.x;
        x2 = p2.x;
    } else {
        x2 = p1.x;
        x1 = p2.x;
    }
    if (p1.y < p2.y) {
        y1 = p1.y;
        y2 = p2.y;
    } else {
        y2 = p1.y;
        y1 = p2.y;
    }
    return new Rectangle(x1 - 3, y1 - 3, x2 - x1 + 6, y2 - y1 + 6);
}