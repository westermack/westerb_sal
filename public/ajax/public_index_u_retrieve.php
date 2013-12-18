<?php
    try {
        require_once '../../includes/initialize.php';
    } catch (Exception $e) { /* HANDLE EXCEPTION */ };
    $content = ""; $valid_album_selected = FALSE;
    if(isset($_GET["a_id"]) && $_GET["a_id"] !== "false") {
        $is_mini_full_screen = isset($_GET['mini_full_screen'])?true:false;
        $units = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = {$_GET["a_id"]} LIMIT {$_GET["u_per_set"]} OFFSET {$_GET["offset"]}");
        $valid_album_selected = TRUE;
    }
    elseif(isset($_GET["o_id"])) {
        try {
            if($_GET["o_id"] == "all")
                $units = Album::get_subset_of_all($_GET["u_per_set"], $_GET["offset"]);
            else
                $units = Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE owner_id = {$_GET["o_id"]} LIMIT {$_GET["u_per_set"]} OFFSET {$_GET["offset"]}");
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    else { /* REDIRECT TO 401/403 MAYBE??? */ }
    if(is_array($units)) {
        $i = 1;
        foreach($units as $subset_unit) {
            $content .= "<div class=\"unit ";
            if($valid_album_selected) $content .= "photo\">"; else $content .= "album hover_trigger\" a_id='{$subset_unit->id}'>";
            if($valid_album_selected) {
                $image_path = $subset_unit->image_path();
                $set_number = ((int)$_GET['offset'])+$i;
                $content .= "<a s_no=\"{$set_number}\" href=\"index.php?pa_id={$subset_unit->album_id}&c_set={$set_number}\" class=\"scriptable_gen_link a_photo\"><img class='public_unit_img";
                if($is_mini_full_screen) $content .= " mini_full_screen";
                $content .= "' src=\"{$image_path}\"></a>";
                $content .= "</div>"; //closes the 'unit' div when the set is that of photos
                $i++;
            } else {
                $cover_path = $subset_unit->cover_path();
                $previews = $subset_unit->get_album_photos();
                if($cover_path) {
                    $content .= "<a href=\"index.php?a_id={$subset_unit->id}\" class=\"scriptable_gen_link to_album\"><img class=\"public_unit_img\" src=\"{$cover_path}\"></a>";
                } else {
                    $content .= "<a href=\"index.php?a_id={$subset_unit->id}\" class=\"scriptable_gen_link to_album\">";
                    $content .= "<div style=\"background-image: url('".Album::random_placeholder_path()."')\" class=\"no_cover border_grey public_unit_img\"></div>";
                    if($previews) $content .= "</a>";
                    if($previews) $content .= "<a href=\"index.php?a_id={$subset_unit->id}\" class=\"scriptable_gen_link to_album\">";
                    $content .= "<div class=\"absolute_pos no_cover_message\">No album cover photo has been set yet</div>";
                    $content .= "</a>";
                }
                $content .= "<div count=\"{$subset_unit->photo_count}\" class=\"album_preview border_grey\">";
                if($previews) {
                    $content .= "<div class=\"previews_available\">";
                    if(is_array($previews)) {
                        for($j = 0, $preview_count = count($previews); $j < $preview_count; $j++) {
                        if($preview_count > 6 && $j == 6)
                            break;
                        $content .= "<a s_no=\"".($j+1)."\" href=\"index.php?pa_id={$subset_unit->id}&c_set=".($j+1)."\" class=\"preview_photo scriptable_gen_link\" ><img class=\"a_preview_img\" src=\"{$previews[$j]->image_path()}\"></a>";
                        }
                    } else {
                        $content .= "<a s_no=\"1\" href=\"index.php?pa_id={$subset_unit->id}&c_set=1\" class=\"preview_photo scriptable_gen_link\" ><img class=\"a_preview_img\" src=\"{$previews->image_path()}\"></a>";
                    }
                    $content .= "</div>"; //closes the 'previews_available' div
                } else {
                    $content .= "<div class=\"no_previews\">";
                    $content .= "<div class=\"no_preview_message\">No previews available for this album</div>";
                    $content .= "</div>";
                }
                $content .= "</div>"; //closes the 'album_preview' div
                $content .= "<div class=\"absolute_pos name hover_triggered ajax\">{$subset_unit->albumname}</div>";
                $content .= "<div style='display: none; ' class='absolute_pos show_prevs hover_triggered ajax'>See photo previews</div>";
                $content .= "<div class=\"absolute_pos date_owner hover_triggered ajax\">";
                $content .= "<div>Created on ".$subset_unit->date_to_text()."</div>";
                if(!isset($_GET["o_id"]) || $_GET["o_id"] == "a") $content .= "<div>By {$subset_unit->owner()->full_name}</div>";
                $content .= "<div>{$subset_unit->photo_count} ";
                $content .= $subset_unit->photo_count == 1 ? "photo</div>" : "photos</div>";
                $content .= "</div>"; //closes the 'date_owner' div
                $content .= "</div>"; //closes the 'unit' div when the set is that of albums not photos
            }
        }
    } else {
        $content .= "<div class=\"unit ";
        if($valid_album_selected) $content .= "photo\">"; else $content .= "album hover_trigger\" a_id='{$units->id}'>";
        if($valid_album_selected) {
            $image_path = $units->image_path();
            $set_number = ((int)$_GET['offset'])+1;
            $content .= "<a s_no=\"{$set_number}\" href=\"index.php?pa_id={$units->album_id}&c_set={$set_number}\" class=\"scriptable_gen_link a_photo\"><img class='public_unit_img";
            if($is_mini_full_screen) $content .= " mini_full_screen";
            $content .= "'src=\"{$image_path}\"></a>";
            $content .= "</div>"; //closes the 'unit' div when the (singleton) set is that of photos
        } else {
            $cover_path = $units->cover_path();
            $previews = $units->get_album_photos();
            if($cover_path) {
                $content .= "<a href=\"index.php?a_id={$units->id}\" class=\"scriptable_gen_link to_album\"><img class=\"public_unit_img\" src=\"{$cover_path}\"></a>";
            } else {
                $content .= "<a href=\"index.php?a_id={$units->id}\" class=\"scriptable_gen_link to_album\">";
                $content .= "<div style=\"background-image: url('".Album::random_placeholder_path()."')\" class=\"no_cover border_grey public_unit_img\"></div>";
                if($previews) $content .= "</a>";
                if($previews) $content .= "<a href=\"index.php?a_id={$units->id}\" class=\"scriptable_gen_link to_album\">";
                $content .= "<div class=\"absolute_pos no_cover_message\">No album cover photo has been set yet</div>";
                $content .= "</a>";
            }
            $content .= "<div count=\"{$units->photo_count}\" class=\"album_preview border_grey\">";
            if($previews) {
                $content .= "<div class=\"previews_available\">";
                if(is_array($previews)) {
                    for($j = 0, $preview_count = count($previews); $j < $preview_count; $j++) {
                    if($preview_count > 6 && $j == 6)
                        break;
                    $content .= "<a s_no=\"".($j+1)."\" href=\"index.php?pa_id={$units->id}&c_set=".($j+1)."\" class=\"preview_photo scriptable_gen_link\" ><img class=\"a_preview_img\" src=\"{$previews[$j]->image_path()}\"></a>";
                    }
                } else {
                    $content .= "<a s_no=\"1\" href=\"index.php?pa_id={$units->id}&c_set=1\" class=\"preview_photo scriptable_gen_link\" ><img class=\"a_preview_img\" src=\"{$previews->image_path()}\"></a>";
                }
                $content .= "</div>"; //closes the 'previews_available' div
            } else {
                $content .= "<div class=\"no_previews\">";
                $content .= "<div class=\"no_preview_message\">No previews available for this album</div>";
                $content .= "</div>";
            }
            $content .= "</div>"; //closes the 'album_previews' div
            $content .= "<div class=\"absolute_pos name hover_triggered ajax\">{$units->albumname}</div>";
            $content .= "<div style='display: none; ' class='absolute_pos show_prevs hover_triggered ajax'>See photo previews</div>";
            $content .= "<div class=\"absolute_pos date_owner hover_triggered ajax\">";
            $content .= "<div>Created on ".$units->date_to_text()."</div>";
            if(!isset($_GET["o_id"]) || $_GET["o_id"] == "a") $content .= "<div>By {$units->owner()->full_name}</div>";
            $content .= "<div>{$units->photo_count} ";
            $content .= $units->photo_count == 1 ? "photo</div>" : "photos</div>";
            $content .= "</div>"; //closes the 'date_owner' div
            $content .= "</div>"; //closes the 'unit' div when the (singleton) set is that of albums not photos
        }
    }
    echo $content;
    
    $database->close_connection();
?>
