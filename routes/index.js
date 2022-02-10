const router = require('koa-router')();
const pt = require('puppeteer');
const md5 = require('md5');
const fs = require('fs');
const axios = require('axios');
router.get('/', async (ctx, next) => {   
    await ctx.render('index', {
        title: 'text!',
    });
});

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string';
});

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json',
    };
});

module.exports = router;
