class Pinch{
	constructor(elem){
		this.$el = elem;
		this.init();
	}

	init(){
		this.$el.ontouchmove = function(e){
			e.preventDefault();
		}

		if(this.isIPhone()){
			this.initGestureEvts();
		}else{
			this.initTouchEvts();
		}
	}

	initGestureEvts(){
		const $target = this.$el;
		let originScale = 1;
		let scale = 0;
		
		$target.addEventListener('gesturestart',  (event) => {
			// document.querySelector('.preview__bg').innerHTML = 'Gesture started (rotation=' + event.rotation + ',scale='+event.scale + ')';
		},!1);

		$target.addEventListener('gestureend',  (event) => {
			if(scale < originScale){
				$target.style.transform = `scale3d(${originScale}, ${originScale}, 1)`;
			}
			// document.querySelector('.preview__bg').innerHTML = 'Gesture ended (rotation=' + event.rotation + ',scale='+event.scale + ')';
		},!1);

		$target.addEventListener('gesturechange',  (event) => {
			scale = event.scale;
			let curScale = scale >= 2 ? 2 : scale <= 0.5 ? 0.5 : scale;
			$target.style.transform = `scale3d(${curScale}, ${curScale}, 1)`;
			// document.querySelector('.preview__bg').innerHTML = 'Gesture changed (rotation=' + event.rotation + ',scale='+event.scale + ')';
		},!1);
	}

	initTouchEvts(){
		const $target = this.$el;
		let isTouching = !1;
		let startTouches = null;
		let originScale = 1;
		let scale = 0;
		
		$target.addEventListener('touchstart',  (event) => {
			if (event.touches.length < 2) {
				return;
			}
			this.isTouching = !0;
			startTouches = targetTouches(event.touches);
		},!1);

		$target.addEventListener('touchend',  (event) => {
			this.isTouching = !1;
			if(scale < originScale){
				$target.style.transform = `scale3d(${originScale}, ${originScale}, 1)`;
			}
		},!1);

		$target.addEventListener('touchmove',  (event) => {
			if (event.touches.length < 2) {
				return;
			}
			if(!this.isTouching){
				return;
			}
			scale = calculateScale(startTouches, targetTouches(event.touches));
			let curScale = scale >= 2 ? 2 : scale <= 0.5 ? 0.5 : scale;
			$target.style.transform = `scale3d(${curScale}, ${curScale}, 1)`;
			// document.querySelector('.preview__bg').innerHTML = 'Gesture changed (scale='+curScale + ')';
		},!1);

		function targetTouches(touches) {
			return Array.from(touches).map(function (touch) {
				return {
					x: touch.pageX,
					y: touch.pageY
				};
			});
		}
		
		function getDistance(a, b) {
			var x, y;
			x = a.x - b.x;
			y = a.y - b.y;
			return Math.sqrt(x * x + y * y);
		}
		
		function calculateScale(startTouches, endTouches) {
			var startDistance = getDistance(startTouches[0], startTouches[1]),
			endDistance = getDistance(endTouches[0], endTouches[1]);
			return endDistance / startDistance;
		}
	}

	isIPhone(){
		return window.navigator.userAgent.toLowerCase().indexOf('iphone') > -1;
	}
}

export default Pinch;