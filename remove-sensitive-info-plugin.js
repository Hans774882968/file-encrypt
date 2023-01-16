const { sources } = require('webpack');
const fs = require('fs');
const parser = require('@babel/parser');
const generator = require('@babel/generator').default;
const { traverse } = require('@babel/core');
const {
  memberExpression, identifier, isNewExpression, isBinaryExpression, isMemberExpression,
} = require('@babel/types');
const OnlyProcessJSFilePlugin = require('./webpack-plugin-utils');

class RemoveSensitiveInfoPlugin extends OnlyProcessJSFilePlugin {
  static sensitiveClassNames = ['DataView', 'Uint8Array', 'Blob', 'TextEncoder', 'ArrayBuffer', 'console', 'Object'];

  constructor(options, excludes) {
    super(excludes);
    this.options = options;
  }

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
        } else if (isMemberExpression(parentNode) && parentNode.object === path.node) {
          replaceNode(path, className);
        }
      },
    });

    const { code } = generator(inputCodeAst);
    return code;
  }

  processJSFile(compilation, assets, fileName) {
    const asset = compilation.assets[fileName];
    const inputCode = asset.source();
    const outputCode = RemoveSensitiveInfoPlugin.classNameAddWindowPrefix(inputCode);
    assets[fileName] = new sources.RawSource(outputCode, false);
    if (this.options.inspectAssets) {
      fs.writeFileSync(`${fileName.substring(3, fileName.length - 3)}-remove-sensitive-inspect.js`, outputCode);
    }
  }
}

module.exports = RemoveSensitiveInfoPlugin;
