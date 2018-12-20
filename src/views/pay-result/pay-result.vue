<template>
	<div class="page">
		<div class="payres-wapper">
			<div class="payres-cnt" :class="stateCls">
				<div class="payres-cnt-icon">
					<i class="icon"></i>
				</div>
				<div class="payres-cnt-state">
					<p class="state-txt">{{ stateTxt }}</p>
					<p class="state-money" v-if='status>=0'>{{ moneyPrefix }}¥{{amount}}</p>
				</div>
				<div class="payres-cnt-btns">
					<router-link :to="{path:'/order-list',query:{status:0,shopId:shopId}}" class="btn order-lookup-btn tb1px">查看订单</router-link>
					<a @click.prevent="doNav" class="btn go-on-btn tb1px" >{{ goOnBtnTxt }}</a>
				</div>
			</div>
			<div class="ad-cnt">
				<div class="ad-cnt-tip">
					<i class="iconfont icon-info">
					</i><span>安全提醒：付款成功后，官方不会以任何理由发送退款链接，请勿泄露银行卡号、手机验证码，谨防诈骗</span>
				</div>
				<div class="ad-cnt-qrcode" v-if="isWXBrowser">
					<p class="qrcode-tit">关注满金店微信公众号，随时跟踪订单信息</p>
					<p class="qr-pic">
						<img src="../../assets/images/qr-code.png" alt="满金店二维码" class="qr">
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import { Cart } from '@/apis';
	import { Base64 } from 'js-base64';
	import { isWXBrowser } from '@/utils/common';
	export default {
		data(){
			return {
				stateTxt:'',
				stateCls:'',
				moneyPrefix:'',
				goOnBtnTxt:'',
				orderId:'',
				orderNo:'',
				amount:0,
				status:-1,
				isWXBrowser:isWXBrowser
			}
		},
		methods:{
			init(){
				const queryParams = this.$route.query;
				const code = queryParams.code;
				this.orderNo = queryParams.orderNo;
				if (code != 1) {
					this.showPayException(queryParams.msg);
					return;
				}
				const dataObjStr = 	queryParams.data;
				const qs = this.getQueryParam(dataObjStr);
				this.status = qs('status');
				this.orderId = qs('refrence_id');
				this.amount = parseFloat(qs('amount')).toFixed(2);
				if(this.status == 1 || this.status == 3){
					this.showSuccess(this.status);
				}else{
					this.showFail(this.status);
				}
			},
			getQueryParam(dataStr){
				return function(name){
					return dataStr.match(new RegExp(name+'=([^\&]*)'))[1];
				}
			},
			showFail(status){
				this.stateTxt = status == 2 ? '支付失败' : '未支付';
				this.stateCls = 'failure';
				this.moneyPrefix = '需支付';
				this.goOnBtnTxt = '继续支付';
			},
			showSuccess(status){
				this.stateTxt = status == 1 ? '支付成功' : '支付受理成功';
				this.stateCls = 'success';
				this.goOnBtnTxt = '继续逛逛';
			},
			showPayException(message){
				this.stateCls = 'failure';
				this.stateTxt = message;
				this.goOnBtnTxt = '继续逛逛';
			},
			doNav(){
				if(this.status == 2 || this.status == 0){
					this.$router.replace({
						path: '/pay',
						query: {
							shopId:this.shopId,
							cnt:this.encodeOrderParams()
						}
					});
				}else{
					this.$router.push({
						path: '/category',
						query: {
							shopId:this.shopId
							
						}
					})
				}
			},
			encodeOrderParams(){
				let orderStr = Base64.encode([this.orderId,this.orderNo,this.amount].join('|'));
				orderStr = orderStr.split('').map(s=>(String.fromCharCode(s.charCodeAt(0)+0Xa))).join('');
				return encodeURIComponent(orderStr);
			}
		
		},
		computed:{
			...mapState(['shopId']),
		},
		mounted(){
			this.init();
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
	
	.payres-cnt{
		padding: $mg-40 $mg-30;
		background-color: #fff;
		text-align: center;
		.payres-cnt-icon .icon{
			@mixin icon 1.16rem,1.16rem,../../assets/images/pay-success-icon.png;
			display: inline-block;
		}
		.payres-cnt-state{
			margin-top: $mg-40;
			margin-bottom: $mg-40;
			font-size: 0.42rem;
			.state-money{
				font-size: 0.32rem;
				color:$main-color;
				margin-top: 0.16rem;
			}
		}
		.payres-cnt-btns{
			display: flex;
			justify-content: space-between;
			.btn{
				width: 46%;
				height: 0.68rem;
				line-height: 0.7rem;
				border-radius:$radius-6;
				&.order-lookup-btn{
					color:$main-color;
					border:1px solid $main-color;
				}
				&.go-on-btn{
					color:#fff;
					background-color: $main-color;
					border:1px solid transparent;
				}
			}
		}
		&.failure{
			.payres-cnt-icon .icon{
				background-image: url(../../assets/images/pay-fail-icon.png);
			}
		}
	}

	.ad-cnt{
		margin-top: 0.3rem;
		.ad-cnt-tip{
			position: relative;
			color:#999;
			font-size: 0.26rem;
			padding: 0 0.3rem 0 0.7rem;
			line-height: 1.5;
			text-indent: -1.1em;
			.icon-info{
				position: relative;
				left:-0.14rem;
				top:0.02rem;
				font-size: 0.3rem;
			}
		}
		.ad-cnt-qrcode{
			margin-top: 1.38rem;
			.qrcode-tit{
				text-align: center;
				font-size: 0.3rem;
			}
			.qr-pic{
				text-align: center;
				margin-top: 0.32rem;
				img{
					display: inline-block;
					width: auto;
					height: 2.56rem;
					vertical-align: top;
				}
			}
		}
	}

</style>