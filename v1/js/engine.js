/**
 * Created by Linh on 4/17/2017.
 */
var engine = {

    getNewMatrix: function () {
        var a = newArray(18);
        var i, j, k, t, remain, key;
        var stop;
        for (i = 0; i < 18; i++)
            for (j = 0; j < 11; j++)
                a[i][j] = 0;
        remain = 144;
        for (k = 1; k <= 36; k++) {
            for (t = 1; t <= 4; t++) {
                key = getRandom(remain--) + 1;
                stop = false;
                for (i = 1; i <= 16; i++) {
                    if (stop)
                        break;
                    else {
                        for (j = 1; j <= 9; j++) {
                            if (a[i][j] == 0) {
                                key--;
                                if (key == 0) {
                                    stop = true;
                                    a[i][j] = k;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return a;
    },

    fixMatrix: function (a, fixType) {
        // --- BASE GAME LEVELS (1 - 9) ---
        if (fixType == 1) return; // Classic / Static Mode
        if (fixType == 2) { this.fixZone(a, 1, 1, 16, 9, 0); } // Global Slide UP
        else if (fixType == 3) { this.fixZone(a, 1, 1, 16, 9, 1); } // Global Slide DOWN
        else if (fixType == 4) { this.fixZone(a, 1, 1, 16, 9, 3); } // Global Slide LEFT
        else if (fixType == 5) { this.fixZone(a, 1, 1, 16, 9, 2); } // Global Slide RIGHT
        else if (fixType == 6) { // Top half shifts UP, Bottom half shifts DOWN
            this.fixZone(a, 1, 5, 16, 9, 0);
            this.fixZone(a, 1, 1, 16, 4, 1);
        }
        else if (fixType == 7) { // Top half shifts DOWN, Bottom half shifts UP
            this.fixZone(a, 1, 5, 16, 9, 1);
            this.fixZone(a, 1, 1, 16, 4, 0);
        }
        else if (fixType == 8) { // Left half shifts LEFT, Right half shifts RIGHT
            this.fixZone(a, 1, 1, 8, 9, 3);
            this.fixZone(a, 9, 1, 16, 9, 2);
        }
        else if (fixType == 9) { // Left half shifts RIGHT, Right half shifts LEFT
            this.fixZone(a, 1, 1, 8, 9, 2);
            this.fixZone(a, 9, 1, 16, 9, 3);
        }

        // --- EXTENDED GAME LEVELS (10 - 40) ---

        // Horizontal Splits (Top vs Bottom Halves Alternating)
        else if (fixType == 10) {
            this.fixZone(a, 1, 1, 16, 4, 3); // Top half -> LEFT
            this.fixZone(a, 1, 5, 16, 9, 2); // Bottom half -> RIGHT
        }
        else if (fixType == 11) {
            this.fixZone(a, 1, 1, 16, 4, 2); // Top half -> RIGHT
            this.fixZone(a, 1, 5, 16, 9, 3); // Bottom half -> LEFT
        }

        // Vertical Splits (Left vs Right Halves Alternating)
        else if (fixType == 12) {
            this.fixZone(a, 1, 1, 8, 9, 0);  // Left half -> UP
            this.fixZone(a, 9, 1, 16, 9, 1); // Right half -> DOWN
        }
        else if (fixType == 13) {
            this.fixZone(a, 1, 1, 8, 9, 1);  // Left half -> DOWN
            this.fixZone(a, 9, 1, 16, 9, 0); // Right half -> UP
        }

        // Concentric Core Systems (Inward vs Outward Convergence)
        else if (fixType == 14) {
            this.fixZone(a, 1, 1, 16, 4, 1); // Compression to Row 5 (Top down)
            this.fixZone(a, 1, 5, 16, 9, 0); // Compression to Row 5 (Bottom up)
        }
        else if (fixType == 15) {
            this.fixZone(a, 1, 1, 16, 4, 0); // Expansion outwards (Top up)
            this.fixZone(a, 1, 5, 16, 9, 1); // Expansion outwards (Bottom down)
        }
        else if (fixType == 16) {
            this.fixZone(a, 1, 1, 8, 9, 2);  // Compression to Center Columns (Left right)
            this.fixZone(a, 9, 1, 16, 9, 3); // Compression to Center Columns (Right left)
        }
        else if (fixType == 17) {
            this.fixZone(a, 1, 1, 8, 9, 3);  // Expansion to Board Edges (Left left)
            this.fixZone(a, 9, 1, 16, 9, 2); // Expansion to Board Edges (Right right)
        }

        // Grid Quadrant Splits
        else if (fixType == 18) { // Pinwheel Motion Clockwise
            this.fixZone(a, 1, 1, 8, 4, 0);   // Top-Left -> UP
            this.fixZone(a, 9, 1, 16, 4, 2);  // Top-Right -> RIGHT
            this.fixZone(a, 9, 5, 16, 9, 1);  // Bottom-Right -> DOWN
            this.fixZone(a, 1, 5, 8, 9, 3);   // Bottom-Left -> LEFT
        }
        else if (fixType == 19) { // Pinwheel Motion Counter-Clockwise
            this.fixZone(a, 1, 1, 8, 4, 3);   // Top-Left -> LEFT
            this.fixZone(a, 9, 1, 16, 4, 0);  // Top-Right -> UP
            this.fixZone(a, 9, 5, 16, 9, 2);  // Bottom-Right -> RIGHT
            this.fixZone(a, 1, 5, 8, 9, 1);   // Bottom-Left -> DOWN
        }
        else if (fixType == 20) { // All Quadrants Collapse to Center Matrix Point
            this.fixZone(a, 1, 1, 8, 4, 1); this.fixZone(a, 1, 1, 8, 4, 2);
            this.fixZone(a, 9, 1, 16, 4, 1); this.fixZone(a, 9, 1, 16, 4, 3);
            this.fixZone(a, 1, 5, 8, 9, 0); this.fixZone(a, 1, 5, 8, 9, 2);
            this.fixZone(a, 9, 5, 16, 9, 0); this.fixZone(a, 9, 5, 16, 9, 3);
        }
        else if (fixType == 21) { // All Quadrants Scatter Outwards to Corner Destinations
            this.fixZone(a, 1, 1, 8, 4, 0); this.fixZone(a, 1, 1, 8, 4, 3);
            this.fixZone(a, 9, 1, 16, 4, 0); this.fixZone(a, 9, 1, 16, 4, 2);
            this.fixZone(a, 1, 5, 8, 9, 1); this.fixZone(a, 1, 5, 8, 9, 3);
            this.fixZone(a, 9, 5, 16, 9, 1); this.fixZone(a, 9, 5, 16, 9, 2);
        }

        // Striated Column/Row Flows
        else if (fixType == 22) { // Alternate Columns Interlocking Vertically
            for (var col = 1; col <= 16; col++) {
                if (col % 2 !== 0) this.fixZone(a, col, 1, col, 9, 0); // Odd -> UP
                else this.fixZone(a, col, 1, col, 9, 1);               // Even -> DOWN
            }
        }
        else if (fixType == 23) { // Alternate Rows Interlocking Horizontally
            for (var row = 1; row <= 9; row++) {
                if (row % 2 !== 0) this.fixZone(a, 1, row, 16, row, 3); // Odd -> LEFT
                else this.fixZone(a, 1, row, 16, row, 2);               // Even -> RIGHT
            }
        }

        // Boundary Systems
        else if (fixType == 24) { // Frame Borders Squeeze Inward
            this.fixZone(a, 1, 1, 16, 1, 1); this.fixZone(a, 1, 9, 16, 9, 0);
            this.fixZone(a, 1, 1, 1, 9, 2); this.fixZone(a, 16, 1, 16, 9, 3);
        }
        else if (fixType == 25) { // Inner Anchor Core Burst
            this.fixZone(a, 5, 3, 12, 4, 0); this.fixZone(a, 5, 6, 12, 7, 1);
            this.fixZone(a, 5, 3, 8, 7, 3); this.fixZone(a, 9, 3, 12, 7, 2);
        }

        // Tiered Sectional Systems
        else if (fixType == 26) { // 3-Way Column Divergence
            this.fixZone(a, 1, 1, 5, 9, 3); this.fixZone(a, 6, 1, 11, 9, 0); this.fixZone(a, 12, 1, 16, 9, 2);
        }
        else if (fixType == 27) { // 3-Way Column Alternation
            this.fixZone(a, 1, 1, 5, 9, 1); this.fixZone(a, 6, 1, 11, 9, 1); this.fixZone(a, 12, 1, 16, 9, 0);
        }
        else if (fixType == 28) { // 3-Way Row Sliding Interlock
            this.fixZone(a, 1, 1, 16, 3, 0); this.fixZone(a, 1, 4, 16, 6, 3); this.fixZone(a, 1, 7, 16, 9, 1);
        }

        // Asleaved / Slanted Cascades
        else if (fixType == 29) {
            this.fixZone(a, 1, 1, 8, 4, 1); this.fixZone(a, 9, 5, 16, 9, 2);
        }
        else if (fixType == 30) {
            this.fixZone(a, 9, 1, 16, 4, 0); this.fixZone(a, 1, 5, 8, 9, 3);
        }
        else if (fixType == 31) {
            this.fixZone(a, 1, 1, 2, 9, 2); this.fixZone(a, 15, 1, 16, 9, 3); this.fixZone(a, 3, 4, 14, 5, 0);
        }
        else if (fixType == 32) { // Compound Cascade Vortex
            this.fixZone(a, 1, 1, 16, 9, 0); this.fixZone(a, 1, 1, 16, 9, 2);
            this.fixZone(a, 1, 1, 16, 9, 1); this.fixZone(a, 1, 1, 16, 9, 3);
        }

        // --- NEW CHANNELS (LEVELS 33 - 40) ---
        else if (fixType == 33) { // Horizontal Central Squeeze
            this.fixZone(a, 1, 1, 8, 9, 2);  // Left to right center
            this.fixZone(a, 9, 1, 16, 9, 3); // Right to left center
        }
        else if (fixType == 34) { // Horizontal Outer Escape
            this.fixZone(a, 1, 1, 8, 9, 3);  // Left side escapes to Left boundary
            this.fixZone(a, 9, 1, 16, 9, 2); // Right side escapes to Right boundary
        }
        else if (fixType == 35) { // Vertical Central Squeeze
            this.fixZone(a, 1, 1, 16, 4, 1); // Upper half collapses down
            this.fixZone(a, 1, 5, 16, 9, 0); // Lower half collapses up
        }
        else if (fixType == 36) { // Vertical Outer Escape
            this.fixZone(a, 1, 1, 16, 4, 0); // Upper rows escape up
            this.fixZone(a, 1, 5, 16, 9, 1); // Lower rows escape down
        }
        else if (fixType == 37) { // Tiered Horizontal Zig-Zag
            this.fixZone(a, 1, 1, 16, 3, 3); // Row Tier 1 -> Left
            this.fixZone(a, 1, 4, 16, 6, 2); // Row Tier 2 -> Right
            this.fixZone(a, 1, 7, 16, 9, 3); // Row Tier 3 -> Left
        }
        else if (fixType == 38) { // Tiered Horizontal Inverse Zig-Zag
            this.fixZone(a, 1, 1, 16, 3, 2); // Row Tier 1 -> Right
            this.fixZone(a, 1, 4, 16, 6, 3); // Row Tier 2 -> Left
            this.fixZone(a, 1, 7, 16, 9, 2); // Row Tier 3 -> Right
        }
        else if (fixType == 39) { // Dual Cross-Corner Intersection Slices
            this.fixZone(a, 1, 1, 8, 4, 1);   // Top-Left Block -> Down
            this.fixZone(a, 9, 5, 16, 9, 0);  // Bottom-Right Block -> Up
            this.fixZone(a, 9, 1, 16, 4, 3);  // Top-Right Block -> Left
            this.fixZone(a, 1, 5, 8, 9, 2);   // Bottom-Left Block -> Right
        }
        else if (fixType == 40) { // Synchronized Multi-Boundary Compression Ripple
            this.fixZone(a, 1, 1, 4, 9, 2);   // Left Squeeze
            this.fixZone(a, 13, 1, 16, 9, 3); // Right Squeeze
            this.fixZone(a, 5, 1, 12, 3, 1);  // Upper Squeeze
            this.fixZone(a, 5, 7, 12, 9, 0);  // Lower Squeeze
        }
    },

    repairMatrix: function (a) {
        var b = new Array;
        var i, j, k = 0;
        for (i = 1; i <= 16; i++)
            for (j = 1; j <= 9; j++)
                if (a[i][j] > 0) b[k++] = a[i][j];
        mixArray(b, k);
        k = 0;
        for (i = 1; i <= 16; i++)
            for (j = 1; j <= 9; j++)
                if (a[i][j] > 0) a[i][j] = b[k++];
        var tmp = newArray(18);
        for (i = 0; i < 18; i++)
            for (j = 0; j < 11; j++) tmp[i][j] = a[i][j] > 0 ? 1 : 0;
        var rect = this.findCheat(tmp);
        var k = 0;
        var u = 0,
            v = 0;
        for (i = 1; i <= 16; i++) {
            if (k > 0) break;
            else {
                for (j = 1; j <= 9; j++) {
                    if (i != rect.x || j != rect.y) {
                        if (a[i][j] == a[rect.x][rect.y]) {
                            u = i;
                            v = j;
                            k = 1;
                            break;
                        }
                    }
                }
            }
        }
        swap(a, rect.width, rect.height, u, v);
    },

    checkPath: function (a, i1, j1, i2, j2) {
        if (i1 == i2 && j1 == j2) return null;
        if (a[i1][j1] == 0 || a[i2][j2] == 0) return null;
        if (a[i1][j1] != a[i2][j2]) return null;
        var fist, last, i, j, t;
        var queue = new Array;
        var dad = newArray(18);
        var count = newArray(18);
        for (i = 0; i < 198; i++) queue[i] = new Point(0, 0);
        fist = 0;
        last = 0;
        queue[0].x = i1;
        queue[0].y = j1;
        for (i = 0; i < 18; i++)
            for (j = 0; j < 11; j++)
                dad[i][j] = new Point(-1, -1);
        dad[i1][j1].x = -2;
        count[i1][j1] = 0;
        var canGo = new Array;
        var p = new Array;
        var q = new Array;
        while (fist <= last) {
            i = queue[fist].x;
            j = queue[fist].y;
            fist++;
            for (t = 0; t < 4; t++) {
                canGo[t] = true;
                p[t] = i;
                q[t] = j;
            }
            do {
                for (t = 0; t < 4; t++) {
                    if (canGo[t]) {
                        p[t] += UU[t];
                        q[t] += VV[t];
                        if (!myInside(p[t], q[t])) {
                            canGo[t] = false;
                            continue;
                        }
                        if (p[t] == i2 && q[t] == j2) {
                            dad[p[t]][q[t]].x = i;
                            dad[p[t]][q[t]].y = j;
                            return createArrayList(dad, i2, j2);
                        }
                        if (a[p[t]][q[t]] > 0) {
                            canGo[t] = false;
                            continue;
                        }
                        if (dad[p[t]][q[t]].x != -1) continue;
                        if (count[i][j] == 2) continue;
                        last++;
                        queue[last].x = p[t];
                        queue[last].y = q[t];
                        dad[p[t]][q[t]].x = i;
                        dad[p[t]][q[t]].y = j;
                        count[p[t]][q[t]] = count[i][j] + 1;
                    }
                }
            } while (canGo[0] || canGo[1] || canGo[2] || canGo[3]);
        }
        return null;
    },

    findCheat: function (a) {
        var i, j;
        var b = new Array;
        var c = new Array;
        var k = 0;
        for (i = 1; i <= 16; i++)
            for (j = 1; j <= 9; j++)
                if (a[i][j] > 0) {
                    b[k] = i;
                    c[k] = j;
                    k++;
                }
        mixArray2(b, c, k);
        for (i = 0; i < k - 1; i++)
            for (j = k - 1; j > i; j--)
                if (this.checkPath(a, b[i], c[i], b[j], c[j]) != null)
                    return new Rectangle(b[i], c[i], b[j], c[j]);
        return null;
    },

    findTwin: function (a, i1, j1) {
        var fist, last, i, j, t;
        var queue = new Array;
        var cx = newArray(18);
        var count = newArray(18);
        for (i = 0; i < 198; i++) queue[i] = new Point();
        fist = 0;
        last = 0;
        queue[0].x = i1;
        queue[0].y = j1;
        for (i = 0; i < 18; i++)
            for (j = 0; j < 11; j++) cx[i][j] = true;
        cx[i1][j1] = false;
        count[i1][j1] = 0;
        var canGo = new Array;
        var p = new Array;
        var q = new Array;
        while (fist <= last) {
            i = queue[fist].x;
            j = queue[fist].y;
            fist++;
            for (t = 0; t < 4; t++) {
                canGo[t] = true;
                p[t] = i;
                q[t] = j;
            }
            do {
                for (t = 0; t < 4; t++) {
                    if (canGo[t]) {
                        p[t] += UU[t];
                        q[t] += VV[t];
                        if (!myInside(p[t], q[t])) {
                            canGo[t] = false;
                            continue;
                        }
                        if (a[p[t]][q[t]] == a[i1][j1] && cx[p[t]][q[t]])
                            return new Point(p[t], q[t]);
                        if (a[p[t]][q[t]] > 0) {
                            canGo[t] = false;
                            continue;
                        }
                        if (!cx[p[t]][q[t]]) continue;
                        if (count[i][j] == 2) continue;
                        last++;
                        queue[last].x = p[t];
                        queue[last].y = q[t];
                        cx[p[t]][q[t]] = false;
                        count[p[t]][q[t]] = count[i][j] + 1;
                    }
                }
            } while (canGo[0] || canGo[1] || canGo[2] || canGo[3]);
        }
        return null;
    },

    isEnd: function (a) {
        var i, j;
        for (i = 1; i <= 16; i++)
            for (j = 1; j <= 9; j++)
                if (a[i][j] > 0)
                    if (this.findTwin(a, i, j) != null)
                        return false;
        return true;
    },

    fixZone: function (a, i1, j1, i2, j2, vector) {
        var i, j, p, q;
        var stop;
        do {
            stop = true;
            for (i = i1; i <= i2; i++)
                for (j = j1; j <= j2; j++)
                    if (a[i][j] > 0) {
                        p = i + UU[vector];
                        q = j + VV[vector];
                        if (p >= 1 && p <= 16 && q >= 1 && q <= 9) {
                            if (a[p][q] == 0) {
                                swap(a, i, j, p, q);
                                stop = false;
                            }
                        }
                    }
        } while (!stop);
    }

}