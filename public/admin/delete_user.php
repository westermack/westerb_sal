<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}
//**Refactoring candidate
if($session->user_perms === 2) {
    Session::set_message("Sorry, you do not have sufficient privileges to access that page", "notice");
    redirect_to("index.php");
}//**
//$admin = true; FOR AJAX???

if(isset($_GET["u_id"])) {
    try {
        $user = User::get_by_id($_GET["u_id"]);
        if($user) {
            $user->delete_user();
            Session::set_message("The user \"{$user->full_name}\" was successfully deleted", "success");
            redirect_to("list_users.php");
        }
        else {
            Session::set_message("The user you tried to delete does not exist", "error");
            redirect_to("list_users.php");
        }
    } catch(Exception $e) {
        Session::set_message("The user you tried to delete does not exist", "error");
        redirect_to("list_users.php");
    }
} else {
    Session::set_message("Please select the user you wish to delete before accessing the delete page", "error");
    redirect_to("list_users.php");
}

$database->close_connection();
?>
