var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var score = 0;

animationSpeed = 50;

var WIDTH = window.innerWidth/1.5;
var HEIGHT = window.innerHeight/1.5;

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

var foods = [];

var player = {
    x: WIDTH/2,
    y: HEIGHT/2,
    size: HEIGHT/75,
    targetX: WIDTH/2,
    targetY: HEIGHT/2,
    speed: HEIGHT/100                    // let's say this means 3px/move
}


console.log(player);

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

    updateScore();

    drawBackground();
    drawPlayer();

    if (needToMovePlayer()){
        // drawPathToTarget();
        movePlayer();
        eat();
    }

    generateFood();
    drawFood();

    var animationCycle = setTimeout(function(){ requestAnimationFrame(draw) }, animationSpeed);

}

// CONSTRUCTORS

    function Food(x, y){
        this.x = x;
        this.y = y;
        this.size = HEIGHT/100;
        this.alive = true;
    }


// FUNCTIONS


function drawBackground(){
    rect(0 ,0, WIDTH, HEIGHT, "#00FF4D"); 
}

function drawPlayer(){
    circle(player.x, player.y, player.size, "white", false);
}

function drawFood(food){
    foods.forEach(function(food){
        if(food.alive){
            circle(food.x, food.y, food.size, "orange", true)
        }
        
    })
}

function needToMovePlayer(){
    return (player.x != player.targetX || player.y != player.targetY);
}

function movePlayer(){

    var distanceX = player.targetX - player.x;
    var distanceY = player.targetY - player.y;

    var distance = getDistance(player.x, player.y, player.targetX, player.targetY);
    
    var deltaX = deltaY = 0;

    if(distance > player.speed){
        deltaX = distanceX/(distance/player.speed);
        deltaY = distanceY/(distance/player.speed);
        player.x += deltaX;
        player.y += deltaY;
    } else {
        player.x = player.targetX;
        player.y = player.targetY;
    }

}

function generateFood(){
    if(Math.random() < 0.01){
        console.log("Generating food!");
        var thisFood = new Food(Math.random() * HEIGHT, Math.random() * WIDTH);
        foods.push(thisFood);
    }
}

function drawPathToTarget(){
    line(player.x, player.y, player.targetX, player.targetY);
    circle(player.targetX, player.targetY, 3, "black", false);
}

function eat(){

    foods.forEach(function(food){
        var distance = getDistance(food.x, food.y, player.x, player.y);
        if( distance < (player.size + food.size) && food.alive){
            food.alive = false;
            score ++;
            player.size *= 1.1;
        }
    })

}

function updateScore(){
    $("#score").text(score);
}


// LISTENERS

$("body").on("click", "#canvas", function setPlayerTarget(e){

    var newX = e.pageX - $("#canvas").position().left;
    var newY = e.pageY - $("#canvas").position().top;

    // console.log("clicked at " + newX + ", " + newY);

    player.targetX = newX;
    player.targetY = newY;

});

/*
$("body").on("mousemove", "#canvas", function setPlayerTarget(e){

    if(e.which == 1){
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;


        player.targetX = newX;
        player.targetY = newY;
    }
});

$("body").on("mouseup", "#canvas", function setPlayerTarget(e){

    player.targetX = player.x;
    player.targetY = player.y;
    
});

*/

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
        ctx.strokeStyle = "gray";
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
    ctx.strokeStyle = "black";
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

/* other functions */

function randBetween(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

function getDistance(x1, y1, x2, y2){
    return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}