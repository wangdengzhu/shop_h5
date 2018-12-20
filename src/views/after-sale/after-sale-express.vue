<template>
    <!-- <div class="express-after-wrapper">
		<div class="express-after-inner"> -->
			<!-- <div class="header">
				<p class="line gray6">退货地址</p>	
				<div class="order-detail-addr align-flex thin-bor-top">
					<i class="addr-icon"></i>
					<div class="addr-text flex-one">
						<div class="justify-flex gray3">
							<span>索德明</span>
							<span>17733223311</span>
						</div>
						<p class="addr-info gray9">广东省深圳市南山区桃源深处2栋103室</p>
					</div>
				</div>			
			</div> -->
			<!-- <div class="logis-wrapper">
				<div class="logis-detail">
					<p class="line gray6">快递信息</p>
					<div class="text-detail gray3 tb1px">
						<p>快递单号：{{asExp.expressno}}</p>
						<p>承运公司：{{asExp.expressname}}</p>
					</div>
				</div>
				<div class="logis-step">
					<ul class="logis-list tb1px">
						<li v-for="item in expressData" :key="item.time">					
							<div class="step-text">
								<i class="circle"></i>
								<span>{{item.context}}</span>
							</div>
							<p class="step-time grayb">{{item.time}}</p>					
						</li>
					</ul>	
					<p class="orange" v-if="isEmpty">{{emptyDataStr}}</p>
				</div>
				<div class="mjd-tel">客服热线：400-8988-111</div>
			</div>
		</div>
	</div> -->
	<div class="express-wrap">
		<div class="page" v-if="dataIsLoaded">
			<div class="express-state">
				<div class="icon"></div>
				<div class="state-wrap">
					<div class="state">{{expressState[expressDetail.state]}}</div>
					<div class="info">快递公司：{{expressDetail.expressname || expressname}}</div>
					<div class="info">快递单号：{{expressno}}</div>
					<div class="info">联系电话：{{expressDetail.servicetel || '暂无联系方式'}}</div>
				</div>
			</div>
			<div class="express-detail">
				<div class="no-express" v-if="noExpressInfo">
					<div class="icon"></div>
					<span>暂无物流信息</span>
				</div>
				<div class="list">
					<div v-for="(item, index) in expressDetail.expressdata" :key="item.time" :class="['item', (expressDetail.state == 3 && index == 0) ? 'finish' : '']">
						<div class="icon"></div>
						<div class="txt-wrap">
							<div class="txt" id="txt" v-html="item.context">{{item.context}}</div>
							<div class="time">{{item.time}}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { AfterSale } from '@/apis/';
	import { mapState } from 'vuex';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';

	export default {
		data() {
			return {
				noExpressInfo: false,
				dataIsLoaded: false,
				expressDetail: {},
				expressState: ['在途中', '已揽件', '疑难', '已签收', '退签', '派件中', '退回']
			}
		},
		computed: {
			expressname(){
				return this.$route.query.expressname
			},
			expressno(){
				return this.$route.query.expressno
			},
			reqInfo(){
				return this.$route.query.reqInfo
			}
		},
		methods: {
			getExpress(reqInfo) {
						
				this.reqStart();
				AfterSale.getAfterExpress(reqInfo).then(res => {
					this.reqEnd();
                    if(res.code === this.$ERR.NORMAL){
						this.expressDetail = res.data;
						this.dataIsLoaded = true;

						//手机号可拨打状态
						let myreg=/([1][3,4,5,7,8][0-9]{9})/g;
						let c = res.data.expressdata;
						for(let i=0;i<c.length;i++){
							 let m = []
							 let e = c[i].context.match(myreg)
							 if(e){
							 	for(let j=0;j<e.length;j++){
							 		m = e[j]
							 	}
							 }
							c[i].context = c[i].context.replace(myreg,'<a style="color:#ff8932" href="tel:'+m+'">'+m+'</a>')
						}

					}
					if(res.data.expressdata.length == 0) {
						this.noExpressInfo = true;
					}
                }).catch((err) => {
					this.reqEnd();
					console.log(err);
				})
			},
			init() {
				this.getExpress(this.reqInfo)
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
		},
		created(){
			this.init();
		},
	}

    // import { AfterSale } from '@/apis/';
	// import { mapState } from 'vuex';
	// import Toast from '@/components/common/toast';
	// import Indicator from '@/components/common/indicator';

    // export default {
	// 	data(){
	// 		return{
	// 			expressData : [],
	// 			isEmpty : false,
	// 			emptyDataStr : ''
	// 		}
	// 	},
	// 	computed: {
	// 		...mapState(['asExp']),
	// 		reqInfo(){
	// 			return this.$route.query.reqInfo
	// 		}
	// 	},
	// 	methods: {
	// 		getExpress(){
	// 			let reqInfo = this.reqInfo;
    //             if(!reqInfo){
    //                 return;
	// 			}
	// 			this.reqStart();
    //             AfterSale.getExpress(reqInfo).then((res) => {
	// 				this.reqEnd();
    //                 if(res.code === this.$ERR.NORMAL){
    //                     this.expressData = res.data.expressdata
	// 				} else {
	// 					this.isEmpty = true;
	// 					this.emptyDataStr = '未获取到物流信息';
	// 					//this.emptyDataStr = res.message;
	// 				}
    //             }).catch((err) => {
	// 				this.reqEnd();
	// 				console.log(err);
	// 			})
	// 		},
	// 		reqStart(text){
    //             text = text || '加载中...';
	// 			Indicator.show(text);
	// 		},
	// 		reqEnd(){				
	// 			Indicator.close();
	// 		},
	// 		reqFailed(){
	// 			Toast('网络异常，请稍候重试');
	// 		},
	// 		init(){
	// 			this.getExpress();
	// 		}
	// 	},
	// 	created(){
	// 		this.init();
	// 	},
	// 	mounted(){

	// 	}
    // }
</script>

<style lang="postcss" scoped>

	.express-wrap {
		position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
	}

	.express-state {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #fff;
		padding: .47rem .32rem;
		margin-bottom: .2rem;
	}
	.express-state .icon {
		width: 1.12rem;
		height: 1.12rem;
		background-image: url(../../assets/images/aftersale/transportation.png);
		background-size: 100%;
	}
	.state-wrap {
		flex: 1;
		margin-left: .3rem;
	}
	.state-wrap .state {
		font-size: .34rem;
		color: #333;
		margin-bottom: .22rem;
	}
	.state-wrap .info {
		color: #666;
		font-size: .28rem;
		margin-bottom: .06rem;
	}

	.express-detail {
		background-color: #fff;
	}

	.no-express {
		display: flex;
		align-items: center;
		padding: .39rem;
		font-size: .28rem;
		color: #FF681D;
	}
	.no-express .icon {
		width: .4rem;
		height: .4rem;
		background-image: url(../../assets/images/aftersale/no-express.png);
		background-size: 100%;
		margin-right: .2rem;
	}

	.list {
		padding: .5rem 1.06rem .5rem .53rem;
	}
	.item {
		position: relative;
		display: flex;
		justify-content: space-between;
		padding-bottom: .5rem;
		padding-left: .58rem;
	}
	.item .icon {
		position: absolute;
		top: 0;
		left: -.12rem;
		width: .24rem;
		height: .24rem;
		border-radius: 50%;
		background-color: #ccc;
	}
	.item:first-child .icon {
		background-color: #ff681d;
	}
	.item.finish .icon {
		width: .44rem;
		height: .44rem;
		background-image: url(../../assets/images/aftersale/signed.png);
		background-size: 100%;
		background-repeat: no-repeat;
		top: 0;
		left: -.22rem;
	}
	.item:not(:last-child) {
		border-left: .02rem solid #ececec;
	}
	.item:last-child {
		margin-top: -.12rem;
	}
	.txt-wrap {
		flex: 1;
	}
	.item .txt {
		margin-top: -.06rem;
		font-size: .28rem;
		color: #333;
		margin-bottom: .1rem;
	}
	.item .time {
		font-size: .24rem;
		color: #999;
	}

	/* @import '../../assets/styles/mixins.css';
	
    .express-after-wrapper{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        
		.header{
			padding: 0 0.3rem;
			background-color: #fff;
		}
		.line{
			height: 0.9rem;
			line-height: 0.9rem;
			font-size: 0.28rem;
		}
		.order-detail-addr{
			padding: 0.3rem 0;
			background-color: #fff;

			.addr-icon{
				width: 0.3rem;
				height: 0.42rem;
				background-image: url(/assets/images/order-addr-icon.png?20171107);
				background-repeat: no-repeat;
				background-size: contain;
			}
			.addr-text{
				padding-left: 0.22rem;
				font-size: 0.3rem;
			}
			.addr-info{
				padding-top: 0.16rem;
				font-size: 0.24rem;
			}
		}
		.logis-wrapper{
			.logis-detail{
				padding: 0 0.3rem;
				font-size: 0.26rem;
				background-color: #fff;
				
				.text-detail{
					padding: 0.3rem 0;
					line-height: 0.36rem;
					font-size: 0.26rem;
					border-top: 1px solid $color-d9;

					p + p{
						padding-top: 0.1rem;
					}
				}
			}
			.logis-step{
				position: relative;
				margin-top: 0.2rem;
				padding: 0.3rem;
				background-color: #fff;
				overflow: hidden;
			}
			.logis-list{
				position: relative;	
				margin-left: 0.15rem;
				padding-left: 0.43rem;
				border-left: 1px solid #dedede;

				li{	
					padding-bottom: 0.28rem;

					&:last-child{
						padding-bottom: 0;
					}	

					&:first-child{
						.step-text{
							color: #ff8932;
						}

						.circle{
							width: 12px;
							height: 12px;
							padding: 1px;	
							margin-left: -9px;
							background-color: #fff;
							border: 1px solid #ff681d;	
							box-shadow: 0 -14px #fff;                       

							&::before{
								content: '';
								display: block;
								width: 12px;
								height: 12px;
								background-color: #ff681d;
								border-radius: 12px;	
							}
						}
					}
				}
				.step-text{
					position: relative;
					line-height: 0.4rem;
					font-size: 0.28rem;
					color: #666;	
				}
				.step-time{
					padding-top: 0.09rem;
					font-size: 0.24rem;
				}
				.circle{
					position: absolute;
					width: 11px;
					height: 11px;
					top: 50%;
					left: -0.43rem;                
					transform: translate(0, -50%);
					margin-left: -6px;
					background-color: #eee;
					border-radius: 100%;	
					z-index: 2;
				}
			}
		}
		.mjd-tel{
			padding: 0.3rem 0;
			font-size: 0.28rem;
			color: #808080;
			text-align: center;
		}
	} */
</style>



