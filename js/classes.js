class Modifier {
  constructor(includedAddOns, snippetOrder) {
    // this.#stageManager = includedAddOns[includedAddOns.length - 1].stageManager;
    this.#addOnNames = includedAddOns.map((elem) => elem.name);
    this.#addOnKeys = includedAddOns.map((elem) => elem.key);
    this.#snippetPaths = snippetOrder == null ? [] : snippetOrder;
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
      addOn.stage(); // run addOn.now()
    });
    stageManager.advance(); // advance to preBake

    // process add-on's
    while (stageManager.hasNext()) {
      includedAddOns.forEach((addOn) => addOn.stage());
      stageManager.advance();
    }
    this.#addOnKeys.forEach((key) => {
      const missingSnippets = this.#addOns[key].missingSnippets;
      if (missingSnippets.length !== 0) {
        throw new Error(
          key + " is missing snippets: " + missingSnippets.join(", ")
        );
      }
    });

    // assemble snippet array
    this.#assemble();

    this.#write();
  }

  getSnippet(snippetPath) {
    var [addOnKey, snippetName] = snippetPath.split("/");
    return this.#addOns[addOnKey].getSnippet(snippetName);
  }

  getAddOn(addOnKey) {
    return this.#addOns[addOnKey];
  }

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

  #write() {
    // clear page
    document.head.innerHTML = "";
    document.body.innerHTML = "";

    // rehome children
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

    // fix scripts
    document.querySelectorAll("script").forEach((elem) => {
      const replacementScript = document.createElement("script");
      Array.from(elem.attributes).forEach((attribute) => {
        replacementScript.setAttribute(attribute.name, attribute.value);
      });
      const scriptContent = document.createTextNode(elem.innerHTML);
      replacementScript.appendChild(scriptContent);
      elem.parentNode.replaceChild(replacementScript, elem);
    });
    window.dispatchEvent(new Event("trackerStart"));
    window.dispatchEvent(new Event("afterTrackerStart"));
  }

  #addOnKeys;
  #addOnNames;
  #snippetPaths;
  #addOns = {};
  #snippets = [];
}

class SettingsContainer {
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
  remove(key) {
    if (Object.hasOwnProperty(this.#addons, key)) {
      delete this.#addons[key];
    }
  }
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
  default(key) {
    if (this.#addons.hasOwnProperty(key)) {
      return this.#addons[key].default;
    }
    return "could not find settings for " + key;
  }
  debug() {
    this.#addons.tracker.default = JSON.stringify(
      this.#addons.tracker.object,
      null,
      2
    );
  }
  getJSONString(key) {
    return JSON.stringify(this.#addons[key].object, null, 2);
  }
  get keys() {
    return Object.getOwnPropertyNames(this.#addons);
  }

  #addons = {};
}
