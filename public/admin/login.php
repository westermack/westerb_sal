<?php
require_once '../../includes/initialize.php'; 
if($session->is_logged_in()) { redirect_to("index.php"); }
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
if(isset($_POST["submit"])) {
    $hashed_pw = sha1($_POST["password"]);
    $username = $_POST["username"];
    try {
        $user = User::authenticate_user($username, $hashed_pw);
        if(!$user) {
            $message = "The username and password combination did not match!"; $message_type = "error";
        } else {
            $session->login($user);
            $session->message = $session->message_type = "";
            if(isset($_GET["to"]))
                redirect_to("{$_GET["to"]}.php");
                else
                    redirect_to("index.php");
        }
    } catch (Exception $e) { $message = $e->getMessage(); $message_type = "error"; }  
} else {
    list($message, $message_type) = $session->get_message();
    $username = "";
}

$admin = true; $paginated = false;
include_layout_template("header.php");
?>

        <div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
            <h2 class="hash_change_removed_1 faded">User Login</h2>
            <?php display_message($message, $message_type); ?>
            <form id="login_form" class="big_form" action="
                <?php
                    echo HOME."admin/login.php";
                    if(isset($_GET["to"])) echo "?to={$_GET["to"]}";
                ?>" method="post">
                <p class="hash_change_removed_2 slided"><span class="label" id="for_username">Username</span>
                    <input class="p_holder has_pword form_field validate_on_sub reqrd msg_span" type="text" name="username" value="<?php echo htmlentities($username); ?>" maxlength="50">
                </p>
                <p class="pass_text hash_change_removed_2 slided"><span class="label">Password</span>
                    <input class="form_field reqrd validate_on_sub" type="password" name="password" value="" maxlength="40">
                    <input class="form_field msg_span" type="text" value="" name="password_placeholder" maxlength="40">
                </p>
                <div class="hash_change_removed_2 slided"><input id="login" class="form_field ui_button scriptable_hash_changer" type="submit" name="submit" value="LOGIN"></div>
            </form>
        </div>

<?php include_layout_template("footer.php"); ?>