
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'
import * as TWEEN from '../libs/tween.esm.js'

// Clases de mi proyecto

import { Crate } from './Crate.js'
import { Blake } from './Blake.js'
import { Fruit } from './Fruit.js'
import { Platform } from './Platform.js'

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
    this.createLights ();
    
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
    this.blake = new Blake();
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
      platform = new Platform(5,5,0);
      this.platforms.push(platform);
      this.add(platform);
      platform.incluirBlake(this.blake);
      this.blakePlatform = platform;

      //Cajas
      crate = new Crate(4,1);
      this.add(crate);
      crate.position.set(2,0,0);
      this.crates.push(crate);
      platform.incluir(crate);

      crate = new Crate(6,-1);
      this.add(crate);
      this.crates.push(crate);
      platform.incluir(crate);

      //Frutas
      fruit = new Fruit();
      this.add(fruit);
      fruit.position.set(2,0,2);
      this.fruits.push(fruit);
      platform.incluir(fruit);

      fruit = new Fruit();
      this.add(fruit);
      this.fruits.push(fruit);
      fruit.position.set(-2,0,2);
      platform.incluir(fruit);
    //#endregion    

    //#region Plataforma 2
      //Plataforma
      platform = new Platform(7,5,-1);
      this.platforms.push(platform);
      platform.position.set(4,0,6);
      this.add(platform);
    //#endregion

    //Vectores para la deteccion de colisiones
    this.blakePos = new THREE.Vector3();
    this.objPos = new THREE.Vector3();

    //Establecimiento de la dimensión
    this.dimension = -1;
    this.switchDimensions();
  }

  switchDimensions(){
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
        if(this.checkColisionPlatforms(this.platforms[i]) && !this.blake.jumping){
          cambiar = false;
        }
      }
    }

    if(cambiar){
      for(var i = 0; i < this.crates.length; i++){
        if(this.crates[i] != null){
          if(this.crates[i].dimension == dimension){
            this.crates[i].mat.wireframe = false;
          }
          else if(this.crates[i].dimension != 0){
            this.crates[i].mat.wireframe = true;
          }
        }
      }

      for(var i = 0; i < this.platforms.length; i++){
        if(this.platforms[i].dimension == dimension){
          this.platforms[i].mat.wireframe = false;
        }
        else if(this.platforms[i].dimension != 0){
          this.platforms[i].mat.wireframe = true;
        }
      }

      this.dimension = dimension;
    }
  }
  
  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión vértical en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (10, 5, 10);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,0);
    this.camera.lookAt(look);
    this.add (this.camera);
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    
    this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
    
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
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
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
    // La añadimos a la escena
    this.add (ambientLight);
    
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
    this.spotLight.position.set( 60, 60, 40 );
    this.add (this.spotLight);
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
    
    return renderer;  
  }
  
  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
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
    
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
    
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());

    // Se actualizan los elementos de la escena para cada frame
    // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
    this.spotLight.intensity = this.guiControls.lightIntensity;
    
    // Se muestran o no los ejes según lo que idique la GUI
    this.axis.visible = this.guiControls.axisOnOff;
    
    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update();


    this.blake.update();
    for(var i = 0; i < this.crates.length; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == this.dimension || this.crates[i].dimension == 0){
          if(this.checkColisionCrates(this.crates[i])){
            if(this.blake.jumping && this.blake.jumpNode.position.y >= (this.crates[i].faceTop.position.y - 0.5)){
              this.crates[i].startAnimation();
              this.blake.bounce();
              this.crates[i] = null;
            }
            else{
              this.blake.trasladar(-0.1);
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

    //console.log(this.blake.jumping);

    if(shouldFall && !this.blake.jumping){
      this.blake.fall();
    }

    TWEEN.update();
    this.gameUI.innerHTML = MyScene.fruitCount;
  }

  checkColisionCrates(crate){
    if(crate.broken || !this.blake.loaded){
      return false;
    }

    this.blake.model.getWorldPosition(this.blakePos);
    crate.getWorldPosition(this.objPos);

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 0.8;
  }

  checkMarkerColisionCrates(crate){
    if(crate == null){
      return false;
    }
    if(crate.broken || !this.blake.loaded){
      return false;
    }

    return (
      ((this.blake.marker.position.x + this.blake.position.x) <= (crate.position.x + 0.5)) &&
      ((this.blake.marker.position.x + this.blake.position.x) >= (crate.position.x - 0.5)) &&
      ((this.blake.marker.position.z + this.blake.position.z) <= (crate.position.z + 0.5)) &&
      ((this.blake.marker.position.z + this.blake.position.z) >= (crate.position.z - 0.5))
      );
  }

  checkColisionFruits(fruit){
    if(!this.blake.loaded){
      return false;
    }

    this.blake.model.getWorldPosition(this.blakePos);
    fruit.getWorldPosition(this.objPos);

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 0.6;
  }

  checkColisionPlatforms(platform){
    if(!this.blake.loaded){
      return true;
    }

    return (
      ((this.blake.model.position.x + this.blake.position.x) <= (platform.position.x + (platform.x + Platform.Margen))) &&
      ((this.blake.model.position.x + this.blake.position.x) >= (platform.position.x - (platform.x + Platform.Margen))) &&
      ((this.blake.model.position.z + this.blake.position.z) <= (platform.position.z + (platform.z + Platform.Margen))) &&
      ((this.blake.model.position.z + this.blake.position.z) >= (platform.position.z - (platform.z + Platform.Margen)))
      );
  }

  onKeyDown(event){
    var x = event.wich || event.keyCode;

    if(x == 17){
      this.cameraControl.enabled = true;
      return;
    }

    var tecla = String.fromCharCode(x);
    
    if(tecla == "X"){
      this.platforms[0].crearAnimacion({x : 0, z : 0}, {x : 5, z : 0}, 2000, 1000);
      return;
    }
    console.log(tecla);
    if(tecla == "Q"){
      this.switchDimensions();
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

    if(x == 17){
      this.cameraControl.enabled = false;
      return;
    }

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
  
  // Que no se nos olvide, la primera visualización.
  scene.update();
});
