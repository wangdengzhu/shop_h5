<template>
  <div id="app"> 
    <router-view></router-view>
  </div>
</template>

<script>
import localStore from '@/utils/store';
import * as types from '@/store/mutations-type';
import { getQueryParam } from '@/utils/common';
export default {
  name: 'app',
  data() {
    return {
      isShowLogin:!0
    }
  },
  methods: {
    initCart(){
      const cartList = localStore.get('cartList');
      if(!cartList){
        return;
      }
      this.$store.state.cartList = cartList;
    }
  },
  mounted(){
    const qs = getQueryParam(location.search);
    const shopId = qs('shopId');
   
    if (!shopId || !/^\d+$/.test(shopId)) {
      this.$router.push({
        path: '/404'
      });
      return;
    }

  },
  created() {
    this.initCart();
  }
}
</script>

<style>
  @import './assets/styles/common';
  @import './assets/font/iconfont';
</style>
