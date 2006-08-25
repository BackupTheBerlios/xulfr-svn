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
 
var FireBugCommandLine =
{
    commandHistory: [""],
    commandHistoryMax: 1000,
    commandPointer: 0,
    commandInsertPointer: -1
};

FireBugCommandLine.initialize = function()
{
    this.commandLine = document.getElementById("fbCommandLine");
}

FireBugCommandLine.execCommandLine = function()
{
    if (!FireBug.currentContext)
        return;
        
    var expr = this.commandLine.value;
    if (expr == "")
        return;
    
    this.commandLine.value = "";

    this.appendToHistory(expr);

    FireBug.console.log(">>> " + expr, "command", FireBug_logTextRow);

    var result = this.evaluate(expr);
    if (result != undefined)
        FireBug.console.log(result, "result");
}

FireBugCommandLine.evaluate = function(expr)
{
    var win = FireBug.currentContext.window;

    var result = null;    
    win.FireBugEval = function(value) { result = value; }    
    win.FireBugEval.api = FireBugCommandLineAPI;
    win.FireBugEval.expr = expr;

    if (FireBug.debuggr.debugging && FireBug.currentContext.currentFrame)
        FireBug.currentContext.currentFrame.eval(this.evalScript, "", 1, {});
    else
        this.injectScript(this.evalScript, win);

    delete win.FireBugEval.api;
    delete win.FireBugEval.expr;
    delete win.FireBugEval;
    
    return result;
}

FireBugCommandLine.evalScript = 
    "with (FireBugEval.api) { with (window) { FireBugEval(eval(FireBugEval.expr)) }}";

FireBugCommandLine.evalFunction = function FireBugEval(value)
{
    FireBugEval.value = value;

    var ev = document.createEvent("Events");
    ev.initEvent("FireBugEval", false, true);
    dispatchEvent(ev);
}

FireBugCommandLine.appendToHistory = function(command)
{
    ++this.commandInsertPointer;
    if (this.commandInsertPointer >= this.commandHistoryMax)
        this.commandInsertPointer = 0;
    
    this.commandPointer = this.commandInsertPointer+1;
    this.commandHistory[this.commandInsertPointer] = command;
}

FireBugCommandLine.cycleCommandHistory = function(dir)
{
    this.commandHistory[this.commandPointer] = this.commandLine.value;
    
    if (dir < 0)
    {
        --this.commandPointer;
        if (this.commandPointer < 0)
            this.commandPointer = 0;
    }
    else
    {
        ++this.commandPointer;
        if (this.commandPointer > this.commandInsertPointer+1)
            this.commandPointer = this.commandInsertPointer+1;
    }
    
    var command = this.commandHistory[this.commandPointer];

    this.commandLine.value = command;
    this.commandLine.inputField.setSelectionRange(command.length, command.length);
}

FireBugCommandLine.injectScript = function(script, win)
{
    win.location = "javascript: " + script;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugCommandLine.onKeyPress = function(event)
{
    if (event.keyCode == 13)
        FireBugCommandLine.execCommandLine();        
    else if (event.keyCode == 38)
        FireBugCommandLine.cycleCommandHistory(-1);
    else if (event.keyCode == 40)
        FireBugCommandLine.cycleCommandHistory(1);
    else
        return;
        
    event.preventDefault();
}
