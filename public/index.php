<?php
require_once '../includes/initialize.php';

$message = $message_type = "";
$paginated = true;
$is_ajax_call = isset($_GET['ajax'])?true:false;
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;

$header = $content = ""; $unit_count = $units_per_set = 0;
$current_set = (isset($_GET["c_set"]) && !empty($_GET["c_set"]) && (int)$_GET["c_set"] !== 0) ? $_GET["c_set"] : 1;

if(!$is_ajax_call) include_layout_template("header.php");

if(isset($_GET["o_id"])) {
    try {
        $owner_record = User::get_by_id($_GET["o_id"]);
        if(!$owner_record)
            redirect_to ("index.php");
        $owner_id = $_GET["o_id"];
        $_SESSION["specific_owner_albums"] = $owner_id;
    } catch(Exception $e) { redirect_to ("index.php"); }
} else $owner_id = "ALL";

if(isset($_GET["a_id"])) {
    try {
        $album_record = Album::get_by_id($_GET["a_id"]);
        if(!$album_record)
            redirect_to ("index.php");
        $album_id = $_GET["a_id"];
        $unit = $album_record;
        $_SESSION["specific_album"] = $album_id;
        if(isset($_GET["c_set"]))
            $_SESSION["p_list_s_no"] = $_GET["c_set"]; //remember the set number to "go back" more accuratelty when a specific photo has been selected (when '$_GET["pa_id"]' is set)
    } catch(Exception $e) { redirect_to ("index.php"); }
} elseif(!isset($_GET["o_id"]) && !isset($_GET["pa_id"])) {
    if(isset($_GET["c_set"]))
        $_SESSION["a_list_s_no"] = $_GET["c_set"]; //remember the set number to "go back" more accuratelty when a specific album has been selected (when '$_GET["a_id"]' is set)
    elseif(!isset($_GET["c_set"]) && isset($_SESSION["a_list_s_no"])) {
        unset($_SESSION["a_list_s_no"]); //precaution
    }
    if(isset($_SESSION["specific_owner_albums"]))
        unset ($_SESSION["specific_owner_albums"]); 
   $album_id = "ALL";
} else {
    if(isset($_GET["c_set"]))
        $_SESSION["a_list_s_no"] = $_GET["c_set"]; //remember the set number to "go back" more accuratelty when a specific album has been selected (when '$_GET["a_id"]' is set)
    elseif(!isset($_GET["c_set"]) && isset($_SESSION["a_list_s_no"])) {
        unset($_SESSION["a_list_s_no"]); //precaution
    }
    $album_id = "ALL";
}

if(isset($_GET["pa_id"])) {
    try {
        $album_record = Album::get_by_id($_GET["pa_id"]);
        if(!$album_record)
            redirect_to ("index.php");
        $unit_count = $album_record->photo_count;
        $units_per_set = 1;
        $pagination = new Pagination($current_set, $units_per_set, $unit_count);
        $units = $unit = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = {$album_record->id} LIMIT {$units_per_set} OFFSET {$pagination->offset}");
        $photos = $album_record->get_album_photos();
        $valid_photo_selected = TRUE;
        $valid_album_selected = FALSE;
        if(isset($_POST["submit"])) {
            try {
                $author = strip_tags(trim($_POST["author"]));
                $comment = strip_tags(trim($_POST["comment"]), "<i>,<em>,<sup>,<sub>");
                Comment::post($units->id, $author, $comment);
                Session::set_message("Thank you for your comment!", "success");
                redirect_to (HOME."index.php?pa_id={$album_record->id}&c_set={$current_set}");
            } catch (Exception $e) { $message = $e->getMessage(); $message_type = "error"; }
        } else {
            list($message, $message_type) = $session->get_message();
            $author = ""; $comment = "";
        }
    } catch(Exception $e) { redirect_to ("index.php"); }
} elseif(!isset($_GET["a_id"])) {
    if(isset($_SESSION["specific_album"]))
        unset ($_SESSION["specific_album"]);
    if(isset($_GET["c_set"]))////////////////////// may need revisiting to check necessity...
        $_SESSION["p_list_s_no"] = $_GET["c_set"]; //remember the set number to "go back" more accuratelty when a specific photo has been selected form the previews (when '$_GET["pa_id"]' is set)
    elseif(!isset($_GET["c_set"]) && isset($_SESSION["p_list_s_no"])) {
        unset($_SESSION["p_list_s_no"]); //precaution
    }//////////////////////
    $valid_photo_selected = FALSE;
} else $valid_photo_selected = FALSE;

try{
    if(isset($_GET["a_id"])) {
        $header .= "Album: {$album_record->albumname}";
        $unit_count = $album_record->photo_count;
        $units_per_set = 6;
        $pagination = new Pagination($current_set, $units_per_set, $unit_count);
        $units = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = {$album_id} LIMIT {$units_per_set} OFFSET {$pagination->offset}");
        $valid_album_selected = TRUE;
    } elseif(isset($_GET["o_id"])) {
        $header .= "<span id=\"by\">Albums by {$owner_record->full_name}</span>";
        $units_per_set = 4;
        $unit_count = $owner_record->count_owned_albums();
        $pagination = new Pagination($current_set, $units_per_set, $unit_count);
        $units = Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE owner_id = {$owner_id} LIMIT {$units_per_set} OFFSET {$pagination->offset}");
        $valid_album_selected = FALSE;
        }
        elseif(!$valid_photo_selected) {
            $units_per_set = 4;
            $unit_count = Album::count_all();
            $pagination = new Pagination($current_set, $units_per_set, $unit_count);
            $units = Album::get_subset_of_all($units_per_set, $pagination->offset);
            $valid_album_selected = FALSE;
        }
    if(is_array($units)) {
        if($album_id == "ALL" && $owner_id == "ALL") $header .= "<span id=\"by\">All albums</span>";
        $header .= " (<span id=\"u_count\">{$unit_count}</span> ";
        if($valid_album_selected) $header .= ($unit_count == 1) ? "photo)" : "photos)"; else $header .= "total)";
        $content .= "<div per_set=\"";
        $content .= $valid_album_selected ? "6":"4";
        $content .= "\" id=\"unit_wrapper\"";
        if($valid_album_selected) $content .= " a_id=\"{$album_record->id}\"";
        if(!$valid_photo_selected) $content .= " class=\"u_wrapper non_photo";
        //if(!$valid_photo_selected && !$valid_album_selected && $unit_count > $units_per_set) $content .= " adjust_for_sweep";
        if(!$valid_photo_selected) $content .= "\"";
        $content .= ">";
        if(!$valid_photo_selected  /*&& $unit_count > $units_per_set*/) $content .= "<div class=\"movable\">"; //for animating sweepping
        $i = 1;
        foreach($units as $subset_unit) {
            $content .= "<div ";
            if($is_ajax_call) $content .= "style='display: none; ' ";
            $content .= "class=\"unit ";
            if($valid_album_selected) $content .= "photo\">"; else $content .= "album hover_trigger\" a_id='{$subset_unit->id}'>";
            if($valid_album_selected) {
                $image_path = $subset_unit->image_path();
                $set_number = ((int)$pagination->offset)+$i;
                $content .= "<a s_no=\"{$set_number}\" href=\"index.php?pa_id={$album_record->id}&c_set={$set_number}\" class=\"scriptable_gen_link a_photo\"><img class=\"public_unit_img\" src=\"{$image_path}\"></a>";
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
                $content .= "<div class=\"absolute_pos name hover_triggered\">{$subset_unit->albumname}</div>";
                $content .= "<div class=\"absolute_pos date_owner hover_triggered\">";
                $content .= "<div>Created on ".$subset_unit->date_to_text()."</div>";
                if(!isset($_GET["o_id"]) || $_GET["o_id"] == "a") $content .= "<div>By {$subset_unit->owner()->full_name}</div>";
                $content .= "<div>{$subset_unit->photo_count} ";
                $content .= $subset_unit->photo_count == 1 ? "photo</div>" : "photos</div>";
                $content .= "</div>"; //closes the 'date_owner' div
                $content .= "</div>"; //closes the 'unit' div when the set is that of albums not photos
            }
        }
    } elseif ($units === FALSE) {
        $header .= " (0 photos)";
        $content = "<div id=\"unit_wrapper\" class=\"non_photo\">";
        $content .= "<div class=\"no_content\">This album does not have any photos yet</div></div>";
        $content .= "</div>";
    } else {
        if($valid_photo_selected) {
            $content .= "<div id=\"unit_wrapper\" class=\"u_wrapper\" per_set=\"1\" scroll_per_set=\"8\" pa_id=\"{$units->album_id}\">";
            $fpath = $units->image_path();
            $content .= "<img id='on_display_gallery_img' natural_width='".getimagesize($fpath)[0]."' natural_height='".getimagesize($fpath)[1]."' c_set='{$current_set}' p_id=\"{$units->id}\" src=\"{$fpath}\">";
        } else {
            if($album_id == "ALL" && $owner_id == "ALL") $header .= "<span id=\"by\">All albums</span>";
            $header .= " (<span id=\"u_count\">{$unit_count}</span> ";
            if($valid_album_selected) $header .= ($unit_count == 1) ? "photo)" : "photos)"; else $header .= "total)";
            $content .= "<div per_set=\"";
            $content .= $valid_album_selected ? "6":"4";
            $content .= "\" id=\"unit_wrapper\"";
            if($valid_album_selected) $content .= " a_id=\"{$album_record->id}\"";
            if(!$valid_photo_selected) $content .= " class=\"u_wrapper non_photo";
            //if(!$valid_photo_selected && !$valid_album_selected && $unit_count > $units_per_set) $content .= " adjust_for_sweep";
            if(!$valid_photo_selected) $content .= "\"";
            $content .= ">";
            if(!$valid_photo_selected  /*&& $unit_count > $units_per_set*/) $content .= "<div class=\"movable\">"; //for animating sweepping
            $content .= "<div ";
            if($is_ajax_call) $content .= "style='display: none; ' ";
            $content .= "class=\"unit ";
            if($valid_album_selected) $content .= "photo\">"; else $content .= "album hover_trigger\" a_id='{$units->id}'>";
            if($valid_album_selected) {
                $image_path = $units->image_path();
                $set_number = ((int)$pagination->offset)+1;
                $content .= "<a s_no=\"{$set_number}\" href=\"index.php?pa_id={$album_record->id}&c_set={$set_number}\" class=\"scriptable_gen_link a_photo\"><img class=\"public_unit_img\" src=\"{$image_path}\"></a>";
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
                $content .= "<div class=\"absolute_pos name hover_triggered\">{$units->albumname}</div>";
                $content .= "<div class=\"absolute_pos date_owner hover_triggered\">";
                $content .= "<div>Created on ".$units->date_to_text()."</div>";
                if(!isset($_GET["o_id"]) || $_GET["o_id"] == "a") $content .= "<div>By {$units->owner()->full_name}</div>";
                $content .= "<div>{$units->photo_count} ";
                $content .= $units->photo_count == 1 ? "photo</div>" : "photos</div>";
                $content .= "</div>"; //closes the 'date_owner' div
                $content .= "</div>"; //closes the 'unit' div when the (singleton) set is that of albums not photos
            }
        }
    }
    if($units !== FALSE) {
        if(!$valid_photo_selected /*&& $unit_count > $units_per_set*/) $content .= "</div>"; //closes the 'movable' div
        $content .= "</div>"; //closes the 'unit_wrapper' div
        if($unit_count > $units_per_set) :
        if($valid_photo_selected) $g_nav_content = '';
        $var_name = $valid_photo_selected?'g_nav_content':'content';
        $$var_name .= "<div id=\"";
        $$var_name .= ($valid_photo_selected)?"gallery_nav":"nav";
        $$var_name .= "\"";
        if(!$valid_photo_selected) $$var_name .= " class=\"hover_triggered\"";
        $$var_name .= ">";
        $$var_name .= "<a href=\"";
        $$var_name .= $pagination->previous_set == 0 ? "#" : "index.php";
        if($valid_album_selected) $$var_name .= "?a_id={$album_record->id}&";
        else if($valid_photo_selected) $$var_name .= "?pa_id={$album_record->id}&";
        else if(isset($owner_record)) $$var_name .= "?o_id={$owner_record->id}&";
        $$var_name .= $valid_album_selected || $valid_photo_selected || isset($owner_record) ? "": "?";
        $$var_name .= "c_set={$pagination->previous_set}\" class=\"scriptable_gen_nav_link prev_set\"><div class=\"ui_button nav_opt";
        if($pagination->previous_set == 0) $$var_name .= " inactive";
        $$var_name .= "\" id=\"prev\">";
        $$var_name .= ($valid_photo_selected)?"‹":"&#x2227;";
        $$var_name .= "</div>"; //closes the 'prev button' div
        $$var_name .= "</a>";
        $$var_name .= "<a href=\"";
        $$var_name .= !$pagination->next_set ? "#" : "index.php";
        if($valid_album_selected) $$var_name .= "?a_id={$album_record->id}&";
        else if($valid_photo_selected) $$var_name .= "?pa_id={$album_record->id}&";
        else if(isset($owner_record)) $$var_name .= "?o_id={$owner_record->id}&";
        $$var_name .= $valid_album_selected || $valid_photo_selected  || isset($owner_record) ? "": "?";
        $$var_name .= "c_set={$pagination->next_set}\" class=\"scriptable_gen_nav_link next_set\"><div class=\"ui_button nav_opt";
        if(!$pagination->next_set) $$var_name .= " inactive";
        $$var_name .= "\" id=\"next\">";
        $$var_name .= ($valid_photo_selected)?"›":"&#x2228;";
        $$var_name .= "</div>"; //closes the 'next button' div
        $$var_name .= "</a>";
        $$var_name .= "</div>"; //closes the 'nav' div
        endif;
        $content .= "</div>"; //closes...
    }
} catch(Exception $e) { $header = "<br><br>"; $content = "<div id=\"no_public_content\">There are currently no albums on The S<span class='a'>a</span><span class='l'>l</span><span class='o'>o</span><span class='n'>n</span></div></div>";}
?>
    <?php
        if(!$is_ajax_call) {
            $is_hash_change_pg_call;
            echo "<div id=\"main\" class=\"no_padding\" cur_u_id=\"";
            if(isset($session->user_id)) echo $session->user_id;
            echo "\" u_p=\"{$session->user_perms}\"";
            if($is_hash_change_pg_call) echo "style=\"opacity: 0; \"";
            echo ">";
            echo "<div class=\"centering msg_top_margin\">".display_message($message, $message_type)."</div>";
            echo "<div class=\"centering\">";
        }
    ?>
                <div <?php
                    if($is_ajax_call) echo "style='display: none; ' ";
                    echo "class=\"slided hash_change_removed_";
                    echo (isset($valid_photo_selected) && $valid_photo_selected)?"2":((isset($valid_album_selected) && $valid_album_selected)?"4":"3");
                    if($valid_photo_selected) echo " selected_photo_wrapper";
                    else if($valid_album_selected) echo " selected_album_wrapper";
                    echo "\"";
                ?> id="outer_wrapper">
                    <div id="inner_wrapper">
                         <div id="title">
                             <?php
                                if(isset($valid_photo_selected) && $valid_photo_selected && $unit_count > $units_per_set) {
                                    echo "<div id='gallery_nav_wrapper'>";
                                    echo $g_nav_content;
                                    echo "<div style=\"display: none; \" id=\"u_count\">{$unit_count}</div>";
                                    echo "</div>";
                                }
                             ?>
                             <h2 class="hash_change_removed_2 faded" id="s_group_id" s_group="<?php echo $valid_album_selected?"a_id=".$album_record->id:($valid_photo_selected?"pa_id=".$album_record->id:($owner_id === "ALL" ? "o_id=all":"o_id=".$owner_id)) ?>"><?php echo $header ?></h2><span class="hash_change_removed_1 faded <?php if(isset($valid_photo_selected) && $valid_photo_selected && $unit_count > $units_per_set) echo "adjust_for_g_nav"; ?>" id="ux_nav_guide"><?php if(isset($pagination->ux_nav_guide)) echo $pagination->ux_nav_guide ?></span></div>
                         <div id="unit_nav_wrapper" class="hover_trigger">
                                 <?php
                                     echo $content;
                                 ?>
                    </div>
                <?php echo public_albums_nav(); echo unit_info(); ?>
             </div>
            <?php
                if(isset($valid_photo_selected) && $valid_photo_selected)
                    echo "</div></div><div id=\"for_margin\"></div>";
                if(isset($valid_photo_selected) && $valid_photo_selected && $unit_count > $units_per_set) {
                    echo "<div id='gallery_thumbs_wrapper'>";
                    $i = 1;
                    foreach($photos as $photo) {
                        $image_path = $photo->image_path();
                        if($i != $current_set) echo  "<a href=\"".HOME."index.php?pa_id={$album_record->id}&c_set={$i}\" class=\"scriptable_gen_link gallery_thumb_link\">";
                        echo "<img src=\"{$image_path}\" class=\"gallery_thumb";
                        if($i == $current_set) echo " current";
                        echo "\" s_no=\"{$i}\">";
                        if($i != $current_set) echo "</a>";
                        $i++;
                    }
                    echo "</div>";
                }
             ?>
        </div>
    <?php if(!$is_ajax_call) echo "</div>"; ?>

<?php    
    if(!$is_ajax_call)
        echo "<script src=\"js/public_index_min.js\"></script>\n";
?>

<?php if(!$is_ajax_call) include_layout_template("footer.php"); ?>