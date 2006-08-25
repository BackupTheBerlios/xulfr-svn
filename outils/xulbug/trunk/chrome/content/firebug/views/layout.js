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
 
function FireBugLayoutView() {}

FireBugLayoutView.prototype = new FireBugView();

FireBugLayoutView.prototype.showContext = function(context)
{
    if (!context.loaded)
        return;

    if (context.selectedObject)
        this.inspect(context.selectedObject);
    else
        this.inspect(context.window);
}

FireBugLayoutView.prototype.supportsObject = function(object)
{
    return isElement(object) ? 1 : 0;
}

FireBugLayoutView.prototype.startInspecting = function()
{
}

FireBugLayoutView.prototype.inspect = function(object)
{
    FireBugUtils.clearNode(this.contextNode);
    
    var dumpNode = this.createView(object, this.contextNode.ownerDocument);
    if (dumpNode)
        this.contextNode.appendChild(dumpNode);
}

FireBugLayoutView.prototype.stopInspecting = function(cancelled)
{
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugLayoutView.prototype.getElementLabel = function(object)
{
    return object;
}

FireBugLayoutView.prototype.getElementCloseLabel = function(object)
{
    return null;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugLayoutView.prototype.onMouseOver = function(event)
{
}

FireBugLayoutView.prototype.onMouseOut = function(event)
{
}

FireBugLayoutView.prototype.onMouseDown = function(event)
{
}

///////////////////////////////////////////////////////////////////////////////////////////////////

FireBugLayoutView.prototype.createView = function(node, logDocument)
{
    if (!isElement(node))
        return null;

    var logNode = logDocument.createElement("div");
    logNode.className = "boxView";

    var view = node.ownerDocument.defaultView;
    var computed = view.getComputedStyle(node, "");

    var mt = computed.getPropertyCSSValue("margin-top").cssText;
    var mr = computed.getPropertyCSSValue("margin-right").cssText;
    var mb = computed.getPropertyCSSValue("margin-bottom").cssText;
    var ml = computed.getPropertyCSSValue("margin-left").cssText; 

    var bt = computed.getPropertyCSSValue("border-top-width").cssText; 
    var br = computed.getPropertyCSSValue("border-right-width").cssText;
    var bb = computed.getPropertyCSSValue("border-bottom-width").cssText;
    var bl = computed.getPropertyCSSValue("border-left-width").cssText;

    var pt = computed.getPropertyCSSValue("padding-top").cssText; 
    var pr = computed.getPropertyCSSValue("padding-right").cssText;
    var pb = computed.getPropertyCSSValue("padding-bottom").cssText;
    var pl = computed.getPropertyCSSValue("padding-left").cssText;

    var xt = computed.getPropertyCSSValue("top").cssText;
    var xr = computed.getPropertyCSSValue("right").cssText;
    var xb = computed.getPropertyCSSValue("bottom").cssText;
    var xl = computed.getPropertyCSSValue("left").cssText;

    var sw = computed.getPropertyCSSValue("width").cssText;
    var sh = computed.getPropertyCSSValue("height").cssText;

    var dis = computed.getPropertyCSSValue("display").cssText;
    var pos = computed.getPropertyCSSValue("position").cssText;
    var vis = computed.getPropertyCSSValue("visibility").cssText;
    var flo = computed.getPropertyCSSValue("float").cssText;
    
    var columns = [{},{},{}];

    columns[0]["display"] = dis;
    columns[0]["position"] = pos;
    columns[0]["visibility"] = vis;
    columns[0]["float"] = flo;

    columns[1]["margin"] = mt + ", " + mr + ", " + mb + ", " + ml + "";
    columns[1]["border"] = bt + ", " + br + ", " + bb + ", " + bl + "";
    columns[1]["padding"] = pt + ", " + pr + ", " + pb + ", " + pl + "";    
    columns[1]["top/right/bottom/left"] = xt + ", " + xr + ", " + xb + ", " + xl + "";
    columns[1]["width/height"] = sw + ", " + sh + "";

    columns[2]["offsetLeft/Top"] = node.offsetLeft + ", " + node.offsetTop + "";
    columns[2]["offsetWidth/Height"] = node.offsetWidth + ", " + node.offsetHeight + "";
    columns[2]["clientWidth/Height"] = node.clientWidth + ", " + node.clientHeight + "";
    columns[2]["scrollLeft/Top"] = node.scrollLeft + ", " + node.scrollTop + "";
    columns[2]["scrollWidth/scrollHeight"] = node.scrollWidth + ", " + node.scrollHeight + "";
            
    var topTable = logDocument.createElement("table");
    topTable.setAttribute("width", "100%");
    var topRow = logDocument.createElement("tr");
    topTable.appendChild(topRow);
    
    for (var i in columns)
    {
        var column = logDocument.createElement("td");
        column.className = "infoColumn";
        topRow.appendChild(column);

        var table = logDocument.createElement("table");
        column.appendChild(table);

        var rows = columns[i];
        for (var name in rows)
        {
            var tr = logDocument.createElement("tr");
            var td = logDocument.createElement("td");
            td.className = "infoLabel";
            var text = logDocument.createTextNode(name);
            td.appendChild(text);
            tr.appendChild(td);
    
            td = logDocument.createElement("td");
            td.className = "infoValue";
            text = logDocument.createTextNode(rows[name]);
            td.appendChild(text);
            tr.appendChild(td);
            
            table.appendChild(tr);
        }
    }
    
    logNode.appendChild(topTable);
    
    return logNode;
}
