import * as THREE from '../libs/three.module.js';

class ColumnaTrebol extends THREE.Object3D{
    constructor(){
        super();

        var shape = new THREE.Shape();

        shape.absarc(0,0.4,1,THREE.MathUtils.degToRad(0),THREE.MathUtils.degToRad(180));
        shape.absarc(-1,-1,1,THREE.MathUtils.degToRad(90),THREE.MathUtils.degToRad(360));
        shape.absarc(1,-1,1,THREE.MathUtils.degToRad(180),THREE.MathUtils.degToRad(90));

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

        var geom = new THREE.ExtrudeBufferGeometry(shape,options);
        var mat = new THREE.MeshPhongMaterial({color: 0x00CF00});


        var mesh = new THREE.Mesh(geom,mat);

        this.add(mesh);
        this.scale.set(0.3,0.3,0.3);
        this.position.y = 0.3;
        this.rotation.x = THREE.MathUtils.degToRad(-90);

    }
}

export { ColumnaTrebol };