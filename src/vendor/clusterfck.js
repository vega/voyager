/*
  MIT license
  from https://github.com/harthur/clusterfck
*/
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.clusterfck = factory();
  }
}(this, function() {
  var require = function (file, cwd) {
      var resolved = require.resolve(file, cwd || '/');
      var mod = require.modules[resolved];
      if (!mod) throw new Error(
          'Failed to resolve module ' + file + ', tried ' + resolved
      );
      var res = mod._cached ? mod._cached : mod();
      return res;
  }

  require.paths = [];
  require.modules = {};
  require.extensions = [".js",".coffee"];

  require._core = {
      'assert': true,
      'events': true,
      'fs': true,
      'path': true,
      'vm': true
  };

  require.resolve = (function () {
      return function (x, cwd) {
          if (!cwd) cwd = '/';

          if (require._core[x]) return x;
          var path = require.modules.path();
          var y = cwd || '.';

          if (x.match(/^(?:\.\.?\/|\/)/)) {
              var m = loadAsFileSync(path.resolve(y, x))
                  || loadAsDirectorySync(path.resolve(y, x));
              if (m) return m;
          }

          var n = loadNodeModulesSync(x, y);
          if (n) return n;

          throw new Error("Cannot find module '" + x + "'");

          function loadAsFileSync (x) {
              if (require.modules[x]) {
                  return x;
              }

              for (var i = 0; i < require.extensions.length; i++) {
                  var ext = require.extensions[i];
                  if (require.modules[x + ext]) return x + ext;
              }
          }

          function loadAsDirectorySync (x) {
              x = x.replace(/\/+$/, '');
              var pkgfile = x + '/package.json';
              if (require.modules[pkgfile]) {
                  var pkg = require.modules[pkgfile]();
                  var b = pkg.browserify;
                  if (typeof b === 'object' && b.main) {
                      var m = loadAsFileSync(path.resolve(x, b.main));
                      if (m) return m;
                  }
                  else if (typeof b === 'string') {
                      var m = loadAsFileSync(path.resolve(x, b));
                      if (m) return m;
                  }
                  else if (pkg.main) {
                      var m = loadAsFileSync(path.resolve(x, pkg.main));
                      if (m) return m;
                  }
              }

              return loadAsFileSync(x + '/index');
          }

          function loadNodeModulesSync (x, start) {
              var dirs = nodeModulesPathsSync(start);
              for (var i = 0; i < dirs.length; i++) {
                  var dir = dirs[i];
                  var m = loadAsFileSync(dir + '/' + x);
                  if (m) return m;
                  var n = loadAsDirectorySync(dir + '/' + x);
                  if (n) return n;
              }

              var m = loadAsFileSync(x);
              if (m) return m;
          }

          function nodeModulesPathsSync (start) {
              var parts;
              if (start === '/') parts = [ '' ];
              else parts = path.normalize(start).split('/');

              var dirs = [];
              for (var i = parts.length - 1; i >= 0; i--) {
                  if (parts[i] === 'node_modules') continue;
                  var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                  dirs.push(dir);
              }

              return dirs;
          }
      };
  })();

  require.alias = function (from, to) {
      var path = require.modules.path();
      var res = null;
      try {
          res = require.resolve(from + '/package.json', '/');
      }
      catch (err) {
          res = require.resolve(from, '/');
      }
      var basedir = path.dirname(res);

      var keys = Object_keys(require.modules);

      for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (key.slice(0, basedir.length + 1) === basedir + '/') {
              var f = key.slice(basedir.length);
              require.modules[to + f] = require.modules[basedir + f];
          }
          else if (key === basedir) {
              require.modules[to] = require.modules[basedir];
          }
      }
  };

  require.define = function (filename, fn) {
      var dirname = require._core[filename]
          ? ''
          : require.modules.path().dirname(filename)
      ;

      var require_ = function (file) {
          return require(file, dirname)
      };
      require_.resolve = function (name) {
          return require.resolve(name, dirname);
      };
      require_.modules = require.modules;
      require_.define = require.define;
      var module_ = { exports : {} };

      require.modules[filename] = function () {
          require.modules[filename]._cached = module_.exports;
          fn.call(
              module_.exports,
              require_,
              module_,
              module_.exports,
              dirname,
              filename
          );
          require.modules[filename]._cached = module_.exports;
          return module_.exports;
      };
  };

  var Object_keys = Object.keys || function (obj) {
      var res = [];
      for (var key in obj) res.push(key)
      return res;
  };

  if (typeof process === 'undefined') process = {};

  if (!process.nextTick) process.nextTick = function (fn) {
      setTimeout(fn, 0);
  };

  if (!process.title) process.title = 'browser';

  if (!process.binding) process.binding = function (name) {
      if (name === 'evals') return require('vm')
      else throw new Error('No such module')
  };

  if (!process.cwd) process.cwd = function () { return '.' };

  require.define("path", function (require, module, exports, __dirname, __filename) {
      function filter (xs, fn) {
      var res = [];
      for (var i = 0; i < xs.length; i++) {
          if (fn(xs[i], i, xs)) res.push(xs[i]);
      }
      return res;
  }

  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length; i >= 0; i--) {
      var last = parts[i];
      if (last == '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }

  // Regex to split a filename into [*, dir, basename, ext]
  // posix version
  var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

  // path.resolve([from ...], to)
  // posix version
  exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0)
        ? arguments[i]
        : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string' || !path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
      return !!p;
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };

  // path.normalize(path)
  // posix version
  exports.normalize = function(path) {
  var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.slice(-1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
      return !!p;
    }), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  };


  // posix version
  exports.join = function() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(filter(paths, function(p, index) {
      return p && typeof p === 'string';
    }).join('/'));
  };


  exports.dirname = function(path) {
    var dir = splitPathRe.exec(path)[1] || '';
    var isWindows = false;
    if (!dir) {
      // No dirname
      return '.';
    } else if (dir.length === 1 ||
        (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
      // It is just a slash or a drive letter with a slash
      return dir;
    } else {
      // It is a full dirname, strip trailing slash
      return dir.substring(0, dir.length - 1);
    }
  };


  exports.basename = function(path, ext) {
    var f = splitPathRe.exec(path)[2] || '';
    // TODO: make this comparison case-insensitive on windows?
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  };


  exports.extname = function(path) {
    return splitPathRe.exec(path)[3] || '';
  };

  });

  require.define("/clusterfck.js", function (require, module, exports, __dirname, __filename) {
      module.exports = {
     hcluster: require("./hcluster"),
     kmeans: require("./kmeans")
  };
  });

  require.define("/hcluster.js", function (require, module, exports, __dirname, __filename) {
      var distances = require("./distance");

  var HierarchicalClustering = function(distance, linkage, threshold) {
     this.distance = distance;
     this.linkage = linkage;
     this.threshold = threshold == undefined ? Infinity : threshold;
  }

  HierarchicalClustering.prototype = {
     cluster : function(items, snapshotPeriod, snapshotCb) {
        this.clusters = [];
        this.dists = [];  // distances between each pair of clusters
        this.mins = []; // closest cluster for each cluster
        this.index = []; // keep a hash of all clusters by key

        for (var i = 0; i < items.length; i++) {
           var cluster = {
              value: items[i],
              key: i,
              index: i,
              size: 1
           };
           this.clusters[i] = cluster;
           this.index[i] = cluster;
           this.dists[i] = [];
           this.mins[i] = 0;
        }

        for (var i = 0; i < this.clusters.length; i++) {
           for (var j = 0; j <= i; j++) {
              var dist = (i == j) ? Infinity :
                 this.distance(this.clusters[i].value, this.clusters[j].value);
              this.dists[i][j] = dist;
              this.dists[j][i] = dist;

              if (dist < this.dists[i][this.mins[i]]) {
                 this.mins[i] = j;
              }
           }
        }

        var merged = this.mergeClosest();
        var i = 0;
        while (merged) {
          if (snapshotCb && (i++ % snapshotPeriod) == 0) {
             snapshotCb(this.clusters);
          }
          merged = this.mergeClosest();
        }

        this.clusters.forEach(function(cluster) {
          // clean up metadata used for clustering
          delete cluster.key;
          delete cluster.index;
        });

        return this.clusters;
     },

     mergeClosest: function() {
        // find two closest clusters from cached mins
        var minKey = 0, min = Infinity;
        for (var i = 0; i < this.clusters.length; i++) {
           var key = this.clusters[i].key,
               dist = this.dists[key][this.mins[key]];
           if (dist < min) {
              minKey = key;
              min = dist;
           }
        }
        if (min >= this.threshold) {
           return false;
        }

        var c1 = this.index[minKey],
            c2 = this.index[this.mins[minKey]];

        // merge two closest clusters
        var merged = {
           left: c1,
           right: c2,
           key: c1.key,
           size: c1.size + c2.size
        };

        this.clusters[c1.index] = merged;
        this.clusters.splice(c2.index, 1);
        this.index[c1.key] = merged;

        // update distances with new merged cluster
        for (var i = 0; i < this.clusters.length; i++) {
           var ci = this.clusters[i];
           var dist;
           if (c1.key == ci.key) {
              dist = Infinity;
           }
           else if (this.linkage == "single") {
              dist = this.dists[c1.key][ci.key];
              if (this.dists[c1.key][ci.key] > this.dists[c2.key][ci.key]) {
                 dist = this.dists[c2.key][ci.key];
              }
           }
           else if (this.linkage == "complete") {
              dist = this.dists[c1.key][ci.key];
              if (this.dists[c1.key][ci.key] < this.dists[c2.key][ci.key]) {
                 dist = this.dists[c2.key][ci.key];
              }
           }
           else if (this.linkage == "average") {
              dist = (this.dists[c1.key][ci.key] * c1.size
                     + this.dists[c2.key][ci.key] * c2.size) / (c1.size + c2.size);
           }
           else {
              dist = this.distance(ci.value, c1.value);
           }

           this.dists[c1.key][ci.key] = this.dists[ci.key][c1.key] = dist;
        }


        // update cached mins
        for (var i = 0; i < this.clusters.length; i++) {
           var key1 = this.clusters[i].key;
           if (this.mins[key1] == c1.key || this.mins[key1] == c2.key) {
              var min = key1;
              for (var j = 0; j < this.clusters.length; j++) {
                 var key2 = this.clusters[j].key;
                 if (this.dists[key1][key2] < this.dists[key1][min]) {
                    min = key2;
                 }
              }
              this.mins[key1] = min;
           }
           this.clusters[i].index = i;
        }

        // clean up metadata used for clustering
        delete c1.key; delete c2.key;
        delete c1.index; delete c2.index;

        return true;
     }
  }

  var hcluster = function(items, distance, linkage, threshold, snapshot, snapshotCallback) {
     distance = distance || "euclidean";
     linkage = linkage || "average";

     if (typeof distance == "string") {
       distance = distances[distance];
     }
     var clusters = (new HierarchicalClustering(distance, linkage, threshold))
                    .cluster(items, snapshot, snapshotCallback);

     if (threshold === undefined) {
        return clusters[0]; // all clustered into one
     }
     return clusters;
  }

  module.exports = hcluster;

  });

  require.define("/distance.js", function (require, module, exports, __dirname, __filename) {
      module.exports = {
    euclidean: function(v1, v2) {
        var total = 0;
        for (var i = 0; i < v1.length; i++) {
           total += Math.pow(v2[i] - v1[i], 2);
        }
        return Math.sqrt(total);
     },
     manhattan: function(v1, v2) {
       var total = 0;
       for (var i = 0; i < v1.length ; i++) {
          total += Math.abs(v2[i] - v1[i]);
       }
       return total;
     },
     max: function(v1, v2) {
       var max = 0;
       for (var i = 0; i < v1.length; i++) {
          max = Math.max(max , Math.abs(v2[i] - v1[i]));
       }
       return max;
     }
  };
  });

  require.define("/kmeans.js", function (require, module, exports, __dirname, __filename) {
      var distances = require("./distance");

  function randomCentroids(points, k) {
     var centroids = points.slice(0); // copy
     centroids.sort(function() {
        return (Math.round(Math.random()) - 0.5);
     });
     return centroids.slice(0, k);
  }

  function closestCentroid(point, centroids, distance) {
     var min = Infinity,
         index = 0;
     for (var i = 0; i < centroids.length; i++) {
        var dist = distance(point, centroids[i]);
        if (dist < min) {
           min = dist;
           index = i;
        }
     }
     return index;
  }

  function kmeans(points, k, distance, snapshotPeriod, snapshotCb) {
     distance = distance || "euclidean";
     if (typeof distance == "string") {
        distance = distances[distance];
     }

     var centroids = randomCentroids(points, k);
     var assignment = new Array(points.length);
     var clusters = new Array(k);

     var iterations = 0;
     var movement = true;
     while (movement) {
        // update point-to-centroid assignments
        for (var i = 0; i < points.length; i++) {
           assignment[i] = closestCentroid(points[i], centroids, distance);
        }

        // update location of each centroid
        movement = false;
        for (var j = 0; j < k; j++) {
           var assigned = [];
           assignment.forEach(function(centroid, index) {
              if (centroid == j) {
                 assigned.push(points[index]);
              }
           });

           if (!assigned.length) {
              continue;
           }
           var centroid = centroids[j];
           var newCentroid = new Array(centroid.length);

           for (var g = 0; g < centroid.length; g++) {
              var sum = 0;
              for (var i = 0; i < assigned.length; i++) {
                 sum += assigned[i][g];
              }
              newCentroid[g] = sum / assigned.length;

              if (newCentroid[g] != centroid[g]) {
                 movement = true;
              }
           }
           centroids[j] = newCentroid;
           clusters[j] = assigned;
        }

        if (snapshotCb && (iterations++ % snapshotPeriod == 0)) {
           snapshotCb(clusters);
        }
     }
     return clusters;
  }

  module.exports = kmeans;

  });

  return require('/clusterfck')
}));


