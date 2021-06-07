import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'
import {MyScene} from './MyScene.js'

class Fruit extends THREE.Object3D{
    //Las frutas no tienen dimensión, siempre son interactuables
    constructor(){
        super();

        var geom = new THREE.SphereBufferGeometry(0.3,20,20);
        geom.translate(0,0.3,0);
        var texture = new THREE.TextureLoader().load('../imgs/textures/apple.jpg');
        //Se usa un material de Phong para que haya brillos. Se desactive el shading plano para que se interpolen los colores en toda la cara
        this.mat = new THREE.MeshPhongMaterial ({map: texture, flatShading: false});

        //Se crea el mesh y se emplea también un nodo sobre el que realizar la animación de recogida
        this.mesh = new THREE.Mesh(geom,this.mat);
        this.animNode = new THREE.Object3D();
        this.animNode.add(this.mesh);
        this.add(this.animNode);

        //Se crea la animación por defecto
        this.createIdleAnimation();

        //En principio se establece la fruta como no recogida
        this.picked = false;
    }

    //Animación por defecto en la que la fruta rota y sube y baja en el sitio
    createIdleAnimation(){
        var that = this;

        var originUp = {y : 0, rot : 0};
        var destinyUp = {y : 0.5, rot : 180};

        //Cuando comienza la subida o la bajada, se guarda una referencia a la animación como atributo para poder pararla cuando se recoja la fruta, ya sea subiendo o bajando
        this.idleUp = new TWEEN.Tween(originUp)
        .to(destinyUp,1000)
        .onStart(function(){
            that.activeIdle = that.idleUp;
        })
        .onUpdate(function(){
            that.animNode.position.y = originUp.y;
            that.animNode.rotation.y = THREE.MathUtils.degToRad(originUp.rot);
        });

        var originDown = {y : 0.5, rot : 180};
        var destinyDown = {y : 0, rot : 360};

        this.idleDown = new TWEEN.Tween(originDown)
        .to(destinyDown,1000)
        .onStart(function(){
            that.activeIdle = that.idleDown;
        })
        .onUpdate(function(){
            that.animNode.position.y = originDown.y;
            that.animNode.rotation.y = THREE.MathUtils.degToRad(originDown.rot);
        });

        this.idleUp.chain(this.idleDown);
        this.idleDown.chain(this.idleUp);
        this.idleUp.start();
    }

    //Función para la recogida de la fruta
    pickUp(){
        if(!this.picked){
            var that = this;

            //A partir de la posición y actual se asciende, rota y disminuye en tamaño
            var origin = {y : this.animNode.position.y, rot : 0, scale : 1};
            var destiny = {y : 4, rot : 720, scale : 0.1};
        
            var picked = new TWEEN.Tween(origin)
            .to(destiny,600)
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(function(){
                //Al comenzar se para la animación por defecto y se aumenta en 1 el contador de frutas de la escena
                that.activeIdle.stop();
                that.picked = true;
                MyScene.fruitCount++;
            })
            .onUpdate(function(){
                that.animNode.position.y = origin.y;
                that.animNode.rotation.y = origin.rot;
                that.animNode.scale.set(origin.scale,origin.scale,origin.scale);
            })
            .onComplete(function(){
                //Al finalizar, se elimina la fruta del grafo de escena para que el renderer no la visualice
                that.parent.remove(that);
            })

            picked.start();
        }
    }
}

export { Fruit };