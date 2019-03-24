const scenes = {
    SayTheLine: function(word, fromChoice) {
        gfx.ClearSome(["menu", "menutext"]);
        Sounds.EndAll();
        gfx.DrawSpaceText(word);
        space.freeMovement = false;
        input.ClearAllKeys();
        if(!fromChoice) { game.dChoice = 0; }
        if(word.options !== undefined) {
            for(let i = 0; i < word.options.length; i++) {
                gfx.DrawSpaceChoice(word.options[i].choice, 190 + i * 50, i === game.dChoice);
            }
        }
        if(word.flag) { console.log("ADDING FLAG  " + word.flag); space.flags.push(word.flag); }
        if(word.trigger) {
            switch(word.trigger) {
                case 1: 
                    space.stopped = true;
                    space.cutsceneObj.moveSpeed = 0;
                    space.cutsceneObj.jet = false;
                    break;
                case 2: 
                    space.stopped = false;
                    break;
            }
        }
        if(word.sound !== undefined) {
            const length = Math.ceil((word.text.split(/:(.+)/)[1] || "abba dabba").length / 10);
            Sounds.PlaySound(word.sound, length);
        }
    },
    TriggerScene: function(key) {
        game.dialog = { key: key, idx: 0 };
        scenes.SayTheLine(words[key][0]);
    },
    HandleCutsceneTriggers: function() {
        switch(space.gameState) {
            case 0: 
                if(space.scrolledX >= 400) {
                    space.gameState++;
                    space.cutsceneObj = space.CreateShip("CommandShip", space.players[0].x + space.scrolledX, -100, 0, true);
                    space.cutsceneObj.moveSpeedY = 5;
                }
                break;
            case 1:
                if(space.cutsceneObj.y >= 120) {
                    space.gameState++;
                    space.cutsceneObj.moveSpeedY = 0;
                    space.cutsceneObj.moveSpeedY = 0;
                    scenes.TriggerScene("intro");
                }
                break;
            case 2:
                if(game.dialog === undefined) {
                    space.gameState++;
                    space.cutsceneObj.moveSpeedY = -30;
                    space.showHealth = true;
                }
                break;
            case 3:
                if(space.cutsceneObj.y <= -100) {
                    space.gameState++;
                    space.objects = [];
                }
                break;
            case 4: return Regulars.PastXShipInFrontPlayer(1000, "BlehFeh");
            case 5: return Regulars.IsNearStartCutscene("firstEncounter");
            case 6: return Regulars.FlyAwayAfterCutscene(100, -100);
            case 7: return Regulars.AdvanceWhenGone();
            case 8: return Regulars.PastXShipInFrontPlayer(1600, "BlehFeh");
            case 9: return Regulars.IsNearStartCutscene("secondEncounter");
            case 10: Regulars.FlyAwayAfterCutscene(-100, -100); break;
            case 11: return Regulars.AdvanceWhenGone();
            case 12: Regulars.PastXShipInFrontPlayer(2000, "Jetty"); break;
            case 13: return Regulars.IsNearStartCutscene("warzoneWarning");
            case 14: Regulars.FlyAwayAfterCutscene(0, -10); break;
            case 15: Regulars.TurnAtY(50, -100); break;
            case 16: return Regulars.AdvanceWhenGone();
            case 17: Regulars.PastXShipInFrontPlayer(3000, "Pirate", -150); break;
            case 18: return Regulars.IsNearStartCutscene("pirate");
            case 19: Regulars.FlyAwayAfterCutscene(-100, -100); break;
            case 20: return Regulars.AdvanceWhenGone();
            case 21: Regulars.PastXShipInFrontPlayer(5000, "Attacker", -100); break;
            case 22: 
                space.extraShit = { t: 0, startY: space.cutsceneObj.y };
                return Regulars.IsNearStartCutscene("attacker");
            case 23:
                if(space.scrolledX >= 7000) {
                    space.cutsceneObj.moveSpeed = space.normalScrollSpd;
                    space.cutsceneObj.moveSpeedY = 0;
                    space.lasers.push({ sx: 250, sy: -100, dx: space.cutsceneObj.x - space.scrolledX + 100, dy: space.cutsceneObj.y + 100 });
                    space.gameState++;
                    setTimeout(function() {
                        space.lasers = [];
                        space.cutsceneObj.health = 0;
                    }, 1000);
                } else if(game.dialog === undefined) {
                    space.cutsceneObj.y = space.extraShit.startY + 300 * Math.sin(0.05 * space.extraShit.t++);
                    if(Math.random() < 0.075) {
                        space.CreateShip("Zap1", space.cutsceneObj.x, space.cutsceneObj.y, -10);
                    }
                }
                break;
            case 24: 
                if(space.scrolledX >= 7200) {
                    space.gameState++;
                    space.cutsceneObj = space.CreateShip("CommandShip", space.players[0].x + space.scrolledX, -100, 0, true);
                    space.cutsceneObj.moveSpeedY = 5;
                }
                break;
            case 25:
                if(space.cutsceneObj.y >= 120) {
                    space.gameState++;
                    space.cutsceneObj.moveSpeedY = 0;
                    scenes.TriggerScene("return");
                }
                break;
            case 26: return Regulars.FlyAwayAfterCutscene(0, -100);
            case 27: return Regulars.AdvanceWhenGone();
            case 28: 
                if(space.scrolledX >= 9000) {
                    if(space.flags.indexOf("joker") >= 0) {
                        scenes.TriggerScene("joaje");
                        space.gameState++;
                    } else {
                        console.log("SKIPPIN!");
                        space.gameState += 2;
                    }
                }
                break;
            case 29: return Regulars.AdvanceAfterCutscene();
            case 30: return Regulars.PastXShipInFrontPlayer(12000, "Hacker", -100);
            case 31: return Regulars.IsNearStartCutscene("hacker");
            case 32: 
                if(game.dialog === undefined) {
                    space.gameState++;
                    space.extraShit = { t: 0, startY: space.cutsceneObj.y, startX: space.cutsceneObj.x };
                    const delay = (space.flags.indexOf("honest") >= 0) ? 4000 : 45000;
                    setTimeout(function() {
                        space.gameState++;
                    }, delay);
                }
                break;
            case 33: 
                space.cutsceneObj.y = space.extraShit.startY + 300 * Math.sin(0.05 * space.extraShit.t++);
                space.cutsceneObj.x = space.extraShit.startX + 100 * Math.sin(0.04 * space.extraShit.t++);
                if(Math.random() < 0.125) {
                    space.CreateShip("Zap2", space.cutsceneObj.x, space.cutsceneObj.y, -15);
                }
                break; // waiting for timeout
            case 34:
                space.secondFriend = space.cutsceneObj;
                if(space.flags.indexOf("honest") >= 0) {
                    space.cutsceneObj = space.CreateShip("BlehFeh", space.players[0].x + space.scrolledX - 600, space.players[0].y - 150, 10, true);
                    space.gameState = 35;
                } else {
                    space.cutsceneObj = space.CreateShip("CommandShip", space.players[0].x + space.scrolledX - 600, space.players[0].y - 150, 50, true);
                    space.gameState = 40;
                }
                break;
            case 35:
                const dispX = space.cutsceneObj.x - space.scrolledX;
                if(dispX >= 200) {
                    space.cutsceneObj.moveSpeed = 0;
                    scenes.TriggerScene("alienfound");
                    space.gameState++;
                }
                break;
            case 36:
                if(game.dialog === undefined) {
                    space.gameState++;
                    space.lasers.push({ sx: space.cutsceneObj.x - space.scrolledX + 87, sy: space.cutsceneObj.y + 57, dx: space.secondFriend.x - space.scrolledX + 100, dy: space.secondFriend.y + 100 });
                    setTimeout(function() {
                        space.lasers = [];
                        space.secondFriend.health = 0;
                        space.gameState++;
                    }, 300);
                }
                break;
            case 37: break; // waiting for timeout
            case 38:
                space.gameState++;
                scenes.TriggerScene("alienSaved");
                break;
            case 39:
                if(game.dialog === undefined) {
                    space.gameState = 48;
                    space.cutsceneObj.moveSpeed = space.normalScrollSpd;
                }
                break;
            case 40:
                const dispX2 = space.cutsceneObj.x - space.scrolledX;
                if(dispX2 >= 200) {
                    space.cutsceneObj.moveSpeed = 0;
                    scenes.TriggerScene("usfound");
                    space.gameState++;
                }
                break;
            case 41:
                if(game.dialog === undefined) {
                    space.gameState++;
                    space.lasers.push({ sx: space.cutsceneObj.x - space.scrolledX + 100, sy: space.cutsceneObj.y + 50, dx: space.secondFriend.x - space.scrolledX + 100, dy: space.secondFriend.y + 100 });
                    setTimeout(function() {
                        space.lasers = [];
                        space.secondFriend.health = 0;
                        space.gameState++;
                    }, 300);
                }
                break;
            case 42: break; // waiting for timeout
            case 43:
                space.gameState++;
                scenes.TriggerScene("stewardeenSaved");
                break;
            case 44:
                if(game.dialog === undefined) {
                    space.gameState++;
                    space.cutsceneObj.moveSpeed = space.normalScrollSpd;
                }
                break;
            case 45: 
                if(space.scrolledX >= 13000) {
                    space.gameState++;
                    scenes.TriggerScene("stewardeenEnd");
                }
                break;
            case 46: return Regulars.FlyAwayAfterCutscene(0, -100);
            case 47: return Regulars.AdvanceAfterCutscene();
            case 48: 
                if(space.scrolledX >= 13500) {
                    space.gameState++;
                    game.currentHandler = theEnd;
                    game.currentHandler.SetUp();
                }
                break;
            case 100: 
                if(game.dialog === undefined) {
                    space.gameState++;
                    game.dialog = undefined;
                    game.currentHandler = gameOver;
                    game.currentHandler.SetUp();
                }
                break;
        }
    }
};
const Regulars = {
    PastXShipInFrontPlayer: function(x, shipName, dy) {
        dy = dy || -40;
        if(space.scrolledX >= x) {
            space.gameState++;
            space.cutsceneObj = space.CreateShip(shipName, space.players[0].x + space.scrolledX + 600, space.players[0].y + dy, -10);
        }
    },
    IsNearStartCutscene: function(cutscene) {
        const dist = (space.cutsceneObj.x - space.scrolledX - space.players[0].x);
        if(dist < 300) {
            space.gameState++;
            space.cutsceneObj.moveSpeed = 5;
            scenes.TriggerScene(cutscene);
        }
    },
    AdvanceAfterCutscene: function() {
        if(game.dialog === undefined) {
            space.gameState++;
        }
    },
    FlyAwayAfterCutscene: function(dx, dy) {
        if(game.dialog === undefined) {
            space.gameState++;
            space.cutsceneObj.moveSpeed = dx;
            space.cutsceneObj.moveSpeedY = dy;
        }
    },
    TurnAtY: function(y, dx) {
        if(space.cutsceneObj.y <= y) {
            space.gameState++;
            space.cutsceneObj.moveSpeed = dx;
            space.cutsceneObj.moveSpeedY = 0;
        }
    },
    AdvanceWhenGone: function() {
        if(space.cutsceneObj.y <= -100 || (space.cutsceneObj.x - space.scrolledX) < 0) { console.log("FRESH!"); space.gameState++; }
    }
}