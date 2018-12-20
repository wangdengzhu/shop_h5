import { fetch, post } from '@/utils/fetch';

class Bullet{
	constructor(basePath){
		this.basePath = basePath;
	}

	detail(spuid){
		return fetch(this.basePath + 'detail', { spuid });
	}

	index(){
		return fetch(this.basePath + 'index');
	}
}

export default new Bullet('/message/m/');