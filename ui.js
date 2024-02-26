// ui.js
// James Diacono
// 2024-02-26

// Custom Elements with a safer, more expressive interface.

// This module fails JSLint because it uses JavaScript's class syntax, so that
// you don't have to.

// Public Domain.

let instances = new WeakMap();

function ui(tag, create) {

// It seems that the only way to efficiently monitor a DOM element's
// connectedness to a document, without knowledge of its parent, is thru the
// Custom Element 'connectedCallback' and 'disconnectedCallback' methods.

// When a better approach presents itself
// (perhaps https://github.com/whatwg/dom/issues/533), there will be no need to
// use Custom Elements and hence no need for ui.js.

    if (customElements.get(tag) === undefined) {
        customElements.define(tag, class extends HTMLElement {
            connectedCallback() {
                const connect = instances.get(this)?.connect;
                if (typeof connect === "function") {
                    connect();
                }
            }
            disconnectedCallback() {
                const disconnect = instances.get(this)?.disconnect;
                if (typeof disconnect === "function") {
                    disconnect();
                }
            }
        });
    }
    return Object.freeze(function make_element(params) {
        const element = document.createElement(tag);
        instances.set(element, create(element, params));
        return element;
    });
}

export default Object.freeze(ui);
