<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}

//$admin = true; FOR AJAX???

if(isset($_GET["p_id"])) {
    try {
        $photo = Photo::get_by_id($_GET["p_id"]);
        if($photo) {
            $album = Album::get_by_id($photo->album_id);
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to delete photos you did not personally upload", "notice");
                redirect_to("index.php");
            }
            $photo->delete_photo();
            Session::set_message("The photo \"{$photo->filename}\" was successfully deleted", "success");
            redirect_to("list_photos.php?a_id={$photo->album_id}");
        }
        else {
            Session::set_message("The photo you tried to delete does not exist", "error");
            $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
        }
    } catch(Exception $e) {
        Session::set_message("The photo you tried to delete does not exist", "error");
        $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
    }
}
elseif(isset($_GET["a_id"])) {
    try {
        $album = Album::get_by_id($_GET["a_id"]);
        if($album) {
            if($session->user_perms === 2 && $album->owner_id != $session->user_id) {
                Session::set_message("You do not have sufficient privileges to delete photos you did not personally upload", "notice");
                redirect_to("index.php");
            }
            if ($album->photo_count === 0) {
                Session::set_message("There are no photos to delete in this album", "error");
                redirect_to("list_photos.php?a_id={$album->id}");
            }
            $album->delete_photos();
            Session::set_message("All photos were deleted successfully", "success");
            redirect_to("list_photos.php?a_id={$album->id}");
        } else {
            Session::set_message("The album whose photos you tried to delete does not exist", "error");
            $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
        }
    } catch (Exception $e) {
        Session::set_message("The album whose photos you tried to delete does not exist", "error");
        $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
    }
}
else {
    Session::set_message("Please pick an album and select a photo to delete before accessing the delete page", "error");
    $session->user_perms === 2 ?  redirect_to ("list_albums.php?o_id={$session->user_id}"):redirect_to("list_albums.php");
}

$database->close_connection();
?>
