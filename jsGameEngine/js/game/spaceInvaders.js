function initSpaceInvaders() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Player data
    let player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 60,
        speed: 5,
        image: null,
        alive: true
    };
    let bullets = [];
    let specialBullets = [];
    let enemyBullets = [];
    let enemies = [];
    let specialEnemy = null;
    let enemyCols = 8; // Total 8 enemies per row
    let enemyRows = 0; // Initial number of enemy rows
    let score = 0;
    let specialShotCooldown = 0; // Cooldown for special shot
    let lastEnemySpawnTime = 0; // Last enemy spawn time
    let lastSpecialEnemyTime = 0; // Last special enemy spawn time
    let keysPressed = {}; // Array to track pressed keys

    // Load images
    const playerImg = new Image();
    const enemyImg = new Image();
    const specialEnemyImg = new Image();
    playerImg.src = 'resources/images/player/player.png';
    enemyImg.src = 'resources/images/enemy/enemy.png';
    specialEnemyImg.src = 'resources/images/enemy/enemy2.png';

    player.image = playerImg;

    // Generate enemies
    function createEnemies() {
        const yPosition = 110; // All enemies spawn at the same row

        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: 50 + col * 60, // Horizontal distance between enemies
                y: yPosition, // All enemies in one row at y position 70
                width: 40,
                height: 30,
                lives: 3, // Enemies have 3 lives
                dx: 1, // Enemies move to the right
                dy: 0, // Enemies don't move vertically
                image: enemyImg
            });
        }
        enemyRows++; // Increase the row count after creating a row of enemies
    }

    // Spawn special enemy
    function spawnSpecialEnemy() {
        if (!specialEnemy) { // Spawn a new special enemy only if the previous one is destroyed
            specialEnemy = {
                x: Math.random() * (canvas.width - 50),
                y: 70, // Starting position for the special enemy
                width: 50,
                height: 40,
                lives: 2, // Special enemy has 2 lives
                dx: Math.random() > 0.5 ? 1 : -1, // Random horizontal movement direction
                dy: 0, // Special enemy doesn't move vertically
                cooldown: 0, // Shooting cooldown timer
                image: specialEnemyImg
            };
        }
    }

    // Restart game
    function restartGame() {
        player.alive = true;
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 60;
        score = 0;
        enemies = []; // Clear old enemies
        enemyRows = 0; // Start with zero rows
        createEnemies(); // Generate new enemies
        specialEnemy = null;
        bullets = [];
        specialBullets = [];
        enemyBullets = [];
    }

    // Main game loop
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!player.alive) {
            ctx.fillStyle = 'red';
            ctx.font = '40px Arial';
            ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
            ctx.fillText('Press "ctrl + R" to Restart', canvas.width / 2 - 150, canvas.height / 2 + 50);
            return;
        }

        const currentTime = Date.now();

        // Generate new enemy row every 10 seconds
        if (currentTime - lastEnemySpawnTime >= 10000) {
            createEnemies();
            lastEnemySpawnTime = currentTime;
        }

        // Spawn special enemy every 5-10 seconds if the previous one is destroyed
        if (!specialEnemy && currentTime - lastSpecialEnemyTime >= (Math.random() * 5000 + 5000)) {
            spawnSpecialEnemy();
            lastSpecialEnemyTime = currentTime;
        }

        // Handle player movement
        if (keysPressed['KeyA']) player.x = Math.max(0, player.x - player.speed);
        if (keysPressed['KeyD']) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

        // Draw player
        if (player.image.complete) {
            ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        }

        // Draw and move enemies
        enemies.forEach((enemy, index) => {
            if (enemy.image.complete) {
                ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            }

            // Enemies only move horizontally
            enemy.x += enemy.dx;

            // If enemy hits the left or right edge, it drops down a row
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                enemy.dx *= -1; // Change horizontal direction
                enemy.y += 40; // Move down by one row
            }

            // Check for collision with player
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                player.alive = false; // Player dies on collision
            }
        });

        // Draw special enemy
        if (specialEnemy) {
            if (specialEnemy.image.complete) {
                ctx.drawImage(specialEnemy.image, specialEnemy.x, specialEnemy.y, specialEnemy.width, specialEnemy.height);
            }
            specialEnemy.x += specialEnemy.dx;

            if (specialEnemy.x <= 0 || specialEnemy.x + specialEnemy.width >= canvas.width) {
                specialEnemy.dx *= -1;
            }

            // Special enemy shooting
            specialEnemy.cooldown--;
            if (specialEnemy.cooldown <= 0) {
                enemyBullets.push({
                    x: specialEnemy.x + specialEnemy.width / 2,
                    y: specialEnemy.y + specialEnemy.height,
                    radius: 5, // Bullet radius for circle
                    speed: 3, // Speed downwards
                    color: 'red'
                });
                specialEnemy.cooldown = 100; // Reload cooldown
            }

            // Check for collision with player
            if (
                player.x < specialEnemy.x + specialEnemy.width &&
                player.x + player.width > specialEnemy.x &&
                player.y < specialEnemy.y + specialEnemy.height &&
                player.y + player.height > specialEnemy.y
            ) {
                player.alive = false; // Player dies on collision
            }
        }

        // Draw player bullets
        bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            if (bullet.y < 0) bullets.splice(index, 1);
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            // Check for collisions with enemies
            enemies.forEach((enemy, eIndex) => {
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    bullets.splice(index, 1);
                    enemy.lives--; // Reduce enemy lives
                    if (enemy.lives <= 0) {
                        enemies.splice(eIndex, 1); // Remove enemy if no lives left
                        score += 10;
                    }
                }
            });

            // Check for collisions with special enemy
            if (specialEnemy &&
                bullet.x < specialEnemy.x + specialEnemy.width &&
                bullet.x + bullet.width > specialEnemy.x &&
                bullet.y < specialEnemy.y + specialEnemy.height &&
                bullet.y + bullet.height > specialEnemy.y
            ) {
                bullets.splice(index, 1);
                specialEnemy.lives--; // Reduce special enemy lives
                if (specialEnemy.lives <= 0) {
                    specialEnemy = null; // Remove special enemy
                    score += 50;
                }
            }
        });

        // Draw special enemy bullets
        enemyBullets.forEach((bullet, index) => {
            bullet.y += bullet.speed;

            // Draw red circle for special enemy bullets
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();

            // Remove bullet if it goes off-screen
            if (bullet.y > canvas.height) {
                enemyBullets.splice(index, 1);
            }

            // Check for collision with player
            if (
                bullet.x > player.x &&
                bullet.x < player.x + player.width &&
                bullet.y > player.y &&
                bullet.y < player.y + player.height
            ) {
                player.alive = false;
            }
        });

        // Draw special player bullets
        specialBullets.forEach((bullet, index) => {
            bullet.y -= bullet.dy; // Special bullets move upwards
            bullet.x += bullet.dx; // Add lateral movement
            ctx.fillStyle = 'blue';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            if (bullet.y < 0) {
                specialBullets.splice(index, 1); // Remove bullet if it goes off-screen
            }

            // Check for collisions with enemies
            enemies.forEach((enemy, eIndex) => {
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    // Deal 1 damage to the enemy
                    enemy.lives -= 1;

                    if (enemy.lives <= 0) {
                        enemies.splice(eIndex, 1); // Remove enemy if no lives left
                        score += 10; // Add points for enemy destruction
                    }

                    // Remove bullet after collision
                    specialBullets.splice(index, 1);
                }
            });
        });

        // Display score
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);

        // Special shot cooldown
        if (specialShotCooldown > 0) {
            specialShotCooldown--;
        }

        requestAnimationFrame(gameLoop);
    }

    // Player controls
    window.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true; // Set key as pressed
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.code] = false; // Set key as released
    });

    // Shoot when mouse left button is clicked
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
            bullets.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: player.width / 3, // Bullets are 3 times smaller than player
                height: player.height / 3,
                speed: 8
            });
        }
    });

    // Special shot when "E" key is pressed
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE' && specialShotCooldown <= 0) {
            specialShotCooldown = 180; // Cooldown 3 seconds (60 FPS * 3)
            const bulletCount = 18; // Number of bullets in a semicircle
            const angleStep = Math.PI / (bulletCount - 1); // Angle step between bullets
            for (let i = 0; i < bulletCount; i++) {
                const angle = -Math.PI + i * angleStep; // Angle of the semicircle
                const dx = Math.cos(angle) * 4; // Horizontal speed
                const dy = Math.sin(angle) * 4; // Vertical speed
                specialBullets.push({
                    x: player.x + player.width / 2 - 2.5, // Center of the player
                    y: player.y,
                    width: 5,
                    height: 15,
                    dx: dx,
                    dy: -dy // Inverted y for upward movement
                });
            }
        }
    });

    // Start the game when the page loads
    createEnemies(); // Generate enemies at the start
    gameLoop();
}

// Start the game when the page loads
window.onload = initSpaceInvaders;
