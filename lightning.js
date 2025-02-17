class Lightning {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.letters = "I Love U Valeria".split('');
        this.letterPoints = {};
        this.visiblePoints = {};
        this.currentLightnings = {};
        this.lastPoints = {};
        this.completedLetters = new Set();
        this.animate = this.animate.bind(this);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createText() {
        this.ctx.font = "bold 48px Arial";
        const totalText = this.letters.join('');
        const totalMetrics = this.ctx.measureText(totalText);
        let currentX = (this.canvas.width - totalMetrics.width) / 2 - 20;
        const y = this.canvas.height * 0.25;

        this.letters.forEach((letter, index) => {
            const metrics = this.ctx.measureText(letter);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "white";
            this.ctx.fillText(letter, currentX, y);

            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.letterPoints[index] = [];
            this.visiblePoints[index] = new Set();

            for (let py = 0; py < this.canvas.height; py += 2) {
                for (let px = 0; px < this.canvas.width; px += 2) {
                    const i = (py * this.canvas.width + px) * 4;
                    if (imageData.data[i] > 0) {
                        this.letterPoints[index].push({ 
                            x: px, 
                            y: py,
                            baseX: currentX,
                            letterWidth: metrics.width
                        });
                    }
                }
            }

            currentX += metrics.width + 10;
        });

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    createLightning(start, end) {
        let points = [start];
        let curr = start;
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const t = (i + 1) / segments;
            const x = start.x + (end.x - start.x) * t + (Math.random() - 0.5) * 15;
            const y = start.y + (end.y - start.y) * t + (Math.random() - 0.5) * 15;
            points.push({ x, y });
        }
        points.push(end);
        return points;
    }

    drawLightning(points, alpha = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#fff';
        this.ctx.shadowBlur = 20;
        this.ctx.stroke();

        for (let i = 1; i < points.length - 1; i++) {
            if (Math.random() < 0.2) {
                const branchLength = Math.random() * 15 + 5;
                const angle = Math.random() * Math.PI * 2;
                const endX = points[i].x + Math.cos(angle) * branchLength;
                const endY = points[i].y + Math.sin(angle) * branchLength;
                
                this.ctx.beginPath();
                this.ctx.moveTo(points[i].x, points[i].y);
                this.ctx.lineTo(endX, endY);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    }

    drawVisiblePoints(letterIndex) {
        this.ctx.shadowColor = '#fff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        for (let pointKey of this.visiblePoints[letterIndex]) {
            const [x, y] = pointKey.split(',').map(Number);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawCompletedLetter(letterIndex) {
        const letter = this.letters[letterIndex];
        const points = this.letterPoints[letterIndex];
        if (points && points.length > 0) {
            this.ctx.font = "bold 48px Arial";
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`;
            this.ctx.shadowColor = '#fff';
            this.ctx.shadowBlur = 15;
            this.ctx.fillText(letter, points[0].baseX, this.canvas.height * 0.25);

            if (Math.random() < 0.3) {
                const baseX = points[0].baseX;
                const baseY = this.canvas.height * 0.25;
                const width = points[0].letterWidth;

                for (let i = 0; i < 2; i++) {
                    const start = {
                        x: baseX + Math.random() * width,
                        y: baseY - 30 + Math.random() * 60
                    };
                    const end = {
                        x: start.x + (Math.random() - 0.5) * 30,
                        y: start.y + (Math.random() - 0.5) * 30
                    };
                    const lightning = this.createLightning(start, end);
                    this.drawLightning(lightning, 0.2);
                }
            }
        }
    }

    findNextPoint(letterIndex, currentPoint) {
        const points = this.letterPoints[letterIndex];
        if (!points || points.length === 0) return null;

        if (!currentPoint) {
            const topPoints = points.filter(p => 
                !this.visiblePoints[letterIndex].has(`${p.x},${p.y}`)
            );
            return topPoints[Math.floor(Math.random() * topPoints.length)];
        }

        const radius = 20;
        const possiblePoints = points.filter(p => {
            if (this.visiblePoints[letterIndex].has(`${p.x},${p.y}`)) return false;
            const dx = p.x - currentPoint.x;
            const dy = p.y - currentPoint.y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });

        if (possiblePoints.length > 0) {
            return possiblePoints[Math.floor(Math.random() * possiblePoints.length)];
        }

        const remainingPoints = points.filter(p => 
            !this.visiblePoints[letterIndex].has(`${p.x},${p.y}`)
        );
        return remainingPoints[Math.floor(Math.random() * remainingPoints.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.letters.forEach((_, index) => {
            if (this.completedLetters.has(index)) {
                this.drawCompletedLetter(index);
            } else {
                this.drawVisiblePoints(index);

                if (!this.currentLightnings[index]) {
                    const nextPoint = this.findNextPoint(index, this.lastPoints[index]);
                    if (nextPoint) {
                        const start = this.lastPoints[index] || { 
                            x: nextPoint.x, 
                            y: Math.max(0, nextPoint.y - 100) 
                        };
                        this.currentLightnings[index] = {
                            points: this.createLightning(start, nextPoint),
                            progress: 0,
                            target: nextPoint
                        };
                    } else {
                        this.completedLetters.add(index);
                    }
                }

                if (this.currentLightnings[index]) {
                    this.currentLightnings[index].progress += 0.2;

                    const visiblePoints = this.currentLightnings[index].points.slice(
                        0,
                        Math.ceil(this.currentLightnings[index].points.length * 
                        this.currentLightnings[index].progress)
                    );

                    this.drawLightning(visiblePoints);

                    if (this.currentLightnings[index].progress >= 1) {
                        const target = this.currentLightnings[index].target;
                        this.visiblePoints[index].add(`${target.x},${target.y}`);
                        this.lastPoints[index] = target;
                        this.currentLightnings[index] = null;
                    }
                }
            }
        });

        requestAnimationFrame(this.animate);
    }

    start() {
        this.createText();
        this.letters.forEach((_, index) => {
            this.visiblePoints[index] = new Set();
            this.currentLightnings[index] = null;
            this.lastPoints[index] = null;
        });
        this.completedLetters.clear();
        this.animate();
    }
}

// Создаем глобальную переменную для доступа к эффекту
let lightningEffect;

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const lightningCanvas = document.getElementById('lightning-canvas');
    lightningEffect = new Lightning(lightningCanvas);

    // Добавляем обработчик для кнопки
    const magicButton = document.querySelector('.magic-button');
    if (magicButton) {
        magicButton.addEventListener('click', () => {
            // Запускаем эффект молний
            lightningEffect.start();
            
            // Скрываем кнопку
            magicButton.style.display = 'none';
            
            // Устанавливаем размер canvas на весь экран
            lightningCanvas.style.width = '100vw';
            lightningCanvas.style.height = '100vh';
            lightningEffect.resizeCanvas();
        });
    }
});