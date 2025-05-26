# SettingsContainer Class

Container for an add-on's settings to handle user changes.

## Properties

### Static

### Private

**#addons**

```
   * All known add-on settings, both default and modified.
   * @type {Object}
```

### Public

### Getters

**keys**

```
   * Get all known AddOn instance keys.
   * @returns {Array<string>} Array of instance keys.
```

### Setters

## Methods

### Static

### Private

### Public

**add**

```
   * Add or change the stored settings of some given AddOn instance.
   * @param {string} key - AddOn instance key.
   * @param {Object} object - The settings object being stored.
   * @returns {SettingsContainer} This instance of SettingsContainer.
```

**remove**

```
   * Removes the stored settings of some given AddOn instance.
   * @param {string} key - The add-on settings to remove.
```

**applyChanges**

```
   * Overwrite stored settings of some AddOn instance. The provided
   * string does not have to have values for all properties in the
   * saved settings. Any omitted properties will carry over from
   * saved settings.
   * @param {string} key - The AddOn instance's key.
   * @param {string} stringIn - Parseable JSON used to overwrite saved settings.
```

**default**

```
   * Get the default settings string for a given AddOn instance.
   * @param {string} key - The desired AddOn instance's key.
   * @returns {string} Default settings string.
```

**getJSONString**

```
   * Get the active settings string for a given AddOn instance.
   * @param {string} key - The desired AddOn instance's key.
   * @returns {string} Active settings string.
```
