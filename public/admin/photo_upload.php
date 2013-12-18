<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) { 
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=photo_upload");
}
$admin = true; $paginated = false;
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
include_layout_template("header.php");
if(isset($_POST["submit"])) {
    $caption = strip_tags(trim($_POST["caption"]), "<a>,<b>,<i>,<em>,<sup>,<sub>");
    $album_id = $_POST["album_id"];
    if(isset($_POST["cover"]))
        $cover = $_POST["cover"];
    else
        $cover = null;
    try{
        $photo = Photo::validate_photo($_FILES["photo"], $caption, $album_id, $cover);
        Photo::upload_photo($photo);
        Session::set_message("The photo \"{$photo["name"]}\" was uploaded successfully", "success");
        redirect_to("list_photos.php?a_id={$photo[1]}");
    } catch (Exception $e) { $message = $e->getMessage(); $message_type = "error"; }
} else {
    list ($message, $message_type) = $session->get_message();
    $caption = $album_id = $cover = "";
}

if(isset($_GET["a_id"])) {
    try {
        $album_record = Album::get_by_id($_GET["a_id"]);
        if(!$album_record) redirect_to("photo_upload.php");
    } catch (Exception $e) { redirect_to("photo_upload.php"); }
}

?>

<div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
    <a id="to_admin_home" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php
    if(isset($_SESSION["back_to_all"]) && isset($album_record)) {
        if(isset($_SESSION["cancelupload_to_photolist"])) 
            echo HOME."admin/list_photos.php?a_id={$album_record->id}";
        else {
            echo HOME."admin/list_albums.php?o_id=";
            echo $_SESSION["back_to_all"] ? "a": $album_record->owner_id;
        }
    }
    else echo HOME."admin/index.php";
    ?>">Cancel</a>
    <h2 class="hash_change_removed_2 faded">Photo Upload</h2>
    <div class="msg_bottom_margin">
        <?php display_message($message, $message_type); ?>
    </div>
    <?php
        $output= "";
        $albums = $session->user_perms === 1 ? User::get_the_original()->get_owned_albums():User::get_by_id($session->user_id)->get_owned_albums();
        if($albums) {
            $output .= "<form class='big_form' id=\"photo_upload\" action=\"";
            HOME."admin/photo_upload.php";
            if(isset($_GET["a_id"])) $output .= "?a_id={$_GET["a_id"]}";
            $output .= "\" method=\"POST\" enctype=\"multipart/form-data\">\n";
            $output .= "<input type=\"hidden\" name=\"MAX_FILE_SIZE\" value=\"";
            $output .= $session->user_perms === 1 ?"1":"2";
            $output .= "000000\" class=\"form_field\">\n";
            $output .= "<div class=\"ui_button file_selector\"><input type=\"file\" name=\"photo\" class=\"form_field validate_on_sub reqrd msg_span\">SELECT A PHOTO</div>\n";
            $output .= "<p class=\"no_script_para\"><span class=\"label\" id=\"for_caption\">Enter a caption below</span></p><textarea maxlength=\"4000\" name=\"caption\" class=\"p_holder form_field msg_span hash_change_removed_3 slided\">{$caption}</textarea><p></p>\n";
            $output .= "<select name=\"album_id\" class=\"form_field validate_on_sub reqrd msg_span hash_change_removed_3 slided\"><option id=\"no_selection\" value=\"0\">**Select an album**</option>\n";
            echo $output;
            if(is_array($albums)) {
                        foreach($albums as $album)
                            if($album->id == $album_id || (isset ($_GET["a_id"]) && $album->id === $_GET["a_id"]))
                                echo "<option value=\"{$album->id}\" selected=\"selected\">{$album->albumname}</option>\n";
                            else
                                echo "<option value=\"{$album->id}\">{$album->albumname}</option>\n";
                    }
                    else
                        if($albums->id == $album_id || (isset ($_GET["a_id"]) && $albums->id === $_GET["a_id"]))
                                echo "<option value=\"{$albums->id}\" selected=\"selected\">{$albums->albumname}</option>\n";
                            else
                                echo "<option value=\"{$albums->id}\">{$albums->albumname}</option>\n";
                        
            $output = "</select></p>\n";
            $output .= "<div class=\"radio_wrapper hash_change_removed_3 slided\"><span class=\"for_radios\" id=\"for_cover_radios\">Make album cover?</span><ul name=\"cover_radios\" left=\"160px\" class=\"radios none_checked form_field validate_on_sub msg_span yes_no_choice\"><li id=\"no\"><span class=\"pre\"></span><input class=\"form_field\" type=\"radio\" name=\"cover\" value=\"0\"";
            if($cover === "0") $output .= "checked";
            $output .= "><span class=\"past\"></span></li><li id=\"yes\"><span class=\"pre\"></span><input class=\"form_field\" type=\"radio\" name=\"cover\" value=\"1\"";
            if($cover === "1") $output .= "checked";
            $output .= "><span class=\"past\"></span></li></ul></div>\n";
            $output .= "<div class=\"hash_change_removed_3 slided\"><input class=\"form_field ui_button\" type=\"submit\" name=\"submit\" value=\"UPLOAD\"></div>\n</form>";
            echo $output;
        } else {
            $output .= "<p class\"hash_change_removed_2 slided\"id=\"no_albums_alert\">You haven't created any album yet. Please create one before you can upload photos.</p>\n";
            $output .= "<a class=\"hash_change_removed_1 faded\" href=\"create_album.php\">Create a new album</a>";
            echo $output;
        }
    ?>
</div>

<?php include_layout_template("footer.php"); ?>