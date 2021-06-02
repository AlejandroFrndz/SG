import * as THREE from '../libs/three.module.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';
import * as TWEEN from '../libs/tween.esm.js';
import { Marker } from './Marker.js';
import { DimensionLight } from './dimensionLight.js';

const OrientationEnum = Object.freeze({"N":1, "NE":2, "E":3, "SE":4, "S":5, "SW":6, "W":7, "NW":8});

class Blake extends THREE.Object3D{
    constructor(camara){
        super();
        this.clock = new THREE.Clock();
        var that = this;
        this.camara = camara;
        this.loaded = false;
        var loader = new GLTFLoader();
        loader.load( '../models/gltf/blake_the_adventurer_version_3/blake.glb', function ( gltf ) {
            // El modelo está en el atributo  scene
            that.model = gltf.scene;
            that.model.scale.x = 0.009;
            that.model.scale.y = 0.009;
            that.model.scale.z = 0.009;
            that.model.rotation.y = Math.PI;
            that.rotationNode = new THREE.Object3D();
            that.rotationNode.add(that.model);
            that.jumpNode = new THREE.Object3D();
            that.jumpNode.add(that.rotationNode);
            that.bounceNode = new THREE.Object3D();
            that.bounceNode.add(that.jumpNode);
            that.cameraNode = new THREE.Object3D();
            that.cameraNode.add(camara);
            // Y las animaciones en el atributo  animations
            var animations = gltf.animations;
            // No olvidarse de colgar el modelo del Object3D de esta instancia de la clase (this)
            that.add( that.bounceNode);
            that.add(that.cameraNode);
            that.createActions(that.model,animations);
            that.createTweens();

            that.model.traverseVisible(function(unNodo){
                unNodo.castShadow = true;
                unNodo.receiveShadow = true;
            });

            that.loaded = true;
        }, undefined, function ( e ) { console.error( e ); }
        );

        this.forward = new THREE.Vector3(0,0,1).normalize();
        this.upwards = new THREE.Vector3(0,1,0).normalize();
        this.orientation = OrientationEnum.N;

        this.moveForward = false;
        this.moveBackwards = false;
        this.moveRight = false;
        this.moveLeft = false;


        this.jumping = false;
        this.boucing = false;
        this.falling = false;
        this.idleable = true;

        this.marker = new Marker();
        this.add(this.marker);

        this.lights = new DimensionLight();
        this.add(this.lights);

        this.bounceCleanUp = null;

        this.speed = 5;
    }

    createTweens(){
        var that = this;

        //#region  Salto  
        var originStart = {y : 0};
        var destinyStart = {y : 0.2};

        this.jumpStart = new TWEEN.Tween(originStart)
        .to(destinyStart,166)
        .easing(TWEEN.Easing.Quadratic.In)
        .onStart(function(){
            //console.log("jumpStart");
            that.jumping = true;
            that.idleable = false;
            that.playAnimation("armature|jump_start",false,2);
        });

        var originAsc = {y : 0};
        var destinyAsc = {y : 2};

        this.jumpAsc = new TWEEN.Tween(originAsc)
        .to(destinyAsc,500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStart(function(){
            //console.log("jumpAsc");
            that.jumping = true;
            that.idleable = false;
            that.playAnimation("armature|jump_ascending",true,1);
        })
        .onUpdate(function(){
            //console.log("jumpAsc");
            that.jumpNode.position.y = originAsc.y;
        });
        
        var originDesc = {y : 2};
        var destinyDesc = {y : 0};

        this.jumpDesc = new TWEEN.Tween(originDesc)
        .to(destinyDesc,700)
        .easing(TWEEN.Easing.Quadratic.In)
        .onStart(function(){
            //console.log("jumpDesc");
            that.jumping = true;
            that.idleable = false;
            that.playAnimation("armature|jump_descending",true,1);
        })
        .onUpdate(function(){
            //console.log("jumpDesc");
            that.jumpNode.position.y = originDesc.y;
        });

        var originLand = {y : 0.2};
        var destinyLand = {y : 0};

        this.jumpLand = new TWEEN.Tween(originLand)
        .to(destinyLand,250)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStart(function(){
            //console.log("jumpLand");
            that.playAnimation("armature|jump_landing",false,2);
        })
        .onComplete(function(){
            that.idleable = true;
            that.jumping = false;
        })

        this.jumpStart.chain(this.jumpAsc);
        this.jumpAsc.chain(this.jumpDesc);
        this.jumpDesc.chain(this.jumpLand);
        //#endregion Salto

        //#region  Rebote  
        var originStart = {y : 0};
        var destinyStart = {y : 0.2};

        var that = this;

        this.bounceStart = new TWEEN.Tween(originStart)
        .to(destinyStart,166)
        .easing(TWEEN.Easing.Quadratic.In)
        .onStart(function(){
            //console.log("bounceStart");
            that.jumpDesc.stopChainedTweens();
            that.jumpDesc.stop();
            that.boucing = true;
            that.jumping = true;
            that.idleable = false;
            that.playAnimation("armature|jump_start",false,2);
        })
        .onUpdate(function(){
            //console.log("bounceStart");
            that.bounceNode.position.y = originStart.y;
        })
        .onComplete(function(){
            that.boucing = false;
        })

        var origin = {y : 0.2};
        var destiny = {y : 2};

        this.bounceUp = new TWEEN.Tween(origin)
        .to(destiny,500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStart(function(){
            that.idleable = false;
            that.playAnimation("armature|jump_ascending",true,1);
        })
        .onUpdate(function(){
            //console.log("bounceUp");
            that.bounceNode.position.y = origin.y;
        });

        var originD = {y : 2};
        var destinyD = {y : 0};

        this.bounceDown = new TWEEN.Tween(originD)
        .to(destinyD,700)
        .easing(TWEEN.Easing.Quadratic.In)
        .onStart(function(){
            that.idleable = false;
            that.playAnimation("armature|jump_descending",true,1);
        })
        .onUpdate(function(){
            //console.log("bounceDown");
            that.bounceNode.position.y = originD.y;
        })

        this.bounceLand = new TWEEN.Tween(originLand)
        .to(destinyLand,250)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStart(function(){
            //console.log("bounceLand");
            that.idleable = false;
            that.playAnimation("armature|jump_landing",false,2);
        })
        .onComplete(function(){
            that.jumping = false;
            that.idleable = true;
        })
        
        
        this.bounceStart.chain(this.bounceUp);
        this.bounceUp.chain(this.bounceDown);
        //#endregion Rebote

        //#region  Caida  
        var originFall = {y : 0};
        var destintyFall = {y : -10};

        this.fallAnim = new TWEEN.Tween(originFall)
        .to(destintyFall,1500)
        .onStart(function(){
            that.jumpLand.stop();
            that.falling = true;
            that.idleable = false;
            that.playAnimation("armature|jump_air_loop",true,1.5);
        })
        .onUpdate(function(){
            that.jumpNode.position.y = originFall.y;
        })
        //#endregion
    }

    createActions (model, animations) {
        // Se crea un mixer para dicho modelo
        // El mixer es el controlador general de las animaciones del modelo, 
        //    las lanza, las puede mezclar, etc.
        // En realidad, cada animación tiene su accionador particular 
        //    y se gestiona a través de dicho accionador
        // El mixer es el controlador general de los accionadores particulares
        this.mixer = new THREE.AnimationMixer (model);
    
        // El siguiente diccionario contendrá referencias a los diferentes accionadores particulares 
        // El diccionario Lo usaremos para dirigirnos a ellos por los nombres de las animaciones que gestionan
        this.actions = {};
        
        for (var i = 0; i < animations.length; i++) {
            // Se toma una animación de la lista de animaciones del archivo gltf
            var clip = animations[i];
            
            // A partir de dicha animación obtenemos una referencia a su accionador particular
            var action = this.mixer.clipAction (clip);
            
            // Añadimos el accionador al diccionario con el nombre de la animación que controla
            this.actions[clip.name] = action;
          
        }

        this.activeAction = this.actions['armature|idle'];
        this.activeAction.setLoop(THREE.Repeat);
        this.activeAction.play();
    }

    playAnimation(name, repeat, speed){
        var previousAction = this.activeAction;
        this.activeAction = this.actions[ name ];

        // La nueva animación se resetea para eliminar cualquier rastro de la última vez que se ejecutara
        this.activeAction.reset();
        // Se programa una transición entre la animación actigua y la nueva, se emplea un 10% de lo que dura la animación nueva
        this.activeAction.crossFadeFrom (previousAction, this.activeAction.time/10 );
        // Hacemos que la animación se quede en su último frame cuando acabe
        this.activeAction.clampWhenFinished = true;
        // Ajustamos su factor de tiempo, modificando ese valor se puede ajustar la velocidad de esta ejecución de la animación
        this.activeAction.setEffectiveTimeScale( speed );
        // Ajustamos su peso al máximo, ya que queremos ver la animación en su plenitud
        this.activeAction.setEffectiveWeight( 1 );
        // Se establece el número de repeticiones
        if (repeat) {
            this.activeAction.setLoop (THREE.Repeat);
        } else {
            this.activeAction.setLoop (THREE.LoopOnce);
        }
        // Una vez configurado el accionador, se lanza la animación
        this.activeAction.play();
    }

    move(tecla){
        switch(tecla){
            case 'W':
                this.moveForward = true;
                this.moveBackwards = false;
            break;

            case 'S':
                this.moveBackwards = true;
                this.moveForward = false;
            break;

            case 'D':
                this.moveRight = true;
                this.moveLeft = false;
            break;

            case 'A':
                this.moveLeft = true;
                this.moveRight = false;
            break;
        }
    }

    stop(tecla){
        switch(tecla){
            case 'W':
                this.moveForward = false;
            break;

            case 'S':
                this.moveBackwards = false;
            break;

            case 'D':
                this.moveRight = false;
            break;

            case 'A':
                this.moveLeft = false;
            break;
        }
    }

    
    checkAnimation(){
        if(this.idleable){
            if((this.moveForward || this.moveBackwards || this.moveLeft || this.moveRight)){
                if(this.activeAction != this.actions['armature|run']){
                    this.playAnimation('armature|run',true,1);
                }
            }
            else{
                if(this.activeAction != this.actions['armature|idle']){
                    this.playAnimation('armature|idle',true,1);
                }
            }
        }
    }

    checkDesiredOrientation(){
        if(this.moveForward && this.moveRight){
            return OrientationEnum.NE;
        }
        if(this.moveForward && this.moveLeft){
            return OrientationEnum.NW;
        }
        if(this.moveBackwards && this.moveRight){
            return OrientationEnum.SE;
        }
        if(this.moveBackwards && this.moveLeft){
            return OrientationEnum.SW;
        }
        if(this.moveForward){
            return OrientationEnum.N;
        }
        if(this.moveBackwards){
            return OrientationEnum.S;
        }
        if(this.moveRight){
            return OrientationEnum.E;
        }
        if(this.moveLeft){
            return OrientationEnum.W;
        }
    }

    computeDegrees(desiredOrientation){
        var degrees;
        switch(this.orientation){
            case OrientationEnum.S:
                switch(desiredOrientation){
                    case OrientationEnum.SE:
                        degrees = 45;
                    break;

                    case OrientationEnum.E:
                        degrees = 90;
                    break;

                    case OrientationEnum.NE:
                        degrees = 135;
                    break;

                    case OrientationEnum.N:
                        degrees = 180;
                    break;

                    case OrientationEnum.NW:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.W:
                        degrees = 270;
                    break;

                    case OrientationEnum.SW:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.SE:
                switch(desiredOrientation){
                    case OrientationEnum.E:
                        degrees = 45;
                    break;

                    case OrientationEnum.NE:
                        degrees = 90;
                    break;

                    case OrientationEnum.N:
                        degrees = 135;
                    break;

                    case OrientationEnum.NW:
                        degrees = 180;
                    break;

                    case OrientationEnum.W:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.SW:
                        degrees = 270;
                    break;

                    case OrientationEnum.S:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.E:
                switch(desiredOrientation){
                    case OrientationEnum.NE:
                        degrees = 45;
                    break;

                    case OrientationEnum.N:
                        degrees = 90;
                    break;

                    case OrientationEnum.NW:
                        degrees = 135;
                    break;

                    case OrientationEnum.W:
                        degrees = 180;
                    break;

                    case OrientationEnum.SW:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.S:
                        degrees = 270;
                    break;

                    case OrientationEnum.SE:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.NE:
                switch(desiredOrientation){
                    case OrientationEnum.N:
                        degrees = 45;
                    break;

                    case OrientationEnum.NW:
                        degrees = 90;
                    break;

                    case OrientationEnum.W:
                        degrees = 135;
                    break;

                    case OrientationEnum.SW:
                        degrees = 180;
                    break;

                    case OrientationEnum.S:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.SE:
                        degrees = 270;
                    break;

                    case OrientationEnum.E:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.N:
                switch(desiredOrientation){
                    case OrientationEnum.NW:
                        degrees = 45;
                    break;

                    case OrientationEnum.W:
                        degrees = 90;
                    break;

                    case OrientationEnum.SW:
                        degrees = 135;
                    break;

                    case OrientationEnum.S:
                        degrees = 180;
                    break;

                    case OrientationEnum.SE:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.E:
                        degrees = 270;
                    break;

                    case OrientationEnum.NE:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.NW:
                switch(desiredOrientation){
                    case OrientationEnum.W:
                        degrees = 45;
                    break;

                    case OrientationEnum.SW:
                        degrees = 90;
                    break;

                    case OrientationEnum.S:
                        degrees = 135;
                    break;

                    case OrientationEnum.SE:
                        degrees = 180;
                    break;

                    case OrientationEnum.E:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.NE:
                        degrees = 270;
                    break;

                    case OrientationEnum.N:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.W:
                switch(desiredOrientation){
                    case OrientationEnum.SW:
                        degrees = 45;
                    break;

                    case OrientationEnum.S:
                        degrees = 90;
                    break;

                    case OrientationEnum.SE:
                        degrees = 135;
                    break;

                    case OrientationEnum.E:
                        degrees = 180;
                    break;

                    case OrientationEnum.NE:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.N:
                        degrees = 270;
                    break;

                    case OrientationEnum.NW:
                        degrees = 315;
                    break;
                }
            break;

            case OrientationEnum.SW:
                switch(desiredOrientation){
                    case OrientationEnum.S:
                        degrees = 45;
                    break;

                    case OrientationEnum.SE:
                        degrees = 90;
                    break;

                    case OrientationEnum.E:
                        degrees = 135;
                    break;

                    case OrientationEnum.NE:
                        degrees = 180;
                    break;

                    case OrientationEnum.N:
                        degrees = 225;
                    break;
                    
                    case OrientationEnum.NW:
                        degrees = 270;
                    break;

                    case OrientationEnum.W:
                        degrees = 315;
                    break;
                }
            break;
        }

        return degrees;
    }

    setOrientation(){
        if(!this.falling){
            var desiredOrientation = this.checkDesiredOrientation();

            if(desiredOrientation != this.orientation){
                var degrees = this.computeDegrees(desiredOrientation);
                this.model.rotateOnAxis(this.model.up,THREE.MathUtils.degToRad(degrees));
                this.orientation = desiredOrientation;
            }
        }
    }

    trasladar(dir,deltaTime){
        if(!this.falling){
            this.model.translateOnAxis(this.forward,dir*this.speed*deltaTime);
            this.cameraNode.position.copy(this.model.position);
            this.camara.lookAt(new THREE.Vector3().addVectors(this.model.position,this.position));
            this.marker.position.x = this.model.position.x;
            this.marker.position.z = this.model.position.z;
            this.lights.position.copy(this.model.position);
            this.lights.position.y = this.jumpNode.position.y + this.bounceNode.position.y;
        }
    }

    update (deltaTime) {
        if(this.model){
            this.lights.position.y = this.jumpNode.position.y + this.bounceNode.position.y;
            this.checkAnimation();
            var dt = this.clock.getDelta();
            this.mixer.update (dt);
            if(this.moveForward || this.moveBackwards || this.moveLeft || this.moveRight){
                this.setOrientation();
                this.trasladar(1,deltaTime);
            }
        }
    }

    jump(){
        if(!this.jumping && !this.falling){
            this.jumpStart.start();
        }
    }

    bounce(){
        if(!this.boucing){
            var that = this;
            if(this.bounceCleanUp != null){
                this.bounceCleanUp.stopChainedTweens();
                this.bounceCleanUp.stop();
            }
            this.bounceLand.stopChainedTweens();
            this.bounceLand.stop();
            this.bounceDown.stopChainedTweens();
            this.bounceDown.stop();

            var origin = {y : this.jumpNode.position.y};
            var destiny = {y : 0};

            this.bounceCleanUp = new TWEEN.Tween(origin)
            .to(destiny,250 * this.jumpNode.position.y)
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(function(){
                //console.log("bounceCleanUp");
                that.idleable = false;
            })
            .onUpdate(function(){
                that.jumpNode.position.y = origin.y;
            })
            this.bounceDown.chain(this.bounceCleanUp);
            this.bounceCleanUp.chain(this.bounceLand);
            this.bounceStart.start();
        }
    }

    fall(){
        if(!this.falling){
            this.fallAnim.start();
        }
    }
}

export { Blake };