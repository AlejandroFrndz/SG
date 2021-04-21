import * as THREE from '../libs/three.module.js';

class Crate extends THREE.Object3D{
    constructor() {
        super();
        
        // Un Mesh se compone de geometría y material
        var boxGeom = new THREE.BoxGeometry (1,1,1);
        
        var texture = new THREE.TextureLoader().load('../imgs/crate.jpg');
        var mat = new THREE.MeshPhongMaterial ({map: texture});
        
        // Ya podemos construir el Mesh
        var box = new THREE.Mesh (boxGeom, mat);
        // Y añadirlo como hijo del Object3D (el this)
        this.add (box);
        
        // Las geometrías se crean centradas en el origen.
        // Como queremos que el sistema de referencia esté en la base,
        // subimos el Mesh de la caja la mitad de su altura
        box.position.y = 0.5;
      }
}

export { Crate };