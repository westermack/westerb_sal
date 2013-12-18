<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=list_albums");
}
$admin = true; $paginated = ($session->user_perms === 2)?true:false;
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
$js_redirect = true;
include_layout_template("header.php");

$o_id_set = isset($_GET["o_id"]);
if($o_id_set) {
    $current_set = (isset($_GET["c_set"]) && !empty($_GET["c_set"]) && (int)$_GET["c_set"] !== 0) ? $_GET["c_set"] : 1;
    $units_per_set = 8;
    if($_GET["o_id"] == "a") {
        if($session->user_perms === 2)
            redirect_to ("list_albums.php?o_id={$session->user_id}");
        $_SESSION["owner_total_albums"] = $unit_count = Album::count_all();
        $title = "All Albums (<span id=\"u_count\">{$unit_count}</span> total)";
        $pagination = new Pagination($current_set, $units_per_set, $unit_count);
        $albums = Album::get_subset_of_all($units_per_set, $pagination->offset);
        $_SESSION["back_to_all"] = TRUE;
    } else {
        try {
            $owner_record = User::get_by_id($_GET["o_id"]);
            if(!$owner_record) {
                Session::set_message("The albums you are trying to access do not exist", "error");
                $session->user_perms === 2 ? redirect_to ("index.php"):redirect_to("list_albums.php");
            }
            if($owner_record && $session->user_perms === 2 && $owner_record->id != $session->user_id)
                redirect_to("list_albums.php?o_id={$session->user_id}");
            $_SESSION["owner_total_albums"] = $unit_count = $owner_record->count_owned_albums();
            $title = $owner_record->full_name."'s Albums (<span id=\"u_count\">{$unit_count}</span> total)";
            $pagination = new Pagination($current_set, $units_per_set, $unit_count);
            $albums = Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE owner_id = {$owner_record->id} LIMIT {$units_per_set} OFFSET {$pagination->offset}");
            if(!$albums) {
                if($session->user_perms === 2) ;
                else {
                    Session::set_message("The albums you are trying to access do not exist", "error");
                    redirect_to("list_albums.php");
                }
            }
            $_SESSION["back_to_all"] = FALSE;
        } catch (Exception $e) {
            Session::set_message("The albums you are trying to access do not exist", "error");
            $session->user_perms === 2 ? redirect_to ("index.php"):redirect_to("list_albums.php");
        }
     }
     if(isset($_GET["an_id"])) {
         try {
             $album_record = Album::get_by_id($_GET["an_id"]);
             if($album_record) {
                 if($unit_count > 3 && is_array($albums))
                    $width_adjust_class = "adjusted_for_notes";
                 else
                     $width_adjust_class = "";
                }
             else redirect_to("list_albums.php?o_id={$owner_record->id}");
         } catch (Exception $e) { redirect_to("list_albums.php?o_id={$owner_record->id}"); }
     } else { $width_adjust_class = ""; };
    $noscript_nav = "";
    if($unit_count > $units_per_set):
    $noscript_nav .= "<div id=\"nav\">";
    $noscript_nav .= "<a href=\"";
    $noscript_nav .= $pagination->previous_set == 0 ? "#" : "list_albums.php";
    if($o_id_set) $noscript_nav .= "?o_id={$_GET["o_id"]}&";
    $noscript_nav .= $o_id_set ? "": "?";
    $noscript_nav .= "c_set={$pagination->previous_set}\" class=\"scriptable_gen_nav_link prev_set\"><div class=\"ui_button nav_opt";
    if($pagination->previous_set == 0) $noscript_nav .= " inactive";
    $noscript_nav .= "\" id=\"prev\">&#x2227;";
    $noscript_nav .= "</div>"; //closes the 'prev button' div
    $noscript_nav .= "</a>";
    $noscript_nav .= "<a href=\"";
    $noscript_nav .= !$pagination->next_set ? "#" : "list_albums.php";
    if($o_id_set) $noscript_nav .= "?o_id={$_GET["o_id"]}&";
    $noscript_nav .= $o_id_set ? "": "?";
    $noscript_nav .= "c_set={$pagination->next_set}\" class=\"scriptable_gen_nav_link next_set\"><div class=\"ui_button nav_opt";
    if(!$pagination->next_set) $noscript_nav .= " inactive";
    $noscript_nav .= "\" id=\"next\">&#x2228;";
    $noscript_nav .= "</div>"; //closes the 'next button' div
    $noscript_nav .= "</a>";
    $noscript_nav .= "</div>"; //closes the 'nav' div
    endif;
    
    $noscript_content = "";
    if(is_array($albums)){
        foreach ($albums as $album) {
            $noscript_content .= "<div class=\"album hover_trigger";
            if($album->photo_count == 0) $noscript_content .= " border_grey";
            $noscript_content .= "\" a_id=\"{$album->id}\" name=\"";
            $noscript_content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
            $noscript_content .= "\">";
            if($album->photo_count != 0)
                $noscript_content .= "<a class='scriptable_hash_changer' id='to_list_photos_{$album->id}' href=\"".HOME."admin/list_photos.php?a_id={$album->id}\">";
            $noscript_content .= "<img src=\"{$album->random_photo_path}\">";
            if($album->photo_count != 0)
                $noscript_content .= "</a>";
            $noscript_content .= "<div class=\"absolute_pos name_edit_save hover_triggered\">";
            if(isset($_GET["enma_id"]) && $_GET["enma_id"] == $album->id) {
                $noscript_content .= "<form class=\"mini_form a_name_edit\" method=\"post\" action=\"";
                HOME."admin/edit_aname.php?enma_id={$album->id}";
                if(isset($_GET["c_set"])) $noscript_content .= "&s_no={$_GET["c_set"]}";
                $noscript_content .= "\"><input class=\"mini_form_edit_field\" name=\"a_name\" type=\"text\" maxlength=\"100\" value=\"{$album->albumname}\">";
                $noscript_content .= "<div class=\"cancel_counter\">";
                $noscript_content .= "<a href=\"list_albums.php?o_id=";
                $noscript_content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
                if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
                $noscript_content .= "\" class=\"scriptable_gen_link\">Cancel editing</a>";
                $noscript_content .= "<span class=\"char_counter\"></span>";
                $noscript_content .= "</div>";
                $noscript_content .= "<input class=\"save scriptable_gen_link\" type=\"submit\" value=\"\" title=\"Update changes\">";
                $noscript_content .= "</form>";
            } else {
                $noscript_content .= "<span class=\"name\">";
                $noscript_content .= $album->albumname;
                $noscript_content .= "</span>";
                $noscript_content .= "<a href=\"list_albums.php?o_id=";
                $noscript_content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
                if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
                $noscript_content .= "&enma_id={$album->id}\" class=\"edit edit_a_name scriptable_gen_link\" title=\"Edit album name\"></a>";
            }
            $noscript_content .= "</div>";
            $noscript_content .= "<a href=\"";
            if($album->photo_count > 0)
                $noscript_content .= "confirm_deletion.php";
            else
                $noscript_content .= "delete_album.php";
            $noscript_content .= "?da_id={$album->id}\" title=\"Delete album\" class=\"scriptable_gen_link confirm_del album_delete\"><div class=\"absolute_pos delete hover_triggered\">";
            $noscript_content .= "&#x2717;";
            $noscript_content .= "</div></a>";
            if($session->user_id == $album->owner_id || ($session->user_perms == 1 && $album->owner_id == User::get_the_original()->id)) {
                $noscript_content .= "<a href='photo_upload.php?a_id={$album->id}' class='scriptable_gen_link photo_upload'><div class='absolute_pos upload hover_triggered'>";
                $noscript_content .= "Upload a photo";
                $noscript_content .= "</div></a>";
            }
            $noscript_content .= "<a href=\"list_albums.php?o_id=";
            $noscript_content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id)
                $noscript_content .= "";
            else
                $noscript_content .= "&an_id={$album->id}";
            if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
            $noscript_content .= "\" class=\"scriptable_gen_link notes\"><div class=\"absolute_pos notes hover_triggered\"";
            if(($session->user_perms != 1 && $session->user_id != $album->owner_id) || ($session->user_perms == 1 && $album->owner_id != User::get_the_original()->id))
                $noscript_content .= " style='top: 41px; '";
            $noscript_content .= ">";
            if($album->notes != "")
                if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id)
                    $noscript_content .= "Close notes";
                else
                    $noscript_content .= "See notes";
            else
                if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id)
                    $noscript_content .= "Cancel";
                else
                    $noscript_content .= "Add notes";
            $noscript_content .= "</div></a>";
            $noscript_content .= "<div class=\"absolute_pos date_owner list_albums_pg hover_triggered\">";
            $noscript_content .= "<div>Created on {$album->date_to_text()}</div>";
            if($_GET["o_id"] == "a") $noscript_content .= "<div>By {$album->owner()->full_name}</div>";
            $noscript_content .= "<div>{$album->photo_count} ";
            $noscript_content .= $album->photo_count == 1 ? "photo</div>" : "photos</div>";
            $noscript_content .= "</div>";
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id) {
                $noscript_content .= "<div class=\"a_notes_wrapper\">";
                $noscript_content .= "<form class='mini_form' action=\"";
                HOME."admin/edit_notes.php?a_notes={$album->id}";
                if(isset($_GET["c_set"])) $noscript_content .= "&s_no={$_GET["c_set"]}";
                $noscript_content .= "\" method=\"post\"><textarea name=\"a_notes\" class=\"anotes mini_form_edit_field\" maxlength=\"3000\">";
                if($album->notes != "") $noscript_content .= preg_replace('/ target="_blank"/', '', rawurldecode($album->notes));
                $noscript_content .= "</textarea>";
                $noscript_content .= "<div class=\"notes_edit\"><input type=\"submit\" value=\"";
                if($album->notes != "")
                    $noscript_content .= "Update changes";
                else
                    $noscript_content .= "Add album notes";
                $noscript_content .= "\" class=\"scriptable_gen_link\">";
                $noscript_content .= "<span class=\"char_counter\"></span>";
                if($album->notes != "") {
                    $noscript_content .= "<a class=\"scriptable_gen_link\" href=\"edit_notes.php?da_notes={$album->id}";
                    if(isset($_GET["c_set"])) $noscript_content .= "&s_no={$_GET["c_set"]}";
                    $noscript_content .= "\" title=\"Delete album notes\"><div class=\"absolute_pos delete\">&#x2717;</div></a>";
                }
                $noscript_content .= "</div></form>";
                $noscript_content .= "</div>";   
            }
            $noscript_content .= "</div>";   
        }
    }
    elseif(!$albums && $session->user_perms === 2) {
        $noscript_content .= "<p id=\"no_albums_alert\">You haven't created any album yet.</p>";
    }
    else {
        $noscript_content .= "<div class=\"album hover_trigger";
        if($albums->photo_count == 0) $noscript_content .= " border_grey";
        $noscript_content .= "\" a_id=\"{$albums->id}\" name=\"";
        $noscript_content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
        $noscript_content .= "\">";
        if($albums->photo_count != 0)
            $noscript_content .= "<a class='scriptable_hash_changer' id='to_list_photos_{$albums->id}' href=\"".HOME."admin/list_photos.php?a_id={$albums->id}\">";
        $noscript_content .= "<img src=\"{$albums->random_photo_path}\">";
        if($albums->photo_count != 0)
            $noscript_content .= "</a>";
        $noscript_content .= "<div class=\"absolute_pos name_edit_save hover_triggered\">";
        if(isset($_GET["enma_id"]) && $_GET["enma_id"] == $albums->id) {
            $noscript_content .= "<form class=\"mini_form a_name_edit\" method=\"post\" action=\"";
            HOME."admin/edit_aname.php?enma_id={$albums->id}";
            if(isset($_GET["c_set"])) $noscript_content .= "&s_no={$_GET["c_set"]}";
            $noscript_content .= "\"><input class=\"mini_form_edit_field\" name=\"a_name\" type=\"text\" maxlength=\"100\" value=\"{$albums->albumname}\">";
            $noscript_content .= "<div class=\"cancel_counter\">";
            $noscript_content .= "<a href=\"list_albums.php?o_id=";
            $noscript_content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
            if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
            $noscript_content .= "\" class=\"scriptable_gen_link\">Cancel editing</a>";
            $noscript_content .= "<span class=\"char_counter\"></span>";
            $noscript_content .= "</div>";
            $noscript_content .= "<input class=\"save scriptable_gen_link\" type=\"submit\" value=\"\" title=\"Update changes\">";
            $noscript_content .= "</form>";
        } else {
            $noscript_content .= "<span class=\"name\">";
            $noscript_content .= $albums->albumname;
            $noscript_content .= "</span>";
            $noscript_content .= "<a href=\"list_albums.php?o_id=";
            $noscript_content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
            $noscript_content .= "&enma_id={$albums->id}\" class=\"edit edit_a_name scriptable_gen_link\" title=\"Edit album name\"></a>";
        }
        $noscript_content .= "</div>";
        $noscript_content .= "<a href=\"";
            if($albums->photo_count > 0)
                $noscript_content .= "confirm_deletion.php";
            else
                $noscript_content .= "delete_album.php";
        $noscript_content .= "?da_id={$albums->id}\" title=\"Delete album\" class=\"scriptable_gen_link confirm_del album_delete\"><div class=\"absolute_pos delete hover_triggered\">";
        $noscript_content .= "&#x2717;";
        $noscript_content .= "</div></a>";
        if($session->user_id == $albums->owner_id || ($session->user_perms == 1 && $albums->owner_id == User::get_the_original()->id)) {
            $noscript_content .= "<a href='photo_upload.php?a_id={$albums->id}' class='scriptable_gen_link photo_upload'><div class='absolute_pos upload hover_triggered'>";
            $noscript_content .= 'Upload a photo';
            $noscript_content .= "</div></a>";
        }
        $noscript_content .= "<a href=\"list_albums.php?o_id=";
        $noscript_content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id)
                $noscript_content .= "";
            else
                $noscript_content .= "&an_id={$albums->id}";
        if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
        $noscript_content .= "\" class=\"scriptable_gen_link notes\"><div class=\"absolute_pos notes hover_triggered\"";
        if(($session->user_perms != 1 && $session->user_id != $albums->owner_id) || ($session->user_perms == 1 && $albums->owner_id != User::get_the_original()->id))
            $noscript_content .= " style='top: 41px; '";
        $noscript_content .= ">";
        if($albums->notes != "")
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id)
                $noscript_content .= "Close notes";
            else
                $noscript_content .= "See notes";
        else
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id)
                $noscript_content .= "Cancel";
            else
                $noscript_content .= "Add notes";
        $noscript_content .= "</div></a>";
        $noscript_content .= "<div class=\"absolute_pos date_owner list_albums_pg hover_triggered\">";
        $noscript_content .= "<div>Created on {$albums->date_to_text()}</div>";
        if($_GET["o_id"] == "a") $noscript_content .= "<div>By {$albums->owner()->full_name}</div>";
        $noscript_content .= "<div>{$albums->photo_count} ";
        $noscript_content .= $albums->photo_count == 1 ? "photo</div>" : "photos</div>";
        $noscript_content .= "</div>";
        if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id) {
            $noscript_content .= "<div class=\"a_notes_wrapper\">";
            $noscript_content .= "<form class='mini_form' action=\"";
            HOME."admin/edit_notes.php?a_notes={$albums->id}";
            if(isset($_GET["c_set"])) $noscript_content .= "&s_no={$_GET["c_set"]}";
            $noscript_content .= "\" method=\"post\"><textarea name=\"a_notes\" class=\"anotes mini_form_edit_field\" maxlength=\"3000\">";
            if($albums->notes != "") $noscript_content .= preg_replace('/ target="_blank"/', '', rawurldecode($albums->notes));
            $noscript_content .= "</textarea>";
            $noscript_content .= "<div class=\"notes_edit\"><input type=\"submit\" value=\"Update changes\" class=\"scriptable_gen_link\">";
            $noscript_content .= "<span class=\"char_counter\"></span>";
            if($albums->notes != "") {
                $noscript_content .= "<a class=\"scriptable_gen_link\" href=\"edit_notes.php?da_notes={$albums->id}";
                if(isset($_GET["c_set"])) $noscript_content .= "&s_no={$_GET["c_set"]}";
                $noscript_content .= "\" title=\"Delete album notes\"><div class=\"absolute_pos delete\">&#x2717;</div></a>";
            }
            $noscript_content .= "</div></form>";
            $noscript_content .= "</div>";   
        }
        $noscript_content .= "</div>";
    }
    $_SESSION["cancelcreate_to"] = $_GET["o_id"];
    if(isset($_SESSION["cancelupload_to_photolist"])) unset($_SESSION["cancelupload_to_photolist"]);
} else {
    if($session->user_perms === 2)
        redirect_to ("list_albums.php?o_id={$session->user_id}");
    $title = "Salon Albums";
    $noscript_content = admin_albums_list();
    $_SESSION["cancelcreate_to"] = "salon_albums";
    if(isset($_SESSION["owner_total_albums"])) unset($_SESSION["owner_total_albums"]);
    if(isset($_SESSION["back_to_all"])) unset($_SESSION["back_to_all"]);
    if(isset($_SESSION["cancelupload_to_photolist"])) unset($_SESSION["cancelupload_to_photolist"]);
    $width_adjust_class = $noscript_nav = "";
}
?>

<div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
    <a id="to_admin_home" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php echo $session->user_perms === 2 ? HOME."admin/index.php":(!$o_id_set ? HOME."admin/index.php": HOME."admin/list_albums.php"); ?>"><< Back</a><span class="hash_change_removed_1 faded link_separator"> |</span>
    <span <?php echo $session->user_perms === 1?"original_user_id='".User::get_the_original()->id."'":"cur_user_id='{$session->user_id}'"; ?> class="modal_caller_parent new_album hash_change_removed_1 faded"><a href="<?php echo HOME.'admin/create_album.php' ?>" class="new_album_modal scriptable_gen_link">Create a new album</a></span>
    <div id="album_list" class="msg_bottom_margin">
        <h2 class="hash_change_removed_2 faded" id="s_group_id" s_group="<?php echo !isset($_GET["o_id"]) ? "":($_GET["o_id"] === "a" ? "o_id=all":"o_id=".$owner_record->id) ?>"><?php echo $title ?></h2>
        <?php
            list($message, $message_type) = $session->get_message();
            display_message($message, $message_type);
        ?>
        <div id="ux_nav_guide" class="<?php echo $width_adjust_class ?>"><?php if(isset($pagination->ux_nav_guide)) echo $pagination->ux_nav_guide ?></div>
        <?php if($o_id_set) echo "<div id=\"albums_nav_wrapper\" class=\"{$width_adjust_class}\">" ?>
        <div id="albums_wrapper" class="u_wrapper" per_set="8" scroll_per_set="8" albums_upload_dir="<?php echo Album::$albums_upload_dir; ?>">
                <?php if(isset($albums) && $albums && $unit_count > $units_per_set) echo "<div class=\"movable\">"; ?>
                <?php echo $noscript_content; ?>
                <?php if(isset($albums) && $albums && $unit_count > $units_per_set) echo "</div>"; ?>
            </div>
            <?php echo $noscript_nav; ?>
        <?php if($o_id_set) echo "</div>" ?>
    </div>
    
</div>

<?php //this script is only needed when there are multiple album-by links to script i.e when the user is not Normal
    if($session->user_perms !== 2)
        echo "<script> $(function() { westerb_sal.exec_code_for_admin_list_albums(); }); </script>";
?>

<?php //this JS code will only run if the user id Normal and she, through URL-navigation, has selected to edit/see/add either the album notes or the name
    if(isset($_GET['an_id']) || isset($_GET['enma_id'])) {
        echo "<script>\n";
        echo "$(function() {\n";
        echo "$('form.mini_form').each(function() {\n";
        echo "var cur_field = $(this).children('.mini_form_edit_field'),\n";
        echo "cur_counter = $(this).children('div').children('span'), txt_len = cur_field.val().length,\n";
        echo "max_len = parseInt(cur_field.attr('maxlength'), 10);\n";
        echo "cur_counter.text(max_len - txt_len);\n";
        echo "});\n";
        echo "});\n";
        echo "</script>\n";
    }
?>

<?php include_layout_template("footer.php"); ?>