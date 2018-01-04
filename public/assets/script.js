/* SOCKET.IO */
var socket = io();

/* TEMP VARS */
var forLoopCount = 0;

/* GLOBAL VARS */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var player = 1;
var gold = 10;
var selectedUnit = selectedBuilding = false;

animationSpeed = 50;

var WIDTH = window.innerWidth*0.45;
var HEIGHT = window.innerHeight*2/3;

canvas.width =  WIDTH;
canvas.height =  HEIGHT;

var foods = [];

var shiftKey = zKey = clicked = false,
    units = [],
    buildings = [];

var clearMessage;

var playerColors = {
    1: "#10F1FF",
    2: "#F94375"
}

var buildingSpecs ={
    barracks: {
        height: 40,
        width: 60,
        hp: 250,
        color: "gray"
    },
    tower: {
        height: 25,
        width: 25,
        hp: 500,
        color: "orange"
    }
}

var unitSubsections = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: []
}

var foodSubsections = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: []
}

// launch game
$(document).ready(main);
    

function main(){
    console.log("Hello world!");
    gameInit();
}

function gameInit(){
    // createUnit(WIDTH/2, HEIGHT/2, 1);
    // createUnit(WIDTH/2 + 30, HEIGHT/2 + 30, 1);
    createBuilding(50, 50, "barracks")

    /*createUnit(WIDTH*Math.random(), HEIGHT*Math.random(), 1);
    createUnit(WIDTH*Math.random(), HEIGHT*Math.random(), 1);
    createUnit(WIDTH*Math.random(), HEIGHT*Math.random(), 1);*/

    gameLoop();
}

// main game loop
function gameLoop(){

    //console.log(selectedUnit.id);
    
    $("#forLoopCount").text(forLoopCount);
    forLoopCount = 0;

    clear();

    createKtree(units);
    createKtree(foods);
    createUnitSubsections();
    createFoodSubsections();

    displayControls();

    updateGoldCount();
    updateCurrentPlayer();
    updateSpeed();
    updateSelection();
    //displayUnitInfo();
    //displayFoodInfo();

    drawBackground();

    drawUnits();
    moveUnits();
    unitsEatFood();

    drawBuildings();

    generateFood();
    drawFood();


    shareGameLoop();


    var animationCycle = setTimeout(function(){ requestAnimationFrame(gameLoop) }, animationSpeed);

}


// CONSTRUCTORS

function Food(posX, posY){
    this.position = {
        x: posX,
        y: posY,
        section: 0
    }
    this.size = HEIGHT/100;
    this.alive = true;
}

function Building(posX, posY, buildingType){
    this.hp = 100;
    this.id = Math.floor(Math.random()*10000);
    this.player = player;
    this.type = buildingType;
    this.position = {
        x: posX,
        y: posY,
    }
    this.height = buildingSpecs[buildingType].height;
    this.width = buildingSpecs[buildingType].width;
    this.color = buildingSpecs[buildingType].color;
    this.hp = buildingSpecs[buildingType].hp;
    this.queue = [];
    this.selected = false;

    this.draw = function(){
        if(this.selected){ 
            rect(this.position.x, this.position.y, this.width, this.height, "white")
        } else {
            rect(this.position.x, this.position.y, this.width, this.height, this.color)
        }
    }


}


function Unit(xPos, yPos, hp, player){
    this.id = Math.floor(Math.random()*10000);
    this.hp = hp;
    this.player = player;
    this.position = {
        x: xPos,
        y: yPos,
        section: 0,
        target: []
    };
    this.size = HEIGHT/75;
    this.selected = false;
    this.speed = Math.floor(HEIGHT/100);

    this.drawPathToTarget = function(){

        line(this.position.x, this.position.y, this.position.target[0].x, this.position.target[0].y);
        for(var i = 1; i < this.position.target.length; i++){
            line(this.position.target[i-1].x, this.position.target[i-1].y, this.position.target[i].x, this.position.target[i].y);
        }
    }

    this.draw = function(){
        var color = playerColors[this.player];
        var healthBarWidth = this.size + 20;
        var healthWidth = this.hp/10*healthBarWidth;

        rect(this.position.x - this.size/2 - 10, this.position.y - this.size/2 - 15, healthBarWidth, 5, "red", false);
        rect(this.position.x - this.size/2 - 10, this.position.y - this.size/2 - 15, healthWidth, 5, "green", false);
        if(this.selected){ 
            circle(this.position.x, this.position.y, this.size, "white", true);
            if(this.position.target.length){ this.drawPathToTarget() }
        } else {
            circle(this.position.x, this.position.y, this.size, color, false);
        }
    }

    this.move = function(){

        var distanceX = this.position.target[0].x - this.position.x;
        var distanceY = this.position.target[0].y - this.position.y;

        var distance = getDistance(this.position.x, this.position.y, this.position.target[0].x, this.position.target[0].y);        
        var deltaX = deltaY = 0;

        if(distance > this.speed){
            deltaX = distanceX/(distance/this.speed);
            deltaY = distanceY/(distance/this.speed);
            this.position.x += deltaX;
            this.position.y += deltaY;
        } else {
            this.position.x = this.position.target[0].x;
            this.position.y = this.position.target[0].y;
            this.position.target.shift();                   // remove first element of the array - our waypoint
        }

    }

    this.eatFood = function(){
        if(foodSubsections[this.position.section].length){
            for(var i = 0; i < foodSubsections[this.position.section].length; i++){
                forLoopCount++;
                var food = foodSubsections[this.position.section][i];
                var distance = getDistance(food.position.x, food.position.y, this.position.x, this.position.y);
                //console.log(this.id + ": " + distance);
                if( distance < (this.size + food.size) && food.alive){
                    food.alive = false;
                    gold++;
                }
            }
        }
        
    }

}


// FUNCTIONS

/* --- GAME LOOP UPDATE ---- */

function shareGameLoop(){

    var gameData = {};
    var gameUnits = [];

    units.forEach(function(unit){
        var thisUnit = {
            id: unit.id,
            hp: unit.hp, 
            x: unit.position.x,
            y: unit.position.y,
        }
        gameUnits.push(thisUnit);
    })

    gameData.units = gameUnits;

    socket.emit("update game", gameData);

}

socket.on("update game", function(updatedGame){

    updatedUnits = updatedGame.units;
    updatedUnits.forEach(function(newUnitInfo){

        units.forEach(function(oldUnitInfo){
            if(oldUnitInfo.id == newUnitInfo.id){

                oldUnitInfo.hp = newUnitInfo.hp;
                oldUnitInfo.position.x = newUnitInfo.x;
                oldUnitInfo.position.y = newUnitInfo.y;

            }
        })
    });
});

/* -------- */

function moveUnits(){
    units.forEach(function(unit){
        if(unit.hp > 0 && unit.position.target.length){
            unit.move();
        }
    })
}

function drawBackground(){
    rect(0 ,0, WIDTH, HEIGHT, "#007A24"); 
}

function drawUnits(){
    units.forEach(function(unit){
        if(unit.hp > 0){
            unit.draw();
        }
    })
}

function checkForCollision(x, y){
    var collided = false;

    units.forEach(function(unit){
        if(!collided){
            var distance = getDistance(x,y, unit.position.x, unit.position.y);
            if(distance <= unit.size){
                collided = true;
            }
        }
    });

    buildings.forEach(function(building){
        if(!collided){
            if((x > building.position.x && x < (building.position.x + building.width)) && (y > building.position.y && y < (building.position.y + building.height))){
                collided = true;
            }
        }
    });

    return collided;
}

function drawBuildings(){
    buildings.forEach(function(buildings){
        if(buildings.hp > 0){
            buildings.draw();
        }
    })
}

function drawFood(food){
    for(var i = 0; i < foods.length; i++){
        var food = foods[i];
        if(food.alive){
            circle(food.position.x, food.position.y, food.size, "#C8A300", false)
        } else {
            foods.splice(i, 1)
        }
    }
        
}

function needToMovePlayer(){
    return (player.position.target.length && (player.x != player.position.target[0].x || player.y != player.position.target[0].y))
}

function createUnit(x, y, player){
    var unit = new Unit(x,y, 10, player);
    console.log(unit.id);
    units.push(unit);
}

function createBuilding(x, y, type){
    var building = new Building(x,y, type);
    buildings.push(building);
}

function generateFood(){
    if(Math.random() < 0.01){
        console.log("Generating food!");
        var thisFood = new Food(25 +  Math.random() * (WIDTH-25), 25+ Math.random() * (HEIGHT-25));
        foods.push(thisFood);
    }
}

function spawnNewUnit(building){
    var attemptedX = building.position.x,
        attemptedY = building.position.y - 20;

    var unitSpawned = false;

    if(gold >= 5){
        while(!unitSpawned && attemptedX < WIDTH){
            if(checkForCollision(attemptedX, attemptedY)){
                attemptedX += 20;
            } else {
                console.log("creating untit at " + attemptedX + ", " + attemptedY);
                unitSpawned = true;
                gold -= 5;
                createUnit(attemptedX, attemptedY, player);
                message("unit created");
            }
        }
    } else {
        console.log("Not enough gold");
        message("Not enough gold", "error");
    }

}

function unitsEatFood(){
    units.forEach(function(unit){
        unit.eatFood();
    })
    
}

function updateGoldCount(){
    $("#gold").text(gold);
}

function updateCurrentPlayer(){
    $("#player").text(player);
}

function updateSpeed(){
    if(selectedUnit){
        $("#speed").text(selectedUnit.speed);
    } else {
        $("#speed").text("Select unit");
    }
}

function updateSelection(){
    if(selectedUnit){
        $("#selected").text(selectedUnit.id);
    } else {
        $("#selected").text("Select unit");
    }
}

/* delete this later */
function displayUnitInfo(){
    $("#units").empty();
    units.forEach(function(unit){
        $("#units").append(JSON.stringify(unit) + "<br><br>")
    })
}

function displayFoodInfo(){
    $("#foods").empty();
    foods.forEach(function(food){
        $("#foods").append(JSON.stringify(food) + "<br><br>")
    })
}

function unselectUnits(){
    units.forEach(function(unit){
        unit.selected = false;
    })
}

function freezeEverything(){
    units.forEach(function(unit){
        unit.position.target = [];
    });
}

function printPathLength(){
    units.forEach(function(unit){
        if(unit.selected){
            console.log(unit.position.target.length);
        }   
    });
}

/* collision detection */
function createKtree(set){
    set.forEach(function(element){
    
        var section = 1;
        var xSection = Math.floor(element.position.x/(WIDTH/3)) + 1;
        var ySection = Math.floor(element.position.y/(HEIGHT/3)) + 1;

        if(xSection == 1){
            if(ySection == 1){ section = 1}
            if(ySection == 2){ section = 4}
            if(ySection == 3){ section = 7}
        } else if(xSection == 2){
            if(ySection == 1){ section = 2}
            if(ySection == 2){ section = 5}
            if(ySection == 3){ section = 8}
        } else if(xSection == 3){
            if(ySection == 1){ section = 3}
            if(ySection == 2){ section = 6}
            if(ySection == 3){ section = 9}
        }
        //console.log("section: " + section);

        element.position.section = section;

    });
}

function createUnitSubsections(){

    for(var i = 1; i < 10; i++){

        var thisSubsection = [];

        units.forEach(function(unit){
            if(unit.position.section == i){
                thisSubsection.push(unit);
            }
        });
        unitSubsections[i] = thisSubsection;
    }
}

function createFoodSubsections(){

    for(var i = 1; i < 10; i++){

        var thisSubsection = [];

        foods.forEach(function(food){
            if(food.position.section == i){
                thisSubsection.push(food);
            }
        });
        foodSubsections[i] = thisSubsection;
    }
}

function displayControls(){
    if(selectedBuilding){
        $("#new-unit").css("display", "block");
    } else {
        $("#new-unit").css("display", "none");
    }
}

function message(text, type){
    
    var color = "blue";
    if(type == "error"){ color = "red" } 
    $(".message").text(text).css("color", color);

    clearTimeout(clearMessage);
    clearMessage = setTimeout(function(){
        $(".message").text("");
    }, 3000)
}

// LISTENERS

$("body").on("mousedown", "#canvas", function(e){
    var clickX = e.pageX - $("#canvas").position().left;
    var clickY = e.pageY - $("#canvas").position().top;
    
    if(selectedUnit && shiftKey){ 
        clicked = true;
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;

        if(zKey){
            selectedUnit.position.target.push({
                x: newX,
                y: newY
            });
        } else {
            selectedUnit.position.target = [{
                x: newX,
                y: newY
            }];
        }
    } else {
        for(var i = 0; i < units.length; i++){
            unit = units[i];
            var distanceToClick = getDistance(unit.position.x, unit.position.y, clickX, clickY);
            if(distanceToClick < unit.size && unit.player == player){
                selectedUnit = unit;
                unit.selected = true;
            } else {
                unit.selected = false;
            }
        }

        for(var i = 0; i < buildings.length; i++){
            building = buildings[i];
            if((clickX > building.position.x && clickX < building.position.x + building.width) && (clickY > building.position.y && clickY < building.position.y + building.height)){
                selectedBuilding = building;
                building.selected = true;
            } else {
                selectedBuilding = false;
                building.selected = false;
            }
        }
    } 

});

$("body").on("mouseup", "#canvas", function(){
    clicked = false;
});

$("body").on("mousemove", "#canvas", function(e){
    if(shiftKey && clicked && selectedUnit){  
        var newX = e.pageX - $("#canvas").position().left;
        var newY = e.pageY - $("#canvas").position().top;
        selectedUnit.position.target.push({
            x: newX,
            y: newY
        });

    }
});


$("body").on("keydown", function(e){
    if(e.which == 16) {             // SHIFT
        shiftKey = true; 
    }

    if(e.which == 81){              // [Q] key
        selectedUnit.position.target = [];
        // freezeEverything();
    }

    if(e.which == 87){              // [W] key
        if(selectedUnit){
            printPathLength();
        }
    }

    if(e.which == 187 && selectedUnit){         // [+] key 
        selectedUnit.speed++;
    }

    if(e.which == 189){                         // [-] key
        if(selectedUnit && selectedUnit.speed > 1){         
            selectedUnit.speed--;
        }
    }

    if(e.which == 69){                          // [E] key
        if(selectedUnit){
            console.log(selectedUnit);
        }
    }

    if(e.which == 90) {             // SHIFT
        zKey = true; 
    }
});

$("body").on("keyup", function(e){
    if(e.which == 16) { shiftKey = false; }
    if(e.which == 90) { zKey = false; } 
});


$("body").on("click", "#new-unit", function createNewUnit(){
    if(selectedBuilding){
        spawnNewUnit(selectedBuilding);
    }
});

$("body").on("click", ".player-change", function changeCurrentPlayer(){
    player = Number(this.dataset.id);
});

$("body").on("click", "#socket-tester", function testSocketConnection(){
    socket.emit("current gold", gold);

});

socket.on('current gold', function(updatedGold){
  gold = updatedGold;
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
        ctx.stroke();
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