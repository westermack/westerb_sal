$(window).load(function(){if(!(westerb_sal.retrieve_main_page_state("#public_index")||westerb_sal.get_url_param_value("o_id")||westerb_sal.get_url_param_value("c_set")||westerb_sal.get_url_param_value("a_id")||westerb_sal.get_url_param_value("p_id"))){var a=$("#main").attr("u_p"),b=$("#main").attr("cur_u_id");westerb_sal.store_main_page_state("#public_index",'<div u_p="'+a+'" cur_u_id="'+b+"\" id='main' class='no_padding'>"+$("#main").html()+"</div>")}}); $(function(){$("#unit_wrapper .album").append("<div style='display: none; ' class='absolute_pos show_prevs hover_triggered'>See photo previews</div>");if($("#outer_wrapper").hasClass("selected_photo_wrapper")){westerb_sal.on_display_img_natural_width=parseInt($("#on_display_gallery_img").attr("natural_width"),10);westerb_sal.on_display_img_natural_height=parseInt($("#on_display_gallery_img").attr("natural_height"),10);var a=$("div.centering:last").innerWidth(),b=$("#gallery_thumbs_wrapper");setTimeout(function(){910> a&&($("#post_comment #author.char_counter, #post_comment input[name=submit], #post_comment #comment.field_msg").css("font-size","12px"),$("#loaded_info .no_unit_data").css("font-size","13px"))},100);1140>a&&$("#loaded_info, #photo_info").css("max-height","-=65");$("#outer_wrapper, #unit_wrapper").css("min-height","0");b.css({position:"absolute",bottom:"0"});westerb_sal.readjust_gallery_elems()}else westerb_sal.readjust_general_public_elems()});