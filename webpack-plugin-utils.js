const { Compilation } = require('webpack');
const multimatch = require('multimatch');

class OnlyProcessJSFilePlugin {
  static allowedExtensions = ['.js'];

  constructor(excludes) {
    this.excludes = excludes || [];
  }

  shouldExclude(filePath) {
    return multimatch(filePath, this.excludes).length > 0;
  }

  processJSFile(compilation, assets, fileName) {
    console.error(this, compilation, assets, fileName);
  }

  apply(compiler) {
    const pluginName = this.constructor.name;
    const pliginProcessAssetsName = pluginName.substring(0, pluginName.length - 6);
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pliginProcessAssetsName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          compilation.chunks.forEach((chunk) => {
            chunk.files.forEach((fileName) => {
              const isValidExtension = OnlyProcessJSFilePlugin.allowedExtensions.some((extension) => fileName.toLowerCase().endsWith(extension));
              if (!isValidExtension || this.shouldExclude(fileName)) {
                return;
              }
              this.processJSFile(compilation, assets, fileName);
            });
          });
        },
      );
    });
  }
}

module.exports = OnlyProcessJSFilePlugin;
