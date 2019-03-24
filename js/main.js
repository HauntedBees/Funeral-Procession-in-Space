const game = {
    currentHandler: church, 
    playerPos: { x: 705, y: 700 }, playerDir: 0, 
    mapDrawIdx: 0, debugDraw: false, dialog: undefined, dChoice: 0, 
    Init: function() {
        const canvasLayers = ["background", "characters", "HUD", "menu", "menutext"];
        const assetsToLoad = ["church", "casket", "playersheet", "talkbottom", "bubblebottom", "churchsheet", 
                              "sedan", "hearse", "limo", "fuel", "profiles", "spacebottom", "border",
                              "ships_small", "ships_med", "explosion", "commandship", "HUDbars", "HUDico",
                              "title", "ending", "gameover"];
        let canvasObj = {};
        for(let i = 0; i < canvasLayers.length; i++) {
            const name = canvasLayers[i];
            canvasObj[name] = document.getElementById(name);
        }
        let contextObj = {};
        for(const key in canvasObj) {
            contextObj[key] = canvasObj[key].getContext("2d");
        }
        gfx.canvas = canvasObj; gfx.ctx = contextObj;
        gfx.LoadSpriteSheets("design", assetsToLoad, game.SheetsLoaded);
    },
    SheetsLoaded: function() {
        document.addEventListener("keypress", input.keyPress);
        document.addEventListener("keydown", input.keyDown);
        document.addEventListener("keyup", input.keyUp);
        game.currentHandler = title
        game.currentHandler.SetUp();
        game.mapDrawIdx = setInterval(game.DrawEverything, 50); // was 100
        game.DrawEverything();
    },
    DrawEverything: function() { game.currentHandler.DrawEverything(); },
};
const InRect = (p, rect) => p.x >= rect.x && p.x <= (rect.x + rect.w) && p.y >= rect.y && p.y <= (rect.y + rect.h);