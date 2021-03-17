import * as THREE from '../libs/three.module.js'

class MyTorus extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        var torGeom = new THREE.TorusGeometry(1,1,3,3);
        var torMat = new THREE.MeshNormalMaterial();

        this.torus = new THREE.Mesh(torGeom,torMat);
        this.add(this.torus);

        this.position.y = 0.5;
    }

    createGUI (gui,titleGui){
        this.guiControls = new function () {
            this.radio = 1.0;
            this.radioTubo = 1.0;
            this.resolucion = 3;
            this.resolucionTubo = 3;
        }

        var that = this;

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'radio', 1.0, 5.0, 0.1).name('Radio : ').listen()
        .onChange(function(rad){
            var torGeom = new THREE.TorusGeometry(rad,that.guiControls.radioTubo,that.guiControls.resolucion,that.guiControls.resolucionTubo);
            that.torus.geometry = torGeom;
        });
        folder.add(this.guiControls, 'radioTubo', 1.0, 5.0, 0.1).name('Radio Tubo : ').listen()
        .onChange(function(radT){
            var torGeom = new THREE.TorusGeometry(that.guiControls.radio,radT,that.guiControls.resolucion,that.guiControls.resolucionTubo);
            that.torus.geometry = torGeom;
        });
        folder.add(this.guiControls, 'resolucion', 3.0, 10.0, 1).name('Resolucion Toro : ').listen()
        .onChange(function(res){
            var torGeom = new THREE.TorusGeometry(that.guiControls.radio,that.guiControls.radioTubo,res,that.guiControls.resolucionTubo);
            that.torus.geometry = torGeom;
        });
        folder.add(this.guiControls, 'resolucionTubo', 3.0, 10.0, 1).name('Resolucion Tubo : ').listen()
        .onChange(function(resT){
            var torGeom = new THREE.TorusGeometry(that.guiControls.radio,that.guiControls.radioTubo,that.guiControls.resolucion,resT);
            that.torus.geometry = torGeom;
        });
    }

    update(){
        this.rotation.y += 0.01;
    }
}

export { MyTorus };