import * as THREE from '../libs/three.module.js'
import { ThreeBSP } from '../libs/ThreeBSP.js'

class Screw extends THREE.Object3D{
    constructor(){
        super();

        var bodyGeom = new THREE.CylinderGeometry(4,4,2,6);
        var holeGeom = new THREE.CylinderGeometry(2,2,2,20);
        var stripeGeom = new THREE.CylinderGeometry(2.2,2.2,0.1,20);

        stripeGeom.translate(0,-1,0);

        var bodyBSP = new ThreeBSP(bodyGeom);
        var holeBSP = new ThreeBSP(holeGeom);
        var stripeBSP;

        var result = bodyBSP.subtract(holeBSP);

        for(var i = 0; i < 9; i++){
            stripeGeom.translate(0,0.2,0);
            stripeBSP = new ThreeBSP(stripeGeom);
            result = result.subtract(stripeBSP);
        }

        var resultGeom = result.toGeometry();
        var resultBufGeom = new THREE.BufferGeometry().fromGeometry(resultGeom);
        this.screw = new THREE.Mesh(resultBufGeom,new THREE.MeshNormalMaterial());
        this.add(this.screw);
    }
}

export { Screw };