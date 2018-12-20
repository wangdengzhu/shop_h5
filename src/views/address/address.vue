<template>	
	<div class="addr-wrapper" >
		<div v-if="pageLoaded">
			<div class="addr-cnt">
				<ul class="addr-list" v-if="addrList.length">
					<li class="addr-item" v-for="(item,idx) in addrList">
						<div class="addr-item-info tb1px">
							<p class="info-person">
								<span class="person-name">{{item.contact_name}}</span>
								<span class="person-phone">{{item.mobile}}</span>
								<span v-if="item.label_name" class="addr-lbl tb1px">{{ item.label_name }}</span>
							</p>
							<p class="info-detail">{{getAddrTxt(item)}}</p>
						</div>
						<div class="addr-item-opr tb1px">
							<div class="opr-group">
								<span class="opr-default">
									<input  name="radio" :checked="item.default_flag==1?!0:!1" :value="item.address_id" :id="'radio'+idx" type="radio">
									<label @click="addrSetDefault(item)" ><i class="iconfont icon-round"></i>设为默认</label>
								</span>
							</div>
							<div class="opr-group">		
								<span class="opr-del" @click="delAddr(item,idx)">
									<i class="icon icon-del"></i><em class="icon-txt">删除</em>
								</span>
								<span class="opr-edit" @click="editAddr(item,idx)">
									<i class="icon icon-edit"></i><em class="icon-txt">编辑</em>
								</span>
							</div>
						</div>
					</li>			
				</ul>
				<div class="empty-wrapper" v-else>
					<div class="empty-icon empty-icon-addr">暂无收货地址</div>
				</div>			
			</div>
			<div class="addr-ft" @click="navToAddAddrPage">
				添加新地址
			</div>
		</div>
		<transition name="slide">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script>
	import { mapState,mapMutations } from 'vuex';
	import { Addr } from '@/apis';
	import Toast from '@/components/common/toast';
	import CnfrmBox from '@/components/common/confirm-box';
	import Indicator from '@/components/common/indicator';
	import '@/assets/styles/empty.css';
	export default {
		data(){
			return {
				pageLoaded: false
				// addrDefault:'',
				// isFirst:!0
			}
		},
		methods:{
			...mapMutations(['ADDR_SAVE','ADDRIDX_CHANGE','ADDR_DEL','ADDR_EDIT','ADDR_DEFAULT']),
			init(data){
				this.ADDR_SAVE(data);
				const defaultIdx = this.addrList.findIndex(addr => addr.default_flag == 1);
				this.ADDRIDX_CHANGE(defaultIdx);
				//this.initAddrChecked();
			},
			initAddrChecked(){
				this.addrDefault = this.addrList.find(addr => addr.default_flag == 1).address_id;
			},
			getAddrTxt(addrInfo){
				return addrInfo.areaAName+addrInfo.areaBName+addrInfo.areaCName+addrInfo.areaDName+addrInfo.address_detail;
			},
			editAddr(item,idx){
				let parentUrl = this.$route.path;
				this.$router.push({
					path: parentUrl + '/edit',
					query:{
						shopId:this.shopId,
						eidx:item.address_id
					}
				});
			},
			delAddr(item,idx){
				const addrId = item.address_id;
				if(item.default_flag == 1){
					Toast('默认地址不能删除')
					return;
				}
				const cnfrmTxt = '你确定删除这个地址吗？'
				CnfrmBox.open(cnfrmTxt).then(() => {
					Addr.del(addrId).then((res) => {
						if (res.code == this.$ERR.NORMAL) {
							Toast({
								toastTxt: '删除成功',
								iconCls: 'success'
							});
							this.ADDR_DEL(idx);
						}
					}).catch((err) => {
						console.log(err);
					})
				}, () => {

				});
				
			},
			navToAddAddrPage(){
				if(this.addrList.length>=5){
					Toast('收货地址不能超过5条');
					return;
				}else{
					let parentUrl = this.$route.path;
					this.$router.push({
						path: parentUrl + '/new',
						query: {
							shopId: this.shopId
						}
					});
				}
			},
			addrSetDefault(addr){
				if(addr.default_flag == 1){
					return;
				}
				const addrId = addr.address_id;
				Addr.setDefault(addrId).then((res)=>{
					if(res.code == this.$ERR.NORMAL){
						Toast({
							toastTxt: '设置成功',
							iconCls: 'success'
						});
						this.ADDR_DEFAULT(addrId);
					}
				},(err)=>{
					console.log(err);
				});
			},
			loadAddrData(){
				Indicator.show('加载中...');
				Addr.getList().then((res) => {
					Indicator.close();
					if (res.code === this.$ERR.NORMAL) {
						this.pageLoaded = true;
						if(res.data.length > 0){
							this.init(res.data);
						}
					}else{
						Toast('网络异常，请稍后重试!');
					}
				}, (err) => {
					Indicator.close();
					console.log(err);
				})
			}
		},
		watch:{
			// addrDefault(val){
			// 	if(this.isFirst){
			// 		this.isFirst = !1;
			// 		return;
			// 	}
			// 	this.addrSetDefault(val);
			// }
		},
		mounted(){
			this.loadAddrData();
		},
		computed:{
			...mapState(['addrList','shopId'])
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins';
	@define-mixin icon $w,$h,$url{
		display: inline-block;
		width: $w;
		height: $h;
		background: url($url) 0 0/cover;
		
	}
	input[type=radio]{
		display: none;
	}
	.addr-wrapper{
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: #f5f5f5;
		z-index: 1000;
		/* overflow-y: auto;
		overflow-x: hidden; */
	}
	.addr-cnt{
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;

		.addr-list{
			padding-bottom: 1.1rem;
		}
		.addr-item{
			background-color: #fff;
			margin-bottom: $mg-20;
			.addr-item-info{
				padding: $mg-40 $mg-30 0.34rem;
				border-bottom: 1px solid $color-d9;
				font-size: $fs-28;
				.info-person{
					display: flex;
					align-items: center;
					/*justify-content: space-between;*/
					.person-phone{
						 margin: 0 0.24rem 0  0.36rem;
					}
				}
				.info-detail{
					margin-top: 0.24rem;
					color:$color-80;
					line-height: 0.44rem;
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
				}
			}
			.addr-item-opr{
				display: flex;
				justify-content: space-between;
				height: 0.9rem;
				line-height: 0.9rem;
				padding: 0 $mg-30;
				font-size: $fs-24;
				color:$color-80;
				border-bottom: 1px solid $color-d9;
				box-sizing: border-box;
				.opr-group{
					display: flex;
					.icon{
						display: inline-block;
						width: 13px;
						height: 13px;
						margin-right: 0.12rem;
						background-repeat: no-repeat;
						background-position: 0 0; 
						background-size: cover;
						&.icon-edit{
							background-image: url(../../assets/images/icon-edit-addr.png);
						}
						&.icon-del{
							background-image: url(../../assets/images/icon-del-addr.png);
						}
					}
					.opr-edit,.opr-del{
						position: relative;
						display: flex;
						/*padding-left: 20px;*/
						align-items: center;
					}

				}
				.opr-default{
					label{
						display:flex;
						align-items: center;
					}
					.icon-round{
						color:$color-80;
						font-size: 0.32rem;
						margin-right: 0.12rem;
					}
					input:checked + label{
						color:#f50;
					}
					input:checked + label .icon-round:before{
						color:#f50;
						content:'\e657';
					}
				}
				.opr-edit{
					margin-left: 0.56rem;
				}
			}
		}
	}
	.addr-ft{
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1.0rem;
		line-height: 1.0rem;
		text-align: center;
		font-size: $fs-32;
		color:#fff;
		background-color:$main-color;		
	}
	.empty-wrapper{
		padding-top: 2rem;
	}
	.slide-enter-active,.slide-leave-active{
		transition: all .3s ease-in-out;
	}
	.slide-enter,.slide-leave-to{
		transform: translate3d(100%,0,0);
	}
</style>
