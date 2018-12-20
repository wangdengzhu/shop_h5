import router from '@/router';
import { fetch } from '@/utils/fetch';
import { isWXBrowser } from '@/utils/common';

const TICKET_URL = '/common/m/jsapi/ticket';

const getWXTicket = () => {
	const url = location.href;
	return fetch(TICKET_URL, {
		pageUrl: url
	});
};

export const wxShare = async (title, link, imgUrl, desc='') => {
	if (!isWXBrowser) {
		return;
	}
	const res = await getWXTicket();
	const data = res.data;
	if (!data) {
		return;
	}
	wx.config({
		debug: !1,
		appId: data.appId,
		nonceStr: data.nonceStr,
		timestamp: data.timestamp,
		signature: data.signature,
		jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone','showMenuItems','hideMenuItems']
	});
	wx.ready(function() {
		wx.onMenuShareTimeline({
			title: title,
			link: link,
			imgUrl: imgUrl,
			success: () => {
				console.log('WX share success');
			},
			cancel: () => {
				console.log('WX cancel share');
			}
		});
		wx.onMenuShareAppMessage({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			type: '',
			dataUrl: '',
			success: () => {
				console.log('Friend share success');
			},
			cancel: () => {
				console.log('Friend cancel share');
			}
		});
		wx.onMenuShareQQ({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: () => {
				console.log('QQ share success');
			},
			cancel: () => {
				console.log('QQ cancel share');
			}
		});
		wx.onMenuShareWeibo({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: () => {
				console.log('Weibo share success');
			},
			cancel: () => {
				console.log('Weibo cancel share');
			}
		});
		wx.onMenuShareQZone({
			title: title,
			link: link,
			imgUrl: imgUrl,
			desc: desc,
			success: () => {
				console.log('QZone share success');
			},
			cancel: () => {
				console.log('QZone cancel share');
			}
		});
	});
	wx.error(function(res) {
	});
};

// let isUploadImageConfigured = !1;
const config = async () => {
	const res = await getWXTicket();
	const data = res.data;
	if (!data) {
		return;
	}
	wx.config({
		debug: !1,
		appId: data.appId,
		nonceStr: data.nonceStr,
		timestamp: data.timestamp,
		signature: data.signature,
		jsApiList: ['chooseImage', 'uploadImage', 'downloadImage']
	});
};

export const wxChooseImage = () => {
	return new Promise((resolve, reject) => {
		// 防止invalid signature，每次都去请求
		// if (!isUploadImageConfigured) {
		config();
		// }
		// isUploadImageConfigured = !0;
		wx.ready(() => {
			wx.chooseImage({
				count: 1, // 默认9
				sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				success: resolve,
				fail: reject
			});
		});
	});
};

export const wxUploadImage = (localId) => {
	return new Promise((resolve, reject) => {
		wx.uploadImage({
			localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
			isShowProgressTips: 1, // 默认为1，显示进度提示
			success: resolve,
			fail: reject
		});
	});
};


export const wxDownloadImage = (serverId) => {
	return new Promise((resolve, reject) => {
		wx.downloadImage({
			serverId: serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
			isShowProgressTips: 1, // 默认为1，显示进度提示
			success: resolve,
			fail: reject
		});
	});
};

