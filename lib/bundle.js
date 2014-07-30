var mdeps = require("module-deps"),
through   = require("through"),
async     = require("async"),
path      = require("path");

function bundle (input, complete) {

  async.waterfall([

    /**
     */

    function resolveDeps (next) {


      var deps = [];


      var md = mdeps();
      md.pipe(through(function (chunk) {
        deps.push(chunk);
      }, function () {
        next(null, deps)
      }));
      md.end({ file: input })

    },

    function bundleScript (deps, next) {
      var buffer = [loader.toString()];


       var dbuffer = [];


      for (var i = deps.length; i--;) {
        var dep = deps[i];


        var req = "function (require, module, exports) { \n" + dep.source + "}"


        dbuffer.push("'" + dep.id + "': ["+req+", "+!!dep.entry+", "+JSON.stringify(dep.deps)+"]")
      }


      buffer = ["(" + loader.toString() + ").call(null, {"+dbuffer.join(",")+"})"].toString();


      next(null, buffer);
    }
  ], complete)
}


var loader = function (deps) {

  var darr = [];

  for (var key in deps) {
    darr.push(deps[key]);
  }

  function initModule (dep) {
    if (dep.module) return dep.module;
    dep.module = { exports: {} };

    dep[0](function (path) {
      var rdep = deps[dep[2][path]];
      var module = rdep.module || initModule(rdep);
      return module.exports;
    }, dep.module, dep.module.exports);

    return dep.module;
  }

  darr.forEach(initModule);

  return darr.filter(function (dep) {
    return dep[1];
  }).map(function (dep) {
    return dep.module || {};
  }).pop();
}

module.exports = bundle;