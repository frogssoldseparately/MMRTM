/** Cycles the color of the Item Replacements table heading. */
class HeadingColorizer extends AddOn {
  key = "headingColorizer";
  name = "Heading Colorizer";
  description = "Cycles the color of the Item Replacements table heading.";
  promisedSnippets = ["script", "shortcuts"];
  /**
   * @property {boolean} enableShortcuts - Enables shortcuts
   * @property {string} styleColors - String of an array of hex colors to inject into headingColorizer/script
   */
  settings = {
    enableShortcuts: false,
    styleColors: "['#111','#444','#777','#aaa','#ddd','#f00','#0f0','#00f']",
  };
  /**
   * Creates necessary snippets
   */
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
  /**
   * Adds id's to h2 elements in the original tracker.
   */
  preWrite() {
    this.getAddOn("sharedModifier").oneOffExecute("identifyHeaders");
  }
}

aog.know(HeadingColorizer);
