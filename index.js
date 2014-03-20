// TODO: handle setting special shortcut transform properties with arrays (translate, scale)?

var isObject = require('lodash.isobject')
	, isNan = require('lodash.isnan')
	, isArray = require('lodash.isarray')
	, isString = require('lodash.isstring')
	, map = require('lodash.map')
	, win = window
	, doc = window.document
	, el = doc.createElement('div')

		// Hash of unit values
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
			'font-size': 'px',
			'translateX': 'px',
			'translateY': 'px',
			'translateZ': 'px',
			'scaleX': '',
			'scaleY': '',
			'scaleZ': '',
			'rotate': 'deg',
			'rotateX': 'deg',
			'rotateY': 'deg',
			'rotateZ': 'deg',
			'skewX': 'px',
			'skewY': 'px'
		}
	, colour = {
			'background-color': true,
			'color': true,
			'border-color': true
		}
		// Hash of shorthand properties
	, shorthand = {
			'border-radius': ['border-bottom-left-radius', 'border-bottom-right-radius', 'border-top-left-radius', 'border-top-right-radius'],
			'border-color': ['border-bottom-color', 'border-left-color', 'border-top-color', 'border-right-color'],
			'margin': ['margin-top', 'margin-right', 'margin-left', 'margin-bottom'],
			'padding': ['padding-top', 'padding-right', 'padding-left', 'padding-bottom']
		}
		// Hash of transform properties
	, transform = {
			'transform': true,
			'translate': true,
			'translateX': true,
			'translateY': true,
			'translate3d': true,
			'translateZ': true,
			'rotate': true,
			'rotate3d': true,
			'rotateX': true,
			'rotateY': true,
			'rotateZ': true,
			'scale': true,
			'scaleX': true,
			'scaleY': true,
			'scale3d': true,
			'scaleZ': true,
			'skewX': true,
			'skewY': true,
			'perspective': true,
			'matrix': true,
			'matrix3d': true
		}

	, platformStyles = {}
	, platformPrefix = ''

	, RE_UNITS = /(px|%|em|ms|s|deg)$/
	, RE_IE_OPACITY = /opacity=(\d+)/i
	, RE_RGB = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/
	, RE_MATRIX = /^matrix(?:3d)?\(([^\)]+)/
	, VENDOR_PREFIXES = ['-webkit-', '-moz-', '-ms-', '-o-']
	, MATRIX_IDENTITY = [[1, 0, 0, 1, 0, 0], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]]
	, MATRIX_PROPERTY_INDEX = {
		translateX: [4,12],
		translateY: [5,13],
		translateZ: [null,14],
		scaleX: [0,0],
		scaleY: [3,5],
		scaleZ: [null,10],
		rotate: [0,0],
		rotateX: [null,5],
		rotateY: [null,0],
		rotateZ: [null,0],
		skewY: [1,1],
		skewX: [2,2]
	};

// Store all possible styles this platform supports
var s = current(doc.documentElement)
	, add = function (prop) {
			platformStyles[prop] = true;
			// Grab the prefix style
			if (!platformPrefix && prop.charAt(0) == '-') {
				platformPrefix = /^-\w+-/.exec(prop)[0];
			}
		};

if (s.length) {
	for (var i = 0, n = s.length; i < n; i++) {
		add(s[i]);
	}
} else {
	for (var prop in s) {
		add(prop);
	}
}

// Store opacity property name (normalize IE opacity/filter)
var opacity = !platformStyles['opacity'] && platformStyles['filter'] ? 'filter' : 'opacity';

// API
exports.isSupported = isSupported;
exports.getPrefixed = getPrefixed;
exports.getShorthand = getShorthand;
exports.getAll = getAll;
exports.expandShorthand = expandShorthand;
exports.parseOpacity = parseOpacity;
exports.getOpacityValue = getOpacityValue;
exports.parseNumber = parseNumber;
exports.parseTransform = parseTransform;
exports.getStyle = getStyle;
exports.getNumericStyle = getNumericStyle;
exports.getDocumentStyle = getDocumentStyle;
exports.setStyle = setStyle;
exports.clearStyle = clearStyle;
exports.platformStyles = platformStyles;
exports.platformPrefix = platformPrefix;
// CSS3 feature tests (also forces cache inclusion)
exports.hasTransitions = isSupported('transition');
exports.hasTransforms = isSupported('transform');
exports.has3DTransforms = (function () {
	if (exports.hasTransforms) {
		var prop = camelCase(getPrefixed('transform'));
		el.style[prop] = 'translateZ(10px)';
		return el.style[prop] != '';
	}
	return false;
})();

/**
 * Determine if 'property' is supported on this platform
 * @returns {Boolean}
 */
function isSupported (property) {
	var props = [property, platformPrefix + property]
		, support = false
		, prop;

	for (var i = 0, n = props.length; i < n; i++) {
		prop = props[i];
		// Use cached
		if (exports.platformStyles[prop]) return true;
		if (typeof el.style[prop] === 'string'
			|| typeof el.style[camelCase(prop)] === 'string') {
				support = true;
				exports.platformStyles[prop] = true;
				break;
		}
	}

	return support;
}

/**
 * Retrieve the vendor prefixed version of the property
 * @param {String} property
 * @returns {String}
 */
function getPrefixed (property) {
	if (typeof property === 'string') {
		// Handle transform pseudo-properties
		if (transform[property]) {
			property = 'transform';
		}

		if (exports.platformStyles[property]) return property;

		if (isSupported(property)) {
			if (exports.platformStyles[platformPrefix + property]) {
				property = platformPrefix + property;
			}
		}
	}

	return property;
}

/**
 * Retrieve a proxy property to use for shorthand properties
 * @param {String} property
 * @returns {String}
 */
function getShorthand (property) {
	if (shorthand[property] != null) {
		return shorthand[property][0];
	} else {
		return property;
	}
}

/**
 * Retrieve all possible variations of the property
 * @param {String} property
 * @returns {Array}
 */
function getAll (property) {
	var all = [];

	// Handle transform pseudo-properties
	if (transform[property]) {
		property = 'transform';
	}

	all.push(property);
	// Handle shorthands
	if (shorthand[property]) {
		all = all.concat(shorthand[property]);
	}
	// Automatically add vendor prefix
	for (var i = 0, n = all.length; i < n; i++) {
		all.push(platformPrefix + all[i]);
	}

	return all;
}

/**
 * Expand shorthand properties
 * @param {String} property
 * @param {Object} value
 * @returns {Object|String}
 */
function expandShorthand (property, value) {
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
function parseOpacity (value) {
	var match;
	if (value === '') {
		return null;
	// IE case
	} else if (opacity === 'filter') {
		match = value.match(RE_IE_OPACITY);
		if (match != null) {
			return parseInt(match[1], 10) / 100;
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
function getOpacityValue (value) {
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
function parseNumber (value, property) {
	var channels, num, unit, unitTest;

	if (value == null || value == 'none') {
		value = 0;
	}

	// Handle arrays of values (translate, scale)
	if (isArray(value)) {
		return map(value, function (val) {
			return parseNumber(val, property);
		});
	}

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

	// Handle numbers
	} else {
		num = parseFloat(value);
		if (isNan(num)) {
			return [value, ''];
		} else {
			unitTest = RE_UNITS.exec(value);
			// Set unit or default
			unit = (unitTest != null)
				? unitTest[1]
				: ((numeric[property] != null)
						? numeric[property]
						: 'px');
			return [num, unit];
		}
	}
}

/**
 * Retrieve a 'property' from a transform 2d or 3d 'matrix'
 * @param {String|Array} matrix
 * @param {String} property
 * @returns {String|Number|Array}
 */
function parseTransform (matrix, property) {
	var m = matrixStringToArray(matrix)
		, is3D = (m && m.length > 6) ? 1 : 0;

	if (m) {
		switch (property) {
			case 'matrix':
			case 'matrix3d':
				return m;
			case 'translateX':
			case 'translateY':
				return ''
					+ m[MATRIX_PROPERTY_INDEX[property][is3D]]
					+ 'px';
			case 'translateZ':
				return ''
					+ (is3D ? m[MATRIX_PROPERTY_INDEX[property][is3D]] : '0')
					+ 'px';
			case 'translate':
				return [parseTransform(matrix, 'translateX'), parseTransform(matrix, 'translateY')];
			case 'translate3d':
				return [parseTransform(matrix, 'translateX'), parseTransform(matrix, 'translateY'), parseTransform(matrix, 'translateZ')];
			case 'scaleX':
			case 'scaleY':
				return m[MATRIX_PROPERTY_INDEX[property][is3D]];
			case 'scaleZ':
				return is3D ? m[10] : 1;
			case 'scale':
				return [parseTransform(matrix, 'scaleX'), parseTransform(matrix, 'scaleY')];
			case 'scale3d':
				return [parseTransform(matrix, 'scaleX'), parseTransform(matrix, 'scaleY'), parseTransform(matrix, 'scaleZ')];
			case 'rotate':
			case 'rotateY':
			case 'rotateZ':
				return ''
					+ (Math.acos(m[0]) * 180) / Math.PI
					+ 'deg';
			case 'rotateX':
				return ''
					+ (Math.acos(m[5]) * 180) / Math.PI
					+ 'deg';
			case 'skewX':
				return ''
					+ (Math.atan(m[2]) * 180) / Math.PI
					+ 'deg';
			case 'skewY':
				return ''
					+ (Math.atan(m[1]) * 180) / Math.PI
					+ 'deg';
		}
	}

	return matrix;
}

/**
 * Convert a matrix property to a transform style string
 * Handles existing transforms and special grouped properties
 * @param {Element} element
 * @param {String} property
 * @param {String|Array} value
 * @returns {String}
 */
function generateTransform (element, property, value) {
	var matrix = current(element, getPrefixed(property))
		, m, m1, is3D, idx, len;

	if (matrix == 'none') matrix = '';

	// Reset existing matrix, preserving translations
	if (matrix) {
		if (m = matrixStringToArray(matrix)) {
			is3D = m.length > 6 ? 1 : 0;
			len = is3D ? 3 : 2;
			idx = is3D ? 12 : 4;
			// Preserve translations
			if (!(~property.indexOf('translate'))) {
				m1 = MATRIX_IDENTITY[is3D].slice(0, idx)
					.concat(m.slice(idx, idx + len));
				if (is3D) m1.push(MATRIX_IDENTITY[is3D].slice(-1));
				m = m1;
			// Preserve translations and nullify changed
			} else {
				if (property == 'translate' || property == 'translate3d') {
					m1 = m.slice(0, idx)
						.concat(MATRIX_IDENTITY[is3D].slice(idx, idx + len));
					if (is3D) m1.push(m.slice(-1));
					m = m1;
				} else if (property == 'translateX' || property == 'translateY' || property == 'translateZ') {
					idx = MATRIX_PROPERTY_INDEX[property][is3D];
					if (idx) m[idx] = MATRIX_IDENTITY[is3D][idx];
				}
			}

			matrix = is3D ? 'matrix3d' : 'matrix'
				+ '('
				+ m.join(', ')
				+ ') ';
		}
	}

	if (numeric[property] != null) {
		return ''
			+ matrix
			+ property
			+ '('
			+ value
			+ ')';
	// Grouped properties
	} else {
		switch (property) {
			case 'transform':
			case 'transform3d':
				return value;
			case 'matrix':
			case 'matrix3d':
				return ''
					+ property
					+ '('
					+ value
					+ ')';
			case 'translate':
			case 'translate3d':
				if (isArray(value)) {
					// Add default unit
					value = map(value, function(item) {
						return !isString(item) ? item + 'px': item;
					})
					.join(', ');
				}
				return ''
					+ matrix
					+ property
					+ '('
					+ value
					+ ')';
			case 'scale':
			case 'scale3d':
				if (isArray(value)) {
					value = value.join(', ');
				}
				return ''
					+ matrix
					+ property
					+ '('
					+ value
					+ ')';
		}
	}
}

/**
 * Retrieve the style for 'property'
 * @param {Element} element
 * @param {String} property
 * @returns {Object}
 */
function getStyle (element, property) {
	var prop, value;

	// Special case for opacity
	if (property === 'opacity') {
		return parseOpacity(current(element, opacity));
	}

	// Retrieve longhand and prefixed version
	prop = getPrefixed(getShorthand(property));
	value = current(element, prop);

	// Special case for transform
	if (transform[property]) {
		return parseTransform(value, property);
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
function getNumericStyle (element, property) {
	return parseNumber(getStyle(element, property), property);
}

/**
 * Retrieve the 'property' for matching 'selector' rule in all document stylesheets
 * @param {String} selector
 * @param {String} property
 * @returns {String}
 */
function getDocumentStyle (selector, property) {
	var styleSheets = document.styleSheets
		, sheet, rules, rule;

	if (styleSheets) {
		for (var i = 0, n = styleSheets.length; i < n; i++) {
			sheet = styleSheets[i];
			if (rules = sheet.rules || sheet.cssRules) {
				for (var j = 0, m = rules.length; j < m; j++) {
					rule = rules[j];
					if (selector === rule.selectorText) {
						return rule.style.getPropertyValue(property);
					}
				}
			}
		}
	}

	return '';
}

/**
 * Set the style for 'property'
 * @param {Element} element
 * @param {String|Object} property
 * @param {Object} value
 */
function setStyle (element, property, value) {
	var prop, matrix;

	// Expand shorthands
	prop = expandShorthand(property, value);
	// Handle property hash returned from expandShorthand
	if (isObject(prop)) {
		for (var p in prop) {
			setStyle(element, p, prop[p]);
		}
		return;
	}

	// Handle opacity
	if (prop === 'opacity') {
		prop = opacity;
		value = getOpacityValue(value);
	}

	// Look up default numeric unit if none provided
	if (value !== 'auto'
		&& value !== 'inherit'
		&& numeric[prop]
		&& !RE_UNITS.test(value)) {
			value += numeric[prop];
	}

	// Look up prefixed property
	prop = getPrefixed(prop);

	// Handle special transform properties
	// TODO: bulk multiple transforms?
	if (transform[property]) {
		value = generateTransform(element, property, value);
	}

	element.style[camelCase(prop)] = value;
}

/**
 * Remove the style for 'property'
 * @param {Element} element
 * @param {String} property
 */
function clearStyle (element, property) {
	var style = element.getAttribute('style') || ''
		, re;

	if (style) {
		property = getAll(property).join('[\\w-]*|') + '[\\w-]*';

		re = new RegExp('(?:^|\\s)(?:' + property + '):\\s?[^;]+;', 'ig');
		element.setAttribute('style', style.replace(re, ''));
	}
}

/**
 * Retrieve current computed style
 * @param {Element} element
 * @param {String} property
 * @returns {String}
 */
function current (element, property) {
	var value;

	if (win.getComputedStyle) {
		if (property) {
			value = win.getComputedStyle(element).getPropertyValue(property);
			// Try with camel casing
			if (value == null) win.getComputedStyle(element).getPropertyValue(camelCase(property));
			return value;
		} else {
			return win.getComputedStyle(element);
		}
	// IE
	} else {
		if (property) {
			value = element.currentStyle[property];
			// Try with camel casing
			if (value == null) element.currentStyle[camelCase(property)];
			return value;
		} else {
			return element.currentStyle;
		}
	}
}

/**
 * CamelCase 'str, removing '-'
 * @param {String} str
 * @returns {String}
 */
function camelCase (str) {
	// IE requires vendor prefixed values to start with lowercase
	if (str.indexOf('-ms-') == 0) str = str.slice(1);
	return str.replace(/-([a-z]|[0-9])/ig, function(all, letter) {
		return (letter + '').toUpperCase();
	});
}

/**
 * Convert 'matrix' to Array
 * @param {String|Array} matrix
 * @returns {Array}
 */
function matrixStringToArray (matrix) {
	if (isArray(matrix)) {
		return matrix;
	} else if (re = matrix.match(RE_MATRIX)) {
		// Convert string to array
		return re[1].split(', ')
			.map(function (item) {
				return parseFloat(item);
			});
	}
}
