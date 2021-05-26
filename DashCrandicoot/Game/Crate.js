import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'
import { Fruit } from './Fruit.js'
import { MyScene } from './MyScene.js';

class Crate extends THREE.Object3D{
    constructor(fruits, dimension) {
        super();
        
        this.createModel();
        this.createAnimation();
        this.nFruits = fruits;
        this.fruit = new Fruit();

        this.dimension = dimension;
      }

      createModel(){
        var boxGeom = new THREE.BoxGeometry (1,1,0.01);
        boxGeom.translate(0,0.51,0);
        
        var texture = new THREE.TextureLoader().load('../imgs/textures/crate/crate.jpg');
        var normalMap = new THREE.TextureLoader().load('../imgs/textures/crate/crate-NM.jpg');
        this.mat = new THREE.MeshPhongMaterial ({map: texture, normalMap: normalMap});

        this.animFront = new THREE.Mesh(boxGeom,this.mat);
        var faceFront = new THREE.Object3D();
        faceFront.add(this.animFront);
        faceFront.position.z = 0.5;

        this.animBack = new THREE.Mesh(boxGeom,this.mat);
        var faceBack = new THREE.Object3D();
        faceBack.add(this.animBack);
        faceBack.position.z = -0.5;

        this.animRight = new THREE.Mesh(boxGeom,this.mat);
        var faceRight = new THREE.Object3D();
        faceRight.add(this.animRight);
        faceRight.rotation.y = THREE.MathUtils.degToRad(90);
        faceRight.position.x = 0.5;

        this.animLeft = new THREE.Mesh(boxGeom,this.mat);
        var faceLeft = new THREE.Object3D();
        faceLeft.add(this.animLeft);
        faceLeft.rotation.y = THREE.MathUtils.degToRad(90);
        faceLeft.position.x = -0.5;

        this.faceTop = new THREE.Mesh(boxGeom,this.mat);
        this.faceTop.rotation.x = THREE.MathUtils.degToRad(90);
        this.faceTop.position.y = 1;
        this.faceTop.position.z = -0.5;

        this.faceBottom = new THREE.Mesh(boxGeom,this.mat);
        this.faceBottom.rotation.x = THREE.MathUtils.degToRad(90);
        this.faceBottom.position.z = -0.5;

        this.add(faceFront);
        this.add(faceBack);
        this.add(faceRight);
        this.add(faceLeft);
        this.add(this.faceTop);
        this.add(this.faceBottom);

        this.animFront.userData = this;
        this.animBack.userData = this;
        this.animRight.userData = this;
        this.animLeft.userData = this;
        this.faceTop.userData = this;
        this.faceBottom.userData = this;

      }

      createAnimation(){
        var origin = {rot: 0, top: 1};
        var destiny = {rot: 90, top: 0};

        var that = this;

        this.broken = false;

        this.animation = new TWEEN.Tween(origin)
        .to(destiny,500)
        .easing(TWEEN.Easing.Quadratic.In)
        .onStart(function(){
          that.broken = true;
          that.add(that.fruit);
          that.fruit.pickUp();
          MyScene.fruitCount += (that.nFruits - 1);
        })
        .onUpdate(function(){
          that.faceTop.position.y = origin.top;
          that.animRight.rotation.x = THREE.MathUtils.degToRad(origin.rot);
          that.animLeft.rotation.x = THREE.MathUtils.degToRad(-origin.rot);
          that.animFront.rotation.x = THREE.MathUtils.degToRad(origin.rot);
          that.animBack.rotation.x = THREE.MathUtils.degToRad(-origin.rot);
        });

        var remove = new TWEEN.Tween(origin)
        .to(destiny,500)
        .onComplete(function(){
          that.parent.remove(that);
        });

        this.animation.chain(remove);
      }

      startAnimation(){
        if(!this.broken){
          this.animation.start();
        }
      }

      update(){
        TWEEN.update();
      }
}

export { Crate };