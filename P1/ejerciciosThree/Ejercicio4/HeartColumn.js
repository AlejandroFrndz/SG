import * as THREE from '../libs/three.module.js'

class HeartColumn extends THREE.Object3D{
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
        


        var points = [];
  
        points.push(new THREE.Vector3(0.0, 0.0, 0.0));
        points.push(new THREE.Vector3(20/2, 30/2, 0.0));
        points.push(new THREE.Vector3(2.5*10/2, 40/2, 0.0));
        points.push(new THREE.Vector3(30/2, 30/2, 0.0));
        points.push(new THREE.Vector3(40/2, 10/2, 0.0));
        points.push(new THREE.Vector3(40/2, 10/2, 10/2));
        points.push(new THREE.Vector3(40/2, 15/2, 20/2));
    
        var ruta = new THREE.CatmullRomCurve3(points);
    
        var options = { steps: 200, bevelEnabled: false, extrudePath: ruta };

        var heartGeom = new THREE.ExtrudeBufferGeometry(shape,options);
        var heartMat = new THREE.MeshPhongMaterial({color: 0x00CF00});

        var heart = new THREE.Mesh(heartGeom,heartMat);

        this.add(heart);
        heart.scale.set(0.1,0.1,0.1);
    }
}

export { HeartColumn }