import * as THREE from '../libs/three.module.js'

class Pica extends THREE.Object3D{
    constructor(){
        super();

        var shape = new THREE.Shape();

        
        shape.moveTo(0,-4);
        shape.quadraticCurveTo(5,1,5,4);
        shape.quadraticCurveTo(5,6.5,2,6.5);
        shape.quadraticCurveTo(0,6.5,0,4);
        shape.quadraticCurveTo(0,6.5,-2,6.5);
        shape.quadraticCurveTo(-5,6.5,-5,4);
        shape.quadraticCurveTo(-5,1,0,-4);

        var options = {depth: 0.2, bevelEnable: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 10, curveSegments: 10};

        var picaGeom = new THREE.ExtrudeBufferGeometry(shape,options);
        var mat = new THREE.MeshPhongMaterial({color: 0x0000CF});

        var pica = new THREE.Mesh(picaGeom,mat);

        this.add(pica);
        pica.scale.set(0.3,0.3,0.3);
        pica.position.y = -0.5;
        pica.rotation.x = THREE.MathUtils.degToRad(180);
        pica.position.y = 2;

        var baseGeom = new THREE.CylinderBufferGeometry(0.06,0.06,2,50,50);
        var base = new THREE.Mesh(baseGeom,mat);

        this.add(base);
    }
}

export { Pica };