<template>
    <div class="openshop-wrapper">
		<div class="openshop-inner">
			<div class="openshop-img-wrapper">
				<div class="openshop-img-inner">
					<div class="swiper-container">
				    	<div class="swiper-wrapper">
						    <div class="swiper-slide"><img src="../../assets/images/openshop-new-1@2x.png" alt=""></div>
						    <div class="swiper-slide"><img src="../../assets/images/openshop-new-2@2x.png" alt=""></div>
						    <div class="swiper-slide"><img src="../../assets/images/openshop-new-3@2x.png" alt=""></div>
                            <!-- <div class="swiper-slide"></div>
						    <div class="swiper-slide"></div>
						    <div class="swiper-slide"></div> -->
					    </div>
					</div>
				</div>
			</div>
            <div class="openshop-bottom">
                <div class="openshop-btn">我要开店</div>
                <p>开店相关操作需安装满金店APP</p>
            </div>		
		</div>
	</div>
</template>

<script>
    function mySwiper(container, options){
        if(!container) return;

        options = options || {};
        var element = container.children[0];
        var itemLen = element.querySelectorAll('.swiper-slide').length;
        var itemWidth = container.offsetWidth;
        var showIcon = options.showIcon;    
        var speed = options.speed || 300;	
        var oldActiveIndex = 0;
        var isScrolling;  //页面是否正在滚动

        if(!!showIcon){
            createIconList();
            activeIcon()
        }

        var style = element.style,
            transform = 'transform' in style ? 'transform' : 'webkitTransform',
            transitionDuration = 'transitionDuration' in style ? 'transitionDuration' : 'webkitTransitionDuration';		

        var curItem = 0;   //当前显示的item

        var start = {},
            delta = {};

        function itemAdd(){
            curItem = Math.min(curItem + 1, itemLen - 1);
        }

        function itemMius(){
            curItem = Math.max(curItem - 1, 0);
        }

        function curMove(){
            return -curItem*itemWidth;
        }

        function createIconList(){
            var fragment = document.createDocumentFragment(),
                swiperItem = document.createElement('div'),
                tempNode;
            swiperItem.classList.add('swiper-item');
            fragment.appendChild(swiperItem);			
            for(var i = 0; i < itemLen; i++){
                tempNode = document.createElement('div');
                tempNode.classList.add('swiper-item-icon');
                swiperItem.appendChild(tempNode)
            }            
            container.appendChild(fragment);
        }

        function activeIcon(index){
            if(oldActiveIndex == index){
                return;
            }
            index = index == undefined ? 0 : index;
            var swiperItemIcon = container.querySelector('.swiper-item').children;				
            swiperItemIcon[oldActiveIndex].classList.remove('active');					
            swiperItemIcon[index].classList.add('active');				
            oldActiveIndex = index;				
        }

        var events = {

            handleEvent : function(e){
                switch(e.type){
                    case 'touchstart' : this.start(e); break;
                    case 'touchmove' : this.move(e); break;
                    case 'touchend' : this.end(e); break;
                }
            },

            start : function(e){
                var touches = e.touches[0];

                start = {
                    x : touches.pageX,
                    y : touches.pageY,

                    time : +new Date
                }

                delta = {};

                isScrolling = void 0;

                style[transitionDuration] = '';			

                container.addEventListener('touchmove', this, false);
                container.addEventListener('touchend', this, false);
            },

            move : function(e){                
                //判断多手指触摸，return 
                if(e.touches[0].length > 1) return;

                var touches = e.touches[0];

                delta = {
                    x : touches.pageX - start.x,
                    y : touches.pageY - start.y
                }

                //当页面滚动时，swipe就不滚动了,或者 当swipe滚动时，页面就不滚动了
                if(isScrolling === undefined){
                    isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
                }

                if (!isScrolling){
                    e.preventDefault();  //阻止页面滚动
                    
                    //如果第一个
                    //或者最后一个
                    if(curItem == 0 && delta.x > 0 || curItem == itemLen-1 && delta.x < 0){
                        //到边界阻止滑动
                        //delta.x = 0;

                        delta.x /= 3;
                    }

                    var moveX = delta.x + curMove();

                    style[transform] = 'translate3d(' + moveX + 'px, 0, 0)';
                }                
                				                
            },

            end : function(e){

                var duration = +new Date - start.time;

                var isValidSlide = duration < 260 
                                    && Math.abs(delta.x) < 80
                                    || Math.abs(delta.x) > itemWidth/3;

                //方向  
                //小于0 -- 手指左滑
                //大于0 -- 手指右滑
                //等于0 -- 说明未滑动，或者
                var direction = delta.x < 0; 

                if(isValidSlide && delta.x != 0){    
                    if(direction){
                        itemAdd();
                    } else {
                        itemMius();
                    }					
                } 
                
                //alert(transitionDuration)
                style[transform] = 'translate3d(' + curMove() + 'px, 0, 0)';
                style[transitionDuration] = speed + 'ms';

                !!showIcon && activeIcon(curItem);

                container.removeEventListener('touchmove', this, false);
                container.removeEventListener('touchend', this, false);
            }
        }

        container.addEventListener('touchstart', events, false);
    }

    export default {
        data(){
            return {

            }
        },
        computed: {

        },
        methods: {

        },
        created(){
            
        },
        mounted(){
            this.$nextTick( () => {
                new mySwiper(document.querySelector('.swiper-container'));
            })            
        }
    }
</script>

<style lang="postcss">
    .openshop-wrapper{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: #f5f5f5;
        overflow: auto;
		-webkit-overflow-scrolling: touch;
        z-index: 1000;
    }
    .openshop-inner{
        padding-top: 0.48rem;
        // display: flex;
        // width: 100%;
        // height: 100%;
        // padding: 0.6rem 0 0.82rem;
        // box-sizing: border-box;
        // flex-direction: column;
        // justify-content: space-between;		            
    }
    .openshop-img-wrapper{
        width: 100%;

        .swiper-container{
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 0.2rem;
            z-index: 1;
        }
        .swiper-wrapper{
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 1;
            display: flex;
            transition-property: transform;
        }
        .swiper-slide{
            position: relative;
            flex-shrink: 0;
            width: 100%;
            height: 100%;        
            overflow: hidden;
            transition-property: transform;       

            img{
                display: block;            
                width: 100%;
                height:100%;
            }
            &:first-child img{
                border-top-left-radius: 0.2rem;
                border-bottom-left-radius: 0.2rem;
            }
            &:last-child img{
                border-top-right-radius: 0.2rem;
                border-bottom-right-radius: 0.2rem;
            }
        }
    }
    .openshop-img-inner{
        width: 5.8rem;
        height: 8.4rem;
        margin: 0 auto;
    }
    .openshop-bottom{                
        margin: 0.9rem 0 0.6rem;
        text-align: center;

        .openshop-btn{
            width: 5.8rem;
            height: 0.9rem;  
            margin: 0 auto;     
            background-color: #ff681d;
            color: #fff;
            line-height: 0.92rem;			
            font-size: 0.36rem;	            		
            border-radius: 0.1rem;			
        }
        p{
            padding-top: 0.24rem;
            font-size: 0.28rem;  
            color: #808080;          
        }
    }    
    .swiper-item{
        position: absolute;
        width: 100%;
        height: 9px;
        left: 0;
        bottom: 0.4rem;
        text-align: center;
        z-index: 2;
    }
    .swiper-item .swiper-item-icon{
        display: inline-block;
        width: 9px;
        height: 9px;
        margin: 0 4px;
        background-color: #fff;
        border-radius: 9px;
    }
    .swiper-item .swiper-item-icon.active{
        background-color: #ff681d;
    }
</style>
