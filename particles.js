const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = 300;
canvas.height = 300;

let mouse = {
    x: undefined,
    y: undefined,
    radius: 50
};

canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

canvas.addEventListener('mouseleave', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        while (!this.isInsideHeart(this.x, this.y)) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(255, ${Math.random() * 50 + 150}, ${Math.random() * 50 + 150}, 0.8)`;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
    }

    isInsideHeart(x, y) {
        x = (x - canvas.width/2) / (canvas.width/4);
        y = -(y - canvas.height/2) / (canvas.height/4);
        let equation = Math.pow((x*x + y*y - 1), 3) - x*x*y*y*y;
        return equation <= 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = dx / distance;
                const directionY = dy / distance;
                this.speedX -= directionX * force * 2;
                this.speedY -= directionY * force * 2;
            }
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (!this.isInsideHeart(this.x, this.y)) {
            const angle = Math.atan2(this.y - canvas.height/2, this.x - canvas.width/2);
            this.x = this.x - Math.cos(angle) * 2;
            this.y = this.y - Math.sin(angle) * 2;
            this.speedX = -this.speedX * 0.5;
            this.speedY = -this.speedY * 0.5;
        }

        this.speedX += (Math.random() - 0.5) * 0.2;
        this.speedY += (Math.random() - 0.5) * 0.2;

        const maxSpeed = 2;
        const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        if (speed > maxSpeed) {
            this.speedX = (this.speedX / speed) * maxSpeed;
            this.speedY = (this.speedY / speed) * maxSpeed;
        }
    }
}

const particles = [];

function init() {
    particles.length = 0;
    for (let i = 0; i < 1000; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

init();
animate();