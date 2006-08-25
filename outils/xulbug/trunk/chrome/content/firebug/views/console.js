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
 
function FireBugConsoleView()
{
}

FireBugConsoleView.prototype = new FireBugView();

FireBugConsoleView.prototype.messageCount = 0;
FireBugConsoleView.prototype.overflowCount = 0;
FireBugConsoleView.prototype.lastLogTime = 0;
FireBugConsoleView.prototype.throttleTimeout = 200;
FireBugConsoleView.prototype.throttleLimit = 30;
FireBugConsoleView.prototype.throttleFlushDelay = 100;
FireBugConsoleView.prototype.throttleFlushCount = 10;

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugConsoleView.prototype.searchable = true;

FireBugConsoleView.prototype.search = function(text)
{
    if (!text)
        return;
        
    var contextNode = this.context.contextNodes[this.viewName];
    var doc = this.browser.contentDocument;

    // Make previously visible nodes invisible again
    if (contextNode.matchSet)
    {
        for (var i in contextNode.matchSet)
            FireBugUtils.removeClass(contextNode.matchSet[i], "matched");
    }

    contextNode.matchSet = [];

    var count = contextNode.childNodes.length;
    var searchRange = doc.createRange();
    searchRange.setStart(contextNode, 0);
    searchRange.setEnd(contextNode, count);

    var startPt = doc.createRange();
    startPt.setStart(contextNode, 0);
    startPt.setEnd(contextNode, 0);

    var endPt = doc.createRange();
    endPt.setStart(contextNode, count);
    endPt.setEnd(contextNode, count);

    var retRange = null;
    while ((retRange = FireBug.finder.Find(text, searchRange, startPt, endPt)))
    {
        var logRow = this.walkUpToLogRow(retRange.startContainer);
        contextNode.matchSet.push(logRow);
        
        FireBugUtils.setClass(logRow, "matched");

        startPt = doc.createRange();
        startPt.setStartAfter(logRow);
    }
}

FireBugConsoleView.prototype.clearable = true;

FireBugConsoleView.prototype.clear = function()
{
    if (this.contextNode)
        FireBugUtils.clearNode(this.contextNode);
    
    this.context.errorCount = 0;
    FireBug.showErrorCount(0);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugConsoleView.prototype.log = function(args, rowClass, rowFunc, context, sourceLink,
    noThrottle)
{
    if (!context)
        context = this.context;

    // Capture the source link immediately while the source is still on the stack
    if (sourceLink == true)
        sourceLink = FireBugUtils.getSourceLinkFromStack(Components.stack);

    if (!noThrottle && !this.throttleMessage(args, rowClass, rowFunc, context, sourceLink))
        return;

    var logRow = this.createLogRow(rowClass);
    
    if (!rowFunc)
        rowFunc = FireBug_logObjectRow;

    var cancelled = rowFunc.apply(this, [args, logRow, context]);
    if (cancelled)
        return null;
    
    if (sourceLink)
    {
        FireBugUtils.setClass(logRow, "logRow-sourceLink");
        FireBug_appendObject(sourceLink, logRow);
    }
    
    this.appendLogRow(logRow, context);
    this.filterLogRow(logRow, context);
    
    return logRow;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugConsoleView.prototype.createLogRow = function(rowClass)
{
    var logDocument = this.browser.contentDocument;

    var logRow = logDocument.createElement("div");
    logRow.className = "logRow logRow-" + rowClass;
    
    return logRow;
}

FireBugConsoleView.prototype.appendLogRow = function(logRow, context)
{
    var contextNode = context.contextNodes[this.viewName];
    if (!contextNode)
        return;

    contextNode.appendChild(logRow);
    
    logRow.scrollIntoView();
    
    return logRow;
}

FireBugConsoleView.prototype.walkUpToLogRow = function(node)
{
    for (; node; node = node.parentNode)
    {
        if (FireBugUtils.hasClass(node, "logRow"))
            return node;
    }
    
    return null;
}

FireBugConsoleView.prototype.filterLogRow = function(logRow, context)
{
    var contextNode = context.contextNodes[this.viewName];
    if (contextNode.searchText)
    {
        FireBugUtils.setClass(logRow, "matching");
        FireBugUtils.setClass(logRow, "matched");
        
        // Search after a delay because we must wait for a frame to be created for
        // the new logRow so that the finder will be able to locate it
        var self = this;
        setTimeout(function()
        {
            if (self.searchFilter(contextNode.searchText, logRow, context))
                contextNode.matchSet.push(logRow);
            else
                FireBugUtils.removeClass(logRow, "matched");

            FireBugUtils.removeClass(logRow, "matching");
            logRow.scrollIntoView();
        }, 100);
    }
}

FireBugConsoleView.prototype.searchFilter = function(text, logRow, context)
{
    var contextNode = this.context.contextNodes[this.viewName];
    var doc = this.browser.contentDocument;

    var count = contextNode.childNodes.length;
    var searchRange = doc.createRange();
    searchRange.setStart(contextNode, 0);
    searchRange.setEnd(contextNode, count);

    var startPt = doc.createRange();
    startPt.setStartBefore(logRow);

    var endPt = doc.createRange();
    endPt.setStartAfter(logRow);

    return FireBug.finder.Find(text, searchRange, startPt, endPt) != null;
}

FireBugConsoleView.prototype.throttleMessage = function(args, rowClass, rowFunc, context,
    sourceLink)
{
    if (!FireBug.throttleMessages)
        return true;
    
    // Count how many messages have been logged during the throttle period
    var logTime = new Date().getTime();
    if (logTime - this.lastLogTime < this.throttleTimeout)
        ++this.messageCount;
    else
        this.messageCount = 0;

    this.lastLogTime = logTime;

    // If the throttle limit has been passed, enqueue the message to be logged later on a timer
    if (this.messageCount > this.throttleLimit || context.messageQueue.length)
    {
        if (context.messageTimeout)
            clearTimeout(context.messageTimeout);

        context.messageQueue.push([args, rowClass, rowFunc, context, sourceLink, true]);
        
        var self = this;
        context.messageTimeout = setTimeout(function() { self.flushThrottleQueue(context); },
            this.throttleFlushDelay);
        
        return false;
    }
    else
    {
        this.lastSummaryNode = null;
        this.overflowCount = 0;
        
        return true;
    }
}

FireBugConsoleView.prototype.flushThrottleQueue = function(context)
{
    var queue = context.messageQueue;
    for (var i = 0; i < queue.length && i < this.throttleFlushCount; ++i)
        this.log.apply(this, queue[i]);

    queue.splice(0, this.throttleFlushCount);

    if (queue.length)
    {
        var self = this;
        context.messageTimeout = setTimeout(function() { self.flushThrottleQueue(context); },
            this.throttleFlushDelay);
    }
    else
        context.messageTimeout = 0;
}
