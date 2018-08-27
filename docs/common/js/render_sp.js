var camera, scene, renderer, group, animationId;
var controls, controlsFlag = true;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var objects = [];
var targets = { sphere: [] };

var thisIndex, thisSrc = "", sortId ="all";

var num = 400,
	cameraZ = 800,
	cameraY = 200,
	minZoom = 10,
	maxZoom = 1000;

var touchStartX, detailCtrlStart;

$(function(){

	$("body").addClass("sp");
	$("#length").html("0%");

	var imgHtml = "";
	for (var i = 0; i < src.length; i++) {
		imgHtml += '<img class="preload" src="'+src[i][0]+'">';
	}

	$(window).on("load",function(){
		$("#container").append(imgHtml);
		setTimeout(function(){
			imgLoader();
		},1000);

		$("#bg").on("click",function(){
			if(detailCtrl){
				$("#close, #detail").removeClass("hide");
				detailCtrlClose();
			}
		});
	});

	function imgLoader(){
		var imgLength = $("img").length;
		var imgCounter = 0;
		$("img").each(function(i){
			var _$img = $('<img>');
			_$img.load(function(){
				imgCounter++;
				var num = Math.floor(imgCounter/imgLength*100);
				$("#length").html(num + "%");
				$("#top").css("transform", "translate("+num+"%,0)");
				$("#bottom").css("transform", "translate(-"+num+"%,0)");
				if(imgCounter == imgLength) {

					$(".preload").remove();
					setTimeout(function(){
						init();
						animate();
						$("#load").addClass("hide");
						$("#sort,#info").removeClass("hide");
					},1000);

				}
			}).attr('src',$(this).attr('src'));
		});
	}

})


function init() {

	var fov    = 110;
	var aspect =  window.innerWidth / window.innerHeight;
	var near   = 1;
	var far    = 10000;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = cameraZ;
	camera.position.y = cameraY;

	scene = new THREE.Scene();
	group = new THREE.Group();
	var vector = new THREE.Vector3();

	for ( var i = 0, l = src.length; i < l; i ++ ) {

		var srcSplit = src[i][0].split("/");
		var thisYear = srcSplit[srcSplit.length-2];
		var element = document.createElement( 'figure' );
		element.className = 'element ' + thisYear;

		var img = document.createElement( 'img' );
		img.className = 'img ';
		img.src = src[i][0];
		element.appendChild( img );

		var object = new THREE.CSS3DObject( element );
		object.position.x = Math.random() * 100;
		object.position.y = Math.random() * 100;
		object.position.z = Math.random() * 100;

		objects.push( object );
		group.add( object );
		element.addEventListener("click", elementClick, false);

	}
	scene.add( group );

	for ( var i = 0, l = objects.length*(1/3); i < l; i ++ ) {

		var phi = Math.acos( -1 + ( 2 * i ) /l );
		var theta = Math.sqrt(l * Math.PI ) * phi;
		var object = new THREE.Object3D();

		object.position.x = num * Math.cos( theta ) * Math.sin( phi );
		object.position.y = num * Math.sin( theta ) * Math.sin( phi );
		object.position.z = num * Math.cos( phi );

		vector.copy( object.position ).multiplyScalar( 2 );
		object.lookAt( vector );
		targets.sphere.push( object );

	}

	for ( var i = 0, l = objects.length*(2/3); i < l; i ++ ) {

		var phi = Math.acos( -1 + ( 2 * i ) /l );
		var theta = Math.sqrt(l * Math.PI ) * phi;
		var object = new THREE.Object3D();

		object.position.x = num* 1.3 * Math.cos( theta ) * Math.sin( phi );
		object.position.y = num* 1.3 * Math.sin( theta ) * Math.sin( phi );
		object.position.z = num* 1.3 * Math.cos( phi );

		vector.copy( object.position ).multiplyScalar( 2 );

		object.lookAt( vector );

		targets.sphere.push( object );

	}


	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	//

	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.6;
	controls.minDistance = minZoom;
	controls.maxDistance = maxZoom;
	controls.noPan = true;
	// controls.noRotate = false;
	// controls.noZoom = false;
	controls.addEventListener( 'change', render );

	startTransform( targets.sphere, 3000 );

	//

	window.addEventListener( 'resize', onWindowResize, false );
	document.getElementById('close').addEventListener( 'click', closeClick, false );
	document.getElementById('bg').addEventListener( 'touchstart', touchstart, false );
	document.getElementById('bg').addEventListener( 'touchend', touchend, false );

	$("#sort a").on("click",sortClick);

}


function startTransform( targets, duration ) {
    TWEEN.removeAll();

	new TWEEN.Tween( group.rotation )
	.to( { y: 10+(5*Math.random()), z: 1*Math.random() }, Math.random() * duration + duration )
	.easing( TWEEN.Easing.Quartic.InOut ).start();

	for ( var i = 0; i < objects.length; i ++ ) {

		var object = objects[ i ];
		var target = targets[ i ];
		var position = { x: target.position.x, y: target.position.y, z: target.position.z }
		var rotation = { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }
		new TWEEN.Tween( object.position )
			.to(position, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Quartic.InOut )
			.start();
		new TWEEN.Tween( object.rotation )
			.to( rotation, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Quartic.InOut )
			.start();
	}
	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();
}


function elementClick() {
	cancelAnimationFrame(animationId);

	controlsFlag = false;
	var time = 600;

	thisIndex = $(this).index(".element");
	thisSrc = $(this).find("img").attr("src");

	var thisStyle = $(this).attr("style"),
		thisParentStyle = $(this).parent().attr("style"),
		thisParentParentStyle = $(this).parent().parent().attr("style");

	var html =  '<div id="copyImg" style="'+thisParentParentStyle+'">';
		html += '<div id="copyImgInner" style="'+thisParentStyle+'">';
		html += '<figure class="element active" style="'+thisStyle+'">';
		html += '<img class="img" src="'+thisSrc+'">';
		html += '</figure>';
		html += '</div>';
		html += '</div>';

	$("#container").addClass("transition");
	$("#container").after(html);
	$("#sort,#info").addClass("hide");

	setTimeout(function(){
		$("#container").addClass("opacity");
		$("#copyImg").addClass("active");
	},1);
	setTimeout(function(){
		$("#bg").addClass("active");
	},time);
	setTimeout(function(){
		$("#bg").addClass("show").css("background-image", "url("+ thisSrc +")");
		$("#close,#detail,#prev,#next").addClass("active").removeClass("hide");
		$("#copyImg").remove();
		photoShow();
		detailCtrlClose();
	},time*2);

}

function detailCtrlClose() {
	detailCtrl = false;
	clearInterval(detailCtrlStart);
	detailCtrlStart = setTimeout(function(){
		$("#close, #detail").addClass("hide");
		detailCtrl = true;
	},3000);
}

function closeClick() {
	animationId = requestAnimationFrame(animate);
	clearInterval(detailCtrlStart);

	controlsFlag = true;

	var time = 500;
	var thisIndex = $(this).index(".element");

	$("#bg").removeClass("show");
	$("#close,#detail,#prev,#next").removeClass("active");

	setTimeout(function(){
		$("#bg").removeAttr("style").removeClass("active");
		$("#container").removeClass("opacity").removeClass("transition");
	},time);
	setTimeout(function(){
		$("#sort,#info").removeClass("hide");
	},time*2);

}


function sortClick() {

	$("#sort a").removeClass("active");
	$(".element").addClass("transition");
	$(this).addClass("active");
	sortId = $(this).attr("id");

	if(sortId != "all") {
		$(".element").not("."+sortId).addClass("hide");
		$(".element."+sortId).removeClass("hide");
	} else {
		$(".element").removeClass("hide");
	}

}

function touchstart(e){
	var touchObj = e.changedTouches[0] ;
	touchStartX = touchObj.pageX;
}
function touchend(e){
	var touchObj = e.changedTouches[0] ;
	touchEndX = touchObj.pageX;

	var diff = touchEndX - touchStartX;
	if( Math.abs( diff ) > 50 ){
		if ( diff < 0 ){
			nextClick();
		} else {
			prevClick();
		}
	}
}


function prevClick() {

	if(thisIndex == 0){
		thisIndex = src.length - 1;
	} else {
		thisIndex = thisIndex - 1;
	}
	thisSrc = src[thisIndex][0];
	photoShow();
}

function nextClick() {
	if(thisIndex == src.length - 1){
		thisIndex = 0;
	} else {
		thisIndex = thisIndex + 1;
	}
	thisSrc = src[thisIndex][0];
	photoShow();

}

function photoShow() {
	$("#bg").removeClass("show");
	$("#close, #detail").addClass("hide");
	setTimeout(function(){
		$("#bg").addClass("show").css("background-image", "url("+ thisSrc +")");
		$("#close, #detail").removeClass("hide");
		photoInfo();
		detailCtrlClose();
	},500);
}

function photoInfo(){

	var srcSplit = thisSrc.split("/");
	var thisYear = srcSplit[srcSplit.length-2],
		thisMonth = srcSplit[srcSplit.length-1].split("_")[0];
	$("#detail").html(thisYear + "." + thisMonth + "<span style='margin-left: 20px;'>" + src[thisIndex][1] +"</span>");

}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function animate() {

	// requestAnimationFrame( animate );
	animationId = requestAnimationFrame(animate);

	TWEEN.update();

	if(controlsFlag) {
		controls.update();
	}

}

function render() {
	renderer.render( scene, camera );
}
