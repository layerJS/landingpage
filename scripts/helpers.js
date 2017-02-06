var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = {

  getFileNames: function(pathInfo) {
    var fileNames = [];

    function _getFileNames(currentPath) {
      var files = fs.readdirSync(currentPath, {
        encoding: 'utf8'
      });
      for (var i in files) {
        var curFile = path.join(currentPath, files[i]);
        if (fs.statSync(curFile).isFile()) {
          fileNames.push(curFile.replace(pathInfo, ''));
        } else if (fs.statSync(curFile).isDirectory()) {
          _getFileNames(curFile);
        }
      }
    };
    _getFileNames(pathInfo);
    return fileNames;
  },

  getFileContent: function(filePath) {
    return fs.readFileSync(filePath, {
      encoding: 'utf8'
    });
  },

  writeFile: function(filePath, content) {
    this.createDirectory(path.dirname(filePath));

    fs.writeFileSync(filePath, content, {
      encoding: 'utf8'
    });
  },

  createDirectory: function(directory) {
    mkdirp.sync(directory);
  }
};
