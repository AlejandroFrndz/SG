import * as THREE from '../libs/three.module.js'
import { ThreeBSP } from '../libs/ThreeBSP.js'

class Mug extends THREE.Object3D{
    constructor(){
        super();

        var outerCylGeom = new THREE.CylinderGeometry(2,2,3,15);
        var innerCylGeom = new THREE.CylinderGeometry(1.8,1.8,2.8,15);
        var torusGeom = new THREE.TorusGeometry(1,0.3,30,30,2*Math.PI);

        torusGeom.translate(-2,0,0);
        innerCylGeom.translate(0,0.2,0);

        var innerBSP = new ThreeBSP(innerCylGeom);
        var outerBSP = new ThreeBSP(outerCylGeom);
        var torusBSP = new ThreeBSP(torusGeom);

        var node1 = outerBSP.union(torusBSP);
        var result = node1.subtract(innerBSP);

        var resultGeom = result.toGeometry();
        var resultBufGeom = new THREE.BufferGeometry().fromGeometry(resultGeom);
        this.mug = new THREE.Mesh(resultBufGeom,new THREE.MeshNormalMaterial());

        this.add(this.mug);
    }
}

export { Mug };