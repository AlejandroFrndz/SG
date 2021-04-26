import * as THREE from '../libs/three.module.js'

class MyClock extends THREE.Object3D{
    constructor(gui){
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

        var handGeom = new THREE.BoxBufferGeometry(0.2,clockRadius-0.5,0.2);
        handGeom.translate(0,1.75,0);

        this.hand = new THREE.Mesh(handGeom,new THREE.MeshPhongMaterial({color: 0x000000}));
        this.add(this.hand);

        this.createGUI(gui);

        this.tiempoAnterior = Date.now();
    }

    createGUI(gui){
        this.guiControls = new function(){
            this.speed = 0;
        }

        gui.add(this.guiControls,'speed',-12,12,1).name('Velocidad (marcas/s): ');
    }

    update(){
        var tiempoActual = Date.now();
        var deltaTime = (tiempoActual-this.tiempoAnterior)/1000;
        this.hand.rotation.z += (-1*this.guiControls.speed*THREE.MathUtils.degToRad(30)) * deltaTime;
        this.tiempoAnterior = tiempoActual;
    }
}

export { MyClock };