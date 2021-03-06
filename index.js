const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Sets canvas size
canvas.width = innerWidth
canvas.height = innerHeight

// Global variable to set position of object
const canw = canvas.width / 2
const canh = canvas.height / 2

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

// Draws player to screen, sets player size and color
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

// Draws bullets to screen, sets size, color, and speed
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

// Draws enimies to screen, sets size, color and speed
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99

// Particle effect for enemy shrinking and elimination
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x = this.velocity.x * friction
        this.velocity.y = this.velocity.y * friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

// Sets class player arguments
let player = new Player(canw, canh, 15, 'white')

// Projectiles array
let projectiles = []

// Enemies array
let enemies = []

// Particle array
let particles = []

function init() {
    player = new Player(canw, canh, 15, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score

}

// Draws enemies to screen
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 5) + 5
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius 
            y = Math.random() * canvas.height
                
        } else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canh - y, canw - x)
        const velocity = {x: Math.cos(angle),y: Math.sin(angle)}
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1500)
}

let animationId
let score = 0

// Creates an animation
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
            
        } else{
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {projectile.update()

        // Removes bullets from outside screen to make FPS faster and the game run more smooth
        if (projectile.x + projectile.radius < 0 ||
             projectile.x - projectile.radius > canvas.width ||
              projectile.y + projectile.radius < 0 ||
               projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy, index) => {enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // If enemy hits player
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }
    projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

        // If bullet hits enemy, remove from screen
        if (dist - enemy.radius - projectile.radius < 1) {

            for (let i = 0; i < enemy.radius * 2; i++) {
                particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, 
                    {x: (Math.random() - 0.5) * (Math.random() * 6),
                     y: (Math.random() - 0.5) * (Math.random() * 6)}
                     ))
            }

            if (enemy.radius - 10 > 5) {
                // Score
                score += 50
                scoreEl.innerHTML = score

                gsap.to(enemy, {
                    radius : enemy.radius - 10
                })
                setTimeout(() => {
                    projectiles.splice(projectileIndex, 1)
                }, 0)
            } else {
            setTimeout(() => {
                score += 100
                scoreEl.innerHTML = score
                enemies.splice(index, 1)
                projectiles.splice(projectileIndex, 1)
            }, 0)
            }
        }
        });
    })
}

// Listens for click to spawn bullets
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canh, event.clientX - canw)
    const velocity = {x: Math.cos(angle) * 5,y: Math.sin(angle) * 5}
    projectiles.push(new Projectile(canw, canh, 5, 'grey', velocity))
})

startGameBtn.addEventListener('click', () => {
    init()
    // Calls animate function
    animate()
    // Calls spawnEnemies function
    spawnEnemies()
    modalEl.style.display = 'none'
})