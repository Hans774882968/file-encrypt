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

### TLDR
1. vue3 setup CRUD。
2. 在vue中配置webpack、webpack自定义插件的编写。
3. 用Babel分析JS代码的AST，达到修改JS代码的目的。
4. 懂得正向能让逆向更为顺利。相应地，前端可以考虑把这些可能有利于“社工”的漏洞补上。

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

如果不加`resolve.fallback`，则你还会见到下一个错误：不认识`stream`。这是因为我们用的webpack版本是最新的`5.75.0`，而这个版本（webpack5）已经不提供node核心包的polyfill。我们需要自己添加`stream`的polyfill。

报错信息形如：
```
Module not found: Error: Can't resolve 'os' in '/path-to/file-encrypt/node_modules/node-gyp-build'

BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.

If you want to include a polyfill, you need to:
        - add a fallback 'resolve.fallback: { "os": require.resolve("os-browserify/browser") }'
        - install 'os-browserify'
If you don't want to include a polyfill, you can use an empty module like this:
        resolve.fallback: { "os": false }
```

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

[参考链接1](https://stackoverflow.com/questions/70325365/importing-pure-esm-module-in-ts-project-fails-jest-test-with-import-error)

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

后续每次`yarn`重新安装依赖，都要把2和3重做一次，才能保证`yarn test:unit`、`yarn build`都正常。

## 实现代码预览
```bash
yarn add highlight.js --registry=https://registry.npm.taobao.org
```

`main.js`

```js
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
app.config.globalProperties.$hljs = hljs;
```

为`<pre><code class="code">`添加一个圆润的字体，提高颜值：
```css
.code {
  text-align: initial;
  font-family: Consolas, Monaco, monospace;
}
```

### 如何判定解密所得Uint8Array是否为一段文本
目前使用一个简单粗暴的方法：判定`Uint8Array`是否为utf-8格式。
```bash
yarn add utf-8-validate
```

我们希望把node的模块用于浏览器端，势必要踩不少坑。

首先需要引入polyfill：
```js
resolve: {
  fallback: {
    os: require.resolve('os-browserify'),
  },
},
```

```bash
yarn add os-browserify
```

接下来会遇到这个错误：
```
Module not found: Error: Can't resolve 'fs' in 'path-to/file-encrypt/node_modules/node-gyp-build'
```

根据[参考链接4](https://blog.csdn.net/ayong120/article/details/124665239)，可以尝试这个webpack配置：
```js
externals: {
  // eslint-disable-next-line global-require
  fs: require('fs'),
},
```

`vue inspect > output.js`可以预览添加的webpack配置：
```js
externals: {
  fs: {
    appendFile: function () { /* omitted long function */ },
    appendFileSync: function () { /* omitted long function */ },
    // ...
  }
}
```

现在看上去正常了。

## 混淆
`yarn build`后生成`dist/js/app.[hash].js`，发现可以比较容易地定位到加密和解密的关键方法。

加密：
```js
// getEncryptedU8Array
function V(e,t){const n=new Uint8Array(e),u=n.map(((e,n)=>e^t[n%t.length]));return new Uint8Array([...A,...E(t.length),...t,...u])}
// enc
function H(e,t=A,n=1){let u=t||A;"string"===typeof u&&(u=(new TextEncoder).encode(u));let r=e;for(let l=0;l<n;++l)r=V(r,u);return new Blob([r])}
```

解密：
```js
// getDecryptedU8Array
function q(e){const t=new Uint8Array(e),n=new DataView(e),u=n.getUint32(4,!0),r=8+u,l=t.slice(8,r),a=t.slice(r).map(((e,t)=>e^l[t%l.length]));return a}
// dec
function P(e,t=1){let n=e;for(let r=0;r<t;++r){if(!b(n))break;n=q(n).buffer}const u=new Uint8Array(n);return{decryptResultData:u,decryptResultBlob:new Blob([u])}}
```

假设我们不希望公开这个算法，我们就有必要提高代码的逆向门槛。这里选择大家都很熟悉的OB。

```bash
yarn add -D javascript-obfuscator webpack-obfuscator
```

这里下了目前（230108）的最新版`webpack-obfuscator3.5.1`，OB`4.0.0`。

参考链接2提供了OB配置项的注释，但他基于`webpack-obfuscator3.5.0`，OB`3.2.7`，我们以OB GitHub的readme为准。

一般不建议`chunk-vendors`加混淆，所以要配置一下`excludes`项。对比一下加`excludes`前：`165.34s`，加`excludes`后：`28.45s`（这里`webpack-obfuscator`版本是`3.5.0`，OB版本是`3.2.7`）。

`webpack-obfuscator`提供了loader和plugin两种用法，建议使用plugin（踩坑心得😢）。

但是逆它难度依旧不大……因为类名没有混淆，并且我们知道关键方法一定用到了`Uint8Array`、`Blob`等类，所以很快可以定位到关键代码。面对这个问题，我们在《将`className`替换为`window.className`》一节再写一个webpack插件来处理。

加密：
```js
// getEncryptedU8Array
function _0x46e04d(_0x33c622, _0x3e0e37) {
    const _0x51af52 = _0x2ff6bc
      , _0x46ca84 = {
        'UAruq': function(_0x5de94b, _0x5c3fa1) {
            return _0x5de94b(_0x5c3fa1);
        },
        'bvsan': function(_0x3717df, _0x2c6523) {
            const _0x5b35e7 = a0_0x34e8;
            return _0x4db174[_0x5b35e7(0x1fd)](_0x3717df, _0x2c6523);
        },
        'aSHkQ': _0x51af52(0x30f),
        'CHfza': _0x51af52(0x107),
        'MCAGg': _0x4db174[_0x51af52(0x1db)],
        'pbuWY': _0x4db174[_0x51af52(0x2a0)],
        'rHLyv': _0x4db174[_0x51af52(0x180)],
        'yZXwF': _0x4db174[_0x51af52(0x2c4)],
        'qEExE': _0x4db174[_0x51af52(0xa5)]
    };
    if (_0x4db174[_0x51af52(0x31f)] === _0x4db174[_0x51af52(0x31f)]) {
        const _0x167726 = new Uint8Array(_0x33c622)
          , _0x441408 = _0x167726[_0x51af52(0x251)]((_0x4a687c,_0x474e10)=>_0x4a687c ^ _0x3e0e37[_0x474e10 % _0x3e0e37[_0x51af52(0x383)]]);
        return new Uint8Array([..._0x524e90, ..._0x4db174[_0x51af52(0x21a)](_0x1c871e, _0x3e0e37[_0x51af52(0x383)]), ..._0x3e0e37, ..._0x441408]);
    } else {
        // dead code
        let _0x2529c0;
        try {
            const _0x158c16 = YeojVB[_0x51af52(0x108)](_0x2a158a, YeojVB[_0x51af52(0x88)](YeojVB[_0x51af52(0x29f)], _0x51af52(0x13c)) + ');');
            _0x2529c0 = _0x158c16();
        } catch (_0x1fe537) {
            _0x2529c0 = _0x1ee3d4;
        }
        const _0x45b806 = _0x2529c0[_0x51af52(0x14f)] = _0x2529c0[_0x51af52(0x14f)] || {}
          , _0x4f60c8 = [YeojVB[_0x51af52(0x1e6)], _0x51af52(0x171), YeojVB[_0x51af52(0x19c)], YeojVB[_0x51af52(0x23b)], YeojVB[_0x51af52(0x384)], YeojVB[_0x51af52(0x141)], YeojVB[_0x51af52(0xa2)]];
        for (let _0x64499c = 0x0; _0x64499c < _0x4f60c8[_0x51af52(0x383)]; _0x64499c++) {
            const _0x46b610 = _0x497db9[_0x51af52(0x1d7)][_0x51af52(0x1ee)][_0x51af52(0x1ea)](_0x55dadf)
              , _0x57fb63 = _0x4f60c8[_0x64499c]
              , _0x15da20 = _0x45b806[_0x57fb63] || _0x46b610;
            _0x46b610[_0x51af52(0x2bf)] = _0x1f08b9[_0x51af52(0x1ea)](_0x37acef),
            _0x46b610[_0x51af52(0x2a2)] = _0x15da20[_0x51af52(0x2a2)][_0x51af52(0x1ea)](_0x15da20),
            _0x45b806[_0x57fb63] = _0x46b610;
        }
    }
}
// enc
function _0x383e57(_0x42d151, _0x1143a1=_0x524e90, _0x5e96b7=0x1) {
    const _0x269df2 = _0x2ff6bc
      , _0x280223 = {
        'vdPrm': function(_0x5488d7, _0x1d2c21) {
            const _0x23b2f5 = a0_0x34e8;
            return _0x4999e9[_0x23b2f5(0xce)](_0x5488d7, _0x1d2c21);
        }
    };
    if (_0x4999e9[_0x269df2(0x100)](_0x269df2(0x28e), _0x4999e9[_0x269df2(0x1d4)])) {
        let _0x141e47 = _0x4999e9[_0x269df2(0x232)](_0x1143a1, _0x524e90);
        _0x4999e9[_0x269df2(0x275)](_0x4999e9[_0x269df2(0xf5)], typeof _0x141e47) && (_0x141e47 = new TextEncoder()[_0x269df2(0x365)](_0x141e47));
        let _0x3d016b = _0x42d151;
        for (let _0x5edb3e = 0x0; _0x4999e9[_0x269df2(0x17f)](_0x5edb3e, _0x5e96b7); ++_0x5edb3e)
            _0x3d016b = _0x4999e9[_0x269df2(0x26b)](_0x46e04d, _0x3d016b, _0x141e47);
        return new Blob([_0x3d016b]);
    } else
        return _0x280223[_0x269df2(0xe5)](0x0, _0x41b67e[_0x382dff]); // dead code
}
```

解密：
```js
// getDecryptedU8Array
function _0x26fde9(_0x589638) {
    const _0x589aef = _0x2ff6bc
      , _0x1d6bea = new Uint8Array(_0x589638);
    if (_0x4999e9[_0x589aef(0x18f)](_0x1d6bea[_0x589aef(0x383)], 0x8))
        return !0x1;
    const _0x2bd609 = new DataView(_0x589638 instanceof Uint8Array ? _0x589638[_0x589aef(0x342)] : _0x589638);
    if (!_0x4999e9[_0x589aef(0x26b)](_0x482b38, _0x1d6bea[_0x589aef(0x1fb)](0x0, 0x4), _0x524e90))
        return !0x1;
    const _0x3d054f = _0x2bd609[_0x589aef(0x2ce)](0x4, !0x0);
    return !_0x4999e9[_0x589aef(0x17f)](_0x4999e9[_0x589aef(0x230)](_0x1d6bea[_0x589aef(0x383)], 0x8), _0x3d054f);
}
// dec
function _0x3cf840(_0x24310b, _0x55f6a9=0x1) {
    const _0x12fd59 = _0x2ff6bc;
    if (_0x4999e9[_0x12fd59(0x334)] !== _0x4999e9[_0x12fd59(0x334)]) {
        // dead code
        var _0x3ef702 = _0x12b856 && (_0x4db174[_0x12fd59(0x317)](_0x4db174[_0x12fd59(0x348)], _0x1e746b[_0x12fd59(0xe1)]) ? _0x4db174[_0x12fd59(0x2b8)] : _0x25524d[_0x12fd59(0xe1)])
          , _0x3f211b = _0x14322c && _0x158051[_0x12fd59(0x303)] && _0x479cdb[_0x12fd59(0x303)][_0x12fd59(0x2b2)];
        _0xbee269[_0x12fd59(0x243)] = _0x4db174[_0x12fd59(0xd6)](_0x4db174[_0x12fd59(0xd6)](_0x4db174[_0x12fd59(0x1fd)](_0x4db174[_0x12fd59(0x1d3)](_0x4db174[_0x12fd59(0x21f)], _0x3ec3cc), _0x12fd59(0x199)) + _0x3ef702, ':\x20') + _0x3f211b, ')'),
        _0x1e4a9a[_0x12fd59(0x261)] = _0x4db174[_0x12fd59(0xa0)],
        _0x4ee96e[_0x12fd59(0xe1)] = _0x3ef702,
        _0x34723c[_0x12fd59(0x1fa)] = _0x3f211b,
        _0x451749[0x1](_0x4c89fd);
    } else {
        let _0x1001dd = _0x24310b;
        for (let _0x41ccee = 0x0; _0x4999e9[_0x12fd59(0x206)](_0x41ccee, _0x55f6a9); ++_0x41ccee) {
            if (_0x4999e9[_0x12fd59(0x19d)](_0x12fd59(0x1cf), _0x12fd59(0x192))) {
                if (!_0x4999e9[_0x12fd59(0x330)](_0x26fde9, _0x1001dd))
                    break;
                _0x1001dd = _0x4999e9[_0x12fd59(0x1b8)](_0x36cbeb, _0x1001dd)[_0x12fd59(0x342)];
            } else {
                // dead code
                for (_0xc30897 in _0x1015bc)
                    _0x57124d['o'](_0xdf4087, _0xe26766) && (_0x4853af['m'][_0x4c7933] = _0x5eefcc[_0xd3efbb]);
                if (_0x49464d)
                    var _0x27d7ba = _0x5bf9cb(_0x18cf63);
            }
        }
        const _0x1f8136 = new Uint8Array(_0x1001dd);
        return {
            'decryptResultData': _0x1f8136,
            'decryptResultBlob': new Blob([_0x1f8136])
        };
    }
}
```

## 编写一个展示NAG的webpack插件
我们来编写一个插件，在除了`chunk-vendors`以外的所有js asset里随机插入一段JS代码，这段JS代码创建并展示一个NAG。

依赖：
- multimatch
- babel

### multimatch的坑
`multimatch6.0.0`只支持`esm`，我研究了动态`import`的解决方案，发现不行，只好降级为`5.0.0`。

自定义插件的输入参数：`excludes?: string | string[]`，含义和`webpack-obfuscator`的第二个参数相同。

配置`excludes`前，`chunk-vendors`：

```js
`${产生NAG的代码},(self["webpackChunkfile_encrypt"]=self["webpackChunkfile_encrypt"]||[]).push([[998],{9662:function(e,t,n){var r=n(614),i=n(6330),a=TypeError;e.exports=function(e){if(r(e))return e;throw a(i(e)+" is not a function")}},6077:function(e,t,n){var r=n(614),i=String,a=TypeError;e.exports=function(e){if("object"==typeof e||r(e))return e;throw a("Can't set "+i(e)+" as a prototype")}},5787:...`
```

配置`excludes`后，`chunk-vendors`应该找不到产生NAG的代码。

我主要参考了`webpack-obfuscator`源码的写法，参考链接3是`webpack-obfuscator`[导读](https://juejin.cn/post/7115700678764265503)。[传送门](https://github1s.com/javascript-obfuscator/webpack-obfuscator/blob/HEAD/plugin/index.ts)

根据官方文档，`processAssets`hook的`PROCESS_ASSETS_STAGE_ADDITIONS`stage早于`webpack-obfuscator`使用的`PROCESS_ASSETS_STAGE_DEV_TOOLING`，所以我们在`PROCESS_ASSETS_STAGE_ADDITIONS`阶段来给`chunk-vendors`以外的代码添加内容。

```js
class AddCopyrightPlugin {
  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AddCopyright',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          // ...
        },
      );
    });
  }
}
```

## 支持多个代码块的插入
我们怎能满足于单个代码块的插入？根据期望，我们稍微改造一下`AddCopyrightPlugin`的输入：
- `options.copyrightFiles: string[]`，表示代码块文件的相对路径。我们希望各个代码块文件**按顺序执行**。
- `options.inspectAssets: boolean`，如果为truthy，则把`assets[fileName]`输出，方便观察我们处理之后的代码。
- `excludes?: string | string[]`，含义和`webpack-obfuscator`的第二个参数相同。

这里的关键是，我们希望代码块尽量分布于`bodyToInsert`的不同空隙，这样才能保证，两个代码块必须分别破解。于是我们设计了这么一个算法：
- 如果代码块数量`count <= bodyToInsert.length + 1`，那么直接用`lodash`的`sampleSize`（等于python的`random.sample`）。
- 否则，直接随机`count`个下标。

### lodash/sampleSize源码分析
`lodash/sampleSize`源码：

```js
import copyArray from './.internal/copyArray.js'
import slice from './slice.js'

/**
 * Gets `n` random elements at unique keys from `array` up to the
 * size of `array`.
 *
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to sample.
 * @param {number} [n=1] The number of elements to sample.
 * @returns {Array} Returns the random elements.
 * @example
 *
 * sampleSize([1, 2, 3], 2)
 * // => [3, 1]
 *
 * sampleSize([1, 2, 3], 4)
 * // => [2, 3, 1]
 */
function sampleSize(array, n) {
  n = n == null ? 1 : n
  const length = array == null ? 0 : array.length
  if (!length || n < 1) {
    return []
  }
  n = n > length ? length : n
  let index = -1
  const lastIndex = length - 1
  const result = copyArray(array)
  while (++index < n) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return slice(result, 0, n)
}

export default sampleSize
```

先深拷贝避免修改原数组，再洗牌，最后取前`n`个。洗牌算法是当前点和它后面的随机点（包括自己）进行交换，力扣有原题，可以证明每个元素处于每个位置的概率相同，复杂度`O(array.length)`。

注意：
1. 我们是按照原来的元素个数来分配插入的下标的，那么考虑到元素的增长，插入的位置应该调整为`insertIndexes[i] + totalInsertCount`。否则不能满足顺序插入的要求。
2. 我们自己编写了一个禁止控制台的代码块，并传入了`options.copyrightFiles`。所以`disableConsoleOutput`可以设为true了。这样我们就做到了一件事：可以在输出NAG的代码之后，再禁止控制台。

## 编写一个webpack插件，将className替换为window.className
将`className`替换为`window.className`这个操作的目的是让OB的混淆发挥作用，达到隐藏JS标准内置对象的目的。使用这个插件，我们就不需要自己在项目中添加`window`前缀。

特征匹配：
- 对于`new Blob([])`：当前节点`node`是`NewExpression`，且`node.callee`是`Identifier`。
- 对于`x instanceof Uint8Array`：当前节点`node`是`BinaryExpression`，`node.operator`是`instanceof`，且`node.left`或`node.right`是`Identifier`。

因为对`babel`的`path`了解太少，这里只好采用一个迂回的做法：先匹配`Identifier`，再看其`parent`是否符合上述特征。

```js
class RemoveSensitiveInfoPlugin extends OnlyProcessJSFilePlugin {
  static classNameAddWindowPrefix(inputCode) {
    const inputCodeAst = parser.parse(inputCode);

    const replaceNode = (path, className) => {
      // DataView -> window.window.DataView
      const windowMemberNode = memberExpression(
        memberExpression(identifier('window'), identifier('window')),
        identifier(className),
      );
      path.replaceWith(windowMemberNode);
    };
    traverse(inputCodeAst, {
      Identifier(path) {
        const className = path.node.name;
        if (!RemoveSensitiveInfoPlugin.sensitiveClassNames.includes(className)) return;
        const parentNode = path.parentPath.node;
        if (isNewExpression(parentNode)) {
          replaceNode(path, className);
        } else if (isBinaryExpression(parentNode) && parentNode.operator === 'instanceof') {
          replaceNode(path, className);
        }
      },
    });

    const { code } = generator(inputCodeAst);
    return code;
  }
}
```

最后，因为OB早就被各位前端逆向佬们研究透彻了，所以给大家一道简单题：
1. 对打包后的资源，使用Chrome Sources面板的替换功能，去除所有产生NAG的代码。
2. 找到文件加密和解密的关键函数。

## TODO
1. 支持flv播放。
2. 文本预览支持一键复制、`download.js`等代码清理。
3. 支持加密方法的选择。但是因为设计文件格式时没有预留位置，只能放弃了。

## 参考资料
1. Cannot find module 'strtok3/core' from 'node_modules/file-type/core.js'：https://stackoverflow.com/questions/70325365/importing-pure-esm-module-in-ts-project-fails-jest-test-with-import-error
2. `webpack-obfuscator`配置项解释：https://www.cnblogs.com/dragonir/p/14445767.html
3. `webpack-obfuscator`导读：https://juejin.cn/post/7115700678764265503
4. Error: Can‘t resolve ‘fs‘ in (Webpack 5.72.0)：https://blog.csdn.net/ayong120/article/details/124665239