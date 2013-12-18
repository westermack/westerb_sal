<?php
require_once LIB_PATH.DS.'album.php';

class Photo extends DatabaseLiaison {
    public static $table_name = "photos";
    public $id;
    public $filename;
    public $type;
    public $size;
    public $caption;
    public $album_id;
    public $comment_count;
    const MAX_FNAME_LEN = 25;
    const MAX_CAPT_LEN = 4000;
    
    protected function __construct($record) {
        foreach($record as $attribute=>$value) {
        if($this->has_attribute($attribute))
            $this->$attribute = $value;
        }
        $this->comment_count = $this->count_comments();
    }
    
    public static function validate_photo($photo, $caption, $album_id, $cover) {
        global $session;
        $caption = trim($caption); $caption_len = strlen($caption);
        
        switch ($photo["error"]) {
            case UPLOAD_ERR_INI_SIZE: throw new Exception("Please keep the photo size under ".($session->user_perms === 1 ?"1":"2")." MB");
            case UPLOAD_ERR_FORM_SIZE: throw new Exception("Please keep the photo size under ".($session->user_perms === 1 ?"1":"2")." MB");
            case UPLOAD_ERR_PARTIAL: throw new Exception("Photo was only partially uploaded");
            case UPLOAD_ERR_NO_FILE: throw new Exception("No photo provided for upload");
            case UPLOAD_ERR_NO_TMP_DIR: throw new Exception("No temporary directory");
            case UPLOAD_ERR_CANT_WRITE: throw new Exception("Photo can't be written to disk. Check file permissions");
            case UPLOAD_ERR_EXTENSION: throw new Exception("Photo upload stopped by extension");
            default:
                if($album_id === "0")
                    throw new Exception("Please select an album for your photo");
                if(is_null($cover))
                    throw new Exception("Please select whether you want this as the cover photo or not");
                if($photo["type"] != "image/jpeg" && $photo["type"] != "image/png") {
                    try{
                        throw new Exception("Please provide a valid JPEG or PNG file");
                    } catch (Exception $e1) {
                        if($caption_len > self::MAX_CAPT_LEN)
                            throw new Exception($e1->getMessage()." and the {$caption_len} character-long caption must be below ".self::MAX_CAPT_LEN." characters");
                                else
                                    throw new Exception($e1->getMessage());
                        }
                }
                elseif($photo["type"] == "image/jpeg" || $photo["type"] == "image/png") {
                    $a = explode("/", $photo["type"]);
                    $fextention = $a[1];
                    $full_fname_len = strlen($photo["name"]);
                    if($fextention == "png")
                        $base_fname_len = $full_fname_len - 4;
                    else {
                        if(preg_match("/.+(\.jpeg)$/", $photo["name"]))
                            $base_fname_len = $full_fname_len - 5;
                        else
                            $base_fname_len = $full_fname_len - 4;
                    }
                    if($base_fname_len > self::MAX_FNAME_LEN)
                        throw new Exception("The file name is ".$base_fname_len." characters long. Please keep it under ".self::MAX_FNAME_LEN." characters");
                }
                if($caption_len > self::MAX_CAPT_LEN)
                    throw new Exception("The caption is {$caption_len} characters long. Please keep it under ".self::MAX_CAPT_LEN." characters");
                
                $pre_existing_photo = self::get_by_query("SELECT * FROM ".self::$table_name." WHERE filename = \"{$photo["name"]}\" AND album_id = {$album_id}");
                if($pre_existing_photo) {
                    throw new Exception("Sorry, a photo with the name \"{$photo["name"]}\" already exists in that album");
                }
                
                if($caption == "Photo caption") $caption = "";
                $photo[] = $caption;
                $photo[] = $album_id;
                $photo[] = $cover;
                return $photo;
        }
    }
    
    public static function upload_photo($photo, $ajax = false) {
        global $session;
        if($session->user_perms === 1 && !$ajax) {
            Session::set_message("Everything validates OK, and if your privileges were higher than Guest's, the photo \"{$photo["name"]}\" would have been uploaded", "info");
            redirect_to("photo_upload.php");
        }
        $pre_existing_cover = self::get_by_query("SELECT * FROM ".self::$table_name." WHERE album_id = {$photo[1]} AND cover = 1");
        if($pre_existing_cover && $photo[2] == 1) {
            $pre_existing_cover->update("cover = 0");
        }
        $photo[0] = rawurlencode($photo[0]);
        if(move_uploaded_file($photo["tmp_name"], SITE_ROOT.DS."public".DS.Album::$albums_upload_dir.DS.$photo[1].DS.$photo["name"])) {
            self::create_new("filename = {$photo["name"]}", "type = {$photo["type"]}", "size = {$photo["size"]}", "caption = {$photo[0]}", "album_id = {$photo[1]}", "cover = {$photo[2]}");
            log_action("Photo upload", User::get_by_id($session->user_id)->full_name);
            return $photo["name"]; //used in photos uploaded via AJAX on 'list_photos.php' to get the photo record just inserted in the DB, and construct the correspondiing HTML string for updating the on-screen information
        } else {
            throw new Exception(mysql_error());
        }
    }
    
    public function delete_photo($ajax = false) {
        try {
                $this->delete($ajax);
                if(unlink(SITE_ROOT.DS."public".DS.Album::$albums_upload_dir.DS.$this->album_id.DS.$this->filename)) {
                    $comments = $this->comments(); //delete all comments associated with the photo
                    if(is_array($comments))
                        foreach ($comments as $comment)
                            $comment->delete();
                    elseif($comments !== FALSE)
                        $comments->delete();
                }
                else {
                    //restore database record first
                    Photo::create_new("id = {$this->id}", "filename = {$this->filename}", "type = {$this->type}", "size = {$this->size}", "caption = {$this->caption}");
                    Session::set_message("Failed to delete \"{$this->filename}\": problems with unlinking the file ".mysql_error(), "error");
                    redirect_to("list_photos.php?a_id={$this->album_id}");
                }
            } catch (Exception $e) { Session::set_message($e->getMessage(), "error"); redirect_to("list_photos.php?a_id={$this->album_id}"); }
    }
    
    public function image_path() {
        return HOME.Album::$albums_upload_dir."/".$this->album_id."/".$this->filename;
    }
    
    public function size_as_text() {
        if($this->size < 1024)
            return $this->size." bytes";
        elseif($this->size < 1048576)
            return round($this->size/1024)." KB";
        else
            return round($this->size/1048576, 1)." MB";
    }
    
    public function make_cover() {
        $pre_existing_cover = self::get_by_query("SELECT * FROM ".self::$table_name." WHERE album_id = {$this->album_id} AND cover = 1");
        if($pre_existing_cover)
            $pre_existing_cover->update("cover = 0");
        $this->update("cover = 1");
    }
    
    public function comments() {
        return Comment::photo_comments($this->id);
    }
    
    public function subset_of_comments($offset=0,$limit=8) {
        return Comment::photo_comments_subset($this->id,$offset,$limit);
    }
    
    public function count_comments() {
        global $database;
        $resource = $database->do_query("SELECT COUNT(*) FROM ".Comment::$table_name." WHERE photo_id = {$this->id}");
        return (int)$database->fetch_array($resource)[0];
    }
    
    public function delete_comments() {
        $comments = $this->comments();
        if(is_array($comments))
            foreach ($comments as $comment)
                $comment->delete();
        else
            $comments->delete();
    }
}
?>