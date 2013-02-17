/*BUILT Sun Feb 17 2013 20:02:20 GMT+0100 (CET)*/
require.register('util.object', function(module, exports, require) {
  /**
   * Test if 'obj' is an Array
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isArray = function(obj) {
  	if (Array.isArray) {
  		return Array.isArray(obj);
  	} else {
  		return Object.prototype.toString.call(obj) === '[object Array]';
  	}
  };
  
  /**
   * Test if 'obj' is an Object
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isObject = function(obj) {
  	return obj === Object(obj) && obj.nodeType == undefined;
  };
  
  /**
   * Test if 'obj' is a String
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isString = function(obj) {
  	return Object.prototype.toString.call(obj) === '[object String]';
  };
  
  /**
   * Test if 'obj' is a Number
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isNumber = function(obj) {
  	return Object.prototype.toString.call(obj) === '[object Number]';
  };
  
  /**
   * Test if 'obj' is a Function
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isFunction = function(obj) {
  	return Object.prototype.toString.call(obj) === '[object Function]';
  };
  
  /**
   * Test if 'obj' is NaN
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isNaN = function(obj) {
  	return obj !== obj;
  };
  
  /**
   * Test if 'obj' is an Element
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isElement = function(obj) {
  	return !!((obj != null ? obj.nodeType : null) === 1);
  };
  
  /**
   * Test if 'obj' is a Boolean
   * -- from underscore.js --
   * @param {Object} obj
   * @returns {Boolean}
   */
  exports.isBoolean = function(obj) {
  	return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
  };
  
  /**
   * Extend an 'obj' with additional properties
   * @param {Object} obj
   * @param {Object} ...
   * @returns {Object}
   */
  exports.extend = function(obj) {
  	var argObjs = (2 <= arguments.length) ? Array.prototype.slice.call(arguments, 1) : []
  		, argObj;
  	for (var i = 0, n = argObjs.length; i < n; i++) {
  		argObj = argObjs[i];
  		for (var prop in argObj) {
  			obj[prop] = argObj[prop];
  		}
  	}
  	return obj;
  };
  
  /**
   * Convert a 'key' 'value' pair into an object
   * @param {String} key
   * @param {*} value
   * @returns {Object}
   */
  exports.objectify = function(key, value) {
  	var o = {};
  	o[key] = value;
  	return o;
  };
  
});
require.register('dom.css', function(module, exports, require) {
  var objectUtils = require('util.object')
  	, win = window
  	, doc = win.document
  	, RE_UNITS = /(px|%|em|ms|s)$/
  	, RE_IE_OPACITY = /opacity=(\d+)/i
  	, RE_RGB = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/
  	, VENDOR_PREFIXES = ['-webkit-', '-moz-', '-ms-', '-o-']
  		// Hash of prefixed versions of properties
  		// (values to be replaced by platform specific property)
  	, prefixed = {
  		'border-bottom-left-radius': false,
  		'border-bottom-right-radius': false,
  		'border-top-left-radius': false,
  		'border-top-right-radius': false,
  		'box-shadow': false,
  		'transform': false,
  		'transform-origin': false,
  		'transform-style': false,
  		'transition-delay': false,
  		'transition-duration': false,
  		'transition-property': false,
  		'transition-timing-function': false,
  		'perspective': false,
  		'perspective-origin': false
  		}
  		// Hash of default unit values
  	, numeric = {
  		'top': 'px',
  		'bottom': 'px',
  		'left': 'px',
  		'right': 'px',
  		'width': 'px',
  		'height': 'px',
  		'margin-top': 'px',
  		'margin-bottom': 'px',
  		'margin-left': 'px',
  		'margin-right': 'px',
  		'padding-top': 'px',
  		'padding-bottom': 'px',
  		'padding-left': 'px',
  		'padding-right': 'px',
  		'border-bottom-left-radius': 'px',
  		'border-bottom-right-radius': 'px',
  		'border-top-left-radius': 'px',
  		'border-top-right-radius': 'px',
  		'transition-duration': 'ms',
  		'opacity': '',
  		'font-size': 'px'
  		}
  	, colour = {
  		'background-color': 'color',
  		'color': 'color',
  		'border-color': 'color'
  		}
  		// Hash of shorthand properties
  	, shorthand = {
  		'border-radius': ['border-bottom-left-radius', 'border-bottom-right-radius', 'border-top-left-radius', 'border-top-right-radius'],
  		'border-color': ['border-bottom-color', 'border-left-color', 'border-top-color', 'border-right-color'],
  		'margin': ['margin-top', 'margin-right', 'margin-left', 'margin-bottom'],
  		'padding': ['padding-top', 'padding-right', 'padding-left', 'padding-bottom']
  		}
  	, defaultStyles = {}
  	, s, opacity, getPrefixed, setPrefixed;
  
  // Store all possible styles this platform supports
  s = current(doc.documentElement);
  if (s.length) {
  	var prop;
  	for (var i = 0, n = s.length; i < n; i++) {
  		prop = s[i];
  		defaultStyles[prop] = true;
  	}
  } else {
  	for (prop in s) {
  		defaultStyles[prop] = true;
  	}
  }
  
  // Store opacity property name
  opacity = !defaultStyles['opacity'] && defaultStyles['filter'] ? 'filter' : 'opacity';
  
  // API
  exports.getPrefixed = getPrefixed;
  exports.parseNumber = parseNumber;
  exports.getStyle = getStyle;
  exports.getNumericStyle = getNumericStyle;
  exports.setStyle = setStyle;
  exports.clearStyle = clearStyle;
  exports.getPrefixed = getPrefixed;
  exports.setPrefixed = setPrefixed;
  exports.getShorthand = getShorthand;
  exports.expandShorthand = expandShorthand;
  // CSS transitions feature test
  exports.csstransitions = getPrefixed('transition-duration') !== false;
  
  /**
   * Retrieve the vendor prefixed version of the property
   * @param {String} property
   */
  function getPrefixed(property) {
  	// If property is prefixed, set if necessary and retrieve
  	if (prefixed.hasOwnProperty(property)) {
  		if (!prefixed[property]) setPrefixed(property);
  		property = prefixed[property];
  	}
  	return property;
  }
  
  /**
   * Store the vendor prefixed version of the property
   * @param {String} property
   */
  function setPrefixed(property) {
  	var vendor;
  	// Check if we have unprefixed prop
  	if (defaultStyles[property]) {
  		prefixed[property] = property;
  	}
  	// Try prefixed version
  	for (var i = 0, n = VENDOR_PREFIXES.length; i < n; i++) {
  		vendor = VENDOR_PREFIXES[i];
  		if (!prefixed[property]) {
  			if (defaultStyles[vendor + property]) {
  				prefixed[property] = vendor + property;
  				return;
  			}
  		}
  	}
  }
  
  /**
   * Retrieve a proxy property to use for shorthand properties
   * @param {String} property
   */
  function getShorthand(property) {
  	if (shorthand[property] != null) {
  		return shorthand[property][0];
  	} else {
  		return property;
  	}
  };
  
  /**
   * Expand shorthand properties
   * @param {String} property
   * @param {Object} value
   */
  function expandShorthand(property, value) {
  	if (shorthand[property] != null) {
  		var props = {};
  		for (var i = 0, n = shorthand[property].length; i < n; i++) {
  			props[shorthand[property][i]] = value;
  		}
  		return props;
  	} else {
  		return property;
  	}
  }
  
  /**
   * Parse current opacity value
   * @param {String} value
   * @returns {Number}
   */
  function parseOpacity(value) {
  	var match;
  	if (value === '') {
  		return null;
  	} else if (opacity === 'filter') {
  		match = value.match(RE_IE_OPACITY);
  		if (match != null) {
  			return parseInt(match[1]) / 100;
  		}
  	} else {
  		return parseFloat(value);
  	}
  }
  
  /**
   * Convert opacity to IE filter syntax
   * @param {String} value
   * @returns {String}
   */
  function getOpacityValue(value) {
  	var val = parseFloat(value);
  	if (opacity === 'filter') {
  		val = "alpha(opacity=" + (val * 100) + ")";
  	}
  	return val;
  }
  
  /**
   * Split a value into a number and unit
   * @param {String} value
   * @param {String} property
   * @returns {Array}
   */
  function parseNumber(value, property) {
  	var channels, num, unit, unitTest;
  	// Handle colours
  	if (colour[property]) {
  		// rgb()
  		if (value != null && value.charAt(0) !== '#') {
  			channels = RE_RGB.exec(value);
  			if (channels) {
  				return ["#" + ((1 << 24) | (channels[1] << 16) | (channels[2] << 8) | channels[3]).toString(16).slice(1), 'hex'];
  			} else {
  				return ['#ffffff', 'hex'];
  			}
  		} else {
  			return [value || '#ffffff', 'hex'];
  		}
  	} else {
  		num = parseFloat(value);
  		if (objectUtils.isNaN(num)) {
  			return [value, ''];
  		} else {
  			unitTest = RE_UNITS.exec(value);
  			// Set unit or default
  			unit = (unitTest != null) ? unitTest[1] : ((numeric[property] != null) ? numeric[property] : 'px');
  			return [num, unit];
  		}
  	}
  }
  
  /**
   * Retrieve the style for 'property'
   * @param {Element} element
   * @param {String} property
   * @returns {Object}
   */
  function getStyle(element, property) {
  	var value;
  	if (property === 'opacity') {
  		return parseOpacity(current(element, opacity));
  	}
  	// Retrieve longhand and prefixed version
  	property = getPrefixed(getShorthand(property));
  	value = current(element, property);
  	// Try camelCase
  	if (value == null) {
  		value = current(element, camelCase(property));
  	}
  	switch (value) {
  		case '':
  			return null;
  		case 'auto':
  			return 0;
  		default:
  			return value;
  	}
  }
  
  /**
   * Retrieve the numeric value for 'property'
   * @param {Element} element
   * @param {String} property
   * @returns {Number}
   */
  function getNumericStyle(element, property) {
  	return parseNumber(getStyle(element, property), property);
  }
  
  /**
   * Set the style for 'property'
   * @param {Element} element
   * @param {String} property
   * @param {Object} value
   */
  function setStyle(element, property, value) {
  	// Expand shorthands
  	property = expandShorthand(property, value);
  	// Handle property hash
  	if (objectUtils.isObject(property)) {
  		for (var prop in property) {
  			setStyle(element, prop, property[prop]);
  		}
  		return;
  	}
  	// Fix opacity
  	if (property === 'opacity') {
  		property = opacity;
  		value = getOpacityValue(value);
  	}
  	// Look up prefixed property
  	property = getPrefixed(property);
  	// Look up default numeric unit if none provided
  	if (value !== 'auto'
  		&& value !== 'inherit'
  		&& numeric[property]
  		&& !RE_UNITS.test(value)) {
  			value += numeric[property];
  	}
  	element.style[camelCase(property)] = value;
  }
  
  /**
   * Remove the style for 'property'
   * @param {Element} element
   * @param {String} property
   */
  function clearStyle(element, property) {
  	var isShorthand = shorthand[property] != null
  		, shortProp = property
  		, match, re, style;
  	property = shorthand[property] || property;
  	// Loop through collection
  	if (objectUtils.isArray(property)) {
  		for (var i = 0, n = property.length; i < n; i++) {
  			prop = property[i];
  			clearStyle(element, prop);
  		}
  		// IE uses shorthand syntax when all longhand props have the same value, so remove shorthand too
  		if (isShorthand) {
  			property = shortProp;
  		} else {
  			return;
  		}
  	}
  	style = element.getAttribute('style') || '';
  	re = new RegExp("\\s?" + (getPrefixed(property)) + ":\\s[^;]+");
  	match = re.exec(style);
  	if (match != null) {
  		element.setAttribute('style', style.replace(match + ';', ''));
  	}
  }
  
  /**
   * Retrieve current computed style
   * @param {Element} element
   * @param {String} property
   * @returns {String}
   */
  function current(element, property) {
  	if (win.getComputedStyle) {
  		if (property) {
  			return win.getComputedStyle(element).getPropertyValue(property);
  		} else {
  			return win.getComputedStyle(element);
  		}
  	} else {
  		if (property) {
  			return element.currentStyle[property];
  		} else {
  			return element.currentStyle;
  		}
  	}
  };
  
  /**
   * CamelCase string, removing '-'
   */
  function camelCase(str) {
  	// TODO: check that IE doesn't capitalize -ms prefix
  	return str.replace(/-([a-z])/g, function($0, $1) {
  		return $1.toUpperCase();
  	}).replace('-', '');
  };
  
});