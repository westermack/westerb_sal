<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}
//$admin = true; FOR AJAX???

if(isset($_GET["enma_id"])) {
    try {
        $album = Album::get_by_id($_GET["enma_id"]);
        if($album) {
            $raw_update_str = trim($_POST["a_name"]);
            $raw_str_len = strlen($raw_update_str);
            $clean_update_str = strip_tags($raw_update_str);
            if($session->user_perms === 1) {
                $whose = isset($_SESSION["back_to_all"]) ? ($_SESSION["back_to_all"] ? "?o_id=a":"?o_id=".$album->owner_id):"";
                Session::set_message("As a guest, you do not have sufficient privileges to edit album names", "notice");
                redirect_to("list_albums.php{$whose}");
            }
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to edit names of albums you did not personally create", "notice");
                redirect_to("index.php");
            }
            if(TRUE) {
                $redirect_str = "list_albums.php?o_id=";
                if(isset($_SESSION["back_to_all"]) && $_SESSION["back_to_all"])
                    $redirect_str .= "a";
                else
                    $redirect_str .= "{$album->owner_id}";
                if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
            }
            if($clean_update_str === $album->albumname) {
                Session::set_message ("You did not make any changes. There was nothing to update","notice");
                redirect_to($redirect_str);
            }
            if($raw_str_len > Album::MAX_ANAME_LEN) {
                $raw_update_str = substr($raw_update_str, 0, Album::MAX_ANAME_LEN);
                $clean_update_str = strip_tags($raw_update_str);
                $album->update("albumname={$clean_update_str}");
                Session::set_message("The album name you provided was ".$raw_str_len." characters long, exceeding the ".Photo::MAX_ANAME_LEN."-character limit. The excess was not saved", "notice");
                redirect_to($redirect_str);
            }
            else {
                $album->update("albumname={$clean_update_str}");
                Session::set_message ("The album name was successfully updated", "success");
                redirect_to($redirect_str);
            }
        }
        else redirect_to("index.php");
    } catch(Exception $e) { redirect_to("index.php"); }
}
else
    redirect_to("index.php");

$database->close_connection();
?>
