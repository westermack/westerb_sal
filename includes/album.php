<?php
require_once LIB_PATH.DS.'database_liaison.php';

class Album extends DatabaseLiaison {
    public static $table_name = "albums";
    public static $albums_upload_dir = "images";
    public static $albums_placeholder_dir = "placeholders";
    public $id;
    public $albumname;
    public $created;
    public $owner_id;
    public $notes;
    public $photo_count;
    public $random_photo_path;
    const MAX_ANAME_LEN = 100;
    const MAX_NOTES_LEN = 3000;
    
    protected function __construct($record) {
        foreach($record as $attribute=>$value) {
        if($this->has_attribute($attribute))
            $this->$attribute = $value;
        }
        $this->photo_count = $this->count_photos();
        if($this->photo_count == 0)
            $this->random_photo_path = $this->random_placeholder_path();
        elseif($this->photo_count == 1)
            $this->random_photo_path = $this->get_album_photos()->image_path();
        elseif($this->photo_count > 10) {
            $rand_i = rand(0, 9);
            $photos = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = \"{$this->id}\" LIMIT 10");
            $this->random_photo_path = $photos[$rand_i]->image_path();
        } else {
            $rand_i = rand(0, $this->photo_count - 1);
            $photos = $this->get_album_photos();
            $this->random_photo_path = $photos[$rand_i]->image_path();
        }
    }
    public static function create_album($a_name, $notes) {
        if(empty($a_name) || $a_name == "Album name")
            throw new Exception("The album name can not be empty");
        elseif(strlen($a_name) > self::MAX_ANAME_LEN)
            throw new Exception("The album name is ".strlen($a_name)." characters long. Please keep it under ".self::MAX_ANAME_LEN." characters");
        $notes = str_replace("\r\n","\n",$notes);
        if(strlen($notes) > self::MAX_NOTES_LEN)
            throw new Exception("The album notes are ".strlen($notes)." characters long. Please keep them under ".self::MAX_NOTES_LEN." characters");
        global $session;
        if($session->user_perms === 1) {
            Session::set_message("Everything validates OK, and if your privileges were higher than Guest's, the album would have been created", "info");
            redirect_to("create_album.php");
        }
        $created = strftime("%Y-%m-%d %H:%M:%S",time());
        If($notes == "Album notes") $notes = "";
        $notes = rawurlencode($notes);
        $a_name = mysql_prep($a_name);
        Album::create_new("albumname = {$a_name}", "created = {$created}", "owner_id = {$session->user_id}", "notes = {$notes}");
        log_action("Create album", User::get_by_id($session->user_id)->full_name);
        $new_record = Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE created = \"{$created}\"");
        if(!mkdir(SITE_ROOT.DS."public".DS.Album::$albums_upload_dir.DS.$new_record->id, 0777)) {
            //remove the new database record first
            $new_record->delete();
            throw new Exception("The album \"{$new_record->albumname}\" could not be created ".mysql_error());
        }
       return $created; //used in albums created via AJAX to get the album record just inserted in the DB, and construct the correspondiing HTML string for updating the on-screen information
    }
    public static function random_placeholder_path() {
        return HOME.Album::$albums_upload_dir."/".Album::$albums_placeholder_dir."/".rand(1, 5).".png";
    }
    public function cover_path() {
        $cover = $this->get_cover();
        if($cover)
            return HOME.Album::$albums_upload_dir."/".$this->id."/".$cover->filename;
        else
            return FALSE; //try to return random_placeholder_path instead
    }
    public function get_cover() {
        $cover = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = \"{$this->id}\" AND cover = 1");
        if($cover)
            return $cover;
        else
            return FALSE;
    }
    public function owner() {
        return User::get_by_id($this->owner_id);
    }
    public function get_album_photos() {
        $photos = Photo::get_by_query("SELECT * FROM ".Photo::$table_name." WHERE album_id = \"{$this->id}\"");
        return $photos;
    }
    public function count_photos() {
        global $database;
        $resource = $database->do_query("SELECT COUNT(*) FROM ".Photo::$table_name." WHERE album_id = {$this->id}");
        return (int) $database->fetch_array($resource)[0];
    }
    public function delete_photos() {
        //**if the code calls this method and it falls through without checking if user perms == 1 here, it will be checked
        //in the general delete method in DatabaseLiaison and the called class there will be Photo instead of Album
        global $session;
        $whose = isset($_SESSION["back_to_all"]) ? ($_SESSION["back_to_all"] ? "?o_id=a":"?o_id=".$this->owner_id):"";
        if($session->user_perms === 1) {
            Session::set_message("As a guest, you do not have sufficient privileges to delete albums or their photos", "notice");
            redirect_to("list_albums.php{$whose}");
        }//**
        
        $photos = $this->get_album_photos();
        if(is_array($photos))
            foreach ($photos as $photo)
                $photo->delete_photo();
        else
            $photos->delete_photo();
    }
    public function delete_album() {
        try {
                if($this->photo_count > 0)
                    $this->delete_photos();
                $this->delete();
                if(rmdir(SITE_ROOT.DS."public".DS.Album::$albums_upload_dir.DS.$this->id)) return;
                else {
                    //restore database record first
                    Album::create_new("id = {$this->id}", "albumname = {$this->albumname}", "created = {$this->created}", "owner_id = {$this->owner_id}", "notes = {$this->notes}");
                    Session::set_message("Failed to delete \"{$this->albumname}\": problems with unlinking the directory ".mysql_error(), "error");
                    if(isset($_SESSION["back_to_all"]) && !$_SESSION["back_to_all"])
                        redirect_to("list_albums.php?o_id={$this->owner_id}");
                    else
                        redirect_to("list_albums.php?o_id=a");
                }
            } catch (Exception $e) {
                Session::set_message($e->getMessage(), "error");
                if(isset($_SESSION["back_to_all"]) && !$_SESSION["back_to_all"])
                    redirect_to("list_albums.php?o_id={$this->owner_id}");
                else
                    redirect_to("list_albums.php?o_id=a");
            }
    }
}
?>
