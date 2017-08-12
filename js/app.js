// Enemies our player must avoid
var Enemy = function (x, y, velocity) {
    // shared enemy sprite, uses prewritten helper
    this.sprite = 'images/enemy-bug.png';

    // enemy instance variables
    this.x = x;
    this.y = y;
    this.speed = velocity;
};

// Enemy behavior in update loop
Enemy.prototype.update = function(deltaTime) {
    // check for player "collision" (same tile occupied)
    if (this.x == player.x && this.y == player.y) {
        // player killed - game over
        console.log ("OUCH! Enemy hit you!!")
    }
    // move forward
    this.x += this.speed * deltaTime;
};

// Draw the enemy on the screen using canvas context (ctx) in engine.js
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    /* if out of bounds, respawn */
};


// Main player moved by input
var Player = function (x, y, velocity) {
    // load player sprite
    this.sprite = 'images/player.png'
    /* EXTRA: let player choose sprite */

    // player instance properties
    this.x = x;
    this.y = y;
    this.speed = velocity;
};

// Player behavior in update loop
Player.prototype.update = function (deltaTime) {
    this.x += (this.speed * deltaTime);
    /* check for out of bounds */
};

// Render player sprite using canvas context (ctx) in engine.js
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function (key) {

    switch (key) {
        case 'up':
            this.y++;
            break;
        case 'down':
            this.y--;
            break;
        case 'left':
            this.x++;
            break;
        case 'right':
            this.x--;
            break;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player



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
