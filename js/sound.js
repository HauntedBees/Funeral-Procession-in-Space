// Get-ChildItem  *.ogg | Rename-Item -NewName { $_.Name.Replace(" (", "").Replace(")", "") }
//const Rand5 = () => (1 + Math.floor(3 * Math.random()));
const soundLens = [
    0.3, 0.45, 0.3, 0.25, 0.25, 0.4, 0.35, 0.45, 0.35
];
let Sounds = {
    SoundTable: {}, PlayingSounds: [], PersistingSounds: [], 
    numTimes: 0, timer: 0, 
    Init: function() {
        const sounds = ["all1", "all2", "all3", "all4", "all5", "all6", "all7"];
        sounds.forEach(s => {
            Sounds.SoundTable[s] = new Audio("sound/" + s + ".ogg");
            Sounds.SoundTable[s].parent = s;
            Sounds.SoundTable[s].onended = function() {
                let i = Sounds.PlayingSounds.indexOf(s);
                if(i >= 0) { Sounds.PlayingSounds.splice(i, 1); return; }
                i = Sounds.PersistingSounds.indexOf(s);
                if(i >= 0) { Sounds.PersistingSounds.splice(i, 1); return; }
            };
        });
    },
    PlaySound: function(idx, numTimes) {
        if(numTimes <= 0) { return; }
        let name = "all" + (1 + Math.floor(6 * Math.random()));
        console.log(`Now Playing: ${name} at time ${idx * 0.5}`);
        Sounds.PlayingSounds.push(name);
        Sounds.numTimes = numTimes;
        Sounds.SoundTable[name].currentTime = idx * 0.5;
        Sounds.SoundTable[name].volume = 1;
        Sounds.SoundTable[name].play();
        Sounds.timer = setTimeout(function() {
            Sounds.SoundTable[name].pause();
            Sounds.PlaySound(idx, numTimes - 1);
        }, soundLens[idx] * 1000);
    },
    EndAll: function() {
        clearTimeout(Sounds.timer);
        Sounds.PlayingSounds.forEach(s => Sounds.SoundTable[s].pause());
        Sounds.PlayingSounds = [];
    }
};
Sounds.Init();