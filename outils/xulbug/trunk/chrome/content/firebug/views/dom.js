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
 
function FireBugDOMView() {}

FireBugDOMView.prototype = new FireBugView();

FireBugDOMView.prototype.showContext = function(context)
{
    if (!context.loaded)
        return;

    if (context.selectedObject)
        this.inspect(context.selectedObject);
    else
        this.inspect(context.window);

    this.contextNode.setAttribute("showFunctions", FireBug.showFunctions);
    this.contextNode.setAttribute("showConstants", FireBug.showConstants);
}

FireBugDOMView.prototype.supportsObject = function(object)
{
    return object ? 2 : 0;
}

FireBugDOMView.prototype.startInspecting = function()
{
}

FireBugDOMView.prototype.inspect = function(object)
{
    if (object == this.contextNode.latestObject)
        return;

    FireBugUtils.clearNode(this.contextNode);

    this.contextNode.latestObject = object;
    
    FireBug_logDOM(object, this.contextNode);
}

FireBugDOMView.prototype.stopInspecting = function(cancelled)
{
}

FireBugDOMView.prototype.setOption = function(name, value)
{
    if (name == "showFunctions")
        this.contextNode.setAttribute("showFunctions", value);
    else if (name == "showConstants")
        this.contextNode.setAttribute("showConstants", value);
}
