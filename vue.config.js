const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');
const RemoveSensitiveInfoPlugin = require('./remove-sensitive-info-plugin');
const { AddCopyrightPlugin } = require('./add-copyright-plugin');

const chunkVendorsRelativePath = path.join('js', 'chunk-vendors.**.js');
const workerRelativePath = path.join('js', '**.worker.js');

function getObfuscatePlugins() {
  const excludes = [chunkVendorsRelativePath, workerRelativePath];
  return process.env.NODE_ENV === 'production' ? [
    new AddCopyrightPlugin({
      copyrightFiles: [
        'copyright-print.js', 'copyright-nag.js', 'disable-console-output.js',
      ],
      inspectAssets: true,
    }, excludes),
    new RemoveSensitiveInfoPlugin({
      inspectAssets: true,
    }, excludes),
    new WebpackObfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: 2000,
      disableConsoleOutput: false,
      domainLock: [],
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 1,
      unicodeEscapeSequence: false,
    }, excludes),
  ] : [];
}

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
      ...getObfuscatePlugins(),
    ],
    externals: {
      // eslint-disable-next-line global-require
      fs: require('fs'),
    },
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify'),
      },
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule('worker-loader')
      .test(/\.worker\.js$/)
      .enforce('post')
      .use('worker-loader')
      .loader('worker-loader')
      .options({
        inline: 'no-fallback',
      })
      .end();
  },
});
