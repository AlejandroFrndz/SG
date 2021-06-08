import * as THREE from '../libs/three.module.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';
import * as TWEEN from '../libs/tween.esm.js';
import { Marker } from './Marker.js';
import { DimensionLight } from './dimensionLight.js';

//Enumeración para nombrar las posibles orientaciones del modelo
const OrientationEnum = Object.freeze({"N":1, "NE":2, "E":3, "SE":4, "S":5, "SW":6, "W":7, "NW":8});

class Blake extends THREE.Object3D{
    //El constructor recibe la referencia a la cámara de Blake y a la escena para poder llamar a los métodos necesarios
    constructor(camara,escena){
        super();
        //Se crea un reloj para la actualización del mixer con las animaciones gltf
        this.clock = new THREE.Clock();
        var that = this;
        //Se guarda una referencia a su cámara
        this.camara = camara;
        //Antes de comenzar la carga del modelo se establece como no cargado
        this.loaded = false;
        var loader = new GLTFLoader();
        loader.load( '../models/gltf/blake_the_adventurer_version_3/blake.glb', function ( gltf ) {
            // El modelo está en el atributo  scene
            that.model = gltf.scene;
            //El modelo se escala para adaptar sus dimensiones a la escena
            that.model.scale.x = 0.009;
            that.model.scale.y = 0.009;
            that.model.scale.z = 0.009;
            //Y se rota para orientarlo en la dirección deseada
            that.model.rotation.y = Math.PI;
            //Se crean nodos auxiliares para las animaciones de salto, rebote y final
            that.jumpNode = new THREE.Object3D();
            that.jumpNode.add(that.model);
            that.bounceNode = new THREE.Object3D();
            that.bounceNode.add(that.jumpNode);
            that.finalNode = new THREE.Object3D();
            that.finalNode.add(that.bounceNode);
            //Y también un nodo auxiliar para el movimiento de la cámara, del que cuelga la cámara
            that.cameraNode = new THREE.Object3D();
            that.cameraNode.add(camara);
            // Y las animaciones en el atributo  animations
            var animations = gltf.animations;
            // Se añaden a la clase el modelo, con sus nodos auxiliares, y el nodo de la cámara
            that.add( that.finalNode);
            that.add(that.cameraNode);
            //Se crean las acciones gltf
            that.createActions(that.model,animations);
            //Se crean las animaciones Tween
            that.createTweens(escena);

            //Las partes visibles del modelo se configuran tanto para proyectar como para recibir sombras
            that.model.traverseVisible(function(unNodo){
                unNodo.castShadow = true;
                unNodo.receiveShadow = true;
            });

            //Una vez finalizada la carga, se establece el modelo como cargado
            that.loaded = true;
            //Y se llama al método de la escena que actualiza el estado de esta
            escena.loaded();
        }, undefined, function ( e ) { console.error( e ); }
        );

        //Se crea el vector que indica la dirección hacia delante del modelo, con la que se realizará el desplazamiento del mismo
        this.forward = new THREE.Vector3(0,0,1).normalize();
        //Al inicio, el modelo está orientado hacia el norte (Z negativa)
        this.orientation = OrientationEnum.N;

        //Variables para el desplazamiento
        this.moveForward = false;
        this.moveBackwards = false;
        this.moveRight = false;
        this.moveLeft = false;

        //Variable para los estados del modelo (gestionan las animaciones)
        this.jumping = false;
        this.boucing = false;
        this.falling = false;
        this.idleable = true;
        this.end = false;

        //Se crea y añade el marcador
        this.marker = new Marker();
        this.add(this.marker);

        //Se crean y añaden las luces dimensionales
        this.lights = new DimensionLight();
        this.add(this.lights);

        //Se establece la velocidad de moviemiento
        this.speed = 5;

    }

    //Creación de las animaciones Tween. El modelo trae sus propias animaciones pero solo son aquellas que mueven partes del modelo como sus manos, cabeza, ojos, etc.
    //Todo lo que implique un desplazamiento del modelo en su conjunto son animaciones Tween si realizadas por mi.
    createTweens(escena){
        var that = this;

        //#region  Salto  
        //El salto se divide en 4 fases.
        var originStart = {y : 0};
        var destinyStart = {y : 0.2};

        //Hay una fase de despegue, con su animación gltf correspondiente
        this.jumpStart = new TWEEN.Tween(originStart)
        .to(destinyStart,166)
        .easing(TWEEN.Easing.Quadratic.In) //Durante el despegue el modelo acelera
        .onStart(function(){
            //console.log("jumpStart");
            that.jumping = true;
            that.idleable = false;
            that.playAnimation("armature|jump_start",false,2);
        });

        var originAsc = {y : 0};
        var destinyAsc = {y : 2};

        //Una fase de ascenso
        this.jumpAsc = new TWEEN.Tween(originAsc)
        .to(destinyAsc,500)
        .easing(TWEEN.Easing.Quadratic.Out) //En el ascenso, se va desacelerando hasta llegar al punto más alto
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

        //Una fase de descenso
        this.jumpDesc = new TWEEN.Tween(originDesc)
        .to(destinyDesc,700)
        .easing(TWEEN.Easing.Quadratic.In) //En la que se va acelerando hasta tocar el suelo
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

        //Y una fase de aterrizaje
        this.jumpLand = new TWEEN.Tween(originLand)
        .to(destinyLand,250)
        .easing(TWEEN.Easing.Quadratic.Out) //En la que se desacelera
        .onStart(function(){
            //console.log("jumpLand");
            that.playAnimation("armature|jump_landing",false,2);
        })
        .onComplete(function(){
            that.idleable = true;
            that.jumping = false;
        })

        //Finalmente se encadenan las distintas animaciones
        this.jumpStart.chain(this.jumpAsc);
        this.jumpAsc.chain(this.jumpDesc);
        this.jumpDesc.chain(this.jumpLand);
        //#endregion Salto

        //#region  Rebote  
        //El rebote se divide en 5 fases. Las que se crean a continuación son las mismas 4 fases que en el salto, que siempre trabajan con los mismos números
        //La quinta fase se explica más adelante en el método de rebote
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

        //La animación de caida tiene una única fase
        this.fallAnim = new TWEEN.Tween(originFall)
        .to(destintyFall,1500)
        .easing(TWEEN.Easing.Quadratic.In) //En la que solo se acelera
        .onStart(function(){
            that.jumpLand.stop();
            that.falling = true;
            that.idleable = false;
            that.playAnimation("armature|jump_air_loop",true,1.5);
        })
        .onUpdate(function(){
            that.jumpNode.position.y = originFall.y;
        })
        .onComplete(function(){
            //Cuando se completa la animación, se indica a la escena que cambie el estado a muerto
            escena.die();
        })
        //#endregion
    }

    //Crea las animaciones gltf
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
    //Para la animación gltf actual y lanza la nueva
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

    //Funciones que regula el desplazamiento del personaje en función de las teclas que haya pulsado el usuario
    //La de movimiento activa el movimiento en la dirección correspondiente
    move(tecla){
        switch(tecla){
            //Hacia delante y hacia atrás son incompatibles. Nos quedamos con la dirección que se haya pulsado en último lugar si se pulsan ambas teclas simultáneamente
            case 'W':
                this.moveForward = true;
                this.moveBackwards = false;
            break;

            case 'S':
                this.moveBackwards = true;
                this.moveForward = false;
            break;

            //Hacia derecha y hacia izquierda también son incompatibles. Mismo procedimiento que antes
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

    //La de parada desactiva el movimiento en la dirección cuya tecla se haya soltado
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

    //Función que regula las animaciones gltf básicas
    checkAnimation(){
        //Si el modelo no está realizando otra acción (saltando, rebotando, cayendo o en la animación final)
        if(this.idleable){
            //Si está en moviemiento se activa la animación de caminar
            if((this.moveForward || this.moveBackwards || this.moveLeft || this.moveRight)){
                if(this.activeAction != this.actions['armature|run']){
                    this.playAnimation('armature|run',true,1);
                }
            }
            else{
                //Si está parado se activa la animación idle
                if(this.activeAction != this.actions['armature|idle']){
                    this.playAnimation('armature|idle',true,1);
                }
            }
        }
    }

    //Las siguientes 3 funciones regulan la orientación del modelo en función de la dirección en la que se esté desplazando

    //En función de la dirección en la que se vaya a move se calcula la orientación correspondiente del modelo
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

    //En función de la orientación actual y la deseada se calculan los grados que debe rotar el modelo para situarse en la nueva orientación
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

    //Finalmente, se establece la orientación del modelo
    setOrientation(){
        if(!this.falling){
            //Se comprueba la dirección el movimiento
            var desiredOrientation = this.checkDesiredOrientation();

            //Si esta dirección es distinta al a de la orientación actual
            if(desiredOrientation != this.orientation){
                //Se calculan los grados a girar
                var degrees = this.computeDegrees(desiredOrientation);
                //Se dichos grados segun el vector up del modelo (eje y del personaje)
                this.model.rotateOnAxis(this.model.up,THREE.MathUtils.degToRad(degrees));
                //Y se actualiza la orientación actual
                this.orientation = desiredOrientation;
            }
        }
    }

    //Función que desplaza al personaje. Acepta una dirección (positiva o negativa) y el deltaTime
    trasladar(dir,deltaTime){
        if(!this.falling){
            //Se traslada el personaje en el eje que indica su dirección hacia delante
            this.model.translateOnAxis(this.forward,dir*this.speed*deltaTime);
            //Se actualiza la posición y orientación de la cámara
            this.cameraNode.position.copy(this.model.position);
            this.camara.lookAt(new THREE.Vector3().addVectors(this.model.position,this.position));
            //También se desplaza el marcador por el suelo (plano XZ)
            this.marker.position.x = this.model.position.x;
            this.marker.position.z = this.model.position.z;
            //Y se desplazan las luces, esta vez en las 3 dimensiones
            this.lights.position.copy(this.model.position);
            this.lights.position.y = this.jumpNode.position.y + this.bounceNode.position.y;
        }
    }

    //Función que actualiza el modelo y sus animaciones
    update (deltaTime) {
        if(this.model){
            var dt = this.clock.getDelta();
            this.mixer.update (dt); //El mixer se encarga de actualizar las animaciones gltf
            if(!this.end){
                //Se actualiza la altura de las luces
                this.lights.position.y = this.jumpNode.position.y + this.bounceNode.position.y;
                //Se comprueba si es necesario cambiar de animación
                this.checkAnimation();
                //Y si se va a desplazar se actualiza la orientación del modelo y se desplaza
                if(this.moveForward || this.moveBackwards || this.moveLeft || this.moveRight){
                    this.setOrientation();
                    this.trasladar(1,deltaTime);
                }
            }
        }
    }

    //Función que activa la animación de salto
    jump(){
        if(!this.jumping && !this.falling){
            this.jumpStart.start();
        }
    }

    //Función que comienza un rebote
    bounce(){
        if(!this.boucing){
            var that = this;
            //Si habia una animación de rebote ya en curso (cuando rebotas en 2 o más cajas seguidas)
            //Se detienen las animaciones de ese rebote
            if(this.bounceCleanUp != null){
                this.bounceCleanUp.stopChainedTweens();
                this.bounceCleanUp.stop();
            }
            this.bounceLand.stopChainedTweens();
            this.bounceLand.stop();
            this.bounceDown.stopChainedTweens();
            this.bounceDown.stop();

            //Se crea la quinta fase del rebote. En función de la altura a la que se produzca el rebote habrás que descender
            //más o menos altura para terminar de nuevo en el suelo (altura 0)
            var origin = {y : this.jumpNode.position.y + this.bounceNode.position.y};
            var destiny = {y : 0};

            //Por tanto, cada vez que se rebota se debe actualizar esta animación pues la altura puede cambiar
            this.bounceCleanUp = new TWEEN.Tween(origin)
            .to(destiny,250 * (this.jumpNode.position.y + this.bounceNode.position.y))
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(function(){
                //console.log("bounceCleanUp");
                that.idleable = false;
            })
            .onUpdate(function(){
                that.jumpNode.position.y = origin.y;
            })
            //Se establece el encadenado necesario entre las 5 fases
            this.bounceDown.chain(this.bounceCleanUp);
            this.bounceCleanUp.chain(this.bounceLand);
            //Y se lanza el rebote
            this.bounceStart.start();
        }
    }

    //Función que activa la animación de caida
    fall(){
        if(!this.falling){
            this.fallAnim.start();
        }
    }

    //Función para crear la animación con la que finaliza el nivel
    createFinalAnimation(actualPosition, endPosition, escena){
        //En función de la posición en la que entre el desplazamiento deberá ser uno u otro para dejarlo finalmente en el centro del haz de luz
        var origin = {x : 0, z: 0};
        var destiny = {x: endPosition.x - actualPosition.x, z: endPosition.z - actualPosition.z};

        var that = this;

        //Hay una primera fase en la que Blake anda desde donde entra hasta el centro
        var colocacion = new TWEEN.Tween(origin)
        .to(destiny,1000)
        .onStart(function(){
            that.playAnimation('armature|run',true,1);
            //Se establece el estado del modelo y se ocultan el marcador y las luces
            that.end = true;
            that.marker.visible = false;
            that.lights.visible = false;
        })
        .onUpdate(function(){
            that.finalNode.position.x = origin.x;
            that.finalNode.position.z = origin.z;
        })
        .onComplete(function(){
            that.playAnimation('armature|idle',true,1);

            //Al terminar, se rota a Blake para que mire hacia la cámara (Sur o Z positiva)
            var degrees = that.computeDegrees(OrientationEnum.S);
            that.model.rotateOnAxis(that.model.up,THREE.MathUtils.degToRad(degrees));
        })    

        var origin2 = {y:0};
        var destiny2 = {y : 100};

        //Después hay una segunda fase en la que se asciende
        var ascenso = new TWEEN.Tween(origin2)
        .to(destiny2,5000)
        .easing(TWEEN.Easing.Cubic.In) //En el ascenso únicamente se acelera
        .onStart(function(){
            that.playAnimation('armature|jump_ascending',true,1);
        })
        .onUpdate(function(){
            that.finalNode.position.y = origin2.y;
        })
        .onComplete(function(){
            //Al terminar, se oculta a Blake (Se supone que se ha ido muy lejos y ya no es visible)
            that.visible = false;
            //Y se establece el estado de la escena
            escena.end();
        })
        .delay(500); //También hay un pequeño delay para permitir que rote antes de empezar a subir

        colocacion.chain(ascenso);
        colocacion.start();
    }
}

export { Blake };