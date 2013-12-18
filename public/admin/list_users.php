<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=list_users");
}
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
//**Refactoring candidate
if($session->user_perms === 2) {
    Session::set_message("Sorry, you do not have sufficient privileges to access that page", "notice");
    redirect_to("index.php");
}//**

$admin = true; $paginated = false;
include_layout_template("header.php");
list($message, $message_type) = $session->get_message();
$content = "";
try{
    $users = User::get_all();
    if(is_array($users)) {
        foreach ($users as $user) {
            $content .= "<tr u_id=\"{$user->id}\">\n<td>{$user->full_name}";
            if($user->id == $session->user_id) $content .= " (You)";
            $content .= "</td>\n";
            $sponsor = $user->sponsor_id === "0" ? "Self (The Original User)":User::get_by_id($user->sponsor_id)->full_name;
            $content .= "<td>{$sponsor}</td>\n";
            $content .= "<td>{$user->date_to_text()}</td>\n";
            $perms = $user->perms === "3" ? "Super":($user->perms === "2" ? "Normal":"Guest");
            $content .= "<td>{$perms}</td>\n";
            if($session->user_perms !== "2" && $user->id !== "1")
                $content .= "<td><a href=\"delete_user.php?u_id={$user->id}\" class=\"scriptable_table_link user_delete\">Delete user</a></td>\n";
            $content .= "</tr>";
        }
    } else {
        $content .= "<tr u_id=\"{$users->id}\">\n<td>{$users->full_name}";
            if($users->id == $session->user_id) $content .= " (You)";
            $content .= "</td>\n";
            $sponsor = $users->sponsor_id === "0" ? "Self (The Original User)":User::get_by_id($users->sponsor_id)->full_name;
            $content .= "<td>{$sponsor}</td>\n";
            $content .= "<td>{$users->date_to_text()}</td>\n";
            $perms = $users->perms === "3" ? "Super":($users->perms === "2" ? "Normal":"Guest");
            $content .= "<td>{$perms}</td>\n";
            if($session->user_perms !== "2" && $users->id !== "1") //this is probably wasteful, reconsider when I get time...
                $content .= "<td><a href=\"delete_user.php?u_id={$users->id}\" class=\"scriptable_table_link user_delete\">Delete user</a></td>\n";
            $content .= "</tr>";
    }
} catch(Exception $e) { $message = "This is an extremely odd case: ".$e->getMessage(); $message_type = "error"; };
?>

        <div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" class="msg_bottom_margin" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
            <a id="to_admin_home" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php HOME.'admin/index.php'; ?>"><< Back home</a>
            <h2 class="hash_change_removed_2 faded">The Salon Users <?php echo "(<span id=\"u_count\">".User::count_all()."</span> total)" ?></h2>
            <?php display_message($message, $message_type); ?>
            <table class="bordered hash_change_removed_3 slided">
                <tbody>
                    <tr id="thead">
                        <th>Name</th>
                        <th>Added by</th>
                        <th>Added on</th>
                        <th>Privileges</th>
                    </tr>
                    <?php echo $content ?>
                </tbody>
            </table>
        </div>

<?php include_layout_template("footer.php"); ?>