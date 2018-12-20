<template>
	<div class="newaddr-wrapper">
		<div class="newaddr-cnt">
			<form class="newaddr-form">
				<p class="form-ctrl tb1px">
					<label class="lbl " for="name">收货人</label>
					<input v-model="formData.name" maxlength="5" type="text" class="name" id="name" placeholder="请输入收货人真实姓名">
				</p>
				<p class="form-ctrl tb1px">
					<label class="lbl" for="phone">手机号码</label>
					<input v-model="formData.phone" type="tel" id="phone" placeholder="请输入收货人手机号码" maxlength="11">
				</p>
				<p class="form-ctrl tb1px">
					<label class="lbl" for="city">所在地区</label>
					<input v-model="formData.city" ref="city" @focus="showCityDlg()" type="text" id="city" placeholder="请选择地区">
				</p>
				<p class="form-ctrl tb1px" v-if="hasStreet">
					<label class="lbl" for="street">街道</label>
					<input v-model="formData.street" ref="street" @focus="showCityDlg(!0)" type="text" id="street" placeholder="请选择街道">
				</p>
				<p class="form-ctrl area tb1px">
					<textarea v-model="formData.detail" type="text" maxlength="30" class="area-detail" placeholder="详细地址（无需重复填写地区、街道）"></textarea>
				</p>
				<div class="form-ctrl form-ctrl--tags">
					<label class="lbl" for="street">标签</label>
					<div class="addr-tags">
						<span v-for="(tag,idx) in tagsArr" @click="changeAddrTag(idx)" :class="{'addr-tags__item--active':idx==tagIdx}" class="addr-tags__item tb1px">{{ tag.label_name }}</span>
						<span @click="showTagPage" v-if="tagsArr.length<6" class="addr-tags__item addr-tags__item--plus tb1px">+</span>
					</div>
					<span @click="showTagPage" v-if="tagsArr.length>=6" class="tag-edit-btn tb1px">修改</span>
				</div>
				<p class="form-ctrl default" v-if="isDefaultEdit">
					<span class="lbl">设为默认</span>
					<span class="switch">
						<input v-model="formData.isDefault" type="checkbox" class="switch-inp" id="defaultSetRadio">
						<label class="switch-lbl" for="defaultSetRadio">
						</label>
					</span>
				</p>
			</form>
			<div class="newaddr-btns">
				<span class="btn btn-cancel tb1px" @click="$router.go(-1)">取消</span>
				<span class="btn btn-save tb1px" @click="smbtAddrData">{{isDefaultEdit?'保存':'保存并使用'}}</span>
			</div>
		</div>
		<div class="picker-wrap">
			<transition name="slide-down">
				<div class="picker-cnt" v-show="isShowCityDlg">	
					<picker :slots="slots" :showToolbar="showToolbar" @change="onValuesChange"  :visible-item-count="5">
						<div class="txt-btn-wrap">
							<span class="txt-btn cancel" @click="hideCityDlg()">取消</span>
							<span class="txt-btn tit">地区选择</span>
							<span class="txt-btn ok" @click="cnfrmAddrArea()">确认</span>
						</div>
					</picker>
				</div>
			</transition>
			<transition name="slide-down">
				<div class="picker-cnt" v-show="isShowStreetDlg">	
					<picker :slots="streetSlots" :showToolbar="showToolbar" @change="onStreetChange"  :visible-item-count="5">
						<div class="txt-btn-wrap">
							<span class="txt-btn  cancel" @click="hideCityDlg(!0)">取消</span>
							<span class="txt-btn tit">街道选择</span>
							<span class="txt-btn ok" @click="cnfrmAddrArea(!0)">确认</span>
						</div>
					</picker>
				</div>
			</transition>
			<div class="picker-bg" v-show="isShowCityDlg || isShowStreetDlg" @click="hideCityDlg()"></div>
		</div>
		<CAddrTag :show="isShowTagPage" :tags="tagsArr" @save="saveTag" @del="delTag"></CAddrTag>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import { Addr, AddrTag } from '@/apis';
	import picker from '@/components/picker/';
	import Toast from '@/components/common/toast';
	import CityData from '@/utils/city';
	import Indicator from '@/components/common/indicator/';
	import CAddrTag from '@/views/address/addr-tags.vue';
	export default {
		data(){
			return {
				isDefaultEdit:!0,
				isShowCityDlg:!1,
				isShowStreetDlg:!1,
				hasStreet:!0,
				showToolbar:!0,
				formData:{
					name:'',
					phone:'',
					city:'',
					street:'',
					detail:'',
					isDefault:!1
				},
				formTip:{
					name:['请填写真实的收货人姓名',/^(?!老|大|小|阿|啊)((?:(?!(先生|小姐|女士))[\u4E00-\u9FA5]){2,5})$/],
					phone:['请输入正确的手机号',/^1\d{10}$/],
					city:['请填写所在地区'],
					street:['请填写所在街道'],
					detail:['详细地址为3-30个字，不包含特殊符号',/^[a-zA-Z0-9#_\(\)\-\s\u4e00-\u9fa5]{3,30}$/]
				},
				addrPre:['请选择省','请选择市','请选择区'],
				lastProv:'',
				lastCity:'',
				addrVals:[],
				addrStreet:'',
				streetId:-1,
				countyId:-1,
				streetStore:{},
				slots: [{
					flex: 1,
					values: [],
					className: 'slot1',
					textAlign: 'center',
					defaultIndex:1
				}, {
					flex: 1,
					values: [],
					className: 'slot3',
					textAlign: 'center',
				},{
					flex: 1,
					values: [],
					className: 'slot3',
					textAlign: 'center',
				}],
				streetSlots:[{
					flex: 1,
					values: [],
					className: 'slot1',
					textAlign: 'center',
					defaultIndex:1
				}],
				isSubmiting:!1,

				tagsArr:[],
				tagIdx:0,
				isShowTagPage:!1,
				isWinBindHash:!1,
			}
		},
		methods:{
			showCityDlg(isStreet=!1){
				if(isStreet){
					this.$refs.street.blur();
					if(!this.formData.city){
						return Toast('请先选择所在地区'),!1;
					}
					this.isShowStreetDlg = !0;
				}else{
					this.$refs.city.blur();
					this.isShowCityDlg = !0;
				}
			},
			hideCityDlg(){
				if(this.isShowStreetDlg){
					this.isShowStreetDlg = !1;
				}
				if(this.isShowCityDlg){
					this.isShowCityDlg = !1;
				}
			},
			smbtAddrData(){
				if (!this.checkFormData()) {
					return;
				}
				
				const data = {
					contactname: "",
					mobile: "",
					telephone: "",
					countryid: 0,
					streetid: 0,
					addressdetail: "",
					addresszip: "",
					addressflag: 0,
					defaultflag: 0
				};

				const formData = this.formData;
				const tag = this.tagsArr[this.tagIdx];
				const addrlabelid = tag.addr_label_id;
				const labelname = tag.label_name;

				data.contactname = formData.name;
				data.mobile = formData.phone;
				data.countryid = this.countyId;
				data.streetid = this.streetId > 0 ? this.streetId : 0;
				data.addressdetail = formData.detail;
				data.defaultflag = ~~formData.isDefault;
				data.addrlabelid = addrlabelid;
				
				this.isSubmiting = !0;
				Indicator.show('保存中...');		
				
				Addr.add(data).then((res)=>{
					this.isSubmiting = !1;
					Indicator.close();
					if(res.code == this.$ERR.NORMAL){
						this.dealAddrAddRes(res.data);
					}else if(res.code == this.$ERR.ADDR_NUM_LIMITED){
						Toast({
							toastTxt:'添加地址失败，收获地址最多有5个',
							iconCls: 'warning'
						});
					}else{
						Toast(`系统繁忙，请稍候重试![${res.code}]`);
					}
				}).catch((err)=>{
					Indicator.close();
					this.isSubmiting = !1;
					console.log(err);
				})

			},
			dealAddrAddRes(addrId){
				Toast({
					toastTxt:'添加地址成功',
					iconCls: 'success'
				});
				const parent = this.$parent;
				if(this.isDefaultEdit){
					if (parent && parent.loadAddrData) {
						parent.loadAddrData();
					}
					this.$router.go(-1);
				}else{
					const grandParent = parent.$parent;
					if (grandParent && grandParent.loadAddrData) {
						grandParent.loadAddrData();
					}
					this.$router.push({
						path:'/order',
						query:{
							aid:addrId,
							shopId:this.shopId
						}
					});
				}
			},
			checkFormData() {
				let err = '';
				const keys = Object.keys(this.formData);
				for (let i = 0, len = keys.length; i < len - 1; i++) {
					let name = keys[i];
					let tip = this.formTip[name];
					let val = this.formData[name]
					if (!val) {
						err = tip[0];
					} else if (tip[1] && !tip[1].test(val)) {
						err = tip[0];
					}
					if (err) {
						break;
					}
				}
				err && Toast(err);
				return err ? !1 : !0;
			},
			onStreetChange(picker, values){
				const streetName = values[0];
				if(!streetName){
					return;
				}
				if('请选择街道' == streetName){
					this.addrStreet = '';
				}else{
					this.addrStreet = streetName;
					this.streetId = this.streetStore[this.countyId][streetName];
				}
				
			},
			cnfrmAddrArea(isStreet=!1){
				this.hideCityDlg();
				if(isStreet){
					this.formData.street = this.addrStreet;
					return;
				}

				const vals = this.addrVals;
				const addrPreRE = new RegExp(this.addrPre.join('|'),'g');
				if(!addrPreRE.test(vals.join(','))){
					this.formData.city = vals.join('  ');
					this.loadStreetData(CityData[vals[0]][vals[1]][vals[2]]);
				}
				this.formData.street = '';
			},
			loadStreetData(districtId){
				let streetData = this.streetStore[districtId];
				this.countyId = districtId;
				if (streetData !== void 0) {
					this.setStreetSlotData(Object.keys(streetData))
					return;
				}
				Addr.getAreaList(districtId).then((res)=>{
					if(res.code == this.$ERR.NORMAL){
						if(res.data.length<=0){
							this.hasStreet = !1;
							this.formData.street = '没有街道';
						}else{
							this.hasStreet = !0;
							streetData = this.analysisStreetData(districtId,res.data);
							this.setStreetSlotData(streetData)
						}
						
					}
				}).catch((err)=>{
					console.log('new addr:',err);
				});
			},
			setStreetSlotData(data){
				this.streetSlots[0].values = ['请选择街道'].concat(data);
			},
			analysisStreetData(districtId,streetData){
				let nameArr = [];
				this.streetStore[districtId] = {};
				if(!streetData.length){
					return;
				}
				streetData.forEach(street=>{
					nameArr.push(street.area_name);
					this.streetStore[districtId][street.area_name] = street.area_id;
				});
				
				return nameArr;
			},
			onValuesChange(picker, values) {
				const prov = values[0];
				const city = values[1];
				this.addrVals = picker.getValues();
				
				if( !prov || prov == this.addrPre[0]){
					picker.setSlotValues(1,[this.addrPre[1]]);
					picker.setSlotValues(2,[this.addrPre[2]]);
					return;
				}

				const cityData = CityData[values[0]];
				if(cityData){
					picker.setSlotValues(1, [this.addrPre[1]].concat(Object.keys(cityData)));
					picker.setSlotValues(2,[this.addrPre[2]]);
				}
				// if (prov != this.lastProv) {
				// 	let cityData = [this.addrPre[1]].concat(Object.keys(CityData[values[0]]));
				// 	cityData && picker.setSlotValues(1, cityData);
				// 	picker.setSlotValues(2,[this.addrPre[2]]);
				// 	this.lastProv = prov;
				// }

				if(!city || city == this.addrPre[1] ){
					picker.setSlotValues(2,[this.addrPre[2]]);
					return;
				}
				
				const districtData = CityData[prov][city];
				if(districtData){
					picker.setSlotValues(2, [this.addrPre[2]].concat(Object.keys(districtData)));
				}
								
			},
			changeAddrTag(idx){
				this.tagIdx = idx;
			},
			saveTag(data){
				location.hash = '';
				this.isShowTagPage = !1;
				this.tagsArr.push({
					addr_label_id:data.tagId,
					label_name:data.tagName
				});
				this.tagIdx = this.tagsArr.length-1;
			},
			delTag(data){
				this.tagIdx = 0;
				this.tagsArr.splice(data.idx,1);
				const addr = this.addrList.find(addr => addr.addr_label_id == data.tagId);
				if(addr){
					addr.addr_label_id = 0;
					addr.label_name = '';
				}
			},
			initShowTag(){
				if(location.hash == "#showTag"){
					this.isShowTagPage = !0;
				}
				this.initWinBindHash();
			},
			initWinBindHash(){
				const hashVal = "#showTag";
				if(!this.isWinBindHash){
					window.addEventListener('hashchange', () => {
						if(location.hash != hashVal){
							this.isShowTagPage = !1;
						}else{
							this.isShowTagPage = !0;
						}
					}, !1);
					this.isWinBindHash = !0;
				}
			},
			showTagPage(){
				const hashVal = "#showTag";
				location.hash = hashVal;
				this.isShowTagPage = !0;
			},
			getAddrTags(){
				AddrTag.getList().then((res) => {
					if (res.code !== this.$ERR.NORMAL) {
						console.log(`获取地址标签失败：[${res.code}]`);
						return;
					}
					this.tagsArr = res.data;
				}).catch(err => {
					console.log(`获取地址标签出现异常：${err.message}`);
				});
			},
		},
		components:{
			picker,
			CAddrTag
		},
		computed:{
			...mapState(['shopId'])
		},
		watch:{
			
		},
		mounted(){
			const re = /addr-select/g;
			this.isDefaultEdit = !re.test(this.$route.path);
			setTimeout(()=>{
				this.slots[0].values = [this.addrPre[0]].concat(Object.keys(CityData));
				this.slots[1].values = [this.addrPre[1]];
				this.slots[2].values = [this.addrPre[2]];
				this.streetSlots[0].values = ['请选择街道'];
			},1000);
			this.initShowTag();
			this.getAddrTags();
		}
	}
</script>

<style>
	.picker-item{
		font-size: 0.28rem;
	}
</style>

<style scoped>
	 @import '../../../../assets/styles/mixins';
	input[type=checkbox]{
		display: none;
	}
	input::-webkit-input-placeholder{
		font-size: 0.28rem;
		color:#999;
	}
	.newaddr-wrapper{
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: #f5f5f5;
		overflow-y: auto;
		overflow-x: hidden;
		z-index: 22;
	}
	.newaddr-form{
		.form-ctrl{
			display: flex;
			align-items: center;
			padding: 0.3rem;
			background-color: #fff;
			border-bottom: 1px solid $color-d9;
			font-size: $fs-28;
			&:nth-last-child(1){
				border-color:transparent;
			}
			&.default{
				height: 1.04rem;
				justify-content: space-between;
				margin-top: 0.2rem;
				box-sizing: border-box;
				.switch-lbl{
					position: relative;
					display: block;
					width: 0.98rem;
					height: 0.58rem;
					border:1px solid #dedede;
					border-radius: 1.0rem;
					transition: all .3s;
					&:before{
						content:'';
						position: absolute;
						left:0.06rem;
						top:50%;
						width: 0.46rem;
						height: 0.46rem;
						margin-top: -0.23rem;
						border-radius: 100%;
						background-color: #fff;
						transition: all .3s;
						box-shadow: 0 0 2px 0 rgba(0,0,0,0.50);
						
					};
				}
				.switch-inp:checked + .switch-lbl{
					border-color:transparent;
					background-color: $main-color;
					&:before{
						left:0.46rem;
					};
				}
			}
			.lbl{
				width:4em;
				white-space: nowrap;
				margin-right: 0.4rem;
				color:#333;
			}
			input,textarea{
				flex:1;
				font-size: $fs-28;
				line-height: 1.6;
				color:#333;
			}
			.area-detail{
				height: 1.28rem;
			}

			.addr-tags{
				display: flex;
				flex-wrap: wrap;
				flex: 1;
				margin-left: -0.48rem;
				.addr-tags__item{
					min-width: 0.8rem;
					height: 0.36rem;
					line-height: 0.36rem;
					padding: 0 0.18rem;
					margin-left: 0.48rem;
					margin-bottom: 0.3rem;
					
					border: 1px solid currentColor;
					border-radius: 0.04rem;
					box-sizing: border-box;

					color: #999;
					font-size: 0.22rem;
					text-align: center;
				}
				.addr-tags__item--active{
					color:$main-color;
				}
				.addr-tags__item--plus{
					font-size: 0.32rem;
				}
			}

			&.form-ctrl--tags{
				align-items: flex-start;
				padding-bottom: 0;

				.tag-edit-btn{
					align-self: center;
					width: 1.0rem;
					height: 0.54rem;
					line-height: 0.54rem;
					margin-left: 0.2rem;
					margin-top: -0.3rem;
					border: 1px solid #999;
					border-radius: 0.04rem;
					color: #333;
					font-size: 0.26rem;
					text-align: center;
				}
			}
			
		}
	}
	.newaddr-btns{
		display: flex;
		justify-content: space-between;
		margin-top: 0.9rem;
		height: 0.8rem;
		line-height: 0.8rem;
		padding: 0 0.3rem;
		.btn{
			width: 46%;
			height: 100%;
			border:1px solid transparent;
			border-radius:$radius-6;
			text-align: center;
			&.btn-cancel{
				color:$main-color;
				border-color:$main-color;
				background-color: #fff;
			}
			&.btn-save{
				color:#fff;
				background-color: $main-color;
			}
		}	
	}

	.picker-wrap{
		.picker-cnt{
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: #fff;
			z-index: 1000;
			.txt-btn-wrap{
				display: flex;
				height: 100%;
				padding: 0 0.3rem;
				border-bottom: 1px solid #eaeaea;
			}
			.txt-btn{
				display: flex;
				flex: 1;
				align-items: center;
				font-size: 0.28rem;
				&.ok{
					color:$main-color;
					justify-content: flex-end;
				}
				&.tit{
					justify-content:center;
				}
			}
			
		}
		.picker-bg{
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			top: 0;
			background-color: rgba(0,0,0,.5);
			z-index: 999;
		}
	}
	.slide-down-enter-active,.slide-down-leave-active{
		transition: all .3s linear;
	}
	.slide-down-enter,.slide-down-leave-to{
		transform: translate3d(0,100%,0);
	}
	
</style>
