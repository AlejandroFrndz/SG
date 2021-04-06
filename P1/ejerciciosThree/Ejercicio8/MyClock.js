import * as THREE from '../libs/three.module.js'

class MyClock extends THREE.Object3D{
    constructor(){
        super();

        var clockRadius = 4;
        var sphereGeom;
        var sphereMesh;
        var ang = 0;
        var greenMat = new THREE.MeshPhongMaterial({color: 0x00CF00});

        for(var i = 0; i < 12; i++){
            sphereGeom = new THREE.SphereBufferGeometry(0.2,30,30);
            sphereGeom.translate(Math.cos(ang)*clockRadius,Math.sin(ang)*clockRadius,0);
            sphereMesh = new THREE.Mesh(sphereGeom,greenMat);
            this.add(sphereMesh);
            ang += 30*Math.PI/180;
        }
    }
}

export { MyClock };