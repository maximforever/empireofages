var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

animationSpeed = 50;

var WIDTH = window.innerWidth/1.5;
var HEIGHT = window.innerHeight/1.5;

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

var player = {
    x: WIDTH/2,
    y: HEIGHT/2,
    targetX: this.x,
    targetY: this.y,
    speed: 3                    // let's say this means 3px/move
}


$(document).ready(main);


function main(){
    console.log("Hello world!");
    gameInit();

}

function gameInit(){
    draw();
}


function draw(){

    clear();

    drawBackground();
    drawPlayer();

    if (needToMovePlayer()){
        movePlayer();
    }


    var animationCycle = setTimeout(function(){ requestAnimationFrame(draw) }, animationSpeed);

}


function drawBackground(){
    rect(0 ,0, WIDTH, HEIGHT, "#00FF4D"); 
}

function drawPlayer(){
    circle(player.x, player.y, 10, "white", false);
}

function needToMovePlayer(){
    return (player.x != player.targetX || playerY != player.TargetY);
}

function movePlayer(){

    var distanceX = player.targetX - player.x;
    var distanceY = player.targetY - player.y;






    player.x += (player.targetX - player.x);
    player.x += (player.targetX - player.x);
}


// LISTENERS

$("body").on("click", "#canvas", function setPlayerTarget(e){

    var newX = e.pageX - $("#canvas").position().left;
    var newY = e.pageY - $("#canvas").position().top;

    console.log("clicked at " + x + ", " + y);

    player.targetX = newX;
    player.targetY = newY;

});





// LIBRARY CODE

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}

function circle(x,y,r, color, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);               // start at 0, end at Math.PI*2
    ctx.closePath();
    ctx.fillStyle = color;

    if(stroke){
        if(player.powerUps.hyperspeed.active){
            ctx.strokeStyle = "#F9B600";
        } else {
            ctx.strokeStyle = "#0197FF";
        }
        ctx.lineWidth = 2;
    }


    ctx.fill();
}

function rect(x,y,w,h, color) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();

    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
}

function text(text, x, y, size, color, centerAlign){
    ctx.font =  size + "px Rajdhani";
    ctx.fillStyle = color;

    if(centerAlign){
        ctx.textAlign = "center";
    } else {
        ctx.textAlign = "left";
    }

    ctx.fillText(text, x, y);
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.strokeStyle = "rgba(250,250,250, 0.4)";
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

/* other functions */

function randBetween(min, max){
    return Math.random() * (max - min) + min;
}

function getDistance(x1, y1, x2, y2){
    return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}