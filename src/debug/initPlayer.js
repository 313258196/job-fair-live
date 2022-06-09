function loadTcScript(cb) {
	loadScript(cb, {
		id: "scriptid",
		url: "https://web.sdk.qcloud.com/player/tcplayerlite/release/v2.4.1/TcPlayer-2.4.1.js",
	});
}
function loadScript(cb, obj) {
	if (document.getElementById(obj.id)) {
		cb();
	} else {
		const script = document.createElement("script");
		script.async = true;
		script.src = obj.url;
		script.id = obj.id;
		script.onload = () => {
			cb();
		};
		document.body.appendChild(script);
	}
}
export function loadJSForTcPlayer(initVideoFn) {
	if (window.TcPlayer) {
		initVideoFn();
	} else {
		loadTcScript(() => {
			initVideoFn();
		});
	}
}