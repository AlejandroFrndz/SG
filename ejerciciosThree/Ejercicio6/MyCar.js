import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js'

class MyCar extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        var that = this;
        var matLoader = new MTLLoader();
        var objLoader = new OBJLoader();

        matLoader.load('../models/porsche911/911.mtl',
            function(materials){
                objLoader.setMaterials(materials);
                objLoader.load('../models/porsche911/Porsche_911_GT2.obj',
                    function(object){
                        var modelo = object;
                        that.add(modelo);
                    },null,null);
        });
    }

    createGUI(gui,titleGui){
        this.guiControls = new function() {
            this.rotationOnOff = false;
        }

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'rotationOnOff').name('Rotación: ');
    }

    update(){
        if(this.guiControls.rotationOnOff)
            this.rotation.y += 0.01;
    }
}

export { MyCar };