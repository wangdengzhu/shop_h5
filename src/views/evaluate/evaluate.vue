<template>
	<div class="evaluate-wrapper">		
        <div class="start-evaluate" v-if="!evaluatedSuccess">
            <div class="goods-wrap">
                <div class="goods-pic tb1px">
                    <img :src="goodsinfo.goodslistpicurl" alt="">
                </div>
                <div class="goods-info">
                    <div class="goods-top">
                        <p class="goods-name">{{goodsinfo.title}}</p>
                        <p class="goods-spec">{{goodsinfo.spec}}</p>
                    </div>
                    <div class="goods-bot">
                        <div class="left">
                            <p class="price">￥{{goodsinfo.price}}</p>
                            <p class="num">x{{goodsinfo.qty}}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="evaluate">
                <div class="score-wrap tb1px">
                    <span class="name">评分</span>
                    <div class="star-wrap" @touchstart="touchstart" @touchmove="touchmove">
                        <span v-for="(star, index) in 5" :data-idx="index" :key="star.id" :class="{'active': index < starNum}" @click="mark"></span>
                    </div>
                    <span class="level">{{level[starNum - 1]}}</span>
                </div>
                <div class="edit-region">
                    <div class="text-wrap">
                        <textarea v-model.trim="text" @input="limitTextNum" placeholder="您的评价是对我们最大的肯定~"></textarea>
                        <div class="limit-tips" :class="{'limit-over': text.length >= 500}">({{text.length}}/500)</div>
                    </div>
                    <div class="imgs-list" @click="showImgView">
                        <div class="img-wrap" v-for="(item, index) in imageUrls" :key="item.id" :class="{'isLoading' : imgIsLoading && (index == imageUrls.length-1)}">
                            <img :src="item" alt="">
                            <span class="close" v-show="(!!imageUrls[index])" @click.stop="removeImage(index)"></span>
                        </div>
                        <div class="add-img-btn" v-if="imageUrls.length < 9">
                            <img src="../../assets/images/evaluation/camera.png" alt="">
                            <p>添加图片</p>
                            <input type="file" class="file-inp" accept="image/*" @change="changeImage($event)">
                        </div>
                    </div>
                </div>
                <div class="anonymity">
                    <div>
                        <input type="checkbox" :checked="anonymity == 1 ? !0 : !1">
                        <label @click="isAnonymity"><i></i>匿名评价</label>
                    </div>
                    <p class="tips">勾选后评价将以匿名方式展现</p>
                </div>
                <div class="btn" @click="submitForm">提交</div>
                <div class="img-view-wrapper" @touchmove.prevent @click="hideImgView" v-show="showBigImg">
                    <div class="img-view-inner">
                        <div class="swiper-container">
                            <div class="swiper-wrapper">
                                <div class="swiper-slide" v-for="item in imageUrls" :key="item">
                                    <img :src="item" alt="">
                                </div>
                            </div>					
                        </div>
                    </div>		
                    <div class="swiper-pagination"></div>	
                </div>
            </div>
        </div>
        <div class="evaluate-success" v-loadmore="loadMore" is-enable-scroll="dataIsLoading" v-else>
            <div class="banner">
                <p>感谢您的评价</p>
                <router-link :to="{path : '/my-evaluation', query : { status : 1, shopId: shopId}}" class="btn" tag="div">
                    查看评价
                </router-link>
            </div>
            <div class="hd tb1px"><i></i><span>继续评价</span></div>
            <div class="wating-evaluation-content" v-if="pendingComment.length > 0">
                <router-link v-for="item in pendingComment" :key="item.id" tag="div" class="evaluation-item tb1px"
                    :to="{path : 'order-detail', query : { orderNo : item.orderno, shopId: shopId}} ">
                    <div class="goods-pic tb1px">
                        <img v-lazy="{src: item.goodslistpicurl, loading: IMAGE_DEFAULT.I_200}" alt="">
                    </div>
                    <div class="goods-info">
                        <div class="goods-top">
                            <p class="goods-name">{{item.title}}</p>
                            <p class="goods-spec">{{item.spec}}</p>
                        </div>
                        <div class="goods-bot">
                            <div class="left">
                                <p class="price">￥{{item.salesprice}}</p>
                                <p class="num">x{{item.qty}}</p>
                            </div>
                            <div class="right btn" tag="div" @click.stop="showEditPage(item)">
                                立即评价
                            </div>
                        </div>
                    </div>
                </router-link>
                <div class="waiting-evaluation-loading gray9" v-show="!pageIsLoading && !dataIsLoadend">
                    <div class="loading-container">
                        <div class="loading-icon"></div>
                        <div class="loading-text">正在加载中...</div>
                    </div>
                </div>
                <div class="waiting-evaluation-loadend gray9" v-show="dataIsLoadend">没有更多了</div>
            </div>
            <div class="waiting-eavluation-null" v-else>
                <img src="../../assets/images/evaluation/icon-no-order.png" alt="">
                <p>你暂时没有可评价的订单～</p>
                <router-link tag="div" class="btn" :to="{path : '/home', query : {shopId: shopId}} ">
                    随便逛逛
                </router-link>
            </div>
        </div>
	</div>	
</template>
<script>
	import { Evaluate } from '@/apis/';
	import { mapState } from 'vuex';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';
	import Indicator from '@/components/common/indicator';
	import Toast from '@/components/common/toast';
	import loadmore from '@/components/common/loadmore';
	import EXIF from 'exif-js';
    import { compressImg, dataURLtoBlob } from '@/utils/imageManage';
    import confirmBox from '@/components/common/confirm-box';
    
    const MAX_NUM = 10;
	const MAX_IMG_SIZE = MAX_NUM * 1024 * 1024;   //10MB
	const UPLOAD_SIZE = 0.2 * 1024 * 1024  //   200KB， 如果小于200KB，直接上传不压缩
    const VALID_TYPE = /jpeg|jpg|png|gif/;   //支持的图片格式

    const PAGE_SIZE = 10;
    const STAR_NUM = 5;
    
	export default {
		data(){
			return {
                anonymity: !1,
                goodsinfo: {},
                level: ['差', '一般', '满意', '很满意', '非常满意'],
                text: '',
                imageUrls : [],
				imagePlaceUrl : '',
                imgIsLoading : false,
                starNum: STAR_NUM,
				showBigImg : false,
                mySwiper : null,
                evaluatedSuccess: !1,
                pendingComment: [],
                paramObj : {
                    'pageIndex' : 1,
                    'pageSize' : PAGE_SIZE
				},
				dataIsLoading: false, 
				pageIsLoading : true,
                dataIsLoadend : false,
                starParams: {}
			}
		},
		computed:{
			...mapState(['shopId'])
		},
		methods:{
            limitTextNum() {
                if(this.text.length > 500) {
                    this.text = this.text.slice(0, 500);
                }
            },
            touchstart(e) {
                if(e.target.classList[0] !== 'active') {
                    console.log('不滑动')
                    return false;
                }else {
                    console.log('滑动开始')
                }
            },
            touchmove(e) {
                let endX = e.changedTouches[0].pageX;
                let endY = e.changedTouches[0].pageY;
                if(endY > this.starParams.bottomBorder || endY < this.starParams.topBorder) {
                    console.log('Y方向出边界')
                }else if(endX > this.starParams.rightBorder || endX < this.starParams.leftBorder) {
                    console.log('X方向出边界')
                }else {
                    // 判断move之后距离左边界的位置
                    let leftDistance = endX - this.starParams.leftBorder
                    // 判断所在区域即星星的个数
                    let num = Math.ceil(leftDistance / this.starParams.perWidth);
                    this.starNum = num > 1 ? num : 1;
                }
            },
            getStarWrapBorders() {
                let starWrap = document.querySelector('.star-wrap');
                this.starParams = Object.assign({}, {
                    topBorder: starWrap.offsetTop,
                    rightBorder: starWrap.offsetLeft + starWrap.offsetWidth,
                    bottomBorder: starWrap.offsetTop + starWrap.offsetHeight,
                    leftBorder: starWrap.offsetLeft,
                    perWidth: starWrap.offsetWidth / STAR_NUM
                })
            },
            init() {
                this.getGoodsInfo();
                this.changeRouter();
                this.$nextTick(() => {
                    this.getStarWrapBorders();
                });
            },
            resetData() {
                this.anonymity = !1;
                this.text = '';
                this.imageUrls = [];
                this.starNum = STAR_NUM;
            },
            showEditPage(obj) {
                this.evaluatedSuccess = !1;
                this.$router.replace({
                    query : Object.assign({
                        'shopId' : this.shopId
                    }, obj)
                });
                this.goodsinfo = {};
                this.getGoodsInfo();
                this.resetData();
                this.pendingComment = [];
            },
            changeRouter() {
                if(this.goodsinfo.status == 1) {
                    this.evaluatedSuccess = !0;
                    this.$router.replace({
                        query : {
                            'status' : this.goodsinfo.status,
                            'shopId' : this.shopId
                        }
                    });
                    this.getPendingComment(this.paramObj)
                }
            },
            mark(e) {
                this.starNum = e.currentTarget.getAttribute('data-idx') - 0 + 1;
            },
            isAnonymity() {
                this.anonymity = !this.anonymity;
            },
            getGoodsInfo() {
                Object.assign(this.goodsinfo, this.$route.query);
            },
            //上传图片
			uploadEvid(data) {
                Indicator.show('上传中...');		
				Evaluate.uploadCommentPic(data).then((res) => {
                    Indicator.close();
					if(res.code == this.$ERR.NORMAL){
						this.imgIsLoading = false;					
						this.imageUrls.pop();
						this.imageUrls.push(res.data);
					} else {
						Toast('凭证上传失败，请稍候重试[' + res.code + ']');
						this.uploadFailed(); 
					}
				}).catch((err) => {
                    Indicator.close();
					this.uploadFailed();
				})
			},
			//上传失败
			uploadFailed(){   
				this.imgIsLoading = false;
				this.imageUrls.pop();				
			},
            //选中图片 
			changeImage(e){
				let file = e.target.files[0],
					imageData = new FormData(),					
					self = this;						
				
				if(!file){
					return;
				}	
				e.target.value = '';			
				if(file.size > MAX_IMG_SIZE){
					Toast('上传图片不能大于' + MAX_NUM +'M');
					return;
				}
				if(!VALID_TYPE.test(file.type)){
					let type = file.type.split('/').pop();
					Toast('不支持上传'+ type +'格式');
					return;
				}				
				//获取图片的 Orientation
				let orientation = 0;
				EXIF.getData(file, function(){
					EXIF.getAllTags(this);
					orientation = EXIF.getTag(this, 'Orientation');
				})

				this.uploadStart();				
                if(file.size <= UPLOAD_SIZE){   //如果图片小于规定的大小，直接提交file文件流
                    imageData.append('imagefile', file);
					self.uploadEvid(imageData);
					return
				}

				let reader = new FileReader();
				let quality = 0.3;								
				reader.onload = function(e){  
					let img = new Image();					
					let result = e.target.result;  
					img.addEventListener('load', callback,  false);
					img.src = result;    
					function callback(e){      
                        let newData = compressImg(img, {orientation, quality});    //压图
                        let blob = dataURLtoBlob(newData);				  //转为Blob对象
						imageData.append('imagefile', blob, file.name);
						img = null;						
						self.uploadEvid(imageData);								
					}
                }
				reader.readAsDataURL(file);			
            },
            //上传开始
			uploadStart(){
				this.imgIsLoading = true;
				this.imageUrls.push(this.imagePlaceUrl);
			},
			//上传结束，不论成功还是失败		
			uploadEnd(){   
				this.imgIsLoading = false;
				this.imageUrls.pop();				
			},
			//删除图片
			removeImage(index){
				this.imageUrls.splice(index, 1);
            },
            showImgView(e){
				let target = e.target,
                    tagName = target.tagName.toLowerCase();
                if(tagName !== 'img') {
                    return false;
                }
				if(!this.imageUrls.length){
					return;
                }
                let index = Array.from(e.currentTarget.querySelectorAll(tagName)).indexOf(target);
				if(index === -1){
					return;
				}				
				if(this.mySwiper && this.mySwiper.slides.length === this.imageUrls.length){
                    this.mySwiper.slideTo(index);
				} else {
                    this.$nextTick(() => {
                        this.initSwiper(index);
                    })
				}	
				this.showBigImg = true;			
			},
			hideImgView(e){
				this.showBigImg = false;
			},
			initSwiper(index){
				if(this.mySwiper instanceof Swiper){
					this.mySwiper.destroy();
					this.mySwiper = null;
				}
				this.mySwiper = new Swiper('.swiper-container', {
					width: window.innerWidth,
					initialSlide : index,
					pagination : {
						el: '.swiper-pagination',
						type: 'fraction'
					}
				});
			},
            // 获取图片名称
            getImgList() {
                const picturename = this.imageUrls.map(ele => {
                    return ele.slice(ele.lastIndexOf('/')+1);
                });
                return picturename.join(',');
            },
            // 提交
            submitForm() {
                let images = this.getImgList();
                let data = {
                    anonymity: this.anonymity ? 1 : 0,
                    orderlineid: this.goodsinfo.orderlineid,
                    stars: this.starNum,
                    text: this.text,
                    picturename: images
                }
                Indicator.show('正在提交...');
                Evaluate.commitComment(data).then((res) => {
					if(res.code == this.$ERR.NORMAL){
						console.log('提交成功', res);
                        Indicator.close();
                        this.evaluatedSuccess = !0;
                        this.goodsinfo.status = 1;
                        this.changeRouter();
					} else {
						Toast(res.message + resCode);
                        Indicator.close();
					}
				}).catch((err) => {
					console.log(err);
					Indicator.close();
				})
            },
            getPendingComment(paramObj) {
				this.pageIsLoading && Indicator.show('加载中...');
                Evaluate.getPendingComment(paramObj).then(res => {
                    console.log('未评价商品列表', res);
                    this.pageIsLoading && Indicator.close();
                    this.pageIsLoading = false;
                    if(res.code === this.$ERR.NORMAL) {
                        this.pendingComment = this.pendingComment.concat(res.data);
                        if(res.data.length > 0) {
                            if(this.pendingComment.length >= res.data[0].totalrows) {
                                this.dataIsLoading = true;
                                this.dataIsLoadend = true;
                            }else {
                                this.dataIsLoading = false;	
                            }
                        }
                    }else {
                        Toast(res.message);
                    }
                }).catch(err=>{
					console.log('获取未评价商品列表.', err);
					this.pageIsLoading && Indicator.close();
				});
            },
            //加载更多
			loadMore() {
				this.dataIsLoading = true;				
				this.paramObj.pageIndex++;				
				this.getPendingComment(this.paramObj);
            }
        },
        directives:{
			loadmore
		},
        beforeMount() {
            this.init();
        },
        beforeRouteLeave (to, from, next) {
            if(this.goodsinfo.status == 0) {
                confirmBox.open({
                    'message': `<p>确认退出评价吗？编辑内容不保存～</p>`,
                    'cancelBtnTxt': `退出`,
                    'cnfrmBtnTxt': `继续评价`
                }).then(
                    (resolve) => {
                        next(false);
                    }, 
                    reject => {
                        next()
                    }
                )
            }else {
                next();
            }
        }
	}	
</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';

    .evaluate-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
    .edit-region {
        width: 100%;
        padding: .24rem .32rem;
        box-sizing: border-box;
        border-bottom: 1px solid #e5e5e5;
        textarea {
            width: 100%;
            height: 1.53rem;
            display: block;
            box-sizing: border-box;
            font-size: .26rem;
            color: #666;
        }
        .limit-tips {
            display: flex;
            justify-content: flex-end;
            font-size: .24rem;
            color: #999;
            line-height: .33rem;
            &.limit-over {
                color: #ff681d;
            }
        }
        .imgs-list {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            margin-top: .28rem;
            margin-left: -.22rem;
            margin-right: -.22rem;
            .img-wrap {
                position: relative;
                margin: 0 .22rem .2rem;
                width: 1.38rem;
                height: 1.38rem;
                &.isLoading {
                    background-image: url(../../assets/images/loading/200.gif);
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: contain;						
                }
                img {
                    position: absolute;
                    max-width: 100%;
                    max-height: 100%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                }
            }
            .close {
                position: absolute;
                top: -.16rem;
                right: -.16rem;
                display: block;
                width: .32rem;
                height: .32rem;
                background-image: url(../../assets/images/evaluation/close.png);
                background-size: 100%;
                background-repeat: no-repeat;
            }
            .add-img-btn {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin: 0 0 .2rem .22rem;
                img {
                    width: .4rem;
                    height: .4rem;
                    margin-bottom: .11rem;
                }
                p {
                    font-size: .22rem;
                    color: #999;
                }
                .file-inp{
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    opacity: 0;
                }	
            }
        }
        .add-img-btn {
            width: 1.38rem;
            height: 1.38rem;
            border: 1px dashed #ccc;
            box-sizing: border-box;
        }
    }
    .anonymity {
        position: relative;
        display: flex;
        align-items: flex-end;
        padding-left: .32rem;
        margin-top: .24rem;
        .tips {
            margin-left: .2rem;
            font-size: .22rem;
            color: #999;
            line-height: .28rem;
        }
        input {
            display: none;
            &:checked + label i {
                background-image: url(../../assets/images/evaluation/selected.png);
            }
        }
        label {
            display: flex;
            i {
                width: 16px;
                height: 16px;
                margin-right: .15rem;
                background-image: url(../../assets/images/evaluation/unselect.png);
                background-size: 100%;
            }
            font-size: .28rem;
        }
    }
    .start-evaluate .btn {
        width: 6.86rem;
        height: .96rem;
        border: 1px solid #FF681D;
        border-radius: .12rem;
        line-height: .96rem;
        text-align: center;
        margin: .86rem auto 0;
        font-size: .36rem;
        color: #FF681D;
    }
    .evaluate {
        margin-top: .2rem;
        background-color: #fff;
        min-height: calc(100% - 2.4rem);
        .score-wrap {
            display: flex;
            align-items: center;
            height: .88rem;
            padding-left: .32rem;
            border-bottom: 1px solid #e5e5e5;
            box-sizing: border-box;
            user-select: none;
            span {
                line-height: 1;
            }
            .name {
                font-size: .28rem;
                color: #666;
            }
            .level {
                font-size: .28rem;
            }
            .star-wrap {
                display: flex;
                align-items: center;
                margin: 0 .12rem .02rem;
                span {
                    width: .32rem;
                    height: .3rem;
                    margin-right: .12rem;
                    background-image: url(../../assets/images/evaluation/icon-star.png);
                    background-size: 100%;
                    background-repeat: no-repeat;
                    &.active {
                        background-image: url(../../assets/images/evaluation/icon-star-active.png);
                    }
                }
            }
        }
    }
    .goods-wrap {
        display: flex;
        padding: .3rem .32rem;
        background-color: #fff;
        .goods-pic {
            width: 1.6rem /* 200/100 */;
            margin-right: .24rem;
            // border: 1px solid #e5e5e5;
            box-sizing: border-box;
            padding: 1px;
            img {
                display: block;
                width: 100%;
            }
        }
        .goods-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 1.6rem;
            .goods-name {
                margin-bottom: .16rem;
                font-size: .26rem /* 26/100 */;
                line-height: .36rem;
            }
            .goods-spec {
                font-size: .22rem;
                color: #999;
            }
            .goods-bot {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: .54rem /* 54/100 */;
                .left {
                    display: flex;
                    margin-left: -.06rem;
                }
                .price {
                    font-size: .26rem;
                }
                .num {
                    margin-left: .2rem;
                    font-size: .24rem;
                    color: #999;
                }
                .btn {
                    width: 1.4rem /* 140/100 */;
                    height: .54rem;
                    font-size: .24rem;
                    line-height: .54rem;
                    border: 1px solid #FF681D;
                    border-radius: .08rem /* 8/100 */;
                    text-align: center;
                    color: #FF681D;
                    box-sizing: border-box;
                }
            }
        }
    }
    .img-view-wrapper{
		position: absolute;
        top: 0;
        left: 0;
		width: 100%;
		height: 100%;
		padding: 1.2rem 0;
		background-color: #000;
		box-sizing: border-box;		
		z-index: 5;

		.img-view-inner{
			width: 100%;
			height: 100%;
			overflow: hidden;

			img{
				display: block;
				width: 100%;
			}
			.swiper-container, .swiper-wrapper, .swiper-slide{
				height: 100%;
			}
			.swiper-slide{
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.swiper-pagination{
			bottom: 0.4rem;
			color: #fff;
		}
	}

    .evaluate-success {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        background-color: #fff;
        .banner {
            width: 100%;
            height: 2.2rem;
            padding-top: .54rem;
            background-image: url(../../assets/images/evaluation/banner.png);
            background-size: 100%;
            background-postion: 0 0;
            box-sizing: border-box;
            color: #fff;
            text-align: center;
            p {
                font-size: .3rem;
                line-height: .42rem;
            }
            div {
                width: 1.6rem;
                height: .56rem; 
                margin: .32rem auto 0;
                font-size: .26rem;
                border-radius: .08rem;
                border: 1px solid #fff;
                line-height: .56rem;
                text-align: center; 
            }
        }
        .hd {
            display: flex;
            align-items: center;
            width: 100%;
            height: .8rem;
            padding-left: .32rem;
            border-bottom: 1px solid #e5e5e5;
            box-sizing: border-box;
            i {
                display: block;
                content: "";
                width: .06rem;
                height: .26rem;
                margin-right: .1rem;
                background-color: #FF681D;
                border-radius: .03rem;
            }
            span {
                font-size: .28rem;
            }
        }
        .waiting-eavluation-null {
            padding-top: 1.97rem;
            text-align: center;
            background-color: #fff;
            p {
                margin-top: .42rem;
                font-size: .26rem;
                color: #999;
            }
            .btn {
                width: 2.46rem;
                height: .61rem;
                border-radius: .12rem;
                line-height: .61rem;
                box-sizing: border-box;
                text-align: center;
                color: #FF681D;
                border: 1px solid #FF681D;
                margin: .54rem auto 0;
                font-size: .28rem;
            }
            img {
                width: 1.5rem;
                height: 1.5rem;
            }
        }
        .wating-evaluation-content {
            padding: .3rem .32rem;
            box-sizing: border-box;
        }
        .evaluation-item {
        display: flex;
        margin-bottom: .4rem;
        .goods-pic {
            width: 2rem /* 200/100 */;
            margin-right: .24rem;
            // border: 1px solid #e5e5e5;
            box-sizing: border-box;
            padding: 1px;
            img {
                display: block;
                width: 100%;
            }
        }
        .goods-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
                .goods-name {
                    margin-bottom: .16rem;
                    font-size: .26rem /* 26/100 */;
                    line-height: .36rem;
                }
                .goods-spec {
                    font-size: .22rem;
                    color: #999;
                }
                .goods-bot {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: .54rem /* 54/100 */;
                    .left {
                        display: flex;
                        margin-left: -.06rem;
                    }
                    .price {
                        font-size: .26rem;
                    }
                    .num {
                        margin-left: .2rem;
                        font-size: .24rem;
                        color: #999;
                    }
                    .btn {
                        width: 1.4rem /* 140/100 */;
                        height: .54rem;
                        font-size: .24rem;
                        line-height: .54rem;
                        border: 1px solid #FF681D;
                        border-radius: .08rem /* 8/100 */;
                        text-align: center;
                        color: #FF681D;
                        box-sizing: border-box;
                    }
                }
            }
        }
    }
    .waiting-evaluation-loading,
    .waiting-evaluation-loadend {
        font-size: 0.26rem;
        text-align: center;
    }
    textarea::-webkit-input-placeholder{
        color: #ccc;
    }
</style>