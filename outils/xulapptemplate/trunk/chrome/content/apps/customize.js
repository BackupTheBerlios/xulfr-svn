/*
  customize.js
  
  Gestion de la personnalisation des barres de d'outils
*/

//======================================================
function goToggleFullScreen()
{
  window.fullScreen = !window.fullScreen;

  var mainWindow = document.getElementById("main-window");
  if(window.fullScreen)
     mainWindow.setAttribute("fullscreen","true");
  else
    mainWindow.removeAttribute("fullscreen");
}
//======================================================
function goToggleToolbar( id, elementID )
{
  var toolbar = document.getElementById(id);
  var element = document.getElementById(elementID);
  if (toolbar)
  {
    var isHidden = toolbar.hidden;
    toolbar.hidden = !isHidden;
    document.persist(id, 'hidden');
    if (element) {
      element.setAttribute("checked", isHidden ? "true" : "false");
      document.persist(elementID, 'checked');
    }
  }
}
//======================================================
function doViewToolbar( event )
{
  var id      = event.originalTarget.getAttribute("toolbarid");
  var toolbar = document.getElementById(id);

  toolbar.hidden = !toolbar.hidden;
  document.persist(id, 'hidden');
}
//======================================================
function goToolbarsPopupShowing( event )
{
  var popup = event.target;
  var i;

  // Empty the menu
  for (i = popup.childNodes.length-1; i >= 0; --i) 
  {
    var deadItem = popup.childNodes[i];
    if (deadItem.hasAttribute("toolbarid"))
        popup.removeChild(deadItem);
  }

  var firstMenuItem = popup.firstChild;

  var toolbars = document.getElementsByTagName("toolbar");
  
  for (i = 0; i < toolbars.length; ++i) 
  {
    var toolbar = toolbars[i];
    var toolbarName = toolbar.getAttribute("toolbarname");
    var type = toolbar.getAttribute("type");
    if (toolbarName && toolbar.id && type != "menubar") 
    {
      var menuItem = document.createElement("menuitem");
      menuItem.setAttribute("toolbarid", toolbar.id);
      menuItem.setAttribute("type"     , "checkbox");
      menuItem.setAttribute("label"    , toolbarName);
      menuItem.setAttribute("accesskey", toolbar.getAttribute("accesskey"));
      menuItem.setAttribute("checked"  , toolbar.getAttribute("hidden") != "true");
      
      if (toolbar.getAttribute("class").indexOf("hidechrome-fullscreen") != -1)
          menuItem.setAttribute("class","hidechrome-fullscreen");

      popup.insertBefore(menuItem, firstMenuItem);

      menuItem.addEventListener("command", doViewToolbar, false);
    }
    toolbar = toolbar.nextSibling;
  }
}
//======================================================
function goCustomizeToolbar( toolboxId )
{
  var toolBox = document.getElementById(toolboxId);
  if(!toolBox.customizeDone)
      toolBox.customizeDone = doToolboxCustomizeDone;
  
  // Disable the toolbar context menu items
  var menubar = document.getElementById("mainMenuBar");
  for (var i = 0; i < menubar.childNodes.length; ++i)
       menubar.childNodes[i].setAttribute("disabled", true);
  
  var cmd = document.getElementById("customizeToolbars");
  cmd.setAttribute("disabled", "true");
  cmd.setAttribute("toolbox" , toolboxId);
  
  window.openDialog("chrome://global/content/customizeToolbar.xul", "CustomizeToolbar",
                    "chrome,all,dependent", toolBox);
}
//======================================================
function doToolboxCustomizeDone( aToolboxChanged )
{
  // Re-enable parts of the UI we disabled during the dialog
  var menubar = document.getElementById("mainMenuBar");
  for (var i = 0; i < menubar.childNodes.length; ++i)
    menubar.childNodes[i].setAttribute("disabled", false);
    
  var cmd = document.getElementById("customizeToolbars");
  cmd.removeAttribute("toolbox" );
  cmd.removeAttribute("disabled");

  //window.focus();
}
//======================================================
function goOpenPreferences( panel )
{
 if(panel)
  window.openDialog("chrome://app/content/preferences/preferences.xul",
                    "_Blank","chrome,modal,resizable,centerscreen",panel);
 else 
  window.openDialog("chrome://app/content/preferences/preferences.xul",
                    "_Blank","chrome,modal,resizable,centerscreen"); 
}
//============================================================

