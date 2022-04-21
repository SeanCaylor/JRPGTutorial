//battle scene positioning
const enemyPosition = {
    x: 800,
    y: 100,
};
const playerPosition = {
    x: 280,
    y: 325,
};

//bestiary
const monsters = {
    //player monster data
    Emby: {
        position: playerPosition,
        image: {
            src: "/img/embySprite.png",
        },
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        name: "Emby",
        attacks: [attacks.Tackle, attacks.Fireball],
    },
    Draggle: {
        position: enemyPosition,
        image: {
            src: "/img/draggleSprite.png",
        },
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        isEnemy: true,
        name: "Draggle",
        attacks: [attacks.Tackle, attacks.Fireball],
    },
};
