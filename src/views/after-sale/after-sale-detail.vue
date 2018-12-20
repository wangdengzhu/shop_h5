<template>
    <div class="as-detail-wrap" v-if="detail">
        <div class="aftersale-state">
            <div class="state-wrap">
                <!-- 状态展示根据售后类型astype和售后状态asstatus组合展示 -->
                <div class="state-text" v-if="/501|502|503|509|510|511/.test(detail.asstatus)">{{asStatusType[detail.asstatus].txt[detail.astype]}}</div>
                <div class="state-text" v-else>{{asStatusType[detail.asstatus].txt}}</div>
                <div class="state-sub" v-if="/502|507/.test(detail.asstatus)">{{secFormat(detail.returnsendtime)}}</div>
                <div class="state-sub" v-else-if="detail.asstatus != 503">{{clearTime(detail.asstatustime)}}</div>
            </div>
            <div :class="['state-icon', asStatusType[detail.asstatus].cls]"></div>
        </div>

        <!-- 退货地址 -->
        <div class="back-address" v-if="detail.asstatus == 502">
            <div class="address-hd">
                <div class="hd-icon position-icon"></div>
                <div class="hd-text">退货地址</div>
            </div>
            <div class="contact-man">
                <span>{{detail.shippmentname}}</span>
                <span>{{detail.shippmenttel}}</span>
            </div>
            <div class="address-detail">
                <span>{{detail.shippmentaddress}}</span>
            </div>
        </div>

        <!-- 收货物流信息 -->
        <div class="back-address" v-if="showAsExpress">
            <div class="address-hd">
                <div class="hd-icon car-icon"></div>
                <div class="hd-text">收货物流信息</div>
            </div>
            <!-- <div class="contact-man">
                <span>{{detail.asaddressdto.contacts}}</span>
                <span>{{detail.asaddressdto.tel}}</span>
            </div> -->
            <div class="address-detail" @click="goExpressPage">
                <span>{{asExpress.context || '暂无物流信息'}}</span>
                <div class="icon"></div> 
            </div> 
        </div>

        <!-- 收货地址 -->
        <div class="back-address" v-if="detail.asstatus == 510 || detail.asstatus == 511">
            <div class="address-hd">
                <div class="hd-icon position-icon"></div>
                <div class="hd-text">收货地址</div>
            </div>
            <div class="contact-man">
                <span>{{detail.asaddressdto.contacts}}</span>
                <span>{{detail.asaddressdto.tel}}</span>
            </div>
            <div class="address-detail">
                <span>{{detail.asaddressdto.provincename + detail.asaddressdto.cityname + detail.asaddressdto.districtname + detail.asaddressdto.townname + detail.asaddressdto.fulladdress}}</span>
            </div>
        </div>

        <!-- 退货物流信息 -->
        <div class="back-address" v-if="showExpress">
            <div class="address-hd">
                <div class="hd-icon car-icon"></div>
                <div class="hd-text">退货物流信息</div>
            </div>
            <div class="contact-man" v-if="detail.expressdata">
                <span>{{expressDetail.time}}</span>
            </div>
            <div class="address-detail" @click="goExpressPage">
                <span>{{expressDetail.context || '暂无物流信息'}}</span>
                <div class="icon"></div> 
            </div>
        </div>

        <!-- 输入展示 -->
        <div class="edit-block" v-if="showExpress">
            <div class="section">
                <div class="section-title">快递公司</div>
                <div class="section-val">{{detail.expressname}}</div>
            </div>
            <div class="section">
                <div class="section-title">运单号码</div>
                <div class="section-val">{{detail.expressno}}</div>
            </div>
            <div class="upload-img-wrap" v-if="asReturnEvidenceImgsArr.length > 0">
                <div class="block-text">凭证图片</div>
                <div class="upload-imgs-wrap" @click="showImgView">
                    <div class="img" v-for="item in asReturnEvidenceImgsArr" :key="item">
                        <img :src="item" alt="">
                    </div>
                </div>
            </div>
        </div>

        <!-- 输入 -->
        <div class="edit-block" v-if="detail.asstatus == 502">
            <div class="section">
                <div class="section-title">快递公司</div>
                <select @change="selectExpressFn">
                    <option value="请选择" selected disabled>请选择</option>
                    <option v-for="item in expressList" :value="item.expressname">{{item.expressname}}</option>
                </select>
                <div class="init-state">
                    <span>{{ selectedExpress || '请选择'}}</span>
                    <div></div>
                </div>
            </div>
            <div class="section" v-if="selectedExpress == '其他'">
                <div class="section-title">快递公司名称</div>
                <input v-model="expressName" placeholder="请填写物流公司名称"></input>
            </div>
            <div class="section">
                <div class="section-title">运单号码</div>
                <input v-model="expressNo" placeholder="请填写运单号" maxlength="20"></input>
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

        <!-- 拒绝原因 -->
        <div class="close-tips" v-if="/504|507|508/.test(detail.asstatus)">
            <span>{{closeType[detail.closetype] || '商家拒绝申请。'}}</span>
            <span>{{detail.retractreason}}</span>
        </div>

        <!-- 商品信息 -->
        <section>
            <div class="goods-wrap-hd">售后商品信息</div>
            <router-link tag="div" class="goods-wrap" :to="{path: '/detail', query: {skuId : detail.skuid, spuId: detail.spuid, shopId: shopId}}">
                <div class="goods-pic">
                    <img :src="detail.skuimage" alt="">
                </div>
                <div class="goods-info">
                    <div class="goods-title">{{detail.spuname}}</div>
                    <div class="goods-spec">{{detail.spec}}</div>
                    <div class="goods-price">￥{{detail.salesprice.toFixed(2)}}</div>
                </div>
            </router-link>
            <div class="upload-img-wrap asEvidenceImgs" v-if="/501|504|507|508/.test(detail.asstatus) && asEvidenceImgsArr.length > 0">
                <div class="block-text">凭证图片</div>
                <div class="upload-imgs-wrap" @click="showImgView">
                    <div class="img" v-for="item in asEvidenceImgsArr" :key="item">
                        <img :src="item" alt="">
                    </div>
                </div>
            </div>
            <div class="aftersale-info">
                <div v-if="detail.asstatus == 505">
                    <span>退款金额</span>
                    <span>{{detail.applyrefundamount.toFixed(2)}}</span>
                </div>
                <div v-if="detail.asstatus == 506">
                    <span>退款金额</span>
                    <span>{{detail.refundamount.toFixed(2)}}</span>
                </div>
                <div>
                    <span>售后数量</span>
                    <span>{{detail.qty}}</span>
                </div>
                <div>
                    <span>售后原因</span>
                    <span>{{detail.reason}}</span>
                </div>
                <div>
                    <span>售后编号</span>
                    <span>{{detail.asorderno}}</span>
                </div>
                <div>
                    <span>申请时间</span>
                    <span>{{detail.applytime}}</span>
                </div>
            </div>
        </section>

        <div class="fixed-footer">
            <div class="btn" @click="redirect('/chat', { bizno: orderno, st:3, skuid: detail.skuid})">联系客服</div>
            <div class="btn" v-if="/501|502|504|507/.test(detail.asstatus)" @click="cancelAftersaleFn">撤销申请</div>
            <div class="btn" v-if="detail.asstatus == 507" @click="applyPlatformFn">平台介入</div> 
            <div class="btn" v-if="detail.asstatus == 502" @click="submitReturnFn">提交</div> 
            <div class="btn" v-if="detail.asstatus == 510" @click="confirmReceivingFn">确认收货</div>
        </div>

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
</template>

<script>
    import { AfterSale } from '@/apis/';
    import * as types from '@/store/mutations-type';
    import { mapState, mapMutations } from 'vuex';
    import confirmBox from '@/components/common/confirm-box';
    import Toast from '@/components/common/toast/';
    import Indicator from '@/components/common/indicator';
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
                asStatusType: {
                    '501': {
                        txt: {
                        '1': '退款中，待审核',
                        '2': '退款中，待审核',
                        '3': '退货中，待审核',
                        '4': '换货中，待审核',
                        '5': '维修中，待审核'
                        },
                        cls: 'state-refunding'
                    },
                    '502': {
                        txt: {
                        '1': '退货中，待寄回商品',
                        '2': '退货中，待寄回商品',
                        '3': '退货中，待寄回商品',
                        '4': '换货中，待寄回商品',
                        '5': '维修中，待寄回商品'
                        },
                        cls: 'state-refunding'
                    },
                    '503': {
                        txt: {
                        '1': '退货中，待商家收货',
                        '2': '退货中，待商家收货',
                        '3': '退货中，待商家收货',
                        '4': '换货中，待商家收货',
                        '5': '维修中，待商家收货'
                        },
                        cls: 'state-refunding'
                    },
                    '504': {
                        txt: '待平台处理',
                        cls: 'state-refunding'
                    },
                    '505': {
                        txt: '退款中',
                        cls: 'state-refunding'
                    },
                    '506': {
                        txt: '退款完成',
                        cls: 'state-refunding'
                    },
                    '507': {
                        txt: '退款申请被拒绝。',
                        cls: ''
                    },
                    '508': {
                        txt: '已关闭',
                        cls: 'state-closed'
                    },
                    '509': {
                        txt: {
                        '1': '退货中，待商家寄回',
                        '2': '退货中，待商家寄回',
                        '3': '退货中，待商家寄回',
                        '4': '换货中，待商家寄回',
                        '5': '维修中，待商家寄回'
                        },
                        cls: 'state-refunding'
                    },
                    '510': {
                        txt: {
                        '4': '换货中，商家已发货',
                        '5': '维修中，商家已发货'
                        },
                        cls: 'state-refunding'
                    },
                    '511': {
                        txt: {
                        '4': '换货成功',
                        '5': '维修成功'
                        },
                        cls: 'state-closed'
                    }
                },
                // 关闭类型(1:系统自动关闭,10:卖家,20:买家,40:平台) ,
                closeType: {
                    '1': '因您超时未处理，该售后已关闭。',
                    '10': '平台拒绝申请，售后已关闭。',
                    '20': '您已取消申请，售后已关闭。',
                    '40': '平台拒绝申请，售后已关闭。'
                },

                detail: null,
                expressDetail: {},
                expressList: [],
                index: 0,
                showExpreessIpt: false,
                expressNo: '',
                expressName: '',
                asExpressId: 0,
                evidenceName: '',
                selectedExpress: '',

                imageUrls : [],
				imagePlaceUrl : '',
                imgIsLoading : false,
                showBigImg : false,
                mySwiper : null,

                // 上传后的凭证图片
                asEvidenceImgsArr: [],
                asReturnEvidenceImgsArr: [],

                // 根据不同的状态展示
                showExpress: false,
                showAsExpress: false,
                asExpress: {},
            }
        },

        computed: {
            ...mapState(['shopId']),
            asOrderNo() {
                return this.$route.query.asNo;
            },
            permission() {
                return this.detail.permission;
            },
            orderno() {
                return this.$route.query.orderNo;
            }
        },

        methods: {
            
            // 确认收货
            confirmReceivingFn() {
                let asOrderNo = this.asOrderNo;
                if(!this.permission){
                    Toast('您暂无权限申请平台介入');
                    return;
                }
                confirmBox.open({
					'message' : '您已经收到货品了吗？'
				}).then(
					(resolve) => {
                        this.reqStart('确认中...');
                        return AfterSale.confirmReceiving({asOrderNo : asOrderNo})
                    }, 
					reject => {}
				).then((res) => {
                    this.reqEnd();
                    if(!res) return;
                    if(res.code === this.$ERR.NORMAL){
                        this.init()
                    } else {
                        Toast(res.message + res.code);
                    }
                }).catch((err) => {
                    console.log(err);
                });
            },

            // 申请平台介入
            applyPlatformFn() {
                let asOrderNo = this.asOrderNo;
                if(!this.permission){
                    Toast('您暂无权限申请平台介入');
                    return;
                }
                confirmBox.open({
					'message' : '平台将审核订单，联系商家协商处理，维护您的权益'
				}).then(
					(resolve) => {
                        this.reqStart('申请中...');
                        return AfterSale.platform({orderNo : asOrderNo})
                    }, 
					reject => {}
				).then((res) => {
                    this.reqEnd();
                    if(!res) return;
                    if(res.code === this.$ERR.NORMAL){
                        this.init()
                    } else {
                        Toast(res.message + res.code);
                    }
                }).catch((err) => {
                    console.log(err);
                });
            },

            // 撤销申请
            cancelAftersaleFn() {
                let that = this;
                let asOrderNo = this.asOrderNo;
                if(!this.permission){
                    Toast('您暂无权限关闭此售后单');
                    return;
                }
                confirmBox.open({
                    'message' : '您将撤销该申请，确定继续吗？'
                }).then(
                    (resolve) => {
                        this.reqStart('正在关闭...');
                        return AfterSale.cancel({asOrderNo});
                    }, 
                    reject => {}
                ).then(                    
                    (res) => {
                        this.reqEnd();
                        if(!res) return;
                        if(res.code === this.$ERR.NORMAL){
                            this.init()
                        } else {
                            Toast('商家（平台）已处理该售后。');
                            setTimeout(() => {
                                that.init();
                            }, 1000);
                        }
                    }			
                ).catch((err) => {
                    console.log(err);
                });
            },

            // 物流页
            goExpressPage() {
                let expressno, expressname, reqinfo;
                if (this.showExpress) {
                    expressno = this.detail.expressno;
                    expressname = this.detail.expressname;
                    reqinfo = encodeURIComponent(this.detail.queryafterexpressdata);
                }
                if (this.showAsExpress) {
                    expressno = this.detail.asshipmentdto.expressno;
                    expressname = this.detail.asshipmentdto.expressname;
                    reqinfo = encodeURIComponent(this.detail.queryafterexpressdata);
                }
                let url = `/after-sale-express?expressname=${expressname}&expressno=${expressno}&reqInfo=${reqinfo}&shopId=${this.shopId}`;
				this.$router.push({path: url});
            },

            selectExpressFn(e) {
                this.selectedExpress = e.target.value;
                
                this.asExpressId = this.expressList[e.target.selectedIndex - 1].expressid;
            },

            //时间字符串去掉毫秒	
            clearTime(timeStr){
				return timeStr.replace(/:(\d+):(\d+):(\d+)/g, ':$1:$2');
            },
            //计算当前秒数是 XX天XX小时XX分
            numFormat(num){
                return num < 10 ? '0' + num : num;
            },
            secFormat(sec){
                if(sec <= 0){
                    this.timeEndCancel();  //超时关闭订单
                    return '';
                }
				let prefix = '还剩 ',
                    timeStr = '',
                    suffix = ' 自动关闭',
					hourHasSec = 60*60,
                    dayHasSec = hourHasSec * 24,
                    day = Math.floor(sec / dayHasSec),
                    hour = Math.floor((sec - day * dayHasSec) / hourHasSec),
                    minute = Math.floor((sec - day * dayHasSec - hour * hourHasSec) / 60),
					second = sec % 60;
                if(day === 0 && hour === 0){  //当 天位 和 时位 都为0 时，显示 XX分XX秒
					timeStr =  this.numFormat(minute) + '分' + this.numFormat(second) + '秒';
                } else {
					timeStr = this.numFormat(day) + '天' + this.numFormat(hour) + '小时' + this.numFormat(minute) + '分';
				}
				return prefix + timeStr + suffix;
            },
            
            //获取售后详情
            getDetails(){
                this.reqStart();
                AfterSale.getDetails(this.asOrderNo).then((res) => {    
                    this.reqEnd();                 
                    if(res.code === this.$ERR.NORMAL){
                        console.log(res.data)
                        let expressDetail = {};
                        try{
                            expressDetail = JSON.parse(res.data.expressdata)
                        }catch(e) {};
                        let asEvidenceImgsArr = res.data.asevidencename ? res.data.asevidencename.split(',') : [];
                        let asReturnEvidenceImgsArr = res.data.asreturnevidencename ? res.data.asreturnevidencename.split(',') : [];

                        this.detail = res.data;
                        this.expressDetail = expressDetail;
                        this.asEvidenceImgsArr = asEvidenceImgsArr;
                        this.asReturnEvidenceImgsArr = asReturnEvidenceImgsArr;
                        
                        // 查看大图
                        if(/501|504|507|508/.test(res.data.asstatus)) {
                            if(this.asEvidenceImgsArr.length > 0) {
                                this.imageUrls = asEvidenceImgsArr;
                            }
                        }

                        if(res.data.asstatus == 502) {
                            this.getExpressFn();
                        } else if (/503|505|506|509/.test(res.data.asstatus) && res.data.astype != 2) {
                            // 如果没有数据的异常状态则不请求
                            if (!res.data.queryafterexpressdata) {
                                return false;
                            }
                            // 方便查看大图  设置imgurls为当前图片
                            this.imageUrls = asReturnEvidenceImgsArr;
                            // 506状态有两种情况： 退款完成  退货退款完成  退货情况下有物流信息和相关物流凭证
                            this.showExpress = true;
                            // 开发测试环境如果不请求快递接口  则详情中不会返回该快递信息
                            this.getExpressInfoFn(res.data.queryafterexpressdata);
                        } else if (res.data.asstatus == 510 || res.data.asstatus == 511) {
                            if (!res.data.queryafterexpressdata) {
                                return false;
                            }
                            let asExpress = {};
                            try {
                                asExpress = JSON.parse(res.data.asshipmentdto.expressdata);
                            } catch (e) { };

                            this.asExpress = asExpress;
                            this.showAsExpress = true;
                            this.getExpressInfoFn(res.data.queryafterexpressdata)
                        }                 
                    } else {
                        Toast('获取售后明细失败，请稍候重试');
                    }                    
                }).catch((err) => {
                    this.reqEnd();
                    console.log(err);
                })
            },
            // 获取快递列表
            getExpressFn: function() {
                AfterSale.getExpressName().then(res => {
                    console.log(res.data);
                    res.data.push({
                        expressid: 0,
                        expressname: '其他'
                    });
                    this.expressList = res.data;
                })
            },
            // 获取物流信息
            getExpressInfoFn: function(reqInfo) {
                AfterSale.getAfterExpress(reqInfo).then(res => {
                    console.log(res);
                }).catch(e => {
                    console.log(e)
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
                this.getDetails();
            },

            // 提交
            submitReturnFn: function() {
                let msg = '';
                let expressName = this.asExpressId == 0 ? this.expressName : this.selectedExpress;
                if (!expressName) {
                    msg = '请输入物流公司名称';
                } else if (!this.expressNo) {
                    msg = '请输入运单号码';
                } else if (this.expressNo.length < 8) {
                    msg = '请输入完整的运单号码';
                }
                if (msg != '') {
                    Toast(msg);
                    return;
                }

                let evidenceName = this.imageUrls.join(',');

				this.reqStart('正在提交...');
                AfterSale.submitBack({
                    asOrderNo: this.asOrderNo,
                    expressNo: this.expressNo,
                    expressName: expressName,
                    asExpressId: this.asExpressId,
                    evidenceName: evidenceName
                }).then(res => {
					this.reqEnd();
                    if(res.code === this.$ERR.NORMAL) {
                        Toast({
                            toastTxt: '提交成功',
                            iconCls: 'success'
                        });
                        setTimeout(() => {
                            this.init();
                        }, 1500);
                    } else if(res.code === this.$ERR.EXPNO_HAS_ALREADY){
						Toast('快递单号已使用过')
					} else if(res.code === this.$ERR.RETURN_HAS_ALREADY){
						Toast('售后单已存在退货单');
					} else {
						Toast(res.message + res.code);
					}
                }).catch((err) => {
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
        },

        created(){
            this.init();
        },
    }

</script>

<style lang="postcss" scoped>

    .as-detail-wrap {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: auto;
        z-index: 10;
        background: #f5f5f5;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 1.08rem;
        box-sizing: border-box;
    }

    .aftersale-state {
        position: relative;
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 1.8rem;
        padding: 0 .76rem 0 .32rem;
        box-sizing: border-box;
        background:linear-gradient(90deg,rgba(248,154,42,1),rgba(255,118,29,1));
    }

    .state-wrap {
        padding-top: .4rem;
        color: #fff;
    }
    .state-text {
        font-size: .32rem;
        margin-bottom: .12rem;
    }
    .state-sub {
        font-size: .26rem;
    }
    .state-icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: 100%;
        background-repeat: no-repeat;
    }
    .state-refunding {
        background-image: url(../../assets/images/aftersale/order-refunding.png);
    }
    .state-closed {
        background-image: url(../../assets/images/aftersale/order-closed.png);
    }

    .back-address {
        padding: .24rem .32rem;
        background-color: #fff;
        margin-bottom: .2rem;
    }
    .address-hd {
        display: flex;
        align-items: center;
        font-size: .3rem;
        color: #333;
    }
    .address-hd .hd-icon {
        width: .4rem;
        height: .4rem;
        background-repeat: no-repeat;
        background-size: 100%;
        margin-right: .1rem;
    }
    .position-icon {
        background-image: url(../../assets/images/aftersale/position.png);
    }
    .car-icon {
        background-image: url(../../assets/images/aftersale/car.png);
    }
    .contact-man {
        font-size: .28rem;
        color: #333;
        margin-top: .26rem;
    }
    .contact-man text {
        margin-right: .32rem;
    }
    .address-detail {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: .16rem;
    }
    .address-detail span {
        font-size: .26rem;
        color: #666;
        flex: 1;
        word-break: break-all;
    }
    .address-detail .icon {
        width: .14rem;
        height: .24rem;
        background-image: url(../../assets/images/aftersale/right-icon.png);
        background-size: 100%;
        background-repeat: no-repeat;
        margin-left: .36rem;
    }

    .edit-block {
        padding: 0 .32rem;
        background-color: #fff;
        margin-bottom: .2rem;
    }
    .edit-block .section {
        position: relative;
        height: .88rem;
        border-bottom: .02rem solid #e5e5e5;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .section-title,
    .section-val {
        font-size: .28rem;
        color: #333;
    }
    input {
        text-align: right;
        font-size: .26rem;
        color: #333;
    }
    select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
    }
    .init-state,
    .express-state {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: .26rem;
        color: #333;
        line-height: .88rem;
    }
    .init-state div,
    .express-state div {
        width: .14rem;
        height: .24rem;
        background-image: url(../../assets/images/aftersale/right-icon.png);
        background-size: 100%;
        margin-left: .16rem;
    }


    .goods-wrap {
        padding: .32rem;
        border-bottom: .02rem solid #e5e5e5;
        background-color: #fff;
        display: flex;
        justify-content: space-between;
    }
    .goods-pic {
        width: 2rem;
        height: 2rem;
    }
    .goods-pic img {
        display: block;
        width: 100%;
        height: 100%;
    }

    .goods-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: .24rem;
    }
    .goods-title {
        font-size: .26rem;
        color: #333;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: .36rem;
    }
    .goods-spec {
        flex: 1;
        font-size: .22rem;
        color: #999;
        margin-top: .16rem;
    }
    .goods-price {
        font-size: .26rem;
        color: #333;
    }

    .aftersale-info {
        padding: .24rem .32rem;
        background-color: #fff;
        font-size: .24rem;
        color: #666;
        margin-bottom: .2rem;
    }
    .aftersale-info div {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: .08rem;
    }
    .aftersale-info div span:first-child {
        color: #333;
        margin-top: .02rem;
    }
    .aftersale-info div span:last-child {
        flex: 1;
        margin-left: .4rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break:break-all;
        line-height: .28rem;
    }
    .goods-wrap-hd {
        line-height: .88rem;
        padding-left: .32rem;
        font-size: .28rem;
        color: #333;
        border-bottom: .02rem solid #e5e5e5;
        background-color: #fff;
    }

    .close-tips {
        padding: .24rem .32rem;
        font-size: .28rem;
        color: #333;
        background-color: #fff;
        margin-bottom: .2rem;
    }


    .upload-img-wrap {
        padding-top: .24rem;
    }
    .upload-img-wrap .block-text {
        margin-bottom: .24rem;
        font-size: .28rem;
        color: #333;
    }
    .imgs-wrap,
    .upload-imgs-wrap {
        display: flex;
        flex-wrap: wrap;
    }
    .upload-imgs-wrap>div {
        width: 2.12rem;
        height: 2.12rem;
        box-sizing: border-box;
        margin-bottom: .4rem;
    }
    .upload-imgs-wrap div:nth-child(3n-1) {
        margin: 0 .25rem;
    }
    .upload-imgs-wrap img {
        width: 100%;
        height: 100%;
        display: block;
    }
    .upload-imgs-wrap .img {
        position: relative;
    }
    .asEvidenceImgs {
        background-color: #fff;
        margin-bottom: .2rem;
        padding: .24rem .32rem 0;
    }

    .fixed-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1.08rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        background-color: #fff;
    }
    .fixed-footer div{
        width:1.5rem;
        height:.64rem;
        border-radius:.1rem;
        border: .02rem solid #999;
        text-align: center;
        line-height: .64rem;
        font-size: .26rem;
        margin-right: .4rem;
        color: #666;
    }
    .fixed-footer div:last-child {
        color: #FF681D;
        border: .02rem solid #FF681D;
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
</style>

