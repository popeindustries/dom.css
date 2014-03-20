var style, expect, element;

// Make it work in node..
try {
	style = require('../index.js');
	expect = require('expect.js');
	require('./sauce.js');
// .. or browser
} catch (err) {
	style = require('./style');
	expect = window.expect;
}

function findPrefixedProp () {
	for (var prop in style.platformStyles) {
		if (~prop.indexOf(style.platformPrefix)) return prop.slice(style.platformPrefix.length);
	}
}

describe('style', function () {
	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});
	afterEach(function () {
		document.body.removeChild(element);
	});

	describe('isSupported', function () {
		it('should return "true" for a supported property', function () {
			expect(style.isSupported('display')).to.be.ok();
		});
		it('should return "false" for an unsupported property', function () {
			expect(style.isSupported('foo')).to.not.be.ok();
		});
		it('should return "true" for a prefixed property', function () {
			expect(style.isSupported(findPrefixedProp())).to.be.ok();
		});
		it('should cache supported styles in "platformStyles"', function () {
			var defaults = style.platformStyles
				, cached;
			style.platformStyles = {};
			style.isSupported('display');
			cached = 'display' in style.platformStyles;
			style.platformStyles = defaults;
			expect(cached).to.be.ok();
		});
	});

	describe('getPrefixed', function () {
		before(function() {
			this.defaults = style.platformStyles;
			style.platformStyles = {};
			style.platformStyles[style.platformPrefix + 'transition'] = true;
			style.platformStyles[style.platformPrefix + 'transform'] = true;
		});
		after(function() {
			style.platformStyles = this.defaults;
		})
		it('should return a prefixed property name when passed the non-prefixed version', function () {
			var prop = findPrefixedProp();
			expect(style.getPrefixed(prop)).to.equal(style.platformPrefix + prop);
		});
		it('should return the correct transform property when passed a transform pseudo-property', function () {
			var prop = style.getPrefixed('translate');
			expect(prop).to.equal(style.platformPrefix + 'transform');
		});
	});

	describe('getAll', function () {
		it('should return an array of all possible property names', function () {
			var props = style.getAll('border-radius');
			expect(props).to.contain('border-radius');
			expect(props.length).to.be.greaterThan(4);
		});
		it('should correctly handle transform pseudo-properties', function () {
			var props = style.getAll('translate');
			expect(props).to.contain('transform');
		});
	});

	describe('parseNumber', function () {
		it('should return a unit property of "%" when passed a percentage value', function () {
			expect(style.parseNumber('100%')[1]).to.equal('%');
		});
		it('should return a unit property of "px" when passed a number value with no unit', function () {
			expect(style.parseNumber(100)[1]).to.equal('px');
		});
		it('should return a unit property of "px" when passed a numeric string value with no unit', function () {
			expect(style.parseNumber('100')[1]).to.equal('px');
		});
		it('should return a unit property of "" when passed a string with no unit', function () {
			expect(style.parseNumber('left')[1]).to.equal('');
		});
		it('should return a num property that is a Number when passed a number as string', function () {
			expect(style.parseNumber('100px')[0]).to.equal(100);
		});
		it('should return the original value when passed a non-numeric string', function () {
			expect(style.parseNumber('float')[0]).to.equal('float');
		});
	});

	describe('parseTransform', function () {
		it('should return the passed value when not passed a transfrom matrix string or array', function () {
			expect(style.parseTransform('17px', 'perspective')).to.equal('17px');
		});
		it('should return a matrix array when passed a 2d transfrom matrix array and property "matrix"', function () {
			expect(style.parseTransform([1, 0, 0, 1, 0, 0], 'matrix')).to.eql([1,0,0,1,0,0]);
		});
		it('should return a matrix array when passed a 2d transfrom matrix string and property "matrix"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 1, 0, 0)', 'matrix')).to.eql([1,0,0,1,0,0]);
		});
		it('should return a matrix array when passed a 3d transfrom matrix string and property "matrix3d"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1)', 'matrix3d')).to.eql([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1]);
		});
		it('should return a pixel value when passed a 2d transform matrix string and property "translateX"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 1, 100, 0)', 'translateX')).to.equal('100px');
		});
		it('should return a pixel value when passed a 3d transform matrix string and property "translateX"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1)', 'translateX')).to.equal('100px');
		});
		it('should return a pixel value when passed a 2d transform matrix string and property "translateY"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 1, 0, 100)', 'translateY')).to.equal('100px');
		});
		it('should return a pixel value when passed a 3d transform matrix string and property "translateY"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 100, 0, 1)', 'translateY')).to.equal('100px');
		});
		it('should return a pixel value when passed a 3d transform matrix string and property "translateZ"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 100, 1)', 'translateZ')).to.equal('100px');
		});
		it('should return 0 when passed a 2d transform matrix string and property "translateZ"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 1, 0, 0)', 'translateZ')).to.equal('0px');
		});
		it('should return an array of pixel values when passed a 2d transform matrix string and property "translate"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 1, 100, 100)', 'translate')).to.eql(['100px', '100px']);
		});
		it('should return an array of pixel values when passed a 3d transform matrix string and property "translate3d"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 100, 100, 1)', 'translate3d')).to.eql(['100px', '100px', '100px']);
		});
		it('should return a numeric value when passed a 2d transform matrix string and property "scaleX"', function () {
			expect(style.parseTransform('matrix(0.5, 0, 0, 0.5, 0, 0)', 'scaleX')).to.equal(0.5);
		});
		it('should return a numeric value when passed a 2d transform matrix string and property "scaleY"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 0.5, 0, 0)', 'scaleY')).to.equal(0.5);
		});
		it('should return a numeric value when passed a 3d transform matrix string and property "scaleZ"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1)', 'scaleZ')).to.equal(0.5);
		});
		it('should return 1 when passed a 2d transform matrix string and property "scaleZ"', function () {
			expect(style.parseTransform('matrix(1, 0, 0, 1, 0, 0)', 'scaleZ')).to.equal(1);
		});
		it('should return an array of numeric values when passed a 2d transform matrix string and property "scale"', function () {
			expect(style.parseTransform('matrix(0.5, 0, 0, 0.5, 0, 0)', 'scale')).to.eql([0.5, 0.5]);
		});
		it('should return an array of numeric values when passed a 3d transform matrix string and property "scale3d"', function () {
			expect(style.parseTransform('matrix3d(0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1)', 'scale3d')).to.eql([0.5, 0.5, 0.5]);
		});
		it('should return a degree value when passed a 2d transform matrix string and property "rotate"', function () {
			expect(style.parseTransform('matrix(0.7071067811865476, 0.7071067811865475, -0.7071067811865475, 0.7071067811865476, 0, 0)', 'rotate')).to.equal('45deg');
		});
		it('should return a degree value when passed a 3d transform matrix string and property "rotateX"', function () {
			expect(style.parseTransform('matrix3d(1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 0, 0, 0, 1)', 'rotateX')).to.equal('45deg');
		});
		it('should return a degree value when passed a 3d transform matrix string and property "rotateY"', function () {
			expect(style.parseTransform('matrix3d(0.7071067811865476, 0, -0.7071067811865475, 0, 0, 1, 0, 0, 0.7071067811865475, 0, 0.7071067811865476, 0, 0, 0, 0, 1)', 'rotateY')).to.equal('45deg');
		});
		it('should return a degree value when passed a 2d transform matrix string and property "skewX"', function () {
			expect(style.parseTransform('matrix(1, 0, 0.9999999999999999, 1, 0, 0)', 'skewX')).to.equal('45deg');
		});
		it('should return a degree value when passed a 2d transform matrix string and property "skewY"', function () {
			expect(style.parseTransform('matrix(1, 0.9999999999999999, 0, 1, 0, 0)', 'skewY')).to.equal('45deg');
		});
	});

	describe('getShorthand', function () {
		it('should return a longhand property', function () {
			expect(style.getShorthand('margin')).to.equal('margin-top');
		});
	});

	describe('expandShorthand', function () {
		it('should return an array of longhand properties', function () {
			var props;
			props = style.expandShorthand('margin', '10px');
			expect(props).to.have.property('margin-top');
			expect(props).to.have.property('margin-bottom');
			expect(props).to.have.property('margin-left');
			expect(props).to.have.property('margin-left');
		});
	});

	describe('getStyle', function () {
		it('should return the default for an unset style', function () {
			expect(style.getStyle(element, 'display')).to.equal('block');
		});
		it('should return the style for a set style', function () {
			element.style['display'] = 'inline';
			expect(style.getStyle(element, 'display')).to.equal('inline');
		});
		it('should return a value for a set "transform" style', function () {
			element.style[style.getPrefixed('transform')] = 'translateX(100px)';
			if (style.hasTransforms) {
				expect(style.getStyle(element, 'transform')).to.equal('matrix(1, 0, 0, 1, 100, 0)');
			} else {
				expect(style.getStyle(element, 'transfrom')).to.equal(null);
			}
		});
		it('should return a value for a set "translate" shortcut transform style', function () {
			element.style[style.getPrefixed('transform')] = 'translateX(100px)';
			if (style.hasTransforms) {
				expect(style.getStyle(element, 'translateX')).to.equal('100px');
			} else {
				expect(style.getStyle(element, 'translateX')).to.equal(null);
			}
		});
	});

	describe('getNumericStyle', function () {
		it('should return an array composed of value and unit', function () {
			element.style['height'] = '100px';
			expect(style.getNumericStyle(element, 'height')).to.eql([100, 'px']);
		});
		it('should return an array composed of value and unit for "rotate"', function () {
			element.style[style.getPrefixed('transform')] = 'rotate(45deg)';
			if (style.hasTransforms) {
				var val = style.getNumericStyle(element, 'rotate');
				expect(Math.round(val[0])).to.eql(45);
				expect(val[1]).to.eql('deg');
			} else {
				expect(style.getNumericStyle(element, 'rotate')).to.eql(null);
			}
		});
		it('should return multiple arrays composed of value and unit for "translate"', function () {
			element.style[style.getPrefixed('transform')] = 'translate(100px, 100px)';
			if (style.hasTransforms) {
				expect(style.getNumericStyle(element, 'translate')).to.eql([[100, 'px'], [100, 'px']]);
			} else {
				expect(style.getNumericStyle(element, 'translate')).to.eql(null);
			}
		});
	});

	describe('getDocumentStyle', function () {
		it('should be testable but Mocha is doing something that prevents access to loaded style rules')
	});

	describe('setStyle', function () {
		it('should set the correct element style', function () {
			style.setStyle(element, 'float', 'left');
			expect(element.style['float']).to.equal('left');
		});
		it('should set the correct element style when passed a group of properties', function () {
			style.setStyle(element, {
				'float': 'left',
				'width': '100px',
				'height': 100
			});
			expect(element.style['width']).to.equal('100px');
		});
		it('should set all expanded styles for a shorthand property', function () {
			style.setStyle(element, 'margin', '10px');
			expect(element.style['marginTop']).to.equal('10px');
			expect(element.style['marginBottom']).to.equal('10px');
			expect(element.style['marginLeft']).to.equal('10px');
			expect(element.style['marginRight']).to.equal('10px');
		});
		it('should set a numeric unit for all expanded styles of a shorthand property without unit', function () {
			style.setStyle(element, 'padding', 10);
			expect(element.style['paddingTop']).to.equal('10px');
			expect(element.style['paddingBottom']).to.equal('10px');
			expect(element.style['paddingLeft']).to.equal('10px');
			expect(element.style['paddingRight']).to.equal('10px');
		});
		it('should replace an existing style value', function () {
			element.style['float'] = 'left';
			style.setStyle(element, 'float', 'right');
			expect(element.style['float']).to.equal('right');
		});
		it('should replace an existing style value when many styles are set', function () {
			element.style['float'] = 'left';
			element.style['width'] = '100px';
			element.style['height'] = '100px';
			style.setStyle(element, 'width', '200px');
			expect(element.style['width']).to.equal('200px');
		});
		it('should set "transform" property', function () {
			style.setStyle(element, 'transform', 'translate(100px, 100px)');
			expect(element.style[style.getPrefixed('transform')]).to.equal('translate(100px, 100px)');
		});
		it('should set shortcut transform properties', function () {
			style.setStyle(element, 'translateX', '100px');
			expect(element.style[style.getPrefixed('transform')]).to.equal('translateX(100px)');
		});
		it('should set shortcut transform properties when passed a numeric value', function () {
			style.setStyle(element, 'translateX', 100);
			expect(element.style[style.getPrefixed('transform')]).to.equal('translateX(100px)');
		});
		it('should set "translate" shortcut property when passed an array', function () {
			style.setStyle(element, 'translate', [100, 100]);
			expect(element.style[style.getPrefixed('transform')]).to.equal('translate(100px, 100px)');
		});
		it('should set "translate" shortcut property when passed an array of strings', function () {
			style.setStyle(element, 'translate', ['100px', '100px']);
			expect(element.style[style.getPrefixed('transform')]).to.equal('translate(100px, 100px)');
		});
		if (style.has3DTransforms) {
			it('should set "translate3d" shortcut property when passed an array', function () {
				style.setStyle(element, 'translate3d', [100, 100, 100]);
				expect(element.style[style.getPrefixed('transform')]).to.equal('translate3d(100px, 100px, 100px)');
			});
			it('should set "scale3d" shortcut property when passed an array', function () {
				style.setStyle(element, 'scale3d', [0.5, 0.5, 0.5]);
				expect(element.style[style.getPrefixed('transform')]).to.equal('scale3d(0.5, 0.5, 0.5)');
			});
			it('should preserve existing 2d translation transform properties when setting special 3d translation transform shortcut properties', function () {
				style.setStyle(element, 'translateY', '100px');
				style.setStyle(element, 'translateZ', '200px');
				expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 100, 200, 1)');
			});
		}
		it('should set "scale" shortcut property when passed an array', function () {
			style.setStyle(element, 'scale', [0.5, 0.4]);
			expect(element.style[style.getPrefixed('transform')]).to.equal('scale(0.5, 0.4)');
		});
		it('should preserve existing translation transform properties when setting special translation transform pseudo-properties', function () {
			style.setStyle(element, 'translateY', '100px');
			style.setStyle(element, 'translateX', '100px');
			expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix(1, 0, 0, 1, 100, 100)');
		});
		it('should preserve existing translation transform properties when setting special non-translation transform pseudo-properties', function () {
			style.setStyle(element, 'translateY', '100px');
			style.setStyle(element, 'scale', [0.5,0.5]);
			expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix(0.5, 0, 0, 0.5, 0, 100)');
		});
		it('should preserve existing non-translation transform properties when setting special translation transform pseudo-properties', function () {
			style.setStyle(element, 'scale', [0.5,0.5]);
			style.setStyle(element, 'translateY', '100px');
			expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix(0.5, 0, 0, 0.5, 0, 50)');
		});
		it('should overwrite existing translation transform properties of the same type when setting special translation transform pseudo-properties', function () {
			style.setStyle(element, 'translateY', '100px');
			style.setStyle(element, 'translateY', 200);
			expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix(1, 0, 0, 1, 0, 200)');
		});
		it('should overwrite existing translation transform properties of the same type when setting special grouped translation transform pseudo-properties', function () {
			style.setStyle(element, 'translateY', '100px');
			style.setStyle(element, 'translate', [100, 200]);
			expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix(1, 0, 0, 1, 100, 200)');
		});
		it('should overwrite existing non-translation transform properties when setting special non-translation transform pseudo-properties', function () {
			style.setStyle(element, 'rotate', '45deg');
			style.setStyle(element, 'scale', [0.5, 0.5]);
			expect(window.getComputedStyle(element).getPropertyValue(style.getPrefixed('transform'))).to.equal('matrix(0.5, 0, 0, 0.5, 0, 0)');
		});
	});

	describe('clearStyle', function () {
		it('should completely remove the style rule from a setStyle() call', function () {
			style.setStyle(element, {
				'float': 'left',
				'width': 100,
				'height': 100
			});
			style.clearStyle(element, 'float');
			var styl = element.getAttribute('style');
			expect(styl).not.to.contain('float');
			expect(styl).to.contain('width');
			expect(styl).to.contain('height');
		});
		it('should completely remove a prefixed style rule from a setStyle() call', function () {
			style.setStyle(element, {
				'transition': 'all 250ms ease-out',
				'width': 100,
				'height': 100
			});
			style.clearStyle(element, 'transition');
			var styl = element.getAttribute('style');
			expect(styl).not.to.contain('transition');
			expect(styl).to.contain('width');
			expect(styl).to.contain('height');
		});
		it('should completely remove a shorthand style rule from a setStyle() call', function () {
			style.setStyle(element, {
				'border-radius': '10px',
				'width': 100,
				'height': 100
			});
			style.clearStyle(element, 'border-radius');
			var styl = element.getAttribute('style');
			expect(styl).not.to.contain('border-radius');
			expect(styl).to.contain('width');
			expect(styl).to.contain('height');
		});
		it('should completly remove a transform style rule from a setStyle() call', function () {
			style.setStyle(element, {
				'transform': 'translate(100px, 100px)',
				'width': 100,
				'height': 100
			});
			style.clearStyle(element, 'transform');
			var styl = element.getAttribute('style');
			expect(styl).not.to.contain('transform');
			expect(styl).to.contain('width');
			expect(styl).to.contain('height');
		});
		it('should completly remove a special pseudo-property transform style rule from a setStyle() call', function () {
			style.setStyle(element, {
				'translateX': 100,
				'width': 100,
				'height': 100
			});
			style.clearStyle(element, 'translateX');
			var styl = element.getAttribute('style');
			expect(styl).not.to.contain('translateX');
			expect(styl).to.contain('width');
			expect(styl).to.contain('height');
		});
	});
});
