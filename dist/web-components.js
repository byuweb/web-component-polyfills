/*!
 * @skatejs/web-components v1.0.0 - https://github.com/skatejs/web-components#readme
 * MIT Licensed
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 42);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys = __webpack_require__(2);
var foreach = __webpack_require__(31);
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = __webpack_require__(36);
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ES = __webpack_require__(5);
var supportsDescriptors = __webpack_require__(0).supportsDescriptors;

/*! https://mths.be/array-from v0.2.0 by @mathias */
module.exports = function from(arrayLike) {
	var defineProperty = supportsDescriptors ? Object.defineProperty : function put(object, key, descriptor) {
		object[key] = descriptor.value;
	};
	var C = this;
	if (arrayLike === null || typeof arrayLike === 'undefined') {
		throw new TypeError('`Array.from` requires an array-like object, not `null` or `undefined`');
	}
	var items = ES.ToObject(arrayLike);

	var mapFn, T;
	if (typeof arguments[1] !== 'undefined') {
		mapFn = arguments[1];
		if (!ES.IsCallable(mapFn)) {
			throw new TypeError('When provided, the second argument to `Array.from` must be a function');
		}
		if (arguments.length > 2) {
			T = arguments[2];
		}
	}

	var len = ES.ToLength(items.length);
	var A = ES.IsCallable(C) ? ES.ToObject(new C(len)) : new Array(len);
	var k = 0;
	var kValue, mappedValue;
	while (k < len) {
		kValue = items[k];
		if (mapFn) {
			mappedValue = typeof T === 'undefined' ? mapFn(kValue, k) : ES.Call(mapFn, T, [kValue, k]);
		} else {
			mappedValue = kValue;
		}
		defineProperty(A, k, {
			'configurable': true,
			'enumerable': true,
			'value': mappedValue,
			'writable': true
		});
		k += 1;
	}
	A.length = len;
	return A;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ES = __webpack_require__(5);
var implementation = __webpack_require__(3);

var tryCall = function (fn) {
	try {
		fn();
		return true;
	} catch (e) {
		return false;
	}
};

module.exports = function getPolyfill() {
	var implemented = ES.IsCallable(Array.from)
		&& tryCall(function () { Array.from({ 'length': -Infinity }); })
		&& !tryCall(function () { Array.from([], undefined); });

	return implemented ? Array.from : implementation;
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';
var symbolToStr = hasSymbols ? Symbol.prototype.toString : toStr;

var $isNaN = __webpack_require__(7);
var $isFinite = __webpack_require__(6);
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

var assign = __webpack_require__(26);
var sign = __webpack_require__(9);
var mod = __webpack_require__(8);
var isPrimitive = __webpack_require__(27);
var toPrimitive = __webpack_require__(29);
var parseInteger = parseInt;
var bind = __webpack_require__(11);
var strSlice = bind.call(Function.call, String.prototype.slice);
var isBinary = bind.call(Function.call, RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = bind.call(Function.call, RegExp.prototype.test, /^0o[0-7]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
var hasNonWS = bind.call(Function.call, RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[\-\+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = bind.call(Function.call, RegExp.prototype.test, invalidHexLiteral);

// whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
var ws = [
	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
	'\u2029\uFEFF'
].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = bind.call(Function.call, String.prototype.replace);
var trim = function (value) {
	return replace(value, trimRegex, '');
};

var ES5 = __webpack_require__(25);

var hasRegExpMatcher = __webpack_require__(34);

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
var ES6 = assign(assign({}, ES5), {

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
	Call: function Call(F, V) {
		var args = arguments.length > 2 ? arguments[2] : [];
		if (!this.IsCallable(F)) {
			throw new TypeError(F + ' is not a function');
		}
		return F.apply(V, args);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
	ToPrimitive: toPrimitive,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
	// ToBoolean: ES5.ToBoolean,

	// http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
	ToNumber: function ToNumber(argument) {
		var value = isPrimitive(argument) ? argument : toPrimitive(argument, 'number');
		if (typeof value === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a number');
		}
		if (typeof value === 'string') {
			if (isBinary(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
			} else if (isOctal(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
				return NaN;
			} else {
				var trimmed = trim(value);
				if (trimmed !== value) {
					return this.ToNumber(trimmed);
				}
			}
		}
		return Number(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
	// ToInteger: ES5.ToNumber,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
	// ToInt32: ES5.ToInt32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
	// ToUint32: ES5.ToUint32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
	ToInt16: function ToInt16(argument) {
		var int16bit = this.ToUint16(argument);
		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
	// ToUint16: ES5.ToUint16,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
	ToInt8: function ToInt8(argument) {
		var int8bit = this.ToUint8(argument);
		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
	ToUint8: function ToUint8(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x100);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
	ToUint8Clamp: function ToUint8Clamp(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number <= 0) { return 0; }
		if (number >= 0xFF) { return 0xFF; }
		var f = Math.floor(argument);
		if (f + 0.5 < number) { return f + 1; }
		if (number < f + 0.5) { return f; }
		if (f % 2 !== 0) { return f + 1; }
		return f;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
	ToString: function ToString(argument) {
		if (typeof argument === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a string');
		}
		return String(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
	ToObject: function ToObject(value) {
		this.RequireObjectCoercible(value);
		return Object(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
	ToPropertyKey: function ToPropertyKey(argument) {
		var key = this.ToPrimitive(argument, String);
		return typeof key === 'symbol' ? symbolToStr.call(key) : this.ToString(key);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	ToLength: function ToLength(argument) {
		var len = this.ToInteger(argument);
		if (len <= 0) { return 0; } // includes converting -0 to +0
		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
		return len;
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
		if (toStr.call(argument) !== '[object String]') {
			throw new TypeError('must be a string');
		}
		if (argument === '-0') { return -0; }
		var n = this.ToNumber(argument);
		if (this.SameValue(this.ToString(n), argument)) { return n; }
		return void 0;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
	RequireObjectCoercible: ES5.CheckObjectCoercible,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
	IsArray: Array.isArray || function IsArray(argument) {
		return toStr.call(argument) === '[object Array]';
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
	// IsCallable: ES5.IsCallable,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
	IsConstructor: function IsConstructor(argument) {
		return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
	IsExtensible: function IsExtensible(obj) {
		if (!Object.preventExtensions) { return true; }
		if (isPrimitive(obj)) {
			return false;
		}
		return Object.isExtensible(obj);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
	IsInteger: function IsInteger(argument) {
		if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
			return false;
		}
		var abs = Math.abs(argument);
		return Math.floor(abs) === abs;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
	IsPropertyKey: function IsPropertyKey(argument) {
		return typeof argument === 'string' || typeof argument === 'symbol';
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-isregexp
	IsRegExp: function IsRegExp(argument) {
		if (!argument || typeof argument !== 'object') {
			return false;
		}
		if (hasSymbols) {
			var isRegExp = argument[Symbol.match];
			if (typeof isRegExp !== 'undefined') {
				return ES5.ToBoolean(isRegExp);
			}
		}
		return hasRegExpMatcher(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
	// SameValue: ES5.SameValue,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
	SameValueZero: function SameValueZero(x, y) {
		return (x === y) || ($isNaN(x) && $isNaN(y));
	},

	Type: function Type(x) {
		if (typeof x === 'symbol') {
			return 'Symbol';
		}
		return ES5.Type(x);
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
	SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		var C = O.constructor;
		if (typeof C === 'undefined') {
			return defaultConstructor;
		}
		if (this.Type(C) !== 'Object') {
			throw new TypeError('O.constructor is not an Object');
		}
		var S = hasSymbols && Symbol.species ? C[Symbol.species] : undefined;
		if (S == null) {
			return defaultConstructor;
		}
		if (this.IsConstructor(S)) {
			return S;
		}
		throw new TypeError('no constructor found');
	}
});

delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

module.exports = ES6;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var $isNaN = Number.isNaN || function (a) { return a !== a; };

module.exports = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function sign(number) {
	return number >= 0 ? 1 : -1;
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var implementation = __webpack_require__(32);

module.exports = Function.prototype.bind || implementation;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// modified from https://github.com/es-shims/es6-shim
var keys = __webpack_require__(2);
var bind = __webpack_require__(11);
var canBeObject = function (obj) {
	return typeof obj !== 'undefined' && obj !== null;
};
var hasSymbols = __webpack_require__(37)();
var toObject = Object;
var push = bind.call(Function.call, Array.prototype.push);
var propIsEnumerable = bind.call(Function.call, Object.prototype.propertyIsEnumerable);
var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;

module.exports = function assign(target, source1) {
	if (!canBeObject(target)) { throw new TypeError('target must be an object'); }
	var objTarget = toObject(target);
	var s, source, i, props, syms, value, key;
	for (s = 1; s < arguments.length; ++s) {
		source = toObject(arguments[s]);
		props = keys(source);
		var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			syms = getSymbols(source);
			for (i = 0; i < syms.length; ++i) {
				key = syms[i];
				if (propIsEnumerable(source, key)) {
					push(props, key);
				}
			}
		}
		for (i = 0; i < props.length; ++i) {
			key = props[i];
			value = source[key];
			if (propIsEnumerable(source, key)) {
				objTarget[key] = value;
			}
		}
	}
	return objTarget;
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var implementation = __webpack_require__(12);

var lacksProperEnumerationOrder = function () {
	if (!Object.assign) {
		return false;
	}
	// v8, specifically in node 4.x, has a bug with incorrect property enumeration order
	// note: this does not detect the bug unless there's 20 characters
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function () {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	// Firefox 37 still has "pending exception" logic in its Object.assign implementation,
	// which is 72% slower than our shim, and Firefox 40's native implementation.
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

module.exports = function getPolyfill() {
	if (!Object.assign) {
		return implementation;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation;
	}
	if (assignHasPendingExceptions()) {
		return implementation;
	}
	return Object.assign;
};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// NOTE!!!
//
// We have to load polyfills directly from source as non-minified files are not
// published by the polyfills. An issue was raised to discuss this problem and
// to see if it can be resolved.
//
// See https://github.com/webcomponents/custom-elements/issues/45

// ES2015 polyfills required for the polyfills to work in older browsers.
__webpack_require__(21).shim();
__webpack_require__(38).shim();
__webpack_require__(30).polyfill();

// We have to include this first so that it can patch native. This must be done
// before any polyfills are loaded.
__webpack_require__(23);

// Template polyfill is necessary to use shadycss in IE11
// this comes before custom elements because of
// https://github.com/webcomponents/template/blob/master/template.js#L39
__webpack_require__(20);

// This comes after the native shim because it requries it to be patched first.
__webpack_require__(16);

// Force the polyfill in Safari 10.0.0 and 10.0.1.
var _window = window,
    navigator = _window.navigator;
var userAgent = navigator.userAgent;

var safari = userAgent.indexOf('Safari/60') !== -1;
var safariVersion = safari && userAgent.match(/Version\/([^\s]+)/)[1];
var safariVersions = [0, 1].map(function (v) {
  return '10.0.' + v;
}).concat(['10.0']);

if (safari && safariVersions.indexOf(safariVersion) > -1) {
  window.ShadyDOM = { force: true };
}

// ShadyDOM comes first. Both because it may need to be forced and the
// ShadyCSS polyfill requires it to function.
__webpack_require__(24);
__webpack_require__(19);
__webpack_require__(17);
__webpack_require__(18);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*

 Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
(function(){function c(){function a(){b.C=!0;b.b(f.childNodes)}var b=this;this.a=new Map;this.j=new Map;this.h=new Map;this.m=new Set;this.v=new MutationObserver(this.A.bind(this));this.f=null;this.B=new Set;this.enableFlush=!0;this.C=!1;this.G=this.c(f);window.HTMLImports?window.HTMLImports.whenReady(a):a()}function g(){return h.customElements}function k(a){if(!/^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(a)||-1!==q.indexOf(a))return Error("The element name '"+a+"' is not valid.")}function l(a,
b,d,e){var c=g();a=r.call(a,b,d);(b=c.a.get(b.toLowerCase()))&&c.D(a,b,e);c.c(a);return a}function m(a,b,d,e){b=b.toLowerCase();var c=a.getAttribute(b);e.call(a,b,d);1==a.__$CE_upgraded&&(e=g().a.get(a.localName),d=e.w,(e=e.i)&&0<=d.indexOf(b)&&(d=a.getAttribute(b),d!==c&&e.call(a,b,c,d,null)))}var f=document,h=window;if(g()&&(g().g=function(){},!g().forcePolyfill))return;var q="annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" ");
c.prototype.K=function(a,b){function d(a){var b=g[a];if(void 0!==b&&"function"!==typeof b)throw Error(c+" '"+a+"' is not a Function");return b}if("function"!==typeof b)throw new TypeError("constructor must be a Constructor");var e=k(a);if(e)throw e;if(this.a.has(a))throw Error("An element with name '"+a+"' is already defined");if(this.j.has(b))throw Error("Definition failed for '"+a+"': The constructor is already used.");var c=a,g=b.prototype;if("object"!==typeof g)throw new TypeError("Definition failed for '"+
a+"': constructor.prototype must be an object");var e=d("connectedCallback"),h=d("disconnectedCallback"),n=d("attributeChangedCallback");this.a.set(c,{name:a,localName:c,constructor:b,o:e,s:h,i:n,w:n&&b.observedAttributes||[]});this.j.set(b,c);this.C&&this.b(f.childNodes);if(a=this.h.get(c))a.resolve(void 0),this.h.delete(c)};c.prototype.get=function(a){return(a=this.a.get(a))?a.constructor:void 0};c.prototype.L=function(a){var b=k(a);if(b)return Promise.reject(b);if(this.a.has(a))return Promise.resolve();
if(b=this.h.get(a))return b.M;var d,e=new Promise(function(a){d=a}),b={M:e,resolve:d};this.h.set(a,b);return e};c.prototype.g=function(){this.enableFlush&&(this.l(this.G.takeRecords()),this.A(this.v.takeRecords()),this.m.forEach(function(a){this.l(a.takeRecords())},this))};c.prototype.I=function(a){this.f=a};c.prototype.c=function(a){if(null!=a.__$CE_observer)return a.__$CE_observer;a.__$CE_observer=new MutationObserver(this.l.bind(this));a.__$CE_observer.observe(a,{childList:!0,subtree:!0});this.enableFlush&&
this.m.add(a.__$CE_observer);return a.__$CE_observer};c.prototype.J=function(a){null!=a.__$CE_observer&&(a.__$CE_observer.disconnect(),this.enableFlush&&this.m.delete(a.__$CE_observer),a.__$CE_observer=null)};c.prototype.l=function(a){for(var b=0;b<a.length;b++){var d=a[b];if("childList"===d.type){var e=d.removedNodes;this.b(d.addedNodes);this.H(e)}}};c.prototype.b=function(a,b){b=b||new Set;for(var d=0;d<a.length;d++){var e=a[d];if(e.nodeType===Node.ELEMENT_NODE){this.J(e);e=f.createTreeWalker(e,
NodeFilter.SHOW_ELEMENT,null,!1);do this.F(e.currentNode,b);while(e.nextNode())}}};c.prototype.F=function(a,b){if(!b.has(a)){b.add(a);var d=this.a.get(a.localName);if(d){a.__$CE_upgraded||this.D(a,d,!0);var e;if(e=a.__$CE_upgraded&&!a.__$CE_attached)a:{e=a;do{if(e.__$CE_attached||e.nodeType===Node.DOCUMENT_NODE){e=!0;break a}e=e.parentNode||e.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&e.host}while(e);e=!1}e&&(a.__$CE_attached=!0,d.o&&d.o.call(a))}a.shadowRoot&&this.b(a.shadowRoot.childNodes,b);"LINK"===
a.tagName&&a.rel&&-1!==a.rel.toLowerCase().split(" ").indexOf("import")&&this.u(a,b)}};c.prototype.u=function(a,b){var d=a.import;if(d)b.has(d)||(b.add(d),d.__$CE_observer||this.c(d),this.b(d.childNodes,b));else if(b=a.href,!this.B.has(b)){this.B.add(b);var e=this,c=function(){a.removeEventListener("load",c);a.import.__$CE_observer||e.c(a.import);e.b(a.import.childNodes)};a.addEventListener("load",c)}};c.prototype.H=function(a){for(var b=0;b<a.length;b++){var d=a[b];if(d.nodeType===Node.ELEMENT_NODE){this.c(d);
d=f.createTreeWalker(d,NodeFilter.SHOW_ELEMENT,null,!1);do{var e=d.currentNode;if(e.__$CE_upgraded&&e.__$CE_attached){e.__$CE_attached=!1;var c=this.a.get(e.localName);c&&c.s&&c.s.call(e)}}while(d.nextNode())}}};c.prototype.D=function(a,b,d){a.__proto__=b.constructor.prototype;d&&(this.I(a),new b.constructor,a.__$CE_upgraded=!0,console.assert(!this.f));d=b.w;if((b=b.i)&&0<d.length){this.v.observe(a,{attributes:!0,attributeOldValue:!0,attributeFilter:d});for(var e=0;e<d.length;e++){var c=d[e];if(a.hasAttribute(c)){var f=
a.getAttribute(c);b.call(a,c,null,f,null)}}}};c.prototype.A=function(a){for(var b=0;b<a.length;b++){var d=a[b];if("attributes"===d.type){var e=d.target,c=this.a.get(e.localName),f=d.attributeName,g=d.oldValue,h=e.getAttribute(f);h!==g&&c.i.call(e,f,g,h,d.attributeNamespace)}}};window.CustomElementRegistry=c;c.prototype.define=c.prototype.K;c.prototype.get=c.prototype.get;c.prototype.whenDefined=c.prototype.L;c.prototype.flush=c.prototype.g;c.prototype.polyfilled=!0;c.prototype._observeRoot=c.prototype.c;
c.prototype._addImport=c.prototype.u;var t=h.HTMLElement;h.HTMLElement=function(){var a=g();if(a.f){var b=a.f;a.f=null;return b}if(this.constructor)return a=a.j.get(this.constructor),l(f,a,void 0,!1);throw Error("Unknown constructor. Did you call customElements.define()?");};h.HTMLElement.prototype=Object.create(t.prototype,{constructor:{value:h.HTMLElement,configurable:!0,writable:!0}});var r=f.createElement;f.createElement=function(a,b){return l(f,a,b,!0)};var u=f.createElementNS;f.createElementNS=
function(a,b){return"http://www.w3.org/1999/xhtml"===a?f.createElement(b):u.call(f,a,b)};var p=Element.prototype.attachShadow;p&&Object.defineProperty(Element.prototype,"attachShadow",{value:function(a){a=p.call(this,a);g().c(a);return a}});var v=f.importNode;f.importNode=function(a,b){a=v.call(f,a,b);g().b(a.nodeType===Node.ELEMENT_NODE?[a]:a.childNodes);return a};var w=Element.prototype.setAttribute;Element.prototype.setAttribute=function(a,b){m(this,a,b,w)};var x=Element.prototype.removeAttribute;
Element.prototype.removeAttribute=function(a){m(this,a,null,x)};Object.defineProperty(window,"customElements",{value:new c,configurable:!0,enumerable:!0});window.CustomElements={takeRecords:function(){g().g&&g().g()}}})();

//# sourceMappingURL=custom-elements.min.js.map


/***/ }),
/* 17 */
/***/ (function(module, exports) {

(function(){
/*

Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';var l={};function m(){this.end=this.start=0;this.rules=this.parent=this.previous=null;this.cssText=this.parsedCssText="";this.atRule=!1;this.type=0;this.parsedSelector=this.selector=this.keyframesName=""}
function p(a){a=a.replace(aa,"").replace(ba,"");var c=q,b=a,d=new m;d.start=0;d.end=b.length;for(var e=d,f=0,h=b.length;f<h;f++)if("{"===b[f]){e.rules||(e.rules=[]);var g=e,k=g.rules[g.rules.length-1]||null,e=new m;e.start=f+1;e.parent=g;e.previous=k;g.rules.push(e)}else"}"===b[f]&&(e.end=f+1,e=e.parent||d);return c(d,a)}
function q(a,c){var b=c.substring(a.start,a.end-1);a.parsedCssText=a.cssText=b.trim();a.parent&&((b=c.substring(a.previous?a.previous.end:a.parent.start,a.start-1),b=ca(b),b=b.replace(r," "),b=b.substring(b.lastIndexOf(";")+1),b=a.parsedSelector=a.selector=b.trim(),a.atRule=!b.indexOf("@"),a.atRule)?b.indexOf("@media")?b.match(da)&&(a.type=u,a.keyframesName=a.selector.split(r).pop()):a.type=t:a.type=b.indexOf("--")?v:y);if(b=a.rules)for(var d=0,e=b.length,f;d<e&&(f=b[d]);d++)q(f,c);return a}
function ca(a){return a.replace(/\\([0-9a-f]{1,6})\s/gi,function(a,b){a=b;for(b=6-a.length;b--;)a="0"+a;return"\\"+a})}
function z(a,c,b){b=void 0===b?"":b;var d="";if(a.cssText||a.rules){var e=a.rules,f;if(f=e)f=e[0],f=!(f&&f.selector&&0===f.selector.indexOf("--"));if(f){f=0;for(var h=e.length,g;f<h&&(g=e[f]);f++)d=z(g,c,d)}else c?c=a.cssText:(c=a.cssText,c=c.replace(ea,"").replace(fa,""),c=c.replace(ga,"").replace(ha,"")),(d=c.trim())&&(d="  "+d+"\n")}d&&(a.selector&&(b+=a.selector+" {\n"),b+=d,a.selector&&(b+="}\n\n"));return b}
var v=1,u=7,t=4,y=1E3,aa=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,ba=/@import[^;]*;/gim,ea=/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,fa=/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,ga=/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,ha=/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,da=/^@[^\s]*keyframes/,r=/\s+/g;var ia=Promise.resolve();function ja(a){(a=l[a])&&(a._applyShimInvalid=!0)}function ka(a){a.a||(a.a=!0,ia.then(function(){a._applyShimInvalid=!1;a.a=!1}))};var A=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,B=/(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,la=/@media[^(]*(\([^)]*\))/;var C=!(window.ShadyDOM&&window.ShadyDOM.inUse),D=!navigator.userAgent.match("AppleWebKit/601")&&window.CSS&&CSS.supports&&CSS.supports("box-shadow","0 0 0 var(--foo)");function E(a){a&&(D=D&&!a.nativeCss&&!a.shimcssproperties,C=C&&!a.nativeShadow&&!a.shimshadow)}window.ShadyCSS?E(window.ShadyCSS):window.WebComponents&&E(window.WebComponents.flags);var ma=C,F=D;function G(a){if(!a)return"";"string"===typeof a&&(a=p(a));return z(a,F)}function H(a){!a.__cssRules&&a.textContent&&(a.__cssRules=p(a.textContent));return a.__cssRules||null}function I(a,c,b,d){if(a){var e=!1,f=a.type;if(d&&f===t){var h=a.selector.match(la);h&&(window.matchMedia(h[1]).matches||(e=!0))}f===v?c(a):b&&f===u?b(a):f===y&&(e=!0);if((a=a.rules)&&!e)for(var e=0,f=a.length,g;e<f&&(g=a[e]);e++)I(g,c,b,d)}}
function J(a,c){var b=a.indexOf("var(");if(-1===b)return c(a,"","","");var d;a:{var e=0;d=b+3;for(var f=a.length;d<f;d++)if("("===a[d])e++;else if(")"===a[d]&&!--e)break a;d=-1}e=a.substring(b+4,d);b=a.substring(0,b);a=J(a.substring(d+1),c);d=e.indexOf(",");return-1===d?c(b,e.trim(),"",a):c(b,e.substring(0,d).trim(),e.substring(d+1).trim(),a)};var na=/;\s*/m,oa=/^\s*(initial)|(inherit)\s*$/;function K(){this.a={}}K.prototype.set=function(a,c){a=a.trim();this.a[a]={h:c,i:{}}};K.prototype.get=function(a){a=a.trim();return this.a[a]||null};var L=null;function M(){this.b=this.c=null;this.a=new K}M.prototype.o=function(a){a=B.test(a)||A.test(a);B.lastIndex=0;A.lastIndex=0;return a};M.prototype.m=function(a,c){a=a.content.querySelector("style");var b=null;a&&(b=this.j(a,c));return b};
M.prototype.j=function(a,c){c=void 0===c?"":c;var b=H(a);this.l(b,c);a.textContent=G(b);return b};M.prototype.f=function(a){var c=this,b=H(a);I(b,function(a){":root"===a.selector&&(a.selector="html");c.g(a)});a.textContent=G(b);return b};M.prototype.l=function(a,c){var b=this;this.c=c;I(a,function(a){b.g(a)});this.c=null};M.prototype.g=function(a){a.cssText=pa(this,a.parsedCssText);":root"===a.selector&&(a.selector=":host > *")};
function pa(a,c){c=c.replace(A,function(c,d,e,f){return qa(a,c,d,e,f)});return N(a,c)}function N(a,c){for(var b;b=B.exec(c);){var d=b[0],e=b[1];b=b.index;var f=c.slice(0,b+d.indexOf("@apply"));c=c.slice(b+d.length);var h=O(a,f),g,k,d=void 0;g=a;var e=e.replace(na,""),n=[];k=g.a.get(e);k||(g.a.set(e,{}),k=g.a.get(e));if(k)for(d in g.c&&(k.i[g.c]=!0),k.h)g=h&&h[d],k=[d,": var(",e,"_-_",d],g&&k.push(",",g),k.push(")"),n.push(k.join(""));d=n.join("; ");c=""+f+d+c;B.lastIndex=b+d.length}return c}
function O(a,c){c=c.split(";");for(var b,d,e={},f=0,h;f<c.length;f++)if(b=c[f])if(h=b.split(":"),1<h.length){b=h[0].trim();var g=a;d=b;h=h.slice(1).join(":");var k=oa.exec(h);k&&(k[1]?(g.b||(g.b=document.createElement("meta"),g.b.setAttribute("apply-shim-measure",""),g.b.style.all="initial",document.head.appendChild(g.b)),d=window.getComputedStyle(g.b).getPropertyValue(d)):d="apply-shim-inherit",h=d);d=h;e[b]=d}return e}function ra(a,c){if(L)for(var b in c.i)b!==a.c&&L(b)}
function qa(a,c,b,d,e){d&&J(d,function(c,b){b&&a.a.get(b)&&(e="@apply "+b+";")});if(!e)return c;var f=N(a,e),h=c.slice(0,c.indexOf("--")),g=f=O(a,f),k=a.a.get(b),n=k&&k.h;n?g=Object.assign(Object.create(n),f):a.a.set(b,g);var W=[],w,x,X=!1;for(w in g)x=f[w],void 0===x&&(x="initial"),!n||w in n||(X=!0),W.push(""+b+"_-_"+w+": "+x);X&&ra(a,k);k&&(k.h=g);d&&(h=c+";"+h);return""+h+W.join("; ")+";"}M.prototype.detectMixin=M.prototype.o;M.prototype.transformStyle=M.prototype.j;
M.prototype.transformCustomStyle=M.prototype.f;M.prototype.transformRules=M.prototype.l;M.prototype.transformRule=M.prototype.g;M.prototype.transformTemplate=M.prototype.m;M.prototype._separator="_-_";Object.defineProperty(M.prototype,"invalidCallback",{get:function(){return L},set:function(a){L=a}});var P=null,Q=window.HTMLImports&&window.HTMLImports.whenReady||null,R;function sa(a){Q?Q(a):(P||(P=new Promise(function(a){R=a}),"complete"===document.readyState?R():document.addEventListener("readystatechange",function(){"complete"===document.readyState&&R()})),P.then(function(){a&&a()}))};var S=new M;function T(){var a=this;this.a=null;this.b=!1;sa(function(){U(a)});S.invalidCallback=ja}function U(a){a.b||(a.a=window.ShadyCSS.CustomStyleInterface,a.a&&(a.a.transformCallback=function(a){S.f(a)},a.a.validateCallback=function(){requestAnimationFrame(function(){a.a.enqueued&&V(a)})}),a.b=!0)}T.prototype.prepareTemplate=function(a,c){U(this);l[c]=a;c=S.m(a,c);a._styleAst=c};
function V(a){U(a);if(a.a){var c=a.a.processStyles();if(a.a.enqueued){for(var b=0;b<c.length;b++){var d=a.a.getStyleForCustomStyle(c[b]);d&&S.f(d)}a.a.enqueued=!1}}}T.prototype.styleSubtree=function(a,c){U(this);if(c)for(var b in c)null===b?a.style.removeProperty(b):a.style.setProperty(b,c[b]);if(a.shadowRoot)for(this.styleElement(a),a=a.shadowRoot.children||a.shadowRoot.childNodes,c=0;c<a.length;c++)this.styleSubtree(a[c]);else for(a=a.children||a.childNodes,c=0;c<a.length;c++)this.styleSubtree(a[c])};
T.prototype.styleElement=function(a){U(this);var c=a.localName,b;c?-1<c.indexOf("-")?b=c:b=a.getAttribute&&a.getAttribute("is")||"":b=a.is;(c=l[b])&&c._applyShimInvalid&&(c.a||(this.prepareTemplate(c,b),ka(c)),a=a.shadowRoot)&&(a=a.querySelector("style"))&&(a.__cssRules=c._styleAst,a.textContent=G(c._styleAst))};T.prototype.styleDocument=function(a){U(this);this.styleSubtree(document.body,a)};
if(!window.ShadyCSS||!window.ShadyCSS.ScopingShim){var Y=new T,Z=window.ShadyCSS&&window.ShadyCSS.CustomStyleInterface;window.ShadyCSS={prepareTemplate:function(a,c){V(Y);Y.prepareTemplate(a,c)},styleSubtree:function(a,c){V(Y);Y.styleSubtree(a,c)},styleElement:function(a){V(Y);Y.styleElement(a)},styleDocument:function(a){V(Y);Y.styleDocument(a)},getComputedStyleValue:function(a,c){return(a=window.getComputedStyle(a).getPropertyValue(c))?a.trim():""},nativeCss:F,nativeShadow:ma};Z&&(window.ShadyCSS.CustomStyleInterface=
Z)}window.ShadyCSS.ApplyShim=S;
}).call(self)

//# sourceMappingURL=apply-shim.min.js.map


/***/ }),
/* 18 */
/***/ (function(module, exports) {

(function(){
/*

Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';var c=!(window.ShadyDOM&&window.ShadyDOM.inUse),f=!navigator.userAgent.match("AppleWebKit/601")&&window.CSS&&CSS.supports&&CSS.supports("box-shadow","0 0 0 var(--foo)");function g(a){a&&(f=f&&!a.nativeCss&&!a.shimcssproperties,c=c&&!a.nativeShadow&&!a.shimshadow)}window.ShadyCSS?g(window.ShadyCSS):window.WebComponents&&g(window.WebComponents.flags);var h=c,k=f;function l(a,b){for(var d in b)null===d?a.style.removeProperty(d):a.style.setProperty(d,b[d])};var m=null,n=window.HTMLImports&&window.HTMLImports.whenReady||null,r;function t(){var a=u;n?n(a):(m||(m=new Promise(function(a){r=a}),"complete"===document.readyState?r():document.addEventListener("readystatechange",function(){"complete"===document.readyState&&r()})),m.then(function(){a&&a()}))};var v=null,u=null;function x(){this.customStyles=[];this.enqueued=!1}function y(a){!a.enqueued&&u&&(a.enqueued=!0,t())}x.prototype.c=function(a){a.__seenByShadyCSS||(a.__seenByShadyCSS=!0,this.customStyles.push(a),y(this))};x.prototype.b=function(a){if(a.__shadyCSSCachedStyle)return a.__shadyCSSCachedStyle;var b;a.getStyle?b=a.getStyle():b=a;return b};
x.prototype.a=function(){for(var a=this.customStyles,b=0;b<a.length;b++){var d=a[b];if(!d.__shadyCSSCachedStyle){var e=this.b(d);if(e){var p=e.__appliedElement;if(p)for(var q=0;q<e.attributes.length;q++){var w=e.attributes[q];p.setAttribute(w.name,w.value)}e=p||e;v&&v(e);d.__shadyCSSCachedStyle=e}}}return a};x.prototype.addCustomStyle=x.prototype.c;x.prototype.getStyleForCustomStyle=x.prototype.b;x.prototype.processStyles=x.prototype.a;
Object.defineProperties(x.prototype,{transformCallback:{get:function(){return v},set:function(a){v=a}},validateCallback:{get:function(){return u},set:function(a){var b=!1;u||(b=!0);u=a;b&&y(this)}}});var z=new x;window.ShadyCSS||(window.ShadyCSS={prepareTemplate:function(){},styleSubtree:function(a,b){z.a();l(a,b)},styleElement:function(){z.a()},styleDocument:function(a){z.a();l(document.body,a)},getComputedStyleValue:function(a,b){return(a=window.getComputedStyle(a).getPropertyValue(b))?a.trim():""},nativeCss:k,nativeShadow:h});window.ShadyCSS.CustomStyleInterface=z;
}).call(self)

//# sourceMappingURL=custom-style-interface.min.js.map


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {(function(){
/*

Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';var l,aa="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this,m={};function n(){this.end=this.start=0;this.rules=this.parent=this.previous=null;this.cssText=this.parsedCssText="";this.atRule=!1;this.type=0;this.parsedSelector=this.selector=this.keyframesName=""}
function p(a){a=a.replace(ba,"").replace(ca,"");var b=da,c=a,e=new n;e.start=0;e.end=c.length;for(var d=e,f=0,g=c.length;f<g;f++)if("{"===c[f]){d.rules||(d.rules=[]);var h=d,k=h.rules[h.rules.length-1]||null,d=new n;d.start=f+1;d.parent=h;d.previous=k;h.rules.push(d)}else"}"===c[f]&&(d.end=f+1,d=d.parent||e);return b(e,a)}
function da(a,b){var c=b.substring(a.start,a.end-1);a.parsedCssText=a.cssText=c.trim();a.parent&&((c=b.substring(a.previous?a.previous.end:a.parent.start,a.start-1),c=ea(c),c=c.replace(fa," "),c=c.substring(c.lastIndexOf(";")+1),c=a.parsedSelector=a.selector=c.trim(),a.atRule=!c.indexOf("@"),a.atRule)?c.indexOf("@media")?c.match(ha)&&(a.type=r,a.keyframesName=a.selector.split(fa).pop()):a.type=ga:a.type=c.indexOf("--")?ia:ja);if(c=a.rules)for(var e=0,d=c.length,f;e<d&&(f=c[e]);e++)da(f,b);return a}
function ea(a){return a.replace(/\\([0-9a-f]{1,6})\s/gi,function(a,c){a=c;for(c=6-a.length;c--;)a="0"+a;return"\\"+a})}
function ka(a,b,c){c=void 0===c?"":c;var e="";if(a.cssText||a.rules){var d=a.rules,f;if(f=d)f=d[0],f=!(f&&f.selector&&0===f.selector.indexOf("--"));if(f){f=0;for(var g=d.length,h;f<g&&(h=d[f]);f++)e=ka(h,b,e)}else b?b=a.cssText:(b=a.cssText,b=b.replace(la,"").replace(ma,""),b=b.replace(na,"").replace(oa,"")),(e=b.trim())&&(e="  "+e+"\n")}e&&(a.selector&&(c+=a.selector+" {\n"),c+=e,a.selector&&(c+="}\n\n"));return c}
var ia=1,r=7,ga=4,ja=1E3,ba=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,ca=/@import[^;]*;/gim,la=/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,ma=/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,na=/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,oa=/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,ha=/^@[^\s]*keyframes/,fa=/\s+/g;var pa=Promise.resolve();function qa(a){(a=m[a])&&(a._applyShimInvalid=!0)}function ra(a){a.a||(a.a=!0,pa.then(function(){a._applyShimInvalid=!1;a.a=!1}))};var sa=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,ta=/(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,ua=/(--[\w-]+)\s*([:,;)]|$)/gi,va=/(animation\s*:)|(animation-name\s*:)/,wa=/@media[^(]*(\([^)]*\))/,xa=/\{[^}]*\}/g;var t=!(window.ShadyDOM&&window.ShadyDOM.inUse),u=!navigator.userAgent.match("AppleWebKit/601")&&window.CSS&&CSS.supports&&CSS.supports("box-shadow","0 0 0 var(--foo)");function ya(a){a&&(u=u&&!a.nativeCss&&!a.shimcssproperties,t=t&&!a.nativeShadow&&!a.shimshadow)}window.ShadyCSS?ya(window.ShadyCSS):window.WebComponents&&ya(window.WebComponents.flags);var v=t,w=u;function y(a,b){if(!a)return"";"string"===typeof a&&(a=p(a));b&&z(a,b);return ka(a,w)}function A(a){!a.__cssRules&&a.textContent&&(a.__cssRules=p(a.textContent));return a.__cssRules||null}function za(a){return!!a.parent&&a.parent.type===r}function z(a,b,c,e){if(a){var d=!1,f=a.type;if(e&&f===ga){var g=a.selector.match(wa);g&&(window.matchMedia(g[1]).matches||(d=!0))}f===ia?b(a):c&&f===r?c(a):f===ja&&(d=!0);if((a=a.rules)&&!d)for(var d=0,f=a.length,h;d<f&&(h=a[d]);d++)z(h,b,c,e)}}
function B(a,b,c,e){var d=document.createElement("style");b&&d.setAttribute("scope",b);d.textContent=a;Aa(d,c,e);return d}var C=null;function Aa(a,b,c){b=b||document.head;b.insertBefore(a,c&&c.nextSibling||b.firstChild);C?a.compareDocumentPosition(C)===Node.DOCUMENT_POSITION_PRECEDING&&(C=a):C=a}
function Ba(a,b){var c=a.indexOf("var(");if(-1===c)return b(a,"","","");var e;a:{var d=0;e=c+3;for(var f=a.length;e<f;e++)if("("===a[e])d++;else if(")"===a[e]&&!--d)break a;e=-1}d=a.substring(c+4,e);c=a.substring(0,c);a=Ba(a.substring(e+1),b);e=d.indexOf(",");return-1===e?b(c,d.trim(),"",a):b(c,d.substring(0,e).trim(),d.substring(e+1).trim(),a)}function D(a,b){v?a.setAttribute("class",b):window.ShadyDOM.nativeMethods.setAttribute.call(a,"class",b)}
function E(a){var b=a.localName,c="";b?-1<b.indexOf("-")||(c=b,b=a.getAttribute&&a.getAttribute("is")||""):(b=a.is,c=a.extends);return{is:b,u:c}};var F=null,Ca=window.HTMLImports&&window.HTMLImports.whenReady||null,G;function Da(a){Ca?Ca(a):(F||(F=new Promise(function(a){G=a}),"complete"===document.readyState?G():document.addEventListener("readystatechange",function(){"complete"===document.readyState&&G()})),F.then(function(){a&&a()}))};function H(){}function I(a,b,c){var e=J;a.__styleScoped?a.__styleScoped=null:Ea(e,a,b||"",c)}
function Ea(a,b,c,e){if(b.nodeType===Node.ELEMENT_NODE&&c)if(b.classList)e?(b.classList.remove("style-scope"),b.classList.remove(c)):(b.classList.add("style-scope"),b.classList.add(c));else if(b.getAttribute){var d=b.getAttribute(Fa);e?d&&(d=d.replace("style-scope","").replace(c,""),D(b,d)):D(b,(d?d+" ":"")+"style-scope "+c)}if(b="template"===b.localName?(b.content||b.R).childNodes:b.children||b.childNodes)for(d=0;d<b.length;d++)Ea(a,b[d],c,e)}
function K(a,b,c){var e=J,d=a.__cssBuild;v||"shady"===d?b=y(b,c):(a=E(a),b=Ga(e,b,a.is,a.u,c)+"\n\n");return b.trim()}function Ga(a,b,c,e,d){var f=L(c,e);c=c?Ha+c:"";return y(b,function(b){b.c||(b.selector=b.g=N(a,b,a.b,c,f),b.c=!0);d&&d(b,c,f)})}function L(a,b){return b?"[is="+a+"]":a}function N(a,b,c,e,d){var f=b.selector.split(Ia);if(!za(b)){b=0;for(var g=f.length,h;b<g&&(h=f[b]);b++)f[b]=c.call(a,h,e,d)}return f.join(Ia)}
H.prototype.b=function(a,b,c){var e=!1;a=a.trim();a=a.replace(Ja,function(a,b,c){return":"+b+"("+c.replace(/\s/g,"")+")"});a=a.replace(Ka,La+" $1");return a=a.replace(Ma,function(a,f,g){e||(a=Na(g,f,b,c),e=e||a.stop,f=a.H,g=a.value);return f+g})};
function Na(a,b,c,e){var d=a.indexOf(Oa);0<=a.indexOf(La)?a=Pa(a,e):0!==d&&(a=c?Qa(a,c):a);c=!1;0<=d&&(b="",c=!0);var f;c&&(f=!0,c&&(a=a.replace(Ra,function(a,b){return" > "+b})));a=a.replace(Sa,function(a,b,c){return'[dir="'+c+'"] '+b+", "+b+'[dir="'+c+'"]'});return{value:a,H:b,stop:f}}function Qa(a,b){a=a.split(Ta);a[0]+=b;return a.join(Ta)}
function Pa(a,b){var c=a.match(Ua);return(c=c&&c[2].trim()||"")?c[0].match(Va)?a.replace(Ua,function(a,c,f){return b+f}):c.split(Va)[0]===b?c:Wa:a.replace(La,b)}function Xa(a){a.selector===Ya&&(a.selector="html")}H.prototype.c=function(a){return a.match(Oa)?this.b(a,Za):Qa(a.trim(),Za)};aa.Object.defineProperties(H.prototype,{a:{configurable:!0,enumerable:!0,get:function(){return"style-scope"}}});
var Ja=/:(nth[-\w]+)\(([^)]+)\)/,Za=":not(.style-scope)",Ia=",",Ma=/(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g,Va=/[[.:#*]/,La=":host",Ya=":root",Oa="::slotted",Ka=new RegExp("^("+Oa+")"),Ua=/(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,Ra=/(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,Sa=/(.*):dir\((?:(ltr|rtl))\)/,Ha=".",Ta=":",Fa="class",Wa="should_not_match",J=new H;function $a(){}
if(!v){var ab=function(a){for(var b=0;b<a.length;b++){var c=a[b];if(c.target!==document.documentElement&&c.target!==document.head){for(var e=0;e<c.addedNodes.length;e++){var d=c.addedNodes[e];if(d.classList&&!d.classList.contains(J.a)||d instanceof window.SVGElement&&(!d.hasAttribute("class")||0>d.getAttribute("class").indexOf(J.a))){var f=d.getRootNode();f.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&(f=f.host)&&(f=E(f).is,I(d,f))}}for(e=0;e<c.removedNodes.length;e++)if(d=c.removedNodes[e],d.nodeType===
Node.ELEMENT_NODE&&(f=void 0,d.classList?f=Array.from(d.classList):d.hasAttribute("class")&&(f=d.getAttribute("class").split(/\s+/)),f)){var g=f.indexOf(J.a);0<=g&&(f=f[g+1])&&I(d,f,!0)}}}},bb=new MutationObserver(ab),cb=function(a){bb.observe(a,{childList:!0,subtree:!0})};if(window.a&&!window.customElements.flush)cb(document);else{var db=function(){cb(document.body)};window.HTMLImports?window.HTMLImports.whenReady(db):requestAnimationFrame(function(){if("loading"===document.readyState){var a=function(){db();
document.removeEventListener("readystatechange",a)};document.addEventListener("readystatechange",a)}else db()})}$a=function(){ab(bb.takeRecords())}}var eb=$a;function O(a,b,c,e,d){this.j=a||null;this.b=b||null;this.B=c||[];this.s=null;this.u=d||"";this.a=this.h=this.m=null}function P(a){return a?a.__styleInfo:null}function fb(a,b){return a.__styleInfo=b}O.prototype.c=function(){return this.j};O.prototype._getStyleRules=O.prototype.c;var Q=window.Element.prototype,gb=Q.matches||Q.matchesSelector||Q.mozMatchesSelector||Q.msMatchesSelector||Q.oMatchesSelector||Q.webkitMatchesSelector,hb=navigator.userAgent.match("Trident");function ib(){}function jb(a){var b={},c=[],e=0;z(a,function(a){R(a);a.index=e++;a=a.f.cssText;for(var c;c=ua.exec(a);){var d=c[1];":"!==c[2]&&(b[d]=!0)}},function(a){c.push(a)});a.b=c;a=[];for(var d in b)a.push(d);return a}
function R(a){if(!a.f){var b={},c={};S(a,c)&&(b.i=c,a.rules=null);b.cssText=a.parsedCssText.replace(xa,"").replace(sa,"");a.f=b}}function S(a,b){var c=a.f;if(c){if(c.i)return Object.assign(b,c.i),!0}else{for(var c=a.parsedCssText,e;a=sa.exec(c);){e=(a[2]||a[3]).trim();if("inherit"!==e||"unset"!==e)b[a[1].trim()]=e;e=!0}return e}}
function T(a,b,c){b&&(b=0<=b.indexOf(";")?kb(a,b,c):Ba(b,function(b,d,f,g){if(!d)return b+g;(d=T(a,c[d],c))&&"initial"!==d?"apply-shim-inherit"===d&&(d="inherit"):d=T(a,c[f]||f,c)||f;return b+(d||"")+g}));return b&&b.trim()||""}
function kb(a,b,c){b=b.split(";");for(var e=0,d,f;e<b.length;e++)if(d=b[e]){ta.lastIndex=0;if(f=ta.exec(d))d=T(a,c[f[1]],c);else if(f=d.indexOf(":"),-1!==f){var g=d.substring(f),g=g.trim(),g=T(a,g,c)||g;d=d.substring(0,f)+g}b[e]=d&&d.lastIndexOf(";")===d.length-1?d.slice(0,-1):d||""}return b.join(";")}
function lb(a,b){var c={},e=[];z(a,function(a){a.f||R(a);var d=a.g||a.parsedSelector;b&&a.f.i&&d&&gb.call(b,d)&&(S(a,c),a=a.index,d=parseInt(a/32,10),e[d]=(e[d]||0)|1<<a%32)},null,!0);return{i:c,key:e}}
function mb(a,b,c,e,d){c.f||R(c);if(c.f.i){b=E(b);a=b.is;b=b.u;b=a?L(a,b):"html";var f=c.parsedSelector,g=":host > *"===f||"html"===f,h=0===f.indexOf(":host")&&!g;"shady"===e&&(g=f===b+" > *."+b||-1!==f.indexOf("html"),h=!g&&0===f.indexOf(b));"shadow"===e&&(g=":host > *"===f||"html"===f,h=h&&!g);if(g||h)e=b,h&&(v&&!c.g&&(c.g=N(J,c,J.b,a?Ha+a:"",b)),e=c.g||b),d({M:e,K:h,S:g})}}
function nb(a,b){var c={},e={},d=U,f=b&&b.__cssBuild;z(b,function(b){mb(d,a,b,f,function(d){gb.call(a.A||a,d.M)&&(d.K?S(b,c):S(b,e))})},null,!0);return{L:e,J:c}}
function ob(a,b,c,e){var d=E(b),f=L(d.is,d.u),g=new RegExp("(?:^|[^.#[:])"+(b.extends?"\\"+f.slice(0,-1)+"\\]":f)+"($|[.:[\\s>+~])"),d=P(b).j,h=pb(d,e);return K(b,d,function(b){var d="";b.f||R(b);b.f.cssText&&(d=kb(a,b.f.cssText,c));b.cssText=d;if(!v&&!za(b)&&b.cssText){var k=d=b.cssText;null==b.C&&(b.C=va.test(d));if(b.C)if(null==b.w){b.w=[];for(var q in h)k=h[q],k=k(d),d!==k&&(d=k,b.w.push(q))}else{for(q=0;q<b.w.length;++q)k=h[b.w[q]],d=k(d);k=d}b.cssText=k;b.g=b.g||b.selector;d="."+e;q=b.g.split(",");
for(var k=0,vb=q.length,M;k<vb&&(M=q[k]);k++)q[k]=M.match(g)?M.replace(f,d):d+" "+M;b.selector=q.join(",")}})}function pb(a,b){a=a.b;var c={};if(!v&&a)for(var e=0,d=a[e];e<a.length;d=a[++e]){var f=d,g=b;f.l=new RegExp(f.keyframesName,"g");f.a=f.keyframesName+"-"+g;f.g=f.g||f.selector;f.selector=f.g.replace(f.keyframesName,f.a);c[d.keyframesName]=qb(d)}return c}function qb(a){return function(b){return b.replace(a.l,a.a)}}
function rb(a,b){var c=U,e=A(a);a.textContent=y(e,function(a){var d=a.cssText=a.parsedCssText;a.f&&a.f.cssText&&(d=d.replace(la,"").replace(ma,""),a.cssText=kb(c,d,b))})}aa.Object.defineProperties(ib.prototype,{a:{configurable:!0,enumerable:!0,get:function(){return"x-scope"}}});var U=new ib;var sb={},V=window.customElements;if(V&&!v){var tb=V.define;V.define=function(a,b,c){var e=document.createComment(" Shady DOM styles for "+a+" "),d=document.head;d.insertBefore(e,(C?C.nextSibling:null)||d.firstChild);C=e;sb[a]=e;return tb.call(V,a,b,c)}};var W=new function(){this.cache={};this.a=100};function X(){var a=this;this.A={};this.c=document.documentElement;var b=new n;b.rules=[];this.l=fb(this.c,new O(b));this.v=!1;this.a=this.b=null;Da(function(){Y(a)})}l=X.prototype;l.F=function(){eb()};l.I=function(a){return A(a)};l.O=function(a){return y(a)};
l.prepareTemplate=function(a,b,c){if(!a.l){a.l=!0;a.name=b;a.extends=c;m[b]=a;var e;e=(e=a.content.querySelector("style"))?e.getAttribute("css-build")||"":"";var d;d=a.content.querySelectorAll("style");for(var f=[],g=0;g<d.length;g++){var h=d[g];f.push(h.textContent);h.parentNode.removeChild(h)}d=f.join("").trim();c={is:b,extends:c,P:e};v||I(a.content,b);Y(this);f=this.b.detectMixin(d);d=p(d);f&&w&&this.b.transformRules(d,b);a._styleAst=d;a.v=e;e=[];w||(e=jb(a._styleAst));if(!e.length||w)d=v?a.content:
null,b=sb[b],f=K(c,a._styleAst),b=f.length?B(f,c.is,d,b):void 0,a.b=b;a.c=e}};function ub(a){if(!a.b)if(window.ShadyCSS.ApplyShim)a.b=window.ShadyCSS.ApplyShim,a.b.invalidCallback=qa;else{var b={};a.b=(b.detectMixin=function(){return!1},b.transformRule=function(){},b.transformRules=function(){},b)}}
function wb(a){if(!a.a)if(window.ShadyCSS.CustomStyleInterface)a.a=window.ShadyCSS.CustomStyleInterface,a.a.transformCallback=function(b){a.D(b)},a.a.validateCallback=function(){requestAnimationFrame(function(){(a.a.enqueued||a.v)&&a.o()})};else{var b={};a.a=(b.processStyles=function(){},b.enqueued=!1,b.getStyleForCustomStyle=function(){return null},b)}}function Y(a){ub(a);wb(a)}
l.o=function(){Y(this);var a=this.a.processStyles();if(this.a.enqueued){if(w)for(var b=0;b<a.length;b++){var c=this.a.getStyleForCustomStyle(a[b]);if(c&&w){var e=A(c);Y(this);this.b.transformRules(e);c.textContent=y(e)}}else for(xb(this,this.c,this.l),b=0;b<a.length;b++)(c=this.a.getStyleForCustomStyle(a[b]))&&rb(c,this.l.m);this.a.enqueued=!1;this.v&&!w&&this.styleDocument()}};
l.styleElement=function(a,b){var c=E(a).is,e=P(a);if(!e){var d=E(a),e=d.is,d=d.u,f=sb[e],e=m[e],g,h;e&&(g=e._styleAst,h=e.c);e=fb(a,new O(g,f,h,0,d))}a!==this.c&&(this.v=!0);b&&(e.s=e.s||{},Object.assign(e.s,b));if(w){if(e.s){b=e.s;for(var k in b)null===k?a.style.removeProperty(k):a.style.setProperty(k,b[k])}((k=m[c])||a===this.c)&&k&&k.b&&k._applyShimInvalid&&(k.a||(Y(this),this.b.transformRules(k._styleAst,c),k.b.textContent=K(a,e.j),ra(k)),v&&(c=a.shadowRoot)&&(c.querySelector("style").textContent=
K(a,e.j)),e.j=k._styleAst)}else if(xb(this,a,e),e.B&&e.B.length){c=e;k=E(a).is;a:{if(b=W.cache[k])for(g=b.length-1;0<=g;g--){h=b[g];b:{e=c.B;for(d=0;d<e.length;d++)if(f=e[d],h.i[f]!==c.m[f]){e=!1;break b}e=!0}if(e){b=h;break a}}b=void 0}e=b?b.styleElement:null;g=c.h;(h=b&&b.h)||(h=this.A[k]=(this.A[k]||0)+1,h=k+"-"+h);c.h=h;h=c.h;var d=U,d=e?e.textContent||"":ob(d,a,c.m,h),f=P(a),x=f.a;x&&!v&&x!==e&&(x._useCount--,0>=x._useCount&&x.parentNode&&x.parentNode.removeChild(x));v?f.a?(f.a.textContent=d,
e=f.a):d&&(e=B(d,h,a.shadowRoot,f.b)):e?e.parentNode||Aa(e,null,f.b):d&&(e=B(d,h,null,f.b));e&&(e._useCount=e._useCount||0,f.a!=e&&e._useCount++,f.a=e);hb&&(e.textContent=e.textContent);h=e;v||(e=c.h,f=d=a.getAttribute("class")||"",g&&(f=d.replace(new RegExp("\\s*x-scope\\s*"+g+"\\s*","g")," ")),f+=(f?" ":"")+"x-scope "+e,d!==f&&D(a,f));b||(a=W.cache[k]||[],a.push({i:c.m,styleElement:h,h:c.h}),a.length>W.a&&a.shift(),W.cache[k]=a)}};
function yb(a,b){return(b=b.getRootNode().host)?P(b)?b:yb(a,b):a.c}function xb(a,b,c){a=yb(a,b);var e=P(a);a=Object.create(e.m||null);var d=nb(b,c.j);b=lb(e.j,b).i;Object.assign(a,d.J,b,d.L);b=c.s;for(var f in b)if((d=b[f])||0===d)a[f]=d;f=U;b=Object.getOwnPropertyNames(a);for(d=0;d<b.length;d++)e=b[d],a[e]=T(f,a[e],a);c.m=a}l.styleDocument=function(a){this.styleSubtree(this.c,a)};
l.styleSubtree=function(a,b){var c=a.shadowRoot;(c||a===this.c)&&this.styleElement(a,b);if(b=c&&(c.children||c.childNodes))for(a=0;a<b.length;a++)this.styleSubtree(b[a]);else if(a=a.children||a.childNodes)for(b=0;b<a.length;b++)this.styleSubtree(a[b])};l.D=function(a){var b=this,c=A(a);z(c,function(a){if(v)Xa(a);else{var c=J;a.selector=a.parsedSelector;Xa(a);a.selector=a.g=N(c,a,c.c,void 0,void 0)}w&&(Y(b),b.b.transformRule(a))});w?a.textContent=y(c):this.l.j.rules.push(c)};
l.getComputedStyleValue=function(a,b){var c;w||(c=(P(a)||P(yb(this,a))).m[b]);return(c=c||window.getComputedStyle(a).getPropertyValue(b))?c.trim():""};l.N=function(a,b){var c=a.getRootNode();b=b?b.split(/\s/):[];c=c.host&&c.host.localName;if(!c){var e=a.getAttribute("class");if(e)for(var e=e.split(/\s/),d=0;d<e.length;d++)if(e[d]===J.a){c=e[d+1];break}}c&&b.push(J.a,c);w||(c=P(a))&&c.h&&b.push(U.a,c.h);D(a,b.join(" "))};l.G=function(a){return P(a)};X.prototype.flush=X.prototype.F;
X.prototype.prepareTemplate=X.prototype.prepareTemplate;X.prototype.styleElement=X.prototype.styleElement;X.prototype.styleDocument=X.prototype.styleDocument;X.prototype.styleSubtree=X.prototype.styleSubtree;X.prototype.getComputedStyleValue=X.prototype.getComputedStyleValue;X.prototype.setElementClass=X.prototype.N;X.prototype._styleInfoForNode=X.prototype.G;X.prototype.transformCustomStyleForDocument=X.prototype.D;X.prototype.getStyleAst=X.prototype.I;X.prototype.styleAstToString=X.prototype.O;
X.prototype.flushCustomStyles=X.prototype.o;Object.defineProperties(X.prototype,{nativeShadow:{get:function(){return v}},nativeCss:{get:function(){return w}}});var Z=new X,zb,Ab;window.ShadyCSS&&(zb=window.ShadyCSS.ApplyShim,Ab=window.ShadyCSS.CustomStyleInterface);window.ShadyCSS={ScopingShim:Z,prepareTemplate:function(a,b,c){Z.o();Z.prepareTemplate(a,b,c)},styleSubtree:function(a,b){Z.o();Z.styleSubtree(a,b)},styleElement:function(a){Z.o();Z.styleElement(a)},styleDocument:function(a){Z.o();Z.styleDocument(a)},getComputedStyleValue:function(a,b){return Z.getComputedStyleValue(a,b)},nativeCss:w,nativeShadow:v};zb&&(window.ShadyCSS.ApplyShim=zb);
Ab&&(window.ShadyCSS.CustomStyleInterface=Ab);
}).call(self)

//# sourceMappingURL=scoping-shim.min.js.map

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ }),
/* 20 */
/***/ (function(module, exports) {

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
(function() {

  var needsTemplate = (typeof HTMLTemplateElement === 'undefined');

  // NOTE: Patch document.importNode to work around IE11 bug that
  // casues children of a document fragment imported while
  // there is a mutation observer to not have a parentNode (!?!)
  // It's important that this is the first patch to `importNode` so that
  // dom produced for later patches is correct.
  if (/Trident/.test(navigator.userAgent)) {
    (function() {
      var Native_importNode = Document.prototype.importNode;
      Document.prototype.importNode = function() {
        var n = Native_importNode.apply(this, arguments);
        // Copy all children to a new document fragment since
        // this one may be broken
        if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          var f = this.createDocumentFragment();
          f.appendChild(n);
          return f;
        } else {
          return n;
        }
      };
    })();
  }

  // NOTE: we rely on this cloneNode not causing element upgrade.
  // This means this polyfill must load before the CE polyfill and
  // this would need to be re-worked if a browser supports native CE
  // but not <template>.
  var Native_cloneNode = Node.prototype.cloneNode;
  var Native_createElement = Document.prototype.createElement;
  var Native_importNode = Document.prototype.importNode;

  // returns true if nested templates cannot be cloned (they cannot be on
  // some impl's like Safari 8 and Edge)
  // OR if cloning a document fragment does not result in a document fragment
  var needsCloning = (function() {
    if (!needsTemplate) {
      var t = document.createElement('template');
      var t2 = document.createElement('template');
      t2.content.appendChild(document.createElement('div'));
      t.content.appendChild(t2);
      var clone = t.cloneNode(true);
      return (clone.content.childNodes.length === 0 || clone.content.firstChild.content.childNodes.length === 0
        || !(document.createDocumentFragment().cloneNode() instanceof DocumentFragment));
    }
  })();

  var TEMPLATE_TAG = 'template';
  var PolyfilledHTMLTemplateElement = function() {};

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
    var canProtoPatch =
      !(document.createElement('div').hasOwnProperty('innerHTML'));

    /**
      The `decorate` method moves element children to the template's `content`.
      NOTE: there is no support for dynamically adding elements to templates.
    */
    PolyfilledHTMLTemplateElement.decorate = function(template) {
      // if the template is decorated, return fast
      if (template.content) {
        return;
      }
      template.content = contentDoc.createDocumentFragment();
      var child;
      while (child = template.firstChild) {
        template.content.appendChild(child);
      }
      // NOTE: prefer prototype patching for performance and
      // because on some browsers (IE11), re-defining `innerHTML`
      // can result in intermittent errors.
      if (canProtoPatch) {
        template.__proto__ = PolyfilledHTMLTemplateElement.prototype;
      } else {
        template.cloneNode = function(deep) {
          return PolyfilledHTMLTemplateElement._cloneNode(this, deep);
        };
        // add innerHTML to template, if possible
        // Note: this throws on Safari 7
        if (canDecorate) {
          try {
            defineInnerHTML(template);
          } catch (err) {
            canDecorate = false;
          }
        }
      }
      // bootstrap recursively
      PolyfilledHTMLTemplateElement.bootstrap(template.content);
    };

    function defineInnerHTML(obj) {
      Object.defineProperty(obj, 'innerHTML', {
        get: function() {
          var o = '';
          for (var e = this.content.firstChild; e; e = e.nextSibling) {
            o += e.outerHTML || escapeData(e.data);
          }
          return o;
        },
        set: function(text) {
          contentDoc.body.innerHTML = text;
          PolyfilledHTMLTemplateElement.bootstrap(contentDoc);
          while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
          }
          while (contentDoc.body.firstChild) {
            this.content.appendChild(contentDoc.body.firstChild);
          }
        },
        configurable: true
      });
    }

    defineInnerHTML(PolyfilledHTMLTemplateElement.prototype);

    /**
      The `bootstrap` method is called automatically and "fixes" all
      <template> elements in the document referenced by the `doc` argument.
    */
    PolyfilledHTMLTemplateElement.bootstrap = function(doc) {
      var templates = doc.querySelectorAll(TEMPLATE_TAG);
      for (var i=0, l=templates.length, t; (i<l) && (t=templates[i]); i++) {
        PolyfilledHTMLTemplateElement.decorate(t);
      }
    };

    // auto-bootstrapping for main document
    document.addEventListener('DOMContentLoaded', function() {
      PolyfilledHTMLTemplateElement.bootstrap(document);
    });

    // Patch document.createElement to ensure newly created templates have content
    Document.prototype.createElement = function() {
      'use strict';
      var el = Native_createElement.apply(this, arguments);
      if (el.localName === 'template') {
        PolyfilledHTMLTemplateElement.decorate(el);
      }
      return el;
    };

    var escapeDataRegExp = /[&\u00A0<>]/g;

    function escapeReplace(c) {
      switch (c) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '\u00A0':
          return '&nbsp;';
      }
    }

    function escapeData(s) {
      return s.replace(escapeDataRegExp, escapeReplace);
    }
  }

  // make cloning/importing work!
  if (needsTemplate || needsCloning) {

    PolyfilledHTMLTemplateElement._cloneNode = function(template, deep) {
      var clone = Native_cloneNode.call(template, false);
      // NOTE: decorate doesn't auto-fix children because they are already
      // decorated so they need special clone fixup.
      if (this.decorate) {
        this.decorate(clone);
      }
      if (deep) {
        // NOTE: use native clone node to make sure CE's wrapped
        // cloneNode does not cause elements to upgrade.
        clone.content.appendChild(
            Native_cloneNode.call(template.content, true));
        // now ensure nested templates are cloned correctly.
        this.fixClonedDom(clone.content, template.content);
      }
      return clone;
    };

    PolyfilledHTMLTemplateElement.prototype.cloneNode = function(deep) {
      return PolyfilledHTMLTemplateElement._cloneNode(this, deep);
    }

    // Given a source and cloned subtree, find <template>'s in the cloned
    // subtree and replace them with cloned <template>'s from source.
    // We must do this because only the source templates have proper .content.
    PolyfilledHTMLTemplateElement.fixClonedDom = function(clone, source) {
      // do nothing if cloned node is not an element
      if (!source.querySelectorAll) return;
      // these two lists should be coincident
      var s$ = source.querySelectorAll(TEMPLATE_TAG);
      var t$ = clone.querySelectorAll(TEMPLATE_TAG);
      for (var i=0, l=t$.length, t, s; i<l; i++) {
        s = s$[i];
        t = t$[i];
        if (this.decorate) {
          this.decorate(s);
        }
        t.parentNode.replaceChild(s.cloneNode(true), t);
      }
    };

    // override all cloning to fix the cloned subtree to contain properly
    // cloned templates.
    Node.prototype.cloneNode = function(deep) {
      var dom;
      // workaround for Edge bug cloning documentFragments
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8619646/
      if (this instanceof DocumentFragment) {
        if (!deep) {
          return this.ownerDocument.createDocumentFragment();
        } else {
          dom = this.ownerDocument.importNode(this, true);
        }
      } else {
        dom = Native_cloneNode.call(this, deep);
      }
      // template.content is cloned iff `deep`.
      if (deep) {
        PolyfilledHTMLTemplateElement.fixClonedDom(dom, this);
      }
      return dom;
    };

    // NOTE: we are cloning instead of importing <template>'s.
    // However, the ownerDocument of the cloned template will be correct!
    // This is because the native import node creates the right document owned
    // subtree and `fixClonedDom` inserts cloned templates into this subtree,
    // thus updating the owner doc.
    Document.prototype.importNode = function(element, deep) {
      if (element.localName === TEMPLATE_TAG) {
        return PolyfilledHTMLTemplateElement._cloneNode(element, deep);
      } else {
        var dom = Native_importNode.call(this, element, deep);
        if (deep) {
          PolyfilledHTMLTemplateElement.fixClonedDom(dom, element);
        }
        return dom;
      }
    };

    if (needsCloning) {
      window.HTMLTemplateElement.prototype.cloneNode = function(deep) {
        return PolyfilledHTMLTemplateElement._cloneNode(this, deep);
      };
    }
  }

  if (needsTemplate) {
    window.HTMLTemplateElement = PolyfilledHTMLTemplateElement;
  }

})();


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var define = __webpack_require__(0);

var implementation = __webpack_require__(3);
var getPolyfill = __webpack_require__(4);
var shim = __webpack_require__(22);

// eslint-disable-next-line no-unused-vars
var boundFromShim = function from(array) {
    // eslint-disable-next-line no-invalid-this
	return implementation.apply(this || Array, arguments);
};

define(boundFromShim, {
	'getPolyfill': getPolyfill,
	'implementation': implementation,
	'shim': shim
});

module.exports = boundFromShim;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var define = __webpack_require__(0);
var getPolyfill = __webpack_require__(4);

module.exports = function shimArrayFrom() {
	var polyfill = getPolyfill();

	define(Array, { 'from': polyfill }, {
		'from': function () {
			return Array.from !== polyfill;
		}
	});

	return polyfill;
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

window.customElements && eval("/**\n * @license\n * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.\n * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt\n * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt\n * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt\n * Code distributed by Google as part of the polymer project is also\n * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt\n */\n\n/**\n * This shim allows elements written in, or compiled to, ES5 to work on native\n * implementations of Custom Elements.\n *\n * ES5-style classes don't work with native Custom Elements because the\n * HTMLElement constructor uses the value of `new.target` to look up the custom\n * element definition for the currently called constructor. `new.target` is only\n * set when `new` is called and is only propagated via super() calls. super()\n * is not emulatable in ES5. The pattern of `SuperClass.call(this)`` only works\n * when extending other ES5-style classes, and does not propagate `new.target`.\n *\n * This shim allows the native HTMLElement constructor to work by generating and\n * registering a stand-in class instead of the users custom element class. This\n * stand-in class's constructor has an actual call to super().\n * `customElements.define()` and `customElements.get()` are both overridden to\n * hide this stand-in class from users.\n *\n * In order to create instance of the user-defined class, rather than the stand\n * in, the stand-in's constructor swizzles its instances prototype and invokes\n * the user-defined constructor. When the user-defined constructor is called\n * directly it creates an instance of the stand-in class to get a real extension\n * of HTMLElement and returns that.\n *\n * There are two important constructors: A patched HTMLElement constructor, and\n * the StandInElement constructor. They both will be called to create an element\n * but which is called first depends on whether the browser creates the element\n * or the user-defined constructor is called directly. The variables\n * `browserConstruction` and `userConstruction` control the flow between the\n * two constructors.\n *\n * This shim should be better than forcing the polyfill because:\n *   1. It's smaller\n *   2. All reaction timings are the same as native (mostly synchronous)\n *   3. All reaction triggering DOM operations are automatically supported\n *\n * There are some restrictions and requirements on ES5 constructors:\n *   1. All constructors in a inheritance hierarchy must be ES5-style, so that\n *      they can be called with Function.call(). This effectively means that the\n *      whole application must be compiled to ES5.\n *   2. Constructors must return the value of the emulated super() call. Like\n *      `return SuperClass.call(this)`\n *   3. The `this` reference should not be used before the emulated super() call\n *      just like `this` is illegal to use before super() in ES6.\n *   4. Constructors should not create other custom elements before the emulated\n *      super() call. This is the same restriction as with native custom\n *      elements.\n *\n *  Compiling valid class-based custom elements to ES5 will satisfy these\n *  requirements with the latest version of popular transpilers.\n */\n(() => {\n  'use strict';\n\n  const NativeHTMLElement = window.HTMLElement;\n  const nativeDefine = window.customElements.define;\n  const nativeGet = window.customElements.get;\n\n  /**\n   * Map of user-provided constructors to tag names.\n   *\n   * @type {Map<Function, string>}\n   */\n  const tagnameByConstructor = new Map();\n\n  /**\n   * Map of tag names to user-provided constructors.\n   *\n   * @type {Map<string, Function>}\n   */\n  const constructorByTagname = new Map();\n\n\n  /**\n   * Whether the constructors are being called by a browser process, ie parsing\n   * or createElement.\n   */\n  let browserConstruction = false;\n\n  /**\n   * Whether the constructors are being called by a user-space process, ie\n   * calling an element constructor.\n   */\n  let userConstruction = false;\n\n  window.HTMLElement = function() {\n    if (!browserConstruction) {\n      const tagname = tagnameByConstructor.get(this.constructor);\n      const fakeClass = nativeGet.call(window.customElements, tagname);\n\n      // Make sure that the fake constructor doesn't call back to this constructor\n      userConstruction = true;\n      const instance = new (fakeClass)();\n      return instance;\n    }\n    // Else do nothing. This will be reached by ES5-style classes doing\n    // HTMLElement.call() during initialization\n    browserConstruction = false;\n  };\n  // By setting the patched HTMLElement's prototype property to the native\n  // HTMLElement's prototype we make sure that:\n  //     document.createElement('a') instanceof HTMLElement\n  // works because instanceof uses HTMLElement.prototype, which is on the\n  // ptototype chain of built-in elements.\n  window.HTMLElement.prototype = NativeHTMLElement.prototype;\n\n  window.customElements.define = (tagname, elementClass) => {\n    const elementProto = elementClass.prototype;\n    const StandInElement = class extends NativeHTMLElement {\n      constructor() {\n        // Call the native HTMLElement constructor, this gives us the\n        // under-construction instance as `this`:\n        super();\n\n        // The prototype will be wrong up because the browser used our fake\n        // class, so fix it:\n        Object.setPrototypeOf(this, elementProto);\n\n        if (!userConstruction) {\n          // Make sure that user-defined constructor bottom's out to a do-nothing\n          // HTMLElement() call\n          browserConstruction = true;\n          // Call the user-defined constructor on our instance:\n          elementClass.call(this);\n        }\n        userConstruction = false;\n      }\n    };\n    const standInProto = StandInElement.prototype;\n    StandInElement.observedAttributes = elementClass.observedAttributes;\n    standInProto.connectedCallback = elementProto.connectedCallback;\n    standInProto.disconnectedCallback = elementProto.disconnectedCallback;\n    standInProto.attributeChangedCallback = elementProto.attributeChangedCallback;\n    standInProto.adoptedCallback = elementProto.adoptedCallback;\n\n    tagnameByConstructor.set(elementClass, tagname);\n    constructorByTagname.set(tagname, elementClass);\n    nativeDefine.call(window.customElements, tagname, StandInElement);\n  };\n\n  window.customElements.get = (tagname) => constructorByTagname.get(tagname);\n\n})();");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

(function(){
/*

Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';function n(a,b){return{index:a,o:[],v:b}}
function aa(a,b,d,c){var e=0,h=0,g=0,f=0,k=Math.min(b-e,c-h);if(0==e&&0==h)a:{for(g=0;g<k;g++)if(a[g]!==d[g])break a;g=k}if(b==a.length&&c==d.length){for(var f=a.length,l=d.length,m=0;m<k-g&&ba(a[--f],d[--l]);)m++;f=m}e+=g;h+=g;b-=f;c-=f;if(!(b-e||c-h))return[];if(e==b){for(b=n(e,0);h<c;)b.o.push(d[h++]);return[b]}if(h==c)return[n(e,b-e)];k=e;g=h;c=c-g+1;f=b-k+1;b=Array(c);for(l=0;l<c;l++)b[l]=Array(f),b[l][0]=l;for(l=0;l<f;l++)b[0][l]=l;for(l=1;l<c;l++)for(m=1;m<f;m++)if(a[k+m-1]===d[g+l-1])b[l][m]=
b[l-1][m-1];else{var q=b[l-1][m]+1,y=b[l][m-1]+1;b[l][m]=q<y?q:y}k=b.length-1;g=b[0].length-1;c=b[k][g];for(a=[];0<k||0<g;)k?g?(f=b[k-1][g-1],l=b[k-1][g],m=b[k][g-1],q=l<m?l<f?l:f:m<f?m:f,q==f?(f==c?a.push(0):(a.push(1),c=f),k--,g--):q==l?(a.push(3),k--,c=l):(a.push(2),g--,c=m)):(a.push(3),k--):(a.push(2),g--);a.reverse();b=void 0;k=[];for(g=0;g<a.length;g++)switch(a[g]){case 0:b&&(k.push(b),b=void 0);e++;h++;break;case 1:b||(b=n(e,0));b.v++;e++;b.o.push(d[h]);h++;break;case 2:b||(b=n(e,0));b.v++;
e++;break;case 3:b||(b=n(e,0)),b.o.push(d[h]),h++}b&&k.push(b);return k}function ba(a,b){return a===b};var p=window.ShadyDOM||{};p.V=!(!Element.prototype.attachShadow||!Node.prototype.getRootNode);var t=Object.getOwnPropertyDescriptor(Node.prototype,"firstChild");p.l=!!(t&&t.configurable&&t.get);p.M=p.force||!p.V;function u(a){return"ShadyRoot"===a.P}function v(a){a=a.getRootNode();if(u(a))return a}var w=Element.prototype,ca=w.matches||w.matchesSelector||w.mozMatchesSelector||w.msMatchesSelector||w.oMatchesSelector||w.webkitMatchesSelector;
function x(a,b){if(a&&b)for(var d=Object.getOwnPropertyNames(b),c=0,e;c<d.length&&(e=d[c]);c++){var h=Object.getOwnPropertyDescriptor(b,e);h&&Object.defineProperty(a,e,h)}}function da(a,b){for(var d=[],c=1;c<arguments.length;++c)d[c-1]=arguments[c];for(c=0;c<d.length;c++)x(a,d[c]);return a}function ea(a,b){for(var d in b)a[d]=b[d]}var z=document.createTextNode(""),fa=0,A=[];(new MutationObserver(function(){for(;A.length;)try{A.shift()()}catch(a){throw z.textContent=fa++,a;}})).observe(z,{characterData:!0});
function ga(a){A.push(a);z.textContent=fa++};var B=[],D;function ha(a){D||(D=!0,ga(E));B.push(a)}function E(){D=!1;for(var a=!!B.length;B.length;)B.shift()();return a}E.list=B;function F(a,b){return void 0!==(a.a&&a.a[b])};var ia=/[&\u00A0"]/g,ja=/[&\u00A0<>]/g;function ka(a){switch(a){case "&":return"&amp;";case "<":return"&lt;";case ">":return"&gt;";case '"':return"&quot;";case "\u00a0":return"&nbsp;"}}function la(a){for(var b={},d=0;d<a.length;d++)b[a[d]]=!0;return b}var ma=la("area base br col command embed hr img input keygen link meta param source track wbr".split(" ")),na=la("style script xmp iframe noembed noframes plaintext noscript".split(" "));
function G(a,b){"template"===a.localName&&(a=a.content);for(var d="",c=b?b(a):a.childNodes,e=0,h=c.length,g;e<h&&(g=c[e]);e++){var f;a:{var k;f=g;k=a;var l=b;switch(f.nodeType){case Node.ELEMENT_NODE:for(var m=f.localName,q="<"+m,y=f.attributes,r=0;k=y[r];r++)q+=" "+k.name+'="'+k.value.replace(ia,ka)+'"';q+=">";f=ma[m]?q:q+G(f,l)+"</"+m+">";break a;case Node.TEXT_NODE:f=f.data;f=k&&na[k.localName]?f:f.replace(ja,ka);break a;case Node.COMMENT_NODE:f="\x3c!--"+f.data+"--\x3e";break a;default:throw window.console.error(f),
Error("not implemented");}}d+=f}return d};var I={},J=document.createTreeWalker(document,NodeFilter.SHOW_ALL,null,!1),K=document.createTreeWalker(document,NodeFilter.SHOW_ELEMENT,null,!1);function oa(a){var b=[];J.currentNode=a;for(a=J.firstChild();a;)b.push(a),a=J.nextSibling();b.item=function(a){return b[a]};return b}I.parentNode=function(a){J.currentNode=a;return J.parentNode()};I.firstChild=function(a){J.currentNode=a;return J.firstChild()};I.lastChild=function(a){J.currentNode=a;return J.lastChild()};
I.previousSibling=function(a){J.currentNode=a;return J.previousSibling()};I.nextSibling=function(a){J.currentNode=a;return J.nextSibling()};I.childNodes=oa;I.parentElement=function(a){K.currentNode=a;return K.parentNode()};I.firstElementChild=function(a){K.currentNode=a;return K.firstChild()};I.lastElementChild=function(a){K.currentNode=a;return K.lastChild()};I.previousElementSibling=function(a){K.currentNode=a;return K.previousSibling()};I.nextElementSibling=function(a){K.currentNode=a;return K.nextSibling()};
I.children=function(a){var b=[];K.currentNode=a;for(a=K.firstChild();a;)b.push(a),a=K.nextSibling();return b};I.innerHTML=function(a){return G(a,function(a){return oa(a)})};I.textContent=function(a){if(a.nodeType!==Node.ELEMENT_NODE)return a.nodeValue;a=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,null,!1);for(var b="",d;d=a.nextNode();)b+=d.nodeValue;return b};function L(a){return{get:function(){var b=this.a&&this.a[a];return void 0!==b?b:I[a](this)},configurable:!0}}
var M=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML")||Object.getOwnPropertyDescriptor(HTMLElement.prototype,"innerHTML"),O=document.implementation.createHTMLDocument("inert").createElement("div"),P=Object.getOwnPropertyDescriptor(Document.prototype,"activeElement"),pa={parentElement:L("parentElement"),parentNode:L("parentNode"),nextSibling:L("nextSibling"),previousSibling:L("previousSibling"),className:{get:function(){var a=this.getAttribute("class");return this.getAttribute("class")?
a:""},set:function(a){this.setAttribute("class",a)},configurable:!0},nextElementSibling:{get:function(){if(F(this,"nextSibling")){for(var a=this.nextSibling;a&&a.nodeType!==Node.ELEMENT_NODE;)a=a.nextSibling;return a}return I.nextElementSibling(this)},configurable:!0},previousElementSibling:{get:function(){if(F(this,"previousSibling")){for(var a=this.previousSibling;a&&a.nodeType!==Node.ELEMENT_NODE;)a=a.previousSibling;return a}return I.previousElementSibling(this)},configurable:!0}},Q={childNodes:{get:function(){if(F(this,
"firstChild")){if(!this.a.childNodes){this.a.childNodes=[];for(var a=this.firstChild;a;a=a.nextSibling)this.a.childNodes.push(a)}return this.a.childNodes}return I.childNodes(this)},configurable:!0},firstChild:L("firstChild"),lastChild:L("lastChild"),textContent:{get:function(){if(F(this,"firstChild")){for(var a=[],b=0,d=this.childNodes,c;c=d[b];b++)c.nodeType!==Node.COMMENT_NODE&&a.push(c.textContent);return a.join("")}return I.textContent(this)},set:function(a){if(this.nodeType!==Node.ELEMENT_NODE)this.nodeValue=
a;else{for(;this.firstChild;)this.removeChild(this.firstChild);a&&this.appendChild(document.createTextNode(a))}},configurable:!0},firstElementChild:{get:function(){if(F(this,"firstChild")){for(var a=this.firstChild;a&&a.nodeType!==Node.ELEMENT_NODE;)a=a.nextSibling;return a}return I.firstElementChild(this)},configurable:!0},lastElementChild:{get:function(){if(F(this,"lastChild")){for(var a=this.lastChild;a&&a.nodeType!==Node.ELEMENT_NODE;)a=a.previousSibling;return a}return I.lastElementChild(this)},
configurable:!0},children:{get:function(){return F(this,"firstChild")?Array.prototype.filter.call(this.childNodes,function(a){return a.nodeType===Node.ELEMENT_NODE}):I.children(this)},configurable:!0},innerHTML:{get:function(){var a="template"===this.localName?this.content:this;return F(this,"firstChild")?G(a):I.innerHTML(a)},set:function(a){for(var b="template"===this.localName?this.content:this;b.firstChild;)b.removeChild(b.firstChild);for(M&&M.set?M.set.call(O,a):O.innerHTML=a;O.firstChild;)b.appendChild(O.firstChild)},
configurable:!0}},qa={shadowRoot:{get:function(){return this.c},set:function(a){this.c=a},configurable:!0}},ra={activeElement:{get:function(){var a;a=P&&P.get?P.get.call(document):p.l?void 0:document.activeElement;if(a&&a.nodeType){var b=!!u(this);if(this===document||b&&this.host!==a&&this.host.contains(a)){for(b=v(a);b&&b!==this;)a=b.host,b=v(a);a=this===document?b?null:a:b===this?a:null}else a=null}else a=null;return a},set:function(){},configurable:!0}};
function R(a,b,d){for(var c in b){var e=Object.getOwnPropertyDescriptor(a,c);e&&e.configurable||!e&&d?Object.defineProperty(a,c,b[c]):d&&console.warn("Could not define",c,"on",a)}}function S(a){R(a,pa);R(a,Q);R(a,ra)}var sa=p.l?function(){}:function(a){a.a&&a.a.R||(a.a=a.a||{},a.a.R=!0,R(a,pa,!0))},ta=p.l?function(){}:function(a){a.a&&a.a.O||(a.a=a.a||{},a.a.O=!0,R(a,Q,!0),R(a,qa,!0))};function ua(a,b,d){sa(a);d=d||null;a.a=a.a||{};b.a=b.a||{};d&&(d.a=d.a||{});a.a.previousSibling=d?d.a.previousSibling:b.lastChild;var c=a.a.previousSibling;c&&c.a&&(c.a.nextSibling=a);(c=a.a.nextSibling=d)&&c.a&&(c.a.previousSibling=a);a.a.parentNode=b;d?d===b.a.firstChild&&(b.a.firstChild=a):(b.a.lastChild=a,b.a.firstChild||(b.a.firstChild=a));b.a.childNodes=null}
function T(a){if(!F(a,"firstChild")){a.a=a.a||{};a.a.firstChild=I.firstChild(a);a.a.lastChild=I.lastChild(a);ta(a);for(var b=a.a.childNodes=I.childNodes(a),d=0,c;d<b.length&&(c=b[d]);d++)c.a=c.a||{},c.a.parentNode=a,c.a.nextSibling=b[d+1]||null,c.a.previousSibling=b[d-1]||null,sa(c)}};var U={},va=Element.prototype.insertBefore,wa=Element.prototype.removeChild,xa=Element.prototype.setAttribute,ya=Element.prototype.removeAttribute,za=Element.prototype.cloneNode,Aa=Document.prototype.importNode,Ba=Element.prototype.addEventListener,Ca=Element.prototype.removeEventListener;U.appendChild=Element.prototype.appendChild;U.insertBefore=va;U.removeChild=wa;U.setAttribute=xa;U.removeAttribute=ya;U.cloneNode=za;U.importNode=Aa;U.addEventListener=Ba;U.removeEventListener=Ca;var Da="function"===typeof Event?Event:function(a,b){b=b||{};var d=document.createEvent("Event");d.initEvent(a,!!b.bubbles,!!b.cancelable);return d};function Ea(a){this.s=a;this.A="slot"}
Ea.prototype.I=function(){var a;if(V(this.s)){a=[];for(var b=0,d=this.s.host.firstChild;d;d=d.nextSibling)a[b++]=d;for(var b=[],d=Fa(this.s),c=0,e=d.length,h;c<e&&(h=d[c]);c++){var g=void 0,f,k=h,l=a,m=k.a.assignedNodes;m&&Ga(k,!0);k.a.assignedNodes=[];for(var q=!1,y=!1,r=0,N=l.length;r<N;r++){f=l[r];var C;if(C=f){var H=f;C=(C=k.getAttribute("name"))?C.trim():"";H=(H=H.getAttribute&&H.getAttribute("slot"))?H.trim():"";C=H==C}C&&(f.a.H!=k&&(q=!0),y=k,y.a.assignedNodes.push(f),f.a.assignedSlot=y,l[r]=
void 0,y=!0)}if(!y)for(l=k.childNodes,r=0;r<l.length;r++)f=l[r],f.a.H!=k&&(q=!0),N=k,N.a.assignedNodes.push(f),f.a.assignedSlot=N;if(m){for(f=0;f<m.length;f++)m[f].a.H=null;k.a.assignedNodes.length<m.length&&(q=!0)}m=k.a.assignedNodes;k.a.j=[];for(f=0;f<m.length&&(g=m[f]);f++)if(g.localName&&"slot"==g.localName){if(l=g.a.j)for(r=0;r<l.length;r++)k.a.j.push(l[r])}else k.a.j.push(m[f]);q&&Ha(this,k);(g=h.parentNode)&&g.c&&V(g.c)&&b.push(g.c)}for(d=0;d<a.length;d++)if(h=a[d])h.a=h.a||{},h.a.assignedSlot=
void 0,(c=I.parentNode(h))&&U.removeChild.call(c,h);a=b}else a=[];return a};function Ga(a,b){var d=a.a.assignedNodes;if(d)for(var c=0;c<d.length;c++){var e=d[c];b&&(e.a.H=e.a.assignedSlot);e.a.assignedSlot===a&&(e.a.assignedSlot=null)}}function Ha(a,b){b.dispatchEvent(new Da("slotchange"));b.a.assignedSlot&&Ha(a,b.a.assignedSlot)}Ea.prototype.B=function(a){return!a.a.assignedSlot};var Ia={};function W(a,b){if(a!==Ia)throw new TypeError("Illegal constructor");a=document.createDocumentFragment();a.__proto__=W.prototype;a.P="ShadyRoot";T(b);T(a);b.shadowRoot=a;a.host=b;a.i=!1;a.G=!1;a.h=new Ea(a);a.update();return a}W.prototype=Object.create(DocumentFragment.prototype);W.prototype.update=function(){var a=this;this.i||(this.i=!0,ha(function(){return Ja(a)}))};
function Ja(a){if(a.i){for(var b=a;a;){a.i&&(b=a);a:{var d;d=a;a=d.host.getRootNode();if(u(a))for(var c=d.host.childNodes,e=0;e<c.length;e++)if(d=c[e],d.localName&&"slot"==d.localName)break a;a=void 0}}b._render()}}W.prototype._render=function(){this.G=this.i=!1;this.u||Ka(this);this.u=!1;this.I();La(this.host,Ma(this,this.host));for(var a=Fa(this),b=0,d=a.length,c,e;b<d&&(c=a[b]);b++)e=c.parentNode,e!==this.host&&e!==this&&La(e,Ma(this,e))};W.prototype.I=function(){for(var a=this.h.I(),b=0;b<a.length;b++)a[b]._render()};
function Ka(a){var b=a.g;if(b)for(var d=0,c;d<b.length;d++)c=b[d],c.getRootNode()!==a&&Ga(c);b=a.g=a.h.s.querySelectorAll("slot");for(a=0;a<b.length;a++)c=b[a],c.a=c.a||{},T(c),T(c.parentNode)}function Ma(a,b){var d=[];b=(b.c||b).childNodes;for(var c=0;c<b.length;c++){var e=b[c];if(e.localName&&"slot"==e.localName)for(var h=e.a.j||(e.a.j=[]),g=0;g<h.length;g++){var f=h[g];a.B(e,f)&&d.push(f)}else d.push(e)}return d}W.prototype.B=function(a,b){return this.h.B(a,b)};
function La(a,b){for(var d=I.childNodes(a),c=aa(b,b.length,d,d.length),e=0,h=0,g;e<c.length&&(g=c[e]);e++){for(var f=0,k;f<g.o.length&&(k=g.o[f]);f++)I.parentNode(k)===a&&U.removeChild.call(a,k),d.splice(g.index+h,1);h-=g.v}for(e=0;e<c.length&&(g=c[e]);e++)for(h=d[g.index],f=g.index;f<g.index+g.v;f++)k=b[f],U.insertBefore.call(a,k,h),d.splice(f,0,k)}function V(a){return!(!a.g||!a.g.length)}function Fa(a){a.g||Ka(a);return a.g}var Na=W.prototype;R(Na,Q,!0);R(Na,ra,!0);function Oa(a){var b=F(a,"parentNode")&&a.a&&a.a.parentNode,d,c=v(a);if(b||c){d=Pa(a);if(b){a.a=a.a||{};b.a=b.a||{};a===b.a.firstChild&&(b.a.firstChild=a.a.nextSibling);a===b.a.lastChild&&(b.a.lastChild=a.a.previousSibling);var e=a.a.previousSibling,h=a.a.nextSibling;e&&(e.a=e.a||{},e.a.nextSibling=h);h&&(h.a=h.a||{},h.a.previousSibling=e);a.a.parentNode=a.a.previousSibling=a.a.nextSibling=void 0;F(b,"childNodes")&&(b.a.childNodes=null)}if(e=c){for(var g,e=Fa(c),h=0;h<e.length;h++){var f=e[h],k;a:{for(k=
f;k;){if(k==a){k=!0;break a}k=k.parentNode}k=void 0}if(k)for(f=f.assignedNodes({flatten:!0}),k=0;k<f.length;k++){g=!0;var l=f[k],m=I.parentNode(l);m&&U.removeChild.call(m,l)}}e=g}b=b&&c&&b.localName===c.h.A;if(e||b)c.u=!1,X(c)}Qa(a);return d}function Ra(a,b,d){if(a=a.a&&a.a.m)b&&a.addedNodes.push(b),d&&a.removedNodes.push(d),Sa(a)}function Ta(a){if(a&&a.nodeType){var b=a.D;void 0===b&&(u(a)?b=a:b=(b=a.parentNode)?Ta(b):a,document.documentElement.contains(a)&&(a.D=b));return b}}
function Ua(a,b,d){var c,e=d.h.A;if(a.nodeType!==Node.DOCUMENT_FRAGMENT_NODE||a.__noInsertionPoint)a.localName===e&&(T(b),T(a),c=!0);else for(var e=a.querySelectorAll(e),h=0,g,f;h<e.length&&(g=e[h]);h++)f=g.parentNode,f===a&&(f=b),f=Ua(g,f,d),c=c||f;return c}function Qa(a){if(void 0!==a.D)for(var b=a.childNodes,d=0,c=b.length,e;d<c&&(e=b[d]);d++)Qa(e);a.D=void 0}function Pa(a){if((a=a.parentNode)&&a.c&&V(a.c))return X(a.c),!0}function X(a){a.G=!0;a.update()}
function Va(a,b){"slot"===b?Pa(a):"slot"===a.localName&&"name"===b&&(a=v(a))&&a.update()}function Wa(a,b,d){var c=[];Xa(a.childNodes,b,d,c);return c}function Xa(a,b,d,c){for(var e=0,h=a.length,g;e<h&&(g=a[e]);e++){var f;if(f=g.nodeType===Node.ELEMENT_NODE){f=g;var k=b,l=d,m=c,q=k(f);q&&m.push(f);l&&l(q)?f=q:(Xa(f.childNodes,k,l,m),f=void 0)}if(f)break}}var Y=null;
function Ya(a,b,d){if(d){var c=d.a&&d.a.parentNode;if(void 0!==c&&c!==a||void 0===c&&I.parentNode(d)!==a)throw Error("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.");}if(d===b)return b;b.nodeType!==Node.DOCUMENT_FRAGMENT_NODE&&((c=b.a&&b.a.parentNode)?(Ra(c,null,b),Oa(b)):(b.parentNode&&U.removeChild.call(b.parentNode,b),Qa(b)));var c=d,e=v(a),h;e&&(b.__noInsertionPoint&&!e.G&&(e.u=!0),h=Ua(b,a,e))&&(e.u=!1);if(F(a,"firstChild"))if(ta(a),
a.a=a.a||{},F(a,"firstChild")&&(a.a.childNodes=null),b.nodeType===Node.DOCUMENT_FRAGMENT_NODE){for(var g=b.childNodes,f=0;f<g.length;f++)ua(g[f],a,c);b.a=b.a||{};g=F(b,"firstChild")?null:void 0;b.a.firstChild=b.a.lastChild=g;b.a.childNodes=g}else ua(b,a,c);var g=h,f=e&&e.h.A||"",k=b.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&!b.__noInsertionPoint&&f&&b.querySelector(f);h=k&&k.parentNode.nodeType!==Node.DOCUMENT_FRAGMENT_NODE;((k=k||b.localName===f)||a.localName===f||g)&&e&&X(e);(e=a&&a.c&&V(a.c))&&X(a.c);
if(!(e||k&&!h||a.c||c&&u(c.parentNode)&&c.parentNode.i)){if(d&&(c=v(d))){var l;if(d.localName===c.h.A)a:{c=d.assignedNodes({flatten:!0});e=Ta(d);h=0;for(g=c.length;h<g&&(l=c[h]);h++)if(e.B(d,l))break a;l=void 0}else l=d;d=l}l=u(a)?a.host:a;d?U.insertBefore.call(l,b,d):U.appendChild.call(l,b)}Ra(a,b);return b}
function Za(a,b){if(a.ownerDocument!==document)return U.importNode.call(document,a,b);var d=U.importNode.call(document,a,!1);if(b){a=a.childNodes;b=0;for(var c;b<a.length;b++)c=Za(a[b],!0),d.appendChild(c)}return d};function $a(){this.g=!1;this.addedNodes=[];this.removedNodes=[];this.w=new Set}function Sa(a){a.g||(a.g=!0,ga(function(){ab(a)}))}function ab(a){if(a.g){a.g=!1;var b=a.takeRecords();b.length&&a.w.forEach(function(a){a(b)})}}$a.prototype.takeRecords=function(){if(this.addedNodes.length||this.removedNodes.length){var a=[{addedNodes:this.addedNodes,removedNodes:this.removedNodes}];this.addedNodes=[];this.removedNodes=[];return a}return[]};
function bb(a,b){a.a=a.a||{};a.a.m||(a.a.m=new $a);a.a.m.w.add(b);var d=a.a.m;return{S:b,U:d,T:a,takeRecords:function(){return d.takeRecords()}}}function cb(a){var b=a&&a.U;b&&(b.w.delete(a.S),b.w.size||(a.T.a.m=null))}
function db(a,b){var d=b.getRootNode();return a.map(function(a){var b=d===a.target.getRootNode();if(b&&a.addedNodes){if(b=Array.from(a.addedNodes).filter(function(a){return d===a.getRootNode()}),b.length)return a=Object.create(a),Object.defineProperty(a,"addedNodes",{value:b,configurable:!0}),a}else if(b)return a}).filter(function(a){return a})};var eb={ma:!0,na:!0,click:!0,ea:!0,ta:!0,ua:!0,va:!0,wa:!0,xa:!0,ya:!0,za:!0,Na:!0,aa:!0,input:!0,pa:!0,ra:!0,ca:!0,da:!0,ba:!0,Ma:!0,Ka:!0,La:!0,Ja:!0,Ha:!0,Da:!0,Ca:!0,Fa:!0,Ia:!0,Ba:!0,Ga:!0,Ea:!0,oa:!0,sa:!0,ka:!0,fa:!0,ha:!0,ia:!0,ja:!0,la:!0,ga:!0,X:!0,Y:!0,Z:!0,qa:!0};
function fb(a,b){var d=[],c=a;for(a=a===window?window:a.getRootNode();c;)d.push(c),c=c.assignedSlot?c.assignedSlot:c.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&c.host&&(b||c!==a)?c.host:c.parentNode;d[d.length-1]===document&&d.push(window);return d}function gb(a,b){if(!u)return a;a=fb(a,!0);for(var d=0,c,e,h,g;d<b.length;d++)if(c=b[d],h=c===window?window:c.getRootNode(),h!==e&&(g=a.indexOf(h),e=h),!u(h)||-1<g)return c}
var hb={get composed(){!1!==this.isTrusted&&void 0===this.C&&(this.C=eb[this.type]);return this.C||!1},composedPath:function(){this.J||(this.J=fb(this.__target,this.composed));return this.J},get target(){return gb(this.currentTarget,this.composedPath())},get relatedTarget(){if(!this.K)return null;this.L||(this.L=fb(this.K,!0));return gb(this.currentTarget,this.L)},stopPropagation:function(){Event.prototype.stopPropagation.call(this);this.F=!0},stopImmediatePropagation:function(){Event.prototype.stopImmediatePropagation.call(this);
this.F=this.N=!0}};function ib(a){function b(b,c){b=new a(b,c);b.C=c&&!!c.composed;return b}ea(b,a);b.prototype=a.prototype;return b}var jb={focus:!0,blur:!0};function kb(a,b,d){if(d=b.f&&b.f[a.type]&&b.f[a.type][d])for(var c=0,e;(e=d[c])&&(e.call(b,a),!a.N);c++);}
function lb(a){var b=a.composedPath(),d;Object.defineProperty(a,"currentTarget",{get:function(){return d},configurable:!0});for(var c=b.length-1;0<=c;c--)if(d=b[c],kb(a,d,"capture"),a.F)return;Object.defineProperty(a,"eventPhase",{value:Event.AT_TARGET});for(var e,c=0;c<b.length;c++)if(d=b[c],!c||d.shadowRoot&&d.shadowRoot===e)if(kb(a,d,"bubble"),d!==window&&(e=d.getRootNode()),a.F)break}
function mb(){for(var a in jb)window.addEventListener(a,function(a){a.__target||(nb(a),lb(a),a.stopImmediatePropagation())},!0)}function nb(a){a.__target=a.target;a.K=a.relatedTarget;if(p.l){var b=Object.getPrototypeOf(a);if(!b.hasOwnProperty("__patchProto")){var d=Object.create(b);d.$=b;x(d,hb);b.__patchProto=d}a.__proto__=b.__patchProto}else x(a,hb)}var ob=ib(window.Event),pb=ib(window.CustomEvent),qb=ib(window.MouseEvent);function rb(a){var b=a.getRootNode();u(b)&&Ja(b);return a.a&&a.a.assignedSlot||null}
var sb={addEventListener:function(a,b,d){if(b){var c,e,h;"object"===typeof d?(c=!!d.capture,e=!!d.once,h=!!d.passive):(c=!!d,h=e=!1);if(b.b)for(var g=0;g<b.b.length;g++){if(b.b[g].node===this&&b.b[g].type===a&&b.b[g].capture===c&&b.b[g].once===e&&b.b[g].passive===h)return}else b.b=[];g=function(c){e&&this.removeEventListener(a,b,d);c.__target||nb(c);if(c.composed||-1<c.composedPath().indexOf(this))if(c.eventPhase===Event.BUBBLING_PHASE&&c.target===c.relatedTarget)c.stopImmediatePropagation();else if(b.handleEvent)b.handleEvent(c);
else return b.call(this,c)};b.b.push({node:this,type:a,capture:c,once:e,passive:h,W:g});jb[a]?(this.f=this.f||{},this.f[a]=this.f[a]||{capture:[],bubble:[]},this.f[a][c?"capture":"bubble"].push(g)):U.addEventListener.call(this,a,g,d)}},removeEventListener:function(a,b,d){if(b){var c,e,h;"object"===typeof d?(c=!!d.capture,e=!!d.once,h=!!d.passive):(c=!!d,h=e=!1);var g=void 0;if(b.b)for(var f=0;f<b.b.length;f++)if(b.b[f].node===this&&b.b[f].type===a&&b.b[f].capture===c&&b.b[f].once===e&&b.b[f].passive===
h){g=b.b.splice(f,1)[0].W;b.b.length||(b.b=void 0);break}U.removeEventListener.call(this,a,g||b,d);g&&jb[a]&&this.f&&this.f[a]&&(a=this.f[a][c?"capture":"bubble"],g=a.indexOf(g),-1<g&&a.splice(g,1))}},appendChild:function(a){return Ya(this,a)},insertBefore:function(a,b){return Ya(this,a,b)},removeChild:function(a){if(a.parentNode!==this)throw Error("The node to be removed is not a child of this node: "+a);if(!Oa(a)){var b=u(this)?this.host:this,d=I.parentNode(a);b===d&&U.removeChild.call(b,a)}Ra(this,
null,a);return a},replaceChild:function(a,b){this.insertBefore(a,b);this.removeChild(b);return a},cloneNode:function(a){var b;if("template"==this.localName)b=U.cloneNode.call(this,a);else if(b=U.cloneNode.call(this,!1),a){a=this.childNodes;for(var d=0,c;d<a.length;d++)c=a[d].cloneNode(!0),b.appendChild(c)}return b},getRootNode:function(){return Ta(this)},get isConnected(){var a=this.ownerDocument;if(a&&a.contains&&a.contains(this)||(a=a.documentElement)&&a.contains&&a.contains(this))return!0;for(a=
this;a&&!(a instanceof Document);)a=a.parentNode||(a instanceof W?a.host:void 0);return!!(a&&a instanceof Document)}},tb={get assignedSlot(){return rb(this)}},ub={querySelector:function(a){return Wa(this,function(b){return ca.call(b,a)},function(a){return!!a})[0]||null},querySelectorAll:function(a){return Wa(this,function(b){return ca.call(b,a)})}},vb={assignedNodes:function(a){if("slot"===this.localName){var b=this.getRootNode();u(b)&&Ja(b);return this.a?(a&&a.flatten?this.a.j:this.a.assignedNodes)||
[]:[]}}},wb=da({setAttribute:function(a,b){Y||(Y=window.ShadyCSS&&window.ShadyCSS.ScopingShim);Y&&"class"===a?Y.setElementClass(this,b):(U.setAttribute.call(this,a,b),Va(this,a))},removeAttribute:function(a){U.removeAttribute.call(this,a);Va(this,a)},attachShadow:function(a){if(!this)throw"Must provide a host.";if(!a)throw"Not enough arguments.";return new W(Ia,this)},get slot(){return this.getAttribute("slot")},set slot(a){this.setAttribute("slot",a)},get assignedSlot(){return rb(this)}},ub,vb);
Object.defineProperties(wb,qa);var xb=da({importNode:function(a,b){return Za(a,b)}},ub);Object.defineProperties(xb,{_activeElement:ra.activeElement});function Z(a,b){for(var d=Object.getOwnPropertyNames(b),c=0;c<d.length;c++){var e=d[c],h=Object.getOwnPropertyDescriptor(b,e);h.value?a[e]=h.value:Object.defineProperty(a,e,h)}};p.M&&(window.ShadyDOM={},window.ShadyDOM.inUse=p.M,window.ShadyDOM.patch=function(a){return a},window.ShadyDOM.isShadyRoot=u,window.ShadyDOM.enqueue=ha,window.ShadyDOM.flush=E,window.ShadyDOM.settings=p,window.ShadyDOM.filterMutations=db,window.ShadyDOM.observeChildren=bb,window.ShadyDOM.unobserveChildren=cb,window.ShadyDOM.nativeMethods=U,window.ShadyDOM.nativeTree=I,window.Event=ob,window.CustomEvent=pb,window.MouseEvent=qb,mb(),Z(window.Node.prototype,sb),Z(window.Text.prototype,tb),Z(window.DocumentFragment.prototype,
ub),Z(window.Element.prototype,wb),Z(window.Document.prototype,xb),window.HTMLSlotElement&&Z(window.HTMLSlotElement.prototype,vb),p.l&&(S(window.Node.prototype),S(window.Text.prototype),S(window.DocumentFragment.prototype),S(window.Element.prototype),S((window.customElements&&customElements.Aa||HTMLElement).prototype),S(window.Document.prototype),window.HTMLSlotElement&&S(window.HTMLSlotElement.prototype)),window.ShadowRoot=W);
}).call(this)

//# sourceMappingURL=cloudydom.min.js.map


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $isNaN = __webpack_require__(7);
var $isFinite = __webpack_require__(6);

var sign = __webpack_require__(9);
var mod = __webpack_require__(8);

var IsCallable = __webpack_require__(1);
var toPrimitive = __webpack_require__(28);

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return $isNaN(x) && $isNaN(y);
	},

	// http://www.ecma-international.org/ecma-262/5.1/#sec-8
	Type: function Type(x) {
		if (x === null) {
			return 'Null';
		}
		if (typeof x === 'undefined') {
			return 'Undefined';
		}
		if (typeof x === 'function' || typeof x === 'object') {
			return 'Object';
		}
		if (typeof x === 'number') {
			return 'Number';
		}
		if (typeof x === 'boolean') {
			return 'Boolean';
		}
		if (typeof x === 'string') {
			return 'String';
		}
	}
};

module.exports = ES5;


/***/ }),
/* 26 */
/***/ (function(module, exports) {

var has = Object.prototype.hasOwnProperty;
module.exports = Object.assign || function assign(target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toStr = Object.prototype.toString;

var isPrimitive = __webpack_require__(10);

var isCallable = __webpack_require__(1);

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = __webpack_require__(10);
var isCallable = __webpack_require__(1);
var isDate = __webpack_require__(33);
var isSymbol = __webpack_require__(35);

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {var require;/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.5
 */

(function (global, factory) {
     true ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

var _isArray = undefined;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;

var len = 0;
var vertxNext = undefined;
var customSchedulerFn = undefined;

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
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

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
    var r = require;
    var vertx = __webpack_require__(41);
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = undefined;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var _arguments = arguments;

  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;

  if (_state) {
    (function () {
      var callback = _arguments[_state - 1];
      asap(function () {
        return invokeCallback(_state, child, callback, parent._result);
      });
    })();
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
function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  _resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(16);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

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
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        _resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      _reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      _reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    _reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return _resolve(promise, value);
    }, function (reason) {
      return _reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$) {
  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$ === GET_THEN_ERROR) {
      _reject(promise, GET_THEN_ERROR.error);
    } else if (then$$ === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$)) {
      handleForeignThenable(promise, maybeThenable, then$$);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function _resolve(promise, value) {
  if (promise === value) {
    _reject(promise, selfFulfillment());
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

function _reject(promise, reason) {
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

  var child = undefined,
      callback = undefined,
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

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

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
      value = undefined,
      error = undefined,
      succeeded = undefined,
      failed = undefined;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      _reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      _resolve(promise, value);
    } else if (failed) {
      _reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      _reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      _resolve(promise, value);
    }, function rejectPromise(reason) {
      _reject(promise, reason);
    });
  } catch (e) {
    _reject(promise, e);
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

function Enumerator(Constructor, input) {
  this._instanceConstructor = Constructor;
  this.promise = new Constructor(noop);

  if (!this.promise[PROMISE_ID]) {
    makePromise(this.promise);
  }

  if (isArray(input)) {
    this._input = input;
    this.length = input.length;
    this._remaining = input.length;

    this._result = new Array(this.length);

    if (this.length === 0) {
      fulfill(this.promise, this._result);
    } else {
      this.length = this.length || 0;
      this._enumerate();
      if (this._remaining === 0) {
        fulfill(this.promise, this._result);
      }
    }
  } else {
    _reject(this.promise, validationError());
  }
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._enumerate = function () {
  var length = this.length;
  var _input = this._input;

  for (var i = 0; this._state === PENDING && i < length; i++) {
    this._eachEntry(_input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var c = this._instanceConstructor;
  var resolve$$ = c.resolve;

  if (resolve$$ === resolve) {
    var _then = getThen(entry);

    if (_then === then && entry._state !== PENDING) {
      this._settledAt(entry._state, i, entry._result);
    } else if (typeof _then !== 'function') {
      this._remaining--;
      this._result[i] = entry;
    } else if (c === Promise) {
      var promise = new c(noop);
      handleMaybeThenable(promise, entry, _then);
      this._willSettleAt(promise, i);
    } else {
      this._willSettleAt(new c(function (resolve$$) {
        return resolve$$(entry);
      }), i);
    }
  } else {
    this._willSettleAt(resolve$$(entry), i);
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var promise = this.promise;

  if (promise._state === PENDING) {
    this._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      this._result[i] = value;
    }
  }

  if (this._remaining === 0) {
    fulfill(promise, this._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function (value) {
    return enumerator._settledAt(FULFILLED, i, value);
  }, function (reason) {
    return enumerator._settledAt(REJECTED, i, reason);
  });
};

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
function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  _reject(promise, reason);
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
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this[PROMISE_ID] = nextId();
  this._result = this._state = undefined;
  this._subscribers = [];

  if (noop !== resolver) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
  }
}

Promise.all = all;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;
Promise._setScheduler = setScheduler;
Promise._setAsap = setAsap;
Promise._asap = asap;

Promise.prototype = {
  constructor: Promise,

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
  then: then,

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
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};

function polyfill() {
    var local = undefined;

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

    local.Promise = Promise;
}

// Strange compat..
Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));
//# sourceMappingURL=es6-promise.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(40), __webpack_require__(14)))

/***/ }),
/* 31 */
/***/ (function(module, exports) {


var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};



/***/ }),
/* 32 */
/***/ (function(module, exports) {

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var regexExec = RegExp.prototype.exec;
var tryRegexExec = function tryRegexExec(value) {
	try {
		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryRegexExec(value) : toStr.call(value) === regexClass;
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys = __webpack_require__(2);

module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; }
	if (keys(obj).length !== 0) { return false; }
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defineProperties = __webpack_require__(0);

var implementation = __webpack_require__(12);
var getPolyfill = __webpack_require__(13);
var shim = __webpack_require__(39);

var polyfill = getPolyfill();

defineProperties(polyfill, {
	implementation: implementation,
	getPolyfill: getPolyfill,
	shim: shim
});

module.exports = polyfill;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var define = __webpack_require__(0);
var getPolyfill = __webpack_require__(13);

module.exports = function shimAssign() {
	var polyfill = getPolyfill();
	define(
		Object,
		{ assign: polyfill },
		{ assign: function () { return Object.assign !== polyfill; } }
	);
	return polyfill;
};


/***/ }),
/* 40 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 41 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(15);


/***/ })
/******/ ]);
});