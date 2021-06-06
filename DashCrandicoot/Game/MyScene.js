
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { FlyControls } from '../libs/FlyControls.js';
import * as TWEEN from '../libs/tween.esm.js'
import * as STATS from '../libs/stats.module.js'

// Clases de mi proyecto

import { Crate } from './Crate.js'
import { Blake } from './Blake.js'
import { Fruit } from './Fruit.js'
import { Platform } from './Platform.js'

//Constantes
const positiveColor = 0x0000FF;
const negativeColor = 0xFF0000;
const SceneStates = Object.freeze({"DEAD":-1, "LOADING":1, "PLAYING":2, "ENDING":3});
const maxCrates = 10;
const maxFruits = 130;

var stats

/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  static fruitCount = 0;
  static crateCount = 0;

  constructor (myCanvas) { 
    super();

    //Establecemos el estado de la escena
    this.state = SceneStates.LOADING;
    this.godMode = false;
    this.debug = false;
    
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    
    //Se crean las cámaras que se usaran
    this.createCameras ();

    //Carga de la textura para el fondo
    var path = "../imgs/textures/skybox/";
    var format = ".jpg";

    var urls = [
      path + "right" + format, path + "left" + format,
      path + "top" + format, path + "bottom" + format,
      path + "front" + format, path + "back" + format
    ];

    var cubeMap = new THREE.CubeTextureLoader().load(urls);
    this.background = cubeMap;
    
    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper (5);
    this.add (this.axis);
    
    //UI que incluye el contador de frutas recogidas
    this.gameUI = document.getElementById("Messages");
    this.gameUI.innerHTML = MyScene.fruitCount;
    
    //Creación del personaje principal
    //Blake
    this.blake = new Blake(this.blakeCamera,this);
    this.add(this.blake);

    //Trasladarlo al final para ir probando las cosas de terminar
    // this.blake.position.set(0,0,-90);
    // this.godMode = true;


    //Creación de los elementos de la escena, dividos en plataformas
    //Se crean primeramente los vectores para cada tipo de elemento, que son comunes a todas las plataformas
    this.crates = [];
    this.fruits = [];
    this.platforms = [];

    var platform;
    var crate;
    var fruit;

    //#region 1 -- Plataforma 1. Contiene a Blake al comienzo
      //Plataforma
      platform = new Platform(7,5,0);
      this.platforms.push(platform);
      this.add(platform);
      platform.incluirBlake(this.blake);
      this.blakePlatform = platform;

      //Cajas
      crate = new Crate(4,1,positiveColor);
      this.add(crate);
      crate.position.set(2,0,0);
      this.crates.push(crate);
      platform.incluir(crate);

      crate = new Crate(6,-1,negativeColor);
      this.add(crate);
      crate.position.set(-2,0,0);
      this.crates.push(crate);
      platform.incluir(crate);

      //Frutas
      fruit = new Fruit();
      this.add(fruit);
      fruit.position.set(2,0,-2);
      this.fruits.push(fruit);
      platform.incluir(fruit);

      fruit = new Fruit();
      this.add(fruit);
      this.fruits.push(fruit);
      fruit.position.set(-2,0,-2);
      platform.incluir(fruit);
    //#endregion    

    //#region 2 -- Plataforma 2
      //Plataforma
      platform = new Platform(7,5,-1,negativeColor);
      this.platforms.push(platform);
      platform.posicionar(4,0,-6);
      this.add(platform);
      platform.crearAnimacion({x : 0, z : 0}, {x : 5, z : 0}, 2000, 1000);
    //#endregion

    //#region 3 -- InterPlatform 2-3
      //Cajas
      crate = new Crate(10,1,positiveColor);
      this.add(crate);
      this.crates.push(crate);
      crate.position.set(6.5,0,-12);

      crate = new Crate(10,-1,negativeColor);
      this.add(crate);
      this.crates.push(crate);
      crate.position.set(7.5,0,-12);

      crate = new Crate(10,1,positiveColor);
      this.add(crate);
      this.crates.push(crate);
      crate.position.set(8.5,0,-12);

      fruit = new Fruit();
      fruit.position.set(7.5,2,-15);
      this.fruits.push(fruit);
      this.add(fruit);

      crate = new Crate(10,-1,negativeColor);
      this.add(crate);
      this.crates.push(crate);
      crate.position.set(7.5,0,-17);

      fruit = new Fruit();
      fruit.position.set(7.5,2,-20);
      this.fruits.push(fruit);
      this.add(fruit);

      crate = new Crate(10,1,positiveColor);
      this.add(crate);
      this.crates.push(crate);
      crate.position.set(7.5,0,-22);
    //#endregion

    //#region 4 -- Plataforma 3
      //Plataforma
      platform = new Platform(8,8,-1,negativeColor);
      this.platforms.push(platform);
      platform.posicionar(3,0,-28);
      this.add(platform);

      //Frutas
      for(var i = 0.5; i < 4; i++){
        for(var j = 0.5; j < 4; j++){
          fruit = new Fruit();
          fruit.position.set(3+i-4,0,-28-j+4);
          this.add(fruit);
          this.fruits.push(fruit);
        }
      }
    //#endregion

    //#region 5 -- InterPlatform 3-4
      platform = new Platform(1,1,1,positiveColor);
      platform.posicionar(6,0,-38);
      this.add(platform);
      this.platforms.push(platform);

      crate = new Crate(10,-1,negativeColor);
      crate.position.set(8,0,-39);
      this.crates.push(crate);
      this.add(crate);

      platform = new Platform(1,1,-1,negativeColor);
      platform.posicionar(0,0,-40);
      this.add(platform);
      this.platforms.push(platform);

      crate = new Crate(10,1,positiveColor);
      crate.position.set(4,0,-40);
      this.crates.push(crate);
      this.add(crate);

      crate = new Crate(10,-1,negativeColor);
      crate.position.set(-4,0,-40);
      this.crates.push(crate);
      this.add(crate);

      platform = new Platform(10,8,-1,negativeColor);
      platform.posicionar(0,0,-50);
      this.add(platform);
      this.platforms.push(platform);
      platform.crearAnimacion({x: 0, z:0}, {x: 0, z : -40}, 10000, 3000);

      for(var i = 0; i < 20; i++){
        var num = Math.random();
        if(num > 0.5){
          var side = 1;
        }
        else{
          side = -1;
        }
        fruit = new Fruit();
        fruit.position.set(Math.random()*5*side,0,-50-i*1.5);
        this.fruits.push(fruit);
        this.add(fruit);
      }
    //#endregion

    //#region 6 -- Plataforma 4
      platform = new Platform(10,10,0);
      platform.posicionar(0,0,-99);
      this.platforms.push(platform);
      this.add(platform);
    //#endregion
    
    //Suelo para el fondo de la cámara orotográfica
    var groundTexture = new THREE.TextureLoader().load('../imgs/textures/ground.png');
    var groundGeom = new THREE.BoxBufferGeometry(200,0.2,200);
    var groundMat = new THREE.MeshLambertMaterial({map:groundTexture });
    groundGeom.translate(0,-50,-50);

    this.ground = new THREE.Mesh(groundGeom,groundMat);
    this.ground.visible = false;
    this.add(this.ground);

    //Luces
    this.createLights ();

    //Vectores para la deteccion de colisiones
    this.blakePos = new THREE.Vector3();
    this.objPos = new THREE.Vector3();

    //Establecimiento de la dimensión
    this.dimension = -1;
    this.switchDimensions(true);
    
    //Tiempos para el deltaTime en el desplazamiento de blake
    this.tiempoAnterior = Date.now();
  }

  switchDimensions(firstTime){
    var dimension = this.dimension * -1;
    var cambiar = true;

    if(!firstTime){
      for(var i = 0; i < this.crates.length && cambiar; i++){
        if(this.crates[i] != null){
          if(this.crates[i].dimension == dimension){
            if(this.colisionCrate(this.crates[i])){
              cambiar = false;
            }
          }
        }
      }

      for(var i = 0; i < this.platforms.length && cambiar; i++){
        if(this.platforms[i].dimension == dimension){
            if(this.colisionPlatform(this.platforms[i]) && !this.blake.jumping){
              cambiar = false;
            }
        }
      }
    }

    if(cambiar){
      for(var i = 0; i < this.crates.length; i++){
        if(this.crates[i] != null){
          if(this.crates[i].dimension == dimension){
            this.crates[i].toggleWireFrame(false);
          }
          else if(this.crates[i].dimension != 0){
            this.crates[i].toggleWireFrame(true);
          }
        }
      }

      for(var i = 0; i < this.platforms.length; i++){
        if(this.platforms[i].dimension == dimension){
          this.platforms[i].toggleWireFrame(false);
        }
        else if(this.platforms[i].dimension != 0){
          this.platforms[i].toggleWireFrame(true);
        }
      }
      
      this.blake.lights.switchDimensions(dimension);
      this.dimension = dimension;
    }
  }
  
  createCameras() {
    //Camara Principal, solidaria con el desplazamiento de Blake
    this.blakeCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.blakeCamera.position.set(0,5,10);
    var look = new THREE.Vector3 (0,0,0);
    this.blakeCamera.lookAt(look);
    this.add (this.blakeCamera);

    //Camara Debug. Dentro del modo debug, puede activarse esta cámara para visualizar la escena con mayor detalle
    //Emplea la librería FlyControls, por lo que los controles son los propios de esta librería
    this.debugCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.debugCamera.position.set (10,5,10);
    this.add (this.debugCamera);
    this.cameraControl = new FlyControls (this.debugCamera, this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.cameraControl.enabled = false;

    //Camara Final. Se usa para la animación de cámara al acabar el nivel
    this.finalCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.finalCamera.position.set(0,3,-90);
    this.add(this.finalCamera);

    //Camara Ortogonal.
    this.orthographicCamera = new THREE.OrthographicCamera(-60,60,60,-60,0.1,1000);
    this.orthographicCamera.position.set(0,10,-50);
    this.orthographicCamera.lookAt(new THREE.Vector3(0,0,-50));

    //Por defecto empieza activa la cámara de Blake
    this.activeCamera = this.blakeCamera;
  }
  
  createLights () {
    //Luz Ambiental
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.20);
    this.add (ambientLight);

    //Luz direccional. Representa el Sol
    this.sun = new THREE.DirectionalLight(0xfdfbd3, 0.6);
    this.sun.position.set(100,110,-150);    
    this.add(this.sun);

    //Sombras de la luz direccional
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.left = -70;
    this.sun.shadow.camera.bottom = -70;
    this.sun.shadow.camera.right = 70;
    this.sun.shadow.camera.top = 70;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 500;

    //Luz para el pedestal donde termina el nivel
    this.pedestalLight = new THREE.SpotLight(0xffffff,1,6,Math.PI/11,0,0);
    this.pedestalLight.position.set(0,5,-99);
    var target = new THREE.Object3D();
    target.position.set(0,0,-99);
    this.add(target);
    this.pedestalLight.target = target;
    this.add(this.pedestalLight);
    //Configuración de las sombras
    this.pedestalLight.castShadow = true;
    //Cilindro colocado sobre el pedestal para simular la luz que rebotarían las particulas en el aire y por tanto harían visible el haz del foco
    var visiblePedestalLight = new THREE.CylinderBufferGeometry(1.5,1.5,100,50,50);
    var mat = new THREE.MeshLambertMaterial({color:0x000000,emissive:0xffffff,emissiveIntensity:1,transparent:true,opacity:0.2});
    this.endCyl = new THREE.Mesh(visiblePedestalLight,mat);
    this.endCyl.position.set(0,50,-99);
    this.add(this.endCyl);
  }
  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    //Se configura la proyección de sombras
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    return renderer;  
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de las cámaras
    this.blakeCamera.aspect = ratio;
    this.blakeCamera.updateProjectionMatrix();

    this.debugCamera.aspect = ratio;
    this.debugCamera.updateProjectionMatrix();

    this.finalCamera.aspect = ratio;
    this.finalCamera.updateProjectionMatrix();

    var altoVista = this.orthographicCamera.top - this.orthographicCamera.bottom;
    var centroAncho = (this.orthographicCamera.left + this.orthographicCamera.right)/2;
    this.orthographicCamera.left = centroAncho - altoVista*ratio/2;
    this.orthographicCamera.right = centroAncho + altoVista*ratio/2;
    this.orthographicCamera.updateProjectionMatrix();
  }
    
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  update () {
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    var tiempoActual = Date.now();
    var deltaTime = (tiempoActual-this.tiempoAnterior)/1000;
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
    
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.activeCamera);

    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update(this.clock.getDelta());

    if(this.state == SceneStates.PLAYING){

      //Se actualiza blake
      this.blake.update(deltaTime);

      //Se comprueban las colisiones con los objetos de la escena pertinentes

      //Colision con las cajas
      this.checkColisionCrates(deltaTime);

      //Colision del marcador con las cajas, para colocarlo encima si procede
      this.checkMarkerColisionCrates();

      //Colision con las frutas
      this.checkColisionFruits();

      //Colision con las plataformas
      this.checkColisionPlatforms();
      
      //Colision con el cilindro que marca el final del nivel
      if(this.colisionEndGame()){
        if(!this.blake.end){
          this.blake.createFinalAnimation(this.blakePos, this.objPos, this);
          this.activeCamera = this.finalCamera;
        }
      }

      this.finalCamera.lookAt(this.blake.model.getWorldPosition(this.blakePos));
    }

    

    //Se actualizan las animaciones Tween
    TWEEN.update();
    //Se actualiza el contador de frutas recogidas
    this.gameUI.innerHTML = MyScene.fruitCount;
    //Se guarda el tiempo actual como anterior para el proximo update
    this.tiempoAnterior = tiempoActual;

    //Se actualiza el contador de fps
    stats.update();
  }

  //Función que comprueba la colisión de blake con una caja concreta. Devuelve true si hay colision
  colisionCrate(crate){
    if(crate.broken){
      return false;
    }

    this.blake.model.getWorldPosition(this.blakePos);
    crate.getWorldPosition(this.objPos);

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 1;
  }

  //Función que comprueba la colisión con todas las cajas de la escena que estén en la dimension actual. Si hay colisión, actua en consecuencia.
  checkColisionCrates(deltaTime){
    for(var i = 0; i < this.crates.length; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == this.dimension || this.crates[i].dimension == 0){
          if(this.colisionCrate(this.crates[i])){
            if(this.blake.jumping && this.blake.jumpNode.position.y >= (this.crates[i].faceTop.position.y - 0.5)){
              this.crates[i].startAnimation();
              this.blake.bounce();
              this.blakePlatform.excluirBlake();
              this.crates[i] = null;
            }
            else{
              this.blake.trasladar(-1,deltaTime);
            }
            break;
          }
        }
      }
    }
  }

  //Comprueba la colisión del marcador con una caja concreta
  markerColisionCrate(crate){
    if(crate == null){
      return false;
    }
    if(crate.broken){
      return false;
    }

    return (
      ((this.blake.marker.position.x + this.blake.position.x) <= (crate.position.x + 0.8)) &&
      ((this.blake.marker.position.x + this.blake.position.x) >= (crate.position.x - 0.8)) &&
      ((this.blake.marker.position.z + this.blake.position.z) <= (crate.position.z + 0.8)) &&
      ((this.blake.marker.position.z + this.blake.position.z) >= (crate.position.z - 0.8))
      );
  }

  //Comprueba la colisión del marcador con todas las cajas de la escena que estén en la dimensión actual. Si hay colisión coloca el marcador encima
  checkMarkerColisionCrates(){
    this.blake.marker.position.y = 0.001;
    for(var i = 0; i < this.crates.length; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == this.dimension || this.crates[i].dimension == 0){
          if(this.markerColisionCrate(this.crates[i])){
            this.blake.marker.position.y = 1.005;
            break;
          }
        }
      }
    }
  }

  //Comprueba la colisión de blake con una fruta concreta
  colisionFruit(fruit){
    this.blake.model.getWorldPosition(this.blakePos);
    fruit.getWorldPosition(this.objPos);

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 0.8;
  }

  //Comprueba la colisión de blake con todas las frutas de la escena. Si hay colisión la recoge
  checkColisionFruits(){
    for(var i = 0; i < this.fruits.length; i++){
      if(this.fruits[i] != null){
        if(this.colisionFruit(this.fruits[i])){
          this.fruits[i].pickUp();
          this.fruits[i] = null;
          break;
        }
      }
    }
  }

  //Comprueba la colision de blake con una plataforma concreta
  colisionPlatform(platform){
    return (
      ((this.blake.model.position.x + this.blake.position.x) <= (platform.realPos.x + (platform.x + Platform.Margen))) &&
      ((this.blake.model.position.x + this.blake.position.x) >= (platform.realPos.x - (platform.x + Platform.Margen))) &&
      ((this.blake.model.position.z + this.blake.position.z) <= (platform.realPos.z + (platform.z + Platform.Margen))) &&
      ((this.blake.model.position.z + this.blake.position.z) >= (platform.realPos.z - (platform.z + Platform.Margen)))
      );
  }

  //Comprueba la colisión de blake con todas las plataformas de la escena en la dimensión actual. Se encarga por tanto de comprobar si blake debe caerse
  checkColisionPlatforms(){
    var shouldFall = true;

    //Comprobamos si está sobre alguna plataforma, en cuyo caso evitamos que caiga. También aprovechamos para incluirlo en la plataforma y excluirlo de la anterior
    for(var i = 0; i < this.platforms.length; i++){
      if(this.platforms[i].dimension == this.dimension || this.platforms[i].dimension == 0){
        if(this.colisionPlatform(this.platforms[i]) && !this.blake.jumping){
          if(this.blakePlatform != this.platforms[i]){
            this.blakePlatform.excluirBlake();
            this.blakePlatform = this.platforms[i];
            this.blakePlatform.incluirBlake(this.blake);
          }
          shouldFall = false;
          break;
        }
      }
    }

    //Si el modo dios está activo, blake nunca se cae
    if(this.godMode){
      shouldFall = false;
    }

    //Si no está sobre ninguna plataforma y no está saltando, blake se cae
    if(shouldFall && !this.blake.jumping){
      this.blake.fall();
    }
  }

  colisionEndGame(){
    this.blake.model.getWorldPosition(this.blakePos);
    this.endCyl.getWorldPosition(this.objPos);
    this.objPos.y = 0;

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 1.5;
  }

  onKeyDown(event){
    var x = event.wich || event.keyCode;

    var tecla = String.fromCharCode(x);
    
    if(tecla == "X"){
      if(!this.debug){
        stats.domElement.style.display = "block";
        this.debug = true;
      }
      else{
        stats.domElement.style.display = "none";
        this.godMode = false;
        if(this.state == SceneStates.ENDING){
          this.activeCamera = this.finalCamera;
        }
        else{
          this.activeCamera = this.blakeCamera;
        }
        this.cameraControl.enabled = false;
        this.debug = false;
      }
      return;
    }
    
    if(this.state = SceneStates.PLAYING){
      if(tecla == "P"){
        if(this.debug){
          if(this.activeCamera == this.debugCamera){
            this.cameraControl.enabled = false;
            this.activeCamera = this.blakeCamera;
            this.ground.visible = false;
          }
          else{
            this.cameraControl.enabled = true;
            this.activeCamera = this.debugCamera;
            this.ground.visible = false;
          }
        }
        return;
      }

      if(tecla == "O"){
        if(this.activeCamera == this.orthographicCamera){
          this.cameraControl.enabled = false;
          this.activeCamera = this.blakeCamera;
          this.ground.visible = false;
        }
        else{
          this.cameraControl.enabled = false;
          this.activeCamera = this.orthographicCamera;
          this.ground.visible = true;
        }
        return;
      }

      if(tecla == "G"){
        if(this.debug){
          this.godMode = !this.godMode;
        }
        return;
      }
  
      if(tecla == "Q"){
        this.switchDimensions(false);
        return;
      }
  
      if(tecla == " "){
        this.blake.jump();
        return;
      }
  
      this.blake.move(tecla);
    }
  }

  onKeyUp(event){
    var x = event.wich || event.keyCode;

    var tecla = String.fromCharCode(x);
    if(this.state == SceneStates.PLAYING){
      this.blake.stop(tecla);
    }
  }

  die(){
    $("#Messages").hide();
    $("#FruitIcon").hide();
    $("#deathScreen").fadeIn(3000);
    $("#restartButton").delay(3000).fadeIn("slow");
    this.state = SceneStates.DEAD;
  }

  end(){
    $("#Messages").hide();
    $("#FruitIcon").hide();
    $("#gracias").fadeIn(3000);
    $("#finalFruitIcon").delay(2000).fadeIn(3000);
    $("#recuentoFrutas").html(MyScene.fruitCount + " / " + maxFruits).delay(2000).fadeIn(3000);
    $("#finalCrateIcon").delay(2000).fadeIn(3000);
    $("#recuentoCajas").html(MyScene.crateCount + " / " + maxCrates).delay(2000).fadeIn(3000);
    this.state = SceneStates.ENDING;
  }
}

export { MyScene };


/// La función   main
$(function () {
  
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());
  //window.addEventListener ("mousedown",(event) => scene.onMouseDown(event));
  window.addEventListener("keydown", (event) => scene.onKeyDown(event));
  window.addEventListener("keyup", (event) => scene.onKeyUp(event));

  //Creación del contador de fps
  stats = new STATS.default();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.top = '0';
  stats.domElement.style.display = "none";
  document.body.appendChild(stats.domElement);

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
