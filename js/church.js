const church = {
    map: "church", mapWidth: 1440, mapHeight: 1803,
    freeMovement: true, moveSpeed: 10, playerGapHeight: 100, talkDist: 40, outerMargin: 80, 
    objects: [
        { hidden: true, x: 720, y: 430, w: 1440, h: 50, thickness: 50 },
        { hidden: true, x: 80, y: 0, w: 230, h: 1803, thickness: 1803 },
        { hidden: true, x: 1350, y: 0, w: 230, h: 1803, thickness: 1803 },
        { hidden: true, x: 700, y: 430, w: 150, h: 50, thickness: 50, name: "cross" },
        { sprite: "casket", x: 700, y: 575, w: 504, h: 339, thickness: 220, name: "casket" },
        { sprite: "churchsheet", x: 1065, y: 660, w: 185, h: 390, thickness: 170, name: "priest", dir: 2 },
        { sprite: "churchsheet", x: 425, y: 960, w: 185, h: 390, thickness: 170, sy: 1, name: "oldman", dir: 3 },
        { sprite: "churchsheet", x: 965, y: 1360, w: 185, h: 390, thickness: 170, sy: 2, name: "oldlady", dir: 1 }
    ],
    SetUp: function() {
        game.playerPos = { x: 705, y: 700 };
        game.playerDir = 0;
        const objs = church.objects;
        for(let i = 0; i < objs.length; i++) {
            const e = objs[i];
            e.dx = e.w / 2; e.dy = e.h / 2;
            e.rect = { x: e.x - e.dx, y: (e.y - e.dy + e.h - e.thickness), w: e.w, h: e.thickness };
        }
    },
    DrawEverything: function() {
        if(game.dialog !== undefined) { return; }
        if(game.playerPos.y >= 1500) {
            game.currentHandler = space;
            //input.ClearAllKeys();
            game.currentHandler.SetUp();
            return;
        }
        gfx.ClearAll();
        const offset = gfx.DrawMap(game.currentHandler, game.playerPos.x, game.playerPos.y);
        let lasty = -1, drewPlayer = false;
        const objs = game.currentHandler.objects;
        const debugCtx = gfx.ctx["menu"];
        for(let i = 0; i < objs.length; i++) {
            const e = objs[i];
            if(e.hidden) {
                if(!game.debugDraw) { continue; }
            } else {
               if(!drewPlayer && game.playerPos.y >= lasty && game.playerPos.y < e.y) { church.DrawPlayer(offset); drewPlayer = true; }
                gfx.DrawMapCharacter(e.x - e.dx, e.y - e.dy, offset, e.sprite, e.w, e.h, "characters", e.dir || 0, e.sy || 0);
                lasty = e.y;
            }
            if(game.debugDraw) {
                debugCtx.beginPath();
                debugCtx.lineWidth = "6";
                debugCtx.strokeStyle = "#FF0000";
                //debugCtx.rect(e.x - e.dx - offset.x, e.y - e.dy - offset.y, e.w, e.h);
                debugCtx.rect(e.rect.x - offset.x, e.rect.y - offset.y, e.rect.w, e.rect.h);
                debugCtx.stroke();
            }
        }
        if(!drewPlayer) { church.DrawPlayer(offset); }
    },
    DrawPlayer: function(offset) {
        gfx.DrawMapCharacter(game.playerPos.x - 95, game.playerPos.y - 190, offset, "playersheet", 190, 380, "characters", game.playerDir, 0);
    },
    KeyPress: function(key) {
        const dp = { x: game.playerPos.x, y: game.playerPos.y };
        let isEnter = false, didMove = false;
        switch(key) {
            case controls.up: 
                dp.y -= church.moveSpeed;
                game.playerDir = 0;
                didMove = true;
                break;
            case controls.left:
                dp.x -= church.moveSpeed;
                game.playerDir = 1;
                didMove = true;
                break;
            case controls.down:
                dp.y += church.moveSpeed;
                game.playerDir = 2;
                didMove = true;
                break;
            case controls.right:
                dp.x += church.moveSpeed;
                game.playerDir = 3;
                didMove = true;
                break;
            case controls.secondConfirm:
            case controls.confirm:
                isEnter = true;
                break;
        }
        if(isEnter) {
            if(game.dialog === undefined) {
                switch(game.playerDir) {
                    case 0: dp.y -= church.talkDist; break;
                    case 1: dp.x -= church.talkDist; break;
                    case 2: dp.y += church.talkDist; break;
                    case 3: dp.x += church.talkDist; break;
                }
                dp.y += church.playerGapHeight;
                const objs = church.objects;
                for(let i = 0; i < objs.length; i++) {
                    const e = objs[i];
                    if(e.name === undefined) { continue; }
                    if(InRect(dp, e.rect)) {
                        if(e.dir !== undefined) {
                            switch(game.playerDir) {
                                case 0: e.dir = 2; break;
                                case 1: e.dir = 3; break;
                                case 2: e.dir = 0; break;
                                case 3: e.dir = 1; break;
                            }
                        }
                        game.DrawEverything();
                        game.dialog = { key: e.name, idx: 0, target: e };
                        gfx.DrawSpeechBubble(words[e.name][0], e);
                        return;
                    }
                }
            } else {
                if(++game.dialog.idx >= words[game.dialog.key].length) {
                    game.dialog = undefined;
                } else {
                    gfx.ClearSome(["menu", "menutext"]);
                    gfx.DrawSpeechBubble(words[game.dialog.key][game.dialog.idx], game.dialog.target);
                }
            }
        } else if(didMove && game.dialog === undefined) {
            let hasCollisions = false;
            const m = game.currentHandler;
            const objs = m.objects;
            dp.y += church.playerGapHeight;
            if(dp.x < church.outerMargin || dp.x > (m.mapWidth - church.outerMargin) || dp.y < church.outerMargin || dp.y > (m.mapHeight - church.outerMargin)) { hasCollisions = true; }
            if(!hasCollisions) {
                for(let i = 0; i < objs.length; i++) {
                    const e = objs[i];
                    if(InRect(dp, e.rect)) { hasCollisions = true; break; }
                }
            }
            dp.y -= church.playerGapHeight;
            if(!hasCollisions) { game.playerPos = dp; }
        }
    }
};