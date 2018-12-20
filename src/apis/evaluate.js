import { fetch,post } from '@/utils/fetch';

const commentPrefix = '/comment/m/';

const sourceURLs = {
    GETPENDINGCOMMENT: commentPrefix + 'precomment',
    GETCOMMENTED: commentPrefix + 'commented',
    COMMITCOMMENT: commentPrefix + 'add',    
    UPLOADCOMMENTPIC: commentPrefix + 'addpic',    
};

const getPendingComment = (data) => post(sourceURLs.GETPENDINGCOMMENT, data);

const getCommented = (data) => post(sourceURLs.GETCOMMENTED, data);

const commitComment = (data) => post(sourceURLs.COMMITCOMMENT, data);

const uploadCommentPic = (data) => post(sourceURLs.UPLOADCOMMENTPIC, data);


export default {
    getPendingComment,
    getCommented,
    commitComment,
    uploadCommentPic,
};