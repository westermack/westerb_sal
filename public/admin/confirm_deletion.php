<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}
$admin = true; $paginated = false;
include_layout_template("header.php");

//da_id => delete album of specific id
if(isset($_GET["da_id"])) {
    try {
        $album_record = Album::get_by_id($_GET["da_id"]);
        if(!$album_record) {
            Session::set_message("The album you tried to delete does not exist. Please select a valid album to delete", "error");
            redirect_to("list_albums.php?o_id=a");
        }
        if($album_record->photo_count === 0) redirect_to("list_albums.php?o_id=a");
        $confirmation_info = "<p>The album \"{$album_record->albumname}\" has {$album_record->photo_count} ";
        $confirmation_info .= $album_record->photo_count == 1 ? "photo" : "photos";
        $confirmation_info .= " in it. Deleting it will delete the ";
        $confirmation_info .= $album_record->photo_count == 1 ? "photo" : "photos";
        $confirmation_info .= " as well.</p>\n";
        $confirmation_info .= "<p>Do you still wish to proceed?</p>\n";
        $confirmation_info .= "<div><a class=\"ui_button\" href=\"delete_album.php?da_id={$album_record->id}\">PROCEED</a>";
    } catch (Exception $e) {
        Session::set_message("The album you tried to delete does not exist. Please select a valid album to delete", "error");
        redirect_to("list_albums.php?o_id=a");
    }
}
//a_id => album of specific id whose photos to delete
elseif(isset($_GET["a_id"])) {
    try {
        $album_record = Album::get_by_id($_GET["a_id"]);
        if(!$album_record) {
            Session::set_message("The album whose photos you tried to delete does not exist. Please select a valid album first", "error");
            redirect_to("list_albums.php?o_id=a");
        }
        if($album_record->photo_count === 0) redirect_to("list_albums.php?o_id=a"); //no photos in album and, therefore, no point in accessing this page
        $confirmation_info = "<p>Are you sure you want to delete all {$album_record->photo_count} photos in \"$album_record->albumname\" ?</p>\n";
        $confirmation_info .= "<div><a class=\"ui_button\" href=\"delete_photo.php?a_id={$album_record->id}\">I AM SURE</a>";
    } catch (Exception $e) {
        Session::set_message("The album whose photos you tried to delete does not exist. Please select a valid album first", "error");
        redirect_to("list_albums.php?o_id=a");
    }
}
else redirect_to("list_albums.php?o_id=a");

?>

<div id="main">
    <div id="confirm_del_wrapper">
        <?php
            echo $confirmation_info;
            echo "<a class=\"ui_button\" href=\"";
            //If deletion request is from 'list_photos.php', 'cancelupload_to_photolist' is set to TRUE
            //else it's from 'list_albums.php' and 'back_to_all' is set, TRUE if album owner (o_id) is 'a' (=all) or FALSE if it's owner of specific id
            if(isset($_SESSION["cancelupload_to_photolist"]))
                echo "list_photos.php?a_id={$album_record->id}";
            else {
                echo "list_albums.php?o_id=";
                echo (isset($_SESSION["back_to_all"]) && !$_SESSION["back_to_all"]) ? $album_record->owner_id : "a";
            }
            echo "\">CANCEL</a></div>";
        ?>
    </div>
</div>

<?php include_layout_template("footer.php"); ?>




