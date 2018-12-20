<template>
	<div v-show="pageLoaded">
		<div class="cart-hd tb1px" v-if="hasValidGoods" @touchmove.prevent>
			<span class="cart-hd-radio radio-wrap">
				<input type="checkbox" class="check-all" id="checkAllTop" name="" v-model="isAllChecked">
				<label class="check-lbl" for="checkAllTop">
					<em class="iconfont icon-round"></em>全选
				</label>
			</span>
			<span @click="switchMode" class="cart-hd-btn">{{  topBtnTxt }}</span>
		</div>
		<div class="page" :class="{noTop:!hasValidGoods}">
			<div class="cart-wrapper" >
				<div class="cart-cnt" v-if="cartInfo.list && cartInfo.list.length">
					<section class="cart-list"  v-if="hasValidGoods" :class="{'is-edit': mode == 2}">
						<ul class="list-cnt">
							<li v-for="(item,key) in validList" class="list-item tb1px">
								<span class="goods-check">
									<input type="checkbox" v-model="checkItems" :value="item.skuid" :id="'cb'+key" class="cb"  name="" >
									<label :for="'cb'+key"  class="iconfont icon-round"></label>
								</span>
								<div class="goods-pic tb1px" @click="navToDetail(item.skuid)">
									<img :src="item.goodspic" alt="">
									<span class="stock-tip" v-if="item.shopnum>item.stock">库存不足</span>
								</div>
								<div class="goods-info">
									<div>
										<p class="goods-info-tit" @click="navToDetail(item.skuid)">{{  getGoodsName(item.goodsprefix,item.goodsname) }}</p>
										<p class="goods-info-spec" :class="{'active': item.skuid == clickedSkuId}" @click="showSpecPopup(item)">{{ item.skuname}}</p>
									</div>
									<p class="goods-info-price">
										<span class="price-txt">¥{{item.salesprice.toFixed(2)}}</span>
										<!-- <span class="cur-stock" v-if="item.stock<=10&&item.shopnum>10">当前库存:{{ item.stock }}</span> -->
										<span class="num tb1px">
											<em @click="modifyNum(item,1)" :class="{disabled:item.shopnum==1}" class="num-btn num-btn-sub"></em>
											<em class="num-txt tb1px">{{ item.shopnum}}</em>
											<em @click="modifyNum(item,2)" :class="{disabled:item.shopnum>=Math.min(maxBuyNum , item.stock)}" class="num-btn num-btn-add"><i class="click-area"></i></em>
										</span>
									</p>
								</div>
							</li>
						</ul>
					</section>
					<section class="cart-list invalid" v-if="hasInvalidGoods">
						<div class="list-hd tb1px">
							<span class="list-hd-tit">以下商品已失效</span>
							<span @click="clearInvalidGoods" class="list-hd-btn clear">清空</span>
						</div>
						<ul class="list-cnt">
							<li v-for="(item,key) in inValidList" class="list-item tb1px">
								<span @click="delInvalidGoods(item.skuid)" class="goods-del"></span>								
								<div class="goods-pic tb1px" @click="navToDetail(item.skuid)">
									<img :src="item.goodspic" alt="">
								</div>
								<div class="goods-info">
									<div>
										<p class="goods-info-tit" @click="navToDetail(item.skuid)">{{  getGoodsName(item.goodsprefix,item.goodsname) }}</p>
										<p class="goods-info-spec" @click="navToDetail(item.skuid)">{{ item.skuname}}</p>
									</div>
								</div>
							</li>
						</ul>
					</section>
				</div>
				<section class="cart-empty-wrap" v-else>
					<div class="cart-empty">
						<div class="cart-empty-cnt">
							<p class="empty-icon">
								<i></i>
							</p>
							<p class="empty-txt">
								<span>你的购物车还是空的哦</span>
							</p>
							<p class="empty-btn ">
								<router-link :to="{path:'/category',query:{shopId:shopId}}">
									<span class="tb1px">去逛逛</span>
								</router-link>
							</p>
						</div>
					</div>	
				</section>
			</div>
		</div>
		<footer @touchmove.prevent class="cart-ft fixed-btm"  v-if="cartInfo.list && cartInfo.list.length">
			<div class="cart-ft-price" :class="{fe:!hasValidGoods}">
				<span class="ft-price-radio radio-wrap" v-if="hasValidGoods">
					<input type="checkbox" v-model="isAllChecked" class="check-all" id="checkAllBtm" name="">
					<label for="checkAllBtm" class="check-lbl ">
						<em class="iconfont icon-round "></em>全选
					</label>
				</span>
				<span v-if="mode === 1" class="ft-price-txt">
					<label for="">合计：</label>
					<em>¥{{ cartInfo.orderdueamount.toFixed(2) }}</em>
				</span>
			</div>
			<div @click="showDelDialog" class="cart-ft-btn balance-btn" :class="{del:mode===2,disabled:!hasValidGoods}">
				<span>{{ btmBtnTxt }}({{ getCartCount }})</span>
			</div>
		</footer>
		<!-- <div class="spin-wrap" v-if="isSubmiting" @touchmove.prevent>
			<div class="spinning"></div>
		</div> -->
		<myFooter></myFooter>
		<goods-detail-sku @close="hideSpecPopup" @modifySku="modifySku" :defaultSkuid="defaultSkuid" :show="isShowPopup" :actionType="actionType"  :goodsInfo="goodsInfo" :initSkuItem="skuItem" :num="buyNum" :skuInfo="skuInfo" :skuAttrs="skuAttrArr"></goods-detail-sku>
	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	import { Cart, Goods } from '@/apis';
	import Store from '@/utils/store';
	import Indicator from '@/components/common/indicator';
	import CnfrmBox from '@/components/common/confirm-box';
	import Toast from '@/components/common/toast';
	import { GOODS_NUM_LIMIT } from '@/utils/config';
	import myFooter from '@/components/footer/footer';
	import iosWxShareFix from '@/plugins/iosWxShareFix';
	import goodsDetailSku from '@/components/GoodsDetailSku';
	export default {
		data() {
			return {
				checkItems:[],
				cartInfo:{
					goodstotalprice: 0,
					goodsdistotalamount: 0,
					shippingfee: 0,
					orderdistotalamount: 0,
					orderamount: 0,
					orderdueamount: 0,
					list: []
				},
				validList:[],
				inValidList:[],
				totalPrice:0,
				localTimer:null,
				serverTimer:null,
				mode:1,
				lastCheckItems:[],
				isFirstInitCheckItems:!0,
				pageLoaded:!1,
				isSubmiting:!1,
				notDelArr : [],
				isEditMode:!1,
				clickedSkuId: 0,
				isShowPopup:!1,
				goodsInfo:{
					spuid: '',
					spuname: '',
					sortid: -1,
					skupricemin: 0,
					title: '',
					attachtitle: '',
					prefix: '',
					tradrulepic:'',
					intro: '',
					specinfo: [],
					spupic:[],
					issoldout: -1,
					intropic: [],
					editmode: -1,
					status:-1,
					stockqty:0,
					marketpricemin:0
				},
				skuInfo:[],
				skuAttrArr:[],
				actionType:1,
				action: {
					SPEC: 3,
					CART: 4,
					BUY: 5,
					MODIFY: 6
				},

				skuItem:{
					skuid: '',
					spuid: '',
					saleprice: 0,
					marketprice: 0,
					skupic: '',
					stockqty: 0
				},

				buyNum: 1,
				defaultSkuid: ''
			}
		},
		methods:{
			...mapMutations(['CART_SAVE','CART_DEL','SHOW_LOGIN', 'SHOP_CART_SAVE']),
			showDelDialog(){
				if(!this.hasValidGoods){
					return;
				}
				const mode = this.mode;
				if(mode === 1){
					this.navToOrderPage();
				}else if(mode === 2){
					const delSkuIds = this.checkItems.slice(0);
					this.delCartItems(delSkuIds);
				}
			},
			navToOrderPage(){
				if(this.checkItems.length<=0){
					Toast('请选择要结算的商品');
					return;
				}
				if(this.hasStockNotEnough){
					let tipMsg = '部分商品库存不足，请修改后提交';
					if(this.checkItems.length == 1){
						tipMsg = '该商品库存不足，请修改后提交';
					}
					Toast(tipMsg);
					return;
				}

				if (!this.isLogin) {
					this.SHOW_LOGIN(!0);
					return;
				}
				
				this.$router.push({
					path: '/order',
					query: {
						shopId: this.shopId
					}
				});
			},
			navToDetail(skuId){
				if(this.mode == 2){
					return;
				}
				this.$router.push({
					path:'/detail',
					query:{
						shopId:this.shopId,
						skuId:skuId
					}
				});
			},
			//选择规格
			showSpecPopup(item){
				this.defaultSkuid = item.skuid + '';
				if (this.mode === 1) {
					this.navToDetail(item.skuid);
					return false;
				}
				
				const isReqSpu = this.skuItem.skuid != item.skuid;
				this.clickedSkuId = item.skuid;				
				this.actionType = this.action.MODIFY;

				const sku = {};
				sku.skuid = item.skuid;
				sku.spuid = item.goodsid;
				sku.saleprice = item.salesprice;
				sku.marketprice = item.marketprice;
				sku.skupic = item.goodspic;
				sku.stockqty = item.stock;

				this.skuItem = sku;
				this.buyNum = item.shopnum;

				const goodsInfo = this.goodsInfo;
				goodsInfo.spuid = item.goodsid;
				goodsInfo.issoldout = !item.isvalid;
				goodsInfo.status = 8;
				goodsInfo.stockqty = item.stock;
				goodsInfo.isselect = item.isselect

				if(!isReqSpu){
					this.isShowPopup = !0;
					return;
				}

				Indicator.show('加载中...');
				Goods.getGoodsSpu(item.goodsid).then((res) => {
					Indicator.close();
					if (res.code === this.$ERR.NORMAL) {					
						this.isShowPopup = !0;
						this.initSpecData(res.data);
					}else{
						Toast(`商品规格获取失败，请重试![${res.code}]`);
					}
				}).catch((err) => {
					Indicator.close();
					console.log(err);
				});

			},
			modifySku(data){
				const goodsArr = this.cartInfo.list.slice(0);
				const { delSkuId, newSku } = data; 
				const goodsIdx = goodsArr.findIndex(goods => goods.skuid == delSkuId);
				const goods = goodsArr[goodsIdx];
				const existGoodsIdx = goodsArr.findIndex(goods => goods.skuid == newSku.skuid);

				if (delSkuId == newSku.skuid) {
					goods.shopnum = newSku.shopnum;
				} else {
					const lastCheckIdx = this.lastCheckItems.indexOf(delSkuId);
					if (lastCheckIdx > -1) {
						this.lastCheckItems.splice(lastCheckIdx, 1, newSku.skuid);
					}
					if(existGoodsIdx>-1){
						goodsArr[existGoodsIdx].shopnum += newSku.shopnum;
						goodsArr.splice(goodsIdx, 1);
					}else{
						goodsArr.splice(goodsIdx, 1, newSku);
					}
				}

				const tmpArr = [];

				goodsArr.forEach((item) => {
					tmpArr.push({
						skuid: item.skuid,
						shopnum: item.shopnum,
						goodsprice: item.salesprice,
						isselect: item.isselect
					});
				});

				Indicator.show('');
				
				Cart.modify(tmpArr).then(res => {
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					Object.assign(this.cartInfo, res.data);
					
					const list = res.data.list;
					this.analysisData(list);
					this.updateCartNum(list);
					this.doUpdate();
				}).catch(err => {
					Indicator.close();
				});

				this.hideSpecPopup();
			},
			hideSpecPopup(){
				this.isShowPopup = !1;
				this.clickedSkuId = 0;
			},
			initSpecData(data){
				this.skuInfo = data.skuinfo || [];
				this.skuAttrArr = data.skuattrname || [];
			},
			clearInvalidGoods(){
				const skuids = [];
				this.inValidList.forEach((goods) => {
					skuids.push(goods.skuid);
				});
				this.delCartItems(skuids,!0);
			},
			delInvalidGoods(skuid){
				this.delCartItems([skuid],!0);
			},
			switchMode(){
				const mode = this.mode;
				if (mode === 1) {
					this.isEditMode = !0;
					this.mode = 2;
					this.lastCheckItems = this.checkItems.slice(0);
					this.checkItems.splice(0);					
				} else if (mode === 2) {
					this.mode = 1;
					this.checkItems.splice(0);
					this.checkItems.push(...this.lastCheckItems);				
				}
			},
			delCartItems(skuIds=[],isInvalidDel=!1){
				const len = skuIds.length;
				const selfCartList = this.cartInfo.list;
				if(len === 0){
					return;
				}
				const cnfrmTxt = `确定将这<em style="color:#ff681d">${len}</em>件商品删除？`;
				CnfrmBox.open(cnfrmTxt).then(() => {
					skuIds.forEach(skuid => {
						const lastCheckIdx = this.lastCheckItems.indexOf(skuid);
						if( lastCheckIdx > -1){
							this.lastCheckItems.splice(lastCheckIdx,1);
						}
					});
					this.notDelArr = selfCartList.filter((goods) => skuIds.indexOf(goods.skuid) < 0);
					this.refreshCart(3,()=>{
						this.notDelArr.splice(0);
						for (let i = 0, len = selfCartList.length; i < len; i++) {
							const item = selfCartList[i];
							const idx = skuIds.indexOf(item.skuid);
							if( idx > -1){
								selfCartList.splice(i,1);
								i--;
								len--;
							}
						}
						(!isInvalidDel) && (this.mode == 2) && this.checkItems.splice(0);
					});
				}, () => {
					console.log('删除购物车商品操作取消');
				});
			},
			modifyNum(item,action){
				let isRequireUpdate = !1;
				const limitNum = Math.min(GOODS_NUM_LIMIT,item.stock);
				if (action == 1) {
					(item.shopnum > 1) && (isRequireUpdate=!0,item.shopnum--);
				} else if (action == 2) {
					(item.shopnum < limitNum) && (isRequireUpdate=!0,item.shopnum++);
				}
				isRequireUpdate && this.refreshCart(2);
			},
			loadCartData(){
				const shopId = this.shopId;
				const listCart = this.cartList[shopId] || null;
				this.fetchCartData(listCart);
			},
			fetchCartData(listCart){
				const ERR = this.$ERR;
				const params = {
					listCart: listCart,
					IsSelect: false
				}
				Cart.getList(params).then((res) => {
					Indicator.close();
					if(res.code === ERR.NORMAL){
						this.pageLoaded = !0;
						this.dealCartResult(res);
					}else{
						this.pageLoaded = !0;
					}
				}).catch((err) => {
					this.pageLoaded = !0;
					Indicator.close();
				});
			},
			dealCartResult(res){
				const list = res.data.list;
				Object.assign(this.cartInfo, res.data);
				this.$store.state.isCartSync = !0;
				this.analysisData(list);
				this.updateCartNum(list);
				res.data.list && this.initCheckItems(list);
				this.isLogin && this.CART_DEL();
			},
			analysisData(data) {
				this.validList.splice(0);
				this.inValidList.splice(0);
				if (!data || data.length <= 0) {
					return;
				}
				this.validList.push(...data.filter((goods) => goods.isvalid));
				this.inValidList.push(...data.filter((goods) => !goods.isvalid));
			},
			initCheckItems(listData){
				if(!listData){
					return;
				}
				if(listData.length<=0){
					return ;
				}
				listData.forEach((item, idx) => {
					if (item.isselect && this.checkItems.indexOf(item.skuid)<0) {
						this.checkItems.push(item.skuid);
					}
				});
				if(this.checkItems.length<=0){
					this.isFirstInitCheckItems = !1;
				}
			},
			getGoodsName(prefix, goodsName) {
				return prefix ? ( prefix + ' ' + goodsName) : goodsName;
			},
			updateCartNum(cart){
				if (!cart || !cart.length) {
					this.$store.state.shopCart = [];
					return;
				}
				const tmpArr = [];
				cart.forEach((item) => {
					tmpArr.push({
						skuid: item.skuid,
						shopnum: item.shopnum,
						goodsprice: item.salesprice,
						isselect: item.isselect
					});
				});
				this.$store.state.shopCartNum = 0;
				this.SHOP_CART_SAVE(tmpArr);
			},
			updateCartList(){
				const cartList = this.cartInfo.list;
				if(cartList){
					cartList.forEach((item) => {
						item.isselect = this.checkItems.indexOf(item.skuid) > -1 ? !0 : !1;
					});
				}
			},
			updateTotalPrice(){
				let totalPrice = 0;
				const cartList = this.cartInfo.list;
				if (cartList) {
					cartList.forEach((item) => {
						if (this.checkItems.indexOf(item.skuid) > -1) {
							totalPrice += item.salesprice * item.shopnum;
						}
					});
				}
				this.totalPrice = totalPrice.toFixed(2);
			},
			updateLocalCartData(){
				const cartList = this.cartInfo.list;
				let tmpArr = [];
				
				if(!cartList){
					return;
				}

				cartList.forEach((item)=>{
					tmpArr.push({
						skuid:item.skuid,
						shopnum:item.shopnum,
						goodsprice:item.salesprice,
						isselect:item.isselect
					});
				});
				this.CART_SAVE(tmpArr);
				tmpArr = null;
			},
			refreshCart(actionType,cb=null){
				const cartList = actionType == 3 ? this.notDelArr : this.cartInfo.list;
				
				const actionMethod = {
					'1': 'updateChecked',
					'2': 'updateNum',
					'3': 'del'
				};
				const method = 	actionMethod[actionType];
				if(typeof method != 'string'){
					return;
				}

				if(this.serverTimer){
					clearTimeout(this.serverTimer);
				}
				Indicator.show('');
				this.isSubmiting = !0;
				this.serverTimer = setTimeout(()=>{
					Cart[method](cartList).then((res) => {
						this.isSubmiting = !1;
						Indicator.close();
						if(res.code == this.$ERR.NORMAL){
							Object.assign(this.cartInfo,res.data);
							this.analysisData(res.data.list);
							this.updateCartNum(res.data.list);
							this.doUpdate();
							(typeof cb === 'function') && cb();
						}else{
							Toast({
								toastTxt: '服务器繁忙，请重试',
								iconCls: 'warning'
							});
						}
					}, (err) => {
						Indicator.close();
						this.isSubmiting = !1;
					});
				},200);
			},
			doUpdate(){
				if(this.mode == 2 && this.validList.length <= 0 && this.inValidList.length>0){
					this.mode = 1;
				}
				if(!this.isLogin){
					if (this.localTimer) {
						clearTimeout(this.localTimer)
					}
					this.localTimer = setTimeout(() => {
						this.updateLocalCartData();
					}, 300);
				}
			},
			init(){
				this.loadCartData();
			}
		},
		computed:{
			...mapState(['shopId','cartList','isLogin','shopCart']),
			isAllChecked:{
				set(bool){
					if (!bool) {
						this.checkItems.splice(0);
						return;
					}
					this.validList.forEach((item, idx) => {
						if (this.checkItems.indexOf(item.skuid) < 0) {
							this.checkItems.push(item.skuid);
						}
					});
				},
				get(){
					return this.checkItems.length === this.validList.length;
				}
			},
			topBtnTxt(){
				return this.mode === 1 ? '编辑':'完成';
			},
			btmBtnTxt(){
				return this.mode === 1 ? '结算':'删除';
			},
			hasValidGoods(){
				return this.validList.length>0;
			},
			hasInvalidGoods(){
				return this.inValidList.length>0;
			},
			hasStockNotEnough() {
				return this.validList.findIndex(item => item.shopnum > item.stock && this.checkItems.indexOf(item.skuid)>-1) > -1;
			},
			maxBuyNum(){
				return GOODS_NUM_LIMIT;
			},
			getCartCount(){
				if(!this.checkItems){
					return 0;
				}
				let count = 0;
				this.checkItems.forEach((skuid, idx, arr) => {
					const item = this.validList.find(item => item.skuid == skuid);
					if(item){
						count += item.shopnum;
					}
				});
				return count;
			}
		},
		watch:{
			checkItems(items){
				if(this.mode === 2 || this.isFirstInitCheckItems){
					this.isFirstInitCheckItems = !1;
					return;
				}
				if(this.isEditMode){
					this.isEditMode = !1;
					return;
				}
				this.updateCartList();
				this.refreshCart(1);
			}
		},
		components:{
			myFooter,
			goodsDetailSku
		},
		mixins:[iosWxShareFix],
		mounted(){
			Indicator.show('加载中...');
		},
		created(){
			this.init();
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins';
	input[type=checkbox]{
		display: none;
	}
	.iconfont{
		font-size: 0.4rem;
		color:#c9c9c9;
	}
	@define-extend fullpage{
		position: absolute;
		top:0;
		right: 0;
		bottom: 0;
		left: 0;
		padding-bottom: 0;
		overflow:hidden;
	}
	@define-extend center{
		display: flex;
		justify-content: center;
		align-items: center;
	}
	@define-extend list_hd{
		display: flex;
		justify-content: space-between;

		height: 1rem;
		line-height: 1rem;
		
		padding-left: $mg-30;
		border-bottom:1px solid $color-d9;
		
		font-size: $fs-28;
		background-color: #fff;
		z-index: 10;
	}
	.page{
		@extend page;
		top:1rem;
		bottom: 2.0rem;
		&.noTop{
			top:0;
		}
	}
	.cart-wrapper{
		padding-bottom: .2rem;
	}
	.radio-wrap{
		display: flex;
	}
	.check-lbl{
		display: flex;
		align-items: center;
		line-height: normal;
		.icon-round{
			margin-right: 0.14rem;
			vertical-align: middle;
		}
	}

	.check-all:checked + .check-lbl .icon-round{
		color:$main-color;
	}
	.check-all:checked + .check-lbl .icon-round:before{
		content:'\e656';
	} 

	.cart-hd{
		position: fixed;
		top:0;
		left: 0;
		right: 0;
		@extend list_hd;
	}

	.list-hd{
		@extend list_hd;
	}

	.cart-hd-btn,.list-hd-btn{
		padding-left: $mg-40;
		padding-right: $mg-30;
		color:$color-80;
		line-height: 1rem;
		font-size: $fs-28;
	}

	.cart-list{
		background-color: #fff;
		&.is-edit{
			.goods-info-spec{
				padding: 0.05rem 0.42rem 0.05rem 0.1rem !important;
				background-color: $color-f5;

				&::after{
					content: '';
					position: absolute;
					width: .22rem;
					height: 100%;
					top: 0;
					right: .1rem;
					background: url(../../assets/images/cart-arrow.png) no-repeat center;
					background-size: contain;
				}
				&.active::after{
					transform: rotate(180deg);
				}
			}
		}
		&:first-of-type.invalid{
			margin-top: 0;
		}
		&.invalid{
			margin-top: 0.2rem;
			.goods-info-tit{
				color:$color-b2;
			}
			.goods-info-spec{
				color:$color-b2 !important;
			}
			.goods-pic{
				filter: grayscale(100%);
			}
			.goods-del{
				position: relative;
				width: 18px;
				height: 18px;
				border-radius: 100%;
				background-color: #ddd;
				&:before{
					content:'';
					position: absolute;
					top:50%;
					left: 50%;
					height: 1px;
					width:60%;
					margin-left: -30%;
					background-color: #fff;

				};
				&:after{
					content:'';
					position: absolute;
					top:-0.4rem;
					right:-0.4rem;
					bottom:-0.4rem;
					left:-0.4rem;
				};
			}
		}
	}
	.list-item{
		display: flex;
		align-items: center;
		padding: $mg-40 $mg-30;
		font-size: $fs-28;
		border-bottom: 1px solid #f5f5f5;
		.goods-pic{
			position: relative;
			width: 2rem;
			height: 2rem;
			border: 1px solid #e5e5e5;
			border-radius: $radius-6; 
			margin:0 0.2rem;
			overflow:hidden;

			img{
				display: block;
				width: 100%;
				height: auto;
			}
			.stock-tip{
				position: absolute;
				left: 0;
				right: 0;
				bottom: 0;
				height: 0.4rem;
				line-height: 0.42rem;
				color:#fff;
				text-align: center;
				font-size: $fs-24;
				background-color: rgba(0,0,0,.6);
			}
		}
		.goods-check{
			label{
				position: relative;
				&:after{
					content:'';
					position:absolute;
					top:-0.4rem;
					right:-0.4rem;
					bottom:-0.4rem;
					left:-0.4rem;
				};
			}
			.cb:checked + label.icon-round{
				color:$main-color;
			}
			.cb:checked + label.icon-round:before{
				content:'\e656';
			}
		}
		.goods-info{
			min-height: 2rem;
			flex:1;
			align-self: flex-start;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			overflow: hidden;

			.goods-info-spec{
				position: relative;
				display: inline-block;
				max-width: 100%;
				margin-top: 0.08rem;
				padding: 0.05rem 0;
				font-size: $fs-24;
				color:$color-80;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;	
				box-sizing: border-box;			
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
				position: relative;
				display: flex;
				justify-content: space-between;
				color:$main-color;
				font-size: $fs-32;
				.price-txt{
					line-height: 0.8;
					align-self: flex-end;
					&:first-letter{
						display:inline-block;
						margin-right: 0.06rem;
					}
				}
			}
			.num{
				display: flex;
				width: 1.8rem;
				height: 0.5rem;
				box-sizing: border-box;
				/*border:1px solid $color-d9;*/
				border:1px solid #d9d9d9;
				border-radius: 3px;
				color:#333;
				.btn,.num-txt{
					height: 100%;
					text-align: center;
				}
				.num-txt{
					position: relative;
					width: 0.6rem;
					line-height: 0.48rem;
					border-left: 1px solid #d9d9d9;
					border-right: 1px solid #d9d9d9;
					font-size: $fs-28;
				}
				.num-btn{
					@extend flex-center;
					position: relative;
					width: 0.6rem;
					z-index: 2;
					font-size: $fs-32;
				}
				.num-btn{
					position: relative;
					width: 0.6rem;
					z-index: 2;
					&.num-btn-sub:before{
						content:'';
						position: absolute;
						left: 50%;
						top:50%;
						width:0.2rem;
						height: 1px;
						background-color: #333;
						transform: translate3d(-50%,-50%,0);
					}
					&.num-btn-sub:after{
						content:'';
						position: absolute;
						top:-0.13rem;
						left:-0.32rem;
						bottom: -0.28rem;
						right: 0;
						background-color: transparent;
					}
					&.num-btn-add:before,&.num-btn-add:after{
						content:'';
						position: absolute;
						left: 50%;
						top:50%;
						background-color: #333;
						transform: translate3d(-50%,-50%,0);
					}
					&.num-btn-add:before{
						width:0.2rem;
						height: 1px;
					}
					&.num-btn-add:after{
						height: 0.2rem;
						width:1px;					
					}

					&.num-btn.disabled:before,&.num-btn.num-btn-add.disabled:after{
						background-color: $color-b2;
					}
					.click-area{
						position: absolute;
						top:-0.13rem;
						left:0;
						bottom: -0.28rem;
						right: -0.28rem;
						background-color: transparent;
					}
				}
			}
		}
	}
	.cart-empty{
		padding-top: 1.54rem;
		.cart-empty-cnt{
			position: relative;
			font-size: $fs-28;
			color:#bbb;
			text-align: center;
			.empty-icon{
				i{
					display: inline-block;
					width: 1.52rem;
					height: 1.42rem;
					background: url(../../assets/images/cart-null-icon.png) 0 0/ cover;
				}
			}
			.empty-txt{
				margin:0.3rem 0 0.5rem;
			}
			.empty-btn span{
				display: inline-block;
				width: 2.5rem;
				height: 0.6rem;
				line-height: 0.6rem;
				border-radius: 0.4rem;
				border:1px solid currentColor;
				color:$main-color;
				font-size: $fs-32;
				background-color: #fff;
			}
		}
		@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) {
			.cart-empty-cnt .empty-btn span{
				position: absolute;
				left: 50%;
				bottom: -1.1rem;
				margin-left: -1.25rem;
			}
		}
	}
	.fixed-btm{
		position: fixed;
		left: 0;
		right: 0;
		bottom: 1.0rem;
	}
	.cart-ft{
		display: flex;
		height: 1.0rem;
		line-height: 1.0rem;
		font-size: $fs-28;
		color:#333;
		background-color: #fff;
		box-shadow: 0 -7px 12px 0 rgba(200,200,200,0.2);
		z-index: 12;
		.cart-ft-price{
			display: flex;
			justify-content: space-between;
			padding: 0 0.4rem 0 0.3rem;
			flex:1;
			&.fe{
				justify-content: flex-end;
			}
		}
		.ft-price-txt{
			display: flex;
			align-items: center;
			font-size: $fs-32;
			em{
				color:$main-color;
				&:first-letter{
					display:inline-block;
					margin-right: 0.06rem;
				}
			}
			label{
				color:$color-80;
			}
		}
		.balance-btn{
			@extend center;
			flex-shrink: 0;
			width: 2.5rem;
			color:#fff;
			font-size: $fs-32;
			background-color:$main-color;
			&.del{
				background-color: $sub-color;
			}
			&.disabled{
				background-color: $color-b2;
			}
		}
	}
	.spin-wrap{
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: transparent;
		z-index: 30;
	}
	.spinning {
		position: absolute;
		top:50%;
		left: 50%;
		margin-top: -48px;
		margin-left: -12px;
		border: solid 2px #ff681d;
		border-right-color: transparent;
		border-left-color: transparent;
		padding: 5px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: rgba(255,104,29,.7);
		background-clip: content-box;
		animation: spinDisc 1.5s linear infinite;
	}
	@keyframes spinDisc {
		100% {
			transform: rotate(1turn);
		}
	}
</style>