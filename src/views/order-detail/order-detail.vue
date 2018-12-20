<template>
	<div>
		<div class="order-wrapper order-detail-wrapper" v-if="detailObj.orderno">	
			<div class="order-inner" v-show="pageShow">
				<div class="order-detail-state align-flex">
					<div class="state">
						<p>{{detailObj.statustext}}</p>
						<p>{{stateText}}</p>
					</div>
					<div class="express-icon" :class="iconCls"></div>
				</div>	
				<router-link class="order-detail-logistics align-flex" tag="div" v-if="expressnoitems.length > 0"
				:to="{path: '/order-detail/express-detail', query: expressQuery}">
					<i class="logistics-icon"></i>
					<div class="logistics-state flex-one">
						<p>{{expressSteps.content}}</p>
						<p>{{expressSteps.starttime}}</p>
					</div>
					<i class="arrow-icon"></i>
				</router-link>		
				<div class="order-detail-addr align-flex">
					<i class="addr-icon"></i>
					<div class="addr-text flex-one">
						<div class="justify-flex">
							<span class="addr-name">{{orderCheckedAddr.fullname}}</span>
							<span>{{orderCheckedAddr.tel}}</span>
						</div>
						<p class="addr-info gray9">{{orderCheckedAddr.province + orderCheckedAddr.city + orderCheckedAddr.county + orderCheckedAddr.street1 + orderCheckedAddr.street2}}</p>
					</div>
				</div>		
				<div class="order-change-at tb1px" v-if="curStatus == 1 || detailObj.allowmodifaddress">				
					<!-- <span class="count-time" v-if="curStatus == 1"><count-down-timer :seconds="detailObj.paymentendtime"></count-down-timer></span> -->
					<a href="javascript:;" class="btn tb1px" v-if="detailObj.allowmodifaddress" @click="changeOrderAddr">修改地址</a>
				</div>	
				<div class="order-list-wrapper">
					<div class="order-shop align-flex tb1px">
						<i class="shop-icon"></i>
						<p>{{detailObj.storename}}</p>
					</div>
					<div class="order-list-inner tb1px" v-for="item in detailObj.lines" :key="item.id ">
						<div class="order-item">
							<router-link class="order-item-inner" tag="div" 
								:to="item.activitytype == 2 ? {path: '/detail', query:{skuId: item.skuid, shopId: shopId, spuId: item.spuid}} 
								: {path: '/detail', query:{skuId: item.skuid, shopId: shopId}}">
								<div class="order-list-item flex tb1px">
									<div class="goods-pic tb1px"><img :src="item.skuimage" alt=""></div>
									<div class="goods-info flex-one">
										<div class="justify-flex">
											<div class="info-l">
												<p class="name">{{item.spuname}}</p>
												<span class="spec">{{item.spec}}</span>
											</div>
											<div class="info-r">
												<strong class="money-symbol">{{item.salesprice.toFixed(2)}}</strong>
												<p class="num">x&nbsp;{{item.qty}}</p>
											</div>
										</div>	
										<router-link class="opt-btn tb1px" v-if="item.canapplyorderservice" tag="div"
											:to="{path: '/after-sale-apply', query: {skuid : item.skuid, orderNo : orderNo, shopId: shopId}}">申请售后</router-link>										
										<div class="opt-btn tb1px" v-else-if="item.skustatus > 1" :class="{'disabled' : item.asorderno == ''}" @click.stop="checkNavAs(item)">{{item.skustatustext}}</div>										
										<!-- <div class="opt-state" v-else>{{item.skustatus > 1 ? item.skustatustext : ''}}</div> -->
									</div>
								</div>
							</router-link>
							<!-- <div class="order-total">
								<span>合计</span>
								<strong class="money-symbol">{{item.linetotal.toFixed(2)}}</strong>
							</div> -->
						</div>
						<div class="order-detail-messge flex">
							<span class="name">留言：</span>
							<p class="text flex-one">{{item.note || '无'}}</p>
						</div>
					</div>
				</div>	
				<div class="order-total">
					<span>总计：</span>
					<strong class="money-symbol">{{detailObj.goodstotal && detailObj.goodstotal.toFixed(2)}}</strong>
				</div>	
				<div class="order-invoice">
					<div class="order-invoice-detail">
						<p>
							<span>发票类型：</span>
							<span v-if="detailObj.invoiceapplystatus == 1">不开发票</span>
							<span v-else>普通发票{{ invoiceWay['type-' + detailObj.invoiceway] }}</span>
						</p>
						<p v-if="detailObj.invoiceapplystatus > 1"><span>发票抬头：</span><span>{{ invoiceTitleType['type-' + detailObj.invoiceapply.invoicetitletype] }}</span></p>
						<p v-if="detailObj.invoiceapplystatus > 1"><span>发票内容：</span><span>{{ invoiceConType['type-' + detailObj.invoiceapply.invoicecontenttype ] }}</span></p>	
						<div v-if="canInvoiceApply" class="order-invoice-req">							
							<span @click="reqInvoice">申请开票</span>
							<i class="tip" @click="showInvoiceTip"></i>
						</div>
					</div>

					<div class="order-invoice-opt tb1px" v-if="detailObj.iscreator && invoiceIsExist">						
						<span class="btn invoice tb1px" @click="lookInvoice">查看发票</span>
						<span class="btn email tb1px" @click="showSendEmail">发送邮箱</span>
					</div>
				
				</div>
				<div class="bill">
					<p class="bill-para">
						<span class="bill-lbl">商品总额</span>
						<span class="bill-txt">¥ {{detailObj.goodstotal && detailObj.goodstotal.toFixed(2)}}</span>
					</p>
					<p class="bill-para">
						<span class="bill-lbl">运费</span>
						<span class="bill-txt">+ ¥ {{ detailObj.shippingfee.toFixed(2) }}</span>
					</p>
					<p class="bill-para" v-if="detailObj.usedincome > 0">
						<span class="bill-lbl">可用收益抵扣</span>
						<span class="bill-txt">- ¥ {{ detailObj.usedincome.toFixed(2) }}</span>
					</p>
					<p class="bill-para actual-bill">
						<span class="bill-lbl">实付金额</span>
						<span class="bill-txt">¥ {{ detailObj.surpluspayamount.toFixed(2) }}</span>
					</p>
				</div>	
				<div class="order-detail-type">
					<p><span>订单编号：</span><span>{{detailObj.orderno}}</span></p>
					<p><span>创建时间：</span><span>{{clearTime(detailObj.ordertime)}}</span></p>
					<p v-if="curStatus > 1 && !!detailObj.paytype"><span>付款时间：</span><span>{{clearTime(detailObj.paymentconfirmed)}}</span></p>
					<p v-if="curStatus > 1 && !!detailObj.paytype"><span>支付方式：</span><span>{{detailObj.paytype}}</span></p>
				</div>
				<div class="mjd-tel">客服热线：400-8988-111</div>						
			</div>        
		</div>	
		<div class="order-bottom" v-show="detailObj.orderno && pageShow">			
			<a href="javascript:;" class="btn tb1px" v-if="detailObj.cancustomercancelorder" @click="cancelOrder">取消订单</a>
			<router-link :to="{path: '/order-detail/express-detail', query: expressQuery}"
					class="btn tb1px" v-if="expressnoitems.length > 0">查看物流</router-link>
			<a @click="redirect('/chat', { bizno: detailObj.orderno, st:3, skuid: detailObj.lines[0].skuid  })" href="javascript:;" class="btn tb1px chat">人工客服</a>
			<a href="javascript:;" class="btn orange-btn tb1px" v-if="curStatus === 1" @click="checkPay(detailObj.id, detailObj.orderno, detailObj.dueamount)">付款 <count-down-timer @timeend="timeEndCancel" :seconds="detailObj.paymentendtime"></count-down-timer></a>
			<a href="javascript:;" class="btn orange-btn tb1px" v-if="detailObj.canshippingconfirm " @click="confirmOrder">确认收货</a>
		</div>

		<div class="order-send-email" v-if="invoiceIsExist">
			<transition name="send-bg-fade">
				<div class="send-bg" v-show="sendEmailVisible"></div>
			</transition>
			<transition name="send-fade">
				<div class="send-con" v-show="sendEmailVisible">
					<div class="send-bd">
						<span class="bd-message">我们将发票发送至您的邮箱，请注意查收！</span>
						<div class="send-inp">
							<input type="text" placeholder="请输入您的邮箱地址" v-model="sendEmailValue">
						</div>
					</div>
					<div class="send-ft">
						<a href="javascript:;" class="btn cancel-btn" @click="hideSendEmail">取消</a> 
						<a href="javascript:;" class="btn ok-btn" @click="sendToEmail">确定</a>
					</div>
				</div>
			</transition>
		</div>

		<transition name="router-slid" mode="out-in">
			<router-view></router-view>
		</transition>
	</div>
	
</template>

<script>
	import { Order, Shop, Pay, Invoice } from '@/apis/';	
	import { mapState, mapMutations } from 'vuex';
	import * as types from '@/store/mutations-type';
	import { Base64 } from 'js-base64';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import CountDownTimer from '@/components/CountDownTimer';
	import confirmBox from '@/components/common/confirm-box';

    export default {
        data(){
            return {
				detailObj : {
					
				},
				addrObj : {
					// "fullname": "",
					// "province": "",
					// "city": "",
					// "county": "",
					// "street1": "",
					// "street2": "",
					// "tel": ""
				},		
				expressnoitems : [],
				expressSteps : {
					'content' : '',
					'starttime' : ''
				},
				//开票方式
				invoiceWay: {
					'type-0' : '',
					'type-1' : '（纸质）',
					'type-10' : '（电子）'
				},
				//发票抬头
				invoiceTitleType: {
					'type-1': '单位',
					'type-10': '个人'
				},				
				invoiceConType: {
					'type-1': '商品明细' 
				},
				sendEmailVisible: false,
				sendEmailValue: ''
            }
        },
        computed:{
			...mapState(['shopId', 'orderCheckedAddr']),
            orderNo(){  // url 中的 订单号
                return this.$route.query.orderNo;
			},
			curStatus(){   //当前订单的 status
				return this.detailObj.status;
			},
			iconCls(){    //根据当前订单的 status 显示不同的 icon
				return this.getOrderTip(this.curStatus).cls;
			},
			stateText(){  //根据当前订单的 status 显示不同的 文案
				return this.getOrderTip(this.curStatus).str;
			},
			expressQuery(){     //跳转到物流查询页的query数据
				return {
					'orderNo' : this.orderNo,
					'shopId' : this.shopId				
				}
			},
			//发票已生成且是电子发票，可以线上查看和发送到邮箱
			invoiceIsExist(){
				return this.detailObj.invoiceapplystatus == 30 && this.detailObj.invoiceway == 10;
			},
			//能否申请开票
			canInvoiceApply(){
				return this.detailObj.iscreator && this.detailObj.caninvoiceapply;
			},
			pageShow(){     //判断页面是否需要隐藏
				let path = this.$route.path;
				return !/addr-detail|express-detail|apply-service/.test(path);
			}
		},
		watch: {
			//从申请售后页面返回
			'$route' (to, from){
				if(from.path.indexOf('apply-service') > -1){
					this.refreshPage();
				}
			}
		},
        methods:{
			...mapMutations([
				types.APPLY_SERVICE,
				types.AS_EXPITEM_SAVE,
				types.ORDER_CHECKED_ADDR
			]),
            refreshPage(){
                this.$router.go(0);
			},		
			//时间字符串去掉毫秒	
			clearTime(timeStr){
				return timeStr.replace(/:(\d+):(\d+):(\d+)/g, ':$1:$2');
			},
			//获取当前状态的 文案和样式
			getOrderTip(status) {
				let str = '',
					cls = '';
				switch (status) {
					case 1:
						str = '订单已提交，待付款';
						cls = 'express-step1';
						break;
					case 10:
						str = '订单信息已收到，将尽快发货';
						cls = 'express-step2';
						break;
					case 20:
						str = '商品已发出，请留意物流信息';
						cls = 'express-step3';
						break;
					case 30:
						str = '已确认收货';
						cls = 'express-step4';
						break;
					case 40:
						str = '急速退款确认中';
						cls = 'express-step6';
						break;
					case 50:
						if (this.detailObj.cancelordertype && this.detailObj.cancelordertype == 1) {
							str = '超时未支付，订单自动关闭';
						}
						else{
							str = '已取消订单';
						}
						cls = 'express-step5';
						break;
				}
				return {
					'str' : str,
					'cls' : cls
				};
			},
			//跳转选择收货地址页
			changeOrderAddr(){				
				let url = {
					path: '/order-detail/addr-detail', 
					query: {
						orderNo : this.orderNo, 
						shopId: this.shopId
					},
				}
				this.$router.push(url);
			},
			//检测库存
			checkPay(orderId, orderNo, orderAmount){
				this.reqStart('提交中...');
				Pay.check(orderNo).then((res) => {
					this.reqEnd();
					let resCode = res.code;
					if(resCode === this.$ERR.NORMAL){
						this.goPay(orderId, orderNo, orderAmount);
					} else if(resCode === this.$ERR.ORDER_SKU_ERROR){
						confirmBox.alert({
							'message' : '商品库存不足，请重新下单',
							'cnfrmBtnTxt' : '去看更多商品'
						}).then(
							resolve => {
								this.$router.push({
									path : '/category',
									query : {
										shopId : this.shopId
									}
								})
							},
							reject => {}
						)
					} else if(/-2|3601|3602|3603|3610/.test(resCode)){
						Toast(res.message + '' + resCode);
					}
				}).catch((err) => {
					this.reqEnd();
					this.reqFailed();
				})
			},
			//跳转支付页
			goPay(orderId, orderNo, orderAmount){
				let orderStr = Base64.encode([orderId,orderNo,orderAmount].join('|'));
				orderStr = orderStr.split('').map(s=>(String.fromCharCode(s.charCodeAt(0) + 0Xa))).join('');
				this.$router.push({
					path: '/pay',
					query : {
						shopId: this.shopId,
						cnt: window.encodeURIComponent(orderStr)
					}
				})
			},
			//取消订单
			cancelOrder(){
				confirmBox.open({
					'message' : '确认取消订单？',
					'cnfrmBtnTxt' : '确定'
				}).then(
					resolve => Order.cancel({orderNo : this.orderNo}), 
					reject => {}
				).then(
					(res) => {
						if(res) {
							if(res.code === this.$ERR.NORMAL){
								this.refreshPage()
							}else if(res.code == 3606){
								Toast('当前订单状态不允许取消订单')
								let that = this
								setTimeout(function(){
									that.refreshPage()
								},2000)
							} else {
								//Toast(res.message)
								Toast('取消失败，请稍候重试')
							}
						}
					}			
				);
			},
			//确认收货
			confirmOrder(){
				confirmBox.open({
					'message' : '确认已收货吗？',
					'cnfrmBtnTxt' : '确定'
				}).then(
					resolve => Order.confirm({orderNo : this.orderNo}), 
					reject => {}
				).then(
					(res) => {
						if(res) {
							if(res.code === this.$ERR.NORMAL){
								this.refreshPage()
							} else {
								//Toast(res.message)
								Toast('确认失败，请稍候重试')
							}
						}
					}				
				).catch((err) => {
					console.log(err);
				});
			},
			//倒计时完成后 关闭订单
			timeEndCancel(){
				Order.cancel({
					orderNo : this.orderNo,
					closeType : 2
				}).then((res) => {
					if(res.code === this.$ERR.NORMAL){
						Toast('订单超时已关闭');
						setTimeout( () => {
							this.getOrderDetails(this.orderNo);  //更新数据
						}, 1500);  
					} else {
						//this.reqFailed();
						//Toast(res.message + res.code);
					} 
				}).catch((err) => {
					this.reqEnd();
					console.log(err);
				});
			},
			getOrderDetails(orderNo){    //获取订单详情
				this.reqStart();
                return Order.getDetails(orderNo).then((res) => {
					this.reqEnd();					
                    if(res.code === this.$ERR.NORMAL){
						this.detailObj = res.data;
						//保存 订单地址信息到 vuex
						this.ORDER_CHECKED_ADDR(this.detailObj.shippingaddress);
						//保存 lines 相关数据到 vuex
						this.APPLY_SERVICE(this.detailObj.lines);
						//保存物流信息到vuex
						this.expressnoitems = this.detailObj.expressnoitems; 
						this.AS_EXPITEM_SAVE(this.expressnoitems);  						
						//返回物流id和编号						 
						return this.expressnoitems;
                    } else {
						Toast('获取订单明细失败, 请稍候重试');
						//this.reqFailed();
					}
                }).catch((err) => {
					this.reqEnd();
					//this.reqFailed();
					console.log(err);
				})
			},
			//获取第一个物流详情
			getExpress(res){      
				if(!res || res.length == 0){
					return;
				}				
				let exp = res[0];							
				return Order.getExpress(exp.shipmentid, exp.expressno);
			},
			//申请开票
			reqInvoice(){
				if (!this.canInvoiceApply) {
					return false;
				}
				this.redirect('/order/invoice', {
					ivType: 1,
					mobile: this.orderCheckedAddr.tel,
					orderNo: this.orderNo
				})
			},
			//点击申请发票的感叹号提示框
			showInvoiceTip(){
				confirmBox.open({
					'message': '仅限确认收货后一个月内，可申请开票。'
				}).then(
					resolve => {},
					reject => {}
				);
			},
			//显示发送邮箱的弹窗
			showSendEmail(){
				// if (!this.invoiceIsExist) {
				// 	return false;
				// }
				this.sendEmailVisible = true;				
			},
			//隐藏发送邮箱的弹窗	
			hideSendEmail(){
				this.sendEmailVisible = false;
			},	
			//发送邮箱
			sendToEmail(){
				let emailRE = /[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
				let err = '';

				if (!emailRE.test(this.sendEmailValue)) {
					err = '请输入正确的邮箱地址';
				}
				if (!this.detailObj.iscreator) {
					err = '您无权限操作此订单';
				}
				if (err) {
					Toast(err);
					return false;
				}

				this.reqStart('正在发送...');
				let email = encodeURI(this.sendEmailValue),
					orderNo = encodeURI(this.orderNo);
				Invoice.sendEmail(
					email,
					orderNo
				).then((res) => {
					this.reqEnd();
					if (res.code === this.$ERR.NORMAL) {						
						Toast('已发送至邮箱，请注意查收');
						this.hideSendEmail();
					} else {
						Toast(res.message);
					}
				}).catch((err) => {
					this.reqEnd();
					console.log(err);
					Toast('暂时无法发送，请稍候重试');
				});
			},
			//查看发票
			lookInvoice(){
				if (this.detailObj.invoicepath) {
					location.href = this.detailObj.invoicepath;
				}
			},
			visibilityHandler(){	
				if(this.curStatus === 1 && !document[this.hidden]){
					this.refreshPage();					
				}							
			},
			checkNavAs(item){
				let asNo = item.asorderno;
				if(!asNo){
					return;
				}
				this.$router.push({
					path: 'after-sale-detail', 
					query: {
						status : '0', 
						asNo : asNo, 
						shopId: this.shopId
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
				this.getOrderDetails(this.orderNo)
					.then(this.getExpress)
					.then((res) => {
						this.reqEnd();
						if(res && res.code == this.$ERR.NORMAL){
							let steps = res.data.steps;
							if(steps.length === 0){
								this.expressSteps.content = '暂无物流信息';
							} else {
								this.expressSteps = steps[0];
							}
						} else {							
							this.expressSteps.content = '暂无物流信息';							
						}						
					}).catch((err) => {
						this.reqEnd();
						console.log(err);
					});
				// if(!this.shopTel){
				// 	this.getShopTel();
				// }
            }
        },
        created(){
			this.init();
        },
        mounted(){
			if (typeof document.hidden !== "undefined") { 
				this.hidden = "hidden";
				this.visibilityChange = "visibilitychange";
			} else if (typeof document.webkitHidden !== "undefined") {
				this.hidden = "webkitHidden";
				this.visibilityChange = "webkitvisibilitychange";
			}

			document.addEventListener(this.visibilityChange, this.visibilityHandler, false);
		},
		beforeDestroy(){
			//confirmBox.close();
			document.removeEventListener(this.visibilityChange, this.visibilityHandler, false);
		},
        components:{
			CountDownTimer
        }
    }
</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';

    .order-wrapper{	
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left : 0;
		overflow: auto;
		-webkit-overflow-scrolling: touch;

		.order-inner{
			padding-bottom: 1rem;
		}		
		.order-list-wrapper{
			margin-top: $mg-20;
			background-color: #fff;

			.order-list-inner{
				padding: 0 $mg-30;
				border-bottom: 1px solid $color-d9;	
			}
			.order-item{
				margin-top: $mg-20;								
			}						
			.order-count{
				height: 1rem;
				padding: 0 0.3rem;
				line-height: 1rem;
				text-align: right;
				background-color: #fff;

				.count-btn{
					width: 1.68rem;
					height: 0.6rem;
					font-size: 0.26rem;
					vertical-align: middle;
					border-radius: 1rem;
				}
			}			
		}
		.order-list-item{
			min-height: 1.6rem;
			padding: $mg-40 0;
			border-bottom: 1px solid $color-d9;

			.goods-pic{
				width: 1.6rem;
				height: 1.6rem;
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
			},
			.goods-info{
				position: relative;
				padding-left: $mg-20;

				.opt-state{
					position: absolute;
					bottom: 0;
					right: 0;
					font-size: $fs-28;
					color: $color-80;
				}
				.opt-btn{
					position: absolute;
					bottom: 0;
					right: 0;
					padding: 0.08rem 0.18rem;
					font-size: $fs-28;
					color: $color-33;
					border: 1px solid $color-d9;						

					&.disabled{
						color: $color-b2;
					}
					&::after{
						content: '';
						position: absolute;
						width: 120%;
						height: 180%;
						top: 50%;
						left: 50%;
						transform: translate(-50%,-50%);
					}
				}
				.info-l{
					width: 3.2rem;		

					.name{
						display: -webkit-box;
						max-height: 0.88rem;
						margin-bottom: $mg-30;
						line-height: 0.44rem;
						font-size: $fs-28;
						color: $color-33;
						overflow: hidden;
						word-break: break-all;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
					}
					.spec{
						color: $color-80;
						font-size: $fs-24;						
					}
				}
				.info-r{
					text-align: right;
					font-size: $fs-28;
					color: $color-80;
					white-space: nowrap;
					
					strong{
						line-height: 0.44rem;
						color: $color-33;
					}
					.num{
						padding-top: $mg-20;
					}
				}
				.proceeds{
					position: absolute;
					bottom: 0.133333rem;
					right: 0;					
					font-size: 0.26rem;
				}
			}
		}  
		.order-total{
			height: 0.9rem;
			margin-top: $mg-20;
			padding: 0 $mg-30;
			line-height: 0.9rem;					
			font-size: $fs-28;
			color: $color-80;
			text-align: right;
			background-color: #fff;

			strong{
				color: $main-color;
				font-size: $fs-32;

				&::before{
					font-size: $fs-32;
				}
			}
		}  
		.order-invoice{
			margin-top: 0.2rem;			
			background-color: #fff;

			.order-invoice-detail{
				position: relative;
				padding: 0.3rem;
				font-size: 0.28rem;
				color: $color-80;

				p + p{
					padding-top: 0.18rem;
				}				
			}
			.order-invoice-req{
				position: absolute;
				top: 50%;
				right: 0.3rem;		
				height: 0.42rem;
				padding-right: 0.82rem;
				line-height: 0.42rem;
				font-size: 0.24rem;
				transform: translate(0, -50%);
				color: #3f99fe;

				.tip{
					position: absolute;
					top: 0;
					right: 0;
					width: 0.42rem;
					height: 0.42rem;
					background-image: url(../../assets/images/warn-icon@2x.png?v=20171107);
					background-size: contain;
				}
			}
			.order-invoice-opt{
				padding: 0.24rem 0.3rem;
				border-top: 1px solid $color-d9;
				font-size: 0.24rem;
				color: $color-33;
				overflow: hidden;

				.btn{
					float: right;
					margin-left: 0.48rem;
					padding: 0 0.32rem;
					height: 0.6rem;
					line-height: 0.6rem;
					border: 1px solid $color-80;
					border-radius: 0.1rem;
				}
			}			
		}    
	}
    .order-detail-state{
        position: relative;
        min-height: 1.7rem;
        padding: 0 $mg-30;
        color: #fff;	
        background-color: #ff681d;
        box-sizing: border-box;

        + .order-detail-addr{
            margin-top: 0;
        }
        .state{
            max-width: 4.8rem;
            font-size: $fs-36;
			line-height: 1;

            p + p{
                padding-top: $mg-20;
                font-size: $fs-28;
            }
            .small-size{
                font-size: $fs-28;
            }
        }
    }
    .order-detail-logistics{	
        padding: $mg-30;
        font-size: $fs-28;
        background-color: #fff;

        .logistics-icon{
            width: 20px;
            height: 20px;
            background-image: url(../../assets/images/order-state-icon.png?20171107);
            background-repeat: no-repeat;
            background-size: contain;
        }
        .logistics-state{
            padding: 0 $mg-20;
			color: $main-color;

			p + p{
				padding-top: $mg-12;
				color: $color-80;

				&:empty{
					padding-top:0;
				}
        	}
		}
    }
    .order-change-at{
        height: 0.9rem;
        line-height: 0.9rem;
        padding: 0 $mg-30;
        background-color: #fff;	
        text-align: right;
		border-top: 1px solid $color-d9;

        .count-time{
            padding-right: $mg-30;;
            font-size: $fs-28;
			color: $main-color;
        }
        .btn{
			display: inline-block;
            width: 1.6rem;
            height: 0.6rem;
			line-height: 0.62rem;
            font-size: $fs-28;
			color: $color-33;
			text-align: center;
            background-color: transparent;
			border: 1px solid $color-80; 
			border-radius: $radius-10;
        }
    }    
    .order-detail-addr{
        margin-top: $mg-20;
        padding: $mg-30;
		font-size: $fs-28;
        background-color: #fff;
		color: $color-80;  

        .addr-icon{
            width: 20px;
            height: 20px;
            background: url(../../assets/images/order-addr-icon.png?20171107) no-repeat;
			background-size: contain;
        }
        .addr-text{
            padding-left: $mg-20;
        }
		.addr-name{
			color: $color-33;
		}
        .addr-info{
            padding-top: $mg-20;	
			line-height: 0.44rem;		          
        }
    }    
    .order-shop{	
		height: 0.9rem;
        margin: 0 $mg-30;       
        font-size: $fs-28;
		color: $color-33;
		border-bottom: 1px solid $color-d9;

        .shop-icon{
            width: 20px;
            height: 20px;
            margin-right: $mg-20;
            background: url(../../assets/images/order-shop-icon.png?20171107) no-repeat;
            background-size: contain;
        }
        + .order-list-inner .order-item{
            margin-top: 0;
        }
    }    
    .order-detail-messge{	
		// height: 0.9rem;
		// line-height: 0.9rem;
		padding: 0.25rem 0;
		line-height: 0.4rem;
        font-size: $fs-28;
		color: $color-80;	
		box-sizing: border-box;
		// border-top: 1px solid $color-d9;	
    }    
	.order-send-email{
		.send-bg{
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: 1999;
			background-color: rgba(0,0,0,.7);
		}
		.send-con{
			position: fixed;
			left:50%;
			top:50%;
			color:#333;
			font-size: 0.32rem;
			background-color: #fff;
			z-index:2000;
			transform: translate3d(-50%,-70%,0);
		}
		.send-con{
			width:75%;
			border-radius: 5px;
			background-color: #fff;
			text-align: center;
			overflow: hidden;
			.send-hd{
				padding-top: 0.25rem;
				font-size: 0.36rem;
				font-weight: bold;
			}
			.send-bd{
				padding: 0.4rem 0.3rem;
			}
			.send-inp{
				height: 0.64rem;
				margin-top: 0.4rem;
				background-color: $color-f5;
				border-radius: 0.06rem;

				input{
					width: 100%;
					height: 100%;
					padding: 0.16rem 0.25rem;					
					color: $color-33;
					font-size: 0.26rem;
					box-sizing: border-box;
				}
			}
			.send-ft{
				height: 0.8rem;
				line-height: 0.8rem;
				border-top: 1px solid #eee;
				text-align: left;
				overflow: hidden;
				.btn{
					float: left;
					height: 100%;
					width: 50%;
					text-align: center;
					box-sizing: border-box;
					color:#333;
					&.cancel-btn{
						border-right: 1px solid #eee;
					}
					&.ok-btn{
						color:#ff681d;
					}
					&:only-child{
						width:100%;
					}
				}
			}
		}
		.send-bg-fade-enter-active,.send-bg-fade-leave-active{
			transition:opacity .2s linear;
		}
		.send-bg-fade-enter,.send-bg-fade-leave-to{
			opacity: 0;
		}
		.send-fade-enter-active,.send-fade-leave-active{
			transition:opacity .3s linear;
		}
		.send-fade-enter,.send-fade-leave-to{
			opacity: 0;
		}
	}
    .order-bottom{
        position: fixed;
        width: 100%;
        height: 1rem;
        bottom: 0;
        left: 0;
        padding: 0 $mg-30;
        line-height: 1rem;
        background-color: #fff;
        box-sizing: border-box;
        text-align: right;
		border-top: 1px solid $color-d9;
		// box-shadow: 0 0 0.1rem 0 rgba(155,143,143,0.6);
        z-index: 2;

        .btn{
            display: inline-block;
            min-width: 4em;
            height: 0.6rem;
			padding: 0 13px;
            line-height: 0.62rem;            
            font-size: $fs-28;
			color: $color-33;   
			text-align: center;         
            vertical-align: middle;
			border: 1px solid $color-80; 
			border-radius: $radius-10;			

            + .btn{
                margin-left: 0.3rem;
            }

            &.chat{
            	border-color: currentColor;
            	color: $main-color;
            }
        }
        .orange-btn{
			border-color: $main-color;			
            color: #fff;

			span{
				display: inline-block;
				width: 3em;
			}
        }
    }
    .express-icon{
        position: absolute;
        height: 100%;
        top: 0;	
        right: 0.6rem;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;	        
    }
    .order-detail-type{
        margin-top: $mg-20;
        padding: $mg-30; 
		color: $color-80;       
        font-size: $fs-24;
        background-color: #fff;

		p{
			padding-top: $mg-12;
			&:first-child{
				padding-top: 0;
			}
		}
    }
    .mjd-tel{
        padding: $mg-30 0;
		color: $color-80;
        font-size: $fs-28;
        text-align: center;
    }
	/*箭头*/
    .arrow-icon{
        display: block;
        width: 6px;
        height: 13px;
        background: url(../../assets/images/arrow-new.png?v=20171218) no-repeat;
        background-size: contain;
    }
    /*待付款*/
    .express-step1{   
        width: 1.4rem;
        background-image: url(../../assets/images/express-step1.png?v=20171107);
    }
    /*待发货*/
    .express-step2{   
        width: 1.33rem;
        background-image: url(../../assets/images/express-step2.png?v=20171107);
    }
    /*待收货*/
    .express-step3{   
        width: 1.61rem;
        background-image: url(../../assets/images/express-step3.png?v=20171107);
    }
    /*已完成*/
    .express-step4{   
        width: 1.68rem;
        background-image: url(../../assets/images/express-step4.png?v=20171107);
    }
    /*已关闭*/
    .express-step5{   
        width: 1.2rem;
        background-image: url(../../assets/images/express-step5.png?v=20171107);
    }
    /*退款中*/
    .express-step6{   
        width: 0.63rem;	
        background-image: url(../../assets/images/express-step6.png?20171107);
    }

    .router-slid-enter-active, .router-slid-leave-active {
        transition: all .4s;
    }
    .router-slid-enter, .router-slid-leave-active {
        transform: translate3d(2rem, 0, 0);
        opacity: 0;
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
</style>

