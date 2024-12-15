function initSpaceInvaders() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Игровые данные
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
    let enemyCols = 8; // Всего 8 врагов в строке
    let enemyRows = 0; // Стартовое количество рядов врагов
    let score = 0;
    let specialShotCooldown = 0; // Кулдаун для особого выстрела
    let lastEnemySpawnTime = 0; // Время последнего спавна врагов
    let lastSpecialEnemyTime = 0; // Время последнего спавна особого врага
    let keysPressed = {}; // Массив для отслеживания нажатых клавиш

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
        const yPosition = 70; // Все враги спавнятся на одной и той же строке, без смещения

        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: 50 + col * 60, // Расстояние между врагами по горизонтали
                y: yPosition, // Все враги в одном ряду на строке 70
                width: 40,
                height: 30,
                lives: 3, // У врагов 3 жизни
                dx: 1, // Враги двигаются вправо
                dy: 0, // Враги не двигаются по вертикали
                image: enemyImg
            });
        }
        enemyRows++; // После создания ряда увеличиваем количество рядов
    }

    // Спавн особого врага
    function spawnSpecialEnemy() {
        if (!specialEnemy) { // Новый особый враг спавнится только если предыдущий уничтожен
            specialEnemy = {
                x: Math.random() * (canvas.width - 50),
                y: 70, // Начальная позиция для особого врага
                width: 50,
                height: 40,
                lives: 2, // У особого врага 2 жизни
                dx: Math.random() > 0.5 ? 1 : -1, // Случайное направление движения
                dy: 0, // Особый враг не двигается вниз
                cooldown: 0, // Таймер стрельбы
                image: specialEnemyImg
            };
        }
    }

    function restartGame() {
        player.alive = true;
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 60;
        score = 0;
        enemies = []; // Очищаем старых врагов
        enemyRows = 0; // Начинаем с нулевого ряда
        createEnemies(); // Генерация новых врагов
        specialEnemy = null;
        bullets = [];
        specialBullets = [];
        enemyBullets = [];
    }

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

        const currentTime = Date.now();

        // Генерация новой строки врагов каждые 10 секунд
        if (currentTime - lastEnemySpawnTime >= 10000) {
            createEnemies();
            lastEnemySpawnTime = currentTime;
        }

        // Генерация особого врага каждые 5-10 секунд, если предыдущий уничтожен
        if (!specialEnemy && currentTime - lastSpecialEnemyTime >= (Math.random() * 5000 + 5000)) {
            spawnSpecialEnemy();
            lastSpecialEnemyTime = currentTime;
        }

        // Обработка движения игрока
        if (keysPressed['KeyA']) player.x = Math.max(0, player.x - player.speed);
        if (keysPressed['KeyD']) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

        // Отрисовка игрока
        if (player.image.complete) {
            ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        }

        // Отрисовка и движение врагов
        enemies.forEach((enemy, index) => {
            if (enemy.image.complete) {
                ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            }

            // Движение врагов только по горизонтали
            enemy.x += enemy.dx;

            // Если враг достиг левого или правого края, он опускается вниз на одну строку
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                enemy.dx *= -1; // меняем направление по горизонтали
                enemy.y += 40; // перемещаем вниз на одну строку
            }

            // Проверка коллизии с игроком
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                player.alive = false; // Игрок умирает при столкновении
            }
        });

        // Отрисовка особого врага
        if (specialEnemy) {
            if (specialEnemy.image.complete) {
                ctx.drawImage(specialEnemy.image, specialEnemy.x, specialEnemy.y, specialEnemy.width, specialEnemy.height);
            }
            specialEnemy.x += specialEnemy.dx;

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

            // Проверка коллизии с игроком
            if (
                player.x < specialEnemy.x + specialEnemy.width &&
                player.x + player.width > specialEnemy.x &&
                player.y < specialEnemy.y + specialEnemy.height &&
                player.y + player.height > specialEnemy.y
            ) {
                player.alive = false; // Игрок умирает при столкновении
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
                    enemy.lives--; // У врага убирается жизнь
                    if (enemy.lives <= 0) {
                        enemies.splice(eIndex, 1); // Удаляем врага, если жизни закончились
                        score += 10;
                    }
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
                specialEnemy.lives--; // Уменьшаем жизни у особого врага
                if (specialEnemy.lives <= 0) {
                    specialEnemy = null; // Удаляем особого врага
                    score += 50;
                }
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

        // Отрисовка особых снарядов игрока
        specialBullets.forEach((bullet, index) => {
            bullet.y -= bullet.dy; // Особые снаряды летят вверх
            bullet.x += bullet.dx; // Добавлено боковое движение
            ctx.fillStyle = 'blue';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            if (bullet.y < 0) {
                specialBullets.splice(index, 1); // Удаляем снаряд, если он ушёл за верхнюю границу
            }

            // Проверка на столкновения с врагами
            enemies.forEach((enemy, eIndex) => {
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    // Наносим 1 урона врагу
                    enemy.lives -= 1; // Уменьшаем жизни врага

                    if (enemy.lives <= 0) {
                        enemies.splice(eIndex, 1); // Удаляем врага, если жизни закончились
                        score += 10; // Добавляем очки за уничтожение врага
                    }

                    // Удаляем пулю, так как она столкнулась с врагом
                    specialBullets.splice(index, 1);
                }
            });
        });

        // Вывод очков
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);

        // Кулдаун особого выстрела
        if (specialShotCooldown > 0) {
            specialShotCooldown--;
        }

        requestAnimationFrame(gameLoop);
    }

    // Управление игроком
    window.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true; // Устанавливаем, что клавиша нажата
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.code] = false; // Убираем флаг нажатой клавиши
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

    // Особый выстрел при нажатии на кнопку "E"
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE' && specialShotCooldown <= 0) {
            specialShotCooldown = 180; // Кулдаун 3 секунды (60 FPS * 3)
            const bulletCount = 18; // Количество пуль в полукруге
            const angleStep = Math.PI / (bulletCount - 1); // Шаг угла между пулями
            for (let i = 0; i < bulletCount; i++) {
                const angle = -Math.PI + i * angleStep; // Угол полукруга
                const dx = Math.cos(angle) * 4; // Скорость по x
                const dy = Math.sin(angle) * 4; // Скорость по y
                specialBullets.push({
                    x: player.x + player.width / 2 - 2.5, // Центр игрока
                    y: player.y,
                    width: 5,
                    height: 15,
                    dx: dx,
                    dy: -dy // Инверсия y для полёта вверх
                });
            }
        }
    });

    // Запуск игры при загрузке
    createEnemies(); // Генерируем врагов при старте
    gameLoop();
}

// Запуск игры при загрузке
window.onload = initSpaceInvaders;
