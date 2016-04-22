# awesome-reverse-proxy
基于node的反向代理服务器;支持HTTPS/HTTP/WebSocket


## Feature

* 基于[http-proxy](https://www.npmjs.com/package/http-proxy)
* 支持负载均衡策略的配置（负载策略基于[awesome-balancer](https://github.com/cuiyongjian/awesome-balancer)）
* 若启动DynamicWeightedEngine负载均衡则需提前在子节点启动探针。探针使用方法请参考[DynamicWeightedEngine](https://github.com/cuiyongjian/awesome-balancer#dynamicweightedengine)。

## Require

* Nodejs 5.x
* g++ >= 4.8.x

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

建议静态文件统一转发到文件处理服务器或CDN，以免给后端applicaton服务带来混淆和额外压力。

## 配置文件说明
