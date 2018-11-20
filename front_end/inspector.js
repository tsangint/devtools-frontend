// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
Runtime.startApplication('inspector');

const hippyExtensionId = "ogejjfnhlbenekmdaelkkfdkeihjiefh";

function _dispatchOnInspectorFrontendAPI(method, args) {
  const inspectorFrontendAPI = /** @type {!Object<string, function()>} */ (window['InspectorFrontendAPI']);
  inspectorFrontendAPI[method].apply(inspectorFrontendAPI, args);
}

setTimeout(()=>{
  if(window['InspectorFrontendAPI']){
    console.log("Hippy: Extension added", window['InspectorFrontendAPI']);
    _dispatchOnInspectorFrontendAPI('addExtensions', [[{
      exposeExperimentalAPIs: false,
      name: 'Hippy',
      startPage: `chrome-extension://${hippyExtensionId}/main.html`
    }]]);
  }else{
    console.warn("Hippy: InspectorFrontendAPI未初始化", window['InspectorFrontendAPI'])
  }
},2000)

