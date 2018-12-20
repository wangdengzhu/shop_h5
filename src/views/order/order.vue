<template>
	<div v-show="pageLoaded">
		<section class="addr-cntnr" @click="navToAddrPage" v-if="!isShowEmpty" @touchmove.prevent>
			<i class="icon addr-icon"></i>
			<div class="addr">
				<template v-if="addrList.length">
					<p class="addr-person">
						<span class="addr-person-name">{{ addrInfo.contact_name }}</span>
						<span class="addr-person-tel">{{ addrInfo.mobile }}</span>
						<span v-if="addrInfo.label_name" class="addr-lbl tb1px">{{ addrInfo.label_name }}</span>
						<span v-else-if="addrInfo.default_flag == 1"  class="default addr-lbl tb1px">默认</span>
					</p>
					<p class="addr-detail">
						<span>{{getAddrTxt(addrInfo)}}</span>
					</p>
				</template>
				<p class="no-addr" v-else>请填写收货地址</p>
			</div>
			<i class="icon icon-arrow"></i>
		</section>		
		<div class="page">
			<div class="order-wrapper" v-if="!isShowEmpty">
				<section class="goods-cntnr" >
					<ul class="goods-list">
						<li class="goods-item tb1px" v-for="goods in orderGoodsInfo.list">
							<div class="goods-detail tb1px" @click="navToDetail(goods.skuid, goods.goodsid)">
								<div class="goods-pic tb1px">
									<img :src="goods.goodspic" alt="">
								</div>
								<div class="goods-info">
									<div>
										<p class="goods-info-tit">
											<span>{{ getGoodsName(goods.goodsprefix,goods.goodsname) }}</span>
										</p>
										<p class="goods-info-spec">
											<span>{{ goods.skuname }}</span>
										</p>
									</div>
									<div class="goods-info-price-wrapper">
										<p class="goods-info-price">
											<span class="price-txt">¥{{goods.salesprice.toFixed(2)}}</span>
											<span class="shop-num"> 
												<i class="mul-signal">X</i>
												<em>{{goods.shopnum}}</em>
											</span>
										</p>
									</div>
								</div>
							</div>
							<div class="goods-backup">
								<label>备注：</label>
								<input type="text" v-model="goods.note" class="backup-inp" placeholder="给商家留言" maxlength="30">
							</div>
						</li>
					</ul>
				</section>
				<div class="invoice-info" @click="navToInvoice">
					<span class="invoice-info-lbl">发票</span>
					<span class="invoice-info-txt">{{ invoiceTxt }}</span>
					<i class="icon icon-arrow"></i>
				</div>
				<div class="bill">
					<p class="bill-para">
						<span class="bill-lbl">商品总额</span>
						<span class="bill-txt">¥ {{totalMoney}}</span>
					</p>
					<p class="bill-para">
						<span class="bill-lbl">运费</span>
						<span class="bill-txt">+ ¥ {{ orderGoodsInfo.shippingfee.toFixed(2) }}</span>
					</p>
					<p class="bill-para actual-bill">
						<span class="bill-lbl">实付金额</span>
						<span class="bill-txt">¥ {{totalMoney}}</span>
					</p>
				</div>
			</div>
			<div class="empty-icon empty-icon-goods" v-else>
				<span>抱歉，您购买的商品被抢光啦!</span>
				<span @click="redirect('/cart')" class="toCartBtn">去购物车</span>
			</div>
			
		</div>
		<section class="order-ft fixed-btm" v-if="!isShowEmpty" @touchmove.prevent>
			<div class="order-ft-summary">
				<p class="summary-info">
					<span class="summary-num">共{{totalGoodsNum}}件商品</span>
					<span class="summary-price">合计：<em class="price-txt">¥{{totalMoney}}</em></span>
				</p>
			</div>
			<div class="order-ft-apply" @click="applyOrder">
				<span>提交订单</span>
			</div>
		</section>
		<goodsException v-bind="popup" @close="hidePopup" @lfBtnClick="popupBtnHandler(2)" @rtBtnClick="popupBtnHandler(1)"></goodsException>
		<transition name="slide">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script>
	import { mapState,mapMutations } from 'vuex';
	import { Base64 } from 'js-base64';
	import { Cart,Addr } from '@/apis';
	import Store from '@/utils/store';
	import Indicator from '@/components/common/indicator';
	import Toast from '@/components/common/toast';
	import '@/assets/styles/empty.css';
	import goodsException from '@/components/GoodsException';
	import CnfrmBox from '@/components/common/confirm-box';
	import { getQueryParam } from '@/utils/common';
	export default {
		data(){
			return {
				saleType:0,
				orderGoodsInfo: {
					goodstotalprice: 0,
					goodsdistotalamount: 0,
					shippingfee: 0,
					orderdistotalamount: 0,
					orderamount: 0,
					orderdueamount: 0,
					list: []
				},
				addrId:0,
				isSbmting:!1,
				pageLoaded:!1,
				isShowEmpty:!1,
				invoiceType:0,
				isNeedInvoice:!1,

				popup:{
					show:!1,
					tit:'',
					lfTxt:'',
					rtTxt:'',
					goodsList:[],
					t:1//弹窗类型 1 配送不到 2 下架卖光异常等
				}
			}
		},
		methods:{
			...mapMutations(['ADDR_SAVE','ADDRIDX_CHANGE']),
			applyOrder(){
				
				if (this.isSbmting) {
					return;
				}
				const formData = [];
				const goodsList = this.orderGoodsInfo.list;
				if(goodsList.length<=0){
					Toast('没有商品哦');
					return;
				}

				if(this.addrList.length<=0 || this.addrInfo.address_id <=0){
					Toast('请选择收货地址');
					return;
				}

				if (this.invoiceType > 2 || this.invoiceType < 0) {
					Toast('发票类型错误');
					return;
				}

				if(this.isNeedInvoice && this.invoiceType <= 0){
					this.showMustInvoice();
					return;
				}

				const ct = this.$route.query.ct;

				let invinfo = null;

				if(this.invoiceType >= 0){
					invinfo = encodeURIComponent(this.invoiceType + '|' + ct);
				}else{
					invinfo = '';
				}

				for(let goods of goodsList){
					formData.push({
						skuid:goods.skuid,
						note:goods.note
					});
				}

				this.isSbmting = !0;
				//Indicator.show('正在提交...');
				if(this.saleType == 2){
					//限时抢购商品结算
					Cart.createFlashOrder(this.addrInfo.address_id, invinfo, formData[0].skuid, 1, formData[0].note, 0 ,'').then((res) => {
						this.isSbmting = !1;
						Indicator.close();
						this.dealOrderCreateResult(res,true);
					}, (err) => {
						Indicator.close();
						this.isSbmting = !1;
					});
				}else{
					let formDataString = JSON.stringify(formData)
					Cart.createOrder(this.addrInfo.address_id, invinfo, formDataString).then((res) => {
						this.isSbmting = !1;
						Indicator.close();
						this.dealOrderCreateResult(res,false);
					}, (err) => {
						Indicator.close();
						this.isSbmting = !1;
					});
				}
			},
			dealOrderCreateResult(res,isact){
				const ERR = this.$ERR;
				const code = res.code;
				if(code == ERR.NORMAL){
					this.navToPay(res.data);
				}else if(code == ERR.NO_GOODS_ADDR){
					if(isact){
						Toast('您所选区域配送不到');
					}else{
						this.popup.t = 1;
						this.showPopup('以下商品，在您所选区域配送不到','返回购物车','修改地址',res.data.failedgoods);
					}
				}else if(/^(3313|3314|3315|3403)$/.test(code)){
					if(isact){
						Toast('商品已抢完，请稍后再试~');
					}else{
						this.popup.t = 2;
						this.showPopup('亲，商品太热销了，库存不足了','返回购物车','',res.data.failedgoods);
					}
				}else if(code == 3402){
					Toast('发票有更新，请重新确认');
				}else if(code == 3621){
					this.showMustInvoice();
				}else if(code == 3404){
					Toast(res.message || '已参与该活动');
				}else{
					Toast(`系统繁忙，请稍后重试![${code}]`);
				}
			},
			showMustInvoice(){
				let alertMessage = '为保障您的权益，必须开具个人或企业发票，请填写开票信息。';
				CnfrmBox.alert(alertMessage).then(() => {
					this.navToInvoice();
				}, () => {})
			},
			updateInvoiceType(){
				// this.invoiceType = ~~(this.$route.query.ivType || (this.isNeedInvoice && 1));
				this.invoiceType = ~~this.$route.query.ivType;
			},
			popupBtnHandler(action) {
				const t = this.popup.t;
				if(action == 1){
					if(t==1){
						this.redirect('/order/addr-select');
					}else if(t==2){
						this.$router.go(0);
					}
				}else if(action == 2){
					this.redirect('/cart');
				}
				this.hidePopup();
			},
			hidePopup(){
				const popup = this.popup;
				popup.show = !1;
				popup.tit = '';
				popup.lfTxt = '';
				popup.rtTxt = '';
				popup.goodsList.splice(0);
			},
			showPopup(tit,lfTxt,rtTxt,list){
				const popup = this.popup;
				popup.tit = tit;
				popup.lfTxt = lfTxt;
				popup.rtTxt = rtTxt;
				popup.goodsList.splice(0);
				popup.goodsList.push(...list);
				popup.show = !0;
			},
			navToPay({orderId,orderNo,orderAmount}){
				let orderStr = Base64.encode([orderId,orderNo,orderAmount].join('|'));
				orderStr = orderStr.split('').map(s=>(String.fromCharCode(s.charCodeAt(0)+0Xa))).join('');
				this.$router.replace({
					path:'/pay',
					query:{
						shopId:this.shopId,
						cnt:encodeURIComponent(orderStr)
					}
				});
			},
			navToAddrPage(){
				let toPath = this.addrList.length > 0 ? '/order/addr-select' : '/order/addr-select/new';
				const params = {
					shopId: this.shopId
				};
				const addrId = ~~this.$route.query.aid || this.addrId;
				if(addrId){
					params.aid = addrId;
				}
				this.$router.push({
					path: toPath,
					query: params
				});
			},
			getGoodsName(prefix, goodsName) {
				return prefix ? (prefix + ' ' + goodsName) : goodsName;
			},
			processingData(list){
				if(!list || list.length <= 0){
					return;
				}
				for(let item of list){
					item.note = '';
				}
				return list;
			},
			loadCartData(){
				const qs = getQueryParam(location.search);
				const skuId = qs('skuId');
				const shopId = qs('shopId');
				this.saleType = qs('saleType');
				if(this.saleType == 2){
					//加载限时抢购订单商品
					Cart.getFlashList(skuId,1).then((res) => {
						Indicator.close();
						this.pageLoaded = !0;
						if(res.code == this.$ERR.NORMAL){
							const data = res.data;
							const list = data.list;
							if (!list || list.length <= 0) {
								this.isShowEmpty = !0;
								return;
							}
							data.list = this.processingData(list).filter(goods => goods.isvalid);
							if (data.list.length <= 0) {
								this.isShowEmpty = !0;
								return;
							}
							this.isNeedInvoice = data.mustInvoice;
							// this.invoiceType = this.invoiceType || (this.isNeedInvoice ?  1 : 0);
							Object.assign(this.orderGoodsInfo,data);
						}else{
							this.isShowEmpty = !0;
						}
					}).catch((err) => {
						Indicator.close();
						console.log(err);
					})
				}else{
					Cart.getList({
						IsSelect: true
					}).then((res) => {
						Indicator.close();
						this.pageLoaded = !0;
						if(res.code == this.$ERR.NORMAL){
							const data = res.data;
							const list = data.list;
							if (!list || list.length <= 0) {
								this.isShowEmpty = !0;
								return;
							}
							data.list = this.processingData(list).filter(goods => goods.isvalid);
							if (data.list.length <= 0) {
								this.isShowEmpty = !0;
								return;
							}
							this.isNeedInvoice = data.mustInvoice;
							// this.invoiceType = this.invoiceType || (this.isNeedInvoice ?  1 : 0);
							Object.assign(this.orderGoodsInfo,data);
						}else{
							this.isShowEmpty = !0;
						}
					}).catch((err) => {
						Indicator.close();
						console.log(err);
					})
				}
			},
			navToDetail(skuId, spuId){
				this.$router.push({
					path:'/detail',
					query:{
						shopId: this.shopId,
						skuId: skuId,
						spuId: spuId
					}
				});
			},
			navToInvoice(){
				this.redirect('/order/invoice', Object.assign({}, this.$route.query, {
					ivType: this.invoiceType,
					mobile: this.addrInfo.mobile,
					isNeedInvoice: this.isNeedInvoice
				}));
			},
			loadAddrData(){
				Addr.getList().then((res) => {
					this.addrId = ~~this.$route.query.aid;
					if(res.code == this.$ERR.NORMAL){
						if(res.data.length === 0){
							return;
						}
						this.ADDR_SAVE(res.data);
						let idx = -1;
						if (this.addrId) {
							idx = this.addrList.findIndex(addr => addr.address_id == this.addrId);
						} else {
							idx = this.addrList.findIndex(addr => addr.default_flag == 1);
							this.addrId = this.addrList[idx].address_id;
						}
						(idx > -1) && this.ADDRIDX_CHANGE(idx);
					}
				}, (err) => {
					console.log(err);
				});
			},
			getAddrTxt(addrInfo){
				return addrInfo.areaAName+addrInfo.areaBName+addrInfo.areaCName+addrInfo.areaDName+addrInfo.address_detail;
			},
			init(){
				Indicator.show('加载中...');
				this.loadCartData();
				this.loadAddrData();
				this.invoiceType = ~~this.$route.query.ivType || 0;
			}
		},
		computed:{
			...mapState(['shopId','addrList','addrIdx']),
			totalMoney(){
				return this.orderGoodsInfo.orderdueamount.toFixed(2);
			},
			totalGoodsNum(){
				return this.orderGoodsInfo.list.reduce((prev,item)=>{
					return prev + item.shopnum;
				},0);
			},
			addrInfo(){
				let addr = {
					address_id: 0,
					user_id: 0,
					contact_name: '',
					mobile: '',
					telephone: '',
					areaaid: 0,
					areabid: 0,
					areacid: 0,
					areadid: 0,
					areaAName: '',
					areaBName: '',
					areaCName: '',
					areaDName: '',
					address_detail: '',
					zip: '',
					address_flag: 0,
					default_flag: 0,
					label_name: ''
				};
				return Object.assign(addr,this.addrList[this.addrIdx]);
			},
			invoiceTxt(){
				return ['不开票','普通-个人','普通-单位'][this.invoiceType];
			}
		},
		watch: {
			'$route': 'updateInvoiceType'
		},
		components:{
			goodsException
		},
		mounted(){
			this.init();
		}
	}
</script>
<style scoped>
	@import '../../assets/styles/mixins';
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
		@extend page;
	}
	.icon-arrow{
		@mixin icon 0.12rem,0.26rem,../../assets/images/arrow-new.png;
	}
	.toCartBtn{
		display: block;
		width: 2.52rem;
		height:0.62rem;
		margin: 0.3rem auto 0;
		line-height: 0.62rem;
		border-radius: 0.4rem;
		border:1px solid $main-color;
		color:$main-color;
		font-size: 0.28rem;
		background-color: #fff;
		text-align: center;
	}
	.order-wrapper{
		padding-bottom: 0.4rem;
		padding-top:2.03rem; 
	}
	.addr-cntnr{
		height: 2.03rem;
		padding: 0 0.3rem;
		background-color: #fff;
	}
	.addr-cntnr{
		position: fixed;
		top:0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		font-size: $fs-28;
		z-index: 10;
		.addr-icon{
			@mixin icon 0.4rem,0.4rem,../../assets/images/order-addr-icon.png;
		}
		
		.addr{
			flex:1;
			margin-left: $mg-20;
			margin-right: $mg-20;
			/*.addr-person-name{
				margin-right: $mg-30;
			}*/
			.addr-person{
				display: flex;
				align-items: center;
			}
			.addr-person-tel{
				margin-left: $mg-30;
				margin-right: $mg-30;
			}
			.addr-detail{
				margin-top: $mg-20;
				line-height: 1.5;
			}
			.no-addr{
				font-size: $fs-28;
				color:$color-80;
			}
			.addr-lbl{
                min-width: 0.8rem;
                height: 0.36rem;
                line-height: 0.36rem;
                padding: 0 0.1rem;
                border: 1px solid currentColor;
                border-radius: 0.04rem;
                color:#3F99FE;
                font-size: 0.22rem;
                text-align: center;
                box-sizing: border-box;
                
                &.default{
                    color:$main-color;
                    margin-right: 0.24rem;
                }
            }
		}
		&:after{
			content:'';
			position: absolute;
			left: 0;
			top:100%;
			height: 0.05rem;
			width: 100%;
			background:url(../../assets/images/addr-color-line.jpg) 0 0/ cover;
		}	
	}
	.goods-cntnr{
		margin-top: 0.25rem;
		font-size: $fs-28;
		.goods-item{
			padding: 0 $mg-30;
			margin-bottom: $mg-20;
			background-color: #fff;
			border-bottom: 1px solid $color-d9;
		}
		.goods-detail{
			display: flex;
			padding: $mg-40 0;
			border-bottom: 1px solid $color-d9;
			.goods-pic{
				width: 1.6rem;
				height: 1.6rem;
				margin-right:0.2rem;
				overflow:hidden;
				border:1px solid $color-d9;
				border-radius: $radius-6; 
				img{
					display: block;
					width: 100%;
					height: auto;
				}
			}
			.goods-info-price-wrapper{
				display: flex;
				align-items: flex-end;
				height: 0.5rem;
				line-height: 1.1;
			}
			.goods-info{
				display: flex;
				flex-direction: column;
				justify-content: space-between;
	
				flex:1;
				align-self: flex-start;

				min-height: 1.6rem;
				.goods-info-spec{
					margin-top: 0.08rem;
					color:$color-80;
					font-size: $fs-24;
				}
				.goods-info-tit{
					overflow : hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					line-height: 1.5;
				}
				.goods-info-price{
					display: flex;
					justify-content: space-between;
					width: 100%;
					.price-txt{
						color:$main-color;
						font-size: $fs-32;
						&:first-letter{
							display: inline-block;
							margin-right: 0.06rem;
						}
					}
					.shop-num{
						color:$color-80;
						.mul-signal{
							font-size: 0.24rem;
						}
						em{
							font-size: 0.32rem;
						}
					}
				}
				
			}
		}

		.goods-backup{
			display: flex;
			align-items: center;
			font-size: $fs-28;
			height: 0.9rem;
			line-height: 0.9rem;
			input{
				height: 0.6rem;
				flex:1;
				font-size: $fs-28;
				color:#333;
				&::-webkit-input-placeholder {
					color:$color-80;
					font-size: $fs-28;
				}
			}
		}
	}

	.invoice-info{
		display: flex;
		align-items: center;
		height: 0.88rem;
		padding: 0 $mg-30;
		font-size: $fs-28;
		color: #666;
		background-color: #fff;
		.invoice-info-txt{
			margin-right: 0.18rem;
			text-align: right;
			flex: 1;
		}
	}

	.bill{
		margin-top: 0.2rem;
		padding: 0.2rem 0.3rem;
		color: #666;
		font-size: 0.26rem;
		background-color: #fff;
		.bill-para{
			display: flex;
			justify-content: space-between;
			line-height: 0.37rem;
			margin-bottom: 0.12rem;
			&:last-of-type{
				margin-bottom: 0;
			}
			&.actual-bill {
				.bill-lbl{
					color: #333;
				}
				.bill-txt{
					color: $main-color;
				}
			}
		}
	}

	.goods-summary{
		text-align: right;
		color:#bbb;
		font-size: 0.24rem;
		padding-right: 0.3rem;
	}
	.empty-icon-goods{
		padding-top: 2rem;
	}
	.fixed-btm{
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1.0rem;
	}
	.order-ft{
		display: flex;
		background-color: #fff;
		box-shadow: 0 -7px 12px 0 rgba(200,200,200,0.2);
		z-index: 11;
		color:$color-80;
		.order-ft-summary{
			/*display: flex;
			flex-direction: column;
			justify-content: center;*/
			line-height: 1.0rem;
			flex:1;
			padding-right: $mg-30;
			font-size: $fs-28;
			.summary-num{
				margin-right:0.20rem; 
			}
			.summary-info{
				text-align: right;
				.price-txt{
					display: inline-block;
					color:$main-color;
					font-size: $fs-32;
					&:first-letter{
						display: inline-block;
						margin-right: 0.06rem;
					}
				}
			}

		}
		.order-ft-apply{
			width: 2.76rem;
			font-size: 0.34rem;
			color: #fff;
			text-align: center;
			line-height: 1.0rem;
			background-color: $main-color;
		}
	}
	.slide-enter-active,.slide-leave-active{
		transition: all .3s ease-in-out;
	}
	.slide-enter,.slide-leave-to{
		transform: translate3d(100%,0,0);
	}
	
	.cnfrmbox-overlay{
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0,0,0,.5);
		z-index: 40;
	}

	.cnfrmbox{
		position: fixed;
		top: 50%;
		left:50%;
		width: 5.5rem;
		transform: translate3d(-50%,-60%,0);
		z-index: 41;
		font-size: 0.24rem;

		border-radius: 3px;
		background-color: #fff;
		
		.cnfrmbox-hd{
			position: relative;
			height: 0.94rem;
			line-height: 0.94rem;
			color:$main-color;
			text-align: center;
			
			.hd-close{
				position: absolute;
				right: 0.1rem;
				top: 0.1rem;

				width:0.28rem;
				height: 0.28rem;
				&:after{
					content:'';
					position:absolute;
					top: -0.1rem;
					right: -0.1rem;
					bottom: -0.1rem;
					left: -0.1rem;
				};

			}
			.hd-close-icon{
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				&:before,&:after{
					content:'';
					position: absolute;
					top:50%;
					left: 0;
					width:100%;
					height: 1px;
					background-color: #979797;
				}
				&::before{
					transform: rotate(-45deg);
				}
				&::after{
					transform: rotate(45deg);
				}
			}
		}
		.cnfrmbox-bd{
			border-top: 1px solid #dedede;
			border-bottom: 1px solid #dedede;
			padding: 0 0.3rem;

		}
		.goods-cnt{
			max-height: 2.42rem;
			overflow-y: auto;
			margin: 1px 0;		
			-webkit-overflow-scrolling:touch;
			.goods-item{
				display: flex;
				padding: 0.2rem 0;
				border-bottom: 1px solid #f5f5f5;
				&:last-of-type{
					border-bottom:none;
				};
				.goods-name-txt{
					color:#666;
				}
				.goods-name{
					flex: 1;
				}
				.goods-img{
					width: 0.8rem;
					height: 0.8rem;
					margin-right: 0.2rem;
					border-radius: 0.05rem;
					img{
						display: block;
						width: 100%;
						height: 100%;
					}
				}
			}
		}
		.cnfrmbox-ft{
			height: .8rem;
			line-height: .8rem;
			.btns{
				display: flex;
				height: 100%;
				.btn{
					flex: 1;
					color:#666;
					text-align: center;
					&.btn-toAddr{
						color:$main-color;
						border-right: 1px solid #dedede;
					}
				}
			}

		}
	}
</style>