var ua = navigator.userAgent,
	uaSP = ua.indexOf("iPhone") >= 0 || ua.indexOf("Android") >= 0 || ua.indexOf("iPad") >= 0;
	// uaSP = ua.indexOf("iPhone") >= 0 || ua.indexOf("iPad") >= 0;

if(uaSP) {
	var file = "./common/js/render_sp.js"
} else {
	var file = "./common/js/render.js"
}

(function(){
	for(var i=0; i<arguments.length; i++){
		document.write('<script type="text/javascript" src="'+arguments[i]+'"></script>');
	}
})(file);
