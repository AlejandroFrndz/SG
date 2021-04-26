import * as THREE from '../libs/three.module.js'

class Heart extends THREE.Object3D{
    constructor(){
        super();

        var shape = new THREE.Shape();

        
        shape.moveTo(0,-4);
        shape.quadraticCurveTo(5,1,5,4);
        shape.quadraticCurveTo(5,6.5,2,6.5);
        shape.quadraticCurveTo(0,6.5,0,4);
        shape.quadraticCurveTo(0,6.5,-2,6.5);
        shape.quadraticCurveTo(-5,6.5,-5,4);
        shape.quadraticCurveTo(-5,1,0,-4);
        


        var options = {depth: 0.2, bevelEnable: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 10, curveSegments: 10};

        var heartGeom = new THREE.ExtrudeBufferGeometry(shape,options);
        var heartMat = new THREE.MeshPhongMaterial({color: 0xCF0000});

        var heart = new THREE.Mesh(heartGeom,heartMat);

        this.add(heart);
        heart.scale.set(0.3,0.3,0.3);
    }
}

export { Heart }