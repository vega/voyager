'use strict';

angular
  .module('vleApp', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngTouch',
    'ngDragDrop',
    'mm.foundation',
    'monospaced.elastic'
  ])
  .constant('_', window._)
  .constant('Papa', window.Papa);
