<?php
/* Script de construction des pages XUL Questions et exemples */

$tb = array(
  "Problèmes généraux" => array(
    "Comment masquer et montrer un élément XUL&nbsp;?" => array('fic'=>'q_hideshow', 'trad'=>array('Alain B.'=>'10/07/2005')),
    "Comment obtenir la position de la souris sur un élément&nbsp;?" => array('fic'=>'q_mousexy', 'trad'=>array('Alain B.'=>'14/07/2005')),
    "Comment accéder au contenu chargé dans un cadre iframe&nbsp;?" => array('fic'=>'q_iframe', 'trad'=>array('Alain B.'=>'14/07/2005')),
    "Comment interpréter une chaîne de caractères XUL&nbsp;?" => array('fic'=>'q_parsexul', 'trad'=>array('Alain B.'=>'14/07/2005')),
    "Comment créer un formulaire et le soumettre&nbsp;?" => array('fic'=>'q_submit', 'trad'=>array('Alain B.'=>'15/07/2005')),
    "Quelle est la manière d'afficher une simple boîte de dialogue&nbsp;?" => array('fic'=>'q_msgbox', 'trad'=>array('Alain B.'=>'15/07/2005')),
    "Comment trier du contenu&nbsp;?" => array('fic'=>'q_sorter', 'trad'=>array('Alain B.'=>'15/07/2005')),
    "Comment récupérer et modifier les préférences de Mozilla&nbsp;?" => array('fic'=>'q_prefs', 'trad'=>array('Alain B.'=>'15/07/2005'))
    ),
  "Gestion des arbres" => array(
    "Comment obtenir le texte actuellement sélectionné dans un arbre&nbsp;?" => array('fic'=>'q_treeselect', 'trad'=>array('Alain B.'=>'15/07/2005')),
    "Comment mettre des éléments arbitraires dans un arbre&nbsp;?" => array('fic'=>'q_treearbit', 'trad'=>array('Alain B.'=>'16/07/2005')),
    "Comment ajouter une image sur un treecell&nbsp;?" => array('fic'=>'q_treeimage', 'trad'=>array('Alain B.'=>'16/07/2005')),
    "Comment ajouter un indicateur de progression sur un treecell&nbsp;?" => array('fic'=>'q_treeprogress', 'trad'=>array('Alain B.'=>'17/07/2005')),
    "Exemple&nbsp;: vue d'arbre personnalisée" => array('fic'=>'q_treebview', 'trad'=>array('Alain B.'=>'17/07/2005'))
    ),
  "Chargement local ou distant XUL" => array(
    "Ai-je besoin de charger XUL à partir d'un emplacement chrome&nbsp;?" => array('fic'=>'q_chrome', 'trad'=>array('Alain B.'=>'17/07/2005')),
    "Est-ce que la sécurité XUL est différente d'un HTML&nbsp;?" => array('fic'=>'q_secure', 'trad'=>array('Alain B.'=>'17/07/2005')),
    "Comment charger XUL à partir d'un site Web&nbsp;?" => array('fic'=>'q_remotexul', 'trad'=>array('Alain B.'=>'17/07/2005')),
    "J'obtiens une erreur dans la console 'Permission refusée d'obtenir la propriété UnnamedClass'&nbsp;?" => array('fic'=>'q_pdenyucc', 'trad'=>array('Alain B.'=>'17/07/2005')),
    "Comment utiliser un arbre avec RDF stocké sur un serveur distant&nbsp;?" => array('fic'=>'q_remoterdf', 'trad'=>array('Alain B.'=>'17/07/2005'))
    ),
  "Exemples de gabarits" => array(
    "Générer une liste d'items" => array('fic'=>'q_tmpl_child-iterate', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Générer une liste d'items en utilisant une syntaxe complète" => array('fic'=>'q_tmpl_child-iterate-full', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Générer récursivement une liste d'items" => array('fic'=>'q_tmpl_child-iterate-recurse', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Générer une liste d'items en utilisant une liaison" => array('fic'=>'q_tmpl_child-iterate-binding', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Parcourir des enfants en utilisant un prédicat" => array('fic'=>'q_tmpl_predicate-iterate', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Parcourir des enfants en utilisant un prédicat et un triplet" => array('fic'=>'q_tmpl_predicate-iterate-triple', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Générer une liste d'items à partir d'arcs entrants" => array('fic'=>'q_tmpl_source-iterate-full', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Générer des items avec plusieurs chaînes concaténées" => array('fic'=>'q_tmpl_child-iterate-concatenate', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Générer des items avec des chaînes provenant de différents noeuds concaténés" => array('fic'=>'q_tmpl_descend-concatenate', 'trad'=>array('Alain B.'=>'18/07/2005')),
    "Combiner les résultats de deux listes" => array('fic'=>'q_tmpl_container-iterate-multiple', 'trad'=>array('Alain B.'=>'19/07/2005')),
    "Combiner les résultats de deux listes de prédicats" => array('fic'=>'q_tmpl_predicate-iterate-multiple', 'trad'=>array('Alain B.'=>'19/07/2005')),
    "Parcourir les éléments selon leur type" => array('fic'=>'q_tmpl_iterate-type', 'trad'=>array('Alain B.'=>'19/07/2005')),
    "Parcourir les éléments d'un noeud" => array('fic'=>'q_tmpl_parent-iterate', 'trad'=>array('Alain B.'=>'20/07/2005')),
    "Parcourir les petits fils d'un noeud" => array('fic'=>'q_tmpl_grandchild-iterate', 'trad'=>array('Alain B.'=>'20/07/2005')),
    "Générer une grille de résultats" => array('fic'=>'q_tmpl_child-cross-grid', 'trad'=>array('Alain B.'=>'20/07/2005')),
    "Générer une liste d'items en utilisant un textnode" => array('fic'=>'q_tmpl_child-iterate-textnode', 'trad'=>array('Alain B.'=>'21/07/2005')),
    "Générer un ensemble de menulists" => array('fic'=>'q_tmpl_child-recurse-menulists', 'trad'=>array('Alain B.'=>'21/07/2005')),
    "Générer un menu récursif" => array('fic'=>'q_tmpl_child-recurse-menus', 'trad'=>array('Alain B.'=>'21/07/2005')),
    "Générer un ensemble filtré de menus" => array('fic'=>'q_tmpl_child-recurse-menus-filter', 'trad'=>array('Alain B.'=>'22/07/2005')),
    "Récupérer un petit fils pour chaque enfant" => array('fic'=>'q_tmpl_iterate-onfirst', 'trad'=>array('Alain B.'=>'22/07/2005')),
    "Tester des items entre deux listes" => array('fic'=>'q_tmpl_predicate-iterate-conditional', 'trad'=>array('Alain B.'=>'22/07/2005')),
    "Parcourir les enfants dépendants d'un petit fils" => array('fic'=>'q_tmpl_grandchild-conditional', 'trad'=>array('Alain B.'=>'22/07/2005')),
    "Trouver des items d'un certain parent" => array('fic'=>'q_tmpl_predicate-iterate-conditional-parent', 'trad'=>array('Alain B.'=>'22/07/2005')),
    "Générer une liste d'items en testant la source et le type" => array('fic'=>'q_tmpl_source-iterate-type', 'trad'=>array('Alain B.'=>'22/07/2005')),
    "Générer des descendants dépendants d'un parent" => array('fic'=>'q_tmpl_descend-parentattribute', 'trad'=>array('Alain B.'=>'23/07/2005')),
    "Générer du HTML à partir d'un gabarit" => array('fic'=>'q_tmpl_html-iterate', 'trad'=>array('Alain B.'=>'23/07/2005')),
    "Générer du HTML en utilisant une syntaxe complète" => array('fic'=>'q_tmpl_html-iterate-full', 'trad'=>array('Alain B.'=>'23/07/2005')),
    "Générer une boîte de liste avec plusieurs colonnes" => array('fic'=>'q_tmpl_listbox-multicolumn-iterate', 'trad'=>array('Alain B.'=>'23/07/2005')),
    "Parcourir un arbre de deux colonnes" => array('fic'=>'q_tmpl_tree-recurse', 'trad'=>array('Alain B.'=>'23/07/2005')),
    "Parcourir un arbre d'une colonne en utilisant la source d'un triplet" => array('fic'=>'q_tmpl_tree-recurse-match', 'trad'=>array('Alain B.'=>'24/07/2005'))
    )
);

/*** Complétion auto du tableau ***/
$prev = $next = '';
$ex_chap = $ex_titre = $ex_fic = '';
foreach($tb as $chapitre=>$sections){
  foreach($sections as $titre=>$data) {
    if ($ex_fic!='') {
      $tb[$ex_chap][$ex_titre]['next'] = $data['fic'].'.html';
      $tb[$ex_chap][$ex_titre]['next_titre'] = $titre;
      $tb[$chapitre][$titre]['prev'] = $ex_fic.'.html';
      $tb[$chapitre][$titre]['prev_titre'] = $ex_titre;
    }
    $ex_chap = $chapitre;
    $ex_titre = $titre;
    $ex_fic = $data['fic'];
  }
}


$header = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
   <meta http-equiv="Content-Script-Type" content="text/javascript" />
   <meta http-equiv="Content-Style-Type" content="text/css" />
   <meta name="author" content="Neil Deakin, traduit par %s" />
   <meta name="description" content="%s" />

   <link rel="stylesheet" type="text/css" href="main.css" media="screen" />
   <link rel="stylesheet" type="text/css" href="print.css" media="print" />

<!--*headinfo*-->
   <title>%s</title>

';
$entete = '<div id="bandeau">
   <div id="logo">
      <a href="http://xulfr.org"><img src="pics/logo.png" alt="xulfr.org" /></a>
   </div>
<!--*bandeau*-->
</div>
<div id="contenu">
<div class="box">

<h1>%s</h1>
<div class="contenuinfo">
  <ul class="navlinks">
    <li><a class="nextlink"%s>Suivant</a></li>
    <li><a class="prevlink"%s>Précédent</a></li>
    <li><a class="index" href="index.html">Sommaire</a></li>
  </ul>
  <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.
    Traduit par %s.
   <br />
    Page originale&nbsp;:
    <a href="http://www.xulplanet.com/tutorials/xulqa/%s">http://www.xulplanet.com/tutorials/xulqa/%s</a>
    <a href="http://www.xulplanet.com/"><img src="xulplanet_little.png" alt="xulplanet.com" style="vertical-align:middle"/></a>
    </p>
</div>
';
$pied_page = '<div class="contenuinfo">
  <ul class="navlinks">
    <li><a class="nextlink"%s>Suivant</a></li>
    <li><a class="prevlink"%s>Précédent</a></li>
    <li><a class="index" href="index.html">Sommaire</a></li>
  </ul>
</div>
</div>
</div>
<!--*navbox*-->

<!--*footer*-->
';

/*********************************/
/*** Création de la page index ***/
/*********************************/

setlocale(LC_TIME, 'fr');

$html = sprintf($header,
   'les traducteurs de xulfr.org',
   'Questions et exemples de Xulplanet',
   'Questions et exemples - Tutoriel xulfr.org/xulplanet.com');
$html.= '</head>

<body>
<div id="bandeau">
   <div id="logo">
      <img src="pics/logo.png" alt="xulfr.org" />
   </div>
<!--*bandeau*-->
</div>
<div id="contenu">
<div class="box">
<h1>Questions et exemples</h1>
<div class="contenuinfo">
  <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.
    Traduit par <strong>l\'équipe des traducteurs de xulfr.org</strong>.
   <br />
    Page originale&nbsp;:
    <a href="http://www.xulplanet.com/tutorials/xulqa/">http://www.xulplanet.com/tutorials/xulqa/</a>
    <a href="http://www.xulplanet.com/"><img src="xulplanet_little.png" alt="xulplanet.com" style="vertical-align:middle"/></a>
    </p>
</div>

<em>Page mise à jour le '.strftime('%d %B %Y').'</em>
';
foreach($tb as $chapitre=>$sections) {
  $html.= "<p>$chapitre</p>
  <ul>\n";
  foreach($sections as $titre=>$data) {
    $fic = $data['fic'].'.html';
    if ($data['fic']=='' || !is_file('src/'.$fic))
      $html.= "    <li>$titre ('src/$fic')</li>\n";
    else
      $html.= "    <li><a href=\"$fic\">$titre</a></li>\n";
  }
  $html.= "  </ul>\n";
}
$html.= '
<h2>Contributeurs</h2>
<p id="contributeurs">Ce tutoriel a été traduit par des contributeurs au
projet de traduction de <a href="http://xulfr.org/">xulfr.org</a>.</p>
<dl>
    <dt>Coordinateur de la traduction</dt>
    <dd>Laurent Jouanneau</dd>
    <dt>Traducteurs</dt>
    <dd>Alain Boquet</dd>
    <dt>Relecteurs et correcteurs</dt>
    <dd>Alain Boquet, Laurent Jouanneau, Julien Appert.</dd>
</dl>

<h2>Éditions successives</h2>

<dl>
    <dt>19 août 2005</dt>
    <dd>Première publication du guide traduit</dd>
    <dt>5 mars 2006</dt>
    <dd>Importante relecture du tutoriel</dd>
</dl>

</div>

</div>
<!--*navbox*-->

<!--*footer*-->
</body>
</html>
';
$html = str_replace("\r","", $html);
$fp = fopen('build/index.html','w');
fwrite($fp, $html);
fclose($fp);
echo "Fichier Index créé<br />\n";

/****************************************/
/*** Création de l'ensemble des pages ***/
/****************************************/

foreach($tb as $chapitre=>$sections) {
  foreach($sections as $titre=>$data) {
    $fic = $data['fic'].'.html';
    if (is_file('src/'.$fic)) {
      $traducteurs = array();
      $traducteurs2 = array();
      foreach($data['trad'] as $trad=>$date){
         $traducteurs[] = "<strong>$trad</strong> ($date)";
         $traducteurs2[] = "$trad ($date)";
      }
      $trad = join(', ',$traducteurs);
      $html = sprintf($header,
         join(', ',$traducteurs2),
         'Questions et exemples : '.$titre,
         $chapitre.' > '.$titre);
      $html.= "</head>\n\n<body>\n";
      $html.= sprintf($entete,
         $titre,
         ($data['next']=='' ? ' style="display:none;"' : ' title="'.$data['next_titre'].'" href="'.$data['next'].'"'),
         ($data['prev']=='' ? ' style="display:none;"' : ' title="'.$data['prev_titre'].'" href="'.$data['prev'].'"'),
         $trad,
         $fic, $fic);
      $src = file('src/'.$fic);
      $src = join("", $src);
//      $src = preg_replace("/([ ,;:])XUL([ ,;:])/i", '\\1<acronym title="XUL">XUL</acronym>\\2', $src);
//      $src = preg_replace("/(templates\/)/i", 'http://localhost/xulqa/build/\\1', $src);
      $html.= $src;
      $html.= sprintf($pied_page,
         ($data['next']=='' ? ' style="display:none;"' : ' title="'.$data['next_titre'].'" href="'.$data['next'].'"'),
         ($data['prev']=='' ? ' style="display:none;"' : ' title="'.$data['prev_titre'].'" href="'.$data['prev'].'"')
      );
      $html.= "</body>\n</html>";
      $html = str_replace("\r","", $html);
      $fp = fopen('build/'.$fic,'w');
      fwrite($fp, $html);
      fclose($fp);
      echo "Création => $fic<br />\n";
    } else echo "Il manque le fichier $fic<br />\n";
  }
}
