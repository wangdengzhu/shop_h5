<template>
	<div class="page" v-show="isPageLoaded">
		<div class="payment-wapper">
			<header class="hd payment-money">
				<span>支付金额：<em class="money-num">¥{{totalMoney}}</em></span>
			</header>
			<section class="payment-ways">
				<ul class="payment-ways-list">
					<li @click="selectPayment(payment,idx)" v-for="(payment,idx) in paymentWays" :class="{selected:selectedIdx==idx}" class="payment-ways-item tb1px"  >
						<i class="icon pay-icon " :class="payment.payicon"></i>
						<span class="pay-name">{{payment.payname}}</span>
						<label class="iconfont icon-round cb-lbl"></label>
					</li>
				</ul>
			</section>
			<div class="payment-btn-wrap" @click="goToPay">
				<span class="payment-btn">立即支付</span>
			</div>
		</div>
		<div class="wxpay-dialog" v-if="isShowDialog">
			<div class="dialog-overlay" @touchmove.prevent></div>
			<div class="dialog-cnt">
				<p class="tit">请确认微信支付是否完成</p>
				<p class="finish tb1px" @click="navToPayResult">已完成支付</p>
				<p class="repay" @click="closeDialog">支付遇到问题，重新支付</p>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState,mapMutations } from 'vuex';
	import { Base64 } from 'js-base64';
	import { Pay } from '@/apis';
	import PaymentWays from '@/utils/paymentWays';
	import { isWXBrowser, getQueryParam } from '@/utils/common';
	import Indicator from '@/components/common/indicator';
	import CnfrmBox from '@/components/common/confirm-box';
	import Toast from '@/components/common/toast';
	export default {
		data(){
			return {
				isPageLoaded: !1,
				selectedIdx: 0,
				orderId: -1,
				orderNo: '',
				totalMoney: '',
				isPaying: !1,
				isShowDialog: !1,
				payId: '',
				isSbmting: !1,
				payChannel: null,
				paymentWays: []
			}
		},
		methods:{
			init(){
				const qs = this.$route.query;
				const cnt = qs.cnt;
				let orderId = null;
				let orderNum = null;
				let orderMoney = null;
				if(!cnt){
					this.isShowDialog = !0;
					orderId = qs.orderId;
					orderNum = qs.orderNo;
					orderMoney = qs.orderAmount;
					this.payChannel = qs.payChannel;
					this.analysisPayData(qs.data);
				}else{
					const orderStr = decodeURIComponent(cnt).split('').map(s=>String.fromCharCode(s.charCodeAt(0)-0Xa)).join('');
					const orderArr = Base64.decode(orderStr).split('|');
					orderId = orderArr[0];
					orderNum = orderArr[1];
					orderMoney = orderArr[2];
				}

				if(!orderId || !orderNum || !orderMoney){
					return;
				}
				this.orderId = orderId;
				this.orderNo = orderNum;
				this.totalMoney = parseFloat(orderMoney).toFixed(2);
			},
			analysisPayData(dataStr){
				if(!dataStr){
					return;
				}
				const qs = getQueryParam(dataStr);
				const shop_id  = qs('shop_id');
				this.payId = shop_id;
			},
			selectPayment(payment,idx){
				this.selectedIdx = idx;
			},
			navToPayResult(){
				if (!this.payChannel || !this.payId) {
					return;
				}
				if (this.isSbmting) {
					return;
				}
				this.isSbmting = !0;
				Pay.query(this.payChannel, this.payId, this.orderNo).then(res => {
					this.isSbmting = !1;
					let status = res.code == this.$ERR.NORMAL ? res.data.status : 2;
					const objStr = this.getFormatObjStr(status);
					this.$router.push({
						path:'/pay-result',
						query:{
							shopId:this.shopId,
							code: 1,
							orderNo:this.orderNo,
							data:objStr
						}	
					});
				}).catch(err => {
					this.isSbmting = !1;
					console.log(err);
				});
			},
			getFormatObjStr(status){
				return `{status=${status}&refrence_id=${this.orderId}&amount=${this.totalMoney}}`;
			},
			closeDialog(){
				this.isShowDialog = !1;
			},
			goToPay(){
				if(this.isPaying){
					return;
				}

				Indicator.show('正在提交...');
				const payChannel = this.paymentWays[this.selectedIdx].paychannel;
				const clientType = this.platform;
				const orderId = this.orderId;
				const orderNo = this.orderNo;
				const payParams = {
					orderId,
					orderNo,
					payChannel,
					clientType
				};

				this.isPaying = !0;

				Pay.check(orderNo).then((res)=>{
					if(res.code == this.$ERR.NORMAL){
						return Pay.pre(payParams);
					}else{
						const msg = this.getErrMsg(res.code);
						return Promise.reject({
							code:10000,
							message : msg
						});
					}
				}).then((res)=>{
					Indicator.close();
					this.isPaying = !1;
					if(res.code == this.$ERR.NORMAL){
						location.replace(res.data.payurl);
					}else{
						const msg = `payment.vue::<Function>goToPay--支付发生异常[${res.code}],没有返回支付地址--参数${JSON.stringify(payParams)}`;
						this.captureException(msg);
						Toast(`系统繁忙，请稍后重试![${res.code}]`);
					}
				}).catch(err=>{
					Indicator.close();
					this.isPaying = !1;
					if(err.code == 10000){
						this.showGoodsException(err.message);
					}
				});
			},
			getErrMsg(code){
				let message = '';
				if (code == 3601 || code == 3603) {
					message = '订单已支付，请勿重复下单';
				}else if (code == 3602) {
					//订单已关闭
					message = '抱歉，订单支付已超时';
				}else if (code == 3610) {
					//订单不存在
					message = '抱歉，该订单发生异常，请重试';
				}else if (code == 3611) {
					//sku异常
					message = '商品库存不足，请重新下单';
				}
				return message;
			},
			showGoodsException(message){
				if(!message){
					return;
				}

				CnfrmBox.alert({
					message: message,
					cnfrmBtnTxt: '去看更多商品'
				}).then(() => {
					this.$router.replace({
						path:'/category',
						query:{
							shopId:this.shopId
						}
					});
				});
			}
		},
		computed:{
			...mapState(['shopId']),
			// paymentWays(){
			// 	return PaymentWays.slice(0).filter(pay => pay.isEnabled);
			// },
			platform(){
				if(isWXBrowser){
					return 2;
				}else{
					return 5;
				}
			}
		},
		mounted(){
			Indicator.show('加载中');
			Pay.ways().then(res => {
				this.isPageLoaded = !0;
				Indicator.close();
				if(res.code !== this.$ERR.NORMAL){
					return;
				}
				this.paymentWays = res.data;
				this.init();
			}).catch(err => {
				Indicator.close();
				console.log('加载支付方式异常.');
			});
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins.css';
	@define-extend center{
		display: flex;
		justify-content: center;
		align-items: center;
	}
	@define-mixin icon $w,$h,$url{
		display: block;
		width: $w;
		height: $h;
		background: url($url) 0 0/cover;
	}
	.page{
		position: absolute;
		top:0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
	
	.payment-wapper{
		.hd{
			height: 0.94rem;
			line-height: 0.94rem;
			padding: 0 0.3rem;
			font-size: $fs-28;
			.money-num{
				display: inline-block;
				color:$main-color;
				font-size: $fs-36;
				&:first-letter{
					display: inline-block;
					margin-right: 0.06rem;
				}
			}
		}
		.payment-ways-list{
			background-color: #fff;
			.payment-ways-item{
				display: flex;
				align-items: center;
				height: 1.0rem;
				padding: 0 0.3rem;
				border-bottom: 1px solid $color-d9;
				font-size: $fs-32;
				.pay-icon{
					@mixin icon 0.4rem,0.4rem,../../assets/images/wx-pay-icon.png;
					&.alipay{
						background-image: url(../../assets/images/zfb-pay-icon.png);
					}
					&.jdpay{
						background-image: url(../../assets/images/jd-pay-icon.png);
					}
				}
				.pay-name{
					flex:1;
					margin-left: 0.2rem;
				}
				.cb-lbl{
					color:#c9c9c9;
					font-size: 0.36rem;
				}
				&.selected .cb-lbl:before{
					color:$main-color;
					content:'\e656';
				}
			}
		}
		.payment-btn-wrap{
			padding: 0 $mg-30;
		}
		.payment-btn{
			display: block;
			/*width: 88%;*/
			height: 0.9rem;
			line-height: 0.9rem;
			border-radius:$radius-10;
			margin: 0.78rem auto 0;
			
			color:#fff;
			font-size: $fs-32;
			text-align: center;
			background-color: $main-color;
		}
	}

	.dialog-overlay{
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		z-index: 10;
		background-color: rgba(0,0,0,.5);
	}

	.dialog-cnt{
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%,-65%,0);
		z-index: 12;

		width: 80%;
		background-color: #fff;
		border-radius: 6px;
		text-align: center;
		font-size: $fs-28;
		.tit{
			padding: 0.4rem 0;
		}
		.finish,.repay{
			padding: 0.3rem 0;
		}
		.finish{
			font-size: $fs-28;
			color:$main-color;
			border-top: 1px solid $color-d9;
			border-bottom: 1px solid $color-d9;
		}
		.repay{
			color:$color-80;
		}
	}


</style>