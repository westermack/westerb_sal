<?php
    try {
        require_once '../../includes/initialize.php';
    } catch (Exception $e) { /* HANDLE EXCEPTION */ };
    $content = "";
    if(isset($_GET["a_id"])) {
        try {
            $photos = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = {$_GET["a_id"]} LIMIT {$_GET["u_per_set"]} OFFSET {$_GET["offset"]}");
            $cover = Album::get_by_id($_GET["a_id"])->get_cover();
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    else { /* REDIRECT TO 401/403 MAYBE??? */ }
    if(is_array($photos)){
        foreach($photos as $photo) {
            $content .= "<tr class='photo_row' p_id =\"{$photo->id}\">";
            $content .= "<td class=\"no_padding\"><img src=\"{$photo->image_path()}\"></td>";
            $content .= "<td class=\"fname word_break\">{$photo->filename}</td><td>{$photo->size_as_text()}</td><td>{$photo->type}</td>";
            if($photo->caption != "") {
                $content .= "<td><form class='mini_form' action=\"edit_capt.php?p_cap={$photo->id}";
                //if(isset($_GET["c_set"])) $content .= "&s_no={$_GET["c_set"]}";
                $stripped_str = str_replace(" target=\"_blank\"","",rawurldecode($photo->caption));
                $content .= "\" method=\"post\"><textarea name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\">{$stripped_str}</textarea>";
                $content .= "<div class=\"capt_edit\"><input type=\"submit\" value=\"Update changes\" class=\"scriptable_table_link edit_caption\">";
                $content .= "<span class=\"char_counter\"></span>";
                $content .= "<a class=\"scriptable_table_link\" href=\"edit_capt.php?dp_cap={$photo->id}";
                //if(isset($_GET["c_set"])) $content .= "&s_no={$_GET["c_set"]}";
                $content .= "\" title=\"Delete caption\"\"><div class=\"absolute_pos delete delete_cap\">&#x2717;</div></a></div></form></td>";
            } else {
                $content .= "<td><a class=\"scriptable_table_link show_capt_input\" href=\"list_photos.php?a_id={$_GET["a_id"]}&pcap_id={$photo->id}";
                //if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
                $content .= "\">Add caption</a></td>";
            }
            if($cover && $cover->id == $photo->id)
                $content .= "<td id=\"current_cover\">Current album cover</td>";
            else
                $content .= "<td><a href=\"list_photos.php?a_id={$_GET["a_id"]}&mkcover={$photo->id}\" class=\"scriptable_table_link change_cover\">Make cover photo</a></td>";
            if($photo->comment_count == 0)
                $content .= "<td>No comments</td>";
            else {
                $content .= "<td class='see_close_coms' u_count='{$photo->comment_count}'><a u_count='{$photo->comment_count}' href=\"list_photos.php?a_id={$_GET["a_id"]}&pc_id={$photo->id}";
                //if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
                $content .= "\" class=\"scriptable_table_link display_comments\">See comments</a></td>";
            }
            $content .= "<td><a href=\"delete_photo.php?p_id={$photo->id}\" class=\"scriptable_table_link photo_delete\">Delete</a></td>";
            $content .= "</tr>";
        }
    }
    elseif($photos === FALSE) { $content .= "Error:The set of photos you are trying to access do not exist!"; }
    else {
        $content .= "<tr class='photo_row' p_id =\"{$photos->id}\">";
        $content .= "<td class=\"no_padding\"><img src=\"{$photos->image_path()}\"></td>";
        $content .= "<td class=\"fname word_break\">{$photos->filename}</td><td>{$photos->size_as_text()}</td><td>{$photos->type}</td>";
        if($photos->caption != "") {
            $content .= "<td><form class='mini_form' action=\"edit_capt.php?p_cap={$photos->id}";
            //if(isset($_GET["c_set"])) $content .= "&s_no={$_GET["c_set"]}";
            $stripped_str = str_replace(" target=\"_blank\"","",rawurldecode($photos->caption));
            $content .= "\" method=\"post\"><textarea name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\">{$stripped_str}</textarea>";
            $content .= "<div class=\"capt_edit\"><input type=\"submit\" value=\"Update changes\" class=\"scriptable_table_link edit_caption\">";
            $content .= "<span class=\"char_counter\"></span>";
            $content .= "<a class=\"scriptable_table_link\" href=\"edit_capt.php?dp_cap={$photos->id}";
            //if(isset($_GET["c_set"])) $content .= "&s_no={$_GET["c_set"]}";
            $content .= "\" title=\"Delete caption\"\"><div class=\"absolute_pos delete delete_cap\">&#x2717;</div></a></div></form></td>";
        } else {
            $content .= "<td><a class=\"scriptable_table_link show_capt_input\" href=\"list_photos.php?a_id={$_GET["a_id"]}&pcap_id={$photos->id}";
            //if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
            $content .= "\">Add caption</a></td>";
        }
        if($cover && $cover->id == $photos->id)
            $content .= "<td id=\"current_cover\">Current album cover</td>";
        else
            $content .= "<td><a href=\"list_photos.php?a_id={$_GET["a_id"]}&mkcover={$photos->id}\" class=\"scriptable_table_link change_cover\">Make cover photo</a></td>";
        if($photos->comment_count == 0)
            $content .= "<td>No comments</td>";
        else
            $content .= "<td class='see_close_coms' u_count='{$photos->comment_count}'><a u_count='{$photos->comment_count}' href=\"list_photos.php?a_id={$_GET["a_id"]}&pc_id={$photos->id}\" class=\"scriptable_table_link display_comments\">See comments</a></td>";
        $content .= "<td><a href=\"delete_photo.php?p_id={$photos->id}\" class=\"scriptable_table_link photo_delete\">Delete</a></td>";
        $content .= "</tr>";
    }
    echo $content;
    
    $database->close_connection();
?>