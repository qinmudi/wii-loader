# wiiloader
[![release](https://img.shields.io/badge/release-v1.0.1-orange.svg)](https://github.com/qinmudi/wii-loader)

平台组前端js模块加载器

## 特点
- 支持队列按顺序加载
- 支持单个文件加载
- 支持批量加载

## 安装
```
npm i wiiloader --save
```

## 使用
```javascript
import WiiLoader from 'wiiloader'

WiiLoader.load(resources,callback)

WiiLoader.loadOne(resources,callback)

WiiLoader.loadMany(resources,callback)
```

## 字段说明
字段 | 说明
---- | ---
resources | 静态资源数组
callback |  回调函数

### 按队列顺序加载，文件一个一个下载
```javascript
const {css,js} = resources;
const files = css.concat(js).filter(((val) => {
    return val !== undefined;
}));
WiiLoader.load(files, (err, data) => {
    if(!err){
        callback?callback.call(this):''
    }
})
```

### 批量加载demo，文件批量下载
```javascript
const {css,js} = resources;
const files = css.concat(js).filter(((val) => {
    return val !== undefined;
}));
let index = 0;
WiiLoader.loadMany(files, (err, data) => {
    if(index<files.length-1){
        index++
    }else{
        callback ? callback.call(this) : '';
    }
})
```

## 待优化
- 批量加载需要自己实现计时器