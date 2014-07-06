window.requestAnimFrame = (function() {
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(callback, element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

window.onload = function() {
    var game = new Game();
    console.log(game);
}

function Game() {
    //Permet d'enlever certains "mauvais" côtés du JS
    "use strict";
    
    //Variable globale au jeu
    var canvas, context;
    
    var levelData = {};
    var state = {};
    var param = {};
    var objectData = {};
    var player = {};
    var enemy = {};
    var animationData = {};

    var box2dUtils = {};

    var dev = true;

    //Pour pouvoir appeller Game peu importe le scope
    var that = this;

    this.gameloop = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        that.update();
        that.draw();
        requestAnimationFrame(that.gameloop);
    }

    this.draw = function() {

        switch(state.getState()) {
            case "menu":
                break;
            case "newGame":
                break;
            case "restartLevel":
                break;
            case "nextLevel":
            document.getElementById("score").innerHTML = "Score : " + param.score;
                break;
            case "pause":
            context.fillStyle = "white";

            for (var i = param.life - 1; i >= 0; i--) {
                context.drawImage(param.images[0], 90+(i*30), 2, 20, 20);
            }

            context.fillText("Life:", 10, 20);
            context.fillText("Score:"+param.score, 475, 20);

            context.fillText("PAUSE", canvas.width/2-40, canvas.height/2);
            context.fillText("Press Enter to Play", canvas.width/2-140, canvas.height/2+40);
                break;
            case "inGame":
            context.fillStyle = "white";
            for (var i = param.life - 1; i >= 0; i--) {
                context.drawImage(param.images[0], 90+(i*30), 2, 20, 20);
            }

            context.fillText("Life:", 10, 20);
            context.fillText("Score:"+param.score, 475, 20);

           /* if(param.playerJoint != null) {
                context.strokeStyle = "white";
                context.beginPath();
                context.moveTo(param.playerJoint.m_bodyA.GetPosition().x, param.playerJoint.m_bodyA.GetPosition().y);
                context.lineTo(param.playerJoint.m_bodyB.GetPosition().x, param.playerJoint.m_bodyB.GetPosition().y);
                context.closePath();
                context.stroke();
            }*/
                break;
            case "gameOver":
                 document.getElementById("scoreGameOver").innerHTML = "Score : " + param.score;
                break;
        }
    }

    this.update = function() {

        if(state.getState() != "inGame") {
            clearInterval(param.enemySpawn);
            param.isSpawning = false;
        } else if(param.isSpawning === false) {
            param.enemySpawn = setInterval(function() {
               enemy.spawn();
            }, 5000);
            param.isSpawning = true;
        }

        switch(state.getState()) {
            case "menu":
            if(param.keys[13]) {
                document.getElementById("menu_wrapper").style.visibility = "hidden";
                state.setState("newGame");
            }
                break;
            case "newGame":
                param.level += 1;
                that.createLevel();
                break;
            case "restartLevel":
                box2dUtils.destroyObject(param.world, param.gameObjects);
                box2dUtils.destroyObject(param.world, param.enemies);
                box2dUtils.destroyObject(param.world, param.objectDrawTab);

                var playerUserData = {
                    "name": "player",
                    "img": "p1_front.png"
                }

                param.player = box2dUtils.createPlayer(param.world, 30, 500, 15, 20, 0, false, playerUserData);
                
                param.gameObjects.push(param.player);
                param.objectDrawTab.push(param.player);
                
                enemy.spawn();
                that.createLevel();
                break;
            case "nextLevel":
                document.getElementById("next_level").style.visibility = "visible";
                if(param.keys[13] === true) {
                    param.level++;
                    box2dUtils.destroyObject(param.world, param.gameObjects);
                    box2dUtils.destroyObject(param.world, param.enemies);
                    box2dUtils.destroyObject(param.world, param.objectDrawTab);

                    var playerUserData = {
                        "name": "player",
                        "img": "p1_front.png"
                    }

                    param.player = box2dUtils.createPlayer(param.world, 30, 500, 15, 20, 0, false, playerUserData);
                    
                    param.gameObjects.push(param.player);
                    param.objectDrawTab.push(param.player);
                    
                    enemy.spawn();
                    that.createLevel();
                    document.getElementById("next_level").style.visibility = "hidden";
                }
                break;
            case "pause":
                that.handleInteractions();
                break;
            case "inGame":
                param.world.Step(1 / 60, 10, 10);
                param.world.DrawDebugData();
                param.world.ClearForces();

                that.handleInteractions();
                box2dUtils.destroyObject(param.world, param.destroys);

                animationData.displayImagesLoop();

                player.updateCoords(param);
                enemy.move();
                break;
            case "gameOver":
                document.getElementById("game_over").style.visibility = "visible";
                if(param.keys[13] === true) {
                    param.level = 1;
                    param.life = 3;
                    param.score = 0;

                    box2dUtils.destroyObject(param.world, param.gameObjects);
                    box2dUtils.destroyObject(param.world, param.enemies);
                    box2dUtils.destroyObject(param.world, param.objectDrawTab);

                    var playerUserData = {
                        "name": "player",
                        "img": "p1_front.png"
                    }

                    param.player = box2dUtils.createPlayer(param.world, 30, 500, 15, 20, 0, false, playerUserData);
                    
                    param.gameObjects.push(param.player);
                    param.objectDrawTab.push(param.player);
                    
                    enemy.spawn();
                    that.createLevel();
                    document.getElementById("game_over").style.visibility = "hidden";
                }
                break;
        }
    }

    this.loadImages = function() {
        var count = 0;

        for (var i = param.imagesSrc.length - 1; i >= 0; i--) {
            var img = new Image();
            img.src = param.imagesSrc[i].src;
            img.name = param.imagesSrc[i].name;
            img.onload = function() {
                count++;
            }

            param.images.push(img);
        };
    }

    this.createLevel = function() {
        var levelObject = Object.keys(levelData[param.level]["objectList"]);
        
        param.isJumping = false;
        if(param.playerJoint != null)
            box2dUtils.destroyJoint(param);

        for (var i = levelObject.length - 1; i >= 0; i--) {
            
            var object = levelData[param.level]["objectList"][levelObject[i]];
            
            var x = object.x;
            var y = object.y;
            
            var angle = object.angle;
            
            var name = object.name;
            
            var width = objectData[name].width;
            var height = objectData[name].height;
            
            var fixed = objectData[name].fixed;

            var bodyDef = box2dUtils.createBox(param.world, x, y, width, height, angle, fixed, objectData[name].userData);
            param.gameObjects.push(bodyDef);
            param.objectDrawTab.push(bodyDef);
        };

        state.setState("inGame");
    }


    this.isPlayer = function(object) {
        if(object != null && object.GetUserData() != null)
            return object.GetUserData().name === 'player' || object.GetUserData() === 'footPlayer';
    }

    this.isEnemy = function(object) {
        if(object != null && object.GetUserData() != null)
            return object.GetUserData().name === 'enemy';
    }

    this.addContactListener = function() {
        var b2Listener = Box2D.Dynamics.b2ContactListener;
        var listener = new b2Listener;
    
        listener.BeginContact = function(contact) {
            var obj1 = contact.GetFixtureA();
            var obj2 = contact.GetFixtureB();

            if(that.isPlayer(obj1) || that.isPlayer(obj2)) {
                if(obj2.m_userData != 'wall' || obj1.m_userData != 'wall')
                    param.jumpContacts = 1;

                if(that.isEnemy(obj1) || that.isEnemy(obj2)) {
                    param.life--;
                    if(param.life === 0) {
                        state.setState("gameOver");
                    } else {
                        state.setState("restartLevel");
                    }
                }

                if(obj2.m_userData.name === 'win' || obj1.m_userData.name === 'win')
                    state.setState("nextLevel");

                if(obj1.m_userData.name === "collectible") {
                    param.destroys.push(obj1);
                    for (var i = param.gameObjects.length - 1; i >= 0; i--) {
                        if(param.gameObjects[i] === obj1) {
                            param.gameObjects.splice(i, 1);
                            param.objectDrawTab.splice(i, 1);
                        }
                    };
                    param.score += 10;
                } else if(obj2.m_userData.name === "collectible") {
                    param.destroys.push(obj2);
                    for (var i = param.gameObjects.length - 1; i >= 0; i--) {
                        if(param.gameObjects[i] === obj2) {
                            param.gameObjects.splice(i, 1);
                            param.objectDrawTab.splice(i, 1);
                        }
                    };
                    param.score += 10;
                }
            }

            if(that.isEnemy(obj1) || that.isEnemy(obj2)) {
                if(obj1.m_userData.name === 'wall' || obj2.m_userData.name === 'wall') {
                    param.random = Math.floor(Math.random() * 2);

                    if(obj1.m_userData["name"] === 'enemy') {
                        if(obj1.m_userData["direction"] === 'droite') {
                            obj1.m_userData["direction"] = 'gauche';
                        } else if(obj1.m_userData.direction === 'gauche') {
                            obj1.m_userData["direction"] = 'droite';
                        }
                    } else if(obj2.m_userData["name"] === 'enemy') {
                        if(obj2.m_userData["direction"] === 'droite') {
                            obj2.m_userData["direction"] = 'gauche';
                        } else if(obj2.m_userData["direction"] === 'gauche') {
                            obj2.m_userData["direction"] = 'droite';
                        }
                    }
                }
            }

            if(that.isPlayer(obj1) || that.isPlayer(obj2)) {
                if(obj1.m_userData.name === "littlePlatform" && param.playerJoint != null) {
                    obj1.m_isSensor = false;
                } else if(obj2.m_userData.name === "littlePlatform" && param.playerJoint != null) {
                    obj2.m_isSensor = false;
                }
            }

            if(that.isPlayer(obj1) || that.isPlayer(obj2)) {
                if(obj1.m_userData.name === "spikes" || obj2.m_userData.name === "spikes") {
                    param.life--;
                    if(param.life === 0) {
                        state.setState("gameOver");
                    } else {
                        state.setState("restartLevel");
                    }
                }
            }

            if(that.isEnemy(obj1) || that.isEnemy(obj2)) {
                if(obj1.m_userData.name === "spikes") {
                    param.destroys.push(obj2);
                    for (var i = param.gameObjects.length - 1; i >= 0; i--) {
                        if(param.enemies[i] === obj2) {
                            param.enemies.splice(i, 1);
                        }
                        if(param.gameObjects[i] === obj2) {
                            param.objectDrawTab.splice(i, 1);
                            param.gameObjects.splice(i, 1);
                        }
                    }
                }
                if(obj2.m_userData.name === "spikes") {
                    param.destroys.push(obj1);
                    for (var i = param.gameObjects.length - 1; i >= 0; i--) {
                        if(param.enemies[i] === obj1) {
                            param.enemies.splice(i, 1);
                        }
                        if(param.gameObjects[i] === obj1) {
                            param.objectDrawTab.splice(i, 1);
                            param.gameObjects.splice(i, 1);
                        }
                    }
                }
            }
        }   
    
        // Fin de contact
        listener.EndContact = function(contact) {
            var obj1 = contact.GetFixtureA();
            var obj2 = contact.GetFixtureB();

            if(that.isPlayer(obj1) || that.isPlayer(obj2))
            {
                if(obj2.m_userData.name != 'wall' || obj1.m_userData.name != 'wall')
                    param.jumpContacts = 0;
            }
        }

        listener.PostSolve = function(contact, impulse) {
            // PostSolve
        }

        listener.PreSolve = function(contact, oldManifold) {
        }

        param.world.SetContactListener(listener);
    }

    this.handleKeyDown = function(evt) {
        param.keys[evt.keyCode] = true;
    }

    this.handleKeyUp = function(evt) {
        param.keys[evt.keyCode] = false;
    }

    // Gérer les interactions
    this.handleInteractions = function() {
        if (param.keys[32] && param.isJumping === false) {
            player.jump();
            param.isJumping = true;
        }

        if(param.keys[69]) {
            if(param.playerJoint != null) {
                box2dUtils.destroyJoint(param);
                param.isJumping = false;
            }   
        }

        if(param.velocity.y === 0) {
            param.isJumping = false;
        }

        if(param.keys[80] && state.getState() === "inGame") {
            state.setState("pause");
        } else if(param.keys[13] && state.getState() === "pause") {
            state.setState("inGame");
        }

        if (param.keys[81]) {
            player.moveLeft();
        } else if (param.keys[68]) {
            player.moveRight();
        } 

        if(param.keys[90]) {
            player.settingsGrapple("up");
        } else if (param.keys[83]) {
            player.settingsGrapple("down");
        }
    }

    //Initialisation - tout à la fin 
    this.init = (function() {
        param = paramLibrary();
        levelData = levelLibrary();
        objectData = objectLibrary();

        state = new stateMachine();

        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        context.font = "15px Emulogic";

        box2dUtils = new Box2dUtils(param.scale);
        player = new playerLibrary(param, box2dUtils, context);
        enemy = new enemyLibrary(param, box2dUtils, context);
        animationData = new AnimationManager(param, context)

        param.world = box2dUtils.createWorld(context);

        var playerUserData = {
            "name": "player",
            "img": "p1_front.png"
        }

        param.player = box2dUtils.createPlayer(param.world, 30, 500, 15, 20, 0, false, playerUserData);
        param.gameObjects.push(param.player);
        param.objectDrawTab.push(param.player);

        that.loadImages();

        param.enemySpawn = setInterval(function() {
           enemy.spawn();
        }, 5000);
        param.isSpawning = true;

        that.addContactListener();

        animationData.updateObjects();

        // Ajouter les listeners d'évènements
        window.addEventListener('keydown', that.handleKeyDown);
        window.addEventListener('keyup', that.handleKeyUp);
        
        // Désactiver les scrollings vertical lors d'un appui sur les touches directionnelles "haut" et "bas"
        document.onkeydown = function(event) {
            return event.keyCode != 38 && event.keyCode != 40;
        }
        
        that.gameloop();
    })();
}
