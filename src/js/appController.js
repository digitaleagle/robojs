window.roboJS = {
    _pages: null,
    currentGame: null,
    games: null,
    savedRobots: null,
    currentBattleRobots: null,
    _currentBattleRobotsInitialized: false,
    sampleRobotOptions: [
        {
            name: "Scan Bot",
            sourcePath: "js/scan-bot.js"
        },
        {
            name: "Sitting Duck Bot",
            sourcePath: "js/sitting-duck-bot.js"
        },
        {
            name: "Test Robot1",
            sourcePath: "js/test-robot1.js"
        },
        {
            name: "Test Robot2",
            sourcePath: "js/test-robot2.js"
        },
        {
            name: "Stephen's Test Robot",
            sourcePath: "js/stephen-robot.js"
        }
    ],
    registerPages: function(pages) {
        this._pages = pages;
    },
    newGame: function() {
        this.currentGame = {
            name: "",
            robots: [],
            new: true
        };
        this._pages.changePage("editGame");
    },
    editGame: function(game) {
        var controller = this;
        this.currentGame = game;
        
        // reload the saved robots in case the code has changed.
        this.loadRobots();
        for(var x in game.robots) {
            var robot = game.robots[x];
            if(robot.type == "saved") {
                for(y in controller.savedRobots) {
                    if(robot.name == controller.savedRobots[y].name) {
                        game.robots[x] = controller.savedRobots[y];
                    }
                }
            }
        }

        this._pages.changePage("editGame");
    },
    saveGame: function() {
        if(this.games === null) {
            this.loadGames();
        }
        if(this.currentGame.new) {
            this.games.push(this.currentGame);
            this.currentGame.new = false;
        }
        localStorage.setItem("roboJSGames", JSON.stringify(this.games));
    },
    loadGames: function() {
        if(localStorage.getItem("roboJSGames") === null) {
            this.games = [];
        } else {
            this.games = JSON.parse(localStorage.getItem("roboJSGames"));
        }
    },
    listSavedGames: function() {
        this.loadGames();
        this._pages.changePage("listGames");
    },
    listSavedRobots: function() {
        this.loadRobots();
        this._pages.changePage("listRobots");
    },
    loadRobots: function() {
        if(localStorage.getItem("roboJSRobots") === null) {
            this.savedRobots = [];
        } else {
            this.savedRobots = JSON.parse(localStorage.getItem("roboJSRobots"));
        }
        return this.savedRobots;
    },
    editRobot: function() {
        this._pages.changePage("editRobot");
    },
    createRobotFromSample: function(robot) {
        var newRobot = {
            type: "packaged",
            name: robot.name,
            packageRobot: robot
        }
        return newRobot;
    },
    createRobotFromSaved: function(robot) {
        console.log("robot");
        console.log(robot);
        var newRobot = {
            type: "saved",
            name: robot.name,
            code: robot.code
        }
        return newRobot;
    },
    playGame: function() {
        //this._pages.changePage("arena");
        this.currentGame.runningRobots = [];
        for(var x=0; x<this.currentGame.robots.length; x++) {
            var robot=this.currentGame.robots[x];
            var robotText;
            if(robot.type == "user" || robot.type == "saved") {
                var url = window.location.href.replace(/\/[^\/]*\.html/, "/") + "js/base-robot.js";
                var codeText = "importScripts('" + url + "');" + robot.code;
                var blob = new Blob([
                      codeText
                    ], { type: "text/javascript" });
                robotText = window.URL.createObjectURL(blob);
            } else {
                robotText = robot.packageRobot.sourcePath;
            }
            console.log("adding...");
            console.log(robotText);
            console.log(robot.type);
            this.currentGame.runningRobots.push(robotText);
        }
        var ctx = document.querySelector("#canvas").getContext("2d")
        console.log(BattleManager);
        BattleManager.init(ctx, this.currentGame.runningRobots);

        // to track the bots' status
        this._currentBattleRobotsInitialized = false;
        this.currentBattleRobots = [];
        BattleManager.addUpdateListener(this.battleUpdated);

        BattleManager.run();
        
        this._pages.changePage("arena");
    },
    pause: function() {
        BattleManager.pause();
    },
    resume: function() {
        BattleManager.run();
    },
    battleUpdated: function(robots) {
        // because it is a listener for some reason this = the BattleManager
        var roboJS = window.roboJS;
        if(roboJS._currentBattleRobotsInitialized == false) {
            console.log("update started");
            for(var x in robots) {
                var robot = robots[x];
                roboJS.currentBattleRobots.push({
                    srcObj: robot,
                    id: robot.id
                });
            };

            roboJS._currentBattleRobotsInitialized = true;
        }
        for(var x in roboJS.currentBattleRobots) {
            var robot = roboJS.currentBattleRobots[x];
            robot.x = robot.srcObj.x;
            robot.y = robot.srcObj.y;
            robot.health = robot.srcObj.health;
        }
    }
};
