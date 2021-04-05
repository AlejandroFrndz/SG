import * as THREE from '../libs/three.module.js'
import { ThreeBSP } from '../libs/ThreeBSP.js'

class Pieza extends THREE.Object3D{
    constructor(){
        super();

        var mat = new THREE.MeshNormalMaterial();

        var baseBoxGeom = new THREE.BoxGeometry(4,4,2);
        var subBoxGeom = new THREE.BoxGeometry(3.5,2,2);
        var subBox2Geom = new THREE.BoxGeometry(2,1.5,2);
        var cylGeom = new THREE.CylinderGeometry(1.5,1.5,2,15,15);
        var cone1Geom = new THREE.ConeGeometry(0.5,2,15,15);
        var cone2Geom = new THREE.ConeGeometry(0.5,2,15,15);

        subBoxGeom.translate(0.5,-1,0);
        subBox2Geom.translate(1,0.75,0);

        cylGeom.rotateX(Math.PI/2);
        cylGeom.translate(0.20,0.05,0);

        cone1Geom.translate(0.5,1.5,0);

        cone2Geom.rotateZ(Math.PI/2);
        cone2Geom.translate(-1.5,-0.5,0);

        var baseBSP = new ThreeBSP(baseBoxGeom);
        var subBSP = new ThreeBSP(subBoxGeom);
        var sub2BSP = new ThreeBSP(subBox2Geom);
        var cylBSP = new ThreeBSP(cylGeom);
        var cone1BSP = new ThreeBSP(cone1Geom);
        var cone2BSP = new ThreeBSP(cone2Geom);

        var n1 = baseBSP.subtract(subBSP);
        var n2 = n1.subtract(sub2BSP);
        var n3 = n2.subtract(cylBSP);
        var n4 = n3.subtract(cone1BSP);
        var n5 = n4.subtract(cone2BSP);

        var resultGeom = n5.toGeometry();
        var resultBufGeom = new THREE.BufferGeometry().fromGeometry(resultGeom);
        this.pieza = new THREE.Mesh(resultBufGeom,mat);
        this.add(this.pieza);

        var cone = new THREE.Mesh(cone2Geom,mat);
        //this.add(cone);
    }
}

export { Pieza };