// spaceInvaders.js

// Инициализация игры
function initSpaceInvaders() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let player = { x: canvas.width / 2 - 25, y: canvas.height - 60, width: 50, height: 30, speed: 5 };
    let bullets = [];
    let enemies = [];
    let enemyRows = 4, enemyCols = 8;
    let score = 0;

    // Генерация врагов
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: 50 + col * 60,
                y: 30 + row * 40,
                width: 40,
                height: 30,
                dx: 1,
            });
        }
    }

    // Основной игровой цикл
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Отрисовка игрока
        ctx.fillStyle = 'green';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Отрисовка врагов
        enemies.forEach((enemy) => {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            enemy.x += enemy.dx;
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) enemy.dx *= -1;
        });

        // Отрисовка снарядов
        bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            if (bullet.y < 0) bullets.splice(index, 1);
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            // Проверка на столкновения с врагами
            enemies.forEach((enemy, eIndex) => {
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    bullets.splice(index, 1);
                    enemies.splice(eIndex, 1);
                    score += 10;
                }
            });
        });

        // Вывод очков
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);

        requestAnimationFrame(gameLoop);
    }

    // Управление
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') player.x = Math.max(0, player.x - player.speed);
        if (e.code === 'ArrowRight') player.x = Math.min(canvas.width - player.width, player.x + player.speed);
        if (e.code === 'Space') {
            bullets.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: 10,
                height: 20,
                speed: 8,
            });
        }
    });

    // Запуск игры
    gameLoop();
}

// Запуск игры при загрузке
window.onload = initSpaceInvaders;