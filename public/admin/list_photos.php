<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=list_photos");
}
$admin = $paginated = true;
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
if(!isset($_GET["a_id"])) {
    Session::set_message("Please select the album you wish to view first", "notice");
    redirect_to("list_albums.php");
} else {
    try{
        $album_record = Album::get_by_id($_GET["a_id"]);
        if(!$album_record) {
            Session::set_message("The album you tried to access does not exist", "error");
            redirect_to("list_albums.php");
        }
        if($session->user_perms === 2 && $album_record->owner_id != $session->user_id) {
            Session::set_message("You do not have sufficient privileges to view photos in albums you did not personally create", "notice");
            redirect_to("list_albums.php?o_id={$session->user_id}");
        }
        $current_set = (isset($_GET["c_set"]) && !empty($_GET["c_set"]) && (int)$_GET["c_set"] !== 0) ? $_GET["c_set"] : 1;
        $units_per_set = 4;//p_count_before_simulation_starts
        $title = $album_record->albumname." (<span";
        if($session->user_perms === 1) $title .= " p_count_before_simulation_starts=\"{$album_record->photo_count}\""; //capture the static value of the photo count before the start of the simulation for the Guest, so that the right count can be restored when navigation links are clicked
        $title .= " id=\"u_count\">{$album_record->photo_count}</span> photo<span id=\"plural_s\">";
        $title .= $album_record->photo_count == 1 ? "":"s";
        $title .= "</span>)";
        $pagination = new Pagination($current_set, $units_per_set, $album_record->photo_count);
        $cover = $album_record->get_cover();
        $_SESSION["cancelupload_to_photolist"] = TRUE;
        if(isset($_GET["mkcover"])) {
            try{
                $to_be_cover = Photo::get_by_id($_GET["mkcover"]);
                if($to_be_cover) {
                    $to_be_cover->make_cover();
                    Session::set_message("The photo \"{$to_be_cover->filename}\" is now the cover photo for the album", "success");
                    redirect_to("list_photos.php?a_id={$to_be_cover->album_id}");
                } else {
                    Session::set_message("The photo you are trying to make cover does not exist", "error");
                    redirect_to("list_photos.php?a_id={$album_record->id}");
                }
            } catch (Exception $e) {
                Session::set_message("The photo you are trying to make cover does not exist", "error");
                redirect_to("list_photos.php?a_id={$album_record->id}");
            }
        }
        if(isset($_GET["pc_id"])) {
            try{
                $photo_record = Photo::get_by_id($_GET["pc_id"]);
                if($photo_record) {
                    $comments = $photo_record->comments();
                    if(!$comments) redirect_to("list_photos.php?a_id={$album_record->id}");
                    $comment_content = "<tr><td colspan='8' class='p_comments'><div class='load_more_msg'></div><div class='comments_wrapper'>";
                    $comment_content .= "<p><span>{$photo_record->comment_count} ";
                    $comment_content .= $photo_record->comment_count == 1 ? "comment" : "comments";
                    if($photo_record->comment_count > 1)
                        $comment_content .= "</span> <span class='del_coms_parent'><a href=\"delete_comment.php?p_id={$photo_record->id}\" class=\"scriptable_gen_link del_all_coms confirm_del\">Delete all comments</a></span></p>";
                    $comment_content .= "<div class='comments'>";
                    if(is_array($comments)) {
                        foreach ($comments as $comment) {
                            $comment_content .= "<div c_id ='{$comment->id}' class=\"bottom_border comment\">";
                            $comment_content .= "<a class='del_com scriptable_table_link' href=\"delete_comment.php?c_id={$comment->id}";
                            if(isset($_GET["c_set"])) $comment_content .= "&s_no={$_GET["c_set"]}";
                            $comment_content .= "\" title=\"Delete comment\" class=\"scriptable_table_link\"><div class=\"absolute_pos delete delete_com\">&#x2717;</div></a>";
                            $comment_content .= "<div class=\"content word_break nl2br\">".rawurldecode($comment->content)."</div>";
                            $comment_content .= "<div class=\"by_when\">";
                            $comment_content .= "<div class=\"by\">By <span>{$comment->author}</span></div>";
                            $comment_content .= "<div class=\"when\">On ".$comment->datetime_to_text()."</div>";
                            $comment_content .= "</div></div>";
                        }
                    } else {
                        $comment_content .= "<div c_id ='{$comments->id}' class=\"bottom_border comment\">";
                        $comment_content .= "<a class='del_com scriptable_table_link' href=\"delete_comment.php?c_id={$comments->id}";
                        if(isset($_GET["c_set"])) $comment_content .= "&s_no={$_GET["c_set"]}";
                        $comment_content .= "\" title=\"Delete comment\" class=\"scriptable_table_link\"><div class=\"absolute_pos delete delete_com\">&#x2717;</div></a>";
                        $comment_content .= "<div class=\"content word_break nl2br\">".rawurldecode($comments->content)."</div>";
                        $comment_content .= "<div class=\"by_when\">";
                        $comment_content .= "<div class=\"by\">By <span>{$comments->author}</span></div>";
                        $comment_content .= "<div class=\"when\">On ".$comments->datetime_to_text()."</div>";
                        $comment_content .= "</div></div>";
                    }
                    $comment_content .= "</div>";
                    $comment_content .= "</div></td></tr>";
                } else redirect_to("list_photos.php?a_id={$album_record->id}");
            } catch (Exception $e) { redirect_to("list_photos.php?a_id={$album_record->id}"); }
        }
    } catch (Exception $e) {
        Session::set_message("The album you tried to access does not exist", "error");
        redirect_to("list_albums.php");
    }
}
include_layout_template("header.php");
?>
<div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
    <a id="to_albums" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php
    echo HOME."admin/list_albums.php";
    if(isset($_SESSION["back_to_all"])):
    echo "?o_id=";
    echo $_SESSION["back_to_all"] ? "a" : $album_record->owner_id;
    endif;
    ?>"><< Back</a><span class="link_separator hash_change_removed_1 faded"> |</span>
    <span a_id='<?php echo $album_record->id ?>' class='modal_caller_parent new_photo hash_change_removed_1 faded'><a href="<?php echo HOME.'admin/photo_upload.php?a_id='.$album_record->id ?>" class="scriptable_gen_link photo_upload">Upload a new photo</a></span>
    <?php
    if($album_record->photo_count > 1):
        echo "<span class=\"link_separator hash_change_removed_1 faded\">| </span>";
        echo "<span a_id='{$album_record->id}' class='del_confirm_parent del_all_photos hash_change_removed_1 faded'><a id=\"del_all\" href=\"".HOME."admin/confirm_deletion.php?a_id={$album_record->id}\" class=\"scriptable_gen_link confirm_del\">Delete all photos</a></span>";
    endif;
    if($album_record->photo_count > 0):
        echo "<span class=\"link_separator hash_change_removed_1 faded\"> | </span>";
        echo "<span a_id='{$album_record->id}' class='del_confirm_parent del_album hash_change_removed_1 faded'><a id=\"del_album\" href=\"".HOME."admin/confirm_deletion.php?da_id={$album_record->id}\" class=\"scriptable_gen_link confirm_del\">Delete album</a></span>";
    endif;
    ?>
    <div id="photo_list" class="msg_bottom_margin">
        <h2 class="hash_change_removed_2 faded" id="s_group_id" s_group="<?php echo "a_id=".$album_record->id ?>"><?php echo $title ?></h2>
        <?php
            list($message, $message_type) = $session->get_message();
            display_message($message, $message_type);
        ?>
        <div></div>
        <div id="photos_nav_wrapper">
            <div class="hash_change_removed_1 faded" id="ux_nav_guide"><?php if(isset($pagination->ux_nav_guide)) echo $pagination->ux_nav_guide ?></div>
            <div id="photos_wrapper" class="u_wrapper hash_change_removed_3 slided" per_set="4" scroll_per_set="8" ao_id="<?php echo $album_record->owner_id; ?>">
            <?php
            if($album_record->photo_count != 0) {
                echo "<table class=\"bordered\">";
                echo "<thead>";
                echo "<tr id=\"thead\">";
                echo "<th>Photo</th><th>Original Filename</th><th>Size</th><th>Type</th><th>Caption</th><th colspan=\"\" id=\"ajax_msg\" class=\"\"></th>";
                echo "</tr>";
                echo "</thead>";
            }
            try {
                $photos = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = {$album_record->id} LIMIT {$units_per_set} OFFSET {$pagination->offset}");
                if($photos) echo "<tbody remaining_u_count=\"\">";
                if(is_array($photos)) {
                    foreach($photos as $photo) {
                    echo "<tr class='photo_row' p_id =\"{$photo->id}\">";
                    echo "<td class=\"no_padding\"><img src=\"{$photo->image_path()}\"></td>";
                    echo "<td class=\"fname word_break\">{$photo->filename}</td><td>{$photo->size_as_text()}</td><td>{$photo->type}</td>";
                    if($photo->caption != "") {
                        echo "<td><form class='mini_form' action=\"";
                        HOME."admin/edit_capt.php?p_cap={$photo->id}";
                        if(isset($_GET["c_set"])) echo "&s_no={$_GET["c_set"]}";
                        $stripped_str = str_replace(" target=\"_blank\"","",rawurldecode($photo->caption));
                        echo "\" method=\"post\"><textarea name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\">{$stripped_str}</textarea>";
                        echo "<div class=\"capt_edit\"><input type=\"submit\" value=\"Update changes\" class=\"scriptable_table_link edit_caption\">";
                        echo "<span class=\"char_counter\"></span>";
                        echo "<a class=\"scriptable_table_link\" href=\"edit_capt.php?dp_cap={$photo->id}";
                        if(isset($_GET["c_set"])) echo "&s_no={$_GET["c_set"]}";
                        echo "\" title=\"Delete caption\"><div class=\"absolute_pos delete delete_cap\">&#x2717;</div></a></div></form></td>";
                    } else {
                        if(isset($_GET["pcap_id"]) && $_GET["pcap_id"] == $photo->id) {
                            echo "<td><form class='mini_form' action=\"";
                            HOME."admin/edit_capt.php?p_cap={$photo->id}";
                            if(isset($_GET["c_set"])) echo "&s_no={$_GET["c_set"]}";
                            echo "\" method=\"post\"><textarea name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\"></textarea>";
                            echo "<div class=\"capt_edit new_capt\"><input type=\"submit\" value=\"Add caption\" class=\"scriptable_table_link show_capt_input\">";
                            echo "<span class=\"char_counter\"></span>";
                            echo "</div></form></td>";
                        } else {
                            echo "<td><a class=\"scriptable_table_link show_capt_input\" href=\"list_photos.php?a_id={$album_record->id}&pcap_id={$photo->id}";
                            if(isset($_GET["c_set"])) echo "&c_set={$_GET["c_set"]}";
                            echo "\">Add caption</a></td>";
                        }
                    }
                    if($cover && $cover->id == $photo->id)
                        echo "<td id=\"current_cover\">Current album cover</td>";
                    else
                        echo "<td><a href=\"list_photos.php?a_id={$album_record->id}&mkcover={$photo->id}\" class=\"scriptable_table_link change_cover\">Make cover photo</a></td>";
                    if($photo->comment_count == 0)
                        echo "<td>No comments</td>";
                    else {
                        if(isset($photo_record) && $photo_record->id == $photo->id) {
                            echo "<td class='see_close_coms' u_count='{$photo->comment_count}'><a href=\"list_photos.php?a_id={$album_record->id}";
                            if(isset($_GET["c_set"])) echo "&c_set={$_GET["c_set"]}";
                            echo "\" class=\"scriptable_table_link hide_comments\">Close comments</a></td>";

                            }
                        else {
                            echo "<td class='see_close_coms' u_count='{$photo->comment_count}'><a u_count='{$photo->comment_count}' href='list_photos.php?a_id={$album_record->id}&pc_id={$photo->id}";
                            if(isset($_GET["c_set"])) echo "&c_set={$_GET["c_set"]}";
                            echo "' class='scriptable_table_link display_comments'>See comments</a></td>";
                        }
                    }
                    echo "<td><a href=\"delete_photo.php?p_id={$photo->id}\" class=\"scriptable_table_link photo_delete\">Delete</a></td>";
                    echo "</tr>";
                    if(isset($photo_record) && $photo_record->id == $photo->id) echo $comment_content;
                    }
                }
                elseif($photos === FALSE) {
                    echo "<div id=\"no_photos_alert\">There are currently no photos in this album</div>";
                }
                else {
                    echo "<tr class='photo_row' p_id =\"{$photos->id}\">";
                    echo "<td class=\"no_padding\"><img src=\"{$photos->image_path()}\"></td>";
                    echo "<td class=\"fname word_break\">{$photos->filename}</td><td>{$photos->size_as_text()}</td><td>{$photos->type}</td>";
                    if($photos->caption != "") {
                        echo "<td><form class='mini_form' action=\"";
                        HOME."admin/edit_capt.php?p_cap={$photos->id}";
                        if(isset($_GET["c_set"])) echo "&s_no={$_GET["c_set"]}";
                        $stripped_str = str_replace(" target=\"_blank\"","",rawurldecode($photos->caption));
                        echo "\" method=\"post\"><textarea name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\">{$stripped_str}</textarea>";
                        echo "<div class=\"capt_edit\"><input type=\"submit\" value=\"Update changes\" class=\"scriptable_table_link edit_caption\">";
                        echo "<span class=\"char_counter\"></span>";
                        echo "<a class=\"scriptable_table_link\" href=\"edit_capt.php?dp_cap={$photos->id}";
                        if(isset($_GET["c_set"])) echo "&s_no={$_GET["c_set"]}";
                        echo "\" title=\"Delete caption\"><div class=\"absolute_pos delete delete_cap\">&#x2717;</div></a></div></form></td>";
                    } else {
                        if(isset($_GET["pcap_id"]) && $_GET["pcap_id"] == $photos->id) {
                            echo "<td><form class='mini_form' action=\"";
                            HOME."admin/edit_capt.php?p_cap={$photos->id}";
                            if(isset($_GET["c_set"])) echo "&s_no={$_GET["c_set"]}";
                            echo "\" method=\"post\"><textarea name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\"></textarea>";
                            echo "<div class=\"capt_edit new_capt\"><input type=\"submit\" value=\"Add caption\" class=\"scriptable_table_link show_capt_input\">";
                            echo "<span class=\"char_counter\"></span>";
                            echo "</div></form></td>";
                        } else {
                            echo "<td><a class=\"scriptable_table_link show_capt_input\" href=\"list_photos.php?a_id={$album_record->id}&pcap_id={$photos->id}";
                            if(isset($_GET["c_set"])) echo "&c_set={$_GET["c_set"]}";
                            echo "\">Add caption</a></td>";
                        }
                    }
                    if($cover && $cover->id == $photos->id)
                        echo "<td id=\"current_cover\">Current album cover</td>";
                    else
                        echo "<td><a href=\"list_photos.php?a_id={$album_record->id}&mkcover={$photos->id}\" class=\"scriptable_table_link change_cover\">Make cover photo</a></td>";
                    if($photos->comment_count == 0)
                        echo "<td>No comments</td>";
                    else {
                        if(isset($photo_record))
                            echo "<td><a class='see_close_coms' href=\"list_photos.php?a_id={$album_record->id}\" class=\"scriptable_table_link hide_comments\">Close comments</a></td>";
                        else
                            echo "<td class='see_close_coms' u_count='{$photos->comment_count}'><a u_count='{$photos->comment_count}' href='list_photos.php?a_id={$album_record->id}&pc_id={$photos->id}' class='scriptable_table_link display_comments'>See comments</a></td>";
                    }
                    echo "<td><a href=\"delete_photo.php?p_id={$photos->id}\" class=\"scriptable_table_link photo_delete\">Delete</a></td>";
                    echo "</tr>";
                    if(isset($photo_record) && $photo_record->id == $photos->id) echo $comment_content;
                }
                if($photos) echo "</tbody>";///////////////////////////////
            } catch (Exception $e) { echo "<div id=\"no_photos_alert\">".$e->getMessage()."</div>"; }
            if($album_record->photo_count != 0) echo "</table>";
            ?>
            </div>
            <?php
                if($album_record->photo_count != 0) {
                    if($album_record->photo_count > $units_per_set):
                    echo "<div class=\"hash_change_removed_3 slided\" id=\"nav\">";
                    echo "<a href=\"";
                    echo $pagination->previous_set == 0 ? "#" : "list_photos.php?a_id={$album_record->id}&";
                    echo "c_set={$pagination->previous_set}\" class=\"scriptable_gen_nav_link prev_set\"><div class=\"ui_button nav_opt";
                    if($pagination->previous_set == 0) echo " inactive";
                    echo "\" id=\"prev\">&#x2227;";
                    echo "</div>"; //closes the 'prev button' div
                    echo "</a>";
                    echo "<a href=\"";
                    echo !$pagination->next_set ? "#" : "list_photos.php?a_id={$album_record->id}&";
                    echo "c_set={$pagination->next_set}\" class=\"scriptable_gen_nav_link next_set\"><div class=\"ui_button nav_opt";
                    if(!$pagination->next_set) echo " inactive";
                    echo "\" id=\"next\">&#x2228;";
                    echo "</div>"; //closes the 'next button' div
                    echo "</a>";
                    echo "</div>"; //closes the 'nav' div
                    endif;
                }
            ?>
        </div>
    </div>
</div>

<script>
    $(function() {
        $('form.mini_form').each(function() {
            var cur_field = $(this).children('.mini_form_edit_field'),
            cur_counter = $(this).children('div').children('span'), txt_len = cur_field.val().length,
            max_len = parseInt(cur_field.attr('maxlength'), 10);
            
            cur_counter.text(max_len - txt_len);
        });
        
        $('#photos_wrapper').css({'min-width':'1012px','min-height':'473px'}); //preventing the nav from moving around too much
        $('#photos_wrapper').append("<div id='ajax_loading_pholder'><div id='pholder_msg'></div></div>");
    });
</script>

<?php include_layout_template("footer.php"); ?>