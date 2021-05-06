import * as THREE from '../libs/three.module.js';

class MoveTest extends THREE.Object3D{
    constructor(){
        super();

        var boxGeom = new THREE.BoxBufferGeometry(1,1,1);
        boxGeom.translate(0,0.5,0);
        this.box = new THREE.Mesh(boxGeom,new THREE.MeshNormalMaterial());
        this.add(this.box);

        this.forward = new THREE.Vector3(0,0,-1).normalize();
        this.backwards = new THREE.Vector3(0,0,1).normalize();
        this.right = new THREE.Vector3(1,0,0).normalize();
        this.left = new THREE.Vector3(-1,0,0).normalize();
        this.up = new THREE.Vector3(0,1,0).normalize();
        this.down = new THREE.Vector3(0,-1,0).normalize();

        this.moveForward = false;
        this.moveBackwards = false;
        this.moveRight = false;
        this.moveLeft = false;
    }

    move(tecla){
        switch(tecla){
            case 'W':
                this.moveForward = true;
            break;

            case 'S':
                this.moveBackwards = true;
            break;

            case 'D':
                this.moveRight = true;
            break;

            case 'A':
                this.moveLeft = true;
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
    
    update(){
        if(this.moveForward){
            this.box.translateOnAxis(this.forward,0.1);
        }
        if(this.moveBackwards){
            this.box.translateOnAxis(this.backwards,0.1);
        }
        if(this.moveRight){
            this.box.translateOnAxis(this.right,0.1);
        }
        if(this.moveLeft){
            this.box.translateOnAxis(this.left,0.1);
        }
    }
}

export { MoveTest };