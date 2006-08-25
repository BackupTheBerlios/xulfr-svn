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
 
/**
 * Creates a tree based on objects provided by a separate "view" object.
 *
 * Construction uses a bottom-up construction algorithm, meaning that the view's job is first
 * to tell us the ancestry of each object, and secondarily its descendants.
 */
function FireBugSourceBox(view, box)
{
    this.view = view;
    this.box = box;

    this.rootObject = null;

    this.rootObjectBox = null;
    this.selectedObjectBox = null;
    this.highlightedObjectBox = null;

    var self = this;
    function onMouseOver(event) { self.onMouseOver(event); }
    function onMouseOut(event) { self.onMouseOut(event); }
    function onMouseDown(event) { self.onMouseDown(event); }
    
    box.addEventListener("mouseover", onMouseOver, false);
    box.addEventListener("mouseout", onMouseOut, false);
    box.addEventListener("mousedown", onMouseDown, false);
}

FireBugSourceBox.prototype.startHighlighting = function()
{
    // Remember where the scrollbar was so we can restore it if the user cancels
    this.lastScrollX = this.box.scrollLeft;
    this.lastScrollY = this.box.scrollTop;
}

FireBugSourceBox.prototype.highlightObject = function(object)
{
    var objectBox = this.createObjectBox(object);
    this.highlightObjectBox(objectBox);
    return objectBox;
}

FireBugSourceBox.prototype.stopHighlighting = function(cancelled)
{
    if (cancelled)
    {
        this.box.scrollLeft = this.lastScrollX;
        this.box.scrollTop = this.lastScrollY;
    }
    else
    {
        this.openObjectBox(this.hoveredObjectBox);
        this.selectObjectBox(this.hoveredObjectBox);
    }
    
    this.highlightObject(null);
}

FireBugSourceBox.prototype.openObject = function(object)
{
    var firstChild = this.view.getChildObject(object, 0);
    if (firstChild)
        object = firstChild;
    
    var objectBox = this.createObjectBox(object);
    this.openObjectBox(objectBox);
    return objectBox;
}

FireBugSourceBox.prototype.openToObject = function(object)
{
    var objectBox = this.createObjectBox(object);
    this.openObjectBox(objectBox);
    return objectBox;
}

FireBugSourceBox.prototype.selectObject = function(object, makeBoxVisible)
{
    var objectBox = this.createObjectBox(object);
    this.selectObjectBox(objectBox);
    if (makeBoxVisible)
    {
        this.openObjectBox(objectBox);
        FireBugUtils.scrollIntoCenterView(objectBox, this.box);
    }
    return objectBox;
}

FireBugSourceBox.prototype.highlightObjectBox = function(objectBox)
{
    if (this.hoveredObjectBox)
    {
        FireBugUtils.removeClass(this.hoveredObjectBox, "hovered");
    
        var hoverBox = this.getParentObjectBox(this.hoveredObjectBox);
        for (; hoverBox; hoverBox = this.getParentObjectBox(hoverBox))
            FireBugUtils.removeClass(hoverBox, "hoverOpen");
    }
    
    this.hoveredObjectBox = objectBox;

    if (objectBox)
    {
        FireBugUtils.setClass(objectBox, "hovered");

        var hoverBox = this.getParentObjectBox(objectBox);
        for (; hoverBox; hoverBox = this.getParentObjectBox(hoverBox))
            FireBugUtils.setClass(hoverBox, "hoverOpen");

       FireBugUtils.scrollIntoCenterView(objectBox, this.box);
    }
}

FireBugSourceBox.prototype.selectObjectBox = function(objectBox)
{
    var isSelected = this.selectedObjectBox && objectBox == this.selectedObjectBox;    
    if (!isSelected)
    {
        FireBugUtils.removeClass(this.selectedObjectBox, "selected");
    
        this.selectedObjectBox = objectBox;
        
        if (objectBox)
        {
            FireBugUtils.setClass(objectBox, "selected");
            
            // Force it open the first time it is selected
            this.toggleObjectBox(objectBox, true);
        }
    }
}

FireBugSourceBox.prototype.openObjectBox = function(objectBox)
{
    if (objectBox)
    {
        // Set all of the node's ancestors to be permanently open
        var hoverBox = this.getParentObjectBox(objectBox);
        for (; hoverBox; hoverBox = this.getParentObjectBox(hoverBox))
            FireBugUtils.setClass(hoverBox, "open");
    }
}

FireBugSourceBox.prototype.toggleObjectBox = function(objectBox, forceOpen)
{
    var isOpen = FireBugUtils.hasClass(objectBox, "open");
    if (!forceOpen && isOpen)
        FireBugUtils.removeClass(objectBox, "open");

    else if (!isOpen)
    {
        var nodeChildBox = this.getChildObjectBox(objectBox);
        var firstChild = this.view.getChildObject(objectBox.targetObject, 0);
        this.populateChildBox(firstChild, nodeChildBox);

        FireBugUtils.setClass(objectBox, "open");
    }
}

/**
 * Creates all of the boxes for an object, its ancestors, and siblings.
 */
FireBugSourceBox.prototype.createObjectBox = function(object)
{
    if (!object)
        return null;

    var rootObject = this.rootObject;
    if (!rootObject)
        this.rootObject = this.getRootNode(object);

    // Get or create all of the boxes for the target and its ancestors
    var objectBox = this.createObjectBoxes(object, this.rootObject);

    if (!objectBox)
        return null;
    else if (object == this.rootObject)
        return objectBox;
    else
        return this.populateChildBox(object, objectBox.parentNode);
}

/**
 * Creates all of the boxes for an object, its ancestors, and siblings up to a root.
 */
FireBugSourceBox.prototype.createObjectBoxes = function(object, rootObject)
{
    if (!object)
        return null;
    
    if (object == rootObject)
    {
        if (!this.rootObjectBox || this.rootObjectBox.targetObject != rootObject)
        {
            if (this.rootObjectBox)
                this.box.removeChild(this.rootObjectBox);

            this.hoveredObjectBox = null;
            this.selectedObjectBox = null;

            this.rootObjectBox = this.view.createObjectBox(object, true)
            this.box.appendChild(this.rootObjectBox);
        }

        return this.rootObjectBox;
    }
    else
    {
        var parentNode = this.view.getParentObject(object);
        var parentObjectBox = this.createObjectBoxes(parentNode, rootObject);
        if (!parentObjectBox)
            return null;
        
        var parentChildBox = this.getChildObjectBox(parentObjectBox);
        for (var childBox = parentChildBox.firstChild; childBox; childBox = childBox.nextSibling)
        {
            if (childBox.targetObject == object)
                return childBox;
        }

        var parentChildBox = this.getChildObjectBox(parentObjectBox);
        return this.populateChildBox(object, parentChildBox);
    }
}

FireBugSourceBox.prototype.populateChildBox = function(targetObject, nodeChildBox)
{    
    if (!targetObject)
        return null;

    var lastSiblingBox = this.getChildObjectBox(nodeChildBox);
    var siblingBox = nodeChildBox.firstChild;
    var targetBox = null;

    var view = this.view;
    
    var targetSibling = null;
    var parentNode = view.getParentObject(targetObject);
    for (var i = 0; ; ++i)
    {
        targetSibling = view.getChildObject(parentNode, i, targetSibling);
        if (!targetSibling)
            break;
        
        // Check if we need to start appending, or continue to insert before
        if (lastSiblingBox && lastSiblingBox.targetObject == targetSibling)
            lastSiblingBox = null;
        
        if (!siblingBox || siblingBox.targetObject != targetSibling)
        {
            var newBox = view.createObjectBox(targetSibling);
            
            if (lastSiblingBox)
                nodeChildBox.insertBefore(newBox, lastSiblingBox);
            else
                nodeChildBox.appendChild(newBox);
            
            siblingBox = newBox;
        }

        if (targetSibling == targetObject)
            targetBox = siblingBox;

        if (siblingBox && siblingBox.targetObject == targetSibling)
            siblingBox = siblingBox.nextSibling;
    }
    
    return targetBox;
}

FireBugSourceBox.prototype.getParentObjectBox = function(objectBox)
{
    var parent = objectBox.parentNode ? objectBox.parentNode.parentNode : null;
    return parent && parent.targetObject ? parent : null;
}

FireBugSourceBox.prototype.getChildObjectBox = function(objectBox)
{    
    return objectBox.childNodes[1];
}

FireBugSourceBox.prototype.getRootNode = function(node)
{
    while (1)
    {
        var parentNode = this.view.getParentObject(node);
        if (!parentNode)
            return node;
        else
            node = parentNode;
    }
    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugSourceBox.prototype.onMouseOver = function(event)
{
    if (this.view.onMouseOver)
        this.view.onMouseOver(event);
}

FireBugSourceBox.prototype.onMouseOut = function(event)
{
    if (this.view.onMouseOut)
        this.view.onMouseOut(event);
}

FireBugSourceBox.prototype.onMouseDown = function(event)
{
    var targetIsTwisty = false;
    
    for (var child = event.target; child; child = child.parentNode)
    {
        if (FireBugUtils.hasClass(child, "nodeTwisty"))
            targetIsTwisty = true;
            
        else if (child.targetObject)
        {
            if (targetIsTwisty)
                this.toggleObjectBox(child);
            break;
        }
    }

    if (this.view.onMouseDown)
        this.view.onMouseDown(event);
}
