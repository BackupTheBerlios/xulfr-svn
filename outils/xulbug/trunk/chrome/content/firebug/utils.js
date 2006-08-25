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
 
var FireBugUtils = {};

FireBugUtils.isAllUpperCase = function(str)
{
    return str.search(/[A-Z]/) >= 0 && str.search(/[a-z]/) == -1;
}

FireBugUtils.getClientOffset = function(elt)
{
    function addOffset(elt, coords, addStyle, view)
    {
        var style = view.getComputedStyle(elt, null);
        if (addStyle && style.position != "absolute")
        {
            coords.x += parseInt(style.marginLeft) + parseInt(style.borderLeftWidth);
            coords.y += parseInt(style.marginTop) + parseInt(style.borderTopWidth);
        }
        
        if (elt.offsetLeft)
            coords.x += elt.offsetLeft;
        if (elt.offsetTop)
            coords.y += elt.offsetTop;
        if (elt.offsetParent && elt.parentNode.nodeType == 1)
            addOffset(elt.offsetParent, coords, false, view);//style.position != "absolute");
    }
    
    var coords = { x: 0, y: 0 };
    if (elt)
        addOffset(elt, coords, false, elt.ownerDocument.defaultView);
    return coords;
}

FireBugUtils.copyStyles = function(fromNode, toNode)
{
    var view = fromNode.ownerDocument.defaultView;
    if (view)
    {
        var style = view.getComputedStyle(fromNode, "");
        
        toNode.style.fontFamily = style.getPropertyCSSValue("font-family").cssText;
        toNode.style.fontSize = style.getPropertyCSSValue("font-size").cssText;
        toNode.style.fontWeight = style.getPropertyCSSValue("font-weight").cssText;
        toNode.style.fontStyle = style.getPropertyCSSValue("font-style").cssText;
        toNode.style.textTransform = style.getPropertyCSSValue("text-transform").cssText;
    }
}

FireBugUtils.captureNodeToCanvas = function(node, logDocument, zoom)
{
    var canvas = logDocument.createElement("canvas");
    if (!canvas.getContext)
        return null;
        
    var offset = this.getClientOffset(node);
    var w = node.clientWidth * zoom;
    var h = node.clientHeight * zoom;

    var view = node.ownerDocument.defaultView;
    var computed = view.getComputedStyle(node, "");

    var mt = parseInt(computed.getPropertyCSSValue("margin-top").cssText);
    var mr = parseInt(computed.getPropertyCSSValue("margin-right").cssText);
    var mb = parseInt(computed.getPropertyCSSValue("margin-bottom").cssText);
    var ml = parseInt(computed.getPropertyCSSValue("margin-left").cssText); 
    var bt = parseInt(computed.getPropertyCSSValue("border-top-width").cssText);
    var br = parseInt(computed.getPropertyCSSValue("border-right-width").cssText);
    var bb = parseInt(computed.getPropertyCSSValue("border-bottom-width").cssText);
    var bl = parseInt(computed.getPropertyCSSValue("border-left-width").cssText);
    
    offset.x -= mr + ml;
    offset.y -= mt + mb;
    w += mr + ml + br + bl;
    h += mt + mb + bt + bb;
    
    canvas.width = w;
    canvas.height = h;
    
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.drawWindow(view, offset.x, offset.y, w, h, "rgb(0, 0, 0)");
    ctx.restore();

    return canvas;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.getElementSource = function(element, precision)
{
    var nested = precision > 1 || precision < 0;
    var hasChildElements = FireBugUtils.hasChildElements(element);

    var attrs = "";
    if (nested)
        attrs += " open";
    if (!hasChildElements)
        attrs += " empty";
        
    var html = '<div class="nodeBox' + attrs + '">';
    html += '<div class="nodeItem"><img src="blank.gif" class="nodeTwisty">'
        + '<span class="nodeLabel">' + this.getElementLabel(element) + '</span></div>';
    
    if (hasChildElements && nested)
    {
        html += '<div class="nodeChildBox">';

        for (var child = element.firstChild; child; child = child.nextSibling)
        {
            if (child.nodeType == 1)
                html += this.getElementSource(child, precision-1);
        }
        
        html += '</div>';
        
        html += '<div class="nodeCloseLabel">' + this.getElementCloseLabel(element) + '</div>';
    }
    
    html += '</div>';
    
    return html;
}

FireBugUtils.appendElementSource = function(element, logRow, precision)
{
    logRow.innerHTML = this.getElementSource(element, precision);
}

FireBugUtils.getElementLabel = function(element, partial)
{
    var tagName = element.tagName.toLowerCase();
    
    var html = "&lt;<span class=\"nodeTag\">" + tagName + "</span>";
    
    if (partial || !FireBugSourceView.showFullSource)
        html += this.getElementPartialAttributes(element);
    else
        html += this.getElementFullAttributes(element);

    var hasChildElements = FireBugUtils.hasChildElements(element);
    if (hasChildElements)
    {
        html += "&gt;";
    }
    else
    {
        var elementText = this.getElementText(element);
        if (elementText)
        {
            html += "&gt;<span class=\"nodeText\">" + elementText + "</span>";
            html += "&lt;/<span class=\"nodeTag\">" + tagName + "</span>&gt;";
        }
        else
            html += "/&gt;";
    }
    
    return html;    
}

FireBugUtils.getElementCloseLabel = function(element)
{
    return "&lt;/<span class=\"nodeTag\">" + element.tagName.toLowerCase() + "</span>&gt;";
}

FireBugUtils.getElementLineLabel = function(element, partial)
{
    var tagName = element.tagName.toLowerCase();
    
    var html = "&lt;<span class=\"nodeTag\">" + tagName + "</span>";
    
    if (partial)
        html += this.getElementPartialAttributes(element);
    else
        html += this.getElementFullAttributes(element);

    html += "&gt;";

    return html;    
}

FireBugUtils.getElementFullAttributes = function(element)
{
    var html = "";
    
    for (var i = 0; i < element.attributes.length; ++i)
    {
        var attr = element.attributes[i];
        
        // Hide attributes set by FireBug
        if (attr.localName.indexOf("firebug-") == 0)
            continue;
        
        html += " " + attr.localName
            + '="<span class="nodeAttr" targetAttr="' + attr.localName + '">'
            + attr.nodeValue + '</span>"';
    }

    return html;    
}

FireBugUtils.getElementPartialAttributes = function(element)
{
    var html = "";
    
    if (element.id)
        html += ' id="<span class="nodeAttr" targetAttr="id">' + element.id + '</span>"';
    if (element.className)
        html += ' class="<span class="nodeAttr" targetAttr="class">'
                + element.className + '</span>"';
    
    return html;    
}

FireBugUtils.getElementText = function(element)
{
    for (var child = element.firstChild; child; child = child.nextSibling)
    {
        if (child.nodeType == 3)
        {
            var caption = child.nodeValue;
            return caption.length > 50 ? caption.substr(0, 46) + "..." : caption;
        }
    }
    
    return "";
}

/**
 * Gets a function that can atempt to locate a particular object inside of a context.
 *
 * This is used to restore the selected objected across page reloads.
 */
FireBugUtils.getObjectLocator = function(object)
{
    if (object instanceof Window)
        return FireBugUtils.getContextWindow;
    else if (object instanceof Document)
        return FireBugUtils.getContextDocument;
    else if (object instanceof Element)
    {
        var xpath = this.getSpecificElementXPath(object);
        return bindFunction(FireBugUtils.getContextElement, null, xpath);
    }
    else
        return null;
}

FireBugUtils.getContextWindow = function(context)
{
    return context.window;
}

FireBugUtils.getContextDocument = function(context)
{
    return context.window.document;
}

FireBugUtils.getContextElement = function(context, path)
{
    var elts = path
        ? FireBugUtils.getElementsByXPath(context.window.document, path)
        : null;

    return elts && elts.length ? elts[0] : null;
}

/**
 * Gets the most specific XPath for a particular element.
 *
 * If the element has an id, that is used for the path, otherwise we use its
 * hierarchical location.
 */ 
FireBugUtils.getSpecificElementXPath = function(element)
{
    if (element && element.id)
        return '//*[@id="' + element.id + '"]';
   else
        return this.getElementXPath(element);
}

/**
 * Gets an XPath for an element which describes its hierarchical location.
 */ 
FireBugUtils.getElementXPath = function(element)
{
    var paths = [];
    
    for (var element = element; element && element.nodeType == 1; element = element.parentNode)
    {
        var index = 0;
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
        {
            if (sibling.localName == element.localName)
                ++index;
        }
        
        var tagName = element.localName.toLowerCase();
        var pathIndex = (index ? "[" + (index+1) + "]" : "");
        paths.splice(0, 0, tagName + pathIndex);
    }
    
    return paths.length ? "/" + paths.join("/") : null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.removeFromList = function(list, item)
{
    for (var i = 0; i < list.length; ++i)
    {
        if (list[i] == item)
        {
            list.splice(i, 1);
            break;
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.scrollIntoCenterView = function(element, scrollBox)
{
    if (!element)
        return;
    
    var offset = FireBugUtils.getClientOffset(element);

    var topSpace = offset.y - scrollBox.scrollTop;
    var bottomSpace = (scrollBox.scrollTop + scrollBox.clientHeight)
        - (offset.y + element.offsetHeight);

    if (topSpace < 0 || bottomSpace < 0)
    {
        var centerY = offset.y - (scrollBox.clientHeight/2);
        scrollBox.scrollTop = centerY;
    }

    var leftSpace = offset.x - scrollBox.scrollLeft;
    var rightSpace = (scrollBox.scrollLeft + scrollBox.clientWidth)
        - (offset.x + element.clientWidth);

    if (leftSpace < 0 || rightSpace < 0)
    {
        var centerX = (offset.x + element.clientWidth/2) - (scrollBox.clientWidth/2);
        scrollBox.scrollLeft = centerX;
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.cssToXPath = function(rule)
{
    var regElement = /^([#.]?)([a-z0-9\\*_-]*)((\|)([a-z0-9\\*_-]*))?/i;
    var regAttr1 = /^\[([^\]]*)\]/i;
    var regAttr2 = /^\[\s*([^~=\s]+)\s*(~?=)\s*"([^"]+)"\s*\]/i;
    var regPseudo = /^:([a-z_-])+/i;
    var regCombinator = /^(\s*[>+\s])?/i;
    var regComma = /^\s*,/i;

    var index = 1;
    var parts = ["//", "*"];
    var lastRule = null;
    
    while (rule.length && rule != lastRule)
    {
        lastRule = rule;

        // Trim leading whitespace
        rule = rule.replace(/^\s*|\s*$/g,"");
        if (!rule.length)
            break;
        
        // Match the element identifier
        var m = regElement.exec(rule);
        if (m)
        {
            if (!m[1])
            {
                // XXXjoe Namespace ignored for now
                if (m[5])
                    parts[index] = m[5];
                else
                    parts[index] = m[2];
            }
            else if (m[1] == '#')
                parts.push("[@id='" + m[2] + "']"); 
            else if (m[1] == '.')
                parts.push("[contains(@class, '" + m[2] + "')]"); 
            
            rule = rule.substr(m[0].length);
        }
        
        // Match attribute selectors
        m = regAttr2.exec(rule);
        if (m)
        {
            if (m[2] == "~=")
                parts.push("[contains(@" + m[1] + ", '" + m[3] + "')]");
            else
                parts.push("[@" + m[1] + "='" + m[3] + "']");

            rule = rule.substr(m[0].length);
        }
        else
        {
            m = regAttr1.exec(rule);
            if (m)
            {
                parts.push("[@" + m[1] + "]");
                rule = rule.substr(m[0].length);
            }
        }
        
        // Skip over pseudo-classes and pseudo-elements, which are of no use to us
        m = regPseudo.exec(rule);
        while (m)
        {
            rule = rule.substr(m[0].length);
            m = regPseudo.exec(rule);
        }
        
        // Match combinators
        m = regCombinator.exec(rule);
        if (m && m[0].length)
        {
            if (m[0].indexOf(">") != -1)
                parts.push("/");
            else if (m[0].indexOf("+") != -1)
                parts.push("/following-sibling::");
            else
                parts.push("//");

            index = parts.length;
            parts.push("*");
            rule = rule.substr(m[0].length);
        }
        
        m = regComma.exec(rule);
        if (m)
        {
            parts.push(" | ", "//", "*");
            index = parts.length-1;
            rule = rule.substr(m[0].length);
        }
    }
    
    var xpath = parts.join("");
    return xpath;
}

FireBugUtils.getElementsBySelector = function(doc, css)
{
    var xpath = this.cssToXPath(css);
    return this.getElementsByXPath(doc, xpath);
}

FireBugUtils.getElementsByXPath = function(doc, xpath)
{
    var nodes = [];
    
    try {
        var result = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
        for (var item = result.iterateNext(); item; item = result.iterateNext())
            nodes.push(item);
    }
    catch (exc)
    {
        // Invalid xpath expressions make their way here sometimes.  If that happens,
        // we still want to return an empty set without an exception.
    }
    
    return nodes;
}

FireBugUtils.getRuleMatchingElements = function(rule, doc)
{
    var css = rule.selectorText;
    var xpath = this.cssToXPath(css);
    return this.getElementsByXPath(doc, xpath);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.parseFileNameFromURL = function(url)
{
    if (!url)
        return "";
    
    var lastSlash = url.lastIndexOf("/");
    var fileName = url.substr(lastSlash+1);
    if (fileName.length == 0)
        fileName = url;
    if (fileName.length > 17)
        fileName = fileName.substr(0, 17) + "...";

    return fileName;
}

FireBugUtils.makeURLLinkTitle = function(url, line)
{
    var fileName = this.parseFileNameFromURL(url);
    return fileName + " (line " + line + ")";
}

FireBugUtils.isSystemURL = function(href)
{
    if (href.substr(0, 9) == "resource:")
        return true;
    else if (href.substr(0, 17) == "chrome://firebug/")
        return true;
    else if (href.substr(0, 6) == "about:")
        return true;
    else
        return false;
}

FireBugUtils.viewSource = function(href, line)
{
    window.openDialog("chrome://global/content/viewSource.xul", "_blank", 
        "all,dialog=no", href, null, null, line);
}

FireBugUtils.getSourceLinkFromStack = function(frame)
{
    for (; frame; frame = frame.caller)
    {
        if (frame.filename && frame.filename.indexOf("chrome://firebug/") == 0)
        {
            for (; frame; frame = frame.caller)
            {
                if (frame.filename && frame.filename.indexOf("chrome://firebug/") != 0)
                    break;
            }
            break;
        }
    }
    
    
    if (frame && frame.filename && frame.filename.indexOf(FireBugCommandLine.evalScript) == -1)
        return new SourceLink(frame.filename, frame.lineNumber);
    else
        return null;
}

FireBugUtils.getStackFrameId = function()
{
    for (var frame = Components.stack; frame; frame = frame.caller)
    {
        if (frame.languageName == "JavaScript"
            && !(frame.filename && frame.filename.indexOf("chrome://firebug/") == 0))
        {
            return frame.filename + "/" + frame.lineNumber;
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.createObjectSpan = function(doc, object, title, format)
{
    if (!format)
        format = FireBug_getFormatForObject(object);

    var span = doc.createElement("span");
    span.className = "objectBox objectBox-"+format;

    var text = doc.createTextNode(title ? title : object);
    span.appendChild(text);
    
    return span;
}

FireBugUtils.createObjectLink = function(object, title, className, onClick)
{
    var link = contextDocument.createElement("a");
    if (className)
        link.className = className;

    this.makeObjectLink(object, title, link, onClick);
    
    return link;
}

FireBugUtils.makeObjectLink = function(object, title, linkElt, onClick)
{
    var format = FireBug_getFormatForObject(object);
    FireBugUtils.setClass(linkElt, "objectLink objectLink-"+format);
    
    linkElt.linkObject = object;
    
    if (!linkElt.firstChild)
        linkElt.innerHTML = title;
    else
        linkElt.firstChild.nodeValue = title;
    
    linkElt.onmouseover = function(event)
    {
        FireBug.highlightObject(object);
    }
    
    linkElt.onmouseout = function(event)
    {
        FireBug.highlightObject(null);
    }
    
    linkElt.onclick = function(event)
    {
        if (event.button == 0 && !event.ctrlKey && !event.shiftKey &&
            !event.altKey && !event.metaKey)
        {
            if (onClick)
                onClick.apply(linkElt);
            else
                FireBug.browseObject(object);
        }
        else if (event.metaKey || event.ctrlKey)
            FireBug.visitObject(object);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.openNewTab = function(url)
{
    if (url)
        gBrowser.addTab(url);
}

FireBugUtils.evalSafeScript = function(win, text)
{
    if (win.document)
    {
        var script = win.document.createElement("script");
        script.appendChild(win.document.createTextNode(text));
        var heads = win.document.getElementsByTagName("head");
        if (heads.length)
        {
            heads[0].appendChild(script);
            heads[0].removeChild(script);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function loadURLAsync(url, observer)
{
    var service = Components.classes["@mozilla.org/network/io-service;1"].
        getService(Components.interfaces.nsIIOService);

    var channel = service.newChannel(url, null, null);
    channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_FROM_CACHE;
    return channel.asyncOpen (new StreamListener (url, observer), null);
}

function StreamListener(url, observer)
{
    this.url = url;
    this.observer = observer;
    this.data = "";
}

StreamListener.prototype =
{
    onStartRequest: function(request, context)
    {
    },

    onStopRequest: function(request, context, status)
    {
        this.observer.onComplete(this.data, this.url, status);
    },

    onDataAvailable: function(request, context, inStr, sourceOffset, count)
    {
        var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].
            createInstance(Components.interfaces.nsIScriptableInputStream);
        sis.init(inStr);
        this.data += sis.read(count);
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.escapeNewLines = function(value)
{
    return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}

FireBugUtils.escapeHTML = function(value)
{
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugUtils.clearNode = function(node)
{
    while (node.lastChild)
        node.removeChild(node.lastChild);
}

FireBugUtils.getRootWindow = function(win)
{
    for (; win; win = win.parent)
    {
        if (!win.parent || win == win.parent)
            return win;
    }
    return null;
}

FireBugUtils.getNextElement = function(node)
{
    while (node && node.nodeType != 1)
        node = node.nextSibling;
    
    return node;
}

FireBugUtils.getPreviousElement = function(node)
{
    while (node && node.nodeType != 1)
        node = node.previousSibling;
    
    return node;
}

FireBugUtils.hasClass = function(node, name)
{
    return node && node.className && node.className.indexOf(name) != -1;
}

FireBugUtils.setClass = function(node, name)
{
    if (node && !this.hasClass(node, name))
        node.className += " " + name;
}

FireBugUtils.removeClass = function(node, name)
{
    if (node && node.className)
    {
        var index = node.className.indexOf(name);
        if (index >= 0)
        {
            var size = name.length;
            node.className = node.className.substr(0,index-1) + node.className.substr(index+size);
        }
    }
}

FireBugUtils.toggleClass = function(elt, name)
{
    if (this.hasClass(elt, name))
        this.removeClass(elt, name);
    else
        this.setClass(elt, name);
}


FireBugUtils.getChildByClassName = function(node, className)
{
    for (var child = node.firstChild; child; child = child.nextSibling)
    {
        if (this.hasClass(child, className))
            return child;
    }
    
    return null;
}

FireBugUtils.hasChildElements = function(element)
{
    if (element.contentDocument)
        return true;
    
    for (var child = element.firstChild; child; child = child.nextSibling)
    {
        if (child.nodeType == 1)
            return true;
    }
    
    return false;
}

var contextDocument = document;

FireBugUtils.createElement = function(name, attrs, content)
{
    var node = contextDocument.createElement(name);

    if (attrs)
    {
        for (var name in attrs)
        {
            var value = attrs[name];
            if (typeof(value) == "function")
                node[name] = value;
            else
                node.setAttribute(name, value);
        }        
    }
    
    if (content != null && content != undefined)
    {
        if (content instanceof Node)
            node.appendChild(content);
        else if (content instanceof Array)
            appendNodes(node, content);
        else
            node.innerHTML = content;
    }
    
    return node;
}

function H1(attrs, text) { return FireBugUtils.createElement("h1", attrs, text); }
function H2(attrs, text) { return FireBugUtils.createElement("h2", attrs, text); }
function H3(attrs, text) { return FireBugUtils.createElement("h3", attrs, text); }
function DIV(attrs, text) { return FireBugUtils.createElement("div", attrs, text); }
function PRE(attrs, text) { return FireBugUtils.createElement("pre", attrs, text); }
function SPAN(attrs, text) { return FireBugUtils.createElement("span", attrs, text); }
function IMG(attrs, text) { return FireBugUtils.createElement("img", attrs, text); }
function HR(attrs, text) { return FireBugUtils.createElement("hr", attrs, text); }
function LI(attrs, text) { return FireBugUtils.createElement("li", attrs, text); }
function A(attrs, text) { return FireBugUtils.createElement("a", attrs, text); }
function TWISTY(attrs) { attrs["class"] = "twisty"; attrs["src"] = "blank.gif"; return IMG(attrs); }
function TEXT(text) { return contextDocument.createTextNode(text); }

function withDocument(doc, fn)
{
    var previousDocument = contextDocument;
    contextDocument = doc;

    var result = fn();

    contextDocument = previousDocument;
    
    return result;
}

function appendNodes(parent, nodes)
{
    for (var i in nodes)
    {
        var content = nodes[i];
        if (content instanceof Node)
            parent.appendChild(content);
        else if (content instanceof Array)
            appendNodes(parent, content);
        else if (content != null && content != undefined)
            parent.appendChild(parent.ownerDocument.createTextNode(content));
    }
    
    return parent;
}

function isElement(o)
{
    try {
        return o && o instanceof Element;
    }
    catch (ex) {
        return false;
    }
}

function bindFunction()
{
    var args = cloneArray(arguments), fn = args.shift(), object = args.shift();
    return function() { return fn.apply(object, arrayInsert(args, 0, arguments)); }
}

function cloneArray(array, fn)
{
    var newArray = [];
    
    if (fn)
        for (var i = 0; i < array.length; ++i)
            newArray.push(fn(array[i]));
    else
        for (var i = 0; i < array.length; ++i)
            newArray.push(array[i]);
    
    return newArray;
}

function arrayInsert(array, index, other)
{
    for (var i = 0; i < other.length; ++i)
        array.splice(i+index, 0, other[i]);
        
    return array;
}

function sliceArray(array, index)
{
    var slice = [];
    for (var i = index; i < array.length; ++i)
        slice.push(array[i]);
        
    return slice;
}
