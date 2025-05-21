# MapNavigator Class

#### Extends AddOn

Creates a map to help with navigating the modified tracker.

## Properties

### Static

### Private

### Public

**settings**

```
   * @property {string} mapImagePath - The URI path holds the map image.
   * @property {boolean} enableShortcuts - Enables shortcuts.
   * @property {boolean} enablePopupMode - Enables popup mode.
   * @property {boolean} hideClearedLocations - Hides region buttons when all associated checks are clicked.
   * @property {boolean} revertStyleInActorizer - Removes the larger styling of buttons that the actorizer adds.
   * @property {Array<Object>} navButtons - Information on the navigation buttons that appear atop the map container.
   * The property of each member object is attributed directly to the navigation button.
   * @property {Object} regionOwnership - Information on what region buttons are added to the map. Properties of
   * regionOwnership are the parents and members of locations are owned by the parent regions. Setting the locations
   * is recommended even if you don't plan on using settings.hideClearedLocations.
```

### Getters

### Setters

## Methods

### Static

### Private

### Public

**preBake**

```
   * Adds the "sharedModifier/communicator" snippet to the planned snippets to inject.
```

**bake**

```
   * Creates all snippets for the non-popup mode of this add-on.
```

**bakePopup**

```
   * Creates all snippets for popup mode of this add-on.
```

**postBake**

```
   * Creates and appends navigation and region buttons to the map.
```

**preWrite**

```
   * If this is not a popup, identify label span pairs, identify table headers, and add appropriate
   * id's and classes to elements within both the Item Replacements and Item Locations tables. For
   * more information on what is actually done or what these set values look like, please see the
   * SharedModifier class definition.
```

**generateCheckJS**

```
   * Creates some JavaScript that groups together and adds a class to checkmark controls that should
   * be owned by specific regions in the map. This currently does not work for popup mode.
   * @returns {string} Valid JavaScript code to be injected into the tracker.
```
