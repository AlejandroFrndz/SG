import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'

class Bola extends THREE.Object3D{
    constructor(gui){
        super();

        this.createGui(gui);

        var cilGeom = new THREE.CylinderBufferGeometry(this.guiControls.radius,this.guiControls.radius,5,30,30);
        cilGeom.translate(0,2.5,0);
        var cilMat = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.5});

        this.cil = new THREE.Mesh(cilGeom,cilMat);

        this.add(this.cil);

        var sphereGeom = new THREE.SphereBufferGeometry(0.5,30,30);
        sphereGeom.translate(0,0.5,0);
        var sphereMat = new THREE.MeshNormalMaterial();

        this.bola = new THREE.Mesh(sphereGeom,sphereMat);

        this.add(this.bola);

        this.createAnimation();
    }

    createAnimation(){
        this.createSpline();

        var origin = {p : 0};
        var destiny = {p : 1};

        var that = this;

        this.animation = new TWEEN.Tween(origin)
        .to(destiny,10000)
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
        var x = 1;
        var y = 0;
        var z = 0;
        var ang = 0;
        var point;

        for(var i = 0; i < 12; i++){
            x = Math.cos(THREE.MathUtils.degToRad(ang)) * this.guiControls.radius;
            y = ((y+1) % 2) * 5;
            z = Math.sin(THREE.MathUtils.degToRad(ang)) * this.guiControls.radius;
            point = new THREE.Vector3(x,y,z);
            this.points.push(point);
            ang += 30;
        }

        
        this.spline = new THREE.CatmullRomCurve3(this.points,true);
    }

    createGui(gui){
        this.guiControls = new function () {
            this.radius = 1.0;
        }

        var that = this;
        gui.add(this.guiControls, 'radius', 1.0, 6.0, 0.1).name("Radio: ")
        .onChange(function(rad){
            var cilGeom = new THREE.CylinderBufferGeometry(rad,rad,5,30,30)
            cilGeom.translate(0,2.5,0);
            that.cil.geometry = cilGeom;
            that.createSpline();
        });
    }

    update(){
        TWEEN.update();
    }
}

export { Bola };