import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'
import { Fruit } from './Fruit.js'
import { MyScene } from './MyScene.js';

class Crate extends THREE.Object3D{
  //Además de la dimensión, las cajas aceptan un parámetro que indica el número de frutas que otorgan al destruirse
  constructor(fruits, dimension, dimensionColor) {
      super();
      
      //Se separa la creación del modelo y las animaciones en sus propias funciones, para mayor claridad
      this.createModel();
      this.createAnimation();

      //Se establece el número de frutas otorgadas
      this.nFruits = fruits;
      //Independientemente de cuantas sean, la animación de la fruta que sale de la caja se realiza solamente con 1
      //Puesto que el efecto es igual y así se ahorra computación innecesaria
      this.fruit = new Fruit();

      //También se establece la dimensión del objeto y su color correspondiente
      this.dimension = dimension;
      this.dimensionColor = dimensionColor;
    }

  //Creación del modelo
  createModel(){
    //En realidad, para poder realizar la animación de rotura, las cajas no son 1 sola caja sino 6 cajas finas
    //Dispuestas de forma que crean una caja. Esto me permite en la animación mover cada cara como me interese

    //Por tanto primero se crea la geometría de una cara que será compartida por las 6
    var boxGeom = new THREE.BoxGeometry (1,1,0.01);
    boxGeom.translate(0,0.51,0);
    
    //Se cargan las texturas de color y normales y se crea el material, también compartido
    this.texture = new THREE.TextureLoader().load('../imgs/textures/crate/crate.jpg');
    this.normalMap = new THREE.TextureLoader().load('../imgs/textures/crate/crate-NM.jpg');
    this.mat = new THREE.MeshPhongMaterial ({map: this.texture, normalMap: this.normalMap});

    //Ahora, para cada 1 de las 6 caras se crea y posiciona un Mesh
    this.animFront = new THREE.Mesh(boxGeom,this.mat);
    var faceFront = new THREE.Object3D();
    faceFront.add(this.animFront);
    faceFront.position.z = 0.5;

    this.animBack = new THREE.Mesh(boxGeom,this.mat);
    var faceBack = new THREE.Object3D();
    faceBack.add(this.animBack);
    faceBack.position.z = -0.5;

    this.animRight = new THREE.Mesh(boxGeom,this.mat);
    var faceRight = new THREE.Object3D();
    faceRight.add(this.animRight);
    faceRight.rotation.y = THREE.MathUtils.degToRad(90);
    faceRight.position.x = 0.5;

    this.animLeft = new THREE.Mesh(boxGeom,this.mat);
    var faceLeft = new THREE.Object3D();
    faceLeft.add(this.animLeft);
    faceLeft.rotation.y = THREE.MathUtils.degToRad(90);
    faceLeft.position.x = -0.5;

    this.faceTop = new THREE.Mesh(boxGeom,this.mat);
    this.faceTop.rotation.x = THREE.MathUtils.degToRad(90);
    this.faceTop.position.y = 1;
    this.faceTop.position.z = -0.5;

    this.faceBottom = new THREE.Mesh(boxGeom,this.mat);
    this.faceBottom.rotation.x = THREE.MathUtils.degToRad(90);
    this.faceBottom.position.z = -0.5;

    //Se añaden las 6 caras al grafo
    this.add(faceFront);
    this.add(faceBack);
    this.add(faceRight);
    this.add(faceLeft);
    this.add(this.faceTop);
    this.add(this.faceBottom);

    //Las cajas deben proyectar sombras, por lo que para cada mesh se establece la variable correspondiente
    this.traverseVisible(function(unNodo){
      unNodo.castShadow = true;
    })

  }

  //Creación de la animación de destrucción
  createAnimation(){
    var origin = {rot: 0, top: 1};
    var destiny = {rot: 90, top: 0};

    var that = this;

    this.broken = false;

    this.animation = new TWEEN.Tween(origin)
    .to(destiny,500)
    .easing(TWEEN.Easing.Quadratic.In)
    .onStart(function(){
      //Cuando comienza, se establece la caja como rota
      that.broken = true;
      //Se añade al grafo la fruta y se comienza su animación
      that.add(that.fruit);
      that.fruit.pickUp();
      //Y se actualizan los contadores de la escena
      MyScene.fruitCount += (that.nFruits - 1); //La fruta para la animación ya otorga 1 fruta al contador, por lo que la caja debe otorgar las n-1 restantes
      MyScene.crateCount++;
    })
    .onUpdate(function(){
      //Cada cara de la caja tiene su propia animación
      that.faceTop.position.y = origin.top;
      that.animRight.rotation.x = THREE.MathUtils.degToRad(origin.rot);
      that.animLeft.rotation.x = THREE.MathUtils.degToRad(-origin.rot);
      that.animFront.rotation.x = THREE.MathUtils.degToRad(origin.rot);
      that.animBack.rotation.x = THREE.MathUtils.degToRad(-origin.rot);
    });

    //Una vez rota, la caja permanece un momento en el suelo antes de desaparacer
    var remove = new TWEEN.Tween(origin)
    .to(destiny,500)
    .onComplete(function(){
      //Para desaparecer se elimina del grafo y así no se visualiza
      that.parent.remove(that);
    });

    this.animation.chain(remove);
  }

  //Cuando se rompe la caja se lanza al animación
  startAnimation(){
    if(!this.broken){
      this.animation.start();
    }
  }

  //Función para el cambio de dimensión, su funcionamiento es análogo al del cambio en las plataformas
  toggleWireFrame(modo){
    if(modo){
      this.mat.wireframe = true;
      this.mat.color.set(this.dimensionColor);
      this.mat.map = null;
      this.mat.normalMap = null;
      this.mat.needsUpdate = true;
      this.traverseVisible(function(unNodo){
        unNodo.castShadow = false;
      })
    }
    else{
      this.mat.wireframe = false;
      this.mat.map = this.texture;
      this.mat.normalMap = this.normalMap;
      this.mat.color.set(0xFFFFFF);
      this.mat.needsUpdate = true;
      this.traverseVisible(function(unNodo){
        unNodo.castShadow = true;
      })
    }
  }
}

export { Crate };