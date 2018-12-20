<template>
	<div class="shop-wrapper" v-if="pageLoaded">
		<!-- <template v-if="!pageLoaded">
			<div class="skeleton"></div>
		</template> -->
		<!-- <template v-else> -->
		<header class="header tb1px" :class="{wxheader: isWXEnv}">
			<div @click="redirect('/search')" class="mod-search" v-if="isWXEnv">
				<form class="mod-search__form">
					<i class="search-hd-icon"></i>
					<input class="mod-search__inp" readonly type="search" placeholder="请输入商品名称">
				</form>
				<span class="mod-search__btn mod-search__btn--disabled">搜索</span>
			</div>
			<div class="mod-title" v-else>
				<span>{{ shopInfo.storename }}</span>
				<i @click="redirect('/search')" class="mod-title__icon"></i>
			</div>
			<div class="mod-nav" id="nav">
				<ul class="mod-nav__list" v-show="cataArr.length">
					<li @click="activeMenu(idx, item.cateid, $event)" :catalog-id="item.cateid" v-for="(item,idx) in cataArr" class="mod-nav__item" :class="curCataIdx === idx ? 'mod-nav__item--active':''">{{ item.catename }}</li>
				</ul>
				<router-link :to="{path:'/category',query:{shopId:shopId}}" tag="div" class="mod-nav__more">
					<div class="mod-nav__icon"></div>
				</router-link>
			</div>
		</header>
		<div ref="shopPage" class="shop-page">
			<bullet-view :bullets="bullets" :paused="bulletPaused"></bullet-view>
			<div ref="shopRecommend" v-show="curCata.type == 3" class="shop-recommend-wrap">
				<div class="inner-box">
					<section class="banner">
						<div class="swiper-container" id="bannerSwiper" v-if="indexBanner.length">
							<div class="swiper-wrapper" @click="bannerNav(1)">
								<div  class="swiper-slide" v-for="item in indexBanner">
									<img  class="swiper-image" :src="item.bannerpic" alt="">
								</div>
							</div>
							<div class="swiper-pagination"></div>
						</div>
					</section>
					<main class="main">
						<section class="mod-section mod-new-products" v-if="flashGoods.length > 0">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">限时抢购</span>
									<span class="hd-tit__small">低至一元起</span>
								</div>
								<div class="hd-timer">
									<span class="hd-timer-tit">{{timerStatusone}}</span>
									<span class="hd-timer-sum">
										<countTimeOne :seconds="secondsone"></countTimeOne>
									</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,spuId:goods.spuid,skuId:goods.skuid}}" tag="li" v-for="goods in flashGoods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic flash-goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
												<div v-if="goods.percentsold == 100" class="goods-list__flashsaleover">
													已抢完
												</div>
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">
													¥{{ goods.goodsprice.toFixed(2) }}
													<span class="goods-list__oldprice">¥{{ goods.marketprice.toFixed(2) }}</span>
												</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<div class="mod-section__ft mod-section__ft--bt tb1px" @click="redirect('/flash-sale')">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</div>
						</section>
						<!-- <section class="mod-section mod-new-products" v-if="activitiesone.length > 0" style="padding: 0">
							<div class="mod-section__hd" style="padding-left: 0.32rem">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">活动专题</span>
									<span class="hd-tit__small">热门活动 主题推荐</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="activity-list" :class="aclassOne">
									<div class="activity-box">
									<router-link :to="{path:'/activity',query:{shopId:shopId,activityid:goods.activityid}}" v-for="(goods,i) in activitiesone"  tag="div"  :key="goods.activityid" class="activity-link">
										<div class="activity-item">
											<div class="activity-pic">
												<img v-lazy="{src: goods.coverpage ,loading: IMAGE_DEFAULT.I_300}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="activity-title">{{ goods.title }}</p>
												<p class="activity-subtitle">{{ goods.subtitle }}</p>
												<p class="activity-price" :class="{'activity-txt': qiStr[i] == 1 }">{{ goods.slogan }}<span class="actone-font" v-if="qiStr[i] == 1">起</span></p>
											</div>
										</div>
									</router-link>
									</div>
								</div>
							</div>
						</section> 
						-->
						<section class="mod-section mod-shop-handpicked">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">店主精选</span>
									<span class="hd-tit__small">为你，我精挑细选</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in shopHandPicked" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{goods.goodsname}}</p>
												<p class="goods-list__price">¥{{goods.goodsprice.toFixed(2)}}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<div class="mod-section__ft mod-section__ft--bt tb1px" @click="redirect('/goods-recommend')">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</div>
						</section> 
						<!--
						<section class="mod-section mod-brand-handpicked" v-if="rankInfo.length > 0 && brandHandPicked.length > 0">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">精选品牌</span>
									<span class="hd-tit__small">大品牌，有保障</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="brand-list">
									<ul class="brand-list__ranking">
										<li @click="doRankNav(rank.coverid)" v-for="rank in rankInfo" :key="rank.coverid" class="ranking-item">
											<div class="ranking-item__title">
												<p class="title-big">{{ getRandName(rank.coverid) }}</p>
												<p class="title-small">TOP10</p>
											</div> 
											<div class="ranking-item__pic">
												<img :src="rank.pic" alt="">
											</div>
										</li>
									</ul>
									<ul class="brand-list__box">
										<li  v-for="brand in brandHandPicked" class="brand-list__item">
											<div class="brand-list__pic">
												<img v-if="brand.mainpagepic" :src="brand.mainpagepic" alt="">
												<img v-else src="../../assets/images/shop/77.png" alt="">
											</div> 
											<div class="brand-list__big">
												<img @click="toBrandGoodsPage(brand[0])" :src="brand[0].mainpagepic" alt="">
											</div>
											<div class="brand-list__small">
												<img @click="toBrandGoodsPage(brand[1])"  :src="brand[1].mainpagepic" alt="">
												<img @click="toBrandGoodsPage(brand[2])"  :src="brand[2].mainpagepic" alt="">
											</div>
										</li>
									</ul>
								</div>
							</div>
							<div class="mod-section__ft tb1px" @click="redirect('/brand')">
								<div class="ft-more">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</div>
						</section>
						<section class="mod-section mod-hot-goods">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">火爆单品</span>
									<span class="hd-tit__small">大家爱买的都在这了</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--two">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in hotGoods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<img :src="goods.goodslistpicurl" alt=""> 
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<div class="goods-list__price">
													<p>¥{{ goods.goodsprice.toFixed(2) }}</p>
													<del v-if="goods.marketprice > goods.goodsprice">¥{{ goods.marketprice.toFixed(2) }}</del>
												</div>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<div class="mod-section__ft mod-section__ft--bt tb1px" @click="redirect('/single-hot')">
								<div class="ft-more">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</div>
						</section>
						-->
						
						<section class="mod-section mod-new-products">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">新品推荐</span>
									<span class="hd-tit__small">好货上新，抢先购！</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in newGoods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">¥{{ goods.goodsprice.toFixed(2) }}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<div class="mod-section__ft mod-section__ft--bt tb1px" @click="redirect('/goods-new')">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</div>
						</section>
						<!--
						<section class="mod-section mod-new-products" v-if="activitiestwo.length > 0" style="padding: 0">
							<div class="mod-section__hd" style="padding-left: 0.32rem">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">特色主题</span>
									<span class="hd-tit__small">风格好物 特色呈现</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="activity-list" :class="aclassTwo">
									<div class="activity-box">
										<router-link :to="{path:'/activity',query:{shopId:shopId,activityid:goods.activityid}}" v-for="(goods,j) in activitiestwo"  tag="div"  :key="goods.activityid" class="activity-link">
											<div class="activity-item">
												<div class="activity-pic">
													<img :src="goods.goodslistpicurl" alt="">
													<img v-lazy="{src: goods.coverpage ,loading: IMAGE_DEFAULT.I_300}" alt="">
												</div>
												<div class="goods-list__info">
													<p class="activity-title">{{ goods.title }}</p>
													<p class="activity-subtitle">{{ goods.subtitle  }}</p>
													<p class="activity-price" :class="{'activity-txt': qiTtr[j] == 1 }">{{ goods.slogan }}<span class="actone-font" v-if="qiTtr[j] == 1">起</span></p>
												</div>
											</div>
										</router-link>
									</div>
								</div>
							</div>
						</section>
						<section class="mod-section mod-guess-liked">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">猜你喜欢</span>
									<span class="hd-tit__small">你喜欢的我都懂</span>
								</div>
								<div @click="guessLikeChange" class="hd-change">
									<span>换一换</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--two">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in guessGoods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<img :src="goods.goodslistpicurl" alt="">
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<div class="goods-list__price">
													<p>¥{{ goods.goodsprice.toFixed(2) }}</p>
													<del v-if="goods.marketprice > goods.goodsprice">¥{{ goods.marketprice.toFixed(2) }}</del>
												</div>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
						</section>
						-->
						
						<!--第一个标签-->
						<section class="mod-section mod-new-products" v-if="personnalGoods[0]">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">{{personnalGoods[0].tagtitle}}</span>
									<span class="hd-tit__small">{{personnalGoods[0].tagattachtitle}}</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in personnalGoods[0].goods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">¥{{ goods.goodsprice.toFixed(2) }}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<router-link class="mod-section__ft mod-section__ft--bt tb1px" :to="{path:'/goods-personnal',query:{name:personnalGoods[0].tagtitle,tagid:personnalGoods[0].tagid}}" tag="div">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</router-link>
						</section>
						<!--第二个标签-->
						<section class="mod-section mod-new-products" v-if="personnalGoods[1]">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">{{personnalGoods[1].tagtitle}}</span>
									<span class="hd-tit__small">{{personnalGoods[1].tagattachtitle}}</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in personnalGoods[1].goods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">¥{{ goods.goodsprice.toFixed(2) }}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<router-link class="mod-section__ft mod-section__ft--bt tb1px" :to="{path:'/goods-personnal',query:{name:personnalGoods[1].tagtitle,tagid:personnalGoods[1].tagid}}" tag="div">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</router-link>
						</section>
						<!--第三个标签-->
						<section class="mod-section mod-new-products" v-if="personnalGoods[2]" style="margin-bottom:0;">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">{{personnalGoods[2].tagtitle}}</span>
									<span class="hd-tit__small">{{personnalGoods[2].tagattachtitle}}</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in personnalGoods[2].goods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">¥{{ goods.goodsprice.toFixed(2) }}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<router-link class="mod-section__ft mod-section__ft--bt tb1px" :to="{path:'/goods-personnal',query:{name:personnalGoods[2].tagtitle,tagid:personnalGoods[2].tagid}}" tag="div">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</router-link>
						</section>
						<!--广告-->
						<section class="ad" style="padding-top:0.2rem">
							<!-- <div class="ad__pic" @click="doAdAction">
								<img :src="ads.displaypic" alt="">
							</div> -->
							<div class="swiper-container" id="adSwiper" v-if="adList.length">
								<div class="swiper-wrapper">
									<div  class="swiper-slide" :key="item.index" v-for="item in adList" @click="doAdAction">
										<img  class="swiper-image" :src="item.displaypic" alt=""
										:data-type="item.referencetype" :data-val="item.referencevalue" :data-skuid="item.skuid">
									</div>
								</div>
								<div class="swiper-pagination"></div>
							</div>
						</section>
						<!--第四个标签-->
						<section class="mod-section mod-new-products" v-if="personnalGoods[3]">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">{{personnalGoods[3].tagtitle}}</span>
									<span class="hd-tit__small">{{personnalGoods[3].tagattachtitle}}</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in personnalGoods[3].goods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">¥{{ goods.goodsprice.toFixed(2) }}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<router-link class="mod-section__ft mod-section__ft--bt tb1px" :to="{path:'/goods-personnal',query:{name:personnalGoods[3].tagtitle,tagid:personnalGoods[3].tagid}}" tag="div">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</router-link>
						</section>
						<!--第五个标签-->
						<section class="mod-section mod-new-products" v-if="personnalGoods[4]">
							<div class="mod-section__hd">
								<div class="hd-tit tb1px">
									<span class="hd-tit__big">{{personnalGoods[4].tagtitle}}</span>
									<span class="hd-tit__small">{{personnalGoods[4].tagattachtitle}}</span>
								</div>
							</div>
							<div class="mod-section__bd">
								<div class="goods-list goods-list--three">
									<ul class="goods-list__box">
										<router-link :to="{path:'/detail',query:{shopId:shopId,skuId:goods.skuid}}" tag="li" v-for="goods in personnalGoods[4].goods" :key="goods.skuid" class="goods-list__item">
											<div class="goods-list__pic">
												<!-- <img :src="goods.goodslistpicurl" alt=""> -->
												<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
												}" alt="">
											</div>
											<div class="goods-list__info">
												<p class="goods-list__title">{{ goods.goodsname }}</p>
												<p class="goods-list__price">¥{{ goods.goodsprice.toFixed(2) }}</p>
											</div>
										</router-link>
									</ul>
								</div>
							</div>
							<router-link class="mod-section__ft mod-section__ft--bt tb1px" :to="{path:'/goods-personnal',query:{name:personnalGoods[4].tagtitle,tagid:personnalGoods[4].tagid}}" tag="div">
								<div class="ft-more ">
									<span>更多</span>
									<i class="ft-more__arrow"></i>
								</div>
							</router-link>
						</section>
					</main>
				</div>
			</div>
			<div v-show="curCata.type == 4" class="shop-brand-wrap" v-loadmore="loadMoreBrand" is-enable-scroll="isBrandLoading">
				<section class="banner">
					<div class="swiper-container" id="brandBanner" v-if="brandBanner.length">
						<div class="swiper-wrapper" @click="bannerNav(2)">
							<div  class="swiper-slide" v-for="item in brandBanner">
								<img  class="swiper-image" :src="item.bannerpic" alt="">
							</div>
						</div>
						<div class="swiper-pagination swiper-pagination-brand"></div>
					</div>
				</section>
				<div class="brand-list">
					<ul class="brand-list__box">
						<router-link :to="{path:'/brand-goods',query:{shopId:shopId,brandId:brand.brandid, brandName: brand.brandname}}" tag="li" v-for="brand in brandArr" :key="brand.brandid" class="brand-list__item">
							<div class="brand-list__pic">
								<!-- <img :src="brand.listpagepic" alt=""> -->
								<img v-lazy="{src: brand.listpagepic, loading: IMAGE_DEFAULT.I_750_300
								}" alt="">
							</div>
							<p class="brand-list__info">
								<span class="bli-name">{{ brand.brandname }}</span>
								<span class="bli-num">商品数：{{ brand.spunum }}</span>
							</p>
						</router-link>
					</ul>
				</div>
				<div class="loading-container" v-if="isBrandShowMore" >
					<template v-if="!isBrandLoadOver">
						<span class="loading-icon"></span>
						<span class="loading-txt">加载中...</span>
					</template>
					<template v-else>
						<span class="loading-txt">没有更多品牌了</span>
					</template>
				</div>
			</div>
			<div v-show="curCata.type < 3" class="shop-other-wrap" v-loadmore="loadMoreGoods" is-enable-scroll="isGoodsLoading">
				<section class="banner">
					<div class="swiper-container" id="goodsBanner" v-if="goodsBanner.length">
						<div class="swiper-wrapper" @click="bannerNav(3)">
							<div  class="swiper-slide" v-for="item in goodsBanner">
								<img  class="swiper-image" :src="item.bannerpic" alt="">
							</div>
						</div>
						<div class="swiper-pagination swiper-pagination-goods"></div>
					</div>
				</section>
				<div v-if="isShowEmpty" class="empty-icon empty-icon-goods">
					<span>该分类下没有商品</span>
				</div>
				<div v-else class="goods-list">
					<cGoodsList :goodsArr="goodsList" type="1"></cGoodsList>
				</div>
				<div class="loading-container" v-if="isGoodsShowMore">
					<template v-if="!isGoodsLoadOver">
						<span class="loading-icon"></span>
						<span class="loading-txt">加载中...</span>
					</template>
					<template v-else>
						<span class="loading-txt">没有更多商品了</span>
					</template>
				</div>
			</div>
			<div v-show="curCata.type == 5">
				<div v-if="isShowEmpty" class="empty-icon empty-icon-goods">
					<span>该分类下没有商品</span>
				</div>
				<div v-else>
					<section class="banner">
						<div class="swiper-container" id="flashgoodsBanner" v-if="flashgoodsBanner.length">
							<div class="swiper-wrapper" @click="flashBannerLink()">
								<div  class="swiper-slide" v-for="item in flashgoodsBanner">
									<img  class="swiper-image" :src="item.bannerpic" alt="">
								</div>
							</div>
							<div class="swiper-pagination swiper-pagination-goods"></div>
						</div>
					</section>
					<flashSale ref="FlashBanner"></flashSale>
				</div>
			</div>
		</div>
		<!-- </template> -->
		<div v-show="isShowToTopBtn" class="to-top-btn" @click="backToTop"></div>
		<myFooter></myFooter>
		
	</div>
</template>

<script>
	import flashSale from '@/components/flashSale';
	import countTimeOne from '@/components/flashCountDownTimerone';
	import { mapState } from 'vuex';
	import { Goods, Shop, Bullet } from '@/apis/';
	import { throttle, isWXBrowser } from '@/utils/common';
	import Swiper from 'swiper/dist/js/swiper.min';
	import IScroll from 'iscroll/build/iscroll-lite';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import myFooter from '@/components/footer/footer';
	import cGoodsList from '@/components/goodsList';
	import loadmore from '@/components/common/loadmore';
	import iosWxShareFix from '@/plugins/iosWxShareFix';
	import BulletView from '@/components/bullet';
	import '@/assets/styles/swiper.css';
	import '@/assets/styles/empty.css';
	export default {
		data(){
			return {
				flashgoodsSwiper:null,
				timerStatusone:null,
				secondsone:0,         //限时抢购倒计时
				flashGoods: [],          //限时抢购商品
				qiStr:[],
				qiTtr:[],
				aclassOne:'',          //专题一活动class
				aclassTwo:'',		   //专题一活动class
				pageLoaded: !1,
				isWXEnv: !1,
				swiperOpts: {
					loop: true,
					pagination: {
						el: '.swiper-pagination'
					},
					autoplay: {
						delay: 5000,
						disableOnInteraction: !0
					}
				},
				lastScrollTop: 0,

				shopInfo: {
					storename: '',
					logopic: '',
					signpic: ''
				},

				cataArr: [],
				curCataIdx: 0,
				curBanner: [],
				goodsBanner: [],
				flashgoodsBanner: [],
				brandBanner: [],
				indexBanner: [],
				curCata: {},
				mySwiper: null,
				brandSwiper: null,
				goodsSwiper: null,
				adSwiper: null,

				shopHandPicked: [],
				brandHandPicked: [],
				hotGoods: [],
				newGoods: [],
				personnalGoods:[],
				activitiesone:[],
				activitiestwo:[],
				rankInfo: [],
				guessGoods: [],
				ads: {
					advertname: "",
					displaypic: "",
					referencetype: 1,
					referencevalue: '',
				},
				adList: [],
				isGuessing: !1,

				brandArr: [],
				brandPagation: {
					perPage: 10,
					page: 1
				},
				isBrandShowMore: !1,
				isBrandLoading: !1,
				isBrandLoadOver: !1,

				goodsList: [],
				goodsPagation: {
					perPage: 10,
					page: 1
				},
				isGoodsShowMore: !1,
				isGoodsLoading: !1,
				isGoodsLoadOver: !1,
				isShowEmpty: !1,

				isScrollInitialized: !1,
				isShowToTopBtn: !1,
				TOP_BTN_THRESHOLD: 400,

				bullets: null,
				bulletPaused: !1
			}
		},

		methods:{
			//刷新页面
			refreshPage(){
                this.$router.go(0);
			},
			//个性化商品
			initPersonnalGood(){
				const ERR = this.$ERR;
				Indicator.show('加载中...');
				Goods.getGoodsPersonnal().then((res) => {
					if (res.code !== ERR.NORMAL) {
						Indicator.close();
						//Toast(`获取商品失败，请刷新页面重试！[${res.code}]`);
						return;
					}

					Indicator.close();
					this.personnalGoods = res.data.tagsandgoods;

				}).catch((err) => {
					console.log(err);
				});
			},
			//限时抢购商品
			initFlashGood(){
				const ERR = this.$ERR;
				Indicator.show('加载中...');
				Goods.getFlashGoods(0).then((res) => {
					if (res.code !== ERR.NORMAL) {
						Indicator.close();
						Toast(`获取商品失败，请刷新页面重试！[${res.code}]`);
						return;
					}

					Indicator.close();
					this.flashGoods = res.data.goods;
					this.secondsone = res.data.interval;
					
					let sta =  res.data.status;
                    if(sta == 1){
                        this.timerStatusone = "距开始"
                    }else if(sta == 2){
                        this.timerStatusone = "距结束"
                    }else if(sta == 0){
                        this.timerStatusone = "已结束"
                    }
				}).catch((err) => {
					console.log('获取商品分类异常：' + err);
				});
			},
			activeMenu(idx, catalogID, evt) {
				if (this.curCataIdx === idx) {
					return;
				}
				if(this.bullets && this.bullets.msglist.length > 0) {
					this.bulletPaused = idx > 0;
				}
				this.curCataIdx = idx;
				this.curCata = this.cataArr[idx];
				this.adjustMenuPos(evt);
				this.initSwiper();
				this.loadCataData();
			},
			adjustMenuPos(evt){
				let selfElem = evt.target,
					menuWrap = selfElem.parentNode.parentNode;

				let moreBtnWidth = document.querySelector('.mod-nav__more').clientWidth;

				let menuWrapWidth = menuWrap.clientWidth,
					menuWidth = selfElem.parentNode.clientWidth,
					halfMenuWidth = Math.ceil(menuWrapWidth / 2),
					selfWidth = selfElem.clientWidth,
					selfOffsetLeft = selfElem.offsetLeft,
					maxOffsetLeft = menuWidth - menuWrapWidth;

				if (menuWidth <= menuWrapWidth) {
					return;
				}

				if (selfOffsetLeft <= halfMenuWidth) {
					this.myIScroll.scrollTo(0, 0);
					return;
				}

				if (selfOffsetLeft >= (maxOffsetLeft + halfMenuWidth - 10)) {
					this.myIScroll.scrollTo(-maxOffsetLeft, 0);
				} else {

					this.myIScroll.scrollTo(-(selfOffsetLeft - halfMenuWidth - 20 + selfWidth/2), 0, 300);
				}
			},
			setScrollWrapWidth(){
				let menuList = document.querySelector('.mod-nav__list'),
					menuItems = menuList.querySelectorAll('.mod-nav__item');

				let totalWidth = 0;
				const getStyle = window.getComputedStyle;

				([]).slice.call(menuItems).forEach((item) => {
					let width = parseFloat(getStyle(item, !1).width);
					let marginLeft = parseFloat(getStyle(item, !1).marginLeft);
					totalWidth += Math.ceil(width + marginLeft);
				});

				menuList.style.width = totalWidth + 'px';
				this.menuWidth = totalWidth;
			},
			backToTop(){
				const t = this.curCata.type;
				const clsName = t == 3 ? '.shop-page' : t == 4 ? '.shop-brand-wrap' : '.shop-other-wrap';
				
				let doc = document.querySelector(clsName),
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
			initIScroll(){
				const iScrollOpts = {
					eventPassthrough: !0,
					disablePointer: !0,
					scrollX: !0,
					scrollY: !1,
					bindToWrapper: !0
				};

				this.$nextTick(() => {
					this.setScrollWrapWidth();
					this.myIScroll = new IScroll('#nav', iScrollOpts);
				});
			},
			initSwiper(){
				const t = this.curCata.type;
				this.curBanner = this.curCata.banner;

				if ((t == 3 || t == 4) && this.curBanner.length === 0) {
					return;
				}

				if(t == 3){
					if(this.mySwiper){
						this.mySwiper.update();
					}else{
						this.indexBanner = this.curBanner;
						this.$nextTick(() => {
							this.mySwiper = new Swiper('#bannerSwiper', this.swiperOpts);
						});
					}
					return;
				}

				if(t == 4){
					if(this.brandSwiper){
						this.brandSwiper.update();
					}else{
						this.brandBanner = this.curBanner;
						this.$nextTick(() => {
							this.brandSwiper = new Swiper('#brandBanner', Object.assign({}, this.swiperOpts, {
								pagination: {
									el: '.swiper-pagination-brand'
								}
							}));
						});
					}
					return;
				}

				this.goodsBanner = this.curBanner;

				if (this.goodsSwiper instanceof Swiper) {
					this.goodsSwiper.destroy();
					this.goodsSwiper = null;
				}

				if (!this.goodsBanner.length) {
					return;
				}
				
				this.$nextTick(() => {
					this.goodsSwiper = new Swiper('#goodsBanner', Object.assign({}, this.swiperOpts, {
						pagination: {
							el: '.swiper-pagination-goods'
						},
						loop: !1
					}));
				});

				//限时抢购商品数量
				let flashgoodsLength = this.$refs.FlashBanner.flashGoods.length;
				if(flashgoodsLength == 0){
					this.isShowEmpty = !0;
				}

				//限时抢购swiper
				this.flashgoodsBanner = this.$refs.FlashBanner.bannerData;
				
				this.$nextTick(() => {
					this.flashgoodsSwiper = new Swiper('#flashgoodsBanner', this.swiperOpts);
				});
			},
			flashBannerLink(){
				const flashIndex = this.flashgoodsSwiper.realIndex;
				const bannerData = this.$refs.FlashBanner.bannerData
				const t = bannerData[flashIndex].type;
				const page = bannerData[flashIndex].bannerlink;
				const skuId = bannerData[flashIndex].skuid;

				if (t == 1) {
					if(page.indexOf('http') == 0){
						location.assign(page);
					}
				} else if (t == 2) {
					this.redirect('/detail',{
						skuId: skuId,
						spuId: page
					});
				}
               
			},
			
			initAdSwiper() {
				this.$nextTick(() => {
					setTimeout(()=>{
						this.adSwiper = new Swiper('#adSwiper', this.swiperOpts);
					},1000);
				})
			},
			initToTopBtnState(){
				const indexScrollCntnr = document.querySelector('.shop-page');
				const brandScrollCntnr = document.querySelector('.shop-brand-wrap');
				const otherScrollCntnr = document.querySelector('.shop-other-wrap');
				let cntnr = null;

				const t = this.curCata.type;

				if (t == 4) {
					cntnr = brandScrollCntnr;
				} else if (t == 3) {
					cntnr = indexScrollCntnr;
				} else if (t <= 2) {
					otherScrollCntnr.scrollTop = 0;
					cntnr = otherScrollCntnr;
				}

				if (cntnr && cntnr.scrollTop >= this.TOP_BTN_THRESHOLD) {
					this.isShowToTopBtn = !0;
				} else {
					this.isShowToTopBtn = !1;
				}
			},
			loadCataData(){
				const t = this.curCata.type - 1; //1 分类 2 品牌 3 推荐(首页固定栏目) 4 品牌(首页固定栏目)
				const funcArr = ['loadGoodsByCata', 'loadGoodsByBrand', 'loadIndexData', 'loadBrandData'];

				setTimeout(() => {
					this.initToTopBtnState();
				}, 100);

				if (t == 2) {
					return;
				}

				const func = this[funcArr[t]];

				if (typeof func !== 'function') {
					return;
				}

				func();
			},
			fetchGoodsList(){
				const goodsPagation = this.goodsPagation;
				const pageindex = goodsPagation.page;
				const pagesize = goodsPagation.perPage;
				const sortid = this.curCata.refvalue;
				const cateid = this.curCata.cateid;
				const cityid = 0;
  				const proinceid = 0;

				const type = this.curCata.type;
				const method = Goods[['getListByCatalogId', 'getListByCatalogId'][type - 1]];

				const params = {
					pageindex,
					pagesize,
					cateid,
					cityid,
					proinceid
				};
				// if (type === 1) {
				// 	params.cateid = cateid;
				// 	params.sortid = sortid;
				// } else if (type === 2) {
				// 	params.brandid = sortid;
				// }

				if (typeof method !== 'function') {
					console.log('分类type值异常');
					return;
				}

				return method(params);
			},
			loadMoreGoods(){
				if (this.isGoodsLoadOver) {
					return;
				}

				this.goodsPagation.page++;
				this.isGoodsLoading = !0;

				this.fetchGoodsList().then(res => {
					this.isGoodsLoading = !1;
					if (res.code !== this.$ERR.NORMAL) {
						return;
					}

					if (res.data.length < this.goodsPagation.perPage) {
						this.isGoodsLoadOver = !0;
					}

					this.goodsList = this.goodsList.concat(res.data);
				}).catch(err => {
					this.isGoodsLoading = !1;
					console.log(`首页品牌加载更多异常[${err}]`);
				});
			},
			loadGoodsByCata(){
				Indicator.show('加载中...');
				this.isGoodsShowMore = !1;
				this.goodsPagation.page = 1;

				this.fetchGoodsList().then(res => {
					Indicator.close();

					if (res.code !== this.$ERR.NORMAL) {
						console.log(`首页分类数据加载失败[${res.code}]`);
						return;
					}

					this.dealGoodsResult(res);
				}).catch(err => {
					Indicator.close();
					console.log(`首页分类数据加载异常[${err}]`);
				});
			},
			dealGoodsResult(res){
				const data = res.data;

				if (!data || data.length <= 0) {
					this.isShowEmpty = !0;
					this.isGoodsShowMore = !1;
					this.goodsList.splice(0);
					return;
				}

				this.isShowEmpty = !1;
				this.isGoodsShowMore = !0;

				if (data.length < this.goodsPagation.perPage) {
					this.isGoodsLoadOver = !0;
				} else {
					this.isGoodsLoadOver = !1;
				}

				this.goodsList = res.data;
			},
			loadGoodsByBrand(){
				this.loadGoodsByCata();
			},
			getRandName(coverId){
				const rank = {
					'3': '品牌热销榜',
					'13': '热销榜',
					'14': '本月爆款'
				};
				return rank[coverId];
			},
			fetchBrandData(){
				const brandPagation = this.brandPagation;
				const page = brandPagation.page;
				const perPage = brandPagation.perPage;

				return Goods.getBrandList(page, perPage);
			},
			loadMoreBrand(){
				if(this.isBrandLoadOver){
					return;
				}

				this.brandPagation.page++;
				this.isBrandLoading = !0;
				
				this.fetchBrandData().then(res => {
					this.isBrandLoading = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}

					if(res.data.length<this.brandPagation.perPage){
						this.isBrandLoadOver = !0;
					}
					
					this.brandArr = this.brandArr.concat(res.data);
				}).catch(err => {
					this.isBrandLoading = !1;
					console.log(`首页品牌加载更多异常[${err}]`);
				});
			},
			loadBrandData(){
				if (this.brandArr.length > 0) {
					return;
				}

				Indicator.show('加载中...');				
				this.brandPagation.page = 1;
				
				this.fetchBrandData().then(res => {
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						console.log(`首页品牌分类数据加载失败[${res.code}]`);
						return;
					}

					const data = res.data;
					this.isBrandShowMore = !0;

					if (data.length < this.brandPagation.perPage) {
						this.isBrandLoadOver = !0;
					} else {
						this.isBrandLoadOver = !1;
						this.isBrandShowMore = !0;
					}

					this.brandArr = res.data;
				}).catch(err => {
					Indicator.close();
					console.log(`首页品牌分类数据加载异常[${err}]`);
				});
			},
			initScrollEvt(){
				if(this.isScrollInitialized){
					return;
				}

				this.isScrollInitialized = !0;

				const indexScrollCntnr = document.querySelector('.shop-page');
				const brandScrollCntnr = document.querySelector('.shop-brand-wrap');
				const otherScrollCntnr = document.querySelector('.shop-other-wrap');

				const cntnrArr = [indexScrollCntnr, brandScrollCntnr, otherScrollCntnr];
				cntnrArr.forEach((cntnr, idx, arr) => {
					cntnr.addEventListener('scroll', () => {
						if (cntnr.scrollTop >= this.TOP_BTN_THRESHOLD) {
							this.isShowToTopBtn = !0;
						} else {
							this.isShowToTopBtn = !1;
						}
					}, !1);
				});
			},
			initIndexData(res){
				const indexData = res[1].data;
				this.shopHandPicked = res[0].data;
				this.brandHandPicked = indexData.bigbrands.slice(0,2);
				this.hotGoods = indexData.hotgoods;
				this.newGoods = indexData.newgoods;
				this.activitiesone = indexData.activitiesone;
				this.activitiestwo = indexData.activitiestwo;
				this.guessGoods = indexData.guessyoulike;
				this.ads = indexData.advertinfo;
				this.adList = indexData.advertinfolist;
				this.rankInfo = indexData.rankinfo;
				this.initAdSwiper();
				this.$nextTick(() => {
					this.initScrollEvt();
				});

				//判断第一个活动是否有起字
				for(let i=0;i<this.activitiesone.length;i++){
					this.qiStr[i] = 0;
					let activitiesoneStr = this.activitiesone[i].slogan.trim();
					var qiCon = activitiesoneStr.charAt(activitiesoneStr.length - 1);
				
					if(qiCon == '起'){
						this.activitiesone[i].slogan = this.activitiesone[i].slogan.substring(0,this.activitiesone[i].slogan.length-1);
						this.qiStr[i] = 1;
					}
				};

				//判断第二个活动是否有起字
				for(let j=0;j<this.activitiestwo.length;j++){
					this.qiTtr[j] = 0;
					let activitiestwoStr = this.activitiestwo[j].slogan.trim();
					var qiCon = activitiestwoStr.charAt(activitiestwoStr.length - 1);
				
					if(qiCon == '起'){
						this.activitiestwo[j].slogan = this.activitiestwo[j].slogan.substring(0,this.activitiestwo[j].slogan.length-1);
						this.qiTtr[j] = 1;
					}
				};

				//判断活动一个数
				if(this.activitiesone.length == 1){
					this.aclassOne = "goods-list--one"
				}else if(this.activitiesone.length == 2){
					this.aclassOne = "goods-list--two"
				}else{
					this.aclassOne = "goods-list--three"
				}

				//判断活动二个数
				if(this.activitiestwo.length == 1){
					this.aclassTwo = "goods-list--one"
				}else if(this.activitiestwo.length == 2){
					this.aclassTwo = "goods-list--two"
				}else{
					this.aclassTwo = "goods-list--three"
				}
			},
			loadBulletData(){
				Bullet.index().then(res => {
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					this.bullets = res.data;
				}).catch(err => {
					console.log(err);
				});
			},
			
			loadIndexData(){
				const NORMAL = this.$ERR.NORMAL;
				
				Promise.all([Goods.getShopHandpicked(0),Goods.getIndexMod()]).then(res=>{
					const isTrue = res[0].code == NORMAL && res[1].code == NORMAL;
					if(!isTrue){
						Toast('首页数据获取失败，请刷新重试');
						return;
					}
					this.pageLoaded = !0;
					this.initIScroll();
					this.initSwiper();
					this.initIndexData(res);
					this.loadBulletData();
				}).catch(err=>{
					console.log('获取推荐页面数据异常')
				});
			},
			guessLikeChange(){
				if(this.isGuessing){
					return;
				}
				
				this.isGuessing = !0;
				Goods.getGuessLike().then(res => {
					this.isGuessing = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					this.guessGoods = res.data;
				}).catch(err => {
					this.isGuessing = !1;
				});
			},
			doAdAction(e){
				const type = e.target.getAttribute('data-type'); // 1 商品 2 链接
				const value = e.target.getAttribute('data-val');
				const skuid = e.target.getAttribute('data-skuid');

				if (type == 1) {
					this.redirect('/detail', {
						skuId: skuid
					});
				} else if (type == 2) {
					location.href = value;
				}
			},
			toBrandGoodsPage(brand) {
				this.redirect('/brand-goods', {
					brandId: brand.brandid,
					brandName: brand.brandname
				});
			},
			doRankNav(coverId){
				//coverId 13 热销榜 14 本月爆款 3 品牌热销榜 
				
				const pages = {
					'3': '/brand-hot',
					'14': '/month-top',
					'13': '/goods-top'
				};
				
				const toPage = pages[coverId];

				toPage && this.redirect(toPage);
			},
			bannerNav(type = 1) {
				let swiper = type === 1 ? this.mySwiper : type === 2 ? this.brandSwiper : this.goodsSwiper;
				const realIndex = swiper.realIndex;
				const banner = this.curBanner[realIndex];
				const t = banner.type;
				const page = t == 2 ? banner.skuid : banner.bannerlink;
				if (t == 1) {
					if (page.indexOf('http') == 0) {
						location.assign(page);
					}
				} else if (t == 2) {
					this.redirect('/detail', {
						skuId: page
					});
				}
			},
			initCataData() {
				const ERR = this.$ERR;
				Indicator.show('加载中...');
				Goods.getCatalogue().then((res) => {
					if (res.code !== ERR.NORMAL) {
						Indicator.close();
						Toast(`获取商品分类失败，请刷新页面重试！[${res.code}]`);
						return;
					}

					Indicator.close();
					// this.pageLoaded = !0;
					this.cataArr = res.data;
					this.curCata = this.cataArr[0];
					// this.initIScroll();
					// this.initSwiper();
					this.loadIndexData();
				}).catch((err) => {
					console.log('获取商品分类异常：' + err);
				});
			},
			initShopInfo() {
				Shop.getShop().then(res => {
					if (res.code !== this.$ERR.NORMAL) {
						return;
					}

					document.title = res.data.storename || '满金店';
					Object.assign(this.shopInfo, res.data);
					this.weiXinShare(this.shopInfo);
				}).catch(err => {
					console.log('获取店铺信息异常');
				});
			},
			weiXinShare(shop) {
				const href = location.href;
				const tit = shop.storename;
				const img = 'https://skin.manjd.net/app/logo121.png';
				const desc = '这里有个好店值得一看';
				this.wxShare(tit, href, img, desc);
			},
			init(){
				this.initShopInfo();
				this.initCataData();
				this.initFlashGood();
				this.initPersonnalGood();
			}
		},

		computed:{
			...mapState(['shopId']),
		},

		mixins:[iosWxShareFix],

		components:{
			myFooter,
			cGoodsList,
			countTimeOne,
			flashSale,
			'bullet-view': BulletView
		},

		directives:{
			loadmore
		},

		activated(){
			const page = this.curCata.type == 3 ? this.$refs.shopRecommend : this.$refs.shopPage;
			page && (page.scrollTop = this.lastScrollTop);
			if (this.shopInfo.storename) {
				document.title = this.shopInfo.storename;
				this.weiXinShare(this.shopInfo);
			}
		},
		
		deactivated(){
			const page = this.curCata.type == 3 ? this.$refs.shopRecommend : this.$refs.shopPage;
			page && (this.lastScrollTop = page.scrollTop);
		},

		mounted(){
			this.isWXEnv = isWXBrowser;

			//倒计时刷新
			if (typeof document.hidden !== "undefined") { 
				this.hidden = "hidden";
				this.visibilityChange = "visibilitychange";
			} else if (typeof document.webkitHidden !== "undefined") {
				this.hidden = "webkitHidden";
				this.visibilityChange = "webkitvisibilitychange";
			}

			document.addEventListener(this.visibilityChange, this.refreshPage, false);
		},
		beforeDestroy(){
			document.removeEventListener(this.visibilityChange, this.refreshPage, false);
		},
		created(){
			this.init();
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
			background-color: #ff681d;
		}
	}

	.swiper-pagination-bullets{
		bottom: 7px !important;
	}
</style>
<style scoped>
	@import '../../assets/styles/mixins.css';
	.main{
		display:flex;
		flex-direction:column;
	}
	.flash-goods-list__pic{
		position:relative;
	}
	.goods-list__flashsaleover{
		position: absolute;
		width:2.1rem;
		height:0.5rem;
		line-height:0.5rem;
		background-color:rgba(0,0,0,0.4);
		left: 0;
		bottom:0;
		text-align:center;
		font-size:0.26rem;
		font-family:PingFangSC-Regular;
		color:rgba(255,255,255,1);
	}
	.hd-timer{
		float:right;
	}
	.hd-timer-tit{
		font-size:0.24rem;
		color:#333;
		margin-right:0.12rem;
	}
	.actone-font{
		font-size:0.24rem;
	}
	.activity-title{
		display: -webkit-box;
		-webkit-line-clamp:2;
		-webkit-box-orient: vertical;
		line-height: 0.36rem;
		margin-top: 0.2rem;
		word-wrap: break-word;
		text-overflow: ellipsis;
		overflow : hidden;
		color:#333;
		font-size:0.26rem;
	}
	.activity-subtitle{
		font-size:0.22rem;
		color:#999;
		margin-top: 0.04rem;
		margin-bottom: 0.2rem;
	}
	.activity-price{
		font-size:0.24rem;
		color:#333;	
		margin-bottom: 0.28rem;
	}
	.activity-txt{
		font-size:0.26rem;
	}
	.goods-list--three .activity-item{
		width: 2.8rem;
		margin-right:0.28rem;
		.activity-pic{
			height: 2.1rem;
		}
	}
	.goods-list--two .activity-item{
		width: 4.48rem;
		margin-right:0.28rem;
		.activity-pic{
			height: 2.1rem;
		}
	}
	.goods-list--one .activity-link{
		width:6.86rem;
	}
	.goods-list--one .activity-item{
		width: 100%;
		.activity-pic{
			height: 2.1rem;
		}
		.goods-list__info{
			position:relative;
			.activity-price{
				position:absolute;
				right:0;
				top:0;
			}
		}
		
	}
	.activity-list{
		
	}
	.activity-list .activity-pic{
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		overflow: hidden;
		img{
			display: block;
			max-width: 100%;
			max-height: 100%;
			border-radius:0.06rem;
		}
	}
	.activity-box{
		display: -webkit-box;
    	overflow-x: scroll;
		padding-left:0.32rem;
 

	}
	.shop-page{
		@extend page;
		top: 1.6rem;
	}
	.wxheader+.shop-page {
		top: 1.76rem;
	}

	.swiper-container{
		width: 100%;
		height: 3.3rem;
		.swiper-image{
			display: block;
			width: 100%;
			height: auto;
		}
	}

	.empty-icon-goods{
		padding-top: 1.5rem;
	}

	.loading-container{
		padding-top: 0.2rem;
	}

/*	.skeleton{
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1000;
		background: url(../../assets/images/shop/index-bg.png) top center/contain no-repeat;
	}*/

	.header{
		position: fixed;
		top: 0;
		z-index: 1001;
		width: 100%;
		height: 1.6rem;
		background-color: #fafafa;

		border-bottom: 1px solid $color-d9;
		font-size: $fs-28;

		.mod-title,.mod-search{
			position: relative;
			height: 0.88rem;
		}

		&.wxheader {
			height: 1.76rem;
			.mod-title,.mod-search {
				height: 1.04rem;
			}
		}
		.mod-title{
			line-height: 0.88rem;
			text-align: center;
			font-size: $fs-32;
		}

		.mod-title__icon{
			position: absolute;
			right: 0;
			top: 0;
			width: 1.06rem;
			height: 100%;
			background: url(../../assets/images/shop/icon-search.png) center center/0.4rem 0.4rem no-repeat transparent;
		}

		.mod-search{
			display: flex;
			align-items: center;
			padding-left: 0.32rem;
			background-color: #fafafa;
		}

		.mod-search__form{
			position: relative;
			display: flex;
			align-items: center;
			flex:1;
			padding: 0 0.26rem 0 0.68rem;	
			border-radius: $radius-10;		
			background-color: #ededed;
			i {
				position: absolute;
				top: 0;
				left: 0;
				width: 0.68rem;
				height: 100%;
				background: url(../../assets/images/icon-small-search.png) center center/0.28rem 0.28rem no-repeat;
			}	
		}

		.mod-search__inp{			
			flex:1;				
			display: block;
			width: 100%;
			height: 0.4rem;
			padding: 0.12rem 0;
			font-size: $fs-28;
			color:$333;
			background-color: transparent;
			box-sizing: content-box;
			
			&::-webkit-input-placeholder{
				font-size: $fs-28;
				color:$color-b2;
				line-height: 0.4rem;
			}
		}

		.mod-search__btn--disabled{
			line-height: 0.64rem;
			padding: 0 0.32rem;
		}

		.mod-search__btn--disabled{
			color:#999;
		}

		.mod-nav{
			position: relative;
			height: 0.72rem;
			margin-left: 0.32rem;
			margin-right: .99rem;
			white-space: nowrap;
			/*overflow:hidden;*/
			-webkit-overflow-scrolling: touch;
		}

		.mod-nav__list{
			position: relative;
			height: 100%;
		}

		.mod-nav__item{
			display: inline-block;
			height: 0.72rem;
			line-height: 0.78rem;
			color:#4d4d4d;
			box-sizing: border-box;
			border-bottom:0.06rem solid transparent;
			
			&:not(:first-of-type){
				margin-left: 0.54rem;
			}
		}

		.mod-nav__item--active{
			color:$main-color;
			transition: border-color .3s;
			border-bottom-color:currentColor;
		}

		.mod-nav__more{
			position: absolute;
			right: -1.03rem;
			top: 0;
			width: 1.03rem;
			height: 100%;
			z-index: 3;
			overflow: hidden;
			.mod-nav__icon{
				display: block;
				width: 0.99rem;
				height: 100%;
				margin-right: 0.04rem;
				margin-top: 0.02rem;
				background: url(../../assets/images/shop/icon-cata-more-new.png) center center/cover no-repeat transparent ;
			}
		}
	}

	.shop-recommend-wrap{
		height: 100%;
		overflow-y: auto;
		.mod-section{
			background-color: #fff;
			margin-bottom: 0.2rem;
			padding: 0 0.32rem;
			.mod-section__hd{
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 1.0rem;
				font-size: 0.3rem;
			}

			.hd-tit{
				position: relative;
				padding-left: 0.2rem;
				line-height: 1;
				&:before{
					content:'';
					position: absolute;
					left: 0;
					top: 1px;
					bottom: 0;
					/*height: 12px;*/
					width: 0.06rem;
					/*height: 100%;*/
					border-radius: 4px;
					background-color: $main-color;
				}

			/*	&.tb1px:before{
					top: 2px;
					bottom: 2px;
					margin-top: -1px;
				}*/
				
				.hd-tit__small{
					margin-left: 0.2rem;
					color: #999;
					font-size: $fs-24;
				}
			}

			.hd-change{
				width: 1.36rem;
				height: 0.52rem;
				line-height: 0.52rem;
				border-radius: 0.4rem;
				font-size: 0.24rem;
				text-align: center;
				background-color: #f5f5f5;
			}

			.mod-section__ft{
				position: relative;
				height: 0.88rem;
				font-size: 0.28rem;
				margin: 0 -0.32rem;

				&.mod-section__ft--bt:before{
					content:'';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					height: 1px;
					border-top: 1px solid #e6e6e6;
					transform: scaleY(0.5);
				}
				
				.ft-more{
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100%;
					line-height: normal;

					.ft-more__arrow{
						width: 0.45rem;
						height: 0.6rem;
						/*margin-top: 1px;*/
						background: url(../../assets/images/shop/icon-arrow-new.png) center center/0.16rem 0.26rem no-repeat transparent;
					}
				}
			}

			.goods-list--three .goods-list__item{
				width: 2.1rem;
				.goods-list__pic{
					height: 2.1rem;
				}
			}

			.goods-list--two .goods-list__item{
				width: 3.28rem;
				.goods-list__pic{
					height: 3.28rem;
				}
			}

			.goods-list__box{
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;

			}

			.goods-list__item{
				display: flex;
				flex-direction: column;
				margin-bottom: 0.35rem;
				font-size: 0.26rem;
				
				.goods-list__pic{
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					background-color: #f5f5f5;
					overflow: hidden;
					img{
						display: block;
						max-width: 100%;
						max-height: 100%;
					}
				}

				.goods-list__info{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					flex: 1;
				}

				.goods-list__title{
					display: -webkit-box;
					-webkit-line-clamp:2;
					-webkit-box-orient: vertical;
					line-height: 0.36rem;
					margin-top: 0.2rem;
					margin-bottom: 0.22rem;
					word-wrap: break-word;
					text-overflow: ellipsis;
					overflow : hidden;
				}

				.goods-list__price{
					display: flex;
					align-items: center;
					color: $main-color;
					&:first-letter{
						display:inline-block;
						margin-right: 0.06rem;
					}
					del {
						margin-left: .32rem;
						color: #999;
					}
				}
				.goods-list__oldprice{
					font-size:0.22rem;
					margin-left:0.11rem;
					font-family:PingFangSC-Regular;
					color:rgba(153,153,153,1);
					text-decoration:line-through;
				}
			}

			.brand-list__ranking{
				display: flex;
				justify-content: space-between;

				.ranking-item{
					width: 2.1rem;
					height: 2.8rem;
					background-color: #f5f5f5;
					
					.ranking-item__title{
						text-align: center;
						
						.title-big{
							margin: 0.18rem 0;
							font-size: $fs-28;
						}

						.title-small{
							color: $main-color;
							font-size: $fs-24;
						}
					}
					
					.ranking-item__pic{
						width: 100%;
						height: 100%;
						/*margin: 0.48rem auto 0;*/
						overflow: hidden;

						img{
							display: block;
							width: 100%;
						}	
					}
				}
			}

			.brand-list{
				margin-bottom: 0.1rem;
			}

			.brand-list__item{
				display: flex;
				justify-content: space-between;
				height: 3.0rem;
				margin-top: 0.2rem;
				/*background-color: #f5f5f5;*/

				.brand-list__pic{
					height: 100%;
					width: 100%;
					overflow: hidden;
				}

				img{
					display: block;
					width: 100%;
					height: 100%;
				}

				.brand-list__big{
					width: 4.48rem;
					height: 100%;
					overflow: hidden;
				}

				.brand-list__small{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					
					img{
						width: 2.1rem;
						height: 1.4rem;
					}
				}
			}
		}
		.ad{
			padding: 0 0.32rem;
			background-color: #fff;
		}
		.ad__pic{
			display: flex;
			justify-content: center;
			height: 2.0rem;
			margin-top: -0.2rem;
			overflow: hidden;
			img{
				display: block;
				width: 7.5rem;
			}
		}
	}

	.shop-brand-wrap{
		height: 100%;
		background-color: #fff;
		overflow-y: auto; 
		
		.brand-list__item{

		}

		.brand-list__pic{
			width: 100%;
			height: 3.0rem;
			overflow: hidden;
			background-color: #f5f5f5;

			img{
				display: block;
				width: 100%;
			}
		}

		.brand-list__info{
			display: flex;
			justify-content: space-between;
			padding: 0.26rem 0.32rem 0.36rem;
			color: #333;
			font-size: 0.3rem;


			.bli-num{
				font-size: 0.28rem;
				color: #808080;
			}
		}
	}

	.shop-other-wrap{
		height: 100%;
		background-color: #fff;
		overflow-y: auto; 

		.goods-list__item{
			display: flex;
			padding: 0.28rem 0.32rem;
			border-bottom: 1px solid #e6e6e6;
		}

		.goods-list__pic{
			width: 2.0rem;
			height: 2.0rem;
			border: 1px solid #e6e6e6;
			border-radius: 0.04rem;
			overflow: hidden;
			background-color: #f5f5f5;

			img{
				display: block;
				width: 100%;
				height: 100%;
			}
		}

		.goods-list__info{
			flex: 1;
			font-size: 0.26rem;
			color: #333;

			margin-left: 0.25rem;
			
			.gli-tit{
				line-height: 0.36rem;
			}

			.gli-price{
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 0.4rem;
			}

			.gli-price__btn{
				width: 1.4rem;
				height: 0.54rem;
				line-height: 0.58rem;
				border: 1px solid currentColor;
				border-radius: 0.06rem;
				box-sizing: boder-box;
				color: $main-color;
				font-size: 0.24rem;
				text-align: center;
				background-fff: #fff;
			}
		}
	}

	.to-top-btn{
		position: fixed;
		right: 0.32rem;
		bottom: 2.0rem;

		width: 0.74rem;
		height: 0.74rem;

		background: url(../../assets/images/shop/icon-to-top.png) 0 0/contain no-repeat;
	}
	#adSwiper {
		height: 2rem;
		margin-top: -.2rem;
		overflow: hidden;
	}
	#adSwiper img{
		width:100%;
		height:100%;
	}
</style>