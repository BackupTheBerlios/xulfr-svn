<?php
/**
 * Script de génération d'un unique page du tutoriel HTW
 * en vue de la création d'un livre pdf
 * 
 */

/**
 * liste des articles.
 * clé de chaque article = nom du fichier original sans le .html
 * tableau :
 *    1 : index pour http://www.xulplanet.com/ndeakin/article/<index>
 *    2 : titre de l'article
 *    3 : tableau (auteur original=>date, correcteur/mainteneur=>date)
 *    4 : clé de l'article précédent
 *    5 : clé de l'article suivant
 */

$article_chap = array(
 'index' => array('index.html' => array('', 'Comment réussir vos gabarits', array('différents contributeurs de xulfr.org'=>''))
 ),
 'Les bases des gabarits XUL' => array(
   'introduction.html'            => array('Introduction', 'Introduction', array('Laurent Jouanneau'=>'18/08/2005', 'Julien Appert'=>'02/08/2005')),
   'compilation de règles.html'   => array('Rule Compilation', 'Compilation de règles', array('Alain B.'=>'02/08/2005', 'Aurelien Tabard '=>'01/10/2005')),
   'génération de résultats.html' => array('Result Generation', 'Génération de résultats', array('Alain B.'=>'26/08/2005'))
 ),
 'La syntaxe des gabarits' => array(
   'conditions.html'                    => array('Conditions', 'Conditions', array('Alain B.'=>'27/08/2005', 'Alain B.'=>'30/08/2005')),
   'actions.html'                       => array('Actions', 'Actions', array('Alain B.'=>'31/08/2005', 'Alain B.'=>'03/09/2005')),
   'génération récursive.html'          => array('Recursive Generation', 'Génération récursive', array('Alain B.'=>'10/09/2005')),
   'exemple simple.html'                => array('Simple Example', 'Exemple simple', array('Alain B.'=>'11/09/2005')),
   'les liaisons.html'                  => array('Bindings', 'Les liaisons', array('Alain B.'=>'17/09/2005')),
   'substitution d\'attributs.html'     => array('Attribute Substitution', 'Substitution d\'attributs', array('Alain B.'=>'17/09/2005')),
   'navigation supplémentaire.html'     => array('Additional Navigation', 'Navigation supplémentaire', array('Alain B.'=>'17/09/2005', 'Alain B.'=>'17/09/2005')),
   'filtrage.html'                      => array('Filtering', 'Filtrage', array('Alain B.'=>'18/09/2005', 'Alain B.'=>'18/09/2005')),
   'contenu statique.html'              => array('Static Content', 'Contenu statique', array('Alain B.'=>'23/09/2005')),
   'syntaxe de règles simplifiées.html' => array('Simple Rule Syntax', 'Syntaxe de règles simplifiées', array('Alain B.'=>'25/09/2005', 'Alain B.'=>'25/09/2005')),
   'propriétés de conteneurs.html'      => array('Containment Properties', 'Propriétés de conteneurs', array('Alain B.'=>'27/09/2005'))
  ),
  'Règles multiples' => array(
    'règles multiples.html'                     => array('Multiple Rules', 'Règles multiples', array('Alain B.'=>'27/09/2005', 'Alain B.'=>'30/09/2005')),
    'exemple de règles multiples.html'          => array('Multiple Rule Example', 'Exemple de règles multiples', array('Alain B.'=>'30/09/2005')),
    'utilisation de gabarits récursifs.html'    => array('Using Recursive Templates', 'Utilisation de gabarits récursifs', array('Alain B.'=>'30/09/2005', 'Alain B.'=>'01/10/2005')),
    'tests spéciaux.html'                       => array('Special Condition Tests', 'Tests spéciaux', array('Alain B.'=>'01/10/2005', 'Alain B.'=>'04/10/2005')),
    'utilisation de règles multiples pour générer plus de résultats.html' => array('Using Multiple Rules to Generate More Results', 'Utilisation de règles multiples pour générer plus de résultats', array('Alain B.'=>'03/10/2005')),
    'construction d\'arbres.html'               => array('Building Trees', 'Construction d\'arbres', array('Alain B.'=>'03/10/2005', 'Alain B.'=>'03/10/2005')),
    'construction d\'arbres hiérarchiques.html' => array('Building Hierarchical Trees', 'Construction d\'arbres hiérarchiques', array('Alain B.'=>'04/10/2005'))
  ),
  'Modifications de gabarits' => array(
    'interface du constructeur de gabarits.html' => array('Template Builder Interface', 'Interface du constructeur de gabarits', array('Alain B.'=>'04/10/2005', 'Alain B.'=>'06/10/2005')),
    'scrutateurs d\'arbres et de gabarits.html'  => array('Template and Tree Listeners', 'Scrutateurs d\'arbres et de gabarits', array('Alain B.'=>'06/10/2005', 'Alain B.'=>'07/10/2005')),
    'modifications RDF.html'                     => array('RDF Modifications', 'Modifications RDF', array('Alain B.'=>'08/10/2005', 'Alain B.'=>'08/10/2005', 'Alain B.'=>'09/10/2005'))
  ),
  'Sujets divers' => array(
    'tri des résultats.html'                     => array('Sorting Results', 'Tri des résultats', array('Alain B.'=>'09/10/2005', 'Alain B.'=>'10/10/2005', 'Alain B.'=>'10/10/2005')),
    'attributs supplémentaires de gabarits.html' => array('Additional Template Attributes', 'Attributs supplémentaires de gabarits', array('Alain B.'=>'10/10/2005'))
  )
);

$article_list=array(
 'index'      =>array('', 'Comment fonctionnent les gabarits ?', array('différents contributeurs de xulfr.org'=>'') , '', ''),
 'HTW I'      =>array(300, 'Introduction',        array('Laurent Jouanneau'=>'18/08/2005') ),
 'HTW II'     =>array(301, 'Rappel sur les graphes RDF',       array('Julien Appert'=>'02/08/2005') ),
 'HTW III'    =>array(302, 'Compilation de règles',      array('Alain B.'=>'02/08/2005') ),
 'HTW IV'     =>array(303, 'Analyse de règles',       array('Aurelien Tabard '=>'01/10/2005') ),
 'HTW V'      =>array(304, 'Génération de résultats',        array('Alain B.'=>'26/08/2005') ),
 'HTW VI'     =>array(305, 'Conditions',       array('Alain B.'=>'27/08/2005') ),
 'HTW VII'    =>array(306, 'Triplets',      array('Alain B.'=>'30/08/2005') ),
 'HTW VIII'   =>array(307, 'Actions',     array('Alain B.'=>'31/08/2005') ),
 'HTW IX'     =>array(308, 'Contenu supplémentaire',       array('Alain B.'=>'03/09/2005') ),
 'HTW X'      =>array(309, 'Génération récursive',        array('Alain B.'=>'10/09/2005') ),
 'HTW XI'     =>array(310, 'Exemple simple',       array('Alain B.'=>'11/09/2005') ),
 'HTW XII'    =>array(311, 'Les liaisons',      array('Alain B.'=>'17/09/2005') ),
 'HTW XIII'   =>array(312, 'Autre syntaxe d\'Action',     array('Alain B.'=>'17/09/2005') ),
 'HTW XIV'    =>array(313, 'Littéraux dans les triplets',      array('Alain B.'=>'17/09/2005') ),
 'HTW XV'     =>array(314, 'Navigation dans la source',       array('Alain B.'=>'17/09/2005') ),
 'HTW XVI'    =>array(315, 'Navigation supplémentaire et filtrage',      array('Alain B.'=>'18/09/2005') ),
 'HTW XVII'   =>array(316, 'Générer un menu avec des filtres',     array('Alain B.'=>'18/09/2005') ),
 'HTW XVIII'  =>array(317, 'Contenu statique',    array('Alain B.'=>'23/09/2005') ),
 'HTW XIX'    =>array(318, 'Syntaxe d\'une règle simplifiée',      array('Alain B.'=>'25/09/2005') ),
 'HTW XX'     =>array(319, 'Conditions d\'une règle simplifiée',       array('Alain B.'=>'25/09/2005') ),
 'HTW XXI'    =>array(320, 'Propriétés de conteneurs',      array('Alain B.'=>'27/09/2005') ),
 'HTW XXII'   =>array(321, 'Utilisation de règles multiples',     array('Alain B.'=>'27/09/2005') ),
 'HTW XXIII'  =>array(322, 'Règles multiples simples',    array('Alain B.'=>'30/09/2005') ),
 'HTW XXIV'   =>array(323, 'Autre exemple de règles multiples',     array('Alain B.'=>'30/09/2005') ),
 'HTW XXV'    =>array(325, 'Règles multiples avec récursivité',      array('Alain B.'=>'30/09/2005') ),
 'HTW XXVI'   =>array(326, 'Générer un menu récursivement',     array('Alain B.'=>'01/10/2005') ),
 'HTW XXVII'  =>array(327, 'Tests de conteneurs',    array('Alain B.'=>'01/10/2005') ),
 'HTW XXVIII' =>array(329, 'Appliquer des conditions de parent',   array('Alain B.'=>'02/10/2005') ),
 'HTW XXIX'   =>array(330, 'Utilisation de règles multiples pour plus de résultats',     array('Alain B.'=>'03/10/2005') ),
 'HTW XXX'    =>array(331, 'Construction d\'arbres',      array('Alain B.'=>'03/10/2005') ),
 'HTW XXXI'   =>array(332, 'Fonctionnalités du constructeur d\'arbres',     array('Alain B.'=>'03/10/2005') ),
 'HTW XXXII'  =>array(333, 'Arbres hiérarchiques',    array('Alain B.'=>'04/10/2005') ),
 'HTW XXXIII' =>array(334, 'Attachement d\'un constructeur de gabarits',   array('Alain B.'=>'04/10/2005') ),
 'HTW XXXIV'  =>array(335, 'La reconstruction de gabarits',    array('Alain B.'=>'06/10/2005') ),
 'HTW XXXV'   =>array(336, 'Les observateurs de gabarits',     array('Alain B.'=>'06/10/2005') ),
 'HTW XXXVI'  =>array(337, 'Les observateurs du constructeur d\'arbres',    array('Alain B.'=>'07/10/2005') ),
 'HTW XXXVII' =>array(338, 'Modifications RDF',   array('Alain B.'=>'08/10/2005') ),
 'HTW XXXVIII'=>array(339, 'Ajout de triplets RDF',   array('Alain B.'=>'08/10/2005') ),
 'HTW XXXIX' =>array(341, 'modifications RDF - complément',   array('Alain B.'=>'09/10/2005') ),
 'HTW XL'     =>array(342, 'Tri des résultats',   array('Alain B.'=>'09/10/2005') ),
 'HTW XLI'    =>array(343, 'Tri des résultats d\'un arbre',   array('Alain B.'=>'10/10/2005') ),
 'HTW XLII'   =>array(344, 'Tri du contenu',   array('Alain B.'=>'10/10/2005') ),
 'HTW XLIII'  =>array(345, 'Gabarit additionnel',   array('Alain B.'=>'10/10/2005') )
);

/*Autocomplétion des clés 4 et 5*/
$ex_sect = '';
foreach($article_list as $sect=>$tb) {
  if ($sect!='index' && $sect!='') $article_list[$sect][3] = $ex_sect;
  if ($ex_sect!='index' && $ex_sect!='')  $article_list[$ex_sect][4] = $sect;
  $ex_sect = $sect;
///  echo "      <li><strong>$sect</strong> <a href=\"$sect.html\">".$tb[1]."</a></li>\n";
}
$c = 0;
foreach($article_chap as $chapitre=>$s_chap) {
  if ($chapitre!='index') $c++;
  $cs = 0;
  foreach($s_chap as $sect=>$tb) 
    if ($chapitre!='index')
      $article_chap[$chapitre][$sect]['titre'] = $c.'.'.(++$cs).' - '.$tb[1];    //titre numéroté
    else
      $article_chap[$chapitre][$sect]['titre'] = $tb[1];
}
$ex_sect = $ex_chap = $ex_titre = '';
foreach($article_chap as $chapitre=>$s_chap)
  foreach($s_chap as $sect=>$tb) {
    if ($chapitre!='index') {
      $article_chap[$chapitre][$sect]['prev'] = $ex_sect;
      $article_chap[$chapitre][$sect]['prev_titre'] = $ex_titre;
      if ($ex_sect != '') {
        $article_chap[$ex_chap][$ex_sect]['next'] = $sect;
        $article_chap[$ex_chap][$ex_sect]['next_titre'] = $tb['titre'];
      }
      $ex_chap = $chapitre;
      $ex_sect = $sect;
      $ex_titre = $tb['titre'];
    }
  }
//////////////print_r($article_chap);

/*Génération automatique du sommaire*/
$first = true;
$c = 0;
$sommaire_html = "<ul>\n";
foreach($article_chap as $chapitre=>$s_chap) {
  if ($chapitre!='index') {
    $sommaire_html.= "<li>".(++$c).". $chapitre</li>\n  <ul>\n";
    $cs = 1;
    foreach($s_chap as $sect=>$tb) {
      if ($first) { $start = $sect; $start_titre = $tb['titre']; $first = false; }
      $sommaire_html.= "    <li>$c.".($cs++)." <a href=\"$sect\">$tb[1]</a></li>\n";
    }
    $sommaire_html.= "  </ul>\n";
  }
}
$last = $sect;
$last_titre = $tb['titre'];
//////////////////////echo $sommaire_html; exit();
/*
$sommaire_html = "<ol>\n";;
foreach($article_list as $sect=>$tb) {
  if ($sect!='index') $sommaire_html.= "  <li><a href=\"$sect.html\">".$tb[1]."</a>".(is_file("src/$sect.html")?'':' (traduction en cours)')."</li>\n";
}
$sommaire_html.= "</ol>\n";
*/

/*Génération de tous les pages*/
$file = '';
$c = 0;
foreach($article_chap as $chapitre => $s_chap) {
  if ($chapitre!='index') $c++;
  $cs = 0;
  $new_chap = true;
  foreach($s_chap as $sect => $tb) {
   $cs++;
   $num = $c.'.'.$cs.' - ';
//////////////foreach($article_list as $basename => $article){

   list($mdc, $page_chapitre, $auteurs) = $tb;
   $page_titre = $tb['titre'];
   $prev = $tb['prev']; $prev_titre = $tb['prev_titre'];
   $next = $tb['next']; $next_titre = $tb['next_titre'];
   $basename = basename($sect,'.html');
   $mdc_l = ($mdc!='') ? ':'.$mdc : '';

    if($basename == 'index'){
 ob_start();

    ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
   <meta http-equiv="Content-Script-Type" content="text/javascript" />
   <meta http-equiv="Content-Style-Type" content="text/css" />
   <meta name="author" content="Neil Deakin, traduit par l'équipe de xulfr.org" />
   <meta name="description" content="Comment réussir vos gabarits de Xulplanet" />


<!--*headinfo*-->
   <title>Comment réussir vos gabarits - xulfr.org/xulplanet.com</title>

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
<?php
$header = ob_get_contents();
ob_clean();
} //if page index 

if ($basename=='index') echo "<h2>$page_titre</h2>\n";
else {
  if ($new_chap) { echo "<h1>$c - $chapitre</h1>\n"; $new_chap = false; }
  echo "<h2>$page_titre</h2>\n";
}
?>

<div class="contenuinfo">
<?php  if($basename != 'index'){ ?>
    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.
    <?php
    echo 'Traduit par ';
    $tb_aut = array();
    foreach($auteurs as $auteur=>$dateaut) $tb_aut[] = "<strong>$auteur</strong> ($dateaut)";
    echo join($tb_aut, ', ');
   ?>.
   <br />
    Page originale&nbsp;:
    <a href="http://developer.mozilla.org/en/docs/XUL:Template_Guide<?php echo $mdc_l?>">http://developer.mozilla.org/en/docs/XUL:Template_Guide<?php echo $mdc_l?></a>
    <a href="http://www.xulplanet.com/"><img src="xulplanet_little.png" alt="xulplanet.com" style="vertical-align:middle"/></a>
    </p>

<?php }else{ ?>
    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.
    Traduit par différents <a href="#contributeurs">contributeurs de xulfr.org</a>.</p>
    <p>Original&nbsp;: <a href="http://developer.mozilla.org/en/docs/XUL:Template_Guide">http://developer.mozilla.org/en/docs/XUL:Template_Guide</a>.</p>
<?php }?>

</div>
<?php
$head_page = ob_get_contents();
ob_clean();

if ($basename=='index') {
ob_start();
?>
</div>
<!--*navbox*-->

</div>
<!--*footer*-->
</body>
</html>
<?php
$footer = ob_get_contents();
ob_clean();
} // if index


    $page_url_from='src/'.$basename.'.html';
    //$page_url_to='builds/'.$basename.'.html';
    //$page_url_to='../../../../../www/xulplanet/mozsdk_svn/'.$basename.'.html';
    if (is_file($page_url_from)) $data = implode('',file($page_url_from));
    else $data = "<em>(Traduction en cours)</em>\n";

    if($basename == 'index'){
        $data = str_replace("@@DATE_MISEAJOUR@@", date("d/m/Y"),$data);
        $data = str_replace("@@SOMMAIRE@@", $sommaire_html, $data);
        $data = preg_replace('/<\/strong> <a href="(.+)">/i', '</strong> <a href="#$1">', $data);
        $data = preg_replace('/<h2>Sommaire<\/h2>/i', '', $data);
        $data = preg_replace('/<ul>.+<\/ul>/s', '', $data);
        $file = $header;
    }
    $data = preg_replace('`(<var>)([^<]+)(</var>)`si', "$1'$2'$3", $data);    //force les guillemets simples autour des tags <var>
    $data = preg_replace('`(<code class=[\'"]tag["\']>)(.+)(</code>)`siU', "$1&lt;$2&gt;$3", $data);    //mets des < > autour des balises XUL
///    $data = preg_replace('/<a[^<]+exemples\/[^<]+<\/a>/si', '', $data);    //Supprime les liens exemples
    $file.= $head_page . $data;
 }
} //boucle principale
 $file.= $footer;
 //echo $file; exit();

    $page_url_to = 'builds/htw_pdf.html';
    $fp=fopen($page_url_to, 'w');
    fwrite($fp,$file);
    fclose($fp);
    chmod($page_url_to, 0666);
echo "Fichier $page_url_to créé";
?>