
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
let gravity = 1800;
let jumpForce = 600;
let isJumping = false;

let runTime = 0;
let runSpeed = 0.18;

//障碍物煤球
let meiQiuImage = new Image();
meiQiuImage.src = "assets/meiqiu.png";

let obstacles = [];

let obstacleSpeed = 300;

let obstacleTimer = 0;
let obstacleInterval = 100/60;
let obstacleElapsedTime = 0;

let gameOver = false;

let gamestart = false;

//障碍物量产机
let liangchanjiImage = new Image();
liangchanjiImage.src = "assets/liangchanji.png";

// 分数系统
let score = 0;
let scoreTimer = 0;

const milestoneMusic = new Audio("assets/bgm.mp3");
milestoneMusic.preload = "auto";
let milestoneMusicStarted = false;

function playMilestoneMusic() {
    if (milestoneMusicStarted) return;
    milestoneMusicStarted = true;
    milestoneMusic.play().catch(function(error) {
        milestoneMusicStarted = false;
        console.warn("100分音乐播放失败：", error);
    });
}


// .....自定义函数区.....
function drawsStartScreen() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click to Start Game", canvas.width / 2, canvas.height / 2);

    ctx.font = "24px Arial";
    ctx.fillText("Space to Jump", canvas.width / 2, canvas.height / 2 + 50);

    ctx.restore();


}

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

function randomObstacleInterval() {
    // 前 30 秒逐渐缩短随机生成间隔，最短保持 0.7 秒。
    const progress = Math.min(obstacleElapsedTime / 30, 1);
    const maxInterval = 1.9 - 0.9 * progress;
    return 0.7 + Math.random() * (maxInterval - 0.7);
}
function updateObstacles(deltatime) {
    obstacleElapsedTime += deltatime;
    obstacleTimer+=deltatime;
    // 定时生成障碍物
    if (obstacleTimer >= obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;
        obstacleInterval = randomObstacleInterval();
    }
    // 所有障碍物向左移动
    obstacleSpeed =Math.min(obstacleSpeed + 8*deltatime, 600);
    for (let obstacle of obstacles) {
        obstacle.x -= obstacleSpeed * deltatime;

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
        width: asukaWidth - 30,
        height: asukaHeight - 20
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
        if (obstacle.type === "liangchanji" && obstacle.isHigh) {
            obstacleBox = {
                x: obstacle.x + 20,
                y: obstacle.y + 20,
                width: obstacle.width - 40,
                height: obstacle.height - 40
            };
        }
        if (obstacle.type === "liangchanji" || obstacle.type === "meiQiu") {
            obstacleBox.x -= 5;
            obstacleBox.width += 5;
        }
        if (obstacle.type === "liangchanji") {
            obstacleBox.x -= 8;
            // 量产机碰撞箱四边各向内收缩 5 像素，高度再减少 4 像素。
            obstacleBox.x += 5;
            obstacleBox.y += 5;
            obstacleBox.width -= 10;
            obstacleBox.height -= 14;
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


function update(deltatime) {
    asukaY += upspeed * deltatime;
    upspeed += gravity * deltatime;

    if (asukaY >= groundY - asukaHeight) {
        asukaY = groundY - asukaHeight;
        upspeed = 0;
        isJumping = false;

    }
    if (!isJumping) {
        runTime += runSpeed * deltatime * 60;
    }
 
    updateObstacles(deltatime);
    checkCollision();

    if (!gameOver) {
        scoreTimer += deltatime;
        const earnedPoints = Math.floor(scoreTimer);
        score += earnedPoints;
        scoreTimer -= earnedPoints;
    }

}

let messageStartTime = null;

function drawBackground() {
    if (score < 100) {
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
            // 五秒后文字消失：首次显示时开始计时，五秒后不再绘制。
            if (messageStartTime === null) {
                messageStartTime = performance.now();
                playMilestoneMusic();
            }
            if (performance.now() - messageStartTime < 5000) {
                ctx.save();
                ctx.font = '32px "幼圆", "微软雅黑", sans-serif';
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;
                ctx.strokeStyle = "#9d3b70";
                ctx.lineWidth = 1;
                ctx.strokeText("谢谢你玩我的游戏！:)", canvas.width / 2, canvas.height / 2);
                ctx.fillStyle = "#ff99cc";
                ctx.fillText("谢谢你玩我的游戏！:)", canvas.width / 2, canvas.height / 2);
                ctx.restore();
            }
        }

    }

}
let lastFrameTime = null;
function gameLoop(timestamp) {
    // 开始界面只绘制，不更新游戏状态。
    if (!gamestart) {
        drawsStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }
    if (gameOver) return;

    // 点击后的第一帧从零开始，不计入等待开始的时间。
    let deltatime = lastFrameTime === null ? 0 : (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    deltatime = Math.min(deltatime, 0.05);

    update(deltatime);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    draw();

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER", 300, 120);
        ctx.font = "20px Arial";
        ctx.fillText("Click to Restart", 320, 160);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// .....事件响应函数区.....
document.addEventListener("keydown", function(event) {
    if (event.code !== "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    handleGameAction();
});

function handleGameAction() {
    if (gameOver) {
        window.location.reload();
        return;
    }

    if (!gamestart) {
        score = 0;
        scoreTimer = 0;
        obstacleTimer = 0;
        obstacleElapsedTime = 0;
        lastFrameTime = null;
        gamestart = true;
        return;
    }

    // 若浏览器拦截自动播放，下次点击或按空格时重试。
    if (score >= 100 && messageStartTime !== null) {
        playMilestoneMusic();
    }

    if (!isJumping) {
        isJumping = true;
        upspeed = -jumpForce;
    }
}

document.addEventListener("click", handleGameAction);

// .....初始化函数区.....
function init() {

    console.log("页面初始化");
    gamestart = false;

    // 初始化离屏画布
    initOffscreen();

    requestAnimationFrame(gameLoop);

}

// ..................页面初始化入口....................
init();
