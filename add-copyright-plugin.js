const { Compilation, sources } = require('webpack');
const fs = require('fs');
const parser = require('@babel/parser');
const generator = require('@babel/generator').default;
const multimatch = require('multimatch');
const { isCallExpression, isFunctionExpression, isBlockStatement } = require('@babel/types');

function readCopyrightPrintCode() {
  try {
    return fs.readFileSync('./copyright-print.js', 'utf-8');
  } catch (e) {
    console.error('copyright-print.js not found', e);
    return '';
  }
}

class AddCopyrightPlugin {
  static allowedExtensions = ['.js'];

  static copyrightCode = readCopyrightPrintCode();

  constructor(excludes) {
    this.excludes = excludes || [];
  }

  shouldExclude(filePath) {
    return multimatch(filePath, this.excludes).length > 0;
  }

  static insertCopyrightCode(inputCode) {
    const copyrightCodeAST = parser.parse(AddCopyrightPlugin.copyrightCode);
    const copyrightCodeBody = copyrightCodeAST.program.body;
    const inputCodeAst = parser.parse(inputCode);
    const inputCodeAstBody = inputCodeAst.program.body;

    const insert = (bodyToInsert) => {
      const insertIndex = Math.floor(Math.random() * bodyToInsert.length);
      bodyToInsert.splice(insertIndex, 0, ...copyrightCodeBody);
    };

    if (isCallExpression(inputCodeAstBody[0].expression)
      && isFunctionExpression(inputCodeAstBody[0].expression.callee)
      && isBlockStatement(inputCodeAstBody[0].expression.callee.body)) {
      const bodyToInsert = inputCodeAstBody[0].expression.callee.body.body;
      insert(bodyToInsert);
    } else {
      insert(inputCodeAstBody);
    }
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
              const outputCode = AddCopyrightPlugin.insertCopyrightCode(inputCode);
              assets[fileName] = new sources.RawSource(outputCode, false);
            });
          });
        },
      );
    });
  }
}

module.exports = AddCopyrightPlugin;
