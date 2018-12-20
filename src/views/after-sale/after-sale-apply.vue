<template>
    <div class="as-apply-wrap" v-if="goodsDetail">
        <div class="service-type block">
            <div class="block-text">服务类型</div>
            <div class="btn-wrap">
                <div v-for="item in aftersaleType" 
                    :key="item.astype" @click="changeActive(goodsDetail[item.tip], item.astype)"
                    :class="['btn', goodsDetail[item.tip] ? '' : 'btn-disabled', activeAstype == item.astype ? 'btn-active': '']">
                    {{item.txt}}
                </div>
            </div>
        </div>
        <div class="block">
            <div class="refund-goods">
                <div class="goods-wrap">
                    <div class="goods-pic">
                        <img :src="goodsDetail.skuimage" alt="">
                    </div>
                    <div class="goods-desc">
                        <div class="goods-top">
                            <div class="goods-title">{{goodsDetail.spuname}}</div>
                            <div class="goods-price">￥{{goodsDetail.salesprice.toFixed(2)}}</div>
                        </div>
                        <div class="goods-sub-title">
                            <div class="spec">{{goodsDetail.spec}}</div>
                            <div class="num">x{{goodsDetail.qty}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="refund-total-wrap flex-between">
                <div class="block-text">售后数量</div>
                <div class="num-ctrl-wrap">
                    <div :class="['minus-icon', isSmallest ? 'grey' : '']" @click="ctrlRefunNum('-')"></div>
                    <div class="refund-num">{{applyqty}}</div>
                    <div :class="['add-icon', isBiggest ? 'grey' : '']" @click="ctrlRefunNum('+')"></div>
                </div>
            </div>
            <div class="refund-price-wrap flex-between" v-if="activeAstype == 2 || activeAstype == 3">
                <div class="block-text">退款金额</div>
                <div class="refund-price">￥{{refundamount.toFixed(2)}}</div>
            </div>
        </div>

        <div class="block feedback-wrap">
            <div class="descript-wrap">
                <div class="block-text">问题描述</div>
                <textarea v-model="descTxt" placeholder="请描述你的问题（10-500字）" minlength="10" maxlength="500"></textarea>
                <div :class="['text-tips', descTxt.length == 500 ? 'redtxt' : '']">{{descTxt.length}}/500字</div>
            </div>
            <div class="upload-img-wrap">
                <div class="block-text">上传凭证</div>
                <div class="imgs-list" @click="showImgView">
                    <div class="img-wrap" v-for="(item, index) in imageUrls" :key="item.id" :class="{'isLoading' : imgIsLoading && (index == imageUrls.length-1)}">
                        <img :src="item" alt="">
                        <span class="close" v-show="(!!imageUrls[index])" @click.stop="removeImage(index)"></span>
                    </div>
                    <div class="add-img-btn" v-if="imageUrls.length < 6">
                        <img src="../../assets/images/evaluation/camera.png" alt="">
                        <p>添加图片</p>
                        <input type="file" class="file-inp" accept="image/*" @change="changeImage($event)">
                    </div>
                </div>
            </div>
        </div>
        <section v-if="activeAstype == 4 || activeAstype == 5"> 
            <div class="block address">
                <div class="address-hd flex-between" @click="navToAddrPage">
                    <div class="block-text">商品收货地址</div>
                    <div class="right">
                        <span>修改</span>
                        <div></div>
                    </div>
                </div>  
                <div class="address-detail">
                    <div>
                        <span class="name">{{shippingaddress.fullname}}</span>
                        <span>{{shippingaddress.tel}}</span>
                    </div>
                    <div class="address">{{shippingaddress.province + shippingaddress.city + shippingaddress.county + shippingaddress.street1 + shippingaddress.street2}}</div>
                </div>
            </div>
            <div class="contact-tips">售后专员可能联系您，请保持电话畅通。</div>
        </section> 
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
        <button class="submit-btn" @click="submit">提交</button>
    </div>
</template>

<script>
    import { AfterSale, Order } from '@/apis/';
	import { mapState } from 'vuex';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
    import '@/assets/styles/empty.css';
	import EXIF from 'exif-js';
    import { compressImg, dataURLtoBlob } from '@/utils/imageManage';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';

    const MAX_NUM = 10;
	const MAX_IMG_SIZE = MAX_NUM * 1024 * 1024;   //10MB
	const UPLOAD_SIZE = 0.2 * 1024 * 1024  //   200KB， 如果小于200KB，直接上传不压缩
    const VALID_TYPE = /jpeg|jpg|png|gif/;   //支持的图片格式
    
    export default {
        data() {
            return {
                imageUrls : [],
				imagePlaceUrl : '',
                imgIsLoading : false,
                showBigImg : false,
                mySwiper : null,

                goodsDetail: null,
                dataIsLoaded: false,
                orderDetail: null,
                shippingaddress: null,
                activeAstype: 0,
                pictures: [],

                // 退款最大金额
                canmaxrefundamount: 0,
                refundamount: 0,
                // 退款数量
                canapplyasmaxqty: 1,
                applyqty: 0,

                OrderLineId: '',
                OrderId: '',

                descTxt: '',

                isBiggest: true,
                isSmallest: false,

                aftersaleType: [
                    {
                        tip: 'canapplyasrefund',
                        txt: '退款',
                        astype: 2
                    },
                    {
                        tip: 'canapplyasrefundandreturns',
                        txt: '退货退款',
                        astype: 3
                    },
                    {
                        tip: 'canapplyasexchangegoods',
                        txt: '换货',
                        astype: 4
                    },
                    {
                        tip: 'canapplyasrepair',
                        txt: '维修',
                        astype: 5
                    }
                ],
            }
        },

        computed: {
			...mapState(['shopId', 'orderCheckedAddr']),
            orderNo(){
                return this.$route.query.orderNo;
            },
            skuid() {
                return this.$route.query.skuid;
            }
        },

        methods: {

            ctrlRefunNum(ctrl) {
                if(ctrl == '+'){
                    if (this.applyqty < this.canapplyasmaxqty) {
                        this.applyqty++;
                    }
                }else {
                    if(this.applyqty > 1) {
                        this.applyqty--;
                    }
                }

                if (this.applyqty == 1) {
                    this.isSmallest = true;
                    if(this.canapplyasmaxqty >1) {
                        this.isBiggest = false;
                    }
                } else if (this.applyqty == this.canapplyasmaxqty) {
                    this.isBiggest = true;
                    if(this.applyqty > 1) {
                        this.isSmallest = false;
                    }
                }else {
                    this.isBiggest = false;
                    this.isSmallest = false;
                }

                this.refundamount = (this.canmaxrefundamount / this.canapplyasmaxqty * this.applyqty);
            },

            changeActive(canSelect, astype) {
                if(canSelect) {
                    this.activeAstype = astype;
                }
            },

            navToAddrPage(){
                let params = {
                    activeAstype: this.activeAstype
                }
                Object.assign(params, this.shippingaddress, this.$route.query);
				this.$router.push({
					path: '/after-sale-address',
					query: params
				});
			},

            getOrderDetails(orderNo){    //获取订单详情
				this.reqStart();
                return Order.getDetails(orderNo).then((res) => {
					this.reqEnd();					
                    if(res.code === this.$ERR.NORMAL){
                        var res = res.data;
                        for(let i=0; i<res.lines.length; i++) {
                            if(res.lines[i].skuid == this.skuid) {
                                this.goodsDetail = res.lines[i];
                                this.dataIsLoaded = true;
                                this.shippingaddress = res.shippingaddress;
                                this.orderDetail = res;
                                this.canmaxrefundamount = res.lines[i].canmaxrefundamount;
                                this.refundamount = res.lines[i].canmaxrefundamount;
                                this.canapplyasmaxqty = res.lines[i].canapplyasmaxqty;
                                this.applyqty = res.lines[i].canapplyasmaxqty;
                                if (res.lines[i].canapplyasmaxqty == 1) {
                                    this.isSmallest = true;
                                }
                            }
                        }
                        
                        // 如果有该参数表示从修改地址栏过来
                        let query = this.$route.query;
                        if(this.$route.query.activeAstype) {
                            this.activeAstype = query.activeAstype;
                            this.shippingaddress = query;
                        }
                    } else {
						Toast('获取订单明细失败, 请稍候重试');
					}
                }).catch((err) => {
					this.reqEnd();
					console.log(err);
				})
            },
            reqStart(text){
				text = text || '加载中...';
				Indicator.show(text);
			},
			reqEnd(){
				Indicator.close();
			},
			reqFailed(){
				Toast('网络异常，请稍候重试');
            },
            
            init() {
                this.getOrderDetails(this.orderNo);
            },

            submit() {
                let msg = '';
                let that = this;
                if (this.activeAstype < 2) {
                    msg = '请选择服务类型';
                } else if (!this.descTxt) {
                    msg = '请输入问题描述';
                } else if(this.descTxt.length < 10) {
                    msg = '至少输入10个字符'
                }
                if (msg != '') {
                    Toast(msg);
                    return;
                }

                let AsEvidenceName = this.imageUrls.join(',');
                
                // 如果不换货和维修相关参数直接传空
                let shippingaddress = {};
                if (this.activeAstype == 4 || this.activeAstype == 5) {
                    shippingaddress = this.shippingaddress;
                }

                this.reqStart('正在提交...');
                AfterSale.create({
                    AsType: this.activeAstype,
                    OtherReason: this.descTxt,
                    OrderNo: this.orderNo,
                    OrderId: this.orderDetail.id,
                    OrderLineId: this.goodsDetail.id,
                    Qty: this.applyqty,
                    RequestRefundAmount: this.refundamount,
                    AsEvidenceName: AsEvidenceName,
                    ProvinceId: shippingaddress.provincecode,
                    ProvinceName: shippingaddress.province,
                    CityId: shippingaddress.citycode,
                    CityName: shippingaddress.city,
                    DistrictId: shippingaddress.countycode,
                    DistrictName: shippingaddress.county,
                    TownId: shippingaddress.street1code,
                    TownName: shippingaddress.street1,
                    Contacts: shippingaddress.fullname,
                    Tel: shippingaddress.tel,
                    FullAddress: shippingaddress.street2
                }).then(res => {
                    this.reqEnd();
                    if(res.code === this.$ERR.NORMAL){
						Toast({
							toastTxt: '提交成功',
							iconCls: 'success'
						});
                        setTimeout(() => {
                            let url = `/after-sale-detail?asNo=${res.data}&shopId=${this.shopId}`;
                            this.$router.replace({path: url});
                        }, 1500);
					}else {
                        Toast(res.message);
                    }
                }).catch(err => {
                    this.reqEnd();
					console.log(err);
                })
            },

            //上传图片
			uploadEvid(data) {
                Indicator.show('上传中...');		
				AfterSale.uploadEvid(data).then((res) => {
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
        },

        created(){
			this.init();
        },
    }
</script>

<style lang="postcss" scoped>
    .as-apply-wrap {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        background-color: #f5f5f5;
        padding-bottom: 1rem;
    }
    .block {
        margin-bottom: .2rem;
        background-color: #fff;
        padding: 0 .32rem;
        box-sizing: border-box;
    }
    .block-text {
        font-size: .28rem;
        color: #333;
    }

    .service-type {
        padding: .32rem;
    }
    .service-type .btn-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: .24rem;
    }
    .service-type .btn {
        width: 1.5rem;
        height: .64rem;
        line-height: .64rem;
        text-align: center;
        border: .02rem solid #ccc;
        border-radius: .06rem;
        color: #333;
        font-size: .28rem;
    }
    .service-type .btn.btn-active {
        color: #ff681d;
        border-color: #ff681d;
    }
    .service-type .btn.btn-disabled {
        color: #ccc;
    }

    .goods-wrap {
        display: flex;
        justify-content: space-between;
        padding: .32rem 0;
    }
    .goods-wrap .goods-pic {
        width: 1.6rem;
        height: 1.6rem;
    }
    .goods-wrap .goods-pic img {
        display: block;
        width: 100%;
        height: 100%;
    }
    .goods-desc {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
        margin-left: .24rem;
    }

    .goods-top {
        display: flex;
        justify-content: space-between;
        font-size: .26rem;
        color: #333;
    }
    .goods-title {
        flex: 1;
        font-size: .26rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #333;
        line-height: .32rem;
    }
    .goods-price {
        margin-left: .54rem;
    }

    .goods-sub-title {
        flex: 1;
        display: flex;
        justify-content: space-between;
        margin-top: .24rem;
    }
    .spec {
        font-size: .22rem;
        color: #999;
    }
    .num {
        font-size: .26rem;
        color: #333;
    }

    .refund-total-wrap {
        border-top: .02rem solid #e5e5e5;
        height: .88rem;
    }
    .num-ctrl-wrap {
        display: flex;
        align-items: center;
        border: .02rem solid #ccc;
        border-radius: .06rem;
        font-size: .28rem;
        height: .5rem;
        box-sizing: border-box;
    }
    .num-ctrl-wrap div {
        text-align: center;
        height: 100%;
        line-height: .48rem;
    }
    .minus-icon,
    .add-icon {
        width: .6rem;
    }
    .refund-num {
        width: .7rem;
        border-left: .02rem solid #ccc;
        border-right: .02rem solid #ccc;
    }

    .flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .grey.minus-icon:after,
    .grey.add-icon:after,
    .grey.add-icon:before {
        background-color: #999;
    }

    .minus-icon,
    .add-icon {
        position: relative;
    }

    .minus-icon:after,
    .add-icon:after,
    .add-icon:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        display: block;
        width: .2rem;
        height: .02rem;
        margin-left: -.1rem;
        background-color: #333;
    }

    .add-icon:before {
        transform: rotate(90deg);
    }

    .small .minus-icon:after,
    .small .add-icon:after,
    .small .add-icon:before {
        width: .16rem;
        margin-left: -.08rem;
    }

    .refund-price-wrap {
        border-top: .02rem solid #e5e5e5;
        height: .88rem;
    }
    .refund-price {
        color: #ff681d;
        font-size: .28rem;
    }

    .descript-wrap .block-text {
        line-height: .88rem;
    }
    textarea {
        font-size: .28rem;
        color: #666;
        width: 100%;
        height: 2rem;
        padding-left: 0;
    }
    ::placeholder {
        font-size: .28rem;
        color: #ccc;
    }
    .text-tips {
        text-align: right;
        font-size: .26rem;
        color: #ccc;
        margin-bottom: .2rem;
    }

    .upload-img-wrap {
        border-top: .02rem solid #e5e5e5;
        padding-top: .24rem;
    }
    .upload-img-wrap .block-text {
        margin-bottom: .24rem;
    }
    .redtxt {
        color: #f00;
    }
    .grey {
        color: #ccc;
    }

    .submit-btn {
        position: fixed;
        left: 0;
        bottom: 0;
        z-index: 99;
        width: 100%;
        height: 1rem;
        line-height: 1rem;
        text-align: center;
        font-size: .34rem;
        color: #fff;
        background-color: #ff681d;
        border-radius: 0;
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
    .img-view-wrapper{
		position: fixed;
        top: 0;
        left: 0;
		width: 100%;
		height: 100%;
		padding: 1.2rem 0;
		background-color: #000;
		box-sizing: border-box;		
		z-index: 100;

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
    .address-detail {
        border-top: .02rem solid #e5e5e5;
        padding: .24rem 0;
    }
    .address-detail div span {
        font-size: .28rem;
        color: #333;
    }
    .address-detail div .name {
        margin-right: .4rem;
    }
    .address-detail .address {
        margin-top: .24rem;
        color: #666;
        font-size: .28rem;
    }

    .contact-tips {
        margin: .57rem auto;
        font-size: .26rem;
        color: #999;
        text-align: center;
    }

    .address-hd {
        height: .88rem;
    }

    .address-hd .right {
        display: flex;
        align-items: center;
        font-size: .28rem;
        color: #999;
        line-height: 1;
    }

    .address-hd .right div {
        width: .12rem;
        height: .22rem;
        background-image: url(../../assets/images/aftersale/right-icon.png);
        background-size: 100%;
        margin-left: .16rem;
        background-repeat: no-repeat;
    }
</style>
