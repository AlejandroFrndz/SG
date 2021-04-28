import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'

const radioBase = 3;
const steps = 60;

class Bola extends THREE.Object3D{
    constructor(gui){
        super();

        this.createGui(gui);

        var cilGeom = new THREE.CylinderBufferGeometry(radioBase,radioBase,2,30,30);
        var cilMat = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.5});

        this.cil = new THREE.Mesh(cilGeom,cilMat);
        this.cil.position.y = 1;
        this.add(this.cil);

        var sphereGeom = new THREE.SphereBufferGeometry(0.5,30,30);
        var sphereMat = new THREE.MeshNormalMaterial();

        this.bola = new THREE.Mesh(sphereGeom,sphereMat);
        this.add(this.bola);

        this.createAnimation();
    }

    createGui(gui){
        this.guiControls = new function(){
            this.extension = 1;
        }

        var that = this;

        gui.add(this.guiControls,'extension',1.0,4.0,0.1).name("Extensión: ")
        .onChange(function(ext){
            that.cil.scale.x = ext;
            that.createSpline();
        });
    }

    createAnimation(){
        this.createSpline();

        var origin = {p : 0};
        var destiny = {p : 1};

        var that = this;

        this.animation = new TWEEN.Tween(origin)
        .to(destiny,4000)
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

        var x = radioBase * this.guiControls.extension;
        var y = 1;
        var z = 0;
        var ang = 0;
        var dang = 360/steps;
        var point;

        for(var i = 0; i < steps; i++){
            x = Math.cos(THREE.MathUtils.degToRad(ang)) * radioBase * this.guiControls.extension;
            z = Math.sin(THREE.MathUtils.degToRad(ang)) * radioBase;

            point = new THREE.Vector3(x,y,z);
            this.points.push(point);

            ang += dang;
        }

        this.spline = new THREE.CatmullRomCurve3(this.points,true);
    }

    updateSpline(){
        var ang = 0;
        var dang = 360/steps;

        for(var i = 0; i < steps; i++){
            this.points[i].setComponent(0,Math.cos(THREE.MathUtils.degToRad(ang)) * radioBase * this.guiControls.extension); 
            ang += dang;
        }

        this.spline.points = this.points;
    }

    update(){
        TWEEN.update();
    }
}

export { Bola };