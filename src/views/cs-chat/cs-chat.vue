<template>
	<div class="chat-wrapper">
		<div class="chat-container"  @click="hideFooter">
			<div class="chat-box tb1px" @touchmove.prevent v-if="boxInfo">
				<div class="cb__hd" v-if="boxInfo.bizno">
					<span class="num">{{ serviceType == 3 ?'订单号':'售后号' }}：{{ boxInfo.bizno }}</span>
					<span class="time">{{ boxInfo.biztime.slice(0, -4) }}</span>
				</div>
				<div class="cb__cnt">
					<div class="cb__pic">
						<img :src="boxInfo.goodspic">
					</div>
					<div class="cb__info">
						<p class="cb__tit">{{ boxInfo.goodsname }}</p>
						<p class="cb__price">¥ {{ boxInfo.goodsprice.toFixed(2) }}</p>
					</div>
				</div>
				<div @click="sendLink" class="cb__btn tb1px" :class="{active: isIMCreatedChat }">发送链接</div>
			</div>
			<div class="chat-list " ref="chatList" :class="{ history: historyMessage.length > 0 }">
				<div v-if="!isLoadOver" @click="loadMoreMessage" class="message-loadmore">
					<i v-if="isLoadingMore" class="icon-msg-loading"></i>
					<span v-else>加载{{ historyMessage.length > 0 ? '更多' : '历史' }}消息</span>
				</div>
				<div class="message-list " v-if="historyMessage.length">
					<ul class="ml__box">
						<li v-for="(message, idx) in historyMessage" :class="[ message.from == from ? 'self' : 'another']"  class="ml__item">
							<div class="ml__time" v-if="isShowMsgTime(message, idx, historyMessage)">
								<span class="ml__time-txt">{{formatMsgTime(message)}}</span>
							</div>
							<div class="ml__cnt">
								<img v-if="message.data.subType==msgType.TEXT || message.data.subType==msgType.IMG" :src="message.data.senderInfo&&message.data.senderInfo.photo || imServerAvatar" class="ml__avatar">
								<span v-if="message.data.subType==msgType.TEXT" class="ml__txt" v-html="emotionParse(message.data.body.text)"></span>
								<div v-else-if="message.data.subType==msgType.IMG" class="ml__pic" @click="showPreview(message.data.body)">
									<img :src="message.data.body.smallId">
								</div>
								<div v-else-if="message.data.subType==msgType.GOODS || message.data.subType==msgType.ORDER || message.data.subType==msgType.CUSTOM" class="ml__cb box" >
									<div class="cb__hd" v-if="message.data.subType==msgType.ORDER || message.data.subType==msgType.CUSTOM">
										<span class="num">{{ message.data.subType == msgType.ORDER ? '订单号':'售后号' }}：{{ message.data.body.customno || message.data.body.orderno }}</span>
										<span class="time">{{ (message.data.body.customtime || message.data.body.ordertime).slice(0, -4) }}</span>
									</div>
									<div class="cb__cnt">
										<div class="cb__pic">
											<img :src="message.data.body.goodspic">
										</div>
										<div class="cb__info">
											<p class="cb__tit">{{ message.data.body.goodsname }}</p>
											<p class="cb__price">¥ {{ message.data.body.goodsprice.toFixed(2) }}</p>
										</div>
									</div>
								</div>
								<div v-else-if="message.data.subType==msgType.COMMENT && message.data.body.result" class="ml__comment" >
									<div  class="mlc__item">
										<i :class="{active: message.data.body.result == 1}" class="comment-icon laugh"></i>
										<span class="comment-txt">很满意</span>
									</div>
									<div  class="mlc__item">
										<i :class="{active: message.data.body.result == 2}" class="comment-icon smile"></i>
										<span class="comment-txt">满意</span>
									</div>
									<div  class="mlc__item">
										<i :class="{active: message.data.body.result == 3}" class="comment-icon normal"></i>
										<span class="comment-txt">一般</span>
									</div>
									<div  class="mlc__item">
										<i :class="{active: message.data.body.result == 4}" class="comment-icon cry"></i>
										<span class="comment-txt">不满意</span>
									</div>
								</div>
							</div>
						</li>
					</ul>
				</div>
				<template v-if="workStatus == 103">
					<!-- <div class="prompt-message">亲，客服工作时间为 {{ csWorkTime }}</div>
					<div class="prompt-message">如有问题请前往帮助中心</div> -->
					<div class="prompt-message" v-html="csWorkTimeTips"></div>
				</template>
				<template v-else>
					<div class="prompt-message">亲，正在为您转接人工客服请稍等。</div>
					<div v-if="isIMCreatedChat" class="prompt-message">已经接入人工客服</div>
					<div v-else-if="workStatus == 102" class="prompt-message">客服正忙，请稍后再试</div>
					<div v-else-if="workStatus == 110" class="prompt-message">服务器正在开小差，请稍后再试</div>
				</template>
				<div class="message-list">
					<ul class="ml__box">
						<li v-for="(message, idx) in messageList" :class="[ message.from == from ? 'self' : 'another']"  class="ml__item">
							<template v-if="message.api.toLowerCase() == 'message'">
								<div class="ml__time" v-if="isShowMsgTime(message, idx, messageList)">
									<span class="ml__time-txt">{{formatMsgTime(message)}}</span>
								</div>
								<div class="ml__cnt">
									<div class="ml__cnt-box">
										<img v-if="message.data.subType==msgType.TEXT || message.data.subType==msgType.IMG" :src="message.data.senderInfo&&message.data.senderInfo.photo || imServerAvatar" class="ml__avatar">
										<span v-if="message.data.subType==msgType.TEXT" class="ml__txt" v-html="emotionParse(message.data.body.text)"></span>
										<div v-else-if="message.data.subType==msgType.IMG" class="ml__pic" @click="showPreview(message.data.body)">
											<img :src="message.data.body.smallId">
											<i v-if="message.data.isLoading && !message.data.isFail" class="icon-msg-loading"></i>
										</div>
										<div v-else-if="message.data.subType==msgType.GOODS || message.data.subType==msgType.ORDER || message.data.subType==msgType.CUSTOM" class="ml__cb box" :class="{fail: message.data.isFail}">
											<div class="cb__hd" v-if="message.data.subType==msgType.ORDER || message.data.subType==msgType.CUSTOM">
												<span class="num">{{ message.data.subType == msgType.ORDER ? '订单号':'售后号' }}：{{ message.data.body.customno || message.data.body.orderno }}</span>
												<span class="time">{{ (message.data.body.customtime || message.data.body.ordertime).slice(0, -4) }}</span>
											</div>
											<div class="cb__cnt">
												<div class="cb__pic">
													<img :src="message.data.body.goodspic">
												</div>
												<div class="cb__info">
													<p class="cb__tit">{{ message.data.body.goodsname }}</p>
													<p class="cb__price">¥ {{ message.data.body.goodsprice.toFixed(2) }}</p>
												</div>
											</div>
										</div>
										<div v-else-if="message.data.subType==msgType.COMMENT" class="ml__comment" >
											<div @click="commentChat(message, 1)" class="mlc__item">
												<i :class="{active: message.commentIdx == 1}" class="comment-icon laugh"></i>
												<span class="comment-txt">很满意</span>
											</div>
											<div @click="commentChat(message, 2)" class="mlc__item">
												<i :class="{active: message.commentIdx == 2}" class="comment-icon smile"></i>
												<span class="comment-txt">满意</span>
											</div>
											<div @click="commentChat(message, 3)" class="mlc__item">
												<i :class="{active: message.commentIdx == 3}" class="comment-icon normal"></i>
												<span class="comment-txt">一般</span>
											</div>
											<div @click="commentChat(message, 4)" class="mlc__item">
												<i :class="{active: message.commentIdx == 4}" class="comment-icon cry"></i>
												<span class="comment-txt">不满意</span>
											</div>
										</div>
										<div @click="reSendMsg(message)" v-if="message.data.isFail" class="icon-msg-fail"></div>
									</div>
								</div>
							</template>
							<template v-else>
								<div class="ml__cnt">
									<span  class="ml__sessionend">会话已结束</span>
								</div>
							</template>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="chat-footer">
			<div class="cf__main" >
				<div class="cf__inp">
					<input ref="messageInp" type="text"  maxlength="500" v-model="messageTxt" @focus="focusHandler" @blur="blurHandler" placeholder="请输入您要咨询的内容"></textarea>
				</div>
				<div class="cf__btns">
					<i @click="showFooter(1)" class="btn btn-smile" :class="{active: showType == 1}"></i>
					<span @click="sendTextMsg" v-if="messageTxt.length" class="send-btn">发送</span>
					<i v-else @click="showFooter(2)" class="btn btn-plus" :class="{active: showType == 2}"></i>
				</div>
			</div>
			<div class="cf__bd tb1px" v-show="showType > 0">
				<div class="cf__emotion" v-show="showType == 1">
					<div class="swiper-container">
						<div class="swiper-wrapper">
							<div class="swiper-slide" v-for="i in emotionPageNum">
								<ul class="emotion__box"> 
									<li @click="emotionHandler(item)" v-for="item in emotion.slice((i-1)*23, (i-1)*23 + 23)" class="emotion__item">
										<img :src="emotionBaseURL+item.icon" alt="">
									</li>
									<li @touchstart="emotionStart" @touchend="emotionEnd" @click="emotionDel" class="emotion__item del">
										<!-- <img src="../../assets/images/chat/icon-emotion-del.png"> -->
										<span class="img"></span>
									</li>
								</ul>
							</div>
						</div>
						<div class="swiper-pagination"></div>
					</div>
					
				</div>
				<div class="cf__menu" v-show="showType == 2">
					<ul class="menu__box">
						<li class="menu__item album">
							<i class="icon"></i>
							<span class="txt">相册</span>
							<span @click="uploadBySDK" class="img-file" v-if="isMiniprogram"></span>
							<input v-else @change="imgChangeHandler" class="img-file" type="file" accept="image/*">
						</li>
						<li class="menu__item order" @click='showOrderPopup'>
							<i class="icon"></i>
							<span class="txt">订单</span>
						</li>
						<li class="menu__item call" @click='makeCall'>
							<i class="icon"></i>
							<span class="txt">客服电话</span>
						</li>
					</ul>
				</div>
			</div>
			
		</div>
		<div class="preview" v-show="isShow" @click="hidePreview">
			<div class="preview__bg" style="color:white"></div>
			<div class="preview__pic" >
				<img ref="preview" src="" alt="">
				<div v-show="preImgIsLoading" class="preview__loading"></div>
			</div>
		</div>
		<ChatOrder :show="isShowOrder" @close="closeOrderPopup" @change="changeHandler"></ChatOrder>
	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	import { CustomService, User } from  '@/apis';
	import { isWXBrowser } from '@/utils/common';
	import { wxChooseImage, wxUploadImage, wxDownloadImage } from '@/utils/wxShare';
	import IM from '@/utils/IM';
	import Pinch from '@/plugins/pinch';
	import { emotion } from '@/utils/face';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';
	import ChatOrder from '@/components/ChatOrder';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator/';
	import CnfrmBox from '@/components/common/confirm-box';
	import EXIF from 'exif-js';
	import im_service_avatar from '../../assets/images/chat/im-service-avatar.png';
	import { compressImg, dataURLtoBlob } from '@/utils/imageManage'
	const MAX_IMG_SIZE = 10 * 1024 * 1024;   // 10MB
	const NO_COMPRESS_SIZE = 0.2 * 1024 * 1024   // 200KB， 如果小于200KB，直接上传不压缩
	export default {
		data(){
			return {
				imServerAvatar: im_service_avatar,
				workStatus: 1,
				csWorkTime: '',
				csWorkTimeTips: '',
				im: null,
				isReady: !1,
				isWorkTime: !0,
				serviceType: -1,
				servicertel: '',
				messageTxt: '',
				messageList: [],
				messageIdArr: [],
				from: '',
				sessionIsEnd: !1,
				
				isShow: !1,
				preImgIsLoading: !0,
				isShowOrder: !1,
				
				showType: -1,
				emotion: emotion,
				emotionPageNum: Math.ceil(emotion.length/23),
				emotionBaseURL: IMAGE_BASE_URL,
				emotionSiper: null,
				emotionMap: {},

				commentIdx: -1,

				boxInfo: null,
				imCfg: null,

				historyMessage: [],
				historyPage: 1,
				lastMessageTime: null,
				isLoadingMore: !1,
				isLoadOver: !1,
				count: 20,

				msgType: {
					TEXT: 'txt',
					IMG: 'img',
					COMMENT: 'eval',
					GOODS: 'goods',
					ORDER: 'order',
					CUSTOM: 'custom'
				},

				isIMlogined: !1,
				isIMCreatedChat: !1,

				checkLoginTimer: null,
				isConnectedTimer: null,

				isMiniprogram:!1
			}
		},
		methods:{
			...mapMutations([ 'USRINFO_SAVE']),
			showPreview(imgInfo){
				this.isShow = !0;
				let { smallId, id } = imgInfo;
				this.$refs.preview.src = smallId;
				this.preImgIsLoading = !0;
				const image = new Image();
				image.onload = () => {
					this.preImgIsLoading = !1;
					this.$refs.preview.src = id;
				};

				image.src = id;
			},

			hidePreview(){
				this.$refs.preview.style.transform = 'scale3d(1, 1, 1)';
				this.isShow = !1;
			},
			
			makeCall() {
				window.location.href =  `tel:${this.servicertel || '400-8988-111'}`;
			},

			showOrderPopup(){
				this.isShowOrder = !0;
			},

			closeOrderPopup(){
				this.isShowOrder = !1;
			},

			changeHandler(data){
				let typeObj = {
					'1': this.msgType.ORDER,
					'2': this.msgType.CUSTOM,
					'3': this.msgType.GOODS
				};
				let t = data.type;
				let msgType = typeObj[t];
				let bodyData = null;
				
				if(t == 1){
					bodyData = {
						orderno: data.bizno,
						ordertime: data.biztime,
						h5fronturl: data.h5fronturl,
						mfronturl: data.fronturl,
						skuname: data.skuname
					};
				}else if(t == 2){
					bodyData = {
						customno: data.bizno,
						customtime: data.biztime,
						fronturl: data.fronturl,
						skuname: data.skuname
					}
				}else if(t == 3){
					bodyData = {
						goodsid: data.goodsid,
						mfronturl: data.fronturl,
					}
				}

				if(!bodyData){
					return;
				}

				bodyData.goodspic = data.goodspic;
				bodyData.goodsname = data.goodsname;
				bodyData.goodsprice = data.goodsprice;
				bodyData.afterurl = data.afterurl;

				this.sendMsg(msgType, bodyData);
				this.isShowOrder = !1;
			},

			reSendMsg(message){
				CnfrmBox.open({
					message: '是否重发',
					cancelBtnTxt: '取消',
					cnfrmBtnTxt: '确定'
				}).then(()=>{
					if(!this.isIMCreatedChat || this.sessionIsEnd || !this.im.canUse()){
						// this.saveMsg(message);
						return;
					}
					const newMessage = JSON.stringify(message);
					const newMessageObj = JSON.parse(newMessage);
					newMessageObj.time = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, -1);
					// newMessageObj.data.isFail = !1;
					this.im.ws.send(newMessage);
					// this.saveMsg(newMessageObj);
					message.data.isFail = !1;
				}, ()=>{});
			},

			sendLink(){
				if(!this.isIMCreatedChat){
					return;
				}
				let t = ({
					'2': 3,
					'3': 1,
					'4': 2
				})[this.serviceType];
				this.changeHandler(Object.assign({
					type: t
				}, this.boxInfo));
				this.boxInfo = null;
			},

			commentChat(message, result){
				const id = message.data.body.id;
				
				if(message.commentIdx > -1){
					return;
				}
				this.sendMsg(this.msgType.COMMENT, {
					id,
					result
				});
				message.commentIdx = result;
				CustomService.comment(id, result);
			},

			showFooter(t){
				// if(!this.isIMCreatedChat){
				// 	return;
				// }
				if(t == this.showType){
					this.hideFooter();
					return;
				}
				this.showType = t;
				this.adjustChatUIScroll();
				if(t == 1 && !this.emotionSiper){
					this.initEmotion();
				}
			},

			hideFooter(){
				this.showType = -1;
			},

			focusHandler(event){
				let $this = event.target;
				this.showType = -1;
				this.adjustChatUIScroll();
				setTimeout(() => {
					this.scrollToView($this)
					this.interval = setInterval(() => {
						this.scrollToView($this)
					}, 500);
				}, 200)
			},

			blurHandler(event){
				let $this = event.target;
				this.interval && clearInterval(this.interval);
			},

			scrollToView(inp){
				inp.scrollIntoView(true);
				inp.scrollIntoViewIfNeeded();
			},

			uploadBySDK(){
				let localId = '';
				let message = null;
				wxChooseImage().then((res) => {
					localId = res.localIds[0];
					return wxUploadImage(localId);
				}).then(res => {
					const body = {
						originalphoto: localId,
						thumbnailphoto: localId,
						thumbnailwidth: 0,
						thumbnailheight: 0,
						name: ''
					};

					message = this.sendMsg('img', body, !1);
					this.hideFooter();
					return CustomService.downloadImageFromWX(res.serverId);
				}).then(res => {
					message.data.isLoading = !1;
					this.im.send('img', res.data, !0);
				}).catch(err => {
					alert(err.errMsg);
				});
			},

			imgChangeHandler(event){
				const file = event.target.files[0];
				if(!file){
					return;
				}

				const type = file.type.toLowerCase();
				if(!/gif|jpg|jpeg|png/.test(type)){
					Toast('请选择图片或不支持该格式图片');
					return;
				}

				if(file.size > MAX_IMG_SIZE){
					Toast('上传图片不能大于10M');
					return;
				}

				this.uploadImage(file);

			},

			async uploadImage(image){
				let self = this;
				let { width, height } = await this.getImageDimension(image);
				
				if(image.size <= NO_COMPRESS_SIZE){   //如果图片小于规定的大小，直接提交file文件流
					this.startUploadImage(image, width, height);
					return;
				}
				
				let orientation = await this.getImageOrientation(image);
				let reader = new FileReader();
				let quality = 0.3;								
				reader.onload = function(e){  
					let img = new Image();					
					let result = e.target.result;  
					img.addEventListener('load', callback,  false);
					img.src = result;    
					function callback(e){                
						let newData = compressImg(img, {orientation, quality});    //压图
						let blob = dataURLtoBlob(newData);				  //转为Blob对象
						img = null;						
						self.startUploadImage(blob, width, height, image.name);
					}
				}
				reader.readAsDataURL(image);	
				
			},

			startUploadImage(image, w , h ,name){
				const formData = new FormData();
				let imgName = image.name || name;

				if(name){
					formData.append('imagefile', image, name);
				}else{
					formData.append('imagefile', image);
				}

				let imgaeURL = window.URL.createObjectURL(image);

				const body = {
					originalphoto: imgaeURL,
					thumbnailphoto: imgaeURL,
					thumbnailwidth: w,
					thumbnailheight: h,
					name: imgName
				};

				const message = this.sendMsg('img', body, !1);
				
				CustomService.uploadImage(w, h, formData).then(res => {
					message.data.isLoading = !1;
					this.im.send('img', res.data, !0);
				}).catch(err => {
					console.log(err);
				});

				this.hideFooter();
			},

			getImageOrientation(image){
				return new Promise((resolve, reject) => {
					EXIF.getData(image, function() {
						const orientation = EXIF.getTag(this, 'Orientation');
						resolve(orientation);
					});
				});
			},

			getImageDimension(imageFile){
				return new Promise((resolve, reject) => {
					let image = new Image();
					image.src = window.URL.createObjectURL(imageFile);
					const success = () => {
						resolve({
							width: image.naturalWidth,
							height: image.naturalHeight
						})
					};
					if(image.complete){
						success();
					}else{
						image.onload = () => {
							success();
						};
						image.onerror = () => {
							reject('error');
						}
					}
				});
			},

			emotionParse(txt){
				return txt.replace(/\/[^\/\s]{1,3}/g, (s) => {
					s = s.trim();
					let e = '';
					let str = '';
					for (let i = 2, len = s.length; i <= len; i++) {
						let eimg = this.emotionMap[s.slice(0, i)];
						if(eimg){
							e = `<img src=${eimg}>`;
							str = s.slice(i, len);
							break;
						}
					}
					return e ? e + str : s;
					// return this.emotionMap[s] ? `<img src=${this.emotionMap[s]}>` : s;
				});
			},

			emotionHandler(emotion){
				this.messageTxt = this.messageTxt + emotion.value + ' ';
			},

			emotionDel(){
				if(!this.messageTxt){
					return;
				}
				const text = this.messageTxt;
				const re = /\/[^\/]{1,3}$/;
				const matches = text.match(re);
				if(matches && this.emotionMap[matches[0].trim()]){
					this.messageTxt = this.messageTxt.replace(matches[0], '');
					return;
				}
				this.messageTxt =  this.messageTxt.slice(0, -1);
			},

			emotionStart(){
				if(this.startTimer){
					clearTimeout(this.startTimer);
				}
				this.isEmotionDelStart = !0;
				this.startTimer = setTimeout(()=>{
					if(!this.isEmotionDelStart){
						return;
					}
					this.emotionDel();
					this.intervalTimer = setInterval(()=>{
						this.emotionDel();
					}, 200);
				}, 900);
			},

			emotionEnd(){
				this.isEmotionDelStart = !1;
				if(this.startTimer){
					clearTimeout(this.startTimer);
				}
				if(this.intervalTimer){
					clearInterval(this.intervalTimer);
				}
			},

			initEmotion(){
				this.emotionSiper = new Swiper('.swiper-container', {
					pagination: {
						el: '.swiper-pagination'
					},
					observer: !0,
					observeParents: !0
				});
			},

			createEmotionMap(){
				this.emotion.forEach(e => {
					this.emotionMap[e.value] = this.emotionBaseURL + e.url;
				});
			},

			connectIMServer(){
				this.im = new IM(this.serviceType);
				this.im.getSevicer().then(res => {
					let code = res.code;
					if(code == this.$ERR.NORMAL){
						this.servicertel = res.data.servicertel;
						this.initIMListener();
						this.dealAutoDisconnect();
					}else if(code == 103){
						this.workStatus = 103;
						this.isWorkTime = !1;
						this.csWorkTime = res.data.worktime || res.message.match(/\d.*\d/)[0] || '9:00-22:00';
						this.csWorkTimeTips = res.message;
					}else if(code == 102){
						this.workStatus = 102;
					}else if(code == 104){
						this.showIMBoom(res.data);
					}else{
						this.workStatus = 110;
					}
				}).catch(err => {
					console.log(err);
				});
				
			},

			showIMBoom(data){
				data.servicertel = data.servicertel || '400-8988-111';
				let cnfrmTxt = `系统正在升级，有疑问请联系客服，${data.servicertel}`;
				CnfrmBox.open({
					message: cnfrmTxt,
					cancelBtnTxt: '取消',
					cnfrmBtnTxt: '拨打'
				}).then(()=>{
					window.location.href = `tel:${data.servicertel}`
				}, ()=>{});
				
			},

			isShowMsgTime(message, idx, messageList){
				if (message.data.subType == this.msgType.EVAL && !message.data.body.result) {
					return !1;
				}

				if (idx == 0) {
					return !0;
				}

				const theTime = this.getMsgTimestamp(message.time);
				const lastTime = this.getMsgTimestamp(messageList[idx - 1].time);
				const gap = 5 * 60 * 1000;

				if (theTime - lastTime >= gap) {
					return !0
				}

				return !1;
			},

			getMsgTimestamp(time){
				return new Date(time.slice(0, -4).replace(/-/g, '/').replace('T', ' ')).getTime();
			},

			paddingZero(num){
				return num > 9 ? num : '0' + num;
			},

			formatMsgTime(message){
				let time = this.getMsgTimestamp(message.time);
				let today = new Date().getDate();
				let msgTime = new Date(time);
				let msgday = msgTime.getDate();

				let timeStr = '';

				let hh = this.paddingZero(msgTime.getHours());
				let mm = this.paddingZero(msgTime.getMinutes());

				if(msgday < today){
					let m = this.paddingZero(msgTime.getMonth()+1);
					let d = this.paddingZero(msgTime.getDate());
					timeStr = `${m}-${d} ${hh}:${mm}`;
				}else{
					timeStr = `${hh}:${mm}`;
				}

				return timeStr;
			},

			adjustChatUIScroll(){
				const scrollContainer = this.$refs.chatList;
				setTimeout(() => {
					if(scrollContainer.scrollHeight > scrollContainer.clientHeight){
						scrollContainer.scrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight + 100;
					}
				}, 100);
			},

			sendTextMsg(){
				// if(!this.isIMCreatedChat){
				// 	return;
				// }

				if(!this.messageTxt){
					return;
				}
				this.sendMsg(this.msgType.TEXT, this.messageTxt);
				this.messageTxt = '';
				this.hideFooter();
			},

			initIMListener(){
				this.im.on('open', this.openHandler.bind(this));
				this.im.on('message', this.messageHandler.bind(this));
				this.im.on('close', this.closeHandler.bind(this));
				this.im.on('error', this.errorHandler.bind(this));
			},

			sendMsg(type, data, isRealSend = !0) {
				let isFail = !1;
				if(!this.isIMCreatedChat || this.sessionIsEnd || !this.im.canUse()){
					isRealSend = !1;
					isFail = !0;
				}
				const message = this.im.send(type, data, isRealSend);
				if(type == this.msgType.COMMENT){
					return;
				}
				if(type == this.msgType.IMG){
					message.data.isLoading = !0;
				}
				message.data.isFail = isFail;
				this.saveMsg(message);
				return message;
			},

			saveMsg(message){
				this.messageList.push(Object.assign({
					time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, -1),
					api: 'message'
				}, message));
				this.adjustChatUIScroll();
			},

			openHandler(){
				console.log('opened...'+new Date());
				this.im.login();
			},

			messageHandler(data){
				if(data.code != 0){
					return;
				}
				const api = data.api.toLowerCase();
				if(api == 'auth'){
					if(this.isIMlogined){
						return;
					}
					this.isIMlogined = !0;
					this.from = data.userid;
					this.im.from = data.userid;
					this.im.createChat();
					this.checkIMIsCreated();
				}else if(api == 'customservice'){
					if(data.type == 2){
						if(this.im.sessionID != data.sessionid){
							return;
						}
						this.sessionIsEnd = !0;
						data.time = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, -1);
						this.receivedTrueMessage(data);
						this.im.destory(!1);
						return;
					}
					if(this.isIMCreatedChat){
						return;
					}
					if(data.type == 3){
						if(this.sessionIsEnd){
							return;
						}
						console.log('与IM连接成功,结束检测...');
						console.log('发起客户对话成功');
						if(this.isConnectedTimer){
							clearTimeout(this.isConnectedTimer);
						}
						this.isIMCreatedChat = !0;
						this.adjustChatUIScroll();
						this.startCheckLogin();
					}
					
				}else if(api == 'message'){
					if(data.from == this.from || !data.data){
						return;
					}
					if(data.from != this.im.to || data.reply == 1){
						return;
					}
					if(this.sessionIsEnd || !this.isIMCreatedChat){
						return;
					}

					this.receivedTrueMessage(data);
				}else if(api == 'checklogin'){
					if(!data.islogin){
						if(this.checkLoginTimer){
							clearInterval(this.checkLoginTimer);
						}
						this.sessionIsEnd = !0;
						this.im.destory();
						if(data.state == 2){
							CnfrmBox.open({
								message: data.text,
								showCancelBtn: !1,
								cnfrmBtnTxt: '确定'
							}).then(()=>{
								this.$router.go(-1);
							}, ()=>{});
							return;
						}
						Toast('登录已失效，请重新登录!');
						this.$store.commit('LOGOUT');
						this.$store.commit('SHOW_LOGIN',!0);
					}
				}
			},

			async receivedTrueMessage(message){
				if(this.messageIdArr.includes(message.id)){
					return;
				}
				const data = message.data;
				if(data && data.senderInfo && !data.senderInfo.photo){
					data.senderInfo.photo = im_service_avatar;
				}

				if(data && data.subType == 'img'){
					await this.dealIMGMessage(data.body);
				}

				this.messageIdArr.push(message.id);
				this.messageList.push(message);
				this.adjustChatUIScroll();
			},

			checkIMIsCreated(){
				if(this.isIMCreatedChat){
					return;
				}
				console.log('开始检测与IM连接是否成功...')
				if(this.isConnectedTimer){
					clearTimeout(this.isConnectedTimer);
				}
				this.isConnectedTimer = setTimeout(()=>{
					console.log('结束检测与IM连接是否成功...')
					if(!this.isIMCreatedChat){
						this.workStatus = 102;
						this.isIMCreatedChat = !1;
						this.sessionIsEnd = !0;
						this.adjustChatUIScroll();
					}
				}, 15000);
			},

			startCheckLogin(){
				if(this.checkLoginTimer){
					clearInterval(this.checkLoginTimer)
				}
				this.checkLoginTimer = setInterval(()=>{
					this.im.heartbeat();
				}, 10000);
			},

			dealIMGMessage(imgData){
				return new Promise((resolve, reject)=>{
					let imgURL =  imgData.smallId;
					let image = new Image();
					image.onload = () => {
						resolve('good');
						// this.adjustChatUIScroll();
					};
					image.onerror = () => {
						reject('')
					};
					image.src = imgURL;
				});

			},

			closeHandler(){
				console.log('websocket had closed'+new Date());
			},

			errorHandler(){
				console.log('an eroor occured');
			},

			timeFormat(time){
				let y = time.getFullYear();
				let m = time.getMonth()+1 ;
				let d = time.getDate();
				m = m > 9 ? m : '0' + m;
				d = d > 9 ? d : '0' + d;
				return [y, '-', m, '-', d].join('');
			},

			fetchHistoryData(){
				let cfg = this.imCfg;
				let time = this.lastMessageTime || (this.messageList.length && this.messageList[0].time) || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, -1);
				let count = this.count;
				let imUserId = cfg.imuserid;

				return CustomService.getHistoryMessage({
					time,
					count,
					imUserId
				});
			},

			loadMoreMessage(){
				if(this.isLoadingMore || this.isLoadOver){
					return;
				}

				this.isLoadingMore = !0;
				const scrollHeight= this.$refs.chatList.scrollHeight;

				this.fetchHistoryData().then(res => {
					this.isLoadingMore = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					const items = res.data.items;
					if(items.length < this.count){
						this.isLoadOver = !0;
					}
					this.historyMessage = items.concat(this.historyMessage);
					this.lastMessageTime = items[0].time;
					setTimeout(() => {
						this.$refs.chatList.scrollTop = this.$refs.chatList.scrollHeight - scrollHeight - 50;
					}, 0);
				}).catch(err => {
					this.isLoadingMore = !1;
					console.log(err);
				})
			},

			loadHistoryMessage(){
				this.fetchHistoryData().then(res => {
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					const items = res.data.items;
					if(!items || items.length <= 0){
						this.isLoadOver = !0;
						return;
					}
					if(items.length < this.count){
						this.isLoadOver = !0;
					}
					this.lastMessageTime = items[0].time;
					this.historyMessage = items;
					this.adjustChatUIScroll();
				}).catch(err => {
					Indicator.close();
					console.log(err);
				});
			},

			loadIMGrantConfig(){
				CustomService.getIMConfig().then(res => {
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					this.imCfg = res.data;
					this.from  = res.data.imuserid;
					this.im.from = this.from;
					this.loadHistoryMessage();
				}).catch(err => {
					Indicator.close();
					console.log(err);
				});
			},

			fetchGoodsDetail(){
				let skuid = this.$route.query.skuId;
				
				if(!skuid){
					return Promise.reject('no skuid');
				}

				return CustomService.getGoodsDetail(skuid);
			},

			fetchOrderDetail(){
				let type = this.serviceType == 3 ? 1 : 2;
				let { bizno, skuid } = this.$route.query;

				if(!bizno || !skuid){
					return Promise.reject('no bizno or skuid');;
				}

				return CustomService.getOrderDetail(type, bizno, skuid);

			},

			// 1.综合客服 2.商品客服 3.订单客服 4.售后客服
			loadInitDataByST(){
				let st = this.serviceType;
				const methods = {
					'2': 'fetchGoodsDetail',
					'3': 'fetchOrderDetail',
					'4': 'fetchOrderDetail'
				};

				const method = this[methods[st]];
				
				if(typeof method !== 'function'){
					return;
				}
				
				method().then(res => {
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					this.boxInfo = res.data;
				}).catch(err => {
					Indicator.close();
					console.log(err);
				});
			},

			dealAutoDisconnect(){
				let nav =  window.navigator;
				let isWin = nav.platform.toLowerCase().indexOf('win32') > -1;
				let isIOS = nav.userAgent.toLowerCase().indexOf('iphone') > -1;
				
				if (isWin || !isIOS) {
					return;
				}

				let hidden, visibilityChange;
				let self = this;
				
				if (typeof document.hidden !== "undefined") {
					hidden = "hidden";
					visibilityChange = "visibilitychange";
				} else if (typeof document.webkitHidden !== "undefined") {
					hidden = "webkitHidden";
					visibilityChange = "webkitvisibilitychange";
				}

				if(!hidden){
					return;
				}

				document.addEventListener(visibilityChange, handleVisibilityChange, !1);

				function handleVisibilityChange(){
					if(document[hidden]){
						if(self.im.canUse()){
							self.im.logout();
						}
					}else{
						// self.im.createWebsocket();
						// location.reload();
					}
				}
			},

			init(){
				const ready = () => {
					this.isMiniprogram = window.__wxjs_environment === 'miniprogram';
					Indicator.show('加载中...');
					this.serviceType = this.$route.query.st || 1;
					this.loadInitDataByST();
					this.loadIMGrantConfig();
					this.connectIMServer();
					this.createEmotionMap();
					let pinch = new Pinch(this.$refs.preview);
				};
				
				if(!isWXBrowser){
					ready();
					return;
				}
				
				if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
					document.addEventListener('WeixinJSBridgeReady', ready, false)
				} else {
					ready()
				}
			
			}
		},
		components:{
			ChatOrder
		},
		computed:{
			...mapState(['usrInfo'])
		},
		mounted(){
			if(!this.usrInfo){
				User.getUsrInfo().then((res) => {
					if (res.code === this.$ERR.NORMAL) {
						this.USRINFO_SAVE(res.data);
						this.init();
					}
				}).catch((err) => {
					console.log(err);
				});
			}else{
				this.init();
			}

		},
		destroyed(){
			this.im.destory(!1);
			if(this.isConnectedTimer){
				clearTimeout(this.isConnectedTimer);
			}
		}
	}
</script>
<style>
	.swiper-container{
		width: 100%;
		height: 100%;
	}
	.swiper-container-horizontal > .swiper-pagination-bullets{
		bottom: 5px;
	}
	.swiper-pagination-bullet{
		opacity: 1;
		background-color: rgb(192, 192, 192);
	}
	.swiper-pagination-bullet-active{
		background-color: rgb(255, 192, 0);
	}
</style>
<style scoped>
	@import '../../assets/styles/mixins';
	@define-extend center{
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.chat-wrapper{
		display: flex;
		flex-direction: column;

		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		/*height: 100%;*/
		background-color: #f5f5f5;
		overflow: auto;
	}
	.chat-container{
		display: flex;
		flex-direction: column;
		flex: 1;
		/*position: absolute;
		top: 0;
		right: 0;
		bottom: 1.2rem;
		left: 0;*/
		padding: 0.4rem 0.32rem 0;
		padding-top:0;
	}
	
	.chat-footer{
		/*position: absolute;
		
		right: 0;
		bottom: 0;
		left: 0;*/
		position: relative;
		z-index: 20;
		background-color: #fff;

		.cf__bd{
			height: 3.6rem;
			border-top: 1px solid #e5e5e5;
		}
	}
	.icon-msg-loading{
		position: absolute;
		top: 50%;
		left: -0.52rem;

		width: 16px;
		height: 16px;

		margin-top: -8px;

		background: url(../../assets/images/chat/icon-loading.png) 0 0/ 16px 16px no-repeat;
		animation: spin1 1s steps(9, end) infinite;
	}

	.message-loadmore .icon-msg-loading{
		position: static;
		display: inline-block;
	}

	.cf__main{
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 1.2rem;
		padding: 0 0.32rem;
	}
	.cf__inp{
		width: 5.1rem;
		/*flex: 1;*/
		padding: 0 0.24rem;
		border-radius: 0.38rem;
		background-color: #f5f5f5;
		box-sizing: border-box;
		input{
			width: 100%;
			height: 0.4rem;
			line-height: 0.4rem;
			padding: 0.19rem 0;
			color: #333;
			font-size: 0.28rem;
			
			vertical-align: top;
		}
	}
	.cf__btns{
		display: flex;
		margin-left: 0.22rem;
		.btn{
			display: block;
			width: 28px;
			height: 28px;
			background-size: contain;
			background-repeat: no-repeat;

			&.btn-smile{
				background-image: url(../../assets/images/chat/icon-smile.png);
				&.active{
					background-image: url(../../assets/images/chat/icon-smile-active.png);
				}
			}

			&.btn-plus{
				margin-left: 20px;
				background-image: url(../../assets/images/chat/icon-plus.png);
				&.active{
					background-image: url(../../assets/images/chat/icon-plus-active.png);
				}
			}
		}
		.send-btn{
			width: 40px;
			height: 28px;
			line-height: 29px;
			background-color: $main-color;
			border-radius: 4px;
			color: #fff;
			font-size: 0.26rem;
			text-align: center;
			margin-left: 14px; 
			margin-right: -6px;
		}
	}
	.cf__menu{		
		.menu__box{
			display: flex;
			padding: 0.4rem 0.4rem 0.32rem;
		}
		.menu__item a .txt {
			color: #333;
		}
		.menu__item{
			position: relative;
			width: 1rem;
			margin-left: .94rem;
			text-align: center;
			font-size: 0.24rem;
			.icon{
				display: block;
				width: 0.82rem;
				height: 0.82rem;
				margin: 0 auto 0.08rem;

				background-repeat: no-repeat;
				background-size: contain;
			}

			&.album .img-file{
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				opacity: 0.01;
			}

			&.album .icon{
				background-image: url(../../assets/images/chat/icon-album.png);
			}
			
			&.camera .icon{
				background-image: url(../../assets/images/chat/icon-camera.png);
			}
			
			&.order .icon{
				background-image: url(../../assets/images/chat/icon-order.png);
			}

			&.call .icon {
				background-image: url(../../assets/images/chat/icon-call.png);
			}

			&:first-of-type{
				margin-left: 0;
			}
		}
	}

	.chat-box{
		padding-top: 0.28rem;
		border: 1px solid #e5e5e5;
		margin-top: 0.4rem;
		border-radius: 0.1rem;
		background-color: #fff;
	}
	.cb__hd{
		display: flex;
		justify-content: space-between;
		padding: 0 0.24rem 0.2rem;
		margin-top: -0.04rem;
		font-size: 0.22rem;
		.time{
			color: #999;
		}
	}
	.cb__cnt{
		display: flex;
		padding: 0  0.24rem 0.28rem;
		
		.cb__pic{
			width: 1.4rem;
			height: 1.4rem;
			background-color: #fff;

			img{
				display: block;
				width: 100%;
				height: 100%;
			}
		}

		.cb__info{
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			flex: 1;
			width: 1%;
			line-height: 0.34rem;
			margin-left: 0.24rem;
			font-size: 0.24rem;

			.cb__tit{
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				text-overflow: ellipsis;
				overflow : hidden;
			}
		}
	}
	.cb__btn{
		height: 0.7rem;
		line-height: 0.7rem;
		border-top: 1px solid #e5e5e5;

		font-size: 0.24rem;
		color: #ccc;
		text-align: center;

		&.active{
			color: #49A0FF;
		}
	}

	.chat-list{
		flex: 1;
		padding-top: 0.36rem;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		.prompt-message{
			line-height: 0.37rem;
			color: #999;
			font-size: 0.26rem;
			margin-bottom: 0.1rem;
			text-align: center;
			white-space: pre-line;
		}
	}

	.message-loadmore{
		position: relative;
		padding-top: .2rem;
		padding-bottom: 0.1rem;
		color: #49A0FF;
		font-size: 0.26rem;
		text-align: center;
		line-height: 0.37rem;
	}

	.message-list{
		border-bottom: 1px solid transparent;
	}

	.ml__item{
		margin: 0.5rem 0;
		.ml__time{
			text-align: center;
			margin-bottom: 0.4rem;
			.ml__time-txt{
				display: inline-block;
				height: 0.4rem;
				line-height: 0.4rem;
				border-radius: 0.22rem;
				padding: 0 0.15rem;
				font-size: 0.22rem;
				color: #fff;
				background-color: #d9d9d9;
			}
		}

		.ml__cnt{
			display: flex;
			.ml__cnt-box{
				position: relative;
				display: flex;
			}
			.icon-msg-fail{
				position: absolute;
				top: 50%;
				left: -26px;

				width: 16px;
				height: 16px;

				margin-top: -8px;

				background: url(../../assets/images/chat/icon-fail.png) 0 0/contain no-repeat;

				&:after{
					content: '';
					position: absolute;
					top: -8px;
					right: -8px;
					bottom: -8px;
					left: -8px;
				}
			}
			.ml__avatar{
				width: 0.78rem;
				height: 0.78rem;
				border-radius: 50%;
			}
			.ml__txt{
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				position: relative;
				max-width: 5.0rem;
				margin-left: 0.2rem;
				line-height: 0.4rem;
				padding: 0.2rem 0.24rem;
				border: 1px solid #e5e5e5;
				border-radius: 0.1rem;
				color: #333;
				font-size: 0.3rem;
				background-color: #fff;
				box-sizing: border-box;
				word-break: break-all;
				white-space: pre-wrap;

				&>>>img{
					display: inline-block;
					width: 0.46rem;
					height: 0.46rem;
					vertical-align: middle;
				}
			}

			.ml__sessionend{
				display: block;
				width: 100%;
				line-height: 0.37rem;
				color: #666;
				font-size: 0.26rem;
				text-align: center;
			}

			.ml__txt:before{
				content: '';

				position: absolute;
				top: 0.21rem;
				width: 0.13rem;
				height: 0.14rem;
			}

			.ml__pic{
				position: relative;
				max-width: 2.2rem;
				margin-left: 0.2rem;
				
				img{
					display: block;
					width: auto;
					height: auto;
					max-width: 100%;
					border-radius: 0.1rem;
				}
				
			}
		}
		&.self .ml__pic{
			margin-right: 0.2rem;
			margin-left: 0;
		}
		&.another .ml__txt:before{
			left: -0.13rem;

			background: url(../../assets/images/chat/icon-small-arrow-left.png) 0 0/contain no-repeat;

		}
		&.self .ml__cnt{
			justify-content: flex-end;
			.ml__avatar{
				order: 2;
			}
			.ml__txt{
				order: 1;
				margin-left: 0;
				margin-right: 0.2rem;
				color: #fff;
				background-color: #F68954;
				border-color: #F47A3F;
			}

			.ml__txt:before{
				right: -0.13rem;
				background: url(../../assets/images/chat/icon-small-arrow-right.png) 0 0/contain no-repeat;
			}
		}



		.ml__cb.box{
			width: 100%;
			padding-top: 0.28rem;
			border-radius: 0.1rem;
			background-color: #fff;
		}

		.ml__comment{
			display: flex;
			margin-top: 0.4rem;
			padding: 0.24rem;
			border-radius: 0.1rem;
			background-color: #fff;
			width: 100%;

			.mlc__item{
				flex: 1;
				text-align: center;
			}

			.comment-icon{
				display: block;
				width: 0.48rem;
				height: 0.48rem;
				margin: 0 auto;
				background-position: 0 0;
				background-size: contain;
				background-repeat: no-repeat;
			}

			$imgPre:../../assets/images/chat;

			@each $icon in (laugh, smile, normal, cry) {
				.comment-icon.$(icon){
					background-image:url('$imgPre/icon-mark-$(icon).png');
				}
				.comment-icon.$(icon).active{
					background-image: url('$imgPre/icon-mark-$(icon)-active.png');
				}
			}

			.comment-txt{
				margin-top: 0.08rem;
				color: #666;
				font-size: 0.22rem;
			}

			.comment-icon.active + .comment-txt{
				color: $main-color;
			}
		}

		.ml__cb.box, .ml__comment{
			width: calc(100vw - .62rem);
		}

		.ml__cb.box.fail{
			width: calc(100vw - .62rem - 28px);
		}
	}

	.chat-list.history{
		padding-top: 0;
	}

	.chat-list.history .ml__item{
		margin-top: .3rem;
	}

	.cf__emotion{
		height: 100%;
		/*padding: 0.28rem 0.32rem 0.5rem;
		box-sizing: border-box;*/
		.emotion__box{

			display: flex;
			flex-wrap: wrap;
			/*justify-content: space-between;*/
			height: 100%;
			width: 100%;
			align-content: space-between;
			overflow: hidden;
			padding: 0.28rem 0.32rem 0.5rem;
			box-sizing: border-box;
		}
		.emotion__item{
			width: 12.5%;
			/*width: 0.7rem;
			height: 0.7rem;*/
			/*margin-left: 0.1rem;*/
			/*margin-top: 0.2rem;*/
			overflow: hidden;

			img,.img{
				display: block;
				width: 0.7rem;
				height: 0.7rem;
				margin: 0 auto;
			}

			&.del{
				user-select: none;
				.img{
					background: url(../../assets/images/chat/icon-emotion-del.png) 0 0/contain no-repeat;
				}
			}
		}
	}

	.preview{
		.preview__bg{
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			background-color: rgba(0, 0, 0, 1);
			z-index: 30;
		}
		.preview__pic{
			position: fixed;
			top: 50%;
			left: 50%;

			width: 100%;
			transform: translate3d(-50%, -50%, 0);
			z-index: 31;

			img{
				display: block;
				width: 100%;
				transform: scale(1);
				transition: transform .2s linear;
			}

			.preview__loading{
				position: absolute;
				top: 50%;
				left: 50%;

				width: 0.4rem;
				height: 0.4rem;
				
				margin-left: -0.2rem;
				margin-top: -0.2rem;

				background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%20120%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Cdefs%3E%3Cline%20id%3D'l'%20x1%3D'60'%20x2%3D'60'%20y1%3D'7'%20y2%3D'27'%20stroke%3D'%236c6c6c'%20stroke-width%3D'11'%20stroke-linecap%3D'round'%2F%3E%3C%2Fdefs%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(30%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(60%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(90%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(120%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(150%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.37'%20transform%3D'rotate(180%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.46'%20transform%3D'rotate(210%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.56'%20transform%3D'rotate(240%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.66'%20transform%3D'rotate(270%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.75'%20transform%3D'rotate(300%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.85'%20transform%3D'rotate(330%2060%2C60)'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");

				background-position: 0 0;
				background-size: contain;
				background-repeat: no-repeat;

				animation: spin 1s steps(12, end) infinite;
			}
		}


	}
	@keyframes spin{
		100%{
			transform: rotate(360deg);
		}
	}
	@keyframes spin1{
		100%{
			transform: rotate(360deg);
		}
	}
</style>