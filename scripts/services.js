var helpers = require('./helpers');
var path = require('path');
var ejs = require('ejs');

module.exports = {

  compileSite: function() {
    var pages = this.compilePages();
    this.writePages(pages);
  },

  compileWithMaster: function(master) {
    var dataFrames = this.getDataFiles('frames');

    for (var i = 0; i < dataFrames.length; i++) {

      var content = this.getMaster(master, dataFrames[i].data);

      var outputPath = path.format({
        root: '/',
        dir: 'site',
        base: dataFrames[i].fileName
      });

      helpers.writeFile(outputPath, content);
    }
  },

  compileToSingleFile: function(master) {
    var dataFrames = this.getDataFiles('frames');
    var data = {
      content: ''
    };

    for (var i = 0; i < dataFrames.length; i++) {
      data.content += dataFrames[i].data.content;
    }

    var content = this.getMaster(master, data);
    var outputPath = path.format({
      root: '/',
      dir: 'site',
      base: master
    });

    helpers.writeFile(outputPath, content);
  },

  compileTemplate: function(content, data, options) {
    return ejs.render(content, data, options);
  },

  compilePages: function() {
    var dataPages = this.getDataFiles('pages');

    for (var i = 0; i < dataPages.length; i++) {
      var dataPage = dataPages[i];
      if (dataPage.data.hasOwnProperty('master')) {
        dataPage.content = this.getMaster(dataPage.data.master, dataPage.data);
      }
    }

    return dataPages;
  },

  writePages: function(pages) {
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      var pathInfo = path.format({
        root: '/',
        dir: 'site',
        base: page.fileName
      });

      helpers.writeFile(pathInfo, page.content);
    }
  },

  getMaster: function(master, data) {
    var pathInfo = path.format({
      root: '/',
      dir: 'masters',
      base: master
    });

    var content = helpers.getFileContent(pathInfo);
    return this.compileTemplate(content, {
      theme: data
    }, {
      filename: pathInfo
    });
  },

  getDataFiles: function(directory) {
    var fileNames = helpers.getFileNames(directory);
    var files = [];

    for (var i = 0; i < fileNames.length; i++) {
      var file = {};
      var pathInfo = path.format({
        root: '/',
        dir: directory,
        base: fileNames[i]
      });

      file.content = this.compileTemplate(helpers.getFileContent(pathInfo), {}, {
        filename: pathInfo
      });
      file.path = pathInfo;
      file.fileName = fileNames[i];
      file.data = this.getThemeData(file.content);
      if (!file.data.hasOwnProperty('content')) {
        file.data.content = file.content;
      }

      files.push(file);
    }

    return files;
  },

  getThemeData: function(content) {
    const regex = /theme\.[a-zA-Z0-9]*\:/g;
    var data = {};
    var m;
    var themeDataKeywordsInfo = [];

    while ((m = regex.exec(content)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        themeDataKeywordsInfo.push({
          keyword: match,
          index: m.index
        });
      });
    }

    for (var i = 0; i < themeDataKeywordsInfo.length; i++) {
      var startIndex = themeDataKeywordsInfo[i].index + themeDataKeywordsInfo[i].keyword.length
      var keyword = themeDataKeywordsInfo[i].keyword.substring(6, themeDataKeywordsInfo[i].keyword.length - 1);
      if (i + 1 < themeDataKeywordsInfo.length) {
        data[keyword] = content.substring(startIndex, themeDataKeywordsInfo[i + 1].index);
      } else {
        data[keyword] = content.substring(startIndex);
      }

      data[keyword] = data[keyword].trim();
    }

    return data;
  }
};
