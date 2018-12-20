<template>
    <div class="order-addr-wrapper">
        <ul class="addr-list" v-if="addrList.length>0">
            <li class="addr-list__item tb1px" :class="{'addr-list__item--selected':(addr.address_id == isSelectedAddrId)}" v-for="(addr,idx) in addrList" @click="addrSwitch(addr,idx)">
                <div class="item-selected-icon"></div>
                <div class="item-info tb1px">
                    <div class="item-info__person">
                        <span class="person-name">{{addr.contact_name}}</span>
                        <span class="person-tel">{{addr.mobile}}</span>
                        <span v-if="addr.default_flag==1" class="addr-lbl default tb1px">默认</span>
                        <span v-if="addr.label_name" class="addr-lbl tb1px">{{ addr.label_name }}</span>
                    </div>
                    <div class="item-info__addr">
                        <span class="addr-txt">{{getAddrTxt(addr)}}</span>
                        <i class="addr-icon" @click.stop="navToEditPage(addr)"></i>
                    </div>
                </div>
            </li>
        </ul>

        <div class="empty-wrapper" v-else>
            <div class="empty-icon empty-icon-addr">未有收货地址哦</div>
        </div>
        <div class="mine-new-addr orange-btn" @click="navToNewAddr">使用新地址</div>
        <transition name="slide">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import { mapState,mapMutations } from 'vuex';
    import { Addr } from '@/apis';
    import Toast from '@/components/common/toast';
    export default {
        data(){
            return {
               referrer:'',
               fromQuery:{},
               isSelectedAddrId:-1
            }
        },
        methods:{
            ...mapMutations(['ADDRIDX_CHANGE']),
            getAddrTxt(addr){
                return addr.areaAName + addr.areaBName + addr.areaCName + addr.areaDName + addr.address_detail;
            },
            addrSwitch(addr,idx){
                this.ADDRIDX_CHANGE(idx);
                if(!this.referrer){
                    this.$router.push({
                        path:'/order',
                        query:{
                            shopId:this.shopId,
                            aid: addr.address_id
                        }
                    });
                   // this.$router.go(-1);
                }else{
                    this.fromQuery.aid = addr.address_id;
                    this.$router.push({
                        path: this.referrer,
                        query: this.fromQuery
                    });
                }
              
            },
            navToEditPage(addr){
                this.$router.push({
                    path:this.$route.path+'/edit',
                    query:Object.assign({},this.$route.query,{eidx:addr.address_id})
                })
            },
            navToNewAddr(){
                if(this.addrList.length>=5){
                    Toast({
                        toastTxt:'收货地址最多有5个',
                        iconCls: 'info'
                    });
                    return;
                }
                this.$router.push({
                    path:this.$route.path+'/new',
                    query:Object.assign({},this.$route.query)
                })
            }
        },
        computed:{
            ...mapState(['addrList','shopId'])
        },
        beforeRouteEnter (to, from, next){
            next(vm => {
                if (from.query.aid) {
                    vm.referrer = from.path;
                    vm.fromQuery = from.query;
                }
            });
        },
        filters:{
            hideTelNum(tel){
                return tel.replace(/(\d{3})(\d{4})(\d{3})/,'$1****$3');
            }
        },
        mounted(){
            this.isSelectedAddrId = ~~this.$route.query.aid;
        }
    }
</script>

<style  scoped>
    @import '../../../assets/styles/mixins';
    .order-addr-wrapper{
        position: fixed;
        right: 0;
        bottom: 0;
        top: 0;
        left: 0;
        background-color: #f5f5f5;
        z-index: 20;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .addr-list{
        background-color: #fff;
    }

    .addr-list__item{
        display: flex;
        align-items: center;
        padding: 0.24rem 0.32rem;
        font-size: 0.3rem;
        border-bottom: 1px solid #e5e5e5;

        .item-selected-icon{
            display: none;
            width:20px;
            height: 20px;
            margin-right: 0.16rem;
            background: url(../../../assets/images/icon-selected.png) no-repeat center;
            background-size: 20px 20px;
        }

        .item-info{
            flex: 1;
            overflow: hidden;
            margin-left: 0.56rem;
        }

        &.addr-list__item--selected .item-info{
            margin-left: 0;
        }

        &.addr-list__item--selected .item-selected-icon{
            display: block;
        }

        .item-info__person{
            display: flex;
            
            .person-tel{
                margin: 0 0.36rem 0 0.24rem;
            }

            .person-name{
                max-width: 4em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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

        .item-info__addr{
            position: relative;
            margin-top: 0.2rem;
            font-size: 0.24rem;

            .addr-txt{
                display: block;
                width: 90%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .addr-icon{
                position: absolute;
                right: 0;
                bottom: 0;
                width: 0.4rem;
                height: 0.4rem;
                background: url(../../../assets/images/icon-edit.png) no-repeat center;
                background-size: 0.4rem 0.4rem;
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
        font-size: $fs-32;
    }
    .empty-wrapper{
        padding-top: 2.2rem;
    }
    .slide-enter-active,.slide-leave-active{
        transition: all .3s ease-in-out;
    }
    .slide-enter,.slide-leave-to{
        transform: translate3d(100%,0,0);
    }
</style>
