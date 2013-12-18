<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}
//$admin = true; FOR AJAX???

if(isset($_GET["a_notes"]) || isset($_GET["da_notes"])) {
    if(isset($_GET["a_notes"])) {
        $id = $_GET["a_notes"];
        $raw_update_str = str_replace("\r\n","\n",trim($_POST["a_notes"]));
        $raw_str_len = strlen($raw_update_str);
        $pattern = "/(<a\s+(?:href)=?)(['\"])([^=]*)\2\s*(?=>.+<\/a)/";//matches the opening anchor tag, as long 
        //as it has the string 'href' in it and it does not have the string '(target)=("_blank")' already
        //$clean_update_str = rawurlencode(preg_replace($pattern,"$1$2http://$3$2 target=\"_blank\"",str_replace("http://","",strip_tags($raw_update_str, "<a>,<b>,<i>,<em>,<sup>,<sub>,<span>"))));
        $clean_update_str = rawurlencode($raw_update_str);
        $to_update = TRUE;
    }
    else {
        $id = $_GET["da_notes"];
        $clean_update_str = "";
        $to_update = FALSE;
    }
    try {
        $album = Album::get_by_id($id);
        if($album) {
            if($to_update && $session->user_perms === 1) {
                $whose = isset($_SESSION["back_to_all"]) ? ($_SESSION["back_to_all"] ? "?o_id=a":"?o_id=".$album->owner_id):"";
                Session::set_message("As a guest, you do not have sufficient privileges to add or edit album notes", "notice");
                redirect_to("list_albums.php{$whose}");
            }
            if(!$to_update && $session->user_perms === 1) {
                $whose = isset($_SESSION["back_to_all"]) ? ($_SESSION["back_to_all"] ? "?o_id=a":"?o_id=".$album->owner_id):"";
                Session::set_message("As a guest, you do not have sufficient privileges to delete album notes", "notice");
                redirect_to("list_albums.php{$whose}");
            }
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to edit or delete notes of albums you did not personally create", "notice");
                redirect_to("index.php");
            }
            if($to_update && $clean_update_str === $album->notes) {
                Session::set_message ("You did not make any changes. There was nothing to update","notice");
                $redirect_str = "list_albums.php?o_id=";
                if(isset($_SESSION["back_to_all"]) && $_SESSION["back_to_all"])
                    $redirect_str .= "a";
                else
                    $redirect_str .= "{$album->owner_id}";
                $redirect_str .= "&an_id={$album->id}";
                if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
                redirect_to($redirect_str);
            }
            if($raw_str_len > Album::MAX_NOTES_LEN) {
                $raw_update_str = substr($raw_update_str, 0, Album::MAX_NOTES_LEN);
                $clean_update_str = rawurlencode(preg_replace($pattern,"$1$2http://$3$2 target=\"_blank\"",str_replace("http://","",strip_tags($raw_update_str, "<a>,<b>,<i>,<em>,<sup>,<sub>"))));
                $album->update("notes={$clean_update_str}");
                Session::set_message("The caption you provided was ".$raw_str_len." characters long, exceeding the ".Photo::MAX_CAPT_LEN."-character limit. The excess was not saved", "notice");
                $redirect_str = "list_albums.php?o_id=";
                if(isset($_SESSION["back_to_all"]) && $_SESSION["back_to_all"])
                    $redirect_str .= "a";
                else
                    $redirect_str .= "{$album->owner_id}";
                $redirect_str .= "&an_id={$album->id}";
                if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
                redirect_to($redirect_str);
            }
            else {
                $album->update("notes={$clean_update_str}");
                $redirect_str = "list_albums.php?o_id=";
                if(isset($_SESSION["back_to_all"]) && $_SESSION["back_to_all"])
                    $redirect_str .= "a";
                else
                    $redirect_str .= "{$album->owner_id}";
                if($to_update) {
                    $redirect_str .= "&an_id={$album->id}";
                    if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
                }
                if($to_update)
                    Session::set_message ("The notes on \"{$album->albumname}\" were successfully updated", "success");
                else
                    Session::set_message ("The notes on \"{$album->albumname}\" were successfully deleted", "success");
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
