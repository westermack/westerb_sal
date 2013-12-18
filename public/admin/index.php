<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php");
}
$admin = $paginated = true; //this page is not technically paginated; but it needs to appear like it is so that the 'pagination.js' file is still included for the page, so that in the off chance the page is accessed via a 'Open in a new tab/window,' for example-- as opposed to the AJAX navigation, the Pagination class is still availlable for Normal's 'list_albums.php' page and the 'list_photos.php' page
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
include_layout_template("header.php");
if(isset($_SESSION["owner_total_albums"])) unset ($_SESSION["owner_total_albums"]);
if(isset($_SESSION["back_to_all"])) unset($_SESSION["back_to_all"]);
if(isset($_SESSION["cancelupload_to_photolist"])) unset($_SESSION["cancelupload_to_photolist"]);
if(isset($_SESSION["cancelcreate_to"])) unset($_SESSION["cancelcreate_to"]);
?>

        <div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
            <h2 id="s_group_id" s_group="fake_pagination" class="hash_change_removed_2 faded">Menu</h2>
            <?php
                list($message, $message_type) = $session->get_message();
                display_message($message, $message_type);
            ?>
            <ul id="admin_opts">
                <li class="hash_change_removed_1 faded"><a href="<?php echo HOME.'admin/photo_upload.php'; ?>" class="scriptable_hash_changer">Upload a new photo</a></li>
                <li class="hash_change_removed_1 faded"><a href="<?php echo HOME.'admin/create_album.php'; ?>" class="scriptable_hash_changer">Create a new album</a></li>
                <?php
                    if($session->user_perms !== 2) {
                        echo "<li class=\"hash_change_removed_1 faded\"><a href=\"".HOME."admin/add_user.php\" class=\"scriptable_hash_changer\">Add a new user</a></li>\n";
                        echo "<li class=\"hash_change_removed_1 faded\"><a href=\"".HOME."admin/list_users.php\" class=\"scriptable_hash_changer\">List users</a></li>";
                    }
                ?>
                <li class="hash_change_removed_1 faded"><a href="<?php echo HOME.'admin/list_albums.php'.($session->user_perms === 2 ? "?o_id={$session->user_id}":""); ?>" class="scriptable_hash_changer">List albums</a></li>
                <?php
                    if($session->user_perms !== 2)
                        echo "<li class=\"hash_change_removed_1 faded\"><a href=\"".HOME."admin/logfile.php\" class=\"scriptable_hash_changer\">View log file</a></li>";
                ?>
            </ul>
        </div>

<?php include_layout_template("footer.php"); ?>



