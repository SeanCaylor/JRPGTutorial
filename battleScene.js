//Battles
//Loading battle images in
//--battle background
const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./img/battleBackground.png";
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    image: battleBackgroundImage,
});
//--enemy character
let draggle;
//--player character
let emby;
//battle animation loop
let battleAnimationId;
//populate sprites into animation loop
let renderedSprites;
//populate player attacks
//enemy combat instructions (ai)
//--attack queue
let queue;

function initBattle() {
    document.querySelector("#userInterface").style.display = "block";
    document.querySelector("#dialogueBox").style.display = "none";
    document.querySelector("#enemyHealth").style.width = "100%";
    document.querySelector("#playerHealth").style.width = "100%";
    document.querySelector("#attackContainer").replaceChildren();
    draggle = new Monster(monsters.Draggle);
    emby = new Monster(monsters.Emby);
    renderedSprites = [draggle, emby];
    queue = [];

    emby.attacks.forEach((attack) => {
        const button = document.createElement("button");
        button.className = "attackText";
        button.innerHTML = attack.name;
        document.querySelector("#attackContainer").append(button);
    });

    //listeners for controls
    document.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites,
            });

            if (draggle.health <= 0) {
                queue.push(() => {
                    draggle.faint();
                });
                queue.push(() => {
                    g.to("#transitionScreen", {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector(
                                "#userInterface"
                            ).style.display = "none";
                            g.to("#transitionScreen", {
                                opacity: 0,
                            });
                            battle.initiated = false;
                        },
                    });
                });
            }
            const randomAttack =
                draggle.attacks[
                    Math.floor(Math.random() * draggle.attacks.length)
                ];
            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites,
                });
                if (emby.health <= 0) {
                    queue.push(() => {
                        emby.faint();
                    });
                    queue.push(() => {
                        g.to("#transitionScreen", {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationId);
                                animate();
                                document.querySelector(
                                    "#userInterface"
                                ).style.display = "none";
                                g.to("#transitionScreen", {
                                    opacity: 0,
                                });
                                battle.initiated = false;
                            },
                        });
                    });
                }
            });
        });
        button.addEventListener("mouseenter", (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector("#attackInfo").innerHTML =
                selectedAttack.type;
            document.querySelector("#attackInfo").style.color =
                selectedAttack.color;
        });
        button.addEventListener("mouseleave", () => {
            document.querySelector("#attackInfo").innerHTML = "Select Attack";
            document.querySelector("#attackInfo").style.color = "black";
        });
    });
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    renderedSprites.forEach((s) => {
        s.draw();
    });
}
// initBattle();
// animateBattle();

document.querySelector("#dialogueBox").addEventListener("click", (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else e.currentTarget.style.display = "none";
});
