/*
  update.js
*/

const kURI_UPDATES_PROPERTIES = "chrome://apps/locale/updates.properties";

var kUpdateBundle = null;
//======================================================
// Open extension manager
//======================================================
function goOpenExtensionManager()
{
  const EMTYPE = "Extension:Manager";
 
  var aOpenMode = "extensions"; 
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var needToOpen = true;
  var windowType = EMTYPE + "-" + aOpenMode;
  var windows = wm.getEnumerator(windowType);
  while (windows.hasMoreElements()) {
    var theEM = windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindowInternal);
    if (theEM.document.documentElement.getAttribute("windowtype") == windowType) {
      theEM.focus();
      needToOpen = false;
      break;
    }
  }

  if (needToOpen) {
    const EMURL = "chrome://mozapps/content/extensions/extensions.xul?type=" + aOpenMode;
    const EMFEATURES = "chrome,dialog=no,resizable=yes";
    window.openDialog(EMURL, "", EMFEATURES);
  }
}
//======================================================
// Call the update manager
//======================================================
function goCheckForUpdates()
{
  var um =  Components.classes["@mozilla.org/updates/update-manager;1"].
             getService(Components.interfaces.nsIUpdateManager);
             
  var prompter = Components.classes["@mozilla.org/updates/update-prompt;1"].
                  createInstance(Components.interfaces.nsIUpdatePrompt);

  // If there's an update ready to be applied, show the "Update Downloaded"
  // UI instead and let the user know they have to restart the applcation for
  // the changes to be applied. 
  if (um.activeUpdate && um.activeUpdate.state == "pending")
    prompter.showUpdateDownloaded(um.activeUpdate);
  else
    prompter.checkForUpdates();  
}
//======================================================
// Called when help menu is showing
//======================================================
function goBuildHelpMenu()
{
  var updates = Components.classes["@mozilla.org/updates/update-service;1"].
                 getService(Components.interfaces.nsIApplicationUpdateService);
                 
  var um = Components.classes["@mozilla.org/updates/update-manager;1"].
      getService(Components.interfaces.nsIUpdateManager);

  // Disable the UI if the update enabled pref has been locked by the 
  // administrator or if we cannot update for some other reason
  var checkForUpdates = document.getElementById("checkForUpdates");
  var canUpdate = updates.canUpdate;
  
  checkForUpdates.setAttribute("disabled", !canUpdate);
  if(!canUpdate)
     return; 

  if(kUpdateBundle == null) {
    var sbs =  Components.classes["@mozilla.org/intl/stringbundle;1"].
                 getService(Components.interfaces.nsIStringBundleService);
    kUpdateBundle = sbs.createBundle(kURI_UPDATES_PROPERTIES);
  } 

  var activeUpdate = um.activeUpdate;
  
  // If there's an active update, substitute its name into the label
  // we show for this item, otherwise display a generic label.
  function getStringWithUpdateName(key) {
    if(activeUpdate && activeUpdate.name)
       return kUpdateBundle.formatStringFromName(key, [activeUpdate.name],2);
    return kUpdateBundle.GetStringFromName(key + "Fallback");
  }
  
  // By default, show "Check for Updates..."
  var key = "default";
  if (activeUpdate) {
    switch (activeUpdate.state) {
    case "downloading":
      // If we're downloading an update at present, show the text:
      // "Downloading Firefox x.x..." otherwise we're paused, and show
      // "Resume Downloading Firefox x.x..."
      key = updates.isDownloading ? "downloading" : "resume";
      break;
    case "pending":
      // If we're waiting for the user to restart, show: "Apply Downloaded
      // Updates Now..."
      key = "pending";
      break;
    }
  }
  checkForUpdates.label = getStringWithUpdateName("updatesItem_" + key);
  if (um.activeUpdate && updates.isDownloading)
    checkForUpdates.setAttribute("loading", "true");
  else
    checkForUpdates.removeAttribute("loading");
}

//============================================================

