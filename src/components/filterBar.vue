<template>
	<div class="filter-wrapper">
		<div class="filter-overlay" v-show="isShowCnt" @click="hidePanel"></div>
		<div class="filter-cnt" :class="isShowFilterPanel ? 'bottom0': ''" :style="{ top: hasHeader ? '0.88rem' : 0 }">
			<div class="filter-tab tb1px">
				<!-- <span @click="changeTab(1)" class="filter-tab__item" :class="{active:curTab==1}">{{ colliData[colliIdx] }}</span> -->
				<span @click="changeTab(2)" class="filter-tab__item" :class="{active:curTab==2, asc:salesVolIdx == 1, desc: salesVolIdx == 2}">
					<em>销量</em>
					<!-- <i class="filter-tab__icon"></i> -->
				</span>
				<span @click="changeTab(3)" class="filter-tab__item" :class="{active:curTab==3, asc:priceIdx == 1, desc: priceIdx == 2}">
					<em>价格</em>
					<i class="filter-tab__icon"></i>
				</span>
				<span v-if="hasFilter" @click="changeTab(4)" class="filter-tab__item" :class="{active:isFilterTab}">筛选</span>
			</div>
			<div class="filter-bd" v-show="isShowCnt">
				<!-- <div class="colligation" v-show="curTab==1 && !isShowPricePanel">
					<span @click="changeColli(1)" class="colligation-item" :class="{active:colliIdx==1}">
						<em>综合排序</em>
						<i class="colligation-item__icon"></i>
					</span>
					<span @click="changeColli(2)" class="colligation-item" :class="{active:colliIdx==2}">
						<em>新品优先</em>
						<i class="colligation-item__icon"></i>
					</span>
				</div>
				<div class="price-condition" v-show="isShowPricePanel">
					<div class="price-condition__bd">
						<p class="price-condition__tit">价格区间</p>
						<div class="price-condition__cnt">
							<input id="min" :value="minPrice" @input="rangeInputHandler" type="tel" maxlength="6" class="price-condition__inp tb1px" placeholder="起始价格">
							<span  class="price-condition__gap">~</span>
							<input id="max" :value="maxPrice" @input="rangeInputHandler" type="tel" maxlength="6" class="price-condition__inp tb1px" placeholder="最高价格（不填则不限）">
						</div>
					</div>
					<div class="price-condition__ft">
						<span @click="resetPrice" class="pcf-btn cancel tb1px">重置</span>
						<span @click="setPrice" class="pcf-btn ok tb1px">确定</span>
					</div>
				</div> -->
				<div class="filter-body" v-show="isShowFilterPanel">
					<div class="cate-wrap" v-if="isSearch">
						<div class="top-wrap">
							<p class="title">类别（单选）</p>
							<div class="right-sec">
								<div class="choice-label"><span>{{activeType.catename}}</span></div>
								<span class="more" @click="changeShowMore(false, 'type')" v-if="filterRst.sortbrandaggre && filterRst.sortbrandaggre.length > 6">更多</span>
							</div>
						</div>
						<ul class="list">
							<li v-for="(item, index) in filterRst.sortbrandaggre" :data-idx="index" class="tb1px"
								:class="activeTypeIdx == index ? 'active' : ''" :key="item.cateid" v-if="index < 6"
								:data-item="stringify(item)" @click="selectType($event)">{{item.catename}}</li>
						</ul>
					</div>
					<div class="brand-wrap">
						<div class="top-wrap">
							<p class="title">品牌（多选）</p>
							<div class="right-sec">
								<div class="choice-label"><span v-for="(item, index) in choiceBrand">{{item.brandname + (choiceBrand.length == index+1 ? '' : ',')}}</span></div>
								<span class="more" @click="changeShowMore(false, 'brand')" v-if="filterRst.allbrandlist && filterRst.allbrandlist.length > 6">更多</span>
							</div>
						</div>
						<ul class="list">
							<li v-for="(item, index) in filterRst.allbrandlist" :data-idx="index"  class="tb1px"
								:class="activeBrandIdx.indexOf(index) > -1 ? 'active' : ''" :key="item.brandid" v-if="index < 6" 
								:data-item="stringify(item)" @click="selectBrand($event)">{{item.brandname}}</li>
						</ul>
					</div>
				</div>
				<div class="filter-footer">
					<span class="pcf-btn cancel tb1px" @click="resetChoice">重置</span>
					<span class="pcf-btn ok tb1px" @click="setChoice">确定</span>
				</div>
			</div>
		</div>
		<div class="filter-more" v-show="isShowFilterMore">
			<div class="mod-title header tb1px">
				<div class="header-back" @click="changeShowMore(true)"></div> 
				<span>更多{{moretype}}</span>
				<div class="ok-btn" @click="saveChoiceBrand">确定</div>
			</div>
			<div class="filter-list-wrap">
				<ul class="filter-more-list" v-if="showFilterMoreType">
					<li v-for="(item, index) in filterRst.sortbrandaggre" :data-idx="index" :key="item.cateid"
						:class="activeTypeIdx == index ? 'active' : ''"
						:data-item="stringify(item)" @click="selectType($event)">{{item.catename}}</li>
				</ul>
				<ul class="filter-more-list" v-else>
					<li v-for="(item, index) in filterRst.allbrandlist" :data-idx="index" 
						:class="activeBrandIdx.indexOf(index) > -1 ? 'active' : ''" :key="item.brandid"
						:data-item="stringify(item)" @click="selectBrand($event)">{{item.brandname}}</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import { Goods } from '@/apis/';

	export default {
		data(){
			return {
				isShowCnt: !1,
				
				curTab: 1,
				isFilterTab:!1,
				isShowFilterPanel: !1,
				isShowFilterMore: !1,
				showFilterMoreType: !1,
				choiceBrand: [],
				activeBrandIdx: [],
				tempChoiceBrand: [],
				tempActiveBrandIdx: [],
				activeType: {},
				tempActiveType: {},
				activeTypeIdx: null,
				tempActiveTypeIdx: null,
				colliIdx: 1,
				salesVolIdx: 0,
				priceIdx: 0,

				minPrice: '',
				maxPrice: '',
				priceArea:[0,0],

				colliData:['','综合','新品优先'],

				filterData: {
					orderfield: 4, // 1.价格排序 2.收益排序 3.销量排序 4.综合排序 5.新品优先
					orderform: 0, // 1.升序 2.降序 
					lowerprice: 0,
					upperprice: 0,
					filtersortid: 0,
  					filterbrandids: '',
				},

				filterRst: {},
				moretype: '类别'
			}
		},
		props:{
			hasHeader: {
				type: Boolean,
				default: !0
			},
			hasFilter: {
				type: Boolean,
				default: !1
			},
			// 搜索筛选不需要二次请求接口
			isSearch: {
				type: Boolean,
				default: !1
			},
			filterList: {
				type: Object,
				default: function () {
					return {}
				}
			}
		},
		watch: {
			filterList: function() {
				this.filterRst = {
					allbrandlist: this.filterList.brandlist,
					sortbrandaggre: this.filterList.catelist
				}
			}
		},
		methods:{
			stringify(e) {
				return JSON.stringify(e);
			},
			selectType(e) {
				let item = JSON.parse(e.target.dataset.item);
				let idx = JSON.parse(e.target.dataset.idx);
				if(this.activeTypeIdx == idx) {
					this.resetChoice();
					return false;
				}

				this.activeTypeIdx = idx;
				this.activeType = item;

				// 每次选择类型 重新置空品牌选择
				this.choiceBrand = [];
				this.activeBrandIdx = [];
				this.setChoice(false);
			},
			selectBrand(e) {
				let item = JSON.parse(e.target.dataset.item);
				let idx = JSON.parse(e.target.dataset.idx);
				let arrIdx = this.choiceBrand.findIndex(function(val, index, arr) {
					if(JSON.stringify(val) == JSON.stringify(item)) {
						return index + '';
					}
				});
				if (e.target.className.indexOf("active") == -1) {
					e.target.className = "active";
					this.choiceBrand.push(item);
					this.activeBrandIdx.push(idx)
				} else {
					e.target.className = "";
					this.choiceBrand.splice(arrIdx, 1);
					this.activeBrandIdx.splice(arrIdx, 1);
				}
			},
			saveChoiceBrand() {
				this.changeShowMore(false);
			},
			changeShowMore(flag, type) {
				if(type == 'type') {
					this.moretype = '类别';
					this.showFilterMoreType = !0;
				}else {
					this.moretype = '品牌';
					this.showFilterMoreType = !1;
				}
				if(flag) {
					this.choiceBrand = this.tempChoiceBrand;
					this.activeBrandIdx = this.tempActiveBrandIdx;
					this.activeType = this.tempActiveType;
					this.activeTypeIdx = this.tempActiveTypeIdx;
				}else {
					this.tempChoiceBrand = [].concat(this.choiceBrand);
					this.tempActiveBrandIdx = [].concat(this.activeBrandIdx);
					this.tempActiveTypeIdx = 0+this.activeTypeIdx;
					this.tempActiveType = Object.assign({}, this.activeType);
				}
				this.isShowFilterMore = !this.isShowFilterMore;
			},
			resetChoice() {
				this.filterData = {
					orderfield: 4, // 1.价格排序 2.收益排序 3.销量排序 4.综合排序 5.新品优先
					orderform: 0, // 1.升序 2.降序 
					lowerprice: 0,
					upperprice: 0,
					filtersortid: 0,
  					filterbrandids: '',
				},
				this.choiceBrand = [];
				this.activeBrandIdx = [];
				this.activeType = {};
				this.activeTypeIdx = null;
				// 重置重新请求
				this.dispatchFilter(false);
			},
			setChoice(flag) {
				this.isFilterTab = !0;
				const filterData = this.filterData;
				const filtersortidArr = [];
				for(let i=0; i<this.choiceBrand.length; i++) {
					filtersortidArr.push(this.choiceBrand[i].brandid)
				}
				filterData.filtersortid = this.activeType.cateid;
				filterData.filterbrandids = filtersortidArr.join(',')
				this.dispatchFilter(flag);
			},
			changeTab(idx){
				const curTab = this.curTab;

				if(curTab == idx && curTab == 2){
					return;
				}

				if (idx > 3) {
					if(this.isShowFilterPanel == !0) {
						this.hideFilterPanel();
						this.isFilterTab = !1;
						return false;
					}
					this.isFilterTab = !0;
					this.isShowFilterPanel = !0;
				} else {
					this.isShowFilterPanel = !1;
					this.curTab = idx;
					if(idx === 1 && curTab !== 1){
						this.changeColli(this.colliIdx);
						return;
					}
				}
				
				if(idx == 1 || this.isShowFilterPanel){
					this.isShowCnt = !0;
				}else{
					this.isShowCnt = !1;
				}

				if(idx == 2){
					this.doSalesVolSort();
				}

				if(idx == 3){
					this.doPriceSort();
				}

				if(idx == 4) {
					if(this.isSearch) {
						this.filterRst = {
							allbrandlist: this.filterList.brandlist,
							sortbrandaggre: this.filterList.catelist
						}
					}else {
						let params = {
							cityid: 0,
							proinceid: 0,
							cateid: this.$route.query.cid
						}
						Goods.getSortAggreGoods(params).then(res => {
							console.log(res)
							if(res.code !== this.$ERR.NORMAL){
								Toast(`品牌筛选失败，请刷新重试`);
								return;
							}

							this.filterRst = res.data;
						})
					}
				}
			},
			doSalesVolSort(){
				let curSv = this.salesVolIdx;
				let sv = -1;
				
				if(curSv == 0){
					sv = 2;
				}else if(curSv == 1){
					sv = 2;
				}else if(curSv == 2){
					sv = 1;
				}

				this.salesVolIdx = sv;

				this.filterData.orderfield = 3;
				this.filterData.orderform = 2;
				this.dispatchFilter();
			},
			doPriceSort(){
				let curPriceIdx = this.priceIdx;
				let priceIdx = -1;
				
				if(curPriceIdx == 0){
					priceIdx = 1;
				}else if(curPriceIdx == 1){
					priceIdx = 2;
				}else if(curPriceIdx == 2){
					priceIdx = 1;
				}

				this.priceIdx = priceIdx;
				this.filterData.orderfield = 1;
				this.filterData.orderform = priceIdx;
				this.dispatchFilter();
			},
			
			changeColli(idx){
				this.colliIdx = idx;
				this.filterData.orderfield = idx == 1 ? 4 : 5;
				this.dispatchFilter();
			},

			dispatchFilter(flag){
				if(flag !== false) {
					this.hideFilterPanel();
				}
				this.$emit('filter', this.filterData);
			},
			hidePanel(){
				this.hideFilterPanel();
			},
			hideFilterPanel(){
				if(!this.minPrice && !this.maxPrice){
					// this.isFilterTab = !1;
				}
				this.isShowCnt = !1;
				this.isShowFilterPanel = !1;
			},
			
			rangeInputHandler(e){
				const target = e.target;
				let val = target.value;
				if(!/^\d+$/g.test(val)){
					val = val.replace(/[^\d]/g,'');
					e.target.value = val;
				}
				if(/^0*/.test(val)){
					val = val.replace(/^0*/,'');
					e.target.value = val;
				}
				if(target.id=="min"){
					this.minPrice = val;
				}else{
					this.maxPrice = val;
				}
			},

			resetPrice(){
				this.minPrice = '';
				this.maxPrice = '';
			},

			setPrice(){
				const filterData = this.filterData;
				const min = ~~this.minPrice;
				const max = ~~this.maxPrice;

				let minP = min;
				let maxP = max;

				if(min && max){
					minP = Math.min(min, max);
					maxP = Math.max(min, max);
					this.minPrice = minP;
					this.maxPrice = maxP;
				}

				filterData.lowerprice = minP;
				filterData.upperprice = maxP;
				this.dispatchFilter();
				
			}
		},
		mounted(){

		}
	}
</script>

<style scoped>
	@import '../assets/styles/mixins.css';
	.filter-more {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 100%;
		z-index: 1001;
		background-color: #fff;
		.header {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 0.32rem;
			z-index: 1001;
			height: 0.88rem;
			background-color: #fff;
			border-bottom: 1px solid #e5e5e5;
			font-size: 0.36rem;
			overflow: hidden;
		}
		.filter-list-wrap {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			overflow-x: hidden;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
		}
		.header-back{
			position: relative;
			width: 1.06rem;
			height: 100%;
			background: url(../assets/images/shop/icon-arrow-left.png) left center/0.4rem  0.4rem  no-repeat;
		}

		.header-back:before{
			content:'';
			position: absolute;
			top: 0;
			right: 0;
			width: 2rem;
			height: 100%;
		}
		.filter-more-list {
			padding-top: .88rem;
			li {
				position: relative;
				width: 100%;
				height: 1rem;
				padding-left: .32rem;
				border-bottom: 1px solid #e6e6e6;
				font-size: .28rem;
				color: #333;
				line-height: 1rem;
				box-sizing: border-box;
			}
			.active {
				color: #FF681D;
				&::after {
					content: "";
					position: absolute;
					top: .37rem;
					right: .32rem;
					width: .34rem;
					height: .26rem;
					background-image: url(../assets/images/icon-tick.png);
					background-repeat: no-repeat;
					background-size: 100%;
				}
			}
		}
		.ok-btn {
			font-size: .32rem;
			color: #FF681D;
		}
	}
	.filter-overlay{
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		background-color: rgba(0,0,0,.5);
	}
	.filter-cnt{
		position: absolute;
		top: 0.88rem;
		left: 0;
		right: 0;
		z-index: 1000;
		background-color: #fff;
	}
	.bottom0 {
		bottom: 0;
	}
	.filter-tab{
		display: flex;
		height: 0.88rem;
		border-bottom: 1px solid $color-d9;
		font-size: 0.28rem;
	}

	.filter-tab__item{
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		.filter-tab__icon{
			display: inline-block;
			width: 0.24rem;
			height: 0.24rem;
			background: url(../assets/images/icon-sort-default.png) 0 0/ contain no-repeat;
		}
		&.active{
			color: $main-color;
		}
		&.active.desc .filter-tab__icon{
			background-image: url(../assets/images/icon-sort-desc.png);
		}
		&.active.asc .filter-tab__icon{
			background-image: url(../assets/images/icon-sort-asc.png);
		}
	}

	.filter-bd{
		font-size: 0.28rem;
		.colligation{
			height: 1.5rem;
		}
		.colligation-item{
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 0.16rem;
			padding: 0 0.32rem;
			line-height: 0.6rem;
			.colligation-item__icon{
				display: none;
				width: 0.34rem;
				height: 0.26rem;
				background: url(../assets/images/icon-tick.png) 0 0/ contain no-repeat;
			}

			&:last-of-type{
				margin-top: 0rem;
			}

			&.active{
				color: $main-color;
				.colligation-item__icon{
					display: block;
				}
			}
		}

		.price-condition__bd{
			padding: 0.32rem;
			font-size: 0.24rem;
		}

		.price-condition__cnt{
			display: flex;
			align-items: center;
			margin-top: 0.2rem;
			.price-condition__inp{
				flex: 1;
				width: 1%;
				height: 0.7rem;
				border: 1px solid $color-d9;
				border-radius: 0.04rem;
				text-align: center;
				color: #333;
				&::-webkit-input-placeholder{
					font-size:0.24rem;
					color: $color-80;
				}
			}
			.price-condition__gap{
				font-size: 0.4rem;
				margin: 0 0.2rem 0 0.22rem;
				color: #999;
			}
		}

		.filter-footer {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			height: 1rem;
			line-height: 1rem;
			font-size: 0.34rem;

			.pcf-btn{
				flex: 1;
				text-align: center;

				&.cancel{
					background-color: #f5f5f5;
				}

				&.ok{
					color: #fff;
					background-color: $main-color;
				}
			}
		}
	}
	
	.filter-body {
		padding: .47rem .32rem 0;
		box-sizing: border-box;
		font-size: .28rem;
		.top-wrap,
		.right-sec {
			display: flex;
			justify-content: space-between;
			align-items: center;
			line-height: 1;
		}
		.title {
			color: #333;
		}
		.choice-label {
			max-width: 3.6rem;
			color: #FF681D;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: .26rem;
			span {
				&:not(:first-child) {
					margin-left: .2rem;
				}
			}
		}
		.more {
			margin-left: .4rem;
			color: #666;
		}
		.cate-wrap {
			margin-bottom: 0.36rem;
		}
		.list {
			display: flex;
			flex-wrap: wrap;
			margin-left: -.43rem;
			li {
				width: 2rem;
				height: .6rem;
				margin-top: .3rem;
				margin-left: .43rem;
				line-height: .6rem;
				text-align: center;
				color: #666;
				border: 1px solid #999;
				border-radius: .04rem;
				box-sizing: border-box;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-size: .26rem;
			}
			.active {
				color: #FF681D;
				border-color: #FF681D;
			}
		}
	}
	
</style>