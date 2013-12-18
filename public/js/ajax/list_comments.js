(function() { //for managing scope
    var clicked_parent = $('.clicked'); //for this file, initially, this will always be the 'see_close_coms' td element
    
    $('.clicked').parent('tr').next('tr').children('td').children('div.comments_wrapper').children('div.comments').children('div.comment').children('a.del_com').click(westerb_sal.del_com).addClass('bound');
    if($('.clicked').hasClass('create_new_s_pag') && parseInt(clicked_parent.attr('u_count'),10) > 8) { //prevents creation of a new instance of 'Scroll_pagination' unless it's the 'initial_load' and the comment count is high enough to warrant the new instance
        westerb_sal.s_pag_instances['p_id_'+$('.clicked').parent('tr').attr('p_id')] = new westerb_sal.Scroll_Pagination;
        $('.clicked').parent('tr').next('tr').children('td').children('div').bind('scroll', westerb_sal.load_more_comments);
        window.setTimeout(function() { $('.clicked').children('a').bind('click', {'s_pag_instance_id':'p_id_'+$('.clicked').parent('tr').attr('p_id')}, westerb_sal.destroy_s_pag_instance); },520); //wait for the 'Close comments' link to be appended
    }
})();