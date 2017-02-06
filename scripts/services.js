var helpers = require('./helpers');
var path = require('path');
var ejs = require('ejs');

module.exports = {

  compileSite: function() {
    var pages = this.compilePages();
    this.writePages(pages);

  },
  compileTemplate: function(content, data, options) {
    return ejs.render(content, data, options);
  },
  compilePages: function() {
    var dataPages = this.getDataPages();

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

  getDataPages: function() {
    var pageDirectoryPath = 'pages';
    var pageNames = helpers.getFileNames(pageDirectoryPath);
    var pages = [];

    for (var i = 0; i < pageNames.length; i++) {
      var page = {};
      var pathInfo = path.format({
        root: '/',
        dir: pageDirectoryPath,
        base: pageNames[i]
      });

      page.content = this.compileTemplate(helpers.getFileContent(pathInfo), {}, {
        filename: pathInfo
      });
      page.path = pathInfo;
      page.fileName = pageNames[i];
      page.data = this.getThemeData(page.content);
      pages.push(page);
    }

    return pages;
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
