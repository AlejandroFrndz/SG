import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';
import { Lensflare, LensflareElement } from '../libs/LensFlare.js';

class DimensionLight extends THREE.Object3D{
    constructor(){
        super();

        this.positiveLight = new THREE.PointLight(0x0000FF,1,3,2);
        this.negativeLight = new THREE.PointLight(0xFF0000,1,3,2);

        this.spin = new THREE.Object3D();
        this.spin.add(this.positiveLight);
        this.spin.add(this.negativeLight);

        this.add(this.spin);

        var textureLoader = new THREE.TextureLoader();

        var mainTexture = textureLoader.load('../imgs/textures/lensflare/lensflare0.png');

        var positiveFlare = new Lensflare();
        positiveFlare.addElement(new LensflareElement(mainTexture,200,0,this.positiveLight.color));
        this.positiveLight.add(positiveFlare);

        var negativeFlare = new Lensflare();
        negativeFlare.addElement(new LensflareElement(mainTexture,200,0,this.negativeLight.color));
        this.negativeLight.add(negativeFlare);
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
            that.spin.position.copy(pos);
        })
        .repeat(Infinity)
        .start();
    }

    createSpline(){
        this.points = [];
        var x = 1;
        var y = 1.2;
        var z = 0;
        var ang = 0;
        var point;

        for(var i = 0; i < 12; i++){
            x = Math.cos(THREE.MathUtils.degToRad(ang)) * 1;
            z = Math.sin(THREE.MathUtils.degToRad(ang)) * 1;
            point = new THREE.Vector3(x,y,z);
            this.points.push(point);
            ang += 30;
        }

        this.spline = new THREE.CatmullRomCurve3(this.points,true);
    }

    switchDimensions(dimension){
        if(dimension == 1){
            this.positiveLight.visible = true;
            this.negativeLight.visible = false;
        }
        else{
            this.positiveLight.visible = false;
            this.negativeLight.visible = true;
        }
    }
}

export { DimensionLight };