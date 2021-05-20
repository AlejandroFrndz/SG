import * as THREE from '../libs/three.module.js';

class Platform extends THREE.Object3D{
    constructor(){
        super();

        var geom = new THREE.BoxBufferGeometry(5,3,5);
        geom.translate(0,-1.5,0);

        this.mesh = new THREE.Mesh(geom,new THREE.MeshNormalMaterial());
        this.add(this.mesh);
    }
}

export { Platform };