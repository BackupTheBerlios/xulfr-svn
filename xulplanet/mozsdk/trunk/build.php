<?php
/**
 * Script de génération des pages du tutoriel
 * en ligne de commande, :
 *    php build.php
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
 'index'      =>array('Guide API Mozilla de XulPlanet.com',       array('différents contributeurs de xulfr.org'=>'') ,'',''),
 'rdfstart'   =>array('1.1 Introduction au modèle RDF',              array('René-Luc D.'=>'13/06/2005') ,'','rdfsyntax'),
 'rdfsyntax'  =>array('1.2 La syntaxe RDF/XML',                      array('René-Luc D.'=>'13/06/2005') ,'rdfstart','rdfsources'),
 'rdfsources' =>array('1.3 Sources de données RDF',                  array('René-Luc D.'=>'13/06/2005') ,'rdfsyntax','rdfsrcdetails'),
 'rdfsrcdetails'=>array('1.4 Détails des sources de données RDF',    array('René-Luc D.'=>'13/06/2005') ,'rdfsources','rdfresources'),
 'rdfresources' =>array('1.5 Ressources et literals RDF',            array('René-Luc D.'=>'13/06/2005') ,'rdfsrcdetails','rdfquery'),
 'rdfquery'   =>array('1.6 Interroger les sources de données RDF',   array('René-Luc D.'=>'13/06/2005') ,'rdfresources','rdfmods'),
 'rdfmods'    =>array('1.7 Modification de sources de données RDF',  array('René-Luc D.'=>'13/06/2005') ,'rdfquery','rdfcontain'),
 'rdfcontain' =>array('1.8 Conteneurs RDF',                          array('René-Luc D.'=>'13/06/2005') ,'rdfmods','rdfsave'),
 'rdfsave'    =>array('1.9 Sauvegarde RDF',                          array('René-Luc D.'=>'13/06/2005') ,'rdfcontain','')

);

foreach($article_list as $basename => $article){

   list($page_chapitre, $auteurs, $prev, $next)
      = $article_list[$basename];

    if($basename != 'index'){
        $header_links='
        <link rel="up"   href="index.html" title="Sommaire" />
        <link rel="chapter" href="index.html" title="Guide API Mozilla" />
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
   <meta name="description" content="Guide API Mozilla de Xulplanet : <?php echo $page_chapitre?>" />


<!--*headinfo*-->
<?php  if($basename != 'index'){ ?>
   <title><?php echo $page_chapitre?>, Guide API Mozilla - xulfr.org/xulplanet.com</title>
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
    <p>Original&nbsp;: <a href="http://www.xulplanet.com/tutorials/mozsdk/">http://www.xulplanet.com/tutorials/mozsdk/</a>.</p>
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
    $page_url_to='builds/'.$basename.'.html';
    //$page_url_to='../../../../../www/xulplanet/mozsdk_svn/'.$basename.'.html';
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