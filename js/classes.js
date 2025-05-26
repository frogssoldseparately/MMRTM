/** The handler for all modifications to the tracker. */
class Modifier {
  /**
   * Create a Modifier utilizing some set of add-on's and guidance on how to inject
   * their snippets.
   * @param {Array<AddOn>} includedAddOns - Add-on's generating the final tracker.
   * @param {Array<string>} snippetOrder - Currently not used.
   */
  constructor(includedAddOns, snippetOrder) {
    this.#addOnNames = includedAddOns.map((elem) => elem.name);
    this.#addOnKeys = includedAddOns.map((elem) => elem.key);
    this.#snippetPaths = snippetOrder == null ? [] : snippetOrder;
    // Used by all add-on's for staging.
    const stageManager = new StageManager(
      "now",
      "preBake",
      "bake",
      "postBake",
      "preWrite"
    );

    includedAddOns.forEach((addOn) => {
      this.#addOns[addOn.key] = addOn;
      addOn.prep(
        "getExternalSnippet",
        (snippetPath) => {
          return this.getSnippet(snippetPath);
        },
        "stageManager",
        stageManager,
        "getAddOn",
        (addOnKey) => {
          return this.getAddOn(addOnKey);
        }
      );
      // Run addOn.now()
      addOn.stage();
    });
    // Advance to preBake stage
    stageManager.advance();

    // While there are more stages, keep running each add-on's implementation of that stage.
    while (stageManager.hasNext()) {
      includedAddOns.forEach((addOn) => addOn.stage());
      stageManager.advance();
    }
    // Halt if there are any missing snippets.
    this.#addOnKeys.forEach((key) => {
      const missingSnippets = this.#addOns[key].missingSnippets;
      if (missingSnippets.length !== 0) {
        throw new Error(
          key + " is missing snippets: " + missingSnippets.join(", ")
        );
      }
    });

    // Assemble the snippet array.
    this.#assemble();

    // Write the snippet array to the page.
    this.#write();
  }

  /**
   * Keys for active add-on's.
   * @type {Array<string>}
   */
  #addOnKeys;
  /**
   * Names for active add-on's.
   * @type {Array<string>}
   */
  #addOnNames;
  /**
   * The order in which to write snippets to the page.
   * @type {Array<string>}
   */
  #snippetPaths;
  /**
   * Active add-on instances whose keys match their own instance key values.
   * @type {Object}
   */
  #addOns = {};
  /**
   * What is eventually written to the page in order.
   * @type {Array<Snippet>}
   */
  #snippets = [];

  /**
   * Collect all prepared snippets to ready them for injection into the page.
   */
  #assemble() {
    if (this.#snippetPaths.length === 0) {
      this.#addOnKeys.forEach((key) => {
        this.#snippetPaths = this.#snippetPaths.concat(
          this.#addOns[key].snippetPaths
        );
      });
    }
    this.#snippetPaths.forEach((snippetPath) => {
      this.#snippets.push(this.getSnippet(snippetPath));
    });
  }

  /**
   * Wipe the page and inject all prepared snippets.
   */
  #write() {
    // Clear the page.
    document.head.innerHTML = "";
    document.body.innerHTML = "";

    // Rehome all children of snippet heads/bodies.
    this.#snippets.forEach((snippet) => {
      Array.from(snippet.head.children).forEach((elem) => {
        document.head.appendChild(elem);
      });
      Array.from(snippet.body.children).forEach((elem) => {
        document.body.appendChild(elem);
      });
      Array.from(snippet.body.attributes).forEach((attribute) => {
        document.body.setAttribute(attribute.name, attribute.value);
      });
    });

    // Replace script contents with text nodes so they will be executed properly.
    document.querySelectorAll("script").forEach((elem) => {
      const replacementScript = document.createElement("script");
      Array.from(elem.attributes).forEach((attribute) => {
        replacementScript.setAttribute(attribute.name, attribute.value);
      });
      const scriptContent = document.createTextNode(elem.innerHTML);
      replacementScript.appendChild(scriptContent);
      elem.parentNode.replaceChild(replacementScript, elem);
    });
    // Dispatch event stages.
    window.dispatchEvent(new Event("trackerStart"));
    window.dispatchEvent(new Event("afterTrackerStart"));
  }

  /**
   * Get an active add-on by instance key.
   * @param {string} addOnKey - The key for the target add-on instance.
   * @returns {AddOn} The target add-on instance.
   */
  getAddOn(addOnKey) {
    return this.#addOns[addOnKey];
  }

  /**
   * Get a Snippet instance from some active add-on. This path comes in the form
   * "[add-on key]/[snippet name]".
   * @param {string} snippetPath - The path identifying an existing snippet.
   * @returns {Snippet} The desired Snippet instance.
   */
  getSnippet(snippetPath) {
    var [addOnKey, snippetName] = snippetPath.split("/");
    return this.#addOns[addOnKey].getSnippet(snippetName);
  }
}

/** Container for an add-on's settings to handle user changes. */
class SettingsContainer {
  /**
   * All known add-on settings, both default and modified.
   * @type {Object}
   */
  #addons = {};

  /**
   * Get all known AddOn instance keys.
   * @returns {Array<string>} Array of instance keys.
   */
  get keys() {
    return Object.getOwnPropertyNames(this.#addons);
  }

  /**
   * Add or change the stored settings of some given AddOn instance.
   * @param {string} key - AddOn instance key.
   * @param {Object} object - The settings object being stored.
   * @returns {SettingsContainer} This instance of SettingsContainer.
   */
  add(key, object) {
    if (this.#addons.hasOwnProperty(key)) {
      this.#addons[key].object = object;
    } else {
      this.#addons[key] = {
        default: JSON.stringify(object, null, 2),
        object: object,
      };
    }
    return this;
  }

  /**
   * Removes the stored settings of some given AddOn instance.
   * @param {string} key - The add-on settings to remove.
   */
  remove(key) {
    if (Object.hasOwnProperty(this.#addons, key)) {
      delete this.#addons[key];
    }
  }

  /**
   * Overwrite stored settings of some AddOn instance. The provided
   * string does not have to have values for all properties in the
   * saved settings. Any omitted properties will carry over from
   * saved settings.
   * @param {string} key - The AddOn instance's key.
   * @param {string} stringIn - Parseable JSON used to overwrite saved settings.
   */
  applyChanges(key, stringIn) {
    if (!this.#addons.hasOwnProperty(key)) {
      throw new Error("Missing key in settingsContainer instance : " + key);
    }
    const originalSettings = this.#addons[key].object;
    const newSettings = JSON.parse(stringIn);
    const props = Object.getOwnPropertyNames(newSettings);
    props.forEach((prop) => {
      originalSettings[prop] = newSettings[prop];
    });
  }

  /**
   * Get the default settings string for a given AddOn instance.
   * @param {string} key - The desired AddOn instance's key.
   * @returns {string} Default settings string.
   */
  default(key) {
    if (this.#addons.hasOwnProperty(key)) {
      return this.#addons[key].default;
    }
    return "could not find settings for " + key;
  }

  /**
   * Get the active settings string for a given AddOn instance.
   * @param {string} key - The desired AddOn instance's key.
   * @returns {string} Active settings string.
   */
  getJSONString(key) {
    return JSON.stringify(this.#addons[key].object, null, 2);
  }
}
