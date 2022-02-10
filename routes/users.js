const router = require('koa-router')()

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  console.log(ctx);
  ctx.body = {a:1,b:2}
})

module.exports = router
