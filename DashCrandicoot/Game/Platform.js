import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'

class Platform extends THREE.Object3D{
    //Pequeño margen de gracia que se le deja alejarse a Blake del área concreta de la plataforma antes de caer, para evitar situaciones demasiado exactas que pueden frustrar a los jugadores
    static get Margen() {return 0.50;}

    //Constructor
    constructor(sizeX, sizeZ, dimension, dimensionColor){
        super();

        //Se crean los atributos que manejaran el desplazamiento de los objetos situados encima de la plataforma
        this.objs = [];
        this.dobjs = [];
        this.blake;
        this.dblake;

        //También se establece la dimensión del objeto y su color según corresponda
        this.dimension = dimension;
        this.dimensionColor = dimensionColor;

        this.x = sizeX/2;
        this.z = sizeZ/2;
        var geom = new THREE.BoxBufferGeometry(sizeX,2,sizeZ);
        geom.translate(0,-1,0);

        //Se carga la textura de las plataformas, tanto la de color como la de normales. Se guardan en atributos para poder activarlas o desactivarlas en el cambio de dimension
        this.texture = new THREE.TextureLoader().load('../imgs/textures/platform/platform.png');
        this.normalMap = new THREE.TextureLoader().load('../imgs/textures/platform/platform-NM.png');
        this.mat = new THREE.MeshPhongMaterial ({map: this.texture, normalMap: this.normalMap});

        this.mesh = new THREE.Mesh(geom,this.mat);
        this.mesh.receiveShadow = true;
        this.animationNode = new THREE.Object3D();
        this.animationNode.add(this.mesh);

        //Para el desplazamiento de los objetos solidarios con la plataforma se necesita conocer la posición real de esta
        //Que es la suma de la posición de inicio junto a la posición de la animación si la tiene
        this.realPos = new THREE.Vector3();
        this.realPos.addVectors(this.animationNode.position,this.position);
        this.add(this.animationNode);
    }

    //Función que incluye un objeto (caja o fruta) para que se mueva solidariamente con la plataforma
    incluir(obj){
        //Se icluye el objeto el vector de objetos para almacenar su referencia
        this.objs.push(obj);
        //Se calcula el desplazamiento relativo a realizarle en el update de la animación
        var objP = obj.position.clone();
        objP.subVectors(objP,this.realPos);
        this.dobjs.push(objP);
    }
    
    //Función que excluye un objeto del movimiento solidario con la plataforma
    excluir(obj){
        //Lo elimina del vector de referencias y también elimina su entrada del vector de desplazamientos relativos
        var index = this.objs.indexOf(obj);
        this.dobjs.splice(index,1);
        this.objs.splice(index,1);

    }

    //Función que inclute a Blake en el desplazamiento solidario con la plataforma. Funciona de forma similar a la de un objeto pero Blake se guarda en su propia variable de referencia
    incluirBlake(blake){
        if(this.blake == null){
            this.blake = blake;
            this.dblake = blake.position.clone();
            this.dblake.subVectors(this.dblake,this.realPos);
        }
    }

    //Excluir a Blake del movimiento solidario
    excluirBlake(){
        this.blake = null;
    }

    //Creación de la animación de desplazamiento. Los parámetros start y finish pasados no son posiciones absolutas sino relativas a la posición donde se encuentre la plataforma
    crearAnimacion(start, finish, time, delay){
        var origin = start;
        var destiny = finish;

        var that = this;

        this.movimiento = new TWEEN.Tween(origin)
        .to(destiny,time)
        .onUpdate(function(){
            that.animationNode.position.x = origin.x;
            that.animationNode.position.z = origin.z;
            that.realPos.addVectors(that.animationNode.position,that.position);
            for(var i = 0; i < that.objs.length; i++){
                var obj = that.objs[i];
                obj.position.copy(that.realPos);
                obj.position.add(that.dobjs[i]);
            }
            if(that.blake != null){
                that.blake.position.copy(that.realPos);
                that.blake.position.add(that.dblake);
            }
        })
        .yoyo(true)
        .repeat(Infinity)
        .delay(delay)
        .start();
    }

    //Función para el cambio de dimensión
    toggleWireFrame(modo){
        //Si la dimensión del cambio no es la del objeto
        if(modo){
          //Se activa el modo alambre y se establece el color de dicho alambre al de la dimensión
          this.mat.wireframe = true;
          this.mat.color.set(this.dimensionColor);
          //También se desactivan las texturas de color y normales para evitar que se altere el color del alambre
          this.mat.map = null;
          this.mat.normalMap = null;
          //Por los cambios efectuados se marca que el material necesita actualización
          this.mat.needsUpdate = true;
          //Y por útlimo también se desactiva que el objeto en modo alambre tenga sombras
          this.mesh.receiveShadow = false;
        }
        else{
          //En caso contrario, se realiza el proceso inverso
          this.mat.wireframe = false;
          this.mat.map = this.texture;
          this.mat.normalMap = this.normalMap;
          //Se devuelve el colo base del material a blanco para evitar que interfiera con el color dado por la textura
          this.mat.color.set(0xFFFFFF);
          this.mat.needsUpdate = true;
          this.mesh.receiveShadow = true;
        }
    }

    //Para que la animación se realice correctamente hay que actualizar el vector realPos al modificar la posición base de las plataformas
    //Por tanto, para colocarlas se debe usar este método en lugar de position.set directamente
    posicionar(x,y,z){
        this.position.set(x,y,z);
        this.realPos.addVectors(this.position,this.animationNode.position);
    }
}

export { Platform };