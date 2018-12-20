<template>
    <div class="flash-content" v-if="pageLoaded" id="FlashBanner">
        <section class="timer">
            <!-- <span class="timer-line"></span> -->
            <span class="timer-title">{{timerStatustwo}}</span>
            <countTime :seconds="secondstwo"></countTime>
            <!-- <span class="timer-line" style="margin-left:0.2rem"></span> -->
        </section>
        
        <flashGoodsList :goodsArr="flashGoods" :statusInfo="statusInfo"></flashGoodsList>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
	import { Goods, Shop } from '@/apis/';
    import countTime from '@/components/flashCountDownTimertwo.vue'
    import flashGoodsList from '@/components/flashGoodsList';
    import Indicator from '@/components/common/indicator';
	export default {
		data(){
			return {
				bannerData:[],
                flashGoods:[],
                secondstwo:0,
                timerStatustwo:null,
                pageLoaded: !1,
                statusInfo:0,
			}
        },
        props: {
            
        },
        methods:{
            //刷新页面
			refreshPage(){
                this.$router.go(0);
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
					this.flashGoods = res.data.goods;
                    this.secondstwo = res.data.interval;
                    this.bannerData = res.data.banner;
                    this.statusInfo = res.data.status;
                    let sta =  res.data.status;


                    if(sta == 1){
                        this.timerStatustwo = "距开始"
                    }else if(sta == 2){
                        this.timerStatustwo = "距结束"
                    }else if(sta == 0){
                        this.timerStatustwo = "已结束"
                    }
				}).catch((err) => {
					console.log('获取商品分类异常：' + err);
				});
			},
        },
        components:{countTime,flashGoodsList},
		created(){
            this.initFlashGood();
           
		},
        mounted(){
			this.initFlashGood();
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
		}
        
	}
</script>
<style scoped>
    .flash-content{
        background:#fee5de;
    }
    .timer{
        font-size:0.32rem;
        color:#fff;
        text-align:center;
        width: 6.85rem;
        height: .7rem;
        line-height: .7rem;
        margin: 0 auto;
        background-image: url(../assets/images/flashsale/timer-bg.png);
        background-repeat: no-repeat;
        background-size: 100%;
    }
    .timer-line{
        width:0.5rem;
        height:0.01rem;
        border-top:0.01rem solid #999;
        display:inline-block;
        margin-bottom:0.1rem;
    }
    .timer-title{
        margin-left:0.2rem;
        margin-left:0.16rem;
    }
</style>

