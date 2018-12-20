import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';
import gettes from './getters';

Vue.use(Vuex);

const state = {
	isLogin:!1,
	token:'',
	openid:'',
	sharesource:null,
	usrInfo:null,
	shopId:0,
	showLogin:!1,
	cartList:{},
	shopCart:[],
	shopCartNum: 0,
	isCartSync: !1,
	addrList:[],
	addrIdx:0,
	applyList:[],
	asAddr : {},
	asExp : {},
	orderExpItems : [],
	orderCheckedAddr : {}
};


export default new Vuex.Store({
	state,
	mutations,
	actions,
	gettes
});

