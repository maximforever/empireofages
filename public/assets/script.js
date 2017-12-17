var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var score = 0;

animationSpeed = 50;

var WIDTH = window.innerWidth/1.5;
var HEIGHT = window.innerHeight/1.5;

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

var foods = [];

var shiftKey = clicked = false;

var player = {
    x: WIDTH/2,
    y: HEIGHT/2,
    size: HEIGHT/75,
    target: [], 
    speed: Math.floor(HEIGHT/100)                    // let's say this means 3px/move
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

    updateScore();
    updateSpeed();

    drawBackground();
    drawPlayer();

    if (needToMovePlayer()){
        drawPathToTarget();
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
    return (player.target.length && (player.x != player.target[0].x || player.y != player.target[0].y))
}

function movePlayer(){

    var distanceX = player.target[0].x - player.x;
    var distanceY = player.target[0].y - player.y;

    var distance = getDistance(player.x, player.y, player.target[0].x, player.target[0].y);
    
    var deltaX = deltaY = 0;

    if(distance > player.speed){
        deltaX = distanceX/(distance/player.speed);
        deltaY = distanceY/(distance/player.speed);
        player.x += deltaX;
        player.y += deltaY;
    } else {
        player.x = player.target[0].x;
        player.y = player.target[0].y;
        player.target.shift();                   // remove first element of the array - our waypoint
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


        for(var i = 1; i < player.target.length; i++){
            line(player.target[i-1].x, player.target[i-1].y, player.target[i].x, player.target[i].y);
            //circle(player.target[i].x, player.target[i].y, 3, "black", false);
        }

        line(player.x, player.y, player.target[0].x, player.target[0].y);
        //circle(player.target[0].x, player.target[0].y, 3, "black", false);

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

function updateSpeed(){
    $("#speed").text(player.speed);
}


// LISTENERS


$("body").on("mousedown", "#canvas", function(e){
    clicked = true;
    if(!shiftKey){
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;
        player.target.push({
            x: newX,
            y: newY
        });
    }
});

$("body").on("mouseup", "#canvas", function(){
    clicked = false;
});

$("body").on("mousemove", "#canvas", function(e){
    if(clicked && !shiftKey){
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;
        player.target.push({
            x: newX,
            y: newY
        });
    }
});


$("body").on("click", "#canvas", function setPlayerTarget(e){

    if(shiftKey){
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;

        // console.log("clicked at " + newX + ", " + newY);

        player.target.push({
            x: newX,
            y: newY
        });
    }

});

$("body").on("keydown", function(e){
    if(e.which == 16) { 
        shiftKey = true; 
    }

    if(e.which == 81){
        player.target = [];
    }

    if(e.which == 87){
        console.log(player.target.length);
    }

    if(e.which == 187){
        player.speed++;
        console.log(player.speed);
    }

    if(e.which == 189){
        if(player.speed > 1){
            player.speed--;
            console.log(player.speed);
        }
    }
});

$("body").on("keyup", function(e){
    if(e.which == 16) { shiftKey = false; }
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
        ctx.strokeStyle = "black";
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
    //ctx.globalCompositeOperation = "destination-over";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
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