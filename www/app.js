const Koa = require('koa');
const Pug = require('koa-pug');
const app = new Koa();
const serve = require('koa-static');
const router = require('koa-router')();
const convert = require('koa-convert');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const debug = require('debug');
const error = debug('app:error');
const moment = require('moment');
const nconf = require('nconf');
const config = require('./config');
const loggerhelper = require('./middleware/loggerhelper');


// routes
var index = require('./routes/index');
var news = require('./routes/news');
var newslist = require('./routes/newslist');

// middlewares
app.use(serve('.'));
app.use(convert(bodyparser()));
app.use(convert(json()));
app.use(convert(logger()));

var env = nconf.get('NODE_ENV');

new Pug({
  app: app,
  basedir: __dirname + '/views/layouts',
  viewPath: __dirname + '/views',
  locals: {
    config: config,
    moment: moment
  },
  noCache: env === 'development' ? true : false
});

// 404
app.use(async (ctx, next) => {
  await next();
  if (ctx.response.status == 404) {
    await ctx.render('404');
    ctx.status = 404;
  }
});

// router
router.use('/', index.routes(), index.allowedMethods());
router.use('/news', news.routes(), news.allowedMethods());
router.use('/newslist', newslist.routes(), newslist.allowedMethods());
app.use(router.routes(), router.allowedMethods());

// response
app.on('error', function (err, ctx) {
  console.log(err);
  loggerhelper.debug(err);
  error(err);
});

module.exports = app;