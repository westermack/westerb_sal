<?php
    function strip_zeros_from_date($marked_string="") {
      // first remove the marked zeros
      $no_zeros = str_replace('*0', '', $marked_string);
      // then remove any remaining marks
      $cleaned_string = str_replace('*', '', $no_zeros);
      return $cleaned_string;
    }
    
    function mysql_prep( $value ) {
		$magic_quotes_active = get_magic_quotes_gpc();
		$new_enough_php = function_exists( "mysql_real_escape_string" ); // i.e. PHP >= v4.3.0
		if( $new_enough_php ) { // PHP v4.3.0 or higher
			// undo any magic quote effects so mysql_real_escape_string can do the work
			if( $magic_quotes_active ) { $value = stripslashes( $value ); }
			$value = mysql_real_escape_string( $value );
		} else { // before PHP v4.3.0
			// if magic quotes aren't already on then add slashes manually
			if( !$magic_quotes_active ) { $value = addslashes( $value ); }
			// if magic quotes are active, then the slashes already exist
		}
		return $value;
	}
    
    function redirect_to($location = NULL) {
      if ($location != NULL) {
        header("Location: {$location}");
        exit;
      }
    }
    
    function display_message($message="", $type="error") {
        if(!empty($message))
            echo "<div class=\"message_wrapper\"><div class=\"alertBox {$type}\">".$message."</div></div>";
    }
    
    function __autoload($class_name) {
        $class_name = strtolower($class_name);
        $path = LIB_PATH.DS."{$class_name}.php";
        if(file_exists($path)) { require_once $path;}
            else { die("The file \"{$class_name}.php\" could not be found."); }
    }
    
    function include_layout_template($template="") {
        include SITE_ROOT.DS."public".DS."layouts".DS.$template;
    }
    
    function log_action($action="", $by="", $mode="at") {
        $file = SITE_ROOT.DS."logs".DS."log.txt";
        if(file_exists($file)) {
            $handle = fopen($file, $mode);
            fwrite($handle, strftime("%d-%m-%Y | %H:%M:%S", time())." | {$action} | {$by}\n");
            fclose($handle);
        } else {
            $handle = fopen($file, $mode);
            fwrite($handle, strftime("%d-%m-%Y %H:%M:%S", time())." | {$action} | {$by}\n");
            fclose($handle);
        }
    }
    
    function admin_albums_list() {
        $content = "";
        try {
            $albums = Album::get_all();
            $content .= "<a u_count=".Album::count_all()." class=\"album_by_owner\" href=\"list_albums.php?o_id=a\">All albums</a>";
            if(is_array($albums)) {
                $unique_owner_ids = array();
                $unique_owner_names = array();
                $u_counts = array();
                foreach ($albums as $album) {
                    $owner_record = User::get_by_id($album->owner_id);
                    if(array_search($owner_record->id, $unique_owner_ids) === FALSE) {
                        $unique_owner_ids[] = $owner_record->id;
                        $unique_owner_names[] = $owner_record->full_name;
                        $u_counts[] = $owner_record->count_owned_albums();
                    }    
                }
                for($i =0, $unique_owner_count = sizeof($unique_owner_ids); $i < $unique_owner_count; $i++) {
                    $content .= "<a u_count=\"{$u_counts[$i]}\" class=\"album_by_owner\" href=\"list_albums.php?o_id={$unique_owner_ids[$i]}\">";
                    $content .= "By {$unique_owner_names[$i]}";
                    $content .= "</a>";
                }
            } else {
                $owner_record = User::get_by_id($albums->owner_id);
                $content .= "<a u_count=\"{$albums->photo_count}\" class=\"album_by_owner\" href=\"list_albums.php?o_id={$owner_record->id}\">";
                $content .= "By {$owner_record->full_name}";
                $content .= "</a>";
            }
            return $content;
        } catch(Exception $e) { return "<div id=\"no_albums_alert\">There are currently no albums available</div>"; }
    }
    
    function public_albums_nav() {
        global $owner_id, $album_id, $valid_photo_selected, $is_ajax_call;
        $content = "";
        if($valid_photo_selected) {
            global $unit_count;
            $content .= "<a class=\"hash_change_removed_1 slided\" href=\"index.php";
            if(isset($_SESSION["specific_album"]) || isset($_SESSION["specific_owner_albums"]) || isset($_SESSION["p_list_s_no"])) $content .= "?";
            if(isset($_SESSION["specific_album"])) $content .= "a_id={$_SESSION["specific_album"]}";
            elseif(isset($_SESSION["specific_owner_albums"])) $content .= "o_id={$_SESSION["specific_owner_albums"]}";
            if(isset($_SESSION["p_list_s_no"]) && (isset($_SESSION["specific_album"]) || isset($_SESSION["specific_owner_albums"]))) $content .= "&";
            if(isset($_SESSION["p_list_s_no"])) $content .= "c_set={$_SESSION["p_list_s_no"]}";
            $content .= "\"><div class=\"ui_button";
            if($is_ajax_call) {
                $content .= " scriptable_prev_state_restorer"; //REVISIT: WHAT OF THE CASE THE PHOTO IS
                if(!isset($_SESSION["specific_album"])) $content .= " fullscreen_closer"; //ACCESSED THROUGH URL AND JS IS ON
            }
            if($unit_count > 1) $content .=  " adjust_for_g_nav";
            $content .= "\" id=\"to_albums_nav\">BACK ";
            if(isset($_SESSION["specific_album"])) $content .= "TO ALBUM"; else $content .= "TO ALBUMS";
            $content .= "</div></a>";
            return $content;
        }
        elseif($album_id != "ALL") {
            $content .= "<a class=\"hash_change_removed_3 slided\" href=\"index.php";
            if(isset($_SESSION["specific_owner_albums"]) || isset($_SESSION["a_list_s_no"])) $content .= "?";
            if(isset($_SESSION["specific_owner_albums"])) {
                $content .= "o_id={$_SESSION["specific_owner_albums"]}";
                if(isset($_SESSION["a_list_s_no"])) $content .= "&";
            }
            if(isset($_SESSION["a_list_s_no"])) $content .= "c_set={$_SESSION["a_list_s_no"]}";
            $content .= "\"><div class=\"ui_button";
            if($is_ajax_call) $content .= " fullscreen_closer scriptable_prev_state_restorer";
            $content .= "\" id=\"to_albums_nav\">BACK TO ALBUMS</div></a>";
            return $content;
        } else {
            try {
                $albums = Album::get_all();
                $content .= "<div id=\"albums_nav\"><h2>Showing:</h2><ul>";
                $content .= "<li class=\"hash_change_removed_1 faded\"><a o_id=\"all\" u_count=\"".Album::count_all()."\" class=\"scriptable_gen_link public_albums_nav_link";
                if($owner_id == "ALL") $content .= " current";
                $content .= "\"";
                $content .= " href=\"";
                if($owner_id == "ALL") $content .= "#\">"; else $content .= "index.php\">";
                $content .= "All albums</a></li>";
                if(is_array($albums)) {
                    $unique_owner_ids = array();
                    $unique_owner_names = array();
                    foreach ($albums as $album) {
                        $owner_record = User::get_by_id($album->owner_id);
                        if(array_search($owner_record->id, $unique_owner_ids) === FALSE) {
                            $unique_owner_ids[] = $owner_record->id;
                            $unique_owner_names[] = $owner_record->full_name;
                            $u_counts[] = $owner_record->count_owned_albums();
                        }    
                    }
                    for($i =0, $unique_owner_count = sizeof($unique_owner_ids); $i < $unique_owner_count; $i++) {
                        $content .= "<li class=\"hash_change_removed_1 faded\"><a o_id=\"{$unique_owner_ids[$i]}\" u_count=\"{$u_counts[$i]}\" class=\"scriptable_gen_link public_albums_nav_link";
                        if($owner_id == $unique_owner_ids[$i]) $content .= " current";
                        $content .= "\"";
                        $content .= " href=\"";
                        if($owner_id == $unique_owner_ids[$i]) $content .= "#\">"; else $content .= "index.php?o_id={$unique_owner_ids[$i]}\">";
                        $content .= "By {$unique_owner_names[$i]}";
                        $content .= "</a></li>";
                    }
                } else {
                    $owner_record = User::get_by_id($albums->owner_id);
                    $content .= "<li class=\"hash_change_removed_1 faded\"><a o_id=\"{$owner_record->id}\" u_count=\"".$owner_record->count_owned_albums()."\" class=\"scriptable_gen_link public_albums_nav_link";
                    if($owner_id == $owner_record->id) $content .= " current";
                    $content .= "\"";
                    $content .= " href=\"";
                    if($owner_id == $owner_record->id) $content .= "#\">"; else $content .= "index.php?o_id={$owner_record->id}\">";
                    $content .= "By {$owner_record->full_name}";
                    $content .= "</a></li>";
                }
                $content .= "</ul></div>";
                return $content;
            } catch(Exception $e) { return FALSE; }
        }
    }
    
    function unit_info() {
        global $unit, $valid_photo_selected, $author, $comment, $unit_count, $album_record, $current_set, $is_ajax_call;
        $content = "<div class=\"slided hash_change_removed_";
        $content .= $valid_photo_selected?"1":"3";
        if($valid_photo_selected && $unit_count > 1) $content .=  " adjust_for_g_nav";
        $content .= "\" id=\"unit_info\">";
        if($valid_photo_selected) {
            $comments = $is_ajax_call?$unit->subset_of_comments():$unit->comments();
            $content .= "<div id=\"photo_info\">";
            $content .= "<div cur_set=\"1\" id=\"loaded_info\">";
            if($unit->caption == "") $content .= "<p class=\"bottom_border no_unit_data\">No caption on the photo</p>";
                else $content .= "<p class=\"bottom_border nl2br capt_pgraph\"><span>Caption:</span> ".rawurldecode ($unit->caption)."</p>";
            $content .= "<p id=\"c_count\"><span>{$unit->comment_count} ";
            $content .= $unit->comment_count == 1 ? "comment" : "comments";
            $content .= "</span></p>";
            $content .= "<div id=\"comments\">";
            if(is_array($comments)) {
                foreach($comments as $p_comment) {
                    $content .= "<div class=\"bottom_border comment nl2br\">";
                    $content .= "<div class=\"content\">".rawurldecode($p_comment->content)."</div>";
                    $content .= "<div class=\"by_when\">";
                    $content .= "<div class=\"by\">By <span>{$p_comment->author}</span></div>";
                    $content .= "<div class=\"when\">On ".$p_comment->datetime_to_text()."</div>";
                    $content .= "</div></div>";
                }
                $content .= "</div></div>";
            } elseif(!$comments) {
                $content .= "<p class=\"no_unit_data\">Post your comment below</p>";
                $content .= "</div></div>";
            }
            else{
                $content .= "<div class=\"bottom_border comment nl2br\">";
                $content .= "<div class=\"content\">".rawurldecode($comments->content)."</div>";
                $content .= "<div class=\"by_when\">";
                $content .= "<div class=\"by\">By <span>{$comments->author}</span></div>";
                $content .= "<div class=\"when\">On ".$comments->datetime_to_text()."</div>";
                $content .= "</div></div></div></div>";
            }
            $content .= "<form id=\"post_comment\" p_id='{$unit->id}' class='big_form' action=\"".HOME."index.php?pa_id={$album_record->id}&c_set={$current_set}\" method=\"post\">";
            $content .= "<p><div><span class=\"label\" id=\"for_author\">Your name</span></div><input class=\"p_holder form_field msg_span\" name=\"author\" type=\"text\" value=\"{$author}\" maxlength=\"30\">";
            $content .= "<input class=\"form_field ui_button\" type=\"submit\" name=\"submit\" value=\"POST\"></p>";
            $content .= "<div><span class=\"label\" id=\"for_comment\">Your comment</span></div><textarea class=\"p_holder form_field validate_on_sub reqrd msg_span\" name=\"comment\" maxlength=\"1000\">{$comment}</textarea>";
            $content .= "</form>";
            //$content .= "</div></div><div id=\"for_margin\"></div>";
            return $content;
        } elseif(isset($unit) && $unit instanceof Album) {
            $content .= "<div id=\"album_info\">";
            $content .= "<p id=\"owner\">Created by <span>{$unit->owner()->full_name}</span></p>";
            $content .= "<p>On ".$unit->datetime_to_text()."</p>";
            if($unit->notes == "") $content .= "<p class=\"no_unit_data\">There are no notes on this album</p>";
                else $content .= "<p class=\"nl2br\">Notes: <span>".rawurldecode($unit->notes)."</p></span>";
            $content .= "</div></div>";
            return $content;
        }
    }
?>





