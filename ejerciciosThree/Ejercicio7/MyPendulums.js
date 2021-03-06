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

        //Par??metros del P??ndulo Mayor
        var folderMayor = gui.addFolder('P??ndulo Mayor');

        folderMayor.add(this.guiControls, 'lPenMayor', 5, 10, 1).name('Longitud: ');
        folderMayor.add(this.guiControls, 'rotPenMayor', -45, 45, 1).name('Rotaci??n: ');

        //Par??metros del P??ndulo Menor
        var folderMenor = gui.addFolder('P??ndulo Menor');

        folderMenor.add(this.guiControls, 'lPenMenor', 10, 20, 1).name('Longitud: ');
        folderMenor.add(this.guiControls, 'posPenMenor', 0.1, 0.9, 0.1).name('Posici??n(%): ');
        folderMenor.add(this.guiControls, 'rotPenMenor', -45, 45, 1).name("Rotaci??n: ");

        //Bot??n de Reseteo
        gui.add(this.guiControls, 'reset').name('Reset');
    }

    update(){
        //Posici??n del P??ndulo Menor. Debe modificarse cuando se var??a este atributo directamente, o bien cu??ndo se modifica la longitud del p??ndulo mayor
        this.penMenor.position.y = -2 - this.guiControls.posPenMenor * this.guiControls.lPenMayor;

        //Rotaci??n del P??ndulo Mayor (Y en consecuencia del menor tambi??n, por lo que se mueve toda la pieza en conjunto)
        this.rotation.z = this.guiControls.rotPenMayor * Math.PI/180;

        //Rotaci??n del P??ndulo Menor
        this.penMenor.rotation.z = this.guiControls.rotPenMenor * Math.PI/180;

        //Longitud del P??ndulo Menor
        this.boxMeshMenor.scale.y = this.guiControls.lPenMenor;

        //Longitud del P??ndulo Mayor
        this.lowerBoxMeshMayor.position.y = -4 - this.guiControls.lPenMayor; //Implica tambi??n reposicionar la parte inferior del p??ndulo
        this.midBoxMeshMayor.scale.y = this.guiControls.lPenMayor;
    }
}

export { MyPendulums };