This page is incomplete. More information and examples are to come.

## Table of Contents

- [Add-on 101](#add-on-101)
  - [Prerequisites](#prerequisites)
  - [The How](#the-how)
  - [Properties](#properties)
  - [Stages](#stages)
  - [Snippets](#snippets)
  - [Event Stages](#event-stages)
  - [Shortcuts](#shortcuts)
  - [Communication](#communication)
- [Your First Add-on](#your-first-add-on)
  - [In MMRTM](#in-mmrtm)
  - [In Userscripts](#in-userscripts)

## Add-on 101

### Prerequisites

I wanted to make this as beginner friendly as possible, and because of that, you don't need to know what most of the terms brought up actually are. Being able to interact with the individual pieces is a good enough starting point. If you can mimic examples, you can build simple add-on's.

To build anything more complicated, an understanding of JavaScript, manipulating DOM trees, CSS, and HTML would benefit you greatly.

### The How

All add-on's for this tool [extend](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends) the AddOn class in [addOn.js](../js/addOn.js). This parent class already handles staging, snippet building and modifying, and communicating with the modifier when it is time to build the modified tracker. Your add-on will also extend this class.

```js
class YourAddOn extends AddOn {}
```

One way to write new add-on's for this tool is to reference it directly in the modifier. You can write a separate JavaScript file that then needs to be referenced at the bottom of [MMRTM.html](../MMRTM.html) **before** the script tag for [index.js](../js/index.js),

```html
    <script src="js/classes.js"></script>
    <script src="js/functions.js"></script>
    <script src="js/yourAddOn.js"></script> <!-- where you would put your script tag -->
    <script src="js/index.js"></script>
</body>
```

and your class handle needs to be added to the `aog.knows()` statement towards the top of [index.js](../js/index.js).

```js
// ---------- main script ------------------
aog.know(
  Tracker,
  MapNavigator,
  /* ... */
  CheckFilterer,
  YourAddOn // <---- where you would put your add-on's class handle
);
```

What `aog` is, or why the script tags have to be placed so doesn't really matter for this crashcourse. Just know that if you do the above, your add-on will be treated like any add-on that came with the modifier. You will have access to sibling add-on's, shared modifier functions, automatic settings managing, and more.

If you want a way to write add-on's without changing the original files at all, please see the second [add-on example](#in-userscripts) after getting some understanding of add-on's.

### Properties

Everything from the table below (except `settings`) is required for your add-on to function.

|     property     |   type   |                                                  description                                                   |
| :--------------: | :------: | :------------------------------------------------------------------------------------------------------------: |
|       key        |  string  | How your add-on is referenced. This must be unique from other add-on's, so I usually camelCase the class name. |
|       name       |  string  |               The display name for your add-on in the modifier. This does not have to be unique                |
|   description    |  string  |        A short blurb on what your add-on does. This appears when hovering over an entry in the modifier        |
| promisedSnippets | [string] |                An array of names for snippets that the modifier should expect from your add-on.                |
|     settings     |  object  |         Settings that are accessible to the end user. Optional, as not all add-on's need customization         |

An example, from the base tracker add-on:

```js
class Tracker extends AddOn {
  key = "tracker";
  name = "Base Tracker";
  description = "[REQUIRED] The base tracker contents.";
  promisedSnippets = ["content"];
  /* ... */
  settings = {
    showLoadingScreen: true,
  };
}
```

Other add-on's can access it with the key `tracker`, it presents to the user as `Base Tracker`, and it generates a single snippet with the name `content`.

### Stages

_If you're looking for post-build events, see [Event Stages](#event-stages)._

The modifier implements changes by add-on's in 5 stages, happening in this order:

|  stage   |                                        description                                         |
| :------: | :----------------------------------------------------------------------------------------: |
|   now    |           Runs as soon as an add-on is initialized during the modifying process            |
| preBake  |                          Runs after all add-on's are initialized                           |
|   bake   | Where snippets should usually be created and changes to this add-on's snippets can be done |
| postBake |   Runs after all snippets are baked. Where snippets from other add-on's can be modified    |
| preWrite |                    Runs just before building the final modified tracker                    |

To implement a stage in your add-on, all you have to do is write a method whose name matches the desired stage.

```js
class Tracker extends AddOn {
  /* ... */
  bake() {
    // do something
  }
  /* ... */
}
```

That's it. Everything inside the `bake` method will run when the modifier reaches that stage. You **don't** need to implement every single stage in your add-on. Stages that are not implemented will just be skipped. The `tracker` add-on, for example, only implements the `bake` stage.

Depending on what you're doing, the stage you do it in _could_ not matter. I've decided to break this into five stages to provide flexibility. You don't necessarily have to follow the conventions laid out, but snippets _should_ be built in `bake` and interacting with other add-on's snippets _should_ be done after `bake`. I've now mentioned snippets a couple times, but what _are_ they?

### Snippets

Snippets are standalone pieces of reusable JavaScript code or HTML. In MMRTM, it is everything that gets injected into the final project. This includes all styling tags, HTML body tag contents, and scripts. If you want to introduce any new functionality to the tracker, your add-on will interact with snippets one way or another.

Before writing the snippets, you must add them to the `promisedSnippets` array of your add-on. Everything in this array **must** be associated with a valid snippet before the end of the `preWrite` stage for the build to be successful, with one exception covered later.

```js
class YourAddOn extends AddOn {
  promisedSnippets = ["your", "snippet", "names", "go", "here"];
}
```

#### AddOn.newSnippetFromString()

---

Continuing with the `Tracker` add-on, its sole snippet is the entirety of the original tracker digested into a DOM tree (or information on how websites are built and presented). This snippet is built directly from a string via the `newSnippetFromString()` method of the `AddOn` class, as shown below:

```js
class Tracker extends AddOn {
  /* ... */
  promisedSnippets = ["content"];
  bake() {
    // generate the base tracker content as a DOM tree
    const content = this.newSnippetFromString(
      "content",
      rawTracker,
      "text/html"
    );
    /* ... */
  }
  /* ... */
}
```

**Note: remember that the tracker add-on extends the `AddOn` class, so it has access to methods defined by `AddOn` as well. See: [inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)**

This method takes three arguments:
|name|type|description|presented as|
|:-:|:-:|:-:|:-:|
|name|string|The name of the snippet is. This will be some string in the `promisedSnippets` array|"content"|
|string|string|Parseable HTML to be converted into a DOM|`rawTracker`|
|type|string|How this string is being interpreted. Can be omitted. If not omitted, the value should be "text/html"|"text/html"|

This returns a Snippet, whose structure is [covered a bit later](#accessing-snippets). Just know that after running `newSnippetFromString()`, the add-on will hold onto whatever it generates to inject into the final tracker. It is not necessary to capture the output in a variable. If all the modifier did was create this one snippet, `tracker:content`, it would build a tracker that is an exact copy of the original tracker. The snippet _is_ the tracker.

#### AddOn.newSnippet()

---

Another option for building snippets is to write them into [MMRTM.html](../MMRTM.html) directly, placing a script tag **before** the [tabManager.js](../js/tabManager.js) tag. Due to how the modifier functions and [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) safeguards, these snippets need to be written directly instead of sourced.

```html
    <script id="yourAddOn-script" type="text/plain">
        <!-- your snippet contents -->
    </script>
    <script src="js/tabManager.js"></script>
    <script src="js/addOn.js"></script>
    <script src="js/classes.js"></script>
    <script src="js/functions.js"></script>
    <script src="js/index.js"></script>
</body>
```

A fleshed out example from `autoDarkHighlight`:

```html
<script
  id="autoDarkHighlight-script"
  type="text/plain"
  stage="trackerStart"
  replaces="HIGHLIGHT_CHECKS=highlightChecks; DEFAULT_THEME=defaultTheme"
>
  const highlightChecksControl = document.getElementById("highlight-checks");
  const bodyClassList = Array.from(document.body.classList);
  if ("${HIGHLIGHT_CHECKS}" !== highlightChecksControl.checked.toString())
      highlightChecksControl.click();
  if (bodyClassList.find((className) => className.includes("${DEFAULT_THEME}")) == null)
      toggleDarkLight();
</script>
```

`autoDarkHighlight` then bakes the snippet via:

```js
class AutoDarkHighlight extends AddOn {
  /* ... */
  promisedSnippets = ["script"];
  bake() {
    this.newSnippet(
      "script",
      document.getElementById("autoDarkHighlight-script"),
      "text/html"
    );
  }
  settings = {
    defaultTheme: "dark",
    highlightChecks: true
  }
```

`AddOn.newSnippet()` accomplishes what `AddOn.newSnippetFromString()` does, but you pass it the element containing snippet information _instead_ of a string. This method handles the script tag differently based on the attributes listed below.

#### Required Attributes

`id` is how your add-on will reference the tag. My convention is `"[add-on's key]-[the name of the snippet]"`.

`type` should always be `"text/plain"` and is used to keep the page from actually parsing/executing/presenting the contents.

#### Optional Attributes

`stage` is the [event](#event-stages) that will execute the containing JavaScript.

`replaces` is used for automatic injection of setting values into snippets. The string should be formatted like `"FIRST_TARGET=firstSetting; SECOND_TARGET=secondSetting"`. Wherever you want the replacement, you wrap the replacement target name in `${}`, as you would with templating.

```html
<script
  id="yourAddOn-script"
  type="text/plain"
  replacements="RUN_SOME_FUNCTION=isActive"
>
  if (${RUN_SOME_FUNCTION} === true) doSomething();
</script>
```

```html
<script
  id="yourAddOn-style"
  type="text/plain"
  content="css"
  replacements="ELEMENT_BACKGROUND=elementBackgroundColor"
>
  #some-element {
    background: "${ELEMENT_BACKGROUND}";
  }
</script>
```

```html
<script
  id="yourAddOn-content"
  type="text/plain"
  content="html"
  replacements="BUTTON_HANDLE=buttonHandle"
>
  <button onclick="${BUTTON_HANDLE}()">Press Me</button>
</script>
```

Due to how this functions, you must use target strings that are **not** used by any template literals that are manipulated by the code. Take this pair of snippets that implement a simple click counter.

```html
<script id="simpleCounter-content" type="text/plain" content="html">
  <button id="counter" onclick="increment(event)"></button>
</script>
```

```html
<script
  id="simpleCounter-globals"
  type="text/plain"
  replacements="currentState=currentState"
>
  document.getElementById("counter").innerText = "${currentState} clicks";

  function increment(event) {
      const currentState = parseInt(event.target.innerText) + 1;
      event.target.innerText = `${currentState} clicks`;
  }
</script>
```

Suppose that `settings.currentState` is `0`. All instances of `${currentState}` are overwritten, yielding the injected script:

```js
document.getElementById("counter").innerText = "0 clicks"; // all well and good

function increment(event) {
  const currentState = parseInt(event.target.innerText) + 1;
  event.target.innerText = `0 clicks`; // oh no
}
```

meaning the button's text will always be `"0 clicks"`. To avoid this, I write my replacement target strings in SCREAMING_SNAKE_CASE. Less of a chance of colliding with unintended template targets.

#### Implicit Attributes

`content` defines what is actually held by the tag. If omitted, the contents are implied to be JavaScript. The value must be `"html"`, `"css"`, or `"js"`.

`location` is used to determine where (the `"head"` or `"body"`) the snippet is going to be injected. If omitted, CSS is always injected into the head tag, JavaScript is always injected into the body tag, and HTML is injected based on context.

#### AddOn.newOptionalSnippet()

---

This method does everything that `AddOn.newSnippet()` does, but adds two more arguments. `testBoolean`, for determining whether or not to add the snippet, and `alertText`, something to show the user when they do not have the `?silent` query parameter on. This allows you to decide whether or not to include snippets based on outside factors.

This is most often used to selectively include snippets defining shortcuts in add-on's. This is an example from the `annotator` add-on:

```js
class Annotator extends AddOn {
  /* ... */
  promisedSnippets = [
    "style",
    "content",
    "autocomplete",
    "globals",
    "script",
    "shortcuts",
  ];
  bake() {
    /* ... */
    this.newOptionalSnippet(
      "shortcuts",
      document.getElementById("annotator-shortcuts"),
      "text/html",
      this.settings.enableShortcuts != null &&
        this.settings.enableShortcuts.toString().toLowerCase() === "true",
      "Having shortcuts enabled on Annotator adds the following:\n" +
        "[SHIFT + N]\t=> Toggle notes panel visibility"
    );
  }
  settings = {
    /* ... */
    enableShortcuts: false,
  };
}
```

If the user has set `settings.enableShortcuts` to `false`, not only will the snippet not be included, but it will remove the `"shortcuts"` entry from the `promisedSnippets` array for you.

### Event Stages

_If you're looking for build stages, see [Stages](#stages)._

If you need to delay the execution of some JavaScript to ensure whatever it is interacting with is rendered or initialized, you can tie it to one of two events that are dispatched by the modifier after the build process.

`trackerStart`

- This is dispatched after all injections are finished and all script tags have been run.

`afterTrackerStart`

- As the name implies, this is dispatched after the `trackerStart` event.

There are two avenues for making use of these events. You can add the `stage` attribute to your snippet tag in [MMRTM.html](../MMRTM.html) with one of the names above. This will wrap the contents of a **JavaScript** snippet in a listener declaration.

```html
<script id="yourAddOn-script" type="text/plain" stage="trackerStart">
  // don't do this until everything is initialized.
</script>
```

The other way, which is analogous to the above and is what the modifier does behind the scenes, is writing the listener yourself.

```html
<script id="yourAddOn-globals" type="text/plain">
  const someElement = document.getElementById("some-element");

  window.addEventListener("trackerStart", () => {
      // this should wait until after someElement has been modified elsewhere
      const printString = `someElement's width is ${someElement.style.width}`;
      console.log(printString);
  });
</script>
```

Something to note is that when you stage a piece of code, its variables will no longer be in the global [scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope). From the above example, you can access `someElement` from another script but you cannot access `printString`. If something must be accessed across multiple snippets, you should declare them in a snippet that is not staged first. To avoid jamming up the global namespace and increasing the risk of collisions, I try to minimize how many global variables I declare and instead wrap them in functions and stages. Things should only be globally scoped if they _must_ be.

### Shortcuts

You can use the `shortcutManager` add-on's global object (of the same name) to handle shortcut binding, saving, and listening. To register a binding in your add-on, you would use `shortcutManager.registerBinding()`, passing the name of the add-on, the name of the shortcut, and a text representation of the binding.

```html
<script id="annotator-shortcuts" type="text/plain">
  window.addEventListener('trackerStart', () => {
      shortcutManager.registerBinding('annotator', 'toggle', 'shift n');
  })
  window.addEventListener('keydown', (event) => {
      if (shortcutManager.isLocked) return;

      shortcutManager.runOnMatch(event, 'annotator:toggle',
          () => {
              document.getElementById('annotator-visibility-control').click();
              event.preventDefault();
          }
      )
  })
</script>
```

The binding text is case insensitive. The manager supports control (written as `ctrl`), shift, alt, and repeat (written as `...`) flags. The order does not matter. Bindings must be registered in the `trackerStart` [stage](#event-stages). After a binding is registered, it can be checked against an incoming keypress via `shortcutManager.runOnMatch()`. This method takes the `event` object for a listener, identifier of a shortcut (`"[add-on name]:[shortcut name]"`), and a handle to run if the event matches the shortcut.

Alternatively, you can use `shortcutManager.check()` to find what shortcut was pressed (if any) by passing the `event` object to it. This returns an object with the properties:

| name |  type   |                          description                          |
| :--: | :-----: | :-----------------------------------------------------------: |
| name | string  |                  Identifier for the shortcut                  |
| pass | boolean | Whether or not the shortcut is valid based on the repeat flag |

If there is no match, this will instead return `null`.

```html
<script id="mapNavigator-shortcuts" type="text/plain">
  /* ... */
  window.addEventListener('keydown', (event) => {
      if (shortcutManager.isLocked) return;

      const shortcutInfo = shortcutManager.check(event);
      if (shortcutInfo == null || !shortcutInfo.pass) {
          return;
      }

      if (shortcutInfo.name === 'mapNavigator:toggle') {
          toggleMapVisibility();
          event.preventDefault();
      } else if (isMapVisible()) {
          var targetSize;
          switch (shortcutInfo.name) {
              case 'mapNavigator:decreaseSize': /* ... */
              case 'mapNavigator:minimize': /* ... */
              case 'mapNavigator:increaseSize': /* ... */
              case 'mapNavigator:maximize': /* ... */
          }
          /* ... */
      }
  });
</script>
```

#### Locking

---

Note the use of `shortcutManager.isLocked` in the above example. If you don't want your shortcut running while the shortcut binding menu is open, you can make use of this courtesy property. It is not strictly required, but most things probably don't need to be running while this menu is open. Alternatively, you can lock your, or other, shortcuts contextually. If you have a typing heavy add-on and don't want those presses being read by the `TextSearch` add-on, for example, you can add a conditional lock to the `ShortcutManager` for typing. This is a lock that is placed by your add-on's script and can only be removed by that script. If anything obeys a conditional lock of that type, it will not listen to shortcuts until the lock is removed.

```html
<script id="annotator-script" type="text/plain" stage="trackerStart">
  /* ... */
  const collapsiblePanels = Array.from(
      document.querySelectorAll(".collapsible-panel")
  );
  collapsiblePanels.forEach((panel) => {
      const control = panel.querySelector(".collapsible-panel-control");
      var heldKey;
      control.addEventListener("click", () => {
          control.parentNode.classList.toggle("collapsible-panel-collapsed");
          control.classList.toggle("collapsible-panel-control-expanded");
          if (control.classList.contains("collapsible-panel-control-expanded")) {
              annotatorTextControl.focus();
              setTimeout(() => badgeContainer.scrollIntoView(), 10);
              control.innerText = "Collapse";
              heldKey = shortcutManager.addConditionalLock("annotator", "typing");
          } else {
              annotatorTextControl.blur();
              control.innerText = "Notes";
              shortcutManager.removeConditionalLock(heldKey);
          }
      });
  });
  /* ... */
</script>
```

This example comes from the `annotator`'s collapsible panel for notes. Whenever the panel is open, it places a lock for `"typing"` with a source of itself. `addConditionalLock()` returns a key that is used to remove the lock when the panel is closed. Anything checking for a typing lock will respect this while it's active.

```js
if (
  shortcutManager.isLocked ||
  shortcutManager.hasConditionalLockTypeNotFrom("textSearch", "typing")
)
  return;
```

Methods for locks:

|            method             |   type   |                             description                              |
| :---------------------------: | :------: | :------------------------------------------------------------------: |
|    hasConditionalLockType     | boolean  |           whether or not the given type is a current lock            |
|  hasConditionalLockTypeFrom   | boolean  |        whether or not the given source has a given lock type         |
| hasConditionalLockTypeNotFrom | boolean  | whether any source other than the provided one has a given lock type |
|    getConditionalLockType     | [string] |                   array of locks with a given type                   |
|      addConditionalLock       |  string  |             add a lock and return the key for that lock              |
|     removeConditionalLock     |   null   |            removes lock associated with the provided key             |

### Communication

#### Accessing Snippets

---

As shown in the example from [newSnippetFromString()](#addonnewsnippetfromstring), you can capture the output of methods that ready snippets for injection. A snippet's structure is the following:

| name |      type       |                       description                        |
| :--: | :-------------: | :------------------------------------------------------: |
| raw  |     string      |            A string representation of the DOM            |
| head | HTMLHeadElement |                 The head of the held DOM                 |
| body | HTMLBodyElement | The body, or the (mostly) visible stuff, of the held DOM |
| DOM  |  HTMLDocument   |                   The entire held DOM                    |

You can then further manipulate the DOM of these snippets. What if you don't capture the output, or want to access the snippet in a different method or add-on entirely? You have `AddOn.getSnippet()` for that.

```js
class MapNavigator extends AddOn {
  /* ... */
  promisedSnippets = [
    "style",
    "globals",
    "map",
    "controller",
    "checkAssignment",
    "shortcuts",
  ];
  /* ... */
  postBake() {
    /* ... */
    const mapDOM = this.getSnippet("map").DOM;
    /* do something with the DOM... */
  }
  /* ... */
}
```

`getSnippet()` fetches the `mapNavigator:map` snippet, and `DOM` fetches the manipulatable document object associated with `map`. You must create the snippet before you can access it. It will return `undefined` otherwise.

Whenever you're calling this method, you're usually more interested in the DOM than the Snippet instance. Please note that the Snippet itself is just a container for the DOM. You have to get the `DOM` property to do any queries or modifications.

#### Accessing Sibling Add-on's

---

To gain access to another add-on, they first must be active and selected by the user. **You cannot access inactive add-on's.** If that's satisfied, all you need is `AddOn.getAddOn()` and the add-on's key:

```js
class TextSearch extends AddOn {
  /* ... */
  preWrite() {
    this.getAddOn("sharedModifier").oneOffExecute("makeChecksFocusable");
  }
  /* ... */
}
```

If you need to access the snippet of another add-on, you can use `AddOn.getExternalSnippet()`:

```js
class MapNavigator extends AddOn {
  /* ... */
  postBake() {
    /* ... */
    const originalDOM = this.getExternalSnippet("tracker/content").DOM;
    /* ... */
  }
  /* ... */
}
```

The required form is `"[add-on key]/[snippet key]"`.

## Your First Add-on

### In MMRTM

We'll be writing a simple add-on that cycles the color of the Item Replacements table heading. This isn't terribly useful, but will cover some of the things that the modifier can do.

To write an add-on entirely on your system, we'll be creating one file and modifying one more. First, create a file in `./js` named `headingColorizer.js`:

```
/css
/docs
/img
/js
    addOn.js
    classes.js
    functions.js
    index.js
    tabManager.js
    headingColorizer.js <-- create this file
MMRTM.html
README.md
```

In `headingColorizer.js`, we'll start by defining the add-on. We'll be setting the `key`, `name`, `description`, `promisedSnippets`, and `settings` properties.

**In: ./js/headingColorizer.js**

```js
class HeadingColorizer extends AddOn {
  key = "headingColorizer";
  name = "Heading Colorizer";
  description = "Cycles the color of the Item Replacements table heading.";
  promisedSnippets = ["script", "shortcuts"];
  settings = {
    enableShortcuts: false,
    styleColors: "['#111','#444','#777','#aaa','#ddd','#f00','#0f0','#00f']",
  };
}
```

In `MMRTM.html`, we're going to add three script tags. Two of them will be snippets for this add-on, and the third will be referencing this new file. Starting at the bottom of the file, after the `index.js` script tag, we'll add a reference to our script.

**In: ./MMRTM.html**

```html
<!-- ... -->
    <script src="js/tabManager.js"></script>
    <script src="js/addOn.js"></script>
    <script src="js/classes.js"></script>
    <script src="js/functions.js"></script>
    <script src="js/index.js"></script>
    <script src="js/headingColorizer.js"></script> <!-- your script tag -->
</body>
<!-- ... -->
```

Before the `tabManager.js` script tag, we'll add the two snippet tags:

**In: ./MMRTM.html**

```html
<!-- ... -->
<script
  id="headingColorizer-script"
  type="text/plain"
  replaces="STYLE_COLORS=styleColors"
></script>
<script id="headingColorizer-shortcuts" type="text/plain"></script>
<script src="js/tabManager.js"></script>
<!-- ... -->
```

These will hold content and attributes about our snippets. Please note the `id` and `replaces` attributes. These need to be written as seen above.

Starting with the `headingColorizer-script` element, we'll write the logic that handles the color toggling.

**In: ./MMRTM.html#headingColorizer-script**

```js
const headingColors = ${STYLE_COLORS}; // no, this is not a typo.
const targetHeading = document.getElementById("item-replacements-heading");

targetHeading.addEventListener("click", (event) => {
    const newColor = headingColors.shift();
    event.target.style.color = newColor;
    headingColors.push(newColor);
});
```

Now, to handle shortcuts, we'll write into the `headingColorizer-shortcuts` element.

**In: ./MMRTM.html#headingColorizer-shortcuts**

```js
// Register shortcuts.
window.addEventListener("trackerStart", () => {
  shortcutManager.registerBinding("headingColorizer", "cycle", "shift y");
});
// Add a listener to eventually evoke the shortcut.
window.addEventListener("keydown", (event) => {
  if (shortcutManager.isLocked) return;

  shortcutManager.runOnMatch(event, "headingColorizer:cycle", () =>
    targetHeading.click()
  );
});
```

Next, we need to tie these snippets to the add-on. Back in your JavaScript file, we'll write the `bake()` method.

**In: ./js/headingColorizer.js**

```js
class HeadingColorizer extends AddOn {
  /* ... */
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
}
```

This will always create the `headingColorizer/script` snippet, and creates a `headingColorizer/shortcuts` snippet when `settings.enableShortcuts` is `true`.

Next, we need the tracker to have identified headers to make this all work. We will utilize `sharedModifier.oneOffExecute()` in our add-on's `preWrite()` method:

**In: ./js/headingColorizer.js**

```js
class HeadingColorizer extends AddOn {
  /* ... */
  bake() {
    /* ... */
  }
  preWrite() {
    this.getAddOn("sharedModifier").oneOffExecute("identifyHeaders");
  }
}
```

Finally, to get the modifier to acknowledge this add-on, we need to end the file with the line:

**In: ./js/headingColorizer.js**

```js
class HeadingColorizer extends AddOn {
  /* ... */
}
aog.know(HeadingColorizer);
```

That's it. If you load MMRTM.html, you should see `Heading Colorizer` as an available add-on. Add it to your active add-on's, set `enableShortcuts` to `true`, and build the modified tracker. You should be able to click the heading to change it's color, or use the shortcut `SHIFT + Y`. If something isn't working, please check the [example class file](docs/headingColorizer-class.js) and [HTML snippet](docs/headingColorizer.html) in full to compare. The final environment structure should be:

```
/css
/docs
/img
/js
    addOn.js
    classes.js
    functions.js
    headingColorizer.js
    index.js
    tabManager.js
MMRTM.html
README.md
```

If you didn't like modifying the files directly, maybe userscripts are for you.

### In Userscripts

Using your favorite userscript plug-in, you'll be writing a simple add-on that cycles the color of the Item Replacements table heading. This isn't terribly useful, but will cover some of the things that the modifier can do.

Start by creating a new userscript. Modify the metadata at the top to your liking, and set the `@match` tag to be

```js
// @match       file:///path/to/your/modifier/MMRTM.html*
```

The `*` just ensures this userscript will be loaded regardless of the query parameters in the url, or lack thereof. Next, you should set the `"Run at"` property to be `"document-end"`. Everything else can be left at their default values.

At the beginning of the script, remove any `"use strict";` lines and write the following:

```js
/* eslint-disable no-undef */
/* eslint-disable no-implicit-globals */
/* eslint-disable no-useless-concat */
```

This is not required, but I do it because I'm knowingly going against these linting warnings and don't want to see them.

```js
outstandingAddOns = outstandingAddOns + 1 || 1;
```

If you left `"use strict"`, a safer version would be

```js
if (typeof outstandingAddOns === "undefined") {
  outstandingAddOns = 1;
} else {
  outstandingAddOns++;
}
```

What this does is modifies a variable declared in [index.js](../js/index.js), giving it a value if it doesn't already have one, or incrementing the existing value. This works because you can give undeclared variables to `typeof` without it throwing an error in strict mode. `outstandingAddOns` is the amount of add-on's that are currently being prepared by userscripts. The modifier will wait until all userscripts are finished before proceeding.

Next, directly after the above, we define the add-on's class. We'll be setting the `key`, `name`, `description`, `promisedSnippets`, and `settings` properties.

```js
if (typeof outstandingAddOns === "undefined") {
  /* ... */
}

class HeadingColorizer extends AddOn {
  key = "headingColorizer";
  name = "Heading Colorizer";
  description = "Cycles the color of the Item Replacements table heading.";
  promisedSnippets = ["script", "shortcuts"];
  settings = {
    enableShortcuts: false,
    styleColors: "['#111','#444','#777','#aaa','#ddd','#f00','#0f0','#00f']",
  };
}
```

Below the class definition block, we will be writing two snippets. One for the script that controls the color cycling, and one that defines shortcuts. Note the use of the grave ( \` ) mark for multiline strings.

```js
class HeadingColorizer extends AddOn {
  /* ... */
}

const scriptElement = document.createElement("script");
scriptElement.id = "headingColorizer-script";
scriptElement.type = "text/plain";
scriptElement.setAttribute("replaces", "STYLE_COLORS=styleColors");
```

This would take the place of writing a script tag with attributes in [MMRTM.html](../MMRTM.html). The contents are appended as a text node to populate the tag.

```js
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
```

This snippet shifts the contents of an array of colors with each click, setting the most recently shifted color as the heading's color.

To prevent `${STYLE_COLORS}` from being parsed in a template, I broke up the string. From within quotations, it will not be parsed until the modifier gets to it. This covers the `headingColorizer:script` snippet. Now, for the `shortcuts` snippet:

```js
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
```

Back within the `HeadingColorizer` add-on, we now need to implement two stages: `bake()` and `preWrite()`.

```js
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
}
```

This references the two snippets you just wrote. They will be added to the modified tracker now.

```js
class HeadingColorizer extends AddOn {
  /* ... */
  bake() {
    /* ... */
  }
  preWrite() {
    this.getAddOn("sharedModifier").oneOffExecute("identifyHeaders");
  }
}
```

This will give the Item Replacements heading the id that your `script` snippet is querying for. To see more of what `SharedModifier` can do, please see [the class documentation](classes/SharedModifier.md).

Finally, you have to let the modifier know that your add-on is ready to be used. At the bottom of your userscript, include the lines

```js
aog.know(HeadingColorizer);
outstandingAddOns--;
/* eslint-enable */
```

Now, if you enable the userscript and load MMRTM.html, you should see `Heading Colorizer` as an available add-on. Add it to your active add-on's, set `enableShortcuts` to true, and build the modified tracker. You should be able to click the heading to change it's color, or use the shortcut `SHIFT + Y`. If something isn't working, please check the [example userscript](headingColorizer-userscript.js) in full to compare.

**Note: While you have userscripts enabled for the page, this will be treated like any other add-on. If you disable userscripts for the page, you will temporarily lose access to the add-on. Any changes to settings will be still be there for when userscripts are re-enabled, though.**
