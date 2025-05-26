function alertContext(messageKey) {
  var message;
  switch (messageKey) {
    case "available-addons":
      message =
        "Mouse over elements for descriptions. Select elements in the list below and press [ENTER] " +
        "to add them to your tracker. Additional " +
        "settings (when applicable) will appear in the next section automatically.";
      break;
    case "selected-addons":
      message =
        "Select elements in the list below and press [ENTER] to remove them from your tracker.";
      break;
  }
  alert(message);
}

function clearSiteLocalStorage() {
  if (localStorageEnabled) {
    localStorage.clear();
  }
}

function createNewTab(addOn) {
  if (addOn.settings == null) {
    return;
  }
  settingsContainer.add(addOn.key, addOn.settings);
  const tab = document.createElement("button");
  tab.classList.add("tab");
  tab.setAttribute("tab-key", addOn.key);
  tab.setAttribute("draggable", "true");
  const isFirstTab = document.querySelectorAll(".tab[tab-key]").length === 0;
  tab.appendChild(document.createTextNode(addOn.name));
  const content = document.createElement("div");
  content.classList.add("tab-content");
  content.classList.add("addon-settings");
  content.setAttribute("tab-key", addOn.key);
  const textarea = document.createElement("textarea");
  textarea.spellcheck = false;
  content.appendChild(textarea);
  const revertButton = document.createElement("button");
  revertButton.addEventListener("click", revertSettingsContent);
  revertButton.appendChild(document.createTextNode("Revert"));
  content.appendChild(revertButton);

  addOnSettingsSaveBtn.parentNode.insertBefore(tab, addOnSettingsSaveBtn);
  tabContentDiv.appendChild(content);

  const binding = tabManager.newBinding(tab, content, "tab-key");

  textarea.value = settingsContainer.getJSONString(addOn.key);
  textarea.addEventListener("keydown", (event) => {
    if (event.key == "Tab") {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (event.shiftKey) {
        // remove a tab at the beginning of line(s)
        const lineIndices = getLineIndices(textarea.value);
        const startLine = getLine(lineIndices, start);
        const currentLine = {
          arrayIndex: startLine.arrayIndex,
          charIndex: startLine.charIndex,
        };
        const endLine = getLine(lineIndices, end);
        var counter = 0;
        var firstRemoval;
        while (currentLine.arrayIndex != endLine.arrayIndex) {
          const charIndex = currentLine.charIndex;
          var removalLength = textarea.value
            .substring(charIndex + 1)
            .match(/^\s+/);
          removalLength =
            removalLength != null ? Math.min(removalLength[0].length, 2) : 0;
          if (firstRemoval == null) firstRemoval = removalLength;
          counter += removalLength;
          textarea.value =
            textarea.value.substring(0, charIndex + 1) +
            textarea.value.substring(charIndex + 1 + removalLength);
          currentLine.charIndex =
            lineIndices[++currentLine.arrayIndex] - counter;
        }
        const charIndex = endLine.charIndex - counter;
        var removalLength = textarea.value
          .substring(charIndex + 1)
          .match(/^\s+/);
        removalLength =
          removalLength != null ? Math.min(removalLength[0].length, 2) : 0;
        var lastRemoval = removalLength;
        if (!firstRemoval) {
          firstRemoval = removalLength;
        }
        textarea.value =
          textarea.value.substring(0, charIndex + 1) +
          textarea.value.substring(charIndex + 1 + removalLength);

        textarea.selectionStart = Math.max(start - firstRemoval, 0);
        textarea.selectionEnd = end - counter - lastRemoval;
      } else {
        if (start != end) {
          const lineIndices = getLineIndices(textarea.value);
          const startLine = getLine(lineIndices, start);
          var currentLine = {
            arrayIndex: startLine.arrayIndex,
            charIndex: startLine.charIndex,
          };
          const endLine = getLine(lineIndices, end);
          var counter = 0;
          while (currentLine.arrayIndex != endLine.arrayIndex) {
            counter += 2;
            const charIndex = currentLine.charIndex;
            textarea.value =
              textarea.value.substring(0, charIndex + 1) +
              "  " +
              textarea.value.substring(charIndex + 1);
            currentLine.charIndex =
              lineIndices[++currentLine.arrayIndex] + counter;
            if (counter > 10) {
              throw new Error("Infinite loop");
            }
          }
          const charIndex = endLine.charIndex + counter;
          textarea.value =
            textarea.value.substring(0, charIndex + 1) +
            "  " +
            textarea.value.substring(charIndex + 1);

          textarea.selectionStart = start + 2;
          textarea.selectionEnd = end + counter + 2;
        } else {
          textarea.value =
            textarea.value.substring(0, start) +
            "  " +
            textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      }
    } else if (event.ctrlKey && event.key == "Enter") {
      if (event.shiftKey) {
        binding.previous();
        binding.previousBinding.content.querySelector("textarea").focus();
      } else {
        binding.next();
        binding.nextBinding.content.querySelector("textarea").focus();
      }
    }
  });

  if (isFirstTab) {
    binding.show();
  }
}

function removeTab(addOn) {
  if (addOn.settings == null) {
    return;
  }
  const content = document.querySelector(
    `.tab-content[tab-key="${addOn.key}"]`
  );
  tabManager.removeBinding("content", content);
}

function filePicked(changeEvent) {
  if (changeEvent.target.files && changeEvent.target.files[0]) {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      rawTracker = event.target.result;

      if (localStorageEnabled) {
        localStorage.setItem("savedTrackerHTML", rawTracker);
      }
    });
    reader.readAsText(filePicker.files[0], "utf-8");
  }
}

function getLine(indices, index) {
  const endCharIndex = indices.find((i) => i >= index);
  const startArrayIndex = indices.indexOf(endCharIndex) - 1;
  return { arrayIndex: startArrayIndex, charIndex: indices[startArrayIndex] };
}

function getLineIndices(str) {
  const lineIndices = [-1];
  for (var i = 0; i < str.length; i++) {
    if (str[i] == "\n") lineIndices.push(i);
  }
  if (str[str.length - 1] != "\n") lineIndices.push(str.length);
  return lineIndices;
}

function replaceHTML() {
  if (rawTracker == null) {
    alert("Please select a valid tracker before building.");
    return;
  }
  if (!saveSettingsChanges()) return;
  window.removeEventListener("keydown", globalKeyDownListener);
  if (aog.getInstance("Tracker").settings.showLoadingScreen) {
    document.getElementById("page-cover").style.display = "block";
  }
  setTimeout(
    () => new Modifier(addOnActiveController.getArrayOf("instance")),
    1
  );
}

function revertSettingsContent(event) {
  const content = event.target.parentNode;
  const textarea = content.querySelector("textarea");
  textarea.value = settingsContainer.default(content.getAttribute("tab-key"));
  saveSettingsChanges();
}

function saveSettingsChanges() {
  var hadError = false;
  document.querySelectorAll(".tab-content").forEach((elem) => {
    const binding = tabManager.getBinding("content", elem);
    const textarea = binding.content.querySelector("textarea");
    const key = elem.getAttribute("tab-key");
    const tab = binding.tab;
    try {
      settingsContainer.applyChanges(key, textarea.value);
      tab.classList.remove("parse-error");
      textarea.classList.remove("parse-error");
      if (localStorageEnabled) {
        const storageKey = key + "SavedSettings";
        localStorage.setItem(
          storageKey,
          JSON.stringify(JSON.parse(textarea.value))
        );
      }
    } catch (e) {
      hadError = true;
      tab.classList.add("parse-error");
      textarea.classList.add("parse-error");
      tab.click();
      textarea.focus();
      var messageLineNumber = e.message.match(/(?<=\s+line\s+)[0-9]+(?=\s+)/);
      if (messageLineNumber != null) {
        messageLineNumber = parseInt(messageLineNumber.shift()) - 1;
        const lineIndices = getLineIndices(textarea.value);
        textarea.selectionStart = lineIndices[messageLineNumber] + 1;
        textarea.selectionEnd = lineIndices[messageLineNumber + 1];
      }
      alert("Parse error in " + tab.innerText + " : " + e.message);
    }
  });
  return !hadError;
}

function toggleInfoPanelVisibility(targetMode) {
  var currentMode;
  if (!targetMode) {
    currentMode = infoContainer.style.display;
  } else {
    currentMode = targetMode === "block" ? "none" : "block";
  }

  switch (currentMode) {
    case "none":
      infoContainer.style.display = "block";
      infoVisibilityBtn.innerText = "Hide Info";
      break;
    case "block":
    default:
      infoContainer.style.display = "none";
      infoVisibilityBtn.innerText = "Show Info";
  }

  if (localStorageEnabled) {
    // negate stored value
    localStorage.setItem("hideInfo", currentMode !== "none");
  }
}

function globalKeyDownListener(event) {
  if (event.ctrlKey && event.key == "r") {
    event.preventDefault();
    replaceHTML();
  } else if (event.ctrlKey && event.key == "s") {
    event.preventDefault();
    if (!event.repeat) {
      saveSettingsChanges();
      // TODO: replace alerts with html elements to make this work properly
      // alerts prevent this code from running, and holding ^s opens a ton of save dialogs
    }
  }
}

function addRequiredAddOns(availableController, activeController) {
  availableController.entries
    .filter((elem) => elem.description.includes("[REQUIRED]"))
    .forEach((target) => {
      activeController.adopt(target);
    });
}

function importSettings(changeEvent) {
  if (!localStorageEnabled) {
    alert("Importing is not current available without LocalStorage.");
    return;
  }
  if (changeEvent.target.files && changeEvent.target.files[0]) {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const rawSettings = event.target.result;
      try {
        const settingsObject = JSON.parse(rawSettings);
        Object.getOwnPropertyNames(settingsObject).forEach((key) => {
          localStorage.setItem(key, JSON.stringify(settingsObject[key]));
        });
        alert("Settings imported. Reloading.");
        location.reload();
      } catch (e) {
        alert("Parse error in imported settings : " + e.message);
      }
    });
    reader.readAsText(changeEvent.target.files[0], "utf-8");
  }
}

function exportSettings() {
  if (!localStorageEnabled) {
    alert("Exporting is not currently available without LocalStorage.");
    return;
  }
  const storageKeys = Object.getOwnPropertyNames(localStorage);
  const exportedSettings = {};
  storageKeys
    .filter((elem) => elem.includes("SavedSettings"))
    .forEach((key) => {
      exportedSettings[key] = JSON.parse(localStorage.getItem(key));
    });
  const outputText = JSON.stringify(exportedSettings, null, 2);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(outputText)
  );
  downloadLink.setAttribute("download", "MMRTM-settings.json");
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
