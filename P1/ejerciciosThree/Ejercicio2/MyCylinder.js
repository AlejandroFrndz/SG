import * as THREE from '../libs/three.module.js'

class MyCylinder extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();

        this.createGUI(gui, titleGui);

        var cylGeom = new THREE.CylinderGeometry(this.guiControls.radioSup,this.guiControls.radioInf,this.guiControls.altura,this.guiControls.resolucion);
        var cylMat = new THREE.MeshNormalMaterial();

        this.cyl = new THREE.Mesh(cylGeom,cylMat);
        this.add(this.cyl);

        this.cyl.position.y = 0.5;
    }
    
    createGUI (gui,titleGui){
        this.guiControls = new function () {
            this.radioSup = 1.0;
            this.radioInf = 1.0;
            this.altura = 1.0;
            this.resolucion = 3;
        }

        var that = this;

        var folder = gui.addFolder (titleGui);
        folder.add(this.guiControls, 'radioSup', 1.0, 5.0, 0.1).name('Radio Superior : ').listen()
        .onChange(function(radSup){
            var cylGeom = new THREE.CylinderGeometry(radSup,that.guiControls.radioInf,that.guiControls.altura,that.guiControls.resolucion);
            that.cyl.geometry = cylGeom;
        });
        folder.add(this.guiControls, 'radioInf', 1.0, 5.0, 0.1).name('Radio Inferior : ').listen()        
        .onChange(function(radInf){
            var cylGeom = new THREE.CylinderGeometry(that.guiControls.radioSup,radInf,that.guiControls.altura,that.guiControls.resolucion);
            that.cyl.geometry = cylGeom;
        });
        folder.add(this.guiControls, 'altura', 1.0, 5.0, 0.1).name('Altura : ').listen()
        .onChange(function(alt){
            var cylGeom = new THREE.CylinderGeometry(that.guiControls.radioSup,that.guiControls.radioInf,alt,that.guiControls.resolucion);
            that.cyl.geometry = cylGeom;
        });
        folder.add(this.guiControls, 'resolucion', 3.0, 10.0, 1).name('Resolucion : ').listen()
        .onChange(function(res){
            var cylGeom = new THREE.CylinderGeometry(that.guiControls.radioSup,that.guiControls.radioInf,that.guiControls.altura,res);
            that.cyl.geometry = cylGeom;
        });
    }

    update (){
        this.rotation.y += 0.01;
    }
}

export { MyCylinder };