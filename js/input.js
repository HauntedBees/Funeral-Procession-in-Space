const controls = { up: "w", left: "a", down: "s", right: "d", confirm: " ", secondConfirm: "e", cancel: "q", pause: "Enter" };
let input = {
    justPressed: {}, keys: {}, mainKey: undefined,
    IsFreshPauseOrConfirmPress: () => (input.justPressed[controls.pause] === 0) || (input.justPressed[controls.confirm] === 0),
    setMainKey: function(key) {
        if(key === undefined) {
            if(input.keys[controls.up] !== undefined) { input.mainKey = 0; }
            else if(input.keys[controls.left] !== undefined) { input.mainKey = 1; }
            else if(input.keys[controls.down] !== undefined) { input.mainKey = 2; }
            else if(input.keys[controls.right] !== undefined) { input.mainKey = 3; }
            else { input.mainKey = undefined; }
        } else if(input.mainKey === undefined) {
            input.mainKey = [controls.up, controls.left, controls.down, controls.right].indexOf(key);
        }
    },
    ClearAllKeys: function() {
        input.mainKey = undefined;
        for(const key in input.keys) {
            clearInterval(input.keys[key]);
            input.keys[key] = undefined;
        }
    },
    IsIgnoredByKeyPress(key) {
        if(key.indexOf("Arrow") === 0) { return true; }
        if(key[0] === "F" && key.length > 1) { return true; }
        return ["Alt", "Shift", "Control", "CapsLock", "Tab", "Escape", "Backspace", "NumLock",
                "Delete", "End", "PageDown", "PageUp", "Home", "Insert", "ScrollLock", "Pause"].indexOf(key) >= 0;
    },
    GetKey: e => e.key.length === 1 ? e.key.toLowerCase() : e.key,
    keyDown: function(e) {
        const key = input.GetKey(e);
        input.justPressed[key] = input.justPressed[key] === undefined ? 0 : input.justPressed[key] + 1;
        if([controls.up, controls.left, controls.down, controls.right].indexOf(key) >= 0 && game.currentHandler.freeMovement) {
            input.setMainKey(key);
            if(input.keys[key] !== undefined) { return; }
            input.keys[key] = setInterval(function() {
                game.currentHandler.KeyPress(key);
            }, 50);
        } else if(input.IsIgnoredByKeyPress(key)) { game.currentHandler.KeyPress(key); }
    },
    keyUp: function(e) {
        const key = input.GetKey(e);
        input.justPressed[key] = -1;
        if([controls.up, controls.left, controls.down, controls.right].indexOf(key) >= 0 && game.currentHandler.freeMovement) {
            clearInterval(input.keys[key]);
            input.keys[key] = undefined;
            input.setMainKey();
        }
        if(game.currentHandler.freeMovement) {
            if(input.keys[controls.up] === undefined 
                && input.keys[controls.left] === undefined 
                && input.keys[controls.right] === undefined 
                && input.keys[controls.down] === undefined) {
                    // TODO: SOMETHING ELSE
                }
        }
    },
    keyPress: function(e) {
        const key = input.GetKey(e);
        if(key === "`") { return input.HandleConsole(); }
        if([controls.up, controls.left, controls.down, controls.right].indexOf(key) >= 0 && game.currentHandler.freeMovement) {
            return;
        }
        game.currentHandler.KeyPress(key);
        input.justPressed[key]++;
    }
};