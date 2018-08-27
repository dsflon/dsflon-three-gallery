function jThreePanoramaImageClick(imageElm,imageData) {

    this.loadEnd = function(){};
    this.imageLoading = function(){};
    this.clickEnd = function(){};

    this.imageElm = imageElm;
    this.imageData = imageData;

    // Three Init
    this.container,
    this.scene,
    this.renderer,
    this.camera,
    this.screen,
    this.animate,
    this.animateFrame;

    // controls
    this.controls;
    this.enableRotate = true;
    this.rotateSpeed = 1;
    this.autoRotate = false;
    this.enablePan = false;
    this.autoRotateSpeed = 1;
    this.minDistance = 1;
    this.maxDistance = 6;
    this.enableZoom = true;
    this.zoomSpeed = 10;
    this.zoomSpeed = 10;

    this.reverse = true;
    this.defaultDistance = 1;

    // texture
    this.texture = new THREE.TextureLoader();
    this.textures = [];

    // raycaster
    this.raycaster;
    this.mouse = new THREE.Vector2();

    // objects
    this.objects = [];
    this.objectData = [];
    this.newObjects = [];

    this.body = document.getElementsByTagName('body')[0];

    //
    this.playing = false;

    //
    this.initCamera();
    this.ImageLoad();

}

////

jThreePanoramaImageClick.prototype.ImageLoad = function( src ) {

    var THAT = this;
    var count = 0;

    for (var i = 0; i < this.imageData.length; i++) {

        var IMAGE_SRC = this.imageData[i].img_path;
        this.texture.load( IMAGE_SRC, function( texture ) {

            var arrayNum = arraySearch( texture.image.src.split( location.host )[1] )

            THAT.textures.splice(arrayNum, 0, [texture, (texture.image.naturalHeight / texture.image.naturalWidth)]);

            count ++;

            THAT.imageLoading( count, THAT.imageData.length );
            if( THAT.imageData.length == count ) THAT.loadEnd();

        });

    }

    //配列の何番目かを取得
    function arraySearch( key ) {

        for(var i = 0 ; i < THAT.imageData.length ; i++){

            if( key === THAT.imageData[i].img_path ){
                return i;
            }

        }

    }

}

////

jThreePanoramaImageClick.prototype.initThree = function() {

    var THAT = this;

    this.container = document.createElement( 'div' );
    this.imageElm.appendChild( this.container );

    this.scene = new THREE.Scene();

    this.raycaster = new THREE.Raycaster();

    this.renderer = new THREE.WebGLRenderer( {
        antialias:true,
        alpha: true
    } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor("#000000", 0);
    this.container.appendChild( this.renderer.domElement );

    ////

    // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls = new THREE.FlyControls(this.camera);

    this.controls.movementSpeed = 20000; //移動速度
    this.controls.domElement = document.getElementById("area");
    this.controls.rollSpeed = 500; //回転速度
    this.controls.autoForward = false; //true:自動で移動する,false:自動で移動しない
    this.controls.dragToLook = false; //true:ドラッグによる視点移動を禁止する,false:ドラッグによる視点移動をする

    ////

    window.addEventListener( 'resize', function() {
        THAT.onWindowResize(THAT);
    }, false );

    this.container.addEventListener( 'mousemove', function( event ) {
        THAT.onDocumentMouseMove( event, THAT );
    }, false );
    this.container.addEventListener( 'click', function( event ) {
        THAT.onDocumentMouseDown( event, THAT );
    }, false );

}

////

jThreePanoramaImageClick.prototype.initCamera = function() {

    var fov    = 100;
    var aspect =  window.innerWidth / window.innerHeight;
    var near   = 1;
    var far    = 10000;
    this.camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    this.camera.position.set(0,0,1);

}

////

jThreePanoramaImageClick.prototype.initObject = function() {

    var THAT = this;

    for ( var i = 0, l = this.textures.length; i < l; i ++ ) {

        if( this.textures[i][1] == 1 ) {

            var width = 1.5;
            var height = 1.5;

        } else {

            var width = this.textures[i][1] < 1 ? 2 : 1.5;
            var height = width * this.textures[i][1];

        }

        var GEOMETRY = new THREE.CubeGeometry( width, height, 0.001, 1, 1, 1 );

        // var MATERIAL = new THREE.MeshBasicMaterial( {
        var MATERIAL = new THREE.MeshLambertMaterial( {
            map : this.textures[i][0],
            // transparent: true,
            opacity: 1,
            alphaTest:0.2,
        } );
        var OBJECT = new THREE.Mesh( GEOMETRY, MATERIAL );

        //画像サイズに関する警告を削除
        OBJECT.material.map.minFilter = THREE.LinearFilter;

        //最初にランダム配置
		OBJECT.position.x = ( Math.random() * 20 ) - 10;
		OBJECT.position.y = ( Math.random() * 20 ) - 10;
		OBJECT.position.z = ( Math.random() * 20 ) - 10;
        OBJECT.name = i;

        THAT.objects.push( OBJECT );
        THAT.objectData.push( { "id": i } );

        THAT.scene.add( OBJECT );

    }

    // this.setObject();

    var light = new THREE.SpotLight(0xffffff);
       light.position.set( 0, 500, 500 );
       light.target.position.set( 0, 0, 0 );
    //    light.shadowCameraVisible = true;
       new THREE.CameraHelper( light.shadow.camera )
       light.castShadow = true;
       this.scene.add( light );

}

jThreePanoramaImageClick.prototype.setObject = function() {

    var THAT = this;

    var vector = new THREE.Vector3();
    var layerCount = 1;
    var layerMax = 40;
    var layerNum = Math.round(this.imageData.length / layerMax);//四捨五入
    var startNum = 0;
    var remainder = this.imageData.length % layerMax;

    // レイヤー分実行
    for (var i = 0; i < layerNum; i++) {
        SetObject(i,layerNum);
        layerCount ++;
    }

    function SetObject(i,layerNum) {

        if( i == layerNum - 1 ) {
            if( remainder > Math.ceil( layerMax / 2 ) ) { //最後は余りを足す
                layerMax = remainder;
            } else {
                layerMax += THAT.imageData.length % layerMax;
            }
        }

        for ( var j = 0, k = layerMax; j < k; j ++ ) {

            if( (j + startNum) < THAT.imageData.length ) {

                var phi = Math.acos( -1 + ( 2 * j ) / k );
                var theta = Math.sqrt(k * Math.PI ) * phi;

                THAT.newObject = new THREE.Object3D();

                var x = (5 + (layerCount * 4)) * Math.cos( theta ) * Math.sin( phi );
                var y = (5 + (layerCount * 4)) * Math.sin( theta ) * Math.sin( phi );
                var z = (5 + (layerCount * 4)) * Math.cos( phi );

                THAT.newObject.position.copy ( new THREE.Vector3 (x, y, z) );

                vector.copy( THAT.newObject.position ).multiplyScalar( 2 );
                THAT.newObject.lookAt( vector );

                THAT.newObjects.push( THAT.newObject );

            }

        }

        startNum += layerMax;

    }


    setTimeout( function(){

        for (var i = 0; i < THAT.objects.length; i++) {

            var object = THAT.objects[ i ];
            var target = THAT.newObjects[ i ];
            var position = { x: target.position.x, y: target.position.y, z: target.position.z }
            var rotation = { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }

            var duration = 1000 + (Math.random() * Math.random() * 2000);

            new TWEEN.Tween( object.position )
                .to( position, duration )
                .easing( TWEEN.Easing.Quartic.InOut )
                .start();

            new TWEEN.Tween( object.rotation )
                .to( rotation, duration )
                .easing( TWEEN.Easing.Quartic.InOut )
                .start();

        }

    },1000 )
}


jThreePanoramaImageClick.prototype.onWindowResize = function(THAT) {

    THAT.camera.aspect = window.innerWidth / window.innerHeight;
    THAT.camera.updateProjectionMatrix();

    THAT.renderer.setSize( window.innerWidth, window.innerHeight );

}

////

jThreePanoramaImageClick.prototype.play = function() {

    this.initThree();
    this.initObject();

    // this.controls.minDistance = this.minDistance;
    // this.controls.maxDistance = this.maxDistance;
    // this.controls.enableZoom = this.enableZoom;
    // this.controls.zoomSpeed = this.zoomSpeed;
    // this.controls.autoRotate = this.autoRotate;
    // this.controls.autoRotateSpeed = this.autoRotateSpeed;
    // this.controls.rotateSpeed = this.rotateSpeed;
    // this.controls.enableRotate = this.enableRotate;
    // this.controls.enablePan = this.enablePan;

    this.camera.position.z = this.defaultDistance;

    this.render();
    this.playing = true;
}


jThreePanoramaImageClick.prototype.start = function() {

    if(this.autoRotate) this.controls.autoRotate = true;
    this.playing = true;

}

jThreePanoramaImageClick.prototype.stop = function() {

    if(this.autoRotate) this.controls.autoRotate = false;
    this.playing = false;

}

////

jThreePanoramaImageClick.prototype.stopToggle = function() {
    this.playing ? this.stop() : this.start();
};

////

jThreePanoramaImageClick.prototype.onDocumentMouseMove = function( event, THAT ) {

    event.preventDefault();

    THAT.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    THAT.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}
jThreePanoramaImageClick.prototype.onDocumentMouseDown = function( event, THAT ) {

    // イベントの伝播の無効化
    event.preventDefault();

    // マウスポインタの位置座標の取得
    THAT.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    THAT.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // 光線を発射
    THAT.raycaster.setFromCamera( THAT.mouse, THAT.camera );

    // 光線と交わるオブジェクトを収集
    var intersects = THAT.raycaster.intersectObjects( THAT.objects );

    // 交わるオブジェクトが１個以上の場合
    if ( intersects.length > 0 ) {

        var getPoint = intersects[0].object;
        var getPointId = getPoint.name;

        for (var i = 0; i < THAT.objects.length; i++) {
            if (getPointId == THAT.objectData[i].id) {
                THAT.clickEnd(getPoint, THAT.objectData[i]);
            }
        }

    }

}

////

jThreePanoramaImageClick.prototype.transform = function( from, to, speed ) {

    var THAT = this;

    this.tween = new TWEEN.Tween( from )
        .to( to , speed )
        .onUpdate(function(){
        })
        .onComplete(function(){
        })
        .easing( TWEEN.Easing.Quartic.InOut ).start();

}

////

jThreePanoramaImageClick.prototype.render = function() {

    var THAT = this;

    this.animate = function () {

        TWEEN.update();

        //

        var clock = new THREE.Clock();
        var delta = clock.getDelta();
        THAT.controls.update(delta);
        // THAT.controls.update();

        //

		THAT.raycaster.setFromCamera( THAT.mouse, THAT.camera );
		var intersects = THAT.raycaster.intersectObjects( THAT.objects );
        var pointer = intersects.length > 0 ? "pointer" : "inherit";
        THAT.body.style.cursor = pointer;

        //

        THAT.animateFrame = requestAnimationFrame( THAT.animate );
        THAT.renderer.render( THAT.scene, THAT.camera );


    }

    this.animate();

}
