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
 
var PCMAP_SOURCETEXT = Components.interfaces.jsdIScript.PCMAP_SOURCETEXT;
var RETURN_CONTINUE = Components.interfaces.jsdIExecutionHook.RETURN_CONTINUE;
var TYPE_FUNCTION_RETURN = Components.interfaces.jsdICallHook.TYPE_FUNCTION_RETURN;

function FireBugJSView()
{
    this.firebugService = Components.classes["@joehewitt.com/firebug;1"]
        .getService(Components.interfaces.nsIFireBug);

    this.debugToolbar = document.getElementById("fbDebugToolbar");
    this.scriptMenu = document.getElementById("fbScriptMenu");
    this.scriptList = document.getElementById("fbScriptList");
    this.stackMenu = document.getElementById("fbStackMenu");
    this.stackList = document.getElementById("fbStackList");
}

FireBugJSView.STEP_OVER = 1;
FireBugJSView.STEP_INTO = 2;
FireBugJSView.STEP_OUT = 3;

FireBugJSView.prototype = new FireBugView();

FireBugJSView.prototype.showContext = function(context)
{
    var debugState = this.getDebugState(context);
    this.toggleCommands(debugState);

    if (debugState == "on")
    {
        this.collapseWatchPane(false);
        this.showWatchNode(context.contextNodes["trace"]);
    }
    else
    {
        this.collapseWatchPane(true);
        this.showWatchNode(null);
    }
    
    if (!context.loaded && !this.debugging)
        return;

    if (!context.scriptFiles)
        this.updateScriptFiles(context);

    this.populateScriptList(context);    
    this.populateStackList(context.debugFrame);
    
    if (this.noShowScript)
        this.noShowScript = false;
    else if (context.priorState && context.priorState.lastScript)
    {
        // If the page was reloaded, re-show the script that was showing on the last page
        var lastScript = context.scriptFiles[context.priorState.lastScript];
        context.priorState.lastScript = null;

        this.showScript(lastScript, 0, false, context.priorState.lastScriptScrollY);
    }
    else if (context.currentScript)
        this.showScript(context.currentScript);
    else
    {
        for (var href in context.scriptFiles)
        {
            this.showScript(context.scriptFiles[href]);
            break;
        }
    }
}

FireBugJSView.prototype.hideContext = function(context)
{
    this.toggleCommands("off");
    this.collapseWatchPane(true);
    this.populateStackList(null);
    this.populateScriptList(null);
}

FireBugJSView.prototype.supportsObject = function(object)
{
    return object ? 3 : 0;
}

FireBugJSView.prototype.saveState = function(context, state)
{
    if (context.currentScript)
    {
        state.lastScript = context.currentScript.href;
        
        var contextNode = context.contextNodes[this.viewName];
        state.lastScriptScrollY = contextNode.scrollTop;
    }
}

FireBugJSView.prototype.setOption = function(name, value)
{
    if (name == "enableDebugger")
    {
        if (value)
            this.enable();
        else
            this.disable();
    }
}

FireBugJSView.prototype.searchable = true;

FireBugJSView.prototype.search = function(text)
{
    var doc = this.browser.contentDocument;
    doc.defaultView.getSelection().removeAllRanges();

    var scriptNode = this.contextNode.scriptNode;

    if (!text || !scriptNode)
        return;

    var count = scriptNode.childNodes.length;
    var searchRange = doc.createRange();
    searchRange.setStart(scriptNode, 0);
    searchRange.setEnd(scriptNode, count);

    var startPt = doc.createRange();
    if (text == scriptNode.lastSearchText)
        startPt.setStartAfter(scriptNode.lastSearchContainer);
    else
    {
        startPt.setStart(scriptNode, 0);
        startPt.setEnd(scriptNode, 0);
    }
    
    var endPt = doc.createRange();
    endPt.setStart(scriptNode, count);
    endPt.setEnd(scriptNode, count);

    var retRange = FireBug.finder.Find(text, searchRange, startPt, endPt);
    if (retRange)
    {
        doc.defaultView.getSelection().addRange(retRange);
        FireBugUtils.scrollIntoCenterView(retRange.startContainer.parentNode, this.contextNode);
        
        scriptNode.lastSearchText = text;
        scriptNode.lastSearchContainer = retRange.endContainer;
    }
    else
    {
        scriptNode.lastSearchText = null;
        scriptNode.lastSearchContainer = null;
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// interface nsIFireBugDebugger

FireBugJSView.prototype.supportsWindow = function(win)
{
    var context = win ? FireBug.getContextByWindow(win) : null;
    return context != null;
}

FireBugJSView.prototype.onLock = function(state)
{
    if (this.context != this.debugContext)
    {
        if (state)
            this.toggleCommands("locked");
        else
            this.toggleCommands("off");
    }
}

FireBugJSView.prototype.onExecution = function(win, frame, type, rv)
{
    var returns = RETURN_CONTINUE;

    var context = win ? FireBug.getContextByWindow(win) : null;
    if (context)
        FireBug.startDebugging(context, frame);
    
    return returns;
}

FireBugJSView.prototype.onError = function(frame)
{
    var trace = new StackTrace();

    for (; frame; frame = frame.callingFrame)
    {
        trace.frames.push({
            functionName: frame.functionName,
            fileName: this.normalizeHref(this.getFrameFileName(frame)),
            line: frame.line
        });
    }

    FireBug.errorStackTrace = trace;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugJSView.prototype.enable = function()
{
    this.jsd = Components.classes["@mozilla.org/js/jsd/debugger-service;1"]
        .getService(Components.interfaces.jsdIDebuggerService);

    var self = this;    
    this.eventLoopNested = function() { return self.onEventLoopNested(); }
    this.interruptHook = function(frame, type, rv) { return self.onInterrupt(frame, type, rv); }    
    this.functionHook = function(frame, type) { return self.onFunctionCall(frame, type); }

    this.firebugService.registerDebugger(this);
}

FireBugJSView.prototype.disable = function()
{
    this.resume();
    
    this.firebugService.unregisterDebugger(this);
}

FireBugJSView.prototype.getDebugState = function(context)
{
    return context == this.debugContext
            ? (this.paused ? "paused" : (this.debugging ? "on" : "off"))
            : (this.firebugService.getLocked() ? "locked" : "off");
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugJSView.prototype.startDebugging = function(context, frame)
{
    if (this.debugging)
        return;

    var executionContext;
    try
    {
        executionContext = frame.executionContext;
    }
    catch (exc)
    {
        // Can't proceed with an execution context
        return;
    }

    context.debugFrame = frame;
    
    this.debugging = true;
    this.paused = false;

    this.debugContext = context;
    this.debugExeContext = executionContext;
    this.debugFileName = this.getFrameFileName(frame);
    this.debugLine = frame.line;
    this.debugFrameCount = this.countFrames(frame);
    
    this.jsd.interruptHook = null;
    this.jsd.functionHook = null;
    
    executionContext.scriptsEnabled = false;

    try
    {
        this.jsd.enterNestedEventLoop({onNest: this.eventLoopNested});
    }
    catch (exc)
    {
        // Just ignore exceptions that happened while in the nested loop
    }

    executionContext.scriptsEnabled = true;
}

FireBugJSView.prototype.stopDebugging = function()
{
    if (!this.debugContext)
        return;
    
    FireBugUtils.clearNode(this.stackMenu);
    this.showStackFrame(this.debugContext, null);
    this.toggleCommands(this.paused ? "paused" : "off");
    this.setExecutionLine(this.debugContext, null);

    this.debugContext.debugFrame = null;
    this.debugContext.currentFrame = null;
    
    if (this.debugging)
    {
        this.jsd.exitNestedEventLoop();
        
        this.debugging = false;

        if (!this.paused)
        {
            this.debugContext = null;
            this.debugExeContext = null;
            this.debugFileName = null;
        }
    }
    else
    {
        this.jsd.interruptHook = null;
        this.jsd.functionHook = null;

        this.paused = false;
        this.debugContext = null;
        this.debugExeContext = null;
        this.debugFileName = null;
    }
}

FireBugJSView.prototype.pause = function(context)
{
    this.debugging = false;
    this.paused = true;
    this.toggleCommands("paused");

    this.debugContext = context;
    this.debugFileName = null;
    
    this.firebugService.lockDebugger();

    this.jsd.interruptHook = { onExecute: this.interruptHook };
    this.jsd.functionHook = null;
}

FireBugJSView.prototype.resume = function()
{
    this.paused = false;
    this.collapseWatchPane(true);
    this.firebugService.unlockDebugger();
    this.stopDebugging();
}

FireBugJSView.prototype.step = function(stepType)
{
    this.paused = true;
    this.stepPast = this.debugFrameCount + this.debugFileName + this.debugLine;
    this.stepFrameCount = this.debugFrameCount;
    this.stepType = stepType;
    
    this.jsd.interruptHook = { onExecute: this.interruptHook };
    this.jsd.functionHook = { onCall: this.functionHook };

    this.stopDebugging();
}

FireBugJSView.prototype.setBreakpoint = function(href, lineNo)
{
    this.firebugService.setBreakpoint(href, lineNo);
}

FireBugJSView.prototype.clearBreakpoint = function(href, lineNo)
{
    this.firebugService.clearBreakpoint(href, lineNo);
}

FireBugJSView.prototype.clearAllBreakpoints = function(context)
{
    this.firebugService.clearAllBreakpoints();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugJSView.prototype.isScriptHref = function(href, context)
{
    if (!context.scriptFiles)
        this.updateScriptFiles(context);

    return href in context.scriptFiles;
}

FireBugJSView.prototype.updateScriptFiles = function(context)
{
    if (!context.scriptFiles)
        context.scriptFiles = {};
    
    FireBug.iterateWindows(context, context.window, function(context, win)
    {
        var scripts = win.document.getElementsByTagName("script");

        for (var i = 0; i < scripts.length; ++i)
        {
            var href = scripts[i].src;
            if (!href)
                href = win.location.href;
            
            if (!context.scriptFiles[href])
                context.scriptFiles[href] = new SourceFile(href);
        }
    });
}

FireBugJSView.prototype.normalizeHref = function(href)
{
    // For some reason, JSDS reports file URLs like "file:/" instead of "file:///", so they
    // don't match up with the URLs we get back from the DOM
    return href ? href.replace(/file:\/([^/])/g, "file:///$1") : "";
}

FireBugJSView.prototype.denormalizeHref = function(href)
{
    return href.replace(/file:\/\/\//g, "file:/");
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugJSView.prototype.getFrameWindow = function(frame)
{
    var result = {};
    frame.eval("window", "", 0, result);
    
    var win = result.value.getWrappedValue();
    return FireBugUtils.getRootWindow(win);
}

FireBugJSView.prototype.getCallingFrame = function(frame)
{
    try
    {
        return frame.callingFrame;
    }
    catch (exc)
    {
        return null;
    }
}

FireBugJSView.prototype.getFrameFileName = function(frame)
{
    try
    {
        return frame.script.fileName;
    }
    catch (exc)
    {
        return "";
    }
}

FireBugJSView.prototype.countFrames = function(frame)
{
    var frameCount = 0;
    for (; frame; frame = this.getCallingFrame(frame))
        ++frameCount;
    return frameCount;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugJSView.prototype.populateScriptList = function(context)
{
    FireBugUtils.clearNode(this.scriptMenu);
    
    if (context)
    {
        for (var href in context.scriptFiles)
        {
            var menuitem = document.createElement("menuitem");
            menuitem.setAttribute("label", href);
            menuitem.setAttribute("value", href);
            menuitem.scriptFile = context.scriptFiles[href];
    
            this.scriptMenu.appendChild(menuitem);
        }
    }

    if (context && context.currentScript)
        this.scriptList.value = context.currentScript.href;
    else
        this.scriptList.selectedItem = null;
}

FireBugJSView.prototype.updateScriptList = function(context)
{
    var existingHrefs = {};
    for (var menuitem = this.scriptMenu.firstChild; menuitem; menuitem = menuitem.nextSibling)
        existingHrefs[menuitem.scriptFile.href] = 1;
    
    this.updateScriptFiles(context);
    
    for (var href in context.scriptFiles)
    {
        if (!existingHrefs[href])
        {
            var menuitem = document.createElement("menuitem");
            menuitem.setAttribute("label", href);
            menuitem.setAttribute("value", href);
            menuitem.scriptFile = context.scriptFiles[href];
    
            this.scriptMenu.appendChild(menuitem);
        }
    }
}

FireBugJSView.prototype.populateStackList = function(frame)
{
    FireBugUtils.clearNode(this.stackMenu);

    for (; frame; frame = this.getCallingFrame(frame))
    {
        var fileName = this.getFrameFileName(frame);
        if (fileName)
        {
            var fileName = FireBugUtils.parseFileNameFromURL(fileName);
            var caption = FireBug.strings.getFormattedString("StackItem",
                [frame.functionName, fileName, frame.line]);
            
            var menuitem = document.createElement("menuitem");
            menuitem.setAttribute("label", caption);
            menuitem.stackFrame = frame;
            
            this.stackMenu.appendChild(menuitem);
        }
    }
}

FireBugJSView.prototype.showScript = function(scriptFile, lineNo, selectLine, scrollY)
{
    this.context.currentScript = scriptFile;
    
    if (!this.contextNode.scriptNodes)
        this.contextNode.scriptNodes = {};

    if (this.contextNode.scriptNode)
        this.contextNode.scriptNode.style.display = "none";

    if (scriptFile)
    {
        // Create the node to contain the script nodes if it doesn't exist yet
        var scriptNode = this.contextNode.scriptNodes[scriptFile.href];
        var firstLoad = !scriptNode;
        if (firstLoad)
        {
            scriptNode = this.contextNode.ownerDocument.createElement("div");
            scriptNode.scriptFile = scriptFile;
            scriptNode.onclick = bindFunction(this.onClickLine, this);

            this.contextNode.scriptNodes[scriptFile.href] = scriptNode;
            this.contextNode.appendChild(scriptNode);
        }
            
        this.contextNode.scriptNode = scriptNode;
        
        scriptNode.style.display = "block";

        // Load the script if necessary, or just select the execution line in the existing one
        if (firstLoad || !scriptNode.loaded)
        {
            // If the script is still loading, update the info
            scriptNode.loadingInfo =
                {scriptFile: scriptFile, lineNo: lineNo, selectLine: selectLine, scrollY: scrollY};

            if (firstLoad)
            {
                var onLoadScript = bindFunction(this.onLoadScript, this, this.context, scriptNode);
                FireBug_logSourceFile(scriptFile, scriptNode, false, onLoadScript);
            }
        }
        else if (lineNo)
            this.setExecutionLine(this.context, scriptNode, lineNo, selectLine);
        else if (scrollY)
            this.contextNode.scrollTop = scrollY;
            
        // Select the script in the menulist
        this.scriptList.value = scriptFile.href;
        this.scriptList.disabled = false;
    }
    else
    {
        this.scriptList.selectedItem = null;
    }
}

FireBugJSView.prototype.showStackFrame = function(context, frame)
{
    try
    {
        frame.script.fileName;
    }
    catch (exc)
    {
        // Test to see if the frame is still valid, and return otherwise
        this.stackList.selectedItem = null;
        this.stackList.disabled = true;

        this.showWatchNode(null);
        return;
    }

    context.currentFrame = frame;
    
    if (!this.browserLoaded)
    {
        this.postBrowserLoad = bindFunction(this.showStackFrame, this, context, frame);
        return;
    }
    else if (!context.contextNodes["trace"])
    {
        context.contextNodes["trace"] = FireBug.createContextNode("trace");
        this.debugBrowser.contentDocument.body.appendChild(context.contextNodes["trace"]);
    }
    else
        FireBugUtils.clearNode(context.contextNodes["trace"]);
    
    var data = {};
    data["this"] = frame.thisValue.getWrappedValue();
    
    var listValue = {value: null}, lengthValue = {value: 0};
    frame.scope.getProperties(listValue, lengthValue);

    for (var i = 0; i < lengthValue.value; ++i)
    {
        var prop = listValue.value[i];
        var name = prop.name.getWrappedValue();
        var value = prop.value.getWrappedValue();
        data[name] = value;
    }

    FireBug_logDOM(data, context.contextNodes["trace"]);

    for (var menu = this.stackMenu.firstChild; menu; menu = menu.nextSibling)
    {
        if (menu.stackFrame == frame)
        {
            this.stackList.selectedItem = menu;
            break;
        }
    }

    this.stackList.disabled = false;

    var fileName = frame.script ? this.normalizeHref(frame.script.fileName) : "";
    var scriptFile = context.scriptFiles ? context.scriptFiles[fileName] : null;
    if (!scriptFile)
    {
        this.updateScriptFiles(context);
        this.populateScriptList(context);
        scriptFile = context.scriptFiles[fileName];
    }
    
    this.showScript(scriptFile, frame.line);

    this.showWatchNode(context.contextNodes["trace"]);
}

FireBugJSView.prototype.showWatchNode = function(watchNode)
{
    if (watchNode == this.watchNode)
        return;
    
    if (this.watchNode)
        this.watchNode.style.display = "none";
        
    this.watchNode = watchNode;

    if (watchNode)
        watchNode.style.display = "block";
}

FireBugJSView.prototype.viewSource = function(href, lineNo)
{
    var scriptFile = this.context.scriptFiles[href];
    if (scriptFile)
        this.showScript(scriptFile, lineNo, true);
}

FireBugJSView.prototype.collapseWatchPane = function(collapsed)
{
    // Lazily create the watch pane, so we don't pay for it for every new Firefox window
    // even if you never use the debugger
    if (!this.debugSplitter)
    {
        this.debugSplitter = document.createElement("splitter");
        this.debugSplitter.id = "fbDebugSplitter";
        
        this.debugBrowser = document.createElement("browser");
        this.debugBrowser.id = "fbBrowser2";
        this.debugBrowser.setAttribute("width", "300");
        this.debugBrowser.setAttribute("tooltip", "aHTMLTooltip");
        this.debugBrowser.setAttribute("contextmenu", "contentAreaContextMenu");
        this.debugBrowser.setAttribute("onclick", "return contentAreaClick(event, false)");
        
        var browserBox = document.getElementById("fbBrowserBox");
        browserBox.appendChild(this.debugSplitter);
        browserBox.appendChild(this.debugBrowser);

        this.debugBrowser.addEventListener("load", bindFunction(this.onBrowserLoad, this), true);
        this.debugBrowser.loadURI("chrome://firebug/content/view.html");
    }
    
    this.debugSplitter.collapsed = collapsed;
    this.debugBrowser.collapsed = collapsed;
}

FireBugJSView.prototype.toggleCommands = function(state)
{
    if (state == "locked" || state == "off" || state == "paused" || !state)
    {
        this.debugToolbar.removeAttribute("debugging");

        if (state == "locked")
            document.getElementById("cmd_toggleDebugger").setAttribute("disabled", "true");
        else
            document.getElementById("cmd_toggleDebugger").removeAttribute("disabled");

        document.getElementById("cmd_stepDebugger").setAttribute("disabled", "true");
        document.getElementById("cmd_stepIntoDebugger").setAttribute("disabled", "true");
        document.getElementById("cmd_stepOutDebugger").setAttribute("disabled", "true");
    }
    else if (state == "on")
    {
        this.debugToolbar.setAttribute("debugging", "true");
        document.getElementById("cmd_toggleDebugger").removeAttribute("disabled");
        document.getElementById("cmd_stepDebugger").removeAttribute("disabled");
        document.getElementById("cmd_stepIntoDebugger").removeAttribute("disabled");
        document.getElementById("cmd_stepOutDebugger").removeAttribute("disabled");
    }
    
    document.getElementById("cmd_toggleDebugger").setAttribute("state", state ? state : "off");
}

FireBugJSView.prototype.setExecutionLine = function(context, scriptNode, lineNo, selectLine)
{
    var lineNode = scriptNode ? scriptNode.childNodes[lineNo-1] : null;
    if (lineNode)
        FireBugUtils.scrollIntoCenterView(lineNode, this.contextNode);

    if (lineNode && selectLine)
        lineNode.ownerDocument.defaultView.getSelection().selectAllChildren(lineNode);

    else
    {
        if (context.exeRow)
            context.exeRow.removeAttribute("exeLine");
        
        context.exeRow = lineNode;
        
        if (lineNode)
            lineNode.setAttribute("exeLine", "true");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugJSView.prototype.onEventLoopNested = function()
{
    var context = this.debugContext;

    this.firebugService.lockDebugger();

    this.collapseWatchPane(false);
    this.toggleCommands("on");
    this.populateStackList(context.debugFrame);
    this.showStackFrame(context, context.debugFrame);
}

FireBugJSView.prototype.onInterrupt = function(frame, type, rv)
{
    var fileName = this.getFrameFileName(frame);
    if (fileName.indexOf("chrome:") == 0 || fileName.indexOf("firebug-service.js") != -1)
        return RETURN_CONTINUE;
    
    var win = this.getFrameWindow(frame);
    if (win != this.debugContext.window)
        return RETURN_CONTINUE;

    if (!this.debugFileName)
        FireBug.startDebugging(this.debugContext, frame);

    else
    {
        var frameCount = this.countFrames(frame);
        var frameId = frameCount + fileName + frame.line;
        if (this.stepPast != frameId)
        {
            if (this.stepType == FireBugJSView.STEP_OVER && frameCount > this.stepFrameCount)
                return RETURN_CONTINUE;

            else if (this.stepType == FireBugJSView.STEP_OUT && frameCount >= this.stepFrameCount)
                return RETURN_CONTINUE;
            
            FireBug.startDebugging(this.debugContext, frame);
        }
    }
    
    return RETURN_CONTINUE;
}

FireBugJSView.prototype.onFunctionCall = function(frame, type)
{
    if (type == TYPE_FUNCTION_RETURN)
    {
        // Detect when the last function on the stack returned, and then stop debugging
        var frameCount = this.countFrames(frame);
        if (frameCount == 1)
            this.resume();
    }
}

FireBugJSView.prototype.onClickLine = function(event)
{
    var sourceRow = event.target;
    var lineRow = null;
    for (; sourceRow && !FireBugUtils.hasClass(sourceRow, "sourceRow");
           sourceRow = sourceRow.parentNode)
    {
        if (FireBugUtils.hasClass(sourceRow, "sourceLine"))
            lineRow = sourceRow;
    }
    
    if (!lineRow)
        return;
    
    var scriptFile = lineRow.parentNode.parentNode.scriptFile;
    var lineNo = parseInt(lineRow.textContent);
    
    if (sourceRow.hasAttribute("breakpoint"))
    {
        sourceRow.removeAttribute("breakpoint");
        this.clearBreakpoint(scriptFile.href, lineNo);
    }
    else
    {
        sourceRow.setAttribute("breakpoint", "true");
        this.setBreakpoint(scriptFile.href, lineNo);
    }
}

FireBugJSView.prototype.onLoadScript = function(context, scriptNode)
{
    var info = scriptNode.loadingInfo;
    scriptNode.loadingInfo = null;
    scriptNode.loaded = true;
    
    if (info.lineNo)
        this.setExecutionLine(context, scriptNode, info.lineNo, info.selectLine);

    if (info.scrollY)
        scriptNode.parentNode.scrollTop = info.scrollY;

    this.firebugService.enumerateBreakpoints(info.scriptFile.href, {call: function(line)
    {
        scriptNode.childNodes[line-1].setAttribute("breakpoint", "true");
    }});
}

FireBugJSView.prototype.onBrowserLoad = function()
{
    this.browserLoaded = true;
    
    // If "showStackFrame" was called before the browser loaded, then we have to call it again
    // it here now that the browser is ready
    if (this.postBrowserLoad)
    {
        var postBrowserLoad = this.postBrowserLoad;
        this.postBrowserLoad = null;
        postBrowserLoad();
    }
}
