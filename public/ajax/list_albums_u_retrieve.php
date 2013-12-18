<?php
    try {
        require_once '../../includes/initialize.php';
    } catch (Exception $e) { /* HANDLE EXCEPTION */ };
    $content = "";
    if(isset($_GET["o_id"])) {
        try {
            if($_GET["o_id"] == "ALL")
                $albums = Album::get_subset_of_all($_GET["u_per_set"], $_GET["offset"]);
            else
                $albums = Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE owner_id = {$_GET["o_id"]} LIMIT {$_GET["u_per_set"]} OFFSET {$_GET["offset"]}");
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    else { /* REDIRECT TO 401/403 MAYBE??? */ }
    if(is_array($albums)){
        foreach ($albums as $album) {
            $content .= "<div class=\"album hover_trigger ajax";
            if($album->photo_count == 0) $content .= " border_grey";
            $content .= "\" id=\"{$album->id}\" name=\"";
            $content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
            $content .= "\">";
            if($album->photo_count != 0)
                $content .= "<a class='scriptable_hash_changer' id='to_list_photos_{$album->id}' href=\"".HOME."admin/list_photos.php?a_id={$album->id}\">";
            $content .= "<img src=\"{$album->random_photo_path}\">";
            if($album->photo_count != 0)
                $content .= "</a>";
            $content .= "<div class=\"absolute_pos name_edit_save hover_triggered ajax\">";
            $content .= "<span class=\"name\">";
            $content .= $album->albumname;
            $content .= "</span>";
            $content .= "<a href=\"list_albums.php?o_id=";
            $content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
            if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
            $content .= "&enma_id={$album->id}\" class=\"edit edit_a_name scriptable_gen_link\" title=\"Edit album name\"></a>";
            $content .= "</div>";
            $content .= "<a href=\"";
            if($album->photo_count > 0)
                $content .= "confirm_deletion.php";
            else
                $content .= "delete_album.php";
            $content .= "?da_id={$album->id}\" title=\"Delete album\" class=\"scriptable_gen_link album_delete\"><div class=\"absolute_pos delete hover_triggered ajax\">";
            $content .= "&#x2717;";
            $content .= "</div></a>";
            $content .= "<a href=\"photo_upload.php?a_id={$album->id}\" class=\"scriptable_gen_link photo_upload\"><div class=\"absolute_pos upload hover_triggered ajax\">";
            $content .= "Upload a photo";
            $content .= "</div></a>";
            $content .= "<a href=\"list_albums.php?o_id=";
            $content .= $_GET["o_id"] == "a" ? "a" : $album->owner_id;
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id)
                $content .= "";
            else
                $content .= "&an_id={$album->id}";
            if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
            $content .= "\" class=\"scriptable_gen_link notes\"><div class=\"absolute_pos notes hover_triggered ajax\">";
            if($album->notes != "")
                if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id)
                    $content .= "Close notes";
                else
                    $content .= "See notes";
            else
                if(isset($_GET["an_id"]) && $_GET["an_id"] == $album->id)
                    $content .= "Cancel";
                else
                    $content .= "Add notes";
            $content .= "</div></a>";
            $content .= "<div class=\"absolute_pos date_owner list_albums_pg hover_triggered ajax\">";
            $content .= "<div>Created on {$album->date_to_text()}</div>";
            if($_GET["o_id"] == "a") $content .= "<div>By {$album->owner()->full_name}</div>";
            $content .= "<div>{$album->photo_count} ";
            $content .= $album->photo_count == 1 ? "photo</div>" : "photos</div>";
            $content .= "</div>";
            $content .= "</div>";   
        }
    } else {
        $content .= "<div class=\"album hover_trigger ajax";
        if($albums->photo_count == 0) $content .= " border_grey";
        $content .= "\" id=\"{$albums->id}\" name=\"";
        $content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
        $content .= "\">";
        if($albums->photo_count != 0)
            $content .= "<a class='scriptable_hash_changer' id='to_list_photos_{$albums->id}' href=\"".HOME."admin/list_photos.php?a_id={$albums->id}\">";
        $content .= "<img src=\"{$albums->random_photo_path}\">";
        if($albums->photo_count != 0)
            $content .= "</a>";
        $content .= "<div class=\"absolute_pos name_edit_save hover_triggered ajax\">";       
        $content .= "<span class=\"name\">";
        $content .= $albums->albumname;
        $content .= "</span>";
        $content .= "<a href=\"list_albums.php?o_id=";
        $content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
        $content .= "&enma_id={$albums->id}\" class=\"edit edit_a_name scriptable_gen_link\" title=\"Edit album name\"></a>";
        $content .= "</div>";
        $content .= "<a href=\"";
            if($albums->photo_count > 0)
                $content .= "confirm_deletion.php";
            else
                $content .= "delete_album.php";
        $content .= "?da_id={$albums->id}\" title=\"Delete album\" class=\"scriptable_gen_link album_delete\"><div class=\"absolute_pos delete hover_triggered ajax\">";
        $content .= "&#x2717;";
        $content .= "</div></a>";
        $content .= "<a href=\"photo_upload.php?a_id={$albums->id}\" class=\"scriptable_gen_link photo_upload\"><div class=\"absolute_pos upload hover_triggered ajax\">";
        $content .= "Upload a photo";
        $content .= "</div></a>";
        $content .= "<a href=\"list_albums.php?o_id=";
        $content .= $_GET["o_id"] == "a" ? "a" : $albums->owner_id;
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id)
                $content .= "";
            else
                $content .= "&an_id={$albums->id}";
        if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
        $content .= "\" class=\"scriptable_gen_link notes\"><div class=\"absolute_pos notes hover_triggered ajax\">";
        if($albums->notes != "")
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id)
                $content .= "Close notes";
            else
                $content .= "See notes";
        else
            if(isset($_GET["an_id"]) && $_GET["an_id"] == $albums->id)
                $content .= "Cancel";
            else
                $content .= "Add notes";
        $content .= "</div></a>";
        $content .= "<div class=\"absolute_pos date_owner list_albums_pg hover_triggered ajax\">";
        $content .= "<div>Created on {$albums->date_to_text()}</div>";
        if($_GET["o_id"] == "a") $content .= "<div>By {$albums->owner()->full_name}</div>";
        $content .= "<div>{$albums->photo_count} ";
        $content .= $albums->photo_count == 1 ? "photo</div>" : "photos</div>";
        $content .= "</div>";
        $content .= "</div>";
    }
    echo $content;
    
    $database->close_connection();
?>
