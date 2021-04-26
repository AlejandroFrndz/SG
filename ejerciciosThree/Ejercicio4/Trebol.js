import * as THREE from '../libs/three.module.js';

class Trebol extends THREE.Object3D{
    constructor(){
        super();

        var shape = new THREE.Shape();

        shape.absarc(0,0.4,1,THREE.MathUtils.degToRad(0),THREE.MathUtils.degToRad(180));
        shape.absarc(-1,-1,1,THREE.MathUtils.degToRad(90),THREE.MathUtils.degToRad(360));
        shape.absarc(1,-1,1,THREE.MathUtils.degToRad(180),THREE.MathUtils.degToRad(90));


        var options = {depth: 0.2, bevelEnable: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 10, curveSegments: 10};

        var trebolGeom = new THREE.ExtrudeBufferGeometry(shape,options);
        var mat = new THREE.MeshPhongMaterial({color: 0x0000CF});


        var trebol = new THREE.Mesh(trebolGeom,mat);

        this.add(trebol);
        trebol.position.y = 2.2;

        var baseGeom = new THREE.CylinderBufferGeometry(0.2,0.2,2,50,50);
        var base = new THREE.Mesh(baseGeom,mat);

        this.add(base);
        this.scale.z = 0.3;

    }
}

export { Trebol };