const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let particleCount = 1000;
const mouse = {
    x: null,
    y: null,
    radius: 150
};

const particleCountSlider = document.getElementById('particleCount');
const mouseRadiusSlider = document.getElementById('mouseRadius');
const resetButton = document.getElementById('resetButton');

particleCountSlider.addEventListener('input', (event) => {
    particleCount = event.target.value;
    init();
});

mouseRadiusSlider.addEventListener('input', (event) => {
    mouse.radius = event.target.value;
});

resetButton.addEventListener('click', () => {
    particleCountSlider.value = 1000;
    mouseRadiusSlider.value = 150;
    particleCount = 1000;
    mouse.radius = 150;
    init();
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.vx = 0;
        this.vy = 0;
        this.radius = 2;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }

    update() {
        // mouse interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }

        // Wall collision
        if (this.x < this.radius) {
            this.x = this.radius;
        } else if (this.x > canvas.width - this.radius) {
            this.x = canvas.width - this.radius;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
        } else if (this.y > canvas.height - this.radius) {
            this.y = canvas.height - this.radius;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

function init() {
    particles = [];
    grid = new Grid();
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

const connect_distance = 40;
class Grid {
    constructor() {
        this.cellSize = connect_distance;
        this.width = Math.ceil(canvas.width / this.cellSize);
        this.height = Math.ceil(canvas.height / this.cellSize);
        this.grid = new Array(this.width * this.height).fill(null).map(() => []);
    }

    add(particle) {
        let x = Math.floor(particle.x / this.cellSize);
        let y = Math.floor(particle.y / this.cellSize);
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y * this.width + x].push(particle);
        }
    }

    getNearbyParticles(particle) {
        let x = Math.floor(particle.x / this.cellSize);
        let y = Math.floor(particle.y / this.cellSize);
        let nearby = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let nx = x + i;
                let ny = y + j;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    nearby.push(...this.grid[ny * this.width + nx]);
                }
            }
        }
        return nearby;
    }
}

let grid;

function connect() {
    let opacityValue = 1;
    for (const particle of particles) {
        const nearby = grid.getNearbyParticles(particle);
        for (const other of nearby) {
            if (particle === other) continue;
            let dx = particle.x - other.x;
            let dy = particle.y - other.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connect_distance) {
                opacityValue = 1 - (distance / connect_distance);
                ctx.strokeStyle = 'rgba(255,255,255,' + opacityValue + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    grid = new Grid();
    for (const particle of particles) {
        particle.update();
        grid.add(particle);
        particle.draw();
    }

    connect();

    requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});
