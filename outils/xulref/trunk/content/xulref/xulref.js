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
 * The Original Code is XulRef.
 *
 * The Initial Developer of the Original Code is Laurent Jouanneau
 *
 * Portions created by the Initial Developer are Copyright (C) 2004-2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Laurent Jouanneau <laurent@xulfr.org>, Original author
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

var datasources = {
   xul: 'chrome://xulref/content/rdf/classification_xul.rdf chrome://xulref/locale/desc_xul_cat.rdf chrome://xulref/content/rdf/desc_xul_tag.rdf',

   xbl: 'chrome://xulref/content/rdf/classification_xbl.rdf chrome://xulref/locale/desc_xbl_cat.rdf chrome://xulref/content/rdf/desc_xbl_tag.rdf'
}

var technos = {
   xul : {
            xulplanet : [ 'http://xulplanet.com/references/elemref/',
                          'chrome://xulref/content/rdf/links_xul_xulplanet.rdf' ],
            xulfr : [ 'http://xulfr.org/wiki/Reference/Xul/',
                     'chrome://xulref/content/rdf/links_xul_xulfr.rdf']
         },
   xbl : {
            xulplanet : [ 'http://xulplanet.com/references/elemref/',
                          'chrome://xulref/content/rdf/links_xbl_xulplanet.rdf' ],
            xulfr : [ 'http://xulfr.org/wiki/Reference/Xbl/',
                     'chrome://xulref/content/rdf/links_xbl_xulfr.rdf']
         }
};

var sites = {
   xulplanet : ['xulplanet.com' , 'http://www.xulplanet.com'],
   xulfr : [ 'xulfr.org', 'http://www.xulfr.org']
}



function initXulRef(){
   var tree= document.getElementById('refxul');
   tree.addEventListener("click",tagTreeOnClick,true);
   var tree2= document.getElementById('refxbl');
   tree2.addEventListener("click",tagTreeOnClick,true);

   updateDatasource(getCurrentTechno(), getCurrentSite());
}

function getCurrentSite(){
   return document.getElementById('siteselection').value;
}

function getCurrentTechno(){
   var panel = document.getElementById('ongletsXulRef').selectedPanel;
   return panel.id.substr(5);
}

function getTree(techno){
   var t = techno || getCurrentTechno();
   return document.getElementById('ref'+t);
}

function updateDatasource(techno, site){
   var t = techno || getCurrentTechno();
   var s = site || getCurrentSite();

   var tree= getTree(t);
   var urlrdf= datasources[t] + ' '+ technos[t][s][1];

   tree.setAttribute('datasources', urlrdf);
}

function updateDatasourceTab( site){
   var tree = updateDatasource(getCurrentTechno(), site);
}

function gosite(){
   var url= sites[getCurrentSite()][1];
   openLinkInCurrentTab(url);
}

function tagTreeOnClick(event){
   if (event.button != 0 && event.button != 1) return;

   var tree = getTree();

   if(event.originalTarget.localName == "treechildren") {
      var row = new Object;
      var col = new Object;
      var child = new Object;

      tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, child);
      if (row.value == -1)
       return;

      var link= tree.view.getCellText(row.value, getCurrentTechno()+'taglink');
      if(link =='') return;

      link = technos[getCurrentTechno()][getCurrentSite()][0] + link;


      // double click
      if (event.detail == 2) {
        openLinkInCurrentTab(link);
      }

      // middle click : we open link in new tab
      if(event.detail == 1 && event.button == 1){
         openLinkInNewTab(link);
      }
   }
}

function openLinkInCurrentTab(link){
    var tabbrowse = window.parent.document.getElementById('content');
    if(tabbrowse)
       tabbrowse.loadURI(link);
}

function openLinkInNewTab(link){
    var tabbrowse = window.parent.document.getElementById('content');
    if(tabbrowse)
       tabbrowse.addTab(link);
}



