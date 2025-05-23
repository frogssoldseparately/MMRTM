var addonSettingsNavigator = document.getElementById(
  "addon-settings-navigator"
);

addonSettingsNavigator.addEventListener("wheel", (event) => {
  addonSettingsNavigator.scrollLeft -= event.deltaY;
});

// tracker to modify in text form
var rawTracker;
// file://the/page?this&stuff&here
const urlQueryParts =
  location.search.length > 0 ? location.search.slice(1).split("&") : null;
// ---------- helpers ----------------------
const aog = new AddOnGenerator();
const tabManager = new TabManager();
const settingsContainer = new SettingsContainer();

// ---------- elements ---------------------
const addOnSettingsSaveBtn = document.getElementById("addon-settings-save");
const tabContentDiv = document.getElementById("addon-settings-pages");
const infoContainer = document.getElementById("info");
const infoVisibilityBtn = document.getElementById("toggle-info");
const localStorageStatus = document.getElementById("local-storage-status");
const filePicker = document.getElementById("file-picker");

// ---------- main script ------------------
aog.know(
  Tracker,
  MapNavigator,
  SharedModifier,
  AutoDarkHighlight,
  StateSaver,
  MarkedLogGenerator,
  ShowCollected,
  TextSearch,
  /* AutoTracker, */
  ShortcutManager,
  /* TimeKeeper, */
  /* ItemTracker, */
  Annotator,
  CheckFilterer
);

const localStorageEnabled = (() => {
  var test = "localStorageTest";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
})();

const addOnActiveController = new SelectionContainer(
  document.getElementById("active-addons"),
  []
);

// FIX_THIS: sometimes breaks. handle when userscript add-on's are no longer active.
var outstandingAddOns; // set by userscripts
// used in checking if userscripts are including add-on's
var outstandingTest = () => {
  outstandingTest = () => !!outstandingAddOns; // each subsequent run is interested in if there are no more add-on's getting ready
  return outstandingAddOns != null;
};

const outstandingIntervalId = setInterval(() => {
  if (outstandingTest()) {
    console.log(`Waiting for ${outstandingAddOns} add-on's.`);
    if (!outstandingTest()) return; // this catches the case of all add-on's being ready on the first run
  }
  clearInterval(outstandingIntervalId);
  aog.instances
    .filter((instance) => instance.settings != null)
    .forEach((instance) => {
      settingsContainer.add(instance.key, instance.settings);
    });

  if (localStorageEnabled) {
    localStorageStatus.className = "success";
    localStorageStatus.innerText = "Enabled";

    const hideInfoState = localStorage.getItem("hideInfo");
    if (hideInfoState != null) {
      if (hideInfoState === "true") {
        toggleInfoPanelVisibility("none");
      }
    } else {
      localStorage.setItem("hideInfo", "false");
    }
    const savedTracker = localStorage.getItem("savedTrackerHTML");
    if (savedTracker != null) {
      rawTracker = savedTracker;
    }
    // fetch stored settings for each add-on
    aog.instances.forEach((addOn) => {
      if (addOn.settings != null) {
        const storageKey = addOn.key + "SavedSettings";
        const storageAccess = localStorage.getItem(storageKey);
        if (storageAccess != null) {
          addOn.settings = JSON.parse(storageAccess);
        }
      }
    });
  } else {
    localStorageStatus.className = "warning";
    localStorageStatus.innerText = "Disabled";
  }

  // populate select elements
  const addOnContainer = aog.instances;
  const addOnSelectController = new SelectionContainer(
    document.getElementById("addon-select"),
    addOnContainer
  );
  // add settings tab when add-on is moved to selected add-on's
  addOnActiveController.whenAdopted = (entry) => {
    createNewTab(entry.instance);
    if (localStorageEnabled) {
      localStorage.setItem(
        "selectedAddOns",
        addOnActiveController.getArrayOf("key").join(",")
      );
    }
  };
  // remove settings tab when add-on is moved to available add-on's
  addOnActiveController.whenOrphaned = (entry) => {
    // do not allow moving add-on's that are required
    if (entry.instance.description.includes("[REQUIRED]")) {
      entry.parent = addOnActiveController;
      addOnActiveController.entries.unshift(entry);
      addOnActiveController.element.insertBefore(
        entry.element,
        addOnActiveController.element.firstChild
      );
      alert("Cannot remove " + entry.name + " from add-on list.");
      return false;
    }
    removeTab(entry.instance);
    if (localStorageEnabled) {
      localStorage.setItem(
        "selectedAddOns",
        addOnActiveController.getArrayOf("key").join(",")
      );
    }
    return true;
  };
  addOnSelectController.swapTarget = addOnActiveController;
  addOnActiveController.swapTarget = addOnSelectController;

  if (localStorageEnabled) {
    const storageAccess = localStorage.getItem("selectedAddOns");
    if (storageAccess != null && storageAccess.length > 0) {
      const selectedAddOns = storageAccess.split(",");
      selectedAddOns.forEach((entryKey) => {
        const entry = addOnSelectController.getEntry("key", entryKey);
        addOnActiveController.adopt(entry);
      });
    } else {
      addRequiredAddOns(addOnSelectController, addOnActiveController);
    }
  } else {
    addRequiredAddOns(addOnSelectController, addOnActiveController);
  }

  function assertNotNullParameter(property, value) {
    if (value == null)
      throw new Error("Expected value for url query parameter " + property);
  }

  // handle url arguments
  const urlQueryFlags = { autoBuild: false, singleBuild: false };
  if (urlQueryParts) {
    urlQueryParts.forEach((queryPart) => {
      const tokens = queryPart.split("=");
      const property = tokens.shift();
      const value = tokens.shift();
      switch (property) {
        case "autobuild": // build the tracker immediately
          urlQueryFlags.autoBuild = true;
          break;
        case "silent": // omit mutable alerts
          AddOn.showsAlerts = false;
          break;
        case "load": // build only specified add-on's (used for pop-up add-on's)
          assertNotNullParameter(property, value);
          urlQueryFlags.singleBuild = true;
          const addOnKeys = value.split("+");
          const targetAddOns = [];
          addOnKeys.forEach((addOnKey) => {
            var targetAddOn = addOnActiveController.getEntry("key", addOnKey);
            if (targetAddOn == null) {
              targetAddOn = addOnSelectController.getEntry("key", addOnKey);
            }
            if (targetAddOn == null) {
              alert("Unknown add-on " + addOnKey);
              throw new Error("Unknown add-on " + addOnKey);
            }
            targetAddOns.push(targetAddOn.instance);
          });
          new Modifier(targetAddOns);
          break;
        default:
          console.log("Unknown query parameter : " + property);
      }
    });
    if (urlQueryFlags.autoBuild && localStorageEnabled) {
      replaceHTML();
    }
  }

  if (!urlQueryFlags.autoBuild && !urlQueryFlags.singleBuild) {
    window.addEventListener("keydown", globalKeyDownListener);
  }
  document.body.style.display = "block";
}, 100);
