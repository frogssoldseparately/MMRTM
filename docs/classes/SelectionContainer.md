# SelectionContainer Class

A container and controller for a select element holding add-on entries. This facilitates moving elements back and forth between two select elements.

## Properties

### Static

### Private

### Public

**element**

```
   * The select element being controlled.
   * @type {HTMLSelectElement}
```

**entries**

```
   * The entries currently populating this select element.
   * @type {Array<SelectionEntry>}
```

**swapTarget**

```
   * An accompanying SelectionContainer instance to trade entries back and forth with. This is set externally.
   * @type {SelectionContainer}
```

**whenAdopted**

```
   * A handler for running additional code after an entry is moved into the associated select element. This is
   * meant to be set externally.
   * @param {SelectionEntry} entry - The entry being moved in.
```

**whenOrphaned**

```
   * A handler for running additional code after an entry is removed from the associated select element. This
   * is meant to be set externally. As this is for additional control over when something can be orphaned/adopted,
   * not setting this will always return true to allow adoption when additional logic is not required.
   * @param {SelectionEntry} entry - The entry being removed.
   * @returns {boolean} Whether or not the entry was removed successfully.
```

### Getters

### Setters

## Methods

### Static

### Private

### Public

**constructor**

```
   * Create a SelectionContainer. Adds keydown listeners to the provided select element,
   * and generates SelectionEntry instances for each add-on instance.
   * @param {HTMLSelectElement} selectionElement - The select element that will be controlled.
   * @param {Array<AddOn>} addOnInstances - Add-on instances that will be used to populate the select element.
```

**adopt**

```
   * Facilitates moving entries into this selection container only if the entry isn't already owned by this
   * container, and it was successfully orphaned by its previous container.
   * @param {SelectionEntry} entry - The entry being moved in.
```

**getArrayOf**

```
   * Gets all owned entry instance values at a specified property.
   * @param {string} prop - The target property of each owned SelectionEntry instance.
   * @returns {Array} An array of values held by each instance of the desired property.
```

**getEntry**

```
   * Get the first member from entries that has a specified property - value pair.
   * @param {string} prop - The property being checked against.
   * @param {*} value - The value to check with.
   * @returns {SelectionEntry} The first matching instance. Returns undefined if there's no match.
```

**orphan**

```
   * Facilitates removing entries from this selection container only if the entry is owned by this container.
   * @param {SelectionEntry} entry - The entry being removed.
   * @returns {boolean} Whether or not the entry was successfully removed. Returns undefined if the entry wasn't
   * owned by this container.
```
