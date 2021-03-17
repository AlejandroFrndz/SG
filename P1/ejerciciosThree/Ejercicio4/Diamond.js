import * as THREE from '../libs/three.module.js'

class Diamond extends THREE.Object3D{
    constructor(){
        super();

        var shape = new THREE.Shape();

        shape.moveTo(0,-1.5);
        shape.lineTo(1,0);
        shape.lineTo(0,1.5);
        shape.lineTo(-1,0);
        shape.lineTo(0,-1.5);

        var options = {depth: 0.2, bevelEnable: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 10};

        var diamondGeom = new THREE.ExtrudeBufferGeometry(shape,options);
        var diamondMat = new THREE.MeshPhongMaterial({color: 0xCF0000});

        var diamond = new THREE.Mesh(diamondGeom,diamondMat);

        this.add(diamond);
        diamond.scale.z = 0.3;
    }
}

export { Diamond }