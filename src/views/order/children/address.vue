<template>	
	<div class="addr-wrapper">
		<div class="addr-cnt">
			<ul class="addr-list" v-if="addrList.length">
				<li class="addr-item" v-for="(item,idx) in addrList">
					<div class="addr-item-info">
						<p class="info-person">
							<span class="person-name">{{item.contact_name}}</span>
							<span class="person-phone">{{item.mobile}}</span>
						</p>
						<p class="info-detail">{{getAddrTxt(item)}}</p>
					</div>
					<div class="addr-item-opr">
						<div class="opr-group">
							<span class="opr-default">
								<input  name="radio" :checked="item.default_flag==1?!0:!1" :value="item.address_id" :id="'radio'+idx" type="radio">
								<label @click="addrSetDefault(item.address_id)" ><i class="iconfont icon-round"></i>设为默认</label>
							</span>
						</div>
						<div class="opr-group">		
							<span class="opr-edit" @click="editAddr(item,idx)">
								<i class="icon icon-edit"></i><em class="icon-txt">编辑</em>
							</span>
							<span class="opr-del" @click="delAddr(item,idx)">
								<i class="icon icon-del"></i><em class="icon-txt">删除</em>
							</span>
						</div>
					</div>
				</li>
			</ul>
		</div>
		<div  class="addr-ft" @click="navToAddAddrPage">
			<span>添加新地址</span>
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
	export default {
		data(){
			return {
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
				// this.initAddrChecked();
			},
			initAddrChecked(){
				this.addrDefault = this.addrList.find(addr => addr.default_flag == 1).address_id;
			},
			getAddrTxt(addrInfo){
				return addrInfo.areaAName+addrInfo.areaBName+addrInfo.areaCName+addrInfo.areaDName+addrInfo.address_detail;
			},
			editAddr(item,idx){
				this.$router.push({
					path:'/order/address/edit',
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
					Toast('收获地址不能超过5条');
					return;
				}else{
					this.$router.push({
						path: '/order/address/new',
						query: {
							shopId: this.shopId
						}
					});
				}
			},
			addrSetDefault(addrId){
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
				Addr.getList().then((res) => {
					if (res.code === this.$ERR.NORMAL) {
						this.init(res.data);
					}
				}, (err) => {
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
	$main-color:#ff681d;
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
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: #f5f5f5;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.addr-cnt{
		padding-bottom: 1.1rem;
		.addr-item{
			background-color: #fff;
			margin-bottom: 0.13rem;
			.addr-item-info{
				padding: 0.3rem;
				border-bottom: 1px solid #eaeaea;
				.info-person{
					display: flex;
					justify-content: space-between;
					font-size: 0.3rem;
				}
				.info-detail{
					margin-top: 0.2rem;
					color:#999;
					font-size: 0.28rem;
				}
			}
			.addr-item-opr{
				display: flex;
				justify-content: space-between;
				height: 0.8rem;
				line-height: 0.8rem;
				padding: 0 0.3rem;
				font-size: 0.28rem;
				color:#666;
				.opr-group{
					display: flex;
					.icon{
						@mixin icon 0.36rem,0.38rem;
						margin-right: 0.14rem;
						vertical-align: middle;
						&.icon-edit{
							background-image: url(../../../assets/images/addr-edit-icon2.png);
						}
						&.icon-del{
							background-image: url(../../../assets/images/addr-delete-icon.png);
						}
					}
					.icon-txt{
						vertical-align: -0.04rem;
					}

				}
				.opr-default{
					label{
						display:flex;
					}
					.icon-round{
						color:#999;
						font-size: 0.34rem;
						margin-right: 0.08rem;
						vertical-align: -0.02rem;
					}
					input:checked + label{
						color:$main-color;
					}
					input:checked + label .icon-round:before{
						color:$main-color;
						content:'\e657';
					}
				}
				.opr-edit{
					margin-right: 0.77rem;
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
		font-size: 0.32rem;
		color:#fff;
		background-color: #ff681d;
	}
	.slide-enter-active,.slide-leave-active{
		transition: all .3s ease-in-out;
	}
	.slide-enter,.slide-leave-to{
		transform: translate3d(100%,0,0);
	}
</style>
