# Modifier Class

The handler for all modifications to the tracker.

## Properties

### Static

### Private

**addOnKeys**

```
   * Keys for active add-on's.
   * @type {Array<string>}
```

**addOnNames**

```
   * Names for active add-on's.
   * @type {Array<string>}
```

**snippetPaths**

```
   * The order in which to write snippets to the page.
   * @type {Array<string>}
```

**addOns**

```
   * Active add-on instances whose keys match their own instance key values.
   * @type {Object}
```

**snippets**

```
   * What is eventually written to the page in order.
   * @type {Array<Snippet>}
```

### Public

### Getters

### Setters

## Methods

### Static

### Private

**#assemble**

```
   * Collect all prepared snippets to ready them for injection into the page.
```

**#write**

```
   * Wipe the page and inject all prepared snippets.
```

### Public

**constructor**

```
   * Create a Modifier utilizing some set of add-on's and guidance on how to inject
   * their snippets.
   * @param {Array<AddOn>} includedAddOns - Add-on's generating the final tracker.
   * @param {Array<string>} snippetOrder - Currently not used.
```

**getAddOn**

```
   * Get an active add-on by instance key.
   * @param {string} addOnKey - The key for the target add-on instance.
   * @returns {AddOn} The target add-on instance.
```

**getSnippet**

```
   * Get a Snippet instance from some active add-on. This path comes in the form
   * "[add-on key]/[snippet name]".
   * @param {string} snippetPath - The path identifying an existing snippet.
   * @returns {Snippet} The desired Snippet instance.
```
