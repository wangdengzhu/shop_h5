<template>
	<div class="shop-page">
		<div class="cart-empty" v-if="goodsLength == 0">
			<div class="cart-empty-cnt">
				<p class="empty-icon">
					<i></i>
				</p>
				<p class="empty-txt">
					<span>该分类下没有商品</span>
				</p>
			</div>
		</div>	
		<div v-else>
			<section class="banner">
				<div  class="banner-single" v-for="item in bannerData" v-if="bannerData.length == 1">
					<img  class="swiper-image" :src="item.bannerpic" alt="">
				</div>
				<div class="swiper-container swiper-container-f" v-if="bannerData.length > 1">
					<div class="swiper-wrapper" @click="bannerNav">
						<div  class="swiper-slide" v-for="item in bannerData">
							<img  class="swiper-image" :src="item.bannerpic" alt="">
						</div>
					</div>
					<div class="swiper-pagination swiper-pagination-f"></div>
				</div>
			</section>
			<flashSale></flashSale>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import { Goods, Shop } from '@/apis/';
    import Swiper from 'swiper/dist/js/swiper.min';
    import Indicator from '@/components/common/indicator';
    import '@/assets/styles/swiper.css';
	import flashSale from '@/components/flashSale';
	export default {
		data(){
			return {
				goodsLength:0,
				bannerData:[],
                flashSwiper:null,
                pageLoaded: !1,
			}
		},
        methods:{ 
		
           	//轮播图
           	initSwiper(){   
				this.$nextTick(() => {  
					this.flashSwiper = new Swiper('.swiper-container-f', {
						watchOverflow: true,
						loop: true,
						autoplay: true,
						pagination: {
							el: '.swiper-pagination-f'
						}
					});
				});	
            },
           //限时抢购商品
			initFlashGood(){
				const ERR = this.$ERR;
				Indicator.show('加载中...');
				Goods.getFlashGoods(1).then((res) => {
					if (res.code !== ERR.NORMAL) {
						Indicator.close();
						Toast(`获取商品失败，请刷新页面重试！[${res.code}]`);
						return;
					}

					Indicator.close();
                   
                    this.pageLoaded = !0;

                    this.bannerData = res.data.banner;
					this.goodsLength = res.data.goods.length;

					console.log(this.goodsLength)

                    this.initSwiper()

				}).catch((err) => {
					console.log('获取商品分类异常：' + err);
				});
			},
            //banner跳转
            bannerNav(){
				const flashIndex = this.flashSwiper.realIndex;
				const bannerData = this.bannerData;
				const t = bannerData[flashIndex].type;
	
				if (t == 1) {
					const page = bannerData[flashIndex].bannerlink;
					if(page.indexOf('http')==0){
						location.assign(page);
					}
				} else if (t == 2) {
					this.redirect('/detail',{
						spuId: bannerData[flashIndex].bannerlink,
						skuId: bannerData[flashIndex].skuid
					});
				}
               
			},
		
        },
		mounted(){
			this.initFlashGood();
			
		},
	
		components:{
			flashSale
		}
	}
</script>
<style scoped>
.shop-page {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0rem;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
.banner-single{
	width:100%;
	height:3.3rem;
}
.banner-single img{
	display:block;
	width:100%;
	height:auto;
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
.cart-empty{
		padding-top: 1.54rem;	
	}
    .cart-empty-cnt{
        position: relative;
        font-size: 0.28rem;
        color:#bbb;
        text-align: center;
	}
    .empty-icon i{
        display: inline-block;
        width: 1.52rem;
        height: 1.42rem;
        background: url(../../assets/images/goods-empty.png) 0 0/ cover;
        
    }
    .empty-txt{
        margin:0.3rem 0 0.5rem;
    }
</style>