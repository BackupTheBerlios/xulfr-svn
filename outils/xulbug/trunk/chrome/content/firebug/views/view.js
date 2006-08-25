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
 
function FireBugView(name)
{
    this.name = name;
}

FireBugView.prototype.initialize = function(browser)
{
    this.browser = browser
}

FireBugView.prototype.uninitialize = function()
{
    this.browser = null;
}

FireBugView.prototype.attachContext = function(context)
{
}

FireBugView.prototype.detachContext = function(context)
{
}

FireBugView.prototype.showContext = function(context)
{
}

FireBugView.prototype.hideContext = function(context)
{
}

/**
 * Returns a number indicating the view's abilitiy to inspect the object.
 *
 * 0 - Object not supported
 * 1 - Supported as primary object
 * 2 - Supported as secondary object
 */
FireBugView.prototype.supportsObject = function(object)
{
    return 0;
}

/**
 * Allows the view to save state before it is destroyed.  If user reloads the page, this state
 * object will be available as context.priorState when showContext is called.
 */
FireBugView.prototype.saveState = function(context, state)
{
}

FireBugView.prototype.startInspecting = function()
{
}

FireBugView.prototype.inspect = function(element)
{
}

FireBugView.prototype.stopInspecting = function(cancelled)
{
}

FireBugView.prototype.searchable = false;

FireBugView.prototype.search = function(text)
{
}

FireBugView.prototype.clearable = false;

FireBugView.prototype.clear = function()
{
}

FireBugView.prototype.setOption = function(name, value)
{
}
