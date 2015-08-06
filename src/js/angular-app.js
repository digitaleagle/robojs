/*global  angular: false, localStorage: false, $: false */
/*jslint  white: true */

angular.module("robojs", ["ui.bootstrap", 'ui.ace']);

function RoboJSCtrl($scope, $http) {
    "use strict";
    
    // for the tabs
    $scope.tabArenaActive = false;
    $scope.tabWorkshipActive = false;
    
    // load Local Storage stuff
    if(localStorage.getItem("roboJSGames") === null) {
        $scope.games = [];
    } else {
        $scope.games = JSON.parse(localStorage.getItem("roboJSGames"));
    }
    if(localStorage.getItem("roboJSRobots") === null) {
        $scope.savedRobots = [];
    } else {
        $scope.savedRobots = JSON.parse(localStorage.getItem("roboJSRobots"));
    }

    $scope.robotOptions = [
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
    ];
    $scope.robots = [];
    
    $scope.addRobot = function() {
        var robot = {};
        if($scope.robotType === "saved") {
            robot = $scope.savedRobot;
        } else {
            robot.type = $scope.robotType;
            robot.packageRobot = $scope.packageRobot;
            if(robot.type === "packaged") {
                robot.name = $scope.packageRobot.name;
            } else {
                robot.name= $scope.newRobotName;
            }
            robot.basedOn = $scope.basedOn;
        }
        robot.type = $scope.robotType;
        
        $scope.robots.push(robot);
        $scope.addingRobot = false;
    };
    
    $scope.editRobot = function(robot) {
        $scope.workshopRobot = robot;
        if(!robot.code) {
            $http.get(robot.basedOn.sourcePath).success(function(response) {
                robot.code = response;
            });
        }
        $scope.tabWorkshipActive = true;
    };
    
    $scope.loadGame = function(game) {
        $scope.gameName = game.name;
        $scope.robots = game.robots;
    }
    
    $scope.saveGame = function() {
        var newGame = {
            name: $scope.gameName,
            robots: $scope.robots
        }
        var found = false;
        $.each($scope.games, function(i, game) {
            if(game.name === newGame.name) {
                $scope.games.splice(i, 1, newGame);
                found = true;
            }
        });
        if(!found) {
            $scope.games.push(newGame);
        }
        localStorage.setItem("roboJSGames", JSON.stringify($scope.games));
    };
    
    $scope.saveRobot = function() {
        var found = false;
        $.each($scope.savedRobots, function(i, robot) {
            if(robot.name == $scope.workshopRobot.name) {
                $scope.robots.splice(i, 1, $scope.workshopRobot);
                found = true;
            }
        });
        if(!found) {
            $scope.savedRobots.push($scope.workshopRobot);
        }
        localStorage.setItem("roboJSRobots", JSON.stringify($scope.savedRobots));
    };
    
    $scope.startGame = function() {
        // build the list of robots
        var robots = [];
        $.each($scope.robots, function(index, robot) {
            var robotText;
            var url = window.location.href + "js/base-robot.js";
            var codeText = "importScripts('" + url + "');" + robot.code;
            //  importScripts('base-robot.js');
            if(robot.type == "user" || robot.type == "saved") {
                var blob = new Blob([
                      codeText
                    ], { type: "text/javascript" });
                robotText = window.URL.createObjectURL(blob);
            } else {
                robotText = robot.packageRobot.sourcePath;
            }
            robots.push(robotText);
        });
        var ctx = $("#canvas")[0].getContext("2d")
        $scope.BattleManager.init(ctx, robots);
        $scope.BattleManager.addUpdateListener($scope.updateListener);
        $scope.BattleManager.run();
        $scope.gameState = {
            currentBattleRobots: undefined
        }
        
        
        $scope.tabArenaActive = true;
    };
    
    $scope.updateListener = function(robots) {
        if($scope.gameState.currentBattleRobots === undefined) {
            console.log("update started");
            $scope.gameState.currentBattleRobots = [];
            $.each(robots, function(x, robot) {
                $scope.gameState.currentBattleRobots.push({
                    srcObj: robot,
                    id: robot.id
                });
            });
        }
        $scope.$apply(function() {
            $.each($scope.gameState.currentBattleRobots, function(x, robot) {
               robot.x = robot.srcObj.x; 
               robot.y = robot.srcObj.y;
               robot.health = robot.srcObj.health;
            });
        });
    }
    
    $scope.resizeAce = function() {
        $(".ace_editor").height($(window).height() - $(".ace_editor").offset().top);
    }
}

$(window).resize(function() {
    $(".ace_editor").height($(window).height() - $(".ace_editor").offset().top);
});