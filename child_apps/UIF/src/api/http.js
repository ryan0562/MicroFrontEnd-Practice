import axios from 'axios';
import store from '@/store';
import router from '@/router';


export default class http {
    post = params => {return axios.post(params.api, params.param,config); }
    get = params => { return axios.get(params.api, {params: params.param}); }
    delete = params => { return axios.delete(params.api, {params: params.param}); }
    put = params => { return axios.put(params.api, {params: params.param}); }
};
