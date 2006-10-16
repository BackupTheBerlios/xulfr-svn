<?php
/**
 * Script de génération des pages du tutoriel HTW
 * en ligne de commande, :
 *    php build.php
 */

/**
 * liste des articles.
 * clé de chaque article = nom du fichier original sans le .html
 * tableau :
 *    0 : titre original en anglais
 *    1 : titre de l'article en français
 *    2 : tableau (auteur original=>date, correcteur/mainteneur=>date)
 */

include("liste_articles.php");


// génération des titres numérotés pour le sommaire, et des titres/lien pour les articles suivant/precedant
$c = 0;
$ex_sect = $ex_chap = $ex_titre = '';
foreach($article_chap as $chapitre=>$s_chap){
    if ($chapitre!='index') $c++;
    $cs = 0;

    foreach($s_chap as $sect=>$tb) {
        if ($chapitre!='index') {
            $article_chap[$chapitre][$sect]['titre'] = $c.'.'.(++$cs).' - '.$tb[1];
            $article_chap[$chapitre][$sect]['prev'] = $ex_sect;
            $article_chap[$chapitre][$sect]['prev_titre'] = $ex_titre;
            $article_chap[$ex_chap][$ex_sect]['next'] = $sect;
            $article_chap[$ex_chap][$ex_sect]['next_titre'] = $tb[1];
        }else{
            $article_chap[$chapitre][$sect]['titre'] = $tb[1];
            $article_chap[$chapitre][$sect]['prev']='';
            $article_chap[$chapitre][$sect]['prev_titre'] ='';
            $article_chap[$chapitre][$sect]['next'] = '';
            $article_chap[$chapitre][$sect]['next_titre'] = '';
        }
        $ex_chap = $chapitre;
        $ex_sect = $sect;
        $ex_titre = $tb[1];
    }
}

if(!isset($article_chap[$chapitre][$sect]['next'])){
    $article_chap[$chapitre][$sect]['next'] = '';
    $article_chap[$chapitre][$sect]['next_titre'] = '';
}


/*Génération automatique du sommaire*/
$first = true;
$c = 0;
$sommaire_html = "<ul>\n";
$start=$start_titre='';
foreach($article_chap as $chapitre=>$s_chap) {
    if ($chapitre!='index') {
        $sommaire_html.= "<li>".(++$c).". $chapitre <ul>";
        $cs = 1;
        foreach($s_chap as $sect=>$tb) {
            if ($first) {
                $start = $sect;
                $start_titre = $tb['titre'];
                $first = false;
            }
            $sommaire_html.= "    <li>$c.".($cs++)." <a href=\"$sect\">".$tb[1]."</a></li>\n";
        }
        $sommaire_html.= "  </ul></li>\n";
    }
}
$sommaire_html .= "</ul>\n";

$last = $sect;
$last_titre = $tb['titre'];


/*Génération de tous les pages*/
$c = $cs = 0;
foreach($article_chap as $chapitre => $s_chap) {
    $c++;
    foreach($s_chap as $sect => $tb) {
        $cs++;
        $num = $c.'.'.$cs.' - ';

        list($mdc, $page_chapitre, $auteurs) = $tb;
        $page_titre = $tb['titre'];
        $prev = $tb['prev']; $prev_titre = $tb['prev_titre'];
        $next = $tb['next']; $next_titre = $tb['next_titre'];
        $basename = basename($sect,'.html');
        $mdc_l = ($mdc!='') ? ':'.$mdc : '';
echo "page $basename ";
        if($basename != 'index'){
            $header_links='
            <link rel="up"   href="index.html" title="Sommaire" />
            <link rel="chapter" href="index.html" title="Comment réussir vos gabarits ?" />
            ';

            if($prev != '') $header_links.='<link rel="prev" href="'.$prev.'" title="'.$prev_titre.'" />'."\n";
            if($next != '') $header_links.='<link rel="next" href="'.$next.'" title="'.$next_titre.'" />'."\n";
            if($sect != $start) $header_links.= '<link rel="first" href="'.$start.'" title="'.$start_titre.'" />'."\n";
            if($sect != $last)  $header_links.= '<link rel="last"  href="'.$last. '" title="'.$last_titre. '" />'."\n";

        }
        $page_traduction_auteur='';
        foreach($auteurs as $auteur=>$datetraduc){
            $page_traduction_auteur.=', '.$auteur;
        }
        $page_traduction_auteur=substr($page_traduction_auteur,2);

 ob_start();

    ?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
<head>
   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
   <meta http-equiv="Content-Script-Type" content="text/javascript" />
   <meta http-equiv="Content-Style-Type" content="text/css" />
   <meta name="author" content="Neil Deakin, traduit par <?php echo $page_traduction_auteur?>" />
   <meta name="description" content="Comment réussir vos gabarits de Xulplanet : <?php echo $page_chapitre?>" />


<!--*headinfo*-->
<?php
if($basename != 'index'){ ?>
   <title>Comment réussir vos gabarits > <?php echo $chapitre.' > '.$page_chapitre?> - xulfr.org/xulplanet.com</title>
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
    <div id="logo">
      <a href="http://xulfr.org"><img src="pics/logo.png" alt="xulfr.org" /></a>
   </div>
<!--*bandeau*-->
</div>
<div id="contenu">
<div class="box">

<h1><?php echo $page_titre?></h1>
<div class="contenuinfo">
<?php  if($basename != 'index'){ ?>
    <ul class="navlinks">
    <?php
    if($next != ''){
        ?>
            <li><a class="nextlink" title="<?php echo $next_titre?>" href="<?php echo $next?>">Suivant</a></li>

        <?php
    }
    if($prev != ''){
        ?>    <li><a class="prevlink" title="<?php echo $prev_titre?>" href="<?php echo $prev?>">Précédent</a></li>

        <?php
    }
    ?>


    <li><a class="index" href="index.html">Sommaire</a></li>
    </ul>
    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.


    <?php
    echo 'Traduit par ';
    $tb_aut = array();
    foreach($auteurs as $auteur=>$dateaut) $tb_aut[] = "<strong>$auteur</strong> ($dateaut)";
    echo join($tb_aut, ', ');
/*
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
*/
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
            <li><a class="nextlink" title="<?php echo $next_titre?>" href="<?php echo $next?>">Suivant</a></li>

        <?php
    }
    if($prev != ''){
        ?>    <li><a class="prevlink" title="<?php echo $prev_titre?>" href="<?php echo $prev?>">Précédent</a></li>

        <?php
    }
    ?>

    <li><a class="index" href="index.html">Sommaire</a></li>
</ul>
</div>
<?php } ?>
</div>
</div>
<!--*navbox*-->


<!--*footer*-->
</body>
</html>
<?php
$footer = ob_get_contents();
ob_clean();


    $page_url_from='src/'.$basename.'.html';
    $page_url_to='builds/'.$basename.'.html';
    //$page_url_to='../../../../../www/xulplanet/mozsdk_svn/'.$basename.'.html';
    if (is_file($page_url_from)) $file = implode('',file($page_url_from));
    else $file = "<em>(Traduction en cours)</em>\n";

    if($basename == 'index'){
        $file = str_replace("@@DATE_MISEAJOUR@@", date("d/m/Y"),$file);
        $file = str_replace("@@SOMMAIRE@@", $sommaire_html, $file);
    }


    $file = $header . $file . $footer;

    $fp=fopen($page_url_to, 'w');
    fwrite($fp,$file);
    fclose($fp);
    chmod($page_url_to, 0666);
    echo " créée<br />\n";
}
}

?>