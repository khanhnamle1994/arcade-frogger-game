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
        // player movement decoupled from deltaTime (causes no-show)
        this.x += this.horiz * this.speed;
        this.y += this.vert * this.speed;
    } else {
        // standard movement along axes at speed smoothed by time
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
GameObject.prototype.collidedWith = function(obj) {
    // set detection radius
    var collisionSensitivity = 25;

    // see if other object's x and y distance falls within radius
    if (Math.abs(this.x - obj.x) < collisionSensitivity) {
        if (Math.abs(this.y - obj.y) < collisionSensitivity) {
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
    this.collidedWith(player) ? player.die() : 0;

    // respawn if enemy moves outside screen
    this.outOfBounds() ? this.respawn() : 0;
};


/**
 *  Main Player Subclass : GameObject
 */
var Player = function (x, y, velocity, spriteURL) {
    GameObject.call (this, x, y, velocity, 0, 0, spriteURL)
};
// delegate methods up the chain to GameObject
Player.prototype = Object.create (GameObject.prototype);
// reset the constructor to the Player class, not GameObject
Player.prototype.constructor = Player;

// Player behavior loop
Player.prototype.update = function(deltaTime) {
    // update location
    this.move (deltaTime);

    // end zone win condition check
    this.reachedGoal() ? this.win() : 0;

    // out-of-bounds respawn
    this.outOfBounds() ? this.die() : 0;

    // show the current score
    console.log ("Score: "+gameController.score);
};

// Check if player made it to the top of the screen
Player.prototype.reachedGoal = function () {
    if (this.y < 0) {
        return true;
    } return false;
}

// Declare victory
Player.prototype.win = function () {
    console.log ("You win!");
    gameController.score += 10;
    this.respawn();
}

// Admit defeat
Player.prototype.die = function () {
    console.log ("You didn't make it!");
    gameController.score = 0;
    this.respawn();
}

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
};


/**
 *  Game Logic & Gamewide Properties
 */
var GameController = function () {
    // properties
    this.score = 0;

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

// choose player sprite based on URL param passed from index.html
var charName = window.location.search.substring(1);
if (charName == 'zq123') {
    // why aren't other images working?
    /*
    Failed to execute 'drawImage' on 'CanvasRenderingContext2D': The provided value is not of type '(HTMLImageElement or HTMLVideoElement or HTMLCanvasElement or ImageBitmap)'
    */
    var spriteURL = 'images/char-princess-girl.png';
} else {
    var spriteURL = 'images/char-boy.png';
}

// start game through game controller
var gameController = new GameController();
var player = gameController.spawnPlayer(spriteURL);
var allEnemies = gameController.spawnEnemies(6);
