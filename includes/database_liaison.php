<?php
require_once LIB_PATH.DS.'database.php';

class DatabaseLiaison {
    public static $table_name = '';

    protected function has_attribute($attribute) {
        $calling_class = get_called_class();
        $object_vars_array = get_class_vars($calling_class);
        return array_key_exists($attribute, $object_vars_array);
    }
    
    public static function get_by_query($query='') {
        $calling_class = get_called_class();
        global $database;
        $resource = $database->do_query($query);
        $row_count = $database->num_rows($resource);
        if($row_count > 1) {
            $objects_array = array();
            while($record = $database->fetch_array($resource))
                $objects_array[] = new $calling_class($record);
            return $objects_array;
        }
        elseif ($row_count == 1) {
            return new $calling_class($database->fetch_array($resource));
        }
        elseif($query == "SELECT * FROM {$calling_class::$table_name}" && $row_count == 0)
            throw new Exception("There weren't any ".$calling_class::$table_name." found in the database");
        elseif($row_count == 0) return FALSE;
    }
    
    public static function get_all() {
        $calling_class = get_called_class();
        return $calling_class::get_by_query("SELECT * FROM {$calling_class::$table_name}");
    }
    
    public static function get_subset_of_all($limit=10, $offset=0) {
        $calling_class = get_called_class();
        $calling_class::get_all();//temporary solution to get this function to throw an exception if there are no records
        //an this table. THERE'S ROOM FOR A BETTER IMPLEMENTATION - use count_all() instead????
        return $calling_class::get_by_query("SELECT * FROM {$calling_class::$table_name} LIMIT {$limit}  OFFSET {$offset}");
    }
    
    public static function count_all() {
        global $database;
        $calling_class = get_called_class();
        $resource = $database->do_query("SELECT COUNT(*) FROM {$calling_class::$table_name}");
        return $database->fetch_array($resource)[0];
    }
    
    public static function get_by_id($id=0) {
        $calling_class = get_called_class();
        return $calling_class::get_by_query("SELECT * FROM {$calling_class::$table_name} WHERE id = {$id}");
    }
    
    public static function create_new() {
        $args_count = func_num_args();
        if($args_count == 0)
            throw new Exception("You can not create an empty new record");
        $fields_to_fill = array();
        $values = array();
        $calling_class = get_called_class();
        $table = $calling_class::$table_name;
        for($i = 0; $i < $args_count; $i++) {
            $fieldname_value_array = explode("=", func_get_arg($i));
            $fields_to_fill[] = $fieldname = trim($fieldname_value_array[0]);
            $value = trim($fieldname_value_array[1]);
            if(strstr($fieldname, "_id") !== FALSE || $fieldname == "size" || $fieldname == "cover")
                $values[] = $value;
            else
                $values[] = "\"{$value}\"";
        }
        
        $query = "INSERT INTO {$table} (".join(", ", $fields_to_fill).") VALUES (".join(", ", $values).")";

        global $database;
        $database->do_query($query);
    }
    
    public function update() {
        $args_count = func_num_args();
        if($args_count == 0)
            throw new Exception("There is nothing to update");
        $query_pieces = array();
        for($i = 0; $i < $args_count; $i++) {
            $fieldname_value_array = explode("=", func_get_arg($i));
            if(trim($fieldname_value_array[0]) == "password")
                $fieldname_value_array[1] = sha1(trim($fieldname_value_array[1]));
            $query_pieces[] = trim($fieldname_value_array[0])." = \"".trim($fieldname_value_array[1])."\"";
        }
        
        $class= get_class($this);
        $table = $class::$table_name;
        $query = "UPDATE {$table} SET ".join(", ", $query_pieces)." WHERE id = {$this->id}";
        
        global $database;
        $database->do_query($query);
    }
   
    public function delete($ajax = false) {
        $class = get_class($this);
        global $session;
        $whose = isset($_SESSION["back_to_all"])  && $class === "Album" ? ($_SESSION["back_to_all"] ? "?o_id=a":"?o_id=".$this->owner_id):"";
        $which = $class === "Comment" ? Photo::get_by_id($this->photo_id)->album_id:($class === "Photo" ? $this->album_id:"");
        list($what, $where) = $class === "User" ? array("users","list_users.php"):($class === "Album" ? array("albums","list_albums.php{$whose}"):($class === "Photo" ? array("photos","list_photos.php?a_id={$which}"):array("photo comments","list_photos.php?a_id={$which}")));
        if($session->user_perms === 1 && !$ajax) {
            Session::set_message("As a guest, you do not have sufficient privileges to delete {$what}", "notice");
            redirect_to($where);
        }
        $table = $class::$table_name;
        $query = "DELETE FROM {$table} WHERE id = {$this->id}";
        global $database;
        $database->do_query($query);
    }

    public function datetime_to_text() {
        return strftime("<span>%B %d, %Y</span> at <span>%I:%M %p</span>", strtotime($this->created));
    }

    public function date_to_text() {
        $date_time_str = get_called_class() == "User" ? $this->added:$this->created;
        return strftime("%B %d, %Y", strtotime($date_time_str));
    }
}
?>
