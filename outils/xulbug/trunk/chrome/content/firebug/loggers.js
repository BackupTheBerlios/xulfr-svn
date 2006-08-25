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

FireBug_defaultObjectFormat = "object";

FireBug_objectFormatMap =
{
    "text": FireBug_logText,
    "undefined": FireBug_logUndefined,
    "null": FireBug_logNull,
    "number": FireBug_logPrimitive,
    "string": FireBug_logString,
    "object": FireBug_logObject,
    "array": FireBug_logArray,
    "element": FireBug_logElement,
    "document": FireBug_logDocument,
    "textNode": FireBug_logTextNode,
    "xhr": FireBug_logXMLHttpRequest,
    "event": FireBug_logEvent,
    "styleRule": FireBug_logObject,
    "consoleError": FireBug_logConsoleError,
    "consoleWarning": FireBug_logConsoleError,
    "consoleInfo": FireBug_logConsoleInfo,
    "function": FireBug_logFunction,
    "sourceLink": FireBug_logSourceLink,
    "sourceFile": FireBug_logSourceFile,
    "stackTrace": FireBug_logStackTrace
};

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug_appendObject = function(object, logRow, precision, partial)
{
    var format;
    try
    {
        format = FireBug_getFormatForObject(object);
    }
    catch (exc)
    {
        format = FireBug_defaultObjectFormat;
    }
    
    var formatter = FireBug_objectFormatMap[format];
    formatter.apply(this, [object, logRow, precision, partial]);
}

FireBug_appendFormatted = function(objects, logRow)
{
    if (!objects || !objects.length)
        return;
    
    var format = objects[0];
    var objIndex = 0;

    if (typeof(format) != "string")
    {
        format = "";
        objIndex = -1;
    }
    
    var formatParts = FireBug_parseFormat(format);
    for (var i = 0; i < formatParts.length; ++i)
    {
        var formatPart = formatParts[i];
        if (formatPart && typeof(formatPart) == "object")
        {
            var object = objects[++objIndex];
            formatPart.func.apply(this, [object, logRow, formatPart.precision]);
        }
        else
            FireBug_logText(formatPart, logRow);
    }

    for (var i = objIndex+1; i < objects.length; ++i)
    {
        FireBug_logText(" ", logRow);
        FireBug_appendObject(objects[i], logRow, 0, false);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBug_getFormatForObject = function(object)
{
    var type = typeof(object);
    
    if (type == "undefined")
        return "undefined";

    else if (object == null)
        return "null";

    else if (type == "object")
    {
        if (object instanceof Components.interfaces.nsIScriptError)
        {
            if (object.flags & Components.interfaces.nsIScriptError.warningFlag)
                return "consoleWarning";
            else
                return "consoleError";
        }        
        else if (object instanceof Components.interfaces.nsIConsoleMessage)
            return "consoleInfo";
            
        else if (object instanceof Window)
            return "object";

        else if (object instanceof Element)
            return "element";

        else if (object instanceof Document)
            return "document";

        else if (object instanceof String)
            return "string";

        else if (object instanceof Text)
            return "textNode";

        else if (object instanceof CSSStyleRule)
            return "styleRule";

        else if (object instanceof Event || object instanceof EventCopy)
            return "event";

        else if ("length" in object && typeof(object.length) == "number")
            return "array";

        else if (object instanceof XMLHttpRequestSpy)
            return "xhr";
                
        else if (object instanceof SourceLink)
            return "sourceLink";
        
        else if (object instanceof SourceFile)
            return "sourceFile";

        else if (object instanceof StackTrace)
            return "stackTrace";

        else
            return "object";
    }
    else if (type == "function")
        return "function";

    else if (type == "number" || type == "boolean")
        return "number";

    else if (type == "string")
        return "string";

    else
        return "object";
}

FireBug_parseFormat = function(format)
{
    var formatParts = [];
    
    var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;
    var index = 0;
    
    for (var m = reg.exec(format); m; m = reg.exec(format))
    {
        var type = m[8] ? m[8] : m[5];
        var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);
        
        var func = null;
        switch (type)
        {
            case "s":
                func = FireBug_logText;
                break;
            case "f":
            case "i":
            case "d":
                func = FireBug_logPrimitive;
                break;
            case "o":
                func = FireBug_logAnything;
                break;
            case "x":
                func = FireBug_logElementFull;
                break;
        }
        
        formatParts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
        formatParts.push({func: func, precision: precision});
        
        format = format.substr(m.index+m[0].length);
    }
    
    formatParts.push(format);
    
    return formatParts;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Row Loggers

function FireBug_logTextRow(object, logRow, context)
{
    FireBug_logText(object, logRow);
}

function FireBug_logObjectRow(object, logRow, context)
{
    FireBug_appendObject(object, logRow, 0, false);
}

function FireBug_logFormattedRow(objects, logRow, context)
{
    FireBug_appendFormatted(objects, logRow);
}

function FireBug_logFormattedRows(objects, logRow, context)
{
    for (var i = 0; i < objects.length; ++i)
    {
        if (objects[i])
        {
            var objectRow = logRow.ownerDocument.createElement("div");
            objectRow.className = "row" + (i+1);
            FireBug_appendFormatted(objects[i], objectRow);
            logRow.appendChild(objectRow);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Object Loggers

function FireBug_logAnything(object, logRow, precision, partial)
{
    if (!precision || partial)
        FireBug_appendObject(object, logRow, precision, partial);
    else if (precision == -1)
        FireBug_logKeys(object, logRow);
    else
        FireBug_logDOM(object, logRow, precision, partial);
}

function FireBug_logNull(value, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;

    var objectBox = FireBugUtils.createObjectSpan(doc, value, "null");
    logRow.appendChild(objectBox);
}

function FireBug_logUndefined(value, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;

    var objectBox = FireBugUtils.createObjectSpan(doc, value, "undefined");
    logRow.appendChild(objectBox);
}

function FireBug_logPrimitive(value, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;

    var objectBox = FireBugUtils.createObjectSpan(doc, value, value);
    logRow.appendChild(objectBox);
}

function FireBug_logText(value, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;

    var objectBox = FireBugUtils.createObjectSpan(doc, value, value, "text");
    logRow.appendChild(objectBox);
}

function FireBug_logString(value, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;

    if (partial)
    {
        if (value.length >= FireBug.stringCropLength)
            value = value.substr(0, FireBug.stringCropLength) + "...";

        value = FireBugUtils.escapeNewLines(value);
    }

    value = '"' + value + '"';
    
    var objectBox = FireBugUtils.createObjectSpan(doc, value, value);
    logRow.appendChild(objectBox);
}

function FireBug_logObject(object, logRow, precision, partial)
{
    if (!precision || partial)
    {
        var caption = FireBug.getObjectTitle(object);
        
        var logLink = withDocument(logRow.ownerDocument, function() {
            return FireBugUtils.createObjectLink(object, caption);
        });
        logRow.appendChild(logLink);
    }
    else if (precision == -1)
        FireBug_logKeys(object, logRow);
    else
        FireBug_logDOM(object, logRow, precision, partial);
}

function FireBug_logKeys(object, logRow)
{
    var names = [];
    for (var name in object)
        names.push(name);

    FireBug_logArray(names, logRow);
}

function FireBug_logFunction(fn, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;

    var fnRegex = /(function [^(]*\([^)]*\) )\{(.*?)\}$/;

    var fnText = new String(fn).replace("\n", " ", "g");
        
    var m = fnRegex.exec(fnText);
    if (m)
        fnText = m[1] + " {...}";

    var objectBox = FireBugUtils.createObjectSpan(doc, fnText);
    logRow.appendChild(objectBox);
}

function FireBug_logArray(array, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;
    
    withDocument(doc, function()
    {
        logRow.appendChild(SPAN({"class": "arrayLeftBracket"}, "["));
    
        if (partial)
            logRow.appendChild(SPAN({"class": "arrayItem"}, array.length));

        else
        {
            for (var i = 0; i < array.length; ++i)
            {
                if (i > 0)
                    logRow.appendChild(SPAN({"class": "arrayComma"}, ","));
        
                var itemNode = SPAN({"class": "arrayItem"});
                logRow.appendChild(itemNode);
                
                FireBug_appendObject(array[i], itemNode, 0, false);
            }
        }
        
        logRow.appendChild(SPAN({"class": "arrayRightBracket"}, "]"));
    });
}

function FireBug_logElementFull(element, logRow, precision, partial)
{
    if (!isElement(element))
        return;

    if (precision == 0)
        precision = -1;
        
    // XXXjoe This is a big ol' hack, I need to make the source tree control easier to use
    var view = new FireBugSourceView();
    view.initialize(FireBug.browser);
    view.innerSelect = true;
    view.rootElement = element;
    view.contextNode = logRow;
    view.contextNode.treeBox = new FireBugSourceBox(view, logRow);
    
    function openElement(element, precision)
    {
        // XXXjoe This isn't exactly the most performant way of doing this. I need to optimize
        // this to use innerHTML if possible, it would be much faster
        view.contextNode.treeBox.openObject(element);

        if (--precision != 0)
        {
            for (var child = element.firstChild; child; child = child.nextSibling)
                openElement(child, precision);
        }
    }

    openElement(element, precision);
}

function FireBug_logElement(element, logRow, precision, partial)
{
    if (!isElement(element))
        return;
    
    logRow.title = FireBugUtils.getElementXPath(element);
    
    var html = FireBugUtils.getElementLineLabel(element, partial);
    var logLink = withDocument(logRow.ownerDocument, function() {
        return FireBugUtils.createObjectLink(element, html);
    });

    logRow.appendChild(logLink);
}

function FireBug_logDocument(doc, logRow, precision, partial)
{
    var caption = "[Document] " + doc.location;
    var logLink = withDocument(logRow.ownerDocument, function() {
        return FireBugUtils.createObjectLink(doc, caption);
    });
    logRow.appendChild(logLink);
}

function FireBug_logTextNode(textNode, logRow, precision, partial)
{
    var nodeValue = FireBugUtils.escapeNewLines(textNode.nodeValue);
    
    var caption = "[Text] \"" + nodeValue + "\"";
    var logLink = withDocument(logRow.ownerDocument, function() {
        return FireBugUtils.createObjectLink(textNode, caption);
    });
    logRow.appendChild(logLink);
}

function FireBug_logEvent(event, logRow, precision, partial)
{
    withDocument(logRow.ownerDocument, function() {
        appendNodes(logRow, [
            FireBugUtils.createObjectLink(event, event.type),
            partial ? null : FireBugEventsView.getEventInfo(event)
        ]);
    });
}

function FireBug_logXMLHttpRequest(spy, logRow, precision, partial)
{
    var caption = spy.method.toUpperCase() + " " + 
        (spy.request.channel ? spy.request.channel.name : spy.url);

    withDocument(logRow.ownerDocument, function() {
        appendNodes(logRow, [
            TWISTY({onclick: onDiscloseXMLHttpRequest}),
            IMG({"class": "icon XHRSpyIcon"}),
            FireBugUtils.createObjectLink(spy, caption, null, onDiscloseXMLHttpRequest),
            DIV({"class": "disclosure XHRSpyBody"})
        ]);
    });

    logRow.spy = spy;
}

function onDiscloseXMLHttpRequest()
{
    var logRow = this.parentNode;
    var spy = logRow.spy;
    
    var twisty = FireBugUtils.getChildByClassName(logRow, "twisty");
    var body = FireBugUtils.getChildByClassName(logRow, "disclosure");

    body.selectTab = function(tab)
    {
        var view = tab.getAttribute("view");
        if (body.selectedTab)
        {
            body.selectedTab.removeAttribute("selected");
            body.selectedText.removeAttribute("selected");
        }
        
        body.selectedTab = tab;
        var textBodyName = "XHRSpy" + view + "Text";
        body.selectedText = FireBugUtils.getChildByClassName(body, textBodyName);
        
        body.selectedText.setAttribute("selected", "true");
        body.selectedTab.setAttribute("selected", "true");
    }
    
    var open = FireBugUtils.hasClass(twisty, "open");
    if (!open)
    {
        if (!body.firstChild)
            FireBug.createHttpSpyInfo(spy, body);

        if (!body.selectedTab)
            body.selectTab(body.firstChild.firstChild);
        
        FireBug.updateHttpSpyInfo(spy, body);
    }

    FireBugUtils.toggleClass(twisty, "open");
    FireBugUtils.toggleClass(body, "open");
}

function FireBug_logConsoleError(scriptError, logRow, precision, partial)
{
    var sourceName = scriptError.sourceName;
    var fromCommandLine = sourceName.indexOf(FireBugCommandLine.evalScript) != -1;
    var showStackTrace = !fromCommandLine && FireBug.errorStackTrace;

    var titleBox = withDocument(logRow.ownerDocument, function() {
        return DIV({"class": "errorTitle"}, [
            showStackTrace ? TWISTY({onclick: onDiscloseError}) : null,
            TEXT(scriptError.errorMessage)
        ]);
    });
    logRow.appendChild(titleBox);

    if (showStackTrace)
        logRow.errorStackTrace = FireBug.errorStackTrace;

    FireBug.errorStackTrace = null;

    if (scriptError.lineNumber && !fromCommandLine)
    {
        FireBugUtils.setClass(logRow, "logRow-sourceLink");
        var sourceLink = new SourceLink(sourceName, scriptError.lineNumber);
        FireBug_appendObject(sourceLink, logRow);
    }
    
    if (scriptError.sourceLine)
    {
        var sourceBox = withDocument(logRow.ownerDocument, function() {
            return DIV({"class": "errorSource"}, [TEXT(scriptError.sourceLine)]);
        });
        logRow.appendChild(sourceBox);
    }
}

function onDiscloseError()
{
    var titleBox = this.parentNode;
    var logRow = titleBox.parentNode;
    
    var twisty = FireBugUtils.getChildByClassName(titleBox, "twisty");
    var body = FireBugUtils.getChildByClassName(logRow, "errorStack");

    if (!body)
    {
        body = withDocument(this.ownerDocument, function() {
            return DIV({"class": "disclosure errorStack"});
        });
        logRow.appendChild(body);
        
        FireBug_logStackTrace(logRow.errorStackTrace, body);
    }

    FireBugUtils.toggleClass(twisty, "open");
    FireBugUtils.toggleClass(body, "open");
}

function FireBug_logConsoleInfo(message, logRow, precision, partial)
{
    FireBug_logText(message.message, logRow, precision, partial);
}

function FireBug_logSourceLink(sourceLink, logRow, precision, partial)
{
    var fileName = FireBugUtils.parseFileNameFromURL(sourceLink.href);
    var linkTitle = FireBug.strings.getFormattedString("Line", [fileName, sourceLink.line]);

    var logLink = withDocument(logRow.ownerDocument, function() {
        return FireBugUtils.createObjectLink(sourceLink, linkTitle);
    });
    
    logLink.title = sourceLink.href;
    
    logRow.appendChild(logLink);
}

function FireBug_logStackTrace(stackTrace, logRow, precision, partial)
{
    for (var i = 0; i < stackTrace.frames.length; ++i)
    {
        var frame = stackTrace.frames[i];
        
        var functionName = frame.functionName ? frame.functionName : "null";
        
        var itemRow = withDocument(logRow.ownerDocument, function() {
            return DIV({"class": "stackFrame"}, [
                SPAN({"class": "stackFunctionName"}, functionName),
            ]);
        });
        
        var sourceLink = new SourceLink(frame.fileName, frame.line);
        FireBug_logSourceLink(sourceLink, itemRow);

        logRow.appendChild(itemRow);
    }
}

function FireBug_logSourceString(sourceString, logRow, precision, partial)
{
    sourceString = FireBugUtils.escapeHTML(sourceString);
    
    // Split the source by line breaks
    var lines = sourceString.split(/\r\n|\r|\n/);
    
    var maxLines = (lines.length + "").length;
    var html = [];

    withDocument(logRow.ownerDocument, function() {
        for (var i = 0; i < lines.length; ++i)
        {
            // Make sure all line numbers are the same width (with a fixed-width font) 
            var lineNo = (i+1) + "";
            while (lineNo.length < maxLines)
                lineNo = " " + lineNo;

            html.push('<div class="sourceRow"><a class="sourceLine">');
            html.push(lineNo);
            html.push('</a><span class="sourceRowText">');
            html.push(lines[i]);
            html.push('</span></div>');
        }
    });

    // Believe it or not, using innerHTML is 10x faster (no exaggeration) than constructing
    // DOM elements and inserting them one by one
    logRow.innerHTML = html.join("");
}

function FireBug_logSourceFile(sourceFile, logRow, precision, onComplete)
{
    if (!sourceFile.text)
    {
        var loader =
        {
            onComplete: function(data, url, status)
            {
                sourceFile.text = data;
                FireBug_logSourceFile(sourceFile, logRow);

                if (onComplete)
                    onComplete();
            }
        };

        loadURLAsync(sourceFile.href, loader);
    }
    else
        FireBug_logSourceString(sourceFile.text, logRow, precision);
}

function FireBug_logDOM(object, logRow, precision, partial)
{
    var doc = logRow.ownerDocument;
    
    function isFunction(value) { return (typeof value) == "function"; }
    function isNotFunction(value) { return (typeof value) != "function"; }

    precision = precision > 0 ? precision-1 : 0;
    
    var objectType = typeof(object);
    if (objectType == "function")
    {
        FireBug_logSourceString(object+"", logRow);
    }
    else if (objectType == "string")
    {
        FireBug_logSourceString(object, logRow);
    }
    else if (objectType == "object")
    {
        var table = doc.createElement("table");
        
        for (var name in object)
        {
            try
            {
                FireBug_createObjectRow(name, object[name], isNotFunction, table, precision);
            }
            catch (exc) {}
        }
        
        for (var name in object)
        {
            try
            {
                FireBug_createObjectRow(name, object[name], isFunction, table, precision);
            }
            catch (exc) {}
        }
        
        logRow.appendChild(table);
    }
}

function FireBug_createObjectRow(name, value, filter, table, precision)
{
    if ((filter && !filter(value)))
        return;
    
    var isFunction = typeof(value) == "function";
    var isConstant = FireBugUtils.isAllUpperCase(name);

    var doc = table.ownerDocument;
    var tr = doc.createElement("tr");
    tr.className = "propertyRow" + 
        (isFunction ? " propertyRow-function" : "") +
        (isConstant ? " propertyRow-constant" : "");

    var td = doc.createElement("td");
    td.setAttribute("valign", "top");
    td.className = "propertyLabel";

    // Create the property name
    var labelElt = doc.createElement("span");
    labelElt.className = "propertyName";
    var labelText = doc.createTextNode(name);
    labelElt.appendChild(labelText);
    tr.appendChild(td);

    // Create the twisty if the value is an object
    var valueType = typeof(value);
    if (valueType == "function" || (valueType == "object" && value != null)
        || (valueType == "string" && value.length > FireBug.stringCropLength))
    {
        td.className += " propertyContainerLabel"
        labelElt.className += " propertyContainerName"
                
        var twisty = doc.createElement("img");
        twisty.src = "blank.gif";
        twisty.className = "twisty propertyTwisty";
        td.appendChild(twisty);

        var self = this;
        labelElt.onclick = function() { FireBug_toggleObjectRow(value, tr); }
        twisty.onclick = function() { FireBug_toggleObjectRow(value, tr); }
    }

    td.appendChild(labelElt);

    // Create the property value
    td = doc.createElement("td");
    td.className = "propertyValue";
    td.setAttribute("valign", "top");
    
    FireBug_appendObject(value, td, 0, true);
    
    tr.appendChild(td);
    table.appendChild(tr);

    if (valueType == "object" && value != null && precision > 0)
        FireBug_toggleObjectRow(value, tr, precision);
}

function FireBug_toggleObjectRow(object, tr, precision)
{
    var doc = tr.ownerDocument;
    
    var twisty = tr.firstChild.firstChild;

    if (tr.nextSibling && tr.nextSibling.className == "propertyChildRow")
    {
        FireBugUtils.removeClass(twisty, "open");
        
        tr.parentNode.removeChild(tr.nextSibling);
    }
    else
    {
        FireBugUtils.setClass(twisty, "open");

        var td = doc.createElement("td");
        td.className = "propertyChildBox";
        td.setAttribute("colspan", 2);
        
        FireBug_logDOM(object, td, precision);

        var newRow = doc.createElement("tr");
        newRow.className = "propertyChildRow";
        newRow.appendChild(td);
        
        if (tr.nextSibling)
            tr.parentNode.insertBefore(newRow, tr.nextSibling);
        else
            tr.parentNode.appendChild(newRow);
    }
}
