$(window).load(function() { //don't do anything until the entire document has loaded-- all the markup and resources
    if(!westerb_sal.retrieve_main_page_state('#public_index') && !westerb_sal.get_url_param_value('o_id') &&
            !westerb_sal.get_url_param_value('c_set') && !westerb_sal.get_url_param_value('a_id') &&
            !westerb_sal.get_url_param_value('p_id')) { //if this is the initial application loading and the page is the primary home page(without any of the navigational URL parameters set) and the '#main' div state for the page has yet to be stored, store it so that all '.scriptable_hash_changer' links requesting for this page can from this point load from local storage-- untill the application clears the state for some reason
            var u_p = $('#main').attr('u_p'), cur_u_id = $('#main').attr('cur_u_id');
            westerb_sal.store_main_page_state('#public_index', '<div u_p=\"'+u_p+'\" cur_u_id=\"'+cur_u_id+'\" id=\'main\' class=\'no_padding\'>'+$('#main').html()+'</div>');
        }
});

$(function() {
    //append show_prevs div with JS because it wouldn't make sense with JS off
    //if($('.show_prevs').size() === 0) //to avoid appending the elements every time the file is called when the '#main' div state for 'public_index' is restored
        $("#unit_wrapper .album").append("<div style='display: none; ' class='absolute_pos show_prevs hover_triggered'>See photo previews</div>");
    
    //REVISIT APPROACH AS IT ASSUMES THE BROWSER ALWAYS STARTS OUT MAXIMIZED
    //MAYBE MEDIA QUERIES COULD HELP????????
//    var browser_width = $(window).innerWidth();
//    $('#main div.centering').css('min-width', browser_width/2.06); //(1366/660 ~~ 2.06); 1366 is the Chrome window inner width, and 660 is the '.centering' div's minimum measured in pixels in a maximized Chrome browser window
//    $('#unit_info').css('min-width', browser_width/4.87); //(1366/280 ~~ 4.65); 1366 is the Chrome window inner width, and 290 is the '#unit_info' div's minimum measured in pixels in a maximized Chrome browser window
//    $('#outer_wrapper.selected_photo_wrapper').css('min-width', browser_width/3.97); //(1366/340 ~~ 3.97); 1366 is the Chrome window inner width, and 370 is the '#outer_wrapper.selected_photo_wrapper' div's minimum measured in pixels in a maximized Chrome browser window
    
    if($('#outer_wrapper').hasClass('selected_photo_wrapper')) {
        westerb_sal.on_display_img_natural_width = parseInt($('#on_display_gallery_img').attr('natural_width'),10); //used to calculate the scalling ratio (with respect to the '.centering' div's width in a maximized Chrome browser) for the image
        westerb_sal.on_display_img_natural_height = parseInt($('#on_display_gallery_img').attr('natural_height'),10) //used in repositioning the '#gallery_thumbs_wrapper' div
        
        var /*centering_div = $('div.centering:last'),*/ centering_div_width = $('div.centering:last').innerWidth(), thumbs_wrapper = $('#gallery_thumbs_wrapper')/*,
        p_info_elem_h = parseInt($('#photo_info').css('height'),10), on_display_img_h = (westerb_sal.on_display_img_natural_height*centering_div_width)/1162*/;
        
        setTimeout(function() {
            //$('#post_comment #comment.char_counter').css('left', centering_div_width/4.4);
            if(centering_div_width < 910) {
                $('#post_comment #author.char_counter, #post_comment input[name=submit], #post_comment #comment.field_msg').css('font-size', '12px');
                $('#loaded_info .no_unit_data').css('font-size', '13px');
            }
        },100) //delay so that 'form.js' appends the '.char_counter' elements first 
        if(centering_div_width < 1140) $('#loaded_info, #photo_info').css('max-height', '-=65'); //prevents the '#unit_info' div from overlapping with the '#gallery_thumbs_wrapper' div as the window scales
        $('#outer_wrapper, #unit_wrapper').css('min-height', '0');
        thumbs_wrapper.css({'position':'absolute', 'bottom':'0'});
        westerb_sal.readjust_gallery_elems();
    }
    else westerb_sal.readjust_general_public_elems();
});