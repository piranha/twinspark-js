(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.XHRMock = factory());
}(this, (function () { 'use strict';

var MockResponse = /** @class */ (function () {
    function MockResponse() {
        this._status = 200;
        this._reason = 'OK';
        this._headers = {};
        this._body = null;
    }
    MockResponse.prototype.status = function (status) {
        if (typeof status !== 'undefined') {
            this._status = status;
            return this;
        }
        else {
            return this._status;
        }
    };
    MockResponse.prototype.reason = function (reason) {
        if (typeof reason !== 'undefined') {
            this._reason = reason;
            return this;
        }
        else {
            return this._reason;
        }
    };
    MockResponse.prototype.statusText = function (reason) {
        console.warn('xhr-mock: MockResponse.statusText() has been deprecated. Use MockResponse.reason() instead.');
        if (typeof reason !== 'undefined') {
            return this.reason(reason);
        }
        else {
            return this.reason();
        }
    };
    MockResponse.prototype.header = function (name, value) {
        if (typeof value !== 'undefined') {
            this._headers[name.toLowerCase()] = value;
            return this;
        }
        else {
            return this._headers[name.toLowerCase()] || null;
        }
    };
    MockResponse.prototype.headers = function (headers) {
        if (typeof headers === 'object') {
            for (var name in headers) {
                if (headers.hasOwnProperty(name)) {
                    this.header(name, headers[name]);
                }
            }
            return this;
        }
        else {
            return this._headers;
        }
    };
    MockResponse.prototype.body = function (body) {
        if (typeof body !== 'undefined') {
            this._body = body;
            return this;
        }
        else {
            return this._body;
        }
    };
    return MockResponse;
}());

function createResponseFromObject(object) {
    var status = object.status, reason = object.reason, headers = object.headers, body = object.body;
    var response = new MockResponse();
    if (status) {
        response.status(status);
    }
    if (reason) {
        response.reason(reason);
    }
    if (headers) {
        response.headers(headers);
    }
    if (body) {
        response.body(body);
    }
    return response;
}

function createMockFunction (method, url, mock) {
    var matches = function (req) {
        var requestMethod = req.method();
        var requestURL = req.url().toString();
        if (requestMethod.toUpperCase() !== method.toUpperCase()) {
            return false;
        }
        if (url instanceof RegExp) {
            url.lastIndex = 0; //reset state of global regexp
            return url.test(requestURL);
        }
        return requestURL === url; //TODO: should we use .startsWith()???
    };
    return function (req, res) {
        if (matches(req)) {
            if (typeof mock === 'object') {
                return createResponseFromObject(mock);
            }
            else {
                return mock(req, res);
            }
        }
    };
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};









function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var punycode = createCommonjsModule(function (module, exports) {
/*! https://mths.be/punycode v1.3.2 by @mathias */
(function(root) {

	/** Detect free variables */
	var freeExports = 'object' == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = 'object' == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof undefined == 'function' &&
		typeof undefined.amd == 'object' &&
		undefined.amd
	) {
		undefined('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(commonjsGlobal));
});

var util = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var decode = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

var encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var querystring = createCommonjsModule(function (module, exports) {
exports.decode = exports.parse = decode;
exports.encode = exports.stringify = encode;
});

var querystring_1 = querystring.decode;
var querystring_2 = querystring.parse;
var querystring_3 = querystring.encode;
var querystring_4 = querystring.stringify;

var parse = urlParse;
var format = urlFormat;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i;
var portPattern = /:[0-9]*$/;
var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
var delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];
var unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);
var autoEscape = ['\''].concat(unwise);
var nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
var hostEndingChars = ['/', '?', '#'];
var hostnameMaxLen = 255;
var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
var unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    };
var hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    };
var slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    };

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

// put toString() in a class so it isn't included in the props when checked for equality
var MockURLImplementation = /** @class */ (function () {
    function MockURLImplementation() {
    }
    MockURLImplementation.prototype.toString = function () {
        return formatURL(this);
    };
    return MockURLImplementation;
}());
function parseURL(url$$1) {
    var urlObject = new MockURLImplementation();
    if (!url$$1) {
        return urlObject;
    }
    var parsedURL = parse(url$$1, true);
    if (parsedURL.protocol) {
        urlObject.protocol = parsedURL.protocol.substr(0, parsedURL.protocol.length - 1);
    }
    if (parsedURL.auth) {
        var _a = parsedURL.auth.split(':'), username = _a[0], password = _a[1];
        if (username && password) {
            urlObject.username = username;
            urlObject.password = password;
        }
        else {
            urlObject.username = username;
        }
    }
    if (parsedURL.hostname) {
        urlObject.host = parsedURL.hostname;
    }
    if (parsedURL.port) {
        urlObject.port = parseInt(parsedURL.port, 10);
    }
    if (parsedURL.pathname) {
        urlObject.path = parsedURL.pathname;
    }
    if (parsedURL.query) {
        urlObject.query = parsedURL.query;
    }
    if (parsedURL.hash) {
        urlObject.hash = parsedURL.hash;
    }
    return urlObject;
}
function formatURL(url$$1) {
    var obj = {
        protocol: url$$1.protocol,
        auth: url$$1.username && url$$1.password
            ? url$$1.username + ":" + url$$1.password
            : url$$1.username,
        hostname: url$$1.host,
        port: typeof url$$1.port === 'number' ? String(url$$1.port) : url$$1.port,
        pathname: url$$1.path,
        query: url$$1.query,
        hash: url$$1.hash
    };
    return format(obj);
}

var FORBIDDEN_METHODS$1 = ['CONNECT', 'TRACE', 'TRACK'];
var UPPERCASE_METHODS = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
var MockRequest = /** @class */ (function () {
    function MockRequest() {
        this._method = 'GET';
        this._url = parseURL('');
        this._headers = {};
        this._body = null;
    }
    MockRequest.prototype.method = function (method) {
        if (typeof method !== 'undefined') {
            if (FORBIDDEN_METHODS$1.indexOf(method.toUpperCase()) !== -1) {
                throw new Error("xhr-mock: Method \"" + method + "\" is forbidden.");
            }
            if (UPPERCASE_METHODS.indexOf(method.toUpperCase()) !== -1) {
                this._method = method.toUpperCase();
            }
            else {
                this._method = method;
            }
            return this;
        }
        else {
            return this._method;
        }
    };
    MockRequest.prototype.url = function (url) {
        if (typeof url === 'string') {
            this._url = parseURL(url);
            return this;
        }
        else {
            return this._url;
        }
    };
    MockRequest.prototype.header = function (name, value) {
        if (typeof value !== 'undefined') {
            this._headers[name.toLowerCase()] = value;
            return this;
        }
        else {
            return this._headers[name.toLowerCase()] || null;
        }
    };
    MockRequest.prototype.headers = function (headers) {
        if (typeof headers === 'object') {
            for (var name in headers) {
                if (headers.hasOwnProperty(name)) {
                    this.header(name, headers[name]);
                }
            }
            return this;
        }
        else {
            return this._headers;
        }
    };
    MockRequest.prototype.body = function (body) {
        if (typeof body !== 'undefined') {
            this._body = body;
            return this;
        }
        else {
            return this._body;
        }
    };
    return MockRequest;
}());

var MockEvent = /** @class */ (function () {
    function MockEvent(type, eventInitDict) {
        this.eventPhase = 0;
        this.type = type || '';
        if (eventInitDict) {
            var _a = eventInitDict.scoped, scoped = _a === void 0 ? false : _a, _b = eventInitDict.bubbles, bubbles = _b === void 0 ? false : _b, _c = eventInitDict.cancelable, cancelable = _c === void 0 ? false : _c;
            this.scoped = scoped;
            this.bubbles = bubbles;
            this.cancelable = cancelable;
        }
    }
    MockEvent.prototype.initEvent = function (eventTypeArg, canBubbleArg, cancelableArg) {
        throw new Error();
    };
    MockEvent.prototype.preventDefault = function () {
        throw new Error();
    };
    MockEvent.prototype.stopImmediatePropagation = function () {
        throw new Error();
    };
    MockEvent.prototype.stopPropagation = function () {
        throw new Error();
    };
    MockEvent.prototype.deepPath = function () {
        throw new Error();
    };
    return MockEvent;
}());

var MockProgressEvent = /** @class */ (function (_super) {
    __extends(MockProgressEvent, _super);
    function MockProgressEvent(type, eventInitDict) {
        var _this = _super.call(this, type, eventInitDict) || this;
        if (eventInitDict) {
            var _a = eventInitDict.lengthComputable, lengthComputable = _a === void 0 ? false : _a, _b = eventInitDict.loaded, loaded = _b === void 0 ? 0 : _b, _c = eventInitDict.total, total = _c === void 0 ? 0 : _c;
            _this.lengthComputable = lengthComputable;
            _this.loaded = loaded;
            _this.total = total;
        }
        return _this;
    }
    MockProgressEvent.prototype.initProgressEvent = function (typeArg, canBubbleArg, cancelableArg, lengthComputableArg, loadedArg, totalArg) {
        throw new Error();
    };
    return MockProgressEvent;
}(MockEvent));

var MockEventTarget = /** @class */ (function () {
    function MockEventTarget() {
        this.listeners = {};
    }
    MockEventTarget.prototype.addEventListener = function (type, listener, options) {
        this.listeners = this.listeners || {};
        if (!listener) {
            return;
        }
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        //handleEvent
        if (this.listeners[type].indexOf(listener) === -1) {
            this.listeners[type].push(listener);
        }
    };
    MockEventTarget.prototype.removeEventListener = function (type, listener, options) {
        this.listeners = this.listeners || {};
        if (!listener) {
            return;
        }
        if (!this.listeners[type]) {
            return;
        }
        var index = this.listeners[type].indexOf(listener);
        if (index !== -1) {
            this.listeners[type].splice(index, 1);
        }
    };
    MockEventTarget.prototype.dispatchEvent = function (event) {
        var _this = this;
        this.listeners = this.listeners || {};
        //set the event target
        event.target = this;
        event.currentTarget = this;
        //call any built-in listeners
        //FIXME: the listener should be added on set
        var method = this["on" + event.type];
        if (method) {
            method.call(this, event);
        }
        if (!this.listeners[event.type]) {
            return true;
        }
        this.listeners[event.type].forEach(function (listener) {
            if (typeof listener === 'function') {
                listener.call(_this, event);
            }
            else {
                listener.handleEvent.call(_this, event);
            }
        });
        return true; //TODO: return type based on .cancellable and .preventDefault()
    };
    return MockEventTarget;
}());

// @ts-ignore: https://github.com/jameslnewell/xhr-mock/issues/45
var MockXMLHttpRequestEventTarget = /** @class */ (function (_super) {
    __extends(MockXMLHttpRequestEventTarget, _super);
    function MockXMLHttpRequestEventTarget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MockXMLHttpRequestEventTarget;
}(MockEventTarget));

// @ts-ignore: https://github.com/jameslnewell/xhr-mock/issues/45
var MockXMLHttpRequestUpload = /** @class */ (function (_super) {
    __extends(MockXMLHttpRequestUpload, _super);
    function MockXMLHttpRequestUpload() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MockXMLHttpRequestUpload;
}(MockXMLHttpRequestEventTarget));

var MockError = /** @class */ (function (_super) {
    __extends(MockError, _super);
    function MockError(message) {
        var _this = _super.call(this, message) || this;
        // hack to make instanceof work @see https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
        Object.setPrototypeOf(_this, MockError.prototype);
        return _this;
    }
    return MockError;
}(Error));

function isPromiseLike(arg) {
    return arg && arg.then !== undefined;
}

var NO_RESPONSE_ERROR = new MockError('No handler returned a response for the request.');
function sync(handlers, request, response) {
    for (var i = 0; i < handlers.length; ++i) {
        var result = handlers[i](request, response);
        if (result) {
            if (isPromiseLike(result)) {
                throw new MockError('A handler returned a Promise<MockResponse> for a synchronous request.');
            }
            return result;
        }
    }
    throw NO_RESPONSE_ERROR;
}
function async(handlers, request, response) {
    return handlers
        .reduce(function (promise, handler) {
        return promise.then(function (result) {
            if (!result) {
                return handler(request, response);
            }
            return result;
        });
    }, Promise.resolve(undefined))
        .then(function (result) {
        if (!result) {
            throw NO_RESPONSE_ERROR;
        }
        return result;
    });
}

function convertRequestToString(req) {
    var headers = Object.keys(req.headers()).map(function (name) { return name + ": " + req.header(name); });
    var body = req.body() ? req.body() : '';
    return req.method() + " " + req.url() + " HTTP/1.1\n" + (headers ? headers.join('\n') + "\n" : '') + "\n" + (body ? body : '') + "\n";
}
function indentSuccessiveLines(string, indent) {
    return string
        .split('\n')
        .map(function (line, index) { return Array(indent + 1).join(' ') + line; })
        .join('\n');
}
function formatError(msg, req, err) {
    return "xhr-mock: " + msg + "\n\n  " + indentSuccessiveLines(convertRequestToString(req), 2).trim() + "\n  " + (err !== undefined
        ? "\n" + indentSuccessiveLines((err && err.stack) || (err && err.message) || "Error: " + err, 2)
        : '') + "\n";
}

var notImplementedError = new MockError("This feature hasn't been implmented yet. Please submit an Issue or Pull Request on Github.");
// implemented according to https://xhr.spec.whatwg.org/
var FORBIDDEN_METHODS = ['CONNECT', 'TRACE', 'TRACK'];
var ReadyState;
(function (ReadyState) {
    ReadyState[ReadyState["UNSENT"] = 0] = "UNSENT";
    ReadyState[ReadyState["OPENED"] = 1] = "OPENED";
    ReadyState[ReadyState["HEADERS_RECEIVED"] = 2] = "HEADERS_RECEIVED";
    ReadyState[ReadyState["LOADING"] = 3] = "LOADING";
    ReadyState[ReadyState["DONE"] = 4] = "DONE";
})(ReadyState || (ReadyState = {}));
function calculateProgress(req) {
    var header = req.header('content-length');
    var body = req.body();
    var lengthComputable = false;
    var total = 0;
    if (header) {
        var contentLength = parseInt(header, 10);
        if (contentLength !== NaN) {
            lengthComputable = true;
            total = contentLength;
        }
    }
    return {
        lengthComputable: lengthComputable,
        loaded: (body && body.length) || 0,
        total: total
    };
}
// @ts-ignore: https://github.com/jameslnewell/xhr-mock/issues/45
var MockXMLHttpRequest = /** @class */ (function (_super) {
    __extends(MockXMLHttpRequest, _super);
    function MockXMLHttpRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.UNSENT = ReadyState.UNSENT;
        _this.OPENED = ReadyState.OPENED;
        _this.HEADERS_RECEIVED = ReadyState.HEADERS_RECEIVED;
        _this.LOADING = ReadyState.LOADING;
        _this.DONE = ReadyState.DONE;
        //some libraries (like Mixpanel) use the presence of this field to check if XHR is properly supported
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
        _this.withCredentials = false;
        _this.req = new MockRequest();
        _this.res = new MockResponse();
        _this.responseType = '';
        _this.responseURL = '';
        _this._timeout = 0;
        // @ts-ignore: https://github.com/jameslnewell/xhr-mock/issues/45
        _this.upload = new MockXMLHttpRequestUpload();
        _this.readyState = MockXMLHttpRequest.UNSENT;
        // flags
        _this.isSynchronous = false;
        _this.isSending = false;
        _this.isUploadComplete = false;
        _this.isAborted = false;
        _this.isTimedOut = false;
        return _this;
    }
    /**
     * Add a mock handler
     */
    MockXMLHttpRequest.addHandler = function (fn) {
        this.handlers.push(fn);
    };
    /**
     * Remove a mock handler
     */
    MockXMLHttpRequest.removeHandler = function (fn) {
        throw notImplementedError;
    };
    /**
     * Remove all request handlers
     */
    MockXMLHttpRequest.removeAllHandlers = function () {
        this.handlers = [];
    };
    Object.defineProperty(MockXMLHttpRequest.prototype, "timeout", {
        get: function () {
            return this._timeout;
        },
        set: function (timeout) {
            if (timeout !== 0 && this.isSynchronous) {
                throw new MockError('Timeouts cannot be set for synchronous requests made from a document.');
            }
            this._timeout = timeout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockXMLHttpRequest.prototype, "response", {
        // https://xhr.spec.whatwg.org/#the-response-attribute
        get: function () {
            if (this.responseType === '' || this.responseType === 'text') {
                if (this.readyState !== this.LOADING && this.readyState !== this.DONE) {
                    return '';
                }
                return this.responseText;
            }
            if (this.readyState !== this.DONE) {
                return null;
            }
            var body = this.res.body();
            if (!body) {
                return null;
            }
            if (this.responseType === 'json' && typeof body === 'string') {
                try {
                    return JSON.parse(this.responseText);
                }
                catch (error) {
                    return null;
                }
            }
            if (this.responseType === 'blob' && typeof body === 'string') {
                try {
                    throw notImplementedError;
                }
                catch (error) {
                    return null;
                }
            }
            if (this.responseType === 'arraybuffer' && typeof body === 'string') {
                try {
                    throw notImplementedError;
                }
                catch (error) {
                    return null;
                }
            }
            if (this.responseType === 'document' && typeof body === 'string') {
                try {
                    throw notImplementedError;
                }
                catch (error) {
                    return null;
                }
            }
            // rely on the mock to do the right thing with an arraybuffer, blob or document
            return body;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockXMLHttpRequest.prototype, "responseText", {
        get: function () {
            return this.res.body() || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockXMLHttpRequest.prototype, "responseXML", {
        get: function () {
            throw notImplementedError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockXMLHttpRequest.prototype, "status", {
        get: function () {
            return this.res.status();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockXMLHttpRequest.prototype, "statusText", {
        get: function () {
            return this.res.reason();
        },
        enumerable: true,
        configurable: true
    });
    MockXMLHttpRequest.prototype.getAllResponseHeaders = function () {
        // I'm pretty sure this fn can return null, but TS types say no
        // if (this.readyState < MockXMLHttpRequest.HEADERS_RECEIVED) {
        //   return null;
        // }
        var headers = this.res.headers();
        var result = Object.keys(headers)
            .map(function (name) { return name + ": " + headers[name] + "\r\n"; })
            .join('');
        return result;
    };
    MockXMLHttpRequest.prototype.getResponseHeader = function (name) {
        if (this.readyState < MockXMLHttpRequest.HEADERS_RECEIVED) {
            return null;
        }
        return this.res.header(name);
    };
    MockXMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        if (this.readyState < MockXMLHttpRequest.OPENED) {
            throw new MockError('xhr must be OPENED.');
        }
        this.req.header(name, value);
    };
    MockXMLHttpRequest.prototype.overrideMimeType = function (mime) {
        throw notImplementedError;
    };
    MockXMLHttpRequest.prototype.open = function (method, url, async$$1, username, password) {
        if (async$$1 === void 0) { async$$1 = true; }
        if (username === void 0) { username = null; }
        if (password === void 0) { password = null; }
        // if method is not a method, then throw a "SyntaxError" DOMException
        // if method is a forbidden method, then throw a "SecurityError" DOMException
        if (FORBIDDEN_METHODS.indexOf(method) !== -1) {
            throw new MockError("Method " + method + " is forbidden.");
        }
        // normalize method
        method = method.toUpperCase();
        // let parsedURL be the result of parsing url with settingsObject’s API base URL and settingsObject’s API URL character encoding
        // if parsedURL is failure, then throw a "SyntaxError" DOMException
        var fullURL = parseURL(url);
        // if the async argument is omitted, set async to true, and set username and password to null.
        // if parsedURL’s host is non-null, run these substeps:
        // if the username argument is not null, set the username given parsedURL and username
        // if the password argument is not null, set the password given parsedURL and password
        fullURL.username = username || '';
        fullURL.password = (username && password) || '';
        // if async is false, current global object is a Window object, and the timeout attribute value
        // is not zero or the responseType attribute value is not the empty string, then throw an "InvalidAccessError" DOMException.
        if (!async$$1 && (this._timeout !== 0 || this.responseType !== '')) {
            throw new MockError('InvalidAccessError');
        }
        // terminate the ongoing fetch operated by the XMLHttpRequest object
        if (this.isSending) {
            throw new MockError('Unable to terminate the previous request');
        }
        // set variables associated with the object as follows:
        // - unset the send() flag and upload listener flag
        // - set the synchronous flag, if async is false, and unset the synchronous flag otherwise
        // - set request method to method
        // - set request URL to parsedURL
        // - empty author request headers
        this.isSending = false;
        this.isSynchronous = !async$$1;
        this.req
            .method(method)
            .headers({})
            .url(formatURL(fullURL));
        this.applyNetworkError();
        // if the state is not opened, run these substeps:
        if (this.readyState !== this.OPENED) {
            // set state to opened
            this.readyState = MockXMLHttpRequest.OPENED;
            // fire an event named readystatechange
            this.dispatchEvent(new MockEvent('readystatechange'));
        }
    };
    MockXMLHttpRequest.prototype.sendSync = function () {
        // let response be the result of fetching req
        var res;
        try {
            res = sync(MockXMLHttpRequest.handlers, this.req, this.res);
            // if the timeout attribute value is not zero, then set the timed out flag and terminate fetching if it has not returned within the amount of milliseconds from the timeout.
            // TODO: check if timeout was elapsed
            //if response’s body is null, then run handle response end-of-body and return
            // let reader be the result of getting a reader from response’s body’s stream
            // let promise be the result of reading all bytes from response’s body’s stream with reader
            // wait for promise to be fulfilled or rejected
            // if promise is fulfilled with bytes, then append bytes to received bytes
            // run handle response end-of-body for response
            this.handleResponseBody(res);
        }
        catch (error) {
            MockXMLHttpRequest.errorCallback({ req: this.req, err: error });
            this.handleError(error);
        }
    };
    MockXMLHttpRequest.prototype.sendAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var req, progress, progress_1, res, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = this.req;
                        progress = calculateProgress(this.res);
                        this.dispatchEvent(new MockProgressEvent('loadstart', __assign({}, progress, { loaded: 0 })));
                        // if the upload complete flag is unset and upload listener flag is set, then fire a progress
                        // event named loadstart on the XMLHttpRequestUpload object with 0 and req’s body’s total bytes.
                        if (!this.isUploadComplete) {
                            progress_1 = calculateProgress(this.req);
                            this.upload.dispatchEvent(new MockProgressEvent('loadstart', __assign({}, progress_1, { loaded: 0 })));
                        }
                        // if state is not opened or the send() flag is unset, then return.
                        if (this.readyState !== this.OPENED || !this.isSending) {
                            return [2 /*return*/];
                        }
                        // fetch req. Handle the tasks queued on the networking task source per below
                        // run these subsubsteps in parallel:
                        // wait until either req’s done flag is set or
                        // the timeout attribute value number of milliseconds has passed since these subsubsteps started
                        // while timeout attribute value is not zero
                        // if req’s done flag is unset, then set the timed out flag and terminate fetching
                        if (this._timeout !== 0) {
                            // @ts-ignore: wants a NodeJS.Timer because of @types/node
                            this._timeoutTimer = setTimeout(function () {
                                _this.isTimedOut = true;
                                _this.handleError();
                            }, this._timeout);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, async(MockXMLHttpRequest.handlers, this.req, this.res)];
                    case 2:
                        res = _a.sent();
                        //we've received a response before the timeout so we don't want to timeout
                        clearTimeout(this._timeoutTimer);
                        if (this.isAborted || this.isTimedOut) {
                            return [2 /*return*/]; // these cases will already have been handled
                        }
                        this.sendRequest(req);
                        this.receiveResponse(res);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        //we've received an error before the timeout so we don't want to timeout
                        clearTimeout(this._timeoutTimer);
                        if (this.isAborted || this.isTimedOut) {
                            return [2 /*return*/]; // these cases will already have been handled
                        }
                        MockXMLHttpRequest.errorCallback({ req: this.req, err: error_1 });
                        this.handleError(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MockXMLHttpRequest.prototype.applyNetworkError = function () {
        // a network error is a response whose status is always 0, status message is always the
        // empty byte sequence, header list is always empty, body is always null, and
        // trailer is always empty
        this.res
            .status(0)
            .reason('')
            .headers({})
            .body(null);
    };
    // @see https://xhr.spec.whatwg.org/#request-error-steps
    MockXMLHttpRequest.prototype.reportError = function (event) {
        // set state to done
        this.readyState = this.DONE;
        // unset the send() flag
        this.isSending = false;
        // set response to network error
        this.applyNetworkError();
        // if the synchronous flag is set, throw an exception exception
        if (this.isSynchronous) {
            throw new MockError('An error occurred whilst sending a synchronous request.');
        }
        // fire an event named readystatechange
        this.dispatchEvent(new MockEvent('readystatechange'));
        // if the upload complete flag is unset, follow these substeps:
        if (!this.isUploadComplete) {
            // set the upload complete flag
            this.isUploadComplete = true;
            // if upload listener flag is unset, then terminate these substeps
            // NOTE: not sure why this is necessary - if there's no listeners  listening, then the
            // following events have no impact
            var uploadProgress = calculateProgress(this.req);
            // fire a progress event named event on the XMLHttpRequestUpload object with 0 and 0
            this.upload.dispatchEvent(new MockProgressEvent(event, uploadProgress));
            // fire a progress event named loadend on the XMLHttpRequestUpload object with 0 and 0
            this.upload.dispatchEvent(new MockProgressEvent('loadend', uploadProgress));
        }
        var downloadProgress = calculateProgress(this.res);
        // fire a progress event named event with 0 and 0
        this.dispatchEvent(new MockProgressEvent(event, downloadProgress));
        // fire a progress event named loadend with 0 and 0
        this.dispatchEvent(new MockProgressEvent('loadend', downloadProgress));
    };
    MockXMLHttpRequest.prototype.sendRequest = function (req) {
        if (this.isUploadComplete) {
            return;
        }
        // if not roughly 50ms have passed since these subsubsteps were last invoked, terminate these subsubsteps
        // TODO:
        // If upload listener flag is set, then fire a progress event named progress on the
        // XMLHttpRequestUpload object with request’s body’s transmitted bytes and request’s body’s
        // total bytes
        // const progress = getProgress(this.req);
        // this.upload.dispatchEvent(new MockProgressEvent('progress', {
        //   ...progress,
        //   loaded: %
        // }))
        // TODO: repeat this in a timeout to simulate progress events
        // TODO: dispatch total, length and lengthComputable values
        // set the upload complete flag
        this.isUploadComplete = true;
        // if upload listener flag is unset, then terminate these subsubsteps.
        // NOTE: it doesn't really matter if we emit these events and noone is listening
        // let transmitted be request’s body’s transmitted bytes
        // let length be request’s body’s total bytes
        var progress = calculateProgress(this.req);
        // fire a progress event named progress on the XMLHttpRequestUpload object with transmitted and length
        this.upload.dispatchEvent(new MockProgressEvent('progress', progress));
        // fire a progress event named load on the XMLHttpRequestUpload object with transmitted and length
        this.upload.dispatchEvent(new MockProgressEvent('load', progress));
        // fire a progress event named loadend on the XMLHttpRequestUpload object with transmitted and length
        this.upload.dispatchEvent(new MockProgressEvent('loadend', progress));
    };
    MockXMLHttpRequest.prototype.receiveResponse = function (res) {
        // set state to headers received
        this.readyState = this.HEADERS_RECEIVED;
        // fire an event named readystatechange
        this.dispatchEvent(new MockEvent('readystatechange'));
        // if state is not headers received, then return
        // NOTE: is that really necessary, we've just change the state a second ago
        // if response’s body is null, then run handle response end-of-body and return
        if (res.body() === null) {
            this.handleResponseBody(res);
            return;
        }
        // let reader be the result of getting a reader from response’s body’s stream
        // let read be the result of reading a chunk from response’s body’s stream with reader
        // When read is fulfilled with an object whose done property is false and whose value property
        // is a Uint8Array object, run these subsubsubsteps and then run the above subsubstep again:
        // TODO:
        // append the value property to received bytes
        // if not roughly 50ms have passed since these subsubsubsteps were last invoked, then terminate
        // these subsubsubsteps
        // TODO:
        // if state is headers received, then set state to loading
        // NOTE: why wouldn't it be headers received?
        this.readyState = this.LOADING;
        // fire an event named readystatechange
        this.dispatchEvent(new MockEvent('readystatechange'));
        // fire a progress event named progress with response’s body’s transmitted bytes and response’s
        // body’s total bytes
        // TODO: repeat to simulate progress
        // const progress = calculateProgress(res);
        // this.dispatchEvent(new MockProgressEvent('progress', {
        //   ...progress,
        //   loaded: %
        // }));
        // when read is fulfilled with an object whose done property is true, run handle response
        // end-of-body for response
        // when read is rejected with an exception, run handle errors for response
        // NOTE: we don't handle this error case
        this.handleResponseBody(res);
    };
    // @see https://xhr.spec.whatwg.org/#handle-errors
    MockXMLHttpRequest.prototype.handleError = function (error) {
        // if the send() flag is unset, return
        if (!this.isSending) {
            return;
        }
        // if the timed out flag is set, then run the request error steps for event timeout and exception TimeoutError
        if (this.isTimedOut) {
            this.reportError('timeout');
            return;
        }
        // otherwise, if response’s body’s stream is errored, then:
        // NOTE: we're not handling this event
        // if () {
        //   // set state to done
        //   this.readyState = this.DONE;
        //   // unset the send() flag
        //   this.isSending = false;
        //   // set response to a network error
        //   this.applyNetworkError();
        //   return;
        // }
        // otherwise, if response’s aborted flag is set, then run the request error steps for event abort and exception AbortError
        if (this.isAborted) {
            this.reportError('abort');
            return;
        }
        // if response is a network error, run the request error steps for event error and exception NetworkError
        // NOTE: we assume all other calls are network errors
        this.reportError('error');
    };
    // @see https://xhr.spec.whatwg.org/#handle-response-end-of-body
    MockXMLHttpRequest.prototype.handleResponseBody = function (res) {
        this.res = res;
        // let transmitted be response’s body’s transmitted bytes
        // let length be response’s body’s total bytes.
        var progress = calculateProgress(res);
        // if the synchronous flag is unset, update response’s body using response
        if (!this.isSynchronous) {
            // fire a progress event named progress with transmitted and length
            this.dispatchEvent(new MockProgressEvent('progress', progress));
        }
        // set state to done
        this.readyState = this.DONE;
        // unset the send() flag
        this.isSending = false;
        // fire an event named readystatechange
        this.dispatchEvent(new MockEvent('readystatechange'));
        // fire a progress event named load with transmitted and length
        this.dispatchEvent(new MockProgressEvent('load', progress));
        // fire a progress event named loadend with transmitted and length
        this.dispatchEvent(new MockProgressEvent('loadend', progress));
    };
    MockXMLHttpRequest.prototype.send = function (body) {
        // if state is not opened, throw an InvalidStateError exception
        if (this.readyState !== MockXMLHttpRequest.OPENED) {
            throw new MockError('Please call MockXMLHttpRequest.open() before MockXMLHttpRequest.send().');
        }
        // if the send() flag is set, throw an InvalidStateError exception
        if (this.isSending) {
            throw new MockError('MockXMLHttpRequest.send() has already been called.');
        }
        // if the request method is GET or HEAD, set body to null
        if (this.req.method() === 'GET' || this.req.method() === 'HEAD') {
            body = null;
        }
        // if body is null, go to the next step otherwise, let encoding and mimeType be null, and then follow these rules, switching on body
        var encoding;
        var mimeType;
        if (body !== null && body !== undefined) {
            if (typeof Document !== 'undefined' &&
                typeof XMLDocument !== 'undefined' &&
                body instanceof Document) {
                // Set encoding to `UTF-8`.
                // Set mimeType to `text/html` if body is an HTML document, and to `application/xml` otherwise. Then append `;charset=UTF-8` to mimeType.
                // Set request body to body, serialized, converted to Unicode, and utf-8 encoded.
                encoding = 'UTF-8';
                mimeType =
                    body instanceof XMLDocument ? 'application/xml' : 'text/html';
            }
            else {
                // If body is a string, set encoding to `UTF-8`.
                // Set request body and mimeType to the result of extracting body.
                // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
                if (typeof Blob !== 'undefined' && body instanceof Blob) {
                    mimeType = body.type;
                }
                else if (typeof FormData !== 'undefined' &&
                    body instanceof FormData) {
                    mimeType = 'multipart/form-data; boundary=----XHRMockFormBoundary';
                }
                else if (typeof URLSearchParams !== 'undefined' &&
                    body instanceof URLSearchParams) {
                    encoding = 'UTF-8';
                    mimeType = 'application/x-www-form-urlencoded';
                }
                else if (typeof body === 'string') {
                    encoding = 'UTF-8';
                    mimeType = 'text/plain';
                }
                else {
                    throw notImplementedError;
                }
            }
            // if mimeType is non-null and author request headers does not contain `Content-Type`, then append `Content-Type`/mimeType to author request headers.
            // otherwise, if the header whose name is a byte-case-insensitive match for `Content-Type` in author request headers has a value that is a valid MIME type,
            //    which has a `charset` parameter whose value is not a byte-case-insensitive match for encoding, and encoding is not null, then set all the `charset` parameters
            //    whose value is not a byte-case-insensitive match for encoding of that header’s value to encoding.
            // chrome seems to forget the second case ^^^
            var contentType = this.req.header('content-type');
            if (!contentType) {
                this.req.header('content-type', encoding ? mimeType + "; charset=" + encoding : mimeType);
            }
            this.req.body(body);
        }
        // if one or more event listeners are registered on the associated XMLHttpRequestUpload object, then set upload listener flag
        // Note: not really necessary since dispatching an event to no listeners doesn't hurt anybody
        //TODO: check CORs
        // unset the upload complete flag
        this.isUploadComplete = false;
        // unset the timed out flag
        this.isTimedOut = false;
        // if req’s body is null, set the upload complete flag
        if (body === null || body === undefined) {
            this.isUploadComplete = true;
        }
        // set the send() flag
        this.isSending = true;
        if (this.isSynchronous) {
            this.sendSync();
        }
        else {
            this.sendAsync();
        }
    };
    MockXMLHttpRequest.prototype.abort = function () {
        //we've cancelling the response before the timeout period so we don't want to timeout
        clearTimeout(this._timeoutTimer);
        // terminate the ongoing fetch with the aborted flag set
        this.isAborted = true;
        // if state is either opened with the send() flag set, headers received, or loading,
        // run the request error steps for event
        if (this.readyState === this.OPENED ||
            this.readyState === this.HEADERS_RECEIVED ||
            this.readyState === this.LOADING) {
            this.reportError('abort');
        }
        // if state is done, then set state to unsent and response to a network error
        if (this.readyState === this.DONE) {
            this.readyState = this.UNSENT;
            this.applyNetworkError();
            return;
        }
    };
    MockXMLHttpRequest.prototype.msCachingEnabled = function () {
        return false;
    };
    MockXMLHttpRequest.UNSENT = ReadyState.UNSENT;
    MockXMLHttpRequest.OPENED = ReadyState.OPENED;
    MockXMLHttpRequest.HEADERS_RECEIVED = ReadyState.HEADERS_RECEIVED;
    MockXMLHttpRequest.LOADING = ReadyState.LOADING;
    MockXMLHttpRequest.DONE = ReadyState.DONE;
    MockXMLHttpRequest.handlers = [];
    MockXMLHttpRequest.errorCallback = function (_a) {
        var req = _a.req, err = _a.err;
        if (err instanceof MockError) {
            console.error(formatError(err.message, req));
        }
        else {
            console.error(formatError('A handler returned an error for the request.', req, err));
        }
    };
    return MockXMLHttpRequest;
}(MockXMLHttpRequestEventTarget));

var RealXMLHttpRequest = window.XMLHttpRequest;
var XHRMock$1 = /** @class */ (function () {
    function XHRMock() {
        this.RealXMLHttpRequest = RealXMLHttpRequest;
    }
    XHRMock.prototype.setup = function () {
        // @ts-ignore: https://github.com/jameslnewell/xhr-mock/issues/45
        window.XMLHttpRequest = MockXMLHttpRequest;
        this.reset();
        return this;
    };
    XHRMock.prototype.teardown = function () {
        this.reset();
        window.XMLHttpRequest = RealXMLHttpRequest;
        return this;
    };
    XHRMock.prototype.reset = function () {
        MockXMLHttpRequest.removeAllHandlers();
        return this;
    };
    XHRMock.prototype.error = function (callback) {
        MockXMLHttpRequest.errorCallback = callback;
        return this;
    };
    XHRMock.prototype.mock = function (fnOrMethod, url, mock) {
        console.warn('xhr-mock: XHRMock.mock() has been deprecated. Use XHRMock.use() instead.');
        if (typeof fnOrMethod === 'string' &&
            (typeof url === 'string' || url instanceof RegExp) &&
            mock !== undefined) {
            return this.use(fnOrMethod, url, mock);
        }
        else if (typeof fnOrMethod === 'function') {
            return this.use(fnOrMethod);
        }
        else {
            throw new Error('xhr-mock: Invalid handler.');
        }
    };
    XHRMock.prototype.use = function (fnOrMethod, url, mock) {
        var fn;
        if (typeof fnOrMethod === 'string' &&
            (typeof url === 'string' || url instanceof RegExp) &&
            mock !== undefined) {
            fn = createMockFunction(fnOrMethod, url, mock);
        }
        else if (typeof fnOrMethod === 'function') {
            fn = fnOrMethod;
        }
        else {
            throw new Error('xhr-mock: Invalid handler.');
        }
        MockXMLHttpRequest.addHandler(fn);
        return this;
    };
    XHRMock.prototype.get = function (url, mock) {
        return this.use('GET', url, mock);
    };
    XHRMock.prototype.post = function (url, mock) {
        return this.use('POST', url, mock);
    };
    XHRMock.prototype.put = function (url, mock) {
        return this.use('PUT', url, mock);
    };
    XHRMock.prototype.patch = function (url, mock) {
        return this.use('PATCH', url, mock);
    };
    XHRMock.prototype["delete"] = function (url, mock) {
        return this.use('DELETE', url, mock);
    };
    return XHRMock;
}());
// I'm only using a class so I can make use make use of TS' method overrides
var XHRMock$2 = new XHRMock$1();

return XHRMock$2;

})));
