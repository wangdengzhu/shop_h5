<template>
    <div class="express-detail">
        <!--如果是只有一个物流，就不显示 order-menu-->
        <div class="order-menu gray6" v-if="orderExpItems.length > 1">
            <div class="logis-menu-wrapper">
                <ul class="logis-menu">
                    <li v-for="(item, index) in orderExpItems" :key="item.shipmentid" :class="{'active' : index == checkedIndex}"
                    @click="getExpress(index)">
                        <span>快递{{index + 1}}</span>
                    </li>                    
                </ul>
            </div>
        </div>
        <div class="express-wrapper">        
            <div class="logis-wrapper">
                <div class="logis-detail flex">
                    <!-- <img src="https://img.1yyg.net/goodspic/pic-200-200/20170420135821387.jpg" alt=""> -->
                    <div class="flex-one gray6">
                        <p>快递单号：{{expressData.expressno}}</p>
                        <p>承运公司：{{expressData.expressname}}</p>
                    </div>
                </div>
                <div class="logis-step" v-if="isNonEmpty && expressData.steps.length > 0">
                    <ul class="logis-list tb1px">
                        <li v-for="item in expressData.steps" :key="item.expressid">					
                            <div class="step-text">
                                <i class="circle"></i>
                                <span v-html="item.content">{{item.content}}</span>
                            </div>
                            <p class="step-time grayb">{{item.starttime}}</p>					
                        </li>
                    </ul>		
                </div>
                <div class="mjd-tel">客服热线：400-8988-111</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { Order } from '@/apis/';
    import { mapState } from 'vuex';
    import Toast from '@/components/common/toast';
    import Indicator from '@/components/common/indicator';
    
    export default {
        data(){
            return {
                checkedIndex : 0,
                expressData : {
                    steps : []
                },
                isNonEmpty : true,
                shipmentId : '',
                expressNo : '',
                pageInited : false
            }
        },
        computed:{
            ...mapState([ 'orderExpItems' ])
        },
        methods:{
            //获取物流信息
            getExpress(index){                              
                if(!this.setReqInfo(index)){     //如果 没有数据                 
                    return;
                }
                this.reqStart();
                Order.getExpress(this.shipmentId, this.expressNo).then((res) => {
                    this.reqEnd();
                    this.pageInited = true;
                    if(res.code == this.$ERR.NORMAL){  
                        //res = {"data":{"state":"3","steps":[{"starttime":"2018-08-31 19:37:12","content":"【深圳市】 快件已在 【罗湖笋岗】 签收,签收人: 已签收, 感谢使用中通快递,期待再次为您服务!"},{"starttime":"2018-08-31 15:08:09","content":"【深圳市】 【罗湖笋岗】 的魏程峰（13590370454） 正在第1次派件, 请保持电话畅通,并耐心等待"},{"starttime":"2018-08-31 14:07:22","content":"【深圳市】 快件到达 【罗湖笋岗】"},{"starttime":"2018-08-31 12:01:20","content":"【深圳市】 快件离开 【深圳中心】 发往 【罗湖笋岗】"},{"starttime":"2018-08-31 10:10:44","content":"【深圳市】 快件到达 【深圳中心】"},{"starttime":"2018-08-31 05:32:27","content":"【广州市】 快件离开 【广州中心】 发往 【深圳中心】"},{"starttime":"2018-08-31 05:28:06","content":"【广州市】 快件到达 【广州中心】"},{"starttime":"2018-08-30 12:00:34","content":"【金华市】 快件离开 【金华中转部】 发往 【中山中心】"},{"starttime":"2018-08-29 22:52:01","content":"【金华市】 快件到达 【金华中转部】"},{"starttime":"2018-08-29 17:58:14","content":"【金华市】 快件离开 【浦江黄宅】 发往 【金华中转部】"},{"starttime":"2018-08-29 14:37:53","context":"【金华市】 【浦江黄宅】（0579-84257119） 的 落尘 （13777505272） 已揽收"}],"expressname":"中通","servicetel":""},"IsSuccess":true,"message":"","code":1}                      
                        this.isNonEmpty = true;
                        this.expressData = res.data;
                       
                        //手机号可拨打状态

                        
						let myreg=/([1][3,4,5,7,8][0-9]{9})/g;
						let c = res.data.steps;
						for(let i=0;i<c.length;i++){
							 let m = []
							 let e = c[i].content.match(myreg)
							 if(e){
							 	for(let j=0;j<e.length;j++){
							 		m = e[j]
							 	}
							 }
							c[i].content = c[i].content.replace(myreg,'<a style="color:#ff8932" href="tel:'+m+'">'+m+'</a>')
						}

                        if(res.data.steps.length === 0){
                            Toast('暂无物流信息');
                        }
                    } else {
                        this.isNonEmpty = false;
                        //Toast(res.message);                  
                        Toast('暂无物流信息');
                    }                    
                }).catch((err) => {
                    this.reqEnd();
                    console.log(err)
                })
            },
            //tab切换
            setReqInfo(index){                
                let params = this.orderExpItems[index];
                this.checkedIndex = index;                
                if(params){                    
                    this.shipmentId = params.shipmentid;
                    this.expressNo = params.expressno;   
                    return true;
                }                  
                return false;
            },
            reqStart(text){
				text = text || '加载中...';
				Indicator.show(text);
			},
			reqEnd(){
				Indicator.close();
            },
            init(){                
                this.getExpress(0);
            }
        },
        watch : {
            orderExpItems(newVal, oldVal){    //如果是从订单详情页面进入，不会触发watch。
                !this.pageInited && this.init();
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
    .express-detail{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    .express-wrapper{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: auto;
        background-color: #f5f5f5;
        z-index: 2;
        -webkit-overflow-scrolling: touch;
    }
    .order-menu{
        position: fixed;
        width: 100%;
        height: 0.78rem;
        top: 0.84rem;
        left: 0;
        padding: 0 0.3rem;
        line-height: 0.78rem;
        font-size: 0.3rem;	
        background-color: #fff;
        box-sizing: border-box;
        z-index: 3;

        + .express-wrapper{
            top: 0.88rem;
        }

        &:first-child{
            top: 0;
        }
        li{
            min-width: 1.05rem;
            height: 0.78rem;
            border-bottom: 2px solid transparent;
            text-align: center;
            white-space: nowrap;
            box-sizing: border-box;

            &.active{
                color: #ff681d;
                border-bottom-color: #f66b26;
            }
        }
    }  
    
    .logis-menu-wrapper{
        width: 100%;
        height: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        .logis-menu{
            width: 100rem;

            li{
                float: left;
                margin-right: 0.6rem;

                &:last-child{
                    margin-right: 0;
                }
            }
        }
    }    
    
    /*物流详情*/
    .logis-wrapper{
        .logis-detail{
            margin-top: 0.1rem;
            padding: 0.3rem;
            font-size: 0.26rem;
            background-color: #fff;

            &:first-child{
                margin-top: 0;
            }

            > img{
                width: 1.4rem;
                height: 1.4rem;
            }

            > div{
                // padding-left: 0.2rem;
                line-height: 0.44rem;
            }
        }
        .logis-step{
            position: relative;
            margin-top: 0.2rem;
            padding: 0.3rem;
            background-color: #fff;
            overflow: hidden;
        }
        .logis-list{
            position: relative;	
            margin-left: 0.15rem;
            padding-left: 0.43rem;
            border-left: 1px solid #dedede;

            li{	
                padding-bottom: 0.28rem;

                &:last-child{
                    padding-bottom: 0;
                }	

                &:first-child{
                    .step-text{
                        color: #ff8932;
                    }

                    .circle{
                        width: 12px;
                        height: 12px;
                        padding: 1px;	
                        margin-left: -9px;
                        background-color: #fff;
                        border: 1px solid #ff681d;	
                        box-shadow: 0 -14px #fff;                       

                        &::before{
                            content: '';
                            display: block;
                            width: 12px;
                            height: 12px;
                            background-color: #ff681d;
                            border-radius: 12px;	
                        }
                    }
                }
            }
            .step-text{
                position: relative;
                line-height: 0.4rem;
                font-size: 0.28rem;
                color: #666;	
            }
            .step-time{
                padding-top: 0.09rem;
                font-size: 0.24rem;
            }
            .circle{
                position: absolute;
                width: 11px;
                height: 11px;
                top: 50%;
                left: -0.43rem;                
                transform: translate(0, -50%);
                margin-left: -6px;
                background-color: #eee;
                border-radius: 100%;	
                z-index: 2;
            }
        }
    }
    .mjd-tel{
        padding: 0.3rem 0;
        font-size: 0.28rem;
        color: #808080;
        text-align: center;
    }
</style>