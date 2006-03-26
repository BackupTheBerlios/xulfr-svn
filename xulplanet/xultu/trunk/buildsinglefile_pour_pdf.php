<?php
/**
 * Script de génération du tutoriel dans une seule page HTML
 * en ligne de commande, :
 *    php buildsinglefile.php
 */

include 'liste_articles.php';
$chapitres = array(
  1=>'Introduction',
  2=>'Élements simples',
  3=>'Le modèle de boîte',
  4=>'Éléments communs',
  5=>'Menus et barres d\'outils',
  6=>'Évènements et scripts',
  7=>'Modèle Objet de Document (DOM)',
  8=>'Arbres',
  9=>'RDF et templates',
  10=>'Thèmes et localisation',
  11=>'Bindings',
  12=>'Fenêtres spécialisées',
  13=>'Installation'
);

$fichier ='builds/xultu.html';
$fp=fopen($fichier, 'w');

if(!$fp){
    echo 'ouverture du fichier '.$fichier." impossible en écriture\nFin.\n";
    exit;
}


/*****************************
Ecriture de l'entête du fichier HTML
*/


ob_start();

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
   <meta http-equiv="Content-Script-Type" content="text/javascript" />
   <meta http-equiv="Content-Style-Type" content="text/css" />
   <meta name="author" content="Neil Deakin, traduit par les contributeurs au projet de traduction de Xulfr.org" />
   <meta name="description" content="tutoriel XUL de Xulplanet" />

   <title>Tutoriel XUL - xulfr.org/xulplanet.com</title>
   <link rel="stylesheet" type="text/css" href="main.css" media="screen" />
   <link rel="stylesheet" type="text/css" href="print.css" media="print" />
</head>
<body>
<div id="bandeau">
   <div id="logo">
      <img src="pics/logo.png" alt="xulfr.org" />
   </div>
<!--*bandeau*-->
</div>
<div id="contenu">
<div class="box">



<?

/*


    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.

    Traduit par différents <a href="#contributeurs">contributeurs de xulfr.org</a>.</p>
    <p>Original&nbsp;: <a href="http://www.xulplanet.com/tutorials/xultu/">http://www.xulplanet.com/tutorials/xultu/</a>.</p>



*/
$header = ob_get_contents();
ob_clean();
fwrite($fp,$header);


/****************************
boucle sur chaque articles
*****************************/
$ex_chap = '';
foreach($article_list as $basename => $article){

   list($page_chapitre, $auteurs, $prev, $next) = $article_list[$basename];

    if($basename != 'index'){

        $page_traduction_auteur='';
        foreach($auteurs as $auteur=>$datetraduc){
            $page_traduction_auteur.=', '.$auteur;

        }
        $page_traduction_auteur=substr($page_traduction_auteur,2);

    }
ob_start();
?>
<?php
if (ereg('^([0-9]{1,2})(\..+)',$page_chapitre, $reg)) {
  if ($reg[1]!=$ex_chap) {
    echo "</div><!--box--><div class=\"box\"><h1>$reg[1]. ".$chapitres[$reg[1]]."</h1>\n";
    $ex_chap = $reg[1];
  }
//  $page_chapitre = $reg[0];
} else {
  echo "<div class=\"box\"><h1>Préface</h1>\n";
}

//echo '<h2 id="'.$basename.'.html">'.preg_replace('/^(\d{1,2}\.)(\d{1,2}bis|\d{1,2})(.+)/i', '$3', $page_chapitre); </h2>
echo '<h2 id="'.$basename.'.html">'.$page_chapitre; ?></h2>
<div class="contenuinfo">
<?php  if($basename != 'index'){ ?>
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



    $page_url_from='src/'.$basename.'.html';
    echo 'Lecture Page : ',$page_url_from ,"<br />\n";

    $file = implode('',file($page_url_from));

    if($basename == 'index'){
        $file = str_replace("@@DATE_MISEAJOUR@@", date("d/m/Y"),$file);
        $file = preg_replace('/<\/strong> <a href="(.+)">/i', '</strong> <a href="#$1">', $file);
        $file = preg_replace('/<h2>Sommaire<\/h2>/i', '', $file);
        $file = preg_replace('/<ul>.+<\/ul>/s', '', $file);
    }
    $file = preg_replace(array('/<h2>/i','/<\/h2>/i'), array('<h3>','</h3>'), $file);    //Déplace les niveaux de titre h2
    $file = preg_replace('/<a[^<]+exemples\/[^<]+<\/a>/si', '', $file);    //Supprime les liens exemples

    $file = $header . $file;

    fwrite($fp,$file);

} // fin de la grande boucle.



/************************************

création du footer

*/
ob_start();
?>
</div>
</div>
</body>
</html>
<?php
$footer = ob_get_contents();
ob_clean();
fwrite($fp,$footer);

fclose($fp);
chmod($fichier, 0666);


?>