
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
import { Pedestal } from './Pedestal.js'
import { DimensionLight } from './dimensionLight.js';

//Constantes

const positiveColor = 0x0000FF;
const negativeColor = 0xFF0000;
const positiveLightColor = 0xaaaaff;
const negativeLightColor = 0xffaaaa;

var stats

/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  static fruitCount = 0;

  constructor (myCanvas) { 
    super();
    
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    
    // Se crea la interfaz gráfica de usuario
    this.gui = this.createGUI ();
        
    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    
    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera ();

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
    this.blake = new Blake(this.camera);
    this.add(this.blake);

    //Creación de los elementos de la escena, dividos en plataformas
    //Se crean primeramente los vectores para cada tipo de elemento, que son comunes a todas las plataformas
    this.crates = [];
    this.fruits = [];
    this.platforms = [];

    var platform;
    var crate;
    var fruit;

    //#region Plataforma 1. Contiene a Blake al comienzo
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

    //#region Plataforma 2
      //Plataforma
      platform = new Platform(7,5,-1,negativeColor);
      this.platforms.push(platform);
      platform.posicionar(4,0,-6);
      this.add(platform);
      platform.crearAnimacion({x : 0, z : 0}, {x : 5, z : 0}, 2000, 1000);
    //#endregion

    //#region InterPlatform 2-3
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

    //#region Plataforma 3
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

    //#region InterPlatform 3-4
      platform = new Platform(1,1,1,positiveColor);
      platform.posicionar(6,0,-38);
      this.add(platform);
      this.platforms.push(platform);

      platform = new Platform(1,1,-1,negativeColor);
      platform.posicionar(0,0,-40);
      this.add(platform);
      this.platforms.push(platform);

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

    //#region Plataforma 4
      platform = new Platform(10,10,0);
      platform.posicionar(0,0,-99);
      this.platforms.push(platform);
      this.add(platform);
    //#endregion

    //Pedestal
    /*
    this.pedestal = new Pedestal();
    this.add(this.pedestal);
      */

    //Luces
    this.createLights ();

    //Vectores para la deteccion de colisiones
    this.blakePos = new THREE.Vector3();
    this.objPos = new THREE.Vector3();

    //Establecimiento de la dimensión
    this.dimension = -1;
    this.switchDimensions(true);

    this.tiempoAnterior = Date.now();

    this.godMode = false;

  }

  switchDimensions(firstTime){
    var dimension = this.dimension * -1;
    var cambiar = true;

    for(var i = 0; i < this.crates.length && cambiar; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == dimension){
          if(this.checkColisionCrates(this.crates[i])){
            cambiar = false;
          }
        }
      }
    }

    for(var i = 0; i < this.platforms.length && cambiar; i++){
      if(this.platforms[i].dimension == dimension){
        if(!firstTime){
          if(this.checkColisionPlatforms(this.platforms[i]) && !this.blake.jumping){
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
  
  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión vértical en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0, 5, 10);
    this.camera2.position.set (10,5,10);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,0);
    this.camera.lookAt(look);
    this.add (this.camera);
    this.add (this.camera2);
    
    this.activeCamera = this.camera;
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    
    this.cameraControl = new FlyControls (this.camera2, this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.cameraControl.enabled = false;
  }
  
  createGUI () {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();
    
    // La escena le va a añadir sus propios controles. 
    // Se definen mediante una   new function()
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = new function() {
      // En el contexto de una función   this   alude a la función
      this.lightIntensity = 0.5;
      this.axisOnOff = true;
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder ('Luz y Ejes');
    
    // Se le añade un control para la intensidad de la luz
    folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1).name('Intensidad de la Luz : ');
    
    // Y otro para mostrar u ocultar los ejes
    folder.add (this.guiControls, 'axisOnOff').name ('Mostrar ejes : ');
    
    return gui;
  }
  
  createLights () {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    this.ambientLight = new THREE.AmbientLight(0xccddee, 0.20);
    // La añadimos a la escena
    this.add (this.ambientLight);
    
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.


    //Luz direccional. Representa el Sol
    this.sun = new THREE.DirectionalLight(0xfdfbd3, 0.6);
    this.sun.position.set(100,110,-150);    
    this.add(this.sun);
    var sunTarget = new THREE.Object3D();
    sunTarget.position.set(0,0,0);
    this.add(sunTarget);
    this.sun.target = sunTarget;
    this.sun.target.updateMatrixWorld();
    var helper = new THREE.DirectionalLightHelper(this.sun);
    this.add(helper);

    //Sombras
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
    visiblePedestalLight.translate(0,50,-99);
    var mesh = new THREE.Mesh(visiblePedestalLight,mat);
    this.add(mesh);
  }
  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    //Se configura la proyección de sombras
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    return renderer;  
  }
  
  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.activeCamera;
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
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
    this.renderer.render (this, this.getCamera());

    // Se actualizan los elementos de la escena para cada frame
    // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
    //this.spotLight.intensity = this.guiControls.lightIntensity;
    
    // Se muestran o no los ejes según lo que idique la GUI
    this.axis.visible = this.guiControls.axisOnOff;
    
    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update(this.clock.getDelta());

    this.blake.update(deltaTime);
    for(var i = 0; i < this.crates.length; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == this.dimension || this.crates[i].dimension == 0){
          if(this.checkColisionCrates(this.crates[i])){
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

    this.blake.marker.position.y = 0.001;
    for(var i = 0; i < this.crates.length; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == this.dimension || this.crates[i].dimension == 0){
          if(this.checkMarkerColisionCrates(this.crates[i])){
            this.blake.marker.position.y = 1.005;
            break;
          }
        }
      }
    }

    for(var i = 0; i < this.fruits.length; i++){
      if(this.fruits[i] != null){
        if(this.checkColisionFruits(this.fruits[i])){
          this.fruits[i].pickUp();
          this.fruits[i] = null;
          this.fruitCount++;
          break;
        }
      }
    }

    var shouldFall = true;
    for(var i = 0; i < this.platforms.length; i++){
      if(this.platforms[i].dimension == this.dimension || this.platforms[i].dimension == 0){
        if(this.checkColisionPlatforms(this.platforms[i]) && !this.blake.jumping){
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

    if(this.godMode){
      shouldFall = false;
    }
    if(shouldFall && !this.blake.jumping){
      this.blake.fall();
    }

    TWEEN.update();
    this.gameUI.innerHTML = MyScene.fruitCount;
    this.tiempoAnterior = tiempoActual;

    stats.update();
  }

  checkColisionCrates(crate){
    if(crate.broken || !this.blake.loaded){
      return false;
    }

    this.blake.model.getWorldPosition(this.blakePos);
    crate.getWorldPosition(this.objPos);

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 1;
  }

  checkMarkerColisionCrates(crate){
    if(crate == null){
      return false;
    }
    if(crate.broken || !this.blake.loaded){
      return false;
    }

    return (
      ((this.blake.marker.position.x + this.blake.position.x) <= (crate.position.x + 0.8)) &&
      ((this.blake.marker.position.x + this.blake.position.x) >= (crate.position.x - 0.8)) &&
      ((this.blake.marker.position.z + this.blake.position.z) <= (crate.position.z + 0.8)) &&
      ((this.blake.marker.position.z + this.blake.position.z) >= (crate.position.z - 0.8))
      );
  }

  checkColisionFruits(fruit){
    if(!this.blake.loaded){
      return false;
    }

    this.blake.model.getWorldPosition(this.blakePos);
    fruit.getWorldPosition(this.objPos);

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 0.8;
  }

  checkColisionPlatforms(platform){
    if(!this.blake.loaded){
      return true;
    }

    return (
      ((this.blake.model.position.x + this.blake.position.x) <= (platform.realPos.x + (platform.x + Platform.Margen))) &&
      ((this.blake.model.position.x + this.blake.position.x) >= (platform.realPos.x - (platform.x + Platform.Margen))) &&
      ((this.blake.model.position.z + this.blake.position.z) <= (platform.realPos.z + (platform.z + Platform.Margen))) &&
      ((this.blake.model.position.z + this.blake.position.z) >= (platform.realPos.z - (platform.z + Platform.Margen)))
      );
  }

  onKeyDown(event){
    var x = event.wich || event.keyCode;

    /*
    if(x == 17){
      this.cameraControl.enabled = true;
      return;
    }
    */

    var tecla = String.fromCharCode(x);
    
    if(tecla == "X"){
      if(stats.domElement.style.display == "block"){
        stats.domElement.style.display = "none";
      }
      else{
        stats.domElement.style.display = "block";
      }
      return;
    }

    if(tecla == "P"){
      this.cameraControl.enabled = true;
      this.activeCamera = this.camera2;
      return;
    }

    if(tecla == "O"){
      this.cameraControl.enabled = false;
      this.activeCamera = this.camera;
      return;
    }

    if(tecla == "G"){
      this.godMode = !this.godMode;
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

  onKeyUp(event){
    var x = event.wich || event.keyCode;

    /*
    if(x == 17){
      this.cameraControl.enabled = false;
      return;
    }
    */

    var tecla = String.fromCharCode(x);
    this.blake.stop(tecla);
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
