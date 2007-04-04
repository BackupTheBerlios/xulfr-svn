<?php
/**
 * liste des articles.
 * clé de chaque article = nom du fichier original sans le .html
 * tableau :
 *    1 : titre de l'article
 *    2 : tableau (auteur original=>date, correcteur/mainteneur=>date)
 *    3 : clé de l'article précédent
 *    4 : clé de l'article suivant
 *    5 : fin url pour l'article EN sur MDC
 *    6 : fin url pour l'article FR sur MDC
 *
 *
 * la liste doit présenter les articles dans l'ordre de lecture
 */

$article_list=array(

'index'=>array(
            'XUL Tutorial de XulPlanet.com/MDC',
            array('différents contributeurs de xulfr.org'=>''),
            '','',
            '','',
            ),

'intro'=>array(
            '1.1 Introduction',
            array('Tristan Rivoallan'=>'25/02/2004', 'Laurent Jouanneau'=>'17/11/2004', 'Alain B.'=> '04/04/2007'),
            '','xulfile',
            'Introduction',''
            ),

'xulfile'=>array(
            '1.2 La structure XUL',
            array('Gérard L.'=>'22/11/2003', 'Laurent Jouanneau'=>'20/11/2004', 'Alain B.'=> '04/04/2007'),
            'intro','chromeurl',
            'XUL_Structure',''
            ),

'chromeurl'=>array(
            '1.3 L\'URl Chrome',
             array('Romain D.'=>'11/02/2004',  'Laurent Jouanneau'=>'22/11/2004', 'Alain B.'=> '04/04/2007'),
             'xulfile','packaging',
             'The_Chrome_URL',''
             ),

'packaging'=>array(
            '1.4 Les fichiers manifest',
            array('Benoit Salandre'=>'08/02/2004',  'Laurent Jouanneau'=>'23/11/2004', 'Alain B.'=> '04/04/2007'),
            'chromeurl','window',
            'Manifest_Files',''
            ),

'window'=>array(
            '2.1 Créer une fenêtre',
            array('Gnunux'=> '14/11/2003', 'Alain B.'=> '04/04/2007' ),
            'packaging','buttons',
            'Creating_a_Window','',
            ),

'buttons'=>array(
            '2.2 Ajouter des boutons',
            array('Gnunux'=> '14/11/2003', 'Alain B.'=> '04/04/2007'),
            'window','textimage',
            'Adding_Buttons','',
            ),

'textimage'=>array(
            '2.3 Ajouter des libéllés et des images',
            array('Laurent Jouanneau'=> '10/03/2004', 'Alain B.'=> '04/04/2007'),
            'buttons','inputs',
            'Adding_Labels_And_Images','',
            ),

'inputs'  =>array(
            '2.4 Les champs de saisie',
            array('Benoit Salandre'=> '14/01/2004', 'Alain B.'=> '04/04/2007'),
            'textimage','lists',
            'Input_Controls','',
            ),

'lists'   =>array(
            '2.5 Les contrôles de listes',
            array('Alain B.'=> '06/02/2004', 'Alain B.'=> '04/04/2007'),
            'inputs','progress',
            'List_Controls','',
            ),

'progress'=>array(
            '2.6 Indicateurs de progression',
            array('Alain B.'=> '08/02/2004', 'Alain B.'=> '04/04/2007'),
            'lists','htmlelem',
            'Progress_Meters','',
            ),

'htmlelem'=>array(
            '2.7 Ajout d\'éléments HTML',
            array('Alain B.'=> '07/02/2004', 'Alain B.'=> '04/04/2007'),
            'progress','springs',
            'Adding_HTML_Elements','',
            ),

'springs' =>array(
            '2.8 Utilisation des spacers',
            array('Alain B.'=> '07/02/2004', 'Alain B.'=> '04/04/2007'),
            'htmlelem','advbtns',
            'Using_Spacers','',
            ),

'advbtns' =>array(
            '2.9 Plus de caractéristiques sur les boutons',
            array('Alain B.'=>'08/02/2004', 'Alain B.'=> '04/04/2007'),
            'springs','boxes',
            'More_Button_Features','',
            ),

'boxes'   =>array(
            '3.1 Le modèle de boîte',
            array('Benoit Salandre'=>'04/04/2004', 'Alain B.'=> '04/04/2007') ,
            'advbtns','boxstyle',
            'The_Box_Model','',
            ),

'boxstyle'=>array(
            '3.2 Positionnement d\'éléments de fenêtres',
            array('Jean Pascal Milcent'=> '25/02/2004', 'Alain B.'=> '04/04/2007') ,
            'boxes','boxdet',
            'Element_Positioning','',
            ),

'boxdet'  =>array(
            '3.3 Détails sur le modèle de boîte',
            array('Damien Hardy'=> '27/02/2004', 'Alain B.'=> '04/04/2007') ,
            'boxstyle','titledbox',
            'Box_Model_Details','',
            ),

'titledbox'=>array(
            '3.4 Les boîtes de groupe',
            array('Laurent Jouanneau'=> '13/03/2004', 'Alain B.'=> '04/04/2007') ,
            'boxdet','boxfinal',
            'Groupboxes','',
            ),

'boxfinal' =>array(
            '3.5 Ajouter plus d\'éléments',
            array('Laurent Jouanneau'=>'24/03/2004', 'Alain B.'=> '04/04/2007') ,
            'titledbox','stacks',
            'Adding_More_Elements','',
            ),

'stacks'   =>array(
            '4.1 Piles et Paquets',
            array('Alain B.'=> '14/02/2004', 'Alain B.'=> '04/04/2007'),
            'boxfinal','bulletins',
            'Stacks_and_Decks','',
            ),

'bulletins'=>array(
            '4.2 Positionnement dans une pile',
            array('Alain B.'=> '15/02/2004', 'Alain B.'=> '04/04/2007'),
            'stacks','tabpanel',
            'Stack_Positioning','',
            ),

'tabpanel' =>array(
            '4.3 Onglets',
            array('Alain B.'=> '18/02/2004', 'Alain B.'=> '04/04/2007'),
            'bulletins','grids',
            'Tabboxes','',
            ),

'grids'    =>array(
            '4.4 Grilles',
            array('Alain B.'=> '14/04/2004', 'Alain B.'=>'09/07/2005', 'Alain B.'=> '04/04/2007'),
            'tabpanel','cpanels',
            'Grids','',
            ),

'cpanels'  =>array(
            '4.5 Cadres de contenu',
            array('Alain B.'=> '19/02/2004', 'Gerard L.'=>'26/03/2005', 'Alain B.'=> '04/04/2007'),
            'grids','splitter',
            'Content_Panels','',
            ),

'splitter' =>array(
            '4.6 Séparateurs',
            array('Alain B.'=> '20/02/2004', 'Alain B.'=> '04/04/2007'),
            'cpanels','scroll',
            'Splitters','',
            ),

'scroll'   =>array(
            '4.7 Barres de défilement',
            array('Alain B.'=> '09/02/2004', 'Alain B.'=> '04/04/2007'),
            'splitter','toolbar',
            'Scroll_Bars','',
            ),

'toolbar' =>array(
            '5.1 Barres d\'outils',
            array('Alain B.'=> '19/02/2004', 'Alain B.'=> '04/04/2007'),
            'scroll','menubar',
            'Toolbars','',
            ),

'menubar' =>array(
            '5.2 Barres de menu simples',
            array('Vincent S.'=> '17/03/2004', 'Alain B.'=> '04/04/2007'),
            'toolbar','advmenu',
            'Simple_Menu_Bars','',
            ),

'advmenu' =>array(
            '5.3 Plus de fonctionnalités de menu',
            array('Vincent S.'=> '27/03/2004', 'Alain B.'=> '04/04/2007'),
            'menubar','popups',
            'More_Menu_Features','',
            ),

'popups'  =>array(
            '5.4 Menus surgissants',
            array('Vincent S.'=> '01/04/2004', 'Alain B.'=> '04/04/2007'),
            'advmenu','menuscroll',
            'Popup_Menus','',
            ),

'menuscroll' =>array(
            '5.5 Menus défilants',
            array('Vincent S.'=> '13/04/2004', 'Alain B.'=> '04/04/2007'),
            'popups','events',
            'Scrolling_Menus','',
            ),

'events'=>array(
            '6.1 Ajout de gestionnaires d\'évènements',
            array('Durandal'=>'18/07/2004', 'Julien Appert'=>'15/06/2005', 'Alain B.'=> '04/04/2007'),
            'menuscroll','advevents',
            'Adding_Event_Handlers','',
            ),
'advevents'=>array(
            '6.2 Plus sur les gestionnaires d\'évènements',
            array('Alain B.'=>'17/04/2005', 'Alain B.'=> '04/04/2007'),
            'events','keyshort',
            'More_Event_Handlers','',
            ),
'keyshort'=>array(
            '6.3 Raccourcis clavier',
            array('Chaddaï Fouché'=>'19/07/2004','Cyril Trumpler'=>'18/04/2005', 'Alain B.'=> '04/04/2007'),
            'advevents','focus',
            'Keyboard_Shortcuts','',
            ),
'focus'=>array(
            '6.4 Focus et Selection',
            array('Adrien Bustany'=>'19/07/2004', 'Cyril trumpler'=>'15/04/2005', 'Alain B.'=> '04/04/2007'),
            'keyshort','commands',
            'Focus_and_Selection','',
            ),
'commands'=>array(
            '6.5 Commandes',
            array('Laurent Jouanneau'=>'15/11/2004', 'Alain B.'=> '04/04/2007'),
            'focus','commandupdate',
            'Commands','',
            ),
'commandupdate'=>array(
            '6.6 Mise à jour de commandes',
            array('Nadine Henry'=>'20/07/04', 'Alain B.'=> '04/04/2007'),
            'commands','broadob',
            'Updating Commands','',
            ),
'broadob'=>array(
            '6.7 Broadcasters et Observateurs',
            array('BrainBooster'=>'20/07/2004', 'Alain B.'=> '04/04/2007'),
            'commandupdate','dom',
            'Broadcasters_and_Observers','',
            ),

'dom'=>array(
            '7.1 Document Object Model',
            array('Chaddaï Fouché'=>'19/07/2004', 'Julien Appert'=>'17/06/2005', 'Alain B.'=> '04/04/2007'),
            'broadob','dommodify',
            'Document_Object_Model','',
            ),
'dommodify'=>array(
            '7.2 Modification d\'une interface XUL',
            array('Alain B. et Paul Rouget'=>'01/07/2005', 'Alain B.'=> '04/04/2007'),
            'dom','domlists',
            'Modifying_a_XUL_Interface','',
            ),
'domlists'=>array(
            '7.3 Manipulation de listes',
            array('Romain D.'=>'25/04/2005', 'Alain B.'=> '04/04/2007'),
            'dommodify','boxobject',
            'Manipulating_Lists','',
            ),
'boxobject'=>array(
            '7.4 Les objets boîtes',
            array('Alain B.'=>'06/05/2005', 'Alain B.'=> '04/04/2007'),
            'domlists','xpcom',
            'Box_Objects','',
            ),
'xpcom'=>array(
            '7.5 Interfaces XPCOM',
            array('Maximilien'=>'24/07/2004', 'Alain B.'=> '04/04/2007'),
            'boxobject','xpcomex',
            'XPCOM_Interfaces','',
            ),
'xpcomex'=>array(
            '7.6 Exemples XPCOM',
            array('Maximilien'=>'24/07/2004', 'Alain B.'=> '04/04/2007'),
            'xpcom','clipboard',
            'XPCOM_Examples','',
            ),
'clipboard'=>array(
            '7.7 Utilisation du presse-papiers',
            array('Nadine Henry'=>'22/07/2004', 'Alain B.'=> '04/04/2007'),
            'xpcomex','dragdrop',
            '','',
            ),
'dragdrop'=>array(
            '7.8 Glisser-Déposer',
            array('Gabriel de Perthuis'=>'27/07/2004', 'Alain B.'=> '04/04/2007'),
            'clipboard','dragwrap',
            '','',
            ),
'dragwrap'=>array(
            '7.9 Conteneur JavaScript pour le Glisser-Déposer',
            array('Laurent Jouanneau'=>'11/11/2004', 'Alain B.'=> '04/04/2007'),
            'dragdrop','dragex',
            '','',
            ),
'dragex'=>array(
            '7.10 Exemple Drag and Drop',
            array('Laurent Jouanneau'=>'11/11/2004', 'Alain B.'=> '04/04/2007'),
            'dragwrap','trees',
            '','',
            ),


'trees' =>array(
            '8.1 Arbres',
            array('Damien Hardy'=> '10/04/2004', 'Alain B.'=>'08/07/2005', 'Alain B.'=> '04/04/2007'),
            'dragex','advtrees',
            'Trees','',
            ),
'advtrees' =>array(
            '8.2 Autres caractéristiques des arbres',
            array('Laurent Jouanneau'=> '24/06/2004', 'Gerard L.'=>'25/03/2005', 'Alain B.'=> '04/04/2007'),
            'trees','seltree',
            'More_Tree_Features','',
            ),
'seltree'=>array(
            '8.3 Selection dans les arbres',
            array('Medspx'=>'17/07/2004', 'Alain B.'=>'03/07/2005', 'Alain B.'=> '04/04/2007'),
            'advtrees','treeview',
            'Tree_Selection','',
            ),
'treeview'=>array(
            '8.4 Vues d\'arbre personnalisées',
            array('Chaddaï Fouché'=>'20/07/2004', 'Alain B.'=>'08/07/2005', 'Alain B.'=> '04/04/2007'),
            'seltree','treeviewdet',
            'Custom_Tree_Views','',
            ),

'treeviewdet'=>array(
            '8.5 Détails sur les vues d\'arbres',
            array('Romain D.'=>'03/05/2005', 'Alain B.'=> '04/04/2007'),
            'treeview','treeboxobject',
            'Tree_View_Details','',
            ),
'treeboxobject'=>array(
            '8.6 Les objets boîtes des arbres',
            array('Alain B.'=>'15/06/2005', 'Alain B.'=> '04/04/2007'),
            'treeviewdet','intrordf',
            'Tree_Box_Objects','',
            ),


'intrordf' =>array(
            '9.1 Introduction à RDF',
            array('Vincent S.'=> '08/06/2004', 'Alain B.'=> '04/04/2007'),
            'treeboxobject','templates',
            'Introduction_to_RDF','',
            ),
'templates' =>array(
            '9.2 Gabarits',
            array('Laurent Jouanneau'=> '12/08/2004', 'Alain B.'=> '04/04/2007'),
            'intrordf','templateex',
            'Templates','',
            ),
'templateex' =>array(
            '9.2bis Exemples de syntaxe de gabarits',
            array('Alain B.'=> '11/09/2004', 'Alain B.'=> '04/04/2007'),
            'templates','treetempl',
            '','',
            ),
'treetempl'=>array(
            '9.3 Arbres et Gabarits',
            array('Cyril Delalande et Laurent Jouanneau'=>'15/08/2004', 'Alain B.'=> '04/04/2007'),
            'templateex','datasrc',
            'Trees_and_Templates','',
            ),
'datasrc'=>array(
            '9.4 Sources de données RDF',
            array('Caffeine'=>'16/07/2004', 'Alain B.'=> '04/04/2007'),
            'treetempl','advrules',
            'RDF_Datasources','',
            ),
'advrules'=>array(
            '9.5 Règles avançées',
            array('Julien Etaix'=>'22/07/2004', 'Alain B.'=> '04/04/2007'),
            'datasrc','persist',
            'Advanced_Rules','',
            ),
'persist' =>array(
            '9.6 Données persistantes',
            array('Alain B.'=> '20/02/2004', 'Alain B.'=> '04/04/2007'),
            'advrules','style',
            'Persistent_Data','',
            ),

'style'=>array(
            '10.1 Ajouter des feuilles de styles',
            array('Dkoo'=>'19/07/2004', 'Alain B.'=> '04/04/2007'),
            'persist','treestyle',
            'Adding_Style_Sheets','',
            ),
'treestyle'=>array(
            '10.2 Styler un arbre',
            array('Durandal'=>'13/08/2004', 'Alain B.'=> '04/04/2007'),
            'style','defskin',
            'Styling_a_Tree','',
            ),
'defskin'=>array(
            '10.3 Modification du thème par défaut',
            array('Durandal'=>'21/07/2004', 'Alain B.'=> '04/04/2007'),
            'treestyle','cskin',
            'Modifying_the_Default_Skin','',
            ),
'cskin'=>array(
            '10.4 Créer un thème',
            array('Durandal'=>'29/07/2004', 'Alain B.'=> '04/04/2007'),
            'defskin','locale',
            'Creating_a_Skin','',
            ),
'locale'=>array(
            '10.5 Localisation',
            array('BrainBooster'=>'22/07/2004', 'Alain B.'=> '04/04/2007'),
            'cskin','locprops',
            'Localization','',
            ),
'locprops'=>array(
            '10.6 Les fichiers de propriétés',
            array('Sylvain Costard'=>'21/07/2004', 'Alain B.'=> '04/04/2007'),
            'locale','introxbl',
            'Property_Files','',
            ),


'introxbl'=>array(
            '11.1 Introduction à XBL',
            array('Nadine Henry'=>'24/07/2004', 'Alain B.'=> '04/04/2007'),
            'locprops','xblcontent',
            'Introduction_to_XBL','',
            ),
'xblcontent'=>array(
            '11.2 Contenu anonyme',
            array('Nadine Henry'=>'27/07/2004', 'Alain B.'=> '04/04/2007'),
            'introxbl','xblatin',
            'Anonymous_Content','',
            ),
'xblatin'=>array(
            '11.3 Héritage d\'attributs XBL',
            array('Cyril Cheneson'=>'15/08/2004', 'Alain B.'=> '04/04/2007'),
            'xblcontent','xblprops',
            'XBL_Attribute_Inheritance','',
            ),
'xblprops'=>array(
            '11.4 Ajout de propriétés',
            array('Nadine Henry'=>'13/08/2004', 'Alain B.'=> '04/04/2007'),
            'xblatin','xblmethods',
            'Adding_Properties','',
            ),
'xblmethods'=>array(
            '11.5 Ajout de méthodes',
            array('Nadine Henry'=>'18/08/2004', 'Alain B.'=> '04/04/2007'),
            'xblprops','xblinherit',
            'Adding_Methods','',
            ),
'xblevents'=>array(
            '11.6 Ajout de gestionnaire d\'évènements',
            array('Nadine Henry'=>'24/08/2004', 'Alain B.'=> '04/04/2007'),
            'xblmethods','xblinherit',
            'Adding_Event_Handlers','',
            ),
'xblinherit'=>array(
            '11.7 Héritage XBL',
            array('Nadine Henry'=>'17/09/2004', 'Alain B.'=> '04/04/2007'),
            'xblevents','xblex',
            'XBL_Inheritance','',
            ),
'xblex'=>array(
            '11.8 Exemple XBL',
            array('Nadine Henry'=>'17/09/2004', 'Laurent Jouanneau'=>'20/09/2004', 'Alain B.'=> '04/04/2007'),
            'xblinherit','featwin',
            'XBL_Example','',
            ),

'featwin' =>array(
            '12.1 Caractéristiques d\'une fenêtre',
            array('Julien Appert'=> '16/05/2004', 'Alain B.'=> '04/04/2007'),
            'xblex','dialogs',
            'Features_of_a_Window','',
            ),
'dialogs' =>array(
            '12.2 Créer des boîtes de dialogues',
            array('Durandal'=> '06/07/2004', 'Alain B.'=> '04/04/2007'),
            'featwin','filedialog',
            'Creating_Dialogs','',
            ),
'filedialog'=>array(
            '12.3 Boîte de dialogue de fichiers',
            array('Cyril Cheneson'=>'28/07/2004', 'Alain B.'=> '04/04/2007'),
            'dialogs','wizard',
            'Open_and_Save_Dialogs','',
            ),
'wizard'=>array(
            '12.4 Creation d\'un assistant',
            array('Laurent Jouanneau'=>'15/11/2004', 'Alain B.'=> '04/04/2007'),
            'filedialog','advwiz',
            'Creating_a_Wizard','',
            ),
'advwiz'=>array(
            '12.5 Assistant avançé',
            array('Damien Hardy'=>'25/07/2004', 'Alain B.'=> '04/04/2007'),
            'wizard','overlay',
            'More_Wizards','',
            ),
'overlay'=>array(
            '12.6 Overlays',
            array('Alain B.'=>'24/07/2004', 'Alain B.'=> '04/04/2007'),
            'advwiz','crosspov',
            'Overlays','',
            ),
'crosspov'=>array(
            '12.7 Overlays inter-paquetage',
            array('Alain B.'=>'25/07/2004', 'Alain B.'=> '04/04/2007'),
            'overlay','xpinstall',
            'Cross_Package_Overlays','',
            ),

'xpinstall' =>array(
            '13.1 Création d\'un programme d\'installation',
            array('Alain B.'=> '01/03/2004', 'Alain B.'=> '04/04/2007'),
            'crosspov','xpiscript',
            'Creating_an_Installer','',
            ),
'xpiscript' =>array(
            '13.2 Les scripts d\'installation',
            array('Alain B.'=> '14/03/2004', 'Alain B.'=> '04/04/2007'),
            'xpinstall','xpiadv',
            'Install_Scripts','',
            ),
'xpiadv' =>array(
            '13.3 Fonctions additionnelles d\'installation',
            array('Alain B.'=> '17/03/2004', 'Alain B.'=> '04/04/2007'),
            'xpiscript','',
            'Additional_Install_Features','',
            )

);


?>