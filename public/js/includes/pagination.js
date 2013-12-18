/*************************************************************
*Pagination class for monitoring The Salon general navigation.
*
* Westermack W. Batanyita <webandudu@gmail.com>
**************************************************************/

$(function() {
    Object.defineProperty(Object.prototype.westerb_sal,
    'Pagination', //Define Object.prototype.westerb_sal.Pagination
    { writable: false, enumerable: true, configurable: true,
    value: function() {
        var url_c_set = westerb_sal.get_url_param_value('c_set');
        this.current_set = (url_c_set)?parseInt(url_c_set):1; //get form the URL incase the page requiring the navigation is accessed via setting the 'c_set' URL parameter
        this.previous_set = this.prev_page;
        this.units_per_set = parseInt($('div.u_wrapper').attr('per_set'),10);
        this.unit_count = this.calc_unit_count;
        this.set_count = this.calc_set_count;
        if(this.current_set > this.set_count())
            this.current_set = 1;
        this.next_set = this.next_page;
        this.offset = this.calc_offset;
        this.ux_nav_guide = this.ux_nav_guide_str;
        this.set_group = $('#s_group_id').attr('s_group');
        this.albums_owner = this.set_group === 'o_id=all' ? 'all': this.set_group.replace('o_id=','');
        this.album_selected = /a_id=/.test(this.set_group) ? this.set_group.replace('a_id=',''):false;
    }
    });
    //extending the Pagination class
    Object.defineProperties(westerb_sal.Pagination.prototype, {
        prev_page : {
            value: function() {
                var prev;
                if((prev = this.current_set - 1) === 0)
                    return false;
                return prev;
            }, writable: true, enumerable: true, configurable: true
        },

        next_page : {
            value: function() {
                var next;
                if((next = this.current_set + 1) > this.set_count())
                    return false;
                return next;
            }, writable: true, enumerable: true, configurable: true
        },

        adjust_prev_and_next : {
            value: function() {
                if(!this.previous_set())
                    $('#prev').addClass('inactive');
                else $('#prev').removeClass('inactive');
                if(!this.next_set())
                    $('#next').addClass('inactive');
                else $('#next').removeClass('inactive')
            }, writable: true, enumerable: true, configurable: true
        },

        ux_nav_guide_str : {
            value: function() {
                return this.current_set+' of '+this.set_count();
            }, writable: true, enumerable: true, configurable: true
        },

        calc_offset : {
            value: function() {
                return this.units_per_set * (this.current_set - 1);
            }, writable: true, enumerable: true, configurable: true
        },

        calc_unit_count : {
            value: function() {
                return parseInt($('#u_count').text(),10);
            }, writable: true, enumerable: true, configurable: true
        },

        calc_set_count : {
            value: function() {
                return Math.ceil(this.unit_count()/this.units_per_set);
            }, writable: true, enumerable: true, configurable: true
        }
    });
    
    //Global variable for holding the Pagination instance
    Object.defineProperty(Object.prototype.westerb_sal,
    'pagination', // Define Object.prototype.westerb_sal.pagination
    { writable: true, enumerable: true, configurable: true, value: new westerb_sal.Pagination
    });
})