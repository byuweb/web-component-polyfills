(function () {
'use strict';

/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function (scope) {

  'use strict';

  // defaultPrevented is broken in IE.
  // https://connect.microsoft.com/IE/feedback/details/790389/event-defaultprevented-returns-false-after-preventdefault-was-called

  var workingDefaultPrevented = function () {
    var e = document.createEvent('Event');
    e.initEvent('foo', true, true);
    e.preventDefault();
    return e.defaultPrevented;
  }();

  if (!workingDefaultPrevented) {
    var origPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function () {
      if (!this.cancelable) {
        return;
      }

      origPreventDefault.call(this);

      Object.defineProperty(this, 'defaultPrevented', {
        get: function get() {
          return true;
        },
        configurable: true
      });
    };
  }

  var isIE = /Trident/.test(navigator.userAgent);

  // CustomEvent constructor shim
  if (!window.CustomEvent || isIE && typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function (inType, params) {
      params = params || {};
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }

  // Event constructor shim
  if (!window.Event || isIE && typeof window.Event !== 'function') {
    var origEvent = window.Event;
    window.Event = function (inType, params) {
      params = params || {};
      var e = document.createEvent('Event');
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
      return e;
    };
    if (origEvent) {
      for (var i in origEvent) {
        window.Event[i] = origEvent[i];
      }
    }
    window.Event.prototype = origEvent.prototype;
  }

  if (!window.MouseEvent || isIE && typeof window.MouseEvent !== 'function') {
    var origMouseEvent = window.MouseEvent;
    window.MouseEvent = function (inType, params) {
      params = params || {};
      var e = document.createEvent('MouseEvent');
      e.initMouseEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.view || window, params.detail, params.screenX, params.screenY, params.clientX, params.clientY, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.button, params.relatedTarget);
      return e;
    };
    if (origMouseEvent) {
      for (var i in origMouseEvent) {
        window.MouseEvent[i] = origMouseEvent[i];
      }
    }
    window.MouseEvent.prototype = origMouseEvent.prototype;
  }

  // ES6 stuff
  if (!Array.from) {
    Array.from = function (object) {
      return [].slice.call(object);
    };
  }

  if (!Object.assign) {
    var assign = function assign(target, source) {
      var n$ = Object.getOwnPropertyNames(source);
      for (var i = 0, p; i < n$.length; i++) {
        p = n$[i];
        target[p] = source[p];
      }
    };

    Object.assign = function (target, sources) {
      var args = [].slice.call(arguments, 1);
      for (var i = 0, s; i < args.length; i++) {
        s = args[i];
        if (s) {
          assign(target, s);
        }
      }
      return target;
    };
  }
})(window.WebComponents);

/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// minimal template polyfill
(function () {
  'use strict';

  var needsTemplate = typeof HTMLTemplateElement === 'undefined';
  var brokenDocFragment = !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment);
  var needsDocFrag = false;

  // NOTE: Replace DocumentFragment to work around IE11 bug that
  // casues children of a document fragment modified while
  // there is a mutation observer to not have a parentNode, or
  // have a broken parentNode (!?!)
  if (/Trident/.test(navigator.userAgent)) {
    (function () {

      needsDocFrag = true;

      var origCloneNode = Node.prototype.cloneNode;
      Node.prototype.cloneNode = function cloneNode(deep) {
        var newDom = origCloneNode.call(this, deep);
        if (this instanceof DocumentFragment) {
          newDom.__proto__ = DocumentFragment.prototype;
        }
        return newDom;
      };

      // IE's DocumentFragment querySelector code doesn't work when
      // called on an element instance
      DocumentFragment.prototype.querySelectorAll = HTMLElement.prototype.querySelectorAll;
      DocumentFragment.prototype.querySelector = HTMLElement.prototype.querySelector;

      Object.defineProperties(DocumentFragment.prototype, {
        'nodeType': {
          get: function get() {
            return Node.DOCUMENT_FRAGMENT_NODE;
          },
          configurable: true
        },

        'localName': {
          get: function get() {
            return undefined;
          },
          configurable: true
        },

        'nodeName': {
          get: function get() {
            return '#document-fragment';
          },
          configurable: true
        }
      });

      var origInsertBefore = Node.prototype.insertBefore;
      function insertBefore(newNode, refNode) {
        if (newNode instanceof DocumentFragment) {
          var child;
          while (child = newNode.firstChild) {
            origInsertBefore.call(this, child, refNode);
          }
        } else {
          origInsertBefore.call(this, newNode, refNode);
        }
        return newNode;
      }
      Node.prototype.insertBefore = insertBefore;

      var origAppendChild = Node.prototype.appendChild;
      Node.prototype.appendChild = function appendChild(child) {
        if (child instanceof DocumentFragment) {
          insertBefore.call(this, child, null);
        } else {
          origAppendChild.call(this, child);
        }
        return child;
      };

      var origRemoveChild = Node.prototype.removeChild;
      var origReplaceChild = Node.prototype.replaceChild;
      Node.prototype.replaceChild = function replaceChild(newChild, oldChild) {
        if (newChild instanceof DocumentFragment) {
          insertBefore.call(this, newChild, oldChild);
          origRemoveChild.call(this, oldChild);
        } else {
          origReplaceChild.call(this, newChild, oldChild);
        }
        return oldChild;
      };

      Document.prototype.createDocumentFragment = function createDocumentFragment() {
        var frag = this.createElement('df');
        frag.__proto__ = DocumentFragment.prototype;
        return frag;
      };

      var origImportNode = Document.prototype.importNode;
      Document.prototype.importNode = function importNode(impNode, deep) {
        deep = deep || false;
        var newNode = origImportNode.call(this, impNode, deep);
        if (impNode instanceof DocumentFragment) {
          newNode.__proto__ = DocumentFragment.prototype;
        }
        return newNode;
      };
    })();
  }

  // NOTE: we rely on this cloneNode not causing element upgrade.
  // This means this polyfill must load before the CE polyfill and
  // this would need to be re-worked if a browser supports native CE
  // but not <template>.
  var capturedCloneNode = Node.prototype.cloneNode;
  var capturedCreateElement = Document.prototype.createElement;
  var capturedImportNode = Document.prototype.importNode;
  var capturedRemoveChild = Node.prototype.removeChild;
  var capturedAppendChild = Node.prototype.appendChild;
  var capturedReplaceChild = Node.prototype.replaceChild;

  var elementQuerySelectorAll = Element.prototype.querySelectorAll;
  var docQuerySelectorAll = Document.prototype.querySelectorAll;
  var fragQuerySelectorAll = DocumentFragment.prototype.querySelectorAll;

  var scriptSelector = 'script:not([type]),script[type="application/javascript"],script[type="text/javascript"]';

  function QSA(node, selector) {
    // IE 11 throws a SyntaxError with `scriptSelector` if the node has no children due to the `:not([type])` syntax
    if (!node.childNodes.length) {
      return [];
    }
    switch (node.nodeType) {
      case Node.DOCUMENT_NODE:
        return docQuerySelectorAll.call(node, selector);
      case Node.DOCUMENT_FRAGMENT_NODE:
        return fragQuerySelectorAll.call(node, selector);
      default:
        return elementQuerySelectorAll.call(node, selector);
    }
  }

  // returns true if nested templates cannot be cloned (they cannot be on
  // some impl's like Safari 8 and Edge)
  // OR if cloning a document fragment does not result in a document fragment
  var needsCloning = function () {
    if (!needsTemplate) {
      var t = document.createElement('template');
      var t2 = document.createElement('template');
      t2.content.appendChild(document.createElement('div'));
      t.content.appendChild(t2);
      var clone = t.cloneNode(true);
      return clone.content.childNodes.length === 0 || clone.content.firstChild.content.childNodes.length === 0 || brokenDocFragment;
    }
  }();

  var TEMPLATE_TAG = 'template';
  var PolyfilledHTMLTemplateElement = function PolyfilledHTMLTemplateElement() {};

  if (needsTemplate) {

    var contentDoc = document.implementation.createHTMLDocument('template');
    var canDecorate = true;

    var templateStyle = document.createElement('style');
    templateStyle.textContent = TEMPLATE_TAG + '{display:none;}';

    var head = document.head;
    head.insertBefore(templateStyle, head.firstElementChild);

    /**
      Provides a minimal shim for the <template> element.
    */
    PolyfilledHTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);

    // if elements do not have `innerHTML` on instances, then
    // templates can be patched by swizzling their prototypes.
    var canProtoPatch = !document.createElement('div').hasOwnProperty('innerHTML');

    /**
      The `decorate` method moves element children to the template's `content`.
      NOTE: there is no support for dynamically adding elements to templates.
    */
    PolyfilledHTMLTemplateElement.decorate = function (template) {
      // if the template is decorated, return fast
      if (template.content) {
        return;
      }
      template.content = contentDoc.createDocumentFragment();
      var child;
      while (child = template.firstChild) {
        capturedAppendChild.call(template.content, child);
      }
      // NOTE: prefer prototype patching for performance and
      // because on some browsers (IE11), re-defining `innerHTML`
      // can result in intermittent errors.
      if (canProtoPatch) {
        template.__proto__ = PolyfilledHTMLTemplateElement.prototype;
      } else {
        template.cloneNode = function (deep) {
          return PolyfilledHTMLTemplateElement._cloneNode(this, deep);
        };
        // add innerHTML to template, if possible
        // Note: this throws on Safari 7
        if (canDecorate) {
          try {
            defineInnerHTML(template);
            defineOuterHTML(template);
          } catch (err) {
            canDecorate = false;
          }
        }
      }
      // bootstrap recursively
      PolyfilledHTMLTemplateElement.bootstrap(template.content);
    };

    var defineInnerHTML = function defineInnerHTML(obj) {
      Object.defineProperty(obj, 'innerHTML', {
        get: function get() {
          var o = '';
          for (var e = this.content.firstChild; e; e = e.nextSibling) {
            o += e.outerHTML || escapeData(e.data);
          }
          return o;
        },
        set: function set(text) {
          contentDoc.body.innerHTML = text;
          PolyfilledHTMLTemplateElement.bootstrap(contentDoc);
          while (this.content.firstChild) {
            capturedRemoveChild.call(this.content, this.content.firstChild);
          }
          while (contentDoc.body.firstChild) {
            capturedAppendChild.call(this.content, contentDoc.body.firstChild);
          }
        },
        configurable: true
      });
    };

    var defineOuterHTML = function defineOuterHTML(obj) {
      Object.defineProperty(obj, 'outerHTML', {
        get: function get() {
          return '<' + TEMPLATE_TAG + '>' + this.innerHTML + '</' + TEMPLATE_TAG + '>';
        },
        set: function set(innerHTML) {
          if (this.parentNode) {
            contentDoc.body.innerHTML = innerHTML;
            var docFrag = this.ownerDocument.createDocumentFragment();
            while (contentDoc.body.firstChild) {
              capturedAppendChild.call(docFrag, contentDoc.body.firstChild);
            }
            capturedReplaceChild.call(this.parentNode, docFrag, this);
          } else {
            throw new Error("Failed to set the 'outerHTML' property on 'Element': This element has no parent node.");
          }
        },
        configurable: true
      });
    };

    defineInnerHTML(PolyfilledHTMLTemplateElement.prototype);
    defineOuterHTML(PolyfilledHTMLTemplateElement.prototype);

    /**
      The `bootstrap` method is called automatically and "fixes" all
      <template> elements in the document referenced by the `doc` argument.
    */
    PolyfilledHTMLTemplateElement.bootstrap = function bootstrap(doc) {
      var templates = QSA(doc, TEMPLATE_TAG);
      for (var i = 0, l = templates.length, t; i < l && (t = templates[i]); i++) {
        PolyfilledHTMLTemplateElement.decorate(t);
      }
    };

    // auto-bootstrapping for main document
    document.addEventListener('DOMContentLoaded', function () {
      PolyfilledHTMLTemplateElement.bootstrap(document);
    });

    // Patch document.createElement to ensure newly created templates have content
    Document.prototype.createElement = function createElement() {
      var el = capturedCreateElement.apply(this, arguments);
      if (el.localName === 'template') {
        PolyfilledHTMLTemplateElement.decorate(el);
      }
      return el;
    };

    var escapeDataRegExp = /[&\u00A0<>]/g;

    var escapeReplace = function escapeReplace(c) {
      switch (c) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '\xA0':
          return '&nbsp;';
      }
    };

    var escapeData = function escapeData(s) {
      return s.replace(escapeDataRegExp, escapeReplace);
    };
  }

  // make cloning/importing work!
  if (needsTemplate || needsCloning) {

    PolyfilledHTMLTemplateElement._cloneNode = function _cloneNode(template, deep) {
      var clone = capturedCloneNode.call(template, false);
      // NOTE: decorate doesn't auto-fix children because they are already
      // decorated so they need special clone fixup.
      if (this.decorate) {
        this.decorate(clone);
      }
      if (deep) {
        // NOTE: use native clone node to make sure CE's wrapped
        // cloneNode does not cause elements to upgrade.
        capturedAppendChild.call(clone.content, capturedCloneNode.call(template.content, true));
        // now ensure nested templates are cloned correctly.
        fixClonedDom(clone.content, template.content);
      }
      return clone;
    };

    // Given a source and cloned subtree, find <template>'s in the cloned
    // subtree and replace them with cloned <template>'s from source.
    // We must do this because only the source templates have proper .content.
    var fixClonedDom = function fixClonedDom(clone, source) {
      // do nothing if cloned node is not an element
      if (!source.querySelectorAll) return;
      // these two lists should be coincident
      var s$ = QSA(source, TEMPLATE_TAG);
      if (s$.length === 0) {
        return;
      }
      var t$ = QSA(clone, TEMPLATE_TAG);
      for (var i = 0, l = t$.length, t, s; i < l; i++) {
        s = s$[i];
        t = t$[i];
        if (PolyfilledHTMLTemplateElement && PolyfilledHTMLTemplateElement.decorate) {
          PolyfilledHTMLTemplateElement.decorate(s);
        }
        capturedReplaceChild.call(t.parentNode, cloneNode.call(s, true), t);
      }
    };

    // make sure scripts inside of a cloned template are executable
    var fixClonedScripts = function fixClonedScripts(fragment) {
      var scripts = QSA(fragment, scriptSelector);
      for (var ns, s, i = 0; i < scripts.length; i++) {
        s = scripts[i];
        ns = capturedCreateElement.call(document, 'script');
        ns.textContent = s.textContent;
        var attrs = s.attributes;
        for (var ai = 0, a; ai < attrs.length; ai++) {
          a = attrs[ai];
          ns.setAttribute(a.name, a.value);
        }
        capturedReplaceChild.call(s.parentNode, ns, s);
      }
    };

    // override all cloning to fix the cloned subtree to contain properly
    // cloned templates.
    var cloneNode = Node.prototype.cloneNode = function cloneNode(deep) {
      var dom;
      // workaround for Edge bug cloning documentFragments
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8619646/
      if (!needsDocFrag && brokenDocFragment && this instanceof DocumentFragment) {
        if (!deep) {
          return this.ownerDocument.createDocumentFragment();
        } else {
          dom = importNode.call(this.ownerDocument, this, true);
        }
      } else if (this.nodeType === Node.ELEMENT_NODE && this.localName === TEMPLATE_TAG) {
        dom = PolyfilledHTMLTemplateElement._cloneNode(this, deep);
      } else {
        dom = capturedCloneNode.call(this, deep);
      }
      // template.content is cloned iff `deep`.
      if (deep) {
        fixClonedDom(dom, this);
      }
      return dom;
    };

    // NOTE: we are cloning instead of importing <template>'s.
    // However, the ownerDocument of the cloned template will be correct!
    // This is because the native import node creates the right document owned
    // subtree and `fixClonedDom` inserts cloned templates into this subtree,
    // thus updating the owner doc.
    var importNode = Document.prototype.importNode = function importNode(element, deep) {
      deep = deep || false;
      if (element.localName === TEMPLATE_TAG) {
        return PolyfilledHTMLTemplateElement._cloneNode(element, deep);
      } else {
        var dom = capturedImportNode.call(this, element, deep);
        if (deep) {
          fixClonedDom(dom, element);
          fixClonedScripts(dom);
        }
        return dom;
      }
    };
  }

  if (needsTemplate) {
    window.HTMLTemplateElement = PolyfilledHTMLTemplateElement;
  }
})();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function objectOrFunction(x) {
  var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function _isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var TRY_CATCH_ERROR = { error: null };

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    TRY_CATCH_ERROR.error = error;
    return TRY_CATCH_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === TRY_CATCH_ERROR) {
      reject(promise, TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    classCallCheck(this, Enumerator);

    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  createClass(Enumerator, [{
    key: '_enumerate',
    value: function _enumerate(input) {
      for (var i = 0; this._state === PENDING && i < input.length; i++) {
        this._eachEntry(input[i], i);
      }
    }
  }, {
    key: '_eachEntry',
    value: function _eachEntry(entry, i) {
      var c = this._instanceConstructor;
      var resolve$$1 = c.resolve;


      if (resolve$$1 === resolve$1) {
        var _then = getThen(entry);

        if (_then === then && entry._state !== PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof _then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === Promise$3) {
          var promise = new c(noop);
          handleMaybeThenable(promise, entry, _then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function (resolve$$1) {
            return resolve$$1(entry);
          }), i);
        }
      } else {
        this._willSettleAt(resolve$$1(entry), i);
      }
    }
  }, {
    key: '_settledAt',
    value: function _settledAt(state, i, value) {
      var promise = this.promise;


      if (promise._state === PENDING) {
        this._remaining--;

        if (state === REJECTED) {
          reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        fulfill(promise, this._result);
      }
    }
  }, {
    key: '_willSettleAt',
    value: function _willSettleAt(promise, i) {
      var enumerator = this;

      subscribe(promise, undefined, function (value) {
        return enumerator._settledAt(FULFILLED, i, value);
      }, function (reason) {
        return enumerator._settledAt(REJECTED, i, reason);
      });
    }
  }]);
  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$3 = function () {
  function Promise(resolver) {
    classCallCheck(this, Promise);

    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  createClass(Promise, [{
    key: 'catch',
    value: function _catch(onRejection) {
      return this.then(null, onRejection);
    }

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves
    
      Synchronous example:
    
      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }
    
      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```
    
      Asynchronous example:
    
      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```
    
      @method finally
      @param {Function} callback
      @return {Promise}
    */

  }, {
    key: 'finally',
    value: function _finally(callback) {
      var promise = this;
      var constructor = promise.constructor;

      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }
  }]);
  return Promise;
}();

Promise$3.prototype.then = then;
Promise$3.all = all;
Promise$3.race = race;
Promise$3.resolve = resolve$1;
Promise$3.reject = reject$1;
Promise$3._setScheduler = setScheduler;
Promise$3._setAsap = setAsap;
Promise$3._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$3;
}

// Strange compat..
Promise$3.polyfill = polyfill;
Promise$3.Promise = Promise$3;

Promise$3.polyfill();

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// Establish scope.

window['WebComponents'] = window['WebComponents'] || { 'flags': {} };

// loading script
var file = 'webcomponents-lite.js';
var script = document.querySelector('script[src*="' + file + '"]');
var flagMatcher = /wc-(.+)/;

// Flags. Convert url arguments to flags
var flags = {};
if (!flags['noOpts']) {
  // from url
  location.search.slice(1).split('&').forEach(function (option) {
    var parts = option.split('=');
    var match = void 0;
    if (parts[0] && (match = parts[0].match(flagMatcher))) {
      flags[match[1]] = parts[1] || true;
    }
  });
  // from script
  if (script) {
    for (var i = 0, a; a = script.attributes[i]; i++) {
      if (a.name !== 'src') {
        flags[a.name] = a.value || true;
      }
    }
  }
  // log flags
  if (flags['log'] && flags['log']['split']) {
    var parts = flags['log'].split(',');
    flags['log'] = {};
    parts.forEach(function (f) {
      flags['log'][f] = true;
    });
  } else {
    flags['log'] = {};
  }
}

// exports
window['WebComponents']['flags'] = flags;
var forceShady = flags['shadydom'];
if (forceShady) {
  window['ShadyDOM'] = window['ShadyDOM'] || {};
  window['ShadyDOM']['force'] = forceShady;
}

var forceCE = flags['register'] || flags['ce'];
if (forceCE && window['customElements']) {
  window['customElements']['forcePolyfill'] = forceCE;
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var settings = window['ShadyDOM'] || {};

settings.hasNativeShadowDOM = Boolean(Element.prototype.attachShadow && Node.prototype.getRootNode);

var desc = Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild');

settings.hasDescriptors = Boolean(desc && desc.configurable && desc.get);
settings.inUse = settings['force'] || !settings.hasNativeShadowDOM;

function isTrackingLogicalChildNodes(node) {
  return node.__shady && node.__shady.firstChild !== undefined;
}

function isShadyRoot(obj) {
  return Boolean(obj.__localName === 'ShadyRoot');
}

function ownerShadyRootForNode(node) {
  var root = node.getRootNode();
  if (isShadyRoot(root)) {
    return root;
  }
}

var p = Element.prototype;
var matches = p.matches || p.matchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || p.webkitMatchesSelector;

function matchesSelector(element, selector) {
  return matches.call(element, selector);
}

function copyOwnProperty(name, source, target) {
  var pd = Object.getOwnPropertyDescriptor(source, name);
  if (pd) {
    Object.defineProperty(target, name, pd);
  }
}

function extend(target, source) {
  if (target && source) {
    var n$ = Object.getOwnPropertyNames(source);
    for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
      copyOwnProperty(n, source, target);
    }
  }
  return target || source;
}

function extendAll(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < sources.length; i++) {
    extend(target, sources[i]);
  }
  return target;
}

function mixin(target, source) {
  for (var i in source) {
    target[i] = source[i];
  }
  return target;
}

function patchPrototype(obj, mixin) {
  var proto = Object.getPrototypeOf(obj);
  if (!proto.hasOwnProperty('__patchProto')) {
    var patchProto = Object.create(proto);
    patchProto.__sourceProto = proto;
    extend(patchProto, mixin);
    proto['__patchProto'] = patchProto;
  }
  // old browsers don't have setPrototypeOf
  obj.__proto__ = proto['__patchProto'];
}

var twiddle = document.createTextNode('');
var content = 0;
var queue$1 = [];
new MutationObserver(function () {
  while (queue$1.length) {
    // catch errors in user code...
    try {
      queue$1.shift()();
    } catch (e) {
      // enqueue another record and throw
      twiddle.textContent = content++;
      throw e;
    }
  }
}).observe(twiddle, { characterData: true });

// use MutationObserver to get microtask async timing.
function microtask(callback) {
  queue$1.push(callback);
  twiddle.textContent = content++;
}

var hasDocumentContains = Boolean(document.contains);

function contains(container, node) {
  while (node) {
    if (node == container) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// render enqueuer/flusher
var flushList = [];
var scheduled = void 0;
function enqueue(callback) {
  if (!scheduled) {
    scheduled = true;
    microtask(flush$1);
  }
  flushList.push(callback);
}

function flush$1() {
  scheduled = false;
  var didFlush = Boolean(flushList.length);
  while (flushList.length) {
    flushList.shift()();
  }
  return didFlush;
}

flush$1['list'] = flushList;

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var AsyncObserver = function () {
  function AsyncObserver() {
    classCallCheck(this, AsyncObserver);

    this._scheduled = false;
    this.addedNodes = [];
    this.removedNodes = [];
    this.callbacks = new Set();
  }

  createClass(AsyncObserver, [{
    key: 'schedule',
    value: function schedule() {
      var _this = this;

      if (!this._scheduled) {
        this._scheduled = true;
        microtask(function () {
          _this.flush();
        });
      }
    }
  }, {
    key: 'flush',
    value: function flush() {
      if (this._scheduled) {
        this._scheduled = false;
        var mutations = this.takeRecords();
        if (mutations.length) {
          this.callbacks.forEach(function (cb) {
            cb(mutations);
          });
        }
      }
    }
  }, {
    key: 'takeRecords',
    value: function takeRecords() {
      if (this.addedNodes.length || this.removedNodes.length) {
        var mutations = [{
          addedNodes: this.addedNodes,
          removedNodes: this.removedNodes
        }];
        this.addedNodes = [];
        this.removedNodes = [];
        return mutations;
      }
      return [];
    }
  }]);
  return AsyncObserver;
}();

// TODO(sorvell): consider instead polyfilling MutationObserver
// directly so that users do not have to fork their code.
// Supporting the entire api may be challenging: e.g. filtering out
// removed nodes in the wrong scope and seeing non-distributing
// subtree child mutations.


var observeChildren = function observeChildren(node, callback) {
  node.__shady = node.__shady || {};
  if (!node.__shady.observer) {
    node.__shady.observer = new AsyncObserver();
  }
  node.__shady.observer.callbacks.add(callback);
  var observer = node.__shady.observer;
  return {
    _callback: callback,
    _observer: observer,
    _node: node,
    takeRecords: function takeRecords() {
      return observer.takeRecords();
    }
  };
};

var unobserveChildren = function unobserveChildren(handle) {
  var observer = handle && handle._observer;
  if (observer) {
    observer.callbacks.delete(handle._callback);
    if (!observer.callbacks.size) {
      handle._node.__shady.observer = null;
    }
  }
};

function filterMutations(mutations, target) {
  /** @const {Node} */
  var targetRootNode = target.getRootNode();
  return mutations.map(function (mutation) {
    /** @const {boolean} */
    var mutationInScope = targetRootNode === mutation.target.getRootNode();
    if (mutationInScope && mutation.addedNodes) {
      var nodes = Array.from(mutation.addedNodes).filter(function (n) {
        return targetRootNode === n.getRootNode();
      });
      if (nodes.length) {
        mutation = Object.create(mutation);
        Object.defineProperty(mutation, 'addedNodes', {
          value: nodes,
          configurable: true
        });
        return mutation;
      }
    } else if (mutationInScope) {
      return mutation;
    }
  }).filter(function (m) {
    return m;
  });
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var appendChild = Element.prototype.appendChild;
var insertBefore = Element.prototype.insertBefore;
var removeChild = Element.prototype.removeChild;
var setAttribute = Element.prototype.setAttribute;
var removeAttribute = Element.prototype.removeAttribute;
var cloneNode = Element.prototype.cloneNode;
var importNode = Document.prototype.importNode;
var addEventListener = Element.prototype.addEventListener;
var removeEventListener = Element.prototype.removeEventListener;
var windowAddEventListener = Window.prototype.addEventListener;
var windowRemoveEventListener = Window.prototype.removeEventListener;
var dispatchEvent = Element.prototype.dispatchEvent;
var querySelector = Element.prototype.querySelector;
var querySelectorAll = Element.prototype.querySelectorAll;
var contains$1 = Node.prototype.contains || HTMLElement.prototype.contains;

var nativeMethods = Object.freeze({
	appendChild: appendChild,
	insertBefore: insertBefore,
	removeChild: removeChild,
	setAttribute: setAttribute,
	removeAttribute: removeAttribute,
	cloneNode: cloneNode,
	importNode: importNode,
	addEventListener: addEventListener,
	removeEventListener: removeEventListener,
	windowAddEventListener: windowAddEventListener,
	windowRemoveEventListener: windowRemoveEventListener,
	dispatchEvent: dispatchEvent,
	querySelector: querySelector,
	querySelectorAll: querySelectorAll,
	contains: contains$1
});

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// Cribbed from ShadowDOM polyfill
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/ShadowDOM/wrappers/HTMLElement.js#L28
/////////////////////////////////////////////////////////////////////////////
// innerHTML and outerHTML

// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString
var escapeAttrRegExp = /[&\u00A0"]/g;
var escapeDataRegExp = /[&\u00A0<>]/g;

function escapeReplace(c) {
  switch (c) {
    case '&':
      return '&amp;';
    case '<':
      return '&lt;';
    case '>':
      return '&gt;';
    case '"':
      return '&quot;';
    case '\xA0':
      return '&nbsp;';
  }
}

function escapeAttr(s) {
  return s.replace(escapeAttrRegExp, escapeReplace);
}

function escapeData(s) {
  return s.replace(escapeDataRegExp, escapeReplace);
}

function makeSet(arr) {
  var set = {};
  for (var i = 0; i < arr.length; i++) {
    set[arr[i]] = true;
  }
  return set;
}

// http://www.whatwg.org/specs/web-apps/current-work/#void-elements
var voidElements = makeSet(['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

var plaintextParents = makeSet(['style', 'script', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext', 'noscript']);

/**
 * @param {Node} node
 * @param {Node} parentNode
 * @param {Function=} callback
 */
function getOuterHTML(node, parentNode, callback) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      {
        var tagName = node.localName;
        var s = '<' + tagName;
        var attrs = node.attributes;
        for (var i = 0, attr; attr = attrs[i]; i++) {
          s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
        }
        s += '>';
        if (voidElements[tagName]) {
          return s;
        }
        return s + getInnerHTML(node, callback) + '</' + tagName + '>';
      }
    case Node.TEXT_NODE:
      {
        var data = /** @type {Text} */node.data;
        if (parentNode && plaintextParents[parentNode.localName]) {
          return data;
        }
        return escapeData(data);
      }
    case Node.COMMENT_NODE:
      {
        return '<!--' + /** @type {Comment} */node.data + '-->';
      }
    default:
      {
        window.console.error(node);
        throw new Error('not implemented');
      }
  }
}

/**
 * @param {Node} node
 * @param {Function=} callback
 */
function getInnerHTML(node, callback) {
  if (node.localName === 'template') {
    node = /** @type {HTMLTemplateElement} */node.content;
  }
  var s = '';
  var c$ = callback ? callback(node) : node.childNodes;
  for (var i = 0, l = c$.length, child; i < l && (child = c$[i]); i++) {
    s += getOuterHTML(child, node, callback);
  }
  return s;
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var nodeWalker = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);

var elementWalker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, null, false);

function parentNode(node) {
  nodeWalker.currentNode = node;
  return nodeWalker.parentNode();
}

function firstChild(node) {
  nodeWalker.currentNode = node;
  return nodeWalker.firstChild();
}

function lastChild(node) {
  nodeWalker.currentNode = node;
  return nodeWalker.lastChild();
}

function previousSibling(node) {
  nodeWalker.currentNode = node;
  return nodeWalker.previousSibling();
}

function nextSibling(node) {
  nodeWalker.currentNode = node;
  return nodeWalker.nextSibling();
}

function childNodes(node) {
  var nodes = [];
  nodeWalker.currentNode = node;
  var n = nodeWalker.firstChild();
  while (n) {
    nodes.push(n);
    n = nodeWalker.nextSibling();
  }
  return nodes;
}

function parentElement(node) {
  elementWalker.currentNode = node;
  return elementWalker.parentNode();
}

function firstElementChild(node) {
  elementWalker.currentNode = node;
  return elementWalker.firstChild();
}

function lastElementChild(node) {
  elementWalker.currentNode = node;
  return elementWalker.lastChild();
}

function previousElementSibling(node) {
  elementWalker.currentNode = node;
  return elementWalker.previousSibling();
}

function nextElementSibling(node) {
  elementWalker.currentNode = node;
  return elementWalker.nextSibling();
}

function children(node) {
  var nodes = [];
  elementWalker.currentNode = node;
  var n = elementWalker.firstChild();
  while (n) {
    nodes.push(n);
    n = elementWalker.nextSibling();
  }
  return nodes;
}

function innerHTML(node) {
  return getInnerHTML(node, function (n) {
    return childNodes(n);
  });
}

function textContent(node) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
    case Node.DOCUMENT_FRAGMENT_NODE:
      var textWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
      var content = '',
          n = void 0;
      while (n = textWalker.nextNode()) {
        // TODO(sorvell): can't use textContent since we patch it on Node.prototype!
        // However, should probably patch it only on element.
        content += n.nodeValue;
      }
      return content;
    default:
      return node.nodeValue;
  }
}

var nativeTree = Object.freeze({
	parentNode: parentNode,
	firstChild: firstChild,
	lastChild: lastChild,
	previousSibling: previousSibling,
	nextSibling: nextSibling,
	childNodes: childNodes,
	parentElement: parentElement,
	firstElementChild: firstElementChild,
	lastElementChild: lastElementChild,
	previousElementSibling: previousElementSibling,
	nextElementSibling: nextElementSibling,
	children: children,
	innerHTML: innerHTML,
	textContent: textContent
});

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

var nativeInnerHTMLDesc = /** @type {ObjectPropertyDescriptor} */Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML') || Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML');

var inertDoc = document.implementation.createHTMLDocument('inert');

var nativeActiveElementDescriptor =
/** @type {ObjectPropertyDescriptor} */Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement');
function getDocumentActiveElement() {
  if (nativeActiveElementDescriptor && nativeActiveElementDescriptor.get) {
    return nativeActiveElementDescriptor.get.call(document);
  } else if (!settings.hasDescriptors) {
    return document.activeElement;
  }
}

function activeElementForNode(node) {
  var active = getDocumentActiveElement();
  // In IE11, activeElement might be an empty object if the document is
  // contained in an iframe.
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10998788/
  if (!active || !active.nodeType) {
    return null;
  }
  var isShadyRoot$$1 = !!isShadyRoot(node);
  if (node !== document) {
    // If this node isn't a document or shady root, then it doesn't have
    // an active element.
    if (!isShadyRoot$$1) {
      return null;
    }
    // If this shady root's host is the active element or the active
    // element is not a descendant of the host (in the composed tree),
    // then it doesn't have an active element.
    if (node.host === active || !contains$1.call(node.host, active)) {
      return null;
    }
  }
  // This node is either the document or a shady root of which the active
  // element is a (composed) descendant of its host; iterate upwards to
  // find the active element's most shallow host within it.
  var activeRoot = ownerShadyRootForNode(active);
  while (activeRoot && activeRoot !== node) {
    active = activeRoot.host;
    activeRoot = ownerShadyRootForNode(active);
  }
  if (node === document) {
    // This node is the document, so activeRoot should be null.
    return activeRoot ? null : active;
  } else {
    // This node is a non-document shady root, and it should be
    // activeRoot.
    return activeRoot === node ? active : null;
  }
}

var OutsideAccessors = {

  parentElement: {
    /** @this {Node} */
    get: function get() {
      var l = this.__shady && this.__shady.parentNode;
      if (l && l.nodeType !== Node.ELEMENT_NODE) {
        l = null;
      }
      return l !== undefined ? l : parentElement(this);
    },

    configurable: true
  },

  parentNode: {
    /** @this {Node} */
    get: function get() {
      var l = this.__shady && this.__shady.parentNode;
      return l !== undefined ? l : parentNode(this);
    },

    configurable: true
  },

  nextSibling: {
    /** @this {Node} */
    get: function get() {
      var l = this.__shady && this.__shady.nextSibling;
      return l !== undefined ? l : nextSibling(this);
    },

    configurable: true
  },

  previousSibling: {
    /** @this {Node} */
    get: function get() {
      var l = this.__shady && this.__shady.previousSibling;
      return l !== undefined ? l : previousSibling(this);
    },

    configurable: true
  },

  className: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      return this.getAttribute('class') || '';
    },

    /**
     * @this {HTMLElement}
     */
    set: function set(value) {
      this.setAttribute('class', value);
    },

    configurable: true
  },

  // fragment, element, document
  nextElementSibling: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      if (this.__shady && this.__shady.nextSibling !== undefined) {
        var n = this.nextSibling;
        while (n && n.nodeType !== Node.ELEMENT_NODE) {
          n = n.nextSibling;
        }
        return n;
      } else {
        return nextElementSibling(this);
      }
    },

    configurable: true
  },

  previousElementSibling: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      if (this.__shady && this.__shady.previousSibling !== undefined) {
        var n = this.previousSibling;
        while (n && n.nodeType !== Node.ELEMENT_NODE) {
          n = n.previousSibling;
        }
        return n;
      } else {
        return previousElementSibling(this);
      }
    },

    configurable: true
  }

};

var InsideAccessors = {

  childNodes: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      var childNodes$$1 = void 0;
      if (isTrackingLogicalChildNodes(this)) {
        if (!this.__shady.childNodes) {
          this.__shady.childNodes = [];
          for (var n = this.firstChild; n; n = n.nextSibling) {
            this.__shady.childNodes.push(n);
          }
        }
        childNodes$$1 = this.__shady.childNodes;
      } else {
        childNodes$$1 = childNodes(this);
      }
      childNodes$$1.item = function (index) {
        return childNodes$$1[index];
      };
      return childNodes$$1;
    },

    configurable: true
  },

  childElementCount: {
    /** @this {HTMLElement} */
    get: function get() {
      return this.children.length;
    },

    configurable: true
  },

  firstChild: {
    /** @this {HTMLElement} */
    get: function get() {
      var l = this.__shady && this.__shady.firstChild;
      return l !== undefined ? l : firstChild(this);
    },

    configurable: true
  },

  lastChild: {
    /** @this {HTMLElement} */
    get: function get() {
      var l = this.__shady && this.__shady.lastChild;
      return l !== undefined ? l : lastChild(this);
    },

    configurable: true
  },

  textContent: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      if (isTrackingLogicalChildNodes(this)) {
        var tc = [];
        for (var i = 0, cn = this.childNodes, c; c = cn[i]; i++) {
          if (c.nodeType !== Node.COMMENT_NODE) {
            tc.push(c.textContent);
          }
        }
        return tc.join('');
      } else {
        return textContent(this);
      }
    },

    /**
     * @this {HTMLElement}
     * @param {string} text
     */
    set: function set(text) {
      if (typeof text === 'undefined' || text === null) {
        text = '';
      }
      switch (this.nodeType) {
        case Node.ELEMENT_NODE:
        case Node.DOCUMENT_FRAGMENT_NODE:
          clearNode(this);
          // Document fragments must have no childnodes if setting a blank string
          if (text.length > 0 || this.nodeType === Node.ELEMENT_NODE) {
            this.appendChild(document.createTextNode(text));
          }
          break;
        default:
          // TODO(sorvell): can't do this if patch nodeValue.
          this.nodeValue = text;
          break;
      }
    },

    configurable: true
  },

  // fragment, element, document
  firstElementChild: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      if (this.__shady && this.__shady.firstChild !== undefined) {
        var n = this.firstChild;
        while (n && n.nodeType !== Node.ELEMENT_NODE) {
          n = n.nextSibling;
        }
        return n;
      } else {
        return firstElementChild(this);
      }
    },

    configurable: true
  },

  lastElementChild: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      if (this.__shady && this.__shady.lastChild !== undefined) {
        var n = this.lastChild;
        while (n && n.nodeType !== Node.ELEMENT_NODE) {
          n = n.previousSibling;
        }
        return n;
      } else {
        return lastElementChild(this);
      }
    },

    configurable: true
  },

  children: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      var children$$1 = void 0;
      if (isTrackingLogicalChildNodes(this)) {
        children$$1 = Array.prototype.filter.call(this.childNodes, function (n) {
          return n.nodeType === Node.ELEMENT_NODE;
        });
      } else {
        children$$1 = children(this);
      }
      children$$1.item = function (index) {
        return children$$1[index];
      };
      return children$$1;
    },

    configurable: true
  },

  // element (HTMLElement on IE11)
  innerHTML: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      var content = this.localName === 'template' ?
      /** @type {HTMLTemplateElement} */this.content : this;
      if (isTrackingLogicalChildNodes(this)) {
        return getInnerHTML(content);
      } else {
        return innerHTML(content);
      }
    },

    /**
     * @this {HTMLElement}
     */
    set: function set(text) {
      var content = this.localName === 'template' ?
      /** @type {HTMLTemplateElement} */this.content : this;
      clearNode(content);
      var containerName = this.localName;
      if (!containerName || containerName === 'template') {
        containerName = 'div';
      }
      var htmlContainer = inertDoc.createElement(containerName);
      if (nativeInnerHTMLDesc && nativeInnerHTMLDesc.set) {
        nativeInnerHTMLDesc.set.call(htmlContainer, text);
      } else {
        htmlContainer.innerHTML = text;
      }
      while (htmlContainer.firstChild) {
        content.appendChild(htmlContainer.firstChild);
      }
    },

    configurable: true
  }

};

// Note: Can be patched on element prototype on all browsers.
// Must be patched on instance on browsers that support native Shadow DOM
// but do not have builtin accessors (old Chrome).
var ShadowRootAccessor = {

  shadowRoot: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      return this.__shady && this.__shady.publicRoot || null;
    },

    configurable: true
  }
};

// Note: Can be patched on document prototype on browsers with builtin accessors.
// Must be patched separately on simulated ShadowRoot.
// Must be patched as `_activeElement` on browsers without builtin accessors.
var ActiveElementAccessor = {

  activeElement: {
    /**
     * @this {HTMLElement}
     */
    get: function get() {
      return activeElementForNode(this);
    },

    /**
     * @this {HTMLElement}
     */
    set: function set() {},

    configurable: true
  }

};

// patch a group of descriptors on an object only if it exists or if the `force`
// argument is true.
/**
 * @param {!Object} obj
 * @param {!Object} descriptors
 * @param {boolean=} force
 */
function patchAccessorGroup(obj, descriptors, force) {
  for (var p in descriptors) {
    var objDesc = Object.getOwnPropertyDescriptor(obj, p);
    if (objDesc && objDesc.configurable || !objDesc && force) {
      Object.defineProperty(obj, p, descriptors[p]);
    } else if (force) {
      console.warn('Could not define', p, 'on', obj);
    }
  }
}

// patch dom accessors on proto where they exist
function patchAccessors(proto) {
  patchAccessorGroup(proto, OutsideAccessors);
  patchAccessorGroup(proto, InsideAccessors);
  patchAccessorGroup(proto, ActiveElementAccessor);
}

// ensure element descriptors (IE/Edge don't have em)
function patchShadowRootAccessors(proto) {
  patchAccessorGroup(proto, InsideAccessors, true);
  patchAccessorGroup(proto, ActiveElementAccessor, true);
}

// ensure an element has patched "outside" accessors; no-op when not needed
var patchOutsideElementAccessors = settings.hasDescriptors ? function () {} : function (element) {
  if (!(element.__shady && element.__shady.__outsideAccessors)) {
    element.__shady = element.__shady || {};
    element.__shady.__outsideAccessors = true;
    patchAccessorGroup(element, OutsideAccessors, true);
  }
};

// ensure an element has patched "inside" accessors; no-op when not needed
var patchInsideElementAccessors = settings.hasDescriptors ? function () {} : function (element) {
  if (!(element.__shady && element.__shady.__insideAccessors)) {
    element.__shady = element.__shady || {};
    element.__shady.__insideAccessors = true;
    patchAccessorGroup(element, InsideAccessors, true);
    patchAccessorGroup(element, ShadowRootAccessor, true);
  }
};

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function recordInsertBefore(node, container, ref_node) {
  patchInsideElementAccessors(container);
  container.__shady = container.__shady || {};
  if (container.__shady.firstChild !== undefined) {
    container.__shady.childNodes = null;
  }
  // handle document fragments
  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    var c$ = node.childNodes;
    for (var i = 0; i < c$.length; i++) {
      linkNode(c$[i], container, ref_node);
    }
    // cleanup logical dom in doc fragment.
    node.__shady = node.__shady || {};
    var resetTo = node.__shady.firstChild !== undefined ? null : undefined;
    node.__shady.firstChild = node.__shady.lastChild = resetTo;
    node.__shady.childNodes = resetTo;
  } else {
    linkNode(node, container, ref_node);
  }
}

function linkNode(node, container, ref_node) {
  patchOutsideElementAccessors(node);
  ref_node = ref_node || null;
  node.__shady = node.__shady || {};
  container.__shady = container.__shady || {};
  if (ref_node) {
    ref_node.__shady = ref_node.__shady || {};
  }
  // update ref_node.previousSibling <-> node
  node.__shady.previousSibling = ref_node ? ref_node.__shady.previousSibling : container.lastChild;
  var ps = node.__shady.previousSibling;
  if (ps && ps.__shady) {
    ps.__shady.nextSibling = node;
  }
  // update node <-> ref_node
  var ns = node.__shady.nextSibling = ref_node;
  if (ns && ns.__shady) {
    ns.__shady.previousSibling = node;
  }
  // update node <-> container
  node.__shady.parentNode = container;
  if (ref_node) {
    if (ref_node === container.__shady.firstChild) {
      container.__shady.firstChild = node;
    }
  } else {
    container.__shady.lastChild = node;
    if (!container.__shady.firstChild) {
      container.__shady.firstChild = node;
    }
  }
  // remove caching of childNodes
  container.__shady.childNodes = null;
}

function recordRemoveChild(node, container) {
  node.__shady = node.__shady || {};
  container.__shady = container.__shady || {};
  if (node === container.__shady.firstChild) {
    container.__shady.firstChild = node.__shady.nextSibling;
  }
  if (node === container.__shady.lastChild) {
    container.__shady.lastChild = node.__shady.previousSibling;
  }
  var p = node.__shady.previousSibling;
  var n = node.__shady.nextSibling;
  if (p) {
    p.__shady = p.__shady || {};
    p.__shady.nextSibling = n;
  }
  if (n) {
    n.__shady = n.__shady || {};
    n.__shady.previousSibling = p;
  }
  // When an element is removed, logical data is no longer tracked.
  // Explicitly set `undefined` here to indicate this. This is disginguished
  // from `null` which is set if info is null.
  node.__shady.parentNode = node.__shady.previousSibling = node.__shady.nextSibling = undefined;
  if (container.__shady.childNodes !== undefined) {
    // remove caching of childNodes
    container.__shady.childNodes = null;
  }
}

var recordChildNodes = function recordChildNodes(node) {
  if (!node.__shady || node.__shady.firstChild === undefined) {
    node.__shady = node.__shady || {};
    node.__shady.firstChild = firstChild(node);
    node.__shady.lastChild = lastChild(node);
    patchInsideElementAccessors(node);
    var c$ = node.__shady.childNodes = childNodes(node);
    for (var i = 0, n; i < c$.length && (n = c$[i]); i++) {
      n.__shady = n.__shady || {};
      n.__shady.parentNode = node;
      n.__shady.nextSibling = c$[i + 1] || null;
      n.__shady.previousSibling = c$[i - 1] || null;
      patchOutsideElementAccessors(n);
    }
  }
};

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// Patched `insertBefore`. Note that all mutations that add nodes are routed
// here. When a <slot> is added or a node is added to a host with a shadowRoot
// with a slot, a standard dom `insert` call is aborted and `_asyncRender`
// is called on the relevant shadowRoot. In all other cases, a standard dom
// `insert` can be made, but the location and ref_node may need to be changed.
/**
 * @param {Node} parent
 * @param {Node} node
 * @param {Node=} ref_node
 */
function insertBefore$1(parent, node, ref_node) {
  if (node === parent) {
    throw Error('Failed to execute \'appendChild\' on \'Node\': The new child element contains the parent.');
  }
  if (ref_node) {
    var p = ref_node.__shady && ref_node.__shady.parentNode;
    if (p !== undefined && p !== parent || p === undefined && parentNode(ref_node) !== parent) {
      throw Error('Failed to execute \'insertBefore\' on \'Node\': The node ' + 'before which the new node is to be inserted is not a child of this node.');
    }
  }
  if (ref_node === node) {
    return node;
  }
  // remove from existing location
  if (node.parentNode) {
    // NOTE: avoid node.removeChild as this *can* trigger another patched
    // method (e.g. custom elements) and we want only the shady method to run.
    removeChild$1(node.parentNode, node);
  }
  // add to new parent
  var preventNativeInsert = void 0;
  var ownerRoot = ownerShadyRootForNode(parent);
  // if a slot is added, must render containing root.
  var slotsAdded = ownerRoot && findContainedSlots(node);
  if (slotsAdded) {
    ownerRoot._addSlots(slotsAdded);
  }
  if (ownerRoot && (parent.localName === 'slot' || slotsAdded)) {
    ownerRoot._asyncRender();
  }
  if (isTrackingLogicalChildNodes(parent)) {
    recordInsertBefore(node, parent, ref_node);
    // when inserting into a host with a shadowRoot with slot, use
    // `shadowRoot._asyncRender()` via `attach-shadow` module
    if (hasShadowRootWithSlot(parent)) {
      parent.__shady.root._asyncRender();
      preventNativeInsert = true;
      // when inserting into a host with shadowRoot with NO slot, do nothing
      // as the node should not be added to composed dome anywhere.
    } else if (parent.__shady.root) {
      preventNativeInsert = true;
    }
  }
  if (!preventNativeInsert) {
    // if adding to a shadyRoot, add to host instead
    var container = isShadyRoot(parent) ?
    /** @type {ShadowRoot} */parent.host : parent;
    // if ref_node, get the ref_node that's actually in composed dom.
    if (ref_node) {
      ref_node = firstComposedNode(ref_node);
      insertBefore.call(container, node, ref_node);
    } else {
      appendChild.call(container, node);
    }
  }
  scheduleObserver(parent, node);
  return node;
}

function findContainedSlots(node) {
  if (!node['__noInsertionPoint']) {
    var slots = void 0;
    if (node.localName === 'slot') {
      slots = [node];
    } else if (node.querySelectorAll) {
      slots = node.querySelectorAll('slot');
    }
    if (slots && slots.length) {
      return slots;
    }
  }
}

/**
 * Patched `removeChild`. Note that all dom "removals" are routed here.
 * Removes the given `node` from the element's `children`.
 * This method also performs dom composition.
 * @param {Node} parent
 * @param {Node} node
*/
function removeChild$1(parent, node) {
  if (node.parentNode !== parent) {
    throw Error('The node to be removed is not a child of this node: ' + node);
  }
  var preventNativeRemove = void 0;
  var ownerRoot = ownerShadyRootForNode(node);
  var removingInsertionPoint = void 0;
  if (isTrackingLogicalChildNodes(parent)) {
    recordRemoveChild(node, parent);
    if (hasShadowRootWithSlot(parent)) {
      parent.__shady.root._asyncRender();
      preventNativeRemove = true;
    }
  }
  removeOwnerShadyRoot(node);
  // if removing slot, must render containing root
  if (ownerRoot) {
    var changeSlotContent = parent && parent.localName === 'slot';
    if (changeSlotContent) {
      preventNativeRemove = true;
    }
    removingInsertionPoint = ownerRoot._removeContainedSlots(node);
    if (removingInsertionPoint || changeSlotContent) {
      ownerRoot._asyncRender();
    }
  }
  if (!preventNativeRemove) {
    // if removing from a shadyRoot, remove form host instead
    var container = isShadyRoot(parent) ?
    /** @type {ShadowRoot} */parent.host : parent;
    // not guaranteed to physically be in container; e.g.
    // (1) if parent has a shadyRoot, element may or may not at distributed
    // location (could be undistributed)
    // (2) if parent is a slot, element may not ben in composed dom
    if (!(parent.__shady.root || node.localName === 'slot') || container === parentNode(node)) {
      removeChild.call(container, node);
    }
  }
  scheduleObserver(parent, null, node);
  return node;
}

function removeOwnerShadyRoot(node) {
  // optimization: only reset the tree if node is actually in a root
  if (hasCachedOwnerRoot(node)) {
    var c$ = node.childNodes;
    for (var i = 0, l = c$.length, n; i < l && (n = c$[i]); i++) {
      removeOwnerShadyRoot(n);
    }
  }
  if (node.__shady) {
    node.__shady.ownerShadyRoot = undefined;
  }
}

function hasCachedOwnerRoot(node) {
  return Boolean(node.__shady && node.__shady.ownerShadyRoot !== undefined);
}

/**
 * Finds the first flattened node that is composed in the node's parent.
 * If the given node is a slot, then the first flattened node is returned
 * if it exists, otherwise advance to the node's nextSibling.
 * @param {Node} node within which to find first composed node
 * @returns {Node} first composed node
 */
function firstComposedNode(node) {
  var composed = node;
  if (node && node.localName === 'slot') {
    var flattened = node.__shady && node.__shady.flattenedNodes;
    composed = flattened && flattened.length ? flattened[0] : firstComposedNode(node.nextSibling);
  }
  return composed;
}

function hasShadowRootWithSlot(node) {
  var root = node && node.__shady && node.__shady.root;
  return root && root._hasInsertionPoint();
}

/**
 * Should be called whenever an attribute changes. If the `slot` attribute
 * changes, provokes rendering if necessary. If a `<slot>` element's `name`
 * attribute changes, updates the root's slot map and renders.
 * @param {Node} node
 * @param {string} name
 */
function distributeAttributeChange(node, name) {
  if (name === 'slot') {
    var parent = node.parentNode;
    if (hasShadowRootWithSlot(parent)) {
      parent.__shady.root._asyncRender();
    }
  } else if (node.localName === 'slot' && name === 'name') {
    var root = ownerShadyRootForNode(node);
    if (root) {
      root._updateSlotName(node);
      root._asyncRender();
    }
  }
}

/**
 * @param {Node} node
 * @param {Node=} addedNode
 * @param {Node=} removedNode
 */
function scheduleObserver(node, addedNode, removedNode) {
  var observer = node.__shady && node.__shady.observer;
  if (observer) {
    if (addedNode) {
      observer.addedNodes.push(addedNode);
    }
    if (removedNode) {
      observer.removedNodes.push(removedNode);
    }
    observer.schedule();
  }
}

/**
 * @param {Node} node
 * @param {Object=} options
 */
function getRootNode(node, options) {
  // eslint-disable-line no-unused-vars
  if (!node || !node.nodeType) {
    return;
  }
  node.__shady = node.__shady || {};
  var root = node.__shady.ownerShadyRoot;
  if (root === undefined) {
    if (isShadyRoot(node)) {
      root = node;
    } else {
      var parent = node.parentNode;
      root = parent ? getRootNode(parent) : node;
    }
    // memo-ize result for performance but only memo-ize
    // result if node is in the document. This avoids a problem where a root
    // can be cached while an element is inside a fragment.
    // If this happens and we cache the result, the value can become stale
    // because for perf we avoid processing the subtree of added fragments.
    if (contains$1.call(document.documentElement, node)) {
      node.__shady.ownerShadyRoot = root;
    }
  }
  return root;
}

// NOTE: `query` is used primarily for ShadyDOM's querySelector impl,
// but it's also generally useful to recurse through the element tree
// and is used by Polymer's styling system.
/**
 * @param {Node} node
 * @param {Function} matcher
 * @param {Function=} halter
 */
function query(node, matcher, halter) {
  var list = [];
  queryElements(node.childNodes, matcher, halter, list);
  return list;
}

function queryElements(elements, matcher, halter, list) {
  for (var i = 0, l = elements.length, c; i < l && (c = elements[i]); i++) {
    if (c.nodeType === Node.ELEMENT_NODE && queryElement(c, matcher, halter, list)) {
      return true;
    }
  }
}

function queryElement(node, matcher, halter, list) {
  var result = matcher(node);
  if (result) {
    list.push(node);
  }
  if (halter && halter(result)) {
    return result;
  }
  queryElements(node.childNodes, matcher, halter, list);
}

function renderRootNode(element) {
  var root = element.getRootNode();
  if (isShadyRoot(root)) {
    root._render();
  }
}

var scopingShim = null;

function setAttribute$1(node, attr, value) {
  if (!scopingShim) {
    scopingShim = window['ShadyCSS'] && window['ShadyCSS']['ScopingShim'];
  }
  if (scopingShim && attr === 'class') {
    scopingShim['setElementClass'](node, value);
  } else {
    setAttribute.call(node, attr, value);
    distributeAttributeChange(node, attr);
  }
}

function removeAttribute$1(node, attr) {
  removeAttribute.call(node, attr);
  distributeAttributeChange(node, attr);
}

function cloneNode$1(node, deep) {
  if (node.localName == 'template') {
    return cloneNode.call(node, deep);
  } else {
    var n = cloneNode.call(node, false);
    if (deep) {
      var c$ = node.childNodes;
      for (var i = 0, nc; i < c$.length; i++) {
        nc = c$[i].cloneNode(true);
        n.appendChild(nc);
      }
    }
    return n;
  }
}

// note: Though not technically correct, we fast path `importNode`
// when called on a node not owned by the main document.
// This allows, for example, elements that cannot
// contain custom elements and are therefore not likely to contain shadowRoots
// to cloned natively. This is a fairly significant performance win.
function importNode$1(node, deep) {
  if (node.ownerDocument !== document) {
    return importNode.call(document, node, deep);
  }
  var n = importNode.call(document, node, false);
  if (deep) {
    var c$ = node.childNodes;
    for (var i = 0, nc; i < c$.length; i++) {
      nc = importNode$1(c$[i], true);
      n.appendChild(nc);
    }
  }
  return n;
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
Make this name unique so it is unlikely to conflict with properties on objects passed to `addEventListener`
https://github.com/webcomponents/shadydom/issues/173
*/
var eventWrappersName = '__eventWrappers' + Date.now();

// https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
var alwaysComposed = {
  'blur': true,
  'focus': true,
  'focusin': true,
  'focusout': true,
  'click': true,
  'dblclick': true,
  'mousedown': true,
  'mouseenter': true,
  'mouseleave': true,
  'mousemove': true,
  'mouseout': true,
  'mouseover': true,
  'mouseup': true,
  'wheel': true,
  'beforeinput': true,
  'input': true,
  'keydown': true,
  'keyup': true,
  'compositionstart': true,
  'compositionupdate': true,
  'compositionend': true,
  'touchstart': true,
  'touchend': true,
  'touchmove': true,
  'touchcancel': true,
  'pointerover': true,
  'pointerenter': true,
  'pointerdown': true,
  'pointermove': true,
  'pointerup': true,
  'pointercancel': true,
  'pointerout': true,
  'pointerleave': true,
  'gotpointercapture': true,
  'lostpointercapture': true,
  'dragstart': true,
  'drag': true,
  'dragenter': true,
  'dragleave': true,
  'dragover': true,
  'drop': true,
  'dragend': true,
  'DOMActivate': true,
  'DOMFocusIn': true,
  'DOMFocusOut': true,
  'keypress': true
};

function pathComposer(startNode, composed) {
  var composedPath = [];
  var current = startNode;
  var startRoot = startNode === window ? window : startNode.getRootNode();
  while (current) {
    composedPath.push(current);
    if (current.assignedSlot) {
      current = current.assignedSlot;
    } else if (current.nodeType === Node.DOCUMENT_FRAGMENT_NODE && current.host && (composed || current !== startRoot)) {
      current = current.host;
    } else {
      current = current.parentNode;
    }
  }
  // event composedPath includes window when startNode's ownerRoot is document
  if (composedPath[composedPath.length - 1] === document) {
    composedPath.push(window);
  }
  return composedPath;
}

function retarget(refNode, path) {
  if (!isShadyRoot) {
    return refNode;
  }
  // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
  // shadow-including inclusive ancestor, return ANCESTOR.
  var refNodePath = pathComposer(refNode, true);
  var p$ = path;
  for (var i = 0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
    ancestor = p$[i];
    root = ancestor === window ? window : ancestor.getRootNode();
    if (root !== lastRoot) {
      rootIdx = refNodePath.indexOf(root);
      lastRoot = root;
    }
    if (!isShadyRoot(root) || rootIdx > -1) {
      return ancestor;
    }
  }
}

var eventMixin = {

  /**
   * @this {Event}
   */
  get composed() {
    // isTrusted may not exist in this browser, so just check if isTrusted is explicitly false
    if (this.isTrusted !== false && this.__composed === undefined) {
      this.__composed = alwaysComposed[this.type];
    }
    return this.__composed || false;
  },

  /**
   * @this {Event}
   */
  composedPath: function composedPath() {
    if (!this.__composedPath) {
      this.__composedPath = pathComposer(this['__target'], this.composed);
    }
    return this.__composedPath;
  },


  /**
   * @this {Event}
   */
  get target() {
    return retarget(this.currentTarget, this.composedPath());
  },

  // http://w3c.github.io/webcomponents/spec/shadow/#event-relatedtarget-retargeting
  /**
   * @this {Event}
   */
  get relatedTarget() {
    if (!this.__relatedTarget) {
      return null;
    }
    if (!this.__relatedTargetComposedPath) {
      this.__relatedTargetComposedPath = pathComposer(this.__relatedTarget, true);
    }
    // find the deepest node in relatedTarget composed path that is in the same root with the currentTarget
    return retarget(this.currentTarget, this.__relatedTargetComposedPath);
  },
  /**
   * @this {Event}
   */
  stopPropagation: function stopPropagation() {
    Event.prototype.stopPropagation.call(this);
    this.__propagationStopped = true;
  },

  /**
   * @this {Event}
   */
  stopImmediatePropagation: function stopImmediatePropagation() {
    Event.prototype.stopImmediatePropagation.call(this);
    this.__immediatePropagationStopped = true;
    this.__propagationStopped = true;
  }
};

function mixinComposedFlag(Base) {
  // NOTE: avoiding use of `class` here so that transpiled output does not
  // try to do `Base.call` with a dom construtor.
  var klazz = function klazz(type, options) {
    var event = new Base(type, options);
    event.__composed = options && Boolean(options['composed']);
    return event;
  };
  // put constructor properties on subclass
  mixin(klazz, Base);
  klazz.prototype = Base.prototype;
  return klazz;
}

var nonBubblingEventsToRetarget = {
  'focus': true,
  'blur': true
};

/**
 * Check if the event has been retargeted by comparing original `target`, and calculated `target`
 * @param {Event} event
 * @return {boolean} True if the original target and calculated target are the same
 */
function hasRetargeted(event) {
  return event['__target'] !== event.target || event.__relatedTarget !== event.relatedTarget;
}

/**
 *
 * @param {Event} event
 * @param {Node} node
 * @param {string} phase
 */
function fireHandlers(event, node, phase) {
  var hs = node.__handlers && node.__handlers[event.type] && node.__handlers[event.type][phase];
  if (hs) {
    for (var i = 0, fn; fn = hs[i]; i++) {
      if (hasRetargeted(event) && event.target === event.relatedTarget) {
        return;
      }
      fn.call(node, event);
      if (event.__immediatePropagationStopped) {
        return;
      }
    }
  }
}

function retargetNonBubblingEvent(e) {
  var path = e.composedPath();
  var node = void 0;
  // override `currentTarget` to let patched `target` calculate correctly
  Object.defineProperty(e, 'currentTarget', {
    get: function get$$1() {
      return node;
    },
    configurable: true
  });
  for (var i = path.length - 1; i >= 0; i--) {
    node = path[i];
    // capture phase fires all capture handlers
    fireHandlers(e, node, 'capture');
    if (e.__propagationStopped) {
      return;
    }
  }

  // set the event phase to `AT_TARGET` as in spec
  Object.defineProperty(e, 'eventPhase', {
    get: function get$$1() {
      return Event.AT_TARGET;
    }
  });

  // the event only needs to be fired when owner roots change when iterating the event path
  // keep track of the last seen owner root
  var lastFiredRoot = void 0;
  for (var _i = 0; _i < path.length; _i++) {
    node = path[_i];
    var root = node.__shady && node.__shady.root;
    if (_i === 0 || root && root === lastFiredRoot) {
      fireHandlers(e, node, 'bubble');
      // don't bother with window, it doesn't have `getRootNode` and will be last in the path anyway
      if (node !== window) {
        lastFiredRoot = node.getRootNode();
      }
      if (e.__propagationStopped) {
        return;
      }
    }
  }
}

function listenerSettingsEqual(savedListener, node, type, capture, once, passive) {
  var savedNode = savedListener.node,
      savedType = savedListener.type,
      savedCapture = savedListener.capture,
      savedOnce = savedListener.once,
      savedPassive = savedListener.passive;

  return node === savedNode && type === savedType && capture === savedCapture && once === savedOnce && passive === savedPassive;
}

function findListener(wrappers, node, type, capture, once, passive) {
  for (var i = 0; i < wrappers.length; i++) {
    if (listenerSettingsEqual(wrappers[i], node, type, capture, once, passive)) {
      return i;
    }
  }
  return -1;
}

/**
 * Firefox can throw on accessing eventWrappers inside of `removeEventListener` during a selenium run
 * Try/Catch accessing eventWrappers to work around
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1353074
 */
function getEventWrappers(eventLike) {
  var wrappers = null;
  try {
    wrappers = eventLike[eventWrappersName];
  } catch (e) {} // eslint-disable-line no-empty
  return wrappers;
}

/**
 * @this {Event}
 */
function addEventListener$1(type, fnOrObj, optionsOrCapture) {
  if (!fnOrObj) {
    return;
  }

  var handlerType = typeof fnOrObj === 'undefined' ? 'undefined' : _typeof(fnOrObj);

  // bail if `fnOrObj` is not a function, not an object
  if (handlerType !== 'function' && handlerType !== 'object') {
    return;
  }

  // bail if `fnOrObj` is an object without a `handleEvent` method
  if (handlerType === 'object' && (!fnOrObj.handleEvent || typeof fnOrObj.handleEvent !== 'function')) {
    return;
  }

  // The callback `fn` might be used for multiple nodes/events. Since we generate
  // a wrapper function, we need to keep track of it when we remove the listener.
  // It's more efficient to store the node/type/options information as Array in
  // `fn` itself rather than the node (we assume that the same callback is used
  // for few nodes at most, whereas a node will likely have many event listeners).
  // NOTE(valdrin) invoking external functions is costly, inline has better perf.
  var capture = void 0,
      once = void 0,
      passive = void 0;
  if (optionsOrCapture && (typeof optionsOrCapture === 'undefined' ? 'undefined' : _typeof(optionsOrCapture)) === 'object') {
    capture = Boolean(optionsOrCapture.capture);
    once = Boolean(optionsOrCapture.once);
    passive = Boolean(optionsOrCapture.passive);
  } else {
    capture = Boolean(optionsOrCapture);
    once = false;
    passive = false;
  }
  // hack to let ShadyRoots have event listeners
  // event listener will be on host, but `currentTarget`
  // will be set to shadyroot for event listener
  var target = optionsOrCapture && optionsOrCapture.__shadyTarget || this;

  var wrappers = fnOrObj[eventWrappersName];
  if (wrappers) {
    // Stop if the wrapper function has already been created.
    if (findListener(wrappers, target, type, capture, once, passive) > -1) {
      return;
    }
  } else {
    fnOrObj[eventWrappersName] = [];
  }

  /**
   * @this {HTMLElement}
   * @param {Event} e
   */
  var wrapperFn = function wrapperFn(e) {
    // Support `once` option.
    if (once) {
      this.removeEventListener(type, fnOrObj, optionsOrCapture);
    }
    if (!e['__target']) {
      patchEvent(e);
    }
    var lastCurrentTargetDesc = void 0;
    if (target !== this) {
      // replace `currentTarget` to make `target` and `relatedTarget` correct for inside the shadowroot
      lastCurrentTargetDesc = Object.getOwnPropertyDescriptor(e, 'currentTarget');
      Object.defineProperty(e, 'currentTarget', {
        get: function get$$1() {
          return target;
        },
        configurable: true });
    }
    // There are two critera that should stop events from firing on this node
    // 1. the event is not composed and the current node is not in the same root as the target
    // 2. when bubbling, if after retargeting, relatedTarget and target point to the same node
    if (e.composed || e.composedPath().indexOf(target) > -1) {
      if (hasRetargeted(e) && e.target === e.relatedTarget) {
        if (e.eventPhase === Event.BUBBLING_PHASE) {
          e.stopImmediatePropagation();
        }
        return;
      }
      // prevent non-bubbling events from triggering bubbling handlers on shadowroot, but only if not in capture phase
      if (e.eventPhase !== Event.CAPTURING_PHASE && !e.bubbles && e.target !== target && !(target instanceof Window)) {
        return;
      }
      var ret = handlerType === 'function' ? fnOrObj.call(target, e) : fnOrObj.handleEvent && fnOrObj.handleEvent(e);
      if (target !== this) {
        // replace the "correct" `currentTarget`
        if (lastCurrentTargetDesc) {
          Object.defineProperty(e, 'currentTarget', lastCurrentTargetDesc);
          lastCurrentTargetDesc = null;
        } else {
          delete e['currentTarget'];
        }
      }
      return ret;
    }
  };
  // Store the wrapper information.
  fnOrObj[eventWrappersName].push({
    node: this,
    type: type,
    capture: capture,
    once: once,
    passive: passive,
    wrapperFn: wrapperFn
  });

  if (nonBubblingEventsToRetarget[type]) {
    this.__handlers = this.__handlers || {};
    this.__handlers[type] = this.__handlers[type] || { 'capture': [], 'bubble': [] };
    this.__handlers[type][capture ? 'capture' : 'bubble'].push(wrapperFn);
  } else {
    var ael = this instanceof Window ? windowAddEventListener : addEventListener;
    ael.call(this, type, wrapperFn, optionsOrCapture);
  }
}

/**
 * @this {Event}
 */
function removeEventListener$1(type, fnOrObj, optionsOrCapture) {
  if (!fnOrObj) {
    return;
  }

  // NOTE(valdrin) invoking external functions is costly, inline has better perf.
  var capture = void 0,
      once = void 0,
      passive = void 0;
  if (optionsOrCapture && (typeof optionsOrCapture === 'undefined' ? 'undefined' : _typeof(optionsOrCapture)) === 'object') {
    capture = Boolean(optionsOrCapture.capture);
    once = Boolean(optionsOrCapture.once);
    passive = Boolean(optionsOrCapture.passive);
  } else {
    capture = Boolean(optionsOrCapture);
    once = false;
    passive = false;
  }
  var target = optionsOrCapture && optionsOrCapture.__shadyTarget || this;
  // Search the wrapped function.
  var wrapperFn = undefined;
  var wrappers = getEventWrappers(fnOrObj);
  if (wrappers) {
    var idx = findListener(wrappers, target, type, capture, once, passive);
    if (idx > -1) {
      wrapperFn = wrappers.splice(idx, 1)[0].wrapperFn;
      // Cleanup.
      if (!wrappers.length) {
        fnOrObj[eventWrappersName] = undefined;
      }
    }
  }
  var rel = this instanceof Window ? windowRemoveEventListener : removeEventListener;
  rel.call(this, type, wrapperFn || fnOrObj, optionsOrCapture);
  if (wrapperFn && nonBubblingEventsToRetarget[type] && this.__handlers && this.__handlers[type]) {
    var arr = this.__handlers[type][capture ? 'capture' : 'bubble'];
    var _idx = arr.indexOf(wrapperFn);
    if (_idx > -1) {
      arr.splice(_idx, 1);
    }
  }
}

function activateFocusEventOverrides() {
  for (var ev in nonBubblingEventsToRetarget) {
    window.addEventListener(ev, function (e) {
      if (!e['__target']) {
        patchEvent(e);
        retargetNonBubblingEvent(e);
      }
    }, true);
  }
}

function patchEvent(event) {
  event['__target'] = event.target;
  event.__relatedTarget = event.relatedTarget;
  // patch event prototype if we can
  if (settings.hasDescriptors) {
    patchPrototype(event, eventMixin);
    // and fallback to patching instance
  } else {
    extend(event, eventMixin);
  }
}

var PatchedEvent = mixinComposedFlag(window.Event);
var PatchedCustomEvent = mixinComposedFlag(window.CustomEvent);
var PatchedMouseEvent = mixinComposedFlag(window.MouseEvent);

function patchEvents() {
  window.Event = PatchedEvent;
  window.CustomEvent = PatchedCustomEvent;
  window.MouseEvent = PatchedMouseEvent;
  activateFocusEventOverrides();
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function newSplice(index, removed, addedCount) {
  return {
    index: index,
    removed: removed,
    addedCount: addedCount
  };
}

var EDIT_LEAVE = 0;
var EDIT_UPDATE = 1;
var EDIT_ADD = 2;
var EDIT_DELETE = 3;

// Note: This function is *based* on the computation of the Levenshtein
// "edit" distance. The one change is that "updates" are treated as two
// edits - not one. With Array splices, an update is really a delete
// followed by an add. By retaining this, we optimize for "keeping" the
// maximum array items in the original array. For example:
//
//   'xxxx123' -> '123yyyy'
//
// With 1-edit updates, the shortest path would be just to update all seven
// characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
// leaves the substring '123' intact.
function calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd) {
  // "Deletion" columns
  var rowCount = oldEnd - oldStart + 1;
  var columnCount = currentEnd - currentStart + 1;
  var distances = new Array(rowCount);

  // "Addition" rows. Initialize null column.
  for (var i = 0; i < rowCount; i++) {
    distances[i] = new Array(columnCount);
    distances[i][0] = i;
  }

  // Initialize null row
  for (var j = 0; j < columnCount; j++) {
    distances[0][j] = j;
  }for (var _i = 1; _i < rowCount; _i++) {
    for (var _j = 1; _j < columnCount; _j++) {
      if (equals(current[currentStart + _j - 1], old[oldStart + _i - 1])) distances[_i][_j] = distances[_i - 1][_j - 1];else {
        var north = distances[_i - 1][_j] + 1;
        var west = distances[_i][_j - 1] + 1;
        distances[_i][_j] = north < west ? north : west;
      }
    }
  }

  return distances;
}

// This starts at the final weight, and walks "backward" by finding
// the minimum previous weight recursively until the origin of the weight
// matrix.
function spliceOperationsFromEditDistances(distances) {
  var i = distances.length - 1;
  var j = distances[0].length - 1;
  var current = distances[i][j];
  var edits = [];
  while (i > 0 || j > 0) {
    if (i == 0) {
      edits.push(EDIT_ADD);
      j--;
      continue;
    }
    if (j == 0) {
      edits.push(EDIT_DELETE);
      i--;
      continue;
    }
    var northWest = distances[i - 1][j - 1];
    var west = distances[i - 1][j];
    var north = distances[i][j - 1];

    var min = void 0;
    if (west < north) min = west < northWest ? west : northWest;else min = north < northWest ? north : northWest;

    if (min == northWest) {
      if (northWest == current) {
        edits.push(EDIT_LEAVE);
      } else {
        edits.push(EDIT_UPDATE);
        current = northWest;
      }
      i--;
      j--;
    } else if (min == west) {
      edits.push(EDIT_DELETE);
      i--;
      current = west;
    } else {
      edits.push(EDIT_ADD);
      j--;
      current = north;
    }
  }

  edits.reverse();
  return edits;
}

/**
 * Splice Projection functions:
 *
 * A splice map is a representation of how a previous array of items
 * was transformed into a new array of items. Conceptually it is a list of
 * tuples of
 *
 *   <index, removed, addedCount>
 *
 * which are kept in ascending index order of. The tuple represents that at
 * the |index|, |removed| sequence of items were removed, and counting forward
 * from |index|, |addedCount| items were added.
 */

/**
 * Lacking individual splice mutation information, the minimal set of
 * splices can be synthesized given the previous state and final state of an
 * array. The basic approach is to calculate the edit distance matrix and
 * choose the shortest path through it.
 *
 * Complexity: O(l * p)
 *   l: The length of the current array
 *   p: The length of the old array
 */
function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
  var prefixCount = 0;
  var suffixCount = 0;
  var splice = void 0;

  var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
  if (currentStart == 0 && oldStart == 0) prefixCount = sharedPrefix(current, old, minLength);

  if (currentEnd == current.length && oldEnd == old.length) suffixCount = sharedSuffix(current, old, minLength - prefixCount);

  currentStart += prefixCount;
  oldStart += prefixCount;
  currentEnd -= suffixCount;
  oldEnd -= suffixCount;

  if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];

  if (currentStart == currentEnd) {
    splice = newSplice(currentStart, [], 0);
    while (oldStart < oldEnd) {
      splice.removed.push(old[oldStart++]);
    }return [splice];
  } else if (oldStart == oldEnd) return [newSplice(currentStart, [], currentEnd - currentStart)];

  var ops = spliceOperationsFromEditDistances(calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));

  splice = undefined;
  var splices = [];
  var index = currentStart;
  var oldIndex = oldStart;
  for (var i = 0; i < ops.length; i++) {
    switch (ops[i]) {
      case EDIT_LEAVE:
        if (splice) {
          splices.push(splice);
          splice = undefined;
        }

        index++;
        oldIndex++;
        break;
      case EDIT_UPDATE:
        if (!splice) splice = newSplice(index, [], 0);

        splice.addedCount++;
        index++;

        splice.removed.push(old[oldIndex]);
        oldIndex++;
        break;
      case EDIT_ADD:
        if (!splice) splice = newSplice(index, [], 0);

        splice.addedCount++;
        index++;
        break;
      case EDIT_DELETE:
        if (!splice) splice = newSplice(index, [], 0);

        splice.removed.push(old[oldIndex]);
        oldIndex++;
        break;
    }
  }

  if (splice) {
    splices.push(splice);
  }
  return splices;
}

function sharedPrefix(current, old, searchLength) {
  for (var i = 0; i < searchLength; i++) {
    if (!equals(current[i], old[i])) return i;
  }return searchLength;
}

function sharedSuffix(current, old, searchLength) {
  var index1 = current.length;
  var index2 = old.length;
  var count = 0;
  while (count < searchLength && equals(current[--index1], old[--index2])) {
    count++;
  }return count;
}

function equals(currentValue, previousValue) {
  return currentValue === previousValue;
}

function calculateSplices(current, previous) {
  return calcSplices(current, 0, current.length, previous, 0, previous.length);
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// Do not export this object. It must be passed as the first argument to the
// ShadyRoot constructor in `attachShadow` to prevent the constructor from
// throwing. This prevents the user from being able to manually construct a
// ShadyRoot (i.e. `new ShadowRoot()`).
var ShadyRootConstructionToken = {};

var CATCHALL_NAME = '__catchall';

/**
 * @constructor
 * @extends {ShadowRoot}
 */
var ShadyRoot = function ShadyRoot(token, host, options) {
  if (token !== ShadyRootConstructionToken) {
    throw new TypeError('Illegal constructor');
  }
  // NOTE: this strange construction is necessary because
  // DocumentFragment cannot be subclassed on older browsers.
  var shadowRoot = document.createDocumentFragment();
  shadowRoot.__proto__ = ShadyRoot.prototype;
  /** @type {ShadyRoot} */shadowRoot._init(host, options);
  return shadowRoot;
};

ShadyRoot.prototype = Object.create(DocumentFragment.prototype);

ShadyRoot.prototype._init = function (host, options) {
  // NOTE: set a fake local name so this element can be
  // distinguished from a DocumentFragment when patching.
  // FF doesn't allow this to be `localName`
  this.__localName = 'ShadyRoot';
  // logical dom setup
  recordChildNodes(host);
  recordChildNodes(this);
  // root <=> host
  this.host = host;
  this._mode = options && options.mode;
  host.__shady = host.__shady || {};
  host.__shady.root = this;
  host.__shady.publicRoot = this._mode !== 'closed' ? this : null;
  // state flags
  this._renderPending = false;
  this._hasRendered = false;
  this._slotList = [];
  this._slotMap = {};
  this.__pendingSlots = [];
  // fast path initial render: remove existing physical dom.
  var c$ = childNodes(host);
  for (var i = 0, l = c$.length; i < l; i++) {
    removeChild.call(host, c$[i]);
  }
};

// async render
ShadyRoot.prototype._asyncRender = function () {
  var _this = this;

  if (!this._renderPending) {
    this._renderPending = true;
    enqueue(function () {
      return _this._render();
    });
  }
};

// returns the oldest renderPending ancestor root.
ShadyRoot.prototype._getRenderRoot = function () {
  var renderRoot = void 0;
  var root = this;
  while (root) {
    if (root._renderPending) {
      renderRoot = root;
    }
    root = root._rendererForHost();
  }
  return renderRoot;
};

// Returns the shadyRoot `this.host` if `this.host`
// has children that require distribution.
ShadyRoot.prototype._rendererForHost = function () {
  var root = this.host.getRootNode();
  if (isShadyRoot(root)) {
    var c$ = this.host.childNodes;
    for (var i = 0, c; i < c$.length; i++) {
      c = c$[i];
      if (this._isInsertionPoint(c)) {
        return root;
      }
    }
  }
};

ShadyRoot.prototype._render = function () {
  var root = this._getRenderRoot();
  if (root) {
    root['_renderRoot']();
  }
};

// NOTE: avoid renaming to ease testability.
ShadyRoot.prototype['_renderRoot'] = function () {
  this._renderPending = false;
  this._distribute();
  this._compose();
  this._hasRendered = true;
};

ShadyRoot.prototype._distribute = function () {
  this._validateSlots();
  // capture # of previously assigned nodes to help determine if dirty.
  for (var i = 0, slot; i < this._slotList.length; i++) {
    slot = this._slotList[i];
    this._clearSlotAssignedNodes(slot);
  }
  // distribute host children.
  for (var n = this.host.firstChild; n; n = n.nextSibling) {
    this._distributeNodeToSlot(n);
  }
  // fallback content, slotchange, and dirty roots
  for (var _i = 0, _slot; _i < this._slotList.length; _i++) {
    _slot = this._slotList[_i];
    // distribute fallback content
    if (!_slot.__shady.assignedNodes.length) {
      for (var _n = _slot.firstChild; _n; _n = _n.nextSibling) {
        this._distributeNodeToSlot(_n, _slot);
      }
    }
    var slotParent = _slot.parentNode;
    var slotParentRoot = slotParent.__shady && slotParent.__shady.root;
    if (slotParentRoot && slotParentRoot._hasInsertionPoint()) {
      slotParentRoot['_renderRoot']();
    }
    this._addAssignedToFlattenedNodes(_slot.__shady.flattenedNodes, _slot.__shady.assignedNodes);
    var prevAssignedNodes = _slot.__shady._previouslyAssignedNodes;
    if (prevAssignedNodes) {
      for (var _i2 = 0; _i2 < prevAssignedNodes.length; _i2++) {
        prevAssignedNodes[_i2].__shady._prevAssignedSlot = null;
      }
      _slot.__shady._previouslyAssignedNodes = null;
      // dirty if previously less assigned nodes than previously assigned.
      if (prevAssignedNodes.length > _slot.__shady.assignedNodes.length) {
        _slot.__shady.dirty = true;
      }
    }
    /* Note: A slot is marked dirty whenever a node is newly assigned to it
    or a node is assigned to a different slot (done in `_distributeNodeToSlot`)
    or if the number of nodes assigned to the slot has decreased (done above);
     */
    if (_slot.__shady.dirty) {
      _slot.__shady.dirty = false;
      this._fireSlotChange(_slot);
    }
  }
};

/**
 * Distributes given `node` to the appropriate slot based on its `slot`
 * attribute. If `forcedSlot` is given, then the node is distributed to the
 * `forcedSlot`.
 * Note: slot to which the node is assigned will be marked dirty for firing
 * `slotchange`.
 * @param {Node} node
 * @param {Node=} forcedSlot
 *
 */
ShadyRoot.prototype._distributeNodeToSlot = function (node, forcedSlot) {
  node.__shady = node.__shady || {};
  var oldSlot = node.__shady._prevAssignedSlot;
  node.__shady._prevAssignedSlot = null;
  var slot = forcedSlot;
  if (!slot) {
    var name = node.slot || CATCHALL_NAME;
    var list = this._slotMap[name];
    slot = list && list[0];
  }
  if (slot) {
    slot.__shady.assignedNodes.push(node);
    node.__shady.assignedSlot = slot;
  } else {
    node.__shady.assignedSlot = undefined;
  }
  if (oldSlot !== node.__shady.assignedSlot) {
    if (node.__shady.assignedSlot) {
      node.__shady.assignedSlot.__shady.dirty = true;
    }
  }
};

/**
 * Clears the assignedNodes tracking data for a given `slot`. Note, the current
 * assigned node data is tracked (via _previouslyAssignedNodes and
 * _prevAssignedSlot) to see if `slotchange` should fire. This data may be out
 *  of date at this time because the assigned nodes may have already been
 * distributed to another root. This is ok since this data is only used to
 * track changes.
 * @param {HTMLSlotElement} slot
 */
ShadyRoot.prototype._clearSlotAssignedNodes = function (slot) {
  var n$ = slot.__shady.assignedNodes;
  slot.__shady.assignedNodes = [];
  slot.__shady.flattenedNodes = [];
  slot.__shady._previouslyAssignedNodes = n$;
  if (n$) {
    for (var i = 0; i < n$.length; i++) {
      var n = n$[i];
      n.__shady._prevAssignedSlot = n.__shady.assignedSlot;
      // only clear if it was previously set to this slot;
      // this helps ensure that if the node has otherwise been distributed
      // ignore it.
      if (n.__shady.assignedSlot === slot) {
        n.__shady.assignedSlot = null;
      }
    }
  }
};

ShadyRoot.prototype._addAssignedToFlattenedNodes = function (flattened, assigned) {
  for (var i = 0, n; i < assigned.length && (n = assigned[i]); i++) {
    if (n.localName == 'slot') {
      var nestedAssigned = n.__shady.assignedNodes;
      if (nestedAssigned && nestedAssigned.length) {
        this._addAssignedToFlattenedNodes(flattened, nestedAssigned);
      }
    } else {
      flattened.push(assigned[i]);
    }
  }
};

ShadyRoot.prototype._fireSlotChange = function (slot) {
  // NOTE: cannot bubble correctly here so not setting bubbles: true
  // Safari tech preview does not bubble but chrome does
  // Spec says it bubbles (https://dom.spec.whatwg.org/#mutation-observers)
  dispatchEvent.call(slot, new Event('slotchange'));
  if (slot.__shady.assignedSlot) {
    this._fireSlotChange(slot.__shady.assignedSlot);
  }
};

// Reify dom such that it is at its correct rendering position
// based on logical distribution.
// NOTE: here we only compose parents of <slot> elements and not the
// shadowRoot into the host. The latter is performend via a fast path
// in the `logical-mutation`.insertBefore.
ShadyRoot.prototype._compose = function () {
  var slots = this._slotList;
  var composeList = [];
  for (var i = 0; i < slots.length; i++) {
    var parent = slots[i].parentNode;
    /* compose node only if:
      (1) parent does not have a shadowRoot since shadowRoot has already
      composed into the host
      (2) we're not already composing it
      [consider (n^2) but rare better than Set]
    */
    if (!(parent.__shady && parent.__shady.root) && composeList.indexOf(parent) < 0) {
      composeList.push(parent);
    }
  }
  for (var _i3 = 0; _i3 < composeList.length; _i3++) {
    var node = composeList[_i3];
    var targetNode = node === this ? this.host : node;
    this._updateChildNodes(targetNode, this._composeNode(node));
  }
};

// Returns the list of nodes which should be rendered inside `node`.
ShadyRoot.prototype._composeNode = function (node) {
  var children$$1 = [];
  var c$ = node.childNodes;
  for (var i = 0; i < c$.length; i++) {
    var child = c$[i];
    // Note: if we see a slot here, the nodes are guaranteed to need to be
    // composed here. This is because if there is redistribution, it has
    // already been handled by this point.
    if (this._isInsertionPoint(child)) {
      var flattenedNodes = child.__shady.flattenedNodes;
      for (var j = 0; j < flattenedNodes.length; j++) {
        var distributedNode = flattenedNodes[j];
        children$$1.push(distributedNode);
      }
    } else {
      children$$1.push(child);
    }
  }
  return children$$1;
};

ShadyRoot.prototype._isInsertionPoint = function (node) {
  return node.localName == 'slot';
};

// Ensures that the rendered node list inside `container` is `children`.
ShadyRoot.prototype._updateChildNodes = function (container, children$$1) {
  var composed = childNodes(container);
  var splices = calculateSplices(children$$1, composed);
  // process removals
  for (var i = 0, d = 0, s; i < splices.length && (s = splices[i]); i++) {
    for (var j = 0, n; j < s.removed.length && (n = s.removed[j]); j++) {
      // check if the node is still where we expect it is before trying
      // to remove it; this can happen if we move a node and
      // then schedule its previous host for distribution resulting in
      // the node being removed here.
      if (parentNode(n) === container) {
        removeChild.call(container, n);
      }
      composed.splice(s.index + d, 1);
    }
    d -= s.addedCount;
  }
  // process adds
  for (var _i4 = 0, _s, next; _i4 < splices.length && (_s = splices[_i4]); _i4++) {
    //eslint-disable-line no-redeclare
    next = composed[_s.index];
    for (var _j = _s.index, _n2; _j < _s.index + _s.addedCount; _j++) {
      _n2 = children$$1[_j];
      insertBefore.call(container, _n2, next);
      composed.splice(_j, 0, _n2);
    }
  }
};

ShadyRoot.prototype._addSlots = function (slots) {
  var _pendingSlots;

  (_pendingSlots = this.__pendingSlots).push.apply(_pendingSlots, toConsumableArray(slots));
};

ShadyRoot.prototype._validateSlots = function () {
  if (this.__pendingSlots.length) {
    this._mapSlots(this.__pendingSlots);
    this.__pendingSlots = [];
  }
};

/**
 * Adds the given slots. Slots are maintained in an dom-ordered list.
 * In addition a map of name to slot is updated.
 */
ShadyRoot.prototype._mapSlots = function (slots) {
  var slotNamesToSort = void 0;
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    // ensure insertionPoints's and their parents have logical dom info.
    // save logical tree info
    // a. for shadyRoot
    // b. for insertion points (fallback)
    // c. for parents of insertion points
    slot.__shady = slot.__shady || {};
    recordChildNodes(slot);
    recordChildNodes(slot.parentNode);
    var name = this._nameForSlot(slot);
    if (this._slotMap[name]) {
      slotNamesToSort = slotNamesToSort || {};
      slotNamesToSort[name] = true;
      this._slotMap[name].push(slot);
    } else {
      this._slotMap[name] = [slot];
    }
    this._slotList.push(slot);
  }
  if (slotNamesToSort) {
    for (var n in slotNamesToSort) {
      this._slotMap[n] = this._sortSlots(this._slotMap[n]);
    }
  }
};

ShadyRoot.prototype._nameForSlot = function (slot) {
  var name = slot['name'] || slot.getAttribute('name') || CATCHALL_NAME;
  slot.__slotName = name;
  return name;
};

/**
 * Slots are kept in an ordered list. Slots with the same name
 * are sorted here by tree order.
 */
ShadyRoot.prototype._sortSlots = function (slots) {
  // NOTE: Cannot use `compareDocumentPosition` because it's not polyfilled,
  // but the code here could be used to polyfill the preceeding/following info
  // in `compareDocumentPosition`.
  return slots.sort(function (a, b) {
    var listA = ancestorList(a);
    var listB = ancestorList(b);
    for (var i = 0; i < listA.length; i++) {
      var nA = listA[i];
      var nB = listB[i];
      if (nA !== nB) {
        var c$ = Array.from(nA.parentNode.childNodes);
        return c$.indexOf(nA) - c$.indexOf(nB);
      }
    }
  });
};

function ancestorList(node) {
  var ancestors = [];
  do {
    ancestors.unshift(node);
  } while (node = node.parentNode);
  return ancestors;
}

/**
 * Removes from tracked slot data any slots contained within `container` and
 * then updates the tracked data (_slotList and _slotMap).
 * Any removed slots also have their `assignedNodes` removed from comopsed dom.
 */
ShadyRoot.prototype._removeContainedSlots = function (container) {
  this._validateSlots();
  var didRemove = void 0;
  var map = this._slotMap;
  for (var n in map) {
    var slots = map[n];
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      if (contains(container, slot)) {
        slots.splice(i, 1);
        var x = this._slotList.indexOf(slot);
        if (x >= 0) {
          this._slotList.splice(x, 1);
        }
        i--;
        this._removeFlattenedNodes(slot);
        didRemove = true;
      }
    }
  }
  return didRemove;
};

ShadyRoot.prototype._updateSlotName = function (slot) {
  var oldName = slot.__slotName;
  var name = this._nameForSlot(slot);
  if (name === oldName) {
    return;
  }
  // remove from existing tracking
  var slots = this._slotMap[oldName];
  var i = slots.indexOf(slot);
  if (i >= 0) {
    slots.splice(i, 1);
  }
  // add to new location and sort if nedessary
  var list = this._slotMap[name] || (this._slotMap[name] = []);
  list.push(slot);
  if (list.length > 1) {
    this._slotMap[name] = this._sortSlots(list);
  }
};

ShadyRoot.prototype._removeFlattenedNodes = function (slot) {
  var n$ = slot.__shady.flattenedNodes;
  if (n$) {
    for (var i = 0; i < n$.length; i++) {
      var node = n$[i];
      var parent = parentNode(node);
      if (parent) {
        removeChild.call(parent, node);
      }
    }
  }
};

ShadyRoot.prototype._hasInsertionPoint = function () {
  this._validateSlots();
  return Boolean(this._slotList.length);
};

ShadyRoot.prototype.addEventListener = function (type, fn, optionsOrCapture) {
  if ((typeof optionsOrCapture === 'undefined' ? 'undefined' : _typeof(optionsOrCapture)) !== 'object') {
    optionsOrCapture = {
      capture: Boolean(optionsOrCapture)
    };
  }
  optionsOrCapture.__shadyTarget = this;
  this.host.addEventListener(type, fn, optionsOrCapture);
};

ShadyRoot.prototype.removeEventListener = function (type, fn, optionsOrCapture) {
  if ((typeof optionsOrCapture === 'undefined' ? 'undefined' : _typeof(optionsOrCapture)) !== 'object') {
    optionsOrCapture = {
      capture: Boolean(optionsOrCapture)
    };
  }
  optionsOrCapture.__shadyTarget = this;
  this.host.removeEventListener(type, fn, optionsOrCapture);
};

ShadyRoot.prototype.getElementById = function (id) {
  var result = query(this, function (n) {
    return n.id == id;
  }, function (n) {
    return Boolean(n);
  })[0];
  return result || null;
};

/**
  Implements a pared down version of ShadowDOM's scoping, which is easy to
  polyfill across browsers.
*/
function attachShadow(host, options) {
  if (!host) {
    throw 'Must provide a host.';
  }
  if (!options) {
    throw 'Not enough arguments.';
  }
  return new ShadyRoot(ShadyRootConstructionToken, host, options);
}

patchShadowRootAccessors(ShadyRoot.prototype);

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

function getAssignedSlot(node) {
  renderRootNode(node);
  return node.__shady && node.__shady.assignedSlot || null;
}

var windowMixin = {

  // NOTE: ensure these methods are bound to `window` so that `this` is correct
  // when called directly from global context without a receiver; e.g.
  // `addEventListener(...)`.
  addEventListener: addEventListener$1.bind(window),

  removeEventListener: removeEventListener$1.bind(window)

};

var nodeMixin = {

  addEventListener: addEventListener$1,

  removeEventListener: removeEventListener$1,

  appendChild: function appendChild$$1(node) {
    return insertBefore$1(this, node);
  },
  insertBefore: function insertBefore$$1(node, ref_node) {
    return insertBefore$1(this, node, ref_node);
  },
  removeChild: function removeChild$$1(node) {
    return removeChild$1(this, node);
  },


  /**
   * @this {Node}
   */
  replaceChild: function replaceChild(node, ref_node) {
    insertBefore$1(this, node, ref_node);
    removeChild$1(this, ref_node);
    return node;
  },


  /**
   * @this {Node}
   */
  cloneNode: function cloneNode$$1(deep) {
    return cloneNode$1(this, deep);
  },


  /**
   * @this {Node}
   */
  getRootNode: function getRootNode$$1(options) {
    return getRootNode(this, options);
  },
  contains: function contains$$1(node) {
    return contains(this, node);
  },


  /**
   * @this {Node}
   */
  get isConnected() {
    // Fast path for distributed nodes.
    var ownerDocument = this.ownerDocument;
    if (hasDocumentContains && contains$1.call(ownerDocument, this)) {
      return true;
    }
    if (ownerDocument.documentElement && contains$1.call(ownerDocument.documentElement, this)) {
      return true;
    }
    var node = this;
    while (node && !(node instanceof Document)) {
      node = node.parentNode || (node instanceof ShadyRoot ? /** @type {ShadowRoot} */node.host : undefined);
    }
    return !!(node && node instanceof Document);
  },

  /**
   * @this {Node}
   */
  dispatchEvent: function dispatchEvent$$1(event) {
    flush$1();
    return dispatchEvent.call(this, event);
  }
};

// NOTE: For some reason 'Text' redefines 'assignedSlot'
var textMixin = {
  /**
   * @this {Text}
   */
  get assignedSlot() {
    return getAssignedSlot(this);
  }
};

var fragmentMixin = {

  // TODO(sorvell): consider doing native QSA and filtering results.
  /**
   * @this {DocumentFragment}
   */
  querySelector: function querySelector$$1(selector) {
    // match selector and halt on first result.
    var result = query(this, function (n) {
      return matchesSelector(n, selector);
    }, function (n) {
      return Boolean(n);
    })[0];
    return result || null;
  },


  /**
   * @this {DocumentFragment}
   */
  querySelectorAll: function querySelectorAll$$1(selector) {
    return query(this, function (n) {
      return matchesSelector(n, selector);
    });
  }
};

var slotMixin = {

  /**
   * @this {HTMLSlotElement}
   */
  assignedNodes: function assignedNodes(options) {
    if (this.localName === 'slot') {
      renderRootNode(this);
      return this.__shady ? (options && options.flatten ? this.__shady.flattenedNodes : this.__shady.assignedNodes) || [] : [];
    }
  }
};

var elementMixin = extendAll({

  /**
   * @this {HTMLElement}
   */
  setAttribute: function setAttribute$$1(name, value) {
    setAttribute$1(this, name, value);
  },


  /**
   * @this {HTMLElement}
   */
  removeAttribute: function removeAttribute$$1(name) {
    removeAttribute$1(this, name);
  },


  /**
   * @this {HTMLElement}
   */
  attachShadow: function attachShadow$$1(options) {
    return attachShadow(this, options);
  },


  /**
   * @this {HTMLElement}
   */
  get slot() {
    return this.getAttribute('slot');
  },

  /**
   * @this {HTMLElement}
   */
  set slot(value) {
    setAttribute$1(this, 'slot', value);
  },

  /**
   * @this {HTMLElement}
   */
  get assignedSlot() {
    return getAssignedSlot(this);
  }

}, fragmentMixin, slotMixin);

Object.defineProperties(elementMixin, ShadowRootAccessor);

var documentMixin = extendAll({
  /**
   * @this {Document}
   */
  importNode: function importNode$$1(node, deep) {
    return importNode$1(node, deep);
  },


  /**
   * @this {Document}
   */
  getElementById: function getElementById(id) {
    var result = query(this, function (n) {
      return n.id == id;
    }, function (n) {
      return Boolean(n);
    })[0];
    return result || null;
  }
}, fragmentMixin);

Object.defineProperties(documentMixin, {
  '_activeElement': ActiveElementAccessor.activeElement
});

var nativeBlur = HTMLElement.prototype.blur;

var htmlElementMixin = extendAll({
  /**
   * @this {HTMLElement}
   */
  blur: function blur() {
    var root = this.__shady && this.__shady.root;
    var shadowActive = root && root.activeElement;
    if (shadowActive) {
      shadowActive.blur();
    } else {
      nativeBlur.call(this);
    }
  }
});

function patchBuiltin(proto, obj) {
  var n$ = Object.getOwnPropertyNames(obj);
  for (var i = 0; i < n$.length; i++) {
    var n = n$[i];
    var d = Object.getOwnPropertyDescriptor(obj, n);
    // NOTE: we prefer writing directly here because some browsers
    // have descriptors that are writable but not configurable (e.g.
    // `appendChild` on older browsers)
    if (d.value) {
      proto[n] = d.value;
    } else {
      Object.defineProperty(proto, n, d);
    }
  }
}

// Apply patches to builtins (e.g. Element.prototype). Some of these patches
// can be done unconditionally (mostly methods like
// `Element.prototype.appendChild`) and some can only be done when the browser
// has proper descriptors on the builtin prototype
// (e.g. `Element.prototype.firstChild`)`. When descriptors are not available,
// elements are individually patched when needed (see e.g.
// `patchInside/OutsideElementAccessors` in `patch-accessors.js`).
function patchBuiltins() {
  var nativeHTMLElement = window['customElements'] && window['customElements']['nativeHTMLElement'] || HTMLElement;
  // These patches can always be done, for all supported browsers.
  patchBuiltin(window.Node.prototype, nodeMixin);
  patchBuiltin(window.Window.prototype, windowMixin);
  patchBuiltin(window.Text.prototype, textMixin);
  patchBuiltin(window.DocumentFragment.prototype, fragmentMixin);
  patchBuiltin(window.Element.prototype, elementMixin);
  patchBuiltin(window.Document.prototype, documentMixin);
  if (window.HTMLSlotElement) {
    patchBuiltin(window.HTMLSlotElement.prototype, slotMixin);
  }
  patchBuiltin(nativeHTMLElement.prototype, htmlElementMixin);
  // These patches can *only* be done
  // on browsers that have proper property descriptors on builtin prototypes.
  // This includes: IE11, Edge, Chrome >= 4?; Safari >= 10, Firefox
  // On older browsers (Chrome <= 4?, Safari 9), a per element patching
  // strategy is used for patching accessors.
  if (settings.hasDescriptors) {
    patchAccessors(window.Node.prototype);
    patchAccessors(window.Text.prototype);
    patchAccessors(window.DocumentFragment.prototype);
    patchAccessors(window.Element.prototype);
    patchAccessors(nativeHTMLElement.prototype);
    patchAccessors(window.Document.prototype);
    if (window.HTMLSlotElement) {
      patchAccessors(window.HTMLSlotElement.prototype);
    }
  }
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Patches elements that interacts with ShadyDOM
 * such that tree traversal and mutation apis act like they would under
 * ShadowDOM.
 *
 * This import enables seemless interaction with ShadyDOM powered
 * custom elements, enabling better interoperation with 3rd party code,
 * libraries, and frameworks that use DOM tree manipulation apis.
 */

if (settings.inUse) {
  var ShadyDOM = {
    // TODO(sorvell): remove when Polymer does not depend on this.
    'inUse': settings.inUse,
    // TODO(sorvell): remove when Polymer does not depend on this
    'patch': function patch(node) {
      return node;
    },
    'isShadyRoot': isShadyRoot,
    'enqueue': enqueue,
    'flush': flush$1,
    'settings': settings,
    'filterMutations': filterMutations,
    'observeChildren': observeChildren,
    'unobserveChildren': unobserveChildren,
    'nativeMethods': nativeMethods,
    'nativeTree': nativeTree
  };

  window['ShadyDOM'] = ShadyDOM;

  // Apply patches to events...
  patchEvents();
  // Apply patches to builtins (e.g. Element.prototype) where applicable.
  patchBuiltins();

  window.ShadowRoot = ShadyRoot;
}

var reservedTagList = new Set(['annotation-xml', 'color-profile', 'font-face', 'font-face-src', 'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph']);

/**
 * @param {string} localName
 * @returns {boolean}
 */
function isValidCustomElementName(localName) {
  var reserved = reservedTagList.has(localName);
  var validForm = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(localName);
  return !reserved && validForm;
}

/**
 * @private
 * @param {!Node} node
 * @return {boolean}
 */
function isConnected(node) {
  // Use `Node#isConnected`, if defined.
  var nativeValue = node.isConnected;
  if (nativeValue !== undefined) {
    return nativeValue;
  }

  /** @type {?Node|undefined} */
  var current = node;
  while (current && !(current.__CE_isImportDocument || current instanceof Document)) {
    current = current.parentNode || (window.ShadowRoot && current instanceof ShadowRoot ? current.host : undefined);
  }
  return !!(current && (current.__CE_isImportDocument || current instanceof Document));
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextSiblingOrAncestorSibling(root, start) {
  var node = start;
  while (node && node !== root && !node.nextSibling) {
    node = node.parentNode;
  }
  return !node || node === root ? null : node.nextSibling;
}

/**
 * @param {!Node} root
 * @param {!Node} start
 * @return {?Node}
 */
function nextNode(root, start) {
  return start.firstChild ? start.firstChild : nextSiblingOrAncestorSibling(root, start);
}

/**
 * @param {!Node} root
 * @param {!function(!Element)} callback
 * @param {!Set<Node>=} visitedImports
 */
function walkDeepDescendantElements(root, callback) {
  var visitedImports = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();

  var node = root;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      var element = /** @type {!Element} */node;

      callback(element);

      var localName = element.localName;
      if (localName === 'link' && element.getAttribute('rel') === 'import') {
        // If this import (polyfilled or not) has it's root node available,
        // walk it.
        var importNode = /** @type {!Node} */element.import;
        if (importNode instanceof Node && !visitedImports.has(importNode)) {
          // Prevent multiple walks of the same import root.
          visitedImports.add(importNode);

          for (var child = importNode.firstChild; child; child = child.nextSibling) {
            walkDeepDescendantElements(child, callback, visitedImports);
          }
        }

        // Ignore descendants of import links to prevent attempting to walk the
        // elements created by the HTML Imports polyfill that we just walked
        // above.
        node = nextSiblingOrAncestorSibling(root, element);
        continue;
      } else if (localName === 'template') {
        // Ignore descendants of templates. There shouldn't be any descendants
        // because they will be moved into `.content` during construction in
        // browsers that support template but, in case they exist and are still
        // waiting to be moved by a polyfill, they will be ignored.
        node = nextSiblingOrAncestorSibling(root, element);
        continue;
      }

      // Walk shadow roots.
      var shadowRoot = element.__CE_shadowRoot;
      if (shadowRoot) {
        for (var _child = shadowRoot.firstChild; _child; _child = _child.nextSibling) {
          walkDeepDescendantElements(_child, callback, visitedImports);
        }
      }
    }

    node = nextNode(root, node);
  }
}

/**
 * Used to suppress Closure's "Modifying the prototype is only allowed if the
 * constructor is in the same scope" warning without using
 * `@suppress {newCheckTypes, duplicate}` because `newCheckTypes` is too broad.
 *
 * @param {!Object} destination
 * @param {string} name
 * @param {*} value
 */
function setPropertyUnchecked(destination, name, value) {
  destination[name] = value;
}

/**
 * @enum {number}
 */
var CustomElementState = {
  custom: 1,
  failed: 2
};

var CustomElementInternals = function () {
  function CustomElementInternals() {
    classCallCheck(this, CustomElementInternals);

    /** @type {!Map<string, !CustomElementDefinition>} */
    this._localNameToDefinition = new Map();

    /** @type {!Map<!Function, !CustomElementDefinition>} */
    this._constructorToDefinition = new Map();

    /** @type {!Array<!function(!Node)>} */
    this._patches = [];

    /** @type {boolean} */
    this._hasPatches = false;
  }

  /**
   * @param {string} localName
   * @param {!CustomElementDefinition} definition
   */


  createClass(CustomElementInternals, [{
    key: 'setDefinition',
    value: function setDefinition(localName, definition) {
      this._localNameToDefinition.set(localName, definition);
      this._constructorToDefinition.set(definition.constructor, definition);
    }

    /**
     * @param {string} localName
     * @return {!CustomElementDefinition|undefined}
     */

  }, {
    key: 'localNameToDefinition',
    value: function localNameToDefinition(localName) {
      return this._localNameToDefinition.get(localName);
    }

    /**
     * @param {!Function} constructor
     * @return {!CustomElementDefinition|undefined}
     */

  }, {
    key: 'constructorToDefinition',
    value: function constructorToDefinition(constructor) {
      return this._constructorToDefinition.get(constructor);
    }

    /**
     * @param {!function(!Node)} listener
     */

  }, {
    key: 'addPatch',
    value: function addPatch(listener) {
      this._hasPatches = true;
      this._patches.push(listener);
    }

    /**
     * @param {!Node} node
     */

  }, {
    key: 'patchTree',
    value: function patchTree(node) {
      var _this = this;

      if (!this._hasPatches) return;

      walkDeepDescendantElements(node, function (element) {
        return _this.patch(element);
      });
    }

    /**
     * @param {!Node} node
     */

  }, {
    key: 'patch',
    value: function patch(node) {
      if (!this._hasPatches) return;

      if (node.__CE_patched) return;
      node.__CE_patched = true;

      for (var i = 0; i < this._patches.length; i++) {
        this._patches[i](node);
      }
    }

    /**
     * @param {!Node} root
     */

  }, {
    key: 'connectTree',
    value: function connectTree(root) {
      var elements = [];

      walkDeepDescendantElements(root, function (element) {
        return elements.push(element);
      });

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.__CE_state === CustomElementState.custom) {
          this.connectedCallback(element);
        } else {
          this.upgradeElement(element);
        }
      }
    }

    /**
     * @param {!Node} root
     */

  }, {
    key: 'disconnectTree',
    value: function disconnectTree(root) {
      var elements = [];

      walkDeepDescendantElements(root, function (element) {
        return elements.push(element);
      });

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.__CE_state === CustomElementState.custom) {
          this.disconnectedCallback(element);
        }
      }
    }

    /**
     * Upgrades all uncustomized custom elements at and below a root node for
     * which there is a definition. When custom element reaction callbacks are
     * assumed to be called synchronously (which, by the current DOM / HTML spec
     * definitions, they are *not*), callbacks for both elements customized
     * synchronously by the parser and elements being upgraded occur in the same
     * relative order.
     *
     * NOTE: This function, when used to simulate the construction of a tree that
     * is already created but not customized (i.e. by the parser), does *not*
     * prevent the element from reading the 'final' (true) state of the tree. For
     * example, the element, during truly synchronous parsing / construction would
     * see that it contains no children as they have not yet been inserted.
     * However, this function does not modify the tree, the element will
     * (incorrectly) have children. Additionally, self-modification restrictions
     * for custom element constructors imposed by the DOM spec are *not* enforced.
     *
     *
     * The following nested list shows the steps extending down from the HTML
     * spec's parsing section that cause elements to be synchronously created and
     * upgraded:
     *
     * The "in body" insertion mode:
     * https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
     * - Switch on token:
     *   .. other cases ..
     *   -> Any other start tag
     *      - [Insert an HTML element](below) for the token.
     *
     * Insert an HTML element:
     * https://html.spec.whatwg.org/multipage/syntax.html#insert-an-html-element
     * - Insert a foreign element for the token in the HTML namespace:
     *   https://html.spec.whatwg.org/multipage/syntax.html#insert-a-foreign-element
     *   - Create an element for a token:
     *     https://html.spec.whatwg.org/multipage/syntax.html#create-an-element-for-the-token
     *     - Will execute script flag is true?
     *       - (Element queue pushed to the custom element reactions stack.)
     *     - Create an element:
     *       https://dom.spec.whatwg.org/#concept-create-element
     *       - Sync CE flag is true?
     *         - Constructor called.
     *         - Self-modification restrictions enforced.
     *       - Sync CE flag is false?
     *         - (Upgrade reaction enqueued.)
     *     - Attributes appended to element.
     *       (`attributeChangedCallback` reactions enqueued.)
     *     - Will execute script flag is true?
     *       - (Element queue popped from the custom element reactions stack.
     *         Reactions in the popped stack are invoked.)
     *   - (Element queue pushed to the custom element reactions stack.)
     *   - Insert the element:
     *     https://dom.spec.whatwg.org/#concept-node-insert
     *     - Shadow-including descendants are connected. During parsing
     *       construction, there are no shadow-*excluding* descendants.
     *       However, the constructor may have validly attached a shadow
     *       tree to itself and added descendants to that shadow tree.
     *       (`connectedCallback` reactions enqueued.)
     *   - (Element queue popped from the custom element reactions stack.
     *     Reactions in the popped stack are invoked.)
     *
     * @param {!Node} root
     * @param {{
     *   visitedImports: (!Set<!Node>|undefined),
     *   upgrade: (!function(!Element)|undefined),
     * }=} options
     */

  }, {
    key: 'patchAndUpgradeTree',
    value: function patchAndUpgradeTree(root) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var visitedImports = options.visitedImports || new Set();
      var upgrade = options.upgrade || function (element) {
        return _this2.upgradeElement(element);
      };

      var elements = [];

      var gatherElements = function gatherElements(element) {
        if (element.localName === 'link' && element.getAttribute('rel') === 'import') {
          // The HTML Imports polyfill sets a descendant element of the link to
          // the `import` property, specifically this is *not* a Document.
          var importNode = /** @type {?Node} */element.import;

          if (importNode instanceof Node) {
            importNode.__CE_isImportDocument = true;
            // Connected links are associated with the registry.
            importNode.__CE_hasRegistry = true;
          }

          if (importNode && importNode.readyState === 'complete') {
            importNode.__CE_documentLoadHandled = true;
          } else {
            // If this link's import root is not available, its contents can't be
            // walked. Wait for 'load' and walk it when it's ready.
            element.addEventListener('load', function () {
              var importNode = /** @type {!Node} */element.import;

              if (importNode.__CE_documentLoadHandled) return;
              importNode.__CE_documentLoadHandled = true;

              // Clone the `visitedImports` set that was populated sync during
              // the `patchAndUpgradeTree` call that caused this 'load' handler to
              // be added. Then, remove *this* link's import node so that we can
              // walk that import again, even if it was partially walked later
              // during the same `patchAndUpgradeTree` call.
              var clonedVisitedImports = new Set(visitedImports);
              clonedVisitedImports.delete(importNode);

              _this2.patchAndUpgradeTree(importNode, { visitedImports: clonedVisitedImports, upgrade: upgrade });
            });
          }
        } else {
          elements.push(element);
        }
      };

      // `walkDeepDescendantElements` populates (and internally checks against)
      // `visitedImports` when traversing a loaded import.
      walkDeepDescendantElements(root, gatherElements, visitedImports);

      if (this._hasPatches) {
        for (var i = 0; i < elements.length; i++) {
          this.patch(elements[i]);
        }
      }

      for (var _i = 0; _i < elements.length; _i++) {
        upgrade(elements[_i]);
      }
    }

    /**
     * @param {!Element} element
     */

  }, {
    key: 'upgradeElement',
    value: function upgradeElement(element) {
      var currentState = element.__CE_state;
      if (currentState !== undefined) return;

      // Prevent elements created in documents without a browsing context from
      // upgrading.
      //
      // https://html.spec.whatwg.org/multipage/custom-elements.html#look-up-a-custom-element-definition
      //   "If document does not have a browsing context, return null."
      //
      // https://html.spec.whatwg.org/multipage/window-object.html#dom-document-defaultview
      //   "The defaultView IDL attribute of the Document interface, on getting,
      //   must return this Document's browsing context's WindowProxy object, if
      //   this Document has an associated browsing context, or null otherwise."
      var ownerDocument = element.ownerDocument;
      if (!ownerDocument.defaultView && !(ownerDocument.__CE_isImportDocument && ownerDocument.__CE_hasRegistry)) return;

      var definition = this.localNameToDefinition(element.localName);
      if (!definition) return;

      definition.constructionStack.push(element);

      var constructor = definition.constructor;
      try {
        try {
          var result = new constructor();
          if (result !== element) {
            throw new Error('The custom element constructor did not produce the element being upgraded.');
          }
        } finally {
          definition.constructionStack.pop();
        }
      } catch (e) {
        element.__CE_state = CustomElementState.failed;
        throw e;
      }

      element.__CE_state = CustomElementState.custom;
      element.__CE_definition = definition;

      if (definition.attributeChangedCallback) {
        var observedAttributes = definition.observedAttributes;
        for (var i = 0; i < observedAttributes.length; i++) {
          var name = observedAttributes[i];
          var value = element.getAttribute(name);
          if (value !== null) {
            this.attributeChangedCallback(element, name, null, value, null);
          }
        }
      }

      if (isConnected(element)) {
        this.connectedCallback(element);
      }
    }

    /**
     * @param {!Element} element
     */

  }, {
    key: 'connectedCallback',
    value: function connectedCallback(element) {
      var definition = element.__CE_definition;
      if (definition.connectedCallback) {
        definition.connectedCallback.call(element);
      }
    }

    /**
     * @param {!Element} element
     */

  }, {
    key: 'disconnectedCallback',
    value: function disconnectedCallback(element) {
      var definition = element.__CE_definition;
      if (definition.disconnectedCallback) {
        definition.disconnectedCallback.call(element);
      }
    }

    /**
     * @param {!Element} element
     * @param {string} name
     * @param {?string} oldValue
     * @param {?string} newValue
     * @param {?string} namespace
     */

  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(element, name, oldValue, newValue, namespace) {
      var definition = element.__CE_definition;
      if (definition.attributeChangedCallback && definition.observedAttributes.indexOf(name) > -1) {
        definition.attributeChangedCallback.call(element, name, oldValue, newValue, namespace);
      }
    }
  }]);
  return CustomElementInternals;
}();

var DocumentConstructionObserver = function () {
  function DocumentConstructionObserver(internals, doc) {
    classCallCheck(this, DocumentConstructionObserver);

    /**
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @type {!Document}
     */
    this._document = doc;

    /**
     * @type {MutationObserver|undefined}
     */
    this._observer = undefined;

    // Simulate tree construction for all currently accessible nodes in the
    // document.
    this._internals.patchAndUpgradeTree(this._document);

    if (this._document.readyState === 'loading') {
      this._observer = new MutationObserver(this._handleMutations.bind(this));

      // Nodes created by the parser are given to the observer *before* the next
      // task runs. Inline scripts are run in a new task. This means that the
      // observer will be able to handle the newly parsed nodes before the inline
      // script is run.
      this._observer.observe(this._document, {
        childList: true,
        subtree: true
      });
    }
  }

  createClass(DocumentConstructionObserver, [{
    key: 'disconnect',
    value: function disconnect() {
      if (this._observer) {
        this._observer.disconnect();
      }
    }

    /**
     * @param {!Array<!MutationRecord>} mutations
     */

  }, {
    key: '_handleMutations',
    value: function _handleMutations(mutations) {
      // Once the document's `readyState` is 'interactive' or 'complete', all new
      // nodes created within that document will be the result of script and
      // should be handled by patching.
      var readyState = this._document.readyState;
      if (readyState === 'interactive' || readyState === 'complete') {
        this.disconnect();
      }

      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          this._internals.patchAndUpgradeTree(node);
        }
      }
    }
  }]);
  return DocumentConstructionObserver;
}();

/**
 * @template T
 */
var Deferred = function () {
  function Deferred() {
    var _this = this;

    classCallCheck(this, Deferred);

    /**
     * @private
     * @type {T|undefined}
     */
    this._value = undefined;

    /**
     * @private
     * @type {Function|undefined}
     */
    this._resolve = undefined;

    /**
     * @private
     * @type {!Promise<T>}
     */
    this._promise = new Promise(function (resolve) {
      _this._resolve = resolve;

      if (_this._value) {
        resolve(_this._value);
      }
    });
  }

  /**
   * @param {T} value
   */


  createClass(Deferred, [{
    key: 'resolve',
    value: function resolve(value) {
      if (this._value) {
        throw new Error('Already resolved.');
      }

      this._value = value;

      if (this._resolve) {
        this._resolve(value);
      }
    }

    /**
     * @return {!Promise<T>}
     */

  }, {
    key: 'toPromise',
    value: function toPromise() {
      return this._promise;
    }
  }]);
  return Deferred;
}();

/**
 * @unrestricted
 */

var CustomElementRegistry = function () {

  /**
   * @param {!CustomElementInternals} internals
   */
  function CustomElementRegistry(internals) {
    classCallCheck(this, CustomElementRegistry);

    /**
     * @private
     * @type {boolean}
     */
    this._elementDefinitionIsRunning = false;

    /**
     * @private
     * @type {!CustomElementInternals}
     */
    this._internals = internals;

    /**
     * @private
     * @type {!Map<string, !Deferred<undefined>>}
     */
    this._whenDefinedDeferred = new Map();

    /**
     * The default flush callback triggers the document walk synchronously.
     * @private
     * @type {!Function}
     */
    this._flushCallback = function (fn) {
      return fn();
    };

    /**
     * @private
     * @type {boolean}
     */
    this._flushPending = false;

    /**
     * @private
     * @type {!Array<!CustomElementDefinition>}
     */
    this._pendingDefinitions = [];

    /**
     * @private
     * @type {!DocumentConstructionObserver}
     */
    this._documentConstructionObserver = new DocumentConstructionObserver(internals, document);
  }

  /**
   * @param {string} localName
   * @param {!Function} constructor
   */


  createClass(CustomElementRegistry, [{
    key: 'define',
    value: function define(localName, constructor) {
      var _this = this;

      if (!(constructor instanceof Function)) {
        throw new TypeError('Custom element constructors must be functions.');
      }

      if (!isValidCustomElementName(localName)) {
        throw new SyntaxError('The element name \'' + localName + '\' is not valid.');
      }

      if (this._internals.localNameToDefinition(localName)) {
        throw new Error('A custom element with name \'' + localName + '\' has already been defined.');
      }

      if (this._elementDefinitionIsRunning) {
        throw new Error('A custom element is already being defined.');
      }
      this._elementDefinitionIsRunning = true;

      var connectedCallback = void 0;
      var disconnectedCallback = void 0;
      var adoptedCallback = void 0;
      var attributeChangedCallback = void 0;
      var observedAttributes = void 0;
      try {
        var getCallback = function getCallback(name) {
          var callbackValue = prototype[name];
          if (callbackValue !== undefined && !(callbackValue instanceof Function)) {
            throw new Error('The \'' + name + '\' callback must be a function.');
          }
          return callbackValue;
        };

        /** @type {!Object} */
        var prototype = constructor.prototype;
        if (!(prototype instanceof Object)) {
          throw new TypeError('The custom element constructor\'s prototype is not an object.');
        }

        connectedCallback = getCallback('connectedCallback');
        disconnectedCallback = getCallback('disconnectedCallback');
        adoptedCallback = getCallback('adoptedCallback');
        attributeChangedCallback = getCallback('attributeChangedCallback');
        observedAttributes = constructor['observedAttributes'] || [];
      } catch (e) {
        return;
      } finally {
        this._elementDefinitionIsRunning = false;
      }

      var definition = {
        localName: localName,
        constructor: constructor,
        connectedCallback: connectedCallback,
        disconnectedCallback: disconnectedCallback,
        adoptedCallback: adoptedCallback,
        attributeChangedCallback: attributeChangedCallback,
        observedAttributes: observedAttributes,
        constructionStack: []
      };

      this._internals.setDefinition(localName, definition);
      this._pendingDefinitions.push(definition);

      // If we've already called the flush callback and it hasn't called back yet,
      // don't call it again.
      if (!this._flushPending) {
        this._flushPending = true;
        this._flushCallback(function () {
          return _this._flush();
        });
      }
    }
  }, {
    key: '_flush',
    value: function _flush() {
      var _this2 = this;

      // If no new definitions were defined, don't attempt to flush. This could
      // happen if a flush callback keeps the function it is given and calls it
      // multiple times.
      if (this._flushPending === false) return;
      this._flushPending = false;

      var pendingDefinitions = this._pendingDefinitions;

      /**
       * Unupgraded elements with definitions that were defined *before* the last
       * flush, in document order.
       * @type {!Array<!Element>}
       */
      var elementsWithStableDefinitions = [];

      /**
       * A map from `localName`s of definitions that were defined *after* the last
       * flush to unupgraded elements matching that definition, in document order.
       * @type {!Map<string, !Array<!Element>>}
       */
      var elementsWithPendingDefinitions = new Map();
      for (var i = 0; i < pendingDefinitions.length; i++) {
        elementsWithPendingDefinitions.set(pendingDefinitions[i].localName, []);
      }

      this._internals.patchAndUpgradeTree(document, {
        upgrade: function upgrade(element) {
          // Ignore the element if it has already upgraded or failed to upgrade.
          if (element.__CE_state !== undefined) return;

          var localName = element.localName;

          // If there is an applicable pending definition for the element, add the
          // element to the list of elements to be upgraded with that definition.
          var pendingElements = elementsWithPendingDefinitions.get(localName);
          if (pendingElements) {
            pendingElements.push(element);
            // If there is *any other* applicable definition for the element, add it
            // to the list of elements with stable definitions that need to be upgraded.
          } else if (_this2._internals.localNameToDefinition(localName)) {
            elementsWithStableDefinitions.push(element);
          }
        }
      });

      // Upgrade elements with 'stable' definitions first.
      for (var _i = 0; _i < elementsWithStableDefinitions.length; _i++) {
        this._internals.upgradeElement(elementsWithStableDefinitions[_i]);
      }

      // Upgrade elements with 'pending' definitions in the order they were defined.
      while (pendingDefinitions.length > 0) {
        var definition = pendingDefinitions.shift();
        var localName = definition.localName;

        // Attempt to upgrade all applicable elements.
        var pendingUpgradableElements = elementsWithPendingDefinitions.get(definition.localName);
        for (var _i2 = 0; _i2 < pendingUpgradableElements.length; _i2++) {
          this._internals.upgradeElement(pendingUpgradableElements[_i2]);
        }

        // Resolve any promises created by `whenDefined` for the definition.
        var deferred = this._whenDefinedDeferred.get(localName);
        if (deferred) {
          deferred.resolve(undefined);
        }
      }
    }

    /**
     * @param {string} localName
     * @return {Function|undefined}
     */

  }, {
    key: 'get',
    value: function get$$1(localName) {
      var definition = this._internals.localNameToDefinition(localName);
      if (definition) {
        return definition.constructor;
      }

      return undefined;
    }

    /**
     * @param {string} localName
     * @return {!Promise<undefined>}
     */

  }, {
    key: 'whenDefined',
    value: function whenDefined(localName) {
      if (!isValidCustomElementName(localName)) {
        return Promise.reject(new SyntaxError('\'' + localName + '\' is not a valid custom element name.'));
      }

      var prior = this._whenDefinedDeferred.get(localName);
      if (prior) {
        return prior.toPromise();
      }

      var deferred = new Deferred();
      this._whenDefinedDeferred.set(localName, deferred);

      var definition = this._internals.localNameToDefinition(localName);
      // Resolve immediately only if the given local name has a definition *and*
      // the full document walk to upgrade elements with that local name has
      // already happened.
      if (definition && !this._pendingDefinitions.some(function (d) {
        return d.localName === localName;
      })) {
        deferred.resolve(undefined);
      }

      return deferred.toPromise();
    }
  }, {
    key: 'polyfillWrapFlushCallback',
    value: function polyfillWrapFlushCallback(outer) {
      this._documentConstructionObserver.disconnect();
      var inner = this._flushCallback;
      this._flushCallback = function (flush) {
        return outer(function () {
          return inner(flush);
        });
      };
    }
  }]);
  return CustomElementRegistry;
}();

window['CustomElementRegistry'] = CustomElementRegistry;
CustomElementRegistry.prototype['define'] = CustomElementRegistry.prototype.define;
CustomElementRegistry.prototype['get'] = CustomElementRegistry.prototype.get;
CustomElementRegistry.prototype['whenDefined'] = CustomElementRegistry.prototype.whenDefined;
CustomElementRegistry.prototype['polyfillWrapFlushCallback'] = CustomElementRegistry.prototype.polyfillWrapFlushCallback;

var Native = {
  Document_createElement: window.Document.prototype.createElement,
  Document_createElementNS: window.Document.prototype.createElementNS,
  Document_importNode: window.Document.prototype.importNode,
  Document_prepend: window.Document.prototype['prepend'],
  Document_append: window.Document.prototype['append'],
  DocumentFragment_prepend: window.DocumentFragment.prototype['prepend'],
  DocumentFragment_append: window.DocumentFragment.prototype['append'],
  Node_cloneNode: window.Node.prototype.cloneNode,
  Node_appendChild: window.Node.prototype.appendChild,
  Node_insertBefore: window.Node.prototype.insertBefore,
  Node_removeChild: window.Node.prototype.removeChild,
  Node_replaceChild: window.Node.prototype.replaceChild,
  Node_textContent: Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent'),
  Element_attachShadow: window.Element.prototype['attachShadow'],
  Element_innerHTML: Object.getOwnPropertyDescriptor(window.Element.prototype, 'innerHTML'),
  Element_getAttribute: window.Element.prototype.getAttribute,
  Element_setAttribute: window.Element.prototype.setAttribute,
  Element_removeAttribute: window.Element.prototype.removeAttribute,
  Element_getAttributeNS: window.Element.prototype.getAttributeNS,
  Element_setAttributeNS: window.Element.prototype.setAttributeNS,
  Element_removeAttributeNS: window.Element.prototype.removeAttributeNS,
  Element_insertAdjacentElement: window.Element.prototype['insertAdjacentElement'],
  Element_prepend: window.Element.prototype['prepend'],
  Element_append: window.Element.prototype['append'],
  Element_before: window.Element.prototype['before'],
  Element_after: window.Element.prototype['after'],
  Element_replaceWith: window.Element.prototype['replaceWith'],
  Element_remove: window.Element.prototype['remove'],
  HTMLElement: window.HTMLElement,
  HTMLElement_innerHTML: Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'innerHTML'),
  HTMLElement_insertAdjacentElement: window.HTMLElement.prototype['insertAdjacentElement']
};

/**
 * This class exists only to work around Closure's lack of a way to describe
 * singletons. It represents the 'already constructed marker' used in custom
 * element construction stacks.
 *
 * https://html.spec.whatwg.org/#concept-already-constructed-marker
 */
var AlreadyConstructedMarker = function AlreadyConstructedMarker() {
  classCallCheck(this, AlreadyConstructedMarker);
};

var AlreadyConstructedMarker$1 = new AlreadyConstructedMarker();

/**
 * @param {!CustomElementInternals} internals
 */
var PatchHTMLElement = function (internals) {
  window['HTMLElement'] = function () {
    /**
     * @type {function(new: HTMLElement): !HTMLElement}
     */
    function HTMLElement() {
      // This should really be `new.target` but `new.target` can't be emulated
      // in ES5. Assuming the user keeps the default value of the constructor's
      // prototype's `constructor` property, this is equivalent.
      /** @type {!Function} */
      var constructor = this.constructor;

      var definition = internals.constructorToDefinition(constructor);
      if (!definition) {
        throw new Error('The custom element being constructed was not registered with `customElements`.');
      }

      var constructionStack = definition.constructionStack;

      if (constructionStack.length === 0) {
        var _element = Native.Document_createElement.call(document, definition.localName);
        Object.setPrototypeOf(_element, constructor.prototype);
        _element.__CE_state = CustomElementState.custom;
        _element.__CE_definition = definition;
        internals.patch(_element);
        return _element;
      }

      var lastIndex = constructionStack.length - 1;
      var element = constructionStack[lastIndex];
      if (element === AlreadyConstructedMarker$1) {
        throw new Error('The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.');
      }
      constructionStack[lastIndex] = AlreadyConstructedMarker$1;

      Object.setPrototypeOf(element, constructor.prototype);
      internals.patch( /** @type {!HTMLElement} */element);

      return element;
    }

    HTMLElement.prototype = Native.HTMLElement.prototype;

    return HTMLElement;
  }();
};

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ParentNodeNativeMethods} builtIn
 */
var PatchParentNode = function (internals, destination, builtIn) {
  /**
   * @param {!function(...(!Node|string))} builtInMethod
   * @return {!function(...(!Node|string))}
   */
  function appendPrependPatch(builtInMethod) {
    return function () {
      /**
       * A copy of `nodes`, with any DocumentFragment replaced by its children.
       * @type {!Array<!Node>}
       */
      var flattenedNodes = [];

      /**
       * Elements in `nodes` that were connected before this call.
       * @type {!Array<!Node>}
       */
      var connectedElements = [];

      for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
        nodes[_key] = arguments[_key];
      }

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        if (node instanceof Element && isConnected(node)) {
          connectedElements.push(node);
        }

        if (node instanceof DocumentFragment) {
          for (var child = node.firstChild; child; child = child.nextSibling) {
            flattenedNodes.push(child);
          }
        } else {
          flattenedNodes.push(node);
        }
      }

      builtInMethod.apply(this, nodes);

      for (var _i = 0; _i < connectedElements.length; _i++) {
        internals.disconnectTree(connectedElements[_i]);
      }

      if (isConnected(this)) {
        for (var _i2 = 0; _i2 < flattenedNodes.length; _i2++) {
          var _node = flattenedNodes[_i2];
          if (_node instanceof Element) {
            internals.connectTree(_node);
          }
        }
      }
    };
  }

  if (builtIn.prepend !== undefined) {
    setPropertyUnchecked(destination, 'prepend', appendPrependPatch(builtIn.prepend));
  }

  if (builtIn.append !== undefined) {
    setPropertyUnchecked(destination, 'append', appendPrependPatch(builtIn.append));
  }
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchDocument = function (internals) {
  setPropertyUnchecked(Document.prototype, 'createElement',
  /**
   * @this {Document}
   * @param {string} localName
   * @return {!Element}
   */
  function (localName) {
    // Only create custom elements if this document is associated with the registry.
    if (this.__CE_hasRegistry) {
      var definition = internals.localNameToDefinition(localName);
      if (definition) {
        return new definition.constructor();
      }
    }

    var result = /** @type {!Element} */
    Native.Document_createElement.call(this, localName);
    internals.patch(result);
    return result;
  });

  setPropertyUnchecked(Document.prototype, 'importNode',
  /**
   * @this {Document}
   * @param {!Node} node
   * @param {boolean=} deep
   * @return {!Node}
   */
  function (node, deep) {
    var clone = Native.Document_importNode.call(this, node, deep);
    // Only create custom elements if this document is associated with the registry.
    if (!this.__CE_hasRegistry) {
      internals.patchTree(clone);
    } else {
      internals.patchAndUpgradeTree(clone);
    }
    return clone;
  });

  var NS_HTML = "http://www.w3.org/1999/xhtml";

  setPropertyUnchecked(Document.prototype, 'createElementNS',
  /**
   * @this {Document}
   * @param {?string} namespace
   * @param {string} localName
   * @return {!Element}
   */
  function (namespace, localName) {
    // Only create custom elements if this document is associated with the registry.
    if (this.__CE_hasRegistry && (namespace === null || namespace === NS_HTML)) {
      var definition = internals.localNameToDefinition(localName);
      if (definition) {
        return new definition.constructor();
      }
    }

    var result = /** @type {!Element} */
    Native.Document_createElementNS.call(this, namespace, localName);
    internals.patch(result);
    return result;
  });

  PatchParentNode(internals, Document.prototype, {
    prepend: Native.Document_prepend,
    append: Native.Document_append
  });
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchDocumentFragment = function (internals) {
  PatchParentNode(internals, DocumentFragment.prototype, {
    prepend: Native.DocumentFragment_prepend,
    append: Native.DocumentFragment_append
  });
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchNode = function (internals) {
  // `Node#nodeValue` is implemented on `Attr`.
  // `Node#textContent` is implemented on `Attr`, `Element`.

  setPropertyUnchecked(Node.prototype, 'insertBefore',
  /**
   * @this {Node}
   * @param {!Node} node
   * @param {?Node} refNode
   * @return {!Node}
   */
  function (node, refNode) {
    if (node instanceof DocumentFragment) {
      var insertedNodes = Array.prototype.slice.apply(node.childNodes);
      var _nativeResult = Native.Node_insertBefore.call(this, node, refNode);

      // DocumentFragments can't be connected, so `disconnectTree` will never
      // need to be called on a DocumentFragment's children after inserting it.

      if (isConnected(this)) {
        for (var i = 0; i < insertedNodes.length; i++) {
          internals.connectTree(insertedNodes[i]);
        }
      }

      return _nativeResult;
    }

    var nodeWasConnected = isConnected(node);
    var nativeResult = Native.Node_insertBefore.call(this, node, refNode);

    if (nodeWasConnected) {
      internals.disconnectTree(node);
    }

    if (isConnected(this)) {
      internals.connectTree(node);
    }

    return nativeResult;
  });

  setPropertyUnchecked(Node.prototype, 'appendChild',
  /**
   * @this {Node}
   * @param {!Node} node
   * @return {!Node}
   */
  function (node) {
    if (node instanceof DocumentFragment) {
      var insertedNodes = Array.prototype.slice.apply(node.childNodes);
      var _nativeResult2 = Native.Node_appendChild.call(this, node);

      // DocumentFragments can't be connected, so `disconnectTree` will never
      // need to be called on a DocumentFragment's children after inserting it.

      if (isConnected(this)) {
        for (var i = 0; i < insertedNodes.length; i++) {
          internals.connectTree(insertedNodes[i]);
        }
      }

      return _nativeResult2;
    }

    var nodeWasConnected = isConnected(node);
    var nativeResult = Native.Node_appendChild.call(this, node);

    if (nodeWasConnected) {
      internals.disconnectTree(node);
    }

    if (isConnected(this)) {
      internals.connectTree(node);
    }

    return nativeResult;
  });

  setPropertyUnchecked(Node.prototype, 'cloneNode',
  /**
   * @this {Node}
   * @param {boolean=} deep
   * @return {!Node}
   */
  function (deep) {
    var clone = Native.Node_cloneNode.call(this, deep);
    // Only create custom elements if this element's owner document is
    // associated with the registry.
    if (!this.ownerDocument.__CE_hasRegistry) {
      internals.patchTree(clone);
    } else {
      internals.patchAndUpgradeTree(clone);
    }
    return clone;
  });

  setPropertyUnchecked(Node.prototype, 'removeChild',
  /**
   * @this {Node}
   * @param {!Node} node
   * @return {!Node}
   */
  function (node) {
    var nodeWasConnected = isConnected(node);
    var nativeResult = Native.Node_removeChild.call(this, node);

    if (nodeWasConnected) {
      internals.disconnectTree(node);
    }

    return nativeResult;
  });

  setPropertyUnchecked(Node.prototype, 'replaceChild',
  /**
   * @this {Node}
   * @param {!Node} nodeToInsert
   * @param {!Node} nodeToRemove
   * @return {!Node}
   */
  function (nodeToInsert, nodeToRemove) {
    if (nodeToInsert instanceof DocumentFragment) {
      var insertedNodes = Array.prototype.slice.apply(nodeToInsert.childNodes);
      var _nativeResult3 = Native.Node_replaceChild.call(this, nodeToInsert, nodeToRemove);

      // DocumentFragments can't be connected, so `disconnectTree` will never
      // need to be called on a DocumentFragment's children after inserting it.

      if (isConnected(this)) {
        internals.disconnectTree(nodeToRemove);
        for (var i = 0; i < insertedNodes.length; i++) {
          internals.connectTree(insertedNodes[i]);
        }
      }

      return _nativeResult3;
    }

    var nodeToInsertWasConnected = isConnected(nodeToInsert);
    var nativeResult = Native.Node_replaceChild.call(this, nodeToInsert, nodeToRemove);
    var thisIsConnected = isConnected(this);

    if (thisIsConnected) {
      internals.disconnectTree(nodeToRemove);
    }

    if (nodeToInsertWasConnected) {
      internals.disconnectTree(nodeToInsert);
    }

    if (thisIsConnected) {
      internals.connectTree(nodeToInsert);
    }

    return nativeResult;
  });

  function patch_textContent(destination, baseDescriptor) {
    Object.defineProperty(destination, 'textContent', {
      enumerable: baseDescriptor.enumerable,
      configurable: true,
      get: baseDescriptor.get,
      set: /** @this {Node} */function set(assignedValue) {
        // If this is a text node then there are no nodes to disconnect.
        if (this.nodeType === Node.TEXT_NODE) {
          baseDescriptor.set.call(this, assignedValue);
          return;
        }

        var removedNodes = undefined;
        // Checking for `firstChild` is faster than reading `childNodes.length`
        // to compare with 0.
        if (this.firstChild) {
          // Using `childNodes` is faster than `children`, even though we only
          // care about elements.
          var childNodes = this.childNodes;
          var childNodesLength = childNodes.length;
          if (childNodesLength > 0 && isConnected(this)) {
            // Copying an array by iterating is faster than using slice.
            removedNodes = new Array(childNodesLength);
            for (var i = 0; i < childNodesLength; i++) {
              removedNodes[i] = childNodes[i];
            }
          }
        }

        baseDescriptor.set.call(this, assignedValue);

        if (removedNodes) {
          for (var _i = 0; _i < removedNodes.length; _i++) {
            internals.disconnectTree(removedNodes[_i]);
          }
        }
      }
    });
  }

  if (Native.Node_textContent && Native.Node_textContent.get) {
    patch_textContent(Node.prototype, Native.Node_textContent);
  } else {
    internals.addPatch(function (element) {
      patch_textContent(element, {
        enumerable: true,
        configurable: true,
        // NOTE: This implementation of the `textContent` getter assumes that
        // text nodes' `textContent` getter will not be patched.
        get: /** @this {Node} */function get() {
          /** @type {!Array<string>} */
          var parts = [];

          for (var i = 0; i < this.childNodes.length; i++) {
            parts.push(this.childNodes[i].textContent);
          }

          return parts.join('');
        },
        set: /** @this {Node} */function set(assignedValue) {
          while (this.firstChild) {
            Native.Node_removeChild.call(this, this.firstChild);
          }
          Native.Node_appendChild.call(this, document.createTextNode(assignedValue));
        }
      });
    });
  }
};

/**
 * @param {!CustomElementInternals} internals
 * @param {!Object} destination
 * @param {!ChildNodeNativeMethods} builtIn
 */
var PatchChildNode = function (internals, destination, builtIn) {
  /**
   * @param {!function(...(!Node|string))} builtInMethod
   * @return {!function(...(!Node|string))}
   */
  function beforeAfterPatch(builtInMethod) {
    return function () {
      /**
       * A copy of `nodes`, with any DocumentFragment replaced by its children.
       * @type {!Array<!Node>}
       */
      var flattenedNodes = [];

      /**
       * Elements in `nodes` that were connected before this call.
       * @type {!Array<!Node>}
       */
      var connectedElements = [];

      for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
        nodes[_key] = arguments[_key];
      }

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        if (node instanceof Element && isConnected(node)) {
          connectedElements.push(node);
        }

        if (node instanceof DocumentFragment) {
          for (var child = node.firstChild; child; child = child.nextSibling) {
            flattenedNodes.push(child);
          }
        } else {
          flattenedNodes.push(node);
        }
      }

      builtInMethod.apply(this, nodes);

      for (var _i = 0; _i < connectedElements.length; _i++) {
        internals.disconnectTree(connectedElements[_i]);
      }

      if (isConnected(this)) {
        for (var _i2 = 0; _i2 < flattenedNodes.length; _i2++) {
          var _node = flattenedNodes[_i2];
          if (_node instanceof Element) {
            internals.connectTree(_node);
          }
        }
      }
    };
  }

  if (builtIn.before !== undefined) {
    setPropertyUnchecked(destination, 'before', beforeAfterPatch(builtIn.before));
  }

  if (builtIn.before !== undefined) {
    setPropertyUnchecked(destination, 'after', beforeAfterPatch(builtIn.after));
  }

  if (builtIn.replaceWith !== undefined) {
    setPropertyUnchecked(destination, 'replaceWith',
    /**
     * @param {...(!Node|string)} nodes
     */
    function () {
      /**
       * A copy of `nodes`, with any DocumentFragment replaced by its children.
       * @type {!Array<!Node>}
       */
      var flattenedNodes = [];

      /**
       * Elements in `nodes` that were connected before this call.
       * @type {!Array<!Node>}
       */
      var connectedElements = [];

      for (var _len2 = arguments.length, nodes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        nodes[_key2] = arguments[_key2];
      }

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        if (node instanceof Element && isConnected(node)) {
          connectedElements.push(node);
        }

        if (node instanceof DocumentFragment) {
          for (var child = node.firstChild; child; child = child.nextSibling) {
            flattenedNodes.push(child);
          }
        } else {
          flattenedNodes.push(node);
        }
      }

      var wasConnected = isConnected(this);

      builtIn.replaceWith.apply(this, nodes);

      for (var _i3 = 0; _i3 < connectedElements.length; _i3++) {
        internals.disconnectTree(connectedElements[_i3]);
      }

      if (wasConnected) {
        internals.disconnectTree(this);
        for (var _i4 = 0; _i4 < flattenedNodes.length; _i4++) {
          var _node2 = flattenedNodes[_i4];
          if (_node2 instanceof Element) {
            internals.connectTree(_node2);
          }
        }
      }
    });
  }

  if (builtIn.remove !== undefined) {
    setPropertyUnchecked(destination, 'remove', function () {
      var wasConnected = isConnected(this);

      builtIn.remove.call(this);

      if (wasConnected) {
        internals.disconnectTree(this);
      }
    });
  }
};

/**
 * @param {!CustomElementInternals} internals
 */
var PatchElement = function (internals) {
  if (Native.Element_attachShadow) {
    setPropertyUnchecked(Element.prototype, 'attachShadow',
    /**
     * @this {Element}
     * @param {!{mode: string}} init
     * @return {ShadowRoot}
     */
    function (init) {
      var shadowRoot = Native.Element_attachShadow.call(this, init);
      this.__CE_shadowRoot = shadowRoot;
      return shadowRoot;
    });
  }

  function patch_innerHTML(destination, baseDescriptor) {
    Object.defineProperty(destination, 'innerHTML', {
      enumerable: baseDescriptor.enumerable,
      configurable: true,
      get: baseDescriptor.get,
      set: /** @this {Element} */function set(htmlString) {
        var _this = this;

        var isConnected$$1 = isConnected(this);

        // NOTE: In IE11, when using the native `innerHTML` setter, all nodes
        // that were previously descendants of the context element have all of
        // their children removed as part of the set - the entire subtree is
        // 'disassembled'. This work around walks the subtree *before* using the
        // native setter.
        /** @type {!Array<!Element>|undefined} */
        var removedElements = undefined;
        if (isConnected$$1) {
          removedElements = [];
          walkDeepDescendantElements(this, function (element) {
            if (element !== _this) {
              removedElements.push(element);
            }
          });
        }

        baseDescriptor.set.call(this, htmlString);

        if (removedElements) {
          for (var i = 0; i < removedElements.length; i++) {
            var element = removedElements[i];
            if (element.__CE_state === CustomElementState.custom) {
              internals.disconnectedCallback(element);
            }
          }
        }

        // Only create custom elements if this element's owner document is
        // associated with the registry.
        if (!this.ownerDocument.__CE_hasRegistry) {
          internals.patchTree(this);
        } else {
          internals.patchAndUpgradeTree(this);
        }
        return htmlString;
      }
    });
  }

  if (Native.Element_innerHTML && Native.Element_innerHTML.get) {
    patch_innerHTML(Element.prototype, Native.Element_innerHTML);
  } else if (Native.HTMLElement_innerHTML && Native.HTMLElement_innerHTML.get) {
    patch_innerHTML(HTMLElement.prototype, Native.HTMLElement_innerHTML);
  } else {

    internals.addPatch(function (element) {
      patch_innerHTML(element, {
        enumerable: true,
        configurable: true,
        // Implements getting `innerHTML` by performing an unpatched `cloneNode`
        // of the element and returning the resulting element's `innerHTML`.
        // TODO: Is this too expensive?
        get: /** @this {Element} */function get() {
          return Native.Node_cloneNode.call(this, true).innerHTML;
        },
        // Implements setting `innerHTML` by creating an unpatched element,
        // setting `innerHTML` of that element and replacing the target
        // element's children with those of the unpatched element.
        set: /** @this {Element} */function set(assignedValue) {
          // NOTE: re-route to `content` for `template` elements.
          // We need to do this because `template.appendChild` does not
          // route into `template.content`.
          var isTemplate = this.localName === 'template';
          /** @type {!Node} */
          var content = isTemplate ? /** @type {!HTMLTemplateElement} */
          this.content : this;
          /** @type {!Node} */
          var rawElement = Native.Document_createElement.call(document, this.localName);
          rawElement.innerHTML = assignedValue;

          while (content.childNodes.length > 0) {
            Native.Node_removeChild.call(content, content.childNodes[0]);
          }
          var container = isTemplate ? rawElement.content : rawElement;
          while (container.childNodes.length > 0) {
            Native.Node_appendChild.call(content, container.childNodes[0]);
          }
        }
      });
    });
  }

  setPropertyUnchecked(Element.prototype, 'setAttribute',
  /**
   * @this {Element}
   * @param {string} name
   * @param {string} newValue
   */
  function (name, newValue) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_setAttribute.call(this, name, newValue);
    }

    var oldValue = Native.Element_getAttribute.call(this, name);
    Native.Element_setAttribute.call(this, name, newValue);
    newValue = Native.Element_getAttribute.call(this, name);
    internals.attributeChangedCallback(this, name, oldValue, newValue, null);
  });

  setPropertyUnchecked(Element.prototype, 'setAttributeNS',
  /**
   * @this {Element}
   * @param {?string} namespace
   * @param {string} name
   * @param {string} newValue
   */
  function (namespace, name, newValue) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_setAttributeNS.call(this, namespace, name, newValue);
    }

    var oldValue = Native.Element_getAttributeNS.call(this, namespace, name);
    Native.Element_setAttributeNS.call(this, namespace, name, newValue);
    newValue = Native.Element_getAttributeNS.call(this, namespace, name);
    internals.attributeChangedCallback(this, name, oldValue, newValue, namespace);
  });

  setPropertyUnchecked(Element.prototype, 'removeAttribute',
  /**
   * @this {Element}
   * @param {string} name
   */
  function (name) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_removeAttribute.call(this, name);
    }

    var oldValue = Native.Element_getAttribute.call(this, name);
    Native.Element_removeAttribute.call(this, name);
    if (oldValue !== null) {
      internals.attributeChangedCallback(this, name, oldValue, null, null);
    }
  });

  setPropertyUnchecked(Element.prototype, 'removeAttributeNS',
  /**
   * @this {Element}
   * @param {?string} namespace
   * @param {string} name
   */
  function (namespace, name) {
    // Fast path for non-custom elements.
    if (this.__CE_state !== CustomElementState.custom) {
      return Native.Element_removeAttributeNS.call(this, namespace, name);
    }

    var oldValue = Native.Element_getAttributeNS.call(this, namespace, name);
    Native.Element_removeAttributeNS.call(this, namespace, name);
    // In older browsers, `Element#getAttributeNS` may return the empty string
    // instead of null if the attribute does not exist. For details, see;
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS#Notes
    var newValue = Native.Element_getAttributeNS.call(this, namespace, name);
    if (oldValue !== newValue) {
      internals.attributeChangedCallback(this, name, oldValue, newValue, namespace);
    }
  });

  function patch_insertAdjacentElement(destination, baseMethod) {
    setPropertyUnchecked(destination, 'insertAdjacentElement',
    /**
     * @this {Element}
     * @param {string} where
     * @param {!Element} element
     * @return {?Element}
     */
    function (where, element) {
      var wasConnected = isConnected(element);
      var insertedElement = /** @type {!Element} */
      baseMethod.call(this, where, element);

      if (wasConnected) {
        internals.disconnectTree(element);
      }

      if (isConnected(insertedElement)) {
        internals.connectTree(element);
      }
      return insertedElement;
    });
  }

  if (Native.HTMLElement_insertAdjacentElement) {
    patch_insertAdjacentElement(HTMLElement.prototype, Native.HTMLElement_insertAdjacentElement);
  } else if (Native.Element_insertAdjacentElement) {
    patch_insertAdjacentElement(Element.prototype, Native.Element_insertAdjacentElement);
  } else {
    console.warn('Custom Elements: `Element#insertAdjacentElement` was not patched.');
  }

  PatchParentNode(internals, Element.prototype, {
    prepend: Native.Element_prepend,
    append: Native.Element_append
  });

  PatchChildNode(internals, Element.prototype, {
    before: Native.Element_before,
    after: Native.Element_after,
    replaceWith: Native.Element_replaceWith,
    remove: Native.Element_remove
  });
};

/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var priorCustomElements = window['customElements'];

if (!priorCustomElements || priorCustomElements['forcePolyfill'] || typeof priorCustomElements['define'] != 'function' || typeof priorCustomElements['get'] != 'function') {
  /** @type {!CustomElementInternals} */
  var internals = new CustomElementInternals();

  PatchHTMLElement(internals);
  PatchDocument(internals);
  PatchDocumentFragment(internals);
  PatchNode(internals);
  PatchElement(internals);

  // The main document is always associated with the registry.
  document.__CE_hasRegistry = true;

  /** @type {!CustomElementRegistry} */
  var customElements = new CustomElementRegistry(internals);

  Object.defineProperty(window, 'customElements', {
    configurable: true,
    enumerable: true,
    value: customElements
  });
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
Extremely simple css parser. Intended to be not more than what we need
and definitely not necessarily correct =).
*/

/** @unrestricted */

var StyleNode = function StyleNode() {
  classCallCheck(this, StyleNode);

  /** @type {number} */
  this['start'] = 0;
  /** @type {number} */
  this['end'] = 0;
  /** @type {StyleNode} */
  this['previous'] = null;
  /** @type {StyleNode} */
  this['parent'] = null;
  /** @type {Array<StyleNode>} */
  this['rules'] = null;
  /** @type {string} */
  this['parsedCssText'] = '';
  /** @type {string} */
  this['cssText'] = '';
  /** @type {boolean} */
  this['atRule'] = false;
  /** @type {number} */
  this['type'] = 0;
  /** @type {string} */
  this['keyframesName'] = '';
  /** @type {string} */
  this['selector'] = '';
  /** @type {string} */
  this['parsedSelector'] = '';
};

// given a string of css, return a simple rule tree
/**
 * @param {string} text
 * @return {StyleNode}
 */
function parse(text) {
  text = clean(text);
  return parseCss(lex(text), text);
}

// remove stuff we don't care about that may hinder parsing
/**
 * @param {string} cssText
 * @return {string}
 */
function clean(cssText) {
  return cssText.replace(RX.comments, '').replace(RX.port, '');
}

// super simple {...} lexer that returns a node tree
/**
 * @param {string} text
 * @return {StyleNode}
 */
function lex(text) {
  var root = new StyleNode();
  root['start'] = 0;
  root['end'] = text.length;
  var n = root;
  for (var i = 0, l = text.length; i < l; i++) {
    if (text[i] === OPEN_BRACE) {
      if (!n['rules']) {
        n['rules'] = [];
      }
      var p = n;
      var previous = p['rules'][p['rules'].length - 1] || null;
      n = new StyleNode();
      n['start'] = i + 1;
      n['parent'] = p;
      n['previous'] = previous;
      p['rules'].push(n);
    } else if (text[i] === CLOSE_BRACE) {
      n['end'] = i + 1;
      n = n['parent'] || root;
    }
  }
  return root;
}

// add selectors/cssText to node tree
/**
 * @param {StyleNode} node
 * @param {string} text
 * @return {StyleNode}
 */
function parseCss(node, text) {
  var t = text.substring(node['start'], node['end'] - 1);
  node['parsedCssText'] = node['cssText'] = t.trim();
  if (node['parent']) {
    var ss = node['previous'] ? node['previous']['end'] : node['parent']['start'];
    t = text.substring(ss, node['start'] - 1);
    t = _expandUnicodeEscapes(t);
    t = t.replace(RX.multipleSpaces, ' ');
    // TODO(sorvell): ad hoc; make selector include only after last ;
    // helps with mixin syntax
    t = t.substring(t.lastIndexOf(';') + 1);
    var s = node['parsedSelector'] = node['selector'] = t.trim();
    node['atRule'] = s.indexOf(AT_START) === 0;
    // note, support a subset of rule types...
    if (node['atRule']) {
      if (s.indexOf(MEDIA_START) === 0) {
        node['type'] = types.MEDIA_RULE;
      } else if (s.match(RX.keyframesRule)) {
        node['type'] = types.KEYFRAMES_RULE;
        node['keyframesName'] = node['selector'].split(RX.multipleSpaces).pop();
      }
    } else {
      if (s.indexOf(VAR_START) === 0) {
        node['type'] = types.MIXIN_RULE;
      } else {
        node['type'] = types.STYLE_RULE;
      }
    }
  }
  var r$ = node['rules'];
  if (r$) {
    for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
      parseCss(r, text);
    }
  }
  return node;
}

/**
 * conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
 * expanded form that doesn't require trailing space `\000033`
 * @param {string} s
 * @return {string}
 */
function _expandUnicodeEscapes(s) {
  return s.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
    var code = arguments[1],
        repeat = 6 - code.length;
    while (repeat--) {
      code = '0' + code;
    }
    return '\\' + code;
  });
}

/**
 * stringify parsed css.
 * @param {StyleNode} node
 * @param {boolean=} preserveProperties
 * @param {string=} text
 * @return {string}
 */
function stringify(node, preserveProperties) {
  var text = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  // calc rule cssText
  var cssText = '';
  if (node['cssText'] || node['rules']) {
    var r$ = node['rules'];
    if (r$ && !_hasMixinRules(r$)) {
      for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
        cssText = stringify(r, preserveProperties, cssText);
      }
    } else {
      cssText = preserveProperties ? node['cssText'] : removeCustomProps(node['cssText']);
      cssText = cssText.trim();
      if (cssText) {
        cssText = '  ' + cssText + '\n';
      }
    }
  }
  // emit rule if there is cssText
  if (cssText) {
    if (node['selector']) {
      text += node['selector'] + ' ' + OPEN_BRACE + '\n';
    }
    text += cssText;
    if (node['selector']) {
      text += CLOSE_BRACE + '\n\n';
    }
  }
  return text;
}

/**
 * @param {Array<StyleNode>} rules
 * @return {boolean}
 */
function _hasMixinRules(rules) {
  var r = rules[0];
  return Boolean(r) && Boolean(r['selector']) && r['selector'].indexOf(VAR_START) === 0;
}

/**
 * @param {string} cssText
 * @return {string}
 */
function removeCustomProps(cssText) {
  cssText = removeCustomPropAssignment(cssText);
  return removeCustomPropApply(cssText);
}

/**
 * @param {string} cssText
 * @return {string}
 */
function removeCustomPropAssignment(cssText) {
  return cssText.replace(RX.customProp, '').replace(RX.mixinProp, '');
}

/**
 * @param {string} cssText
 * @return {string}
 */
function removeCustomPropApply(cssText) {
  return cssText.replace(RX.mixinApply, '').replace(RX.varApply, '');
}

/** @enum {number} */
var types = {
  STYLE_RULE: 1,
  KEYFRAMES_RULE: 7,
  MEDIA_RULE: 4,
  MIXIN_RULE: 1000
};

var OPEN_BRACE = '{';
var CLOSE_BRACE = '}';

// helper regexp's
var RX = {
  comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
  port: /@import[^;]*;/gim,
  customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
  mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
  mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
  varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
  keyframesRule: /^@[^\s]*keyframes/,
  multipleSpaces: /\s+/g
};

var VAR_START = '--';
var MEDIA_START = '@media';
var AT_START = '@';

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var nativeShadow = !(window['ShadyDOM'] && window['ShadyDOM']['inUse']);
var nativeCssVariables = void 0;

/**
 * @param {(ShadyCSSOptions | ShadyCSSInterface)=} settings
 */
function calcCssVariables(settings) {
  if (settings && settings['shimcssproperties']) {
    nativeCssVariables = false;
  } else {
    // chrome 49 has semi-working css vars, check if box-shadow works
    // safari 9.1 has a recalc bug: https://bugs.webkit.org/show_bug.cgi?id=155782
    // However, shim css custom properties are only supported with ShadyDOM enabled,
    // so fall back on native if we do not detect ShadyDOM
    // Edge 15: custom properties used in ::before and ::after will also be used in the parent element
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12414257/
    nativeCssVariables = nativeShadow || Boolean(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) && window.CSS && CSS.supports && CSS.supports('box-shadow', '0 0 0 var(--foo)'));
  }
}

if (window.ShadyCSS && window.ShadyCSS.nativeCss !== undefined) {
  nativeCssVariables = window.ShadyCSS.nativeCss;
} else if (window.ShadyCSS) {
  calcCssVariables(window.ShadyCSS);
  // reset window variable to let ShadyCSS API take its place
  window.ShadyCSS = undefined;
} else {
  calcCssVariables(window['WebComponents'] && window['WebComponents']['flags']);
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var VAR_ASSIGN = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi;
var MIXIN_MATCH = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi;
var VAR_CONSUMED = /(--[\w-]+)\s*([:,;)]|$)/gi;
var ANIMATION_MATCH = /(animation\s*:)|(animation-name\s*:)/;
var MEDIA_MATCH = /@media\s(.*)/;

var BRACKETED = /\{[^}]*\}/g;
var HOST_PREFIX = '(?:^|[^.#[:])';
var HOST_SUFFIX = '($|[.:[\\s>+~])';

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/** @type {!Set<string>} */

var styleTextSet = new Set();

var scopingAttribute = 'shady-unscoped';

/**
 * Add a specifically-marked style to the document directly, and only one copy of that style.
 *
 * @param {!HTMLStyleElement} style
 * @return {undefined}
 */
function processUnscopedStyle(style) {
  var text = style.textContent;
  if (!styleTextSet.has(text)) {
    styleTextSet.add(text);
    var newStyle = style.cloneNode(true);
    document.head.appendChild(newStyle);
  }
}

/**
 * Check if a style is supposed to be unscoped
 * @param {!HTMLStyleElement} style
 * @return {boolean} true if the style has the unscoping attribute
 */
function isUnscopedStyle(style) {
  return style.hasAttribute(scopingAttribute);
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @param {string|StyleNode} rules
 * @param {function(StyleNode)=} callback
 * @return {string}
 */
function toCssText(rules, callback) {
  if (!rules) {
    return '';
  }
  if (typeof rules === 'string') {
    rules = parse(rules);
  }
  if (callback) {
    forEachRule(rules, callback);
  }
  return stringify(rules, nativeCssVariables);
}

/**
 * @param {HTMLStyleElement} style
 * @return {StyleNode}
 */
function rulesForStyle(style) {
  if (!style['__cssRules'] && style.textContent) {
    style['__cssRules'] = parse(style.textContent);
  }
  return style['__cssRules'] || null;
}

// Tests if a rule is a keyframes selector, which looks almost exactly
// like a normal selector but is not (it has nothing to do with scoping
// for example).
/**
 * @param {StyleNode} rule
 * @return {boolean}
 */
function isKeyframesSelector(rule) {
  return Boolean(rule['parent']) && rule['parent']['type'] === types.KEYFRAMES_RULE;
}

/**
 * @param {StyleNode} node
 * @param {Function=} styleRuleCallback
 * @param {Function=} keyframesRuleCallback
 * @param {boolean=} onlyActiveRules
 */
function forEachRule(node, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
  if (!node) {
    return;
  }
  var skipRules = false;
  var type = node['type'];
  if (onlyActiveRules) {
    if (type === types.MEDIA_RULE) {
      var matchMedia = node['selector'].match(MEDIA_MATCH);
      if (matchMedia) {
        // if rule is a non matching @media rule, skip subrules
        if (!window.matchMedia(matchMedia[1]).matches) {
          skipRules = true;
        }
      }
    }
  }
  if (type === types.STYLE_RULE) {
    styleRuleCallback(node);
  } else if (keyframesRuleCallback && type === types.KEYFRAMES_RULE) {
    keyframesRuleCallback(node);
  } else if (type === types.MIXIN_RULE) {
    skipRules = true;
  }
  var r$ = node['rules'];
  if (r$ && !skipRules) {
    for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
      forEachRule(r, styleRuleCallback, keyframesRuleCallback, onlyActiveRules);
    }
  }
}

// add a string of cssText to the document.
/**
 * @param {string} cssText
 * @param {string} moniker
 * @param {Node} target
 * @param {Node} contextNode
 * @return {HTMLStyleElement}
 */
function applyCss(cssText, moniker, target, contextNode) {
  var style = createScopeStyle(cssText, moniker);
  applyStyle(style, target, contextNode);
  return style;
}

/**
 * @param {string} cssText
 * @param {string} moniker
 * @return {HTMLStyleElement}
 */
function createScopeStyle(cssText, moniker) {
  var style = /** @type {HTMLStyleElement} */document.createElement('style');
  if (moniker) {
    style.setAttribute('scope', moniker);
  }
  style.textContent = cssText;
  return style;
}

/**
 * Track the position of the last added style for placing placeholders
 * @type {Node}
 */
var lastHeadApplyNode = null;

// insert a comment node as a styling position placeholder.
/**
 * @param {string} moniker
 * @return {!Comment}
 */
function applyStylePlaceHolder(moniker) {
  var placeHolder = document.createComment(' Shady DOM styles for ' + moniker + ' ');
  var after = lastHeadApplyNode ? lastHeadApplyNode['nextSibling'] : null;
  var scope = document.head;
  scope.insertBefore(placeHolder, after || scope.firstChild);
  lastHeadApplyNode = placeHolder;
  return placeHolder;
}

/**
 * @param {HTMLStyleElement} style
 * @param {?Node} target
 * @param {?Node} contextNode
 */
function applyStyle(style, target, contextNode) {
  target = target || document.head;
  var after = contextNode && contextNode.nextSibling || target.firstChild;
  target.insertBefore(style, after);
  if (!lastHeadApplyNode) {
    lastHeadApplyNode = style;
  } else {
    // only update lastHeadApplyNode if the new style is inserted after the old lastHeadApplyNode
    var position = style.compareDocumentPosition(lastHeadApplyNode);
    if (position === Node.DOCUMENT_POSITION_PRECEDING) {
      lastHeadApplyNode = style;
    }
  }
}

/**
 * @param {string} buildType
 * @return {boolean}
 */


/**
 * @param {Element} element
 * @return {?string}
 */


/**
 * Walk from text[start] matching parens and
 * returns position of the outer end paren
 * @param {string} text
 * @param {number} start
 * @return {number}
 */
function findMatchingParen(text, start) {
  var level = 0;
  for (var i = start, l = text.length; i < l; i++) {
    if (text[i] === '(') {
      level++;
    } else if (text[i] === ')') {
      if (--level === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * @param {string} str
 * @param {function(string, string, string, string)} callback
 */
function processVariableAndFallback(str, callback) {
  // find 'var('
  var start = str.indexOf('var(');
  if (start === -1) {
    // no var?, everything is prefix
    return callback(str, '', '', '');
  }
  //${prefix}var(${inner})${suffix}
  var end = findMatchingParen(str, start + 3);
  var inner = str.substring(start + 4, end);
  var prefix = str.substring(0, start);
  // suffix may have other variables
  var suffix = processVariableAndFallback(str.substring(end + 1), callback);
  var comma = inner.indexOf(',');
  // value and fallback args should be trimmed to match in property lookup
  if (comma === -1) {
    // variable, no fallback
    return callback(prefix, inner.trim(), '', suffix);
  }
  // var(${value},${fallback})
  var value = inner.substring(0, comma).trim();
  var fallback = inner.substring(comma + 1).trim();
  return callback(prefix, value, fallback, suffix);
}

/**
 * @param {Element} element
 * @param {string} value
 */
function setElementClassRaw(element, value) {
  // use native setAttribute provided by ShadyDOM when setAttribute is patched
  if (nativeShadow) {
    element.setAttribute('class', value);
  } else {
    window['ShadyDOM']['nativeMethods']['setAttribute'].call(element, 'class', value);
  }
}

/**
 * @param {Element | {is: string, extends: string}} element
 * @return {{is: string, typeExtension: string}}
 */
function getIsExtends(element) {
  var localName = element['localName'];
  var is = '',
      typeExtension = '';
  /*
  NOTE: technically, this can be wrong for certain svg elements
  with `-` in the name like `<font-face>`
  */
  if (localName) {
    if (localName.indexOf('-') > -1) {
      is = localName;
    } else {
      typeExtension = localName;
      is = element.getAttribute && element.getAttribute('is') || '';
    }
  } else {
    is = /** @type {?} */element.is;
    typeExtension = /** @type {?} */element.extends;
  }
  return { is: is, typeExtension: typeExtension };
}

/**
 * @param {Element|DocumentFragment} element
 * @return {string}
 */
function gatherStyleText(element) {
  /** @type {!Array<string>} */
  var styleTextParts = [];
  var styles = /** @type {!NodeList<!HTMLStyleElement>} */element.querySelectorAll('style');
  for (var i = 0; i < styles.length; i++) {
    var style = styles[i];
    if (isUnscopedStyle(style)) {
      if (!nativeShadow) {
        processUnscopedStyle(style);
        style.parentNode.removeChild(style);
      }
    } else {
      styleTextParts.push(style.textContent);
      style.parentNode.removeChild(style);
    }
  }
  return styleTextParts.join('').trim();
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/* Transforms ShadowDOM styling into ShadyDOM styling

* scoping:

  * elements in scope get scoping selector class="x-foo-scope"
  * selectors re-written as follows:

    div button -> div.x-foo-scope button.x-foo-scope

* :host -> scopeName

* :host(...) -> scopeName...

* ::slotted(...) -> scopeName > ...

* ...:dir(ltr|rtl) -> [dir="ltr|rtl"] ..., ...[dir="ltr|rtl"]

* :host(:dir[rtl]) -> scopeName:dir(rtl) -> [dir="rtl"] scopeName, scopeName[dir="rtl"]

*/
var SCOPE_NAME = 'style-scope';

var StyleTransformer = function () {
  function StyleTransformer() {
    classCallCheck(this, StyleTransformer);
  }

  createClass(StyleTransformer, [{
    key: 'dom',

    // Given a node and scope name, add a scoping class to each node
    // in the tree. This facilitates transforming css into scoped rules.
    value: function dom(node, scope, shouldRemoveScope) {
      // one time optimization to skip scoping...
      if (node['__styleScoped']) {
        node['__styleScoped'] = null;
      } else {
        this._transformDom(node, scope || '', shouldRemoveScope);
      }
    }
  }, {
    key: '_transformDom',
    value: function _transformDom(node, selector, shouldRemoveScope) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.element(node, selector, shouldRemoveScope);
      }
      var c$ = node.localName === 'template' ? (node.content || node._content).childNodes : node.children || node.childNodes;
      if (c$) {
        for (var i = 0; i < c$.length; i++) {
          this._transformDom(c$[i], selector, shouldRemoveScope);
        }
      }
    }
  }, {
    key: 'element',
    value: function element(_element, scope, shouldRemoveScope) {
      // note: if using classes, we add both the general 'style-scope' class
      // as well as the specific scope. This enables easy filtering of all
      // `style-scope` elements
      if (scope) {
        // note: svg on IE does not have classList so fallback to class
        if (_element.classList) {
          if (shouldRemoveScope) {
            _element.classList.remove(SCOPE_NAME);
            _element.classList.remove(scope);
          } else {
            _element.classList.add(SCOPE_NAME);
            _element.classList.add(scope);
          }
        } else if (_element.getAttribute) {
          var c = _element.getAttribute(CLASS);
          if (shouldRemoveScope) {
            if (c) {
              var newValue = c.replace(SCOPE_NAME, '').replace(scope, '');
              setElementClassRaw(_element, newValue);
            }
          } else {
            var _newValue = (c ? c + ' ' : '') + SCOPE_NAME + ' ' + scope;
            setElementClassRaw(_element, _newValue);
          }
        }
      }
    }
  }, {
    key: 'elementStyles',
    value: function elementStyles(element, styleRules, callback) {
      var cssBuildType = element['__cssBuild'];
      // no need to shim selectors if settings.useNativeShadow, also
      // a shady css build will already have transformed selectors
      // NOTE: This method may be called as part of static or property shimming.
      // When there is a targeted build it will not be called for static shimming,
      // but when the property shim is used it is called and should opt out of
      // static shimming work when a proper build exists.
      var cssText = '';
      if (nativeShadow || cssBuildType === 'shady') {
        cssText = toCssText(styleRules, callback);
      } else {
        var _StyleUtil$getIsExten = getIsExtends(element),
            is = _StyleUtil$getIsExten.is,
            typeExtension = _StyleUtil$getIsExten.typeExtension;

        cssText = this.css(styleRules, is, typeExtension, callback) + '\n\n';
      }
      return cssText.trim();
    }

    // Given a string of cssText and a scoping string (scope), returns
    // a string of scoped css where each selector is transformed to include
    // a class created from the scope. ShadowDOM selectors are also transformed
    // (e.g. :host) to use the scoping selector.

  }, {
    key: 'css',
    value: function css(rules, scope, ext, callback) {
      var hostScope = this._calcHostScope(scope, ext);
      scope = this._calcElementScope(scope);
      var self = this;
      return toCssText(rules, function ( /** StyleNode */rule) {
        if (!rule.isScoped) {
          self.rule(rule, scope, hostScope);
          rule.isScoped = true;
        }
        if (callback) {
          callback(rule, scope, hostScope);
        }
      });
    }
  }, {
    key: '_calcElementScope',
    value: function _calcElementScope(scope) {
      if (scope) {
        return CSS_CLASS_PREFIX + scope;
      } else {
        return '';
      }
    }
  }, {
    key: '_calcHostScope',
    value: function _calcHostScope(scope, ext) {
      return ext ? '[is=' + scope + ']' : scope;
    }
  }, {
    key: 'rule',
    value: function rule(_rule, scope, hostScope) {
      this._transformRule(_rule, this._transformComplexSelector, scope, hostScope);
    }

    /**
     * transforms a css rule to a scoped rule.
     *
     * @param {StyleNode} rule
     * @param {Function} transformer
     * @param {string=} scope
     * @param {string=} hostScope
     */

  }, {
    key: '_transformRule',
    value: function _transformRule(rule, transformer, scope, hostScope) {
      // NOTE: save transformedSelector for subsequent matching of elements
      // against selectors (e.g. when calculating style properties)
      rule['selector'] = rule.transformedSelector = this._transformRuleCss(rule, transformer, scope, hostScope);
    }

    /**
     * @param {StyleNode} rule
     * @param {Function} transformer
     * @param {string=} scope
     * @param {string=} hostScope
     */

  }, {
    key: '_transformRuleCss',
    value: function _transformRuleCss(rule, transformer, scope, hostScope) {
      var p$ = rule['selector'].split(COMPLEX_SELECTOR_SEP);
      // we want to skip transformation of rules that appear in keyframes,
      // because they are keyframe selectors, not element selectors.
      if (!isKeyframesSelector(rule)) {
        for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
          p$[i] = transformer.call(this, p, scope, hostScope);
        }
      }
      return p$.join(COMPLEX_SELECTOR_SEP);
    }

    /**
     * @param {string} selector
     * @return {string}
     */

  }, {
    key: '_twiddleNthPlus',
    value: function _twiddleNthPlus(selector) {
      return selector.replace(NTH, function (m, type, inside) {
        if (inside.indexOf('+') > -1) {
          inside = inside.replace(/\+/g, '___');
        } else if (inside.indexOf('___') > -1) {
          inside = inside.replace(/___/g, '+');
        }
        return ':' + type + '(' + inside + ')';
      });
    }

    /**
     * @param {string} selector
     * @param {string} scope
     * @param {string=} hostScope
     */

  }, {
    key: '_transformComplexSelector',
    value: function _transformComplexSelector(selector, scope, hostScope) {
      var _this = this;

      var stop = false;
      selector = selector.trim();
      // Remove spaces inside of selectors like `:nth-of-type` because it confuses SIMPLE_SELECTOR_SEP
      var isNth = NTH.test(selector);
      if (isNth) {
        selector = selector.replace(NTH, function (m, type, inner) {
          return ':' + type + '(' + inner.replace(/\s/g, '') + ')';
        });
        selector = this._twiddleNthPlus(selector);
      }
      selector = selector.replace(SLOTTED_START, HOST + ' $1');
      selector = selector.replace(SIMPLE_SELECTOR_SEP, function (m, c, s) {
        if (!stop) {
          var info = _this._transformCompoundSelector(s, c, scope, hostScope);
          stop = stop || info.stop;
          c = info.combinator;
          s = info.value;
        }
        return c + s;
      });
      if (isNth) {
        selector = this._twiddleNthPlus(selector);
      }
      return selector;
    }
  }, {
    key: '_transformCompoundSelector',
    value: function _transformCompoundSelector(selector, combinator, scope, hostScope) {
      // replace :host with host scoping class
      var slottedIndex = selector.indexOf(SLOTTED);
      if (selector.indexOf(HOST) >= 0) {
        selector = this._transformHostSelector(selector, hostScope);
        // replace other selectors with scoping class
      } else if (slottedIndex !== 0) {
        selector = scope ? this._transformSimpleSelector(selector, scope) : selector;
      }
      // mark ::slotted() scope jump to replace with descendant selector + arg
      // also ignore left-side combinator
      var slotted = false;
      if (slottedIndex >= 0) {
        combinator = '';
        slotted = true;
      }
      // process scope jumping selectors up to the scope jump and then stop
      var stop = void 0;
      if (slotted) {
        stop = true;
        if (slotted) {
          // .zonk ::slotted(.foo) -> .zonk.scope > .foo
          selector = selector.replace(SLOTTED_PAREN, function (m, paren) {
            return ' > ' + paren;
          });
        }
      }
      selector = selector.replace(DIR_PAREN, function (m, before, dir) {
        return '[dir="' + dir + '"] ' + before + ', ' + before + '[dir="' + dir + '"]';
      });
      return { value: selector, combinator: combinator, stop: stop };
    }
  }, {
    key: '_transformSimpleSelector',
    value: function _transformSimpleSelector(selector, scope) {
      var p$ = selector.split(PSEUDO_PREFIX);
      p$[0] += scope;
      return p$.join(PSEUDO_PREFIX);
    }

    // :host(...) -> scopeName...

  }, {
    key: '_transformHostSelector',
    value: function _transformHostSelector(selector, hostScope) {
      var m = selector.match(HOST_PAREN);
      var paren = m && m[2].trim() || '';
      if (paren) {
        if (!paren[0].match(SIMPLE_SELECTOR_PREFIX)) {
          // paren starts with a type selector
          var typeSelector = paren.split(SIMPLE_SELECTOR_PREFIX)[0];
          // if the type selector is our hostScope then avoid pre-pending it
          if (typeSelector === hostScope) {
            return paren;
            // otherwise, this selector should not match in this scope so
            // output a bogus selector.
          } else {
            return SELECTOR_NO_MATCH;
          }
        } else {
          // make sure to do a replace here to catch selectors like:
          // `:host(.foo)::before`
          return selector.replace(HOST_PAREN, function (m, host, paren) {
            return hostScope + paren;
          });
        }
        // if no paren, do a straight :host replacement.
        // TODO(sorvell): this should not strictly be necessary but
        // it's needed to maintain support for `:host[foo]` type selectors
        // which have been improperly used under Shady DOM. This should be
        // deprecated.
      } else {
        return selector.replace(HOST, hostScope);
      }
    }

    /**
     * @param {StyleNode} rule
     */

  }, {
    key: 'documentRule',
    value: function documentRule(rule) {
      // reset selector in case this is redone.
      rule['selector'] = rule['parsedSelector'];
      this.normalizeRootSelector(rule);
      this._transformRule(rule, this._transformDocumentSelector);
    }

    /**
     * @param {StyleNode} rule
     */

  }, {
    key: 'normalizeRootSelector',
    value: function normalizeRootSelector(rule) {
      if (rule['selector'] === ROOT) {
        rule['selector'] = 'html';
      }
    }

    /**
     * @param {string} selector
     */

  }, {
    key: '_transformDocumentSelector',
    value: function _transformDocumentSelector(selector) {
      return selector.match(SLOTTED) ? this._transformComplexSelector(selector, SCOPE_DOC_SELECTOR) : this._transformSimpleSelector(selector.trim(), SCOPE_DOC_SELECTOR);
    }
  }, {
    key: 'SCOPE_NAME',
    get: function get$$1() {
      return SCOPE_NAME;
    }
  }]);
  return StyleTransformer;
}();

var NTH = /:(nth[-\w]+)\(([^)]+)\)/;
var SCOPE_DOC_SELECTOR = ':not(.' + SCOPE_NAME + ')';
var COMPLEX_SELECTOR_SEP = ',';
var SIMPLE_SELECTOR_SEP = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=[])+)/g;
var SIMPLE_SELECTOR_PREFIX = /[[.:#*]/;
var HOST = ':host';
var ROOT = ':root';
var SLOTTED = '::slotted';
var SLOTTED_START = new RegExp('^(' + SLOTTED + ')');
// NOTE: this supports 1 nested () pair for things like
// :host(:not([selected]), more general support requires
// parsing which seems like overkill
var HOST_PAREN = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
// similar to HOST_PAREN
var SLOTTED_PAREN = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
var DIR_PAREN = /(.*):dir\((?:(ltr|rtl))\)/;
var CSS_CLASS_PREFIX = '.';
var PSEUDO_PREFIX = ':';
var CLASS = 'class';
var SELECTOR_NO_MATCH = 'should_not_match';

var StyleTransformer$1 = new StyleTransformer();

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/** @const {string} */
var infoKey = '__styleInfo';

var StyleInfo = function () {
  createClass(StyleInfo, null, [{
    key: 'get',

    /**
     * @param {Element} node
     * @return {StyleInfo}
     */
    value: function get$$1(node) {
      if (node) {
        return node[infoKey];
      } else {
        return null;
      }
    }
    /**
     * @param {!Element} node
     * @param {StyleInfo} styleInfo
     * @return {StyleInfo}
     */

  }, {
    key: 'set',
    value: function set$$1(node, styleInfo) {
      node[infoKey] = styleInfo;
      return styleInfo;
    }
    /**
     * @param {StyleNode} ast
     * @param {Node=} placeholder
     * @param {Array<string>=} ownStylePropertyNames
     * @param {string=} elementName
     * @param {string=} typeExtension
     * @param {string=} cssBuild
     */

  }]);

  function StyleInfo(ast, placeholder, ownStylePropertyNames, elementName, typeExtension, cssBuild) {
    classCallCheck(this, StyleInfo);

    /** @type {StyleNode} */
    this.styleRules = ast || null;
    /** @type {Node} */
    this.placeholder = placeholder || null;
    /** @type {!Array<string>} */
    this.ownStylePropertyNames = ownStylePropertyNames || [];
    /** @type {Array<Object>} */
    this.overrideStyleProperties = null;
    /** @type {string} */
    this.elementName = elementName || '';
    /** @type {string} */
    this.cssBuild = cssBuild || '';
    /** @type {string} */
    this.typeExtension = typeExtension || '';
    /** @type {Object<string, string>} */
    this.styleProperties = null;
    /** @type {?string} */
    this.scopeSelector = null;
    /** @type {HTMLStyleElement} */
    this.customStyle = null;
  }

  createClass(StyleInfo, [{
    key: '_getStyleRules',
    value: function _getStyleRules() {
      return this.styleRules;
    }
  }]);
  return StyleInfo;
}();

StyleInfo.prototype['_getStyleRules'] = StyleInfo.prototype._getStyleRules;

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// TODO: dedupe with shady
/**
 * @const {function(string):boolean}
 */
var matchesSelector$1 = function (p) {
  return p.matches || p.matchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || p.webkitMatchesSelector;
}(window.Element.prototype);

var IS_IE = navigator.userAgent.match('Trident');

var XSCOPE_NAME = 'x-scope';

var StyleProperties = function () {
  function StyleProperties() {
    classCallCheck(this, StyleProperties);
  }

  createClass(StyleProperties, [{
    key: 'decorateStyles',

    /**
     * decorates styles with rule info and returns an array of used style property names
     *
     * @param {StyleNode} rules
     * @return {Array<string>}
     */
    value: function decorateStyles(rules) {
      var self = this,
          props = {},
          keyframes = [],
          ruleIndex = 0;
      forEachRule(rules, function (rule) {
        self.decorateRule(rule);
        // mark in-order position of ast rule in styles block, used for cache key
        rule.index = ruleIndex++;
        self.collectPropertiesInCssText(rule.propertyInfo.cssText, props);
      }, function onKeyframesRule(rule) {
        keyframes.push(rule);
      });
      // Cache all found keyframes rules for later reference:
      rules._keyframes = keyframes;
      // return this list of property names *consumes* in these styles.
      var names = [];
      for (var i in props) {
        names.push(i);
      }
      return names;
    }

    // decorate a single rule with property info

  }, {
    key: 'decorateRule',
    value: function decorateRule(rule) {
      if (rule.propertyInfo) {
        return rule.propertyInfo;
      }
      var info = {},
          properties = {};
      var hasProperties = this.collectProperties(rule, properties);
      if (hasProperties) {
        info.properties = properties;
        // TODO(sorvell): workaround parser seeing mixins as additional rules
        rule['rules'] = null;
      }
      info.cssText = this.collectCssText(rule);
      rule.propertyInfo = info;
      return info;
    }

    // collects the custom properties from a rule's cssText

  }, {
    key: 'collectProperties',
    value: function collectProperties(rule, properties) {
      var info = rule.propertyInfo;
      if (info) {
        if (info.properties) {
          Object.assign(properties, info.properties);
          return true;
        }
      } else {
        var m = void 0,
            rx = VAR_ASSIGN;
        var cssText = rule['parsedCssText'];
        var value = void 0;
        var any = void 0;
        while (m = rx.exec(cssText)) {
          // note: group 2 is var, 3 is mixin
          value = (m[2] || m[3]).trim();
          // value of 'inherit' or 'unset' is equivalent to not setting the property here
          if (value !== 'inherit' || value !== 'unset') {
            properties[m[1].trim()] = value;
          }
          any = true;
        }
        return any;
      }
    }

    // returns cssText of properties that consume variables/mixins

  }, {
    key: 'collectCssText',
    value: function collectCssText(rule) {
      return this.collectConsumingCssText(rule['parsedCssText']);
    }

    // NOTE: we support consumption inside mixin assignment
    // but not production, so strip out {...}

  }, {
    key: 'collectConsumingCssText',
    value: function collectConsumingCssText(cssText) {
      return cssText.replace(BRACKETED, '').replace(VAR_ASSIGN, '');
    }
  }, {
    key: 'collectPropertiesInCssText',
    value: function collectPropertiesInCssText(cssText, props) {
      var m = void 0;
      while (m = VAR_CONSUMED.exec(cssText)) {
        var name = m[1];
        // This regex catches all variable names, and following non-whitespace char
        // If next char is not ':', then variable is a consumer
        if (m[2] !== ':') {
          props[name] = true;
        }
      }
    }

    // turns custom properties into realized values.

  }, {
    key: 'reify',
    value: function reify(props) {
      // big perf optimization here: reify only *own* properties
      // since this object has __proto__ of the element's scope properties
      var names = Object.getOwnPropertyNames(props);
      for (var i = 0, n; i < names.length; i++) {
        n = names[i];
        props[n] = this.valueForProperty(props[n], props);
      }
    }

    // given a property value, returns the reified value
    // a property value may be:
    // (1) a literal value like: red or 5px;
    // (2) a variable value like: var(--a), var(--a, red), or var(--a, --b) or
    // var(--a, var(--b));
    // (3) a literal mixin value like { properties }. Each of these properties
    // can have values that are: (a) literal, (b) variables, (c) @apply mixins.

  }, {
    key: 'valueForProperty',
    value: function valueForProperty(property, props) {
      // case (1) default
      // case (3) defines a mixin and we have to reify the internals
      if (property) {
        if (property.indexOf(';') >= 0) {
          property = this.valueForProperties(property, props);
        } else {
          // case (2) variable
          var self = this;
          var fn = function fn(prefix, value, fallback, suffix) {
            if (!value) {
              return prefix + suffix;
            }
            var propertyValue = self.valueForProperty(props[value], props);
            // if value is "initial", then the variable should be treated as unset
            if (!propertyValue || propertyValue === 'initial') {
              // fallback may be --a or var(--a) or literal
              propertyValue = self.valueForProperty(props[fallback] || fallback, props) || fallback;
            } else if (propertyValue === 'apply-shim-inherit') {
              // CSS build will replace `inherit` with `apply-shim-inherit`
              // for use with native css variables.
              // Since we have full control, we can use `inherit` directly.
              propertyValue = 'inherit';
            }
            return prefix + (propertyValue || '') + suffix;
          };
          property = processVariableAndFallback(property, fn);
        }
      }
      return property && property.trim() || '';
    }

    // note: we do not yet support mixin within mixin

  }, {
    key: 'valueForProperties',
    value: function valueForProperties(property, props) {
      var parts = property.split(';');
      for (var i = 0, p, m; i < parts.length; i++) {
        if (p = parts[i]) {
          MIXIN_MATCH.lastIndex = 0;
          m = MIXIN_MATCH.exec(p);
          if (m) {
            p = this.valueForProperty(props[m[1]], props);
          } else {
            var colon = p.indexOf(':');
            if (colon !== -1) {
              var pp = p.substring(colon);
              pp = pp.trim();
              pp = this.valueForProperty(pp, props) || pp;
              p = p.substring(0, colon) + pp;
            }
          }
          parts[i] = p && p.lastIndexOf(';') === p.length - 1 ?
          // strip trailing ;
          p.slice(0, -1) : p || '';
        }
      }
      return parts.join(';');
    }
  }, {
    key: 'applyProperties',
    value: function applyProperties(rule, props) {
      var output = '';
      // dynamically added sheets may not be decorated so ensure they are.
      if (!rule.propertyInfo) {
        this.decorateRule(rule);
      }
      if (rule.propertyInfo.cssText) {
        output = this.valueForProperties(rule.propertyInfo.cssText, props);
      }
      rule['cssText'] = output;
    }

    // Apply keyframe transformations to the cssText of a given rule. The
    // keyframeTransforms object is a map of keyframe names to transformer
    // functions which take in cssText and spit out transformed cssText.

  }, {
    key: 'applyKeyframeTransforms',
    value: function applyKeyframeTransforms(rule, keyframeTransforms) {
      var input = rule['cssText'];
      var output = rule['cssText'];
      if (rule.hasAnimations == null) {
        // Cache whether or not the rule has any animations to begin with:
        rule.hasAnimations = ANIMATION_MATCH.test(input);
      }
      // If there are no animations referenced, we can skip transforms:
      if (rule.hasAnimations) {
        var transform = void 0;
        // If we haven't transformed this rule before, we iterate over all
        // transforms:
        if (rule.keyframeNamesToTransform == null) {
          rule.keyframeNamesToTransform = [];
          for (var keyframe in keyframeTransforms) {
            transform = keyframeTransforms[keyframe];
            output = transform(input);
            // If the transform actually changed the CSS text, we cache the
            // transform name for future use:
            if (input !== output) {
              input = output;
              rule.keyframeNamesToTransform.push(keyframe);
            }
          }
        } else {
          // If we already have a list of keyframe names that apply to this
          // rule, we apply only those keyframe name transforms:
          for (var i = 0; i < rule.keyframeNamesToTransform.length; ++i) {
            transform = keyframeTransforms[rule.keyframeNamesToTransform[i]];
            input = transform(input);
          }
          output = input;
        }
      }
      rule['cssText'] = output;
    }

    // Test if the rules in these styles matches the given `element` and if so,
    // collect any custom properties into `props`.
    /**
     * @param {StyleNode} rules
     * @param {Element} element
     */

  }, {
    key: 'propertyDataFromStyles',
    value: function propertyDataFromStyles(rules, element) {
      var props = {},
          self = this;
      // generates a unique key for these matches
      var o = [];
      // note: active rules excludes non-matching @media rules
      forEachRule(rules, function (rule) {
        // TODO(sorvell): we could trim the set of rules at declaration
        // time to only include ones that have properties
        if (!rule.propertyInfo) {
          self.decorateRule(rule);
        }
        // match element against transformedSelector: selector may contain
        // unwanted uniquification and parsedSelector does not directly match
        // for :host selectors.
        var selectorToMatch = rule.transformedSelector || rule['parsedSelector'];
        if (element && rule.propertyInfo.properties && selectorToMatch) {
          if (matchesSelector$1.call(element, selectorToMatch)) {
            self.collectProperties(rule, props);
            // produce numeric key for these matches for lookup
            addToBitMask(rule.index, o);
          }
        }
      }, null, true);
      return { properties: props, key: o };
    }

    /**
     * @param {Element} scope
     * @param {StyleNode} rule
     * @param {string|undefined} cssBuild
     * @param {function(Object)} callback
     */

  }, {
    key: 'whenHostOrRootRule',
    value: function whenHostOrRootRule(scope, rule, cssBuild, callback) {
      if (!rule.propertyInfo) {
        this.decorateRule(rule);
      }
      if (!rule.propertyInfo.properties) {
        return;
      }

      var _StyleUtil$getIsExten = getIsExtends(scope),
          is = _StyleUtil$getIsExten.is,
          typeExtension = _StyleUtil$getIsExten.typeExtension;

      var hostScope = is ? StyleTransformer$1._calcHostScope(is, typeExtension) : 'html';
      var parsedSelector = rule['parsedSelector'];
      var isRoot = parsedSelector === ':host > *' || parsedSelector === 'html';
      var isHost = parsedSelector.indexOf(':host') === 0 && !isRoot;
      // build info is either in scope (when scope is an element) or in the style
      // when scope is the default scope; note: this allows default scope to have
      // mixed mode built and unbuilt styles.
      if (cssBuild === 'shady') {
        // :root -> x-foo > *.x-foo for elements and html for custom-style
        isRoot = parsedSelector === hostScope + ' > *.' + hostScope || parsedSelector.indexOf('html') !== -1;
        // :host -> x-foo for elements, but sub-rules have .x-foo in them
        isHost = !isRoot && parsedSelector.indexOf(hostScope) === 0;
      }
      if (cssBuild === 'shadow') {
        isRoot = parsedSelector === ':host > *' || parsedSelector === 'html';
        isHost = isHost && !isRoot;
      }
      if (!isRoot && !isHost) {
        return;
      }
      var selectorToMatch = hostScope;
      if (isHost) {
        // need to transform :host under ShadowDOM because `:host` does not work with `matches`
        if (nativeShadow && !rule.transformedSelector) {
          // transform :host into a matchable selector
          rule.transformedSelector = StyleTransformer$1._transformRuleCss(rule, StyleTransformer$1._transformComplexSelector, StyleTransformer$1._calcElementScope(is), hostScope);
        }
        selectorToMatch = rule.transformedSelector || hostScope;
      }
      callback({
        selector: selectorToMatch,
        isHost: isHost,
        isRoot: isRoot
      });
    }
    /**
     * @param {Element} scope
     * @param {StyleNode} rules
     * @return {Object}
     */

  }, {
    key: 'hostAndRootPropertiesForScope',
    value: function hostAndRootPropertiesForScope(scope, rules) {
      var hostProps = {},
          rootProps = {},
          self = this;
      // note: active rules excludes non-matching @media rules
      var cssBuild = rules && rules['__cssBuild'];
      forEachRule(rules, function (rule) {
        // if scope is StyleDefaults, use _element for matchesSelector
        self.whenHostOrRootRule(scope, rule, cssBuild, function (info) {
          var element = scope._element || scope;
          if (matchesSelector$1.call(element, info.selector)) {
            if (info.isHost) {
              self.collectProperties(rule, hostProps);
            } else {
              self.collectProperties(rule, rootProps);
            }
          }
        });
      }, null, true);
      return { rootProps: rootProps, hostProps: hostProps };
    }

    /**
     * @param {Element} element
     * @param {Object} properties
     * @param {string} scopeSelector
     */

  }, {
    key: 'transformStyles',
    value: function transformStyles(element, properties, scopeSelector) {
      var self = this;

      var _StyleUtil$getIsExten2 = getIsExtends(element),
          is = _StyleUtil$getIsExten2.is,
          typeExtension = _StyleUtil$getIsExten2.typeExtension;

      var hostSelector = StyleTransformer$1._calcHostScope(is, typeExtension);
      var rxHostSelector = element.extends ? '\\' + hostSelector.slice(0, -1) + '\\]' : hostSelector;
      var hostRx = new RegExp(HOST_PREFIX + rxHostSelector + HOST_SUFFIX);
      var rules = StyleInfo.get(element).styleRules;
      var keyframeTransforms = this._elementKeyframeTransforms(element, rules, scopeSelector);
      return StyleTransformer$1.elementStyles(element, rules, function (rule) {
        self.applyProperties(rule, properties);
        if (!nativeShadow && !isKeyframesSelector(rule) && rule['cssText']) {
          // NOTE: keyframe transforms only scope munge animation names, so it
          // is not necessary to apply them in ShadowDOM.
          self.applyKeyframeTransforms(rule, keyframeTransforms);
          self._scopeSelector(rule, hostRx, hostSelector, scopeSelector);
        }
      });
    }

    /**
     * @param {Element} element
     * @param {StyleNode} rules
     * @param {string} scopeSelector
     * @return {Object}
     */

  }, {
    key: '_elementKeyframeTransforms',
    value: function _elementKeyframeTransforms(element, rules, scopeSelector) {
      var keyframesRules = rules._keyframes;
      var keyframeTransforms = {};
      if (!nativeShadow && keyframesRules) {
        // For non-ShadowDOM, we transform all known keyframes rules in
        // advance for the current scope. This allows us to catch keyframes
        // rules that appear anywhere in the stylesheet:
        for (var i = 0, keyframesRule = keyframesRules[i]; i < keyframesRules.length; keyframesRule = keyframesRules[++i]) {
          this._scopeKeyframes(keyframesRule, scopeSelector);
          keyframeTransforms[keyframesRule['keyframesName']] = this._keyframesRuleTransformer(keyframesRule);
        }
      }
      return keyframeTransforms;
    }

    // Generate a factory for transforming a chunk of CSS text to handle a
    // particular scoped keyframes rule.
    /**
     * @param {StyleNode} keyframesRule
     * @return {function(string):string}
     */

  }, {
    key: '_keyframesRuleTransformer',
    value: function _keyframesRuleTransformer(keyframesRule) {
      return function (cssText) {
        return cssText.replace(keyframesRule.keyframesNameRx, keyframesRule.transformedKeyframesName);
      };
    }

    /**
     * Transforms `@keyframes` names to be unique for the current host.
     * Example: @keyframes foo-anim -> @keyframes foo-anim-x-foo-0
     *
     * @param {StyleNode} rule
     * @param {string} scopeId
     */

  }, {
    key: '_scopeKeyframes',
    value: function _scopeKeyframes(rule, scopeId) {
      // Animation names are of the form [\w-], so ensure that the name regex does not partially apply
      // to similarly named keyframe names by checking for a word boundary at the beginning and
      // a non-word boundary or `-` at the end.
      rule.keyframesNameRx = new RegExp('\\b' + rule['keyframesName'] + '(?!\\B|-)', 'g');
      rule.transformedKeyframesName = rule['keyframesName'] + '-' + scopeId;
      rule.transformedSelector = rule.transformedSelector || rule['selector'];
      rule['selector'] = rule.transformedSelector.replace(rule['keyframesName'], rule.transformedKeyframesName);
    }

    // Strategy: x scope shim a selector e.g. to scope `.x-foo-42` (via classes):
    // non-host selector: .a.x-foo -> .x-foo-42 .a.x-foo
    // host selector: x-foo.wide -> .x-foo-42.wide
    // note: we use only the scope class (.x-foo-42) and not the hostSelector
    // (x-foo) to scope :host rules; this helps make property host rules
    // have low specificity. They are overrideable by class selectors but,
    // unfortunately, not by type selectors (e.g. overriding via
    // `.special` is ok, but not by `x-foo`).
    /**
     * @param {StyleNode} rule
     * @param {RegExp} hostRx
     * @param {string} hostSelector
     * @param {string} scopeId
     */

  }, {
    key: '_scopeSelector',
    value: function _scopeSelector(rule, hostRx, hostSelector, scopeId) {
      rule.transformedSelector = rule.transformedSelector || rule['selector'];
      var selector = rule.transformedSelector;
      var scope = '.' + scopeId;
      var parts = selector.split(',');
      for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
        parts[i] = p.match(hostRx) ? p.replace(hostSelector, scope) : scope + ' ' + p;
      }
      rule['selector'] = parts.join(',');
    }

    /**
     * @param {Element} element
     * @param {string} selector
     * @param {string} old
     */

  }, {
    key: 'applyElementScopeSelector',
    value: function applyElementScopeSelector(element, selector, old) {
      var c = element.getAttribute('class') || '';
      var v = c;
      if (old) {
        v = c.replace(new RegExp('\\s*' + XSCOPE_NAME + '\\s*' + old + '\\s*', 'g'), ' ');
      }
      v += (v ? ' ' : '') + XSCOPE_NAME + ' ' + selector;
      if (c !== v) {
        setElementClassRaw(element, v);
      }
    }

    /**
     * @param {HTMLElement} element
     * @param {Object} properties
     * @param {string} selector
     * @param {HTMLStyleElement} style
     * @return {HTMLStyleElement}
     */

  }, {
    key: 'applyElementStyle',
    value: function applyElementStyle(element, properties, selector, style) {
      // calculate cssText to apply
      var cssText = style ? style.textContent || '' : this.transformStyles(element, properties, selector);
      // if shady and we have a cached style that is not style, decrement
      var styleInfo = StyleInfo.get(element);
      var s = styleInfo.customStyle;
      if (s && !nativeShadow && s !== style) {
        s['_useCount']--;
        if (s['_useCount'] <= 0 && s.parentNode) {
          s.parentNode.removeChild(s);
        }
      }
      // apply styling always under native or if we generated style
      // or the cached style is not in document(!)
      if (nativeShadow) {
        // update existing style only under native
        if (styleInfo.customStyle) {
          styleInfo.customStyle.textContent = cssText;
          style = styleInfo.customStyle;
          // otherwise, if we have css to apply, do so
        } else if (cssText) {
          // apply css after the scope style of the element to help with
          // style precedence rules.
          style = applyCss(cssText, selector, element.shadowRoot, styleInfo.placeholder);
        }
      } else {
        // shady and no cache hit
        if (!style) {
          // apply css after the scope style of the element to help with
          // style precedence rules.
          if (cssText) {
            style = applyCss(cssText, selector, null, styleInfo.placeholder);
          }
          // shady and cache hit but not in document
        } else if (!style.parentNode) {
          if (IS_IE && cssText.indexOf('@media') > -1) {
            // @media rules may be stale in IE 10 and 11
            // refresh the text content of the style to revalidate them.
            style.textContent = cssText;
          }
          applyStyle(style, null, styleInfo.placeholder);
        }
      }
      // ensure this style is our custom style and increment its use count.
      if (style) {
        style['_useCount'] = style['_useCount'] || 0;
        // increment use count if we changed styles
        if (styleInfo.customStyle != style) {
          style['_useCount']++;
        }
        styleInfo.customStyle = style;
      }
      return style;
    }

    /**
     * @param {Element} style
     * @param {Object} properties
     */

  }, {
    key: 'applyCustomStyle',
    value: function applyCustomStyle(style, properties) {
      var rules = rulesForStyle( /** @type {HTMLStyleElement} */style);
      var self = this;
      style.textContent = toCssText(rules, function ( /** StyleNode */rule) {
        var css = rule['cssText'] = rule['parsedCssText'];
        if (rule.propertyInfo && rule.propertyInfo.cssText) {
          // remove property assignments
          // so next function isn't confused
          // NOTE: we have 3 categories of css:
          // (1) normal properties,
          // (2) custom property assignments (--foo: red;),
          // (3) custom property usage: border: var(--foo); @apply(--foo);
          // In elements, 1 and 3 are separated for efficiency; here they
          // are not and this makes this case unique.
          css = removeCustomPropAssignment( /** @type {string} */css);
          // replace with reified properties, scenario is same as mixin
          rule['cssText'] = self.valueForProperties(css, properties);
        }
      });
    }
  }, {
    key: 'XSCOPE_NAME',
    get: function get$$1() {
      return XSCOPE_NAME;
    }
  }]);
  return StyleProperties;
}();

/**
 * @param {number} n
 * @param {Array<number>} bits
 */


function addToBitMask(n, bits) {
  var o = parseInt(n / 32, 10);
  var v = 1 << n % 32;
  bits[o] = (bits[o] || 0) | v;
}

var StyleProperties$1 = new StyleProperties();

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/** @type {Object<string, !Node>} */
var placeholderMap = {};

/**
 * @const {CustomElementRegistry}
 */
var ce = window['customElements'];
if (ce && !nativeShadow) {
  /**
   * @const {function(this:CustomElementRegistry, string,function(new:HTMLElement),{extends: string}=)}
   */
  var origDefine = ce['define'];
  /**
   * @param {string} name
   * @param {function(new:HTMLElement)} clazz
   * @param {{extends: string}=} options
   * @return {function(new:HTMLElement)}
   */
  var wrappedDefine = function wrappedDefine(name, clazz, options) {
    placeholderMap[name] = applyStylePlaceHolder(name);
    return origDefine.call( /** @type {!CustomElementRegistry} */ce, name, clazz, options);
  };
  ce['define'] = wrappedDefine;
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
var StyleCache = function () {
  function StyleCache() {
    var typeMax = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
    classCallCheck(this, StyleCache);

    // map element name -> [{properties, styleElement, scopeSelector}]
    this.cache = {};
    this.typeMax = typeMax;
  }

  createClass(StyleCache, [{
    key: '_validate',
    value: function _validate(cacheEntry, properties, ownPropertyNames) {
      for (var idx = 0; idx < ownPropertyNames.length; idx++) {
        var pn = ownPropertyNames[idx];
        if (cacheEntry.properties[pn] !== properties[pn]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: 'store',
    value: function store(tagname, properties, styleElement, scopeSelector) {
      var list = this.cache[tagname] || [];
      list.push({ properties: properties, styleElement: styleElement, scopeSelector: scopeSelector });
      if (list.length > this.typeMax) {
        list.shift();
      }
      this.cache[tagname] = list;
    }
  }, {
    key: 'fetch',
    value: function fetch(tagname, properties, ownPropertyNames) {
      var list = this.cache[tagname];
      if (!list) {
        return;
      }
      // reverse list for most-recent lookups
      for (var idx = list.length - 1; idx >= 0; idx--) {
        var entry = list[idx];
        if (this._validate(entry, properties, ownPropertyNames)) {
          return entry;
        }
      }
    }
  }]);
  return StyleCache;
}();

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var flush$2 = function flush() {};

/**
 * @param {HTMLElement} element
 * @return {!Array<string>}
 */
function getClasses(element) {
  var classes = [];
  if (element.classList) {
    classes = Array.from(element.classList);
  } else if (element instanceof window['SVGElement'] && element.hasAttribute('class')) {
    classes = element.getAttribute('class').split(/\s+/);
  }
  return classes;
}

/**
 * @param {HTMLElement} element
 * @return {string}
 */
function getCurrentScope(element) {
  var classes = getClasses(element);
  var idx = classes.indexOf(StyleTransformer$1.SCOPE_NAME);
  if (idx > -1) {
    return classes[idx + 1];
  }
  return '';
}

/**
 * @param {Array<MutationRecord|null>|null} mxns
 */
function handler(mxns) {
  for (var x = 0; x < mxns.length; x++) {
    var mxn = mxns[x];
    if (mxn.target === document.documentElement || mxn.target === document.head) {
      continue;
    }
    for (var i = 0; i < mxn.addedNodes.length; i++) {
      var n = mxn.addedNodes[i];
      if (n.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      n = /** @type {HTMLElement} */n; // eslint-disable-line no-self-assign
      var root = n.getRootNode();
      var currentScope = getCurrentScope(n);
      // node was scoped, but now is in document
      if (currentScope && root === n.ownerDocument) {
        StyleTransformer$1.dom(n, currentScope, true);
      } else if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var newScope = void 0;
        var host = /** @type {ShadowRoot} */root.host;
        // element may no longer be in a shadowroot
        if (!host) {
          continue;
        }
        newScope = getIsExtends(host).is;
        if (currentScope === newScope) {
          // make sure all the subtree elements are scoped correctly
          var unscoped = window['ShadyDOM']['nativeMethods']['querySelectorAll'].call(n, ':not(.' + StyleTransformer$1.SCOPE_NAME + ')');
          for (var j = 0; j < unscoped.length; j++) {
            StyleTransformer$1.element(unscoped[j], currentScope);
          }
          continue;
        }
        if (currentScope) {
          StyleTransformer$1.dom(n, currentScope, true);
        }
        StyleTransformer$1.dom(n, newScope);
      }
    }
  }
}

if (!nativeShadow) {
  var observer = new MutationObserver(handler);
  var start = function start(node) {
    observer.observe(node, { childList: true, subtree: true });
  };
  var nativeCustomElements = window['customElements'] && !window['customElements']['polyfillWrapFlushCallback'];
  // need to start immediately with native custom elements
  // TODO(dfreedm): with polyfilled HTMLImports and native custom elements
  // excessive mutations may be observed; this can be optimized via cooperation
  // with the HTMLImports polyfill.
  if (nativeCustomElements) {
    start(document);
  } else {
    var delayedStart = function delayedStart() {
      start(document.body);
    };
    // use polyfill timing if it's available
    if (window['HTMLImports']) {
      window['HTMLImports']['whenReady'](delayedStart);
      // otherwise push beyond native imports being ready
      // which requires RAF + readystate interactive.
    } else {
      requestAnimationFrame(function () {
        if (document.readyState === 'loading') {
          var listener = function listener() {
            delayedStart();
            document.removeEventListener('readystatechange', listener);
          };
          document.addEventListener('readystatechange', listener);
        } else {
          delayedStart();
        }
      });
    }
  }

  flush$2 = function flush() {
    handler(observer.takeRecords());
  };
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @const {!Object<string, !HTMLTemplateElement>}
 */

var templateMap = {};

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
 * Utilities for handling invalidating apply-shim mixins for a given template.
 *
 * The invalidation strategy involves keeping track of the "current" version of a template's mixins, and updating that count when a mixin is invalidated.
 * The template
 */

/** @const {string} */
var CURRENT_VERSION = '_applyShimCurrentVersion';

/** @const {string} */
var NEXT_VERSION = '_applyShimNextVersion';

/** @const {string} */
var VALIDATING_VERSION = '_applyShimValidatingVersion';

/**
 * @const {Promise<void>}
 */
var promise = Promise.resolve();

/**
 * @param {string} elementName
 */
function invalidate(elementName) {
  var template = templateMap[elementName];
  if (template) {
    invalidateTemplate(template);
  }
}

/**
 * This function can be called multiple times to mark a template invalid
 * and signal that the style inside must be regenerated.
 *
 * Use `startValidatingTemplate` to begin an asynchronous validation cycle.
 * During that cycle, call `templateIsValidating` to see if the template must
 * be revalidated
 * @param {HTMLTemplateElement} template
 */
function invalidateTemplate(template) {
  // default the current version to 0
  template[CURRENT_VERSION] = template[CURRENT_VERSION] || 0;
  // ensure the "validating for" flag exists
  template[VALIDATING_VERSION] = template[VALIDATING_VERSION] || 0;
  // increment the next version
  template[NEXT_VERSION] = (template[NEXT_VERSION] || 0) + 1;
}

/**
 * @param {string} elementName
 * @return {boolean}
 */


/**
 * @param {HTMLTemplateElement} template
 * @return {boolean}
 */
function templateIsValid(template) {
  return template[CURRENT_VERSION] === template[NEXT_VERSION];
}

/**
 * @param {string} elementName
 * @return {boolean}
 */


/**
 * Returns true if the template is currently invalid and `startValidating` has been called since the last invalidation.
 * If false, the template must be validated.
 * @param {HTMLTemplateElement} template
 * @return {boolean}
 */
function templateIsValidating(template) {
  return !templateIsValid(template) && template[VALIDATING_VERSION] === template[NEXT_VERSION];
}

/**
 * the template is marked as `validating` for one microtask so that all instances
 * found in the tree crawl of `applyStyle` will update themselves,
 * but the template will only be updated once.
 * @param {string} elementName
*/


/**
 * Begin an asynchronous invalidation cycle.
 * This should be called after every validation of a template
 *
 * After one microtask, the template will be marked as valid until the next call to `invalidateTemplate`
 * @param {HTMLTemplateElement} template
 */
function startValidatingTemplate(template) {
  // remember that the current "next version" is the reason for this validation cycle
  template[VALIDATING_VERSION] = template[NEXT_VERSION];
  // however, there only needs to be one async task to clear the counters
  if (!template._validating) {
    template._validating = true;
    promise.then(function () {
      // sync the current version to let future invalidations cause a refresh cycle
      template[CURRENT_VERSION] = template[NEXT_VERSION];
      template._validating = false;
    });
  }
}

/**
 * @return {boolean}
 */

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/** @type {Promise<void>} */

var readyPromise = null;

/** @type {?function(?function())} */
var whenReady = window['HTMLImports'] && window['HTMLImports']['whenReady'] || null;

/** @type {function()} */
var resolveFn = void 0;

/**
 * @param {?function()} callback
 */
function documentWait(callback) {
  requestAnimationFrame(function () {
    if (whenReady) {
      whenReady(callback);
    } else {
      if (!readyPromise) {
        readyPromise = new Promise(function (resolve) {
          resolveFn = resolve;
        });
        if (document.readyState === 'complete') {
          resolveFn();
        } else {
          document.addEventListener('readystatechange', function () {
            if (document.readyState === 'complete') {
              resolveFn();
            }
          });
        }
      }
      readyPromise.then(function () {
        callback && callback();
      });
    }
  });
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @param {Element} element
 * @param {Object=} properties
 */
function updateNativeProperties(element, properties) {
  // remove previous properties
  for (var p in properties) {
    // NOTE: for bc with shim, don't apply null values.
    if (p === null) {
      element.style.removeProperty(p);
    } else {
      element.style.setProperty(p, properties[p]);
    }
  }
}

/**
 * @param {Element} element
 * @param {string} property
 * @return {string}
 */


/**
 * return true if `cssText` contains a mixin definition or consumption
 * @param {string} cssText
 * @return {boolean}
 */
function detectMixin(cssText) {
  var has = MIXIN_MATCH.test(cssText) || VAR_ASSIGN.test(cssText);
  // reset state of the regexes
  MIXIN_MATCH.lastIndex = 0;
  VAR_ASSIGN.lastIndex = 0;
  return has;
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @typedef {HTMLStyleElement | {getStyle: function():HTMLStyleElement}}
 */


var SEEN_MARKER = '__seenByShadyCSS';
var CACHED_STYLE = '__shadyCSSCachedStyle';

/** @type {?function(!HTMLStyleElement)} */
var transformFn = null;

/** @type {?function()} */
var validateFn = null;

/**
This interface is provided to add document-level <style> elements to ShadyCSS for processing.
These styles must be processed by ShadyCSS to simulate ShadowRoot upper-bound encapsulation from outside styles
In addition, these styles may also need to be processed for @apply rules and CSS Custom Properties

To add document-level styles to ShadyCSS, one can call `ShadyCSS.addDocumentStyle(styleElement)` or `ShadyCSS.addDocumentStyle({getStyle: () => styleElement})`

In addition, if the process used to discover document-level styles can be synchronously flushed, one should set `ShadyCSS.documentStyleFlush`.
This function will be called when calculating styles.

An example usage of the document-level styling api can be found in `examples/document-style-lib.js`

@unrestricted
*/

var CustomStyleInterface$1 = function () {
  function CustomStyleInterface() {
    classCallCheck(this, CustomStyleInterface);

    /** @type {!Array<!CustomStyleProvider>} */
    this['customStyles'] = [];
    this['enqueued'] = false;
  }
  /**
   * Queue a validation for new custom styles to batch style recalculations
   */


  createClass(CustomStyleInterface, [{
    key: 'enqueueDocumentValidation',
    value: function enqueueDocumentValidation() {
      if (this['enqueued'] || !validateFn) {
        return;
      }
      this['enqueued'] = true;
      documentWait(validateFn);
    }
    /**
     * @param {!HTMLStyleElement} style
     */

  }, {
    key: 'addCustomStyle',
    value: function addCustomStyle(style) {
      if (!style[SEEN_MARKER]) {
        style[SEEN_MARKER] = true;
        this['customStyles'].push(style);
        this.enqueueDocumentValidation();
      }
    }
    /**
     * @param {!CustomStyleProvider} customStyle
     * @return {HTMLStyleElement}
     */

  }, {
    key: 'getStyleForCustomStyle',
    value: function getStyleForCustomStyle(customStyle) {
      if (customStyle[CACHED_STYLE]) {
        return customStyle[CACHED_STYLE];
      }
      var style = void 0;
      if (customStyle['getStyle']) {
        style = customStyle['getStyle']();
      } else {
        style = customStyle;
      }
      return style;
    }
    /**
     * @return {!Array<!CustomStyleProvider>}
     */

  }, {
    key: 'processStyles',
    value: function processStyles() {
      var cs = this['customStyles'];
      for (var i = 0; i < cs.length; i++) {
        var customStyle = cs[i];
        if (customStyle[CACHED_STYLE]) {
          continue;
        }
        var style = this.getStyleForCustomStyle(customStyle);
        if (style) {
          // HTMLImports polyfill may have cloned the style into the main document,
          // which is referenced with __appliedElement.
          var styleToTransform = /** @type {!HTMLStyleElement} */style['__appliedElement'] || style;
          if (transformFn) {
            transformFn(styleToTransform);
          }
          customStyle[CACHED_STYLE] = styleToTransform;
        }
      }
      return cs;
    }
  }]);
  return CustomStyleInterface;
}();

CustomStyleInterface$1.prototype['addCustomStyle'] = CustomStyleInterface$1.prototype.addCustomStyle;
CustomStyleInterface$1.prototype['getStyleForCustomStyle'] = CustomStyleInterface$1.prototype.getStyleForCustomStyle;
CustomStyleInterface$1.prototype['processStyles'] = CustomStyleInterface$1.prototype.processStyles;

Object.defineProperties(CustomStyleInterface$1.prototype, {
  'transformCallback': {
    /** @return {?function(!HTMLStyleElement)} */
    get: function get$$1() {
      return transformFn;
    },

    /** @param {?function(!HTMLStyleElement)} fn */
    set: function set$$1(fn) {
      transformFn = fn;
    }
  },
  'validateCallback': {
    /** @return {?function()} */
    get: function get$$1() {
      return validateFn;
    },

    /**
     * @param {?function()} fn
     * @this {CustomStyleInterface}
     */
    set: function set$$1(fn) {
      var needsEnqueue = false;
      if (!validateFn) {
        needsEnqueue = true;
      }
      validateFn = fn;
      if (needsEnqueue) {
        this.enqueueDocumentValidation();
      }
    }
  }
});

/** @typedef {{
 * customStyles: !Array<!CustomStyleProvider>,
 * addCustomStyle: function(!CustomStyleProvider),
 * getStyleForCustomStyle: function(!CustomStyleProvider): HTMLStyleElement,
 * findStyles: function(),
 * transformCallback: ?function(!HTMLStyleElement),
 * validateCallback: ?function()
 * }}
 */

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @const {StyleCache}
 */
var styleCache = new StyleCache();

var ScopingShim = function () {
  function ScopingShim() {
    var _this = this;

    classCallCheck(this, ScopingShim);

    this._scopeCounter = {};
    this._documentOwner = document.documentElement;
    var ast = new StyleNode();
    ast['rules'] = [];
    this._documentOwnerStyleInfo = StyleInfo.set(this._documentOwner, new StyleInfo(ast));
    this._elementsHaveApplied = false;
    this._applyShim = null;
    /** @type {?CustomStyleInterfaceInterface} */
    this._customStyleInterface = null;
    documentWait(function () {
      _this._ensure();
    });
  }

  createClass(ScopingShim, [{
    key: 'flush',
    value: function flush$$1() {
      flush$2();
    }
  }, {
    key: '_generateScopeSelector',
    value: function _generateScopeSelector(name) {
      var id = this._scopeCounter[name] = (this._scopeCounter[name] || 0) + 1;
      return name + '-' + id;
    }
  }, {
    key: 'getStyleAst',
    value: function getStyleAst(style) {
      return rulesForStyle(style);
    }
  }, {
    key: 'styleAstToString',
    value: function styleAstToString(ast) {
      return toCssText(ast);
    }
  }, {
    key: '_gatherStyles',
    value: function _gatherStyles(template) {
      return gatherStyleText(template.content);
    }
  }, {
    key: '_getCssBuild',
    value: function _getCssBuild(template) {
      var style = template.content.querySelector('style');
      if (!style) {
        return '';
      }
      return style.getAttribute('css-build') || '';
    }
    /**
     * Prepare the styling and template for the given element type
     *
     * @param {HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} typeExtension
     */

  }, {
    key: 'prepareTemplate',
    value: function prepareTemplate(template, elementName, typeExtension) {
      if (template._prepared) {
        return;
      }
      template._prepared = true;
      template.name = elementName;
      template.extends = typeExtension;
      templateMap[elementName] = template;
      var cssBuild = this._getCssBuild(template);
      var cssText = this._gatherStyles(template);
      var info = {
        is: elementName,
        extends: typeExtension,
        __cssBuild: cssBuild
      };
      if (!nativeShadow) {
        StyleTransformer$1.dom(template.content, elementName);
      }
      // check if the styling has mixin definitions or uses
      this._ensure();
      var hasMixins = detectMixin(cssText);
      var ast = parse(cssText);
      // only run the applyshim transforms if there is a mixin involved
      if (hasMixins && nativeCssVariables && this._applyShim) {
        this._applyShim['transformRules'](ast, elementName);
      }
      template['_styleAst'] = ast;
      template._cssBuild = cssBuild;

      var ownPropertyNames = [];
      if (!nativeCssVariables) {
        ownPropertyNames = StyleProperties$1.decorateStyles(template['_styleAst'], info);
      }
      if (!ownPropertyNames.length || nativeCssVariables) {
        var root = nativeShadow ? template.content : null;
        var placeholder = placeholderMap[elementName];
        var style = this._generateStaticStyle(info, template['_styleAst'], root, placeholder);
        template._style = style;
      }
      template._ownPropertyNames = ownPropertyNames;
    }
  }, {
    key: '_generateStaticStyle',
    value: function _generateStaticStyle(info, rules, shadowroot, placeholder) {
      var cssText = StyleTransformer$1.elementStyles(info, rules);
      if (cssText.length) {
        return applyCss(cssText, info.is, shadowroot, placeholder);
      }
    }
  }, {
    key: '_prepareHost',
    value: function _prepareHost(host) {
      var _StyleUtil$getIsExten = getIsExtends(host),
          is = _StyleUtil$getIsExten.is,
          typeExtension = _StyleUtil$getIsExten.typeExtension;

      var placeholder = placeholderMap[is];
      var template = templateMap[is];
      var ast = void 0;
      var ownStylePropertyNames = void 0;
      var cssBuild = void 0;
      if (template) {
        ast = template['_styleAst'];
        ownStylePropertyNames = template._ownPropertyNames;
        cssBuild = template._cssBuild;
      }
      return StyleInfo.set(host, new StyleInfo(ast, placeholder, ownStylePropertyNames, is, typeExtension, cssBuild));
    }
  }, {
    key: '_ensureApplyShim',
    value: function _ensureApplyShim() {
      if (this._applyShim) {
        return;
      } else if (window.ShadyCSS && window.ShadyCSS.ApplyShim) {
        this._applyShim = window.ShadyCSS.ApplyShim;
        this._applyShim['invalidCallback'] = invalidate;
      }
    }
  }, {
    key: '_ensureCustomStyleInterface',
    value: function _ensureCustomStyleInterface() {
      var _this2 = this;

      if (this._customStyleInterface) {
        return;
      } else if (window.ShadyCSS && window.ShadyCSS.CustomStyleInterface) {
        this._customStyleInterface = /** @type {!CustomStyleInterfaceInterface} */window.ShadyCSS.CustomStyleInterface;
        /** @type {function(!HTMLStyleElement)} */
        this._customStyleInterface['transformCallback'] = function (style) {
          _this2.transformCustomStyleForDocument(style);
        };
        this._customStyleInterface['validateCallback'] = function () {
          requestAnimationFrame(function () {
            if (_this2._customStyleInterface['enqueued'] || _this2._elementsHaveApplied) {
              _this2.flushCustomStyles();
            }
          });
        };
      }
    }
  }, {
    key: '_ensure',
    value: function _ensure() {
      this._ensureApplyShim();
      this._ensureCustomStyleInterface();
    }
    /**
     * Flush and apply custom styles to document
     */

  }, {
    key: 'flushCustomStyles',
    value: function flushCustomStyles() {
      this._ensure();
      if (!this._customStyleInterface) {
        return;
      }
      var customStyles = this._customStyleInterface['processStyles']();
      // early return if custom-styles don't need validation
      if (!this._customStyleInterface['enqueued']) {
        return;
      }
      if (!nativeCssVariables) {
        this._updateProperties(this._documentOwner, this._documentOwnerStyleInfo);
        this._applyCustomStyles(customStyles);
      } else {
        this._revalidateCustomStyleApplyShim(customStyles);
      }
      this._customStyleInterface['enqueued'] = false;
      // if custom elements have upgraded and there are no native css variables, we must recalculate the whole tree
      if (this._elementsHaveApplied && !nativeCssVariables) {
        this.styleDocument();
      }
    }
    /**
     * Apply styles for the given element
     *
     * @param {!HTMLElement} host
     * @param {Object=} overrideProps
     */

  }, {
    key: 'styleElement',
    value: function styleElement(host, overrideProps) {
      var _StyleUtil$getIsExten2 = getIsExtends(host),
          is = _StyleUtil$getIsExten2.is;

      var styleInfo = StyleInfo.get(host);
      if (!styleInfo) {
        styleInfo = this._prepareHost(host);
      }
      // Only trip the `elementsHaveApplied` flag if a node other that the root document has `applyStyle` called
      if (!this._isRootOwner(host)) {
        this._elementsHaveApplied = true;
      }
      if (overrideProps) {
        styleInfo.overrideStyleProperties = styleInfo.overrideStyleProperties || {};
        Object.assign(styleInfo.overrideStyleProperties, overrideProps);
      }
      if (!nativeCssVariables) {
        this._updateProperties(host, styleInfo);
        if (styleInfo.ownStylePropertyNames && styleInfo.ownStylePropertyNames.length) {
          this._applyStyleProperties(host, styleInfo);
        }
      } else {
        if (styleInfo.overrideStyleProperties) {
          updateNativeProperties(host, styleInfo.overrideStyleProperties);
        }
        var template = templateMap[is];
        // bail early if there is no shadowroot for this element
        if (!template && !this._isRootOwner(host)) {
          return;
        }
        if (template && template._style && !templateIsValid(template)) {
          // update template
          if (!templateIsValidating(template)) {
            this._ensure();
            this._applyShim && this._applyShim['transformRules'](template['_styleAst'], is);
            template._style.textContent = StyleTransformer$1.elementStyles(host, styleInfo.styleRules);
            startValidatingTemplate(template);
          }
          // update instance if native shadowdom
          if (nativeShadow) {
            var root = host.shadowRoot;
            if (root) {
              var style = root.querySelector('style');
              style.textContent = StyleTransformer$1.elementStyles(host, styleInfo.styleRules);
            }
          }
          styleInfo.styleRules = template['_styleAst'];
        }
      }
    }
  }, {
    key: '_styleOwnerForNode',
    value: function _styleOwnerForNode(node) {
      var root = node.getRootNode();
      var host = root.host;
      if (host) {
        if (StyleInfo.get(host)) {
          return host;
        } else {
          return this._styleOwnerForNode(host);
        }
      }
      return this._documentOwner;
    }
  }, {
    key: '_isRootOwner',
    value: function _isRootOwner(node) {
      return node === this._documentOwner;
    }
  }, {
    key: '_applyStyleProperties',
    value: function _applyStyleProperties(host, styleInfo) {
      var is = getIsExtends(host).is;
      var cacheEntry = styleCache.fetch(is, styleInfo.styleProperties, styleInfo.ownStylePropertyNames);
      var cachedScopeSelector = cacheEntry && cacheEntry.scopeSelector;
      var cachedStyle = cacheEntry ? cacheEntry.styleElement : null;
      var oldScopeSelector = styleInfo.scopeSelector;
      // only generate new scope if cached style is not found
      styleInfo.scopeSelector = cachedScopeSelector || this._generateScopeSelector(is);
      var style = StyleProperties$1.applyElementStyle(host, styleInfo.styleProperties, styleInfo.scopeSelector, cachedStyle);
      if (!nativeShadow) {
        StyleProperties$1.applyElementScopeSelector(host, styleInfo.scopeSelector, oldScopeSelector);
      }
      if (!cacheEntry) {
        styleCache.store(is, styleInfo.styleProperties, style, styleInfo.scopeSelector);
      }
      return style;
    }
  }, {
    key: '_updateProperties',
    value: function _updateProperties(host, styleInfo) {
      var owner = this._styleOwnerForNode(host);
      var ownerStyleInfo = StyleInfo.get(owner);
      var ownerProperties = ownerStyleInfo.styleProperties;
      var props = Object.create(ownerProperties || null);
      var hostAndRootProps = StyleProperties$1.hostAndRootPropertiesForScope(host, styleInfo.styleRules);
      var propertyData = StyleProperties$1.propertyDataFromStyles(ownerStyleInfo.styleRules, host);
      var propertiesMatchingHost = propertyData.properties;
      Object.assign(props, hostAndRootProps.hostProps, propertiesMatchingHost, hostAndRootProps.rootProps);
      this._mixinOverrideStyles(props, styleInfo.overrideStyleProperties);
      StyleProperties$1.reify(props);
      styleInfo.styleProperties = props;
    }
  }, {
    key: '_mixinOverrideStyles',
    value: function _mixinOverrideStyles(props, overrides) {
      for (var p in overrides) {
        var v = overrides[p];
        // skip override props if they are not truthy or 0
        // in order to fall back to inherited values
        if (v || v === 0) {
          props[p] = v;
        }
      }
    }
    /**
     * Update styles of the whole document
     *
     * @param {Object=} properties
     */

  }, {
    key: 'styleDocument',
    value: function styleDocument(properties) {
      this.styleSubtree(this._documentOwner, properties);
    }
    /**
     * Update styles of a subtree
     *
     * @param {!HTMLElement} host
     * @param {Object=} properties
     */

  }, {
    key: 'styleSubtree',
    value: function styleSubtree(host, properties) {
      var root = host.shadowRoot;
      if (root || this._isRootOwner(host)) {
        this.styleElement(host, properties);
      }
      // process the shadowdom children of `host`
      var shadowChildren = root && (root.children || root.childNodes);
      if (shadowChildren) {
        for (var i = 0; i < shadowChildren.length; i++) {
          var c = /** @type {!HTMLElement} */shadowChildren[i];
          this.styleSubtree(c);
        }
      } else {
        // process the lightdom children of `host`
        var children = host.children || host.childNodes;
        if (children) {
          for (var _i = 0; _i < children.length; _i++) {
            var _c = /** @type {!HTMLElement} */children[_i];
            this.styleSubtree(_c);
          }
        }
      }
    }
    /* Custom Style operations */

  }, {
    key: '_revalidateCustomStyleApplyShim',
    value: function _revalidateCustomStyleApplyShim(customStyles) {
      for (var i = 0; i < customStyles.length; i++) {
        var c = customStyles[i];
        var s = this._customStyleInterface['getStyleForCustomStyle'](c);
        if (s) {
          this._revalidateApplyShim(s);
        }
      }
    }
  }, {
    key: '_applyCustomStyles',
    value: function _applyCustomStyles(customStyles) {
      for (var i = 0; i < customStyles.length; i++) {
        var c = customStyles[i];
        var s = this._customStyleInterface['getStyleForCustomStyle'](c);
        if (s) {
          StyleProperties$1.applyCustomStyle(s, this._documentOwnerStyleInfo.styleProperties);
        }
      }
    }
  }, {
    key: 'transformCustomStyleForDocument',
    value: function transformCustomStyleForDocument(style) {
      var _this3 = this;

      var ast = rulesForStyle(style);
      forEachRule(ast, function (rule) {
        if (nativeShadow) {
          StyleTransformer$1.normalizeRootSelector(rule);
        } else {
          StyleTransformer$1.documentRule(rule);
        }
        if (nativeCssVariables) {
          _this3._ensure();
          _this3._applyShim && _this3._applyShim['transformRule'](rule);
        }
      });
      if (nativeCssVariables) {
        style.textContent = toCssText(ast);
      } else {
        this._documentOwnerStyleInfo.styleRules.rules.push(ast);
      }
    }
  }, {
    key: '_revalidateApplyShim',
    value: function _revalidateApplyShim(style) {
      if (nativeCssVariables && this._applyShim) {
        var ast = rulesForStyle(style);
        this._ensure();
        this._applyShim['transformRules'](ast);
        style.textContent = toCssText(ast);
      }
    }
  }, {
    key: 'getComputedStyleValue',
    value: function getComputedStyleValue$$1(element, property) {
      var value = void 0;
      if (!nativeCssVariables) {
        // element is either a style host, or an ancestor of a style host
        var styleInfo = StyleInfo.get(element) || StyleInfo.get(this._styleOwnerForNode(element));
        value = styleInfo.styleProperties[property];
      }
      // fall back to the property value from the computed styling
      value = value || window.getComputedStyle(element).getPropertyValue(property);
      // trim whitespace that can come after the `:` in css
      // example: padding: 2px -> " 2px"
      return value ? value.trim() : '';
    }
    // given an element and a classString, replaces
    // the element's class with the provided classString and adds
    // any necessary ShadyCSS static and property based scoping selectors

  }, {
    key: 'setElementClass',
    value: function setElementClass(element, classString) {
      var root = element.getRootNode();
      var classes = classString ? classString.split(/\s/) : [];
      var scopeName = root.host && root.host.localName;
      // If no scope, try to discover scope name from existing class.
      // This can occur if, for example, a template stamped element that
      // has been scoped is manipulated when not in a root.
      if (!scopeName) {
        var classAttr = element.getAttribute('class');
        if (classAttr) {
          var k$ = classAttr.split(/\s/);
          for (var i = 0; i < k$.length; i++) {
            if (k$[i] === StyleTransformer$1.SCOPE_NAME) {
              scopeName = k$[i + 1];
              break;
            }
          }
        }
      }
      if (scopeName) {
        classes.push(StyleTransformer$1.SCOPE_NAME, scopeName);
      }
      if (!nativeCssVariables) {
        var styleInfo = StyleInfo.get(element);
        if (styleInfo && styleInfo.scopeSelector) {
          classes.push(StyleProperties$1.XSCOPE_NAME, styleInfo.scopeSelector);
        }
      }
      setElementClassRaw(element, classes.join(' '));
    }
  }, {
    key: '_styleInfoForNode',
    value: function _styleInfoForNode(node) {
      return StyleInfo.get(node);
    }
  }]);
  return ScopingShim;
}();

ScopingShim.prototype['flush'] = ScopingShim.prototype.flush;
ScopingShim.prototype['prepareTemplate'] = ScopingShim.prototype.prepareTemplate;
ScopingShim.prototype['styleElement'] = ScopingShim.prototype.styleElement;
ScopingShim.prototype['styleDocument'] = ScopingShim.prototype.styleDocument;
ScopingShim.prototype['styleSubtree'] = ScopingShim.prototype.styleSubtree;
ScopingShim.prototype['getComputedStyleValue'] = ScopingShim.prototype.getComputedStyleValue;
ScopingShim.prototype['setElementClass'] = ScopingShim.prototype.setElementClass;
ScopingShim.prototype['_styleInfoForNode'] = ScopingShim.prototype._styleInfoForNode;
ScopingShim.prototype['transformCustomStyleForDocument'] = ScopingShim.prototype.transformCustomStyleForDocument;
ScopingShim.prototype['getStyleAst'] = ScopingShim.prototype.getStyleAst;
ScopingShim.prototype['styleAstToString'] = ScopingShim.prototype.styleAstToString;
ScopingShim.prototype['flushCustomStyles'] = ScopingShim.prototype.flushCustomStyles;
Object.defineProperties(ScopingShim.prototype, {
  'nativeShadow': {
    get: function get$$1() {
      return nativeShadow;
    }
  },
  'nativeCss': {
    get: function get$$1() {
      return nativeCssVariables;
    }
  }
});

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/** @const {ScopingShim} */
var scopingShim$1 = new ScopingShim();

var ApplyShim = void 0;
var CustomStyleInterface = void 0;

if (window['ShadyCSS']) {
  ApplyShim = window['ShadyCSS']['ApplyShim'];
  CustomStyleInterface = window['ShadyCSS']['CustomStyleInterface'];
}

window.ShadyCSS = {
  ScopingShim: scopingShim$1,
  /**
   * @param {!HTMLTemplateElement} template
   * @param {string} elementName
   * @param {string=} elementExtends
   */
  prepareTemplate: function prepareTemplate(template, elementName, elementExtends) {
    scopingShim$1.flushCustomStyles();
    scopingShim$1.prepareTemplate(template, elementName, elementExtends);
  },


  /**
   * @param {!HTMLElement} element
   * @param {Object=} properties
   */
  styleSubtree: function styleSubtree(element, properties) {
    scopingShim$1.flushCustomStyles();
    scopingShim$1.styleSubtree(element, properties);
  },


  /**
   * @param {!HTMLElement} element
   */
  styleElement: function styleElement(element) {
    scopingShim$1.flushCustomStyles();
    scopingShim$1.styleElement(element);
  },


  /**
   * @param {Object=} properties
   */
  styleDocument: function styleDocument(properties) {
    scopingShim$1.flushCustomStyles();
    scopingShim$1.styleDocument(properties);
  },


  /**
   * @param {Element} element
   * @param {string} property
   * @return {string}
   */
  getComputedStyleValue: function getComputedStyleValue(element, property) {
    return scopingShim$1.getComputedStyleValue(element, property);
  },


  nativeCss: nativeCssVariables,

  nativeShadow: nativeShadow
};

if (ApplyShim) {
  window.ShadyCSS.ApplyShim = ApplyShim;
}

if (CustomStyleInterface) {
  window.ShadyCSS.CustomStyleInterface = CustomStyleInterface;
}

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// It's desireable to provide a default stylesheet
// that's convenient for styling unresolved elements, but
// it's cumbersome to have to include this manually in every page.
// It would make sense to put inside some HTMLImport but
// the HTMLImports polyfill does not allow loading of stylesheets
// that block rendering. Therefore this injection is tolerated here.
//
// NOTE: position: relative fixes IE's failure to inherit opacity
// when a child is not statically positioned.

var style = document.createElement('style');
style.textContent = '' + 'body {' + 'transition: opacity ease-in 0.2s;' + ' } \n' + 'body[unresolved] {' + 'opacity: 0; display: block; overflow: hidden; position: relative;' + ' } \n';
var head = document.querySelector('head');
head.insertBefore(style, head.firstChild);

/*
 *  @license
 *    Copyright 2017 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
//------ webcomponents-platform ------

//------ template ------
//------ es6-promise ------
//------ pre-polyfill ------
//------ shadydom ------
//------ custom-elements ------
//------ shadycss ------
//------ unresolved styles ------

}());
//# sourceMappingURL=web-component-polyfills.js.map
