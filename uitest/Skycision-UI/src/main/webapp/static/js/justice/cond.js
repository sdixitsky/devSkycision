(function() {
	if (window.location.href.endsWith('?justice=served')){
		Justice.init();
		console.log('justice served');
	}
})(Justice);