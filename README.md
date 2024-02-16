# ui.js

_ui.js_ is a JavaScript library that gives you the power of [Custom Elements][0]
without making you use JavaScript classes, properties, or `this`.

Instead, _ui.js_ provides an interface based on two of JavaScript's best parts:
modules and functions. You can use _ui.js_ to build web applications of any
size.

_ui.js_ is in the Public Domain.

## Usage Examples

In the following trivial example, we make a `colored` function that makes
colored elements. We then make `red_element`, populate it with some text, and
add it to the page.

```javascript
import ui from "./ui.js";

const colored = ui("colored-ui", function create(element, params) {
    element.style.color = params.color;
});

const red_element = colored({color: "red"});
red_element.textContent = "I am red.";
document.body.append(red_element);
```

The state of the DOM is now:

```html
<body>
    <colored-ui style="color: red;">I am red</colored-ui>
</body>
```

Now for a more realistic example. The module, _blink.js_, demonstrates the use
of the Shadow DOM, `connect`/`disconnect` callbacks, and public methods.

_blink.js_ exports a function that makes blinking elements. The
`interval` property of the `params` object controls the frequency of the
blinking. The blinking begins as soon as the element is connected to the page.

The timer is stopped by `clearInterval` when the blinking element is removed
from the page, preventing a memory leak and wasted CPU cycles.

The element's `change_interval` method can be called externally to modify the
interval at any time.

```javascript
// blink.js

import ui from "./ui.js";

export default ui("blink-ui", function create(element, params) {
    let {interval} = params;
    let timer;
    let shadow = element.attachShadow({mode: "closed"});
    shadow.append(document.createElement("slot"));

    function toggle_visibility() {
        element.style.visibility = (
            element.style.visibility === "hidden"
            ? "visible"
            : "hidden"
        );
    }

    function connect() {
        timer = setInterval(toggle_visibility, interval);
    }

    function disconnect() {
        clearInterval(timer);
    }

    function change_interval(new_interval) {
        interval = new_interval;
        if (element.isConnected) {
            disconnect();
            connect();
        }
    }

    element.change_interval = change_interval;
    return {connect, disconnect};
});
```

Elsewhere in the application, `blink` is imported, and a blinking element
created. The element is populated and added to the page.

```javascript
// my_app.js

import blink from "./blink.js";

const blink_element = blink({interval: 300});
blink_element.textContent = "Look at me!";
document.body.append(blink_element);

// Some time later...

blink_element.change_interval(100); // strobe!
```

The state of the DOM is now something like:

```html
<body>
    <blink-ui style="visibility: hidden;">
        <slot>Look at me!</slot>
    </blink-ui>
</body>
```

## The Problem with Custom Elements

The biggest problem with Custom Elements is the use of a global, name-based
registry. To instantiate a Custom Element, you must reference it by name. That
is fine for small websites, but for large web applications it is a recipe for
disaster because the dependency graph is not explicit.

The Custom Elements specification predates the addition of modules to
JavaScript. Modules provide a clear, statically-analyzable dependency graph,
essential in any large application. `ui` makes functions that can be exported
from modules.

The other problem with Custom Elements is that it mandates the use of JavaScript
classes and `this`, both of which are [dangerous and unnecessary][2] parts of
the language. There is also no way to pass parameters when creating a Custom
Element, resulting in heavy use of properties.

`ui` takes a _create_ function that provides a private closure where all of the
element's state can live, held in local variables. Variables are safer to use
than properties, because variables can be statically analyzed and there is no
weirdness arising from the prototype chain. Douglas Crockford coined the term
[Class Free][3] to describe this pattern.

## The Functions

### ui(_tag_, _create_) → make_element(_params_) → Element

The `ui` function returns a function that makes elements. The _tag_ is the name
of the element, and must be a [valid custom element name][1].
The _create_ function initializes a newly created element, and is described
below.

### create(_element_, _params_) → {connect, disconnect}

The `create` function takes two parameters, _element_ and _params_. The
_element_ is a brand new element with tag name _tag_. The _params_ is whatever
was passed to `make_element`.

The `create` function may return an object with `connect` and `disconnect`
callbacks.

[0]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
[1]: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define#valid_custom_element_names
[2]: https://www.youtube.com/watch?v=XFTOG895C7c&t=2445s
[3]: https://www.youtube.com/watch?v=XFTOG895C7c&t=2688s
