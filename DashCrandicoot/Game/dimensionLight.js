import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';
import { Lensflare, LensflareElement } from '../libs/LensFlare.js';

class DimensionLight extends THREE.Object3D{
    //Las luces que orbitan alrededor de Blake son realmente 2 luces posicionales, aunque solo 1 se muestre en cada momento
    //Indican con su color la dimensión en la que está Blake, y cambian cuando dicha dimensión cambia
    constructor(){
        super();
        
        //Se crean las 2 luces posiciones, con los mismos parámetros y diferente color
        //Tienen distancia corta y decay elevado para que solo iluminen una pequeña zona cerca de dónde están
        this.positiveLight = new THREE.PointLight(0x0000FF,1,3,2);
        this.negativeLight = new THREE.PointLight(0xFF0000,1,3,2);

        //Ambas luces se cuelgan de un mismo nodo que manejará la rotación de estas
        //Así conseguimos que ambas roten a la vez actualizando únicamente la posición de este nodo
        this.spin = new THREE.Object3D();
        this.spin.add(this.positiveLight);
        this.spin.add(this.negativeLight);

        //Añadimos el nodo junto a las luces al grafo
        this.add(this.spin);

        //Para que sean visibles usamos el efecto de LensFlare. Para ello, primero cargamos la textura de lensflare a usar
        var textureLoader = new THREE.TextureLoader();
        var mainTexture = textureLoader.load('../imgs/textures/lensflare/lensflare0.png');

        //Creamos un LensFlare para cada luz, con colores diferentes
        //La clase LensFlare ha cambiado con respecto a lo que se explica en las diapositivas de teoría. Ahora la clase viene a parte (al menos en la versión de Three proprocionada)
        //El funcionamiento también es diferente. Primero se crea un objeto LensFlare y después se le añadaen las diferentes texturas, con sus parámetros, construyendo objetos LensflareElement
        var positiveFlare = new Lensflare();
        positiveFlare.addElement(new LensflareElement(mainTexture,200,0,this.positiveLight.color));
        this.positiveLight.add(positiveFlare); //Los LensFlare se añaden también al grafo

        var negativeFlare = new Lensflare();
        negativeFlare.addElement(new LensflareElement(mainTexture,200,0,this.negativeLight.color));
        this.negativeLight.add(negativeFlare);

        //Y se crea la animación que los hace orbitar
        this.createAnimation();
    }

    //Animación de las luces. Se realiza mediante recorrido por un spline circular previamente creado.
    createAnimation(){
        //Primero se crea el spline
        this.createSpline();

        var origin = {p : 0};
        var destiny = {p : 1};

        var that = this;

        //Y después se crea la animación que lo recorre
        this.animation = new TWEEN.Tween(origin)
        .to(destiny,10000)
        .easing(TWEEN.Easing.Linear.None) //El easing es linear pues queremos una velocidad de rotación constante
        .onUpdate(function(){
            var pos = that.spline.getPointAt(origin.p);
            that.spin.position.copy(pos);
        })
        .repeat(Infinity) //Y se repite sin parar
        .start();
    }

    //El spline es simplemente un circulo de 1 unidad de radio, a una altura de 1.2 unidades, que se colocará dejando a blake en el centro del mismo
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

    //Función para el cambio de dimensión de las luces
    switchDimensions(dimension){
        //En función de la dimensión a la que se cambie, se muestra y esconde cada luz como corresponda
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