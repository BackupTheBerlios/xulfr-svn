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
 'HTW V'      =>array(304, 'HTW Partie V',        array('Alain B.'=>'26/08/2005') ),
 'HTW VI'     =>array(305, 'HTW Partie VI',       array('Alain B.'=>'27/08/2005') ),
 'HTW VII'    =>array(306, 'HTW Partie VII',      array('Alain B.'=>'30/08/2005') ),
 'HTW VIII'   =>array(307, 'HTW Partie VIII',     array('Alain B.'=>'31/08/2005') ),
 'HTW IX'     =>array(308, 'HTW Partie IX',       array('Alain B.'=>'03/09/2005') ),
 'HTW X'      =>array(309, 'HTW Partie X',        array('Alain B.'=>'10/09/2005') ),
 'HTW XI'     =>array(310, 'HTW Partie XI',       array('Alain B.'=>'11/09/2005') ),
 'HTW XII'    =>array(311, 'Les liaisons',      array('Alain B.'=>'17/09/2005') ),
 'HTW XIII'   =>array(312, 'Autre syntaxe d\'Action',     array('Alain B.'=>'17/09/2005') ),
 'HTW XIV'    =>array(313, 'Littéraux dans les triplets',      array('Alain B.'=>'17/09/2005') ),
 'HTW XV'     =>array(314, 'Navigation dans la source',       array(''=>'') ),
 'HTW XVI'    =>array(315, 'Navigation supplémentaire et filtrage',      array(''=>'') ),
 'HTW XVII'   =>array(316, 'Générer un menu avec des filtres',     array(''=>'') ),
 'HTW XVIII'  =>array(317, 'Contenu statique',    array(''=>'') ),
 'HTW XIX'    =>array(318, 'Syntaxe d\'une règle simple',      array(''=>'') ),
 'HTW XX'     =>array(319, 'Conditions d\'une règle simple',       array(''=>'') ),
 'HTW XXI'    =>array(320, 'Propriétés de conteneurs',      array(''=>'') ),
 'HTW XXII'   =>array(321, 'Utilisation de règles multiples',     array(''=>'') ),
 'HTW XXIII'  =>array(322, 'Règles multiples simples',    array(''=>'') ),
 'HTW XXIV'   =>array(323, 'Autre exemple de règles multiples',     array(''=>'') ),
 'HTW XXV'    =>array(325, 'Règles multiples avec récursivité',      array(''=>'') ),
 'HTW XXVI'   =>array(326, 'Générer un menu récursivement',     array(''=>'') ),
 'HTW XXVII'  =>array(327, 'Tests de conteneurs',    array(''=>'') ),
 'HTW XXVIII' =>array(329, 'Appliquer des conditions de parent',   array(''=>'') ),
 'HTW XXIX'   =>array(330, 'Utilisation de règles multiples pour plus de résultats',     array(''=>'') ),
 'HTW XXX'    =>array(331, 'Construction d\'arbres',      array(''=>'') ),
 'HTW XXXI'   =>array(332, 'Fonctionnalités du constructeur d\'arbres',     array(''=>'') ),
 'HTW XXXII'  =>array(333, 'Arbres hiérarchiques',    array(''=>'') ),
 'HTW XXXIII' =>array(334, 'Attachement d\'un constructeur de gabarits',   array(''=>'') ),
 'HTW XXXIV'  =>array(335, 'La reconstruction de gabarits',    array(''=>'') ),
 'HTW XXXV'   =>array(336, 'Les observateurs de gabarits',     array(''=>'') ),
 'HTW XXXVI'  =>array(337, 'Les observateurs du constructeur d\'arbres',    array(''=>'') ),
 'HTW XXXVII' =>array(338, 'Modifications RDF',   array(''=>'') ),
 'HTW XXXXIX' =>array(341, 'Modifications RDF - complément',   array(''=>'') ),
 'HTW XL'     =>array(342, 'Tri des résultats',   array(''=>'') ),
 'HTW XLI'    =>array(343, 'Tri des résultats d\'un arbre',   array(''=>'') ),
 'HTW XLII'   =>array(344, 'Tri du contenu',   array(''=>'') ),
 'HTW XLIII'  =>array(345, 'Gabarit additionnel',   array(''=>'') )
);

/*Autocomplétion des clés 4 et 5*/
$ex_sect = '';
foreach($article_list as $sect=>$tb) {
  if ($sect!='index' && $sect!='') $article_list[$sect][3] = $ex_sect;
  if ($ex_sect!='index' && $ex_sect!='')  $article_list[$ex_sect][4] = $sect;
  $ex_sect = $sect;
///  echo "      <li><strong>$sect</strong> <a href=\"$sect.html\">".$tb[1]."</a></li>\n";
}

/*Génération automatique du sommaire*/
$sommaire_html = "<ol>\n";;
foreach($article_list as $sect=>$tb) {
  if ($sect!='index') $sommaire_html.= "  <li><a href=\"$sect.html\">".$tb[1]."</a>".(is_file("src/$sect.html")?'':' (traduction en cours)')."</li>\n";
}
$sommaire_html.= "</ol>\n";

/*Génération de tous les pages*/
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
            $header_links.='<link rel="next" href="'.$next.'.html" title="u'.$article_list[$next][1].'" />'."\n";

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
echo "page $basename créée<br />\n";
}

?>