(function () {
    
    var info = false;
    var infoModule = false;
    var renderer,
    	scene,
        camera,
        mesh,
        gui,
    	myCanvas = document.getElementById('myCanvas');


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
    camera.position.set( 0, 200, 900 );
    camera.lookAt( 0, 0, 0 );
    

    //SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x262626 );


    //AXES
    var axes = new THREE.AxesHelper(400);
	//scene.add(axes);


    //LIGTH
    var dirLight = new THREE.DirectionalLight( 0xffffff, 3);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 50 );
    scene.add( dirLight );

    var spotLight = new THREE.SpotLight( 0xffffff, 70 );
    spotLight.position.set( 0, 300, 0 );
    //spotLight.position.set( 10, 200, -90 );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 400;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    //scene.add( spotLight );
                    
        
    // FLOOR (пока не импользуем)
    var floorTexture = new THREE.TextureLoader().load( '../img/wood.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshStandardMaterial( { 
        //color: 0x262626
        map: floorTexture, side: THREE.DoubleSide 
        } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh( floorGeometry, floorMaterial );
	floor.position.y = -10;
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
	//scene.add(floor);

           
    //CONTROL    
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    
    //LOADING MANAGER
    var manager = new THREE.LoadingManager();

    manager.onProgress = function( url, itemsLoaded, itemsTotal ){
        loadingElem = document.querySelector('.progress');
        var progressBarElem = loadingElem.querySelector('.progress-bar');
        var progress = (itemsLoaded / itemsTotal) * 100;
        progressBarElem.style.cssText = 'width: 100%';
        progressBarElem.innerHTML = `Loading...${progress.toFixed(0)} %`;
    };

    manager.onLoad = function(){
        console.log("Loader all resources");
        setTimeout(function(){
            loadingElem.style.display = 'none';
        }, 6000);
    };

    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
    };


    //ENVIRONMENT (Окружение с бэкграундом кубом, а также для material.envMap)
    var urls = [
        'img/smallHangar/px.jpg',
        'img/smallHangar/nx.jpg',
        'img/smallHangar/py.jpg',
        'img/smallHangar/ny.jpg',
        'img/smallHangar/pz.jpg',
        'img/smallHangar/nz.jpg',
    ];

    var cubeLoader = new THREE.CubeTextureLoader();
    var cubeMap = cubeLoader.load(urls);
    //scene.background = cubeMap;


    //MODEL (загрузка модели в формате gltf)
    var loader = new THREE.GLTFLoader(manager);
    loader.load('models/RIG_lowpoly/RIG_lowpoly.glb', handle_load);

    function handle_load(gltf) {
        console.log(gltf);
        mesh = gltf.scene;
        console.log(mesh.children[0]);
    
        scene.add(mesh);
        mesh.position.y = 35;
        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.castShadow = true;

            
        const materialsName = new Set();
        mesh.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            child.material.envMap = cubeMap;
            child.material.aoMapIntensity = 0.6;
			child.material.needsUpdate = true;
    
            materialsName.add(child.material.name);
            getParamMaterial(child);
            setParamMaterial(child);
          }
        });
    
        const selectEl = document.getElementById('selectMaterials');
    
        materialsName.forEach(material => {
          var option = document.createElement('option');
          option.innerHTML = material;
          selectEl.appendChild(option);
    
          //addTexture(material);
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
                
                mesh.rotation.y += 0.005;
            } 
        } else {
            if (infoModule) {
                if(camera.position.z > 900){
                    camera.position.z -= 5;
                } else {
                    document.getElementById("specification").style.display = "block";
                }
            }
        }
            
            renderer.render(scene, camera);
            requestAnimationFrame(render);
    }


    function onWindowResize() {
        camera.aspect = myCanvas.clientWidth / myCanvas.clientHeight;

        // update the camera's frustum
        camera.updateProjectionMatrix();

        renderer.setSize( myCanvas.clientWidth, myCanvas.clientHeight );
    }


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

    
    //временно отключаем блок GUI
    //buildGui();
    window.addEventListener( 'resize', onWindowResize );



    // ====================================MAIN FUNCTION=================================

    //получаем параметры материалов
    function getParamMaterial(mesh){
        
        switch (mesh.material.name) {
            case 'Diod':
            var Diod_roughness = document.getElementById('roughness');
                Diod_roughness.innerHTML += ' ' + mesh.material.roughness;
            var Diod_option_roughness = document.getElementById('rangeRoughness');
                Diod_option_roughness.value = mesh.material.roughness;

            var Diod_metalness = document.getElementById('metalness');
                Diod_metalness.innerHTML += ' ' + mesh.material.metalness;
            var Diod_option_metalness = document.getElementById('rangeMetalness');
                Diod_option_metalness.value = mesh.material.metalness;

            var Diod_emissive = document.getElementById('emissive');
                Diod_emissive.innerHTML += ' ' + mesh.material.emissiveIntensity;
            var Diod_option_emissive = document.getElementById('rangeEmissive');
                Diod_option_emissive.value = mesh.material.emissiveIntensity;    
            
            // текстура для материала Diod    
            var Diod_BaseColorMap = document.querySelector('.textures-available');
                Diod_BaseColorMap.innerHTML +=  '<a href="#" class="active">' + mesh.material.map.image.src + '</a> <br>';
                
                // и т.д.
        }
    }


    //устанавливаем параметры материалов
    function setParamMaterial(mesh){
        
        var settingsSaveBtn = document.getElementById('settings-save-btn');
        settingsSaveBtn.addEventListener('click', function(){
            
            switch (mesh.material.name) {
                case 'Diod':
                var Diod_option_roughness = document.getElementById('rangeRoughness');
                    mesh.material.roughness = Diod_option_roughness.value;

                var Diod_option_metalness = document.getElementById('rangeMetalness');
                    mesh.material.metalness = Diod_option_metalness.value;

                var Diod_option_emissive = document.getElementById('rangeEmissive');
                    mesh.material.emissiveIntensity = Diod_option_emissive.value;
                

                //текущая текстура
                console.log(mesh.material.map.image.src);

                //устанавливаем новую текстуру  
                var Diod_BaseColorMap = document.querySelector('.textures-available');
                    mesh.material.map.image.src = 'models/RIG_lowpoly/Diod_baseColor.png';

                console.log(mesh.material.map.image.src);

               // и т.д.
            }

        });
    }


    // //загрузка сцены из локального хранилища
    // function getFromJSON(){
    //     var loadedSceneAsJson = JSON.parse(json);
    //     var loader = new THREE.ObjectLoader();
    //     var scene = loader.parse(loadedSceneAsJson);
    // }

    // //сохранение сцены в локальное хранилище
    // function saveToJSON(){
    //     localStorage.setItem('scene', JSON.stringify(scene.toJSON()));
    // }

   

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


    
    //панель настроек материала
    const settingsEl = document.getElementById('settings');
    const settingsToggler = document.getElementById('settings-toggler');
        
    settingsToggler.addEventListener('click', function() {
        settingsEl.classList.toggle('open');
    });


    //панель загрузок текстур
    var x = document.getElementById('texture-browser-panel');
    var el = document.querySelectorAll('.settTx');
    for(var i = 0; i< el.length; i++){
        el[i].onclick = function(){
            x.classList.toggle('open');
        };
    }


    //ФУНКЦИОНАЛЬНЫЕ КНОПКИ СЦЕНЫ

    //остановка вращения модели
    const btnStop = document.getElementById('btn-stop');

    btnStop.addEventListener('click', function () {
        info = true;
        infoModule = false;
    });

    //показать характеристики модели
    const btnSpecification = document.getElementById('btn-specification');

    btnSpecification.addEventListener('click', function () {
        info = true;
        infoModule = true;
    });

    //продолжить вращение модели
    const btnStart = document.getElementById('btn-start');

    btnStart.addEventListener('click', function () {
        info = false;
        document.getElementById("specification").style.display = "none";
    });

    //разобрать модель
    const btnMakeOut = document.getElementById('btn-make-out');

    btnMakeOut.addEventListener('click', function () {
        mesh.children[0].children[0].position.y = 0.5; //карта
        mesh.children[0].children[1].position.y = 0.5;
        mesh.children[0].children[2].position.y = 0.5;
        mesh.children[0].children[28].position.y = 0.5; // вентилятор
        mesh.children[0].children[29].position.y = 0.5;
        mesh.children[0].children[66].position.y = -0.5; //корпус
        mesh.children[0].children[69].position.x = -0.5; //блок питания
        mesh.children[0].children[70].position.x = -0.5;
        mesh.children[0].children[71].position.x = -0.5;
    });

    //собрать модель
    const btnMakeIn = document.getElementById('btn-make-in');

    btnMakeIn.addEventListener('click', function () {
        mesh.children[0].children[0].position.y = 0;
        mesh.children[0].children[1].position.y = 0;
        mesh.children[0].children[2].position.y = 0;
        mesh.children[0].children[28].position.y = 0;
        mesh.children[0].children[29].position.y = 0;
        mesh.children[0].children[66].position.y = 0;
        mesh.children[0].children[69].position.x = 0;
        mesh.children[0].children[70].position.x = 0;
        mesh.children[0].children[71].position.x = 0;
    });

    //показать деталь корпуса модели
    const btnDetail = document.getElementById('btn-detail');

    btnDetail.addEventListener('click', function () {
        for (var i = 0; i <= mesh.children[0].children.length; i++) {
            mesh.children[0].children[i].visible = false;
            mesh.children[0].children[66].visible = true; //корпус
        }

    });

    //показать корпус модели
    const showDetail = document.getElementById('showDetail');

    showDetail.addEventListener('click', function () {
        for (var i = 0; i <= mesh.children[0].children.length; i++) {
            mesh.children[0].children[i].visible = false;
            mesh.children[0].children[66].visible = true; //корпус
        }

    });

    //показываем все детали модели
    const btnBack = document.getElementById('btn-back');

    btnBack.addEventListener('click', function () {
        for (var i = 0; i <= mesh.children[0].children.length; i++) {
            mesh.children[0].children[i].visible = true;
        }
    });

    

})();