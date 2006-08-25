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
 
const CLASS_ID = Components.ID("{a380e9c0-cb39-11da-a94d-0800200c9a66}");
const CLASS_NAME = "FireBug Service";
const CONTRACT_ID = "@joehewitt.com/firebug;1";

var RETURN_CONTINUE = Components.interfaces.jsdIExecutionHook.RETURN_CONTINUE;
var PCMAP_SOURCETEXT = Components.interfaces.jsdIScript.PCMAP_SOURCETEXT;

///////////////////////////////////////////////////////////////////////////////////////////////////

function FireBugService()
{
    this.debuggers = [];
    this.breakpoints = {};
    this.breakpointCount = 0;

    FireBugPrefsObserver.fireBugService = this;
    
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefBranch2);
    this.prefs.addObserver("extensions.firebug", FireBugPrefsObserver, false);

    this.showStackTrace = this.prefs.getBoolPref("extensions.firebug.showStackTrace");
    this.breakOnErrors = this.prefs.getBoolPref("extensions.firebug.breakOnErrors");
}

FireBugService.prototype = {};

FireBugService.prototype.QueryInterface = function(iid)
{
    if (!iid.equals(Components.interfaces.nsIFireBug)
        && !iid.equals(Components.interfaces.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;

    return this;
}

FireBugService.prototype.getLocked = function()
{
    return this.locked;
}

FireBugService.prototype.lockDebugger = function()
{
    this.locked = true;
    
    for (var i = 0; i < this.debuggers.length; ++i)
        this.debuggers[i].onLock(true);
}

FireBugService.prototype.unlockDebugger = function()
{
    this.locked = false;

    for (var i = 0; i < this.debuggers.length; ++i)
        this.debuggers[i].onLock(false);
}

FireBugService.prototype.registerDebugger = function(debuggr)
{
    if (!this.debuggers.length)
        this.enable();
    
    this.debuggers.push(debuggr);
}

FireBugService.prototype.unregisterDebugger = function(debuggr)
{
    for (var i = 0; i < this.debuggers.length; ++i)
    {
        if (this.debuggers[i] == debuggr)
        {
            this.debuggers.splice(i, 1);
            break;
        }
    }

    if (!this.debuggers.length)
        this.disable();
}

FireBugService.prototype.setBreakpoint = function(href, line)
{
    if (!this.breakpointCount)
    {
        var self = this;
        this.jsd.scriptHook = {
            onScriptCreated: function(script) { self.onScriptCreated(script); },
            onScriptDestroyed: function(script) { self.onScriptDestroyed(script); }
        };
    }

    ++this.breakpointCount;

    href = this.normalizeHref(href);
    var script = this.findScript(href, line);
    if (script && script.isLineExecutable(line, PCMAP_SOURCETEXT))
    {
        var pc = script.lineToPc(line, PCMAP_SOURCETEXT);
        script.setBreakpoint(pc);
    }

    var breakpoints = this.breakpoints[href];
    if (!breakpoints)
    {
        breakpoints = [];
        this.breakpoints[href] = breakpoints;
    }
    
    breakpoints.push(line);
}

FireBugService.prototype.clearBreakpoint = function(href, line)
{
    --this.breakpointCount;

    href = this.normalizeHref(href);
    var breakpoints = this.breakpoints[href];
    if (breakpoints)
    {
        for (var i = 0; i < breakpoints.length; ++i)
        {
            if (breakpoints[i] == line)
            {
                breakpoints.splice(i, 1);
                break;
            }
        }
    }
    
    if (!this.breakpointCount)
        this.jsd.scriptHook = null;

    var script = this.findScript(href, line);
    if (script && script.isLineExecutable(line, PCMAP_SOURCETEXT))
    {
        var pc = script.lineToPc(line, PCMAP_SOURCETEXT);
        script.clearBreakpoint(pc);
    }
}

FireBugService.prototype.clearAllBreakpoints = function()
{
    for (var href in this.breakpoints)
    {
        var breakpoints = this.breakpoints[href];
        for (var i = 0; i < breakpoints.length; ++i)
            this.clearBreakpoint(href, breakpoints[i]);
    }

    this.breakpoints = {};
}

FireBugService.prototype.enumerateBreakpoints = function(href, cb)
{
    href = this.normalizeHref(href);
    var breakpoints = this.breakpoints[href];
    if (breakpoints)
    {
        for (var i = 0; i < breakpoints.length; ++i)
            cb.call(breakpoints[i]);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugService.prototype.enable = function()
{
    if (this.enabled)
        return;
    
    this.enabled = true;

    if (this.jsd)
    {
        this.jsd.unPause();
        return;
    }
    
    this.jsd = Components.classes["@mozilla.org/js/jsd/debugger-service;1"]
        .getService(Components.interfaces.jsdIDebuggerService);

    this.jsd.flags |= Components.interfaces.jsdIDebuggerService.DISABLE_OBJECT_TRACE;
    //this.jsd.flags |= Components.interfaces.jsdIDebuggerService.ENABLE_NATIVE_FRAMES;
    //this.jsd.flags |= Components.interfaces.jsdIDebuggerService.HIDE_DISABLED_FRAMES;
    //this.jsd.flags |= Components.interfaces.jsdIDebuggerService.MASK_TOP_FRAME_ONLY;
    this.jsd.on();
    
    var service = this;

    function executionHook(frame, type, rv)
    {
        try
        {
            return service.onExecution(frame, type, rv);
        }
        catch (exc)
        {
            return RETURN_CONTINUE;
        }
    }
    
    function errorHook(message, fileName, line, pos, flags, errnum, exc)
    {   
        try
        {
            return service.onError(message, fileName, line, pos, flags, errnum, exc);
        }
        catch (exc)
        {
            return true;
        }
    }
        
    this.jsd.debuggerHook = { onExecute: executionHook };
    this.jsd.breakpointHook = { onExecute: executionHook };
    //this.jsd.throwHook = { onExecute: executionHook };
    this.jsd.debugHook = { onExecute: executionHook };
    this.jsd.errorHook = { onError: errorHook };
}

FireBugService.prototype.disable = function()
{
    if (!this.enabled)
        return;

    this.jsd.pause();

    this.enabled = false;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugService.prototype.onExecution = function(frame, type, rv)
{
    for (; frame && !frame.script; frame = frame.callingFrame)
        1;

    var result = {};
    frame.eval("window", "", 0, result);
    
    var win = result.value.getWrappedValue();
    var rootWindow = this.getRootWindow(win);

    if (this.queueStackTrace)
    {
        for (var i = 0; i < this.debuggers.length; ++i)
        {
            if (this.debuggers[i].supportsWindow(rootWindow))
            {
                this.debuggers[i].onError(frame);
                break;
            }
        }

        this.queueStackTrace = false;
        
        if (!this.breakOnErrors)
            return RETURN_CONTINUE;
    }

    for (var i = 0; i < this.debuggers.length; ++i)
    {
        if (this.debuggers[i].supportsWindow(rootWindow))
            return this.debuggers[i].onExecution(rootWindow, frame, type, rv);
    }

    return RETURN_CONTINUE;
}

FireBugService.prototype.onError = function(message, fileName, line, pos, flags, errnum, exc)
{
    if (this.showStackTrace)
    {
        this.queueStackTrace = true;
        return false;
    }
    else if (this.breakOnErrors)
        return false;
    else
        return true;
}

FireBugService.prototype.onScriptCreated = function(script)
{
    var href = this.normalizeHref(script.fileName);
    var breakpoints = this.breakpoints[href];
    if (breakpoints)
    {
        for (var i = 0; i < breakpoints.length; ++i)
        {
            var line = breakpoints[i];
            if (line >= script.baseLineNumber && line <= script.baseLineNumber+script.lineExtent)
            {
                if (script.isLineExecutable(line, PCMAP_SOURCETEXT))
                {
                    var pc = script.lineToPc(line, PCMAP_SOURCETEXT);
                    script.setBreakpoint(pc);
                }
            }
        }
    }
}

FireBugService.prototype.onScriptDestroyed = function(script)
{
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugService.prototype.findScript = function(href, line)
{    
    var normalHref = this.denormalizeHref(href);

    var foundScript = null;
    this.jsd.enumerateScripts({enumerateScript: function(script)
    {
        if (script.fileName == normalHref && line >= script.baseLineNumber
            && line <= script.baseLineNumber+script.lineExtent)
        {
            // Look for the script with the smallest number of lines, since the range check
            // doesn't account for functions inside of other functions
            if (!foundScript || script.lineExtent <= foundScript.lineExtent)
                foundScript = script;
        }
    }});
    
    return foundScript;
}

FireBugService.prototype.normalizeHref = function(href)
{
    // For some reason, JSDS reports file URLs like "file:/" instead of "file:///", so they
    // don't match up with the URLs we get back from the DOM
    return href.replace(/file:\/([^/])/g, "file:///$1");
}

FireBugService.prototype.denormalizeHref = function(href)
{
    return href.replace(/file:\/\/\//g, "file:/");
}

FireBugService.prototype.getRootWindow = function(win)
{
    for (; win; win = win.parent)
    {
        if (!win.parent || win == win.parent)
            return win;
    }
    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

var FireBugFactory =
{
    createInstance: function (outer, iid)
    {
        if (outer != null)
            throw Components.results.NS_ERROR_NO_AGGREGATION;
        return (new FireBugService()).QueryInterface(iid);
    }
};

var FireBugModule =
{
registerSelf: function (compMgr, fileSpec, location, type)
{
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, fileSpec, location, type);

    try
    {
        var jsd = Components.classes["@mozilla.org/js/jsd/debugger-service;1"]
            .getService(Components.interfaces.jsdIDebuggerService);
        jsd.initAtStartup = true;
    }
    catch (exc)
    {
    }
    
},

unregisterSelf: function(compMgr, fileSpec, location)
{
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(CLASS_ID, location);
},

getClassObject: function (compMgr, cid, iid)
{
    if (!iid.equals(Components.interfaces.nsIFactory))
        throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    
    if (cid.equals(CLASS_ID))
        return FireBugFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
},

canUnload: function(compMgr)
{
    return true;
}
};

function NSGetModule(compMgr, fileSpec)
{
    return FireBugModule;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

var FireBugPrefsObserver =
{
    observe: function(subject, topic, data)
    {
        if (data == "extensions.firebug.showStackTrace")
        {
            this.fireBugService.showStackTrace = 
                this.fireBugService.prefs.getBoolPref("extensions.firebug.showStackTrace");
        }
        else if (data == "extensions.firebug.breakOnErrors")
        {
            this.fireBugService.breakOnErrors = 
                this.fireBugService.prefs.getBoolPref("extensions.firebug.breakOnErrors");
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////

var consoleService = null;
function ddd(text)
{
    if (!consoleService)
        consoleService = Components.classes['@mozilla.org/consoleservice;1'].
            getService(Components.interfaces.nsIConsoleService);

    consoleService.logStringMessage(text + "");
}
