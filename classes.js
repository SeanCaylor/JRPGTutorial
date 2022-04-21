//particular to the map, would need to be more variable in a multi map game
const offset = {
    x: -1411,
    y: -325,
};
/**
 *Class representing a collision boundary of some kind
 * @class Boundary
 * @static width = 48
 * @static height = 48
 * @param {number} position.x - the boundaries' x position
 * @param {number} position.y - the boundaries' y position
 */
class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = Boundary.width;
        this.height = Boundary.height;
    }
    /**
     * Draws the boundaries into the world, and renders them invisible to
     * red, depending on the value set below
     * @memberof Boundary
     */
    draw() {
        c.fillStyle = "rgba(255, 0, 0, 0.5)"; // <=<< final value 0 = invisible - 1 = red
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

/**
 *General class for handling image objects, also called sprites
 * @class Sprite
 * @param {number} position.x - the sprites' x position
 * @param {number} position.y - the sprites' y position
 * @param {number} velocity.x - the sprites' x velocity
 * @param {number} velocity.y - the sprites' y velocity
 * @param {string} image - the sprites' associated image object
 * @param {number} frames.max - the sprites' associated image frame count
 * @param {string} sprites - assign a unique image object to several sprite states if needed, such as player movement direction
 */
class Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
    }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        };
        this.image.src = image.src;
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }
    /**
     * Draws the sprite into the game canvas
     * @return {null} The return exists to break out of the function
     * @memberof Sprite
     */
    draw() {
        c.save();
        c.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        c.rotate(this.rotation);
        c.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2
        );
        c.globalAlpha = this.opacity;
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        );
        c.restore();
        if (!this.animate) return;
        if (this.frames.max > 1) this.frames.elapsed++;
        if (this.frames.elapsed % this.frames.hold === 0)
            this.frames.val < this.frames.max - 1
                ? this.frames.val++
                : (this.frames.val = 0);
    }
}

class Monster extends Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks,
    }) {
        super({
            position,
            velocity,
            image,
            frames,
            sprites,
            animate,
            rotation,
        });
        this.name = name;
        this.isEnemy = isEnemy;
        this.health = 100;
        this.attacks = attacks;
    }
    faint() {
        document.querySelector("#dialogueBox").innerHTML =
            this.name + " fainted!";
        g.to(this.position, {
            y: this.position.y + 20,
        });
        g.to(this, {
            opacity: 0,
        });
    }
    //attack function and animations
    attack({ attack, recipient, renderedSprites }) {
        document.querySelector("#dialogueBox").style.display = "block";
        document.querySelector("#dialogueBox").innerHTML =
            this.name + " used " + attack.name;
        //I believe in further implementation I'll create a series of attack animations here and name them more generically, and give attacks an animation property... should be expandable even with bespoke attacks
        let healthBar = "#enemyHealth";
        if (this.isEnemy) healthBar = "#playerHealth";
        recipient.health -= attack.damage;
        switch (attack.name) {
            case "Fireball":
                let rotation = 1;
                if (this.isEnemy) rotation = -2.2;
                const fireballImage = new Image();
                fireballImage.src = "./img/fireball.png";
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y,
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10,
                    },
                    animate: true,
                    rotation,
                });
                renderedSprites.splice(1, 0, fireball);
                g.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        g.to(healthBar, {
                            width: recipient.health + "%",
                        });
                        g.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        });
                        g.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08,
                        });
                        renderedSprites.splice(1, 1);
                    },
                });
                break;
            case "Tackle":
                const tl = g.timeline();
                let movementDistance = 20;
                if (this.isEnemy) movementDistance = -20;
                tl.to(this.position, {
                    x: this.position.x - movementDistance,
                })
                    .to(this.position, {
                        x: this.position.x + movementDistance * 2,
                        duration: 0.1,
                        onComplete: () => {
                            g.to(healthBar, {
                                width: recipient.health + "%",
                            });
                            g.to(recipient.position, {
                                x: recipient.position.x + 10,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.08,
                            });
                            g.to(recipient, {
                                opacity: 0,
                                repeat: 5,
                                yoyo: true,
                                duration: 0.08,
                            });
                        },
                    })
                    .to(this.position, {
                        x: this.position.x,
                    });
                break;
        }
    }
}
