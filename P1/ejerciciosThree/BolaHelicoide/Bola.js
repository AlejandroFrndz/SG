import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'

class Bola extends THREE.Object3D{
    constructor(gui){
        super();

        this.createGui(gui);

        var cilGeom = new THREE.CylinderBufferGeometry(this.guiControls.radius,this.guiControls.radius,5,30,30);
        var cilMat = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.5});

        this.cil = new THREE.Mesh(cilGeom,cilMat);
        this.cil.position.y = 2.5;
        this.add(this.cil);

        var sphereGeom = new THREE.SphereBufferGeometry(0.5,30,30);
        var sphereMat = new THREE.MeshNormalMaterial();

        this.bola = new THREE.Mesh(sphereGeom,sphereMat);
        this.add(this.bola);

        this.createAnimation();
    }

    createGui(gui){
        this.guiControls = new function() {
            this.radius = 1.0;
        }

        var that = this;

        gui.add(this.guiControls, 'radius', 1.0, 6.0, 0.1).name("Radio: ")
        .onChange(function(rad){
            var cilGeom = new THREE.CylinderBufferGeometry(rad,rad,5,30,30);
            that.cil.geometry = cilGeom;
            that.createSpline();
        });
    }

    createAnimation(){
        this.createSpline();

        var origin = {p : 0};
        var destiny = {p : 1};

        var that = this;

        this.animation = new TWEEN.Tween(origin)
        .to(destiny,30000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function(){
            var pos = that.spline.getPointAt(origin.p);
            that.bola.position.copy(pos);
        })
        .repeat(Infinity)
        .start();
    }
    
    createSpline(){
        this.points = [];

        var rad = this.guiControls.radius;
        var x = rad;
        var y = 0;
        var z = 0;
        var ang = 0;
        var dy = 5/100;
        var dang = 360/20;
        var point;

        for(var i = 0; i < 100; i++){
            x = Math.cos(THREE.MathUtils.degToRad(ang)) * rad;
            y += dy;
            z = Math.sin(THREE.MathUtils.degToRad(ang)) * rad;
            ang += dang;
            point = new THREE.Vector3(x,y,z);
            this.points.push(point);
        }

        for(var i = 0; i < 100; i++){
            x = Math.cos(THREE.MathUtils.degToRad(ang)) * rad;
            y -= dy;
            z = Math.sin(THREE.MathUtils.degToRad(ang)) * rad;
            ang += dang;
            point = new THREE.Vector3(x,y,z);
            this.points.push(point);
        }

        this.spline = new THREE.CatmullRomCurve3(this.points,true);
        
        //Descomentar para visualizar el spline
        /*
        var lineGeom = new THREE.Geometry();
        lineGeom.vertices = this.spline.getPoints(500);

        var lineMesh = new THREE.Line(lineGeom,new THREE.LineBasicMaterial({color: 0xFF0000}));

        this.add(lineMesh);
        */
    }

    update(){
        TWEEN.update();
    }
}

export { Bola };