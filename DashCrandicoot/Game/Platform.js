import * as THREE from '../libs/three.module.js';

class Platform extends THREE.Object3D{
    constructor(){
        super();

        var geom = new THREE.BoxBufferGeometry(5,3,5);
        geom.translate(0,-1.5,0);

        var texture = new THREE.TextureLoader().load('../imgs/textures/platform/platform.png');
        var normalMap = new THREE.TextureLoader().load('../imgs/textures/platform/platform-NM.png');
        var mat = new THREE.MeshPhongMaterial ({map: texture, normalMap: normalMap});

        this.mesh = new THREE.Mesh(geom,mat);
        this.add(this.mesh);
    }
}

export { Platform };