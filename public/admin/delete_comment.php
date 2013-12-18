<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}

//$admin = true; FOR AJAX???

if(isset($_GET["c_id"])) {
    try {
        $comment = Comment::get_by_id($_GET["c_id"]);
        if($comment) {
            $photo = Photo::get_by_id($comment->photo_id);
            $album = Album::get_by_id($photo->album_id);
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to delete comments of photos you did not personally upload", "notice");
                redirect_to("index.php");
            }
            $comment->delete();
            $redirect_str = "list_photos.php?a_id={$photo->album_id}";
            if($photo->comment_count > 0) $redirect_str .= "&pc_id={$photo->id}";
            if(isset($_GET["s_no"])) $redirect_str .= "&c_set={$_GET["s_no"]}";
            redirect_to($redirect_str);
        }
        else redirect_to("index.php");
    } catch(Exception $e) { redirect_to("index.php"); }
}
elseif(isset($_GET["p_id"])) {
    try {
        $photo = Photo::get_by_id($_GET["p_id"]);
        if($photo) {
            $album = Album::get_by_id($photo->album_id);
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to delete comments of photos you did not personally upload", "notice");
                redirect_to("index.php");
            }
            $photo->delete_comments();
            Session::set_message("All comments on \"{$photo->filename}\" were successfully deleted", "success");
            redirect_to("list_photos.php?a_id={$photo->album_id}");
        }
        else redirect_to("index.php");
    } catch(Exception $e) { redirect_to("index.php"); }
}
else
    redirect_to("index.php");

$database->close_connection();
?>
