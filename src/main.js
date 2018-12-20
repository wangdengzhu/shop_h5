/**
 * 逻辑入口文件，主要做全局初始化，全局模块引入等
 */

import Vue from 'vue';
import store from './store';
import router from './router';
import FastClick from 'fastclick';
import { ERR, IMAGE_DEFAULT } from './utils/config';
import { storageSupportTest } from './utils/common';
import { wxShare } from './utils/wxShare';
import LoginPlugin from './plugins/Login';
import VueLazyload from 'vue-lazyload';
import { captureException } from './utils/log';
import 'es6-promise/auto';
import './utils/rem';
import './utils/statistic';
import App from '@/App';

import "babel-polyfill";

document.addEventListener('DOMContentLoaded', () => {
	FastClick.attach(document.body);
}, !1);

Vue.prototype.$ERR = ERR;
Vue.prototype.captureException = captureException;
Vue.prototype.wxShare = wxShare;
Vue.prototype.IMAGE_DEFAULT = IMAGE_DEFAULT;
Vue.prototype.redirect = (path,routeObj)=>{
	const shopId = store.state.shopId;
	const query = Object.assign({},routeObj,{shopId});
	router.push({
		path,
		query
	});
};
storageSupportTest();

Vue.use(LoginPlugin);

Vue.use(VueLazyload, {
  preLoad: 1.3,
  attempt: 1
});

window.PointerEvent = undefined;

new Vue({
	router,
	store,
	template: '<App/>',
	components: {
		App
	}
}).$mount('#app');