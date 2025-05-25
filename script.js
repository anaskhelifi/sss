const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w, h, hw, hh;

const opts = {
    strings: ['HAPPY', 'MOTHER\'S', 'DAY'],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,
    cx: w / 2,
    cy: h / 2,
    fireworkSpawnTime: 300,
    fireworkBaseLineWidth: 3,
    fireworkAddedLineWidth: 8,
    fireworkSpawnRadius: 5,
    fireworkBaseReachTime: 60,
    fireworkAddedReachTime: 40,
    fireworkLetterBaseSize: 20,
    fireworkLetterAddedSize: 8,
    fireworkLetterBaseTime: 180,
    fireworkLetterAddedTime: 120,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 800,
    balloonSpawnTime: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseSize: 12,
    balloonAddedSize: 20,
    balloonBaseTime: 40,
    balloonAddedTime: 40
};

const calc = {
    totalWidth: 0,
    totalHeight: 0
};

const letters = [];
const fireworks = [];
const balloons = [];
let animationComplete = false;

function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.dx = -ctx.measureText(char).width / 2;
    this.dy = +opts.charSize / 2;
    this.fireworkDy = this.y - hh;

    const hue = (x / calc.totalWidth) * 360;
    this.color = `hsl(${hue}, 80%, 50%)`;
    this.lightColor = `hsl(${hue}, 80%, 80%)`;
    this.alphaColor = `hsla(${hue}, 80%, 50%, alp)`;
    this.reset();
}

Letter.prototype.reset = function() {
    this.phase = 'firework';
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
    this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[hw, h]];
};

Letter.prototype.step = function() {
    if (this.phase === 'firework') {
        if (!this.spawned) {
            ++this.tick;
            if (this.tick >= this.spawningTime) {
                this.tick = 0;
                this.spawned = true;
            }
        } else {
            ++this.tick;

            const proportion = this.tick / this.reachTime;
            const x = hw + proportion * (this.x - hw);
            const y = h - proportion * (h - this.y);
            this.prevPoints.push([x, y]);

            if (this.tick >= this.reachTime) {
                this.phase = 'balloon';
                this.tick = 0;
                this.prevPoints = [];
                this.spawnBalloon();
            }
        }
    } else if (this.phase === 'balloon') {
        this.tick++;
        if (this.tick > opts.balloonBaseTime + opts.balloonAddedTime * Math.random()) {
            this.phase = 'done';
        }
    }
};

Letter.prototype.spawnBalloon = function() {
    balloons.push(new Balloon(this.x, this.y, this.color));
};

Letter.prototype.draw = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = `${opts.charSize}px Arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (this.phase === 'firework' && this.spawned) {
        const lastPoint = this.prevPoints[this.prevPoints.length - 1];
        ctx.fillText(this.char, lastPoint[0], lastPoint[1]);
    } else if (this.phase === 'balloon') {
        ctx.fillText(this.char, this.x, this.y);
    } else if (this.phase === 'done') {
        ctx.fillText(this.char, this.x, this.y);
    }
    ctx.restore();
};

function Balloon(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random();
    this.velY = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
    this.alpha = 1;
}

Balloon.prototype.step = function() {
    this.y -= this.velY;
    this.alpha -= 0.01;
    if (this.alpha < 0) this.alpha = 0;
};

Balloon.prototype.draw = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

function setup() {
    w = window.innerWidth;
    h = window.innerHeight;
    hw = w / 2;
    hh = h / 2;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    letters.length = 0;
    balloons.length = 0;

    // Calculate total width for centering
    calc.totalWidth = 0;
    for (let i = 0; i < opts.strings.length; i++) {
        calc.totalWidth = Math.max(calc.totalWidth, ctx.measureText(opts.strings[i]).width);
    }

    // Create letters array for all strings
    let yPos = hh - (opts.strings.length - 1) * opts.lineHeight / 2;
    for (let line = 0; line < opts.strings.length; line++) {
        const str = opts.strings[line];
        const width = ctx.measureText(str).width;
        let xPos = hw - width / 2;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            letters.push(new Letter(char, xPos + ctx.measureText(str.substring(0, i)).width + opts.charSpacing/2, yPos));
        }
        yPos += opts.lineHeight;
    }
}

function animate() {
    ctx.clearRect(0, 0, w, h);

    letters.forEach(letter => {
        letter.step();
        letter.draw(ctx);
    });

    balloons.forEach((balloon, index) => {
        balloon.step();
        balloon.draw(ctx);
        if (balloon.alpha <= 0) {
            balloons.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    setup();
});

setup();
animate();
