const { sources } = require('webpack');
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const generator = require('@babel/generator').default;
const { isCallExpression, isFunctionExpression, isBlockStatement } = require('@babel/types');
const sampleSize = require('lodash/sampleSize');
const OnlyProcessJSFilePlugin = require('./webpack-plugin-utils');

function readCopyrightFileCode(copyrightFile) {
  const copyrightFilePath = path.resolve(__dirname, copyrightFile);
  try {
    return fs.readFileSync(copyrightFilePath, 'utf-8');
  } catch (e) {
    console.error(`${copyrightFilePath} not found`, e);
    return '';
  }
}

function getInsertIndexes(count, arrayLength) {
  let a = [];
  if (count <= arrayLength + 1) {
    a = sampleSize(Array(arrayLength + 1).fill(0).map((_, i) => i), count);
  } else {
    for (let i = 0; i < count; ++i) a.push(Math.floor(Math.random() * (arrayLength + 1)));
  }
  a.sort((x, y) => x - y);
  return a;
}

class AddCopyrightPlugin extends OnlyProcessJSFilePlugin {
  constructor(options, excludes) {
    super(excludes);
    this.options = options;
    this.copyrightCodes = (options.copyrightFiles || [])
      .map((copyrightFile) => readCopyrightFileCode(copyrightFile))
      .filter((copyrightFileContent) => copyrightFileContent);
    this.copyrightCodeASTs = this.copyrightCodes.map((code) => parser.parse(code));
  }

  insertCopyrightCode(inputCode) {
    const inputCodeAst = parser.parse(inputCode);
    const inputCodeAstBodyArray = inputCodeAst.program.body;

    const getBodyToInsert = (inputCodeAstBody) => {
      if (isCallExpression(inputCodeAstBody[0].expression)
        && isFunctionExpression(inputCodeAstBody[0].expression.callee)
        && isBlockStatement(inputCodeAstBody[0].expression.callee.body)) {
        const bodyToInsert = inputCodeAstBody[0].expression.callee.body.body;
        return bodyToInsert;
      }
      return inputCodeAstBody;
    };
    const bodyToInsert = getBodyToInsert(inputCodeAstBodyArray);

    const insertIndexes = getInsertIndexes(this.copyrightCodeASTs.length, bodyToInsert.length);

    let totalInsertCount = 0;
    this.copyrightCodeASTs.forEach((copyrightCodeAST, i) => {
      const copyrightCodeBody = copyrightCodeAST.program.body;
      bodyToInsert.splice(insertIndexes[i] + totalInsertCount, 0, ...copyrightCodeBody);
      totalInsertCount += copyrightCodeBody.length;
    });

    const { code } = generator(inputCodeAst);
    return code;
  }

  processJSFile(compilation, assets, fileName) {
    const asset = compilation.assets[fileName];
    const inputCode = asset.source();
    const outputCode = this.insertCopyrightCode(inputCode);
    assets[fileName] = new sources.RawSource(outputCode, false);
    if (this.options.inspectAssets) {
      fs.writeFileSync(`${fileName.substring(3, fileName.length - 3)}-inspect.js`, outputCode);
    }
  }
}

module.exports = {
  AddCopyrightPlugin,
  getInsertIndexes,
};
