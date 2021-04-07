import * as THREE from '../libs/three.module.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import * as TWEEN from '../libs/tween.esm.js'

class Plane extends THREE.Object3D{
    constructor(){
        super();

        this.spline = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(0,2,2),
                new THREE.Vector3(4,0.5,2),
                new THREE.Vector3(6,2,1),
                new THREE.Vector3(5,3.5,0),
                new THREE.Vector3(0,3,0),
                new THREE.Vector3(-5,2.5,0),
                new THREE.Vector3(-6,3.2,1),
                new THREE.Vector3(-5.5,4,2)
            ],true
        );

        var lineGeom = new THREE.Geometry();
        lineGeom.vertices = this.spline.getPoints(100);

        var lineMesh = new THREE.Line(lineGeom,new THREE.LineBasicMaterial({color: 0xFF0000}));

        this.add(lineMesh);

        this.loaded = false;
        var that = this;
        const manager = new THREE.LoadingManager();
        manager.onLoad = function(){
            that.loaded = true;
            that.createAnimation();
        }
        var matLoader = new MTLLoader(manager);
        var objLoader = new OBJLoader(manager);

        matLoader.load('../models/porsche911/11803_Airplane_v1_l1.mtl',
            function(materials){
                objLoader.setMaterials(materials);
                objLoader.load('../models/porsche911/11803_Airplane_v1_l1.obj',
                    function(object){
                        var modelo = object;
                        modelo.scale.x = 0.0005;
                        modelo.scale.y = 0.0005;
                        modelo.scale.z = 0.0005;
                        modelo.rotation.y = THREE.MathUtils.degToRad(-90);
                        var intermedio = new THREE.Object3D();
                        intermedio.add(modelo);
                        intermedio.rotation.z = THREE.MathUtils.degToRad(-90);
                        that.animacion = new THREE.Object3D();
                        var pos = that.spline.getPointAt(0);
                        that.animacion.position.copy(pos);
                        var tangente = that.spline.getTangentAt(0);
                        pos.add(tangente);
                        that.animacion.lookAt(pos);
                        that.animacion.add(intermedio);
                        that.add(that.animacion);
                    },null,null);
        });
            }

    update(){
        TWEEN.update();
    }

    createAnimation(){
        this.origin1 = {p : 0};
        this.destiny1 = {p : 0.5};
        var that = this;
        this.animation1 = new TWEEN.Tween(this.origin1)
            .to(this.destiny1,4000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function() { 
                var pos = that.spline.getPointAt(that.origin1.p);
                that.animacion.position.copy(pos);
                var tangente = that.spline.getTangentAt(that.origin1.p);
                pos.add(tangente);
                that.animacion.lookAt(pos);
            });
        
        this.origin2 = {p : 0.5};
        this.destiny2 = {p : 1};

        this.animation2 = new TWEEN.Tween(this.origin2)
        .to(this.destiny2,8000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function() { 
            var pos = that.spline.getPointAt(that.origin2.p);
            that.animacion.position.copy(pos);
            var tangente = that.spline.getTangentAt(that.origin2.p);
            pos.add(tangente);
            that.animacion.lookAt(pos);
        });

        this.animation1.chain(this.animation2);
        this.animation2.chain(this.animation1);

        this.animation1.start();
   }
}

export { Plane };