<?php
class Session {
    private $logged_in = FALSE;
    public $message;
    public $message_type;
    public $user_id;
    public $user_perms;
    
    public function __construct() {
        session_start();
        $this->check_login();
        $this->check_message();
    }
    
    public static function set_message($message, $message_type="") {
        $_SESSION["message"] = $message;
        $_SESSION["message_type"] = $message_type;
    }
    
    public function get_message() {
        return array($this->message, $this->message_type);
    }
    
    private function check_message() {
        if(isset($_SESSION["message"]) && isset($_SESSION["message_type"])) {
            $this->message = $_SESSION["message"];
            $this->message_type = $_SESSION["message_type"];
            unset($_SESSION["message"]);
            unset($_SESSION["message_type"]);
        } else $this->message = $this->message_type = "";
    }
    
    private function check_login() {
        if(isset($_SESSION["user_id"])) {
            $this->logged_in = TRUE;
            $this->user_id = (int)$_SESSION["user_id"];
            $this->user_perms = (int)$_SESSION["user_perms"];
        } else {
            $this->logged_in = FALSE;
            unset($this->user_id);
            $this->user_perms = 0;
        }
    }
    
    public function is_logged_in() {
            return $this->logged_in;
    }
    
    public function login($user) {
        if($user) {
            $this->logged_in = TRUE;
            $this->user_id = (int)$_SESSION["user_id"] = $user->id;
            $this->user_perms = (int)$_SESSION["user_perms"] = $user->perms;
            log_action("Login", $user->full_name);
            return TRUE;
        } else return FALSE;
    }
    
    public function logout() {
        unset($_SESSION["user_id"]);
        unset($this->user_id);
        unset($_SESSION["user_perms"]);
        $this->user_perms = 0;
        $this->logged_in = FALSE;
    }
}
$session = new Session;
?>
