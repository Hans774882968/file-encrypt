const { Compilation, sources } = require('webpack');
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const generator = require('@babel/generator').default;
const multimatch = require('multimatch');
const { isCallExpression, isFunctionExpression, isBlockStatement } = require('@babel/types');

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
  const a = [];
  if (count <= arrayLength + 1) {
    let lastInsertIndex = -1;
    for (let i = 0; i < count; ++i) {
      const coeff = Math.random() * Math.min(2 * (i + 1) / count, 1);
      const curInsertIndex = lastInsertIndex + 1 + Math.floor(
        coeff * (arrayLength - (count - i - 2) - (lastInsertIndex + 1)),
      );
      a.push(curInsertIndex);
      lastInsertIndex = curInsertIndex;
    }
  } else {
    for (let i = 0; i < count; ++i) a.push(Math.floor(Math.random() * (arrayLength + 1)));
    a.sort((x, y) => x - y);
  }
  return a;
}

class AddCopyrightPlugin {
  static allowedExtensions = ['.js'];

  constructor(options, excludes) {
    this.options = options;
    this.copyrightCodes = (options.copyrightFiles || [])
      .map((copyrightFile) => readCopyrightFileCode(copyrightFile))
      .filter((copyrightFileContent) => copyrightFileContent);
    this.excludes = excludes || [];
    this.copyrightCodeASTs = this.copyrightCodes.map((code) => parser.parse(code));
  }

  shouldExclude(filePath) {
    return multimatch(filePath, this.excludes).length > 0;
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

  apply(compiler) {
    const pluginName = this.constructor.name;
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AddCopyright',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          compilation.chunks.forEach((chunk) => {
            chunk.files.forEach((fileName) => {
              const isValidExtension = AddCopyrightPlugin.allowedExtensions.some((extension) => fileName.toLowerCase().endsWith(extension));
              if (!isValidExtension || this.shouldExclude(fileName)) {
                return;
              }
              const asset = compilation.assets[fileName];
              const inputCode = asset.source();
              const outputCode = this.insertCopyrightCode(inputCode);
              assets[fileName] = new sources.RawSource(outputCode, false);
              if (this.options.inspectAssets) {
                fs.writeFileSync(`${fileName.substring(3, fileName.length - 3)}-inspect.js`, outputCode);
              }
            });
          });
        },
      );
    });
  }
}

module.exports = AddCopyrightPlugin;
