/*

MeganeTemplate

Version: 4.1.0
Website: http://megane-template.com/
License: Dentsu Isobar All Rights Reserved.

*/
function iosVersion() {
    var v, versions;
    if ( /iP(hone|od|ad)/.test( navigator.platform ) ) {
        v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        return versions[ 0 ];
    }
    return versions;
}

function jThreePanoramaVideoViewer(videoElm,videoSrc,videoVolume,videoLoop) {

    var videoUA = navigator.userAgent;
    this.videoIOS = false;
    this.videoSP = false;

    if(/(iPhone|iPod|iPad)/.test(videoUA)) {
        if( iosVersion() < 10 ) this.videoIOS = true;
    }

    if(/(iPhone|iPod|iPad|Android)/.test(videoUA)) {
        this.videoSP = true;
    }

    this.onload = false;
    this.loadEnd = function(){};
    this.volFadeInEnd = function(){};
    this.volFadeOutEnd = function(){};
    this.playEnd = function(){};

    if(videoVolume == null) videoVolume = 1;
    if(videoLoop == null) videoLoop = true;

    this.video;
    this.videoElm = videoElm;
    this.videoSrc = videoSrc;
    this.videoVolume = 1;
    this.videoLoop = true;
    this.videoVolume = videoVolume;
    this.videoLoop = videoLoop;
    this.videoWidth = window.innerWidth;
    this.videoHeight = window.innerHeight;

    this.defaultDistance = 1;
    this.vr = false;

    //
    this.container,
    this.scene,
    this.group,
    this.renderer,
    this.camera,
    this.videoTexture,
    this.screen,
    this.animate,
    this.animateFrame;

    //
    this.audio,
    this.videoCanvas,
    this.videoContext;

    //
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
    this.deviceOrientationControls = false;

    //
    this.playing = false;
    this.muting = false;

    //
    this.initCamera();
    this.VideoInit();
    this.AudioInit();

    var that = this;
    this.video.addEventListener("canplay", Canplay, false)

    function Canplay() {
        that.onload = true;
        that.loadEnd();
        that.video.removeEventListener("canplay", Canplay, false);
    }

}

jThreePanoramaVideoViewer.prototype.AudioInit = function() {

    this.audio = new Audio();
    this.audio.src = this.videoSrc;
    this.audio.loop = this.videoLoop;
    this.audio.volume = this.videoVolume;
    this.audio.load();

}
jThreePanoramaVideoViewer.prototype.VideoInit = function() {

    this.video = document.createElement( 'video' );
    this.video.setAttribute("playsinline", true);
	this.video.width = this.video.videoWidth;
	this.video.height = this.video.videoHeight;

    this.video.loop = this.videoLoop;
    this.video.volume = this.videoVolume;
    this.video.src = this.videoSrc;
    this.video.load();

    //
    this.videoCanvas = document.createElement('canvas');
    this.videoCanvas.width = this.video.videoWidth;
    this.videoCanvas.height = this.video.videoHeight;
    this.videoContext = this.videoCanvas.getContext('2d');

}

////

jThreePanoramaVideoViewer.prototype.initThree = function() {

    this.container = document.createElement( 'div' );
    this.videoElm.appendChild( this.container );

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer( {
        antialias:true,
        alpha: true
    } );
    this.renderer.setSize( this.videoWidth, this.videoHeight );
    this.renderer.setClearColor("#FFFFFF", 0);
    this.container.appendChild( this.renderer.domElement );

    if( this.deviceOrientationControls ){

        if (this.videoSP) {
            this.controls = new THREE.DeviceOrientationControls(this.camera,this.renderer.domElement);
        } else {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        }

    } else {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }

    // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    // const setOrientationControls = (e) =>  {
    //
    //     if (!e.alpha) {
    //         return;
    //     }
    //     this.controls = new THREE.DeviceOrientationControls(this.camera, true);
    //     // this.controls = new THREE.DeviceOrientationControls(this.camera,this.renderer.domElement);
    //     this.controls.connect();
    //     this.controls.update();
    //     window.removeEventListener('deviceorientation', setOrientationControls, true);
    // }
    // if (this.videoSP) {
    //     window.addEventListener("deviceorientation", setOrientationControls, true);
    // }

    var that = this;
    window.addEventListener( 'resize', function() {
        that.onWindowResize(that);
    }, false );

    if( this.vr ) this.effect = new THREE.StereoEffect( this.renderer );
}

////

jThreePanoramaVideoViewer.prototype.initCamera = function() {

    this.camera = new THREE.PerspectiveCamera(75, this.videoWidth / this.videoHeight, 1, 1000);
    this.camera.position.set(0,0,1);

}

////

jThreePanoramaVideoViewer.prototype.initObject = function() {

    var geometry = new THREE.SphereGeometry( 5, 60, 40 );
        geometry.scale( - 1, 1, 1 );

    this.videoTexture = new THREE.VideoTexture( this.video );
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;

    var material = new THREE.MeshBasicMaterial({
        map : this.videoTexture
    });

    this.screen = new THREE.Mesh( geometry, material );

    if( this.deviceOrientationControls ){
        if ( !this.videoSP ) {
            this.screen.rotation.set(0,-Math.PI/2,0);
        } else {
            // if( this.videoIOS ) this.screen.rotation.set(0,-Math.PI,0);
            if(/(iPhone|iPod|iPad|Android)/.test(navigator.userAgent)) {
                 this.screen.rotation.set(0,-Math.PI,0);
            }
        }
    } else {
        this.screen.rotation.set(0,-Math.PI/2,0);
    }

    this.scene.add( this.screen );

}


jThreePanoramaVideoViewer.prototype.onWindowResize = function(that) {

    that.camera.aspect = window.innerWidth / window.innerHeight;
    that.camera.updateProjectionMatrix();

    if( !that.vr ) {
        that.renderer.setSize( window.innerWidth, window.innerHeight );
    } else {
        that.effect.setSize( window.innerWidth, window.innerHeight );
    }

}

////

jThreePanoramaVideoViewer.prototype.play = function(time) {

    var num = 0;
    if(time) num = time;

    this.initThree();
    this.initObject();

    this.controls.minDistance = this.minDistance;
    this.controls.maxDistance = this.maxDistance;
    this.controls.enableZoom = this.enableZoom;
    this.controls.zoomSpeed = this.zoomSpeed;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = this.autoRotateSpeed;
    this.controls.rotateSpeed = this.rotateSpeed;
    this.controls.enableRotate = this.enableRotate;
    this.controls.enablePan = this.enablePan;

    if (!this.deviceOrientationControls) {
        this.camera.position.z = this.defaultDistance;
        // this.screen.scale.x = 0.8;
        // this.screen.scale.y = 0.8;
        // this.screen.scale.z = 0.8;
    }

    // if( this.vr ) { this.effect.eyeSeparation = 10; }

    if(this.videoIOS) {

        this.audio.currentTime = num;
        this.audio.play();
        this.audio.addEventListener('ended', this.playEnd, false);

    } else {

        this.video.currentTime = num;
        this.video.play();
        this.video.addEventListener('ended', this.playEnd, false);

    }

    this.render();
    this.playing = true;
    this.muting = true;
}


jThreePanoramaVideoViewer.prototype.start = function() {

    if(this.videoIOS) {

        this.audio.play();
        this.audio.addEventListener('ended', this.playEnd, false);

    } else {
        this.video.play();
        this.video.addEventListener('ended', this.playEnd, false);
    }

    if(this.autoRotate) this.controls.autoRotate = true;
    this.playing = true;
}

jThreePanoramaVideoViewer.prototype.stop = function() {

    if(this.videoIOS) {

        this.audio.currentTime = 0;
        this.audio.pause();

    } else {

        this.video.currentTime = 0;
        this.video.pause();

    }

    if(this.autoRotate) this.controls.autoRotate = false;
    this.playing = false;
}

jThreePanoramaVideoViewer.prototype.pause = function() {

    if(this.videoIOS) {

        this.audio.pause();

    } else {

        this.video.pause();

    }

    if(this.autoRotate) this.controls.autoRotate = false;
    this.playing = false;
}

jThreePanoramaVideoViewer.prototype.mute = function(volume) {

    var num = 0;
    if(volume) num = volume;

    this.video.volume = num;
    this.muting = false;

};

jThreePanoramaVideoViewer.prototype.unmute = function(volume) {

    var num = this.videoVolume;
    if(volume) num = volume;

    this.video.volume = num;
    this.muting = true;

};

jThreePanoramaVideoViewer.prototype.volFadeOut = function(volume) {

    var num = 0;
    if(volume) num = volume;

    var thisVol = this.videoVolume;
    var that = this;

    var fadeOut = setInterval(function(){

        thisVol = thisVol - 0.005;
        that.video.volume = thisVol;
        if(thisVol < 0.01) {
            that.volFadeOutEnd();
            clearInterval(fadeOut);
            that.video.volume = num;
        }

    },1);
    this.muting = false;

};
jThreePanoramaVideoViewer.prototype.volFadeIn = function(volume) {

    var num = this.videoVolume;
    if(volume) num = volume;

    var thisVol = 0;
    var that = this;

    var fadeOut = setInterval(function(){

        thisVol = thisVol + 0.005;
        that.video.volume = thisVol;
        if(thisVol > that.videoVolume - 0.01) {
            that.volFadeInEnd();
            clearInterval(fadeOut);
            that.video.volume = num;
        }

    },1);
    this.muting = true;

};

////

jThreePanoramaVideoViewer.prototype.stopToggle = function() {
    this.playing ? this.stop() : this.start();
};
jThreePanoramaVideoViewer.prototype.pauseToggle = function() {
    this.playing ? this.pause() : this.start();
};
jThreePanoramaVideoViewer.prototype.muteToggle = function(volume,volume2) {
    this.muting ? this.mute(volume) : this.unmute(volume2);
};
jThreePanoramaVideoViewer.prototype.volFadeToggle = function(volume,volume2) {
    this.muting ? this.volFadeOut(volume) : this.volFadeIn(volume2);
};


////

jThreePanoramaVideoViewer.prototype.render = function() {

    var that = this;

    this.animate = function () {

        that.animateFrame = requestAnimationFrame( that.animate );

        if( !that.vr ) {
            that.renderer.render( that.scene, that.camera );
        } else {
            that.effect.render( that.scene, that.camera );
        }

        ////

        if ( that.video.readyState === that.video.HAVE_ENOUGH_DATA) {
            that.videoTexture.needsUpdate = true;
            if(that.videoIOS) {
                that.video.currentTime = that.audio.currentTime;
                that.videoContext.drawImage(that.video, 0, 0, that.videoCanvas.width, that.videoCanvas.height);
            }
        }

        ////
        if( that.deviceOrientationControls ){

            if (that.videoSP) {
                that.controls.connect();
                that.controls.update();
            } else {
                that.controls.update();
            }

        } else {
            that.controls.update();
        }
    }

    this.animate();
}
