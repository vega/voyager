/**
 * @license
 *
 * Copyright (c) 2015, University of Washington Interactive Data Lab.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the University of Washington Interactive Data Lab
 *   nor the names of its contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';
/* globals window */

angular.module('voyager', ['vlui',
    'zeroclipboard',
    '720kb.tooltips',
    'LocalStorageModule',
    'ngOrderObjectBy',
    'Chronicle',
    'ngTouch',
    'angular-google-analytics'])
  .constant('_', window._)
  .constant('jQuery', window.$)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('cp', window.cp)
  .constant('Blob', window.Blob)
  .constant('URL', window.URL)
  .constant('Tether', window.Tether)
  .constant('Drop', window.Drop)
  .config(['uiZeroclipConfigProvider', function(uiZeroclipConfigProvider) {
    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  }])
  .config(function(consts) {
    window.vg.util.extend(consts, {
      debug: true,
      debugInList: true,
      numInitClusters: 15,
      numMoreClusters: 9,
      appId: 'voyager',
      enableExclude: true
    });
  })
  .config(function (AnalyticsProvider, consts) {
    if (consts.embeddedData) return;
    AnalyticsProvider
      .setAccount({ tracker: 'UA-44428446-4', name: 'voyager', trackEvent: true });
  });
