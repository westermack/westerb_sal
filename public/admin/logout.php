<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) { redirect_to("login.php?to=index"); }

$user = User::get_by_id($session->user_id);
log_action("Logout", $user->full_name, "at");
$session->logout();
redirect_to("..");
?>
