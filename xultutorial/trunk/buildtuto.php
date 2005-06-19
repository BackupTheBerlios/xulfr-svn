<?php
/**
 * Script de génération des pages du tutoriel
 * en ligne de commande, :
 *    php buildtuto.php
 */

/**
 * liste des articles.
 * clé de chaque article = nom du fichier original sans le .html
 * tableau :
 *    1 : titre de l'article
 *    2 : tableau (auteur original=>date, correcteur/mainteneur=>date)
 *    3 : clé de l'article précédent
 *    4 : clé de l'article suivant
 */

$article_list=array(

 'index'    =>array('XUL Tutorial de XulPlanet.com',                    array('différents contributeurs de xulfr.org'=>'') ,'',''),
 'intro'    =>array('1.1 Introduction',                                 array('Tristan Rivoallan'=>'25/02/2004', 'Laurent Jouanneau'=>'17/11/2004') ,'','xulfile'),
 'xulfile'  =>array('1.2 La structure XUL',                             array('Gérard L.'=>'22/11/2003', 'Laurent Jouanneau'=>'20/11/2004') ,'intro','chromeurl'),
 'chromeurl'=>array('1.3 L\'Url Chrome',                                array('Romain D.'=>'11/02/2004',  'Laurent Jouanneau'=>'22/11/2004')  ,'xulfile','packaging'),
 'packaging'=>array('1.4 Les fichiers contents.rdf',                    array('Benoit Salandre'=>'08/02/2004',  'Laurent Jouanneau'=>'23/11/2004'),'chromeurl','window'),

 'window'  =>array('2.1 Créer une fenêtre',                             array('Gnunux'=> '14/11/2003' )             ,'packaging','buttons'),
 'buttons' =>array('2.2 Ajouter des boutons',                           array('Gnunux'=> '14/11/2003')            ,'window','textimage'),
 'textimage' =>array('2.3 Ajouter des libéllés et des images',          array('Laurent Jouanneau'=> '10/03/2004')  ,'buttons','inputs'),
 'inputs'  =>array('2.4 Les champs de saisie',                          array('Benoit Salandre'=> '14/01/2004')    ,'textimage','lists'),
 'lists'   =>array('2.5 Les contrôles de listes',                       array('Alain B.'=> '06/02/2004')    ,'inputs','progress'),
     'progress' =>array('2.6 Indicateurs de progression',                   array('Alain B.'=> '08/02/2004'),'lists','htmlelem'),
 'htmlelem'=>array('2.7 Ajout d\'éléments HTML',                        array('Alain B.'=> '07/02/2004')    ,'progress','springs'),
 'springs' =>array('2.8 Utilisation des spacers',                       array('Alain B.'=> '07/02/2004') ,'htmlelem','advbtns'),
 'advbtns' =>array('2.9 Plus de caractéristiques sur les boutons',      array('Alain B.'=>'08/02/2004') ,'springs','boxes'),

 'boxes' =>array('3.1 Le modèle de boîte',                              array('Benoit Salandre'=>'04/04/2004') ,'advbtns','boxstyle'),
 'boxstyle' =>array('3.2 Positionnement d\'éléments de fenêtres',       array('Jean Pascal Milcent'=> '25/02/2004') ,'boxes','boxdet'),
 'boxdet' =>array('3.3 Détails sur le modèle de boîte',                 array('Damien Hardy'=> '27/02/2004') ,'boxstyle','titledbox'),
 'titledbox' =>array('3.4 Les boîtes de groupe',                        array('Laurent Jouanneau'=> '13/03/2004') ,'boxdet','boxfinal'),
 'boxfinal' =>array('3.5 Ajouter plus d\'éléments',                     array('Laurent Jouanneau'=>'24/03/2004') ,'titledbox','stacks'),

 'stacks' =>array('4.1 Piles et Paquets',                               array('Alain B.'=> '14/02/2004'),'boxfinal','bulletins'),
 'bulletins' =>array('4.2 Positionnement dans une pile',                array('Alain B.'=> '15/02/2004'),'stacks','tabpanel'),
 'tabpanel' =>array('4.3 Onglets',                                      array('Alain B.'=> '18/02/2004'),'bulletins','grids'),
     'grids' =>array('4.4 Grilles',                                         array('Alain B.'=> '14/04/2004'),'tabpanel','cpanels'),
 'cpanels' =>array('4.5 Cadres de contenu',                             array('Alain B.'=> '19/02/2004', 'Gerard L.'=>'26/03/2005'),'grids','splitter'),
 'splitter' =>array('4.6 Séparateurs',                                  array('Alain B.'=> '20/02/2004'),'cpanels','scroll'),
 'scroll' =>array('4.7 Barres de défilement',                           array('Alain B.'=> '09/02/2004'),'splitter','toolbar'),

     'toolbar' =>array('5.1 Barres d\'outils',                              array('Alain B.'=> '19/02/2004'),'scroll','menubar'),
 'menubar' =>array('5.2 Barres de menu simples',                        array('Vincent S.'=> '17/03/2004'),'toolbar','advmenu'),
 'advmenu' =>array('5.3 Plus de fonctionnalités de menu',               array('Vincent S.'=> '27/03/2004'),'menubar','popups'),
 'popups' =>array('5.4 Menus surgissants',                              array('Vincent S.'=> '01/04/2004'),'advmenu','menuscroll'),
 'menuscroll' =>array('5.5 Menus défilants',                            array('Vincent S.'=> '13/04/2004'),'popups','events'),

    'events'=>array('6.1 Ajout de gestionnaires d\'évènements',            array('Durandal'=>'18/07/2004', 'Julien Appert'=>'15/06/2005'),'menuscroll','advevents'),
        'advevents'=>array('6.2 Plus sur les gestionnaires d\'évènements',     array('Alain B.'=>'17/04/2005'),'events','keyshort'),
 'keyshort'=>array('6.3 Raccourcis clavier',                            array('Chaddaï Fouché'=>'19/07/2004','Cyril Trumpler'=>'18/04/2005'),'advevents','focus'),
 'focus'=>array('6.4 Focus et Selection',                               array('Adrien Bustany'=>'19/07/2004', 'Cyril trumpler'=>'15/04/2005'),'keyshort','commands'),
    'commands'=>array('6.5 Commandes',                                     array('Laurent Jouanneau'=>'15/11/2004'),'focus','commandupdate'),
    'commandupdate'=>array('6.6 Mise à jour de commandes',                 array('Nadine Henry'=>'20/07/04'),'commands','broadob'),
    'broadob'=>array('6.7 Broadcasters et Observateurs',                   array('BrainBooster'=>'20/07/2004'),'commandupdate','dom'),

    'dom'=>array('7.1 Document Object Model',                              array('Chaddaï Fouché'=>'19/07/2004', 'Julien Appert'=>'17/06/2005'),'broadob','dommodify'),
        'dommodify'=>array('7.2 Modification d\'une interface XUL',     array(''=>''),'dom','domlists'),
        'domlists'=>array('7.3 Manipulation de listes',                 array('Romain D.'=>'25/04/2005'),'dommodify','boxobject'),
        'boxobject'=>array('7.4 Les objets boîtes',                     array('Alain B.'=>'06/05/2005'),'domlists','xpcom'),
    'xpcom'=>array('7.5 Interfaces XPCOM',                                 array('Maximilien'=>'24/07/2004'),'boxobject','xpcomex'),
    'xpcomex'=>array('7.6 Exemples XPCOM',                                 array('Maximilien'=>'24/07/2004'),'xpcom','clipboard'),
    'clipboard'=>array('7.7 Utilisation du presse-papiers',                array('Nadine Henry'=>'22/07/2004'),'xpcomex','dragdrop'),
    'dragdrop'=>array('7.8 Glisser-Déposer',                               array('Gabriel de Perthuis'=>'27/07/2004'),'clipboard','dragwrap'),
    'dragwrap'=>array('7.9 Conteneur JavaScript pour le Glisser-Déposer',  array('Laurent Jouanneau'=>'11/11/2004'),'dragdrop','dragex'),
    'dragex'=>array('7.10 Exemple Drag and Drop',                           array('Laurent Jouanneau'=>'11/11/2004'),'dragwrap','trees'),


 'trees' =>array('8.1 Arbres',                                          array('Damien Hardy'=> '10/04/2004'),'xpcomex','advtrees'),
 'advtrees' =>array('8.2 Autres caractéristiques des arbres',           array('Laurent Jouanneau'=> '24/06/2004', 'Gerard L.'=>'25/03/2005'),'trees','seltree'),
 'seltree'=>array('8.3 Selection dans les arbres',                      array('Medspx'=>'17/07/2004'),'advtrees','treeview'),
 'treeview'=>array('8.4 Vues d\'arbre personnalisées',                  array('Chaddaï Fouché'=>'20/07/2004'),'seltree','treeviewdet'),
        'treeviewdet'=>array('8.5 Détails sur les vues d\'arbres',     array('Romain D.'=>'03/05/2005'),'treeview','treeboxobject'),
        'treeboxobject'=>array('8.6 Les objets boîtes des arbres',     array('Alain B.'=>'15/06/2005'),'treeviewdet','intrordf'),


 'intrordf' =>array('9.1 Introduction à RDF',                           array('Vincent S.'=> '08/06/2004'),'treeboxobject','templates'),
 'templates' =>array('9.2 Gabarits',                                    array('Laurent Jouanneau'=> '12/08/2004'),'intrordf','templateex'),
 'templateex' =>array('9.2bis Exemples de syntaxe de gabarits',         array('Alain B.'=> '11/09/2004'),'templates','treetempl'),
 'treetempl'=>array('9.3 Arbres et Gabarits',                           array('Cyril Delalande et Laurent Jouanneau'=>'15/08/2004'),'templateex','datasrc'),
 'datasrc'=>array('9.4 Sources de données RDF',                         array('Caffeine'=>'16/07/2004'),'treetempl','advrules'),
 'advrules'=>array('9.5 Règles avançées',                               array('Julien Etaix'=>'22/07/2004'),'datasrc','persist'),
     'persist' =>array('9.6 Données persistantes',                          array('Alain B.'=> '20/02/2004'),'advrules','style'),

 'style'=>array('10.1 Ajouter des feuilles de style',                    array('Dkoo'=>'19/07/2004'),'persist','treestyle'),
 'treestyle'=>array('10.2 Styler un arbre',                              array('Durandal'=>'13/08/2004'),'style','defskin'),
 'defskin'=>array('10.3 Modification du thème par défaut',               array('Durandal'=>'21/07/2004'),'treestyle','cskin'),
 'cskin'=>array('10.4 Créer un thème',                                   array('Durandal'=>'29/07/2004'),'defskin','locale'),
 'locale'=>array('10.5 Localisation',                                    array('BrainBooster'=>'22/07/2004'),'cskin','locprops'),
 'locprops'=>array('10.6 Les fichiers de propriétés',                    array('Sylvain Costard'=>'21/07/2004'),'locale','introxbl'),


 'introxbl'=>array('11.1 Introduction à XBL',                           array('Nadine Henry'=>'24/07/2004'),'locprops','xblcontent'),
 'xblcontent'=>array('11.2 Contenu anonyme',                            array('Nadine Henry'=>'27/07/2004'),'introxbl','xblatin'),
 'xblatin'=>array('11.3 Héritage d\'attributs XBL',                     array('Cyril Cheneson'=>'15/08/2004'),'xblcontent','xblprops'),
 'xblprops'=>array('11.4 Ajout de propriétés',                          array('Nadine Henry'=>'13/08/2004'),'xblatin','xblmethods'),
 'xblmethods'=>array('11.5 Ajout de méthodes',                          array('Nadine Henry'=>'18/08/2004'),'xblprops','xblinherit'),
 'xblevents'=>array('11.6 Ajout de gestionnaire d\'évènements',         array('Nadine Henry'=>'24/08/2004'),'xblmethods','xblinherit'),
 'xblinherit'=>array('11.7 Héritage XBL',                               array('Nadine Henry'=>'17/09/2004'),'xblevents','xblex'),
 'xblex'=>array('11.8 Exemple XBL',                                     array('Nadine Henry'=>'17/09/2004', 'Laurent Jouanneau'=>'20/09/2004'),'xblinherit','featwin'),

 'featwin' =>array('12.1 Caractéristiques d\'une fenêtre',              array('Julien Appert'=> '16/05/2004'),'xblex','dialogs'),
 'dialogs' =>array('12.2 Créer des boîtes de dialogues',                array('Durandal'=> '06/07/2004'),'featwin','filedialog'),
 'filedialog'=>array('12.3 Boîte de dialogue de fichiers',              array('Cyril Cheneson'=>'28/07/2004'),'dialogs','wizard'),
 'wizard'=>array('12.4 Creation d\'un assistant',                       array('Laurent Jouanneau'=>'15/11/2004'),'filedialog','advwiz'),
 'advwiz'=>array('12.5 Assistant avançé',                               array('Damien Hardy'=>'25/07/2004'),'wizard','overlay'),
 'overlay'=>array('12.6 Overlays',                                      array('Alain B.'=>'24/07/2004'),'advwiz','crosspov'),
 'crosspov'=>array('12.7 Overlays inter-paquetage',                     array('Alain B.'=>'25/07/2004'),'overlay','xpinstall'),

 'xpinstall' =>array('13.1 - Création d\'un programme d\'installation', array('Alain B.'=> '01/03/2004'),'crosspov','xpiscript'),
 'xpiscript' =>array('13.2 - Les scripts d\'installation',              array('Alain B.'=> '14/03/2004'),'xpinstall','xpiadv'),
 'xpiadv' =>array('13.3 - Fonctions additionnelles d\'installation',          array('Alain B.'=> '17/03/2004'),'xpiscript','')

);

foreach($article_list as $basename => $article){

   list($page_chapitre, $auteurs, $prev, $next)
      = $article_list[$basename];

    if($basename != 'index'){
        $header_links='
        <link rel="up"   href="index.html" title="Sommaire" />
        <link rel="chapter" href="index.html" title="Tutoriel XUL principal" />
        ';



        if($prev != '')
            $header_links.='<link rel="prev" href="'.$prev.'.html" title="'.$article_list[$prev][0].'" />'."\n";
        if($next != '')
            $header_links.='<link rel="next" href="'.$next.'.html" title="'.$article_list[$next][0].'" />'."\n";

        reset($article_list);
        $first=current($article_list);
        if($basename !=key($article_list))
            $header_links.='<link rel="first" href="'.key($article_list).'.html" title="'.$first[0].'" />'."\n";

        $last=end($article_list);
        if($basename !=key($article_list))
            $header_links.='<link rel="last" href="'.key($article_list).'.html" title="'.$last[0].'" />'."\n";

        $page_traduction_auteur='';
        foreach($auteurs as $auteur=>$datetraduc){
            $page_traduction_auteur.=', '.$auteur;

        }
        $page_traduction_auteur=substr($page_traduction_auteur,2);

    }
 ob_start();

    ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
   <meta http-equiv="Content-Script-Type" content="text/javascript" />
   <meta http-equiv="Content-Style-Type" content="text/css" />
   <meta name="author" content="Neil Deakin, traduit par <?php echo $page_traduction_auteur?>" />
   <meta name="description" content="tutoriel XUL de Xulplanet : <?php echo $page_chapitre?>" />


<!--*headinfo*-->
<?php  if($basename != 'index'){ ?>
   <title><?php echo $page_chapitre?>, tutoriel XUL - xulfr.org/xulplanet.com</title>
   <link rel="up"   href="index.html" title="Sommaire" />
<?php
    echo $header_links;
}else{
    echo '<title>', $page_chapitre, '</title> ';
}?>

   <link rel="stylesheet" type="text/css" href="main.css" media="screen" />
   <link rel="stylesheet" type="text/css" href="print.css" media="print" />
</head>
<body>
<div id="bandeau">
    <p><img src="xulfr_logo.png" alt="xulfr.org" /></p>
<!--*access*-->
</div>
<div id="principal">
    <div id="contenu">

<h1><?php echo $page_chapitre?></h1>
<div class="contenuinfo">
<?php  if($basename != 'index'){ ?>
    <ul class="navlinks">
    <?php
    if($next != ''){
        ?>
            <li><a class="nextlink" title="<?php echo $article_list[$next][0]?>" href="<?php echo $next?>.html">Suivant</a></li>

        <?php
    }
    if($prev != ''){
        ?>    <li><a class="prevlink" title="<?php echo $article_list[$prev][0]?>" href="<?php echo $prev?>.html">Précédent</a></li>

        <?php
    }
    ?>


    <li><a class="index" href="index.html">Sommaire</a></li>
    </ul>
    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.


    <?php
    $firstaut=true;
    $secondaut=true;
    foreach($auteurs as $auteur=>$dateaut){
        if($firstaut){
            echo 'Traduit par <strong>',$auteur ,'</strong> (',$dateaut,')';
            $firstaut=false;
        }else{
            if($secondaut){
                echo ', mise à jour par ', $auteur,' (',$dateaut,') ';
            }else
              echo ', ',$auteur ,' (',$dateaut,') ';
       }
   }
   ?>.
   <br />
    Page originale&nbsp;:
    <a href="http://www.xulplanet.com/tutorials/xultu/<?php echo $basename?>.html">http://www.xulplanet.com/tutorials/xultu/<?php echo $basename?>.html</a>
    <a href="http://www.xulplanet.com/"><img src="xulplanet_little.png" alt="xulplanet.com" style="vertical-align:middle"/></a>
    </p>

<?php }else{ ?>
    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.

    Traduit par différents <a href="#contributeurs">contributeurs de xulfr.org</a>.</p>
    <p>Original&nbsp;: <a href="http://www.xulplanet.com/tutorials/xultu/">http://www.xulplanet.com/tutorials/xultu/</a>.</p>
<?php }?>

</div>
<?php
$header = ob_get_contents();
ob_clean();

ob_start();
?>
<?php  if($basename != 'index'){ ?>
<div class="contenuinfo">

<ul class="navlinks">
    <?php
    if($next != ''){
        ?>
            <li><a class="nextlink" title="<?php echo $article_list[$next][0]?>" href="<?php echo $next?>.html">Suivant</a></li>

        <?php
    }
    if($prev != ''){
        ?>    <li><a class="prevlink" title="<?php echo $article_list[$prev][0]?>" href="<?php echo $prev?>.html">Précédent</a></li>

        <?php
    }
    ?>

    <li><a class="index" href="index.html">Sommaire</a></li>
</ul>
</div>
<?php } ?>
</div>
<!--*navbox*-->

</div>
<!--*footer*-->
</body>
</html>
<?php
$footer = ob_get_contents();
ob_clean();


    $page_url_from='src/'.$basename.'.html';
    //$page_url_to='builds/'.$basename.'.html';
    $page_url_to='../../../../www/xulplanet/xultu_cvs/'.$basename.'.html';
    $file = implode('',file($page_url_from));

    if($basename == 'index'){
        $file = str_replace("@@DATE_MISEAJOUR@@", date("d/m/Y"),$file);
    }


    $file = $header . $file . $footer;

    $fp=fopen($page_url_to, 'w');
    fwrite($fp,$file);
    fclose($fp);
    chmod($page_url_to, 0666);

}

?>