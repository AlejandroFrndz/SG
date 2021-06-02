import * as THREE from '../libs/three.module.js'
import { GLTFLoader } from '../libs/GLTFLoader.js';

class Pedestal extends THREE.Object3D{
    constructor(){
        super();

        this.loaded = false;
        var that = this;
        var loader = new GLTFLoader();
        loader.load( '../models/gltf/pedestal/pedestal.glb', function ( gltf ) {
            // El modelo está en el atributo  scene
            that.model = gltf.scene;
            that.model.scale.x = 0.01;
            that.model.scale.y = 0.01;
            that.model.scale.z = 0.01;
            that.add(that.model);
            that.model.position.set(0,0,-99);

            /*var helper = new THREE.CylinderBufferGeometry(1,1,0.35,50);
            var mat = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.3});
            var mesh = new THREE.Mesh(helper,mat);
            that.add(mesh);
            */
            that.loaded = true;
        }, undefined, function ( e ) { console.error( e ); }
        );
    }
}

export { Pedestal };