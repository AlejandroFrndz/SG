import * as THREE from '../libs/three.module.js'

class MyIcosahedron extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        var icoGeom = new THREE.IcosahedronBufferGeometry(1,0);
        var icoMat = new THREE.MeshNormalMaterial();

        this.icosahedron = new THREE.Mesh(icoGeom,icoMat);
        this.add(this.icosahedron);

        this.position.y = 0.5;
    }

    createGUI (gui,titleGui){
        this.guiControls = new function () {
            this.radio = 1.0;
            this.detail = 0.0;
        }

        var that = this;

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'radio', 1.0, 5.0, 0.1).name('Radio : ').listen()
        .onChange(function(rad){
            var icoGeom = new THREE.IcosahedronGeometry(rad,that.guiControls.detail);
            that.icosahedron.geometry = icoGeom;
        });
        folder.add(this.guiControls, 'detail', 0, 3.0, 1).name('Subdivisión : ').listen()
        .onChange(function(det){
            var icoGeom = new THREE.IcosahedronGeometry(that.guiControls.radio,det);
            that.icosahedron.geometry = icoGeom;
        });
    }
    
    update(){
        this.rotation.y += 0.01;
    }
}

export { MyIcosahedron };