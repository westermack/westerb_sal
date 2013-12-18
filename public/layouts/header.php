<?php header('Content-type: text/html; charset=utf-8'); ?>
<!DOCTYPE html>
<html>
    <?php global $admin, $js_redirect, $session, $paginated, $is_dev; ?>
    <head>
        <?php $after_colon = $admin && $session->is_logged_in() ? "Admin":"Login" ?>
        <title><?php echo $admin && $session->user_perms !== 2 ? "The Salon: {$after_colon}" : "The Salon" ?></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link href="<?php echo HOME.'css/main'.($is_dev?'':'_min').'.css' ?>" rel="stylesheet" media="all">
        <script><?php if($js_redirect && isset($_GET["o_id"]) && $session->user_perms !== 2) echo "window.location.replace(\"list_albums.php\");"; ?></script>
        <script src="<?php echo HOME.'js_libs/jquery-1.9.1.min.js' ?>"></script>
        <script src="<?php echo HOME.'js/main'.($is_dev?'':'_min').'.js' ?>"></script>
        <?php if($paginated) echo "<script src='".HOME."js/includes/pagination".($is_dev?"":"_min").".js'></script>" ?>
        <script src="<?php echo HOME.'js/includes/form'.($is_dev?'':'_min').'.js' ?>"></script>
        <script src="<?php echo HOME.'js/includes/logo_animation'.($is_dev?'':'_min').'.js' ?>"></script>
    </head>
    <body id="body">
        <div id="header">
            <a id="home" href="index.php" class="scriptable_hash_changer scriptable_header_link">
                <h1 <?php echo $admin && $session->user_perms !== 2 ? "id=\"admin\"" : "" ?> >
                    <?php echo $admin && $session->user_perms !== 2 ? "The S<span class=\"a sal_letter\">a</span><span class=\"l sal_letter\">l</span><span class=\"o sal_letter\">o</span><span class=\"n sal_letter\">n</span><span id=\"logo_suffix\">: {$after_colon}</span>" :
                        "The S<span class=\"a sal_letter\">a</span><span class=\"l sal_letter\">l</span><span class=\"o sal_letter\">o</span><span class=\"n sal_letter\">n</span><span id=\"logo_suffix\"> &TRADE;</span>" ?></h1>
            </a>
            <?php
                if(!$admin && $session->is_logged_in()) {
                    echo "<a class='scriptable_hash_changer scriptable_header_link' id=\"gostaff\" href=\"".HOME."admin/index.php\"><div class=\"ui_button ui_button_white\">";
                    echo $session->user_perms === 2 ? "PRIVATE":"ADMIN";
                    echo" AREA</div></a><a class='scriptable_hash_changer scriptable_header_link' id=\"logout\" href=\"".HOME."admin/logout.php\"><div class=\"ui_button ui_button_white\">LOGOUT</div></a>";
                }
                elseif(!$admin)
                    echo "<a class='scriptable_hash_changer scriptable_header_link' id=\"gologin\" href=\"".HOME."admin/login.php\"><div class=\"ui_button ui_button_white\">USER LOGIN</div></a>";
                if($admin && $session->is_logged_in())
                    echo "<a class='scriptable_hash_changer scriptable_header_link' id=\"gopublic\" href=\"".HOME."index.php\"><div class=\"ui_button ui_button_white\">PUBLIC AREA</div></a><a class='scriptable_hash_changer scriptable_header_link' id=\"logout\" href=\"".HOME."admin/logout.php\"><div class=\"ui_button ui_button_white\">LOGOUT</div></a>";
                elseif($admin)
                    echo "<a id=\"gopublic\" class=\"stnd_alone scriptable_hash_changer scriptable_header_link\" href=\"".HOME."index.php\"><div class=\"ui_button ui_button_white\">PUBLIC AREA</div></a>";
            ?>
        </div>
        <audio id="blocking_modal_alert" src="<?= HOME."sounds/" ?>modal_alert.mp3"></audio>
        <script>
            $(function() {
                new Audio(westerb_sal.HOME+'sounds/modal_alert.mp3'); //preload the sound
            });
        </script>
        <noscript>
            <div id="no_js_alert">
                <div class="alertBox info">
                    You are browsing The Salon without JavaScript. Turn JavaScript on for a better browsing experience
                </div>
            </div>
        </noscript>