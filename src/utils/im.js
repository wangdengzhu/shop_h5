import { CustomService } from  '@/apis';
import store from '../store/';
import localStorage from '@/utils/store';

const ID = () => {
	let s = [];
	let hexDigits = "0123456789abcdef";
	for (let i = 0; i < 32; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01

	let uuid = s.join("");
	return uuid;
};

class IM{
	constructor(serviceType = 1, wsURL = ''){
		this.ws = null;
		this.st = serviceType;
		this.wsURL = wsURL;
		this.to = '';
		this.from = '';
		this.sessionID = '';
		this.token = '';
		this.stores = {};
		this.sendInfo = {};
		// this.getSevicer();
		this.getLastSessionId();
	}

	getSevicer(){
		const failureText = '客服分配失败';
		
		if(!/^[1234]$/.test(this.st)){
			return Promise.reject(failureText);
		}
		
		return new Promise((resolve, reject) => {
			CustomService.assignServicer(this.st, this.sessionID).then(res => {
				if(res.code === 1){
					this.init(res.data);
				}
				resolve(res);
			}).catch(err => {
				console.log(err)
				reject(failureText);
			});
		});
	}

	getLastSessionId(){
		let sessionId = localStorage.get('sessionid');
		if(sessionId){
			this.sessionID = sessionId;
		}
	}

	setSessionId(sessionId){
		if(sessionId){
			localStorage.set('sessionid', sessionId);
		}
	}

	init(params = {}){
		const state = store.state;
		this.to = params.imopenid;
		this.sessionID = params.sessionid;
		this.wsURL = params.port > 0 ? `${params.host}:${params.port}` : params.host;
		this.token = state.token;
		this.usrInfo = state.usrInfo;
		
		this.createWebsocket();
		this.setSessionId(this.sessionID);
	}

	createWebsocket(){
		this.ws = new WebSocket(this.wsURL);
		['open', 'message', 'error', 'close'].forEach(event => {
			this.ws[`on${event}`] = this[`${event}Handler`].bind(this);
		});
	}

	on(event, handler){
		let store = this.stores[event];
		if(store){
			return;
		}
		this.stores[event] = handler;
	}

	openHandler(){
		const openStore = this.stores['open'];
		openStore && openStore();
	}

	messageHandler(evt){
		const messgaeStore = this.stores['message'];
		messgaeStore && messgaeStore(JSON.parse(evt.data));
	}

	errorHandler(){
		const errorStore = this.stores['error'];
		errorStore && errorStore();
	}

	closeHandler(){
		const closeStore = this.stores['close'];
		closeStore && closeStore();
	}

	messagePack(message){
		return JSON.stringify(message);
	}

	login(){
		const message = {
			type: 'auth',
			token: this.token,
			// data: '',
			id: ID()
		};
		this.ws.send(JSON.stringify(message));
	}

	logout(){
		const message = {
			from : this.from,
			id: ID(),
			type : "Logout",
			data : {
				status : 0,
				unreadNum : 0
			},
			to : ""
		};
		this.ws.send(this.messagePack(message));
	}

	heartbeat(){
		let heartbeat = JSON.stringify({
			type: 'checklogin',
			token: this.token,
		});

		if(this.canUse()){
			this.ws.send(heartbeat);
		}
	}

	createChat(){
		let message = this.getCustomServiceEntity(1);
		this.ws.send(JSON.stringify(message));
	}

	canUse(){
		if(this.ws && this.ws.readyState === this.ws.OPEN){
			return !0;
		}

		return !1;
	}

	destory(isSendEndMsg = !0){
		if(!this.canUse()){
			return;
		}
		if(isSendEndMsg){
			let message = this.getCustomServiceEntity(2);
			this.ws.send(JSON.stringify(message));
		}
		this.ws.close();
		this.ws = null;
	}

	getCustomServiceEntity(t){
		const message = {
			type: 'customservice',
			token: this.token,
			from: this.from,
			to: this.to,
			data: {
				type: t,
				sessionId: this.sessionID,
				mobile: this.usrInfo.hidemobile,
				photo: this.usrInfo.photo
			},
			id: ID()
		};
		return message;
	}

	send(subType, data, isRealSend){
		const enitity = this.getMsgEntity(subType, data);
		const message = {
			type: 'message',
			token: this.token,
			data: enitity,
			from: this.from,
			to: this.to,
			id: ID()
		};
		
		if(this.ws && this.ws.readyState === this.ws.OPEN && isRealSend){
			this.ws.send(JSON.stringify(message));
		}
		return message;
	}

	getMsgEntity(subType, data){
		const state = store.state;
		let obj = {};
		obj.type = 'chat';
		obj.subType = subType;
		obj.senderInfo = {};
		obj.senderInfo.photo = state.usrInfo.photo;
		obj.senderInfo.userName = state.usrInfo.username;
		const body = {};
		switch(subType){
			case 'txt': 
				body.text = data;
				break;
			case 'img': 
				body.id = data.originalphoto;
				body.fileName = data.name;
				body.smallId = data.thumbnailphoto;
				body.width = data.thumbnailwidth;
				body.height = data.thumbnailheight;
				break;
			case 'eval': 
				body.id = data.id;
				body.type = 2;
				body.subType = 1;
				body.result = data.result;
				break;
			case 'goods': 
				Object.assign(body, {
					goodsid: '',
					goodspic: '',
					goodsname: '',
					goodsprice: '',
					mfronturl: '',
					afterurl: ''
				}, data);
				break;
			case 'order': 
				Object.assign(body, {
					orderno: '',
					ordertime: '',
					h5fronturl: '',
					mfronturl: '',
					afterurl: '',
					goodspic: '',
					goodsname: '',
					goodsprice: '',
					skuname: ''
				}, data);
				break;
			case 'custom': 
				Object.assign(body, {
					customno: '',
					customtime: '',
					fronturl: '',
					afterurl: '',
					goodspic: '',
					goodsname: '',
					goodsprice: '',
					skuname: ''
				}, data);
				break;
			default:;
		}
		obj.body = body;
		return obj;
	}
}


export default IM;