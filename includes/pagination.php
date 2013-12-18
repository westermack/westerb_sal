<?php

class Pagination {
    public $previous_set;
    public $current_set;
    public $next_set;
    public $units_per_set;
    public $unit_count;
    public $set_count;
    public $offset;
    public $ux_nav_guide;
    
    public function __construct($current_set=1, $units_per_set=6, $unit_count=0) {
        $this->current_set = (int)$current_set;
        $this->units_per_set = (int)$units_per_set;
        $this->unit_count = (int)$unit_count;
        $this->set_count = ceil($this->unit_count/$this->units_per_set);
        if($this->current_set > $this->set_count)
            $this->current_set = 1;
        $this->previous_set = $this->current_set - 1;
        $this->next_set = $this->next_page();
        $this->offset = $this->units_per_set * ($this->current_set - 1);
        if($this->unit_count > $this->units_per_set)
            $this->ux_nav_guide = $this->current_set." of ".$this->set_count;
            else
                $this->ux_nav_guide = "";
    }
    
    private function next_page() {
        if(($next = $this->current_set + 1) > $this->set_count)
            return FALSE;
        return $next; 
    }
}

?>
