import * as THREE from '../libs/three.module.js'

class Rope extends THREE.Object3D{

    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        this.a = this.createA();
        this.b = this.createB();

        this.b.position.y = -10;

        this.add(this.a);
        this.add(this.b);

    }

    createA(){
        var cajaGeom = new THREE.BoxBufferGeometry(1,10,1);
        cajaGeom.translate(0,-5,0);

        var textA = new THREE.TextureLoader().load('../imgs/textura-ajedrezada.jpg');

        var matA = new THREE.MeshPhongMaterial({map: textA});

        var caja = new THREE.Mesh(cajaGeom,matA);

        return caja;
    }

    createB(){
        var cajaGeom = new THREE.BoxBufferGeometry(1,10,1);
        cajaGeom.translate(0,-5,0);

        var textB = new THREE.TextureLoader().load('../imgs/textura-ajedrezada-amarilla.jpg');

        var matB = new THREE.MeshPhongMaterial({map: textB});

        var caja = new THREE.Mesh(cajaGeom,matB);

        return caja;
    }

    createGUI(gui,titleGui){
        this.guiControls = new function() {
            this.scaleA = 1;
            this.rotA = 0;
            this.scaleB = 1;
            this.rotB = 0;
        }

        var that = this;

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'scaleA', 1.0, 2.0, 0.1).name('Escala Superior:').listen()
        .onChange(function(scaleA){
            that.a.scale.y = scaleA;
            that.b.position.y = -10*scaleA;
        });

        folder.add(this.guiControls, 'rotA', 0.0, 0.5, 0.1).name('Rotacion Superior:').listen()
        .onChange(function(rotA){
            that.rotation.z = rotA;
        });

        folder.add(this.guiControls, "scaleB", 1.0, 2.0, 0.1).name('Escala Inferior:').listen()
        .onChange(function(scaleB){
            that.b.scale.y = scaleB;
        });

        folder.add(this.guiControls, "rotB", 0.0, 0.5, 0.1).name('Rotacion Inferior:').listen()
        .onChange(function(rotB){
            that.b.rotation.z = rotB;
        });
    }
}

export { Rope };