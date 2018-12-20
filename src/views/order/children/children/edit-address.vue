<template>
	<div class="editaddr-wrapper">
		<div class="editaddr-cnt">
			<form class="editaddr-form">
				<p class="form-ctrl tb1px">
					<label class="lbl" for="name">收货人</label>
					<input v-model="addrInfo.contact_name" type="text" class="name" id="name" placeholder="请输入收货人真实姓名" maxlength="5">
				</p>
				<p class="form-ctrl tb1px">
					<label class="lbl" for="phone">手机号码</label>
					<input v-model="addrInfo.mobile" type="text" id="phone" placeholder="请输入收货人手机号码" maxlength="11">
				</p>
				<p class="form-ctrl tb1px">
					<label class="lbl" for="city">所在地区</label>
					<input v-model="addrInfo.fullAreaName" @focus="showCityDlg()" ref="city" type="text" id="city" placeholder="请选择地区">
				</p>
				<p class="form-ctrl tb1px" v-if="hasStreet">
					<label class="lbl" for="street">街道</label>
					<input v-model="addrInfo.areaDName" @focus="showCityDlg(!0)" ref="street"  type="text" id="street" placeholder="请选择街道">
				</p>
				<p class="form-ctrl tb1px">
					<textarea v-model="addrInfo.address_detail" type="text" maxlength="30" class="area-detail" placeholder="详细地址（无需重复填写地区、街道）"></textarea>
				</p>
				<div class="form-ctrl form-ctrl--tags" >
					<label class="lbl" for="street">标签</label>
					<div class="addr-tags">
						<span v-for="(tag,idx) in tagsArr" @click="changeAddrTag(idx)" :class="{'addr-tags__item--active':idx==tagIdx}" class="addr-tags__item tb1px">{{ tag.label_name }}</span>
						<span @click="showTagPage" v-if="tagsArr.length<6" class="addr-tags__item addr-tags__item--plus tb1px">+</span>
					</div>
					<span @click="showTagPage" v-if="tagsArr.length>=6" class="tag-edit-btn tb1px">修改</span>
				</div>
			</form>
			<div class="editaddr-btns">
				<span class="btn btn-cancel tb1px" @click="$router.go(-1)">取消</span>
				<span class="btn btn-save tb1px" @click="saveAddr">{{isDefaulEdit?'保存':'保存并使用'}}</span>
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
							<span class="txt-btn cancel" @click="hideCityDlg(!0)">取消</span>
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
	import { mapState,mapMutations } from 'vuex';
	import { Addr, AddrTag } from '@/apis';
	import Toast from '@/components/common/toast';
	import picker from '@/components/picker/';
	import CityData from '@/utils/city';
	import Indicator from '@/components/common/indicator/';
	import CAddrTag from '@/views/address/addr-tags.vue';
	export default {
		data(){
			return {
				isDefaulEdit:!0,
				isCanEdit:!0,
				eidx:-1,
				hasInitialized:!1,
				fromPagePath:'',
				isSubmiting:!1,
				addrInfo:{
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
					fullAreaName:''
				},
				formTip:{
					contact_name:['请填写真实的收货人姓名',/^(?!老|大|小|阿|啊)((?:(?!(先生|小姐|女士))[\u4E00-\u9FA5]){2,5})$/],
					mobile:['请输入正确的手机号',/^1\d{10}$/],
					fullAreaName:['请填写所在地区'],
					areaDName:['请填写所在街道'],
					address_detail:['详细地址为3-30个字，不包含特殊符号',/^[a-zA-Z0-9#_\(\)\-\s\u4e00-\u9fa5]{3,30}$/]
				},

				tagsArr:[],
				tagIdx:0,
				isShowTagPage:!1,
				isWinBindHash:!1,

				isShowCityDlg:!1,
				isShowStreetDlg:!1,
				showToolbar:!0,

				addrPre:['请选择省','请选择市','请选择区'],
				lastProv:'',
				lastCity:'',
				addrVals:[],
				addrStreet:'',
				streetId:0,
				countyId:0,
				streetStore:{},
				hasStreet:!0,
				slots: [{
					flex: 1,
					values: ['请选择省'].concat(Object.keys(CityData)),
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
				picker:null,
				streetPicker:null,
				isStreetLoading:!1,
			}
		},
		methods:{
			...mapMutations(['ADDR_EDIT','ADDRIDX_CHANGE']),
			saveAddr(){
				if(this.isSubmiting || !this.checkFormData()|| !this.isCanEdit){
					return;
				}

				if(!this.hasStreet){
					this.addrInfo.areaDName='';
				}

				const addrInfo = this.addrInfo;
				const tag = this.tagsArr[this.tagIdx];
				const addrlabelid = tag.addr_label_id;
				const labelname = tag.label_name;

				const data = {
					addressid: addrInfo.address_id,
					userid: addrInfo.user_id,
					contactname: addrInfo.contact_name,
					mobile: addrInfo.mobile,
					telephone: addrInfo.telephone,
					countryid: this.countyId || addrInfo.areacid,
					streetid: this.streetId || addrInfo.areadid,
					addressdetail: addrInfo.address_detail,
					addresszip: addrInfo.zip,
					addressflag: addrInfo.address_flag,
					defaultflag: addrInfo.default_flag,
					addrlabelid
				};
				this.isSubmiting = !0;
				Indicator.show('保存中...');				
				Addr.edit(data).then((res) => {
					this.isSubmiting = !1;
					Indicator.close();
					if (res.code == this.$ERR.NORMAL) {
						this.addrInfo.addr_label_id = addrlabelid;
						this.addrInfo.label_name = labelname;
						this.dealSuccessResult();
					}else{
						Toast(`系统繁忙，请稍后重试![${res.code}]`);
					}
				}, (err) => {
					this.isSubmiting = !1;
					Indicator.close();
					console.log(err);
				});
			},
			dealSuccessResult(){
				Toast({
					toastTxt: '保存成功',
					iconCls: 'success'
				});
				this.saveAddrState();
				const parent = this.$parent;
			
				if (this.isDefaulEdit) {
					this.$router.go(-1);
					if (parent && parent.loadAddrData) {
						parent.loadAddrData();
					}
				}else{
					this.$router.push({
						path:'/order',
						query:{
							aid:this.eidx,
							shopId:this.shopId
						}
					});
				}				
			},
			saveAddrState(){
				const idx = this.addrList.findIndex(addr => addr.address_id == this.eidx);
				const addr = this.addrInfo;
				if(this.countyId){
					addr.areacid = this.countyId;
				}
				if(this.streetId){
					addr.areadid = this.streetId;
				}
				delete addr.areaaid;
				delete addr.areabid;
				
				this.ADDR_EDIT({
					idx,
					addr
				});

				this.ADDRIDX_CHANGE(idx);
			},
			loadAddrInfo(id){
				Addr.getAddrById(id).then((res) => {
					if (res.code == this.$ERR.NORMAL) {
						Object.assign(this.addrInfo,res.data[0]);
					}
				}, (err) => {
					console.log(err);
				});
			},
			initFormData(){
				if (this.hasInitialized) {
					return;
				}
				const addr = this.addrList.find(addr => addr.address_id == this.eidx);

				if (!addr) {
					this.isCanEdit = !1;
				} else {
					Object.assign(this.addrInfo,addr);
					this.addrInfo.fullAreaName = addr.areaAName+' '+addr.areaBName+' '+addr.areaCName ;
					this.hasInitialized = !0;
					this.hasStreet = addr.areaDName != '' ? !0 : !1;
					this.addrInfo.areaDName = addr.areaDName != '' ? addr.areaDName : '没有街道';
					this.isCanEdit = !0;
					this.getAddrTags();
					setTimeout(()=>{
						this.initAddrPickerData(addr);
					},1000);
				}
			},
			initAddrPickerData(addr){
				this.picker.setSlotValue(0,addr.areaAName);
				this.picker.setSlotValue(1,addr.areaBName);
				this.picker.setSlotValue(2,addr.areaCName);
				if(this.hasStreet){
					this.loadStreetData(addr.areacid,()=>{
						this.streetPicker.setSlotValue(0,addr.areaDName);
					});
				}
			},
			checkFormData(){
				const fields = Object.keys(this.addrInfo);
				let err = '';
				for (let i = 0, len = fields.length; i < len; i++) {
					let field = fields[i];
					if(field in this.formTip){
						let tip = this.formTip[field];
						let val = this.addrInfo[field]
						if (!val) {
							err = tip[0];
						} else if (tip[1] && !tip[1].test(val)) {
							err = tip[0];
						}
						if (err) {
							break;
						}
					}
				}
				err && Toast({
					toastTxt: err,
					toastCls:'toast-adjust'
				});;
				return err ? !1 : !0;
			},
			changeAddrTag(idx){
				this.tagIdx = idx;
			},
			getAddrTags(){
				AddrTag.getList().then((res) => {
					if (res.code !== this.$ERR.NORMAL) {
						console.log(`获取地址标签失败：[${res.code}]`);
						return;
					}
					this.tagsArr = res.data;
					this.tagIdx = this.tagsArr.findIndex(tag=>tag.addr_label_id==this.addrInfo.addr_label_id);
					this.tagIdx = this.tagIdx < 0 ? 0 : this.tagIdx;
				}).catch(err => {
					console.log(`获取地址标签出现异常：${err.message}`);
				});
			},
			init(){
				this.eidx = ~~this.$route.query.eidx;
				if(!this.eidx){
					Toast({
						toastTxt: '参数错误',
						iconCls: 'warning'
					});
					this.isCanEdit = !1;
				}
				this.initFormData();
				this.initShowTag();
			},
			
			showCityDlg(isStreet=!1){
				if(isStreet){
					this.$refs.street.blur();
					if(this.isStreetLoading){
						return;
					}
					if(!this.addrInfo.fullAreaName){
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

			onStreetChange(picker, values){
				const streetName = values[0];
				if(!this.streetPicker){
					this.streetPicker = picker;
				}
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
					this.addrInfo.areaDName = this.addrStreet;
					return;
				}

				const vals = this.addrVals;
				const addrPreRE = new RegExp(this.addrPre.join('|'),'g');
				if(!addrPreRE.test(vals.join(','))){
					this.addrInfo.areaAName = vals[0];
					this.addrInfo.areaBName = vals[1];
					this.addrInfo.areaCName = vals[2];
					this.addrInfo.fullAreaName = vals.join('  ');
					this.loadStreetData(CityData[vals[0]][vals[1]][vals[2]]);
				}
				this.addrInfo.areaDName = '';
			},
			loadStreetData(districtId,cb){
				let streetData = this.streetStore[districtId];
				this.countyId = districtId;
				if (streetData !== void 0) {
					this.hasStreet = !0;
					this.setStreetSlotData(Object.keys(streetData))
					return;
				}
				this.isStreetLoading = !0;
				Addr.getAreaList(districtId).then((res)=>{
					this.isStreetLoading = !1;
					if(res.code == this.$ERR.NORMAL){
						if(res.data.length<=0){
							this.hasStreet = !1;
							this.streetSlots[0].values = ['请选择街道'];
							this.addrInfo.areaDName='没有街道';
						}else{
							this.hasStreet = !0;
							streetData = this.analysisStreetData(districtId,res.data);
							this.setStreetSlotData(streetData);
							(typeof cb === 'function') && cb();
						}
					}else{
						toast('网络错误，请稍后重试!')
					}
				}).catch((err)=>{
					this.isStreetLoading = !1;
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
				if(!this.picker){
					this.picker = picker;
				}
				if( !prov || prov == this.addrPre[0]){
					picker.setSlotValues(1,[this.addrPre[1]]);
					picker.setSlotValues(2,[this.addrPre[2]]);
					return;
				}
				const cityData = CityData[prov];
				if(cityData){
					picker.setSlotValues(1, [this.addrPre[1]].concat(Object.keys(cityData)));
					picker.setSlotValues(2,[this.addrPre[2]]);
				}
				if(!city || city == this.addrPre[1] ){
					picker.setSlotValues(2,[this.addrPre[2]]);
					return;
				}				
				const districtData = CityData[prov][city];
				if(districtData){
					picker.setSlotValues(2, [this.addrPre[2]].concat(Object.keys(districtData)));
				}
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
			}
		},
		components:{
			picker,
			CAddrTag
		},
		computed:{
			...mapState(['addrList','shopId']),
		},
		watch:{
			addrList(val){
				this.initFormData();
			}
		},
		mounted(){
			const re = /addr-select/g;
			this.isDefaulEdit = !re.test(this.$route.path);
			this.init();
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
	.toast-adjust{
		margin-top: -1.5rem;
	}
	.editaddr-wrapper{
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: #f5f5f5;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.editaddr-form{
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
		
			.lbl{
				width:4em;
				color:#333;
				white-space: nowrap;
				margin-right: 0.4rem;
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
	.editaddr-btns{
		display: flex;
		justify-content: space-between;
		margin-top: 0.9rem;
		height: 0.7rem;
		line-height: 0.7rem;
		padding: 0 0.3rem;
		font-size: $fs-32;
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
