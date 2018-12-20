import * as types from './mutations-type';
import Store from '@/utils/store';
import { removeCookie, setCookie } from '@/utils/common';
export default {
	[types.LOGIN](state,token){
		state.isLogin = !0;
		state.token = token;
		Store.set('token',token);
		// removeCookie('sn');
		setCookie('token',token);
		// state.openid = '';
	},
	[types.LOGOUT](state){
		state.isLogin = !1;
		state.token = '';
		Store.remove('token');
		removeCookie('token');
	},
	[types.USRINFO_SAVE](state,usrInfo){
		state.usrInfo = usrInfo;
	},
	[types.SHOPID_SAVE](state,{shopId,shareSource}){
		state.shopId = shopId;
		state.sharesource = shareSource;
	},
	[types.SHOW_LOGIN](state,isShow){
		state.showLogin = isShow;
	},
	[types.CART_ADD](state,{shopId,cartItem}){
		let cartList = state.cartList;
		let shopCartList = cartList[shopId];
		if (shopCartList) {
			if (shopCartList.length === 0) {
				shopCartList.push(cartItem);
			} else {
				const idx = shopCartList.findIndex((item) => item.skuid == cartItem.skuid);
				if (idx < 0) {
					shopCartList.push(cartItem);
				} else {
					shopCartList[idx].shopnum += cartItem.shopnum;
				}
			}
		} else {
			cartList[shopId] = [cartItem];
		}
		Store.set('cartList',state.cartList);
	},
	[types.CART_SAVE](state,cartList){
		const shopId = state.shopId;
		if(cartList && cartList.length === 0){
			delete state.cartList[shopId];
		}else{
			state.cartList[shopId] = cartList;
		}
		if(Object.keys(state.cartList).length){
			Store.set('cartList',state.cartList);
		}else{
			Store.remove('cartList');
		}
		
	},
	[types.CART_DEL](state){
		const shopId = state.shopId;
		delete state.cartList[shopId];
		if(Object.keys(state.cartList).length){
			Store.set('cartList',state.cartList);
		}else{
			Store.remove('cartList');
		}
	},
	[types.ADDR_ADD](state,addr){
		state.addrList.push(addr);
	},
	[types.ADDR_DEL](state,idx){
		state.addrList.splice(idx,1);
	},
	[types.ADDR_EDIT](state,{idx,addr}){
		state.addrList.splice(idx,1,addr);
	},
	[types.ADDR_DEFAULT](state,addrId){
		state.addrList.forEach(addr => {
			if(addr.address_id == addrId){
				addr.default_flag = 1;
			}else{
				addr.default_flag = 0;
			}
		});
	},
	[types.ADDR_SAVE](state,addrList){
		if(!addrList.length){
			return;
		}
		state.addrList.splice(0);
		state.addrList.push(...addrList);
	},
	[types.ADDRIDX_CHANGE](state,idx){
		state.addrIdx = idx;
	},
	[types.APPLY_SERVICE](state, lines){
		state.applyList = lines.map((item, index, arr) => {
			return {
				id : item.id,
				spuname  : item.spuname,
				skuimage : item.skuimage,
				spec : item.spec,
				qty : item.qty,
				canmaxrefundamount : item.canmaxrefundamount 
			}
		});		
	},
	[types.AS_ADDR_SAVE](state, data){
		state.asAddr = {
			shippmentname : data.shippmentname,
			shippmenttel : data.shippmenttel,
			shippmentaddress : data.shippmentaddress
		}
	},
	[types.AS_EXP_SAVE](state, data){
		state.asExp = {
			expressno : data.expressno,
			expressid : data.expressid,
			expressname : data.expressname
		}
	},
	[types.AS_EXPITEM_SAVE](state, expnoItems){	
		state.orderExpItems = expnoItems;
	},
	[types.ORDER_CHECKED_ADDR](state, data){
		state.orderCheckedAddr = data;
	},
	[types.SHOP_CART_SAVE](state, data){
		const arr = state.shopCart;
		if(data.length){
			arr.splice(0);
			data.reduce((prev, cur, idx, arr) => {
				return prev.push(Object.assign({}, cur)), prev;
			}, arr);
		}
	}
}