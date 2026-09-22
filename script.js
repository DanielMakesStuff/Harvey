"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HARVEY
       KINETIC STUDIOS
       FINAL CHASE VERSION
       ===================================================== */

    const menu = document.getElementById("menu");
    const settings = document.getElementById("settings");
    const game = document.getElementById("game");

    const playBtn = document.getElementById("playBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const backBtn = document.getElementById("backBtn");

    const language = document.getElementById("language");
    const volume = document.getElementById("volume");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const timeText = document.getElementById("time");
    const powerText = document.getElementById("power");
    const cluesText = document.getElementById("clues");

    const objective = document.getElementById("objective");
    const roomText = document.getElementById("room");
    const interact = document.getElementById("interact");
    const danger = document.getElementById("danger");
    const message = document.getElementById("message");

    const mp3Box = document.getElementById("mp3");
    const mp3Btn = document.getElementById("mp3Btn");
    const mp3State = document.getElementById("mp3State");

    const camera = document.getElementById("camera");
    const cameraCanvas = document.getElementById("cameraCanvas");
    const cameraCtx = cameraCanvas.getContext("2d");
    const cameraName = document.getElementById("cameraName");
    const closeCamera = document.getElementById("closeCamera");

    const cutscene = document.getElementById("cutscene");
    const cutsceneText = document.getElementById("cutsceneText");

    const credits = document.getElementById("credits");
    const menuBtn = document.getElementById("menuBtn");


    /* =====================================================
       AUDIO
    ===================================================== */

    const sounds = {
        menu: new Audio("menu.mp3"),
        footsteps: new Audio("footsteps.mp3"),
        chase: new Audio("chase.mp3"),
        chaseEnd: new Audio("chase_end.mp3"),
        final: new Audio("final.mp3"),
        credits: new Audio("credits.mp3"),
        harvey: new Audio("Harvey.mp3")
    };

    sounds.menu.loop = true;
    sounds.footsteps.loop = true;
    sounds.chase.loop = true;
    sounds.final.loop = true;
    sounds.credits.loop = true;


    let masterVolume =
        Number(localStorage.getItem("harveyVolume"));

    if (Number.isNaN(masterVolume)) {
        masterVolume = 0.7;
    }

    volume.value = masterVolume * 100;


    function setVolume() {

        Object.values(sounds).forEach(sound => {
            sound.volume = masterVolume;
        });

    }


    setVolume();


    function playSound(sound) {

        sound.currentTime = 0;

        sound.play().catch(() => {});

    }


    function stopSound(sound) {

        sound.pause();
        sound.currentTime = 0;

    }


    function stopEverything() {

        Object.values(sounds).forEach(sound => {

            sound.pause();
            sound.currentTime = 0;

        });

        mp3Btn.textContent = "▶";
        mp3State.textContent = "STOPPED";

    }


    /* =====================================================
       LANGUAGE
    ===================================================== */

    const translations = {

        en: {

            play: "START NIGHT 1",
            settings: "SETTINGS",
            back: "BACK",

            subtitle:
                "SOME MEMORIES DON'T STAY DEAD.",

            objective:
                "OBJECTIVE: SEARCH THE BUILDING",

            interact:
                "PRESS E TO INTERACT"

        },

        ru: {

            play: "НАЧАТЬ НОЧЬ 1",
            settings: "НАСТРОЙКИ",
            back: "НАЗАД",

            subtitle:
                "НЕКОТОРЫЕ ВОСПОМИНАНИЯ НЕ УМИРАЮТ.",

            objective:
                "ЦЕЛЬ: ОБЫСКАТЬ ЗДАНИЕ",

            interact:
                "НАЖМИТЕ E"

        }

    };


    let currentLanguage =
        localStorage.getItem("harveyLanguage") || "en";

    language.value = currentLanguage;


    let finalChase = false;


    function applyLanguage() {

        const t =
            translations[currentLanguage];

        playBtn.textContent =
            t.play;

        settingsBtn.textContent =
            t.settings;

        backBtn.textContent =
            t.back;

        document.getElementById(
            "subtitle"
        ).textContent =
            t.subtitle;

        if (!finalChase) {

            objective.textContent =
                t.objective;

        }

        interact.textContent =
            t.interact;

    }


    settingsBtn.addEventListener(
        "click",
        () => {

            settings.style.display =
                "flex";

            playSound(
                sounds.menu
            );

        }
    );


    backBtn.addEventListener(
        "click",
        () => {

            settings.style.display =
                "none";

        }
    );


    language.addEventListener(
        "change",
        () => {

            currentLanguage =
                language.value;

            localStorage.setItem(
                "harveyLanguage",
                currentLanguage
            );

            applyLanguage();

        }
    );


    volume.addEventListener(
        "input",
        () => {

            masterVolume =
                Number(volume.value) / 100;

            localStorage.setItem(
                "harveyVolume",
                masterVolume
            );

            setVolume();

        }
    );


    /* =====================================================
       START GAME
    ===================================================== */

    playBtn.addEventListener(
        "click",
        () => {

            menu.style.display =
                "none";

            settings.style.display =
                "none";

            game.style.display =
                "flex";

            stopEverything();

            resetGame();

            running = true;

            showMessage(
                "NIGHT 1\n\n" +
                "The building has been abandoned for years.\n\n" +
                "Find the five clues.\n" +
                "Something is moving inside."
            );

        }
    );


    menuBtn.addEventListener(
        "click",
        () => {

            running = false;

            stopEverything();

            credits.style.display =
                "none";

            game.style.display =
                "none";

            menu.style.display =
                "flex";

            playSound(
                sounds.menu
            );

        }
    );


    /* =====================================================
       WORLD
    ===================================================== */

    const WORLD_W = 4700;
    const WORLD_H = 3200;


    /*
       This is the actual colored playable area.
       The player cannot leave it.
    */

    const PLAY_AREA = {

        x: 150,
        y: 150,

        w: 4400,
        h: 2900

    };


    /*
       Smaller main house.
    */

    const HOUSE = {

        x: 350,
        y: 350,

        w: 4000,
        h: 2500

    };


    /* =====================================================
       PLAYER
    ===================================================== */

    const player = {

        x: 700,
        y: 2550,

        radius: 18,

        speed: 4,

        runSpeed: 6

    };


    /* =====================================================
       KILLER
    ===================================================== */

    const killer = {

        x: 3650,
        y: 600,

        radius: 21,

        /*
           Normal speed.
        */

        speed: 1.6,

        /*
           FINAL CHASE SPEED.
           Faster than walking.
           Slower than sprinting.
        */

        finalSpeed: 5.2,

        chasing: false,

        lastSeenX: 3650,
        lastSeenY: 600,

        lostTimer: 0,

        patrolIndex: 0

    };


    /* =====================================================
       GAME STATE
    ===================================================== */

    let running = false;

    let gameFinished = false;

    let cluesFound = 0;

    let power = 100;

    let nightSeconds = 0;

    let cameraOpen = false;

    let keys = {};


    /* =====================================================
       ROOMS
    ===================================================== */

    const rooms = [

        {
            name: "OLD THEATER",

            x: 500,
            y: 400,

            w: 1500,
            h: 600,

            color: "#392e35"
        },

        {
            name: "STORAGE",

            x: 2850,
            y: 400,

            w: 1250,
            h: 600,

            color: "#38352d"
        },

        {
            name: "DINING ROOM",

            x: 850,
            y: 1000,

            w: 1200,
            h: 700,

            color: "#4a3c31"
        },

        {
            name: "KITCHEN",

            x: 2050,
            y: 1000,

            w: 950,
            h: 700,

            color: "#353a36"
        },

        {
            name: "BEDROOM",

            x: 3000,
            y: 1000,

            w: 1100,
            h: 700,

            color: "#34323b"
        },

        {
            name: "MAIN HALL",

            x: 850,
            y: 1700,

            w: 1900,
            h: 1050,

            color: "#3d4038"
        },

        {
            name: "ARCADE",

            x: 2750,
            y: 1700,

            w: 1350,
            h: 1050,

            color: "#293b43"
        },

        {
            name: "SECURITY OFFICE",

            x: 400,
            y: 2150,

            w: 500,
            h: 650,

            color: "#303b34"
        }

    ];


    /* =====================================================
       HOUSE WALLS
    ===================================================== */

    const houseWalls = [

        {
            x: HOUSE.x,
            y: HOUSE.y,

            w: HOUSE.w,
            h: 35
        },

        {
            x: HOUSE.x,

            y:
                HOUSE.y +
                HOUSE.h -
                35,

            w: HOUSE.w,
            h: 35
        },

        {
            x: HOUSE.x,
            y: HOUSE.y,

            w: 35,
            h: HOUSE.h
        },

        {
            x:
                HOUSE.x +
                HOUSE.w -
                35,

            y: HOUSE.y,

            w: 35,
            h: HOUSE.h
        }

    ];


    /* =====================================================
       SECURITY OFFICE WALLS
    ===================================================== */

    const officeWalls = [

        {
            x: 400,
            y: 2150,

            w: 500,
            h: 25
        },

        {
            x: 400,
            y: 2150,

            w: 25,
            h: 650
        },

        {
            x: 400,
            y: 2775,

            w: 500,
            h: 25
        },

        /*
           LEFT SIDE OF DOOR.
        */

        {
            x: 875,
            y: 2150,

            w: 25,
            h: 230
        },

        /*
           RIGHT SIDE OF DOOR.
        */

        {
            x: 875,
            y: 2600,

            w: 25,
            h: 200
        }

    ];


    /* =====================================================
       FURNITURE
    ===================================================== */

    const furniture = [

        {
            x: 500,
            y: 2350,

            w: 220,
            h: 90,

            type: "desk"
        },

        {
            x: 455,
            y: 2250,

            w: 55,
            h: 430,

            type: "shelf"
        },

        {
            x: 770,
            y: 2250,

            w: 55,
            h: 430,

            type: "shelf"
        },

        {
            x: 540,
            y: 2550,

            w: 100,
            h: 60,

            type: "chair"
        },

        {
            x: 1050,
            y: 1120,

            w: 330,
            h: 95,

            type: "table"
        },

        {
            x: 1550,
            y: 1350,

            w: 300,
            h: 95,

            type: "table"
        },

        {
            x: 1100,
            y: 1500,

            w: 260,
            h: 90,

            type: "table"
        },

        {
            x: 2100,
            y: 1080,

            w: 550,
            h: 90,

            type: "counter"
        },

        {
            x: 2150,
            y: 1250,

            w: 140,
            h: 330,

            type: "fridge"
        },

        {
            x: 3200,
            y: 1080,

            w: 380,
            h: 180,

            type: "bed"
        },

        {
            x: 3700,
            y: 1100,

            w: 250,
            h: 85,

            type: "desk"
        },

        {
            x: 2950,
            y: 1950,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 3120,
            y: 1950,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 3290,
            y: 1950,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 3460,
            y: 1950,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 2950,
            y: 2450,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 3120,
            y: 2450,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 3290,
            y: 2450,

            w: 95,
            h: 180,

            type: "arcade"
        },

        {
            x: 3150,
            y: 470,

            w: 70,
            h: 350,

            type: "shelf"
        },

        {
            x: 3350,
            y: 470,

            w: 70,
            h: 350,

            type: "shelf"
        },

        {
            x: 3550,
            y: 470,

            w: 70,
            h: 350,

            type: "shelf"
        },

        {
            x: 3750,
            y: 470,

            w: 70,
            h: 350,

            type: "shelf"
        }

    ];


    /* =====================================================
       CLUES
    ===================================================== */

    const clues = [

        {
            x: 1250,
            y: 1150,

            found: false,
            active: true
        },

        {
            x: 1850,
            y: 2400,

            found: false,
            active: true
        },

        {
            x: 3650,
            y: 1400,

            found: false,
            active: true
        },

        {
            x: 1050,
            y: 600,

            found: false,
            active: true
        },

        {
            x: 3900,
            y: 2550,

            found: false,
            active: false
        }

    ];


    /* =====================================================
       MP3
    ===================================================== */

    const mp3Object = {

        x: 650,
        y: 2650,

        collected: false

    };


    /* =====================================================
       FINAL OBSTACLES
    ===================================================== */

    let finalObstacles = [];


    function createFinalObstacles() {

        finalObstacles = [

            {
                x: 2350,
                y: 2200,

                w: 300,
                h: 70,

                type: "fallen"
            },

            {
                x: 1850,
                y: 1950,

                w: 75,
                h: 300,

                type: "shelf"
            },

            {
                x: 1450,
                y: 2350,

                w: 300,
                h: 70,

                type: "fallen"
            },

            {
                x: 1100,
                y: 2100,

                w: 70,
                h: 300,

                type: "shelf"
            },

            {
                x: 2800,
                y: 1500,

                w: 300,
                h: 65,

                type: "fallen"
            },

            {
                x: 3350,
                y: 1800,

                w: 70,
                h: 300,

                type: "shelf"
            },

            {
                x: 2450,
                y: 1750,

                w: 75,
                h: 260,

                type: "shelf"
            }

        ];

    }


    /* =====================================================
       COLLISION
    ===================================================== */

    function circleRectCollision(
        cx,
        cy,
        r,
        rect
    ) {

        const nearestX =
            Math.max(
                rect.x,
                Math.min(
                    cx,
                    rect.x +
                    rect.w
                )
            );

        const nearestY =
            Math.max(
                rect.y,
                Math.min(
                    cy,
                    rect.y +
                    rect.h
                )
            );

        const dx =
            cx - nearestX;

        const dy =
            cy - nearestY;

        return (
            dx * dx +
            dy * dy <
            r * r
        );

    }


    function insidePlayArea(
        x,
        y,
        r
    ) {

        return (

            x - r >
                PLAY_AREA.x &&

            x + r <
                PLAY_AREA.x +
                PLAY_AREA.w &&

            y - r >
                PLAY_AREA.y &&

            y + r <
                PLAY_AREA.y +
                PLAY_AREA.h

        );

    }


    function blocked(
        x,
        y,
        r,
        isKiller = false
    ) {

        /*
           Colored map boundary.
        */

        if (
            !insidePlayArea(
                x,
                y,
                r
            )
        ) {

            return true;

        }


        /*
           Main house walls.
        */

        for (
            const wall
            of houseWalls
        ) {

            if (
                circleRectCollision(
                    x,
                    y,
                    r,
                    wall
                )
            ) {

                return true;

            }

        }


        /*
           Security office walls
           only apply to player.
        */

        if (!isKiller) {

            for (
                const wall
                of officeWalls
            ) {

                if (
                    circleRectCollision(
                        x,
                        y,
                        r,
                        wall
                    )
                ) {

                    return true;

                }

            }


            /*
               Normal furniture.
            */

            for (
                const item
                of furniture
            ) {

                if (

                    item.type === "shelf" ||
                    item.type === "desk" ||
                    item.type === "arcade" ||
                    item.type === "counter" ||
                    item.type === "fridge" ||
                    item.type === "bed"

                ) {

                    if (
                        circleRectCollision(
                            x,
                            y,
                            r,
                            item
                        )
                    ) {

                        return true;

                    }

                }

            }


            /*
               Final chase obstacles.
            */

            if (finalChase) {

                for (
                    const obstacle
                    of finalObstacles
                ) {

                    if (
                        circleRectCollision(
                            x,
                            y,
                            r,
                            obstacle
                        )
                    ) {

                        return true;

                    }

                }

            }

        }


        return false;

    }


    /* =====================================================
       ENTITY MOVEMENT
    ===================================================== */

    function moveEntity(
        entity,
        dx,
        dy,
        isKiller = false
    ) {

        const nextX =
            entity.x + dx;


        if (
            !blocked(
                nextX,
                entity.y,
                entity.radius,
                isKiller
            )
        ) {

            entity.x =
                nextX;

        }


        const nextY =
            entity.y + dy;


        if (
            !blocked(
                entity.x,
                nextY,
                entity.radius,
                isKiller
            )
        ) {

            entity.y =
                nextY;

        }

    }


    /* =====================================================
       SECURITY OFFICE
    ===================================================== */

    function inOffice(
        x,
        y
    ) {

        return (

            x > 425 &&
            x < 875 &&
            y > 2175 &&
            y < 2775

        );

    }


    /* =====================================================
       KEYBOARD
    ===================================================== */

    window.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();

            keys[key] = true;


            if (!running) {
                return;
            }


            if (key === "c") {

                if (cameraOpen) {

                    closeCam();

                } else {

                    openCamera();

                }

            }


            if (key === "e") {

                interactObject();

            }

        }
    );


    window.addEventListener(
        "keyup",
        event => {

            keys[
                event.key.toLowerCase()
            ] = false;

        }
    );


    /* =====================================================
       DISTANCE
    ===================================================== */

    function distance(
        a,
        b
    ) {

        return Math.hypot(
            a.x - b.x,
            a.y - b.y
        );

    }


    /* =====================================================
       INTERACTION
    ===================================================== */

    function interactObject() {

        for (
            let i = 0;
            i < clues.length;
            i++
        ) {

            const clue =
                clues[i];


            if (

                clue.active &&
                !clue.found &&
                distance(
                    player,
                    clue
                ) < 90

            ) {

                clue.found =
                    true;


                cluesFound++;


                cluesText.textContent =
                    cluesFound +
                    " / 5";


                /*
                   FOURTH CLUE
                */

                if (
                    cluesFound === 4
                ) {

                    clues[4].active =
                        true;


                    objective.textContent =
                        "OBJECTIVE: FIND THE LAST CLUE";


                    showMessage(
                        "FOUR CLUES FOUND.\n\n" +
                        "Something just appeared far away..."
                    );


                    return;

                }


                /*
                   FIFTH CLUE
                */

                if (
                    cluesFound === 5
                ) {

                    startFinalChase();

                    return;

                }


                showMessage(
                    "CLUE FOUND\n\n" +
                    "A memory that shouldn't still exist."
                );


                return;

            }

        }


        /*
           MP3.
        */

        if (

            !mp3Object.collected &&
            distance(
                player,
                mp3Object
            ) < 90

        ) {

            mp3Object.collected =
                true;


            mp3Box.style.display =
                "block";


            showMessage(
                "OLD MP3 PLAYER\n\n" +
                "A file named HARVEY.mp3 is still on it."
            );

        }

    }


    /* =====================================================
       ROOM DISPLAY
    ===================================================== */

    function updateRoom() {

        let roomName =
            "MAIN HOUSE";


        for (
            const room
            of rooms
        ) {

            if (

                player.x > room.x &&
                player.x <
                    room.x +
                    room.w &&

                player.y > room.y &&
                player.y <
                    room.y +
                    room.h

            ) {

                roomName =
                    room.name;

                break;

            }

        }


        roomText.textContent =
            roomName;


        let nearby =
            false;


        for (
            const clue
            of clues
        ) {

            if (

                clue.active &&
                !clue.found &&
                distance(
                    player,
                    clue
                ) < 90

            ) {

                nearby = true;

            }

        }


        if (

            !mp3Object.collected &&
            distance(
                player,
                mp3Object
            ) < 90

        ) {

            nearby = true;

        }


        interact.style.display =
            nearby
                ? "block"
                : "none";

    }


    /* =====================================================
       PLAYER UPDATE
    ===================================================== */

    function updatePlayer() {

        let dx = 0;
        let dy = 0;


        if (keys["w"]) {
            dy--;
        }

        if (keys["s"]) {
            dy++;
        }

        if (keys["a"]) {
            dx--;
        }

        if (keys["d"]) {
            dx++;
        }


        if (
            dx !== 0 ||
            dy !== 0
        ) {

            const length =
                Math.hypot(
                    dx,
                    dy
                );


            dx /= length;
            dy /= length;


            const speed =
                keys["shift"]
                    ? player.runSpeed
                    : player.speed;


            moveEntity(
                player,
                dx * speed,
                dy * speed,
                false
            );


            if (
                sounds.footsteps.paused
            ) {

                sounds.footsteps
                    .play()
                    .catch(() => {});

            }

        } else {

            stopSound(
                sounds.footsteps
            );

        }

    }


    /* =====================================================
       KILLER PATROL
    ===================================================== */

    const patrolPoints = [

        {
            x: 3500,
            y: 550
        },

        {
            x: 3900,
            y: 800
        },

        {
            x: 3600,
            y: 1250
        },

        {
            x: 2800,
            y: 1400
        },

        {
            x: 1900,
            y: 1400
        },

        {
            x: 1750,
            y: 1900
        },

        {
            x: 2300,
            y: 2400
        },

        {
            x: 3000,
            y: 2300
        },

        {
            x: 3450,
            y: 2450
        }

    ];


    /* =====================================================
       KILLER AI
    ===================================================== */

    function updateKiller() {

        if (gameFinished) {
            return;
        }


        /*
           Never enter security office.
        */

        if (
            inOffice(
                killer.x,
                killer.y
            )
        ) {

            killer.x =
                3500;

            killer.y =
                550;

            killer.chasing =
                false;

        }


        /*
           Player is safe.
        */

        if (
            inOffice(
                player.x,
                player.y
            )
        ) {

            if (
                killer.chasing
            ) {

                killer.chasing =
                    false;


                stopSound(
                    sounds.chase
                );


                if (
                    !finalChase
                ) {

                    playSound(
                        sounds.chaseEnd
                    );

                }

            }

            return;

        }


        const d =
            distance(
                player,
                killer
            );


        /* =================================================
           FINAL CHASE
        ================================================= */

        if (finalChase) {

            killer.chasing =
                true;


            killer.lastSeenX =
                player.x;

            killer.lastSeenY =
                player.y;


            const dx =
                player.x -
                killer.x;

            const dy =
                player.y -
                killer.y;


            const len =
                Math.hypot(
                    dx,
                    dy
                );


            if (len > 1) {

                /*
                   5.2 SPEED
                   Player sprint = 6
                */

                moveEntity(

                    killer,

                    dx / len *
                        killer.finalSpeed,

                    dy / len *
                        killer.finalSpeed,

                    true

                );

            }


            return;

        }


        /* =================================================
           NORMAL CHASE
        ================================================= */

        if (
            d < 550
        ) {

            killer.chasing =
                true;


            killer.lastSeenX =
                player.x;

            killer.lastSeenY =
                player.y;


            killer.lostTimer =
                0;


            if (
                sounds.chase.paused
            ) {

                sounds.chase
                    .play()
                    .catch(() => {});

            }

        } else if (
            killer.chasing
        ) {

            killer.lostTimer++;


            if (
                killer.lostTimer >
                220
            ) {

                killer.chasing =
                    false;


                stopSound(
                    sounds.chase
                );


                playSound(
                    sounds.chaseEnd
                );

            }

        }


        if (
            killer.chasing
        ) {

            const dx =
                killer.lastSeenX -
                killer.x;

            const dy =
                killer.lastSeenY -
                killer.y;


            const len =
                Math.hypot(
                    dx,
                    dy
                );


            if (len > 1) {

                moveEntity(

                    killer,

                    dx / len *
                        1.85,

                    dy / len *
                        1.85,

                    true

                );

            }


            return;

        }


        /* =================================================
           PATROL
        ================================================= */

        const target =
            patrolPoints[
                killer.patrolIndex
            ];


        const dx =
            target.x -
            killer.x;

        const dy =
            target.y -
            killer.y;


        const len =
            Math.hypot(
                dx,
                dy
            );


        if (
            len < 45
        ) {

            killer.patrolIndex++;


            if (
                killer.patrolIndex >=
                patrolPoints.length
            ) {

                killer.patrolIndex =
                    0;

            }

        } else {

            moveEntity(

                killer,

                dx / len *
                    killer.speed,

                dy / len *
                    killer.speed,

                true

            );

        }

    }


    /* =====================================================
       START FINAL CHASE
    ===================================================== */

    function startFinalChase() {

        if (finalChase) {
            return;
        }


        finalChase =
            true;


        /*
           Spawn the obstacles.
        */

        createFinalObstacles();


        /*
           Spawn killer near Alex.
        */

        const spawnDistance =
            360;


        const spawnPositions = [

            {
                x:
                    player.x +
                    spawnDistance,

                y:
                    player.y
            },

            {
                x:
                    player.x -
                    spawnDistance,

                y:
                    player.y
            },

            {
                x:
                    player.x,

                y:
                    player.y +
                    spawnDistance
            },

            {
                x:
                    player.x,

                y:
                    player.y -
                    spawnDistance
            }

        ];


        let spawned =
            false;


        for (
            const pos
            of spawnPositions
        ) {

            if (

                !blocked(
                    pos.x,
                    pos.y,
                    killer.radius,
                    true
                )

            ) {

                killer.x =
                    pos.x;

                killer.y =
                    pos.y;

                spawned =
                    true;

                break;

            }

        }


        /*
           Fallback.
        */

        if (!spawned) {

            killer.x =
                player.x +
                350;

            killer.y =
                player.y;

        }


        killer.chasing =
            true;


        killer.lastSeenX =
            player.x;

        killer.lastSeenY =
            player.y;


        objective.textContent =
            "OBJECTIVE: RUN THROUGH THE OBSTACLES TO THE SECURITY OFFICE";


        danger.style.display =
            "block";


        stopSound(
            sounds.chase
        );


        playSound(
            sounds.final
        );


        showMessage(
            "THE LAST MEMORY\n\n" +
            "THE BUILDING CHANGED.\n\n" +
            "RUN."
        );

    }


    /* =====================================================
       FINISH FINAL CHASE
    ===================================================== */

    function finishFinalChase() {

        if (
            !finalChase ||
            gameFinished
        ) {

            return;

        }


        gameFinished =
            true;

        running =
            false;


        stopEverything();


        danger.style.display =
            "none";


        cutscene.style.display =
            "flex";


        playCutscene();

    }


    /* =====================================================
       CUTSCENE
    ===================================================== */

    function playCutscene() {

        const scenes = [

            "Alex sits down in the security office.",

            "The building is silent.",

            "Alex looks toward the doorway.",

            "For the first time, he understands.",

            "It was never Harvey.",

            "The figure was a memory.",

            "A memory Alex refused to let go of.",

            "Harvey was gone.",

            "And Alex finally accepted it."

        ];


        let index = 0;


        function nextScene() {

            if (
                index >=
                scenes.length
            ) {

                setTimeout(
                    () => {

                        cutscene.style.display =
                            "none";

                        credits.style.display =
                            "block";

                        playSound(
                            sounds.credits
                        );

                    },
                    2000
                );

                return;

            }


            cutsceneText.textContent =
                scenes[index];


            index++;


            setTimeout(
                nextScene,
                2600
            );

        }


        nextScene();

    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    let messageTimer;


    function showMessage(text) {

        message.textContent =
            text;


        message.style.display =
            "block";


        clearTimeout(
            messageTimer
        );


        messageTimer =
            setTimeout(
                () => {

                    message.style.display =
                        "none";

                },
                3000
            );

    }


    /* =====================================================
       CAMERA SYSTEM
    ===================================================== */

    let selectedCamera = 0;


    document
        .querySelectorAll(
            "[data-camera]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectedCamera =
                            Number(
                                button.dataset.camera
                            );


                        cameraName.textContent =
                            "CAM 0" +
                            (
                                selectedCamera +
                                1
                            );


                        drawCamera();

                    }
                );

            }
        );


    function openCamera() {

        cameraOpen =
            true;


        camera.style.display =
            "flex";


        drawCamera();

    }


    function closeCam() {

        cameraOpen =
            false;


        camera.style.display =
            "none";

    }


    closeCamera.addEventListener(
        "click",
        closeCam
    );


    function drawCamera() {

        cameraCtx.fillStyle =
            "#111";


        cameraCtx.fillRect(
            0,
            0,
            cameraCanvas.width,
            cameraCanvas.height
        );


        cameraCtx.fillStyle =
            "#303630";


        cameraCtx.fillRect(
            50,
            50,
            700,
            350
        );


        cameraCtx.fillStyle =
            "#888";


        cameraCtx.font =
            "20px monospace";


        cameraCtx.fillText(

            "CAM 0" +
            (
                selectedCamera +
                1
            ),

            30,
            35

        );


        cameraCtx.fillStyle =
            "#181a18";


        for (
            let x = 70;
            x < 730;
            x += 100
        ) {

            cameraCtx.fillRect(
                x,
                100,
                50,
                220
            );

        }


        if (
            selectedCamera !== 0
        ) {

            cameraCtx.fillStyle =
                "#202020";


            cameraCtx.fillRect(
                390,
                175,
                35,
                65
            );


            cameraCtx.fillStyle =
                "#aaa";


            cameraCtx.fillRect(
                382,
                150,
                50,
                35
            );

        }

    }


    /* =====================================================
       MP3 PLAYER
    ===================================================== */

    mp3Btn.addEventListener(
        "click",
        () => {

            if (
                sounds.harvey.paused
            ) {

                sounds.harvey.currentTime =
                    0;


                sounds.harvey
                    .play()
                    .then(
                        () => {

                            mp3Btn.textContent =
                                "■";

                            mp3State.textContent =
                                "PLAYING";

                        }
                    )
                    .catch(
                        () => {

                            mp3State.textContent =
                                "Harvey.mp3 missing";

                        }
                    );

            } else {

                stopSound(
                    sounds.harvey
                );


                mp3Btn.textContent =
                    "▶";


                mp3State.textContent =
                    "STOPPED";

            }

        }
    );


    /* =====================================================
       DRAW WORLD
    ===================================================== */

    function drawWorld() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        const maxCameraX =
            Math.max(
                0,
                PLAY_AREA.x +
                PLAY_AREA.w -
                canvas.width
            );


        const maxCameraY =
            Math.max(
                0,
                PLAY_AREA.y +
                PLAY_AREA.h -
                canvas.height
            );


        const cameraX =
            Math.max(
                PLAY_AREA.x,
                Math.min(
                    maxCameraX,
                    player.x -
                    canvas.width / 2
                )
            );


        const cameraY =
            Math.max(
                PLAY_AREA.y,
                Math.min(
                    maxCameraY,
                    player.y -
                    canvas.height / 2
                )
            );


        ctx.save();


        ctx.translate(
            -cameraX,
            -cameraY
        );


        /*
           Outside.
        */

        ctx.fillStyle =
            "#080a08";


        ctx.fillRect(
            0,
            0,
            WORLD_W,
            WORLD_H
        );


        /*
           COLORED PLAYABLE AREA.
        */

        ctx.fillStyle =
            "#171d18";


        ctx.fillRect(

            PLAY_AREA.x,
            PLAY_AREA.y,

            PLAY_AREA.w,
            PLAY_AREA.h

        );


        /*
           Ground grid.
        */

        ctx.strokeStyle =
            "#202820";


        ctx.lineWidth =
            2;


        for (
            let x =
                PLAY_AREA.x;

            x <
                PLAY_AREA.x +
                PLAY_AREA.w;

            x += 70
        ) {

            for (
                let y =
                    PLAY_AREA.y;

                y <
                    PLAY_AREA.y +
                    PLAY_AREA.h;

                y += 70
            ) {

                ctx.strokeRect(
                    x,
                    y,
                    70,
                    70
                );

            }

        }


        /*
           Play area border.
        */

        ctx.strokeStyle =
            "#697267";

        ctx.lineWidth =
            8;


        ctx.strokeRect(

            PLAY_AREA.x,
            PLAY_AREA.y,

            PLAY_AREA.w,
            PLAY_AREA.h

        );


        /*
           House floor.
        */

        ctx.fillStyle =
            "#20231e";


        ctx.fillRect(

            HOUSE.x,
            HOUSE.y,

            HOUSE.w,
            HOUSE.h

        );


        /*
           Rooms.
        */

        for (
            const room
            of rooms
        ) {

            ctx.fillStyle =
                room.color;


            ctx.fillRect(

                room.x,
                room.y,

                room.w,
                room.h

            );


            ctx.strokeStyle =
                "rgba(0,0,0,.35)";


            ctx.lineWidth =
                5;


            ctx.strokeRect(

                room.x,
                room.y,

                room.w,
                room.h

            );


            ctx.fillStyle =
                "#9da49a";


            ctx.font =
                "18px monospace";


            ctx.fillText(

                room.name,

                room.x + 20,
                room.y + 32

            );

        }


        /*
           Main house walls.
        */

        for (
            const wall
            of houseWalls
        ) {

            ctx.fillStyle =
                "#111411";


            ctx.fillRect(

                wall.x,
                wall.y,

                wall.w,
                wall.h

            );


            ctx.strokeStyle =
                "#555b52";


            ctx.strokeRect(

                wall.x,
                wall.y,

                wall.w,
                wall.h

            );

        }


        /*
           Security office walls.
        */

        for (
            const wall
            of officeWalls
        ) {

            ctx.fillStyle =
                "#141714";


            ctx.fillRect(

                wall.x,
                wall.y,

                wall.w,
                wall.h

            );


            ctx.strokeStyle =
                "#555b52";


            ctx.strokeRect(

                wall.x,
                wall.y,

                wall.w,
                wall.h

            );

        }


        /*
           Furniture.
        */

        for (
            const item
            of furniture
        ) {

            drawFurniture(
                item
            );

        }


        /*
           FINAL OBSTACLES.
        */

        if (finalChase) {

            for (
                const obstacle
                of finalObstacles
            ) {

                drawFinalObstacle(
                    obstacle
                );

            }

        }


        /*
           Clues.
        */

        for (
            const clue
            of clues
        ) {

            if (

                clue.active &&
                !clue.found

            ) {

                const pulse =
                    Math.sin(
                        Date.now() /
                        180
                    ) * 3;


                ctx.fillStyle =
                    "#d9c98e";


                ctx.fillRect(

                    clue.x -
                        11 -
                        pulse,

                    clue.y -
                        8 -
                        pulse,

                    22 +
                        pulse * 2,

                    16 +
                        pulse * 2

                );


                ctx.strokeStyle =
                    "#fff0ae";


                ctx.strokeRect(

                    clue.x -
                        11 -
                        pulse,

                    clue.y -
                        8 -
                        pulse,

                    22 +
                        pulse * 2,

                    16 +
                        pulse * 2

                );

            }

        }


        /*
           MP3.
        */

        if (
            !mp3Object.collected
        ) {

            ctx.fillStyle =
                "#151818";


            ctx.fillRect(

                mp3Object.x - 15,
                mp3Object.y - 20,

                30,
                40

            );


            ctx.fillStyle =
                "#aaa";


            ctx.fillRect(

                mp3Object.x - 8,
                mp3Object.y - 12,

                16,
                9

            );

        }


        /*
           Killer.
        */

        drawCharacter(

            killer.x,
            killer.y,

            true

        );


        /*
           Alex.
        */

        drawCharacter(

            player.x,
            player.y,

            false

        );


        ctx.restore();

    }


    /* =====================================================
       FINAL OBSTACLE DRAW
    ===================================================== */

    function drawFinalObstacle(
        obstacle
    ) {

        ctx.fillStyle =
            "#292b29";


        ctx.fillRect(

            obstacle.x,
            obstacle.y,

            obstacle.w,
            obstacle.h

        );


        ctx.strokeStyle =
            "#77786f";


        ctx.lineWidth =
            3;


        ctx.strokeRect(

            obstacle.x,
            obstacle.y,

            obstacle.w,
            obstacle.h

        );


        ctx.strokeStyle =
            "#454742";


        ctx.lineWidth =
            4;


        if (
            obstacle.w >
            obstacle.h
        ) {

            for (
                let x =
                    obstacle.x + 20;

                x <
                    obstacle.x +
                    obstacle.w;

                x += 45
            ) {

                ctx.beginPath();


                ctx.moveTo(
                    x,
                    obstacle.y + 10
                );


                ctx.lineTo(

                    x - 15,

                    obstacle.y +
                    obstacle.h -
                    10

                );


                ctx.stroke();

            }

        } else {

            for (
                let y =
                    obstacle.y + 20;

                y <
                    obstacle.y +
                    obstacle.h;

                y += 45
            ) {

                ctx.beginPath();


                ctx.moveTo(

                    obstacle.x + 10,
                    y

                );


                ctx.lineTo(

                    obstacle.x +
                    obstacle.w -
                    10,

                    y - 15

                );


                ctx.stroke();

            }

        }

    }


    /* =====================================================
       FURNITURE DRAW
    ===================================================== */

    function drawFurniture(
        item
    ) {

        if (
            item.type === "desk"
        ) {

            ctx.fillStyle =
                "#68462f";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            return;

        }


        if (
            item.type === "table"
        ) {

            ctx.fillStyle =
                "#704b32";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            ctx.strokeStyle =
                "#a0784f";


            ctx.strokeRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            return;

        }


        if (
            item.type === "shelf"
        ) {

            ctx.fillStyle =
                "#4a3527";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            ctx.fillStyle =
                "#98734b";


            for (
                let y =
                    item.y + 30;

                y <
                    item.y +
                    item.h;

                y += 55
            ) {

                ctx.fillRect(

                    item.x,
                    y,

                    item.w,
                    5

                );

            }


            return;

        }


        if (
            item.type === "arcade"
        ) {

            ctx.fillStyle =
                "#11191d";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            ctx.fillStyle =
                "#718d84";


            ctx.fillRect(

                item.x + 12,
                item.y + 20,

                item.w - 24,
                60

            );


            ctx.fillStyle =
                "#050606";


            ctx.fillRect(

                item.x + 20,
                item.y + 35,

                item.w - 40,
                25

            );


            return;

        }


        if (
            item.type === "counter"
        ) {

            ctx.fillStyle =
                "#555b57";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            return;

        }


        if (
            item.type === "fridge"
        ) {

            ctx.fillStyle =
                "#747b77";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            return;

        }


        if (
            item.type === "bed"
        ) {

            ctx.fillStyle =
                "#57445c";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );


            ctx.fillStyle =
                "#89758e";


            ctx.fillRect(

                item.x + 20,
                item.y + 20,

                item.w - 40,
                65

            );


            return;

        }


        if (
            item.type === "chair"
        ) {

            ctx.fillStyle =
                "#58433a";


            ctx.fillRect(

                item.x,
                item.y,

                item.w,
                item.h

            );

        }

    }


    /* =====================================================
       CHARACTER DRAW
    ===================================================== */

    function drawCharacter(
        x,
        y,
        isKiller
    ) {

        ctx.save();


        ctx.translate(
            x,
            y
        );


        /*
           Shadow.
        */

        ctx.fillStyle =
            "rgba(0,0,0,.45)";


        ctx.beginPath();


        ctx.ellipse(

            0,
            25,

            28,
            10,

            0,
            0,
            Math.PI * 2

        );


        ctx.fill();


        /*
           Body.
        */

        ctx.fillStyle =
            isKiller
                ? "#181919"
                : "#40554b";


        ctx.fillRect(

            -17,
            -5,

            34,
            40

        );


        /*
           Head.
        */

        ctx.fillStyle =
            isKiller
                ? "#6c6b67"
                : "#c5a689";


        ctx.fillRect(

            -18,
            -38,

            36,
            33

        );


        /*
           Hair.
        */

        ctx.fillStyle =
            "#252525";


        ctx.fillRect(

            -18,
            -40,

            36,
            11

        );


        /*
           Eyes.
        */

        ctx.fillStyle =
            isKiller
                ? "#eee"
                : "#151515";


        ctx.fillRect(

            -10,
            -22,

            5,
            5

        );


        ctx.fillRect(

            5,
            -22,

            5,
            5

        );


        /*
           Arms.
        */

        ctx.fillStyle =
            isKiller
                ? "#202120"
                : "#c5a689";


        ctx.fillRect(

            -29,
            -2,

            12,
            30

        );


        ctx.fillRect(

            17,
            -2,

            12,
            30

        );


        /*
           Legs.
        */

        ctx.fillStyle =
            "#151615";


        ctx.fillRect(

            -15,
            30,

            11,
            22

        );


        ctx.fillRect(

            4,
            30,

            11,
            22

        );


        ctx.restore();

    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetGame() {

        player.x =
            700;

        player.y =
            2550;


        killer.x =
            3650;

        killer.y =
            600;


        killer.chasing =
            false;

        killer.lostTimer =
            0;

        killer.patrolIndex =
            0;


        cluesFound =
            0;


        clues.forEach(
            (clue, index) => {

                clue.found =
                    false;

                clue.active =
                    index < 4;

            }
        );


        clues[4].active =
            false;


        mp3Object.collected =
            false;


        finalObstacles =
            [];


        finalChase =
            false;


        gameFinished =
            false;


        power =
            100;


        nightSeconds =
            0;


        cluesText.textContent =
            "0 / 5";


        powerText.textContent =
            "100%";


        timeText.textContent =
            "12:00 AM";


        objective.textContent =
            translations[
                currentLanguage
            ].objective;


        danger.style.display =
            "none";


        interact.style.display =
            "none";


        message.style.display =
            "none";


        mp3Box.style.display =
            "none";


        closeCam();


        stopEverything();

    }


    /* =====================================================
       TIME
    ===================================================== */

    function updateTime() {

        nightSeconds +=
            1 / 60;


        const totalMinutes =
            Math.floor(
                nightSeconds
            );


        let hour =
            Math.floor(
                totalMinutes /
                60
            );


        const minute =
            totalMinutes %
            60;


        if (
            hour > 12
        ) {

            hour -=
                12;

        }


        if (
            hour === 0
        ) {

            hour =
                12;

        }


        timeText.textContent =

            hour +
            ":" +
            String(
                minute
            ).padStart(
                2,
                "0"
            ) +
            " AM";


        power -=
            0.0015;


        power =
            Math.max(
                0,
                power
            );


        powerText.textContent =
            Math.floor(
                power
            ) +
            "%";

    }


    /* =====================================================
       MAIN LOOP
    ===================================================== */

    function loop() {

        if (running) {

            if (!cameraOpen) {

                updatePlayer();

                updateKiller();

                updateRoom();


                /*
                   Reach security office
                   during final chase.
                */

                if (

                    finalChase &&

                    inOffice(
                        player.x,
                        player.y
                    )

                ) {

                    finishFinalChase();

                }


                /*
                   Killer catches Alex.
                */

                if (

                    distance(
                        player,
                        killer
                    ) < 42 &&

                    !inOffice(
                        player.x,
                        player.y
                    )

                ) {

                    player.x =
                        700;

                    player.y =
                        2550;


                    killer.chasing =
                        false;


                    stopSound(
                        sounds.chase
                    );


                    if (finalChase) {

                        showMessage(
                            "THE FIGURE CAUGHT YOU.\n\n" +
                            "KEEP RUNNING."
                        );

                    } else {

                        showMessage(
                            "THE FIGURE FOUND YOU.\n\n" +
                            "You escaped back to the security office."
                        );

                    }

                }


                drawWorld();

            } else {

                drawCamera();

            }


            updateTime();

        }


        requestAnimationFrame(
            loop
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    applyLanguage();


    console.log(
        "HARVEY — KINETIC STUDIOS FINAL CHASE READY"
    );


    loop();

});