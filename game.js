// Game Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let game = {
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    paused: false
};

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game Objects
let ship, asteroids = [], bullets = [], enemies = [], particles = [];

// Ship class
class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.radius = 8;
        this.thrusting = false;
    }
    
    update() {
        // Rotation
        if (keys['ArrowLeft'] || keys['KeyA']) this.angle -= 0.15;
        if (keys['ArrowRight'] || keys['KeyD']) this.angle += 0.15;
        
        // Thrust
        this.thrusting = keys['ArrowUp'] || keys['KeyW'];
        if (this.thrusting) {
            this.velocityX += Math.cos(this.angle) * 0.3;
            this.velocityY += Math.sin(this.angle) * 0.3;
            
            // Add thruster particles
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(
                    this.x - Math.cos(this.angle) * 15,
                    this.y - Math.sin(this.angle) * 15,
                    -Math.cos(this.angle) * 3 + (Math.random() - 0.5) * 2,
                    -Math.sin(this.angle) * 3 + (Math.random() - 0.5) * 2,
                    '#FF6B00',
                    20
                ));
            }
        }
        
        // Apply friction
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        
        // Limit speed
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (speed > 8) {
            this.velocityX = (this.velocityX / speed) * 8;
            this.velocityY = (this.velocityY / speed) * 8;
        }
        
        // Move
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Wrap around screen
        this.x = (this.x + canvas.width) % canvas.width;
        this.y = (this.y + canvas.height) % canvas.height;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Ship body
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -6);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.stroke();
        
        // Thruster flame
        if (this.thrusting) {
            ctx.strokeStyle = '#FF6B00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-8, -3);
            ctx.lineTo(-15, 0);
            ctx.lineTo(-8, 3);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Asteroid class
class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size * 15;
        this.angle = Math.random() * Math.PI * 2;
        this.velocityX = (Math.random() - 0.5) * 3;
        this.velocityY = (Math.random() - 0.5) * 3;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.points = [];
        
        // Generate irregular shape
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = this.radius * (0.8 + Math.random() * 0.4);
            this.points.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.angle += this.rotationSpeed;
        
        // Wrap around screen
        this.x = (this.x + canvas.width) % canvas.width;
        this.y = (this.y + canvas.height) % canvas.height;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.velocityX = Math.cos(angle) * 10;
        this.velocityY = Math.sin(angle) * 10;
        this.radius = 2;
        this.life = 60;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life--;
        
        // Wrap around screen
        this.x = (this.x + canvas.width) % canvas.width;
        this.y = (this.y + canvas.height) % canvas.height;
    }
    
    draw() {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Particle class
class Particle {
    constructor(x, y, velocityX, velocityY, color, life) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        this.life--;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.velocityX = 0;
        this.velocityY = 0;
        this.radius = 10;
        this.behavior = 'hunt';
        this.behaviorTimer = 0;
    }
    
    update() {
        this.behaviorTimer++;
        
        // Simple AI - move toward player
        const dx = ship.x - this.x;
        const dy = ship.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
            this.angle = Math.atan2(dy, dx);
            this.velocityX = Math.cos(this.angle) * 2;
            this.velocityY = Math.sin(this.angle) * 2;
        }
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Wrap around screen
        this.x = (this.x + canvas.width) % canvas.width;
        this.y = (this.y + canvas.height) % canvas.height;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-8, -6);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

// Collision detection
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
}

// Create explosion
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            40
        ));
    }
}

// Initialize game
function init() {
    ship = new Ship(canvas.width / 2, canvas.height / 2);
    createAsteroids();
    spawnEnemyTimer();
    gameLoop();
}

// Create asteroids
function createAsteroids() {
    asteroids = [];
    const numAsteroids = 4 + game.level;
    
    for (let i = 0; i < numAsteroids; i++) {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.sqrt((x - ship.x) ** 2 + (y - ship.y) ** 2) < 100);
        
        asteroids.push(new Asteroid(x, y, 3));
    }
}

// Spawn enemies periodically
function spawnEnemyTimer() {
    if (enemies.length < 2 && Math.random() < 0.005) {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.sqrt((x - ship.x) ** 2 + (y - ship.y) ** 2) < 150);
        
        enemies.push(new Enemy(x, y));
    }
}

// Shoot bullet
let lastShot = 0;
function shoot() {
    const now = Date.now();
    if (now - lastShot > 200) { // 200ms cooldown
        bullets.push(new Bullet(ship.x, ship.y, ship.angle));
        lastShot = now;
    }
}

// Update game
function update() {
    if (game.gameOver || game.paused) return;
    
    // Handle shooting
    if (keys['Space']) shoot();
    
    // Update ship
    ship.update();
    
    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.update();
        return bullet.life > 0;
    });
    
    // Update asteroids
    asteroids.forEach(asteroid => asteroid.update());
    
    // Update enemies
    enemies.forEach(enemy => enemy.update());
    
    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Spawn enemies
    spawnEnemyTimer();
    
    // Check collisions
    // Bullet vs Asteroid
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], asteroids[j])) {
                const asteroid = asteroids[j];
                
                // Create explosion
                createExplosion(asteroid.x, asteroid.y, '#FF6B00');
                
                // Split asteroid
                if (asteroid.size > 1) {
                    for (let k = 0; k < 2; k++) {
                        const newAsteroid = new Asteroid(asteroid.x, asteroid.y, asteroid.size - 1);
                        newAsteroid.velocityX = (Math.random() - 0.5) * 4;
                        newAsteroid.velocityY = (Math.random() - 0.5) * 4;
                        asteroids.push(newAsteroid);
                    }
                }
                
                game.score += asteroid.size * 100;
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Bullet vs Enemy
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                createExplosion(enemies[j].x, enemies[j].y, '#FF0000');
                game.score += 500;
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Ship vs Asteroid
    asteroids.forEach(asteroid => {
        if (checkCollision(ship, asteroid)) {
            createExplosion(ship.x, ship.y, '#FFFFFF');
            game.lives--;
            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.velocityX = 0;
            ship.velocityY = 0;
            
            if (game.lives <= 0) {
                game.gameOver = true;
            }
        }
    });
    
    // Ship vs Enemy
    enemies.forEach(enemy => {
        if (checkCollision(ship, enemy)) {
            createExplosion(ship.x, ship.y, '#FFFFFF');
            game.lives--;
            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.velocityX = 0;
            ship.velocityY = 0;
            
            if (game.lives <= 0) {
                game.gameOver = true;
            }
        }
    });
    
    // Check level completion
    if (asteroids.length === 0) {
        game.level++;
        game.score += 1000;
        createAsteroids();
    }
    
    // Handle restart
    if (keys['KeyR'] && game.gameOver) {
        game = { score: 0, lives: 3, level: 1, gameOver: false, paused: false };
        bullets = [];
        particles = [];
        enemies = [];
        ship = new Ship(canvas.width / 2, canvas.height / 2);
        createAsteroids();
    }
}

// Render game
function render() {
    // Clear screen with starfield effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 100; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 53) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
    
    // Draw game objects
    ship.draw();
    asteroids.forEach(asteroid => asteroid.draw());
    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
    particles.forEach(particle => particle.draw());
    
    // Game Over screen
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF0000';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Courier New';
        ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 80);
    }
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('level').textContent = game.level;
}

// Game loop
function gameLoop() {
    update();
    render();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Start game
init();
