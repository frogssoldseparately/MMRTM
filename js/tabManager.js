class TabBinding {
  constructor(manager, container, tab, content, keyAttribute) {
    this.manager = manager;
    this.container = container;
    // switch to this tab when clicked
    tab.addEventListener("click", () => {
      if (manager.activeTab[container.id] != null) {
        manager.activeTab[container.id].hide();
      }
      this.show();
    });
    // handle dragging and dropping tabs
    tab.addEventListener("dragenter", (event) => {
      event.target.classList.add("dragover");
    });
    tab.addEventListener("dragleave", (event) => {
      try {
        if (event.target.classList.contains("dragover"))
          event.target.classList.remove("dragover");
      } catch {
        // do nothing because it was released
      }
    });
    tab.addEventListener("dragend", (event) => {
      const targetTab = container.querySelector(".tab.dragover");
      // if no valid drop target
      if (!targetTab) return;
      targetTab.classList.remove("dragover");
      // if the valid drop target is the tab itself
      if (targetTab == event.target) return;
      // Figure out whether to place tab before or after the valid drop target.
      // If not null, the tab is before the target. If null, the tab is after
      // the target.
      const beforeTest = this.container.querySelector(
        `.tab[${keyAttribute}="${event.target.getAttribute(
          keyAttribute
        )}"] ~ .tab[${keyAttribute}="${targetTab.getAttribute(keyAttribute)}"]`
      );
      if (beforeTest) {
        // insert after
        event.target.parentNode.insertBefore(
          event.target,
          targetTab.nextSibling
        );
      } else {
        // insert before
        event.target.parentNode.insertBefore(event.target, targetTab);
      }
      container.querySelectorAll(".tab").forEach((elem) => {
        const currentBinding = tabManager.getBinding("tab", elem);
        currentBinding.discover();
      });
      event.target.click();
    });
    this.tab = tab;
    this.content = content;
    this.keyAttribute = keyAttribute;
  }
  discover() {
    var nextTab = this.container.querySelector(
      `.tab[${this.keyAttribute}="${this.tab.getAttribute(
        this.keyAttribute
      )}"] ~ .tab`
    );
    if (nextTab == null) {
      nextTab = this.container.querySelector(`.tab[${this.keyAttribute}]`);
    }
    this.nextBinding = this.manager.getBinding("tab", nextTab);
    var allContents = this.container.querySelectorAll(
      `.tab:has(~ .tab[${this.keyAttribute}="${this.tab.getAttribute(
        this.keyAttribute
      )}"])`
    );
    if (allContents.length == 0) {
      allContents = this.container.querySelectorAll(".tab");
    }
    const previousTab = allContents[allContents.length - 1];
    this.previousBinding = this.manager.getBinding("tab", previousTab);
  }
  free() {
    this.content.remove();
    this.tab.remove();
  }
  hide() {
    if (!this.hidden) {
      this.tab.classList.remove("active");
      this.content.style.display = "none";
      this.content.classList.remove("active");
      this.hidden = true;
    }
  }
  isFree() {
    return this.tab.parentNode == null;
  }
  next() {
    this.hide();
    this.nextBinding.show();
  }
  previous() {
    this.hide();
    this.previousBinding.show();
  }
  show() {
    if (this.hidden) {
      this.tab.classList.add("active");
      this.content.classList.add("active");
      this.content.style.display = "block";
      this.manager.activeTab[this.container.id] = this;
      this.hidden = false;
    }
  }
  container; // parent .tab-container NodeElement
  content; // .tab-content NodeElement
  hidden = true;
  manager; // TabManager instance
  nextBinding; // next tab binding in .tab-container NodeElement
  previousBinding; // previous tab binding in .tab-container NodeElement
  tab; // .tab NodeElement
}

class TabManager {
  constructor(...keyAttributeNames) {
    // remove duplicate values in keyAttributeNames
    this.keyAttributeNames = keyAttributeNames.filter(
      (elem, index, array) => array.indexOf(elem) === index
    );
    // generate objects storing references to each navigable tab
    this.keyAttributeNames.forEach((keyAttribute) => {
      // this.tabBindings[keyAttribute] = {};
      const tabs = document.querySelectorAll(`.tab[${keyAttribute}]`);
      tabs.forEach((tab) => {
        const key = tab.getAttribute(keyAttribute);
        const container = tab.closest(".tab-container");
        // if (!this.tabBindings[keyAttribute].hasOwnProperty(container.id)) {
        //   this.tabBindings[keyAttribute][container.id] = {};
        // }
        const content = container.querySelector(
          `.tab-content[${keyAttribute}="${key}"]`
        );
        const currentBinding = new TabBinding(
          this,
          container,
          tab,
          content,
          keyAttribute
        );
        // this.tabBindings[keyAttribute][container.id][key] = currentBinding;
        this.unorderedBindings.push(currentBinding);
        // tab.addEventListener("click", () => {
        //   this.activeTab[container.id].hide();
        //   currentBinding.show();
        // });
        this.attemptDefaultOpen(currentBinding);
      });
    });

    this.unorderedBindings.forEach((binding) => {
      binding.discover();
    });
  }
  newBinding(tab, content, keyAttribute) {
    if (!this.keyAttributeNames.includes(keyAttribute)) {
      this.keyAttributeNames.push(keyAttribute);
    }
    const container = tab.closest(".tab-container");
    const binding = new TabBinding(this, container, tab, content, keyAttribute);
    this.unorderedBindings.push(binding);
    // tab.addEventListener("click", () => {
    //   this.activeTab[container.id].hide();
    //   binding.show();
    // });
    this.attemptDefaultOpen(binding);
    binding.discover();
    binding.nextBinding.discover();
    binding.previousBinding.discover();
    return binding;
  }
  removeBinding(prop, value) {
    const binding = this.unorderedBindings.find(
      (binding) => binding[prop] === value
    );
    if (binding != null) {
      // remove tab and content DOM elements associated with this binding
      binding.free();
      // remove this binding from the bindings array
      this.unorderedBindings.splice(this.unorderedBindings.indexOf(binding), 1);
      // if there is at least one more member in the tab container
      if (!binding.nextBinding.isFree()) {
        // update neighbors
        binding.nextBinding.discover();
        if (binding.nextBinding != binding.previousBinding) {
          binding.previousBinding.discover();
        }
      }
      // if the removed binding was the current tab
      if (this.activeTab[binding.container.id] === binding) {
        this.activeTab[binding.container.id] = null;
        // if there is at least one more member in the tab container
        if (!binding.nextBinding.isFree()) {
          // show it
          binding.nextBinding.show();
        }
      }
    }
  }
  attemptDefaultOpen(binding) {
    if (binding.tab.hasAttribute("default-tab")) {
      // the tab click event hides the current tab, so if there is no current tab
      // use the binding to show the tab instead
      // if (this.activeTab[binding.container.id] != null) {
      //   binding.tab.click();
      // } else {
      //   binding.show();
      // }
      binding.tab.click();
    }
  }
  getBinding(prop, value) {
    return this.unorderedBindings.find((binding) => binding[prop] === value);
  }
  // getTabFromContent(content) {
  //   console.log("I am being used");
  //   const targetBinding = this.getBinding("content", content);
  //   return targetBinding.tab;
  // }
  activeTab = {};
  keyAttributeNames;
  unorderedBindings = [];
}
