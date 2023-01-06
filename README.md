# file-encrypt
> 文件加密解密：文件明文不会出现在磁盘中。

## Project setup
```bash
yarn install
```

### Compiles and hot-reloads for development
```bash
yarn serve
```

### Compiles and minifies for production
```bash
yarn build
```

### Run your unit tests
```bash
yarn test:unit
```

### Lints and fixes files
```bash
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 引言
我们可能会希望某些文件仅在查看时才解密，而明文数据总是不出现在硬盘中，类似于加壳的可执行文件。为了实现这一点，我能想到的技术栈有：前端、pyqt5（python）、qt（cpp）。我最熟悉前端技术栈，而且后两者的工作量看上去太大了，所以这个demo选择用前端技术栈实现。为了尽快出成果，我又选用了最熟悉的`Vue2 + element-plus（因为安装的是Vue3）`，后续可考虑用`Vue3 script setup`重构。

下面仅简单讲述实现上的注意点，其余细节佬们可查看代码，[GitHub传送门](https://github.com/Hans774882968/file-encrypt)。

样式等方面都没有经过设计，让佬们见笑了～

## 安装file-type
安装这个也太难受了……首先`yarn add file-type`，然后`import { fileTypeFromBuffer } from 'file-type';`，不出意外你会得到错误：

```
Syntax Error: Reading from "node:buffer" is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "node:" URIs.

Syntax Error: Reading from "node:stream" is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "node:" URIs.
```

经过漫长的探索，发现并不需要把项目改造成ESM，也就是不需要在`package.json`中加`type: "module"`。只需在运行时把`import {Readable as ReadableStream} from 'node:stream'`的`node:stream`重写为`stream`。怎么做到这件事呢？用webpack插件`NormalModuleReplacementPlugin`，它在`vue.config.js`的配置写法如下：

```js
{
  // ...
  configureWebpack: {
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
    ],
    resolve: {
      fallback: { stream: require.resolve('stream-browserify') },
    },
  },
  // ...
}
```

如果不加`resolve.fallback`，则你还会见到下一个错误：不认识`stream`。这是因为我们用的webpack版本是最新的`5.75.0`，而这个版本已经不提供node核心包的polyfill。因此我们需要自己添加`stream`的polyfill。

1. 如上所述，加`resolve.fallback`。
2. `yarn add stream-browserify`。

接下来不出意外就能正常运行了。

## Jest不支持导入`file-type`（未完美解决）
版本：`"file-type": "^18.0.0",`

一开始是（以`strtok3`为例）：

```
({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import { ReadStreamTokenizer } from './ReadStreamTokenizer.js';
SyntaxError: Cannot use import statement outside a module
```

后来`jest`配置了
```js
transformIgnorePatterns: [],
```

错误就变成了

```
Cannot find module 'strtok3/core' from 'node_modules/file-type/core.js'
```

可参考的链接：https://stackoverflow.com/questions/70325365/importing-pure-esm-module-in-ts-project-fails-jest-test-with-import-error

根据上述链接，把`node_modules/file-type/core.js`的`import * as strtok3 from 'strtok3/core';`改成`import * as strtok3 from 'strtok3/lib/core';`，发现确实能解决问题。但这个解法不太好。是否给这个库发一个MR比较好？

接下来`yarn build`，发现会报错：

```
Module not found: Error: Package path ./lib/core is not exported from package ./node_modules/strtok3 (see exports field in ./node_modules/strtok3/package.json)
```

这是因为我们刚刚改了import方式。我们需要进一步地修改`./node_modules/strtok3/package.json`的`exports`属性，加一行：

```json
exports: {
  // ...
  "./core": "./lib/core.js", // 已有
  "./lib/core": "./lib/core.js"
}
```

接下来再次`yarn build`即可。

总结上面的操作：
1. jest`transformIgnorePatterns: [],`
2. `node_modules/file-type/core.js`的`import * as strtok3 from 'strtok3/core';`改成`import * as strtok3 from 'strtok3/lib/core';`
3. node_modules，strtok3添加`"./lib/core": "./lib/core.js"`

## TODO
1. 添加`webpack-obfuscator`。
2. 支持flv播放。
3. 支持加密方法的选择。但是因为设计文件格式时没有预留位置，只能放弃了。