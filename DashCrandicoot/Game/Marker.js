import * as THREE from '../libs/three.module.js';

class Marker extends THREE.Object3D{
    constructor(){
        super();
        
        var shape = new THREE.Shape();

        shape.absarc(0,0,0.6,0,2*Math.PI);

        var hole = new THREE.Shape();

        hole.absarc(0,0,0.4,0,2*Math.PI);
        shape.holes.push(hole);

        var shapeGeom = new THREE.ShapeBufferGeometry( shape );
        shapeGeom.rotateX(-Math.PI/2);
        shapeGeom.translate(0,0.001,0);

        var shapeMat = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
        var shapeMesh = new THREE.Mesh( shapeGeom, shapeMat );

        this.add(shapeMesh);
    }
}

export { Marker };