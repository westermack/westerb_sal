<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message('You have to be logged in to access that page', 'info');
    redirect_to('login.php');
}

if(isset($_GET['p_cap']) || isset($_GET['dp_cap'])) {
    if(isset($_GET['p_cap'])) {
        $id = $_GET['p_cap'];
        $raw_update_str = str_replace('\r\n','\n',trim($_POST['p_cap']));
        $raw_str_len = strlen($raw_update_str);
        $pattern = "/(<a\s+(?:href)=?)(['\"])([^=]*)\2\s*(?=>.+<\/a)/";//matches the opening anchor tag,
        //as long as it has the string 'href' in it and it does not have the string '(target)=("_blank")'
        $clean_update_str = rawurlencode(preg_replace($pattern,"$1$2http://$3$2 target=\"_blank\"",
                str_replace('http://','',strip_tags($raw_update_str, '<a>,<b>,<i>,<em>,<sup>,<sub>'))));
        $to_update = TRUE;
    }
    else {
        $id = $_GET['dp_cap'];
        $clean_update_str = '';
        $to_update = FALSE;
    }
    try {
        $photo = Photo::get_by_id($id);
        if($photo) {
            if($to_update && $session->user_perms === User::GUEST_PERMS_CODE) {
                Session::set_message('As a guest, you do not have sufficient privileges to add or edit 
                    photo captions', 'notice');
                redirect_to("list_photos.php?a_id={$photo->album_id}");
            }
            if(!$to_update && $session->user_perms === User::GUEST_PERMS_CODE) {
                Session::set_message('As a guest, you do not have sufficient privileges to delete photo captions', 'notice');
                redirect_to("list_photos.php?a_id={$photo->album_id}");
            }
            $album = Album::get_by_id($photo->album_id);
            if($session->user_perms === User::REGULAR_PERMS_CODE && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to edit or delete captions of photos you did not personally upload", "notice");
                redirect_to("index.php");
            }
            if($to_update && $clean_update_str === $photo->caption) {
                Session::set_message ("You did not make any changes. There was nothing to update","notice");
                $redirect_str = "list_photos.php?a_id={$photo->album_id}";
                if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
                redirect_to($redirect_str);
            }
            if($raw_str_len > Photo::MAX_CAPT_LEN) {
                $raw_update_str = substr($raw_update_str, 0, Photo::MAX_CAPT_LEN);
                $clean_update_str = rawurlencode(preg_replace($pattern,"$1$2http://$3$2 target=\"_blank\"",str_replace("http://","",strip_tags($raw_update_str, "<a>,<b>,<i>,<em>,<sup>,<sub>"))));
                $photo->update("caption={$clean_update_str}");
                Session::set_message("The caption you provided was ".$raw_str_len." characters long, exceeding the ".Photo::MAX_CAPT_LEN."-character limit. The excess was not saved", "notice");
                redirect_to("list_photos.php?a_id={$photo->album_id}");
            }
            else {
                $photo->update("caption={$clean_update_str}");
                $redirect_str = "list_photos.php?a_id={$photo->album_id}";
                if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
                if($to_update)
                    Session::set_message ("The caption on \"{$photo->filename}\" was successfully updated", "success");
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
