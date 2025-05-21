# SharedModifier Class

#### Extends AddOn

Provides shared resources to manipulating the original tracker, and communication infrastructure for popups. Does nothing on its own.

## Properties

### Static

### Private

### Public

**executedFunction**

```
   * Methods that have already been run via SharedModifier.oneOffExecute().
   * @type {Array<string>}
```

**originalDOM**

```
   * The DOM generated for the "tracker/content" Snippet instance.
   * @type {Object}
```

### Getters

### Setters

## Methods

### Static

**cleanUpString**

**generateRegionClass**

**generateCheckboxClass**

**generateButtonId**

**generateRowId**

### Private

### Public

**bake**

```
   * If any sharedModifier snippet has been included by another add-on (like "sharedModifier/communication"),
   * this creates those snippets.
```

**include**

```
   * Adds a snippet to the SharedModifier instance's promisedSnippets, prompting it to later create
   * said snippet. If a snippet of the given name has already been included, do nothing.
   * @param {string} snippetName - The snippet name that points to some sharedModifier script with the
   * id "sharedModifier-[snippetName]".
```

**oneOffExecute**

```
   * Runs a method, whose name is provided, of the SharedModifier instance, but only once. If the
   * same method is accessed to run again, it does nothing. This is to prevent harmful changes to
   * the tracker from multiple add-on's needing the same change. Due to the oneOffExecute options all
   * being tied to the original tracker, this will throw an error to prevent unexpected behavior and
   * errors.
   * @param {string} functionName - The method within SharedModifier that is run.
```

**identifyCodeBlock**

```
   * Adds an id of "settings-tag" to the settings code block at the top of the page. If the code element already has
   * an id, some code in the Actorizer needs to be changed to reference this new id.
```

**identifyLabeledSpans**

```
   * Adds an id of "[label contents]-span" to the version and seed spans.
```

**identifyHeaders**

```
   * Adds an id of "[heading-text-in-lowercase]-heading" to all h2 elements.
```

**identifyTables**

```
   * Adds an id of "[preceding-h2-text-in-lowercase]" to each table.
```

**makeChecksFocusable**

```
   * Adds a tab index of 0 to rows in Dungeon Entrance Replacements and Item Replacements,
   * allowing the user to tab through them.
```

**prepItemReplacementsTable**

```
   * Adds region information for each checkbox, identifies region rows, and makes it easier
   * for the MarkedLogGenerator add-on to find pertinent replacement checks. Also runs
   * SharedModifier.identifyTables().
```

**prepItemLocationsTable**

```
   * Identifies rows in the Item Locations table for navigation purposes, and enables
   * the ShowCollected add-on to check all associated checkboxes at once by adding the
   * class "secondary-location-check".
```

**prepGossipStoneHintsTable**

```
   * Adds class information to gossip entires for the MarkedLogGenerator.
```
