;(function() {

	if (!window.performanceInfo || !window.performance || !document.addEventListener) {
		return false
	}

	var protocol = 'sw-no';
	if('serviceWorker' in navigator && window.location.protocol === 'https:') {
		protocol = 'sw-yes';
	}

	var act = 'webhdperformance';
	var server = '//ylog.hiido.com/c.gif?act='+ act +'&pageview=' + window.performanceInfo.pageview + '&protocol=' + protocol +'&';
	function param(obj){
		var p = [];
		for(var k in obj){
			p.push(k + "=" + obj[k]);
		}
		return p.join("&");
	}
	function send(data){
		var d = param(data);
		var url = server + d + '&time='+parseInt(1 * new Date() / 1000);
		var img = new Image();
		img.onload = img.onerror = img.onabort = function(){
		    img.onload = img.onerror = img.onabort = null;
		    img = null;
		};
		img.src = url;
	}

	var timeNum = 0; // 每隔200ms去查询是否存在window.performanceInfo.firstScreenTime，最多查询50次（也就是10S）;
	
	function performanceReport () {

	        if (timeNum >= 50) {
	        	return false;
	        }

	        if(!window.performanceInfo.firstScreenTime) {
	        	timeNum++;
	            setTimeout(function(){
	                performanceReport();
	            }, 200);
	            return false;
	        } 

	        var timing = performance.timing;

	        send({
				whiteScreenTime: performanceInfo.whiteScreenTime - timing.navigationStart,  // 白屏时间
				firstScreenTime: performanceInfo.firstScreenTime - timing.navigationStart, //首屏时间
				readyTime: performanceInfo.readyTime - timing.navigationStart,  // 用户可操作时间
	        	loadTime: performanceInfo.loadTime - timing.navigationStart  // 总下载时间
	        })
	}

	document.addEventListener('DOMContentLoaded',function (event) {
    	window.performanceInfo.readyTime = +new Date();
    });

    window.addEventListener('load',function (event) {
    	window.performanceInfo.loadTime = +new Date();

    	performanceReport();
    });

})()