<template>
	<div class="editaddr-wrapper">
		<div class="editaddr-cnt">
			<form class="editaddr-form">
				<p class="form-ctrl tb1px">
					<label class="lbl" for="name">收货人</label>
					<input v-model="addrInfo.fullname" maxlength="5" type="text" class="name" id="name" placeholder="请输入收货人真实姓名">
				</p>
				<p class="form-ctrl tb1px">
					<label class="lbl" for="phone">手机号码</label>
					<input v-model="addrInfo.tel" type="text" id="phone" placeholder="请输入收货人手机号码" maxlength="11">
				</p>
				<p class="form-ctrl tb1px">
					<label class="lbl" for="city">所在地区</label>
					<input v-model="addrInfo.fullAreaName" @focus="showCityDlg()" ref="city" type="text" id="city" placeholder="请选择地区">
				</p>
				<p class="form-ctrl tb1px" v-if="hasStreet">
					<label class="lbl" for="street">街道</label>
					<input v-model="addrInfo.street1" @focus="showCityDlg(!0)" ref="street"  type="text" id="street" placeholder="请选择街道">
				</p>
				<p class="form-ctrl">
					<textarea v-model="addrInfo.street2" type="text" maxlength="30" class="area-detail" placeholder="详细地址（无需重复填写地区、街道）"></textarea>
				</p>
			</form>
			<div class="editaddr-btns">
				<!-- <span class="btn btn-cancel tb1px" @click="$router.go(-1)">取消</span> -->
				<span class="btn btn-save tb1px" @click="goAsApply">确定</span>
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
	</div>
</template>

<script>

    import picker from '@/components/picker/';
	import { mapState } from 'vuex';
    import CityData, {cities} from '@/utils/city';
    import { Addr } from '@/apis';
	import Toast from '@/components/common/toast';

    export default {
        data() {
            return {
                addrInfo: {},

                isDefaulEdit:!0,
                isCanEdit:!0,
                eidx:-1,
                hasInitialized:!1,
                fromPagePath:'',
                isSubmiting:!1,
                formTip:{
                    fullname:['请填写真实的收货人姓名',/^(?!老|大|小|阿|啊)((?:(?!(先生|小姐|女士))[\u4E00-\u9FA5]){2,5})$/],
                    tel:['请输入正确的手机号',/^1\d{10}$/],
                    fullAreaName:['请填写所在地区'],
                    street1:['请填写所在街道'],
                    street2:['详细地址为3-30个字，不包含特殊符号',/^[a-zA-Z0-9#_\(\)\-\s\u4e00-\u9fa5]{3,30}$/]
                },

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

                tagsArr:[],
                tagIdx:0,
                isShowTagPage:!1,
                isWinBindHash:!1,
            }
        },

        computed: {
			...mapState(['shopId'])
        },

        methods: {
            showCityDlg(isStreet=!1){
				if(isStreet){
					this.$refs.street.blur();
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
				}
				
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
            loadStreetData(districtId,cb){
				let streetData = this.streetStore[districtId];
				this.countyId = districtId;
				if (streetData !== void 0) {
					this.setStreetSlotData(Object.keys(streetData))
					return;
				}
				this.isStreetLoading = !0;
				Addr.getAreaList(districtId).then((res)=>{
					this.isStreetLoading = !1;
					if(res.code == this.$ERR.NORMAL){
						if(res.data.length<=0){
							this.hasStreet = !1;
							this.addrInfo.street1='';
						}else{
							this.hasStreet = !0;
							streetData = this.analysisStreetData(districtId,res.data);
							this.setStreetSlotData(streetData);
							(typeof cb === 'function') && cb();
						}
					}else{
						Toast('网络错误，请稍后重试!')
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
            initFormData(){
                this.addrInfo = this.$route.query;

                this.addrInfo.fullAreaName = this.addrInfo.province+' '+this.addrInfo.city+' '+this.addrInfo.county ;
                this.hasStreet = this.addrInfo.street1 != '' ? !0 : !1;
                this.addrInfo.street1 = this.addrInfo.street1 != '' ? this.addrInfo.street1 : '';
                this.isCanEdit = !0;
                setTimeout(()=>{
                    this.initAddrPickerData(this.addrInfo);
                },1000);
			},
			initAddrPickerData(addr){
				this.picker.setSlotValue(0,addr.province);
				this.picker.setSlotValue(1,addr.city);
				this.picker.setSlotValue(2,addr.county);
				if(this.hasStreet){
					this.loadStreetData(addr.countycode,()=>{
						this.streetPicker.setSlotValue(0,addr.street1);
					});
				}
            },
            cnfrmAddrArea(isStreet=!1){
				this.hideCityDlg();
				if(isStreet){
                    this.addrInfo.street1 = this.addrStreet;
					try {
                        this.addrInfo.street1code = this.streetStore[this.countyId][this.addrStreet];
                    }catch(e) {
                        console.log(e)
                    }
					return;
				}

				const vals = this.addrVals;
				const addrPreRE = new RegExp(this.addrPre.join('|'),'g');
				if(!addrPreRE.test(vals.join(','))){
					this.addrInfo.province = vals[0];
					this.addrInfo.city = vals[1];
					this.addrInfo.county = vals[2];
					this.addrInfo.fullAreaName = vals.join('  ');
					this.loadStreetData(CityData[vals[0]][vals[1]][vals[2]]);
				}
                this.addrInfo.street1 = '';
                this.addrInfo.street1code = 0;
                
                // 获取省市镇id
                for(let j=0; j<cities.length; j++) {
                    if(cities[j].n == vals[0]) {
                        this.addrInfo.provincecode = cities[j].i;
                        for(let k=0; k<cities[j].s.length; k++) {
                            if(cities[j].s[k].n == vals[1]) {
                                this.addrInfo.citycode = cities[j].s[k].i;
                                for(let l=0; l<cities[j].s[k].s.length; l++) {
                                    if(cities[j].s[k].s[l].n == vals[2]) {
                                        this.addrInfo.countycode = cities[j].s[k].s[l].i;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            checkFormData(){
				const fields = Object.keys(this.addrInfo);
				let err = '';
				for (let i = 0, len = fields.length; i < len; i++) {
					let field = fields[i];
					if(field in this.formTip){
                        if(!this.hasStreet && field == 'street1') {
                            break;
                        }
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
            goAsApply() {
                if(!this.checkFormData()){
					return;
				}
                this.$router.push({
					path: '/after-sale-apply',
					query: this.$route.query
				});
            }
        },
        components:{
			picker
		},
        created() {
			this.initFormData();
        },
    }
</script>

<style>
	.picker-item{
		font-size: 0.28rem;
	}
</style>

<style scoped>
	@import '../../assets/styles/mixins';
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
		position: fixed;
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
			padding: 0.3rem 0.3rem;
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
        position: fixed;
        bottom: 0;
        left: 0;
		display: flex;
		justify-content: space-between;
		height: 1rem;
		line-height: 1rem;
        width: 100%;
		.btn{
			width: 100%;
			height: 100%;
			border:1px solid transparent;
			text-align: center;
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
	
	@media only screen and (min-device-width : 375px) and (-webkit-min-device-pixel-ratio : 2) {
		.newaddr-form .form-ctrl .area-detail {
			text-indent:  -3px;
		}
	}

	@media only screen and (device-width : 414px) and (-webkit-min-device-pixel-ratio : 3) {
		.newaddr-form .form-ctrl .area-detail {
			text-indent: -3px;
		}
	}
</style>
