import * as THREE from '../libs/three.module.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';

class Protagonist extends THREE.Object3D{
    constructor(gui,titleGui){
        super();
        this.clock = new THREE.Clock();
        var loader = new GLTFLoader();
        var that = this;
        loader.load( '../models/gltf/pj.glb', function ( gltf ) {
            var model = gltf.scene;
            var animations = gltf.animations;
            that.add( model );
            model.scale.set(0.75,0.75,0.75);
            that.createActions(model,animations);
            that.createGUI (gui, titleGui);
          }, undefined, function ( e ) { console.error( e ); }
        );
    }

    createActions (model, animations) {
        this.mixer = new THREE.AnimationMixer (model);
    
        this.actions = {};
        this.clipNames = [];
        
        for (var i = 0; i < animations.length; i++) {
          // Se toma una animación de la lista de animaciones del archivo gltf
          var clip = animations[i];
          
          // A partir de dicha animación obtenemos una referencia a su accionador particular
          var action = this.mixer.clipAction (clip);
          
          // Añadimos el accionador al diccionario con el nombre de la animación que controla
          this.actions[clip.name] = action;
          
          // Nos vamos a quedar como animación activa la última de la lista,
          //    es irrelevante cual dejemos como activa, pero el atributo debe referenciar a alguna
          this.activeAction = action;
          
          // Metemos el nombre de la animación en la lista de nombres 
          //    para formar el listado de la interfaz de usuario
          this.clipNames.push (clip.name);
        }
        
    }

    createGUI (gui, str) {
        // La interfaz de usuario se crea a partir de la propia información que se ha
        // cargado desde el archivo  gltf
        this.guiControls = new function () {
          // En este campo estará la list de animaciones del archivo
          this.current = 'Animaciones';
          // Este campo nos permite ver cada animación una sola vez o repetidamente
          this.repeat = false;
          // Velocidad de la animación
          this.speed = 1.0;
        }
        
        // Creamos y añadimos los controles de la interfaz de usuario
        var folder = gui.addFolder (str);
        var repeatCtrl = folder.add (this.guiControls, 'repeat').name('Repetitivo: ');
        var clipCtrl = folder.add (this.guiControls, 'current').options(this.clipNames).name('Animaciones: ');
        var speedCtrl = folder.add (this.guiControls, 'speed', -2.0, 2.0, 0.1).name('Speed: ');
        var that = this;
        // Cada vez que uno de los controles de la interfaz de usuario cambie, 
        //    llamamos al método que lance la animación elegida
        clipCtrl.onChange (function () {
          that.fadeToAction (that.guiControls.current, that.guiControls.repeat, that.guiControls.speed);
        });
        repeatCtrl.onChange (function () {
          that.fadeToAction (that.guiControls.current, that.guiControls.repeat, that.guiControls.speed);
        });
        speedCtrl.onChange (function (value) {
          that.activeAction.setEffectiveTimeScale(that.guiControls.speed);
        });
    }

    fadeToAction (name, repeat, speed) {
        // referenciamos la animación antigua y la nueva actual
        var previousAction = this.activeAction;
        this.activeAction = this.actions[ name ];
        
        // La nueva animación se resetea para eliminar cualquier rastro de la última vez que se ejecutara
        this.activeAction.reset();
        // Se programa una transición entre la animación actigua y la nueva, se emplea un 10% de lo que dura la animación nueva
        this.activeAction.crossFadeFrom (previousAction, this.activeAction.time/10 );
        // Hacemos que la animación se quede en su último frame cuando acabe
        this.activeAction.clampWhenFinished = true;
        // Ajustamos su factor de tiempo, modificando ese valor se puede ajustar la velocidad de esta ejecución de la animación
        this.activeAction.setEffectiveTimeScale( speed );
        // Ajustamos su peso al máximo, ya que queremos ver la animación en su plenitud
        this.activeAction.setEffectiveWeight( 1 );
        // Se establece el número de repeticiones
        if (repeat) {
          this.activeAction.setLoop (THREE.Repeat);
        } else {
          this.activeAction.setLoop (THREE.LoopOnce);
        }
        // Una vez configurado el accionador, se lanza la animación
        this.activeAction.play();    
    }

    update () {
        // Hay que pedirle al mixer que actualice las animaciones que controla
        var dt = this.clock.getDelta();
        if (this.mixer) this.mixer.update (dt);
    }
}

export { Protagonist };