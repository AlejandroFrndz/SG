import * as THREE from '../libs/three.module.js'

class MyPendulums extends THREE.Object3D{
    constructor(gui){
        super();

        this.createGUI(gui);

        this.matGreen = new THREE.MeshPhongMaterial({color: 0x00CF00});
        this.matBlue = new THREE.MeshPhongMaterial({color: 0x0000CF});
        this.matRed = new THREE.MeshPhongMaterial({color: 0xCF0000});
        this.matGrey = new THREE.MeshPhongMaterial({color: 0x808080});

        this.penMenor = this.createPenMenor();
        this.penMayor = this.createPenMayor();

        this.add(this.penMenor);
        this.add(this.penMayor);

        this.penMenor.position.y = -2 - this.guiControls.posPenMenor * this.guiControls.lPenMayor;
        this.penMenor.position.z = 1.75;

        this.rotation.z = this.guiControls.rotPenMayor * Math.PI/180;
    }

    createPenMenor(){
        var boxGeom = new THREE.BoxBufferGeometry(1.5,1,1.5);
        boxGeom.translate(0,-0.5,0);

        this.boxMeshMenor = new THREE.Mesh(boxGeom,this.matBlue);

        this.boxMeshMenor.scale.y = this.guiControls.lPenMenor;
        this.boxMeshMenor.position.y += 1;

        var cylGeom = new THREE.CylinderBufferGeometry(0.5,0.5,0.25,8);
        cylGeom.rotateX(Math.PI/2);
        cylGeom.translate(0,0,0.875);

        var cylMesh = new THREE.Mesh(cylGeom,this.matGreen);

        var penMenor = new THREE.Object3D();
        penMenor.add(this.boxMeshMenor);
        penMenor.add(cylMesh);

        penMenor.rotation.z = this.guiControls.rotPenMenor * Math.PI/180;

        return penMenor;
    }

    createPenMayor(){
        var boxGeom = new THREE.BoxBufferGeometry(2,4,2);

        var upperBoxMesh = new THREE.Mesh(boxGeom,this.matGreen);
        this.lowerBoxMeshMayor = new THREE.Mesh(boxGeom,this.matGreen);

        this.lowerBoxMeshMayor.position.y = -4 - this.guiControls.lPenMayor;

        var midBoxGeom = new THREE.BoxBufferGeometry(2,1,2);
        midBoxGeom.translate(0,-0.5,0);

        this.midBoxMeshMayor = new THREE.Mesh(midBoxGeom,this.matRed);
        this.midBoxMeshMayor.scale.y = this.guiControls.lPenMayor;
        this.midBoxMeshMayor.position.y -= 2;

        var cylGeom = new THREE.CylinderBufferGeometry(0.666666666,0.666666666,0.25,8);
        cylGeom.rotateX(Math.PI/2);
        cylGeom.translate(0,0,1.125);

        var cylMesh = new THREE.Mesh(cylGeom,this.matGrey);

        var penMayor = new THREE.Object3D();

        penMayor.add(upperBoxMesh);
        penMayor.add(this.midBoxMeshMayor);
        penMayor.add(this.lowerBoxMeshMayor);
        penMayor.add(cylMesh);

        return penMayor;
    }

    createGUI(gui){
        this.guiControls = new function(){
            this.lPenMayor = 5;
            this.lPenMenor = 10;
            this.rotPenMayor = 0;
            this.rotPenMenor = 0;
            this.posPenMenor = 0.1;

            this.reset = function(){
                this.lPenMayor = 5;
                this.lPenMenor = 10;
                this.rotPenMayor = 0;
                this.rotPenMenor = 0;
                this.posPenMenor = 0.1;
            }
        }

        //Parámetros del Péndulo Mayor
        var folderMayor = gui.addFolder('Péndulo Mayor');

        folderMayor.add(this.guiControls, 'lPenMayor', 5, 10, 1).name('Longitud: ').listen();
        folderMayor.add(this.guiControls, 'rotPenMayor', -45, 45, 1).name('Rotación: ').listen();

        //Parámetros del Péndulo Menor
        var folderMenor = gui.addFolder('Péndulo Menor');

        folderMenor.add(this.guiControls, 'lPenMenor', 10, 20, 1).name('Longitud: ').listen();
        folderMenor.add(this.guiControls, 'posPenMenor', 0.1, 0.9, 0.1).name('Posición(%): ').listen();
        folderMenor.add(this.guiControls, 'rotPenMenor', -45, 45, 1).name("Rotación: ").listen();

        //Botón de Reseteo
        gui.add(this.guiControls, 'reset').name('Reset');
    }

    update(){
        //Posición del Péndulo Menor. Debe modificarse cuando se varía este atributo directamente, o bien cuándo se modifica la longitud del péndulo mayor
        this.penMenor.position.y = -2 - this.guiControls.posPenMenor * this.guiControls.lPenMayor;

        //Rotación del Péndulo Mayor (Y en consecuencia del menor también, por lo que se mueve toda la pieza en conjunto)
        this.rotation.z = this.guiControls.rotPenMayor * Math.PI/180;

        //Rotación del Péndulo Menor
        this.penMenor.rotation.z = this.guiControls.rotPenMenor * Math.PI/180;

        //Longitud del Péndulo Menor
        this.boxMeshMenor.scale.y = this.guiControls.lPenMenor;

        //Longitud del Péndulo Mayor
        this.lowerBoxMeshMayor.position.y = -4 - this.guiControls.lPenMayor; //Implica también reposicionar la parte inferior del péndulo
        this.midBoxMeshMayor.scale.y = this.guiControls.lPenMayor;
    }
}

export { MyPendulums };