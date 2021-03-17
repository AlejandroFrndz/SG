import * as THREE from '../libs/three.module.js'

class MyCone extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        var coneGeom = new THREE.ConeBufferGeometry(1,1,3);
        var coneMat = new THREE.MeshNormalMaterial();

        this.cone = new THREE.Mesh(coneGeom,coneMat);
        this.add(this.cone);

        this.cone.position.y = 0.5;
    }

    createGUI (gui,titleGui){
        this.guiControls = new function () {
            this.radio = 1.0;
            this.altura = 1.0;
            this.resolucion = 3;
        }

        var that = this;

        var folder = gui.addFolder (titleGui);
        folder.add(this.guiControls, 'radio', 1.0, 5.0, 0.1).name('Radio : ').listen()
        .onChange(function(rad){
            var coneGeom = new THREE.ConeGeometry(rad,that.guiControls.altura,that.guiControls.resolucion);
            that.cone.geometry = coneGeom;
        });
        folder.add(this.guiControls, 'altura', 1.0, 5.0, 0.1).name('Altura : ').listen()
        .onChange(function(alt){
            var coneGeom = new THREE.ConeGeometry(that.guiControls.radio,alt,that.guiControls.resolucion);
            that.cone.geometry = coneGeom;
        });
        folder.add(this.guiControls, 'resolucion', 3.0, 10.0, 1).name('Resolucion : ').listen()
        .onChange(function(res){
            var coneGeom = new THREE.ConeGeometry(that.guiControls.radio,that.guiControls.altura,res);
            that.cone.geometry = coneGeom;
        });
    }

    update(){
        this.rotation.y += 0.01;
    }
}

export { MyCone };