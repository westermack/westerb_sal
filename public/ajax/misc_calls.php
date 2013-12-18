<?php
    try {
        require_once '../../includes/initialize.php';
    } catch (Exception $e) { /* HANDLE EXCEPTION */ };
    
    if(isset($_GET["mkcover"])) {
        try {
            $to_be_cover = Photo::get_by_id($_GET["mkcover"]);
            $to_be_cover->make_cover();
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET["del_p_id"])) {
        try {
            $photo = Photo::get_by_id($_GET["del_p_id"]);
            $photo->delete_photo();
        } catch(Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['p_cap'])) {
        $raw_update_str = str_replace('\r\n','\n',trim(urldecode($_POST['p_cap'])));
        $pattern = "/(<a\s+(?:href)=?)(['\"])([^=]*)\2\s*(?=>.+<\/a)/";//matches the opening anchor tag, as long 
        //as it has the string 'href' in it and it does not have the string '(target)=("_blank")' already
        $clean_update_str = rawurlencode(preg_replace($pattern,"$1$2http://$3$2 target=\"_blank\"",str_replace("http://","",strip_tags($raw_update_str, "<a>,<b>,<i>,<em>,<span>,<sup>,<sub>"))));
            
        try {
            $photo = Photo::get_by_id($_GET['p_cap']);
            if($clean_update_str === $photo->caption)
                echo 'Notice:No changes made. Nothing to update';
            else {
                $photo->update("caption={$clean_update_str}");
                echo $raw_update_str;
            }
        } catch(Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['pc_id'])) {
        try{
            $photo = Photo::get_by_id($_GET['pc_id']);
            $comments = $photo->subset_of_comments($_GET['offset']);
            
            $content = "";
            
            if(isset($_GET['public_comments'])) {
                if(is_array($comments)) {
                    foreach ($comments as $comment) {
                        $content .= "<div class='bottom_border comment nl2br'>";
                        $content .= "<div class='content'>".rawurldecode($comment->content)."</div>";
                        $content .= "<div class='by_when'>";
                        $content .= "<div class='by'>By <span>{$comment->author}</span></div>";
                        $content .= "<div class='when'>On ".$comment->datetime_to_text()."</div>";
                        $content .= "</div></div>";
                    }
                } else {
                    $content .= "<div class='bottom_border comment nl2br'>";
                    $content .= "<div class='content'>".rawurldecode($comments->content)."</div>";
                    $content .= "<div class='by_when'>";
                    $content .= "<div class='by'>By <span>{$comments->author}</span></div>";
                    $content .= "<div class='when'>On ".$comments->datetime_to_text()."</div>";
                    $content .= "</div></div>";
                }
            }
            else {
                if($_GET['offset'] == 0) {
                    $content .= "<div class='load_more_msg'></div>";
                    $content .= "<div cur_set='1' class='comments_wrapper'>";
                    $content .= "<p><span>{$photo->comment_count} ";
                    $content .= $photo->comment_count == 1 ? "comment" : "comments";
                    if($photo->comment_count > 1)
                        $content .= "</span> <span class='del_coms_parent'><a href='delete_comment.php?p_id={$photo->id}' class='scriptable_gen_link del_all_coms confirm_del'>Delete all comments</a></span></p>";
                    $content .= "<div class='comments'>";
                }
                if(is_array($comments)) {
                    foreach ($comments as $comment) {
                        $content .= "<div c_id ='{$comment->id}' class='bottom_border comment'>";
                        $content .= "<a class='del_com' href='delete_comment.php?c_id={$comment->id}";
                        //if(isset($_GET["c_set"])) $content .= "&s_no={$_GET["c_set"]}";
                        $content .= "' title='Delete comment' class='scriptable_table_link'><div class='absolute_pos delete delete_com'>&#x2717;</div></a>";
                        $content .= "<div class='content word_break nl2br'>".rawurldecode($comment->content)."</div>";
                        $content .= "<div class='by_when'>";
                        $content .= "<div class='by'>By <span>{$comment->author}</span></div>";
                        $content .= "<div class='when'>On ".$comment->datetime_to_text()."</div>";
                        $content .= "</div></div>";
                    }
                } else {
                    $content .= "<div c_id ='{$comments->id}' class='bottom_border comment'>";
                    $content .= "<a class='del_com' href='delete_comment.php?c_id={$comments->id}";
                    //if(isset($_GET["c_set"])) $content .= "&s_no={$_GET["c_set"]}";
                    $content .= "' title='Delete comment' class='scriptable_table_link'><div class='absolute_pos delete delete_com'>&#x2717;</div></a>";
                    $content .= "<div class='content word_break nl2br'>".rawurldecode($comments->content)."</div>";
                    $content .= "<div class='by_when'>";
                    $content .= "<div class='by'>By <span>{$comments->author}</span></div>";
                    $content .= "<div class='when'>On ".$comments->datetime_to_text()."</div>";
                    $content .= "</div></div>";
                }
                if($_GET["offset"] == 0) {
                    $content .= "</div>";
                    $content .= "</div>";
                    $content .= "<script src='".HOME."js/ajax/list_comments.js'></script>";
                }
            }
            echo $content;
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET["del_pc_id"])) {
        try{
            $photo = Photo::get_by_id($_GET["del_pc_id"]);
            //$photo->delete_comments();
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET["u_name"])) {
        sleep(2);
        try{
            if(User::is_username_taken($_GET["u_name"])) echo '1';
            else echo '0';
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET["da_id"])) {
        try{
            $album = Album::get_by_id($_GET['da_id']);
            //$album->delete_album();
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET["dpa_id"])) {
        try{
            $album = Album::get_by_id($_GET["dpa_id"]);
            //$album->delete_photos();
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET["dc_id"])) {
        try{
            $comment = Comment::get_by_id($_GET["c_id"]);
            //$comment->delete();
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['ao_id'])) {
        try{
            if($_GET["ao_id"] == 'a') {
                $albums = Album::get_subset_of_all($_GET['u_per_set'], $_GET['offset']);
                $unit_count = Album::count_all();
            }
            else {
                $albums = Album::get_by_query('SELECT * FROM '.Album::$table_name.' WHERE owner_id = '.$_GET['ao_id'].' LIMIT '.$_GET['u_per_set'].' OFFSET '.$_GET['offset']);
                $unit_count = User::get_by_id($_GET["ao_id"])->count_owned_albums();
            }
            $content = "";
            if($_GET['offset'] == 0) {
                $content .= "<div cur_set='1' class='inner_a_wrapper'>";
                $content .= "<div class='sect_head'><span>{$unit_count} ";
                $content .= $unit_count == 1 ? 'album' : 'albums';
                $content .= "</span>";
                $content .= "<div class='section_ui_msg_wrapper'></div>";
                if($unit_count > 1)
                    $content .= "<span class='del_albums_parent'><a href='delete_album.php?ao_id=".$_GET['ao_id']."' class='scriptable_gen_link del_all_albums confirm_del'>Delete all albums</a></span>";
                $content .= "</div>";
            }
            if(is_array($albums)) {
                foreach ($albums as $album) {
                    $content .= "<div o_id='{$album->owner_id}' class='album hover_trigger";
                    /*if($album->photo_count == 0)*/ $content .= " border_grey";
                    $content .= "' a_id='{$album->id}' name='";
                    $content .= $_GET['ao_id'] == 'a' ? 'a' : $album->owner_id;
                    $content .= "'>";
                    if($album->photo_count != 0)
                        $content .= "<a class='scriptable_hash_changer' id='to_list_photos_{$album->id}' href='".HOME."admin/list_photos.php?a_id={$album->id}'>";
                    $content .= "<img src='{$album->random_photo_path}'>";
                    if($album->photo_count != 0)
                        $content .= "</a>";
                    $content .= "<div class='absolute_pos name_edit_save hover_triggered'>";
                    $content .= "<span class='name'>";
                    $content .= $album->albumname;
                    $content .= "</span>";
                    $content .= "<a href='list_albums.php?o_id=";
                    $content .= $_GET["ao_id"] == 'a' ? 'a' : $album->owner_id;
                    //if(isset($_GET["c_set"])) $content .= "&c_set={$_GET["c_set"]}";
                    $content .= "&enma_id={$album->id}' class='edit edit_a_name scriptable_gen_link' title='Edit album name'></a>";
                    $content .= "</div>";
                    $content .= "<a href='";
                    if($album->photo_count > 0)
                        $content .= "confirm_deletion.php";
                    else
                        $content .= "delete_album.php";
                    $content .= "?da_id={$album->id}' title='Delete album' class='scriptable_gen_link confirm_del album_delete'><div class='absolute_pos delete hover_triggered'>";
                    $content .= "&#x2717;";
                    $content .= "</div></a>";
                    if($session->user_id == $album->owner_id || ($session->user_perms == 1 && $album->owner_id == User::get_the_original()->id)) {
                        $content .= "<a href='photo_upload.php?a_id={$album->id}' class='scriptable_gen_link photo_upload'><div class='absolute_pos upload hover_triggered'>";
                        $content .= "Upload a photo";
                        $content .= "</div></a>";
                    }
                    $content .= "<a href='list_albums.php?o_id=";
                    $content .= $_GET['ao_id'] == 'a' ? 'a' : $album->owner_id;
                    $content .= "&an_id={$album->id}";
                    //if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
                    $content .= "' class='scriptable_gen_link notes'><div class='absolute_pos notes hover_triggered'";
                    if(($session->user_perms != 1 && $session->user_id != $album->owner_id) || ($session->user_perms == 1 && $album->owner_id != User::get_the_original()->id))
                        $content .= " style='top: 41px; '";
                    $content .= ">";
                    if($album->notes != '') $content .= 'See notes';
                    else $content .= 'Add notes';
                    $content .= "</div></a>";
                    $content .= "<div class='absolute_pos date_owner list_albums_pg hover_triggered'>";
                    $content .= "<div>Created on {$album->date_to_text()}</div>";
                    if($_GET["ao_id"] == 'a') $content .= "<div>By {$album->owner()->full_name}</div>";
                    $content .= "<div>{$album->photo_count} ";
                    $content .= $album->photo_count == 1 ? 'photo</div>' : 'photos</div>';
                    $content .= "</div>";
                    $content .= "</div>";
                }
            } else {
                $content .= "<div o_id='{$albums->owner_id}' class='album hover_trigger";
                /*if($albums->photo_count == 0)*/ $content .= ' border_grey';
                $content .= "' a_id='{$albums->id}' name='";
                $content .= $_GET['ao_id'] == 'a' ? 'a' : $albums->owner_id;
                $content .= "'>";
                if($albums->photo_count != 0)
                    $content .= "<a class='scriptable_hash_changer' id='to_list_photos_{$albums->id}' href='".HOME."admin/list_photos.php?a_id={$albums->id}'>";
                $content .= "<img src='{$albums->random_photo_path}'>";
                if($albums->photo_count != 0)
                    $content .= "</a>";
                $content .= "<div class='absolute_pos name_edit_save hover_triggered'>";
                $content .= "<span class='name'>";
                $content .= $albums->albumname;
                $content .= "</span>";
                $content .= "<a href='list_albums.php?o_id=";
                $content .= $_GET["ao_id"] == 'a' ? 'a' : $albums->owner_id;
                $content .= "&enma_id={$albums->id}' class='edit edit_a_name scriptable_gen_link' title='Edit album name'></a>";
                $content .= "</div>";
                $content .= "<a href='";
                    if($albums->photo_count > 0)
                        $content .= 'confirm_deletion.php';
                    else
                        $content .= 'delete_album.php';
                $content .= "?da_id={$albums->id}' title='Delete album' class='scriptable_gen_link confirm_del album_delete'><div class='absolute_pos delete hover_triggered'>";
                $content .= "&#x2717;";
                $content .= "</div></a>";
                if($session->user_id == $albums->owner_id || ($session->user_perms == 1 && $albums->owner_id == User::get_the_original()->id)) {
                    $content .= "<a href='photo_upload.php?a_id={$albums->id}' class='scriptable_gen_link photo_upload'><div class='absolute_pos upload hover_triggered'>";
                    $content .= 'Upload a photo';
                    $content .= "</div></a>";
                }
                $content .= "<a href='list_albums.php?o_id=";
                $content .= $_GET['ao_id'] == 'a' ? 'a' : $albums->owner_id;
                $content .= "&an_id={$albums->id}";
                //if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
                $content .= "' class='scriptable_gen_link notes'><div class='absolute_pos notes hover_triggered'";
                if(($session->user_perms != 1 && $session->user_id != $albums->owner_id) || ($session->user_perms == 1 && $albums->owner_id != User::get_the_original()->id))
                    $content .= " style='top: 41px; '";
                $content .= ">";
                if($albums->notes != '') $content .= 'See notes';
                else $content .= 'Add notes';
                $content .= "</div></a>";
                $content .= "<div class='absolute_pos date_owner list_albums_pg hover_triggered'>";
                $content .= "<div>Created on {$albums->date_to_text()}</div>";
                if($_GET['ao_id'] == 'a') $content .= "<div>By {$albums->owner()->full_name}</div>";
                $content .= "<div>{$albums->photo_count} ";
                $content .= $albums->photo_count == 1 ? 'photo</div>' : 'photos</div>';
                $content .= "</div>";
                $content .= "</div>";
            }
            if($_GET["offset"] == 0) {
                $content .= "</div>";
            }
            echo $content;
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['an_id'])) {
        try{
            $album = Album::get_by_id($_GET['an_id']);
            echo rawurldecode($album->notes);
        } catch (Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['a_notes'])) {
        $raw_update_str = str_replace("\r\n","\n",trim(urldecode($_POST['a_notes'])));
        $pattern = "/(<a\s+(?:href)=?)(['\"])([^=]*)\2\s*(?=>.+<\/a)/";//matches the opening anchor tag, as long 
        //as it has the string 'href' in it and it does not have the string '(target)=("_blank")' already
        $clean_update_str = rawurlencode(preg_replace($pattern,'$1$2http://$3$2 target="_blank"',str_replace('http://','',strip_tags($raw_update_str, '<a>,<b>,<i>,<em>,<sup>,<sub>'))));
            
        try {
            $album = Album::get_by_id($_GET['a_notes']);
            $album->update("notes={$clean_update_str}");
            echo $raw_update_str;
        } catch(Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['enma_id'])) {
        $raw_update_str = trim(urldecode($_POST['a_name']));
        $clean_update_str = strip_tags($raw_update_str);
        
        try {
            $album = Album::get_by_id($_GET['enma_id']);
            $album->update("albumname={$clean_update_str}");
            echo $clean_update_str;
        } catch(Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['new_photo_modal'])) {
        try {
            $output= '';
            $albums = $session->user_perms === 1 ? User::get_the_original()->get_owned_albums():User::get_by_id($session->user_id)->get_owned_albums();
            if($albums) {
                $output .= "<form class='modal_dialog photo_upload big_form' id='photo_upload' action='photo_upload.php";
                if($_GET['new_photo_modal'] != 0) $output .= "?a_id={$_GET['new_photo_modal']}";
                $output .= "' method='POST' enctype='multipart/form-data'>\n";
                $output .= "<input type='hidden' name='MAX_FILE_SIZE' value='2000000' class='form_field'>\n";
                $output .= "<div class='ui_button file_selector blocking_dialog'><input type='file' name='photo' class='form_field validate_on_sub reqrd msg_span'>SELECT A PHOTO</div>\n";
                $output .= "<p class='no_script_para'><span class='label' id='for_caption'>Enter a caption below</span></p><textarea maxlength='4000' name='caption' class='p_holder form_field msg_span'></textarea><p></p>\n";
                $output .= "<select ";
                if($_GET['new_photo_modal'] != 0) $output .= "disabled ";
                $output .= "name='album_id' class='form_field validate_on_sub reqrd msg_span'><option id='no_selection' value='0'>**Select an album**</option>\n";
                echo $output;
                if(is_array($albums)) {
                            foreach($albums as $album)
                                if($album->id === $_GET['new_photo_modal'])
                                    echo "<option value='{$album->id}' selected='selected'>{$album->albumname}</option>\n";
                                else
                                    echo "<option value='{$album->id}'>{$album->albumname}</option>\n";
                        }
                        else
                            if($albums->id === $_GET['new_photo_modal'])
                                echo "<option value='{$albums->id}' selected='selected'>{$albums->albumname}</option>\n";
                            else
                                echo "<option value='{$albums->id}'>{$albums->albumname}</option>\n";

                $output = "</select></p>\n";
                if($_GET['new_photo_modal'] != 0)
                    $output .= "<input type='hidden' name='album_id' value='{$_GET['new_photo_modal']}' class='form_field'>\n";
                $output .= "<div class='radio_wrapper blocking_dialog'><span class='for_radios' id='for_cover_radios'>Make album cover?</span><ul name='cover_radios' left='160px' class='radios none_checked form_field validate_on_sub msg_span yes_no_choice'><li id='no'><span class='pre'></span><input class='form_field' type='radio' name='cover' value='0'";
                //if($cover === '0') $output .= "checked";
                $output .= "><span class='past'></span></li><li id='yes'><span class='pre'></span><input class='form_field' type='radio' name='cover' value='1'";
                //if($cover === "1") $output .= "checked";
                $output .= "><span class='past'></span></li></ul></div>\n";
                $output .= "<input class='form_field ui_button' type='submit' name='submit' value='UPLOAD'>\n</form>";
                echo $output;
            } else {
                $output .= "<p id='no_albums_alert'>You haven't created any album yet. Please create one before you can upload photos.</p>\n";
                $output .= "<a href='create_album.php'>Create a new album</a>";
                echo $output;
            }
        } catch(Exception $e) { /* HANDLE EXCEPTION */ }
    }
    elseif(isset($_GET['upload_photo'])) {
        $caption = strip_tags(trim($_POST['caption']), '<a>,<b>,<i>,<em>,<span>,<sup>,<sub>');
        $album_id = $_POST['album_id'];
        if(isset($_POST['cover']))
            $cover = $_POST['cover'];
        else
            $cover = null;
        try{
            $cover_perms_accounted = $session->user_perms === 1?'0':$cover; //prevent the Guest from altering the current album cover photo if the photo is uploaded for simulation
            $photo = Photo::validate_photo($_FILES['photo'], $caption, $album_id, $cover_perms_accounted);
            if($session->user_perms === 1 && $_GET['upload_photo'] !== 'via_list_photos' && $_GET['upload_photo'] !== 'via_list_albums') //if the user is Guest and the upload was done on pages other than 'list_photos.php'
                echo 'Info:Everything validates OK, and if your privileges were higher than Guest\'s, the photo would have been uploaded';
            else $filename = Photo::upload_photo($photo, true); //whatever the user's privileges, upload the photo to the database-- if it's Guest, the echo-ed string will be used for simulation
            if($_GET['upload_photo'] === 'via_list_albums')
                echo rawurlencode(Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE filename = '{$filename}' AND album_id ='{$album_id}'")->id);
            elseif($_GET['upload_photo'] === 'via_list_photos') { //if the photo is being uploaded on 'list_photos.php', the HTTP response is pertinent 'coz a visual representation of the newly uploaded photo my need to be appended in the document
                $just_added_photo = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE filename = '{$filename}' AND album_id ='{$album_id}'");
                $content = '';
                $content .= "<tr style='display: none; ' class='photo_row";
                $content .= $session->user_perms === 1?' simulation_row':'';
                $content .= "' p_id =\"{$just_added_photo->id}\">";
                $content .= "<td class=\"no_padding\"><img src=\"{$just_added_photo->image_path()}\"></td>";
                $content .= "<td class=\"fname word_break\">{$just_added_photo->filename}</td><td>{$just_added_photo->size_as_text()}</td><td>{$just_added_photo->type}</td>";
                if($just_added_photo->caption != "") {
                    $content .= "<td><form class='mini_form' action=\"edit_capt.php?p_cap={$just_added_photo->id}";
                    $stripped_str = str_replace(" target=\"_blank\"","",rawurldecode($just_added_photo->caption));
                    $content .= "\" method=\"post\"><textarea id='temp_id_1_1' name=\"p_cap\" class=\"fcapt mini_form_edit_field\" maxlength=\"4000\">{$stripped_str}</textarea>";
                    $content .= "<div class=\"capt_edit\"><input id='temp_id_1_2' type=\"submit\" value=\"Update changes\" class=\"scriptable_table_link edit_caption\">";
                    $content .= "<span class=\"char_counter\">".(Photo::MAX_CAPT_LEN - strlen(str_replace(" target=\"_blank\"","",rawurldecode($just_added_photo->caption))))."</span>";
                    $content .= "<a id='temp_id_1_3' class=\"scriptable_table_link\" href=\"edit_capt.php?dp_cap={$just_added_photo->id}";
                    $content .= "\" title=\"Delete caption\"><div class=\"absolute_pos delete delete_cap\">&#x2717;</div></a></div></form></td>";
                } else {
                    $content .= "<td id='temp_id_1'><a class=\"scriptable_table_link show_capt_input\" href=\"list_photos.php?a_id={$just_added_photo->album_id}&pcap_id={$just_added_photo->id}";
                    $content .= "\">Add caption</a></td>";
                }
                if($cover)
                    $content .= "<td id=\"current_cover_just_chosen\"><span style='display: none; '>Current album cover</span></td>";
                else
                    $content .= "<td id='temp_id_2'><a href=\"list_photos.php?a_id={$just_added_photo->album_id}&mkcover={$just_added_photo->id}\" class=\"scriptable_table_link change_cover\">Make cover photo</a></td>";
                if($just_added_photo->comment_count == 0)
                    $content .= "<td>No comments</td>";
                else {
                    $content .= "<td class='see_close_coms' u_count='{$just_added_photo->comment_count}'><a u_count='{$just_added_photo->comment_count}' href='list_photos.php?a_id={$just_added_photo->album_id}&pc_id={$just_added_photo->id}";
                    $content .= "' class='scriptable_table_link display_comments'>See comments</a></td>";
                }
                $content .= "<td id='temp_id_3'><a href=\"delete_photo.php?p_id={$just_added_photo->id}\" class=\"scriptable_table_link photo_delete\">Delete</a></td>";
                $content .= "</tr>";
                echo rawurlencode($content); //IE workaround-- otherwise the iframe AJAX method inserts the content into the iframe and parses it
            }
        } catch (Exception $e) { echo 'Error:'.$e->getMessage(); }
    }
    elseif(isset($_GET['delete_just_uploaded_photo'])) { // this code will be called if the user is Guest and the photo was uploaded on 'list_photos.php'; 'coz the content for simulation was already gathered, delete the photo
        $just_added_photo = Photo::get_by_id($_GET['delete_just_uploaded_photo']);
        $just_added_photo->delete_photo(true);
    }
    elseif(isset($_GET['new_album_modal'])) {
        $output = '';
        $output .= "<form id='create_album' class='modal_dialog album_create big_form' action='create_album.php' method='POST'>";
        $output .= "<p><span class='label' id='for_albumname'>Album name</span>";
        $output .= "<input class='p_holder form_field validate_on_sub reqrd msg_span' type='text' name='albumname' value='' maxlength='100'>";
        $output .= "</p>";
        $output .= "<p><span class='label' id='for_notes'>Album notes</span>";
        $output .= "<textarea class='p_holder form_field msg_span' name='notes' value='' maxlength='3000'></textarea>";
        $output .= "</p>";
        $output .= "<input class='form_field ui_button' type='submit' name='submit' value='CREATE'>";
        $output .= "</form>";
        echo $output;
    }
    elseif(isset($_GET['create_album'])) {
    foreach ($_POST as $field => $value)
            if($field == 'notes')
                $notes = strip_tags(trim(urldecode($value)), '<a>,<b>,<i>,<em>,<sup>,<sub>');
            else
                $$field = strip_tags(trim(urldecode($value)));
        try{
            $created  = Album::create_album($albumname, $notes);
            if($_GET['create_album'] === 'via_modal') { //only if the album is being created via a modal dialog is the HTTP response pertinent
                $just_added_album = Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE created = '{$created}'");
                $content = '';
                $content .= "<div o_id='{$just_added_album->owner_id}' class='album hover_trigger";
                if($just_added_album->photo_count == 0) $content .= ' border_grey';
                $content .= "' id='{$just_added_album->id}' name='";
                //$content .= $_GET['ao_id'] == 'a' ? 'a' : $just_added_album->owner_id;
                $content .= "' style='display: none; '>";
                if($just_added_album->photo_count != 0)
                    $content .= "<a href='".HOME."admin/list_photos.php?a_id={$just_added_album->id}'>";
                $content .= "<img src='{$just_added_album->random_photo_path}'>";
                if($just_added_album->photo_count != 0)
                    $content .= "</a>";
                $content .= "<div style='display: none; ' class='absolute_pos name_edit_save hover_triggered'>";
                $content .= "<span class='name'>";
                $content .= $just_added_album->albumname;
                $content .= "</span>";
                $content .= "<a href='list_albums.php?o_id=a"; //safe compromise
                //$content .= $_GET["ao_id"] == 'a' ? 'a' : $just_added_album->owner_id;
                $content .= "&enma_id={$just_added_album->id}' class='edit edit_a_name scriptable_gen_link' title='Edit album name'></a>";
                $content .= "</div>";
                $content .= "<a href='";
                    if($just_added_album->photo_count > 0)
                        $content .= 'confirm_deletion.php';
                    else
                        $content .= 'delete_album.php';
                $content .= "?da_id={$just_added_album->id}' title='Delete album' class='scriptable_gen_link confirm_del album_delete'><div style='display: none; ' class='absolute_pos delete hover_triggered'>";
                $content .= "&#x2717;";
                $content .= "</div></a>";
                if($session->user_id == $just_added_album->owner_id || ($session->user_perms == 1 && $just_added_album->owner_id == User::get_the_original()->id)) {
                    $content .= "<a href='photo_upload.php?a_id={$just_added_album->id}' class='scriptable_gen_link photo_upload'><div style='display: none; ' class='absolute_pos upload hover_triggered'>";
                    $content .= 'Upload a photo';
                    $content .= "</div></a>";
                }
                $content .= "<a href='list_albums.php?o_id=a"; //safe compromise
                //$content .= $_GET['ao_id'] == 'a' ? 'a' : $just_added_album->owner_id;
                $content .= "&an_id={$just_added_album->id}";
                //if(isset($_GET["c_set"])) $noscript_content .= "&c_set={$_GET["c_set"]}";
                $content .= "' class='scriptable_gen_link notes'><div style='display: none; ' class='absolute_pos notes hover_triggered'";
                if(($session->user_perms != 1 && $session->user_id != $just_added_album->owner_id) || ($session->user_perms == 1 && $just_added_album->owner_id != User::get_the_original()->id))
                    $content .= " style='top: 41px; '";
                $content .= ">";
                if($just_added_album->notes != '') $content .= 'See notes';
                else $content .= 'Add notes';
                $content .= "</div></a>";
                $content .= "<div style='display: none; ' class='absolute_pos date_owner list_albums_pg hover_triggered'>";
                $content .= "<div>Created on {$just_added_album->date_to_text()}</div>";
                //if($_GET['ao_id'] == 'a') $content .= "<div>By {$just_added_album->owner()->full_name}</div>";
                $content .= "<div>{$just_added_album->photo_count} ";
                $content .= $just_added_album->photo_count == 1 ? 'photo</div>' : 'photos</div>';
                $content .= "</div>";
                $content .= "<div id='data' a_owner_id='{$just_added_album->owner_id}' a_owner_name='{$just_added_album->owner()->full_name}' ></div>";
                $content .= "</div>";
                echo $content;
            }
        } catch (Exception $e) { /*echo 'Error:'.$e->getMessage();*/ }
    }
    elseif(isset($_GET['login'])) {
        $hashed_pw = sha1($_POST['password']);
        $username = $_POST['username'];
        try {
            $user = User::authenticate_user($username, $hashed_pw);
            if(!$user) {
                echo 'Error:The username and password combination did not match!';
            } else {
                $session->login($user);
                if(isset($_GET['to'])) echo "{$_GET['to']}.php";
                    else echo 'index.php';
            }
        } catch (Exception $e) { /*$message = $e->getMessage(); */ }  
    }
    elseif(isset($_GET['add_user'])) {
        $added = strftime('%Y-%m-%d %H:%M:%S',time());
        if(empty($_POST['perms'])) $perms = null;
        foreach ($_POST as $field => $value) {
            if($field == 'perms')
                $perms = (int)$value;
            else
                $$field = strip_tags(trim(urldecode($value)));
        }
        try {
            User::add_new($perms, $first_name, $last_name, $new_username, $new_password, $added);
            $privileges = $perms === 3 ? 'Super':($perms === 2 ? 'Normal':'Guest');
            echo 'The user "'.trim($new_username).'" was successfully added with '.$privileges.' privileges';
        } catch (Exception $e) { /*$message = $e->getMessage();*/ }  
    }
    elseif(isset($_GET['du_id'])) {
        try {
            $user = User::get_by_id($_GET['du_id']);
            if($user) $user->delete_user(true);
        } catch(Exception $e) { /*$message = $e->getMessage();*/ }
    }
    elseif(isset($_GET['clearlogs'])) {
        sleep(2);
        $user = User::get_by_id($session->user_id);
        log_action('Clear logs', $user->full_name, 'w');
        
        $handle = fopen(SITE_ROOT.DS.'logs'.DS.'log.txt', 'r');
        while(!feof($handle)) {
            $entry = fgets($handle);
            $entry_segments = explode(' | ', $entry);
            if(sizeof($entry_segments) == 4) {
                $date = $entry_segments[0];
                $time = $entry_segments[1];
                $action = $entry_segments[2];
                $user = $entry_segments[3];
            echo "<tr style='display:none; ' class='log_entry'><td>{$action}</td><td>{$user}</td><td>{$date}</td><td>{$time}</td></tr>";
            }
        }
        fclose($handle);
    }
    elseif(isset($_GET['log_action'])) {
        try {
            log_action($_GET['log_action'], User::get_by_id($session->user_id)->full_name);
        } catch(Exception $e) { /*$message = $e->getMessage();*/ }
    }
    elseif(isset($_GET['post_comment'])) {
        try {
            $author = strip_tags(trim(urldecode($_POST['author'])));
            $comment = strip_tags(trim(urldecode($_POST['comment'])), '<i>,<em>,<sup>,<sub>');
            $created = Comment::post($_GET['post_comment'], $author, $comment);
            if(Photo::get_by_id($_GET['post_comment'])->count_comments() < 8) { //the comment gets appended on the document only if the comment count is < 8
                $just_posted_comment = Comment::get_by_query("SELECT * FROM ".Comment::$table_name." WHERE created = '{$created}'");
                $content = '';
                $content .= "<div style='display: none; ' class='bottom_border comment word_break nl2br'>";
                $content .= "<div class='content'>".rawurldecode($just_posted_comment->content)."</div>";
                $content .= "<div class='by_when'>";
                $content .= "<div class='by'>By <span>{$just_posted_comment->author}</span></div>";
                $content .= "<div class='when'>On ".$just_posted_comment->datetime_to_text()."</div>";
                $content .= "</div></div>";
                echo $content;
            }
        } catch (Exception $e) { /*$message = $e->getMessage();*/ }
    }
    elseif(isset($_GET['is_logged_in'])) {
        try {
            echo $session->is_logged_in()?'true':'false';
        } catch (Exception $e) { /*$message = $e->getMessage();*/ }
    }
    else { /* REDIRECT TO 401/403 MAYBE??? */ }
    $database->close_connection();
?>