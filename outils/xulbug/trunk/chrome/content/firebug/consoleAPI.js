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
 
function FireBugConsole(context, win)
{
    this.firebug = "0.4";
    
    // We store these functions as closures so that they can access the context privately,
    // because it would be insecure to store context as a property of window.console and
    // and therefore expose it to web pages
    
    this.log = function()
    {
        FireBug.console.log(arguments, "log", FireBug_logFormattedRow, context);
    }
    
    this.logMessage = function(messages, rowClass, showLine)
    {
        FireBug.console.log(messages, rowClass, FireBug_logFormattedRows, context, showLine);
    }
    
    this.logAssert = function(messages, caption)
    {
        FireBug.increaseErrorCount(context);
    
        if (!messages || !messages.length)
            messages = [FireBug.strings.getString("Assertion")];
        
        FireBug.console.log([messages, caption], "assert", FireBug_logFormattedRows, context, true);
    
        if (win && typeof(win.onassert) == "function")
        {
            // XXXjoe Convert args to a string
            win.onassert(message, caption);
        }
    }
    
    this.debug = function()
    {
        FireBug.console.log(arguments, "debug", FireBug_logFormattedRow, context, true);
    }
    
    this.info = function()
    {
        FireBug.console.log(arguments, "info", FireBug_logFormattedRow, context, true);
    }
    
    this.warn = function()
    {
        FireBug.console.log(arguments, "warn", FireBug_logFormattedRow, context, true);
    }
    
    this.error = function()
    {
        FireBug.increaseErrorCount(context);
        FireBug.console.log(arguments, "error", FireBug_logFormattedRow, context, true);
    }
    
    this.fail = function()
    {
        this.logAssert(arguments, null);
    }
    
    this.assert = function(x)
    {
        if (!x)
            this.logAssert(sliceArray(arguments, 1), ["%o", x]);
    }

    this.assertEquals = function(x, y)
    {
        if (x != y)
            this.logAssert(sliceArray(arguments, 2), ["%o != %o", x, y]);
    }    

    this.assertNotEquals = function(x, y)
    {
        if (x == y)
            this.logAssert(sliceArray(arguments, 2), ["%o == %o", x, y]);
    }    

    this.assertGreater = function(x, y)
    {
        if (x <= y)
            this.logAssert(sliceArray(arguments, 2), ["%o <= %o", x, y]);
    }    

    this.assertNotGreater = function(x, y)
    {
        if (!(x > y))
            this.logAssert(sliceArray(arguments, 2), ["!(%o > %o)", x, y]);
    }    

    this.assertLess = function(x, y)
    {
        if (x >= y)
            this.logAssert(sliceArray(arguments, 2), ["%o >= %o", x, y]);
    }    

    this.assertNotLess = function(x, y)
    {
        if (!(x < y))
            this.logAssert(sliceArray(arguments, 2), ["!(%o < %o)", x, y]);
    }    

    this.assertContains = function(x, y)
    {
        if (!(x in y))
            this.logAssert(sliceArray(arguments, 2), ["!(%o in %o)", x, y]);
    }    

    this.assertNotContains = function(x, y)
    {
        if (x in y)
            this.logAssert(sliceArray(arguments, 2), ["%o in %o", x, y]);
    }    

    this.assertTrue = function(x)
    {
        this.assertEquals(x, true);
    }    

    this.assertFalse = function(x)
    {
        this.assertEquals(x, false);
    }    

    this.assertNull = function(x)
    {
        this.assertEquals(x, null);
    }    

    this.assertNotNull = function(x)
    {
        this.assertNotEquals(x, null);
    }    

    this.assertUndefined = function(x)
    {
        this.assertEquals(x, undefined);
    }    

    this.assertNotUndefined = function(x)
    {
        this.assertNotEquals(x, undefined);
    }    

    this.assertInstanceOf = function(x, y)
    {
        if (!(x instanceof y))
            this.logAssert(sliceArray(arguments, 2), ["!(%o instanceof %o)", x, y]);
    }    

    this.assertNotInstanceOf = function(x, y)
    {
        if (x instanceof y)
            this.logAssert(sliceArray(arguments, 2), ["%o instanceof %o", x, y]);
    }    

    this.assertTypeOf = function(x, y)
    {
        if (typeof(x) != y)
            this.logAssert(sliceArray(arguments, 2), ["typeof(%o) != %o", x, y]);
    }    

    this.assertNotTypeOf = function(x)
    {
        if (typeof(x) == y)
            this.logAssert(sliceArray(arguments, 2), ["typeof(%o) == %o", x, y]);
    }    

    this.group = function(name)
    {
    }
    
    this.groupEnd = function(name)
    {
    }
    
    this.time = function(name, reset)
    {
        if (!name)
            return;
        
        var time = new Date().getTime();
        
        if (!context.timeCounters)
            context.timeCounters = {};

        if (!reset && name in context.timeCounters)
            return;
        
        context.timeCounters[name] = time;
    }
    
    this.timeEnd = function(name)
    {
        var time = new Date().getTime();

        if (!context.timeCounters)
            return;

        var timeCounter = context.timeCounters[name];
        if (timeCounter)
        {
            var diff = time - timeCounter;
            var label = name + ": " + diff + "ms";
            FireBug.console.log(label, "log", FireBug_logTextRow, context, true, true);
            
            delete context.timeCounters[name];
        }
    }
    
    this.count = function(key)
    {
        var frameId = FireBugUtils.getStackFrameId();
        if (frameId)
        {
            if (!context.frameCounters)
                context.frameCounters = {};
            
            if (key != undefined)
                frameId += key;
                        
            var frameCounter = context.frameCounters[frameId];
            if (!frameCounter)
            {
                var logRow = FireBug.console.log("", "count", FireBug_logTextRow, context,
                    true, true);
                
                frameCounter = {logRow: logRow, count: 1};
                context.frameCounters[frameId] = frameCounter;
            }
            else
                ++frameCounter.count;
                
            var label = key == undefined
                ? frameCounter.count
                : key + " " + frameCounter.count;

            frameCounter.logRow.firstChild.firstChild.nodeValue = label;
        }
    }
    
    this.trace = function()
    {
        var trace = new StackTrace(Components.stack);
        FireBug.console.log(trace, "stackTrace", FireBug_logObjectRow, context);
    }
}
