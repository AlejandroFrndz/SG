import * as THREE from '../libs/three.module.js'

class MyPawn extends THREE.Object3D{
    constructor(gui,titleGui){
        super();

        this.createGUI(gui,titleGui);

        this.points = [];

        // Se añaden los puntos al array
        this.points.push(new THREE.Vector3(0.0, -1.4, 0.0));
        this.points.push(new THREE.Vector3(1.0, -1.4, 0.0));
        this.points.push(new THREE.Vector3(1.0, -1.1, 0.0));
        this.points.push(new THREE.Vector3(0.5, -0.7, 0.0));
        this.points.push(new THREE.Vector3(0.4, -0.4, 0.0));
        this.points.push(new THREE.Vector3(0.4, 0.5, 0.0));
        this.points.push(new THREE.Vector3(0.5, 0.6, 0.0));
        this.points.push(new THREE.Vector3(0.3, 0.6, 0.0));
        this.points.push(new THREE.Vector3(0.5, 0.8, 0.0));
        this.points.push(new THREE.Vector3(0.55, 1.0, 0.0));
        this.points.push(new THREE.Vector3(0.5, 1.2, 0.0));
        this.points.push(new THREE.Vector3(0.3, 1.4, 0.0));
        this.points.push(new THREE.Vector3(0.0, 1.4, 0.0));

        var pawnGeom = new THREE.LatheGeometry(this.points,this.guiControls.resolucion,0,this.guiControls.grados);
        var lineMat = new THREE.MeshNormalMaterial();
        this.pawn = new THREE.Mesh(pawnGeom,lineMat);
        this.add(this.pawn);
        this.pawn.position.y = 1.4;

        var lineGeom = new THREE.Geometry();
        lineGeom.vertices = this.points;
        this.line = new THREE.Line(lineGeom,lineMat);
        this.add(this.line);

        this.line.position.x = 3;
        this.line.position.y = 1.4;
    }

    createGUI(gui,titleGui){
        this.guiControls = new function () {
            this.resolucion = 3;
            this.grados = 2*Math.PI;
        }

        var that = this;

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'resolucion', 3.0, 20.0, 1).name('Resolución : ').listen()
        .onChange(function(res){
            var pawnGeom = new THREE.LatheGeometry(that.points,res,0,that.guiControls.grados);
            that.pawn.geometry = pawnGeom;
        });

        folder.add(this.guiControls, 'grados', 0, 2*Math.PI, 0.3).name('Grados de Revolución : ').listen()
        .onChange(function(grad){
            var pawnGeom = new THREE.LatheGeometry(that.points,that.guiControls.resolucion,0,grad);
            that.pawn.geometry = pawnGeom;
        });
    }
}

export { MyPawn };