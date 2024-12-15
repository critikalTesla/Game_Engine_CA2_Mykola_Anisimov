function initSpaceInvaders() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Игровые данные
    let player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 30,
        speed: 5,
        image: null,
        alive: true
    };
    let bullets = [];
    let enemyBullets = [];
    let enemies = [];
    let specialEnemy = null;
    let enemyRows = 4, enemyCols = 8;
    let score = 0;

    // Загрузка изображений
    const playerImg = new Image();
    const enemyImg = new Image();
    const specialEnemyImg = new Image();
    playerImg.src = 'resources/images/player/player.png';
    enemyImg.src = 'resources/images/enemy/enemy.png';
    specialEnemyImg.src = 'resources/images/enemy/enemy2.png';

    player.image = playerImg;

    // Генерация врагов
    function createEnemies() {
        enemies = [];
        for (let row = 0; row < enemyRows; row++) {
            for (let col = 0; col < enemyCols; col++) {
                enemies.push({
                    x: 50 + col * 60,
                    y: 30 + row * 40,
                    width: 40,
                    height: 30,
                    dx: row % 2 === 0 ? 1 : -1, // Чередование направления движения по горизонтали
                    dy: 0.2, // медленное движение вниз
                    image: enemyImg
                });
            }
        }
    }

    // Спавн особого врага
    function spawnSpecialEnemy() {
        specialEnemy = {
            x: Math.random() * (canvas.width - 50),
            y: 0,
            width: 50,
            height: 40,
            dx: Math.random() > 0.5 ? 1 : -1, // Случайное направление движения
            dy: 0.5, // Медленное движение вниз
            cooldown: 0, // Таймер стрельбы
            image: specialEnemyImg
        };
    }

    function restartGame() {
        player.alive = true;
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 60;
        score = 0;
        createEnemies();
        specialEnemy = null;
        bullets = [];
        enemyBullets = [];
    }

    setInterval(() => {
        if (!specialEnemy) {
            spawnSpecialEnemy();
        }
    }, Math.random() * 5000 + 5000); // Спавн каждые 5-10 секунд

    // Основной игровой цикл
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!player.alive) {
            ctx.fillStyle = 'red';
            ctx.font = '40px Arial';
            ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
            ctx.fillText('Press "R" to Restart', canvas.width / 2 - 150, canvas.height / 2 + 50);
            return;
        }

        // Отрисовка игрока
        if (player.image.complete) {
            ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        }

        // Отрисовка врагов
        enemies.forEach((enemy) => {
            if (enemy.image.complete) {
                ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            }
            enemy.x += enemy.dx;
            enemy.y += enemy.dy;
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) enemy.dx *= -1;
        });

        // Отрисовка особого врага
        if (specialEnemy) {
            if (specialEnemy.image.complete) {
                ctx.drawImage(specialEnemy.image, specialEnemy.x, specialEnemy.y, specialEnemy.width, specialEnemy.height);
            }
            specialEnemy.x += specialEnemy.dx;
            specialEnemy.y += specialEnemy.dy;

            if (specialEnemy.x <= 0 || specialEnemy.x + specialEnemy.width >= canvas.width) {
                specialEnemy.dx *= -1;
            }

            // Стрельба особого врага
            specialEnemy.cooldown--;
            if (specialEnemy.cooldown <= 0) {
                enemyBullets.push({
                    x: specialEnemy.x + specialEnemy.width / 2,
                    y: specialEnemy.y + specialEnemy.height,
                    radius: 5, // Радиус для круга
                    speed: 3, // Скорость вниз
                    color: 'red'
                });
                specialEnemy.cooldown = 100; // Перезарядка
            }
        }

        // Отрисовка снарядов игрока
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

            // Проверка на столкновения с особым врагом
            if (specialEnemy &&
                bullet.x < specialEnemy.x + specialEnemy.width &&
                bullet.x + bullet.width > specialEnemy.x &&
                bullet.y < specialEnemy.y + specialEnemy.height &&
                bullet.y + bullet.height > specialEnemy.y
            ) {
                bullets.splice(index, 1);
                specialEnemy = null;
                score += 50;
            }
        });

        // Отрисовка снарядов особого врага
        enemyBullets.forEach((bullet, index) => {
            bullet.y += bullet.speed;

            // Отрисовка красного круга
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();

            // Удаление снаряда, если он вышел за экран
            if (bullet.y > canvas.height) {
                enemyBullets.splice(index, 1);
            }

            // Проверка на столкновение с игроком
            if (
                bullet.x > player.x &&
                bullet.x < player.x + player.width &&
                bullet.y > player.y &&
                bullet.y < player.y + player.height
            ) {
                player.alive = false;
            }
        });

        // Вывод очков
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);

        requestAnimationFrame(gameLoop);
    }

    // Управление игроком
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyA') player.x = Math.max(0, player.x - player.speed); // Перемещение влево
        if (e.code === 'KeyD') player.x = Math.min(canvas.width - player.width, player.x + player.speed); // Перемещение вправо
        if (e.code === 'KeyR' && !player.alive) restartGame(); // Перезапуск игры
    });

    // Стрельба при нажатии левой кнопки мыши
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Левая кнопка мыши
            bullets.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: player.width / 3, // Снаряды в 3 раза меньше игрока
                height: player.height / 3,
                speed: 8
            });
        }
    });

    // Запуск игры
    createEnemies();
    gameLoop();
}

// Запуск игры при загрузке
window.onload = initSpaceInvaders;
