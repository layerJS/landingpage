var services = require('./services.js');
var args = process.argv.slice(2);

if (args.length === 0) {
  services.compileSite();
}
else if (args.length === 1 ){
  services.compileToSingleFile(args[0]);
}

//console.log(pages);
