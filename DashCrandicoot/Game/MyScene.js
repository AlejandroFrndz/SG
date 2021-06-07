
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { FlyControls } from '../libs/FlyControls.js';
import * as TWEEN from '../libs/tween.esm.js'
import * as STATS from '../libs/stats.module.js'

// Clases de mi proyecto

import { Crate } from './Crate.js'
import { Blake } from './Blake.js'
import { Fruit } from './Fruit.js'
import { Platform } from './Platform.js'

//Constantes
//Colores de las 2 dimensiones de los objetos
const positiveColor = 0x0000FF;
const negativeColor = 0xFF0000;
//Estados de la escena
const SceneStates = Object.freeze({"DEAD":-1, "LOADING":1, "PLAYING":2, "ENDING":3});
//Número total de cajas y frutas de la escena, para mostrarlo en la pantalla final
const maxCrates = 10;
const maxFruits = 130;

//Variable para el contador de fps
var stats

/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  //Contadores para el recuente de frutas recogidas y cajas destruidas
  static fruitCount = 0;
  static crateCount = 0;

  //Recibe el div que se ha creado en el html que va a ser el lienzo en el que mostrar la visualización de la escena
  constructor (myCanvas) { 
    super();

    //Establecemos el estado de la escena como cargando
    this.state = SceneStates.LOADING;
    //Al comenzar, el modo dios y debug están desactivados
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
    //En principio están ocultos, se mostrarán si activamos el modo debug
    this.axis = new THREE.AxesHelper (5);
    this.axis.visible = false;
    this.add (this.axis);
    
    //UI que incluye el contador de frutas recogidas
    this.gameUI = document.getElementById("Messages");
    this.gameUI.innerHTML = MyScene.fruitCount;
    
    //Creación del personaje principal
    //Blake
    this.blake = new Blake(this.blakeCamera,this);
    this.add(this.blake);

    //Creación de los elementos de la escena, dividos en plataformas
    //Se crean primeramente los vectores para cada tipo de elemento, que son comunes a todas las plataformas
    this.crates = [];
    this.fruits = [];
    this.platforms = [];

    //Variables para almacenar temporalmente los elementos que se van creando
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
    //#endregion    

    //#region 2 -- Plataforma 2
      //Plataforma
      platform = new Platform(7,5,-1,negativeColor);
      this.platforms.push(platform);
      platform.posicionar(4,0,-6);
      this.add(platform);
      platform.crearAnimacion({x : 0, z : 0}, {x : 5, z : 0}, 2000, 1000);

      //Frutas
      fruit = new Fruit();
      this.add(fruit);
      fruit.position.set(6,0,-6);
      this.fruits.push(fruit);
      platform.incluir(fruit);

      fruit = new Fruit();
      this.add(fruit);
      this.fruits.push(fruit);
      fruit.position.set(2,0,-6);
      platform.incluir(fruit);
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
    
    //Con la cámara ortográfica no se muestra el cubeMap de fondo de la escena
    //Por tanto, uso un suelo texturizado que se coloca debajo del nivel para simular el fondo con esta cámara
    var groundTexture = new THREE.TextureLoader().load('../imgs/textures/ground.png');
    var groundGeom = new THREE.BoxBufferGeometry(200,0.2,200);
    var groundMat = new THREE.MeshLambertMaterial({map:groundTexture });
    groundGeom.translate(0,-50,-50);
    this.ground = new THREE.Mesh(groundGeom,groundMat);
    this.ground.visible = false;  //En principio está oculto, y solo se muestra cuando se activa la cámara ortográfica
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

  //Función para el cambio de dimensión cuando el usuario pulsa la Q
  //Puesto que la escena llama a la función una primera vez durante su creación, el booleano indica si es la primera vez en cuyo caso se salta las comprobaciones
  switchDimensions(firstTime){
    //Se establece temporalmente la dimension a la que cambiar en una variable auxiliar, pues todavia no sabemos si el cambio se podrá efectuar
    var dimension = this.dimension * -1;
    var cambiar = true;

    //Si es la primera vez que se llama se omiten las comprobaciones
    if(!firstTime){
      //Si no, se comprueba que Blake no esté colisionando con ningún objeto (caja o plataforma) de la dimensión destino
      //Si está colisionando no se permite el cambio de dimensión pues de lo contrario quedaría atrapado dentro del objeto
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

    //Si se pasan las comprobaciones, se efectúa el cambio
    if(cambiar){
      //para cada objeto de la nueva dimensión se desactiva el modo alambre y para los de la antigua se activa
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
      
      //También se cambian las luces de dimensión que acompañan a Blake
      this.blake.lights.switchDimensions(dimension);
      //Y se formaliza el cambio
      this.dimension = dimension;
    }
  }
  
  //Función que crea las 4 cámaras a usar en la escena
  createCameras() {
    //Camara Principal, solidaria con el desplazamiento de Blake y activa por defecto
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

    //Camara Ortogonal. Proporciona una vista en planta superior del esecnario completo
    this.orthographicCamera = new THREE.OrthographicCamera(-60,60,60,-60,0.1,1000);
    this.orthographicCamera.position.set(0,10,-50);
    this.orthographicCamera.lookAt(new THREE.Vector3(0,0,-50));

    //Por defecto empieza activa la cámara de Blake
    this.activeCamera = this.blakeCamera;
  }
  
  //Crea las luces a usar en la escena (menos las posicionales de dimensión de Blake, las cuales crea él mismo en su constructor)
  createLights () {
    //Luz Ambiental. Necesaria para que no se vean totalmente negras las partes sin luz directa. De baja intensidad para no saturar la escena
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.20);
    this.add (ambientLight);

    //Luz direccional. Representa el Sol
    this.sun = new THREE.DirectionalLight(0xfdfbd3, 0.6);
    this.sun.position.set(100,110,-150);    
    this.add(this.sun);

    //Configuración de las sombras de la luz direccional
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    //Es necesario especificar el fustrum de la cámra pues las luces direccionales usan una cámara ortogonal que no toma el fov automáticamente
    this.sun.shadow.camera.left = -70;
    this.sun.shadow.camera.bottom = -70;
    this.sun.shadow.camera.right = 70;
    this.sun.shadow.camera.top = 70;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 500;

    //Luz focal para el final del nivel
    this.finalLight = new THREE.SpotLight(0xffffff,1,6,Math.PI/11,0,0);
    //Se establece su posición y se le proporciona un target con la dirección a la que apuntar el haz de luz
    this.finalLight.position.set(0,5,-99);
    var target = new THREE.Object3D();
    target.position.set(0,0,-99);
    //El target debe ser añadido a la escena
    this.add(target);
    //Si no se le diese target, apuntaría por defecto al (0,0,0)
    this.finalLight.target = target;
    this.add(this.finalLight);
    //Configuración de las sombras para la luz focal. Solo hay que indicar que es proyectora de sombras y el fov de la cámara se cálcula automáticamente
    this.finalLight.castShadow = true;

    //Cilindro blanco de baja opacidad colocado en el lugar de la luz focal final
    //Sirve para simular la luz que proyectada por el foco rebotaría en las particulas en suspensión en el aire y por tanto haría visible el haz
    var visiblefinalLight = new THREE.CylinderBufferGeometry(1.5,1.5,100,50,50);
    //Usamos un material de Lambert pues no queremos brillos, nos interesa un color emisivo mate
    var mat = new THREE.MeshLambertMaterial({color:0x000000,emissive:0xffffff,emissiveIntensity:1,transparent:true,opacity:0.2});
    this.endCyl = new THREE.Mesh(visiblefinalLight,mat);
    this.endCyl.position.set(0,50,-99);
    this.add(this.endCyl);
  }
  
  //Crea el renderer que se encargará de realizar la visualización de la escena
  // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
  createRenderer (myCanvas) {
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    //Se configura la proyección de sombras. Para ello, simplemente se activa la simulación y se le indica el filtro de suavizado a aplicar
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    return renderer;  
  }
  
  //Actualización del ratio de aspecto de las cámaras
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de las cámaras
    this.blakeCamera.aspect = ratio;
    this.blakeCamera.updateProjectionMatrix();

    this.debugCamera.aspect = ratio;
    this.debugCamera.updateProjectionMatrix();

    this.finalCamera.aspect = ratio;
    this.finalCamera.updateProjectionMatrix();

    //La cámara ortográfica requiere algo más de cálculo
    var altoVista = this.orthographicCamera.top - this.orthographicCamera.bottom;
    var centroAncho = (this.orthographicCamera.left + this.orthographicCamera.right)/2;
    this.orthographicCamera.left = centroAncho - altoVista*ratio/2;
    this.orthographicCamera.right = centroAncho + altoVista*ratio/2;
    this.orthographicCamera.updateProjectionMatrix();
  }
  
  //Event listener para la modificación del tamaño de la ventana
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  //Llamado cada vez que se va a visualizar la escena
  update () {
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    //Se establece el tiempo elapsado entre la generación de este frame y el anterior
    var tiempoActual = Date.now();
    var deltaTime = (tiempoActual-this.tiempoAnterior)/1000;
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
    
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.activeCamera);

    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update(this.clock.getDelta());

    //Si la escena se está jugando
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
        //Si se colisiona y no se ha empezado la animación final, se crean
        if(!this.blake.end){
          this.blake.createFinalAnimation(this.blakePos, this.objPos, this);
          this.activeCamera = this.finalCamera;
        }
      }

      //La cámara final debe apuntar a Blake para realizar la animación de esta cámara cuando Blake asciende
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
    this.blake.marker.position.y = 0.001; //Por defecto el marcador se sitúa en el suelo
    for(var i = 0; i < this.crates.length; i++){
      if(this.crates[i] != null){
        if(this.crates[i].dimension == this.dimension || this.crates[i].dimension == 0){
          if(this.markerColisionCrate(this.crates[i])){
            this.blake.marker.position.y = 1.005; //Y si colisiona con una caja, se pone encima de dicha caja
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

  //Función para detectar la colision de blake con el cilindro que marca el final del nivel
  colisionEndGame(){
    this.blake.model.getWorldPosition(this.blakePos);
    this.endCyl.getWorldPosition(this.objPos);
    this.objPos.y = 0;

    var distance = this.blakePos.distanceTo(this.objPos);
    return distance < 1.5;
  }

  //Event Listener para las pulsaciones de telcas
  onKeyDown(event){
    //Primero se decodifica la tecla pulsada
    var x = event.wich || event.keyCode;
    var tecla = String.fromCharCode(x);
    
    //Y después ejectuan unas u otras acciones en función de la tecla concreta
    //La X activa o desactiva el modo debug
    if(tecla == "X"){
      //Si lo activa muestra el contador de fps y los ejes. También se activa el flag correspondiente
      if(!this.debug){
        stats.domElement.style.display = "block";
        this.debug = true;
        this.axis.visible = true;
      }
      else{
        //Si por el contrario lo desactiva, se ocultan los fps y ejes y se desactiva el modo dios (si estaba activo)
        stats.domElement.style.display = "none";
        this.godMode = false;
        //También se reactiva la cámara, final o de blake.
        if(this.state == SceneStates.ENDING){
          this.activeCamera = this.finalCamera;
        }
        else{
          this.activeCamera = this.blakeCamera;
        }
        //Se desactiva el control de la cámara debug y el flag
        this.cameraControl.enabled = false;
        this.debug = false;
        this.axis.visible = false;
      }
      return;
    }
    
    //Todas estas funciones solo están disponibles si se está jugando.
    if(this.state = SceneStates.PLAYING){
      //La tecla P activa o desactiva la cámara debug, solo si el modo debug está activo
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

      //La tecla O activa o desactiva la cámara ortográfica
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

      //La tecla G activa/desactiva el modo dios, solo si se está en modo debug
      if(tecla == "G"){
        if(this.debug){
          this.godMode = !this.godMode;
        }
        return;
      }
      
      //Con la tecla Q se cambia (o al menos intenta) la dimensión
      if(tecla == "Q"){
        this.switchDimensions(false); //Puesto que no es la primera vez, el parámetro está a false y se ejecutarán las comprobaciones
        return;
      }
      
      //Con el espacio se salta
      if(tecla == " "){
        this.blake.jump();
        return;
      }
      
      //Finalmente, si no es ninguna de las teclas anteriores se comprueba si es alguna de movimiento, responsabilidad que recae sobre el propio Blake
      this.blake.move(tecla);
    }
  }

  //Listener para soltar una tecla
  onKeyUp(event){
    //De nuevo, primero se decodifica la tecla
    var x = event.wich || event.keyCode;
    var tecla = String.fromCharCode(x);

    //Y después solo nos interesa si se trata de una tecla de movimiento y solo si se está jugando
    if(this.state == SceneStates.PLAYING){
      this.blake.stop(tecla);
    }
  }

  //Función para ocultar la pantalla de carga y mostrar la interfaz
  //La llama Blake cuando carga por completo el modelo, por lo que también establece el estado de la escena a jugando
  loaded(){
    $("#loadingScreen").fadeOut(1000);
    $("#FruitIcon").fadeIn(1000);
    $("#Messages").fadeIn(1000);
    this.state = SceneStates.PLAYING;
  }

  //Función para manejar la caida del jugador al vacío. La llama Blake cuando termina su animación de caida
  //Se esconde la interfaz del juego y se muestra la pantalla de muerte. También establece el correspondiente estado de la escena
  die(){
    $("#Messages").hide();
    $("#FruitIcon").hide();
    $("#deathScreen").fadeIn(3000);
    $("#restartButton").delay(3000).fadeIn("slow");
    this.state = SceneStates.DEAD;
  }

  //Función para la pantalla final. Esconde la interfaz del juego, muestra los resultados y establece el estado de la escena
  //La llama Blake cuando completa su animación final
  end(){
    $("#Messages").hide();
    $("#FruitIcon").hide();
    $("#gracias").fadeIn(3000);
    $("#finalFruitIcon").delay(2000).fadeIn(3000);
    $("#recuentoFrutas").html(MyScene.fruitCount + " / " + maxFruits).delay(2000).fadeIn(3000);
    $("#finalCrateIcon").delay(2000).fadeIn(3000);
    $("#recuentoCajas").html(MyScene.crateCount + " / " + maxCrates).delay(2000).fadeIn(3000);
    $("#botonFinal").delay(5000).fadeIn(2000);
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
