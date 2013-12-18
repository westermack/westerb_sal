<?php
require_once LIB_PATH.DS.'database_liaison.php';

class User extends DatabaseLiaison {
    public static $table_name = "users";
    public $id;
    public $username;
    public $first_name;
    public $last_name;
    public $perms;
    public $added;
    public $sponsor_id;
    public $full_name;
    const MAX_NAMES_LEN = 30;
    const MAX_UNAME_LEN = 50;
    const MAX_PWORD_LEN = 40;
    const ADMIN_PERMS_CODE = 3;
    const REGULAR_PERMS_CODE = 2;
    const GUEST_PERMS_CODE = 1;
    
    protected function __construct($record) {
        foreach($record as $attribute=>$value) {
        if($this->has_attribute($attribute))
            $this->$attribute = $value;
        }
        $this->full_name = $this->first_name." ".$this->last_name;
    }
    
    public static function authenticate_user($username="", $password="") {
        $username = mysql_prep($username);
        return self::get_by_query("SELECT * FROM ".self::$table_name." WHERE username = \"{$username}\" AND password = \"{$password}\"");
    }
    
    public static function is_username_taken($username="") {
        return self::get_by_query("SELECT * FROM ".self::$table_name." WHERE username = \"{$username}\"");
    }
    
    public static function add_new($perms=null, $first_name="", $last_name="", $new_username="", $new_password="", $added="") {
        for($i = 0, $args_count = func_num_args(); $i < $args_count; $i++) {
            $value = func_get_arg($i); $val_len = strlen($value);
            switch ($i) {
                case 0:
                    if(is_null($value))
                        throw new Exception("Please select privileges for the user");
                    if($value != 1) {
                        if(func_get_arg(1) == "")
                            throw new Exception("Please provide the user's first name");
                        if(strlen($first_name) > self::MAX_NAMES_LEN)
                            throw new Exception("The first name is ".strlen($first_name)." characters long. Please keep it under ".self::MAX_NAMES_LEN." characters");
                        if(func_get_arg(2) == "")
                            throw new Exception("Please provide the user's last name");
                        if(strlen($last_name) > self::MAX_NAMES_LEN)
                            throw new Exception("The last name is ".strlen($last_name)." characters long. Please keep it under ".self::MAX_NAMES_LEN." characters");
                        $first_name = mysql_prep($first_name); $last_name = mysql_prep($last_name);
                    }
                    else
                        { $first_name = "Welcomed"; $last_name = "Guest"; }
                    break;
                case 3:
                    if($value == "")
                        throw new Exception("Please provide a username for the user");
                    if(strtolower($value) == "username")
                        throw new Exception("Sorry, \"{$value}\" is not a valid username. Please provide another one");
                    if(strstr($value, " ") !== FALSE)
                        throw new Exception("Sorry, the username \"{$value}\" contains some space between characters. That is not allowed");
                    if($val_len > self::MAX_UNAME_LEN)
                        throw new Exception("The username is {$val_len} characters long. Please keep it under ".self::MAX_UNAME_LEN." characters");
                    $value = mysql_prep($value);
                    $pre_existing_user = self::get_by_query("SELECT * FROM ".self::$table_name." WHERE username = \"{$value}\"");
                    if($pre_existing_user)
                        throw new Exception("Sorry, the username \"{$value}\" is already taken");
                    $new_username = $value;
                    break;
                case 4:
                    if($value == "")
                        throw new Exception("Please provide a password for the user");
                    if(strtolower($value) == "password")
                        throw new Exception("Sorry, \"{$value}\" is a very weak password and is not allowed. Please provide another one");
                    if(strtolower($value) == "new password")
                        throw new Exception("Sorry, \"{$value}\" is not a valid password. Please provide another one");
                    if($val_len > self::MAX_PWORD_LEN)
                        throw new Exception("The password is {$val_len} characters long. Please keep it under ".self::MAX_PWORD_LEN." characters");
                    $new_password = sha1($value);
                    break;
                default:
                    break;
            }
        }
        global $session;
        if($session->user_perms === 1) {
            Session::set_message("Everything vaidates OK, and if your privileges were higher than Guest's, the user would have been added", "success");
            redirect_to("add_user.php");
        }
        self::create_new("username={$new_username}","password={$new_password}","first_name={$first_name}","last_name={$last_name}","perms={$perms}","added={$added}","sponsor_id={$session->user_id}");
        log_action("Add new user", self::get_by_id($session->user_id)->full_name);
    }
    
    public static function get_the_original() {
        return self::get_by_query("SELECT * FROM ".self::$table_name." WHERE sponsor_id = 0");
    }
    
    public function get_owned_albums() {
        return Album::get_by_query("SELECT * FROM ".Album::$table_name." WHERE owner_id = {$this->id}");
    }
    
    public function count_owned_albums() {
        global $database;
        $resource = $database->do_query("SELECT COUNT(*) FROM ".Album::$table_name." WHERE owner_id = {$this->id}");
        return $database->fetch_array($resource)[0];
    }
    
    public function delete_owned_albums() {
        if($this->count_owned_albums() > 0) {
            $owned_albums = $this->get_owned_albums();
            if(is_array($owned_albums)) {
                foreach ($owned_albums as $owned_album) {
                    $owned_album->delete_album();
                }
            }
            else $owned_albums->delete_album();
        }
    }
    
    public function delete_user($ajax=false) {
        global $session;
        $this->delete_owned_albums();
        $this->delete();
        if($this->id == $session->user_id) { //if the user is deleting herself, log her out
            $session->logout();
            if(!$ajax) { //if the call wasn't made via AJAX, redirect her to the public area
                Session::set_message('You successfully deleted yourself from The Salon', 'success');
                redirect_to("..");
            }
        }
    }
}
?>