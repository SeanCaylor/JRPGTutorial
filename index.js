//canvas setup
//--canvas context
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
//--canvas properties
canvas.width = 1024;
canvas.height = 576;
//gsap animation plugin context
const g = gsap;
//collision map
const collisionsMap = [];
for (
    let i = 0;
    i < collisions.length;
    i += 70 /*map tile width in Tiled (check via map / resize) */
) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}
const boundaries = [];
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y,
                    },
                })
            );
        }
    });
});

//battle zones map
const battleZonesMap = [];
for (
    let i = 0;
    i < battleZonesData.length;
    i += 70 /*map tile width in Tiled (check via map / resize) */
) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}
const battleZones = [];
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y,
                    },
                })
            );
        }
    });
});

//loading images in
//--background
const backgroundImage = new Image();
backgroundImage.src = "./img/Broceana.png";
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    image: backgroundImage,
});
//--foreground
const foregroundImage = new Image();
foregroundImage.src = "./img/foregroundObjects.png";
const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    image: foregroundImage,
});
//--player character
const playerImageUp = new Image();
playerImageUp.src = "./img/playerUp.png";
const playerImageLeft = new Image();
playerImageLeft.src = "./img/playerLeft.png";
const playerImageDown = new Image();
playerImageDown.src = "./img/playerDown.png";
const playerImageRight = new Image();
playerImageRight.src = "./img/playerRight.png";
const player = new Sprite({
    position: {
        x: canvas.width / 2 - playerImageDown.width / 4 / 2,
        y: canvas.height / 2 - playerImageDown.height / 2,
    },
    image: playerImageDown,
    frames: {
        max: 4,
        hold: 10,
    },
    sprites: {
        up: playerImageUp,
        left: playerImageLeft,
        down: playerImageDown,
        right: playerImageRight,
    },
});

//player controls
const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
};

//setting items that move with the background
const movables = [background, ...boundaries, foreground, ...battleZones];

/**
 *Represents the collision between two rectangles
 *
 * @param {object} rectangle1 - The first rectangle, usually covered with a sprite, usually the player sprite
 * @param {object} rectangle2 - The second rectangle, usually a static object thats being collided
 * @return {boolean} Returns whether the rectangles are colliding or not
 */
function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    );
}

const battle = {
    initiated: false,
};

//the map animation loop
function animate() {
    //recursively calls this function to animate the game, and store the animation ID in a const
    const animationId = window.requestAnimationFrame(animate);
    //drawing in the sprites, boundaries and battle zones
    background.draw();
    boundaries.forEach((boundary) => {
        boundary.draw();
    });
    battleZones.forEach((battleZone) => {
        battleZone.draw();
    });
    player.draw();
    foreground.draw();
    //movement variables
    let moving = true;
    player.animate = false;
    //activate battle
    if (battle.initiated) return;
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            const overlappingArea =
                (Math.min(
                    player.position.x + player.width,
                    battleZone.position.x + battleZone.width
                ) -
                    Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + battleZone.height
                ) -
                    Math.max(player.position.y, battleZone.position.y));

            //collision with a battle zone
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone,
                }) &&
                overlappingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.02
            ) {
                //deactivate map animation loop
                window.cancelAnimationFrame(animationId);
                audio.Map.stop();
                audio.initBattle.play();
                audio.battle.play();
                battle.initiated = true;
                g.to("#transitionScreen", {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        g.to("#transitionScreen", {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                //activate battle animation loop
                                initBattle();
                                animateBattle();
                                g.to("#transitionScreen", {
                                    opacity: 0,
                                    duration: 0.4,
                                });
                            },
                        });
                    },
                });
                break;
            }
        }
    }
    //movement
    if (keys.w.pressed && lastKey === "w") {
        player.image = player.sprites.up;
        player.animate = true;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            //collision, prevents movement if colliding with a barrier
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }
        if (moving)
            movables.forEach((m) => {
                m.position.y += 3;
            });
    } else if (keys.a.pressed && lastKey === "a") {
        player.image = player.sprites.left;
        player.animate = true;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            //collision for left
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }
        if (moving)
            movables.forEach((m) => {
                m.position.x += 3;
            });
    } else if (keys.s.pressed && lastKey === "s") {
        player.image = player.sprites.down;
        player.animate = true;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            //collision for down
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }
        if (moving)
            movables.forEach((m) => {
                m.position.y -= 3;
            });
    } else if (keys.d.pressed && lastKey === "d") {
        player.image = player.sprites.right;
        player.animate = true;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            //collision for right
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }
        if (moving)
            movables.forEach((m) => {
                m.position.x -= 3;
            });
    }
}
animate();
//listeners for controls
let lastKey;
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true;
            lastKey = "w";
            break;
        case "a":
            keys.a.pressed = true;
            lastKey = "a";
            break;
        case "s":
            keys.s.pressed = true;
            lastKey = "s";
            break;
        case "d":
            keys.d.pressed = true;
            lastKey = "d";
            break;
    }
});
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
        case "s":
            keys.s.pressed = false;
            break;
        case "d":
            keys.d.pressed = false;
            break;
    }
});
let clicked = false;
addEventListener("click", () => {
    if (!clicked) {
        audio.Map.play();
        clicked = true;
    }
});
