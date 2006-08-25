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
 
function FireBugCSSView() {}

FireBugCSSView.prototype = new FireBugView();

FireBugCSSView.prototype.showContext = function(context)
{
    if (!context.loaded)
        return;

    if (!this.contextNode.treeBox)
        this.contextNode.treeBox = new FireBugTreeBox(this, this.contextNode);
    
    if (context.selectedObject)
        this.inspect(context.selectedObject);
}

FireBugCSSView.prototype.supportsObject = function(object)
{
    if (object instanceof CSSStyleRule)
        return 1;
    else
        return 0;
}

FireBugCSSView.prototype.startInspecting = function()
{
    this.previousHighlightedBoxes = this.highlightedBoxes;
}

FireBugCSSView.prototype.inspect = function(object)
{
    this.createRulesTree();
    this.highlightObject(object);
}

FireBugCSSView.prototype.stopInspecting = function(cancelled)
{
    if (cancelled)
    {
        if (this.context.selectedObject)
            this.highlightObject(this.context.selectedObject);
    }

    this.previousHighlightedBoxes = null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugCSSView.prototype.highlightObject = function(object)
{
    this.showAllRules();
    
    var treeBox = this.contextNode.treeBox;
    var box = this.contextNode.firstChild;
    for (; box; box = treeBox.getNextNodeBox(box, this.contextNode))
    {
        var targetObject = box.targetObject;
        if (targetObject == object)
            this.contextNode.treeBox.showObjectBox(box);
    }
}

FireBugCSSView.prototype.highlightElement = function(object)
{
    this.contextNode.targetElement = object;
    
    var inspectedRules = FireBug.domUtils.getCSSStyleRules(object);

    var treeBox = this.contextNode.treeBox;
    
    this.highlightedBoxes = [];
    
    var box = this.contextNode.firstChild;
    for (; box; box = treeBox.getNextNodeBox(box, this.contextNode))
    {
        var object = box.targetObject;
        if (object instanceof CSSStyleRule)
        {
            FireBugUtils.removeClass(box, "highlight");
            
            for (var i = 0; i < inspectedRules.Count(); ++i)
            {
                var inspectedRule = inspectedRules.GetElementAt(i).
                    QueryInterface(Components.interfaces.nsIDOMCSSStyleRule);
        
                if (inspectedRule.selectorText == object.selectorText)
                {
                    this.highlightedBoxes.push(box);
                    
                    FireBugUtils.setClass(box, "highlight");
                    treeBox.toggleObjectBox(box, true);
                    break;
                }
            }
        }
    }
}
FireBugCSSView.prototype.showAllRules = function()
{
    var treeBox = this.contextNode.treeBox;
    var box = this.contextNode.firstChild;
    for (; box; box = treeBox.getNextNodeBox(box, this.contextNode))
        FireBugUtils.setClass(box, "highlight");
}

FireBugCSSView.prototype.createRulesTree = function()
{
    if (this.contextNode.firstChild)
        return;

    var treeBox = this.contextNode.treeBox;
        
    var styleSheets = this.context.window.document.styleSheets;
    
    for (var i = 0; i < styleSheets.length; ++i)
    {
        var styleSheet = styleSheets[i];
        
        // Ignore stylesheets inserted by FireBug
        if (styleSheet.href.indexOf("chrome://firebug/") == 0)
            continue;
        
        var objectBox = treeBox.appendObject(styleSheet);
        treeBox.toggleObjectBox(objectBox, true);
    }
}

FireBugCSSView.prototype.populateObjectBox = function(object, parentBox)
{
    if (object instanceof CSSStyleSheet)
        return this.populateSheetBox(object, parentBox);
    else if (object instanceof CSSStyleRule)
        return this.populateRuleBox(object, parentBox);
    else
        return null;
}

FireBugCSSView.prototype.populateSheetBox = function(styleSheet, parentBox)
{
    var treeBox = this.contextNode.treeBox;

    for (var i = 0; i < styleSheet.cssRules.length; ++i)
    {
        var rule = styleSheet.cssRules[i];
        if (rule instanceof CSSImportRule)        
        {
            var sheetBox = treeBox.appendObject(rule.styleSheet, parentBox);
            FireBugUtils.setClass(sheetBox, "sheetBox");

            treeBox.toggleObjectBox(sheetBox, true);
        }
        else
        {
            var ruleLine = FireBug.domUtils.getRuleLine(rule);
            // XXXjoe Show the rule line someplace in here
            
            var ruleBox = treeBox.appendObject(rule, parentBox);
            FireBugUtils.setClass(ruleBox, "ruleBox");
        }
    }
}

FireBugCSSView.prototype.populateRuleBox = function(rule, parentBox)
{
    var treeBox = this.contextNode.treeBox;
    
    var r = /\{(.*?)\}$/;
    var props = r.exec(rule.cssText)[1];
    
    var lines = props.split(";");
    for (var i = 0; i < lines.length-1; ++i)
    {
        var line = lines[i] + ";";
        var propertyBox = treeBox.appendObject(line, parentBox);
        FireBugUtils.setClass(propertyBox, "propertyBox");
        FireBugUtils.setClass(propertyBox, "empty");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugCSSView.prototype.getElementLabel = function(object)
{
    if (object instanceof CSSStyleRule)
    {
        return '<span class="nodeSelector">' + object.selectorText + '</span>'
            + '<span class="nodeOpenBrace"> {</span>';
    }
    else if (object instanceof CSSStyleSheet)
    {
        return "<span class=\"nodeHref\">" + object.href + "</span>";
    }
    else
        return object;
}

FireBugCSSView.prototype.getElementCloseLabel = function(object)
{
    if (object instanceof CSSStyleRule)
        return "}";
    else
        return null;
}

FireBugCSSView.prototype.selectObjectBox = function(objectBox)
{
    this.contextNode.treeBox.toggleObjectBox(objectBox);
}

FireBugCSSView.prototype.selectNodes = function(css)
{
    var reg = /^([#.]?)([a-z0-9\\*_-]*)/;
    var rules = css.split(",");
    for (var i in rules)
    {
        var xpath = "";
        
        var start = 0;
        while (css.length)
        {
            var m = reg.exec(rules[i], "i");
            if (!m)
                break;
             
            if (m[1] == '#')
            {
                xpath = "//*[@id='" + m[2] + "'"; 
            }
            
            css = css.substr(start, m[0].length);
            start += m[0].length;
        }
    }
}

FireBugCSSView.prototype.highlightRuleMatches = function(rule)
{
    FireBug.highlightObject(rule);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugCSSView.prototype.onMouseOver = function(event)
{
    var targetIsTwisty = false;
    var targetIsSelector = false;
    
    for (var child = event.target; child; child = child.parentNode)
    {
        if (FireBugUtils.hasClass(child, "nodeSelector"))
            targetIsSelector = true;
            
        else if (child.targetObject)
        {
            if (targetIsSelector)
                this.highlightRuleMatches(child.targetObject);
            break;
        }
    }

    if (!targetIsSelector)
        FireBug.highlightElements([]);
}

FireBugCSSView.prototype.onMouseOut = function(event)
{
}

FireBugCSSView.prototype.onMouseDown = function(event)
{
    var targetIsTwisty = false;
    var targetIsSelector = false;
    
    for (var child = event.target; child; child = child.parentNode)
    {
        if (FireBugUtils.hasClass(child, "nodeSelector"))
            targetIsSelector = true;
            
        else if (child.targetObject)
        {
            if (targetIsSelector)
                this.selectObjectBox(child);
            break;
        }
    }
}

