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
 
function FireBugSourceView()
{
    this.innerSelect = false;
    this.rootElement = null;
}

FireBugSourceView.prototype = new FireBugView();

// Options
FireBugSourceView.showFullSource = true;

FireBugSourceView.prototype.showContext = function(context)
{
    if (!context.loaded)
        return;

    if (!this.contextNode.treeBox)
        this.contextNode.treeBox = new FireBugSourceBox(this, this.contextNode);
    
    var object = context.selectedObject;

    if (!object)
        object = context.window.document.documentElement;
    
    else if (object instanceof Text)
        object = object.parentNode;
    
    if (object)
        this.contextNode.treeBox.selectObject(object, true);
}

FireBugSourceView.prototype.supportsObject = function(object)
{
    if (object instanceof Element || object instanceof Text)
        return 1;
    else
        return 0;
}

FireBugSourceView.prototype.startInspecting = function()
{
    this.contextNode.treeBox.startHighlighting();
}

FireBugSourceView.prototype.inspect = function(object)
{
    this.contextNode.treeBox.highlightObject(object);
}

FireBugSourceView.prototype.stopInspecting = function(cancelled)
{
    this.contextNode.treeBox.stopHighlighting(cancelled);
}

FireBugSourceView.prototype.searchable = true;

FireBugSourceView.prototype.search = function(text)
{
    var doc = this.context.window.document;
    
    // Make previously visible nodes invisible again
    if (this.matchSet)
    {
        for (var i in this.matchSet)
            FireBugUtils.removeClass(this.matchSet[i], "matched");
    }

    this.matchSet = [];

    // XXXjoe Iterate through all documents including frames, not just the top-level document
    var elements = FireBugUtils.getElementsBySelector(doc, text);
    
    for (var i in elements)
    {
        var element = elements[i];
        var objectBox = this.contextNode.treeBox.openToObject(element);
        
        FireBugUtils.setClass(objectBox, "matched");
        this.matchSet.push(objectBox);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugSourceView.prototype.createObjectBox = function(element, isRoot)
{
    if (element instanceof SourceFile)
    {
        var nodeBox = withDocument(this.browser.contentDocument, function() {
            return DIV({"class": "nodeBox"})
        });
        
        FireBug_logSourceFile(element, nodeBox);

        nodeBox.targetObject = element;
        return nodeBox;
    }
    
    var hasChildren = this.isSourceElement(element)
        ? true
        : FireBugUtils.hasChildElements(element);

    var label = FireBugUtils.getElementLabel(element);
    
    var nodeBox = withDocument(this.browser.contentDocument, function() {
        return DIV({"class": "nodeBox" + (hasChildren ? "" : " empty")}, [
            DIV({"class": "nodeItem"}, [
                IMG({"class": "nodeTwisty", src: "blank.gif"}),
                SPAN({"class": "nodeLabel"}, label)
            ]),
            DIV({"class": "nodeChildBox"}),
            hasChildren
                ? DIV({"class": "nodeCloseLabel"}, FireBugUtils.getElementCloseLabel(element))
                : null
        ])
    });
    
    nodeBox.targetObject = element;
    return nodeBox;
}

FireBugSourceView.prototype.getParentObject = function(node)
{
    if (node instanceof SourceFile)
        return node.sourceNode;
    
    if (this.rootElement && node == this.rootElement)
        return null;
    
    var parentNode = node ? node.parentNode : null;
    if (parentNode && parentNode.nodeType == 9)
        return parentNode.defaultView.frameElement;
    else
        return parentNode;
}

FireBugSourceView.prototype.getChildObject = function(node, index, previousSibling)
{
    if (this.isSourceElement(node))
    {
        if (index == 0)
        {
            if (node.sourceFile)
                return node.sourceFile;
            
            var sourceHref = this.getSourceHref(node);
            var sourceText = sourceHref ? null : this.getSourceText(node);
            node.sourceFile = new SourceFile(sourceHref, sourceText, node);
            return node.sourceFile;
        }
    }
    else if (previousSibling)
    {
        for (var child = previousSibling.nextSibling; child; child = child.nextSibling)
        {
            if (child.nodeType == 1)
                return child;
        }
    }
    else
    {
        if (index == 0 && node.contentDocument)
            return node.contentDocument.documentElement;

        var elementIndex = 0;
        for (var child = node.firstChild; child; child = child.nextSibling)
        {
            if (child.nodeType == 1 && elementIndex++ == index)
                return child;
        }
    }
    
    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugSourceView.prototype.isSourceElement = function(element)
{
    return element.localName == "SCRIPT" || element.localName == "LINK"
        || element.localName == "STYLE";
}

FireBugSourceView.prototype.getSourceHref = function(element)
{
    if (element.localName == "SCRIPT" && element.src)
        return element.src;
    else if (element.localName == "LINK")
        return element.href;
    else
        return null;
}

FireBugSourceView.prototype.getSourceText = function(element)
{
    if (element.localName == "SCRIPT" && !element.src)
        return element.textContent;
    else if (element.localName == "STYLE")
        return element.textContent;
    else
        return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugSourceView.prototype.editAttribute = function(attrElement)
{
    var style = this.browser.contentWindow.getComputedStyle(attrElement, "");

    var editor = this.getEditor();
    editor.className = "editor";
    editor.style.width = attrElement.offsetWidth + "px";
    editor.style.height = attrElement.offsetHeight + "px";
    editor.style.fontFamily = style.fontFamily;
    editor.style.fontSize = style.fontSize;
    editor.value = attrElement.innerHTML;

    var self = this;
    function onedit(targetBox, nodeBox, value)
        { self.onEditAttribute(targetBox, nodeBox, value); }

    this.applyEditor(attrElement, onedit);
}

FireBugSourceView.prototype.getEditor = function()
{
    if (!this.editor)
    {
        this.editor = this.browser.contentDocument.createElement("input");
        
        var self = this;
        this.onKeyPress = function(event) { self.onEditorKeyPress(event); }
        this.onBlur = function(event) { self.onEditorBlur(event); }

        this.editor.addEventListener("keypress", this.onKeyPress, true);
        this.editor.addEventListener("blur", this.onBlur, true);
    }
    
    return this.editor;
}

FireBugSourceView.prototype.applyEditor = function(targetElement, callback)
{
    var editor = this.getEditor();
    if (editor.targetElement)
        editor.parentNode.replaceChild(editor.targetElement, editor);
        
    editor.callback = callback;
    editor.targetElement = targetElement;

    if (targetElement)
    {
        targetElement.parentNode.replaceChild(editor, targetElement);
        editor.select();
    }
}

FireBugSourceView.prototype.onEditorBlur = function(event)
{
    this.applyEditor(null);
}

FireBugSourceView.prototype.onEditorKeyPress = function(event)
{
    if (event.keyCode == 13)
    {
        var nodeBox = this.editor;
        for (; nodeBox && !nodeBox.targetObject; nodeBox = nodeBox.parentNode) {}

        this.editor.callback(this.editor.targetElement, nodeBox, this.editor.value);
        this.applyEditor(null);
    }
    else if (event.keyCode == 27)
    {
        this.applyEditor(null);
    }
}

FireBugSourceView.prototype.onEditAttribute = function(targetBox, nodeBox, value)
{
    targetBox.innerHTML = value;

    var attrName = targetBox.getAttribute("targetAttr");    
    nodeBox.targetObject.setAttribute(attrName, value);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugSourceView.prototype.onMouseOver = function(event)
{
    var targetIsLabel = false;
    
    for (var child = event.target; child; child = child.parentNode)
    {
        if (FireBugUtils.hasClass(child, "nodeLabel"))
            targetIsLabel = true;

        if (child.targetObject)
        {
            if (targetIsLabel)
                FireBug.highlightElement(child.targetObject);
            break;
        }
    }
}

FireBugSourceView.prototype.onMouseOut = function(event)
{
    for (var child = event.target; child; child = child.parentNode)
    {
        if (child.targetObject)
        {
            FireBug.highlightElement(null);
            break;
        }
    }
}

FireBugSourceView.prototype.onMouseDown = function(event)
{
    var targetAttr = null;
    var targetIsTag = false;
    
    for (var child = event.target; child; child = child.parentNode)
    {
        if (FireBugUtils.hasClass(child, "nodeAttr"))
            targetAttr = child;
        else if (FireBugUtils.hasClass(child, "nodeTag"))
            targetIsTag = true;
            
        else if (child.targetObject)
        {
            if (event.metaKey)
                FireBug.visitObject(child.targetObject);

            else
            {
                if (targetAttr)
                    this.editAttribute(targetAttr);
                else if (targetIsTag)
                {
                    if (this.innerSelect)
                        this.contextNode.treeBox.selectObject(child.targetObject, true);
                    else
                        FireBug.selectObject(child.targetObject, null, false, true);
                }
            }
            break;
        }
    }
}

