// ==UserScript==
// @name         Heading Colorizer Add-on
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Cycles the color of the Item Replacements table heading.
// @author       frogssoldseparately
// @match        file:///path/to/your/modifier/MMRTM.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.
// @grant        none
// ==/UserScript==

(function () {
  /* eslint-disable no-undef */
  /* eslint-disable no-implicit-globals */
  /* eslint-disable no-useless-concat */

  // notify the modifier of a userscript add-on
  outstandingAddOns = outstandingAddOns + 1 || 1;
  /* or the following
    if (typeof outstandingAddOns === "undefined") {
        outstandingAddOns = 1;
    } else {
        outstandingAddOns++;
    }
    */

  /*
      Give id's to headings in the tracker.
      Adds a click listener to #item-replacements-heading.
      Adds a shortcut binding of SHIFT + Y
    */
  class HeadingColorizer extends AddOn {
    key = "headingColorizer";
    name = "Heading Colorizer";
    description = "Cycles the color of the Item Replacements table heading.";
    promisedSnippets = ["script", "shortcuts"];
    settings = {
      enableShortcuts: false,
      styleColors: "['#111','#444','#777','#aaa','#ddd','#f00','#0f0','#00f']",
    };
    bake() {
      this.newSnippet(
        "script",
        document.getElementById("headingColorizer-script")
      );
      this.newOptionalSnippet(
        "shortcuts",
        document.getElementById("headingColorizer-shortcuts"),
        "text/html",
        this.settings.enableShortcuts.toString().toLowerCase() === "true",
        "Having shortcuts enabled on HeadingColorizer adds the following:\n" +
          "[SHIFT + Y] => cycle Item Replacements heading color"
      );
    }
    preWrite() {
      this.getAddOn("sharedModifier").oneOffExecute("identifyHeaders");
    }
  }

  // create <script id="headingColorizer-script" type="text/plain" replaces="STYLE_COLORS=styleColors">
  const scriptElement = document.createElement("script");
  scriptElement.id = "headingColorizer-script";
  scriptElement.type = "text/plain";
  scriptElement.setAttribute("replaces", "STYLE_COLORS=styleColors");

  scriptElement.appendChild(
    document.createTextNode(
      `
    const headingColors = ` +
        "${STYLE_COLORS}" +
        `;
    const targetHeading = document.getElementById("item-replacements-heading");

    targetHeading.addEventListener("click", (event) => {
        const newColor = headingColors.shift();
        event.target.style.color = newColor;
        headingColors.push(newColor);
    });
    `
    )
  );

  document.body.appendChild(scriptElement);

  // create <script id="headingColorizer-script" type="text/plain">
  const shortcutsElement = document.createElement("script");
  shortcutsElement.id = "headingColorizer-shortcuts";
  shortcutsElement.type = "text/plain";

  shortcutsElement.appendChild(
    document.createTextNode(`
    window.addEventListener("trackerStart", () => {
        shortcutManager.registerBinding("headingColorizer", "cycle", "shift y");
    });
    window.addEventListener("keydown", (event) => {
        if (shortcutManager.isLocked) return;

        shortcutManager.runOnMatch(event, "headingColorizer:cycle",
            () => targetHeading.click()
        );
    });
    `)
  );

  document.body.appendChild(shortcutsElement);

  aog.know(HeadingColorizer);
  outstandingAddOns--;
  /* eslint-enable */
})();
