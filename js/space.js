const ShipTypes = {
    BeefyZig: { health: 100000, sprite: "ships_small", sx: 0, sy: 0, w: 100, h: 100, bbw: 74, bbh: 62, jet: true, jx: 84, jy: 40 },
    CommandShip: { safe: true, health: 1000, sprite: "commandship", sx: 0, sy: 0, w: 411, h: 79, bbw: 411, bbh: 79, jet: true, jx: 371, jy: 27, moveSpeed: 5, moveSpeedY: 0 },
    Zig: { health: 100, sprite: "ships_small", sx: 0, sy: 0, w: 100, h: 100, bbw: 74, bbh: 62, jet: true, jx: 84, jy: 40 },
    BlehFeh: { safe: true, health: 100, sprite: "ships_small", sx: 1, sy: 0, w: 100, h: 100, bbw: 74, bbh: 62, jet: true, jx: 84, jy: 40 },
    Jetty: { safe: true, health: 1000, sprite: "ships_med", sx: 0, sy: 0, w: 250, h: 250, bbw: 242, bbh: 113, jet: true, jx: 208, jy: 80 },
    Pirate: { safe: true, health: 1000, sprite: "ships_med", sx: 1, sy: 0, w: 250, h: 250, bbw: 230, bbh: 216 },
    Attacker: { health: 1000, sprite: "ships_med", sx: 0, sy: 1, w: 250, h: 250, bbw: 206, bbh: 116, jet: true, jx: 225, jy: 120, explosions: 10 },
    Hacker: { health: 1000, sprite: "ships_med", sx: 1, sy: 1, w: 250, h: 250, bbw: 215, bbh: 135, jet: true, jx: 182, jy: 168, explosions: 60 },
    Zap1: { health: 100, sprite: "ships_small", sx: 0, sy: 1, w: 100, h: 100, bbw: 50, bbh: 50, moveSpeed: -5 },
    Zap2: { health: 100, sprite: "ships_small", sx: 1, sy: 1, w: 100, h: 100, bbw: 100, bbh: 100, moveSpeed: -10 }
};
const space = {
    map: "church", mapWidth: 1440, mapHeight: 1803,
    freeMovement: true, moveSpeed: 10, flags: [], //"honest"], 
    gameState: 0, scrolledX: 0, cutsceneObj: null, 
    //gameState: 12, scrolledX: 1950, cutsceneObj: null, // Jetty
    //gameState: 17, scrolledX: 2950, cutsceneObj: null, // Pirate
    //gameState: 21, scrolledX: 4950, cutsceneObj: null, // Attacker
    //gameState: 24, scrolledX: 7150, cutsceneObj: null, // Saved
    //gameState: 28, scrolledX: 8950, cutsceneObj: null, // Joke
    //gameState: 30, scrolledX: 11950, cutsceneObj: null, // Hacker
    players: [], moveIdx: 0, moveQueue: [], fireFrame: 0, secondFriend: null, 
    normalScrollSpd: 5, dialogScrollSpd: 0.25, stopped: false, 
    stars: [], initialStarDist: 5000, showHealth: false, 
    objects: [], explosions: [], lasers: [], 
    SetUp: function() {
        for(const key in ShipTypes) {
            const e = ShipTypes[key];
            const dw = e.w - e.bbw, dh = e.h - e.bbh;
            ShipTypes[key].rect = { x: dw, y: dh, w: e.bbw, h: e.bbh };
        }
        space.objects = []; space.stars = []; space.explosions = [];
        space.CreateShip("BeefyZig", 800, 500, -15);
        space.CreateShip("BeefyZig", 300, 100, -5);
        space.CreateShip("BeefyZig", 1000, 200, -25);
        space.CreateShip("BeefyZig", -5000, 0, 100, true);
        space.CreateShip("BeefyZig", -5010, 100, 100, true);
        space.CreateShip("BeefyZig", -5020, 500, 100, true);
        space.CreateShip("BeefyZig", -5030, 600, 100, true);
        //space.gameState = 0; space.scrolledX = 0;
        gfx.ctx["background"].fillStyle = "white";
        for(let i = 0; i < 1000; i++) {
            space.stars.push({
                x: space.initialStarDist * Math.random(), 
                y: 960 * Math.random(),
                radius: 0.5 * (0.5 + 4.5 * Math.random())
            });
        }
        game.playerPos = { x: 0, y: 0 };
        const startx = 300, starty = 337;
        space.players = [
            { health: 800, sprite: "sedan", x: startx, y: starty, w: 144, h: 45, rect: space.GetInteriorRect(144, 45) },
            { health: 2000, sprite: "hearse", x: startx - 215, y: starty, w: 177, h: 46, rect: space.GetInteriorRect(177, 46), t: 0, amp: Math.floor(5 + 10 * Math.random()), spd: 0.3 * Math.random() },
            { health: 2000, sprite: "limo", x: startx - 460, y: starty, w: 205, h: 47, rect: space.GetInteriorRect(205, 47), t: 5, amp: Math.floor(5 + 10 * Math.random()), spd: 0.3 * Math.random() }
        ];
        space.moveQueue = [];
        space.moveIdx = setInterval(space.ProcessEverything, 50);
    }, 
    GetInteriorRect: function(w, h) {
        const padding = 35;
        return { x : padding / 2, y: 10 + padding / 2, w: w - padding, h: h - padding };
    },
    CreateShip: function(ship, x, y, moveSpeed, mirrored) {
        const obj = Object.assign({ x: x, y: y, mirrored: mirrored || false }, ShipTypes[ship]);
        if(moveSpeed !== undefined && moveSpeed !== 0) { obj.moveSpeed = moveSpeed; }
        space.objects.push(obj);
        return obj;
    },
    CreateExplosion: function(x, y, speed) {
        space.explosions.push({ x: x - 16, y: y - 48, state: 0, speed: speed || 1 });
    },
    ProcessEverything: function() {
        scenes.HandleCutsceneTriggers();
        if(space.gameState > 100) { return; }
        const currScrollSpeed = game.dialog === undefined ? space.normalScrollSpd: space.dialogScrollSpd;
        if(game.dialog === undefined) { space.MaybeAddNewShips(); }
        if(!space.stopped) { space.scrolledX += currScrollSpeed; }
        for(let i = space.moveQueue.length - 1; i >= 0; i--) {
            const move = space.moveQueue[i];
            if(move.state1 < move.amt && move.state1++ >= 0) {
                space.players[1].x += move.x;
                space.players[1].y += move.y;
            }
            if(move.state2 < move.amt && move.state2++ >= 0) {
                space.players[2].x += move.x;
                space.players[2].y += move.y;
            }
            if(move.state1 >= move.amt && move.state2 >= move.amt) {
                space.moveQueue.splice(i, 1);
            }
        }
        const dScroll = currScrollSpeed / space.normalScrollSpd;
        if(dScroll === 1) {
            space.fireFrame = (space.fireFrame === 0 ? 1 : 0); 
        } else if(space.scrolledX % 2 === 0) {
            space.fireFrame = (space.fireFrame === 0 ? 1 : 0);
        }
        for(let i = 1; i < 3; i++) {
            const e = space.players[i];
            e.deltaY = e.amp * Math.sin(e.spd * e.t);
            e.t += dScroll;
        }
        space.HandleCollisions();
        for(let i = space.objects.length - 1; i >= 0; i--) {
            const e = space.objects[i];
            if(e.health <= 0) {
                space.objects.splice(i, 1);
                let numExplosions = e.explosions || 1 + Math.floor((e.w / 100) * Math.random());
                if(numExplosions === 1) {
                    space.CreateExplosion(e.x, e.y, 2);
                } else {
                    const sx = e.x - e.w / 4, sy = e.y - e.h / 4;
                    while(numExplosions-- > 0) {
                        space.CreateExplosion(sx + Math.random() * e.w, sy + Math.random() * e.h, 2);
                    }
                }
            } else if(e.moveSpeed !== undefined) {
                e.x += e.moveSpeed * dScroll;
                if(e.moveSpeedY !== undefined) { e.y += e.moveSpeedY * dScroll; }
            }
            if(e.moveSpeed !== undefined) {
                const adjustedx = e.x + space.scrolledX;
                if((e.moveSpeed > 0 && adjustedx > 1100) || (e.moveSpeed < 0 && adjustedx < -100)) {
                   // space.objects.splice(i, 1);
                }
            }
        }
        /*while(space.objects.length > 250) {
            space.objects.shift();
        }*/
    },
    MaybeAddNewShips: function() {
        if(space.gameState < 4 || Math.random() > 0.04) { return; }
        const shipType = Math.random() > 0.4 ? "Zig" : "BlehFeh";
        const fromLeft = Math.random() < 0.3;
        if(fromLeft) {
            const y = (game.playerPos.y < 360 ? 360 : 0) + (Math.random() * 360);
            const x = space.scrolledX - 150 + 150 * Math.random();
            space.CreateShip(shipType, x, y, space.normalScrollSpd + 3 + 5 * Math.random(), true);
        } else {
            const y = -10 + Math.random() * 740;
            const x = space.scrolledX + 960 + 200 * Math.random();
            space.CreateShip(shipType, x, y, 15 * Math.random());
        }
    },
    HandleCollisions: function() {
        if(game.dialog !== undefined) { return; }
        // if I want to allow enemy ships to collide, care about that later
        for(let j = 2; j >= 0; j--) {
            for(let i = space.objects.length - 1; i >= 0; i--) {
                const e = space.objects[i];
                if(!e.safe && game.dialog === undefined && space.RectsOverlap(space.players[j].rect, space.players[j], e.rect, space.GetSpacedX(e))) {
                    space.players[j].health -= 2;
                    if(space.players[j].health <= 0) {
                        scenes.TriggerScene("gameover");
                        space.gameState = 100;
                        let numExplosions = 20;
                        const e = space.players[j];
                        while(numExplosions-- > 0) {
                            space.CreateExplosion(e.x + Math.random() * e.w + space.scrolledX - e.w / 2, e.y + Math.random() * e.h - e.h / 2, 2);
                        }
                    }
                    //e.health -= 50;
                }
            }
        }
    },
    GetSpacedX: pos => ({ x: pos.x - space.scrolledX, y: pos.y }),
    RectsOverlap: function(rect1, pos1, rect2, pos2) {
        const r1 = { left: rect1.x + pos1.x, top: rect1.y + pos1.y, right: rect1.x + rect1.w + pos1.x, bottom: rect1.y + rect1.h + pos1.y };
        const r2 = { left: rect2.x + pos2.x, top: rect2.y + pos2.y, right: rect2.x + rect2.w + pos2.x, bottom: rect2.y + rect2.h + pos2.y };
        return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
    },
    DrawEverything: function() {
        gfx.ClearSome(["background", "characters", "HUD"]);
        space.DrawHUD();
        game.playerPos = { x: space.players[0].x, y: space.players[0].y };
        const offset = { x: 0, y: 0 };

        for(let i = space.players.length - 1; i >= 0; i--) {
            const e = space.players[i], deltaY = (i > 0 ? e.deltaY : 0);
            if(e.health > 0) {
                if(!space.stopped) { gfx.DrawMapCharacter(e.x - 37, e.y + 13 + deltaY, offset, "fuel", 40, 28, "characters", space.fireFrame); }
                gfx.DrawMapCharacter(e.x, e.y + deltaY, offset, e.sprite, e.w, e.h, "characters");
            }
        }

        for(let i = space.stars.length - 1; i >= 0; i--) {
            const s = space.stars[i];
            const sx = s.x - space.scrolledX;
            if(sx < -10) {
                s.x += space.initialStarDist;
            } else {
                gfx.DrawStar(sx, s.y, s.radius);
            }
        }
        const mirrored = [];
        for(let i = space.objects.length - 1; i >= 0; i--) {
            const e = space.objects[i];
            const ex = e.x - space.scrolledX;
            if(e.mirrored) {
                mirrored.push(e);
            } else {
                if(e.jet) { gfx.DrawMapCharacter(ex + e.jx, e.y + e.jy, offset, "fuel", 40, 28, "characters", space.fireFrame, 1); }
                gfx.DrawMapCharacter(ex, e.y, offset, e.sprite, e.w, e.h, "characters", e.sx, e.sy);
            }
        }
        const charCtx = gfx.ctx["characters"];
        charCtx.save();
        charCtx.scale(-1, 1);
        for(let i = mirrored.length - 1; i >= 0; i--) {
            const e = mirrored[i];
            const ex = e.x - space.scrolledX;
            if(e.jet) { gfx.DrawMapCharacter(-ex + e.jx - e.w, e.y + e.jy, offset, "fuel", 40, 28, "characters", space.fireFrame, 1); }
            gfx.DrawMapCharacter(-ex - e.w, e.y, offset, e.sprite, e.w, e.h, "characters", e.sx, e.sy);
        }
        charCtx.restore();

        for(let i = space.explosions.length - 1; i >= 0; i--) {
            const e = space.explosions[i];
            if(e.state >= 65) {
                space.explosions.splice(i, 1);
            } else {
                const ex = e.x - space.scrolledX;
                const sx = e.state % 8, sy = Math.floor(e.state / 8);
                gfx.DrawMapCharacter(ex, e.y, offset, "explosion", 128, 128, "characters", sx, sy);
                e.state += e.speed;
            }
        }

        for(let i = 0; i < space.lasers.length; i++) {
            gfx.DrawLaser(space.lasers[i]);
        }

        if(game.debugDraw) {
            const debugCtx = gfx.ctx["characters"];
            for(let i = 0; i < space.players.length; i++) {
                const rect1 = space.players[i].rect;
                const pos1 = space.players[i];
                const r1 = { left: rect1.x + pos1.x, top: rect1.y + pos1.y, right: rect1.x + rect1.w + pos1.x, bottom: rect1.y + rect1.h + pos1.y };

                debugCtx.beginPath();
                debugCtx.lineWidth = "6";
                debugCtx.strokeStyle = "red";
                debugCtx.rect(r1.left, r1.top, rect1.w, rect1.h);
                debugCtx.stroke();
            }
        }
    },
    DrawHUD: function() {
        const offset = { x: 0, y: 0 };
        const distToEnd = Math.min(1, space.scrolledX / 13500);
        const w = 200 * distToEnd;
        gfx.DrawHUDRect(15, 694, w, 13, "#64A5FF");
        gfx.DrawHUDRect(15 + w, 694, 200 - w, 13, "#2B4866");
        gfx.DrawMapCharacter(5, 680, offset, "HUDbars", 214, 40, "HUD");
        gfx.DrawMapCharacter(15 + 165 * distToEnd, 680, offset, "HUDico", 40, 40, "HUD");
        if(space.showHealth) {
            for(let i = 0; i < 3; i++) {
                const ship = space.players[i];
                const hp = ship.health / (i === 0 ? 800 : 2000);
                gfx.DrawHUDRect(28, 610 + i * 25, 165 * hp, 13, "#00FF00");
                gfx.DrawMapCharacter(28, 610 + i * 25, offset, "HUDbars", 214, 40, "HUD", 0, 1);
                gfx.DrawMapCharacter(0, 597 + i * 25, offset, "HUDico", 40, 40, "HUD", 1);
            }
        }
    },
    KeyPress: function(key) {
        const dp = { x: 0, y: 0, amt: 10, state1: -4, state2: -10 };
        let isEnter = false;
        switch(key) {
            case controls.up: 
                dp.y -= space.moveSpeed;
                game.playerDir = 0;
                break;
            case controls.left:
                dp.x -= space.moveSpeed;
                game.playerDir = 1;
                break;
            case controls.down:
                dp.y += space.moveSpeed;
                game.playerDir = 2;
                break;
            case controls.right:
                dp.x += space.moveSpeed;
                game.playerDir = 3;
                break;
            case controls.secondConfirm:
            case controls.confirm:
                isEnter = true;
                break;
        }
        if(isEnter) {
            if(game.dialog === undefined) { return; }
            const wordBatch = words[game.dialog.key];
            const curWords = wordBatch[game.dialog.idx];
            if(curWords.options === undefined) {
                if(++game.dialog.idx >= wordBatch.length || curWords.forceEnd === true) {
                    gfx.ClearSome(["menu", "menutext"]);
                    Sounds.EndAll();
                    game.dialog = undefined;
                    space.freeMovement = true;
                } else {
                    scenes.SayTheLine(wordBatch[game.dialog.idx]);
                }
            } else {
                game.dialog.idx = curWords.options[game.dChoice].jumpTo;
                scenes.SayTheLine(wordBatch[game.dialog.idx]);
            }
        }
        if(dp.x != 0 || dp.y != 0) {
            if(game.dialog === undefined) {
                const potentialPos = { x: space.players[0].x + dp.x, y: space.players[0].y + dp.y };
                if(potentialPos.x < 200 || potentialPos.x > 550 || potentialPos.y < 150 || potentialPos.y > 630) {
                    return false;
                }
                space.players[0].x += dp.x;
                space.players[0].y += dp.y;
                dp.x /= dp.amt;
                dp.y /= dp.amt;
                space.moveQueue.unshift(dp);
            } else {
                const curWords = words[game.dialog.key][game.dialog.idx];
                if(curWords.options === undefined) { return; }
                if(dp.y > 0 && game.dChoice < (curWords.options.length - 1)) { game.dChoice++; }
                else if(dp.y < 0 && game.dChoice > 0) { game.dChoice--; }
                scenes.SayTheLine(curWords, true);
            }
        }
    }
};