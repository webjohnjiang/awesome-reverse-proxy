# awesome-reverse-proxy
基于node的反向代理服务器


## Feature

* 支持HTTPS/HTTP/WebSocket
* 支持负载均衡策略的json配置（负载策略基于[awesome-balancer](https://github.com/cuiyongjian/awesome-balancer)）
* 若启动DynamicWeightedEngine[实时资源动态负载均衡]则需提前在子节点启动探针。探针使用方法请参考[DynamicWeightedEngine](https://github.com/cuiyongjian/awesome-balancer#dynamicweightedengine)。
* 支持404配置[开发中...]
* 支持通配符或正则表达式进行代理规则配置[开发中...]。

## Require

* Nodejs 5.x
* gcc-c++ >= 4.8.x

## Usage
下载awesome-reverse-proxy到本地
```
    git clone https://github.com/cuiyongjian/awesome-reverse-proxy
    cd awesome-reverse-proxy
    npm install
```
然后，根据需要设置config.json配置文件。最后启动代理服务器：
```
    npm run proxy
```

建议配置一个规则将静态文件统一转发到文件处理服务器或CDN，以免给后端applicaton服务带来混淆和额外的压力。


## Config.json

配置文件说明
``` javascript
{
    "rules": [ // 转发规则
        {
        "from": "/favicon.ico", // 用户请求(访问)代理的路径
        "to": "http://192.168.1.203:8001" // 转发到的目标地址
      },
        {
            "from": "*", // 用户请求代理的路径，*表示任意路径。
            "to": "upstream:cuiyongjian"  // 负载均衡配置。也就是说来自任何路径的请求，都转发到cuiyongjian这个upstream。upstream在下面的节点单独进行配置。
        }
    ],
    "engines": [ // 这个是目前本代理支持的负载均衡类型。禁止改动本节点[改序号没关系]！！！！
        {
            "index": "0",
            "engine": "DynamicWeightedEngine"
        },
        {
            "index": "1",
            "engine": "BusinessDivisionEngine"
        },
        {
            "index": "2",
            "engine": "RandomEngine"
        },
        {
            "index": "3",
            "engine": "RoundRobinEngine"
        },
        {
            "index": "4",
            "engine": "WeightedRoundRobinEngine"
        }
    ],
    "upstreams": [ // 负载均衡组的配置。每个{}括号内表示一组负载均衡器的配置。比如下面这个cuiyongjian配置就对应了上文中某个转发规则。
        {
            "name": "cuiyongjian", // 单个upstream的名字。与rules规则里的配置对应起来。
            "engine": "0", // 当前upstream采用的负载均衡策略。与上面的engines索引一一对应。
            "typeEngine": "3", // 当您使用[BusinessDivision]负载均衡引擎的时候，请配置该节点，这个节点表示您希望每种业务类型分别采用什么负载均衡策略。
            "hosts": [ // 这个就是您集群的节点列表了
                 {
                   "object": "http://192.168.1.203:8001", // 单个节点的访问地址，也就是代理转发的目标地址。
                   "weight": "1"  // 这是这个节点的权重[WeightedRoundRobin和DynamicWeighted策略需要配置]。
                 },
                 {
                   "object": "http://192.168.1.204:8001", // 同上
                   "weight": "1" // 同上。注意：RoundRobin引擎是不需要weight属性的，而且单个节点请配置成字符串，而不是用{}花括号包裹。
                 },
                 {
                   "object": "http://192.168.1.205:8001",
                   "weight": "1"
                 },
                 {
                   "object": "http://192.168.1.206:8001",
                   "weight": "1"
                 },
                 {
                   "object": "http://192.168.1.207:8001",
                   "weight": "1"
                 },
                 {
                   "object": "http://192.168.1.208:8001",
                   "weight": "1"
                 },
                 {
                   "object": "http://192.168.1.211:8001",
                   "weight": "1"
                 }
           ]
        }
    ]
}

```
配置文件位于项目根目录下的config.json.

rules节点中的规则按照从上往下匹配，一旦匹配成功，则后面的不会再匹配。


## misc

* 基于[awesome-balance](https://github.com/cuiyongjian/awesome-balancer)引擎实现负载均衡。
* [动态权重的负载均衡] 得益于[resource-meter](https://github.com/cuiyongjian/resource-meter)模块对集群实时性能的评价。
* 基于[http-proxy](https://www.npmjs.com/package/http-proxy)请求转发。

## license
This software is free to use under the [MIT](http://opensource.org/licenses/MIT)  license. See the [LICENSE file][] for license text and copyright information.
[LICENSE file]: https://github.com/cuiyongjian/awesome-balancer/blob/master/LICENSE

Copyright © 2016 [cuiyongjian](http://blog.cuiyongjian.com) <cuiyongjian@outlook.com>
