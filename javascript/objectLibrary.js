function objectLibrary() {
    return {
        "metalPlatform": {
            "width": canvas.width,
            "height": 20,
            "fixed": true,
            "userData": {
                "name": "metalPlatform",
                "img": "stoneMid.png"
            }
        },
        "wall": {
            "width": 10,
            "height": canvas.height,
            "fixed": true,
            "userData": {
                "name": "wall",
                "img": "hud_coins.png"
            }
        },
        "enemy1": {
            "width": 25,
            "height": 25,
            "fixed": false,
            "userData": {
                "name": "enemy1",
                "img": "hud_coins.png"
            }
        },
        "littlePlatform": {
            "width": 100,
            "height": 10,
            "fixed": true,
            "userData": {
                "name": "littlePlatform",
                "img": "stoneMid.png"
            }
        },
        "win": {
            "width": 15,
            "height": 15,
            "fixed": true,
            "userData": {
                "name": "win",
                "img": "signExit.png"
            }
        },        
        "collectible": {
            "width": 20,
            "height": 20,
            "fixed": true,
            "userData": {
                "name": "collectible",
                "img": "star.png"
            }
        },
        "spikes": {
            "width": 10,
            "height": 10,
            "fixed": true,
            "userData": {
                "name": "spikes",
                "img": "spikes.png"
            }
        }        
    }
}