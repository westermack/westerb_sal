<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=create_album");
}
$admin = true; $paginated = false;
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
include_layout_template("header.php");
if(isset($_POST["submit"])) {
    foreach ($_POST as $field => $value)
        if($field == "notes")
            $notes = strip_tags(trim($value), "<a>,<b>,<i>,<em>,<sup>,<sub>");
        else
            $$field = strip_tags(trim($value));
    try{
        Album::create_album($albumname, $notes);
        Session::set_message("The album \"".trim($albumname)."\" was successfully created", "success");
        $redirect_str = "list_albums.php?o_id=";
        $redirect_str .= isset($_SESSION["back_to_all"]) && $_SESSION["back_to_all"] ? "a":$session->user_id;
        redirect_to($redirect_str);
    } catch (Exception $e) { $message = $e->getMessage(); $message_type = "error"; }
} else {
    list($message, $message_type) = $session->get_message();
    $notes = $albumname = "";
}
?>

<div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
    <a id="to_admin_home" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php
    //if creation request is from 'list_albums.php', 'cancelcreate_to' is set, to a specific owner id if o_id was set or to 'salon_albums' if it wasn't
    //else it's from 'index.php'
    if(isset($_SESSION["cancelcreate_to"])) {
        if($_SESSION["cancelcreate_to"] === "salon_albums") 
            echo HOME."admin/list_albums.php";
        else {
            echo HOME."admin/list_albums.php?o_id={$_SESSION["cancelcreate_to"]}";
        }
    }
    else echo HOME."admin/index.php";
    ?>">Cancel</a>
    <h2 class="hash_change_removed_2 faded">New Album</h2>
    <?php display_message($message, $message_type); ?>
    <form id="create_album" class="big_form" action="
        <?php
            echo HOME."admin/create_album.php";
        ?>" method="POST">
        <p class="hash_change_removed_3 slided"><span class="label" id="for_albumname">Album name</span>
        <input class="p_holder form_field validate_on_sub reqrd msg_span" type="text" name="albumname" value="<?php echo $albumname ?>" maxlength="100">
        </p>
        <p class="hash_change_removed_3 slided"><span class="label" id="for_notes">Album notes</span>
        <textarea class="p_holder form_field msg_span" name="notes" value="" maxlength="3000"><?php echo $notes ?></textarea>
        </p>
        <div class="hash_change_removed_3 slided"><input class="form_field ui_button" type="submit" name="submit" value="CREATE"></div>
    </form>
</div>

<?php include_layout_template("footer.php"); ?>