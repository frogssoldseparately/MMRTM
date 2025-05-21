# SelectionEntry Class

A container for an individual entry in a SelectionContainer instance.

## Properties

### Static

### Private

### Public

**description**

```
   * The description value pulled from the associated add-on instance.
   * @type {string}
```

**element**

```
   * The associated option element generated for this entry.
   * @type {HTMLOptionElement}
```

**instance**

```
   * The associated add-on instance.
   * @type {AddOn}
```

**key**

```
   * The key value pulled from the associated add-on instance.
   * @type {string}
```

**name**

```
   * The name value pulled from the associated add-on instance.
   * @type {string}
```

**parent**

```
   * The container currently holding this instance.
   * @type {SelectionContainer}
```

### Getters

### Setters

## Methods

### Static

### Private

### Public

**constructor**

```
   * Creates a SelectionEntry, populates itself with information from an add-on instance, and creates an option
   * element to be placed in a select element.
   * @param {SelectionContainer} parent - The container currently holding this instance.
   * @param {AddOn} instance - The associated add-on instance.
```
