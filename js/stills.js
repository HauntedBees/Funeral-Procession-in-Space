const title = {
    SetUp: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "title", 960, 720, "background", 0, 0);
    },
    DrawEverything: function() {}, 
    KeyPress: function(key) {
        switch(key) {
            case controls.pause: 
            case controls.confirm:
                game.currentHandler = church;
                //input.ClearAllKeys();
                game.currentHandler.SetUp();
                break;
        }
    }
};
const theEnd = {
    SetUp: function() {
        gfx.ClearAll();
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "ending", 960, 720, "background", 0, 0);
    },
    DrawEverything: function() {}, 
    KeyPress: function() {}
};
const gameOver = {
    SetUp: function() {
        gfx.ClearAll();
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "gameover", 960, 720, "background", 0, 0);
    },
    DrawEverything: function() {}, 
    KeyPress: function(key) {
        // lol didn't have time to fix this
        /*switch(key) {
            case controls.pause: 
            case controls.confirm:
                game.currentHandler = church;
                input.ClearAllKeys();
                game.currentHandler.SetUp();
                break;
        }*/
    }
};