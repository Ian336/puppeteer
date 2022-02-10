const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const schedule = require('node-schedule');
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});


//爬虫列表
const pt = require('puppeteer');
const fs = require('fs');
const axios = require('axios');

async function puppeteer (){
  const bs = await pt.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 800 },
});
const pageLogin = await bs.newPage();
await pageLogin.goto('http://zentao.zehui.local');

const html = await pageLogin.content();
fs.writeFileSync('bug.html', html);
await pageLogin.waitForSelector('#account');
await pageLogin.type('#account', 'xuzhiqiang', { delay: 50 });
await pageLogin.type("[type='password']", 'Abc123', { delay: 50 });
await pageLogin.waitFor(1000);
await pageLogin.click('#submit');
const pageHome = await bs.newPage();
await pageHome.goto('http://zentao.zehui.local/my');
const homeResult = await pageHome.evaluate(() => {
    var text = document
        .getElementById('appIframe-my')
        .contentWindow.document.querySelectorAll('.col.tile .tile-amount');
    console.log(Array.from(text).map((item) => item.innerText));

    return Array.from(text).map((item) => item.innerText);
});
const pageTask = await bs.newPage();


//任务列表
await pageTask.goto('http://zentao.zehui.local/my-work-task.html');
const taskResult = await pageTask.evaluate(() => {
    var text = document
        .getElementById('appIframe-my')
        .contentWindow.document.querySelectorAll('tbody .c-name a');
    return Array.from(text).map(({ innerHTML, href }) => ({
        innerHTML,
        href,
    }));
});
await new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 1000);
});
var taskInfo = taskResult
    .map(
        (item, index) =>
            `##### [ ${index + 1}.${item.innerHTML}](${item.href})\n `
    )
    .join('');
// bug列表
const pageBug=await bs.newPage()
  await pageBug.goto("http://zentao.zehui.local/my-work-bug.html")
  const bugResult = await pageBug.evaluate(() => {
    var text= document.getElementById("appIframe-my").contentWindow.document.querySelectorAll("tbody .text-left.nobr a")
    return Array.from(text).map(({innerHTML,href})=>({innerHTML,href})).filter((item,i)=>i%2===0)
  })

  var bugInfo = bugResult
  .map(
      (item, index) =>
          `##### [ ${index + 1}.${item.innerHTML}](${item.href})\n `
  )
  .join('');
  await new Promise((resolve,reject)=>{
    setTimeout(() => {
     resolve(1)
    }, 1000);
})

 await pageBug.screenshot({ path: './public/images/pic.png' });

await axios(
    'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=eb63ac7b-36d1-4bd2-a50b-2ee50c88f61e',
    {
        method: 'post',
        data: JSON.stringify({
            msgtype: 'markdown',
            markdown: {
                content: `# 禅道消息
      ###  [我的任务:${homeResult[0]}](http://zentao.zehui.local/my-work-task.html)
      ${taskInfo}
      ###  [我的BUG:${homeResult[1]}](http://zentao.zehui.local/my-work-bug.html) 
      ${bugInfo}     
      ###  我的Story:${homeResult[2]}`,
            },
        }),
    }
);
await axios("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=eb63ac7b-36d1-4bd2-a50b-2ee50c88f61e", {
  method: "post",
  data: JSON.stringify(
    {
      "msgtype": "news",
      "news": {
        "articles":[{
          "title":"bug列表",
          'url':"http://localhost:4000/images/pic.png",
          "picurl": "http://localhost:4000/images/pic.png",
        }]
      
       
      }
    }
  )
})

await pageLogin.close()
await pageHome.close()
await pageTask.close()
await bs.close()
}
puppeteer()
let job = schedule.scheduleJob('10 5 14 * * *', () => {
  puppeteer()
});

module.exports = app
