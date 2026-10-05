/**
 * Created by Linh on 4/16/2017.
 */
var highlight = "#ff0000";
var normal = "#009933";

function newPiece(col, row, value) {
    var div = document.createElement("div");
    div.image = document.createElement("img");
    div.setImage = function(imgIndex) {
        this.image.src = getImagePath(imgIndex);
        this.valueInMatrix = imgIndex;
    }
    if (value > 0) div.setImage(value);
    div.appendChild(div.image);
    div.colIndex = col;
    div.rowIndex = row;
    div.style.position = "absolute";
    div.style.left = col * PieceWidth  + offsetLeft + "px";
    div.style.top = row * PieceHeight + offsetTop + "px";
    div.style.width = PieceWidth + "px";
    div.style.height = PieceHeight + "px";
    div.isVisible = true;
    div.setVisible = function(flag) {
        this.isVisible = flag;
        this.style.visibility = flag ? "visible" : "hidden";
    }
    div.setBorder = function(thick, color) {
        this.image.border = thick;
        this.image.style.borderColor = color;
    }
    div.setHighlight = function() {
        this.setBorder(1, highlight);
    }
    div.setSelected = function(opacity) {
        opacity = (opacity == 100) ? 200 : opacity;
        this.image.style.filter = "alpha(opacity:" + opacity + ")";
        this.image.style.KHTMLOpacity = opacity / 100;
        this.image.style.MozOpacity = opacity / 100;
        this.image.style.opacity = opacity / 100;
    }
    div.setNormal = function() {
        this.setBorder(1, normal);
    }
    div.onmouseover = function() {
        this.setHighlight();
    }
    div.onmouseout = function() {
        this.setNormal();
    }
    div.onmousedown = function(evt) {
        if (window.event) evt = window.event;
        _board.onClickPiece(evt, this.colIndex, this.rowIndex);
    }
    div.setNormal();
    return div;
}
