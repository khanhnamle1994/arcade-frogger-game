/**
 *  GameObject Superclass
 *  - shared functions and properties for moving critters
 */
var GameObject = function (xPos, yPos, velocity, xAxis, yAxis, spriteURL) {
    // load sprite
    this.sprite = spriteURL;

    // starting properties
    this.start_x = xPos;        // initial x,y
    this.start_y = yPos;
    this.x = xPos;              // updated x,y
    this.y = yPos;
    this.start_horiz = xAxis;   // initial movement axes
    this.start_vert = yAxis;
    this.horiz = xAxis;         // updated movement axes
    this.vert = yAxis;
    this.speed = velocity;      // object speed
};

// Draw the object on the screen using canvas context (ctx) in engine.js
GameObject.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Move method to call in subclass updates
GameObject.prototype.move = function (deltaTime) {
    // update location this frame
    if (this instanceof Player) {
        // discrete player movement (space-by-space) decoupled from deltaTime
        this.x += this.horiz * 101;
        this.y += this.vert * 83;
    } else {
        // continuous movement along axes at speed smoothed by time
        this.x += this.horiz * this.speed * deltaTime;
        this.y += this.vert * this.speed * deltaTime;
    }
};

// Reset player position and movement
GameObject.prototype.respawn = function () {
    this.x = this.start_x, this.y = this.start_y;
    this.horiz = this.start_horiz, this.vert = this.start_vert;
};

// Check for "collision" (close x,y position)
GameObject.prototype.collidedWith = function(obj,radius) {
    // set detection radius
    var sensitivity = radius;

    // see if other object's x and y distance falls within radius
    if (Math.abs(this.x - obj.x) < sensitivity) {
        if (Math.abs(this.y - obj.y) < sensitivity) {
            return true;    // collision
        }
    }
    return false;   // no collision
};

// Check for movement out of bounds
GameObject.prototype.outOfBounds = function () {
    /*  determine screen bounds based on this object's class
     *  (left: x0, right: x1, up: y0, down: y1)
     */
    if (this instanceof Player) {
        // boundary calibrated to player movement and tile locations
        var x0 = -50, x1 = ctx.canvas.width-50;
        var y0 = -10, y1 = ctx.canvas.height-170;
    } else if (this instanceof Enemy) {
        // boundary calibrated to enemy movement and off-screen spawn
        var x0 = -9000, x1 = ctx.canvas.width;
        var y0 = -9000, y1 = ctx.canvas.height;
    } else {
        // default boundary
        var x0 = 0, x1 = ctx.canvas.width;
        var y0 = 0, y1 = ctx.canvas.height;
    }

    // see if this object falls outside boundaries set above
    if (this.x < x0 || this.x > x1 || this.y < y0 || this.y > y1) {
        return true;    // out of bounds
    }
    return false;   // within bounds
};


/**
 *  Enemy Subclass : GameObject
 */
var Enemy = function (xPos, yPos, velocity) {
    // shared enemy sprite, uses resources.js
    var spriteURL = 'images/enemy-bug.png';

    // enemy movement direction (move right)
    var xAxis=1, yAxis=0;

    // instantiate as pseudoclassical subclass
    GameObject.call(this, xPos, yPos, velocity, xAxis, yAxis, spriteURL);
};
// delegate failed method lookups to superclass
Enemy.prototype = Object.create (GameObject.prototype);
// set Enemy as the .constructor instead of GameObject
Enemy.prototype.constructor = Enemy;

// Behavior loop
Enemy.prototype.update = function(deltaTime) {
    // basic movement
    this.move (deltaTime);

    // check for player collision
    this.collidedWith(player,25) ? player.die() : 0;

    // respawn if enemy moves outside screen
    this.outOfBounds() ? this.respawn() : 0;
};


/**
 *  Main Player Subclass : GameObject
 */
var Player = function (x, y, velocity, spriteURL) {
    this.lives = 3;
    GameObject.call (this, x, y, velocity, 0, 0, spriteURL)
};
// delegate methods up the chain to GameObject
Player.prototype = Object.create (GameObject.prototype);
// reset the constructor to the Player class, not GameObject
Player.prototype.constructor = Player;

// Player behavior loop
Player.prototype.update = function(deltaTime) {

    // movement checked and updated through Player.handleInput

    // end zone win condition check
    this.reachedGoal() ? this.win() : 0;

    // out-of-bounds respawn
    this.outOfBounds() ? this.die() : 0;

    // show the current score
    document.getElementById("game_score").innerHTML = "Score: "+gameController.score;

    // reset the movement axes
    this.horiz = 0, this.vert = 0;
};

Player.prototype.displayLives = function() {
    heartImg = "<img src='images/heart.png'>";
    document.getElementById("game_lives").innerHTML = "";
    for (var i = 0; i < this.lives; i++) {
        document.getElementById("game_lives").innerHTML += heartImg;
    }
};

// Check if player made it to the top of the screen
Player.prototype.reachedGoal = function () {
    if (this.y < 10) {
        return true;
    } return false;
};

// Declare victory
Player.prototype.win = function () {

    // notify the div
    document.getElementById("game_notes").innerHTML = "+10 : Reached Water!";

    // play goal sfx
    var sfx = new Audio('audio/goal.wav');

    sfx.play();
    gameController.score += 10;
    this.respawn();
};

// Admit defeat
Player.prototype.die = function () {

    document.getElementById("game_notes").innerHTML = "-30 : OUCH!";
    if (gameController.score > 30) {
        gameController.score -= 30;
    } else {
        gameController.score = 0;
    }

    // update how many hearts player has left
    this.lives --;
    this.displayLives();

    // play hit fx
    var sfx = new Audio('audio/hit.wav');
    sfx.play();

    // check if the player lost all lives or is still alive
    if (this.lives <= 0) {
        window.location = "gameover.html?"+gameController.score;
    } else {
        this.respawn();
    }
};

// Take keyboard input from event listener added by GameController
Player.prototype.handleInput = function (key) {
    // reset input axes on new keypress (avoids diagonal)
    this.horiz = this.start_horiz;
    this.vert = this.start_vert;

    // set axes according to key press
    switch (key) {
        case 'left':
            this.horiz = -1;
            break;
        case 'right':
            this.horiz = 1;
            break;
        case 'up':
            this.vert = -1;
            break;
        case 'down':
            this.vert = 1;
            break;
    }
    this.move(0.0);
};


/**
 *  Pickup Subclass : GameObject
 */
var Pickup = function (xPos, yPos) {
    // list of sprites and point values
    var sprites = ['images/gem-green.png','images/gem-blue.png','images/gem-gold.png'];
    var values = [5,10,20];
    // random value for choosing from above lists
    var choice = Math.floor(Math.random()*3);

    // properties
    this.active = true;
    this.points = values[choice];

    // create pickup as a non-moving gameobject
    GameObject.call(this, xPos, yPos, 0, 0, 0, sprites[choice]);
};
// inherit GameObject's methods but point to Pickup's constructor
Pickup.prototype = Object.create(GameObject.prototype);
Pickup.prototype.constructor = Pickup;

Pickup.prototype.update = function(deltaTime) {
    // check if player picked up active gem
    if (this.active && this.collidedWith(player,55)) {
        this.active = false;
        gameController.score += this.points;
        document.getElementById("game_notes").innerHTML = "+"+this.points+"! What a GEM!";
        // play sfx
        var sfx = new Audio('audio/gem.wav');
        sfx.play();
    }
};

Pickup.prototype.render = function() {
    if (this.active) {
        ctx.drawImage (Resources.get(this.sprite), this.x, this.y);
    }
};


/**
 *  Game Logic & Gamewide Properties
 */
var GameController = function () {
    // properties
    this.score = 0;

    // goal door allowing player to escape on own terms
    this.goalX = 1;
    this.goalY = 375;
    this.goalPoints = 100;
    this.goalOpen = false;
    this.goal = 'images/selector.png';

    // listen for keypress and send to Player's handleInput(key)
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    });

};

// ongoing actions once per frame
GameController.prototype.update = function (deltaTime) {
    // check that goal door is open
    if (this.score >= this.goalPoints && !this.goalOpen) {
        this.goalOpen = true;
        document.getElementById("game_notes").innerHTML = "+100 - IF you go through my door and end this!";
        var sfx = new Audio("audio/door.wav");
        sfx.play();
    }

    if (this.goalOpen) {
        // check for player reaching goal
        if (Math.abs(player.x-this.goalX) < 25 && Math.abs(player.y-this.goalY) < 25) {
            // end game on a high note
            this.score += 100;
            player.lives = 0;
            player.die();
        }
    }

};

GameController.prototype.render = function () {
    // draw goal door once player reaches points
    if (this.score >= this.goalPoints) {
        ctx.drawImage (Resources.get(this.goal), this.goalX, this.goalY);
    }
};

// Instantiate the player object
GameController.prototype.spawnPlayer = function (spriteURL) {
    var player = new Player (300, 390, 3, spriteURL);
    return player;
};

// Instantiate enemy objects in an array
GameController.prototype.spawnEnemies = function (enemyCount) {
    var enemies = new Array();
    var randomSpeed;
    var initX=-101, initY=55;  // x, y loc references
    for (var i = 0; i < Math.floor(enemyCount/2); i++) {
        // use engine.js render() row and col dimensions to set x, y
        randomSpeed = Math.random() * 300 + 80;
        enemies.push(new Enemy(initX*(i+1), (i*83)+initY, randomSpeed));
        enemies.push(new Enemy(initX*(i+3), (i*83)+initY, randomSpeed));
    }
    return enemies;
};

// Instantiate pickup objects in an array
GameController.prototype.spawnPickups = function () {
    var pickups = new Array();

    // spawn between 1 and 3 pickups
    for (var i=0; i < Math.floor(Math.random()*3+1); i++) {
        pickups.push (new Pickup(Math.random()*400+10,Math.random()*200+50));
    }
    return pickups;
};


/**
 *  Init Single Game Session
 */

// choose player sprite based on URL param passed from index.html
var charName = window.location.search.substring(1);
switch (charName) {
    case 'cat':
        var spriteURL = 'images/char-cat-girl.png';
        break;
    case 'horn':
        var spriteURL = 'images/char-horn-girl.png';
        break;
    case 'pink':
        var spriteURL = 'images/char-pink-girl.png';
        break;
    case 'princess':
        var spriteURL = 'images/char-princess-girl.png';
        break;
    default:
        var spriteURL = 'images/char-boy.png'
        break;
}

// start game through game controller
var gameController = new GameController();
var player = gameController.spawnPlayer (spriteURL);
player.displayLives();
var allEnemies = gameController.spawnEnemies (6);
var pickups = gameController.spawnPickups();

// play some bg music
var music = new Audio('audio/music0.mp3');
music.play();
