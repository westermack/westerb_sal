<?php
require_once '../../includes/initialize.php';
if (!$session->is_logged_in()) {
    Session::set_message("You have to be logged in to access that page", "info");
    redirect_to("login.php?to=logfile");
}
$is_hash_change_pg_call = isset($_GET['hash_change_pg_call'])?true:false;
//**Refactoring candidate
if($session->user_perms === 2) {
    Session::set_message("Sorry, you do not have sufficient privileges to access that page", "notice");
    redirect_to("index.php");
}//**

$admin = true; $paginated = false;
include_layout_template("header.php");
$file = SITE_ROOT.DS."logs".DS."log.txt";
if(isset($_GET["clear"]) && $_GET["clear"] == "true") {
    if($session->user_perms === 1) {
        Session::set_message("As a guest, you do not have sufficient privileges to clear the logfile", "notice");
        redirect_to("logfile.php");
    }
    $user = User::get_by_id($session->user_id);
    log_action("Clear logs", $user->full_name, "w");
    redirect_to("logfile.php");
}

if(file_exists($file)) {
    $handle = fopen($file, "r");
    //$output = fread($handle, filesize($file));
    //$content = file_get_contents($file);
    $content = "<table class=\"bordered hash_change_removed_3 slided\"><thead><tr id=\"thead\"><th>Action</th><th>User</th><th>Date</th><th>Time</th></tr></thead><tbody>";
    while(!feof($handle)) {
        $entry = fgets($handle);
        $entry_segments = explode(" | ", $entry);
        if(sizeof($entry_segments) == 4) {
            $date = $entry_segments[0];
            $time = $entry_segments[1];
            $action = $entry_segments[2];
            $user = $entry_segments[3];
        $content .= "<tr class=\"log_entry\"><td>{$action}</td><td>{$user}</td><td>{$date}</td><td>{$time}</td></tr>";
        }
    }
    $content .= "</tbody></table>";
    fclose($handle);
} else {
    $content = "<div id=\"log_amiss\" class=\"alertBox error\">The log file appears to be missing or corrupt</div>";
}
?>

<div cur_u_id="<?php if(isset($session->user_id)) echo $session->user_id ?>" u_p="<?php echo $session->user_perms ?>" id="main" <?php if($is_hash_change_pg_call) echo "style='opacity: 0; '" ?> >
            <div id="log">
                <a id="to_admin_home" class="scriptable_hash_changer hash_change_removed_1 faded" href="<?php echo HOME.'admin/index.php'; ?>"><< Back home</a><span class="hash_change_removed_1 faded link_separator"> |</span>
                <span class="hash_change_removed_1 faded clear_logs_parent"><a href="<?php echo HOME.'admin/logfile.php?clear=true' ?>" id="clear_logs" class="scriptable_gen_link">Clear log file</a></span>
                <h2 class="hash_change_removed_2 faded">Recent Logs</h2>
                    <?php
                        list($message, $message_type) = $session->get_message();
                        display_message($message, $message_type);
                    ?>
                    <?php echo $content?>
            </div>
        </div>

<?php
    echo "<script>\n";
    echo "$('h2:first').after(\"<div id='progress_wrapper' style='width: 0; overflow: hidden; display: none; height: 5px; '></div>\")\n";
    echo "var p_bar_str = \"<div class='pregress_info' id='upload_progress_bar' style='position: absolute; top: -8px; left: 0; width: 400px; border-radiu: 30px; overflow: hidden; z-index: 3000; '>\";\n";
    echo "p_bar_str += \"<div style='display: inline-block; border-top-left-radius: 35px; border-bottom-left-radius: 35px; width: 100px; height: 5px; background-color: #1C6487; '></div>\";\n";
    echo "p_bar_str += \"<div style='display: inline-block; width: 100px; height: 5px; background-color: #A20910; '></div>\";\n";
    echo "p_bar_str += \"<div style='display: inline-block; width: 100px; height: 5px; background-color: #C36500; '></div>\";\n";
    echo "p_bar_str += \"<div style='display: inline-block; width: 100px; border-top-right-radius: 35px; border-bottom-right-radius: 35px; height: 5px; background-color: #93A50B; '></div>\";\n";
    echo "p_bar_str += \"</div>\";";
    echo "$('div#progress_wrapper').append(p_bar_str).after(\"<span class='pregress_info' id='upload_progress_percent' style='color: #222; font-weight: bold; font-size: 12px; position: absolute; top: 56px; left: 4px; z-index: 3000; display: none; '></span>\");\n";
    echo "</script>\n";
?>

<?php include_layout_template("footer.php"); ?>