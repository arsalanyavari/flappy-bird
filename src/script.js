let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
window.onscroll = function () { window.scrollTo(0, 0); };

const cx = canvas.getContext("2d");
const DEGREE = Math.PI / 180;
let frames = 0;

const image = new Image(src = "../assets/pics/image-pack.png");
image.src = "../assets/pics/image-pack.png";

const sounds = {
    SCORE : new Audio(src = "../assets/sounds/score.wav"),
    FLAP : new Audio(src = "../assets/sounds/flap.wav"),
    HIT : new Audio(src = "../assets/sounds/hit.wav"),
    DIE : new Audio(src = "../assets/sounds/die.wav"),
    START : new Audio(src = "../assets/sounds/start.wav"),
}

const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

class Elements {
    constructor(sX, sY, w, h, x, y, noloop) {
        this.sX = sX || 0
        this.sY = sY || 0
        this.w = w || window.innerWidth
        this.h = h || window.innerHeight
        this.x = x || 0
        this.y = y || 0
        this.noloop = noloop || 0
    }
    draw() {
        for (let i = 0; i < window.innerWidth; i += this.w) {
           cx.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + i, this.y, this.w, this.h)
           if (this.noloop) {
                break;
           }
        }
    }
}

class MotionElements extends Elements{
    constructor(sX, sY, w, h, x, y, noloop, dx) {
        super(sX, sY, w, h, x, y, noloop);
        this.dx = dx || 0;
    }
    update() {
        this.x = (this.x - this.dx) % (this.w/2);
    }
}

class Score {
    constructor (fill_style = "#FFFFFF", stroke_style = "#000000", cur_font = "35px IMPACT", end_font = "25px IMPACT", cur_position, end_position1, end_position2) {
        this.fill_style = fill_style
        this.stroke_style = stroke_style
        this.cur_font = cur_font
        this.end_font = end_font
        this.cur_position = cur_position || 50
        this.end_position1 = end_position1 || 186
        this.end_position2 = end_position1 || 228
    }
    best = parseInt(localStorage.getItem("best")) || 0
    value = 0
    lineWidth = 2
    draw(){
        cx.fillStyle = this.fill_style
        cx.strokeStyle = this.stroke_style

        
        if(state.current == state.game){
            cx.lineWidth = this.lineWidth;
            cx.font = this.cur_font;

            cx.fillText(this.value, canvas.width/2, this.cur_position)
            cx.strokeText(this.value, canvas.width/2, this.cur_position)

        }else if(state.current == state.over){
            cx.font = this.end_font;

            cx.fillText(this.value, canvas.width/2, this.end_position1)
            cx.strokeText(this.value, canvas.width/2, this.end_position1)

            cx.fillText(this.best, canvas.width/2, this.end_position2)
            cx.strokeText(this.best, canvas.width/2, this.end_position2)
        }
    }
}

class Pipes {
    position = []
    constructor(topXY, bottomXY, w, h, dx, gap, maxYPos){
        this.top = topXY || {
            sX : 553,
            sY : 0,
        }
        this.bottom = bottomXY || {
            sX : 502,
            sY : 0,
        }
        this.w = w || 53
        this.h = h || 700
        this.dx = dx || 2
        this.gap = gap || 80
        this.maxYPos = maxYPos || -200
    }
    draw(){
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i]
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            cx.drawImage(image, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h)
            cx.drawImage(image, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)

        }
    }
    update(){
        if(state.current != state.game) return;
        if(frames % 100 == 0){
            this.position.push({
                x: canvas.width ,
                y: this.maxYPos * (Math.random() + 1) - 100
            })
        }

        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i]
            p.x -= this.dx

            let bottomPipesPos = p.y + this.h + this.gap;

            if(bird.x + bird.radius > p.x  && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y
                && bird.y - bird.radius < p.y + this.h ){
                    sounds.HIT.play()
                    state.current = state.over;
            }

            if(bird.x + bird.radius > p.x  && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipesPos
                && bird.y - bird.radius < bottomPipesPos + this.h ){
                    sounds.HIT.play()
                    state.current = state.over;
            }

            if(p.x + this.w <= 0){
                this.position.shift()
                score.value += 1;
                sounds.SCORE.play()
                score.best = Math.max(score.value, score.best)
                localStorage.setItem("best", score.best)
            }
        }

    }
}

class Bird {
    constructor(bird_states, w, h, x, y, speed, gravity, animationIndex, rotation, jump, radius) {
        this.animation = bird_states || [
            {sX: 276, sY: 112},
            {sX: 276, sY: 139},
            {sX: 276, sY: 164},
            {sX: 276, sY: 139},
        ]
        this.w = w || 34
        this.h = h || 26
        this.x = x || 50
        this.y = y || 150
        this.speed = speed || 0
        this.gravity = gravity || 0.25
        this.animationIndex = animationIndex || 0
        this.rotation = rotation || 0
        this.jump = jump || 4.5
        this.radius = radius || 12
    }
    draw() {
        let bird = this.animation[this.animationIndex]
        cx.save();
        cx.translate(this.x, this.y);
        cx.rotate(this.rotation);
        cx.drawImage(image, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h)
        cx.restore();
    }
    update() {
        let period = state.current == state.getReady ? 10 : 5;
        this.animationIndex += frames % period == 0 ? 1 : 0;
        this.animationIndex = this.animationIndex % this.animation.length
        if(state.current == state.getReady){
            this.y = 150;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            if(this.speed < this.jump){
                this.rotation = - 25 * DEGREE;
            }else{
                this.rotation = 90 * DEGREE;
            }
        }

        if(this.y + this.h/2 >= canvas.height - fg.h){
            this.y = canvas.height - fg.h - this.h/2;
            this.animationIndex = 1;
            if(state.current == state.game){
                sounds.DIE.play();
                state.current = state.over;
            }
        }
    }
    flap() {
        this.speed = - this.jump;
    }
}

let bg = new Elements(sX = 0, sY = 0, w = 275, h = 226, x = 0, y = canvas.height - 226);
let fg = new MotionElements(sX = 276, sY = 0, w = 224, h = 112, x = 0, y = canvas.height - 112);
let getReady = new Elements(sX = 0, sY = 228, w = 173, h = 152, x = canvas.width/2 - 173/2, y = 80, noloop = 1)
let gameOver = new Elements(sX = 175, sY = 228, w = 225, h = 202, x = canvas.width/2 - 225/2, y = 90, noloop = 1)
let score = new Score();
let pipes = new Pipes();
let bird = new Bird();

function clickHandler(){
    switch (state.current) {
        case state.getReady:
            sounds.START.play()
            state.current = state.game;
            break;
        case state.game:
            sounds.FLAP.play()
            bird.flap();
            break;
        default:
            bird.speed = 0;
            bird.rotation = 0;
            pipes.position = [];
            score.value = 0;
            state.current = state.getReady;
            break;
        }
    }
    document.addEventListener("click", clickHandler)
    document.addEventListener("keydown", function(e){
    if(e.which){
        clickHandler();
    }
})

function update(){
    bird.update();
    if(state.current == state.game){
        fg.update();
    }
    pipes.update();
}

function draw(){
    cx.fillStyle = "#70C5CE"
    cx.fillRect(0, 0, canvas.width, canvas.height)
    bg.draw()
    pipes.draw()
    fg.draw()
    bird.draw()
    if(state.current == state.getReady) {
        getReady.draw()
    }
    if(state.current == state.over){
        gameOver.draw()
    }
    score.draw()
}

function main(){
    update()
    draw()
    frames ++;
    requestAnimationFrame(main)
}

main()