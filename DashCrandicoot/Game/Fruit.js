import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'
import {MyScene} from './MyScene.js'
class Fruit extends THREE.Object3D{
    constructor(){
        super();

        var geom = new THREE.SphereBufferGeometry(0.3,20,20);
        geom.translate(0,0.3,0);
        var texture = new THREE.TextureLoader().load('../imgs/textures/apple.jpg');
        this.mat = new THREE.MeshPhongMaterial ({map: texture, flatShading: false});

        this.mesh = new THREE.Mesh(geom,this.mat);
        this.animNode = new THREE.Object3D();
        this.animNode.add(this.mesh);
        this.add(this.animNode);

        this.createIdleAnimation();

        this.picked = false;
    }

    createIdleAnimation(){
        var that = this;

        var originUp = {y : 0, rot : 0};
        var destinyUp = {y : 0.5, rot : 180};

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

    pickUp(){
        if(!this.picked){
            var that = this;

            var origin = {y : this.position.y, rot : 0, scale : 1};
            var destiny = {y : 4, rot : 720, scale : 0.1};

            var picked = new TWEEN.Tween(origin)
            .to(destiny,600)
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(function(){
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
                that.parent.remove(that);
            })

            picked.start();
        }
    }
}

export { Fruit };