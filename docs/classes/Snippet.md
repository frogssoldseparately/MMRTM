# Snippet Class

A container for an injectable snippet, parsed into a workable DOM, as used by add-on's and the modifier.

## Properties

### Static

### Private

### Public

**DOM**

```
   * The captured output of DOMParser.parseFromString(). A workable DOM.
   * @type {Object}
```

### Getters

**raw**

```
   * Get the text representation of the DOM.
   * @returns {string} The inner HTML of the document element.
```

**head**

```
   * Get the head element of the contained DOM.
   * @returns {HTMLHeadElement} The DOM's head element.
```

**body**

```
   * Get the body element of the contained DOM.
   * @returns {HTMLBodyElement} The DOM's body element
```

### Setters

## Methods

### Static

### Private

### Public

**constructor**

```
   * Creates a Snippet from a raw, parseable string. For more information, see DOMParser.parseFromString().
   * @param {string} content - A parseable piece of HTML being passed to a DOMParser instance.
   * @param {string} type - What the content is going to be parsed as.
```
