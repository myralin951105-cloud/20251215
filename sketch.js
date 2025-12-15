let stopAnimation = [];
let runAnimation = [];
let jumpAnimation = [];
let emissionAnimation = [];
let newCharacterAnimation = [];
let newCharacterAnimation2 = [];
let char3TouchAnimation = [];
let char2FallDownAnimation = [];

// --- 動畫參數 ---
const STOP_FRAMES = 5;
const STOP_SHEET_W = 525, STOP_SHEET_H = 149;
const STOP_FRAME_W = STOP_SHEET_W / STOP_FRAMES;

const RUN_FRAMES = 6;
const RUN_SHEET_W = 757, RUN_SHEET_H = 150;
const RUN_FRAME_W = RUN_SHEET_W / RUN_FRAMES;

const JUMP_FRAMES = 5;
const JUMP_SHEET_W = 540, JUMP_SHEET_H = 162;
const JUMP_FRAME_W = JUMP_SHEET_W / JUMP_FRAMES;

const EMISSION_FRAMES = 6;
const EMISSION_SHEET_W = 1561, EMISSION_SHEET_H = 151;
const EMISSION_FRAME_W = EMISSION_SHEET_W / EMISSION_FRAMES;

const NEW_CHAR_FRAMES = 8;
const NEW_CHAR_SHEET_W = 467, NEW_CHAR_SHEET_H = 95;
const NEW_CHAR_FRAME_W = NEW_CHAR_SHEET_W / NEW_CHAR_FRAMES;

const NEW_CHAR_2_FRAMES = 6;
const NEW_CHAR_2_SHEET_W = 343, NEW_CHAR_2_SHEET_H = 40;
const NEW_CHAR_2_FRAME_W = NEW_CHAR_2_SHEET_W / NEW_CHAR_2_FRAMES;

const CHAR_3_TOUCH_FRAMES = 11;
const CHAR_3_TOUCH_SHEET_W = 732, CHAR_3_TOUCH_SHEET_H = 69;
const CHAR_3_TOUCH_FRAME_W = CHAR_3_TOUCH_SHEET_W / CHAR_3_TOUCH_FRAMES;

const CHAR_2_FALL_DOWN_FRAMES = 4;
const CHAR_2_FALL_DOWN_SHEET_W = 375, CHAR_2_FALL_DOWN_SHEET_H = 83;
const CHAR_2_FALL_DOWN_FRAME_W = CHAR_2_FALL_DOWN_SHEET_W / CHAR_2_FALL_DOWN_FRAMES;

// --- 角色狀態 ---
let characterX, characterY;
let newCharacterX; // 新增：新角色的 X 座標
let newCharacter2X; // 新增：第三個角色的 X 座標
let speed = 4;
let direction = 1; // 1: 向右, -1: 向左
let state = 'idle'; // 'idle', 'running', 'jumping', 'shooting'

// --- 射擊狀態 ---
let isShooting = false;
let shootFrameCounter = 0;

// --- 跳躍物理 ---
let velocityY = 0;
let gravity = 0.6;
let jumpForce = -15;
let isJumping = false;
let groundY;

// --- 子彈 ---
let projectiles = [];
let projectileImg;

// --- 互動狀態 ---
let inputBox = null;
let char2Dialogue = "";
let isNearChar2 = false;

// --- 測驗狀態 ---
let quizTable;
let currentQuestion = null;
let quizState = 'idle'; // 'idle', 'asking', 'answered'
let feedbackTimeout;
let questionDeck = []; // 新增：儲存問題索引的牌組
let currentDeckIndex = 0; // 新增：目前在牌組中的索引

// p5.js 預載入資源的函式
function preload() {
    stopSheet = loadImage('1/stop/stop_1.png');
    runSheet = loadImage('1/run/run_1.png');
    jumpSheet = loadImage('1/jump/jump_1.png');
    emissionSheet = loadImage('1/emission/emission_1.png');
    newCharacterSheet = loadImage('2/stop/stop_2.png');
    newCharacterSheet2 = loadImage('3/stop/stop_3.png');
    char3TouchSheet = loadImage('3/touch/touch_3.png');
    char2FallDownSheet = loadImage('2/fall_down/fall_down_2.png');

    // 載入 CSV 測驗題庫
    quizTable = loadTable('quiz.csv', 'csv', 'header');
}

// p5.js 設定初始狀態的函式 (只執行一次)
function setup() {
    createCanvas(windowWidth, windowHeight);

    // 將角色群組置中
    let groupCenterX = width / 2;
    newCharacterX = groupCenterX - 150; // 角色二 (左)
    characterX = groupCenterX;           // 角色一 (中)
    newCharacter2X = groupCenterX + 150; // 角色三 (右)

    characterY = height / 2;
    groundY = characterY; // 設定地面高度

    // --- 初始化並洗牌測驗題庫 ---
    if (quizTable.getRowCount() > 0) {
        for (let i = 0; i < quizTable.getRowCount(); i++) {
            questionDeck.push(i);
        }
        shuffleDeck();
    }

    // 切割站立動畫的每一幀
    for (let i = 0; i < STOP_FRAMES; i++) {
        let img = stopSheet.get(i * STOP_FRAME_W, 0, STOP_FRAME_W, STOP_SHEET_H);
        stopAnimation.push(img);
    }
    // 從站立動畫中取得子彈的圖片 (最後一幀)
    projectileImg = stopAnimation[4];

    // 切割走路動畫的每一幀
    for (let i = 0; i < RUN_FRAMES; i++) {
        let img = runSheet.get(i * RUN_FRAME_W, 0, RUN_FRAME_W, RUN_SHEET_H);
        runAnimation.push(img);
    }

    // 切割跳躍動畫的每一幀
    for (let i = 0; i < JUMP_FRAMES; i++) {
        let img = jumpSheet.get(i * JUMP_FRAME_W, 0, JUMP_FRAME_W, JUMP_SHEET_H);
        jumpAnimation.push(img);
    }

    // 切割射擊動畫的每一幀
    for (let i = 0; i < EMISSION_FRAMES; i++) {
        let img = emissionSheet.get(i * EMISSION_FRAME_W, 0, EMISSION_FRAME_W, EMISSION_SHEET_H);
        emissionAnimation.push(img);
    }

    // 切割新角色的動畫幀
    for (let i = 0; i < NEW_CHAR_FRAMES; i++) {
        let img = newCharacterSheet.get(i * NEW_CHAR_FRAME_W, 0, NEW_CHAR_FRAME_W, NEW_CHAR_SHEET_H);
        newCharacterAnimation.push(img);
    }

    // 切割第三個角色的動畫幀
    for (let i = 0; i < NEW_CHAR_2_FRAMES; i++) {
        let img = newCharacterSheet2.get(i * NEW_CHAR_2_FRAME_W, 0, NEW_CHAR_2_FRAME_W, NEW_CHAR_2_SHEET_H);
        newCharacterAnimation2.push(img);
    }

    // 切割角色3的觸摸動畫幀
    for (let i = 0; i < CHAR_3_TOUCH_FRAMES; i++) {
        let img = char3TouchSheet.get(i * CHAR_3_TOUCH_FRAME_W, 0, CHAR_3_TOUCH_FRAME_W, CHAR_3_TOUCH_SHEET_H);
        char3TouchAnimation.push(img);
    }

    // 切割角色2的跌倒動畫幀
    for (let i = 0; i < CHAR_2_FALL_DOWN_FRAMES; i++) {
        let img = char2FallDownSheet.get(i * CHAR_2_FALL_DOWN_FRAME_W, 0, CHAR_2_FALL_DOWN_FRAME_W, CHAR_2_FALL_DOWN_SHEET_H);
        char2FallDownAnimation.push(img);
    }
}

// p5.js 偵測單次按鍵事件的函式
function keyPressed() {
    // 當按下向上鍵且角色不在空中時，觸發跳躍
    if (keyCode === UP_ARROW && !isJumping && !isShooting) {
        isJumping = true;
        velocityY = jumpForce;
    }

    // 當按下空白鍵且角色在地面上時，觸發射擊
    if (key === ' ' && !isJumping && !isShooting) {
        isShooting = true;
        state = 'shooting';
        shootFrameCounter = 0; // 重置射擊動畫計數器
    }
}

// p5.js 繪圖和動畫的函式 (不斷重複執行)
function draw() {
    background('#c0d6df');

    // --- 在左上角顯示學號姓名 ---
    push(); // 保存當前繪圖設定，避免影響其他元素
    fill(0, 0, 0, 150); // 設定半透明的黑色文字
    noStroke();
    textSize(24); // 放大字體
    textStyle(BOLD); // 設定為粗體
    textAlign(LEFT, TOP);
    text('414730126林依涵', 20, 20); // 在 (20, 20) 的位置繪製文字
    pop(); // 恢復原本的繪圖設定

    // --- 狀態更新 ---

    // 處理射擊動畫
    if (isShooting) {
        shootFrameCounter++;
        let animationSpeed = 5; // 數字越小，動畫越快
        let currentFrame = floor(shootFrameCounter / animationSpeed);

        // 在動畫的第4幀發射子彈 (索引為3)
        if (currentFrame === 3 && floor((shootFrameCounter - 1) / animationSpeed) < 3) {
            // 建立一個新的子彈物件
            let p = {
                x: characterX + (direction * 50), // 從角色前方發射
                y: characterY - 10, // 調整子彈的垂直位置
                dir: direction,
                speed: 10
            };
            projectiles.push(p);
        }

        // 動畫播放完畢
        if (currentFrame >= EMISSION_FRAMES) {
            isShooting = false;
            state = 'idle';
        }
    }

    // 處理跳躍物理
    if (isJumping) {
        state = 'jumping';
        characterY += velocityY;
        velocityY += gravity;

        // 如果角色回到或低於地面
        if (characterY >= groundY) {
            characterY = groundY;
            isJumping = false;
            state = 'idle'; // 跳躍結束後回到站立狀態
        }
    }

    // 只有在不跳躍且不射擊時，才能左右移動
    if (!isJumping && !isShooting) {
        if (keyIsDown(RIGHT_ARROW)) {
            direction = 1;
            state = 'running';
            characterX += speed;
        } else if (keyIsDown(LEFT_ARROW)) {
            direction = -1;
            state = 'running';
            characterX -= speed;
        } else {
            state = 'idle';
        }
    } else if (isJumping) { // isJumping is true
        // 在空中時也可以左右移動 (空中控制)
        if (keyIsDown(RIGHT_ARROW)) {
            characterX += speed;
        } else if (keyIsDown(LEFT_ARROW)) {
            characterX -= speed;
        }
    }

    // --- 更新並繪製子彈 ---
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.speed * p.dir;
        image(projectileImg, p.x, p.y);

        // 如果子彈超出畫面，就從陣列中移除
        if (p.x > width || p.x < 0) {
            projectiles.splice(i, 1);
        }
    }

    // --- 繪製新角色 ---
    // 檢查角色1與角色2的距離
    let distanceToChar2 = abs(characterX - newCharacterX);
    let proximityThreshold2 = 120; // 觸發反應的距離閾值
    let wasNearChar2 = isNearChar2;
    isNearChar2 = distanceToChar2 < proximityThreshold2;

    push();
    translate(newCharacterX, groundY); // 使用固定的座標來顯示新角色
    imageMode(CENTER);

    if (isNearChar2) {
        // 如果很近，播放跌倒動畫
        let fallDownFrameIndex = floor(frameCount / 6) % CHAR_2_FALL_DOWN_FRAMES;
        image(char2FallDownAnimation[fallDownFrameIndex], 0, 0);

        // 剛進入範圍且沒有輸入框時，建立互動
        if (!wasNearChar2 && !inputBox) {
            if (quizState === 'idle' || quizState === 'answered') {
                startQuiz();
            }
        }
    } else {
        // 如果很遠，播放原本的待機動畫
        let idleFrameIndex = floor(frameCount / 6) % NEW_CHAR_FRAMES;
        image(newCharacterAnimation[idleFrameIndex], 0, 0);

        // 剛離開範圍時，清除互動
        if (wasNearChar2) {
            // 清除可能正在進行的測驗
            char2Dialogue = "";
            if (inputBox) {
                inputBox.remove();
                inputBox = null;
            }
            quizState = 'idle';
            currentQuestion = null;
            clearTimeout(feedbackTimeout); // 清除回饋計時器
        }
    }

    // 繪製角色2的對話
    if (char2Dialogue) {
        // --- 對話框繪製 ---
        let textPadding = 15;
        let boxHeight = 60; // 增加對話框高度以容納較大的文字
        
        textStyle(BOLD); // 設定為粗體
        textSize(20); // 放大字體
        let boxWidth = textWidth(char2Dialogue) + textPadding * 2;
        let boxY = -110; // 對話框的 Y 軸位置

        // 繪製對話框背景
        fill(255, 245, 238, 220); // 帶點透明度的米白色
        stroke(50); // 深灰色邊框
        strokeWeight(2);
        rectMode(CENTER); // 將矩形繪製模式設為中心對齊
        rect(0, boxY, boxWidth, boxHeight, 10); // 繪製圓角矩形

        // 繪製文字
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER); // 水平與垂直置中
        text(char2Dialogue, 0, boxY); // 在對話框中心顯示文字
    }

    // 更新輸入框位置
    if (inputBox) {
        inputBox.position(characterX - inputBox.width / 2, characterY - 150);
    }
    pop();

    // --- 繪製第三個角色 (在主要角色右邊) ---
    push();
    // 判斷主要角色是否在角色3的左邊，以決定其朝向
    let char3Direction = (characterX < newCharacter2X) ? -1 : 1;

    translate(newCharacter2X, groundY + 55); // 使用固定的座標來顯示第三個角色
    scale(char3Direction * 1.5, 1.5); // 根據方向翻轉並放大1.5倍
    imageMode(CENTER);

    // 檢查角色1與角色3的距離
    let distance = abs(characterX - newCharacter2X);
    let proximityThreshold = 120; // 觸發反應的距離閾值 (縮短距離)

    if (distance < proximityThreshold) {
        // 如果很近，播放觸摸動畫
        let touchFrameIndex = floor(frameCount / 6) % CHAR_3_TOUCH_FRAMES;
        image(char3TouchAnimation[touchFrameIndex], 0, 0);
    } else {
        // 如果很遠，播放原本的待機動畫
        let idleFrameIndex = floor(frameCount / 8) % NEW_CHAR_2_FRAMES;
        image(newCharacterAnimation2[idleFrameIndex], 0, 0);
    }
    pop();


    // --- 根據狀態繪製角色 ---
    push(); // 保存目前的繪圖設定
    translate(characterX, characterY); // 將原點移動到角色位置
    scale(direction, 1); // 根據方向翻轉畫布
    imageMode(CENTER); // 將圖片繪製模式設為中心對齊

    switch (state) {
        case 'shooting':
            let shootFrameIndex = floor(shootFrameCounter / 5) % EMISSION_FRAMES;
            image(emissionAnimation[shootFrameIndex], 0, 0);
            break;
        case 'jumping':
            // 根據垂直速度判斷顯示上升或下降的影格
            // 您的 jump_1.png 前4張是上升/滯空，最後1張是下降
            let jumpFrameIndex;
            if (velocityY < 0) { // 上升中
                jumpFrameIndex = floor(map(velocityY, jumpForce, 0, 0, 3.9));
            } else { // 下降中
                jumpFrameIndex = 4;
            }
            image(jumpAnimation[jumpFrameIndex], 0, 0);
            break;
        case 'running':
            let runFrameIndex = floor(frameCount / 6) % RUN_FRAMES;
            image(runAnimation[runFrameIndex], 0, 0);
            break;
        default: // 'idle'
            image(stopAnimation[0], 0, 0);
            break;
    }

    pop(); // 恢復原本的繪圖設定
}

// 視窗大小改變時重新設定畫布大小，以保持全視窗
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function startQuiz() {
    quizState = 'asking';

    // 如果牌組中的題目都問完了，就重新洗牌
    if (currentDeckIndex >= questionDeck.length) {
        shuffleDeck();
    }

    // 從洗好的牌組中依序抽出一題
    let questionIndex = questionDeck[currentDeckIndex];
    currentQuestion = quizTable.getRow(questionIndex);
    currentDeckIndex++; // 將索引指向下一題，準備下次提問

    // 設定對話為題目內容
    char2Dialogue = currentQuestion.getString('question');
    createDialogueInput();
}

function createDialogueInput() {
    inputBox = createInput('');
    inputBox.size(200);
    inputBox.changed(handleInput); // 當按下Enter或輸入框失焦時觸發
}

function handleInput() {
    if (inputBox && currentQuestion) {
        quizState = 'answered';
        let userAnswer = inputBox.value().trim();
        let correctAnswer = currentQuestion.getString('answer');

        if (userAnswer === correctAnswer) {
            // 答對了
            char2Dialogue = currentQuestion.getString('correct_feedback');
        } else {
            // 答錯了
            char2Dialogue = currentQuestion.getString('wrong_feedback');
        }

        inputBox.remove();
        inputBox = null;

        // 顯示回饋 3 秒後，再問一題
        feedbackTimeout = setTimeout(() => {
            startQuiz();
        }, 3000);
    }
}

// 洗牌函式 (Fisher-Yates Shuffle)
function shuffleDeck() {
    // 從最後一個元素開始，與前面隨機一個元素交換
    for (let i = questionDeck.length - 1; i > 0; i--) {
        const j = floor(random() * (i + 1));
        [questionDeck[i], questionDeck[j]] = [questionDeck[j], questionDeck[i]]; // ES6 語法交換陣列元素
    }
    currentDeckIndex = 0; // 洗牌後，將索引重置為 0
}