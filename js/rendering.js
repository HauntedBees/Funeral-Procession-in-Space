const gfx = {
    canvas: [],  ctx: [], pi2: Math.PI * 2, 
    canvasWidth: 960, canvasHeight: 760,
    tileWidth: 960, tileHeight: 720, scale: 1,
    spritesheets: [],
    LoadSpriteSheets: function(source, paths, callback) {
        count = 0; source = source || "img";
        paths.forEach(function(path) {
            const f = function(path, len) {
                const img = new Image();
                img.onload = function() {
                    gfx.spritesheets[path] = this;
                    count += 1;
                    if(count === len) { callback(); }
                };
                img.src = `${source}/${path}.png`;
            };
            f(path, paths.length);
        });
    },

    ClearLayer: key => gfx.ctx[key].clearRect(0, 0, gfx.canvasWidth, gfx.canvasWidth),
    ClearSome: keys => keys.forEach(e => gfx.ClearLayer(e)),
    ClearAll: function(includingTutorial) {
        for(const key in gfx.ctx) {
            if(key === "tutorial" && !includingTutorial) { continue; } 
            gfx.ClearLayer(key);
        }
    },
    DrawMapCharacter: function(x, y, offset, sheet, w, h, layer, sx, sy) {
        layer = layer || "characters"; sx = sx || 0; sy = sy || 0;
        gfx.drawImage(gfx.ctx[layer], gfx.spritesheets[sheet], sx * w, sy * h, w, h, (x - offset.x), (y - offset.y), w, h);
    },
    DrawStar: function(x, y, radius) {
        const layer = gfx.ctx["background"];
        layer.beginPath();
        layer.rect(x, y, radius * 1.5, radius * 1.5);
        layer.fill();
    },
    DrawHUDRect: function(x, y, w, h, fillColor) {
        const bg = gfx.ctx["HUD"];
        bg.fillStyle = fillColor || "#FFFFFF";
        bg.fillRect(x, y, w, h);
        bg.stroke();
    },
    DrawLaser: function(laser) {
        const layer = gfx.ctx["characters"];
        layer.strokeStyle ="#00FF00";
        layer.lineWidth = "3";
        layer.beginPath();
        layer.moveTo(laser.sx, laser.sy);
        layer.lineTo(laser.dx, laser.dy);
        layer.stroke();
    },
    GetFont: () => "PressStart2P",
    GetFontSize: function(size, justNum) {
        size = size || 22;
        return justNum === true ? size : size + "px ";
    },
    DrawSpaceText: function(textInfo) {
        const bottom = Math.ceil(gfx.DrawWrappedText(textInfo.text, 160, 30, 770, "#2B87FF", 144));
        const noOffset = { x: 0, y: 0 };
        gfx.DrawMapCharacter(0, bottom, noOffset, "spacebottom", 960, 6, "menu");
        gfx.DrawMapCharacter(0, 0, noOffset, "profiles", 150, 150, "menu", textInfo.px, textInfo.py);
        gfx.DrawMapCharacter(0, 0, noOffset, "border", 150, 150, "menu");
    },
    DrawSpaceChoice: function(text, y, selected) {
        gfx.DrawWrappedText(text, 160, y, 770, selected ? "#2B87FF": "#5B80AD", 40, true);
    },
    DrawSpeechBubble: function(textInfo, target) {
        const bottom = Math.ceil(gfx.DrawFullText(textInfo.text));
        const noOffset = { x: 0, y: 0 };
        gfx.DrawMapCharacter(0, bottom, noOffset, "talkbottom", 960, 15, "menu");
        if(textInfo.isThought) {
            gfx.DrawMapCharacter(450, bottom + 13, noOffset, "bubblebottom", 60, 50, "menu");
        } else {
            const offset = this.GetMapOffset(game.currentHandler, game.playerPos.x, game.playerPos.y);
            offset.y = 0;
            gfx.DrawMapCharacter(target.x - 30, bottom + 13, offset, "bubblebottom", 60, 50, "menu", 1);
        }
    },
    DrawFullText: function(t, y) { return gfx.DrawWrappedText(t, 10, 30 + (y || 0), 940); },
    DrawWrappedText: function(t, x, y, maxWidth, fillColor, minBottom, extraPadding) {
        minBottom = minBottom || 0;
        const ctx = gfx.ctx["menutext"];
        ctx.fillStyle = "#000000";
        size = gfx.GetFontSize(22, true);
        ctx.font = size + "px " + gfx.GetFont();
        const ddy = size * 1.25, ts = t.split(" ");
        let row = ts[0], dy = 0;
        for(let i = 1; i < ts.length; i++) {
            const textInfo = ctx.measureText(row + " " + ts[i]);
            if(textInfo.width > maxWidth || row.indexOf("\n") >= 0) {
                ctx.fillText(row, x, (y + dy));
                dy += ddy;
                row = ts[i];
            } else {
                row += " " + ts[i];
            }
        }
        ctx.fillText(row, x, (y + dy));

        const bg = gfx.ctx["menu"];
        bg.fillStyle = fillColor || "#FFFFFF";//"#2B87FF";
        bg.fillRect(0, y - 30, 960, Math.max(dy + ddy, minBottom) + (extraPadding ? 5: 2));
        bg.stroke();
        return Math.max((y + dy - 2), minBottom);
    },
    GetMapOffset: function(map, centerx, centery) {
        const w = map.mapWidth, h = map.mapHeight;
        return {
            x: Math.min(w - gfx.tileWidth, Math.max(centerx - (gfx.tileWidth / 2), 0 + 0.5)),
            y: Math.min(h - gfx.tileHeight, Math.max(centery - (gfx.tileHeight / 2), 0))
        };
    },
    DrawMap: function(handler, centerx, centery) {
        const mapImg = gfx.spritesheets[handler.map];
        const offset = gfx.GetMapOffset(handler, centerx, centery);
        gfx.drawImage(gfx.ctx["background"], mapImg, offset.x, offset.y, gfx.canvasWidth, gfx.canvasHeight, 0, 0, gfx.canvasWidth, gfx.canvasHeight);
        return offset;
    },
    drawImage: function(ctx, image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH) {
        ctx.drawImage(image, srcX * gfx.scale, srcY * gfx.scale, srcW * gfx.scale, srcH * gfx.scale, dstX * gfx.scale, dstY * gfx.scale, dstW * gfx.scale, dstH * gfx.scale);  
    },
    numberDeltas: { "1": [1, 0], "2": [2, 0], "3": [3, 0], "4": [4, 0], "5": [5, 0], "6": [1, 1], "7": [2, 1], "8": [3, 1], "9": [4, 1], "0": [5, 1] }
};