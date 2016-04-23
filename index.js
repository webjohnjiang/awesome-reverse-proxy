var http = require('http')
var httpProxy = require('http-proxy');
var config = require('./config');
var awesomeBalancer = require('awesome-balancer');
var debug = require('debug')('reverseProxy');
var url = require('url');



// ************************************** //
// ********* 本模块主逻辑开始 ************** //
// ************************************** //


// 初始化反向代理核心模块
var http = require('http'),
    httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});


// 在转发请求之前，添加自定义消息头
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  var remoteIp = req.socket.remoteAddress;
  var xf = req.headers['x-forwarded-for'];
  xf = xf ? xf + ', ' + remoteIp : remoteIp;
  proxyReq.setHeader('X-Forwarded-For',  xf); // 这是http.ClientRequest对象的方法。
  proxyReq.setHeader('X-AwesomeReverse-Proxy', 'true');
});


// 解析反向代理规则，主要将规则中的to转换成利于http服务器调用的函数。
//（因为负载均衡规则的rule.to需要提前创建好对应的负载均衡引擎）
var rules = config.rules;
rules = parseRules(rules);
debug(rules);

// 创建并启动一个http服务器，用于提供反向代理服务。
// 在自己的server中使用`proxy.web()` 转发web请求
// 用`proxy.ws()` 转发websocket请求
var server = http.createServer(function(req, res) {
  // 按照用户配置的rules依次 匹配规则。以最先匹配到的为准进行转发。
  for (var i = 0, len = rules.length; i < len; i++) {
    if (rules[i].from === req.url || rules[i].from === '*') {
        var currentProxyTo = rules[i].to();
        debug('请求来源： ' req.url + ';  本次转发方向：' + currentProxyTo);
        // req.headers.host = url.parse(currentProxyTo).hostname; // 反向代理就应该把用户原始host转发给后端服务器，这里只是临时测试我的博客，因为我博客nginx只认绑定了的域名
        // debug(req.headers.host);
        proxy.web(req, res, {target: currentProxyTo});
        return;
    }
  }
  // 未匹配到的返回404.
  res.end('404');
});

server.listen(8080, function () {
    console.log("代理服务器已启动，正在监听 " + server.address().port + '端口。');
});

// ************************************** //
// ********* 本模块主逻辑结束 ************** //
// ************************************** //







// ************************************** //
// ********* 下面是一些辅助函数，理解主逻辑的话请不要往下看了 ************** //
// ************************************** //
function parseRules(rules) {
    // 数组去重【去掉from相同的规则，因为这不符合逻辑，同一种from理应出现一次】
    var newRules = rules;
    rules = [];
    var tmp = {}; // 用这个map来表示元素有没有出现过。
    for (var i = 0, len=newRules.length; i < len; i++) {
        if (!tmp[newRules[i].from]) {
            tmp[newRules[i].from] = true;
            rules.push(newRules[i]);
        }
    }
    debug('去重后的rules： ', rules);
    var engines = {}; // 用于记录是否已经有规则用过同一个upstream，
    // 本项目认为代理规则中所有使用相同upstream的规则，都应该共享同一个upstream的负载均衡引擎
    for (var i = 0, len = rules.length; i < len; i++) {
        var originTo = rules[i].to;
        if (originTo.split(':')[0] === 'upstream') {
            var upstreamName = originTo.split(':')[1];
            // 负载均衡的to
            if (!engines[upstreamName]) {
                engines[upstreamName] = createEngine(upstreamName);
            }
            rules[i].to = (function (e) {
                return function () {
                    return e.pick();
                }
            })(engines[upstreamName]);
        }
        else {
            // 普通转发to
            rules[i].to = (function (o) {
                return function () {
                    return o;
                }
            })(originTo);
        }
    }
    debug('修改转发to之后的rules： ', rules);
    return rules;
};

function createEngine(upstreamName) {
    debug('我在创建该upstream的引擎: ' + upstreamName);
    var upstreams = config.upstreams;
    var curUpsteam = null;
    for (var i = 0, len = upstreams.length; i < len; i++) {
        if (upstreams[i].name === upstreamName) {
            curUpsteam = upstreams[i];
            break;
        }
    }
    if (!curUpsteam) {
        throw Error('配置文件有误，叫做：' + upstreamName + ' 的upstream找不到');
    }
    var engineIndex = curUpsteam.engine;
    var engines = config.engines;
    var engineName = engines.filter(function (item) {
        return item.index === engineIndex;
    })[0].engine; // 负载均衡引擎名称
    debug('该upstream使用的负载均衡引擎叫做： ' + engineName);
    var EngineClass = awesomeBalancer[engineName];
    if (!EngineClass) {
        throw new Error('配置文件有误，叫做： ' + engineName + ' 的负载均衡引擎 配置不正确。');
    }
    var pool = curUpsteam.hosts;
    debug('待创建负载均衡引擎的池子： ', pool);
    var engine = new EngineClass(pool);
    return engine;
};
