import * as THREE from '../libs/three.module.js'

class ColumnaCorazon extends THREE.Object3D{
    constructor(){
        super();

        var shape = new THREE.Shape();

        
        shape.moveTo(0,-4*0.3);
        shape.quadraticCurveTo(5*0.3,1*0.3,5*0.3,4*0.3);
        shape.quadraticCurveTo(5*0.3,6.5*0.3,2*0.3,6.5*0.3);
        shape.quadraticCurveTo(0,6.5*0.3,0,4*0.3);
        shape.quadraticCurveTo(0,6.5*0.3,-2*0.3,6.5*0.3);
        shape.quadraticCurveTo(-5*0.3,6.5*0.3,-5*0.3,4*0.3);
        shape.quadraticCurveTo(-5*0.3,1*0.3,0,-4*0.3);
        
        var points = [];
        points.push(new THREE.Vector3(0,-1,0));
        points.push(new THREE.Vector3(1,-1,2));
        points.push(new THREE.Vector3(2,-1,4));
        points.push(new THREE.Vector3(1,-1,6));
        points.push(new THREE.Vector3(0,-1,8));
        points.push(new THREE.Vector3(-1,-1,10));
        points.push(new THREE.Vector3(-2,-1,12));
        points.push(new THREE.Vector3(-1,-1,14));
        points.push(new THREE.Vector3(0,-1,16));

        var path = new THREE.CatmullRomCurve3(points);

        var options = {depth: 0.2, bevelEnable: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 10, curveSegments: 10, extrudePath: path, steps: 100};
        //var options = {depth: 0.2, bevelEnable: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 10, curveSegments: 10};
        var geom = new THREE.ExtrudeBufferGeometry(shape,options);
        var mat = new THREE.MeshPhongMaterial({color: 0x00CF00});

        var mesh = new THREE.Mesh(geom,mat);

        this.add(mesh);
        mesh.scale.set(0.3,0.3,0.3);
        mesh.position.y = 0.3;
        mesh.rotation.x = THREE.MathUtils.degToRad(-90);
        this.rotation.y = THREE.MathUtils.degToRad(180);

    }
}

export { ColumnaCorazon }