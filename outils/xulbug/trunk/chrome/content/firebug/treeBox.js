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
 */
function FireBugTreeBox(view, box)
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

FireBugTreeBox.prototype.startHighlighting = function()
{
    // Remember where the scrollbar was so we can restore it if the user cancels
    this.lastScrollX = this.box.scrollLeft;
    this.lastScrollY = this.box.scrollTop;
}

FireBugTreeBox.prototype.appendObject = function(object, parentNodeBox)
{
    var objectBox = this.createObjectBox(object);
    
    var childBox = parentNodeBox ? parentNodeBox.childNodes[1] : this.box;
    childBox.appendChild(objectBox);

    return objectBox;
}

FireBugTreeBox.prototype.createObjectBox = function(object)
{
    var label = this.view.getElementLabel(object);
    var closeLabel = this.view.getElementCloseLabel(object);

    var nodeBox = withDocument(this.box.ownerDocument, function() {
        return DIV({"class": "nodeBox"}, [
            DIV({"class": "nodeItem"}, [
                IMG({"class": "nodeTwisty", src: "blank.gif"}),
                SPAN({"class": "nodeLabel"}, label)
            ]),
            DIV({"class": "nodeChildBox"}),
            closeLabel
                ? DIV({"class": "nodeCloseLabel"}, closeLabel)
                : null
        ])
    });

    nodeBox.targetObject = object;
    return nodeBox;
}

FireBugTreeBox.prototype.showObjectBox = function(objectBox)
{
    this.toggleObjectBox(objectBox, true);
    FireBugUtils.scrollIntoCenterView(objectBox, this.box);
}

FireBugTreeBox.prototype.toggleObjectBox = function(objectBox, force)
{
    var isOpen = FireBugUtils.hasClass(objectBox, "open");
    if ((force == undefined && isOpen) || force == false)
        FireBugUtils.removeClass(objectBox, "open");

    else if (force == true || !isOpen)
    {
        this.populateObjectBox(objectBox.targetObject, objectBox);
        FireBugUtils.setClass(objectBox, "open");
    }
}

FireBugTreeBox.prototype.populateObjectBox = function(object, objectBox)
{
    var childBox = objectBox.childNodes[1];
    if (!childBox.firstChild)
        this.view.populateObjectBox(objectBox.targetObject, objectBox);
}

FireBugTreeBox.prototype.getNextNodeBox = function(nodeBox, container)
{
    var childBox = nodeBox.childNodes[1];
    if (childBox && childBox.firstChild)
        return childBox.firstChild;

    while(nodeBox && nodeBox != container)
    {
        if (nodeBox.nextSibling)
            return nodeBox.nextSibling;
            
        nodeBox = nodeBox.parentNode ? nodeBox.parentNode.parentNode : null;
    }

    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugTreeBox.prototype.onMouseOver = function(event)
{
    if (this.view.onMouseOver)
        this.view.onMouseOver(event);
}

FireBugTreeBox.prototype.onMouseOut = function(event)
{
    if (this.view.onMouseOut)
        this.view.onMouseOut(event);
}

FireBugTreeBox.prototype.onMouseDown = function(event)
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
