'use strict';

angular
  .module('vleApp', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngTouch',
    'ngDragDrop',
    'mm.foundation',
    'monospaced.elastic',
    'zeroclipboard'
  ])
  .constant('_', window._)
  .constant('Papa', window.Papa)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('tv4', window.tv4)
  .config(['uiZeroclipConfigProvider', function(uiZeroclipConfigProvider) {

    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: '../bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  }]);
