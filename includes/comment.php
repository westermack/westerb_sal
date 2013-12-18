<?php
require_once LIB_PATH.DS.'database_liaison.php';

class Comment extends DatabaseLiaison {
    public static $table_name = "comments";
    public $id;
    public $photo_id;
    public $created;
    public $author;
    public $content;
    const MAX_AUNAME_LEN = 30;
    const MAX_CMT_LEN = 1000;
    
    protected function __construct($record) {
        foreach($record as $attribute=>$value) {
        if($this->has_attribute($attribute))
            $this->$attribute = $value;
        }
    }
    
    public static function post($photo_id=0, $author="", $comment="") {
        if(strlen($author) > self::MAX_AUNAME_LEN)
            throw new Exception("The name you provided is ".strlen($author)." characters long. Please keep it under ".self::MAX_AUNAME_LEN." characters");
        if(strlen($comment) > self::MAX_CMT_LEN)
            throw new Exception("Your comment is ".strlen($comment)." characters long. Please keep it under ".self::MAX_CMT_LEN." characters");
        if(strtolower(str_replace(" ", "", $author)) == "yourname" || $author == "") $author = "Anonymous";
        if(strtolower(str_replace(" ", "", $comment)) == "yourcomment" || $comment == "")
            throw new Exception("You can not post an empty comment");
        $author = mysql_prep($author);
        $comment = rawurlencode($comment);
        $created = strftime("%Y-%m-%d %H:%M:%S",time());
        self::create_new("photo_id = {$photo_id}", "created = {$created}", "author = {$author}", "content = {$comment}");
        return $created; //used in comments posted via AJAX to get the comment record just inserted in the DB, and construct the correspondiing HTML string for updating the on-screen information
    }
    
    public static function photo_comments($photo_id=0) {
        return self::get_by_query("SELECT * FROM ".self::$table_name." WHERE photo_id = {$photo_id}");
    }
    
    public static function photo_comments_subset($photo_id=0,$offset=0,$limit=8) {
        return self::get_by_query("SELECT * FROM ".self::$table_name." WHERE photo_id = {$photo_id} LIMIT {$limit}  OFFSET {$offset}");
    }
}

?>
