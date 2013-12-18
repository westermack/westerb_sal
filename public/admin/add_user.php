<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=add_user");
}
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
//**Refactoring candidate
if($session->user_perms === 2) {
    Session::set_message("Sorry, you do not have sufficient privileges to access that page", "notice");
    redirect_to("index.php");
}//**

if(isset($_POST["submit"])) {
    $added = strftime("%Y-%m-%d %H:%M:%S",time());
    if(empty($_POST["perms"])) $perms = null;
    foreach ($_POST as $field => $value) {
        if($field == "perms")
            $perms = (int)$value;
        else
            $$field = strip_tags(trim($value));
    }
    try {
        User::add_new($perms, $first_name, $last_name, $new_username, $new_password, $added);
        $privileges = $perms === 3 ? "Super":($perms === 2 ? "Normal":"Guest");
        Session::set_message("The user \"".trim($new_username)."\" was successfully added with {$privileges} privileges", "success");
        redirect_to("index.php");
    } catch (Exception $e) { $message = $e->getMessage(); $message_type = "error"; }
} else {
    list($message, $message_type) = $session->get_message();
    $new_username = $new_password = $first_name= $last_name = $perms = "";
}

$admin = true; $paginated = false;
include_layout_template("header.php");
?>

        <div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" class="msg_bottom_margin" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
            <a id="to_admin_home" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php HOME.'admin/index.php'; ?>">Cancel</a>
            <h2 class="hash_change_removed_2 faded">Add New User</h2>
            <?php display_message($message, $message_type); ?>
            <form id="add_user" class="big_form" action="
                <?php
                    echo HOME."admin/add_user.php";
                ?>" method="POST">
                <div class="radio_wrapper hash_change_removed_3 slided"><span class="for_radios" id="for_perms_radios">Select user privileges</span>
                    <ul name="perms_radios" left="180px" class="radios none_checked form_field validate_on_sub msg_span">
                        <li id="super">
                            <span class="pre"></span>
                            <input class="form_field" type="radio" name="perms" value="3" <?php if($perms === 3) echo "checked"; ?> >
                            <span class="past"></span>
                        </li>
                        <li id="normal">
                            <span class="pre"></span>
                            <input class="form_field" type="radio" name="perms" value="2" <?php if($perms === 2) echo "checked"; ?> >
                            <span class="past"></span>
                        </li>
                        <li id="guest">
                            <span class="pre"></span>
                            <input class="form_field" type="radio" name="perms" value="1" <?php if($perms === 1) echo "checked"; ?> >
                            <span class="past"></span>
                        </li>
                    </ul>
                </div>
                <p class="non_guest"><span class="label" id="for_first_name">First name</span>
                    <input class="p_holder form_field reqrd msg_span" type="text" name="first_name" value="<?php echo htmlentities($first_name); ?>" maxlength="30">
                </p>
                <p class="non_guest"><span class="label" id="for_last_name">Last name</span>
                    <input class="p_holder form_field reqrd msg_span" type="text" name="last_name" value="<?php echo htmlentities($last_name); ?>" maxlength="30">
                </p>
                <p class="hash_change_removed_3 slided"><span class="label" id="for_new_username">New username</span>
                    <input class="p_holder form_field validate_on_sub reqrd msg_span" type="text" name="new_username" value="<?php echo htmlentities($new_username); ?>" maxlength="50">
                </p>
                <p class="hash_change_removed_3 slided"><span class="label" id="for_new_password">New password</span>
                    <input class="p_holder form_field reqrd validate_on_sub msg_span" type="text" name="new_password" value="<?php echo htmlentities($new_password); ?>" maxlength="40">
                </p>
                <div class="hash_change_removed_3 slided"><input class="form_field ui_button" type="submit" name="submit" value="ADD USER"></div>
            </form>
        </div>

<?php include_layout_template("footer.php"); ?>