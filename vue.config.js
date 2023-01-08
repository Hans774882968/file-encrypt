const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');
const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');
const AddCopyrightPlugin = require('./add-copyright-plugin');

const chunkVendorsRelativePath = path.join('js', 'chunk-vendors.**.js');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
      new AddCopyrightPlugin([chunkVendorsRelativePath]),
      new WebpackObfuscator({
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,
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
      }, [chunkVendorsRelativePath]),
    ],
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
      },
    },
  },
});
