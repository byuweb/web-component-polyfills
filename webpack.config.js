"use strict";

const fs = require('fs');
const path = require('path');

//First, we're going to copy out the index file from skatejs-web-components.

const sk8 = path.join(process.cwd(), 'node_modules', 'skatejs-web-components');

const sk8Index = path.join(sk8, 'src', 'index.js');

const sk8IndexContent = fs.readFileSync(sk8Index, {encoding: 'utf8'});

const sk8License = fs.readFileSync(path.join(sk8, 'LICENSE'), {encoding: 'utf8'})
     .split('\n').map(l => '// ' + l).join('\n');


// We're modifying it so that it doesn't include the native shim (we don't need it)
const modified = sk8IndexContent.replace(
    /require\('\.\/native-shim'\);/,
    '// BYU is ignoring this part, as we distribute ES6 classes when applicable\n' +
    '// require(\'./native-shim\')');

const dist = path.join(process.cwd(), 'dist');
const newIndex = path.join(process.cwd(), 'index.js');

const newIndexContent = `// Copied and modified from skatejs-web-components, which is licensed as follows:
${sk8License}

${modified}`;

fs.writeFileSync(newIndex, newIndexContent);


/*
 This part comes from https://github.com/skatejs/web-components/blob/master/webpack.config.js

 The MIT License (MIT)

 Copyright (c)  2016

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
  */

const conf = module.exports = require('skatejs-build/webpack.config');
conf.module.loaders[2].exclude = '';

// Both index and index-with-deps should be the same.
conf.entry['dist/index.js'] = './index.js';
conf.entry['dist/index.min.js'] = './index.js';

