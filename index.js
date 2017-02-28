// Copied and modified from skatejs-web-components, which is licensed as follows:
// The MIT License (MIT)
// 
// Copyright (c)  2016
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 

// NOTE!!!
//
// We have to load polyfills directly from source as non-minified files are not
// published by the polyfills. An issue was raised to discuss this problem and
// to see if it can be resolved.
//
// See https://github.com/webcomponents/custom-elements/issues/45

// ES2015 polyfills required for the polyfills to work in older browsers.
require('array.from').shim();
require('object.assign').shim();
require('es6-promise').polyfill();

// We have to include this first so that it can patch native. This must be done
// before any polyfills are loaded.
// BYU is ignoring this part, as we distribute ES6 classes when applicable
// require('./native-shim')

// Template polyfill is necessary to use shadycss in IE11
// this comes before custom elements because of
// https://github.com/webcomponents/template/blob/master/template.js#L39
require('@webcomponents/template');

// This comes after the native shim because it requries it to be patched first.
require('@webcomponents/custom-elements/src/custom-elements');

// Force the polyfill in Safari 10.0.0 and 10.0.1.
const { navigator } = window;
const { userAgent } = navigator;
const safari = userAgent.indexOf('Safari/60') !== -1;
const safariVersion = safari && userAgent.match(/Version\/([^\s]+)/)[1];
const safariVersions = [0, 1].map(v => `10.0.${v}`).concat(['10.0']);

if (safari && safariVersions.indexOf(safariVersion) > -1) {
  window.ShadyDOM = { force: true };
}

// ShadyDOM comes first. Both because it may need to be forced and the
// ShadyCSS polyfill requires it to function.
require('cloudydom/src/env');
require('@webcomponents/shadycss/index');
