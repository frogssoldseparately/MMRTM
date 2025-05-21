# StageManager Class

A handler for staging during the modifier's build process. This is just a fancy wrapper for an array that is consumed one element at a time at the behest of some outside influence.

## Properties

### Static

### Private

**#stages**

```
   * The stages that are being tracked.
   * @type {Array<string>}
```

### Public

### Getters

**current**

```
   * Get the stage name at the 0th position of the stages array without consuming anything.
   * @returns {string} The current stage. Returns undefined if there are no more stages.
```

**length**

```
   * Get the stages array's current length.
   * @returns {number} The contained array's current length.
```

### Setters

## Methods

### Static

### Private

### Public

**constructor**

```
   * Creates a StageManager with a set series of stages to consume.
   * @param  {...string} stages - The name of each stage that will be handled in order from the 0th
   * element to the Nth element.
```

**advance**

```
   * Consume the next stage.
```

**hasNext**

```
   * Whether or not there is at least one more stage held by the stages array.
   * @returns {boolean} Whether or not there are more stages.
```
