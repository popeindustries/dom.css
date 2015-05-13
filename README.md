Cross-browser css manipulation.

## Usage
```javascript
var style = require('style')
  , el = document.getElementById('myEl')

  , bgColor = style.getStyle(el, 'background-color') // => '#ffffff'
  , left = style.getNumericStyle(el, 'left') // => [75, 'px']
  , rotation = style.getStyle(el, 'rotate'); // => '45deg'

style.setStyle(el, 'left', 80);
style.setStyle(el, 'translateX', 10);
style.clearStyle(el, 'left');
```

## API
**getStyle(element, property)**: retrieve the style for `property`

`property` is automatically vendor prefixed if necessary (ie. `transition` => `-webkit-transition`), and special transform properties may be used directly (ie. `translateX`, `rotateY`, `scaleZ`, etc.):

```js
var height = style.getStyle(el, 'height') // => '100px'
  , opacity = style.getStyle(el, 'opacity') // => 0.5
    // properties are vendor prefixed if necessary
  , radius = style.getStyle(el, 'border-radius') // => '4px'
    // transform properties can be called directly
  , scale = style.getStyle(el, 'scale') // => [0.5, 0.5]
  , scaleX = style.getStyle(el, 'scaleX'); // => 0.5
```

**getNumericStyle(element, property**: retrieve a value and unit for `property`

colour values are returned as hex, and all other numeric properties are returned with the set or default unit:

```js
var height = style.getNumericStyle(el, 'height') // => [100, 'px']
  , opacity = style.getNumericStyle(el, 'opacity') // => [0.5, '']
  , bg = style.getNumericStyle(el, 'background-color') // ['#ff00ff', 'hex']
  , rotation = style.getNumericStyle(el, 'rotate3d'); // => [[0.5, 'deg'], [0.5, 'deg'], [0.5, 'deg']]
```

**setStyle(element, property, value)**: set one or more styles

`property` is automatically vendor prefixed if necessary (ie. `transition` => `-webkit-transition`), special transform properties may be used directly (ie. `translateX`, `rotateY`, `scaleZ`, etc.), and default units are used if none are specified:

```js
style.setStyle(el, 'height', '10em');
style.setStyle(el, 'width', 100); // 'px' used by default
style.setStyle(el, {top: '10px', left: '10%'});
style.setStyle(el, 'border-radius', '4px'); // properties are vendor prefixed if necessary
style.setStyle(el, 'scaleX', 0.5); // transform properties can be called directly
style.setStyle(el, 'translate', [100, 100]); // grouped transforms can also be called directly
```

**clearStyle(element, property)**: remove a previously set style for `property`

```js
style.setStyle(el, {width: 100, height: 100, 'background-color': '#ffffff'});
style.clearStyle(el, 'background-color');
console.log(el.getAttribute('style')); // => 'width: 100px; height: 100px;'
```

**prefix**: the vendor prefix `String` used for the current system

one of either `-webkit-`, `-moz`, `-ms-`, or `-o-`

**hasTransitions**: `Boolean` indicating support for css transitions on the current platform

**hasTransforms**: `Boolean` indicating support for css transforms on the current platform

**has3DTransforms**: `Boolean` indicating support for 3D css transforms on the current platform

### Helper functions
**getPrefixed(property)**: retrieve the vendor prefixed version of `property`

**getShorthand(property)**: retrieve a proxy for a shorthand `property`

**getAll(property)**: retieve all possible variations of `property`, including shorthands and vendor prefixes

**expandShorthand(property, value)**: convert a shorthand `property` into an object of expanded properties

**parseOpacity(value)**: handle number conversion of `value`, including IE opacity filter syntax

**getOpacityValue(value)**: convert opacity `value` to IE filter syntax

**parseNumber(value, property)**: split a `value` into a number and unit based on `property`

**parseTransform(value, property)**: retrieve a `property` from a 2d or 3d transform matrix `value` (string or array)