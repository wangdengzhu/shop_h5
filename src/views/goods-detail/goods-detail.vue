<template>
	<div v-show="pageLoaded">
		<div class="page" id="page">
			<div class="goods-container">
				<section class="goods">
					<div class="goods-banner tb1px" @click="showBigBanner" >
						<div class="swiper-container" id="banner"  v-show="goodsInfo.rollingpiclist">
							<div class="swiper-wrapper">
								<div class="swiper-slide" v-for="item in goodsInfo.rollingpiclist" >
									<img class="swiper-lazy swiper-image" v-lazy="{src: item,loading: IMAGE_DEFAULT.I_300}" alt="">
								</div>
							</div>
							<div class="swiper-pagination"></div>
							<div v-if="goodsInfo.saleroomtype == 2" class="flash-swiper-pagination" style="right:0.32rem"></div>
						</div>
					</div>
					<div class="goods-info plr30 tb1px">
						<!--限时抢购商品状态-->
						<div class="flash-goods"  v-if="goodsInfo.saleroomtype == 2">
							<div class="flash-goods-info">
								<span class="flash-new-price">￥{{(goodsInfo.saleprice - 0).toFixed(2)}}</span>
								<span class="flash-old-price">￥{{(goodsInfo.marketprice - 0).toFixed(2)}}</span>
								<p class="flash-flag">限时抢购</p>
							</div>
							<div class="flash-goods-timer">
								<span class="timer-title">{{timerStatusthree}}</span>
								<countTimeThree  :seconds="secondsthree"></countTimeThree>
							</div>
						</div>
						<p class="goods-tit">
							<em class="goods-tit-profit">{{goodsInfo.prefix}}</em>
							<span class="goods-tit-name">{{goodsInfo.title}}</span>
						</p>
						<p class="goods-desc">
							<span>{{ goodsInfo.attachtitle }}</span>
						</p>
						<p class="goods-price" v-if="goodsInfo.saleroomtype != 2">
							<span class="goods-price-txt">¥{{(goodsInfo.saleprice - 0).toFixed(2)}}</span>
						</p>
					</div>
				</section>
				<section class="description">
					<ul>
						<li>全场包邮</li>
						<li>正品保障</li>
						<li>极速发货</li>
						<li v-if="goodsInfo.allowreturn === 1">七天无理由退换</li>
					</ul>
				</section>
				<section class="spec plr30 tb1px" @click="goodsInfo.saleroomtype == 2 ? showSpecPopup(7) : showSpecPopup(action.SPEC)" v-if="sign">
					<span class="spec-txt">已选</span>
					<span class="spec-detail" v-if="skuId && skuId != 'undefined'">{{goodsInfo.skuattrnames}}</span>
					<em class="icon-arrow"></em>
				</section>
				<section class="spec plr30 tb1px" @click="goodsInfo.saleroomtype == 2 ? showSpecPopup(7) : showSpecPopup(action.SPEC)" v-if="!sign && goodsInfo.status != 1">
					<span class="spec-txt">已选</span>
					<span class="spec-detail" v-if="skuId && skuId != 'undefined'">{{goodsInfo.skuattrnames}}</span>
					<em class="icon-arrow"></em>
				</section>
				<section v-if="comment.info && comment.info.length > 0" class="comment">
					<div class="comment__hd tb1px" @click="redirect('/detail/comments',{ spuId: spuId, skuId: skuId})">
						<span class="ch__tit">评价 ({{ comment.summary.totalrows }})</span>
						<div class="ch__percent" >
							<span>好评度</span><em class="ch__percent-num">{{ comment.summary.satisfactionval }}%</em>
						</div>
					</div>
					<div class="comment__cnt">
						<div class="cn__usrinfo">
							<img class="cnu__avatar" :src="comment.info[0].usericon" alt="">
							<span class="cnu__name"> {{ comment.info[0].nickname }} </span>
						</div>
						<div class="cn__stars">
							<i v-for="i in 5" :class="{ 'icon-star--active': i<=comment.info[0].stars }" class="icon-star"></i>
						</div>
						<div class="cn__txt">
							<span>{{ comment.info[0].filtertext }}</span>
						</div>
						<div class="ci__pics" v-if="comment.info[0].piclist&&comment.info[0].piclist.length">
							<ul class="cip__list">
								<li @click="showComment(pidx)" v-for="(pic, pidx) in comment.info[0].piclist" class="cip__item">
									<img :src="pic" alt="">
								</li>
							</ul>
						</div>
						<div class="cn__spec">
							<span>{{ comment.info[0].spec }}</span>
						</div>
					</div>
				</section>
				<section class="comment" v-else @click="redirect('/detail/comments',{ skuId: skuId})">
					<div class="comment__hd tb1px">
						<span class="ch__tit">评价 (0)</span>
						<div class="ch__percent" >
						</div>
					</div>
				</section>
				<section class="detail">
					<div ref="tab" class="detail-tab-wrap"> 
						<div class="detail-tab plr30 tb1px" :class="{fixed:isFixedTab}">
							<a href="javascript:;" class="tab-item" :class="{active:detailShowType==1}" @click="switchTab(1)">
								<span>商品详情</span>
							</a>
							<a href="javascript:;" class="tab-item" :class="{active:detailShowType==2}" @click="switchTab(2)">
								<span>规格参数</span>
							</a>
							<a href="javascript:;" class="tab-item" :class="{active:detailShowType==3}"  @click="switchTab(3)">
								<span>购买须知</span>
							</a>
						</div>
					</div>
					<div class="detail-content">
						<div class="content-info content-basicinfo" v-show="detailShowType==1">
							<div class="content-info-hd">
								<span class="content-info-hd-txt">商品详情</span>
								<em class="line tb1px"></em>
							</div>
							<template v-if="goodsInfo.editmode==1">
								<p v-for=" pic in  goodsInfo.detailpiclist " class="">
									<img v-lazy="{src: pic.picname, loading: IMAGE_DEFAULT.I_750}" alt="">
								</p>
							</template>

							<template v-else-if="goodsInfo.editmode==2">
								<div v-html="filterHTML(goodsInfo.intro)"></div>
							</template>
						</div>
						<div class="content-info content-specparams" v-show="detailShowType==2">
							<div class="specparams">
								<div v-for="param in goodsInfo.specinfo" class="specparams-group tb1px">
									<div class="group-name">{{param.groupname}}</div>
									<ul class="params-list">
										<li class="param-item tb1px" v-for="attr in param.attrs">
											<span class="param-item-tit tb1px"><label>{{ attr.name }}</label></span>
											<span class="param-item-txt"><em>{{ attr.value }}</em></span>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div class="content-info content-attention" v-show="detailShowType==3">
							<div class="content-info-hd">
								<span class="content-info-hd-txt">购买须知</span>
								<em class="line tb1px"></em>
							</div>
							<p>
								<img :src="goodsInfo.tradrulepic"  alt="">
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
		<div class="goods-big-banner" v-show="isShowBigBanner" @click="closeBigBanner" @touchmove.prevent>
			<div class="swiper-container" id="bannerBig">
				<div class="swiper-wrapper">
					<div class="swiper-slide" v-for="items in goodsInfo.rollingpiclist">
						<img class="swiper-lazy swiper-image" v-lazy="{src: items,loading: IMAGE_DEFAULT.I_300}" alt="">				
					</div>
				</div>
				<div class="swiper-pagination swiper-pagination-big"></div>
			</div>
		</div>
		<div class="opr-nav fixed-footer">
			<div class="nav-group nav-group-one">
				<router-link :to="{path:'/home',query:{shopId:shopId}}" href="javascript:;" class="nav-item home tb1px">
					<i class="icon icon"></i>
					<span class="nav-item-txt">首页</span>
				</router-link>
				<a @click="navToChat" href="javascript:;" class="nav-item cs tb1px">
					<i class="icon icon"></i>
					<span class="nav-item-txt">客服</span>
				</a>
				<router-link :to="{ path:'/cart',query:{shopId:shopId}}" class="nav-item cart">
					<i class="icon icon"></i>
					<span class="nav-item-txt">购物车</span>
					<span v-if="cartNum > 0" class="nav-item-num" :class="classCartNum">{{ cartNum > 99 ? '99+' : cartNum }}</span>
				</router-link>
			</div>
			<!--限时抢购商品按钮-->
			<div class="nav-group nav-group-three" v-if="goodsInfo.saleroomtype == 2">
				<a href="javascript:;" class="nav-item add-cart" @click="waitTip()" v-if="flashstatus == 1">
					<span class="nav-item-txt">等待抢购</span>
				</a>
				<a href="javascript:;" class="nav-item buy-now" @click="showSpecPopup(7)"  v-else-if="flashpercentsold != 100 && flashstatus == 2">
					<span class="nav-item-txt">立即抢购</span>
				</a>
				<a href="javascript:;" class="nav-item off-store" v-else-if="flashpercentsold == 100">
					<span class="nav-item-txt">已抢完</span>
				</a>
				<a href="javascript:;" class="nav-item off-store" v-else-if="flashstatus == 0">
					<span class="nav-item-txt">已结束</span>
				</a>
			</div>

			<div class="nav-group nav-group-two" v-else-if="!goodsInfo.issoldout && goodsInfo.status == 0" >
				<a href="javascript:;" @click="showSpecPopup(action.CART)" class="nav-item add-cart">
					<span class="nav-item-txt">加入购物车</span>
				</a>
				<a href="javascript:;" @click="showSpecPopup(action.BUY)" class="nav-item buy-now">
					<span class="nav-item-txt">立即购买</span>
				</a>
			</div>
			<div class="nav-group nav-group-three" v-else>
				<a href="javascript:;" class="nav-item off-store" v-if="goodsInfo.issoldout">
					<span class="nav-item-txt">已售罄</span>
				</a>
				<a href="javascript:;" class="nav-item off-store"  v-else-if="goodsInfo.status == 1">
					<span class="nav-item-txt">商品已下架</span>
				</a>
				<a href="javascript:;" class="nav-item off-store"  v-else-if="goodsInfo.status == 2">
					<span class="nav-item-txt">商品已售停</span>
				</a>
				<a href="javascript:;" class="nav-item off-store"  v-else-if="goodsInfo.status == 3">
					<span class="nav-item-txt">商品无库存</span>
				</a>
			</div>
	
		</div>
		<transition name="to-top-fade" >
			<div @click="backToTop" v-show="isShowBackTop" class="back-to-top"></div>
		</transition>
		<goods-detail-sku @changeSkuPage="changeSkuPage" @close="hideSpecPopup" :defaultSkuid="skuId + ''" :show="isShowPopup" :actionType="actionType" :sign="sign"  :goodsInfo="goodsInfo" :skuInfo="skuInfo" :skuAttrs="skuAttrArr" :flashstatus="flashstatus" :flashpercentsold="flashpercentsold" :flashactivityld="flashactivityld"></goods-detail-sku>
		<transition name="slide">
			<router-view></router-view>
		</transition>
		<transition name="fade">
			<div class="comment-big-banner" v-show="isShowBigComment" @click="closeBigComment" @touchmove.prevent>
				<div class="swiper-container" id="commentSwiper">
					<div class="swiper-wrapper">
						<div class="swiper-slide" v-for="pic in curCommentPic">
							<img class="swiper-image" :src="pic" >
						</div>
					</div>
					<div class="swiper-pagination swiper-pagination-comment"></div>
				</div>
			</div>
		</transition>
	
	<!-- 	<transition name="bullet"  @after-enter="afterEnter" @after-leave="afterLeave">
			<div v-show="isShowBullet" class="bullet-screen">
				<span>{{bullets[0]}}</span>
			</div>
		</transition> -->
		<bullet-view :bullets="bullets"></bullet-view>
	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	import { Goods, Shop, Bullet } from '@/apis/';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';
	import Indicator from '@/components/common/indicator/';
	import { throttle } from '@/utils/common';
	import goodsDetailSku from '@/components/GoodsDetailSku';
	import Toast from '@/components/common/toast';
	import iosWxShareFix from '@/plugins/iosWxShareFix';
	import BulletView from '@/components/bullet';
	import countTimeThree from '@/components/flashCountDownTimerThree';
	export default {
		data(){
			return {
				sign:'',
				flashactivityld:0,
				flashstatus:0,      //限时抢购状态
				flashpercentsold:0, //限时抢购商品百分比
				secondsthree:0,     //倒计时间
				timerStatusthree:null,   //倒计时状态
				skuId:0,
				spuId:0,
				goodsInfo:{
					skuId: '',
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
					marketpricemin:0,
					prodtype:0,
					saleroomtype:0,
					paginationClass:'',   //分页样式
					paginationType:'',    //分页类型
				},
				comment: {},
				shopInfo:{},
				isShowBigBanner:!1,
				isShowBigComment:!1,
				curCommentPic: [],
				mySiper:null,
				isShowBackTop:!1,
				detailShowType:1,
				isShowPopup:!1,
				skuInfo:[],
				skuAttrArr:[],
				myBigSwiper:null,
				isFixedTab:!1,
				pageLoaded:!1,
				isUmount:!1,
				timer:null,
				currentPage:'',
				actionType:1,
				action:{
					SPEC:3,
					CART:4,
					BUY:5
				},
				bullets: null
			}
		},
		methods:{
			...mapMutations(['SHOW_LOGIN']),
			changeSkuPage(val) {
				this.loadGoodsData(val[0]);
			},
			//刷新页面
			refreshPage(){
                this.$router.go(0);
			},   
			navToChat(){
				if (!this.isLogin) {
					this.SHOW_LOGIN(!0);
					return;
				}

				this.redirect('/chat', { skuId: this.skuId, st: 2 });
			},
			filterHTML(html){
				const imgs = html.match(/<img[^>]+>/g);
				return imgs.join('').replace(/style\s*=\s*"[^\"]*"/g,'');
			},
			backToTop(){
				let doc = document.querySelector('.page'),
					scrollVal =  doc.scrollTop,
					timerID = null;
				
				if (!window.requestAnimationFrame) {
					requestAnimationFrame = (fn) => {
						return setTimeout(() => {
							fn();
						}, 17);
					};
				}

				if (!window.cancelAnimationFrame) {
					cancelAnimationFrame = (id) => {
						clearTimeout(id);
					};
				}
				
				const start = ()=>{
					scrollVal = scrollVal + (0 - scrollVal) / 4;
					if(scrollVal<1){
						doc.scrollTop = 0;
						cancelAnimationFrame(timerID);
						return;
					}
					doc.scrollTop = scrollVal;
					timerID = requestAnimationFrame(start);
				};
				
				start();
			},
			showBigBanner(){
				this.isShowBigBanner = !0;
				document.body.classList.add('no-scroll');
				this.mySiper.autoplay.stop();
				let curSildeIdx = this.mySiper.activeIndex;
				if(!this.myBigSwiper){
					this.$nextTick(() => {
						this.myBigSwiper = new Swiper('#bannerBig', {
							pagination: {
								el: '.swiper-pagination-big',
								type: 'fraction'
							},
							observer: !0,
							observeParents: true,
							initialSlide: curSildeIdx,
							preloadImages: !1,
							lazy: {
								loadPrevNext: !0
							}
						});
					})
				}else{
					this.myBigSwiper.lazy.loadInSlide(curSildeIdx);
					this.myBigSwiper.slideTo(curSildeIdx);
				}	
			},
			closeBigBanner(){
				this.isShowBigBanner = !1;
				this.mySiper && this.mySiper.autoplay.start();
				document.body.classList.remove('no-scroll');
			},
			showComment(pidx){
				document.body.classList.add('no-scroll');
				this.isShowBigComment = !0;
				this.curCommentPic = this.comment.info[0].piclist;
				this.activeIdx = 0;
				if(this.swiper){
					this.swiper.destroy(); 
				}
				this.$nextTick(() => {
					this.swiper = new Swiper('#commentSwiper', {
						pagination: {
							el: '.swiper-pagination-comment',
							type: 'fraction'
						},
						observer: !0,
						observeParents: !0,
						initialSlide: pidx,
						preloadImages: !0
					});
				})	
			},
			closeBigComment(){
				this.isShowBigComment = !1;
				document.body.classList.remove('no-scroll');
			},
			switchTab(t=1){
				const top = this.$refs.tab.offsetTop;
				const doc = document.querySelector('#page');
				if (this.detailShowType == t) {
					return;
				}
				this.detailShowType = t;
				this.$nextTick(()=>{
					this.isFixedTab && (doc.scrollTop = ~~top);
				});
				
			},
			showSpecPopup(action){
				if(this.goodsInfo.prodtype == 3 && this.goodsInfo.saleroomtype == 1){
					Toast(`请到卖家版app中购买`);
					return;
				}
				// if(this.goodsInfo.saleroomtype == 2 && this.flashpercentsold == 100) {
				// 	return false;
				// }
				this.actionType = action;
				if(this.skuInfo.length>0){
					this.isShowPopup = !0;
					return;
				}
				
				Indicator.show('加载中...');
				Goods.getGoodsSpu(this.spuId, this.sign).then((res) => {
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
			hideSpecPopup(){
				this.isShowPopup = !1;
			},
			initSpecData(data){
				this.skuInfo = data.skuinfo || [];
				this.skuAttrArr = data.skuattrname || [];
			},
			loadBulletData(){
				if (this.goodsInfo.status == 9) {
					return;
				}
				Bullet.detail(this.spuId).then(res => {
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					this.bullets = res.data;
				}).catch(err => {
					console.log(err);
				});
			},
			loadGoodsData(sku){
				let param, 
					isFlashFlag;
				if(sku) {
					this.skuId = sku;
				}
				Indicator.show('加载中...');
				const ERR = this.$ERR;
				Goods.getDetailInfo(this.skuId, this.spuId, this.sign, isFlashFlag).then((res) => {
					Indicator.close();
					if (res.code === ERR.NORMAL) {
						if(this.isUmount){
							return;
						}
						const data = res.data;
						document.title = data.title;
						this.pageLoaded = !0;
						this.spuId = data.spuid;
						this.skuId = data.skuid;
						this.goodsInfo = data;
						this.comment = data.comment;
						this.weiXinShare(data);
						this.initSwiper();
						this.loadBulletData();
						this.$nextTick(() => {
							this.initScroll();
						});

						if(data.saleroomtype == 2) {
							this.loadFlashGoodsData();
						}
					}else{
						Toast('可能发生了点异常，去看更多商品');
						this.timer = setTimeout(()=>{
							this.redirect('/category');
						},2000);
					}
				}).catch((err) => {
					Indicator.close();
					console.log(err);
				});
			},
			//限时抢购商品
			loadFlashGoodsData(){
				Indicator.show('加载中...');
				const ERR = this.$ERR;
				Goods.getFlashDetailInfo(this.spuId).then((res) => {
					Indicator.close();
					if (res.code === ERR.NORMAL) {
						if(this.isUmount){
							return;
						}

						this.pageLoaded = !0;
						this.secondsthree = res.data.interval;

						this.flashstatus = res.data.status;
						this.flashpercentsold = res.data.percentsold;
						this.flashactivityld = res.data.activityid;

						let sta =  res.data.status;
						if(sta == 1){
							this.timerStatusthree = "距开始"
						}else if(sta == 2){
							this.timerStatusthree = "距结束"
						}else if(sta == 0){
							this.timerStatusthree = "已结束"
						}
					}else{
						Toast('可能发生了点异常，去看更多商品');
						this.timer = setTimeout(()=>{
							this.redirect('/category');
						},2000);
					}
				}).catch((err) => {
					Indicator.close();
					console.log(err);
				});
			},
			//等待抢购提示
			waitTip(){
				Toast('未到抢购时间，请耐心等待');
			},
			initSwiper(){
				let flashType = this.goodsInfo.saleroomtype;
				let flashClass = '';
				let swipeType = '';

				if(flashType == 2){
					flashClass = '.flash-swiper-pagination';
					swipeType = 'fraction'
				}else{
					flashClass = '.swiper-pagination';
					swipeType = 'bullets'
				}
				this.$nextTick(() => {
					if(this.mySiper){
						return;
					}
					this.mySiper = new Swiper('#banner', {
						pagination: {
							el: flashClass,
							type: swipeType,
						},
						autoplay: {
							delay: 5000,
							disableOnInteraction:!1
						},
						preloadImages:!1,
						lazy: {
							loadPrevNext:!0,
						}
					});
				});
			},
			initScroll(){
				if (!this.$refs.tab) {
					return;
				}
				const winHeight = window.innerHeight || document.documentElement.clientHeight;
				const tabOffsetTop = this.$refs.tab.offsetTop;
				const tabHeight = ~~this.$refs.tab.clientHeight;
				const tabTop = ~~tabOffsetTop;
				
				const scrollContainer = document.querySelector('#page');

				const detailContainer = document.querySelector('.detail-content');
				const footerHeight = ~~document.querySelector('.opr-nav').clientHeight;
				detailContainer.style.cssText = 'min-height:'+(winHeight-tabHeight-footerHeight)+'px';
				
				const scrollHandler = ()=>{
					const st = this.getScrollTop(scrollContainer);
					if (st > 100) {
						this.isShowBackTop = !0;
					} else {
						this.isShowBackTop = !1;
					}
					if (st >= tabTop) {
						this.isFixedTab = !0;
					}else{
						this.isFixedTab = !1;
					}
					
				};
				scrollContainer.addEventListener('scroll', throttle(scrollHandler, 100, 200), !1);
			},
			getScrollTop(elem){
				if(elem == window){
					return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop ;
				}else{
					return elem.scrollTop;
				}
				
			},
			weiXinShare(goods) {
				function replaceUrlParamVal(url, paramName, replaceWith) {
					var re = eval('/('+ paramName+'=)([^&]*)/gi');
					var nUrl = url.replace(re,paramName+'='+replaceWith);
					return nUrl;
				}
				const href = replaceUrlParamVal(location.href, 'skuId', goods.skuid);
				const tit = goods.title;
				const img = goods.detailpiclist[0].picname;
				const desc = '好东西只给重要的人分享' || goods.attachtitle;
				this.wxShare(tit, href, img, desc);
			},
			init(){
				this.loadGoodsData();
				// if(this.$route.query.spuId) {
				// 	this.loadFlashGoodsData();
				// }
				_mjda.push(['_pageView', 'detail', `${this.skuId},${this.spuId}`]);
			}
		},
		components:{
			'goods-detail-sku':goodsDetailSku,
			'bullet-view': BulletView,
			'countTimeThree':countTimeThree
		},
		computed:{
			...mapState(['shopId', 'shopCart', 'shopCartNum', 'isLogin']),
			cartNum(){
				return  this.shopCartNum + this.shopCart.reduce((prev, cur, idx, arr) => prev + cur.shopnum , 0);
			},
			classCartNum(){
				return {
					one: this.cartNum < 10,
					two: this.cartNum >= 10 && this.cartNum <= 99,
					three: this.cartNum > 99
				}
			}
		},
		mixins:[iosWxShareFix],
		mounted(){
			//倒计时刷新
			if (typeof document.hidden !== "undefined") { 
				this.hidden = "hidden";
				this.visibilityChange = "visibilitychange";
			} else if (typeof document.webkitHidden !== "undefined") {
				this.hidden = "webkitHidden";
				this.visibilityChange = "webkitvisibilitychange";
			}
			// 微信分享到好友会触发这个hidden所以加上三分钟后才会刷新
			setTimeout(() => {
				document.addEventListener(this.visibilityChange, this.refreshPage, false);
			}, 60000 * 3);
		},
		beforeDestroy(){
			document.removeEventListener(this.visibilityChange, this.refreshPage, false);
		},
		created(){
			if(this.$route.query.spuId) {
				this.spuId = this.$route.query.spuId;
			}
			if(this.$route.query.sign) {
				this.sign = this.$route.query.sign;
			}
			this.skuId = this.$route.query.skuId;
			this.init();
		},
		destroyed(){
			this.isUmount = !0;
			if(!this.timer){
				clearTimeout(this.timer);
			}
		}
	}
</script>
<style>
	.swiper-container{
		.swiper-pagination-bullet{
			width: 6px;
			height: 6px;
			background-color: #ccc;
			opacity: 1;
		}
		.swiper-pagination-bullet-active{
			background-color:#ff681d;
		}
	}
	.swiper-container{
		width: 100%;
		height: 100%;
		.swiper-slide{
			display: flex;
			justify-content: center;
			align-items: center;
		}
		img{
			display: block;
			width: 100%;
			height: auto;
		}
	}

	.swiper-pagination-big{
		top: 1.25rem;
		bottom: auto;
		color: #fff;
	}
	.swiper-pagination-big span.swiper-pagination-current{
		font-size:0.4rem;
	}

	.swiper-pagination-fraction{
		top:none;
		left:auto;
		span{
			color:inherit;
		}
	}
	.content-basicinfo{
		img{
			display: block !important;
			width: 100% !important;
			height: auto !important;
		}
	}
</style>
<style scoped>
	@import '../../assets/styles/mixins';
	.flash-swiper-pagination{
		position:absolute;
		bottom:1.2rem;
		z-index:10;
		font-size:0.22rem;
		width:0.66rem;
		height:0.35rem;
		line-height:0.35rem;
		background:rgba(0,0,0,0.3);
		border-radius:0.15rem;
		text-align:center;
		color: #fff;
	}
	.flash-swiper-pagination span.swiper-pagination-current{
		font-size:0.22rem;
	}
	.timer-title{
		margin-right:0.18rem;
	}
	.flash-goods-timer{
		margin-top:0.4rem;
		float:right;
		margin-right:0.32rem;
	}
	.flash-flag{
		font-size:0.24rem;
		font-family:PingFang-SC-Medium;
		margin-bottom:0.15rem;
		margin-left:0.09rem;
		margin-top:0.1rem;
	}
	.flash-old-price{
		font-size:0.26rem;
		font-family:PingFangSC-Regular;
		text-decoration:line-through;
	}
	.flash-new-price{
		font-size:0.4rem;
		font-family:PingFangSC-Medium;
		margin-right:0.18rem;
	}
	.flash-goods-info{
		width:50%;
		float:left;
		margin-top:0.16rem;
		margin-left:0.32rem;
	}
	.flash-goods{
		position:absolute;
		top:-1rem;
		left:0;
		z-index:10;
		width:100%;
		background:linear-gradient(-90deg,rgba(255,157,0,1),rgba(255,120,9,1));
		color:#fff;
	}
	@define-extend fvc{
		display: flex;
		align-items: center;
	}
	@define-mixin ptb $pt,$pb{
		padding-top: $pt;
		padding-bottom: $pb;
	}
	@define-mixin icon $w,$h,$url{
		display: block;
		width: $w;
		height: $h;
		background: url($url) 0 0/cover;
	}
	@define-extend ellipsis{
		overflow:hidden;
		text-overflow: ellipsis; 
		white-space: nowrap;
	}
	
	.page{
		@extend page;
	}
	
	.icon-arrow{
		display: block;
		width: 8px;
		height: 13px;
		background: url(../../assets/images/list-icon.png) 0 0/cover;
	}
	.plr30{
		padding-left: 0.3rem !important;
		padding-right: 0.3rem !important; 
	}
	.goods-container{
		overflow-x: hidden;
		background-color: #f5f5f5;
	}
	.goods-banner{
		/*position: relative;
		z-index: 1;*/
		width: 100%;
		height: 7.5rem;
		/*border-bottom: 1px solid #e5e5e5; */
		box-sizing: border-box;
		background-color: #fff;
	}
	.goods-big-banner{
		position: fixed;
		top: 0;
		left: 0;
		bottom:0;
		right: 0;
		background-color: #333;
		z-index: 99999;
	}
	.goods-info{
		position: relative;
		z-index: 2;
		padding: $mg-30 $mg-30;
		background-color: #fff;
		/*border-bottom: 1px solid $color-d9;*/
		/*margin-bottom: 0.2rem;*/
		box-shadow: 0 -0.08rem 0.16rem rgba(200,200,200,0.20);
		.goods-tit{
			font-size: $fs-32;
			color:#333;
			line-height: 1.4;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			word-wrap: break-word;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.goods-desc{
			margin: 0.12rem 0 0.36rem 0;
			font-size: $fs-24;
			color: $color-80;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			word-wrap: break-word;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.goods-price{
			display: flex;
			align-items: center;
			font-size: $fs-32;
			color: $main-color;
			line-height: 0.3rem;
			del {
				margin-left: .32rem;
				color: #999;
				font-size: .22rem;
				line-height: 1;
			}
		}
		.goods-price:first-letter{
			display: inline-block;
			margin-right: 0.06rem;
		}
		.goods-del-price{
			font-size: $fs-32;
			color:$color-80;
			margin-left: $mg-20;
			text-decoration: line-through;
		}
	}
	.spec{
		@extend fvc;
		justify-content: space-between;
		height: 0.88rem;
		color:#333;
		margin-bottom: $mg-20;
		font-size: $fs-28;
		background-color: #fff;
		/*border-bottom: 1px solid $color-d9;*/
	}

	.detail{
		.detail-tab-wrap{
			height: 1rem;
			.detail-tab{
				display: flex;
				justify-content: space-between;
				height: 1rem;
				border-bottom: 1px solid $color-d9;
				font-size: $fs-28;
				color:#333;
				background-color: #fff;
				padding: 0 0.62rem !important;
				box-sizing: border-box;
				.tab-item{
					color: inherit;
					border-bottom: 0.04rem solid transparent;
					height: 0.96rem;
					line-height: 0.96rem;
					&.active{
						color:$main-color;
						border-bottom-color: currentColor; 
					}
				}
				&.fixed{
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					z-index: 1222;
				}
			}
		}

		.detail-content{
			overflow: hidden;
			background-color: #fff;
			img{
				display: block;
				width: 100%;
				height: auto;
			}
		}

		.content-info{
			background-color: #fff;
		}

		.content-basicinfo,.content-attention{
		/*	&:before{
				content:'';
				display: block;
				height: 0.2rem;
				background-color: #f5f5f5;
			}*/
		}

		.content-info-hd{
			position: relative;
			padding: $mg-30 0;
			/*margin-top: $mg-20;*/
			text-align: center;
			background-color: #fff;
			
			.line{
				position:absolute;
				left:50%;
				top:50%;
				width:2.86rem;
				height: 1px;
				border-bottom:1px solid $color-d9;
				z-index: 0;
				transform: translate3d(-50%,0,0);
			}
			.content-info-hd-txt{
				position: relative;
				display: inline-block;
				padding: 0 0.15rem;
				color:#999;
				font-size: $fs-24;
				background-color: #fff;
				z-index: 1;
			}
		}

		.content-specparams{
			padding: $mg-20 0.3rem 0.5rem;
			font-size: $fs-24;
			color:#666;

		}

		.specparams-group{
			border: 1px solid $color-d9;
			border-top-color:transparent;
			&:first-of-type{
				border-top-color:$color-d9;
			}
			.group-name,.param-item{
				padding-left: 0.48rem;
			}
			.group-name{
				padding-top: 0.22rem;
				padding-bottom: 0.22rem;
				font-weight: 600;
			}
			.param-item{
				display: flex;
				border-top:1px solid #d8d8d8;
				.param-item-txt,.param-item-tit{
					display: flex;
					align-items: center;
					padding: 0.22rem 0;
					word-break:break-all;
				}
				.param-item-tit{
					width: 2.0rem;
					flex-shrink: 0;
					padding-right:0.3rem; 
					box-sizing: border-box;
					border-right: 1px solid #d8d8d8;
				}
				.param-item-txt{
					padding-right:0.3rem; 
					padding-left: 0.3rem;
					flex:1;
				}
			}
		}
	}

	.fixed-footer{
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
	}

	.opr-nav{
		display: flex;
		height: 1rem;
		background-color: #fff;
		box-shadow: 0 -4px 10px 0 rgba(200,200,200,0.20);
	}
	.nav-group{
		display: flex;
		height: 100%;
		&.nav-group-one{
			width: 41%;
			font-size: $fs-24;
			.nav-item{
				flex-direction: column;
				.nav-item-txt{
					color:$color-80;
					font-size: 0.22rem;
				}
				.nav-item-num{
					position: absolute;
					/*right: 0.16rem;*/
					left: 53%;
					top: 0.08rem;
					width: 0.26rem;
					height: 0.26rem;
					line-height: 0.24rem;
					border: 1px solid currentColor;
					box-sizing: border-box;
					color: #f00;
					font-size: 0.22rem;
					border-radius: 0.14rem;
					background-color: #fff;
					text-align: center;
					&.one{
						border-radius: 100%;
					}
					&.three{
						width: 0.46rem;
					}
					&.two{
						width: 0.36rem;
					}
				}
			}
		}
		&.nav-group-two,&.nav-group-three{
			width:59%;
			font-size: $fs-32;
			color:#fff;
			.nav-item-txt{
				color:#fff;
			}
		}
		.nav-item{
			position: relative;
			display: flex;
			justify-content:  center;
			align-items: center;
			height: 100%;
			flex:1;
			/*&.profile{
				border-right:1px solid $color-d9;
				.icon{
					background-image: url(../../assets/images/icon-cart-mine.png);
				}
			}*/
			&.home{
				/*border-right:1px solid $color-d9;*/
				.icon{
					background-image: url(../../assets/images/footer/home.png);
				}
			}
			&.cart{
				.icon{
					background-image: url(../../assets/images/footer/cart.png);
				}
			}

			&.cs{
				.icon{
					background-image: url(../../assets/images/footer/custom-service.png);
				}
			}

			.icon{
				margin-bottom: 0.06rem;
				@mixin icon 0.4rem,0.4rem; 
			}
			&.add-cart{
				background-color: #ffa71d;
			}
			&.buy-now{
				background-color: $main-color;
			}
			&.off-store{
				background-color: $color-d9;
			}
		}
	}

	.back-to-top{
		position: fixed;
		bottom:1.55rem;
		right: 0.3rem;
		z-index: 2;
		@mixin icon 0.74rem,0.74rem,../../assets/images/shop/icon-to-top.png;
	}

	.to-top-fade-enter-active,.to-top-fade-leave-active{
		transition: opacity .3s;
	}

	.to-top-fade-enter,.to-top-fade-leave-to{
		opacity: 0;
	}
	
	.description {
		width: 100%;
		height: .6rem;
		/*margin-top: -.3rem;*/
		background:rgba(245,245,245,1);
		ul {
			height: 100%;
			padding: 0 0.32rem;
			display: flex;
			justify-content: space-between;
			/*align-items: center;*/
			line-height: .66rem;
			li {
				position: relative;
				padding-left: .32rem;
				font-size: .24rem;
				color:rgba(128,128,128,1);
				&:before {
					content: "";
					position: absolute;
					top: 50%;
					left: 0;
					width: 12px;
					height: 12px;
					margin-top: -5px;
					background-size: 100%;
					background-image: url(../../assets/images/description.png);
				}
			}
		}
	}

	.comment{
		margin-bottom: 0.2rem;
		background-color: #fff;
		.comment__hd{
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 0.88rem;
			padding: 0 0.32rem;
			/*border-bottom: 1px solid #e5e5e5;*/
			color: #666;
			font-size: 0.28rem;
		}
		.ch__percent{
			position: relative;
			padding-right: 0.4rem;
			color: #333;
			font-size: 0.26rem;
			&:after{
				content: '';
				position: absolute;
				right: 0;
				top: 50%;
				width: 6px;
				height: 13px;
				background: url(../../assets/images/arrow-new.png) 0 0/contain no-repeat;
				transform: translateY(-50%);
			}
		}
		.ch__percent-num{
			margin-left: 0.1rem;
			color: $main-color;
		}
		.comment__cnt{
			padding: 0 0.32rem;
			font-size: 0.26rem;
			color: #666;
			padding-bottom: 0.36rem;
			border-top: 1px solid #e5e5e5;
		}
		.cn__usrinfo{
			display: flex;
			align-items: center;
			padding: 0.24rem 0 0.2rem;
		}
		.cnu__avatar{
			width: 0.6rem;
			height: 0.6rem;
			border-radius: 50%;
			background-color: #e5e5e5;
			margin-right: 0.16rem;
		}
		.cnu__name{
			color: #333;
		}

		.cn__stars{
			display: flex;
			margin-bottom: 0.34rem;
		}
		.icon-star{
			width: 22px;
			height: 16px;
			background: url(../../assets/images/icon-star.png) 0 0/contain no-repeat;
		}
		.icon-star--active{
			background-image: url(../../assets/images/icon-star-active.png);
		}
		.cn__txt{
			line-height: 0.37rem;
			/*margin-bottom: 0.2rem;*/
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.cn__spec{
			color: #999;
			font-size: 0.22rem;
			margin-top: 0.2rem;
		}

		.ci__pics{
			margin-top: 0.24rem;
			margin-bottom: -0.2rem;
		}

		.cip__list{
			margin-left: -0.22rem;
			margin-right: -0.02rem;
			overflow: hidden;
		}

		.cip__item{
			float: left;
			width: 2.16rem;
			height: 2.16rem;
			margin-left: 0.2rem;
			margin-bottom: 0.2rem;
			img{
				display: block;
				width: 100%;
				height: 100%;
			}
		}
	}
	.spec-detail {
		flex: 1;
		margin-left: .2rem;
		color: #999;
	}

	.slide-enter-active,.slide-leave-active{
		transition: all .3s ease-in-out;
	}
	.slide-enter,.slide-leave-to{
		transform: translate3d(100%,0,0);
	}
	
	.comment-big-banner{
		position: fixed;
		top: 0;
		left: 0;
		bottom:0;
		right: 0;
		background-color: #000;
		z-index: 999999;
	}
	.swiper-pagination-fraction{
		top:1.25rem;
		bottom:auto;
		color:#fff;
		span{
			font-size: 0.32rem;
			color:inherit;
			&.swiper-pagination-current{
				font-size: 0.32rem;
			}
		}
	}
</style>