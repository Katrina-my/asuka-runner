
/*
// ..................版权声明区...................
  Function:XX
  Author  :sxy
  Date    :20260904
  Version :1.0
*/

// ..................变量/常量声明区...................
var canvas = document.getElementById("mycanvas"),
  ctx = canvas.getContext("2d");

var asukaImage = new Image();
asukaImage.src = "assets/asuka.png";

let background1 = new Image();
background1.src = "assets/background2.jpg";

let background2 = new Image();
background2.src = "assets/background1.jpg";

// 创建离屏canvas
var offCanvas = new OffscreenCanvas(
    canvas.width,
    canvas.height
);
var offCtx = offCanvas.getContext("2d");


let groundY = 250;

let asukaX = 50;
let asukaY = 210;
let asukaWidth = 60;
let asukaHeight = 60;

let upspeed = 0;
let gravity = 0.5;
let jumpForce = 10;
let isJumping = false;

let runTime = 0;
let runSpeed = 0.18;

//障碍物煤球
let meiQiuImage = new Image();
meiQiuImage.src = "assets/meiqiu.png";

let obstacles = [];

let obstacleSpeed = 5;

let obstacleTimer = 0;
let obstacleInterval = 100;

let gameOver = false;

//障碍物量产机
let liangchanjiImage = new Image();
liangchanjiImage.src = "assets/liangchanji.png";

// 分数系统
let score = 0;
let scoreTimer = 0;
let lastScoreTime = Date.now();


// .....自定义函数区.....
function initOffscreen() {

    offCtx.fillStyle = "black";
    offCtx.fillRect(0, groundY, 800, 100);

}


function drawLeg(x, angle) {
    ctx.save()
    ctx.translate(asukaX + x+14, asukaY + asukaHeight - 8);
    ctx.rotate(angle);

    ctx.fillStyle = "#49352F";
    ctx.fillRect(-2, 0, 4, 8);
    ctx.fillRect(-3, 6, 8, 3);
    ctx.restore();
}

function drawLegs() {

    let angle = Math.sin(runTime) * 0.5;

    // 左腿
    drawLeg(14, angle);

    // 右腿
    drawLeg(20, -angle);

}


function createObstacle() {
    let type = Math.random() < 0.5 ? "meiQiu" : "liangchanji";
    let width = 70;
    let height = 70;
    let y = groundY - height;
    let isHigh = false;

    if (type === "meiQiu") {
        isHigh = Math.random() < 0.6;

        if (isHigh) {
            y = groundY - asukaHeight - height - 10;
        }
    }

    let obstacle = {
        x: canvas.width,
        y: y,
        width: width,
        height: height,
        type: type,
        isHigh: isHigh
    };

    obstacles.push(obstacle);
}

function updateObstacles() {
    obstacleTimer++;
    // 定时生成障碍物
    if (obstacleTimer >= obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;
    }
    // 所有障碍物向左移动
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacleSpeed;

    }

    // 删除已经离开画布的障碍物
    obstacles = obstacles.filter(
        obstacle => obstacle.x + obstacle.width > 0
    );

}
function drawObstacles() {

    for (let obstacle of obstacles) {

        if (obstacle.type === "meiQiu") {

            if (meiQiuImage.complete && meiQiuImage.naturalWidth > 0) {
                ctx.drawImage(
                    meiQiuImage,
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            }

        } else if (obstacle.type === "liangchanji") {

            if (liangchanjiImage.complete && liangchanjiImage.naturalWidth > 0) {
                ctx.drawImage(
                    liangchanjiImage,
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            }

        }

    }

}

function checkCollision() {
    let dinoBox = {
        x: asukaX + 12,
        y: asukaY + 8,
        width: asukaWidth - 24,
        height: asukaHeight - 12
    };

    for (let obstacle of obstacles) {
        let obstacleBox = {
            x: obstacle.x + 8,
            y: obstacle.y + 8,
            width: obstacle.width - 16,
            height: obstacle.height - 8
        };

        
        if (obstacle.type === "meiQiu" && obstacle.isHigh) {
            obstacleBox = {
                x: obstacle.x + 20,
                y: obstacle.y + 20,
                width: obstacle.width - 40,
                height: obstacle.height - 40
            };
        }

        if (
            dinoBox.x < obstacleBox.x + obstacleBox.width &&
            dinoBox.x + dinoBox.width > obstacleBox.x &&
            dinoBox.y < obstacleBox.y + obstacleBox.height &&
            dinoBox.y + dinoBox.height > obstacleBox.y
        ) {

            gameOver = true;

        }

    }

}



function clipTest() {

    ctx.save();

    ctx.beginPath();
    ctx.rect(620, 80, 120, 120);
    ctx.clip();


    ctx.restore();
}

function draw() {

    ctx.drawImage(offCanvas, 0, 0);
    ctx.drawImage(asukaImage,asukaX,asukaY,asukaWidth,asukaHeight
    );

    drawLegs();

    clipTest();
    drawObstacles();
    //显示分数
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}


function update() {
    asukaY += upspeed;
    upspeed += gravity;

    if (asukaY >= groundY - asukaHeight) {
        asukaY = groundY - asukaHeight;
        upspeed = 0;
        isJumping = false;

    }
    if (!isJumping) {
        runTime += runSpeed;
    }
    let now = Date.now();
    if (now - lastScoreTime > 1000) {
        score++;
        lastScoreTime = now;
    }
    updateObstacles();
    checkCollision();

}

function drawBackground() {
    if (score < 20) {
        if (background1.complete && background1.naturalWidth > 0) {
            ctx.drawImage(
                background1,
                0, 0,
                canvas.width,
                canvas.height
            );
        }

    } else {
        if (background2.complete && background2.naturalWidth > 0) {
            ctx.drawImage(
                background2,
                0, 0,
                canvas.width,
                canvas.height
            );
        }

    }

}
function gameLoop() {

  if (gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    draw();

    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", 300, 120);

    return;
}
    ctx.clearRect(
        0, 0,
        canvas.width,
        canvas.height
    );

    update();
    drawBackground();
    draw();

    requestAnimationFrame(gameLoop);
}


// .....事件响应函数区.....
document.addEventListener("keydown", function(event) {

    if (event.code === "Space" && !isJumping) {

        event.preventDefault();

        isJumping = true;
        upspeed = -jumpForce;

    }

});


// .....初始化函数区.....
function init() {

    console.log("页面初始化");

    // 初始化离屏画布
    initOffscreen();

    gameLoop();

}

// ..................页面初始化入口....................
init();
