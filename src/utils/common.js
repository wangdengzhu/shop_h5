//去抖函数，防止某些操作太频繁操作
export const throttle = (method, duration, delay) => {
	var timerID = null,
		begin = +new Date,
		isFirstCall = !0;

	return function() {
		var args = arguments,
			ctx = this,
			now = +new Date;
		if (isFirstCall) {
			method.apply(ctx, args);
			begin = now;
			isFirstCall = !1;
			return;
		}
		if (timerID) {
			clearTimeout(timerID);
		}
		if (now - begin > duration) {
			method.apply(ctx, args);
			begin = now;
		} else {
			timerID = setTimeout(function() {
				method.apply(ctx, args);
			}, delay);
		}
	};
};

//检测浏览器是否开启本地存储
export const storageSupportTest = () => {
	let isSupport = !0;
	const key = 'test';
	try {
		localStorage.setItem(key, 'hello');
		localStorage.removeItem(key);
	} catch (e) {
		isSupport = !1;
	}

	if (!isSupport) {
		alert('您的浏览器处于隐私模式，请关闭哦!否则将无法加购物车哦!')
	}
};

//判断是否微信环境
export const isWXBrowser = (() => {
	const ua = window.navigator.userAgent.toLowerCase();
	return /(micromessenger|webbrowser)/g.test(ua);
})();

const cookieDomain = COOKIE_BASE_URL || 'domain=manjd.com;';

//获取cookie
export const getCookie = (key) => {
	if (!key) {
		return null;
	}
	const cookieResult = document.cookie.match(new RegExp('(?:^|\\s+|;+)' + key + '=([^;]*)'));
	return cookieResult ? cookieResult[1] : null;
};

//设置cookie
export const setCookie = (key, val, expires) => {
	let expiresTime = null;
	if(expires){
		expiresTime = new Date();
		expiresTime.setMilliseconds(expiresTime.getMilliseconds() + (expires * 864e+5));
		expiresTime = expiresTime.toUTCString();
	}
	document.cookie = [
		encodeURIComponent(key), '=', val,
		expiresTime ? '; expires=' + expiresTime : '',';',
		'path=/;',
		cookieDomain
	].join('');
};

//删除cookie
export const removeCookie = (key) => {
	if (!key) {
		return;
	}
	document.cookie = key + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; path=/; "+cookieDomain;
};

//获取查询字符串参数
export const getQueryParam = (dataStr) => {
	return function(name) {
		const res = dataStr.match(new RegExp(name + '=([^\&]*)'));
		return res ? res[1] : null;
	}
};
