<?php
class dbConfig {
    protected static $DB_SERVER = 'localhost';
    protected static $DB_USER = 'root';
    protected static $DB_PASS = 'webandudu171717';    
    protected static $DB_NAME = 'westerb_sal';
    
    protected function __construct() {
        if($_SERVER['HTTP_HOST'] === 'localhost') {
            self::$DB_USER = 'gallery';
            self::$DB_PASS = '1234';    
            self::$DB_NAME = 'the_salon';
        }
    }
}

class MySQLDatabase extends dbConfig {
    private $connection;
    private $magic_quotes_active;
    private $real_escape_string_exists;

    public function __construct() {
        parent::__construct();
        $this->open_connection();
        $this->magic_quotes_active = get_magic_quotes_gpc();
        $this->real_escape_string_exists = function_exists('mysql_real_escape_string');
    }
    
    public function open_connection() {
        $this->connection = mysql_connect(parent::$DB_SERVER, parent::$DB_USER, parent::$DB_PASS);
        if(!$this->connection) {
            die('Database Connection Failed: '.mysql_error());
        } else {
            $db_selected = mysql_select_db(parent::$DB_NAME);
            if(!$db_selected) {die('Database Selection Failed: '.mysql_error());};
        }
    }
    
    public function close_connection() {
        if(isset($this->connection)) {
            mysql_close($this->connection);
            unset($this->connection);
        }
    }
    
    public function do_query($query) {
        $resource = mysql_query($query);
        if(!$resource) {throw new Exception('Database Query Failed: '.mysql_error());};
        return $resource;
    }
    
    public function fetch_array($resource) {
        return mysql_fetch_array($resource);
    }
    
    public function num_rows($resource) {
        return mysql_num_rows($resource);
    }
    
    public function insert_id() {
        // get the last id inserted over the current db connection
        return mysql_insert_id($this->connection);
    }
    
    public function affected_rows() {
        return mysql_affected_rows($this->connection);
    }
    
    function escape_value($value) {
		if($this->real_escape_string_exists) { // PHP v4.3.0 or higher
			// undo any magic quote effects so mysql_real_escape_string can do the work
			if($this->magic_quotes_active) { $value = stripslashes($value); }
			$value = mysql_real_escape_string($value);
		} else { // before PHP v4.3.0
			// if magic quotes aren't already on then add slashes manually
			if(!$this->magic_quotes_active) { $value = addslashes($value); }
			// if magic quotes are active, then the slashes already exist
		}
		return $value;
	}
}
$database = new MySQLDatabase;
?>