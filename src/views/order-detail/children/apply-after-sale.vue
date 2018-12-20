<template>
	<div class="req-after">
		<div class="req-after-wrapper">
			<div class="req-after-inner">
				<div class="header flex">
					<div class="pic tb1px"><img :src="applyData.skuimage" alt=""></div>
					<div class="goods flex-one">
						<h6 class="title gray3">{{applyData.spuname}}</h6>
						<p class="gray9">{{applyData.spec}}</p>
					</div>
				</div>
				<ul class="content">
					<li>
						<p class="lab gray6">售后类型<span class="orange">*</span></p>
						<div class="select-box tb1px">
							<input type="text" class="select-type orange" :value="selectedValue" readonly>
							<select name="" id="" v-model="selectedKey">
								<option v-for="option in optionsType" :key="option.key" :value="option.key">{{option.value}}</option>
							</select>
						</div>
					</li>
					<li>
						<p class="lab gray6">售后原因<span class="orange">*</span></p>
						<div class="select-box tb1px">
							<input type="text" class="select-type gray3" v-model="otherReason" placeholder="请输入售后原因" maxlength="30">
						</div>
					</li>
					<li>
						<p class="lab gray6">退款金额（最多可退  <span class="money-symbol gray6">{{refundAmount}}</span>）</p>
						<div class="select-box tb1px">
							<div class="select-type money-symbol flex">
								<input type="text" class="flex-one" placeholder="请填写退款金额" :value="refundAmount" readonly>
							</div>
						</div>
					</li>
				</ul>
				<div class="upload-wrapper">
					<p class="gray3">上传凭证（选填）</p>
					<ul class="upload-list flex" @click="showImgView">
						<li v-for="(item, index) in imageUrls" :key="item" :class="{'isLoading' : imgIsLoading && (index == imageUrls.length-1)}">
							<img :src="item" alt="">
							<i class="close-icon" v-show="(!!imageUrls[index])" @click.stop="removeImage(index)"></i>
						</li>
						<li class="add-icon" v-if="imageUrls.length < 4" @click.stop>
							<input type="file" class="file-inp" accept="image/*"  @change="changeImage($event)" v-show="!imgIsLoading">
						</li>
					</ul>
				</div>			
			</div>
		</div>
		<div class="submit-btn orange-btn" @click="submitForm">确认提交</div>
		<div class="img-view-wrapper" @touchmove.prevent @click="hideImgView" v-show="showBigImg">
			<div class="img-view-inner">
				<div class="swiper-container">
					<div class="swiper-wrapper">
						<div class="swiper-slide" v-for="item in imageUrls" :key="item">
							<img :src="item" alt="">
						</div>
					</div>					
				</div>
			</div>		
			<div class="swiper-pagination"></div>	
		</div>
	</div>
</template>

<script>
	import { AfterSale } from '@/apis/';
	import { mapState } from 'vuex';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';
	import EXIF from 'exif-js';
	import { compressImg, dataURLtoBlob } from '@/utils/imageManage'
	import Toast from '@/components/common/toast/';
	import Indicator from '@/components/common/indicator';

	/*验证策略*/	
	let strategies = {
		isNonEmpty(value, errMsg){
			if( value === ''){
				return errMsg;
			}
		},
		isNonLessZero(value, errMsg){
			if(value <= 0){
				return errMsg;
			}
		},
		maxLength(value, length, errMsg){
			if(value.length > length){
				return errMsg;
			}
		}
	}

	/*验证类*/
	class Validator{
		constructor(){
			this.cache = [];
		}
		add(value, rules){
			for(let rule of rules){
				let strategyArr = rule.strategy.split(':'),
					errMsg = rule.errMsg;				
				this.cache.push( () => {
					let strategy = strategyArr.shift();
					strategyArr.unshift(value);
					strategyArr.push(errMsg);
					return strategies[ strategy ](...strategyArr);
				})				
			}
		}
		start(){
			for(let fn of this.cache){
				let msg = fn();
				if(msg){
					return msg;
				}
			}
		}
	}

	const MAX_NUM = 10;
	const MAX_IMG_SIZE = MAX_NUM * 1024 * 1024;   //10MB
	const UPLOAD_SIZE = 0.2 * 1024 * 1024  //   200KB， 如果小于200KB，直接上传不压缩
	const VALID_TYPE = /jpeg|jpg|png|gif/;   //支持的图片格式
    export default {
        data(){
            return {
				reqKey : 1,
				otherReason : '',   //售后原因
				selectedKey : '1',
				optionsType : [],
				imageUrls : [],    //存放凭证上传后返回的url
				imagePlaceUrl : '',
				imgIsLoading : false,
				showBigImg : false,
				mySwiper : null
            }
		},
		computed: {
			...mapState([
				'applyList', 'shopId'
			]),				
			orderId(){
				return this.$route.query.orderId;
			},
			orderNo(){
				return this.$route.query.orderNo;
			},
			lineId(){
				return this.$route.query.lineId;
			},
			selectedValue(){ //售后类型value
				if(this.optionsType.length){
					var curItem = this.optionsType.find((item, index, arr) => item.key === this.selectedKey);
					return curItem.value;
				}								
			},
			refundAmount(){
				return (this.applyData.canmaxrefundamount && this.applyData.canmaxrefundamount.toFixed(2)) || '';
			},
			applyData(){
				return this.applyList.filter((item, index, arr) => item.id == this.lineId)[0] || {};
			}
			// imageAllLoaded(){
			// 	return this.imageUrls.length == this.imageViews.length
			// }
		},
		methods: {			
			//获取退款类型
			getDicType(){
				this.reqStart();
				AfterSale.getType(this.reqKey).then((res) => {
					this.reqEnd();
					if(res.code === this.$ERR.NORMAL){
						this.optionsType = res.data;
					} else {
						Toast(`获取数据失败, 请稍候重试[${res.code}]`);
						//this.reqFailed();
					}				
				}).catch((err) => {
					this.reqEnd();
					console.log(err);
				})
			},
			//选中图片
			changeImage(e){
				let file = e.target.files[0],
					imageData = new FormData(),					
					self = this;						
				
				if(!file){
					return;
				}	
				e.target.value = '';							
				if(file.size > MAX_IMG_SIZE){
					Toast('上传图片不能大于' + MAX_NUM +'M');
					return;
				}
				if(!VALID_TYPE.test(file.type)){
					let type = file.type.split('/').pop();
					Toast('不支持上传'+ type +'格式');
					return;
				}				
				//获取图片的 Orientation
				let orientation = 0;
				EXIF.getData(file, function(){
					EXIF.getAllTags(this);
					orientation = EXIF.getTag(this, 'Orientation');
				})

				this.uploadStart();				
				if(file.size <= UPLOAD_SIZE){   //如果图片小于规定的大小，直接提交file文件流
					imageData.append('imagefile', file);
					self.uploadEvid(imageData);
					return
				}

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
						imageData.append('imagefile', blob, file.name);											
						self.uploadEvid(imageData);						
						img = null;						
					}
				}
				reader.readAsDataURL(file);																	
			},			
			//上传图片
			uploadEvid(data){   				
				AfterSale.uploadEvid(data).then((res) => {
					this.uploadEnd(); 
					if(res.code === this.$ERR.NORMAL){
						this.imageUrls.push(res.data);
					} else {
						Toast('凭证上传失败，请稍候重试[' + res.code + ']');						
					}
				}).catch((err) => {
					this.uploadEnd();
					//Toast('上传失败');
				})
			},		
			//上传开始
			uploadStart(){
				this.imgIsLoading = true;
				this.imageUrls.push(this.imagePlaceUrl);
			},
			//上传结束，不论成功还是失败		
			uploadEnd(){   
				this.imgIsLoading = false;
				this.imageUrls.pop();				
			},
			//删除已上传图片
			removeImage(index){
				this.imageUrls.splice(index, 1);
			},
			//提交表单
			submitForm(){	
				let images = this.imageUrls.join(','),
					data = {
						'AsType' : this.selectedKey,
						'OtherReason' : this.otherReason,					
						'OrderId' : this.orderId,
						'OrderNo' : this.orderNo,
						'OrderLineId' : this.lineId,
						'Qty' : this.applyData.qty,
						'RequestRefundAmount' : this.refundAmount,
						'AsEvidenceName' : images
					}
				let errMsg = this.validataFun();
				if(errMsg){
					Toast(errMsg);
					return;					
				}		
				this.reqStart('正在提交...');		
				AfterSale.create(data).then((res) => { //提交数据, 创建售后单
					this.reqEnd();		
					let resCode = res.code;			
					if(resCode == this.$ERR.NORMAL){
						Toast({
							toastTxt: '提交成功',
							iconCls: 'success'
						});
						setTimeout( () => { 
							this.$router.replace({
								path: '/after-sale/details', 
								query: {
									status : 0, 
									asNo : res.data, 
									shopId: this.shopId
								}
							});
						}, 1500);
					} else if(resCode == this.$ERR.AS_MONEY_BIG){
						Toast('退款金额不能大于订单的实收金额');
					} else if(resCode == this.$ERR.AS_MONEY_SMALL){ 
						Toast('退款金额不能小于0');
					} else if(resCode == this.$ERR.AS_HAS_ALREADY){
						Toast('订单已存在售后单');
					} else {
						Toast(res.message + resCode);
					}
				}).catch((err) => {
					this.reqEnd();
					console.log(err);
				})
			},
			//验证表单数据
			validataFun(){
				let validator = new Validator(),
					errMsg = '';
				validator.add(this.selectedValue, [{
					strategy : 'isNonEmpty',
					errMsg : '请选择售后类型'
				}]);			
				validator.add(this.otherReason, [{
					strategy : 'isNonEmpty',
					errMsg : '请填写售后原因'
				},{
					strategy : 'maxLength:30',
					errMsg : '售后原因不能超过30个字符'
				}]);
				validator.add(this.refundAmount, [{
					strategy : 'isNonLessZero',
					errMsg : '退款金额不能小于0'
				}]);

				errMsg = validator.start();
				return errMsg;				
			},
			showImgView(e){
				let target = e.target,
					tagName = target.tagName.toLowerCase();							
				if(!this.imageUrls.length){
					return;
				}
				//获取点击的img或li在ul中的索引							
				let index = Array.from(e.currentTarget.querySelectorAll(tagName)).indexOf(target);
				if(index === -1){
					return;
				}				
				if(this.mySwiper && this.mySwiper.slides.length === this.imageUrls.length){
					this.mySwiper.slideTo(index);
				} else {
					this.initSwiper(index);
				}	
				this.showBigImg = true;			
			},
			hideImgView(e){
				this.showBigImg = false;
			},
			initSwiper(index){
				if(this.mySwiper instanceof Swiper){
					this.mySwiper.destroy();
					this.mySwiper = null;
				}
				this.mySwiper = new Swiper('.swiper-container', {
					width: window.innerWidth,
					initialSlide : index,
					pagination : {
						el: '.swiper-pagination',
						type: 'fraction'
					}
				});
			},
			reqStart(text){
				text = text || '加载中...';
				Indicator.show(text);
			},
			reqEnd(){
				Indicator.close();
			},
			reqFailed(){
				Toast('网络异常，请稍候重试');
			},
			init(){
				this.getDicType();
			}
		},
		created(){
			this.init();
		},
		mounted(){

		}
    }
</script>

<style lang="postcss" scoped>
	@import '../../../assets/styles/mixins.css';

	.req-after{
		position: absolute;
		width: 100%;
        height: 100%;
		top: 0;
		left: 0;
		z-index: 2;
	}
    .req-after-wrapper{		
		position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;

		.req-after-inner{
			padding-bottom: 1rem;
		}

		.header{
			min-height: 1.4rem;
			padding: 0.3rem;
			background-color: #fff;

			.pic{
				width: 1.4rem;
				height: 1.4rem;
				padding: 1px;
				border: 1px solid $color-d9;
				box-sizing: border-box;
				overflow: hidden;
				border-radius: $radius-6;

				> img{
					display: block;
					width: 100%;
					height: 100%;
				}
			}
			.goods{
				padding-left: 0.2rem;
				font-size: 0.24rem;
				line-height: 0.4rem;
				.title{
					font-size: 0.28rem;
					padding-bottom: 0.1rem;
				}
			}
		}
		.content{
			position: relative;
			margin-top: 0.2rem;
			padding: 0.3rem;
			background-color: #fff;			
			font-size: 0.28rem;
			z-index: 4;

			li{	
				margin-top: 0.4rem;

				&:first-child{
					margin-top: 0;
				}

				.lab{
					height: 0.4rem;
					line-height: 0.4rem;

					span.orange{
						padding-left: 0.1rem;
						vertical-align: sub;
					}
				}
				.select-box{
					position: relative;
					width: 100%;
					height: 0.66rem;	
					line-height: 0.66rem;
					margin-top: 0.2rem;
					border: 1px solid $color-d9; 
					border-radius: $radius-6;

					.select-type{
						position: relative;
						width: 100%;						
						height: 0.66rem;
						padding-left: 0.2rem;																	
						box-sizing: border-box;						
						z-index: 2;
					}	
					input, select{
						padding-left: 0.04rem;
						font-size: 0.26rem;	
					}
					input{
						padding: 0.1rem 0;						
						box-sizing: border-box;
					}
					select{
						position: absolute;
						width: 100%;
						height: 100%;
						top: 0;
						left: 0;
						opacity: 0;
						z-index: 3;
					}

				}

			}
		}
		.upload-wrapper{
			margin-top: 0.2rem;
			padding: 0.3rem;
			background-color: #fff;
			font-size: 0.28rem;
			line-height: 0.4rem;

			.upload-list{				
				flex-wrap: wrap;

				li{	
					position: relative;				
					width: 1.5rem;
					height: 1.5rem;
					margin-top: 0.2rem;
					margin-right: 0.3rem;					
					border-radius: 3px;

					&.isLoading{
						background-image: url(../../../assets/images/loading/200.gif);
						background-repeat: no-repeat;
						background-position: center;	
						background-size: contain;						
					}	

					&.add-icon{
						background-color: #f2f2f2;	

						&::before, &::after{
							content: '';
							position: absolute;
							top: 50%;
							left: 50%;
							background-color: #fff;
							transform: translate(-50%, -50%);							
						}	
						&::before{
							width: 0.8rem;
							height: 0.06rem;
						}
						&::after{
							width: 0.06rem;
							height: 0.8rem;
						}
						.file-inp{
							position: absolute;
							width: 100%;
							height: 100%;
							top: 0;
							left: 0;
							opacity: 0;
						}				
					}
					&:nth-child(4n){
						margin-right: 0;
					}
					> img {
						position: absolute;
						max-width: 100%;	
						max-height: 100%;
						top: 50%;
						left: 50%;
						transform: translate(-50%,-50%);										
					}
					.close-icon{
						position: absolute;
						width: 20px;
						height: 20px;
						top: -10px;
						right: -10px;
						background-color: #ff681d;
						border-radius: 1rem;
						transform: rotate(45deg);

						&::before, &::after{
							content: '';
							position: absolute;							
							top: 50%;
							left: 50%; 
							background-color: #fff;
							border-radius: 3px;
							transform: translate(-50%, -50%);
						}
						&::before{
							width: 12px;
							height:1px;
						}
						&::after{
							width: 1px;
							height:12px;
						}
					}
				}

			}
		}		
	}
	.submit-btn{
		position: absolute;
		width: 100%;
		height: 1rem;
		bottom: 0;
		left: 0;
		line-height: 1rem;		
		text-align: center;
		font-size: 0.32rem;
	}
	.img-view-wrapper{
		position: absolute;
		width: 100%;
		height: 100%;
		padding: 1.2rem 0;
		background-color: #000;
		box-sizing: border-box;		
		z-index: 5;

		.img-view-inner{
			width: 100%;
			height: 100%;
			overflow: hidden;

			img{
				display: block;
				width: 100%;
			}
			.swiper-container, .swiper-wrapper, .swiper-slide{
				height: 100%;
			}
			.swiper-slide{
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.swiper-pagination{
			bottom: 0.4rem;
			color: #fff;
		}
	}
</style>

