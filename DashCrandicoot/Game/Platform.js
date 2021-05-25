import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'

class Platform extends THREE.Object3D{
    static get Margen() {return 0.25;}

    constructor(sizeX, sizeZ){
        super();

        this.objs = [];
        this.dobjs = [];
        this.blake;
        this.dblake;

        this.x = sizeX/2;
        this.z = sizeZ/2;
        var geom = new THREE.BoxBufferGeometry(sizeX,2,sizeZ);
        geom.translate(0,-1,0);

        var texture = new THREE.TextureLoader().load('../imgs/textures/platform/platform.png');
        var normalMap = new THREE.TextureLoader().load('../imgs/textures/platform/platform-NM.png');
        var mat = new THREE.MeshPhongMaterial ({map: texture, normalMap: normalMap});

        this.mesh = new THREE.Mesh(geom,mat);
        this.add(this.mesh);
    }

    incluir(obj){
        this.objs.push(obj);
        var objP = obj.position.clone();
        objP.subVectors(objP,this.position);
        this.dobjs.push(objP);
    }
    
    excluir(obj){
        var index = this.objs.indexOf(obj);
        this.dobjs.splice(index,1);
        this.objs.splice(index,1);

    }

    incluirBlake(blake){
        if(this.blake == null){
            this.blake = blake;
            this.dblake = blake.position.clone();
            this.dblake.subVectors(this.dblake,this.position);
        }
    }

    excluirBlake(){
        this.blake = null;
    }

    crearAnimacion(start, finish, time, delay){
        var origin = start;
        var destiny = finish;

        var that = this;

        this.movimiento = new TWEEN.Tween(origin)
        .to(destiny,time)
        .onUpdate(function(){
            that.position.x = origin.x;
            that.position.z = origin.z;
            for(var i = 0; i < that.objs.length; i++){
                var obj = that.objs[i];
                obj.position.copy(that.position);
                obj.position.add(that.dobjs[i]);
            }
            if(that.blake != null){
                that.blake.position.copy(that.position);
                that.blake.position.add(that.dblake);
            }
        })
        .yoyo(true)
        .repeat(Infinity)
        .delay(delay)
        .start();
    }
}

export { Platform };