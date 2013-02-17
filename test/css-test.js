var css, expect, element;

// Make it work in node..
try {
  css = require('../index.js');
  expect = require('expect.js');
// .. or browser
} catch (err) {
  css = require('./dom.css');
  expect = window.expect;
}

describe('dom.css', function() {
  describe('helper functions', function() {
    describe('getPrefixed()', function() {
      it('should return a prefixed property name when passed the non-prefixed version or false if not supported', function() {
        var prop = css.getPrefixed('transition-duration')
          , props = ['-webkit-transition-duration', '-moz-transition-duration', '-ms-transition-duration', '-o-transition-duration', 'transition-duration'];
        if (prop) {
          expect(props).to.contain(prop);
        } else {
          expect(prop).to.not.be.ok();
        }
      });
    });
    describe('parseNumber()', function() {
      it('should return a unit property of "%" when passed a percentage value', function() {
        expect(css.parseNumber('100%')[1]).to.eql('%');
      });
      it('should return a unit property of "px" when passed a number value with no unit', function() {
        expect(css.parseNumber(100)[1]).to.eql('px');
      });
      it('should return a unit property of "px" when passed a numeric string value with no unit', function() {
        expect(css.parseNumber('100')[1]).to.eql('px');
      });
      it('should return a unit property of "" when passed a string with no unit', function() {
        expect(css.parseNumber('left')[1]).to.eql('');
      });
      it('should return a num property that is a Number when passed a number as string', function() {
        expect(css.parseNumber('100px')[0]).to.eql(100);
      });
      it('should return the original value when passed a non-numeric string', function() {
        expect(css.parseNumber('float')[0]).to.eql('float');
      });
    });
    describe('getShorthand()', function() {
      it('should return a longhand property', function() {
        expect(css.getShorthand('margin')).to.eql('margin-top');
      });
    });
    describe('expandShorthand()', function() {
      var props;
      props = css.expandShorthand('margin', '10px');
      it('should return an array of longhand properties', function() {
        expect(props).to.have.property('margin-top');
        expect(props).to.have.property('margin-bottom');
        expect(props).to.have.property('margin-left');
        expect(props).to.have.property('margin-left');
      });
    });
  });
  describe('getStyle()', function() {
    beforeEach(function() {
      element = document.createElement('div');
      document.body.appendChild(element);
    });
    afterEach(function() {
      document.body.removeChild(element);
    });
    it('should return the default for an unset style', function() {
      expect(css.getStyle(element, 'display')).to.eql('block');
    });
    it('should return the style for a set style', function() {
      element.style['display'] = 'inline';
      expect(css.getStyle(element, 'display')).to.eql('inline');
    });
  });
  describe('setStyle()', function() {
    beforeEach(function() {
      element = document.createElement('div');
      document.body.appendChild(element);
    });
    afterEach(function() {
      document.body.removeChild(element);
    });
    it('should set the correct element style', function() {
      css.setStyle(element, 'float', 'left');
      expect(element.style['float']).to.eql('left');
    });
    it('should set the correct element style when passed a group of properties', function() {
      css.setStyle(element, {
        'float': 'left',
        'width': '100px',
        'height': 100
      });
      expect(element.style['width']).to.eql('100px');
    });
    it('should set all expanded styles for a shorthand property', function() {
      css.setStyle(element, 'margin', '10px');
      expect(element.style['marginTop']).to.eql('10px');
      expect(element.style['marginBottom']).to.eql('10px');
      expect(element.style['marginLeft']).to.eql('10px');
      expect(element.style['marginRight']).to.eql('10px');
    });
    it('should set a numeric unit for all expanded styles of a shorthand property without unit', function() {
      css.setStyle(element, 'padding', 10);
      expect(element.style['paddingTop']).to.eql('10px');
      expect(element.style['paddingBottom']).to.eql('10px');
      expect(element.style['paddingLeft']).to.eql('10px');
      expect(element.style['paddingRight']).to.eql('10px');
    });
    it('should replace an existing style value', function() {
      element.style['float'] = 'left';
      css.setStyle(element, 'float', 'right');
      expect(element.style['float']).to.eql('right');
    });
    it('should replace an existing style value when many styles are set', function() {
      element.style['float'] = 'left';
      element.style['width'] = '100px';
      element.style['height'] = '100px';
      css.setStyle(element, 'width', '200px');
      expect(element.style['width']).to.eql('200px');
    });
  });
  describe('opacity styles', function() {
    beforeEach(function() {
      element = document.createElement('div');
      document.body.appendChild(element);
    });
    afterEach(function() {
      document.body.removeChild(element);
    });
    it('should return a float when Opacity is set to a float value', function() {
      css.setStyle(element, 'opacity', 0.5);
      expect(css.getStyle(element, 'opacity')).to.eql(0.5);
    });
    it('should return a float when Opacity is set to a string value', function() {
      css.setStyle(element, 'opacity', '0.5');
      expect(css.getStyle(element, 'opacity')).to.eql(0.5);
    });
  });
  describe('clearStyle()', function() {
    beforeEach(function() {
      element = document.createElement('div');
      document.body.appendChild(element);
    });
    afterEach(function() {
      document.body.removeChild(element);
    });
    it('should completely remove the style rule from a setStyle() call', function() {
      css.setStyle(element, {
        'float': 'left',
        'width': 100,
        'height': 100
      });
      css.clearStyle(element, 'float');
      expect(element.getAttribute('style')).not.to.contain('float');
    });
    it('should completely remove a prefixed style rule from a setStyle() call', function() {
      css.setStyle(element, {
        'box-shadow': '0px',
        'width': 100,
        'height': 100
      });
      css.clearStyle(element, 'box-shadow');
      expect(element.getAttribute('style')).not.to.contain('box-shadow');
    });
    it('should completely remove a shorthand style rule from a setStyle() call', function() {
      css.setStyle(element, {
        'margin': '10px',
        'width': 100,
        'height': 100
      });
      css.clearStyle(element, 'margin');
      expect(element.getAttribute('style')).not.to.contain('margin');
    });
  });
  describe('csstransition', function() {
    it('should return true if platform supports css transitions, and false if it does not', function() {
      expect(css.csstransitions === true || css.csstransitions === false).to.be(true);
    });
  });
});
