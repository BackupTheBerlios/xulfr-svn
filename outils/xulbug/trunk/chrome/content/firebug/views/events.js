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
 
function FireBugEventsView() {}

FireBugEventsView.prototype = new FireBugConsoleView();

FireBugEventsView.prototype.attachMutationEvents = false;
FireBugEventsView.prototype.throttleMessages = false;

FireBugEventsView.eventTypes =
{
    composition: [
        "composition",
        "compositionstart",
        "compositionend" ],
    contextmenu: [
        "contextmenu" ],
    drag: [
        "dragenter",
        "dragover",
        "dragexit",
        "dragdrop",
        "draggesture" ],
    focus: [
        "focus",
        "blur" ],
    form: [
        "submit",
        "reset",
        "change",
        "select",
        "input" ],
    key: [
        "keydown",
        "keyup",
        "keypress" ],
    load: [
        "load",
        "beforeunload",
        "unload",
        "abort",
        "error" ],
    mouse: [
        "mousedown",
        "mouseup",
        "click",
        "dblclick",
        "mouseover",
        "mouseout",
        "mousemove" ],
    mutation: [
        "DOMSubtreeModified",
        "DOMNodeInserted",
        "DOMNodeRemoved",
        "DOMNodeRemovedFromDocument",
        "DOMNodeInsertedIntoDocument",
        "DOMAttrModified",
        "DOMCharacterDataModified" ],
    paint: [
        "paint",
        "resize",
        "scroll" ],
    scroll: [
        "overflow",
        "underflow",
        "overflowchanged" ],
    text: [
        "text" ],
    ui: [
        "DOMActivate",
        "DOMFocusIn",
        "DOMFocusOut" ],
    xul: [
        "popupshowing",
        "popupshown",
        "popuphiding",
        "popuphidden",
        "close",
        "command",
        "broadcast",
        "commandupdate" ]
};

FireBugEventsView.prototype.showContext = function(context)
{
    if (!context.loaded)
        return;

    var isNewObject = this.contextNode.eventObject != context.selectedObject;
    if (this.contextNode.eventObject && isNewObject)
    {
        FireBugUtils.clearNode(this.contextNode);
        this.detachListeners(this.contextNode.eventObject, this.contextNode);
    }
    
    this.contextNode.eventObject = context.selectedObject;
    
    if (context.selectedObject && isNewObject)
        this.attachListeners(context.selectedObject, context, this.contextNode);
}

FireBugEventsView.prototype.detachContext = function(context)
{
    var contextNode = context.contextNodes[this.viewName];
    if (contextNode && contextNode.eventObject)
        this.detachListeners(contextNode.eventObject, contextNode);
}

FireBugEventsView.prototype.supportsObject = function(object)
{
    if (object instanceof Window || object instanceof Element || object instanceof Document)
        return 3;
    else
        return 0;
}

FireBugEventsView.prototype.clearable = true;

FireBugEventsView.prototype.clear = function()
{
    if (this.contextNode)
        FireBugUtils.clearNode(this.contextNode);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugEventsView.getEventInfo = function(event)
{
    var span = SPAN({"class": "eventInfo"}, "target = ");
    FireBug_appendObject(event.target, span, 0, true);

    var eventFamily = this.getEventFamily(event.type);
    if (eventFamily == "mouse")
    {
        appendNodes(span, [
            ", clientX = " + event.clientX +
            ", clientY = " + event.clientY
        ]);
    }
    else if (eventFamily == "key")
    {
        if (event.type == "keypress")
        {
            appendNodes(span, [
                ", charCode = " + event.charCode
            ]);
        }
        else
        {
            appendNodes(span, [
                ", keyCode = " + event.keyCode
            ]);
        }
    }

    return span;
}

FireBugEventsView.getEventFamily = function(eventType)
{
    if (!this.families)
    {
        this.families = {};
        
        for (var family in this.eventTypes)
        {
            var types = this.eventTypes[family];
            for (var i in types)
                this.families[types[i]] = family;
        }
    }
    
    return this.families[eventType];
}

FireBugEventsView.prototype.attachListeners = function(object, context, contextNode)
{
    var self = this;
    contextNode.onEvent = function(event)
    {
        var copy = new EventCopy(event);
        self.log(copy, "event", FireBug_logObjectRow, context);
    }
    
    for (var family in FireBugEventsView.eventTypes)
    {
        if (family == "mutation" && !this.attachMutationEvents)
            continue;
        
        var types = FireBugEventsView.eventTypes[family];
        for (var i in types)
            object.addEventListener(types[i], contextNode.onEvent, false);
    }
}

FireBugEventsView.prototype.detachListeners = function(object, contextNode)
{
    for (var family in FireBugEventsView.eventTypes)
    {
        var types = FireBugEventsView.eventTypes[family];
        for (var i in types)
            object.removeEventListener(types[i], contextNode.onEvent, false);
    }
}
