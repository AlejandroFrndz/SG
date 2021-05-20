import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'

class Fruit extends THREE.Object3D{
    constructor(){
        super();

        var geom = new THREE.SphereBufferGeometry(0.3,20,20);
        geom.translate(0,0.3,0);
        var texture = new THREE.TextureLoader().load('../imgs/apple.jpg');
        var mat = new THREE.MeshPhongMaterial ({map: texture});

        this.mesh = new THREE.Mesh(geom,mat);

        this.add(this.mesh);

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
            that.position.y = originUp.y;
            that.rotation.y = THREE.MathUtils.degToRad(originUp.rot);
        });

        var originDown = {y : 0.5, rot : 180};
        var destinyDown = {y : 0, rot : 360};

        this.idleDown = new TWEEN.Tween(originDown)
        .to(destinyDown,1000)
        .onStart(function(){
            that.activeIdle = that.idleDown;
        })
        .onUpdate(function(){
            that.position.y = originDown.y;
            that.rotation.y = THREE.MathUtils.degToRad(originDown.rot);
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
            })
            .onUpdate(function(){
                that.position.y = origin.y;
                that.rotation.y = origin.rot;
                that.scale.set(origin.scale,origin.scale,origin.scale);
            })
            .onComplete(function(){
                that.parent.remove(that);
            })

            picked.start();
        }
    }
}

export { Fruit };