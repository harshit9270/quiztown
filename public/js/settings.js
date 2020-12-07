var color1 = document.getElementById("color1");
var color2 = document.getElementById("color2");
var color3 = document.getElementById("color3");
var color4 = document.getElementById("color4");
var color5 = document.getElementById("color5");
var color6 = document.getElementById("color6");

color1.addEventListener("click", myColor, false);
color2.addEventListener("click", myColor, false);
color3.addEventListener("click", myColor, false);
color4.addEventListener("click", myColor, false);
color5.addEventListener("click", myColor, false);
color6.addEventListener("click", myColor, false);

function myColor() {
    var idColor = this.getAttribute("color-id");
    document.body.style.backgroundColor = idColor;
}

