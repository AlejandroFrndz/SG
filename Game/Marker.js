import * as THREE from '../libs/three.module.js';

class Marker extends THREE.Object3D{
    //El marcador que acompaña a Blake es un shape en 2D con un agujero en medio
    constructor(){
        super();
        
        //Para visualizar primero construimos el shape con el agujero
        var shape = new THREE.Shape();

        shape.absarc(0,0,0.55,0,2*Math.PI);

        var hole = new THREE.Shape();

        hole.absarc(0,0,0.4,0,2*Math.PI);
        shape.holes.push(hole);

        //Después usamos una ShapeGeometry
        var shapeGeom = new THREE.ShapeBufferGeometry( shape );
        //Que rotamos y trasladamos para colocarla correctamente
        shapeGeom.rotateX(-Math.PI/2);
        shapeGeom.translate(0,0.001,0);

        //Y después construimos un mesh con un material lambert para un efecto mate
        var shapeMat = new THREE.MeshLambertMaterial( { color: 0x000000 , emissive: 0xff7f00, emissiveIntensity: 1} );
        var shapeMesh = new THREE.Mesh( shapeGeom, shapeMat );

        this.add(shapeMesh);
    }
}

export { Marker };