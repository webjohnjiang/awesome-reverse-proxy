# awesome-reverse-proxy
基于node的反向代理服务器;支持HTTPS/HTTP/WebSocket


## Feature

* 基于[http-proxy](https://www.npmjs.com/package/http-proxy)
* 支持负载均衡策略的配置（负载策略基于[awesome-balancer](https://github.com/cuiyongjian/awesome-balancer)）
* DynamicWeightedEngine需配合探针一起使用，使用方法请参考[DynamicWeightedEngine](https://github.com/cuiyongjian/awesome-balancer#dynamicweightedengine)。

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

## 配置文件说明




