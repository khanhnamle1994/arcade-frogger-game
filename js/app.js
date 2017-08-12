// Enemies our player must avoid
var Enemy = function (x, y, velocity) {
    // shared enemy sprite, uses prewritten helper
    this.sprite = 'images/enemy-bug.png';

    // enemy properties
    this.start_x = x;       // initial x,y
    this.start_y = y;
    this.x = x;             // updated x,y
    this.y = y;
    this.speed = velocity;  // enemy speed
};

// Enemy behavior in update loop
Enemy.prototype.update = function(deltaTime) {

    // check for player "collision" (close x,y locs)
    var collisionSensitivity = 25;
    if (Math.abs(this.x - player.x) < collisionSensitivity) {
        if (Math.abs(this.y - player.y) < collisionSensitivity) {
            // player killed - game over
            player.respawn();
        }
    }

    // move forward
    this.x += this.speed * deltaTime;

    // out-of-bounds respawn
    if (this.x > ctx.canvas.width) {
        this.x = this.start_x;
    }
};

// Draw the enemy on the screen using canvas context (ctx) in engine.js
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Main player moved by input
var Player = function (x, y, velocity) {
    // load player sprite
    this.sprite = 'images/char-boy.png'
    /* EXTRA: let player choose sprite */

    // player instance properties
    this.start_x = x;       // initial x,y
    this.start_y = y;
    this.x = x;             // updated x,y
    this.y = y;
    this.horiz = 0;         // player movement input axes
    this.vert = 0;
    this.speed = velocity;  // player speed
};

// Player behavior in update loop
Player.prototype.update = function (deltaTime) {

    // update location
    this.x += (this.horiz * this.speed); // * deltaTime); // /!\ dt == NaN /!\
    this.y += (this.vert * this.speed);

    // screen dimensions for player bounds
    screenX = ctx.canvas.width-50;
    screenY = ctx.canvas.height-170;

    // out-of-bounds respawn
    if (this.x > screenX || this.x < -50 || this.y < -10 || this.y > screenY){
        this.respawn();
    }
};

// Render player sprite using canvas context (ctx) in engine.js
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// reset player position
Player.prototype.respawn = function () {
    this.x = this.start_x, this.y = this.start_y;
};

Player.prototype.handleInput = function (key) {
    // reset input axes in case no key is pressed
    this.horiz = 0;
    this.vert = 0;

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


// Instantiate enemy objects in an array
var allEnemies = new Array();
var initX=-101, initY=55;  // x, y loc references
for (var i = 0; i < 3; i++) {
    // use engine.js render() row and col dimensions to set x, y
    allEnemies.push(new Enemy(initX*(i+1), (i*83)+initY, 150));
}

// Instantiate the player object
var player = new Player (300, 390, 2);


// Listen for keypress and send key to Player.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
