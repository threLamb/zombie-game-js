const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 650

const Asset = {
    assets: [
        { type: 'image', name: 'background', src: './image/background.png' },
        { type: 'image', name: 'player', src: './image/player.png' },

        { type: 'image', name: 'transporter', src: './image/transporter.png' },
        { type: 'image', name: 'zombie', src: './image/zombie.png' },
        { type: 'image', name: 'chainsawZombie', src: './image/chainsawZombie.png' },
        { type: 'image', name: 'agent', src: './image/agent.png' },
        { type: 'image', name: 'gatlingGunner', src: './image/gatlingGunner.png' },
        { type: 'image', name: 'necromancer', src: './image/necromancer.png' },
        { type: 'image', name: 'bomber', src: './image/bomber.png' },

        { type: 'image', name: 'handGunBullet', src: './image/handGunBullet.png' },
        { type: 'image', name: 'machineGunBullet', src: './image/machineGunBullet.png' },
        { type: 'image', name: 'sniperRifleBullet', src: './image/sniperRifleBullet.png' },
        { type: 'image', name: 'enemyBullet', src: './image/enemyBullet.png' },
        { type: 'image', name: 'gatlingGunBullet', src: './image/gatlingGunBullet.png' },
        { type: 'image', name: 'grenade2', src: './image/grenade2.png' },

        { type: 'image', name: 'handGun', src: './image/handGun.png' },
        { type: 'image', name: 'machineGun', src: './image/machineGun.png' },
        { type: 'image', name: 'sniperRifle', src: './image/sniperRifle.png' },
        { type: 'image', name: 'grenade', src: './image/grenade.png' },

        { type: 'image', name: 'magicCircle', src: './image/magicCircle.png' },
        { type: 'image', name: 'explosion', src: './image/explosion.png' }
    ],
    images: {} // 読み込んだ画像
}

const canvas = document.getElementById("canvas")
canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
const ctx = canvas.getContext("2d")

class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Timer {
    constructor(time) {
        this.waitingTime = time //目標時間
        this.elapsedTime = 0
    }

    isRunning(progress) { //タイマーが実行中かを返し、タイマー進める                
        this.elapsedTime += progress //タイマーを進める  
        if (this.elapsedTime >= this.waitingTime){//目標時間が経過した場合
            this.elapsedTime = this.waitingTime
            return false
        }

        return true
    }

    getProgressRate() {
        return this.elapsedTime / this.waitingTime
    }
}

const playerInput = {
    Up: false,
    Right: false,
    Down: false,
    Left: false,
    Enter:false,
    Change: false,
    Grenade: false,
    mouseClicked: false,
    mousePointer: new Vector2(0, 0)
}

document.addEventListener("keydown", e => {
    if (e.key === "w")
        playerInput.Up = true
    else if (e.key === "a")
        playerInput.Left = true
    else if (e.key === "s")
        playerInput.Down = true
    else if (e.key === "d")
        playerInput.Right = true
    else if (e.key === "e")
        playerInput.Change = true
    else if (e.key === "r")
        playerInput.Grenade = true
    else if(e.key == "Enter")
        playerInput.Enter = true
})
document.addEventListener("keyup", e => {
    if (e.key === "w")
        playerInput.Up = false
    else if (e.key === "a")
        playerInput.Left = false
    else if (e.key === "s")
        playerInput.Down = false
    else if (e.key === "d")
        playerInput.Right = false
    else if (e.key === "e")
        playerInput.Change = false
    else if (e.key === "r")
        playerInput.Grenade = false
    else if(e.key == "Enter")
        playerInput.Enter = false
})

document.addEventListener("mousedown", e => {
    playerInput.mouseClicked = true
})
document.addEventListener("mouseup", e => {
    playerInput.mouseClicked = false
})

document.addEventListener("mousemove", e => {// マウス座標を取得
    const rect = canvas.getBoundingClientRect()
    playerInput.mousePointer.x = e.clientX - rect.left
    playerInput.mousePointer.y = e.clientY - rect.top
})

class Sprite {
    z = 0
    hp = 1
    speed = 0
    angle = 0
    destroyed = false
    point = 50
    constructor(image) {
        this.position = new Vector2(0, 0)
        this.image = image
        this.imageWidth = this.image.width
        this.imageHeight = this.image.height
    }

    getSpriteCenterPosition() {
        return new Vector2(this.position.x + this.imageWidth / 2, this.position.y + this.imageHeight / 2)
    }

    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save();
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.imageWidth / 2, -this.imageHeight / 2)
        ctx.restore();
    }

    update() {
        this.healthCheck()
    }

    healthCheck() {
        if (this.hp <= 0) {
            this.destroyed = true
        }
    }
}

const PLAYER_MAX_HP = 100
class Player extends Sprite {
    weaponList = [
        {
            bulletSpeed: 1500,
            bulletHp: 5,
            bulletFiringRange: 700,
            coolTime: 0.3,
            coolTimer: new Timer(0),
            bulletImage: Asset.images["handGunBullet"],
            weaponImage: Asset.images["handGun"]
        },
        {
            bulletSpeed: 1600,
            bulletHp: 3,
            bulletFiringRange: 300,
            coolTime: 0.15,
            coolTimer: new Timer(0),
            bulletImage: Asset.images["machineGunBullet"],
            weaponImage: Asset.images["machineGun"]
        },
        {
            bulletSpeed: 2000,
            bulletHp: 70,
            bulletFiringRange: 1500,
            coolTime: 4,
            coolTimer: new Timer(0),
            bulletImage: Asset.images["sniperRifleBullet"],
            weaponImage: Asset.images["sniperRifle"]
        }
    ]
    constructor() {
        super(Asset.images["player"])
        this.position = new Vector2((CANVAS_WIDTH - this.imageWidth) / 2, (CANVAS_HEIGHT - this.imageHeight) / 2)
        this.speed = 350
        this.hp = PLAYER_MAX_HP

        this.weaponNumber = 0
        this.weaponMaxNumber = this.weaponList.length - 1
        this.grenadeTimer = new Timer(0)
    }

    getOffsetPosition() {
        return new Vector2(this.position.x - (CANVAS_WIDTH - this.imageWidth) / 2, this.position.y - (CANVAS_HEIGHT - this.imageHeight) / 2)
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.imageWidth / 2, -this.imageHeight / 2)
        ctx.restore();

    }

    update(progress) {
        //移動
        let offsetPosition = this.getOffsetPosition()
        if (playerInput.Up && offsetPosition.y > -(fieldHeight - this.imageHeight) / 2) {
            this.position.y -= this.speed * progress
        }
        if (playerInput.Down && offsetPosition.y < (fieldHeight - this.imageHeight) / 2) {
            this.position.y += this.speed * progress
        }
        if (playerInput.Right && offsetPosition.x < (fieldWidth - this.imageWidth) / 2) {
            this.position.x += this.speed * progress
        }
        if (playerInput.Left && offsetPosition.x > -(fieldWidth - this.imageWidth) / 2) {
            this.position.x -= this.speed * progress
        }

        //向き
        this.angle = Math.atan2(playerInput.mousePointer.y - CANVAS_HEIGHT / 2, playerInput.mousePointer.x - CANVAS_WIDTH / 2)

        //武器の切り替え
        if (playerInput.Change) {
            playerInput.Change = false
            this.weaponNumber++
            if (this.weaponNumber > this.weaponMaxNumber) {
                this.weaponNumber = 0
            }
        }

        let bulletPosition = new Vector2(
            this.position.x + this.imageWidth / 2 + Math.cos(this.angle) * 30,
            this.position.y + this.imageHeight / 2 + Math.sin(this.angle) * 30
        )

        //手榴弾
        if (!this.grenadeTimer.isRunning(progress) && playerInput.Grenade) {
            playerInput.Grenade = false
            this.grenadeTimer = new Timer(20)
            playerBulletList.push(new Grenade(200, 1, 230, bulletPosition, this.angle, Asset.images["grenade"]))
        }

        //弾丸の発射
        let weapon = this.weaponList[this.weaponNumber]
        for (let i = 0; i < this.weaponList.length; i++) {
            this.weaponList[i].coolTimer.isRunning(progress)
        }
        if (playerInput.mouseClicked && !weapon.coolTimer.isRunning(0)) {
            let bullet = new Bullet(weapon.bulletSpeed, weapon.bulletHp, weapon.bulletFiringRange, bulletPosition, this.angle, weapon.bulletImage)
            playerBulletList.push(bullet)
            weapon.coolTimer = new Timer(weapon.coolTime)

        }
    }
}

class Bullet extends Sprite {
    constructor(speed, hp, firingRange, position, angle, image) {
        super(image)
        this.position = new Vector2(position.x - this.imageWidth / 2, position.y - this.imageHeight / 2)
        this.speed = speed
        this.hp = hp
        this.firingRange = firingRange
        this.angle = angle
        this.firstPosition = structuredClone(position)
    }
    update(progress) {
        super.update()

        if ((this.firstPosition.x - this.position.x) ** 2 + (this.firstPosition.y - this.position.y) ** 2 > this.firingRange ** 2) {
            this.destroyed = true
            return
        }

        this.position.x += Math.cos(this.angle) * this.speed * progress
        this.position.y += Math.sin(this.angle) * this.speed * progress
    }
}

class Grenade extends Bullet {
    constructor(speed, hp, firingRange, position, angle, image) {
        super(speed, hp, firingRange, position, angle, image)
        this.imageAngle = 0
    }
    update(progress) {
        if ((this.firstPosition.x - this.position.x) ** 2 + (this.firstPosition.y - this.position.y) ** 2 > this.firingRange ** 2) {
            this.destroyed = true
            playerBulletList.push(new Explosion(100, this.position))
            return
        }
        this.position.x += Math.cos(this.angle) * this.speed * progress
        this.position.y += Math.sin(this.angle) * this.speed * progress
    }
    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save();
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y);
        ctx.rotate(this.imageAngle);
        ctx.drawImage(this.image, -this.imageWidth / 2, -this.imageHeight / 2)
        ctx.restore();

        this.imageAngle += 0.1
    }
}

class EnemyGrenade extends Grenade {
    update(progress) {
        if ((this.firstPosition.x - this.position.x) ** 2 + (this.firstPosition.y - this.position.y) ** 2 > this.firingRange ** 2) {
            this.destroyed = true
            enemyBulletList.push(new Explosion(20, this.position))
            return
        }
        this.position.x += Math.cos(this.angle) * this.speed * progress
        this.position.y += Math.sin(this.angle) * this.speed * progress
    }
}

class Explosion extends Bullet {
    constructor(explosionPower, position) {
        super(0, explosionPower, 0, position, 0, Asset.images["explosion"])
        this.imageWidth = this.image.width / 16
        this.imageHeight = this.image.height
        this.position = new Vector2(position.x - this.imageWidth / 2, position.y - this.imageHeight / 2)

        this.imageNumber = 0
    }

    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save();
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y);
        ctx.drawImage(this.image,
            this.imageNumber * this.imageWidth, 0,
            this.imageWidth, this.imageHeight,
            -this.imageWidth / 2, -this.imageHeight / 2,
            this.imageWidth, this.imageHeight
        )
        ctx.restore();
    }

    update(progress) {
        if (this.imageNumber > 15) {
            this.destroyed = true
            return
        }
        this.imageNumber++
    }
}

class Enemy extends Sprite {
    constructor(speed, hp, point, attackRange, attackPower, coolTime, image) {
        super(image)
        this.speed = speed
        this.hp = hp
        this.point = point
        this.attackRange = attackRange
        this.attackPower = attackPower
        this.coolTime = coolTime
        this.attackCoolTimer = new Timer(coolTime)
    }

    update(progress) {
        super.update()

        if (this.attackCoolTimer.isRunning(progress))
            return

        let playerPosition = player.getSpriteCenterPosition()
        let centerPosition = this.getSpriteCenterPosition() //このspriteの中心座標        

        this.angle = this.angle = Math.atan2(playerPosition.y - centerPosition.y, playerPosition.x - centerPosition.x)

        if (getDistance(playerPosition, centerPosition) < this.attackRange) {
            this.attack()
            return
        }

        this.position.x += Math.cos(this.angle) * this.speed * progress
        this.position.y += Math.sin(this.angle) * this.speed * progress
    }

    attack() {
        player.hp -= this.attackPower
        this.attackCoolTimer = new Timer(this.coolTime)
    }
}

class Zombie extends Enemy {
    constructor() {
        let speed = 100
        let hp = 15
        let point = 50
        let attackRange = 60
        let attackPower = 10
        let coolTime = 1.5

        super(speed, hp, point, attackRange, attackPower, coolTime, Asset.images["zombie"])
    }
}

class ChainsawZombie extends Enemy {
    constructor() {
        let speed = 400
        let hp = 35
        let point = 150
        let attackRange = 60
        let attackPower = 30
        let coolTime = 4.5

        super(speed, hp, point, attackRange, attackPower, coolTime, Asset.images["chainsawZombie"])

        this.moveTimer = new Timer(3)
    }

    update(progress) {
        this.healthCheck()

        let playerPosition = player.getSpriteCenterPosition()
        let centerPosition = this.getSpriteCenterPosition() //このspriteの中心座標        

        if (this.attackCoolTimer.isRunning(progress)) {
            this.angle = this.angle = Math.atan2(playerPosition.y - centerPosition.y, playerPosition.x - centerPosition.x)
        } else {
            if (getDistance(playerPosition, centerPosition) < this.attackRange) {
                this.attack()
                return
            }

            if (this.moveTimer.isRunning(progress)) {
                this.position.x += Math.cos(this.angle) * this.speed * progress
                this.position.y += Math.sin(this.angle) * this.speed * progress
            } else {
                this.attackCoolTimer = new Timer(this.coolTime)
                this.moveTimer = new Timer(2)
            }
        }
    }
}

class Agent extends Enemy {
    constructor() {
        let speed = 150
        let hp = 20
        let point = 70
        let attackRange = 500
        let attackPower = 5 //弾の攻撃力
        let coolTime = 3

        super(speed, hp, point, attackRange, attackPower, coolTime, Asset.images["agent"])
    }

    attack() {
        let bulletSpeed = 370
        let bulletHp = this.attackPower
        let bulletFiringRange = 750
        let bulletPosition = this.getSpriteCenterPosition()
        let bullet = new Bullet(bulletSpeed, bulletHp, bulletFiringRange, bulletPosition, this.angle, Asset.images["enemyBullet"])
        enemyBulletList.push(bullet)

        this.attackCoolTimer = new Timer(this.coolTime)
    }
}

class GatlingGuner extends Enemy {
    constructor() {
        let speed = 110
        let hp = 40
        let point = 200
        let attackRange = 400
        let attackPower = 2
        let coolTime = 0.1

        super(speed, hp, point, attackRange, attackPower, coolTime, Asset.images["gatlingGunner"])
    }

    attack() {
        let bulletSpeed = 465
        let bulletHp = this.attackPower
        let bulletFiringRange = 600
        let bulletPosition = this.getSpriteCenterPosition()
        let bullet = new Bullet(bulletSpeed, bulletHp, bulletFiringRange, bulletPosition, this.angle, Asset.images["gatlingGunBullet"])
        enemyBulletList.push(bullet)

        this.attackCoolTimer = new Timer(this.coolTime)
    }
}

class Bomber extends Enemy {
    constructor() {
        let speed = 150
        let hp = 30
        let point = 150
        let attackRange = 450
        let attackPower = 0
        let coolTime = 2

        super(speed, hp, point, attackRange, attackPower, coolTime, Asset.images["bomber"])
    }

    attack() {
        enemyBulletList.push(new EnemyGrenade(300, 0, getDistance(player.position, this.position) * 1.1, this.getSpriteCenterPosition(), this.angle, Asset.images["grenade2"]))
        this.attackCoolTimer = new Timer(this.coolTime)
    }
}

class Necromancer extends Enemy {
    constructor() {
        let speed = 90
        let hp = 30
        let point = 80
        let attackRange = 550
        let attackPower = 10
        let coolTime = 7

        super(speed, hp, point, attackRange, attackPower, coolTime, Asset.images["necromancer"])
    }

    attack() {
        let p = this.position

        let r = 100
        for (let i = 0; i < 3; i++) {
            let a = this.angle + i * (Math.PI / 3) * 2
            let zombieP = new Vector2(
                p.x + Math.cos(a) * r,
                p.y + Math.sin(a) * r
            )

            let zombie
            if (Math.floor(Math.random() * 3) == 0) {
                zombie = new ChainsawZombie()
            } else {
                zombie = new Zombie()
            }

            zombie.position = zombieP
            zombie.angle = this.angle
            effectList.push(new fadeInImageEnemy(zombie))
        }

        effectList.push(new MagicCircleEffect(this.getSpriteCenterPosition(), this.angle))

        this.attackCoolTimer = new Timer(this.coolTime)
    }
}

class Transporter extends Sprite {
    constructor(firstPosition, controllPosition, landingPosition, spawnList) {
        super(Asset.images["transporter"])
        this.position = firstPosition
        this.z = 1
        this.speed = 500
        this.firstPosition = structuredClone(firstPosition)
        this.controllPosition = controllPosition
        this.landingPosition = landingPosition

        let playerPosition = player.getSpriteCenterPosition()
        this.landingAngle = Math.atan2(playerPosition.y - landingPosition.y, playerPosition.x - landingPosition.x)

        this.spawnList = spawnList
        this.timer = new Timer(10)
        this.state = "flying"

        this.imageHeight /= 3
        this.imageNumber = 0
    }

    update(progress) {
        super.update()

        switch (this.state) {
            case "flying":
                if (this.timer.isRunning(progress)) {
                    let t = this.timer.getProgressRate()
                    this.position = new Vector2(//ベジェ曲線
                        ((1 - t) ** 2) * this.firstPosition.x + 2 * t * (1 - t) * this.controllPosition.x + (t ** 2) * this.landingPosition.x,
                        ((1 - t) ** 2) * this.firstPosition.y + 2 * t * (1 - t) * this.controllPosition.y + (t ** 2) * this.landingPosition.y
                    )

                    this.angle = this.landingAngle * t
                } else {
                    this.state = "landing"
                }
                break;
            case "landing":
                if (this.timer.isRunning(progress)) return

                if (this.spawnList.length > 0) {
                    let enemy = this.spawnList.pop()
                    let enemyPos = this.getSpriteCenterPosition()
                    let a = this.angle + Math.PI / 2 * this.spawnList.length
                    enemyPos.x += Math.cos(a) * 50 + Math.cos(this.angle) * 50
                    enemyPos.y += Math.sin(a) * 50 + Math.sin(this.angle) * 50
                    enemy.position = enemyPos
                    enemyList.push(enemy)

                    this.timer = new Timer(1)
                } else {
                    this.state = "returning"
                }
                break;
            case "returning":
                if (getDistance(this.position, player.position) < 1000) {
                    this.position.x += Math.cos(this.angle) * this.speed * progress
                    this.position.y += Math.sin(this.angle) * this.speed * progress
                } else {
                    this.state = "destroyed"
                }
                break;
            default:
                this.destroyed = true
                break;
        }
    }

    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save();
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image,
            0, this.imageNumber * this.imageHeight,
            this.imageWidth, this.imageHeight,
            -this.imageWidth / 2, -this.imageHeight / 2,
            this.imageWidth, this.imageHeight
        )
        ctx.restore();

        this.imageNumber++
        if (this.imageNumber > 2) this.imageNumber = 0
    }
}

class Background extends Sprite {
    constructor() {
        super(Asset.images["background"])
        this.position = new Vector2(-(this.imageWidth - CANVAS_WIDTH) / 2, -(this.imageHeight - CANVAS_HEIGHT) / 2)
        fieldWidth = this.imageWidth
        fieldHeight = this.imageHeight
    }
}

class fadeOutImageEffect extends Sprite {
    constructor(sprite) {
        super(sprite.image)
        this.position = sprite.position
        this.angle = sprite.angle
        this.effectTimer = new Timer(1)
    }

    update(progress) {
        if (!this.effectTimer.isRunning(progress)) {
            this.destroyed = true
        }
    }

    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save()
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y)
        ctx.rotate(this.angle)
        ctx.globalAlpha = 1 - this.effectTimer.getProgressRate()
        ctx.drawImage(this.image, -this.imageWidth / 2, -this.imageHeight / 2)
        ctx.restore()
    }
}

class fadeInImageEnemy extends Sprite {
    constructor(sprite) {
        super(sprite.image)
        this.position = sprite.position
        this.angle = sprite.angle
        this.effectTimer = new Timer(2)

        this.sprite = sprite
    }

    update(progress) {
        if (!this.effectTimer.isRunning(progress)) {
            this.destroyed = true
            enemyList.push(this.sprite)
        }
    }

    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save()
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y)
        ctx.rotate(this.angle)
        ctx.globalAlpha = this.effectTimer.getProgressRate()
        ctx.drawImage(this.image, -this.imageWidth / 2, -this.imageHeight / 2)
        ctx.restore()
    }
}

class MagicCircleEffect extends Sprite {
    constructor(position, angle) {
        super(Asset.images["magicCircle"])
        this.position = new Vector2(
            position.x - this.imageWidth / 2,
            position.y - this.imageHeight / 2,
        )
        this.angle = angle
        this.effectTimer = new Timer(7)
    }

    update(progress) {
        if (!this.effectTimer.isRunning(progress)) {
            this.destroyed = true
        }
    }

    draw(ctx, offset) {
        let centerPosition = this.getSpriteCenterPosition()
        ctx.save()
        ctx.translate(centerPosition.x + offset.x, centerPosition.y + offset.y)
        ctx.rotate(this.angle)

        let alpha
        let rate = this.effectTimer.getProgressRate()
        if (rate < 0.5) {
            alpha = 2 * rate
        } else {
            alpha = -2 * rate + 2
        }
        ctx.globalAlpha = alpha

        ctx.drawImage(this.image, -this.imageWidth / 2, -this.imageHeight / 2)
        ctx.restore()
    }
}

class HpUI {
    draw(ctx) {
        if (player.hp < 1) player.hp = 0

        ctx.save()
        ctx.strokeStyle = "rgb(38, 18, 18)"
        ctx.fillRect(20 - 2.5, CANVAS_HEIGHT - 40 - 2.5, 500 + 5, 20 + 5)
        ctx.fillStyle = "rgb(111, 198, 225)"
        ctx.fillRect(20, CANVAS_HEIGHT - 40, 500 * (player.hp / PLAYER_MAX_HP), 20)
        ctx.restore()
    }
}

class PointUI {
    point = 0
    draw(ctx) {
        ctx.save()
        ctx.fillStyle = "rgb(0, 0, 0)"
        ctx.textAlign = "right"
        ctx.font = "48px serif";
        ctx.fillText(this.point, 1150, 50);
        ctx.restore()
    }
}

class GameOverUI {    
    draw(ctx) {
        ctx.save()
        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.textAlign = "right"
        ctx.font = "55px serif";
        ctx.fillText("GAME OVER", (CANVAS_WIDTH + 35*9)/2, CANVAS_HEIGHT/2 - 100);
        ctx.fillStyle = "rgb(0, 0, 0)"
        ctx.font = "30px serif";
        ctx.fillText("Please enter to continue", (CANVAS_WIDTH + 14*24)/2, CANVAS_HEIGHT/2 -50);
        ctx.restore()
    }
}

class WeaponUI {
    draw(ctx) {
        let weapon = player.weaponList[player.weaponNumber]
        ctx.save()
        if (weapon.coolTimer.isRunning(0))
            ctx.globalAlpha = 0.7
        ctx.drawImage(weapon.weaponImage, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 75)
        ctx.restore()
    }
}

class GrenadeUI {
    draw(ctx) {
        if (player.grenadeTimer.isRunning(0))
            return

        let grenadeImage = Asset.images["grenade"]
        ctx.save()
        ctx.drawImage(grenadeImage, CANVAS_WIDTH / 2 + 500, CANVAS_HEIGHT - 60, grenadeImage.width * 2, grenadeImage.height * 2)
        ctx.restore()
    }
}

class GameManager {
    constructor() {
        this.transporterSpawnPositions = [
            new Vector2(-(fieldWidth - CANVAS_WIDTH) / 2, -(fieldHeight - CANVAS_HEIGHT) / 2),
            new Vector2(-(fieldWidth - CANVAS_WIDTH) / 2, (fieldHeight + CANVAS_HEIGHT) / 2),
            new Vector2((fieldWidth + CANVAS_WIDTH) / 2, -(fieldHeight - CANVAS_HEIGHT) / 2),
            new Vector2((fieldWidth + CANVAS_WIDTH) / 2, (fieldHeight + CANVAS_HEIGHT) / 2)
        ]

        this.intervalTimer = new Timer(0)
    }

    update(progress) {
        if (!this.intervalTimer.isRunning(progress) && enemyList.length < 12) {
            this.spawnTransporter(this.createSpawnList())
            this.intervalTimer = new Timer(5 + Math.floor(Math.random() * 7))
        }
    }

    createSpawnList() {
        let spawnList = []

        let randomNumber = Math.floor(Math.random() * 6)

        switch (randomNumber) {
            case 0:
                for (let i = 0; i < 4; i++) {
                    spawnList.push(new Zombie())
                }
                break;
            case 1:
                for (let i = 0; i < 2; i++) {
                    spawnList.push(new Zombie())
                }
                for (let i = 0; i < 2; i++) {
                    spawnList.push(new ChainsawZombie())
                }
                break;
            case 2:
                for (let i = 0; i < 3; i++) {
                    spawnList.push(new Agent())
                }
                break;
            case 3:
                spawnList.push(new Necromancer())
                for (let i = 0; i < 2; i++) {
                    spawnList.push(new Agent())
                }
                break;
            case 4:
                spawnList.push(new Agent())
                for (let i = 0; i < 2; i++) {
                    spawnList.push(new GatlingGuner())
                }
                break;
            case 5:
                for (let i = 0; i < 3; i++) {
                    spawnList.push(new Bomber())
                }
                break;
            default:
                for (let i = 0; i < 4; i++) {
                    spawnList.push(this.createRandomEnemy())
                }
                break;
        }

        return spawnList
    }

    createRandomEnemy() {
        let randomNumber = Math.floor(Math.random() * 4)

        let enemy
        switch (randomNumber) {
            case 1:
                enemy = new ChainsawZombie()
                break;
            case 2:
                enemy = new Agent()
                break;
            default:
                enemy = new Zombie()
                break;
        }
        return enemy
    }

    spawnTransporter(spawnList) {//spawnList:transpoterがスポーンさせる敵のリスト
        let playerPosition = player.getSpriteCenterPosition()
        //最も距離が近いスポーン地点以外の３つのスポーン地点からランダムでスポーン地点を選択
        let poslist = []
        let d = getDistance(this.transporterSpawnPositions[0], playerPosition)
        let c = 0
        for (let i = 1; i < this.transporterSpawnPositions.length; i++) {
            let distance = getDistance(this.transporterSpawnPositions[i], player.getSpriteCenterPosition())

            if (distance < d) {
                poslist.push(this.transporterSpawnPositions[c])
                d = distance
                c = i
            } else {
                poslist.push(this.transporterSpawnPositions[i])
            }
        }

        let firstPosition = poslist[Math.floor(Math.random() * (poslist.length))]

        //着陸地点の決定
        let randomAngle = Math.random() * 2 * Math.PI
        let landingPosition = new Vector2(
            playerPosition.x + Math.cos(randomAngle) * 450,
            playerPosition.y + Math.sin(randomAngle) * 450
        )
        //フィールド外にはみでて着陸しないように補正
        let margin = 500
        let minX = -(fieldWidth - CANVAS_WIDTH) / 2 + margin
        let maxX = (fieldWidth + CANVAS_WIDTH) / 2 - margin
        let minY = -(fieldHeight - CANVAS_HEIGHT) / 2 + margin
        let maxY = (fieldHeight + CANVAS_HEIGHT) / 2 - margin
        if (landingPosition.x < minX) {
            landingPosition.x = -landingPosition.x + 2 * minX
        } else if (landingPosition.x > maxX) {
            landingPosition.x = -landingPosition.x + 2 * maxX
        }
        if (landingPosition.y < minY) {
            landingPosition.y = -landingPosition.y + 2 * minY
        } else if (landingPosition.y > maxY) {
            landingPosition.y = -landingPosition.y + 2 * maxY
        }

        //制御点の決定
        let controllPosition = new Vector2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

        enemyList.unshift(new Transporter(firstPosition, controllPosition, landingPosition, spawnList))
    }
}

function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}
function isOffField(p) {
    if (p.x < -(fieldWidth - CANVAS_WIDTH) / 2 ||
        p.x > (fieldWidth + CANVAS_WIDTH) / 2 ||
        p.y < -(fieldHeight - CANVAS_HEIGHT) / 2 ||
        p.y > (fieldHeight + CANVAS_HEIGHT) / 2) {
        return true
    }
    return false
}

//当たり判定
function collisionDetect(s1, s2) {
    if (s1.position.x < s2.position.x + s2.imageWidth &&
        s2.position.x < s1.position.x + s1.imageWidth &&
        s1.position.y < s2.position.y + s2.imageHeight &&
        s2.position.y < s1.position.y + s1.imageHeight) {
        return true
    }

    return false
}

let gameManager
let player
let background

let fieldWidth
let fieldHeight

let gameOverFlag = false

let playerBulletList = []
let enemyList = []
let enemyBulletList = []
let effectList = []

let UI = {
    HP: new HpUI(),
    POINT: new PointUI(),
    WEAPON: new WeaponUI(),
    GRENADE: new GrenadeUI(),
    GAMEOVER: new GameOverUI()
}

function init() {
    // アセットの読み込み
    Asset.loadAssets = function (onComplete) {
        let total = Asset.assets.length; // アセットの合計数
        let loadCount = 0; // 読み込み完了したアセット数

        // アセットが読み込み終わった時に呼ばれるコールバック関数
        let onLoad = function () {
            loadCount++; // 読み込み完了数を1つ足す
            if (loadCount >= total) {
                // すべてのアセットの読み込みが終わった
                onComplete();
            }
        };

        // すべてのアセットを読み込む
        Asset.assets.forEach(function (asset) {
            switch (asset.type) {
                case 'image':
                    Asset._loadImage(asset, onLoad);
                    break;
            }
        });
    }

    // 画像の読み込み
    Asset._loadImage = function (asset, onLoad) {
        let image = new Image();
        image.src = asset.src;
        image.onload = onLoad;
        Asset.images[asset.name] = image;
    }
    Asset.loadAssets(function () {// アセットがすべて読み込み終わった時        
        player = new Player()
        background = new Background()
        gameManager = new GameManager()

        /*
                let enemy = new Bomber()
                enemy.position = new Vector2(0, 0)
                enemyList.push(enemy)
        */

        window.requestAnimationFrame(loop)
    })
}

init()

function reset(){
    player = new Player()
    background = new Background()
    gameManager = new GameManager()        

    gameOverFlag = false

    playerBulletList = []
    enemyList = []
    enemyBulletList = []
    effectList = []    

    UI.POINT.point = 0
}

function update(progress) {
    if (gameOverFlag){
        if(playerInput.Enter){
            reset()
        }    
        return
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)    
    
    let p = player.getOffsetPosition()
    let offset = new Vector2(-p.x, -p.y)

    background.draw(ctx, offset)

    player.update(progress);
    player.draw(ctx)

    gameManager.update(progress)

    //エフェクトの更新
    for (var i = effectList.length - 1; i >= 0; i--) {
        effectList[i].update(progress)
        effectList[i].draw(ctx, offset)

        if (effectList[i].destroyed) {
            effectList.splice(i, 1) //削除
        }
    }

    //playerの弾丸の更新
    for (var i = playerBulletList.length - 1; i >= 0; i--) {
        //敵とplayerの弾丸との当たり判定
        for (var j = enemyList.length - 1; j >= 0; j--) {
            if (collisionDetect(enemyList[j], playerBulletList[i]) && enemyList[j].z == playerBulletList[i].z) {
                let bulletHp = playerBulletList[i].hp >= 0 ? playerBulletList[i].hp : 0
                playerBulletList[i].hp -= enemyList[j].hp >= 0 ? enemyList[j].hp : 0
                enemyList[j].hp -= bulletHp
            }
        }

        playerBulletList[i].update(progress)
        playerBulletList[i].draw(ctx, offset)

        if (playerBulletList[i].destroyed) {
            playerBulletList.splice(i, 1) //削除
        }
    }

    //敵の弾丸の更新
    for (var i = enemyBulletList.length - 1; i >= 0; i--) {
        enemyBulletList[i].update(progress)
        enemyBulletList[i].draw(ctx, offset)

        if (collisionDetect(player, enemyBulletList[i])) {
            player.hp -= enemyBulletList[i].hp
            enemyBulletList[i].hp = 0
        }
        if (enemyBulletList[i].destroyed) {
            enemyBulletList.splice(i, 1) //削除
        }
    }

    //敵の更新
    for (var i = enemyList.length - 1; i >= 0; i--) {
        enemyList[i].update(progress)
        enemyList[i].draw(ctx, offset)

        if (enemyList[i].destroyed) {
            if (!isOffField(enemyList[i].position) && enemyList[i].z == 0) {
                effectList.push(new fadeOutImageEffect(enemyList[i]))
                UI.POINT.point += enemyList[i].point
            }

            enemyList.splice(i, 1) //削除            
        }
    }

    //UIの更新
    UI.HP.draw(ctx)
    UI.POINT.draw(ctx)
    UI.WEAPON.draw(ctx)
    UI.GRENADE.draw(ctx)    

    //ゲームオーバーかの確認
    if (player.hp < 1) {
        UI.GAMEOVER.draw(ctx)          
        gameOverFlag = true
    }
}

//ゲームループ
let lastRender = 0
function loop(timestamp) {
    let progress = (timestamp - lastRender) * 0.001 //秒
    lastRender = timestamp

    update(progress)

    window.requestAnimationFrame(loop)
}