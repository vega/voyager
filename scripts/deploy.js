var ghpages = require('gh-pages');
var path = require('path');

function onPublish(err) {

}

ghpages.publish('dist', function(err) {});
