<div align="center">
  <br>
  <h1>SipCall</h1>
  <p>
    SipCall 是数字应急研发部解决系统中通话功能而提供的一套解决方案。
  <p>
  <br>
</div>

## 介绍

### 版本

- 最新版本：v 1.1.6
- 最后更新日期：2021-03-01

### 更新日志

- ✅ v1.1.6 UIF注册SIP时传单位ID
- ✅ v1.1.5 客户端更新会更改原对象BUG
- ✅ v1.1.4 拨号盘支持小键盘输入
- ✅ v1.1.3 修复通话挂断功能BUG
- ✅ v1.1.2 更新通话中来电列表消失问题
- ✅ v1.1.1 增加拨号盘拨打前先查询电话信息
- ✅ v1.1.0 模块化整个电话功能，并完善注释和文档

### 目录结构
```cmd
├─package             // 不对外暴露
│    ├─api            // 接口
│    ├─img            // 图片
│    ├─router         // 路由
│    ├─store          // Vuex
│    ├─util           // 工具类
│    └─widget         // 公共组件
├─index.js            // 对外暴露JS     
├─README.md           // 说明文档
├─SipCallClient.js    // 客户端
└─SipCall.vue         // 对外暴露Vue文件
```
## UIF 端
`UIF` 端需要加载 `VUEX` 和 `SipCall.vue` 文件。
### Vuex

在 `UIF` 项目里的 `store` 文件夹下的 `index.js` 文件下挂载 `SipCallStroe`：
```js
import { SipCallStore } from '@/components/SipCall'

// 其他代码略...
export default new Vuex.Store({
  // 其他代码略...
  modules: {
    SipCallStore,    // 名称必须为 SipCallStore
  }
})
```

### SipCall.vue 文件

`SipCall.vue` 文件包含了通话列表、应答弹框和右下角的 `WebSocket` 连接状态按钮并在加载的时候默认创建通道连接。

在 `UIF` 项目里的 `home.vue` 文件里：
```js
<template>
  <div id="container">
    <!-- 如果项目启用了通话功能 -->
    <SipCall v-if="isShowSipCall"/>
  </div>
</template>
<script>
// 其他代码略...
import SipCall from '@/components/SipCall/SipCall'

export default {
  components:{
    SipCall,
  },
  data () {
    return {
      isShowSipCall: window.MTI.phoneModule,
    }
  },
  // 其他代码略...
  methods:{
    ...mapMutations(['CALL']),
    checkLogin(value){
      // 注册消息监听
      this.messenger.listen(msg => {
        // 其他代码略... 👇👇👇 第 308 行添加 👇👇👇
        /** 启用电话功能时接收信使传过来的 SipCall */
        if(window.MTI.phoneModule && _msg.type == 'SipCall'){
          this.CALL(_msg.data)
        }
      })
    }
  }
}
```

### Dial.vue 文件

`Dial.vue` 文件是拨号盘功能，需要用到的话可以作为组件引入到页面，使用方法一样，就不详细介绍了。

## 客户端

一、把 `SipCallClient.js` 文件复制到子系统和 `mti-messenger.js（UIF的SDK）` 同目录下。

二、然后在子系统的 `main.js` 里面加载下：
```js
import sip from '@/util/SipCallClient'
Vue.prototype.$sip = sip
```

三、最后在需要打电话的地方调用下 `call` 方法就可以，比如在通讯录 ``
```js
this.$sip.call([item], 'mobile')
// 第一个参数 item 是人员对象的数组
// 第二个参数是电话的字段，可能是 mobile、phone、number 等，按照你的业务来
```
## 成员信息

| Author   | Email                |
| -------- |:---------------------|
| 高金斌    | [gaojb@mti-sh.cn][1] |

[1]:mailto:gaojb@mti-sh.cn
