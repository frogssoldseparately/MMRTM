# ShowCollected Class

#### Extends AddOn

Re-enables a latent feature of the original tracker that highlights collected checks differently.

## Properties

### Static

### Private

### Public

**settings**

```
   * @property {boolean} enableShortcuts - Enables shortcuts.
   * @property {boolean} enableOnStart - Checks the recolor box automatically.
   * @property {string} lightModeFormat - Styling for highlighted light-mode checks.
   * @property {string} darkModeFormat - Styling for highlighted dark-mode checks.
```

### Getters

### Setters

## Methods

### Static

### Private

### Public

**bake**

```
   * Creates necessary snippets.
```

**preWrite**

```
   * Injects a "recolor collected checks" checkbox into the tracker below the highlight checks option.
   * Makes some minor changes to the Item Replacements and Item Locations tables to facilitate
   * keeping the highlight consistent regardless of which table you are clicking checks in.
```
