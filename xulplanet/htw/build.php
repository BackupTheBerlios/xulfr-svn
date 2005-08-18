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
 *    1 : index pour http://www.xulplanet.com/ndeakin/article/<index>
 *    2 : titre de l'article
 *    3 : tableau (auteur original=>date, correcteur/mainteneur=>date)
 *    4 : clé de l'article précédent
 *    5 : clé de l'article suivant
 */

$article_list=array(
 'index'      =>array('', 'Comment fonctionnent les gabarits ?', array('différents contributeurs de xulfr.org'=>'') , '', ''),
 'HTW I'      =>array(300, 'HTW Partie I',        array('Laurent Jouanneau'=>'18/08/2005') ),
 'HTW II'     =>array(301, 'HTW Partie II',       array('Julien Appert'=>'02/08/2005') ),
 'HTW III'    =>array(302, 'HTW Partie III',      array('Alain B.'=>'02/08/2005') ),
 'HTW IV'     =>array(303, 'HTW Partie IV',       array(''=>'') ),
 'HTW V'      =>array(304, 'HTW Partie V',        array(''=>'') ),
 'HTW VI'     =>array(305, 'HTW Partie VI',       array(''=>'') ),
 'HTW VII'    =>array(306, 'HTW Partie VII',      array(''=>'') ),
 'HTW VIII'   =>array(307, 'HTW Partie VIII',     array(''=>'') ),
 'HTW IX'     =>array(308, 'HTW Partie IX',       array(''=>'') ),
 'HTW X'      =>array(309, 'HTW Partie X',        array(''=>'') ),
 'HTW XI'     =>array(310, 'HTW Partie XI',       array(''=>'') ),
 'HTW XII'    =>array(311, 'HTW Partie XII',      array(''=>'') ),
 'HTW XIII'   =>array(312, 'HTW Partie XIII',     array(''=>'') ),
 'HTW XIV'    =>array(313, 'HTW Partie XIV',      array(''=>'') ),
 'HTW XV'     =>array(314, 'HTW Partie XV',       array(''=>'') ),
 'HTW XVI'    =>array(315, 'HTW Partie XVI',      array(''=>'') ),
 'HTW XVII'   =>array(316, 'HTW Partie XVII',     array(''=>'') ),
 'HTW XVIII'  =>array(317, 'HTW Partie XVIII',    array(''=>'') ),
 'HTW XIX'    =>array(318, 'HTW Partie XIX',      array(''=>'') ),
 'HTW XX'     =>array(319, 'HTW Partie XX',       array(''=>'') ),
 'HTW XXI'    =>array(320, 'HTW Partie XXI',      array(''=>'') ),
 'HTW XXII'   =>array(321, 'HTW Partie XXII',     array(''=>'') ),
 'HTW XXIII'  =>array(322, 'HTW Partie XXIII',    array(''=>'') ),
 'HTW XXIV'   =>array(323, 'HTW Partie XXIV',     array(''=>'') ),
 'HTW XXV'    =>array(325, 'HTW Partie XXV',      array(''=>'') ),
 'HTW XXVI'   =>array(326, 'HTW Partie XXVI',     array(''=>'') ),
 'HTW XXVII'  =>array(327, 'HTW Partie XXVII',    array(''=>'') ),
 'HTW XXVIII' =>array(329, 'HTW Partie XXVIII',   array(''=>'') ),
 'HTW XXIX'   =>array(330, 'HTW Partie XXIX',     array(''=>'') ),
 'HTW XXX'    =>array(331, 'HTW Partie XXX',      array(''=>'') ),
 'HTW XXXI'   =>array(332, 'HTW Partie XXXI',     array(''=>'') ),
 'HTW XXXII'  =>array(333, 'HTW Partie XXXII',    array(''=>'') ),
 'HTW XXXIII' =>array(334, 'HTW Partie XXXIII',   array(''=>'') ),
 'HTW XXXIV'  =>array(335, 'HTW Partie XXXIV',    array(''=>'') ),
 'HTW XXXV'   =>array(336, 'HTW Partie XXXV',     array(''=>'') ),
 'HTW XXXVI'  =>array(337, 'HTW Partie XXXVI',    array(''=>'') ),
 'HTW XXXVII' =>array(338, 'HTW Partie XXXVII',   array(''=>'') )
);

/*Autocomplétion des clés 4 et 5*/
$ex_sect = '';
foreach($article_list as $sect=>$tb) {
  if ($sect!='index' && $sect!='') $article_list[$sect][3] = $ex_sect;
  if ($ex_sect!='index' && $ex_sect!='')  $article_list[$ex_sect][4] = $sect;
  $ex_sect = $sect;
///  echo "      <li><strong>$sect</strong> <a href=\"$sect.html\">".$tb[1]."</a></li>\n";
}

foreach($article_list as $basename => $article){

   list($num_index, $page_chapitre, $auteurs, $prev, $next)
      = $article_list[$basename];

    if($basename != 'index'){
        $header_links='
        <link rel="up"   href="index.html" title="Sommaire" />
        <link rel="chapter" href="index.html" title="Comment fonctionnent les gabarits ?" />
        ';



        if($prev != '')
            $header_links.='<link rel="prev" href="'.$prev.'.html" title="'.$article_list[$prev][1].'" />'."\n";
        if($next != '')
            $header_links.='<link rel="next" href="'.$next.'.html" title="'.$article_list[$next][1].'" />'."\n";

        reset($article_list);
        $first=current($article_list);
        if($basename !=key($article_list))
            $header_links.='<link rel="first" href="'.key($article_list).'.html" title="'.$first[1].'" />'."\n";

        $last=end($article_list);
        if($basename !=key($article_list))
            $header_links.='<link rel="last" href="'.key($article_list).'.html" title="'.$last[1].'" />'."\n";

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
   <meta name="description" content="Comment fonctionnent les gabarits de Xulplanet : <?php echo $page_chapitre?>" />


<!--*headinfo*-->
<?php  if($basename != 'index'){ ?>
   <title><?php echo $page_chapitre?>, Comment fonctionnent les gabarits - xulfr.org/xulplanet.com</title>
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
            <li><a class="nextlink" title="<?php echo $article_list[$next][1]?>" href="<?php echo $next?>.html">Suivant</a></li>

        <?php
    }
    if($prev != ''){
        ?>    <li><a class="prevlink" title="<?php echo $article_list[$prev][1]?>" href="<?php echo $prev?>.html">Précédent</a></li>

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
    <a href="http://www.xulplanet.com/ndeakin/article/<?php echo $num_index?>">http://www.xulplanet.com/ndeakin/article/<?php echo $num_index?></a>
    <a href="http://www.xulplanet.com/"><img src="xulplanet_little.png" alt="xulplanet.com" style="vertical-align:middle"/></a>
    </p>

<?php }else{ ?>
    <p>Écrit par <a href="http://www.xulplanet.com/ndeakin/">Neil Deakin</a>.

    Traduit par différents <a href="#contributeurs">contributeurs de xulfr.org</a>.</p>
    <p>Original&nbsp;: <a href="http://www.xulplanet.com/ndeakin/article/300">http://www.xulplanet.com/ndeakin/article/300</a>.</p>
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
            <li><a class="nextlink" title="<?php echo $article_list[$next][1]?>" href="<?php echo $next?>.html">Suivant</a></li>

        <?php
    }
    if($prev != ''){
        ?>    <li><a class="prevlink" title="<?php echo $article_list[$prev][1]?>" href="<?php echo $prev?>.html">Précédent</a></li>

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