'use strict';
/* globals window */

angular.module('polestar', [
    'ngSanitize',
    'ngTouch',
    'ngDragDrop',
    'monospaced.elastic',
    'zeroclipboard',
    'ui.select',
    'Chronicle',
    'LocalStorageModule',
    '720kb.tooltips',
    'ngOrderObjectBy',
    'vlui'])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('ZSchema', window.ZSchema)
  .constant('Tether', window.Tether)
  .constant('Drop', window.Drop)
  .constant('Blob', window.Blob)
  .constant('URL', window.URL)
  .constant('dl', window.dl)
  .constant('jsondiffpatch', window.jsondiffpatch)
  .config(function(consts) {
    window.vl.extend(consts, {
      appId: 'polestar',
      // set this if you want to load app with a specific spec
      initialSpec: window.initialSpec || undefined,
    });
  })
  .config(function(uiZeroclipConfigProvider) {
    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  })
  .config(function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('polestar');
  });
