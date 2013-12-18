<?php
$is_dev = $_SERVER['HTTP_HOST']==='localhost'?true:false;

define('DS', DIRECTORY_SEPARATOR);
define('SITE_ROOT', dirname(__DIR__));
define('LIB_PATH', SITE_ROOT.DS.'includes');
$is_dev?define('HOME', 'http://localhost/westerb_sal/public/'):define('HOME', 'http://thesalonproject.com/');

$admin = false;

require_once LIB_PATH.DS.'functions.php';
require_once LIB_PATH.DS.'session.php';
require_once LIB_PATH.DS.'database.php';
require_once LIB_PATH.DS.'pagination.php';
require_once LIB_PATH.DS.'database_liaison.php';
require_once LIB_PATH.DS.'user.php';
require_once LIB_PATH.DS.'album.php';
require_once LIB_PATH.DS.'photo.php';
?>
