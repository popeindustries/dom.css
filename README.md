[![browser support](http://ci.testling.com/popeindustries/dom.css.png)](http://ci.testling.com/popeindustries/dom.css)

Cross-browser css manipulation.

## Usage
```javascript
var css = require('dom.css');

var el = document.getElementById('myEl');
var bgColor = css.getStyle(el, 'background-color'); // => '#ffffff'
var left = css.getNumericStyle(el, 'left'); // => [75, 'px']
css.setStyle(el, 'left', 80);
css.clearStyle(el, 'left');
```