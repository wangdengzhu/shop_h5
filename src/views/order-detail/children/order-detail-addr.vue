<template>
    <div class="order-addr">
        <div class="order-addr-wrapper">
            <div class="order-addr-inner">
                <ul class="mine-addr-list addr-change" v-if="addrList.length">
                    <li class="tb1px" v-for="item in addrList" :key="item.address_id" @click="setAddr(item)">
                        <div class="addr-info">
                            <div class="addr-selected-icon"></div>
                            <div class="addr-detail">
                                <p class="addr-person flex">
                                    <span class="person-name">{{item.contact_name}}</span>
                                    <span class="preson-tel">{{item.mobile}}</span>
                                    <span v-if="item.default_flag==1" class="addr-lbl default tb1px">默认</span>
                                    <span v-if="item.label_name" class="addr-lbl tb1px">{{ item.label_name }}</span>
                                </p>
                                <p class="addr-text">{{item.areaAName + item.areaBName + item.areaCName + item.areaDName + item.address_detail}}</p>
                            </div>
                            <i class="addr-edit-icon" @click.stop="navToEditAddr(item.address_id)"></i> 
                        </div>
                    </li>
                </ul> 
                <div class="empty-wrapper" v-else-if="pageLoaded">
                    <div class="empty-icon empty-icon-addr">暂无收货地址</div>
                </div>	           
            </div>        
        </div>        
        <div class="mine-new-addr orange-btn" @click="navToNewAddr" v-show="pageLoaded">使用新地址</div>        
        <div class="select-fail-wrapper" v-if="noGoodsAddr" @touchmove.prevent>
            <div class="select-fail-inner">
                <div class="title orange tb1px">以下商品，在您所选区域配送不到</div>
                <div class="con">  
                    <div class="con-inner">                  
                        <div class="pro flex tb1px" v-for="item in noGoodsList" :key="item.skuid">
                            <img :src="item.skupic" alt="">
                            <div class="flex-one">{{item.prefix + item.title}}</div>
                        </div>
                    </div>
                </div>
                <button class="select-btn tb1px" @click="hideFailWrapper">重新选择</button>  
                <div class="select-fail-close" @click="hideFailWrapper"><i></i></div>              
            </div>            
        </div>
        <transition name="router-slid" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import { Addr,Order } from '@/apis/';
    import { mapState, mapMutations } from 'vuex';
    import * as types from '@/store/mutations-type';
    import Toast from '@/components/common/toast';
    import Indicator from '@/components/common/indicator';
    import '@/assets/styles/empty.css';

    export default {
        data(){
            return{
                //addrList : [],
                addrType : {
                    "fullName": "contact_name",
                    "province": "areaAName",
                    "provinceCode": "areaaid",
                    "city": "areaBName",
                    "cityCode": "areabid",
                    "county": "areaCName",
                    "countyCode": "areacid",
                    "street1": "areaDName",
                    "street1Code": "areadid",
                    "street2": "address_detail",
                    "tel": "mobile"
                },     
                modifyAddrType : ['fullName', 'street2', 'tel'],            
                pageLoaded : false,
                noGoodsAddr : false,
                noGoodsList : [],
                //selectedAddrId: -1,
                //addrInfo: {}
            }
        },
        computed: {
            ...mapState(['shopId', 'addrList', 'addrIdx']),
            orderNo(){
                return this.$route.query.orderNo;
            },
            addrKey(){
                return Object.keys(this.addrType);
            }            
        },
        methods: {
            ...mapMutations([
                types.ADDR_SAVE,
                types.ORDER_CHECKED_ADDR
            ]),
            //对象的key转小写
            lowerKey(obj){
                let newObj = {},
                    data = Object.keys(obj);
                data.forEach((val, index) => {
                    newObj[val.toLowerCase()] = obj[val];
                })
                return newObj;
            },

            createParams(obj){
                let params = {}
                this.modifyAddrType.forEach((val, index) => {
                    params[val] = obj[val];
                });
                return params;
            },
            getAddrList(){
                this.reqStart();
                Addr.getList().then((res) => {
                    this.reqEnd();
                    this.pageLoaded = true;
                    if(res.code == this.$ERR.NORMAL){
                        this.ADDR_SAVE(res.data);
                    } else {
                        Toast('获取地址失败，请稍候重试');
						//this.reqFailed();
					}                    
                }).catch((err) => {
                    this.reqEnd();
                    console.log(err);
                })
            },                    
            //设置地址
            setAddr(obj){
                let cacheParams = {},
                    params = {};
                
                //转化数据, 用于存放 vuex
                this.addrKey.forEach((val, index, arr) => {
                    cacheParams[val] = obj[this.addrType[val]];
                });
                
                //生成请求参数
                params = this.createParams(cacheParams);
                params.orderNo = this.orderNo;
                params.areaId = obj.areadid || obj.areacid;

                this.reqStart('正在设置...');
                Order.modifyAddr(params).then((res) => {   
                    this.reqEnd();     
                    let resCode = res.code;        
                    if(resCode == this.$ERR.NORMAL){                                                
                        this.ORDER_CHECKED_ADDR(this.lowerKey(cacheParams));
                        this.$router.go(-1);
                    } else if(resCode == this.$ERR.CANNOT_CHANGE_ADDR){
                        Toast('当前订单不允许修改地址');
                    } else if(resCode == this.$ERR.NO_GOODS_ADDR){
                        this.noGoodsAddr = true;
                        this.noGoodsList = res.data.failedgoods;
                    } else {
                        Toast('设置地址失败，请稍候重试' + res.code);
                    }
                }).catch((err) => {
                    this.reqEnd();
                    console.log(err);
                })
            },
            //跳转编辑收货地址
            navToEditAddr(eidx){                
                this.$router.push({
                    path: '/order-detail/addr-detail/edit',
                    query: {
                        shopId: this.shopId,
                        orderNo: this.orderNo,
                        eidx: eidx
                    }
                })
            },
            //跳转新增收货地址
            navToNewAddr(){
                if(this.addrList.length >= 5){
                    Toast('收货地址不能超过5条');
                    return;
                }
                this.$router.push({
                    path: '/order-detail/addr-detail/new',
                    query: {
                        shopId: this.shopId,
                        orderNo: this.orderNo
                    }
                })
            },
            //隐藏 不支持配送的商品 弹窗
            hideFailWrapper(){
                this.noGoodsAddr = false;
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
            init(){                
                this.getAddrList();                             
            },
            loadAddrData(){
                this.getAddrList();
            }
        },
        created(){            
            this.init();
        },
        mounted(){

        }
    }
</script>

<style lang="postcss" scoped>
    @import '../../../assets/styles/mixins.css';

    .order-addr{
        position: absolute;
		width: 100%;
        height: 100%;
		top: 0;
		left: 0;
		z-index: 2;
    }
    .order-addr-wrapper{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: #f5f5f5;
        -webkit-overflow-scrolling: touch;

        .order-addr-inner{
            padding-bottom: 1rem;
        }
    }
    .mine-addr-list{
        li{		
            padding: 0.24rem 0.32rem;           
            background-color: #fff;
            border-bottom: 1px solid $color-d9;
        }
        .addr-info{	
            position: relative;                     
            font-size: $fs-28;
            color: $color-33;
        }
        .addr-selected-icon{
            position: absolute;
            top: 50%;
            left: 0;
            display: none;
            width:0.4rem;
            height: 0.4rem;
            margin-top: -0.2rem;
            background: url(../../../assets/images/icon-selected.png) no-repeat center;
            background-size: 0.4rem 0.4rem;
        }
        .addr-selected .addr-selected-icon{
            display: block;
        }     
        .addr-detail{
            color: $color-33;

            .addr-person{
                font-size: 0.3rem;
            }
            .addr-text{
                width: 90%;
                margin-top: 0.2rem;
                font-size: 0.24rem;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .person-name{
                max-width: 4em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .preson-tel{
                margin: 0 0.36rem 0 0.24rem;
            }
            .addr-lbl{
                min-width: 0.8rem;
                height: 0.36rem;
                line-height: 0.36rem;
                padding: 0 0.1rem;
                border: 1px solid currentColor;
                border-radius: 0.04rem;
                color:#3F99FE;
                font-size: 0.22rem;
                text-align: center;
                box-sizing: border-box;
                
                &.default{
                    color:$main-color;
                    margin-right: 0.24rem;
                }
            }
        }
    }    
    .mine-addr-list.addr-change{

        .addr-edit-icon{
            position: absolute;
            right: 0;
            bottom: 0;
            width: 20px;
            height: 20px;
            background: url(../../../assets/images/icon-edit.png) no-repeat center;
            background-size: contain;

            &::after{
                content: '';
                position: absolute;
                width: 200%;
                height: 200%;
                margin: -50% 0 0 -50%;
            }
        }
    }
    .mine-new-addr{
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1rem;
        line-height: 1rem;
        text-align: center;	
        font-size: 0.32rem;
    }
    .empty-wrapper{
        padding-top: 2rem;
    }
    .select-fail-wrapper{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0,0,0,0.22);     

        .select-fail-inner{
            position: absolute;
            width: 5.5rem;
            top: 50%;
            left: 50%;
            background-color: #fff;
            transform: translate(-50%, -50%);
            border-radius: 0.08rem;

            .title{
                height: 0.94rem;
                line-height: 0.94rem;
                font-size: 0.24rem;
                text-align: center;
                border-bottom: 1px solid $color-d9;
            }
            .con{
                padding: 1px 0.3rem; 

                .con-inner{                    
                    max-height: 2.4rem;                                          
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;  
                }

                .pro{
                    padding: 0.2rem 0;
                    line-height: 0.34rem;
                    font-size: 0.24rem;
                    border-top: 1px solid $color-d9;

                    &:first-child{
                        border-top: none;
                    }

                    img{       
                        display: block;                 
                        width: 0.8rem;
                        height: 0.8rem;
                        margin-right: 0.2rem;
                    }
                }            
            }
            .select-btn{
                width: 100%;
                height: 0.9rem;
                font-size: 0.28rem;
                border-top: 1px solid $color-d9;
            }
        }  
        .select-fail-close{
            position: absolute;
            width: 0.8rem;
            height: 0.8rem;
            top: 0;
            right: 0;

            i{
                position: absolute;
                width: 13px;
                height: 13px;
                top: 0.1rem;
                right: 0.1rem;
                transform: rotate(45deg);

                &::before, &::after{
                    content: '';
                    position: absolute;    
                    top: 50%;
                    left: 50%;                
                    background-color: #979797; 
                    transform: translate(-50%, -50%);                   
                }
                &::before{
                    width: 100%;
                    height: 1px;                    
                }
                &::after{
                    width: 1px;
                    height: 100%;
                }
            }
        }
    }

    .router-slid-enter-active, .router-slid-leave-active {
        transition: all .4s;
    }
    .router-slid-enter, .router-slid-leave-active {
        transform: translate3d(2rem, 0, 0);
        opacity: 0;
    }
</style>
