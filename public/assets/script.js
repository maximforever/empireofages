var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var player = 1;
var score = 0;
var selectedUnit;

animationSpeed = 50;

var WIDTH = window.innerWidth/1.5;
var HEIGHT = window.innerHeight/1.5;

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

var foods = [];

var shiftKey = clicked = false;
var unitSelected = false;
var units = [];



/* */

$(document).ready(main);

function main(){
    console.log("Hello world!");
    gameInit();
}

function gameInit(){
    var unit = new Unit(WIDTH/2, HEIGHT/2, 10, 1)
    units.push(unit);
    gameLoop();
}


function gameLoop(){

    clear();

    updateScore();
    updateSpeed();

    drawBackground();

    drawUnits();
    moveUnits();
    unitsEatFood();

    generateFood();
    drawFood();

    var animationCycle = setTimeout(function(){ requestAnimationFrame(gameLoop) }, animationSpeed);

}

// CONSTRUCTORS

function Food(x, y){
    this.x = x;
    this.y = y;
    this.size = HEIGHT/100;
    this.alive = true;
}

function Unit(x, y, hp, player){
    this.id = Math.floor(Math.random()*10000);
    this.hp = hp;
    this.player = player;
    this.x = x;
    this.y = y;
    this.size = HEIGHT/75;
    this.selected = false;
    this.target = [];
    this.speed = Math.floor(HEIGHT/100);

    this.drawPathToTarget = function(){

        line(this.x, this.y, this.target[0].x, this.target[0].y);
        for(var i = 1; i < this.target.length; i++){
            line(this.target[i-1].x, this.target[i-1].y, this.target[i].x, this.target[i].y);
        }
        
    }

    this.move = function(){

        var distanceX = this.target[0].x - this.x;
        var distanceY = this.target[0].y - this.y;

        var distance = getDistance(this.x, this.y, this.target[0].x, this.target[0].y);
        
        var deltaX = deltaY = 0;

        if(distance > this.speed){
            deltaX = distanceX/(distance/this.speed);
            deltaY = distanceY/(distance/this.speed);
            this.x += deltaX;
            this.y += deltaY;
        } else {
            this.x = this.target[0].x;
            this.y = this.target[0].y;
            this.target.shift();                   // remove first element of the array - our waypoint
        }

    }

}


// FUNCTIONS


function moveUnits(){
    units.forEach(function(unit){
        if(unit.hp > 0 && unit.player == player && unit.target.length){
            unit.drawPathToTarget();
            unit.move();
        }

    })
}

function drawBackground(){
    rect(0 ,0, WIDTH, HEIGHT, "#00FF4D"); 
}

function drawUnits(){
    units.forEach(function(unit){
        if(unit.hp > 0){
            var color = "white";
            if(unit.selected){ color = "blue" }
            circle(unit.x, unit.y, unit.size, color, false);
        }
    })  
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

function generateFood(){
    if(Math.random() < 0.01){
        console.log("Generating food!");
        var thisFood = new Food(Math.random() * HEIGHT, Math.random() * WIDTH);
        foods.push(thisFood);
    }
}



function unitsEatFood(){

    units.forEach(function(unit){
        foods.forEach(function(food){
            var distance = getDistance(food.x, food.y, unit.x, unit.y);
            if( distance < (unit.size + food.size) && food.alive){
                food.alive = false;
                score ++;
                unit.size *= 1.1;
            }
        })
    })
    
}

function updateScore(){
    $("#score").text(score);
}

function updateSpeed(){
    $("#speed").text(player.speed);
}

function unselectUnits(){
    units.forEach(function(unit){
        unit.selected = false;
    })
}

function freezeEverything(){
    units.forEach(function(unit){
        unit.target = [];
    });
}

function printPathLength(){
    units.forEach(function(unit){
        if(unit.selected){
            console.log(unit.target.length);
        }
    });
}


// LISTENERS


$("body").on("mousedown", "#canvas", function(e){

    var thisSelectedUnit = false;
    var clickX = e.pageX - $("#canvas").position().left;
    var clickY = e.pageY - $("#canvas").position().top;

    units.forEach(function(unit){
        var distanceToClick = getDistance(unit.x, unit.y, clickX, clickY)
        if (distanceToClick < unit.size && !unitSelected){
            thisSelectedUnit = unit;
            unit.selected = unitSelected = true;
        } else {
            unit.selected = unitSelected = false;
        }
    });



    if(thisSelectedUnit){     
        clicked = true;
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;

        if(!shiftKey){
            thisSelectedUnit.target = [{
                x: newX,
                y: newY
            }];
        } else {
            thisSelectedUnit.target.push({
                x: newX,
                y: newY
            });
        }
    } 

});

$("body").on("mouseup", "#canvas", function(){
    clicked = false;
});

$("body").on("mousemove", "#canvas", function(e){
    if(!shiftKey && clicked && unitSelected){  
        units.forEach(function(unit){
            if(unit.selected){
                var newX = e.pageX - $("#canvas").position().left;
                var newY = e.pageY - $("#canvas").position().top;
                unit.target.push({
                    x: newX,
                    y: newY
                });

            }
        });
    }
});


$("body").on("keydown", function(e){
    if(e.which == 16) { 
        shiftKey = true; 
    }

    if(e.which == 81){
        player.target = [];
        freezeEverything();
    }

    if(e.which == 87){
        if(unitSelected){
            printPathLength();
        }
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