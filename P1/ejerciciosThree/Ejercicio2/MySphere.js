import * as THREE from '../libs/three.module.js'

class MySphere extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        var sphGeom = new THREE.SphereGeometry(1,3,2);
        var sphMat = new THREE.MeshNormalMaterial();

        this.sphere = new THREE.Mesh(sphGeom,sphMat);
        this.add(this.sphere);

        this.sphere.position.y = 0.5;
    }
    
    createGUI (gui,titleGui){
        this.guiControls = new function () {
            this.radio = 1.0;
            this.resWidth = 3;
            this.resHeight = 2;
        }

        var that = this;

        var folder = gui.addFolder (titleGui);
        folder.add(this.guiControls, 'radio', 1.0, 5.0, 0.1).name('Radio : ').listen()
        .onChange(function(rad){
            var sphGeom = new THREE.SphereGeometry(rad,that.guiControls.resWidth,that.guiControls.resHeight);
            that.sphere.geometry = sphGeom;
        });
        folder.add(this.guiControls, 'resWidth', 3.0, 10.0, 1).name('Res. Width : ').listen()
        .onChange(function(resW){
            var sphGeom = new THREE.SphereGeometry(that.guiControls.radio,resW,that.guiControls.resHeight);
            that.sphere.geometry = sphGeom;
        });
        folder.add(this.guiControls, 'resHeight', 2.0, 10.0, 1).name('Res. Height : ').listen()
        .onChange(function(resH){
            var sphGeom = new THREE.SphereGeometry(that.guiControls.radio,that.guiControls.resWidth,resH);
            that.sphere.geometry = sphGeom;
        });
    }

    update(){
        this.rotation.y += 0.01;
    }
}

export { MySphere };