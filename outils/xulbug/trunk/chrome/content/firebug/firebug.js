/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Joe Hewitt.
 *
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
var FireBug = 
{
    currentContext: null,
    contexts: [],
    
    currentView: null,
    views: {},
    viewTypes: {
        "console": FireBugConsoleView,
        "source": FireBugSourceView,
        "css": FireBugCSSView,
        "style": FireBugStyleView,
        "layout": FireBugLayoutView,
        "events": FireBugEventsView,
        "js": FireBugJSView,
        "dom": FireBugDOMView
    },

    inspectDelay: 100,
    searchDelay: 300,
    urlRegex: new RegExp("([^:]*):(//)?([^/]*)"),
    
    stringCropLength: 100,
    defaultViewName: "source",
    
    boolPrefNames: [
        "disabled", "closedByDefault",
        "showJSErrors", "showJSWarnings", "showCSSErrors", "showXMLErrors",
        "showWebErrors", "showChromeErrors", "showMessages", "showExternalErrors",
        "showXMLHttpRequests", "throttleMessages", "showStackTrace",
        "showAllStyles", "showFunctions", "showConstants",
        "enableDebugger", "breakOnErrors"],
        
    inspecting: false,
    inspectedWindow: null,
    inspectedElement: null,
    inspectingStack: [],
    
    highlightedElements: [],
};

FireBug.initialize = function()
{    
    // Import the mac-specific skin
    var platform = Components.classes["@mozilla.org/xre/app-info;1"]
        .getService(Components.interfaces.nsIXULRuntime).OS;
    if (platform == "Darwin")
        document.styleSheets[document.styleSheets.length-1].insertRule(
            "@import 'chrome://firebug/skin/mac.css';", 0);

    this.browser = document.getElementById("fbBrowser");
    this.browser.addEventListener("load", FireBug.onBrowserLoad, true);
    this.browser.loadURI("chrome://firebug/content/view.html");

    this.strings = document.getElementById("strings_firebug");
    
    this.searchBox = document.getElementById("fbSearchBar");    
    this.statusBar = document.getElementById("fbStatusBar");
    this.statusText = document.getElementById("fbStatusText");
    this.pathText = document.getElementById("fbPath");
    this.inspectCommand = document.getElementById("cmd_inspectElement");
    this.clearCommand = document.getElementById("cmd_clearConsole");
    this.commandLine = document.getElementById("fbCommandLine");
    this.logBox = document.getElementById("fbContentBox");
    this.logSplitter = document.getElementById("fbContentSplitter");
    this.toggleMenu = document.getElementById("menu_togglePanel");
    this.optionsButton = document.getElementById("fbOptionsButton");
    this.appBox = document.getElementById("appcontent");
    
    this.consoleService = Components.classes['@mozilla.org/consoleservice;1'].
        getService(Components.interfaces.nsIConsoleService);

    this.finder = Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance()
                    .QueryInterface(Components.interfaces.nsIFind);

    try {
        this.domUtils = Components.classes["@mozilla.org/inspector/dom-utils;1"].
            getService(Components.interfaces.inIDOMUtils);
    } catch (ex) {
        // We can try to live without "dom-utils", since it only comes with DOM Inspector
        this.domUtils = null;
    }
    
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("extensions.firebug", FireBugPrefsObserver, false);

    this.initBoolPrefs(this.boolPrefNames);
    this.throttleLimit = this.prefs.getIntPref("extensions.firebug.throttleLimit");

    // Disable commands until a window is attached
    this.disableCommands();
}

FireBug.shutdown = function()
{
    this.prefs.removeObserver("extensions.firebug", FireBugPrefsObserver);

    // We have to be extra careful here - if there is an error, we still must
    // proceed with the other calls or else we will leave ourselves registered in
    // some places, and Firefox will go crazy if our observers are ever used again
    try
    {
        this.removeObservers();
    }
    catch (exc) {}
    
    try
    {
        this.debuggr.disable();
    }
    catch (exc) {}
}

FireBug.attach = function()
{
    for (var viewName in this.viewTypes)
    {
        var viewType = this.viewTypes[viewName];

        var newView = new viewType();
        this.views[viewName] = newView;
        
        newView.optionsMenu = document.getElementById("fbOptionsMenu_" + viewName);
        newView.viewName = viewName;

        newView.initialize(this.browser);
        
        for (var i in this.contexts)
            newView.attachContext(this.contexts[i]);
    }

    this.console = this.views["console"];
    this.debuggr = this.views["js"];
    
    if (this.currentContext)
    {
        this.currentContext.view = this.console;
        this.console.context = this.currentContext;
        this.console.contextNode = this.ensureContextNode(this.console, this.currentContext);
    }

    if (!this.disabled)
    {
        this.addObservers();

        if (this.enableDebugger)
            this.debuggr.enable();
    }
    
    FireBugCommandLine.initialize();
}

FireBug.disable = function(disabled)
{
    this.disabled = disabled;
    
    if (disabled)
    {
        this.showPanel(false);
        
        if (this.enableDebugger)
        {
            this.stopDebugging();
            this.debuggr.disable();
        }
        
        this.stopInspecting(true);
        
        this.disableCommands();
        this.removeObservers();
    }
    else
    {
        if (this.enableDebugger)
            this.debuggr.enable();

        this.addObservers();
        this.enableCommands();
    }
}

FireBug.addObservers = function()
{
    this.consoleService.registerListener(FireBugConsoleListener);

    var tabBrowser = document.getElementById("content");
    tabBrowser.addProgressListener(FireBugTabProgressListener,
        Components.interfaces.nsIWebProgress.NOTIFY_DOCUMENT);
            
    for (var i = 0; i < tabBrowser.browsers.length; ++i)
    {
        var browser = tabBrowser.browsers[i];
        if (this.isWindowInspectable(browser.contentWindow))
            this.attachToWindow(browser.contentWindow);
    }
}

FireBug.removeObservers = function()
{
    this.consoleService.unregisterListener(FireBugConsoleListener);

    var tabBrowser = document.getElementById("content");
    tabBrowser.removeProgressListener(FireBugTabProgressListener);

    for (var i = 0; i < tabBrowser.browsers.length; ++i)
    {
        var browser = tabBrowser.browsers[i];
        if (this.isWindowInspectable(browser.contentWindow))
            this.detachFromWindow(browser.contentWindow);
    }
    
    this.showErrorCount(0);
    
    this.contexts = [];
    this.currentContext = null;
}

FireBug.disableCommands = function()
{
    this.statusBar.setAttribute("disabled", "true");
    document.getElementById("cmd_clearConsole").setAttribute("disabled", "true");
    document.getElementById("cmd_focusCommandLine").setAttribute("disabled", "true");
    this.inspectCommand.setAttribute("disabled", "true");
    document.getElementById("cmd_inspectBack").setAttribute("disabled", "true");
    document.getElementById("cmd_inspectForward").setAttribute("disabled", "true");
    this.searchBox.disabled = true;

    this.validateViews(null);

    this.pathText.value = "";
}

FireBug.enableCommands = function()
{
    this.statusBar.removeAttribute("disabled");
    document.getElementById("cmd_clearConsole").removeAttribute("disabled");
    document.getElementById("cmd_focusCommandLine").removeAttribute("disabled");
    this.inspectCommand.removeAttribute("disabled");
    this.searchBox.disabled = this.currentContext
        && (!this.currentContext.view || !this.currentContext.view.searchable);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.attachToWindow = function(win)
{
    if (this.disabled)
        return;
    
    var ignoreWindow = !this.isWindowInspectable(win);
    if (ignoreWindow)
        this.disableCommands();
    else    
        this.enableCommands();

    if (this.inspecting)
        this.stopInspecting(true);

    var context = this.getContextByWindow(win);
    if (!context && !ignoreWindow)
    {
        // This is the first time we are attaching to the window, so create a new context
        context = this.createContext(win);    
        
        for (var viewName in this.views)
            this.views[viewName].attachContext(context);
    }

    if (this.currentContext)
    {
        if (this.currentContext.view)
            this.hideContext(this.currentContext.view, this.currentContext);
    }
    
    this.currentContext = context;

    this.showPanel(context && (context.browser.showFireBug || !FireBug.closedByDefault));

    if (context)
    {
        if (!context.browser.attachedFireBug)
        {
            context.browser.addProgressListener(FireBugFrameProgressListener,
                Components.interfaces.nsIWebProgress.NOTIFY_DOCUMENT);
            context.browser.attachedFireBug = true;
        }
        
        context.loaded = !context.browser.webProgress.isLoadingDocument;
        
        if (this.console)
        {
            this.console.context = context;
            this.console.contextNode = this.ensureContextNode(this.console, context);
        }

        this.showErrorCount(context.errorCount);
        
        if (context.view)
            this.selectObject(context.selectedObject, context.view.viewName, true);
        else
        {
            if (context.browser.priorView)
            {
                if (context.browser.priorLocation == win.location.href)
                    context.priorState = context.browser.priorState;
                
                this.selectView(context.browser.priorView.viewName);
            }
            else
                this.selectView("console");
        }
    }
    else
        this.showErrorCount(0);

    this.inspectCommand.setAttribute("disabled", !context || !context.loaded);
}

FireBug.attachToLoadingWindow = function(win, context)
{
    if (!context)
    {
        var rootWindow = FireBugUtils.getRootWindow(win);
        context = this.getContextByWindow(rootWindow);
    }
    
    if (!context)
        return;
        
    if (!win.console)
    {
        win.console = new FireBugConsole(context, win);

        win.addEventListener("mouseover", this.onMouseOver, true);

        if (this.showXMLHttpRequests)
            this.attachXMLHttpSpy(context, win);
    }
}

FireBug.attachToLoadedWindow = function(win)
{
    var context = this.getContextByWindow(win);
    if (!context || context.loaded)
        return;

    // Don't attach to XML documents that have automatic "pretty printing"
    if (this.isXMLPrettyPrinted(win))
        return this.detachFromWindow(win);
    
    context.loaded = true;
    
    this.inspectCommand.removeAttribute("disabled");

    if (!context.view)
        return;

    if (context.view == context.browser.priorView &&
        context.priorState && context.priorState.selectedObject)
    {
        var object = context.priorState.selectedObject(context);
        this.selectObject(object, context.view.name);
    }    
    else
        this.showContext(context.view, context);
}

FireBug.detachFromWindow = function(win)
{
    var context = this.getContextByWindow(win);
    if (!context)
        return;
    
    for (var viewName in this.views)
        this.views[viewName].detachContext(context);

    this.destroyContext(context);
}

FireBug.showContext = function(view, context)
{
    if (!this.isWindowInspectable(context.window))
        return;
    
    view.context = context;
    view.contextNode = this.ensureContextNode(view, context);

    view.contextNode.style.display = "block";

    view.showContext(context);
}

FireBug.hideContext = function(view, context)
{
    if (view.contextNode)
        view.contextNode.style.display = "none";
    
    view.hideContext(context);    
}

FireBug.unhookWindow = function(context, win)
{
    try {
        delete win.console;
        win.removeEventListener("mouseover", this.onMouseOver, true);
    } catch (ex) {
        // Get unfortunate errors here sometimes, so let's just ignore them
        // since the window is going away anyhow
    }

    try {        
        if (this.showXMLHttpRequests)
            this.detachXMLHttpSpy(context, win);
    } catch (ex) {
        // Get unfortunate errors here sometimes, so let's just ignore them
        // since the window is going away anyhow
    }
}

FireBug.createContext = function(win)
{
    var browser = this.getBrowserByWindow(win);

    var context = {
        window: win,
        browser: browser,
        contextNodes: {},
        selectedObject: null,
        errorCount: 0,
        spies: [],
        history: [],
        historyIndex: -1,
        messageQueue: [],
        hoverNode: null,
        attachedStyles: false
    };
    
    context.onUnload = function(event) { FireBug.detachFromWindow(win); }
    win.addEventListener("unload", context.onUnload, true);
    
    this.attachToLoadingWindow(win, context);
    
    this.contexts.push(context);
    
    return context;
}

FireBug.destroyContext = function(context)
{
    context.browser.priorLocation = context.window.location.href;
    context.browser.priorView = context.view;
    context.browser.priorState = {
        selectedObject: FireBugUtils.getObjectLocator(context.selectedObject)
    };

    if (context.view)
        context.view.saveState(context, context.browser.priorState);

    for (var name in context.contextNodes)
    {
        var contextNode = context.contextNodes[name];
        if (contextNode)
            contextNode.parentNode.removeChild(contextNode);
    }

    if (context == this.debuggr.debugContext)
        this.stopDebugging();
    
    // For any spies that are in progress, remove our listeners so that they don't leak
    for (var i in context.spies)
    {
        var spy = context.spies[i];
        spy.detach();
    }
    context.spies = null;
    
    var win = context.window;
    win.removeEventListener("unload", context.onUnload, true);
    
    function detach(context, win) { FireBug.unhookWindow(context, win); }
    this.iterateWindows(context, win, detach);

    if (this.contexts)
        FireBugUtils.removeFromList(this.contexts, context);
}

FireBug.createContextNode = function(viewName)
{
    var doc = this.browser.contentDocument;
    
    var node = doc.createElement("div");
    node.className = "contextNode contextNode-" + viewName;
    
    doc.body.appendChild(node);
    
    return node;
}

FireBug.ensureContextNode = function(view, context)
{
    var contextNode = context.contextNodes[view.viewName];
    if (!contextNode)
    {
        contextNode = this.createContextNode(view.viewName);
        context.contextNodes[view.viewName] = contextNode;
    }
    
    return contextNode;
}

FireBug.isXMLPrettyPrinted = function(win)
{
    return win.document && win.document.styleSheets.length
        && win.document.styleSheets[0].href == "chrome://global/content/xml/XMLPrettyPrint.css";
}

FireBug.isWindowInspectable = function(win)
{
    return win.location.href != "about:blank";
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Selects an object and displays it in the most appropriate view.
 */
FireBug.selectObject = function(object, viewName, switchView, keepHistory)
{
    if (!object)
        object = this.currentContext.window.document.documentElement;

    this.currentContext.selectedObject = object;
    FireBugCommandLineAPI.$1 = FireBugCommandLineAPI.$0;
    FireBugCommandLineAPI.$0 = object;
    
    // Shows the right tabs and chooses the best candidate to show the object
    var bestView = this.validateViews(object);

    if (switchView)
    {
        if (!viewName && bestView)
            viewName = bestView.viewName;
        
        // Switch the view and have the new view select the object, all in one go
        if (viewName)
            this.selectView(viewName, object, true);
    }
    else
    {
        // Just update the current view to show the selected object
        this.showContext(this.currentContext.view, this.currentContext);
    }
    
    if (keepHistory)
        this.updateHistory(object, this.currentContext.view.viewName);
    else
        this.appendHistory(object, this.currentContext.view.viewName);

    this.validateHistory();
}

FireBug.selectView = function(viewName, object, keepHistory)
{
    // Once you switch to an inspector view, it becomes the default from then on
    if (this.isMainViewName(viewName))
        this.switchMainView(viewName);

    else
    {
        if (this.currentContext)
            this.currentContext.lastInspector = viewName;
        
        this.switchMainView("inspector");

        this.defaultViewName = viewName;
    }
    
    var view = this.views[viewName];
    if (!view)
        return;
    
    if (this.currentContext)
    {
        if (this.currentView && this.currentView != view)
        {
            this.hideContext(this.currentView, this.currentContext);
            
            var viewButton = document.getElementById("fbTab-" + this.currentView.viewName);
            if (viewButton)
                viewButton.removeAttribute("selected");
        }

        this.currentContext.view = view;
        this.currentView = view;

        if (!object)
            object = this.currentContext.selectedObject;
        
        if (!keepHistory)
            this.updateHistory(object, view.viewName);
        
        this.validateHistory();

        this.showContext(view, this.currentContext);

        this.updateObjectPath(object);

        var viewButton = document.getElementById("fbTab-" + viewName);
        viewButton.setAttribute("selected", "true");
        
        var contextNode = this.currentContext.contextNodes[view.viewName];
        this.searchBox.value = contextNode && contextNode.searchText ? contextNode.searchText : "";
        this.searchBox.disabled = !view.searchable;

        this.setOptionsMenu(view.optionsMenu);
        
        this.clearCommand.setAttribute("disabled", !view.clearable);
    }
}

FireBug.switchMainView = function(viewName)
{    
    var fbCommandBox = document.getElementById("fbCommandBox");
    var fbPathBox = document.getElementById("fbPathBox");
    var fbDebugToolbar = document.getElementById("fbDebugToolbar");
    
    var tabConsole = document.getElementById("fbTab-console");
    var tabInspector = document.getElementById("fbTab-inspector");
    var tabDebugger = document.getElementById("fbTab-js");

    if (viewName == "console")
    {
        tabConsole.setAttribute("selected", "true");
        tabInspector.removeAttribute("selected");
        tabDebugger.removeAttribute("selected");
        fbCommandBox.hidden = false;
        fbPathBox.hidden = true;
        fbDebugToolbar.hidden = true;
    }
    else if (viewName == "inspector")
    {
        tabConsole.removeAttribute("selected");
        tabInspector.setAttribute("selected", "true");
        tabDebugger.removeAttribute("selected");
        fbCommandBox.hidden = true;
        fbPathBox.hidden = false;
        fbDebugToolbar.hidden = true;
    }
    else if (viewName == "js")
    {
        tabConsole.removeAttribute("selected");
        tabInspector.removeAttribute("selected");
        tabDebugger.setAttribute("selected", "true");
        fbCommandBox.hidden = true;
        fbPathBox.hidden = true;
        fbDebugToolbar.hidden = false;
    }
}

FireBug.isMainViewName = function(viewName)
{
    return viewName == "console" || viewName == "js";
}

FireBug.updateHistory = function(object, viewName)
{
    if (this.isMainViewName(viewName))
        return;

    if (this.currentContext.history.length)
    {
        var entry = this.currentContext.history[this.currentContext.historyIndex];
        entry.object = object;
        entry.viewName = viewName;
    }
}

FireBug.appendHistory = function(object, viewName)
{
    if (this.isMainViewName(viewName))
    {    
        var bestView = this.validateViews(object);
        viewName = bestView.viewName;
    }
    
    var isSameView = false;
    if (this.currentContext.history.length)
    {
        var entry = this.currentContext.history[this.currentContext.historyIndex];
        isSameView = viewName == entry.viewName && object == entry.object;
    }

    if (!isSameView)
    {
        ++this.currentContext.historyIndex;
        this.currentContext.history.splice(this.currentContext.historyIndex);
        this.currentContext.history.push({object: object, viewName: viewName});
    }
}

FireBug.getHistoryObject = function(n)
{
    var index = (this.currentContext.history.length-1) - n;
    if (index < 0 || index >= this.currentContext.length)
        return null;
    
    var entry = this.currentContext.history[index];
    return entry.object;
}

FireBug.validateHistory = function()
{
    var cmdBack = document.getElementById("cmd_inspectBack");
    cmdBack.setAttribute("disabled", this.currentContext.historyIndex <= 0);

    var cmdForward = document.getElementById("cmd_inspectForward");
    cmdForward.setAttribute("disabled",
        this.currentContext.historyIndex == this.currentContext.history.length-1);
}

FireBug.validateViews = function(object)
{
    this.updateObjectPath(object);
    
    var bestView = this.currentContext ? this.currentContext.view : null;
    var bestLevel = this.viewSupportsObject(bestView, object);
    if (!bestLevel)
        bestView = null;
    
    var pathBox = document.getElementById("fbPathBox");
    for (var child = pathBox.firstChild; child; child = child.nextSibling)
    {
        var viewName = child.getAttribute("view");
        if (viewName)
        {
            var view = this.views[viewName];

            var supportLevel = view ? this.viewSupportsObject(view, object) : 0;
            
            if (!bestLevel || (supportLevel && supportLevel < bestLevel))
            {
                bestLevel = supportLevel;
                bestView = view;
            }
            
            child.setAttribute("collapsed", supportLevel == 0);
        }
    }

    return bestView;
}

FireBug.updateObjectPath = function(object)
{
    this.pathText.value = this.getObjectPath(object);
}

FireBug.viewSupportsObject = function(view, object)
{
    if (view)
    {
        try {
            // This tends to throw exceptions a lot because some objects are weird
            return view.supportsObject(object)
        } catch (exc) {}
    }
    
    return 0;
}

FireBug.setOptionsMenu = function(menu)
{
    this.optionsButton.setAttribute("disabled", !menu);

    if (this.optionsMenu)
        this.appBox.appendChild(this.optionsMenu);

    this.optionsMenu = menu;
    
    if (menu)
        this.optionsButton.appendChild(menu);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.getContextByWindow = function(source)
{
    for (var i = 0; i < this.contexts.length; ++i)
    {
        var context = this.contexts[i];
        if (context.window == source)
            return context;
    }
    return null;
}

FireBug.getBrowserByWindow = function(win)
{
    var tabBrowser = document.getElementById("content");
    for (var i = 0; i < tabBrowser.browsers.length; ++i)
    {
        var browser = tabBrowser.browsers[i];
        if (browser.contentWindow == win)
            return browser;
    }
    
    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.disableXMLHttpSpy = function(disabled)
{
    this.showXMLHttpRequests = !disabled;
    
    function attach(context, win) { FireBug.attachXMLHttpSpy(context, win); }
    function detach(context, win) { FireBug.detachXMLHttpSpy(context, win); }

    for (var i in this.contexts)
        this.iterateWindows(this.contexts[i], this.contexts[i].window, disabled ? detach : attach);
}

FireBug.attachXMLHttpSpy = function(context, win)
{
    if (win && win.XMLHttpRequest && !win.XMLHttpRequest.wrapped)
    {
        // Don't attach to XML documents - there are bugs in Firefox's XML document
        // implementation that prevent the spy from working correctly
        if (win.document && win.document.xmlVersion)
            return;

        win.XMLHttpRequest.wrapped = {
            open: win.XMLHttpRequest.prototype.open,
            send: win.XMLHttpRequest.prototype.send,
            load: win.XMLDocument.prototype.load
        };            

        win.XMLHttpRequest.prototype.open = function(method, url, async)
            { FireBug.httpOpenWrapper(this, context, win, method, url, async); };

        win.XMLDocument.prototype.load = function(url, async)
            { FireBug.httpLoadWrapper(this, context, win, url, async); };

        setTimeout(function() { FireBug.insertSafeWrapper(win); }, 0);
    }
}

FireBug.detachXMLHttpSpy = function(context, win)
{
    if (win && win.XMLHttpRequest && win.XMLHttpRequest.wrapped)
    {
        win.XMLHttpRequest.prototype.open = win.XMLHttpRequest.wrapped.open;
        win.XMLDocument.prototype.load = win.XMLHttpRequest.wrapped.load;

        delete win.XMLHttpRequest.wrapped;
    }
}

FireBug.insertSafeWrapper = function(win)
{
    if (!win.__firebug__)
    {
        // For security purposes we can't call open() directly, we have to insert the 
        // calling code into the page so that the page's own security credentials are
        // assigned
        FireBugUtils.evalSafeScript(win,
            "window.__firebug__ = { " + 
            "open: function(req, m, u, s) { req.__open(m, u, s); delete req.__open; }, " + 
            "send: function(req, text) { req.send(text); }" + 
            "}"
        );
    }
}

FireBug.httpOpenWrapper = function(request, context, win, method, url, async)
{
    var spy = new XMLHttpRequestSpy(request, context, win);
    context.spies.push(spy);

    spy.method = method;
    spy.url = url;
    
    spy.send = request.send;
    request.send = function(text) { FireBug.httpSendWrapper(spy, text); }
    
    FireBug.insertSafeWrapper(win);
    
    //if (!async)
        //this.console.log([this.strings.getString("SyncWarning")], "error", 
            //FireBug_logFormattedRow, context, true);
    
    request.__open = win.XMLHttpRequest.wrapped.open;
    if (win.__firebug__)
        win.__firebug__.open(request, method, url, async);
}

FireBug.httpSendWrapper = function(spy, text)
{
    spy.postText = text;

    spy.logRow = FireBug.console.log(spy, "xhr", null, spy.context, true);
    FireBugUtils.setClass(spy.logRow, "loading");

    spy.attach();
    
    FireBug.insertSafeWrapper(spy.win);
    
    spy.request.send = spy.send;
    if (spy.win.__firebug__)
        spy.win.__firebug__.send(spy.request, text);
}

FireBug.onHTTPSpyReadyStateChange = function(spy)
{
    if (spy.onreadystatechange)
        spy.onreadystatechange.handleEvent();

    if (spy.request.readyState == 4)
        this.onHTTPSpyLoad(spy);
}

FireBug.onHTTPSpyLoad = function(spy)
{
    if (!spy.responseText)
        spy.responseText = spy.request.responseText;

    FireBugUtils.removeClass(spy.logRow, "loading");
    FireBugUtils.setClass(spy.logRow, "loaded");

    FireBug.updateHttpSpyInfo(spy);

    spy.detach();
    
    if (spy.context.spies)
        FireBugUtils.removeFromList(spy.context.spies, spy);
}

FireBug.onHTTPSpyError = function(spy)
{
    FireBugUtils.removeClass(spy.logRow, "loading");
    FireBugUtils.setClass(spy.logRow, "error");

    spy.detach();

    if (spy.context.spies)
        FireBugUtils.removeFromList(spy.context.spies, spy);
}

FireBug.httpLoadWrapper = function(doc, context, win, url, async)
{
    var logRow = FireBug.console.log(doc, "xhr", null, context);
    FireBugUtils.setClass(logRow, "loading");
    
    function onLoad() { FireBug.onXMLDocumentSpyLoad(logRow); }
    function onError() { FireBug.onXMLDocumentSpyError(logRow); }

    doc.addEventListener("load", onLoad, true);
    doc.addEventListener("error", onError, true);

    doc.__load = win.XMLHttpRequest.wrapped.load;
    doc.__load(url, async);
    delete doc.__load;
}

FireBug.onXMLDocumentSpyLoad = function(logRow)
{
    FireBugUtils.removeClass(logRow, "loading");
}

FireBug.onXMLDocumentSpyError = function(logRow)
{
    FireBugUtils.removeClass(logRow, "loading");
    FireBugUtils.setClass(logRow, "error");
}

FireBug.createHttpSpyInfo = function(spy, body)
{
    function onClickTab(event)
    {
        body.selectTab(event.target);
    }
    
    var postTitle = "Post";
    
    withDocument(body.ownerDocument, function() {
        appendNodes(body, [
            DIV({"class": "XHRSpyLinks"}, [
                spy.postText
                    ? A({"class": "XHRSpyPostTitle XHRSpyTitle", onclick: onClickTab,
                        view: "Post"},
                        FireBug.strings.getString("Post"))
                    : null,
                A({"class": "XHRSpyResponseTitle XHRSpyTitle", onclick: onClickTab,
                    view: "Response"},
                    FireBug.strings.getString("Response")),
                    
                A({"class": "XHRSpyResponseTitle XHRSpyTitle", onclick: onClickTab,
                    view: "Headers"},
                    FireBug.strings.getString("Headers"))
            ]),
            spy.postText ? PRE({"class": "XHRSpyPostText XHRSpyText"}, TEXT(spy.postText)) : null,
            PRE({"class": "XHRSpyResponseText XHRSpyText"}, FireBug.strings.getString("Loading")),
            PRE({"class": "XHRSpyHeadersText XHRSpyText"}, FireBug.strings.getString("Loading"))
        ]);
    });
}

FireBug.updateHttpSpyInfo = function(spy, body)
{
    if (!body)
        body = FireBugUtils.getChildByClassName(spy.logRow, "XHRSpyBody");
    
    if (!body.firstChild)
        this.createHttpSpyInfo(spy, body);

    var postText = FireBugUtils.getChildByClassName(body, "XHRSpyPostText");
    if (postText && !postText.firstChild)
        postText.appendChild(body.ownerDocument.createTextNode(spy.postText));
    
    if (spy.request.readyState == 4)
    {
        // Random unexplained exceptions coming from getAllResponseHeaders, sadly
        var headers = "";
        try { headers = spy.request.getAllResponseHeaders(); } catch (exc) {}
        
        var headersText = FireBugUtils.getChildByClassName(body, "XHRSpyHeadersText");
        if (headersText)
        {
            var headersTextNode = body.ownerDocument.createTextNode(headers);
            headersText.replaceChild(headersTextNode, headersText.firstChild);
        }
        
        var responseText = FireBugUtils.getChildByClassName(body, "XHRSpyResponseText");
        if (responseText)
        {
            var responseTextNode = body.ownerDocument.createTextNode(spy.request.responseText);
            responseText.replaceChild(responseTextNode, responseText.firstChild);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.attachStyles = function(context, win)
{
    var link = win.document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "chrome://firebug/content/outlines.css");

    var heads = win.document.getElementsByTagName("head");
    if (heads.length)
        heads[0].appendChild(link);
    else
        win.document.documentElement.appendChild(link);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.togglePanel = function(show)
{
    var toggleOff = show == undefined ? !this.logBox.collapsed : !show;
    
    if (!toggleOff && this.disabled)
        this.setBoolPref("disabled", false);
    
    this.showPanel(!toggleOff);
}

FireBug.showPanel = function(show)
{
    if (this.currentContext)
        this.currentContext.browser.showFireBug = show;
    
    this.logSplitter.setAttribute("collapsed", !show);
    this.logBox.setAttribute("collapsed", !show);
    this.toggleMenu.setAttribute("checked", show == true);
}

FireBug.toggleOption = function(menuitem)
{
    var checked = menuitem.getAttribute("checked") == "true";
    var option = menuitem.getAttribute("option");

    for (var i in this.boolPrefNames)
    {
        var prefName = this.boolPrefNames[i];
        if (prefName == option)
        {
            this.setBoolPref(prefName, checked);
            if (this.currentContext)
                this.currentContext.view.setOption(prefName, checked);
            break;
        }
    }
}

FireBug.clearConsole = function()
{
    this.currentContext.view.clear();
}

FireBug.focusCommandLine = function()
{
    FireBug.showPanel(true);
    this.selectView("console");

    this.commandLine.select();
}

FireBug.focusSearch = function()
{
    this.searchBox.select();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.increaseErrorCount = function(context)
{
    if (!context)
        context = this.currentContext;
    
    if (context)
        this.showErrorCount(++context.errorCount);
}

FireBug.showErrorCount = function(errorCount)
{
    if (errorCount)
    {
        var errorLabel = errorCount > 1 ? " Errors" : " Error";
        this.statusText.setAttribute("value", errorCount + errorLabel);
        this.statusBar.setAttribute("errors", "true");
    }
    else
    {
        this.statusText.setAttribute("value", "");
        this.statusBar.removeAttribute("errors");
    }
}

FireBug.categoryFilter = function(errorHref, errorCategory, isWarning)
{
    var m = this.urlRegex.exec(errorHref);
    var errorScheme = m ? m[1] : "";
    if (errorScheme == "javascript")
        return true;

    var isChrome = false;
    
    var categories = errorCategory.split(" ");
    for (var i in categories)
    {

        var category = categories[i];
        if (category == "CSS" && !FireBug.showCSSErrors)
            return false;
        else if ((category == "XML" || category == "malformed-xml" ) && !FireBug.showXMLErrors)
            return false;
        else if ((category == "javascript" || category == "JavaScript")
                    && !isWarning && !FireBug.showJSErrors)
            return false;
        else if ((category == "javascript" || category == "JavaScript")
                    && isWarning && !FireBug.showJSWarnings)
            return false;
        else if (errorScheme == "chrome" || category == "XUL" || category == "chrome"
                || category == "component")
            isChrome = true;
    }
    
    if ((isChrome && !FireBug.showChromeErrors) || (!isChrome && !FireBug.showWebErrors))
        return false;
    
    return true;
}

FireBug.domainFilter = function(errorHref)
{
    if (FireBug.showExternalErrors)
        return true;
                
    var browserWin = document.getElementById("content").contentWindow;

    var m = this.urlRegex.exec(browserWin.location.href);
    if (!m)
        return false;
        
    var browserDomain = m[3];

    m = this.urlRegex.exec(errorHref);
    if (!m)
        return false;

    var errorScheme = m[1];
    var errorDomain = m[3];
    
    return errorScheme == "javascript"
        || errorScheme == "chrome"
        || errorDomain == browserDomain;
}

FireBug.toggleInspecting = function()
{
    if (this.disabled)
        return;
    
    if (this.inspecting)
        this.stopInspecting(true);
    else
        this.startInspecting();
}

FireBug.startInspecting = function()
{
    if (this.inspecting || !this.currentContext || !this.currentContext.loaded)
        return;
    
    this.inspecting = true;
    this.inspectingWindow = this.currentContext.window;
    
    this.inspectCommand.setAttribute("checked", "true");

    window.addEventListener("keypress", FireBug.onSelectKeyPress, true);
    this.attachInspectListeners(this.inspectingWindow);
    
    // Remember the previous view so we can switch back if the user cancels
    this.previousViewName = this.currentContext.view.viewName;
    
    if (!this.currentContext.view || this.isMainViewName(this.currentContext.view.viewName))
        this.selectView(this.defaultViewName);
    
    // Remember if the panel was closed so we can re-close it if the user cancels
    this.previousCollapsed = this.logBox.collapsed;
    
    this.showPanel(true);

    this.currentContext.view.startInspecting();
    
    if (this.currentContext.hoverNode)
        this.inspectElement(this.currentContext.hoverNode);
}

/**
 * Called each time the mouse moves over a new element while inspecting.
 */
FireBug.inspectElement = function(element, stacked)
{
    if (element && element.nodeType != 1)
        element = element.parentNode;

    this.highlightElement(element);

    if (this.inspectTimeout)
        clearTimeout(this.inspectTimeout);

    this.inspectedElement = element;

    if (element)
    {
        var self = this;
        var view = this.currentContext.view;
        var callback = function()
        {
            self.pathText.value = self.getObjectPath(element);

            if (!stacked)
                this.inspectingStack = [element];

            if (!self.viewSupportsObject(view, element))
            {
                var bestView = self.validateViews(element);
                self.selectView(bestView.viewName, element, true);
            }
            else
                view.inspect(element);
        };
        
        this.inspectTimeout = setTimeout(callback, FireBug.inspectDelay);
    }
    else
        this.inspectingStack = [];
}

/**
 * Called when the user picks an element or aborts the inspecting process.
 */
FireBug.stopInspecting = function(cancelled, waitForClick)
{
    if (!this.inspecting)
        return;
    
    if (this.inspectTimeout)
        clearTimeout(this.inspectTimeout);

    window.removeEventListener("keypress", FireBug.onSelectKeyPress, true);
    this.detachInspectListeners(this.inspectingWindow);

    if (!waitForClick)
        this.detachClickInspectListeners(this.inspectingWindow);
    
    this.inspectCommand.setAttribute("checked", "false");

    if (cancelled)
    {
        if (this.previousCollapsed)
            this.showPanel(false);
        
        this.validateViews(this.currentContext.selectedObject);
        this.selectView(this.previousViewName);
    }
    else
    {
        this.selectObject(this.inspectedElement);
        this.currentContext.view.contextNode.focus();
    }
    
    this.inspectElement(null);

    this.currentContext.view.stopInspecting(cancelled);

    this.inspecting = false;
}

FireBug.attachInspectListeners = function(win)
{
    if (!win || !win.document)
        return;

    win.document.addEventListener("mouseover", this.onInspectingMouseOver, true);
    win.document.addEventListener("mousedown", this.onInspectingMouseDown, true);
    win.document.addEventListener("click", this.onInspectingClick, true);
    
    for (var i = 0; i < win.frames.length; ++i)
    {
        var subWin = win.frames[i];
        if (subWin != win)
            this.attachInspectListeners(subWin);
    }
}

FireBug.detachInspectListeners = function(win)
{
    if (!win || !win.document)
        return;

    win.document.removeEventListener("mouseover", this.onInspectingMouseOver, true);
    win.document.removeEventListener("mousedown", this.onInspectingMouseDown, true);
    
    for (var i = 0; i < win.frames.length; ++i)
    {
        var subWin = win.frames[i];
        if (subWin != win)
            this.detachInspectListeners(subWin);
    }
}

FireBug.detachClickInspectListeners = function(win)
{
    if (!win || !win.document)
        return;
        
    win.document.removeEventListener("click", this.onInspectingClick, true);
    
    for (var i = 0; i < win.frames.length; ++i)
    {
        var subWin = win.frames[i];
        if (subWin != win)
            this.detachClickInspectListeners(subWin);
    }
}

FireBug.inspectBack = function()
{
    if (this.currentContext.historyIndex > 0)
    {
        var entry = this.currentContext.history[--this.currentContext.historyIndex];
        this.selectObject(entry.object, entry.viewName, true, true);
    }
}

FireBug.inspectForward = function()
{
    if (this.currentContext.historyIndex < this.currentContext.history.length-1)
    {
        var entry = this.currentContext.history[++this.currentContext.historyIndex];
        this.selectObject(entry.object, entry.viewName, true, true);
    }
}

FireBug.inspectEval = function(expr)
{
    var object = FireBugCommandLine.evaluate(expr);
    this.selectObject(object, null, true);
}

/**
 * Called when an object link is clicked.
 */
FireBug.browseObject = function(object)
{
    if (object instanceof SourceLink)
    {
        if (this.debuggr.isScriptHref(object.href, this.currentContext))
        {
            // If the link is to a script, open it in the debugger
            this.selectView("js");
            this.debuggr.viewSource(object.href, object.line);
        }
        else
        {
            // Otherwise, open the script in the view-source window
            FireBugUtils.viewSource(object.href, object.line);
        }
    }
    else
        this.selectObject(object, null, true);
}

/**
 * Called when an object link is control-clicked (or platform equivalent).
 */
FireBug.visitObject = function(object)
{
    if (object instanceof Window)
    {
        FireBugUtils.openNewTab(object.location.href);
    }
    else if (object instanceof Element)
    {
        if (object.localName == "SCRIPT")
            FireBugUtils.openNewTab(object.src);
        else if (object.localName == "LINK")
            FireBugUtils.openNewTab(object.href);
        else if (object.localName == "A")
            FireBugUtils.openNewTab(object.href);
        else if (object.localName == "IMG")
            FireBugUtils.openNewTab(object.src);
    }
    else if (object instanceof SourceLink)
    {
        FireBugUtils.openNewTab(object.href);
    }
    else if (object instanceof XMLHttpRequestSpy)
    {
        FireBugUtils.openNewTab(object.request.channel.name);
    }
}

FireBug.highlightObject = function(object)
{
    var elements = [];
    if (!object)
        1;
        
    else if (object instanceof Window)
        elements = [];

    else if (object instanceof Element)
        elements = [object];

    else if (object instanceof Text)
        elements = [object.parentNode];

    else if (object instanceof CSSStyleRule)
        elements = FireBugUtils.getRuleMatchingElements(object,
            this.currentContext.window.document);

    this.highlightElements(elements);
}

FireBug.highlightElement = function(element)
{
    this.highlightElements([element]);
}

FireBug.highlightElements = function(elements)
{
    if (this.currentContext && !this.currentContext.attachedStyles)
    {
        this.currentContext.attachedStyles = true;
        
        function attach(context, win) { FireBug.attachStyles(context, win); }
        this.iterateWindows(this.currentContext, this.currentContext.window, attach);
    }

    for (var i in this.highlightedElements)
    {
        var element = this.highlightedElements[i];
        if (isElement(element))
            element.removeAttribute("firebug-outline");
    }
    
    this.highlightedElements = elements;
   
    for (var i in elements)
    {
        var element = elements[i];
        if (isElement(element))
            element.setAttribute("firebug-outline", "true");
    }
}

FireBug.highlightSelected = function(state)
{
    if (this.currentContext && this.currentContext.selectedObject && state)
        this.highlightElement(this.currentContext.selectedObject);
    else
        this.highlightElement(null);
}

/**
 * Shows the currently selected object in the view most appropriate.
 */
FireBug.showSelected = function()
{
    if (this.currentContext.selectedObject)
    {
        var bestView = this.validateViews(this.currentContext.selectedObject);
        this.selectView(bestView.viewName);
    }
} 

FireBug.inspectElementBy = function(dir)
{
    var element = this.inspectedElement;
    var stacked = false;
    
    if (dir == "up")
    {
        element = this.inspectedElement.parentNode;
        stacked = true;
        
        if (element && element.nodeType == 1)
            this.inspectingStack.push(element);
    }
    else if (dir == "down")
    {
        if (this.inspectingStack.length > 0)
        {
            var stackIndex = this.inspectingStack.length-1;
            element = this.inspectingStack[stackIndex-1];
            this.inspectingStack.splice(stackIndex);

            stacked = true;
        }
        else
            element = FireBugUtils.getNextElement(this.inspectedElement.firstChild);
    }
    else if (dir == "left")
        element = FireBugUtils.getPreviousElement(element.previousSibling);
    else if (dir == "right")
        element = FireBugUtils.getNextElement(element.nextSibling);

    if (!element || element.nodeType != 1)
        element = this.inspectedElement;
    
    this.inspectElement(element, stacked);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.startDebugging = function(context, frame)
{
    this.showPanel(true);
    
    // Prevent the debugger from showing the first script, since we want to show the
    // script for the frame that is about to be debugged
    this.debuggr.noShowScript = true;
    
    this.selectView("js");
    this.debuggr.startDebugging(context, frame);
}

FireBug.toggleDebugging = function()
{
    if (this.debuggr.debugging || this.debuggr.paused)
        this.debuggr.resume();

    else
        this.debuggr.pause(this.currentContext);
}

FireBug.stopDebugging = function()
{
    this.debuggr.resume();
}

FireBug.showScriptItem = function(menuitem)
{
    this.debuggr.showScript(menuitem.scriptFile);
}

FireBug.showStackItem = function(menuitem)
{
    this.debuggr.showStackFrame(this.currentContext, menuitem.stackFrame);   
}

FireBug.updateScriptList = function()
{
    this.debuggr.updateScriptList(this.currentContext);
}

FireBug.stepDebugger = function()
{
    this.debuggr.step(FireBugJSView.STEP_OVER);
}

FireBug.stepIntoDebugger = function()
{
    this.debuggr.step(FireBugJSView.STEP_INTO);
}

FireBug.stepOutDebugger = function()
{
    this.debuggr.step(FireBugJSView.STEP_OUT);
}

FireBug.clearAllBreakpoints = function()
{
    this.debuggr.clearAllBreakpoints(this.currentContext);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.search = function(text)
{
    this.searchBox.value = text;
    this.updateSearch();
}

FireBug.updateSearch = function()
{
    var view = this.currentContext.view;
    if (!view.searchable)
        return;
    
    var contextNode = view.context.contextNodes[view.viewName];

    var value = this.searchBox.value;

    // This sucks, but the find service won't match nodes that are invisible, so we
    // have to make sure to make them all visible unless the user is appending to the
    // last string, in which case it's ok to just search the set of visible nodes
    if (value.indexOf(contextNode.searchText) != 0)
        FireBugUtils.removeClass(contextNode, "searching");

    // Cancel the previous search to keep typing smooth
    clearTimeout(contextNode.searchTimeout);

    // After a delay, perform the search
    contextNode.searchTimeout = setTimeout(function()
    {
        if (value)
        {
            view.search(value);
            
            // Hides all nodes that didn't pass the filter
            FireBugUtils.setClass(contextNode, "searching");
        }
        else
        {
            // Makes all nodes visible again
            FireBugUtils.removeClass(contextNode, "searching");
        }
        
        contextNode.searchText = value;
    }, this.searchDelay);
}

FireBug.onSearchKeyDown = function(event)
{
    var view = this.currentContext.view;
    if (!view.searchable)
        return;

    if (event.keyCode == 13)
        view.search(this.searchBox.value);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.onBrowserLoad = function(event)
{
    FireBug.attach();
}

FireBug.onMouseOver = function(event)
{
    if (FireBug.currentContext)
        FireBug.currentContext.hoverNode = event.target;
}

FireBug.onInspectingMouseOver = function(event)
{
    FireBug.inspectElement(event.target);
}

FireBug.onInspectingMouseDown = function(event)
{
    FireBug.stopInspecting(false, true);

    event.stopPropagation();
    event.preventDefault();
}

FireBug.onInspectingClick = function(event)
{
    FireBug.detachClickInspectListeners(FireBug.inspectingWindow);

    event.stopPropagation();
    event.preventDefault();
}

FireBug.onSelectKeyPress = function(event)
{
    if (event.keyCode == 13)
        FireBug.stopInspecting();

    else if (event.keyCode == 27)
        FireBug.stopInspecting(true);

    else if (event.keyCode >= 37 && event.keyCode <= 40)
    {
        if (event.keyCode == 38)
            FireBug.inspectElementBy("up");
        else if (event.keyCode == 40)
            FireBug.inspectElementBy("down");
        else if (event.keyCode == 37)
            FireBug.inspectElementBy("left");
        else if (event.keyCode == 39)
            FireBug.inspectElementBy("right");
    }
    else
        return;
        
    event.stopPropagation();
    event.preventDefault();
}

FireBug.onOptionsPopup = function(popup)
{
    for (var child = popup.firstChild; child; child = child.nextSibling)
    {
        var viewName = child.getAttribute("view");
       
        if (child.localName == "menuitem")
        {
            var option = child.getAttribute("option");
            if (!option)
                continue;
            
            var checked = false;
            for (var i in this.boolPrefNames)
            {
                var prefName = this.boolPrefNames[i];
                if (prefName == option)
                {
                    checked = this.getBoolPref(prefName);
                    break;
                }
            }
            
            child.setAttribute("checked", checked);
        }
    }
}

FireBug.onSwitchView = function(button)
{
    var viewName = button.getAttribute("view");
    this.selectView(viewName);
}

FireBug.onSwitchTab = function(button)
{
    var viewName = button.getAttribute("view");
    if (viewName == "console")
    {
        this.selectView("console");
        this.commandLine.select();
    }
    else if (viewName == "inspector")
    {
        if (this.currentContext)
            this.selectObject(this.currentContext.selectedObject,
                this.currentContext.lastInspector, true);
        else
            this.selectView(this.defaultViewName);
    }
    else
        this.selectView(viewName);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.getObjectTitle = function(object)
{
    if (typeof(object) == "undefined")
    {
        return "undefined";
    }
    else if (object == null)
    {
        return "null";
    }
    else if (object instanceof Window)
    {
        return "[Window]";
    }
    else if (object instanceof Document)
    {
        return "[Document] " + object.location;
    }
    else if (object instanceof Element)
    {
        return '<' + object.localName.toLowerCase()
            + (object.id ? ' id="' + object.id + '"' : "")
            + (object.className ? ' class="' + object.className + '"' : "")
            + '>';
    }
    else if (object instanceof Text)
    {
        return '"' + object.nodeValue.substr(0, 30) + '"';
    }
    else if (object instanceof CSSStyleRule)
    {
        return object.selectorText;
    }
    else if (object instanceof EventCopy || object instanceof Event)
    {
        return "[Event] " + object.type;
    }
    else
        return object;
}

FireBug.getObjectPath = function(object)
{
    if (typeof(object) == "undefined" || object == null)
    {
        return "";
    }
    else if (object instanceof Window)
    {
        // XXXjoe Need to put this here because for some odd reason, 
        // `object instanceof Element` throws an exception if object is a Window!
        return "[Window]";
    }
    else if (object instanceof Element)
    {
        return FireBugUtils.getElementXPath(object);
    }
    else
    {
        return this.getObjectTitle(object);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug.initBoolPrefs = function(prefNames)
{
    for (var i in prefNames)
    {
        var prefName = prefNames[i];
        this[prefName] = this.prefs.getBoolPref("extensions.firebug." + prefName);
    }
}

FireBug.getBoolPref = function(prefName)
{
    return this.prefs.getBoolPref("extensions.firebug." + prefName);
}

FireBug.setBoolPref = function(prefName, value)
{
    this[prefName] = value;
    this.prefs.setBoolPref("extensions.firebug." + prefName, value);
}

FireBug.iterateWindows = function(context, win, handler)
{
    if (!win || !win.document)
        return;

    handler(context, win);
    
    for (var i = 0; i < win.frames.length; ++i)
    {
        var subWin = win.frames[i];
        if (subWin != win)
            this.iterateWindows(context, subWin, handler);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

var FireBugConsoleListener = 
{
    observe : function(object)
    {
        try
        {
            if (object instanceof Components.interfaces.nsIScriptError)
            {
                var isWarning = object.flags & Components.interfaces.nsIScriptError.warningFlag;
                if (!FireBug.categoryFilter(object.sourceName, object.category, isWarning) 
                    || !FireBug.domainFilter(object.sourceName))
                    return;

                if (!isWarning)    
                    FireBug.increaseErrorCount();
    
                if (object.flags & Components.interfaces.nsIScriptError.warningFlag)
                    FireBug.console.log(object, "consoleWarning");
                else
                    FireBug.console.log(object, "consoleError");
            }
            else if (FireBug.showMessages)
                FireBug.console.log(object, "object");
        }
        catch (exc)
        {
            
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

var FireBugPrefsObserver =
{
    observe: function(subject, topic, data)
    {
        if (data == "extensions.firebug.disabled")
            FireBug.disable(FireBug.getBoolPref("disabled"));
        else if (data == "extensions.firebug.showXMLHttpRequests")
            FireBug.disableXMLHttpSpy(!FireBug.getBoolPref("showXMLHttpRequests"));
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////

var nsIWebProgressListener = Components.interfaces.nsIWebProgressListener;

function FireBugWebProgressListener()
{
}

FireBugWebProgressListener.prototype =
{
    stateIsRequest: false,
    
    QueryInterface : function(iid)
    {
        if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
            iid.equals(Components.interfaces.nsISupportsWeakReference) ||
            iid.equals(Components.interfaces.nsISupports))
        {
            return this;
        }
        
        throw Components.results.NS_NOINTERFACE;
    },
    
    onLocationChange: function(progress, request, location) {},
    onStateChange : function(progress, request, flag, status) {},
    onProgressChange : function(a,b,c, d,e,f) {},
    onStatusChange : function(a,b,c,d) {},
    onSecurityChange : function(a,b,c) {},
    onLinkIconAvailable : function(a) {} 
};

var FireBugTabProgressListener = new FireBugWebProgressListener();

FireBugTabProgressListener.onLocationChange = function(progress, request, location)
{
    // Only attach to windows that are their own parent - e.g. not frames
    if (progress.DOMWindow.parent == progress.DOMWindow)
        FireBug.attachToWindow(progress.DOMWindow);
}

FireBugTabProgressListener.onStateChange = function(progress, request, flag, status)
{
    // When the load of the top-level page completes
    if (flag & nsIWebProgressListener.STATE_STOP)
        FireBug.attachToLoadedWindow(progress.DOMWindow);
}

var FireBugFrameProgressListener = new FireBugWebProgressListener();

FireBugFrameProgressListener.onStateChange = function(progress, request, flag, status)
{
    // When the load of the top-level page or a frame within begins
    if (flag & nsIWebProgressListener.STATE_START)
        FireBug.attachToLoadingWindow(progress.DOMWindow);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function XMLHttpRequestSpy(request, context, win)
{
    this.request = request;
    this.context = context;
    this.win = win;
    this.responseText = null;
}

XMLHttpRequestSpy.prototype = {};

XMLHttpRequestSpy.prototype.attach = function()
{
    var spy = this;
    this.onReadyStateChange = function() { FireBug.onHTTPSpyReadyStateChange(spy); }
    this.onLoad = function() { FireBug.onHTTPSpyLoad(spy); }
    this.onError = function() { FireBug.onHTTPSpyError(spy); }

    this.onreadystatechange = this.request.onreadystatechange;

    this.request.onreadystatechange = this.onReadyStateChange;    
    this.request.addEventListener("load", this.onLoad, true);
    this.request.addEventListener("error", this.onError, true);
}

XMLHttpRequestSpy.prototype.detach = function()
{
    this.request.onreadystatechange = this.onreadystatechange;
    try { this.request.removeEventListener("load", this.onLoad, true); } catch (e) {}
    try { this.request.removeEventListener("error", this.onError, true); } catch (e) {}

    this.onreadystatechange = null;
    this.onLoad = null;
    this.onError = null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Because event objects can't be long lived, we must make a copy of them to represent
 * them long term in the inspector.
 */
function EventCopy(event)
{
    for (var name in event)
        this[name] = event[name];
}

function SourceLink(href, line)
{
    this.href = href;
    this.line = line;
}

function SourceFile(href, text, sourceNode)
{
    this.href = href;
    this.text = text;
    this.sourceNode = sourceNode;
}

function StackTrace(frame)
{
    this.frames = [];
    
    for (; frame; frame = frame.caller)
    {
        if (frame.languageName == "JavaScript"
            && !(frame.filename && frame.filename.indexOf("chrome://firebug/") == 0))
        {
            this.frames.push({
                functionName: frame.name,
                fileName: frame.filename,
                line: frame.lineNumber
            });
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function ddd()
{
    FireBug.console.log(arguments, "objects");
}

function dds(text)
{
    if (FireBug.consoleService)
        FireBug.consoleService.logStringMessage(text + "");
}
