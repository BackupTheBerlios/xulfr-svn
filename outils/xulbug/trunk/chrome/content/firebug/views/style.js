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
 
function FireBugStyleView() {}

// XXXjoe These aren't being used yet, they are for when we support editing so we can populate
// dropdowns with possible values of enumerated values
FireBugStyleView.positions =
[
    "static",
    "relative",
    "absolute"
];

FireBugStyleView.displays =
[
    "block",
    "inline"
];

FireBugStyleView.borderStyles =
[
    "solid",
    "dashed",
    "dotted",
    "inset",
    "outset",
    "inherit"
];

FireBugStyleView.groups =
{
    margin: {
        "margin-top": "px",
        "margin-right": "px",
        "margin-bottom": "px",
        "margin-left": "px",        
    },
    
    padding: {
        "padding-top": "px",
        "padding-right": "px",
        "padding-bottom": "px",
        "padding-left": "px",        
    },
    
    border: {
        "border-width": {
            "border-top-width": "px",
            "border-right-width": "px",
            "border-bottom-width": "px",
            "border-left-width": "px",
        },
        "border-color": {
            "border-top-color": "rgb",
            "border-right-color": "rgb",
            "border-bottom-color": "rgb",
            "border-left-color": "rgb",
        },
        "border-style": {
            "border-top-style": FireBugStyleView.borderStyles,
            "border-right-style": FireBugStyleView.borderStyles,
            "border-bottom-style": FireBugStyleView.borderStyles,
            "border-left-style": FireBugStyleView.borderStyles,
        },
        "-moz-border-radius": {
            "-moz-border-top-radius": "px",
            "-moz-border-right-radius": "px",
            "-moz-border-bottom-radius": "px",
            "-moz-border-left-radius": "px",
        },
    },

    outline: {
        "outline-width": {
            "outline-top-width": "px",
            "outline-right-width": "px",
            "outline-bottom-width": "px",
            "outline-left-width": "px",
        },
        "outline-color": {
            "outline-top-color": "rgb",
            "outline-right-color": "rgb",
            "outline-bottom-color": "rgb",
            "outline-left-color": "rgb",
        },
        "outline-style": {
            "outline-top-style": FireBugStyleView.borderStyles,
            "outline-right-style": FireBugStyleView.borderStyles,
            "outline-bottom-style": FireBugStyleView.borderStyles,
            "outline-left-style": FireBugStyleView.borderStyles,
        },
    },
    
    box : {
        "width": "px",
        "height": "px",
        "top": "px",
        "right": "px",
        "bottom": "px",
        "left": "px",
    },
    
    background: {
        "background-color": "rgb",
        "background-image": "image",
        "background-repeat": [],
        "background-position": [],
        "background-attachment": [],
        "opacity": "float"
    },
    
    font: {
        "font-family": "font",
        "font-size": "px",
        "font-weight": [],
        "font-style": [],
        "color": "rgb",
    },
    
    text: {
        "text-transform": [],
        "text-decoration": [],
        "letter-spacing": [],
        "word-spacing": [],
        "line-height": [],
        "text-align": [],
        "vertical-align": [],
        "direction": [],
        "column-count": [],
        "column-gap": [],
        "column-width": [],
    },
    
    layout: {
        "position": FireBugStyleView.positions,
        "display": FireBugStyleView.displays,
        "visibility": [],
        "z-index": [],
        "overflow": [],
        "white-space": [],
        "clip": [],
        "float": [],
        "clear": [],
        "-moz-box-sizing": [],
    },

    list: {
        "list-style-image": "image",
        "list-style-position": [],
        "list-style-type": [],
        "marker-offset": "px",
    },

    user: {
        "cursor": [],
        "user-focus": [],
        "user-select": [],
        "user-modify": [],
        "user-input": [],
    }
};

FireBugStyleView.prototype = new FireBugView();

FireBugStyleView.prototype.showContext = function(context)
{
    if (!context.loaded)
        return;

    if (!this.contextNode.listening)
    {
        var box = this.contextNode;
        box.listening = true;
        
        var self = this;
        function onMouseOver(event) { self.onMouseOver(event); }
        function onMouseOut(event) { self.onMouseOut(event); }
        function onMouseDown(event) { self.onMouseDown(event); }
        
        box.addEventListener("mouseover", onMouseOver, false);
        box.addEventListener("mouseout", onMouseOut, false);
        box.addEventListener("mousedown", onMouseDown, false);
    }
    
    if (context.selectedObject)
        this.inspect(context.selectedObject);
}

FireBugStyleView.prototype.supportsObject = function(object)
{
    if (isElement(object))
        return 1;
    else
        return 0;
}

FireBugStyleView.prototype.startInspecting = function()
{
}

FireBugStyleView.prototype.inspect = function(object)
{
    this.createStylesTree();
    
    this.highlightElement(object);
}

FireBugStyleView.prototype.stopInspecting = function(cancelled)
{
    if (cancelled)
    {
        if (this.context.selectedObject)
            this.highlightElement(this.context.selectedObject);
    }
}

FireBugStyleView.prototype.setOption = function(name, value)
{
    if (name == "showAllStyles")
        this.inspect(this.context.selectedObject);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugStyleView.prototype.highlightElement = function(element)
{
    if (element instanceof Document)
        element = element.body;

    if (!isElement(element))
        return;

    // Invalidate all of the rows first
    for (var i in this.contextNode.rows)
    {
        var tr = this.contextNode.rows[i];
        tr.validRule = false;
        tr.validRowCount = 0;
        tr.childNodes[1].firstChild.nodeValue = "";
    }
    
    var inspectedRules = FireBug.domUtils ? FireBug.domUtils.getCSSStyleRules(element) : null;
    if (inspectedRules)
    {
        // Look at each of the rules that matched the element and write their selector/file
        // to the row of each property that they contain
        var styleRows = this.contextNode.styleRows;
        for (var i = 0; i < inspectedRules.Count(); ++i)
        {
            var rule = inspectedRules.GetElementAt(i).
                QueryInterface(Components.interfaces.nsIDOMCSSStyleRule);
            var ruleLine = FireBug.domUtils.getRuleLine(rule);
    
            var href = rule.parentStyleSheet.href;
            if (FireBugUtils.isSystemURL(href))
                continue;
            
            this.validateStyleRows(rule.style, rule, href, ruleLine);
        }
    }
    
    this.validateStyleRows(element.style);

    // Hide all of the rows for properties that didn't have a rule match the element
    // and decorate the rows so we can shows borders and alternating colors
    var style = element.ownerDocument.defaultView.getComputedStyle(element, "");
    this.displayStyleValues(style);
}

FireBugStyleView.prototype.validateStyleRows = function(style, rule, href, ruleLine)
{
    var styleRows = this.contextNode.styleRows;
    for (var j = 0; j < style.length; ++j)
    {
        var prop = style.item(j);
        prop = this.translateStyleName(prop);
        var tr = styleRows[prop];
        if (tr)
        {
            // Validate the row and all of its ancestors
            tr.validRule = true;
            for (var parentRow = tr.parentRow; parentRow; parentRow = parentRow.parentRow)
                ++parentRow.validRowCount;
            
            // Create a link to the selector
            if (rule)
            {
                var selectorText = rule.selectorText.replace("\n", " ");
                if (selectorText.length > 25)
                    selectorText = selectorText.substr(0, 25) + "...";
                FireBugUtils.makeObjectLink(rule, selectorText, tr.childNodes[2].firstChild);
    
                // Create a link to the file
                var linkTitle = FireBugUtils.makeURLLinkTitle(href, ruleLine);
                var source = new SourceLink(href, ruleLine);
                FireBugUtils.makeObjectLink(source, linkTitle, tr.childNodes[3].firstChild);
            }
            else
            {
                tr.childNodes[2].firstChild.innerHTML = "";
                tr.childNodes[3].firstChild.innerHTML = "";
            }
        }
    }
}

FireBugStyleView.prototype.displayStyleValues = function(style)
{
    var topRowCount = 0;
    var opened = false;
    for (var i in this.contextNode.rows)
    {
        var tr = this.contextNode.rows[i];
        tr.childNodes[2];

        var value = style.getPropertyValue(tr.styleName);
        if (tr.styleInfo == "rgb")
            value = this.rgbToHex(value);
        
        if (!tr.parentRow)
            opened = tr.opened;
        else
        {
            if (!opened)
            {
                // Append the property value to all parent rows
                //for (var parentRow = tr.parentRow; parentRow; parentRow = parentRow.parentRow)
                    //parentRow.childNodes[1].firstChild.nodeValue += value + " ";
            }
            else
            {
                tr.childNodes[1].firstChild.nodeValue = value;

                if (tr.styleInfo == "rgb" || tr.styleInfo == "image")
                {
                    tr.childNodes[1].childNodes[1].style.visibility = "visible";
                    tr.childNodes[1].childNodes[1].style.background = value;
                }
                else
                {
                    tr.childNodes[1].childNodes[1].style.visibility = "collapse";
                }
            }
        }
        
        if (FireBug.showAllStyles || tr.validRule || tr.validRowCount)
        {
            FireBugUtils.setClass(tr, "styleInherited");
                        
            if (!tr.parentRow)
                ++topRowCount;
            
            if (topRowCount % 2)        
                FireBugUtils.setClass(tr, "odd");
            else    
                FireBugUtils.removeClass(tr, "odd");
        }
        else
        {
            FireBugUtils.removeClass(tr, "styleInherited");
            
            tr.childNodes[2].firstChild.nodeValue = "";
            tr.childNodes[3].firstChild.nodeValue = "";
        }
    }
}

FireBugStyleView.prototype.createStylesTree = function()
{
    if (this.contextNode.firstChild)
        return;
    
    var doc = this.contextNode.ownerDocument;
    var table = doc.createElement("table");
    table.setAttribute("cellspacing", "0");
    table.className = "propsTable styleTable";
    table.rowCount = 0;

    this.contextNode.appendChild(table);

    this.contextNode.rows = [];
    this.contextNode.styleRows = {};
    var groups = FireBugStyleView.groups;
    this.appendGroups(groups, 0, null, table, this.contextNode.rows);
}

FireBugStyleView.prototype.appendGroups = function(groups, level, parentRow, table)
{
    var doc = table.ownerDocument;
    var rows = this.contextNode.rows;
    var styleRows = this.contextNode.styleRows;
    
    var siblingRow = null;
    for (var name in groups)
    {
        var group = groups[name];
        var hasKids = group instanceof Object && !(group instanceof Array);

        var tr = doc.createElement("tr");
        tr.className = "styleRow level" + level
            + (hasKids ? " container opened" : " leaf empty");
        tr.styleName = name;
        tr.styleInfo = group;
        tr.rowCount = 0;
        tr.level = level;
        tr.parentRow = parentRow;
        tr.opened = true;
        
        rows.push(tr);
        styleRows[name] = tr;
        
        if (!table.firstRow)
            table.firstRow = tr;
        else if (parentRow && !parentRow.firstRow)
            parentRow.firstRow = tr;
        
        if (siblingRow)
            siblingRow.nextRow = tr;
        else
            siblingRow = tr;

        siblingRow = tr;
        
        if (parentRow)
            ++parentRow.rowCount;
        else
            ++table.rowCount;
        
        var tdName = doc.createElement("td");
        tdName.className = "styleCell styleCell-name";
        var twisty = doc.createElement("img");
        twisty.className = "rowTwisty";
        twisty.src = "chrome://firebug/content/blank.gif";
        tdName.appendChild(twisty);
        tdName.appendChild(doc.createTextNode(name));

        var tdValue = doc.createElement("td");
        tdValue.className = "styleCell styleCell-value";
        tdValue.appendChild(doc.createTextNode(""));
        
        if (parentRow)
        {
            var swatch = doc.createElement("img");
            swatch.className = "styleSwatch";
            swatch.src = "chrome://firebug/content/blank.gif";
            tdValue.appendChild(swatch);
        }
        
        var tdSelector = doc.createElement("td");
        tdSelector.className = "styleCell styleCell-selector";
        var selectorLink = doc.createElement("a");
        selectorLink.appendChild(doc.createTextNode(""));
        tdSelector.appendChild(selectorLink);

        var tdFile = doc.createElement("td");
        tdFile.className = "styleCell styleCell-file";
        var fileLink = doc.createElement("a");
        fileLink.appendChild(doc.createTextNode(""));
        tdFile.appendChild(fileLink);
        
        tr.appendChild(tdName);
        tr.appendChild(tdValue);
        tr.appendChild(tdSelector);
        tr.appendChild(tdFile);
        table.appendChild(tr);
        
        if (hasKids)
            this.appendGroups(group, level+1, tr, table, rows);
    }
}

FireBugStyleView.prototype.expandRow = function(tr)
{
    for (var tr = tr.firstRow; tr; tr = tr.nextRow)
    {
        FireBugUtils.removeClass(tr, "rowCollapsed");
        this.expandRow(tr);
    }
}

FireBugStyleView.prototype.collapseRow = function(tr)
{
    for (var tr = tr.firstRow; tr; tr = tr.nextRow)
    {
        FireBugUtils.setClass(tr, "rowCollapsed");
        this.collapseRow(tr);
    }
}

FireBugStyleView.prototype.toggleRow = function(tr)
{
    tr.opened = !tr.opened;
    tr.childNodes[1].firstChild.nodeValue = "";

    if (tr.opened)
    {
        FireBugUtils.setClass(tr, "opened");

        this.expandRow(tr);
    }
    else
    {
        FireBugUtils.removeClass(tr, "opened");

        this.collapseRow(tr);
        
        /*for (var tr = tr.firstRow; tr; tr = tr.nextRow)
        {
            //var value = tr.childNodes[1].firstChild.nodeValue;
            
            // Append the property value to all parent rows
            for (var parentRow = tr.parentRow; parentRow; parentRow = parentRow.parentRow)
                parentRow.childNodes[1].firstChild.nodeValue += value + " ";
        }*/
    }
}

FireBugStyleView.prototype.rgbToHex = function(value)
{
    var reg = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/i;
    var m = reg.exec(value);
    if (!m)
        return value;

    var r = parseInt(m[1]).toString(16);
    if (r.length == 1)
        r = "0" + r;
    var g = parseInt(m[2]).toString(16);
    if (g.length == 1)
        g = "0" + g;
    var b = parseInt(m[3]).toString(16);
    if (b.length == 1)
        b = "0" + b;

    return "#" + (r + g + b).toUpperCase();
}

/**
 * For some reason, Gecko uses a different name than you would expect for some common CSS
 * properties, so were we translate them back to earth.
 */
FireBugStyleView.prototype.translateStyleName = function(name)
{
    var map = {
        "margin-top-value": "margin-top",
        "margin-right-value": "margin-right",
        "margin-bottom-value": "margin-bottom",
        "margin-left-value": "margin-left",
        "padding-top-value": "padding-top",
        "padding-right-value": "padding-right",
        "padding-bottom-value": "padding-bottom",
        "padding-left-value": "padding-left",
    };
    var newName = map[name];
    return newName ? newName : name;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugStyleView.prototype.getStyleLabel = function(name, type)
{
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugStyleView.prototype.onMouseOver = function(event)
{
}

FireBugStyleView.prototype.onMouseOut = function(event)
{
}

FireBugStyleView.prototype.onMouseDown = function(event)
{
    var targetIsTwisty = false;
    var targetIsSelector = false;
    
    for (var child = event.target; child; child = child.parentNode)
    {
        if (FireBugUtils.hasClass(child, "rowTwisty"))
            targetIsTwisty = true;
            
        else if (child.styleName)
        {
            if (targetIsTwisty)
                this.toggleRow(child);
            break;
        }
    }
}
