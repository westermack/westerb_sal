<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}

//$admin = true; FOR AJAX???

//da_id => delete album of specific id
if(isset($_GET["da_id"])) {
    try {
        $album = Album::get_by_id($_GET["da_id"]);
        if($album) {
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to delete that album", "notice");
                redirect_to("list_albums.php?o_id={$session->user_id}");
            }
            $album->delete_album();
            Session::set_message("The album \"{$album->albumname}\" was successfully deleted", "success");
            if($session->user_perms === 2)
                redirect_to ("list_albums.php?o_id={$session->user_id}");
            //
            if(isset($_SESSION["owner_total_albums"]) && $_SESSION["owner_total_albums"] == 1)
                redirect_to("list_albums.php");
            if(isset($_SESSION["back_to_all"]) && !$_SESSION["back_to_all"])
                redirect_to("list_albums.php?o_id={$album->owner_id}");
            else
                redirect_to("list_albums.php?o_id=a");
        }
        else {
            Session::set_message("The album you tried to delete does not exist", "error");
            $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
        }
    } catch(Exception $e) {
        Session::set_message("The album you tried to delete does not exist", "error");
        $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
    }
} else {
    Session::set_message("Please pick an album to delete before accessing the delete page", "error");
    $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
}

$database->close_connection();
?>