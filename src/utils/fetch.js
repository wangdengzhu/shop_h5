/**
 * 基于axios封装网络请求接口,支持GET,POST请求
 */

import Vue from 'vue';
import router from '@/router';
import axios from 'axios';
import store from '../store/';
import { ERR } from '@/utils/config';
import { captureException } from '@/utils/log';
import Indicator from '@/components/common/indicator/';
import Toast from '@/components/common/toast';
import storage from '@/utils/store';
import {getQueryParam} from '@/utils/common';

//API基础URL
axios.defaults.baseURL = API_BASE_URL || 'https://devapi.manjd.com/api/';
//请求超时时间
axios.defaults.timeout = 15000;

//设置HTTP请求的拦截器
axios.interceptors.request.use((config) => {
	const { token, shopId, sharesource, openid } = store.state;
	const sharesource1 = storage.get('shareSource');
	let isApp = navigator.userAgent.indexOf('MJDSales') > -1;
	const qs = getQueryParam(location.search);
	let appToken = qs('h5_ticket'); 
	let appToken1 = storage.get('token');
	if(isApp){
		if(appToken){
			storage.set('token',appToken);
			store.state.isLogin = !0;
			config.headers.token = appToken;
		}else if(appToken1){
			config.headers.token = appToken1;
		}
	}else{
		if (token) {
			config.headers.token = token;
		}
	}
	
	if (shopId) {
		config.headers.shopid = shopId;
	}
	if(sharesource){
		config.headers.sharesource = sharesource;
	}else if(sharesource1){
		config.headers.sharesource = sharesource1;
	}
	if(openid){
		config.headers.openid = openid;
	}
	return config;
}, (error) => {
	return Promise.reject(error);
});

//设置HTTP响应的拦截器
axios.interceptors.response.use((response) => {
	const code = response.data.code;
	if (code === ERR.UNAUTHORIZED) {
		//对特定返回码进行预处理，比如需要登录等.
		store.commit('LOGOUT');
		if(router.currentRoute.meta.requireAuth){
			Vue.prototype.loginCfg.cb = () => {
				router.go(0);
			};
			Toast('登录已失效，请重新登录!');
			store.commit('SHOW_LOGIN',!0);
		}
		return Promise.reject('401');
	}else if(code === ERR.SHOPID_INVALID){
		router.push({
			path:'404'
		});
	}
	return response;
}, (error) => {
	Indicator.close();
	Toast('网络不给力，请稍后重试!');
	if(error.config.url.indexOf('getlog')<0){
		captureException(`Ajax response error：${error.message} at ${error.config.url}`);
	}
	return Promise.reject(error);
});

//GET请求使用方法
export function fetch(url, params = {}) {
	return new Promise((resolve, reject) => {
		axios.get(url, {params})
			.then((res) => {
				resolve(res.data)
			})
			.catch((err) => {
				reject(err);
			});
	});
}

//POST请求使用方法
export function post(url, data = {}) {
	return new Promise((resolve, reject) => {
		axios.post(url, data)
			.then((res) => {
				resolve(res.data)
			})
			.catch((err) => {
				reject(err);
			});
	});
}