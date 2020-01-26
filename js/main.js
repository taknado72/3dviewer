(function () {
    
    var info = false;
    var infoModule = false;
    var renderer,
    	scene,
        camera,
        mesh,
        gui,
    	myCanvas = document.getElementById('myCanvas');


    //RENDERER

    // RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer({
           canvas: myCanvas, 
           antialias: true
        });
	else
		renderer = new THREE.CanvasRenderer(); 

    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // must enable shadows on the renderer 
    renderer.shadowMap.Enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;
    

    //CAMERA
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 5000 );
    camera.position.set( 0, 500, 1000 );
    camera.lookAt( 0, 0, 0 );
    

    //SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x262626 );


    //AXES
    var axes = new THREE.AxesHelper(400);
	scene.add(axes);


    //LIGHTS
    var dirLight = new THREE.DirectionalLight( 0xffffff, 2 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 50 );
    scene.add( dirLight );

    var spotLight = new THREE.SpotLight( 0xffffff, 30 );
    //spotLight.position.set( 0, 0, 0 );
    spotLight.position.set( 10, 200, -90 );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 400;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    scene.add( spotLight );
                    
    lightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( lightHelper );
                    
    
    // FLOOR (пока не импользуем)
    var floorTexture = new THREE.TextureLoader().load( '../img/wood.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshStandardMaterial( { 
        color: 0x262626
        //map: floorTexture, side: THREE.DoubleSide 
        } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -10;
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
	//scene.add(floor);

           
    //CONTROL    
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    

    //TEXTURE
    // var manager = new THREE.LoadingManager();
    // var textureloader  = new THREE.ImageLoader( manager );

    // var textureCoolerChasis = new THREE.Texture();

    // textureloader.load( './models/RIG_lowpoly/Cooler_chasis_baseColor.png', function ( image ) {
    //     textureCoolerChasis.image = image;
    //     textureCoolerChasis.needsUpdate = true;
    // });


    //MODEL (загрузка модели в формате gltf)
    var loader = new THREE.GLTFLoader();
   // loader.load('./models/RIG_lowpoly/RIG_lowpoly.glb', handle_load);

    function handle_load(gltf) {

        console.log(gltf);
        mesh = gltf.scene;
        console.log(mesh.children[0]);
                
        scene.add( mesh );
        mesh.position.y = 35;
        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.castShadow = true;


        //materialsName =[];
        mesh.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
                child.receiveShadow = true;

                //materialsName.push["child.material.name"];
                
                // var e = document.getElementById('selectMaterials');
            
                // for (var i = 0; i < materials.length; i++){
                //     var option = document.createElement('option');
                //     option.innerHTML = materials[i];
                //     e.appendChild(option); 
                // }

                //console.log(materialsName);

                //materials.push[child.material.name];
                //addTexture(child.material.name);
            }
        });
        
    };


    //RENDER LOOP
    render();
    
    
    
    var delta = 0;
    var prevTime = Date.now();

    function render() {

        if(!info){
            delta += 0.1;
            if (mesh) {
                //animation mesh (пока не используем)
                //mesh.morphTargetInfluences[ 0 ] = Math.sin(delta) * 20.0;
                
                //mesh.rotation.y += 0.005;
            } 
        } else {
            if (infoModule) {
                if(camera.position.z > 900){
                    camera.position.z -= 5;
                } else {
                    document.getElementById("1").style.display = "block";
                }
            }
        }
            
            lightHelper.update();
                        
            renderer.render(scene, camera);
            requestAnimationFrame(render);
    }


    function onWindowResize() {
        camera.aspect = myCanvas.clientWidth / myCanvas.clientHeight;

        // update the camera's frustum
        camera.updateProjectionMatrix();

        renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight );
    }



    //УСТАНОВКА ТЕКСТУР В ЗАВИСИМОСТИ ОТ МАТЕРИАЛОВ
    // function addTexture(n){
    //   switch (n) {
    //   case 'Diod':
    //     var textureDiod = new THREE.MeshStandardMaterial({
    //         color: 0x2194ce,
    //         map: new THREE.TextureLoader().load( 'models/RIG_lowpoly/texture1.png' );
    //         emissive: 1,
    //         emissiveMap: new THREE.TextureLoader().load( 'models/RIG_lowpoly/texture2.png' );
    //         metalness: 1,
    //         metalnessMap: new THREE.TextureLoader().load( 'models/RIG_lowpoly/texture3.png' );
    //         roughness: 1,
    //         roughnessMap: new THREE.TextureLoader().load( 'models/RIG_lowpoly/texture4.png' );
    //         normalMap: new THREE.TextureLoader().load( 'models/RIG_lowpoly/texture5.png' );
    //         bumpMap: new THREE.TextureLoader().load( 'models/RIG_lowpoly/texture6.png' );
    //     });
    //     break;
    //   }
    // }



    //GUI (блок для изменения заданных параметров с сайта)
    function buildGui() {
        gui = new dat.GUI();
        var params = {
            'light color': spotLight.color.getHex(),
            intensity: spotLight.intensity,
            distance: spotLight.distance,
            angle: spotLight.angle,
            penumbra: spotLight.penumbra,
            decay: spotLight.decay,
            positionX: 130,
            positionY: 185,
            positionZ: -150
        };
        
        var lightFolder = gui.addFolder( 'Light' );

        lightFolder.addColor( params, 'light color' ).onChange( function ( val ) {
            spotLight.color.setHex( val );
            render();
        } );
        lightFolder.add( params, 'intensity', 0, 50 ).onChange( function ( val ) {
            spotLight.intensity = val;
            render();
        } );
        lightFolder.add( params, 'distance', 50, 500 ).onChange( function ( val ) {
            spotLight.distance = val;
            render();
        } );
        lightFolder.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
            spotLight.angle = val;
            render();
        } );
        lightFolder.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {
            spotLight.penumbra = val;
            render();
        } );
        lightFolder.add( params, 'decay', 1, 2 ).onChange( function ( val ) {
            spotLight.decay = val;
            render();
        } );
        lightFolder.add( params, 'positionX', -500, 500 ).onChange( function ( val ) {
            spotLight.position.x = val;
            render();
        } );
        lightFolder.add( params, 'positionY', -500, 500 ).onChange( function ( val ) {
            spotLight.position.y = val;
            render();
        } );
        lightFolder.add( params, 'positionZ', -500, 500 ).onChange( function ( val ) {
            spotLight.position.z = val;
            render();
        } );
        
        lightFolder.close();   
    }


    //MAIN FUNCTION
    const settingsEl = document.getElementById('settings');
    const settingsToggler = document.getElementById('settings-toggler');
        
    settingsToggler.addEventListener('click', function() {
        settingsEl.classList.toggle('open');
    });


    //block settings Texture
    var x = document.getElementById('texture-browser-panel');
    var el = document.querySelectorAll('.settTx');
    for(var i = 0; i< el.length; i++){
        el[i].onclick = function(){
            x.classList.toggle('open');
        };
    }


      
    function showInfo (num) {
        switch(num) {
            case 0:
                info = true;
                infoModule = false;
                break;
            case 1:
                info = true;
                infoModule = true;
                break;
            case 2:
                info = false;
                document.getElementById("1").style.display = "none";
                break;
            case 3:
                mesh.children[0].children[0].position.y = 0.5; //карта
                mesh.children[0].children[1].position.y = 0.5;
                mesh.children[0].children[2].position.y = 0.5;
                mesh.children[0].children[28].position.y = 0.5; // вентилятор
                mesh.children[0].children[29].position.y = 0.5;
                mesh.children[0].children[66].position.y = -0.5; //корпус
                mesh.children[0].children[69].position.x = -0.5; //блок питания
                mesh.children[0].children[70].position.x = -0.5;
                mesh.children[0].children[71].position.x = -0.5;
                break;
            case 4:
                mesh.children[0].children[0].position.y = 0;
                mesh.children[0].children[1].position.y = 0;
                mesh.children[0].children[2].position.y = 0;
                mesh.children[0].children[28].position.y = 0;
                mesh.children[0].children[29].position.y = 0;
                mesh.children[0].children[66].position.y = 0;
                mesh.children[0].children[69].position.x = 0;
                mesh.children[0].children[70].position.x = 0;
                mesh.children[0].children[71].position.x = 0;
                break;
            case 5:
                for (var i = 0; i <= mesh.children[0].children.length; i++) {
                    mesh.children[0].children[i].visible = false;
                    mesh.children[0].children[66].visible = true; //корпус
                }
                break;
            case 6:
                for (var i = 0; i <= mesh.children[0].children.length; i++) {
                    mesh.children[0].children[i].visible = true;
                    mesh.children[0].children[66].visible = true; //корпус
                }
                break;
                
            default: 
                break;
        }   
    }

    //временно отключаем блок GUI
    //buildGui();
    window.addEventListener( 'resize', onWindowResize );

})();