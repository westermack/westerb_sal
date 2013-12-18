/***********************************************
*Form Module for modelling The Salon form data
*and defining common methods for validation.
*
* Westermack W. Batanyita <webandudu@gmail.com>
************************************************/

$(function() {
    //Global variable for letting the application know if the current form is in a modal dialog box or not
    Object.defineProperty(Object.prototype.westerb_sal, 'is_modal_call', {
        value: false, writable: true, enumerable: true, configurable: true
    });
    
    //Global variable for letting the application know if the onprogress event was fired or not
    Object.defineProperty(Object.prototype.westerb_sal, 'onprogress_fired', {
        value: false, writable: true, enumerable: true, configurable: true
    });
    
    //Global variable that keeps watch to ensure the intreval calls to 'westerb_sal.validate_photo()' are intitiated only once during the initial focus when there isn't any file selected
    Object.defineProperty(Object.prototype.westerb_sal, 'photo_validation_sentinel', {
        value: 0, writable: true, enumerable: true, configurable: true
    });
    
    //XHR for checking the availability of a chosen new username
    Object.defineProperty(Object.prototype.westerb_sal, 'xhr_check_u_name', {
        value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
    });
    
    Object.defineProperty(Object.prototype.westerb_sal, 'handle_check_u_name_response', {
        value: function () {
            var u_name_field = westerb_sal.form.validate_on_sub.new_username;
            if(westerb_sal.xhr_check_u_name.readyState === 4) {
                westerb_sal.clear_p_timers();
                if(westerb_sal.xhr_check_u_name.status === 200) {
                    if(westerb_sal.xhr_check_u_name.responseText == 0) {
                        u_name_field.removeClass('error_bordered');
                        $('#'+u_name_field.attr('name')).removeClass('error_msg char_counter').addClass('success_msg').text('Username available');
                        westerb_sal.form.remove_field_err_rec(u_name_field);
                    }
                    else if (westerb_sal.xhr_check_u_name.responseText == 1) {
                        window.clearInterval(westerb_sal.form.update_counter_timer);
                        u_name_field.addClass('error_bordered');
                        $('#'+u_name_field.attr('name')).removeClass('char_counter success_msg').addClass('error_msg').text('Sorry, '+ '"' + u_name_field.val() + '"' + ' is already taken. Please provide another one');
                        westerb_sal.form.record_errored_field(u_name_field);
                    }
                } else {
                    westerb_sal.display_msg('Something went wrong while trying to validate the username. But feel free to proceed', 'notice', 5700);
                    $('#'+u_name_field.attr('name')).removeClass('error_msg success_msg').addClass('char_counter').text(parseInt(u_name_field.attr('maxlength')) - u_name_field.val().length);
                    westerb_sal.form.remove_field_err_rec(u_name_field);
                }
                westerb_sal.form.xhr_in_progress = false;//give go-ahead for the regular validation to proceed
            }
        }, writable: true, enumerable: true, configurable: true
    });
    westerb_sal.xhr_check_u_name.onreadystatechange = westerb_sal.handle_check_u_name_response;
    
    //Function for visualizing and animating the onscreen changes needed when a new photo has been uploaded via a modal dialog box
    Object.defineProperty(Object.prototype.westerb_sal, 'update_photo_upload_onscreen_info', {
        value: function(response_for_simulation) {
            var timeout = westerb_sal.onprogress_fired?1200:0, response = decodeURIComponent((typeof FormData === 'undefined')?response_for_simulation:westerb_sal.form.xhr_submit_data.responseText);
            if(westerb_sal.modal_caller_parent.hasClass('album')) { //modal called by an album on 'list_albums.php'
                $('.album[a_id='+westerb_sal.modal_caller_parent.attr('a_id')+']').each(function() {
                    var cur_p_count = (parseInt($(this).children('div.date_owner').children('div:last').text()));
                    $(this).children('div.date_owner').children('div:last').text(cur_p_count+1+((cur_p_count === 0)?' photo':' photos')); //increase the photo count diplayed to the user
                    if(cur_p_count === 0) $(this).children('img').wrap("<a class='scriptable_hash_changer' id='to_list_photos_"+$(this).attr('a_id')+"' href='list_photos.php?a_id="+$(this).attr('a_id')+"'></a>"); //add the link that will now allow to open the album, since there is a photo to be seen (on 'list_photos.php') 
                    window.setTimeout(function() { //if the onprogress event fired, wait for the modal (progress animation elements to fade out) to close, just for visual effects
                        $('.album[a_id='+westerb_sal.modal_caller_parent.attr('a_id')+']').children('a').children('img').attr('src', westerb_sal.HOME+westerb_sal.modal_caller_parent.parents('div#albums_wrapper').attr('albums_upload_dir')+'/'+westerb_sal.modal_caller_parent.attr('a_id')+'/'+westerb_sal.modal_caller_parent.data('uploaded_f_name')); //update the album face with the photo that's just been uploaded
                    },timeout);
                });
                timeout = westerb_sal.onprogress_fired?7200:6000; //give the browser a 6000ms window to fetch the photo
                window.setTimeout(function() { //if the onprogress event fired, wait for the code above to run first so that the browser can fetch the photo first before deleting it
                    if(westerb_sal.perms == 1) { //delete the photo in the DB now that the photo that was uploaded solely for simulation has already been fetched and appended in the document
                        $.get(westerb_sal.HOME+'ajax/misc_calls.php', {'delete_just_uploaded_photo':response});
                        //
                        //CALLBACK NEEDED TO SEE IF DELETION SUCCEEDS (MIGHT NEED TO USE $.ajax() INSTEAD)
                        //
                    }
                },timeout);
                westerb_sal.clear_sets('list_photos'); //it won't be enough to just clear the '#main' div state for the 'list_photos' page representing this album that's just been affected by the change; all prestored photo sets will have to be cleared as well so that the changes are reflected even if the photo count on the page is > 4
            }
            else if(westerb_sal.modal_caller_parent.hasClass('new_photo')) { //modal called by an album on 'list_photos.php'
                var cur_visible_p_count = $('tr.photo_row').size(), cur_p_count = parseInt($('#u_count').text());
                window.setTimeout(function() {
                    $('#u_count').text(cur_p_count+1);  //update the number of photo count
                    if(cur_p_count === 0) $('#plural_s').text(''); else $('#plural_s').text('s');
                    if(cur_visible_p_count <= 4) { //on-screen updates are only necessary if the total visible photo count is <=4 
                        if($('#ajax_loading_pholder').text() !== '') { //if the UI message is displayed, it most probably means that the user clicked the navigation links to get sets and there weren't actually any since it's all in simulation
                            $('#ajax_loading_pholder').text('') //remove the UI message
                            $('tr.photo_row').remove(); //remove any invisible rows and assign 0 to the visible photo count variable so that the code below for appending the simulation rows can run
                            cur_visible_p_count = 0; //""
                        }
                        if(cur_p_count === 0) { //insert the table first; and since there will be at least one photo tr element visible, it makes sense to now append the 'Delete album' link
                            $('#no_photos_alert').replaceWith("<table class='bordered'>"+
                                                                "<thead style='display: none; '>"+
                                                                "<tr id='thead'>"+
                                                                "<th>Photo</th><th>Original Filename</th><th>Size</th><th>Type</th><th>Caption</th><th colspan='' id='ajax_msg' class=''></th>"+
                                                                "</tr>"+
                                                                "</thead>"+
                                                                "<tbody remaining_u_count=''>"+
                                                                "</tbody>"+
                                                                "</thead>");
                            $('thead').fadeIn(400);
                            $('span.new_photo').after("<span style='display: none; ' class='link_separator'> | </span><span style='display: none; ' a_id='"+westerb_sal.modal_caller_parent.attr('a_id')+"' class='del_confirm_parent del_album'><a id='del_album' href='confirm_deletion.php?da_id="+westerb_sal.modal_caller_parent.attr('a_id')+"' class='scriptable_gen_link confirm_del'>Delete album</a></span>");
                            $('span.link_separator:last').fadeIn(400);
                            $('span.del_album').fadeIn(400);
                        }
                        else if(cur_visible_p_count === 1 && cur_p_count < 4) { //the second condition ensures that this is the first set; and now that there will be at least two photo tr elements visible, it makes sense to append the 'Delete all photos' link
                            $('span.new_photo').after("<span id='temp_id' style='display: none; ' class='link_separator'>| </span><span a_id='"+westerb_sal.modal_caller_parent.attr('a_id')+"' class='del_confirm_parent del_all_photos'><a id='del_all' href='confirm_deletion.php?a_id="+westerb_sal.modal_caller_parent.attr('a_id')+"' class='scriptable_gen_link confirm_del'>Delete all photos</a></span>");
                            $('span.link_separator#temp_id').fadeIn(400).removeAttr('id');
                            $('span.del_all_photos').fadeIn(400);
                        }
                        if(cur_visible_p_count === 4 && cur_p_count === 4) { //requires appending the navigation and ux_nav_guide; the second condition ensures that this is the first set
                            $('#nav').remove(); //incase the navigation was already there, remove it first
                            $('#photos_nav_wrapper').append("<div style='display: none; ' id='nav' class='hash_change_removed_3 slided'>"+
                                                            "<a href='#' class='scriptable_gen_nav_link prev_set'>"+
                                                            "<div class='ui_button nav_opt inactive' id='prev'>&#x2227;</div></a>"+
                                                            "<a href='list_photos.php?a_id="+westerb_sal.modal_caller_parent.attr('a_id')+"&"+
                                                            "c_set=2' class='scriptable_gen_nav_link next_set'><div class='ui_button nav_opt'"+
                                                            " id='next'>&#x2228;</div></a>"+
                                                            "</div>");
                            $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                            $('#ux_nav_guide, #nav').fadeIn(400);
                        } else if(cur_visible_p_count < 4) { //only append the photo tr element
                            $('tbody').append(response);
                            $('tr.photo_row:last').fadeIn(400, function() {
                                //REVISIT THE CASE PERMS=1 HERE | ALSO RECHECK NECESSITY OF THE TEMP IDs
                                $(this).children('#temp_id_1').removeAttr('id');
                                $('#temp_id_1_1').removeAttr('id').bind('keyup', {'max_len':4000}, westerb_sal.count);
                                $('#temp_id_1_2').removeAttr('id').bind('click', {'c_parent':$(this).parent('div.capt_edit').parent('form').parent('td')}, westerb_sal.add_capt);
                                $('#temp_id_1_3').removeAttr('id');
                                $(this).children('#temp_id_2').removeAttr('id');
                                $(this).children('#temp_id_3').removeAttr('id');
                            });
                        }
                        if(westerb_sal.perms == 1 && cur_visible_p_count === 4) //if user is Guest and the number of visible photo tr elements is at the maximum of 4, append the tr while still non-displayed so that it's record can still be deleted from the DB
                            $('tbody').append(response);
                        if(westerb_sal.perms == 1) { //delete the photo in the DB now that the content that was gathered solely for simulation has already been appended in the document
                            $.get(westerb_sal.HOME+'ajax/misc_calls.php', {'delete_just_uploaded_photo':$('tr.photo_row:last').attr('p_id')});
                            //
                            //CALLBACK NEEDED TO SEE IF DELETION SUCCEEDS (MIGHT NEED TO USE $.ajax() INSTEAD)
                            //
                            if(cur_visible_p_count === 4) $('tr.photo_row:last').remove(); //remember to delete the appended non-displayed photo tr element
                        }
                        if(westerb_sal.modal_caller_parent.data('chosen_as_cover') == 1) { //if this photo was selected to be the cover photo, the application needs to check among the visible photo tr elements to change where-- if any-- it says 'Current album cover'
                            $('#current_cover').html("<a style='display: none; ' href='list_photos.php?a_id="+westerb_sal.modal_caller_parent.attr('a_id')+"&mkcover="+$('tr.photo_row:last').attr('p_id')+"' class='scriptable_table_link change_cover'>Make cover photo</a>");
                            $('#current_cover').children('a').fadeIn(400, function() {
                                $(this).parent('#current_cover').removeAttr('id');
                            });
                            $('#current_cover_just_chosen').children('span').fadeIn(450, function() {
                                $(this).parent('#current_cover_just_chosen').attr('id', 'current_cover').html('Current album cover');
                            });
                        }
                    }
                    if(cur_p_count > 4) {
                        $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                        westerb_sal.pagination.adjust_prev_and_next();
                        westerb_sal.clear_sets();
                    }
                    //westerb_sal.clear_albums('a'); //clears the 'All albums' group in 'list_albums.php' so that any newly added photo is also loaded next time the 'All albums' album group is opened
                    //westerb_sal.clear_albums($('#photos_wrapper').attr('ao_id')); //the change will also affect the album group other than "All albums" to which the current album affected by the photo upload belongs
                    //westerb_sal.clear_main_page_state('#list_photos_'+westerb_sal.modal_caller_parent.attr('a_id')); //clear the '#main' div state for the current page too
                },timeout);
            }
        }, writable: true, enumerable: true, configurable: true
    });
    
    //Closes the displayed modal dialog box, when called
    Object.defineProperty(Object.prototype.westerb_sal, 'close_box', {
        value: function() {
            if(westerb_sal.blocking_login_dialog)
                $('#login_prompt_dialog').parent('div').fadeOut(200, function() {
                    $(this).remove();
                    westerb_sal.blocking_login_dialog = false;
                });
            else {
                $('#modal_dialog').parent('div').fadeOut(200, function() {$(this).remove() });
                $('a').unbind('click',westerb_sal.highlight_dialog);
                $('div').not('div.blocking_dialog').unbind('click',westerb_sal.scroll_to_dialog);
                $('div').not('div.blocking_dialog').unbind('click',westerb_sal.highlight_dialog);
            }
            setTimeout(function() { westerb_sal.blocking_dialog = westerb_sal.animating = false; },210); //wait for the box to be completely faded and removed from the DOM
            $(document).unbind('scroll', westerb_sal.reposition_modal_box);
            $(window).unbind('resize', westerb_sal.reposition_modal_box);
        }, writable: true, enumerable: true, configurable: true
    });
    
    //MODAL SUBMISSION HANDLER
    Object.defineProperty(Object.prototype.westerb_sal, 'handle_modal_submit_data_response', {
        value: function(e) {
            var timeout = westerb_sal.onprogress_fired?1200:0;
            if(westerb_sal.form.xhr_submit_data.readyState === 4) {
                westerb_sal.clear_p_timers();
                $('#modal_processing_msg').html('');
                $.each(westerb_sal.form.fields, function(p,v) {
                    v.removeAttr('disabled'); //re-allow user input
                });
                if(westerb_sal.form.xhr_submit_data.status === 200) {
                    var response = $.trim(westerb_sal.form.xhr_submit_data.responseText);
                    if(/Error:/.test(response)) {
                        response = response.replace('Error:','');
                        if(westerb_sal.submit_form_data.request === 'new_photo_upload' && response.length > 55) {
                            window.setTimeout(function() { //if the onprogress event fired, wait for the progress animation elements to fade out first
                                $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg').addClass('error_msg').text(response);
                                westerb_sal.form.xhr_in_progress = false;
                            },timeout);
                        }
                        else westerb_sal.display_modal_msg(response);
                    }
                    else {
                        if(westerb_sal.submit_form_data.request === 'new_photo_upload') { //photo upload modal called one either 'list_albums.php' or 'list_photos.php'
                            westerb_sal.update_photo_upload_onscreen_info();
                            westerb_sal.clear_main_page_state('#list_photos_'+(westerb_sal.modal_caller_parent.hasClass('album')?westerb_sal.modal_caller_parent.attr('a_id'):westerb_sal.modal_caller_parent.attr('a_id'))); //clear the '#main' div state for the 'list_photos' page that diaplays the particular album that's just been affected by the changes
                        }
                        else if(westerb_sal.submit_form_data.request === 'new_album_creation') {
                            if(westerb_sal.opened_album_groups && westerb_sal.opened_album_groups.opened_count != 0) { //this means the object is defined (i.e the current page is the Admin 'list_albums') and at least one section is opened
                                for(opened_group in westerb_sal.opened_album_groups.opened) {
                                    if(opened_group === 'a' || opened_group === westerb_sal.modal_caller_parent.attr('cur_user_id') ||
                                    (westerb_sal.perms == 1 && opened_group === westerb_sal.modal_caller_parent.attr('original_user_id'))) { //only if the 'All albums' section is opened or other section than it that's actually affected by the change (i.e the album group of the current Admin user) or, in the case when the user is Guest, only if the original Admin's album group is opened
                                        var this_group_o_name_div = westerb_sal.opened_album_groups.opened[opened_group],
                                            first_span = this_group_o_name_div.siblings('div.albums').children('div.inner_a_wrapper').children('p').children('span:first');
                                        if(parseInt(first_span.text()) === 1) //i.e the album count === 1, before u_count is updated
                                            this_group_o_name_div.siblings('div.albums').children('div.inner_a_wrapper').children('p').append("<span class='del_albums_parent'><a href='delete_album.php?ao_id="+this_group_o_name_div.parent('div.albums_by').attr('id')+"' class='scriptable_gen_link del_all_albums confirm_del'>Delete all albums</a></span>");
                                        if(parseInt(first_span.text()) === 8) { //album groups with 'u_count' < 8 do not get 'load_more' registered for the scroll event; if 'u_count' === 8, however, the event now needs to be registered for as it means it's now valid to expect more scroll-triggered albums to be fetched with 'load_more'
                                            westerb_sal.s_pag_instances['o_id_'+this_group_o_name_div.parent('div.albums_by').attr('id')] = new westerb_sal.Scroll_Pagination;
                                            this_group_o_name_div.siblings('div.albums').bind('scroll', {'s_pagination':westerb_sal.s_pag_instances['o_id_'+this_group_o_name_div.parent('div.albums_by').attr('id')]}, westerb_sal.load_more_albums);
                                            //REVISIT: WHY DO I NEED TO DEFINE THIS FUNCTION HERE WHILE I HAVE A GLOBAL ONE THAT ACCOMPLISHES THE SAME TASK????????????????????????
                                            function destroy_s_pag_instance(e) { //house cleaning
                                                    if(!westerb_sal.blocking_dialog) {
                                                    window.setTimeout(function() {
                                                        if(westerb_sal.request_done) {
                                                            delete westerb_sal.s_pag_instances[e.data.s_pag_instance_id]; //deletes the 'scroll_pagination' instance for the album group, freeing up memory
                                                            e.data.this_o_name_div.siblings('div.albums').html('') //clears references to objects, aiding in GC(Garbage Collection)
                                                            e.data.this_o_name_div.unbind('click', destroy_s_pag_instance);
                                                        }
                                                    },820); //wait for the section to finish sliding up. If sliding up goes through successfull, 'request_done' will be set to true and the code will run; if, otherwise, for some reason 'request_done' !== true (which can mean that the section wasn't slid up), it won't execute 
                                                } else ;
                                            }
                                            this_group_o_name_div.bind('click', {'s_pag_instance_id':'o_id_'+this_group_o_name_div.parent('div.albums_by').attr('id'), 'this_o_name_div':this_group_o_name_div}, destroy_s_pag_instance);
                                        }
                                        //since the algorithm fetches 8 albums per request, the remainder of !== 0 means the number of albums currently loaded and
                                        //visible in the album group allows for some album slots to be filled, and so an on-screen update is made as well. Otherwise,
                                        //because 'u_count' is also being updated each time a new album is added, when the remainder === 0, there is no need to
                                        //make the on-screen update as the newly added albums will be fetched with 'load_more' calls
                                        if(this_group_o_name_div.siblings('div.albums').children('div.inner_a_wrapper').children('div.album').size()%8 !== 0) {
                                            this_group_o_name_div.siblings('div.albums').children('div.inner_a_wrapper').append(response);
                                            var new_album = this_group_o_name_div.siblings('div.albums').children('div.inner_a_wrapper').children('div.album:last');
                                            if(opened_group === 'a') {
                                                new_album.attr('name', 'a');
                                                new_album.children('div.date_owner').children('div:first').after('By '+new_album.children('div#data').attr('a_owner_name'));
                                                new_album.children('div#data').remove();
                                            } else {
                                                new_album.attr('name', new_album.children('div#data').attr('a_owner_id'));
                                                new_album.children('img').attr('src', westerb_sal.HOME+'images/placeholders/'+westerb_sal.rand()+'.png');
                                                new_album.children('div#data').remove();
                                            }
                                            new_album.fadeIn(500);
                                        }
                                        this_group_o_name_div.attr('u_count',parseInt(this_group_o_name_div.attr('u_count'))+1); //crucial so that 'set_count' of the 'scroll_pagination' instance can adjust itself accordingly and the created album(s) will also be retrived on 'load_more'
                                        first_span.text((parseInt(first_span.text())+1)+' albums');
                                        //westerb_sal.store_albums('list_albums_ao_id='+opened_group, this_group_o_name_div.siblings('div.albums').html()); //re-storing the albums so that next time they're loaded from local storage, the changes are accomodated
                                    }
                                }
                            }
                            else if(westerb_sal.opened_album_groups && westerb_sal.opened_album_groups.opened_count == 0) { //this means the object is defined (i.e the current page is the Admin 'list_albums') but no section is opened
                                $('div.albums_by[id=a]').children('div.o_name').attr('u_count',parseInt($('div.albums_by[id=a]').children('div.o_name').attr('u_count'))+1); //crucial so that 'set_count' of the 'scroll_pagination' instance can adjust itself accordingly and the created album(s) will also be retrived on 'load_more'
                                $('div.albums_by[id='+westerb_sal.modal_caller_parent.attr('cur_user_id')+']').children('div.o_name').attr('u_count',parseInt($('div.albums_by[id='+westerb_sal.modal_caller_parent.attr('cur_user_id')+']').children('div.o_name').attr('u_count'))+1); //""
                                //store relevant sets (maybe on the same line of code that will also handle the case above)
                            }
                            westerb_sal.clear_main_page_state('#photo_upload'); //clear the '#main' div state for the 'photo_upload' page so that the user's albums listed in the selection options loads fresh next time the page is requested
                        }
                        else if(westerb_sal.submit_form_data.request === 'login') {
                            westerb_sal.is_logged_in = true; //immediately let the application register that the user is re-logged in
                            westerb_sal.clear_main_page_state('#public_index'); //clear the '#main' div state for the 'public_index' at every login so that the 'u_p' and 'cur_u_id' attributes in the '#main' div can update
                        }
                        window.setTimeout(function() {
                            westerb_sal.close_box();
                            //if(westerb_sal.modal_caller_parent.hasClass('album') || westerb_sal.modal_caller_parent.hasClass('new_photo')) //if it's a photo upload modal, clear interval calls incase a photo was selected but not uploaded before the modal is closed
                              //  for(h = 0; h < 10000; h++) window.clearInterval(h); //a HACK for clearing interval calls set during photo validation
                            if(westerb_sal.submit_form_data.request !== 'login') //if not the 'prompt_login' dialog
                                westerb_sal.display_msg((westerb_sal.submit_form_data.request === 'new_photo_upload')?'Photo uploaded successfully':'Album successfully created', 'success', 4000);
                        },timeout);
                        if(westerb_sal.submit_form_data.request !== 'login') { //if not the 'prompt_login' dialog
                            //if(westerb_sal.modal_caller_parent.hasClass('album') || (westerb_sal.cur_pg == 'list_albums' && westerb_sal.modal_caller_parent.hasClass('new_album'))) { //either uploading a new photo via a modal box or creating a new album on Admin 'list_albums' via a modal box
                                //westerb_sal.store_albums('list_albums_ao_id='+(westerb_sal.modal_caller_parent.hasClass('album')?westerb_sal.modal_caller_parent.parent('div.inner_a_wrapper').parent('div.albums').parent('div.albums_by').attr('id'):''), westerb_sal.modal_caller_parent.hasClass('album')?westerb_sal.modal_caller_parent.parent('div.inner_a_wrapper').parent('div.albums').html():''); //re-storing the albums so that next time they're loaded from local storage, the changes are accomodated
                                westerb_sal.clear_albums('a'); //clears the 'All albums' group
                                //LINE BELOW: CANDIDATE FOR REFACTORING-- WHWERE TO GET 'ao_id' CAN BE MADE MORE GENERAL
                                westerb_sal.clear_albums(westerb_sal.modal_caller_parent.hasClass('album')?westerb_sal.modal_caller_parent.attr('o_id'):(westerb_sal.modal_caller_parent.hasClass('new_photo')?$('#photos_wrapper').attr('ao_id'):westerb_sal.modal_caller_parent.attr('cur_user_id'))); //the change will also affect the album group other than "All albums" to which the affected/added album belongs; clearing ensures everything is loaded from the server again
                                westerb_sal.clear_main_page_state('#list_albums'); //clear the '#main' div state for the 'list_albums' page because it contains crucial pieces of information that govern 'scroll pagination' that will also need to be loaded fresh new photos/albums are added
                                westerb_sal.clear_main_page_state('#logfile'); //logs will need to be updated on either one of the two actions
                            //}
                        }
                    }
                } else {
                    westerb_sal.display_modal_msg();
                    westerb_sal.form.xhr_in_progress = false;
                }
            }
        }, writable: true, enumerable: true, configurable: true
    });
    
    //REGULAR SUBMISSION HANDLER
    Object.defineProperty(Object.prototype.westerb_sal, 'handle_submit_data_response', {
        value: function(e) {
            var timeout = westerb_sal.onprogress_fired?1200:0;
            if(westerb_sal.form.xhr_submit_data.readyState === 4) {
                westerb_sal.clear_p_timers();
                $('#processing_msg').html('');
                if(westerb_sal.cur_pg !== 'public_index') { //this is to discourage spamming; the post-comment fields will remain disabled after the user has posted
                    $.each(westerb_sal.form.fields, function(p,v) {
                        v.removeAttr('disabled'); //re-allow user input
                        if(!/Error:/.test(response) && westerb_sal.form.xhr_submit_data.status === 200 &&
                            (v.attr('name') === 'first_name' || v.attr('name') === 'last_name' ||
                            v.attr('name') === 'new_username' || v.attr('name') === 'new_password' || v.attr('name') === 'caption' ||
                            v.attr('name') === 'albumname' || v.attr('name') === 'notes')) {
                            v.css({'color':'#777', 'font-weight':'bold'}).val($('#for_'+v.attr('name')).text());
                            $('#'+v.attr('name')).removeClass('success_msg notice_msg error_msg').addClass('char_counter').text(v.attr('maxlength'));
                        }
                    });
                }
                if(westerb_sal.form.xhr_submit_data.status === 200) {
                    var response = $.trim(westerb_sal.form.xhr_submit_data.responseText);
                    if(/Error:/.test(response)) {
                        window.setTimeout(function() { //if the browser supports progress events and the request was for uploading a photo and the onprogress event was fired, assume the 'onprogress' event fired and wait 1200ms for the progress animation elements to fade out first before closing the box and displaying the message
                            westerb_sal.display_msg(response.replace('Error:',''));
                            if(westerb_sal.submit_form_data.request === 'new_photo_upload')
                                $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg error_msg').text('');
                        },timeout);
                    }
                    else if(/Info:/.test(response)) {
                        window.setTimeout(function() { //if the browser supports progress events and the request was for uploading a photo and the onprogress event was fired, assume the 'onprogress' event fired and wait 1200ms for the progress animation elements to fade out first before closing the box and displaying the message
                            westerb_sal.display_msg(response.replace('Info:',''), 'info', 8500);
                            $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg error_msg').text('');
                        },timeout);
                        westerb_sal.form.fields.album_id.css({'color':'#777', 'font-weight':'bold'}).val('0');
                        $('form input:checked').removeAttr('checked');
                        $('ul.radios').addClass('none_checked');
                    }
                    else {
                        if(westerb_sal.submit_form_data.request === 'new_photo_upload' || westerb_sal.submit_form_data.request === 'new_album_creation' ||
                           westerb_sal.submit_form_data.request === 'add_user') {
                            if(westerb_sal.submit_form_data.request === 'new_photo_upload') {
                                window.setTimeout(function() { //if the browser supports progress events and the request was for uploading a photo and the onprogress event was fired, assume the 'onprogress' event fired and wait 1200ms for the progress animation elements to fade out first before closing the box and displaying the message
                                    $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg error_msg').text('');
                                },timeout);
                                westerb_sal.clear_main_page_state('#list_photos_'+westerb_sal.form.fields.album_id.val()); //clear the '#main' div state for the 'list_photos' page that diaplays the particular album that's just been affected by the photo upload; do it here to "capture" the id of the album before it's cleared in the line below
                                westerb_sal.form.fields.album_id.css({'color':'#777', 'font-weight':'bold'}).val('0');
                                $('form input:checked').removeAttr('checked');
                                $('ul.radios').addClass('none_checked');
                            }
                            else if(westerb_sal.submit_form_data.request === 'add_user') {
                                $('form input:checked').removeAttr('checked');
                                $('ul.radios').addClass('none_checked');
                                $('p.non_guest:first').removeClass('hash_change_removed_3 slided').slideUp(300, function() { $('p.non_guest:last').removeClass('hash_change_removed_3 slided').slideUp(400); });
                                 $('p.non_guest').children('input').each(function() {
                                    delete westerb_sal.form.validate_on_sub[$(this).attr('name')];
                                });
                                if(westerb_sal.perms != 1) westerb_sal.clear_main_page_state('#list_users'); //clear the '#main' div state for the 'list_users.php' page only if the current user isn't Guest (Guest's actions have no consequences)
                            }
                            //if(westerb_sal.cur_pg === 'photo_upload' || westerb_sal.cur_pg === 'create_album')
                            $('#main a:first').text('<< Back home');
                            window.setTimeout(function() { //if the browser supports progress events and the request was for uploading a photo and the onprogress event was fired, and wait 1200ms for the progress animation elements to fade out first before closing the box and displaying the message
                                westerb_sal.display_msg((westerb_sal.submit_form_data.request === 'new_photo_upload')?'Photo uploaded successfully':(westerb_sal.submit_form_data.request === 'new_album_creation')?'Album successfully created':response, 'success', 4000);
                            },timeout);
                            if(westerb_sal.submit_form_data.request === 'new_album_creation' && westerb_sal.perms != 1)
                                westerb_sal.clear_main_page_state('#photo_upload'); //clear the '#main' div state for the 'photo_upload' page so that the user's albums listed in the selection options loads fresh next time the page is requested; Guest's simulation does not require this clearing because her "changes" have no side effects in the DB
                            if((westerb_sal.submit_form_data.request === 'new_photo_upload' || westerb_sal.submit_form_data.request === 'new_album_creation') && westerb_sal.perms == 3) { //either a new photo has been uploaded on 'photo_upload.php' or a new album creted on 'create_album.php'; either one will require clearing of certain album groups on 'list_albums.php'-- but only if the user is Admin since Normal's 'list_albums.php' UI doesn't include the sectioned album groups that Admin's has, and Guest won't be making actual changes in the DBs (fetching fresh content for her would be wasteful)
                                westerb_sal.clear_albums('a'); //clears the 'All albums' group
                                westerb_sal.clear_albums(westerb_sal.cur_u_id); //the change will also affect the album group other than "All albums" to which the affected/added album belongs; clearing ensures everything is loaded from the server again
                                //REVISIT THESE LAST THREE LINES WHEN OPTIMIZING AND REFACTORING FOR Normal's UIX
                                westerb_sal.clear_main_page_state('#list_albums'); //clear the '#main' div state for the 'list_albums' page because it contains crucial pieces of information that govern 'scroll pagination' that will also need to be loaded fresh as new photos/albums are added
                                if(westerb_sal.submit_form_data.request === 'new_photo_upload')
                                    westerb_sal.clear_sets('list_photos'); //it won't be enough to just clear the '#main' div state for the 'list_photos' page representing the album that's just been affected by the change; all prestored photo sets will have to be cleared as well so that the changes are reflected even if the photo count on the page is > 4
                            }
                            westerb_sal.clear_main_page_state('#logfile'); //logs will need to be updated on either one of the three actions
                        }
                        else if(westerb_sal.submit_form_data.request === 'login') {
    //                        var after_login_redirect = westerb_sal.get_url_param_value('to');
    //                        if(after_login_redirect) window.location = after_login_redirect+'.php';
    //                        else window.location = '.';
                                $('#login').addClass('login_success').trigger('click'); //this event will bubble to 'body' where it's been delegated with firing 'westerb_sal.get_hash_changer_requested_content'
                                //A BETTER IMPEMENTATION WOULD BE TO USE NODE.js TO REPORT LOGOUTS INSTEAD, I POSIT
                                westerb_sal.is_logged_in = true; //immediately let the application register that the user is logged in
                                westerb_sal.clear_main_page_state('#public_index'); //clear the '#main' div state for the 'public_index' at every login so that the 'u_p' and 'cur_u_id' attributes in the '#main' div can update
                                westerb_sal.check_login_timer = window.setInterval(westerb_sal.check_login, 6000); //Check login status every 6000ms, and store the timer reference so that it can be cleared on logout
    //                            if(after_login_redirect) window.location.hash = after_login_redirect;
    //                            else window.location.hash = 'admin_index';
                        }
                        else if(westerb_sal.submit_form_data.request === 'post_comment') {
                            var author = $.trim(westerb_sal.form.fields.author.val()); //capture the poster's name before it's cleared so that they can be thanked more personally
                            $.each(westerb_sal.form.fields, function(p,v) {
                                if(p === 'submit') v.attr('disabled', 'disabled');
                                if(v.attr('name') === 'author' || v.attr('name') === 'comment') {
                                    v.css({'color':'#444', 'font-weight':'bold'}).val($('#for_'+v.attr('name')).text());
                                    $('#'+v.attr('name')).removeClass('success_msg notice_msg error_msg').addClass('char_counter').text(v.attr('maxlength'));
                                }
                            });
                            var c_count_elem = $('#c_count').children('span'), c_count = parseInt(c_count_elem.text()),
                            stall_time = (c_count < 8)?410:0; //if the unit count < 8, wait for the comment that was just posted to fade in before re-stoting the o_w_s
                            c_count_elem.text(c_count+1+(c_count===0?' comment':' comments'));
                            $('#unit_wrapper img').addClass('comments_locked'); //used to let the application know to continue to disallow any further comments ont this photo from the current user during this "session"
                            if(c_count < 8) {
                                if(c_count === 0) $('#comments').html($.trim(westerb_sal.form.xhr_submit_data.responseText));
                                else $('#comments').append($.trim(westerb_sal.form.xhr_submit_data.responseText));
                                $('#loaded_info').scrollTop($('#loaded_info').prop('scrollHeight') - Math.ceil($('#loaded_info').innerHeight()));
                                $('.comment:last').fadeIn(400, function() {
                                    westerb_sal.store_set(westerb_sal.cur_pg+'_'+westerb_sal.pagination.set_group+'_'+'s'+westerb_sal.pagination.current_set, $('#unit_wrapper').html()+'<div id=\'loaded_info\' cur_set=\''+$('#loaded_info').attr('cur_set')+'\'>'+$('#loaded_info').html()+'</div>');
                                });
                            } else {
                                westerb_sal.store_set(westerb_sal.cur_pg+'_'+westerb_sal.pagination.set_group+'_'+'s'+westerb_sal.pagination.current_set, $('#unit_wrapper').html()+'<div id=\'loaded_info\' cur_set=\''+$('#loaded_info').attr('cur_set')+'\'>'+$('#loaded_info').html()+'</div>'); //the set state still needs to be re-stored so that the class 'comments_locked' is included in the state
                                if(u_count === 8) $('#loaded_info').scroll(westerb_sal.load_more_public_comments);
                            }
                            setTimeout(function() {
                                westerb_sal.store_outer_wrapper_state('photo_wrapper_pa_id_'+$('#unit_wrapper').attr('pa_id')+'_s_'+westerb_sal.pagination.current_set, $('.centering:last').html()); //restore the photo's o_w_s so that the changes are reflected next time it's clicked and loaded locally
                            }, stall_time);
                            westerb_sal.display_dialog_msg('Thank you for your comment'+(author==='Your name'?'':', '+author)+'! The form for this photo has now been locked to discourage spamming', 'success');
                        }
                    }
                } else {
                    if(westerb_sal.submit_form_data.request === 'post_comment') westerb_sal.display_dialog_msg();
                    else westerb_sal.display_msg('Failure: '+westerb_sal.form.xhr_submit_data.status); /////////////////////////////////////////
                    if(westerb_sal.cur_pg === 'public_index') {
                        $.each(westerb_sal.form.fields, function(p,v) {
                            v.removeAttr('disabled'); //re-allow user input on the comments posting form only if some errors occured while posting so that they user has the choice to try again
                        });
                    }
                    if(westerb_sal.progress_events) {
                        $('.pregress_info').fadeOut(800, function() {
                            $('form div.file_selector').parent('div').css('width', '1000px'); //re-allow some legroom for UI messages associated with the file input element to be displayed without constriction
                        });
                    }
                }
                if(westerb_sal.progress_events && westerb_sal.submit_form_data.request === 'new_photo_upload' && westerb_sal.onprogress_fired) //if the browser supports progress events and the request was for uploading a photo and the onprogress event was fired, delay the form property to be set to false later when the progress animation elements have completed fading out (because the (animation) code will break if submit is re-triggered without the progress animation elements having fully faded out)
                    westerb_sal.form.xhr_in_progress = true; //maintain 'true'
                else westerb_sal.form.xhr_in_progress = false;
            }
        }, writable: true, enumerable: true, configurable: true
    });
    
    //Takes care of the business of submitting form data and all the cross-browser and cross-implementation differences that go with it
    Object.defineProperty(Object.prototype.westerb_sal, 'submit_form_data', {
        value: function() {
            //store the submission parameters as properties of the function object so that they can be referenced outside it's scope where needed
            westerb_sal.submit_form_data.processing_msg = westerb_sal.submit_form_data.guest_msg =
            westerb_sal.submit_form_data.request = westerb_sal.submit_form_data.url = '';
            westerb_sal.submit_form_data.p_message_pos = 0;
            
            if(westerb_sal.is_modal_call) $('#msg_wrapper #modal_msg').remove();
            westerb_sal.form.xhr_in_progress = true;

            switch($('form.big_form').attr('id')) {
                case 'photo_upload':
                    westerb_sal.submit_form_data.processing_msg = 'Uploading';
                    westerb_sal.submit_form_data.p_message_pos = 305; //relevant to modal calls
                    westerb_sal.submit_form_data.request = 'new_photo_upload';
                    westerb_sal.submit_form_data.url = westerb_sal.HOME+'ajax/misc_calls.php?upload_photo'+((westerb_sal.is_modal_call && westerb_sal.cur_pg==='list_photos')?'=via_list_photos':(westerb_sal.is_modal_call && westerb_sal.cur_pg==='list_albums')?'=via_list_albums':''); //if it's a modal call on 'list_photo.php'/'list_albums.php', visual updates may be needed on the document, and the parameter lets the PHP code know to send the appropriate content in response
                    break;
                case 'create_album':
                    westerb_sal.submit_form_data.processing_msg = 'Creating';
                    westerb_sal.submit_form_data.p_message_pos = 215; //relevant to modal calls
                    westerb_sal.submit_form_data.guest_msg = 'Everything validates OK, and if your privileges were higher than Guest\'s, the album would have been created';
                    westerb_sal.submit_form_data.request = 'new_album_creation';
                    westerb_sal.submit_form_data.url = westerb_sal.HOME+'ajax/misc_calls.php?create_album'+(westerb_sal.is_modal_call?'=via_modal':''); //the 'via_modal' parameter is used to determine whether to send back a response or not
                    break;
                case 'login_form':
                    westerb_sal.submit_form_data.processing_msg = 'Logging in';
                    westerb_sal.submit_form_data.p_message_pos = 8; //relevant to the 'login_prompt' dialog
                    westerb_sal.submit_form_data.request = 'login';
                    westerb_sal.submit_form_data.url = westerb_sal.HOME+'ajax/misc_calls.php?login';
                    break;
                case 'add_user':
                    westerb_sal.submit_form_data.processing_msg = 'Adding user';
                    westerb_sal.submit_form_data.guest_msg = 'Everything validates OK, and if your privileges were higher than Guest\'s, the user would have been added';
                    westerb_sal.submit_form_data.request = 'add_user';
                    westerb_sal.submit_form_data.url = westerb_sal.HOME+'ajax/misc_calls.php?add_user';
                    break;
                case 'post_comment':
                    westerb_sal.submit_form_data.processing_msg = 'Posting';
                    westerb_sal.submit_form_data.request = 'post_comment';
                    westerb_sal.submit_form_data.url = westerb_sal.HOME+'ajax/misc_calls.php?post_comment='+$('form.big_form').attr('p_id');
                    break;
                default:
                    break;
            }

            if(westerb_sal.is_modal_call)
                $('#modal_processing_msg').css('top',westerb_sal.submit_form_data.p_message_pos+'px').get(0).processing_msg(westerb_sal.submit_form_data.processing_msg);
            else $('#processing_msg').get(0).processing_msg(westerb_sal.submit_form_data.processing_msg);

            if(westerb_sal.submit_form_data.request === 'new_album_creation' && westerb_sal.perms == 1) { //no need to go to the server
                $.each(westerb_sal.form.fields, function(p,v) {
                    if(p !== 'submit') //the submit field is already guarded with 'please wait...'
                        v.attr('disabled','disabled'); //prevent any further user input untill the form is done simulating submitting
                });
                if(westerb_sal.is_modal_call) {
                    window.setTimeout(function() {
                        westerb_sal.clear_p_timers();
                        westerb_sal.close_box();
                        westerb_sal.display_msg(westerb_sal.submit_form_data.guest_msg, 'info', 8500);
                    },3000);
                } else {
                    window.setTimeout(function() {
                        westerb_sal.clear_p_timers();
                        $('#processing_msg').html('');
                        westerb_sal.display_msg(westerb_sal.submit_form_data.guest_msg, 'info', 8500);
                        if(westerb_sal.cur_pg === 'create_album') $('#main a:first').text('<< Back home');
                        $.each(westerb_sal.form.fields, function(p,v) {
                            v.removeAttr('disabled'); //re-allow user input
                            if(v.attr('name') === 'albumname' || v.attr('name') === 'notes') {
                                v.css({'color':'#777', 'font-weight':'bold'}).val($('#for_'+v.attr('name')).text());
                                $('#'+v.attr('name')).removeClass('success_msg notice_msg error_msg').addClass('char_counter').text(v.attr('maxlength'));
                            }
                        });
                        westerb_sal.form.xhr_in_progress = false;
                    },3000);
                }
            }
            else if(westerb_sal.submit_form_data.request === 'add_user' && westerb_sal.perms == 1) { //also no need to go to the server
                $.each(westerb_sal.form.fields, function(p,v) {
                    if(p !== 'submit') //the submit field is already guarded with 'please wait...'
                        v.attr('disabled','disabled'); //prevent any further user input untill the form is done simulating submitting
                });
                window.setTimeout(function() {
                    westerb_sal.clear_p_timers();
                    $('#processing_msg').html('');
                    westerb_sal.display_msg(westerb_sal.submit_form_data.guest_msg, 'info', 8500);
                    $('#main a:first').text('<< Back home');
                    $.each(westerb_sal.form.fields, function(p,v) {
                        v.removeAttr('disabled'); //re-allow user input
                        if(v.attr('name') === 'first_name' || v.attr('name') === 'last_name' || v.attr('name') === 'new_username' ||
                            v.attr('name') === 'new_password') {
                            v.css({'color':'#777', 'font-weight':'bold'}).val($('#for_'+v.attr('name')).text());
                            $('#'+v.attr('name')).removeClass('success_msg notice_msg error_msg').addClass('char_counter').text(v.attr('maxlength'));
                        }
                    });
                    $('form input:checked').removeAttr('checked');
                    $('ul.radios').addClass('none_checked');
                    $('p.non_guest:first').slideUp(300, function() { $('p.non_guest:last').slideUp(400); });
                     $('p.non_guest').children('input').each(function() {
                        delete westerb_sal.form.validate_on_sub[$(this).attr('name')];
                    })
                    westerb_sal.form.xhr_in_progress = false;
                },3000);
            }
            else {
                if(westerb_sal.progress_events && westerb_sal.submit_form_data.request == 'new_photo_upload' && typeof File !== 'undefined') { //listen for the progress events in browsers that support them when uploading files via XHR (assuming if a browser supports FormData, it must also support File)
                    function update_progress(e) {
                        var p_bar_slider = $('#selector_progress_wrapper'), p_percent = $('#upload_progress_percent');
                        p_bar_slider.width(function(i,cur_val) {
                            return cur_val +  Math.round(400*((e.loaded - $(this).data('prev_uploaded'))/e.total));
                        }); //'(e.loaded - $(this).data('prev_uploaded')/e.total' represents a fraction of the change in the amount of data that's been uploaded; find out it's width equivalent by multiplying by 400 and add it to the current width
                        p_percent.css('left', function(i,cur_val) {
                            return parseInt(cur_val) +  Math.round(400*((e.loaded - p_bar_slider.data('prev_uploaded'))/e.total));
                        }); //""
                        p_percent.text(Math.round(100*e.loaded/e.total)+'%');
                        p_bar_slider.data('prev_uploaded', e.loaded); //update the total number of bytes that's been uploaded so far
                    }

                    westerb_sal.form.xhr_submit_data.upload.onloadstart = function(e) {
                        if($('#'+westerb_sal.form.fields.photo.attr('name')).hasClass('error_msg')) //because error messages from the server (that occur during the server-side photo validation) that are longer than 55 characters get displayed in the message span for the file element (instead of a regular modal message to-- circumvent limitations in space), and allowing the animation to proceed before clearing the message will cause the animation to be partly obscured by the message
                            $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg error_msg').text('');
                        $('#selector_progress_wrapper').data('prev_uploaded', 0); //always initiate to zero at the start of the request
                        $('form div.file_selector').parent('div').css('width', '350px'); //when first called slide from 370px to the maximum of 750px (+400px)
                        $('#upload_progress_percent').css({'left':(westerb_sal.cur_pg!=='photo_upload'?364:382)+'px', 'top':(westerb_sal.cur_pg!=='photo_upload'?25:85)+'px'}).text('0%'); //whereever it's posititon is at the start of the animation (if there is going to be one), restore the correct positions first and text
                    }

                    westerb_sal.form.xhr_submit_data.upload.onprogress = function(e) {
                        if (e.lengthComputable) {
                            if($('#upload_progress_bar').is(':hidden')) { //the progress update elements start out as hidden for the animation to work; calling show() (as opposed during the 'onloadstart' event) here so that they are not displayed unless the onprogress event is fired
                                westerb_sal.onprogress_fired = true;
                                $('.pregress_info').show();
                            }
                            update_progress(e);
                        }
                    }

                    westerb_sal.form.xhr_submit_data.upload.onload = function(e) {
                        var p_bar_slider = $('#selector_progress_wrapper'), p_percent = $('#upload_progress_percent'),
                        p_elems = $('.pregress_info'), remaining_percent = 100 - parseInt(p_percent.text());
                        if(remaining_percent !== 0) { //if upload completes and the progress bar and percent animations are still half way, quickly finish them off first
                            p_bar_slider.animate({'width':'750px'}, 100, 'linear');
                            p_percent.animate({'left':(westerb_sal.cur_pg!=='photo_upload'?764:782)+'px'}, 100, 'linear', function() {
                                p_bar_slider.css('width', '1000px'); //re-allow some legroom for UI messages associated with the file input element to be displayed without constriction
                                p_elems.fadeOut(1500, function() {
                                    westerb_sal.form.xhr_in_progress = westerb_sal.onprogress_fired = false;
                                });
                            });
                            (function animate_percent() {
                                p_percent.text((parseInt(p_percent.text())+1)+'%');
                                if(parseInt(p_percent.text()) < 100) window.setTimeout(animate_percent,(remaining_percent/100));
                            })();
                        } else { //do the regular handling
                            p_bar_slider.css('width', '1000px'); //re-allow some legroom for UI messages associated with the file input element to be displayed without constriction
                            p_elems.fadeOut(1500, function() {
                                westerb_sal.form.xhr_in_progress = westerb_sal.onprogress_fired = false;
                            });
                        }
                    }
                }
                westerb_sal.form.xhr_submit_data.open('post', westerb_sal.submit_form_data.url, true);
                if(westerb_sal.submit_form_data.request == 'new_photo_upload') { //requires the FILE object or FormData XHR2 API or the "iframe AJAX Method"
                    if(westerb_sal.is_modal_call && westerb_sal.cur_pg === 'list_albums') //capture the file name before the submission goes through so as to change the album face photo upon successful upload
                        westerb_sal.modal_caller_parent.data('uploaded_f_name', westerb_sal.form.fields.photo.val().replace(/^(?:[A-Z]\:(\\|\/))([a-zA-Z]+\1)+/g, ''));
                    else if(westerb_sal.is_modal_call && westerb_sal.cur_pg === 'list_photos') { //capture the cover choice selection before the submission goes through so as to change the cuurent cover shown on-screen, if any upon successful upload
                        var value_to_store = 0;
                        westerb_sal.form.cover_radios.forEach(function(e,i,a) { //check in the array (which is a property of the Form instance, bearing the same name as the value of the name attribute of this radios 'field') storing this group of radio butons
                            if(e.is(':checked')) {
                                value_to_store = e.val();
                            }
                        });
                        westerb_sal.modal_caller_parent.data('chosen_as_cover', value_to_store);
                    }

                    if(typeof FormData !== 'undefined') {
                        westerb_sal.post_FormData(westerb_sal.form.xhr_submit_data);
                    }
                    else if(typeof File !== 'undefined') {
                        ////////////////////////////////////////////??????????????????????????????
                    }
                    else { //a work-around that uses an iframe to give the illusion of AJAX submission in 'primitive' browsers, so as to maintain a fairly consistent UI experience
                        $('body').append("<iframe id='upload_frame' name='upload_frame' style='width: 0; height: 0; '></iframe>");
                        $('iframe').load(function() {
                            westerb_sal.clear_p_timers();
                            if(westerb_sal.is_modal_call) $('#modal_processing_msg').html('');
                            else $('#processing_msg').html('');
                            var response, response_for_simulation, type = '';
                            try{//REVISIT: TRY USING the $('document(i.e: the document in the iframe), context(i.e: the iframe)') SELECTION
                                if(this.contentDocument) response = this.contentDocument.body.innerHTML;
                                else if(this.contentWindow) response = this.contentWindow.document.body.innerHTML;
                                else if(this.document) response = this.document.body.innerHTML;
                                if(/Error:/.test(response)) {
                                    $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg error_msg').text('');
                                    response = response.replace('Error:', '') ; type = 'error';
                                }
                                else {
                                    if(/Info:/.test(response)) { response = response.replace('Info:', '') ; type = 'info'; }
                                    else { response_for_simulation = response; response = 'Photo uploaded successfully'; type = 'success'; }
                                    if(westerb_sal.is_modal_call) {
                                        westerb_sal.update_photo_upload_onscreen_info(response_for_simulation);
                                        westerb_sal.close_box();
                                        //for(h = 0; h < 10000; h++) window.clearInterval(h); //a HACK for clearing interval calls set during photo validation
                                    } else {
                                        if(westerb_sal.cur_pg === 'photo_upload') $('#main a:first').text('<< Back home');
                                        $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg error_msg').text('');
                                        westerb_sal.form.fields.caption.css({'color':'#777', 'font-weight':'bold'}).val($('#for_'+westerb_sal.form.fields.caption.attr('name')).text());
                                        $('#'+westerb_sal.form.fields.caption.attr('name')).removeClass('success_msg notice_msg error_msg').addClass('char_counter').text(westerb_sal.form.fields.caption.attr('maxlength'));
                                        westerb_sal.form.fields.album_id.css({'color':'#777', 'font-weight':'bold'}).val('0');
                                        $('form input:checked').removeAttr('checked');
                                        $('ul.radios').addClass('none_checked');
                                    }
                                }
                            } catch(e) { /*alert(e.toString())*/ }
                            if(westerb_sal.is_modal_call && (type === 'error' || response === '')) {
                                if(response.length > 55)
                                    $('#'+westerb_sal.form.fields.photo.attr('name')).removeClass('success_msg notice_msg').addClass('error_msg').text(response);
                                else westerb_sal.display_modal_msg(response);
                            }
                            else {
                                //////////////////////////////////?????????????????????????????
                                westerb_sal.display_msg(response, type, type==='info'?8500:4000);
                            }
                            westerb_sal.form.xhr_in_progress = false;
                            $(this).unbind('load').remove();
                        })
                    }
                } else { //use regular 'application/x-www-form-urlencoded' MIME
                    westerb_sal.form.xhr_submit_data.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    if(westerb_sal.submit_form_data.request === 'new_album_creation')
                        westerb_sal.form.xhr_submit_data.send('albumname='+encodeURIComponent(westerb_sal.form.fields.albumname.val().replace(' ', '+', 'g'))+'&notes='+encodeURIComponent(westerb_sal.form.fields.notes.val().replace(' ', '+', 'gm')));
                    else if(westerb_sal.submit_form_data.request === 'login')
                        westerb_sal.form.xhr_submit_data.send('username='+westerb_sal.form.fields.username.val()+'&password='+westerb_sal.form.fields.password.val());
                    else if(westerb_sal.submit_form_data.request === 'add_user') {
                        var perms = 0;
                        westerb_sal.form.perms_radios.forEach(function(e,i,a) { //check in the array (which is a property of the Form instance, bearing the same name as the value of the name attribute of this radios 'field') storing this group of radio butons
                            if(e.is(':checked')) perms = e.val();
                        })
                        westerb_sal.form.xhr_submit_data.send('perms='+perms+'&first_name='+encodeURIComponent(westerb_sal.form.fields.first_name.val().replace(' ', '+', 'g'))+'&last_name='+encodeURIComponent(westerb_sal.form.fields.last_name.val().replace(' ', '+', 'g'))+'&new_username='+encodeURIComponent(westerb_sal.form.fields.new_username.val().replace(' ', '+', 'g'))+'&new_password='+encodeURIComponent(westerb_sal.form.fields.new_password.val().replace(' ', '+', 'g')));
                    }
                    if(westerb_sal.submit_form_data.request === 'post_comment')
                        westerb_sal.form.xhr_submit_data.send('author='+encodeURIComponent(westerb_sal.form.fields.author.val().replace(' ', '+', 'g'))+'&comment='+encodeURIComponent(westerb_sal.form.fields.comment.val().replace(' ', '+', 'gm')));
                }
                $.each(westerb_sal.form.fields, function(p,v) {
                    if(p !== 'submit') //the submit field is already guarded with 'please wait...'
                        v.attr('disabled','disabled'); //prevent any further user input untill the form is done simulating submitting
                });
            }
        }, writable: true, enumerable: true, configurable: true
    });
    
//    //Global variable for storing the timer IDs generated for the 500ms-interval calls to 'westerb_sal.validate_photo()'
//    Object.defineProperty(Object.prototype.westerb_sal, 'validate_photo_timer', {
//        value: 0, writable: true, enumerable: true, configurable: true
//    });
    
    //Validates a selected photo every 500ms after the 'westerb_sal.form.fields.photo' file field gains focus
    Object.defineProperty(Object.prototype.westerb_sal, 'validate_photo', {
        value: function() {//console.log('Validating '+$('form.big_form input:file').val()+' ...');
            //store the validation parameters as properties of the function object
            westerb_sal.validate_photo.pattern1 = /.+(\.jpe?g|png)$/, westerb_sal.validate_photo.pattern2 = /.+(\.jpeg)$/,
            westerb_sal.validate_photo.pattern3 = /.+(\.jpg|png)$/, westerb_sal.validate_photo.fstr = '';
            
            if($('form.big_form input:file').val() != '') {
                westerb_sal.validate_photo.fstr = $('form.big_form input:file').val().toLowerCase();
                westerb_sal.validate_photo.fstr = westerb_sal.validate_photo.fstr.replace(/^(?:[a-z]\:(\\|\/))([a-zA-Z]+\1)+/g, '');
                if(!westerb_sal.validate_photo.pattern1.test(westerb_sal.validate_photo.fstr) && westerb_sal.validate_photo.fstr != '') {
                    $('form.big_form input:file').addClass('error_bordered');
                    $('#photo').removeClass('success_msg notice_msg char_counter').addClass('error_msg');
                    $('#photo').text('Provide a valid JPEG or PNG file');
                    westerb_sal.form.record_errored_field(westerb_sal.form.fields.photo);
                }
                else if(westerb_sal.validate_photo.pattern2.test(westerb_sal.validate_photo.fstr) && (westerb_sal.validate_photo.fstr.length - 5) > 25) {
                    $('form.big_form input:file').addClass('error_bordered');
                    $('#photo').removeClass('success_msg notice_msg char_counter').addClass('error_msg');
                    $('#photo').text('The file name is ' + (westerb_sal.validate_photo.fstr.length - 5) + ' characters long. Please keep it under 25 characters');
                    westerb_sal.form.record_errored_field(westerb_sal.form.fields.photo);
                }
                else if(westerb_sal.validate_photo.pattern3.test(westerb_sal.validate_photo.fstr) && westerb_sal.validate_photo.fstr.length - 4 > 25) {
                    $('form.big_form input:file').addClass('error_bordered');
                    $('#photo').removeClass('success_msg notice_msg char_counter').addClass('error_msg');
                    $('#photo').text('The file name is ' + (westerb_sal.validate_photo.fstr.length - 4) + ' characters long. Please keep it under 25 characters');
                    westerb_sal.form.record_errored_field(westerb_sal.form.fields.photo);
                }
                else if (westerb_sal.validate_photo.fstr != '') {
                    westerb_sal.form.remove_field_err_rec(westerb_sal.form.fields.photo);
                    $('#photo').removeClass('error_msg notice_msg char_counter').addClass('success_msg');
                    $('#photo').text('Valid file provided');
                }
            }
        }, writable: true, enumerable: true, configurable: true
    });
    
    Object.defineProperty(Object.prototype.westerb_sal,
    'Form', // Define Object.prototype.westerb_sal.Form
    { writable: false, enumerable: true, configurable: true,
    value: function() {
        this_instance = this;
        this_instance.errors = [];
        this_instance.fields = Object.create(null);
        this_instance.validate_on_sub = Object.create(null);
        this_instance.update_counter_timer = null; //make this "global" so that it can be cleared in 'add_user.php'
        this_instance.xhr_in_progress = false; //used to prevent form submissions before the server gets the chance to respond on fields that are validated via AJAX
        this_instance.xhr_submit_data = westerb_sal.create_xhr(); //XHR objest for sending all Form data via AJAX
        westerb_sal.is_modal_call = ($('form.big_form').hasClass('modal_dialog'))?true:false;
        this_instance.xhr_submit_data.onreadystatechange = westerb_sal.is_modal_call?westerb_sal.handle_modal_submit_data_response:westerb_sal.handle_submit_data_response;
        if(typeof FormData === 'undefined' && typeof File === 'undefined' &&
                (westerb_sal.cur_pg === 'photo_upload' || westerb_sal.cur_pg === 'list_albums' ||
                westerb_sal.cur_pg === 'list_photos')) //only in browsers that don't support the file upload APIs and if the current page requires/may require a file upload. The photo will be uploaded via the 'iframe AJAX Method'
            $('form').attr({'target':'upload_frame', 'action':westerb_sal.HOME+'ajax/misc_calls.php?upload_photo'+((westerb_sal.cur_pg==='list_photos')?'=via_list_photos':(westerb_sal.cur_pg==='list_albums')?'=via_list_albums':'')});
        $("form.big_form span.label").hide();
        $("form.big_form span.for_radios").css({"color":"#777", "font-weight":"bold", "font-size":"14px"});
        $("form.big_form .form_field").each(function() {
            if($(this).hasClass("p_holder")) {
                if($(this).parent("p").hasClass("non_guest"))
                    $(this).parent("p").hide(); //hide first and last name fields, to be displayed only when a non-guest privilege is picked
                if($(this).attr("name") == "caption") 
                    $("#for_caption").text("Photo caption"); //'coz the HTML-static text in the label span for the caption field is not "Photo caption"
                var p_holder_str = $("#for_"+$(this).attr("name")).text();
                if($(this).prop("tagName") == "TEXTAREA")
                    $(this).css("font-size","15px");
                if($(this).val() == "")
                    $(this).val(p_holder_str);
                if($(this).val() == p_holder_str)
                    $(this).css({"color":(westerb_sal.cur_pg==='public_index' && !westerb_sal.blocking_login_dialog)?"#444":"#777", "font-weight":"bold"});
                $(this).focus(function() {
                    if($(this).val() == p_holder_str) $(this).val("");
                    $(this).css({"color":"#000", "font-weight":"normal"});
                })
                if(!$(this).hasClass("reqrd")) { //avoiding conflicts with the blur and focus events later bound on .reqrd
                    if($(this).attr("type") == "text") {
                        //Listen to the focus event of any required field whether it's empty or not upon event
                        //triggering to adjust the counter in case the field was populated with a mouse click by
                        //one of the items in browsers' cached dropdown menus
                        $(this).focus(function() {
                            var this_field = $(this);
                            function update_counter() {
                                $("#"+this_field.attr("name")).text(parseInt(this_field.attr("maxlength")) - this_field.val().length);
                            }
                            var h = window.setInterval(update_counter,80);

                            //also bind the blur event to the element to clear the set setInterval calls
                            this_field.bind("blur", function() { window.clearInterval(h) })
                        })
                    }

                    $(this).blur(function() {
                        if($(this).val() == "") {
                            $(this).css({"color":westerb_sal.cur_pg==='public_index'?"#444":"#777", "font-weight":"bold"});
                            $(this).val(p_holder_str);
                        }
                    })
                }
            }
            if($(this).prop("tagName") == "SELECT") {
                if($(this).val() != "0")
                    $(this).css({"color":"#000", "font-weight":"normal"});
                $(this).change(function() {
                    if($(this).val() != "0")
                        $(this).css({"color":"#000", "font-weight":"normal"});
                    else
                         $(this).css({"color":"#777", "font-weight":"bold"});
                })
            }
            if($(this).hasClass("validate_on_sub")) {
                Object.defineProperty(this_instance.validate_on_sub, $(this).attr("name"), {value:$(this), writable:true, enumerable:true, configurable:true});
            }
            if($(this).hasClass("radios")) {
                $(this).css("margin-left",$(this).attr("left")); //icrease the left margin of the ul element containing the radio buttons
                Object.defineProperty(this_instance, $(this).attr("name"), {value:[], writable:true, enumerable:true, configurable:true});
                $(this).change(function() {
                    $(this).removeClass("error_bordered");
                    $("#"+ $(this).attr("name")).text("").removeClass("error_msg");
                    this_instance.remove_field_err_rec($(this));
                })
                $(this).children("li").children("input").hover(function() {
                    $(this).siblings("span.pre").css("opacity",".8");
                }, function() {
                    $(this).siblings("span.pre").css("opacity",".6")
                })
            }
            if($(this).attr("type") == "radio") {
                this_instance[$(this).attr("name")+"_radios"].push($(this));
            } else {
                if($(this).hasClass("msg_span")) {
                    var str = "<span id=\"" + $(this).attr("name") + "\" class=\"field_msg";
                    if($(this).attr("maxlength"))
                        str += " char_counter";
                    if($(this).attr("name") === "caption")
                        str += " hash_change_removed_3 faded";
                    if($(this).attr("name") === "album_id")
                        str += " hash_change_removed_3 faded";
                    str += "\">";
                    if($(this).attr("maxlength")) {
                        if($(this).val() == "" || $(this).val() == $("#for_"+$(this).attr("name")).text())
                            str += $(this).attr("maxlength");
                        else
                            str += ($(this).attr("maxlength") - $(this).val().length);
                    }
                    str += "</span>";
                    if($(this).attr('type') == 'file') {
                        if($(this).val() != '')
                            $(this).val('');
                        //if(westerb_sal.cur_pg === 'photo_upload' || westerb_sal.cur_pg === 'list_albums' ||
                          //  westerb_sal.cur_pg === 'list_photos') { //the wrapper div is used in the progress bar animation and appending the str instead of 'after()' is to allow the span element to move together with the file parent div when that is moved/pushed down by, say, a UI message
                            $(this).parent('div.file_selector').wrap("<div id='selector_progress_wrapper' "+(westerb_sal.cur_pg !== 'photo_upload'?'class=\'blocking_dialog hash_change_removed_3 slided\' ':'')+"style='width: 1000px; overflow: hidden; display: inline-block; '></div>");
                            $(this).parent('div.file_selector').parent('div').append(str);
                        //} else $(this).parent('div.file_selector').after(str);
                        $(this).focus(function() {
                            $(this).parent('div.file_selector').css('opacity', .8);
                            if($(this).val() != '') {
                                $(this).triggerHandler('blur');
                            }
                        })
                        $(this).parent('div.file_selector').click(function() {
                            $(this).children("input").focus();
                        })
                    }
                    else
                        $(this).after(str);
                }

                if($(this).attr("maxlength")) {
                    var txt_len, max_len = parseInt($(this).attr("maxlength"), 10);
                    $(this).keyup(function() {
                        txt_len = $(this).val().length;
                        if(txt_len > max_len) {
                            $(this).val($(this).val().substring(0, max_len));
                            txt_len = max_len;
                        }
                        if($(this).attr("type") == "password")
                            $("#"+ $(this).siblings("input").attr("name")).text(max_len - txt_len);
                        else
                            $("#"+ $(this).attr("name")).text(max_len - txt_len);
                    })
                }

                //
                if($(this).hasClass("reqrd")) {
                    $(this).blur(function() {
                        if($(this).val() == "" || $(this).val() == 0) {
                            if($(this).hasClass("p_holder")) {
                                $(this).css({"color":westerb_sal.cur_pg==='public_index'?"#444":"#777", "font-weight":"bold"});
                                $(this).val($("#for_"+$(this).attr("name")).text());
                            }
                            if($(this).attr("type") == "file") {
                                str = "A file will be required before submitting";
                                $(this).parent("div.file_selector").css("opacity", .6);
                            }
                            else {
                                if($(this).attr("type") == "password")
                                    $(this).siblings("input").removeClass("error_bordered").addClass("notice_bordered");
                                else
                                    $(this).removeClass("error_bordered").addClass("notice_bordered");
                                if($(this).prop("tagName") == "SELECT")
                                    str = "A selection will be required before submitting";
                                else if($(this).attr("name") == "comment") {
                                    str = "Required before submitting";
                                    if($('div.centering:last').innerWidth() > 910) $("#"+$(this).attr("name")).css('font-size', '13px');
                                }
                                else
                                    str = "This will have to be filled before submitting";
                            }
                            if($(this).attr("type") == "password")
                                $("#"+ $(this).siblings("input").attr("name")).removeClass("success_msg error_msg char_counter").addClass("notice_msg").text(str);
                            else
                                $("#"+$(this).attr("name")).removeClass("success_msg error_msg char_counter").addClass("notice_msg").text(str);
                        }
                    })

                    var msg_str;
                    $(this).focus(function() {
                        $("div.message_wrapper").fadeOut(200); //hide message returned from PHP first to prevent any potential obstructions of JS-generated messages

                        if($(this).attr("type") == "text") {
                            //Listen to the focus event of any required field whether it's empty or not upon event
                            //triggering to adjust the counter in case the field was populated with a mouse click by
                            //one of the items in browsers' cached dropdown menus
                            var this_field = $(this);
                            function update_counter() {
                                $("#"+this_field.attr("name")).removeClass("error_msg success_msg").addClass("char_counter").text(parseInt(this_field.attr("maxlength")) - this_field.val().length);
                            }
                            this_instance.update_counter_timer = window.setInterval(update_counter,80);

                            //also bind the blur event to the element to clear the set setInterval calls
                            this_field.bind("blur", function() { window.clearInterval(this_instance.update_counter_timer) })
                        }

                        //Bind the respective events only to fields that have a corresponding password field and only when they are empty
                        //Not checking for '|| $(this).val() == $("#for_"+$(this).attr("name")).text()' because the focus event bound earlier will clear the placeholder
                        //The purpose of this code is for any browsers that remember and auto-fill password fields when their corresponding text fields are populated, e.g. Mozilla Firefox > v.10
                        if($(this).hasClass("has_pword") && $(this).val() == "") {
                            function adapt_to_autofill() {
                                if(westerb_sal.form.fields.password && westerb_sal.form.fields.password.val() != "") {
                                    if(westerb_sal.form.fields.password_placeholder.hasClass("error_bordered"))
                                        this_instance.remove_field_err_rec(westerb_sal.form.fields.password);
                                    westerb_sal.form.fields.password_placeholder.removeClass("error_bordered").css("display","none");
                                    $("#"+westerb_sal.form.fields.password_placeholder.attr("name")).removeClass("notice_msg error_msg").addClass("char_counter");
                                    $("#"+westerb_sal.form.fields.password_placeholder.attr("name")).text(parseInt(westerb_sal.form.fields.password.attr("maxlength")) - westerb_sal.form.fields.password.val().length);
                                }
                            }
                            var h2 = window.setInterval(adapt_to_autofill,80);

                            //also bind the blur event to the element to clear the set setInterval calls
                            this_field.bind("blur", function() { window.clearInterval(h2) })  
                        }

                        //1).If a required field that is not a file field is empty, decrement form erros only if the field
                        //had errors (i.e class 'error_bordered' == true)to begin with, then clear borders and msg in msg_span
                        //2).If it's a file field, only do as above if it's empty, else only do as above if it had errors (this
                        //way the success state is left unchanged and does not cause any form-error decrements)
                        if($(this).val() == "" || $(this).val() == 0 || ($(this).attr("type") == "file") &&
                            $(this).hasClass("error_bordered")) {
                            $(this).removeClass("error_bordered notice_bordered");
                            if($(this).attr("maxlength")) {
                                msg_str = $(this).attr("maxlength");
                                if($(this).attr("name") == "comment" && $('div.centering:last').innerWidth() > 910) $("#"+$(this).attr("name")).css('font-size', '16px');
                            }
                            else
                                msg_str = "";
                            if($(this).attr("type") == "password")
                                $("#"+ $(this).siblings("input").attr("name")).removeClass("success_msg error_msg notice_msg").addClass("char_counter").text(msg_str);
                            else
                                $("#"+$(this).attr("name")).removeClass("success_msg error_msg notice_msg").addClass("char_counter").text(msg_str);
                            this_instance.remove_field_err_rec($(this));
                        }
                    })
                }
                Object.defineProperty(this_instance.fields, $(this).attr("name"), {value:$(this), writable:true, enumerable:true, configurable:true});
            }
        });
        
        if(!westerb_sal.is_modal_call)
            $('form.big_form div:last').append("<div id='processing_msg' style='position: absolute; top: "+(westerb_sal.cur_pg==='public_index'?99:10)+"px; left: "+(westerb_sal.cur_pg==='add_user'?120:(westerb_sal.cur_pg==='public_index'?5:105))+"px; width: 140px; color: #222; font-weight: bold; '></div>");

        if(westerb_sal.progress_events && (westerb_sal.cur_pg === 'photo_upload' || westerb_sal.is_modal_call)) { //only if a photo (file) is being uploaded and the browser supports XHR2 Event Model
            var p_bar_str = "<div class='pregress_info' id='upload_progress_bar' style='position: absolute; top: 8px; left: 350px; width: 400px; border-radiu: 30px; overflow: hidden; z-index: 3000; display: none; '>";
            p_bar_str += "<div style='display: inline-block; border-top-left-radius: 35px; border-bottom-left-radius: 35px; width: 100px; height: 5px; background-color: #1C6487; '></div>"
            p_bar_str += "<div style='display: inline-block; width: 100px; height: 5px; background-color: #A20910; '></div>"
            p_bar_str += "<div style='display: inline-block; width: 100px; height: 5px; background-color: #C36500; '></div>"
            p_bar_str += "<div style='display: inline-block; width: 100px; border-top-right-radius: 35px; border-bottom-right-radius: 35px; height: 5px; background-color: #93A50B; '></div>"
            p_bar_str += "</div>"
            $('form.big_form div.file_selector').parent('div').append(p_bar_str).after("<span class='pregress_info' id='upload_progress_percent' style='color: #222; font-weight: bold; font-size: 12px; position: absolute; top: "+(westerb_sal.cur_pg!=='photo_upload'?25:85)+"px; left: "+(westerb_sal.cur_pg!=='photo_upload'?364:382)+"px; z-index: 3000; display: none; '></span>");
        } //CANDIDATE FOR GENERALIZATION
        
        if($('form.big_form').attr('id') === 'photo_upload') {
            $('form.big_form .form_field[name=photo]').focus(function() { //set the interval call just once during the initial focus when there isn't any file selected
                if(westerb_sal.photo_validation_sentinel === 0) {
                    window.setInterval(westerb_sal.validate_photo, 500);
                    westerb_sal.photo_validation_sentinel++;
                }
            });

//            $('form.big_form').submit(function() { //reset 'i' so that interval calls can be set again for the next selection
//                if(westerb_sal.form.errors.length === 0) i = 0;
//            });

//            $('form.big_form .form_field[name=photo]').blur(function() {
//                window.clearInterval(westerb_sal.validate_photo_timer);
//            });
        }
        
        else if($('form.big_form').attr('id') === 'add_user') {
            $('form.big_form .form_field[name=perms]').each(function() {
                $(this).change(function() {
                    if($(this).val() !== '1') {
                        $('p.non_guest:first').addClass('hash_change_removed_3 slided').slideDown(200, function() { $('p.non_guest:last').addClass('hash_change_removed_3 slided').slideDown(200); });
                        $('p.non_guest').children('input').each(function() {
                            westerb_sal.form.validate_on_sub[$(this).attr('name')] = $(this);
                        })
                    }
                    else {
                         $('p.non_guest:first').removeClass('hash_change_removed_3 slided').slideUp(200, function() { $('p.non_guest:last').removeClass('hash_change_removed_3 slided').slideUp(200); });
                         $('p.non_guest').children('input').each(function() {
                            delete westerb_sal.form.validate_on_sub[$(this).attr('name')];
                            westerb_sal.form.remove_field_err_rec($(this));
                        })
                    }
                })
            });

            $('form.big_form .form_field[name=new_username]').keyup(function() {
                var val = $(this).val().trim();
                if(/\s+/.test(val)) {
                    window.clearInterval(westerb_sal.form.update_counter_timer);
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('No spaces are allowed between characters of the username');
                    westerb_sal.form.record_errored_field($(this));
                } else if(val.toLowerCase() == 'username') {
                    window.clearInterval(westerb_sal.form.update_counter_timer);
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('Sorry, '+ '"' + val + '"' + ' is not a valid username');
                    westerb_sal.form.record_errored_field($(this));
                } else {
                    $(this).removeClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('error_msg').addClass('char_counter');
                    westerb_sal.form.remove_field_err_rec($(this));
                }
            }).blur(function() {
                val = $(this).val().trim();
                if(val != $('#for_'+$(this).attr('name')).text() && (/\s+/.test(val))) {
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('No spaces are allowed between characters of the username');
                    westerb_sal.form.record_errored_field($(this));
                } else if(val.toLowerCase() == 'username') {
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('Sorry, '+ '"' + val + '"' + ' is not a valid username');
                    westerb_sal.form.record_errored_field($(this));
                } else if(val != $('#for_'+$(this).attr('name')).text()) {
                    westerb_sal.form.xhr_in_progress = true; //prevent form submission before the server gets a chance to respond
                    $('#'+$(this).attr('name')).get(0).processing_msg();
                    westerb_sal.xhr_check_u_name.open('get', westerb_sal.HOME+'ajax/misc_calls.php?u_name='+val, true);
                    westerb_sal.xhr_check_u_name.send(null);
                }
            })

            $('form.big_form .form_field[name=new_password]').keyup(function() {
                var val = $(this).val().trim();
                if(val.toLowerCase() == 'password') {
                    window.clearInterval(westerb_sal.form.update_counter_timer);
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('Sorry, '+ '"' + val + '"' + ' is a very weak password and is not allowed');
                    westerb_sal.form.record_errored_field($(this));
                } else if(val.toLowerCase() == 'new password') {
                    window.clearInterval(westerb_sal.form.update_counter_timer);
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('Sorry, '+ '"' + val + '"' + ' is not a valid password');
                    westerb_sal.form.record_errored_field($(this));
                } else {
                    $(this).removeClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('error_msg').addClass('char_counter');
                    westerb_sal.form.remove_field_err_rec($(this));
                }
            }).blur(function() {
                val = $(this).val().trim();
                if(val.toLowerCase() == 'password') {
                    $(this).addClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('char_counter').addClass('error_msg').text('Sorry, '+ '"' + val + '"' + ' is a very weak password and is not allowed');
                    westerb_sal.form.record_errored_field($(this));
                } else if(val != $('#for_'+$(this).attr('name')).text()) {
                    $(this).removeClass('error_bordered');
                    $('#'+$(this).attr('name')).removeClass('error_msg').addClass('char_counter').text(parseInt($(this).attr('maxlength')) - $(this).val().length);
                    westerb_sal.form.remove_field_err_rec($(this));
                }
            })
        }
        
        else if($('form.big_form').attr('id') === 'login_form') {
            var p_word_field = $('form.big_form .form_field[name=password]'),
            p_word_p_holder_field = $('form.big_form .form_field[name=password_placeholder]');
            
            p_word_field.parent('p').css('margin-bottom','45px').children('input').css('margin-left','0');
    
            //password_field.parent('p').children('input').css('margin-left','0');

            if(p_word_field.val() == '') p_word_p_holder_field.css('display','inline');

            p_word_p_holder_field.val('Password');

            if(p_word_p_holder_field.val() == 'Password') p_word_p_holder_field.css({'color':'#777', 'font-weight':'bold'});

            p_word_p_holder_field.focus(function() {
                $(this).css('display','none');
                p_word_field.focus();
            });

            p_word_field.focus(function() { //for the keyup event in Firefox **check necessity**
                p_word_p_holder_field.css('display','none');
            });

            p_word_field.blur(function() {
                if($(this).val() == '') p_word_p_holder_field.css('display','inline');
            });

            $('form.big_form .form_field[name=submit]').click(function(e) {
                if(!$(this).hasClass('login_success')) e.stopPropagation(); //prevents the click event from propagating to 'body' and trigger the 'westerb_sal.get_hash_changer_requested_content' handler-- this will be triggered later, if login goes through successfully
            });
        }
    }
    });
    //extending the Form class
    Object.defineProperties(westerb_sal.Form.prototype, {
        validate : {
            value: function() {
                $('div.message_wrapper').remove();
                var this_field = null, str = '';
                for(p in this.validate_on_sub) {
                    this_field = this.validate_on_sub[p];
                    if(this_field.hasClass("radios")) {
                        this[p].forEach(function(e,i,a) {
                            if(e.get(0).checked) {
                                this_field.removeClass("none_checked");
                            }
                        })
                        if(this_field.hasClass("none_checked")) {
                            this_field.addClass("error_bordered");
                            $("#"+this_field.attr("name")).addClass("error_msg");
                            $("#"+this_field.attr("name")).text("Pick one of these choices before proceeding");
                            this.record_errored_field(this_field);
                        }
                    }
                    else {
                        if(this_field.val() == $("#for_"+this_field.attr("name")).text() || this_field.val() == ""
                            || this_field.val() == 0) {
                            if(this_field.attr("type") == "password")
                                this_field.siblings("input").removeClass("notice_bordered").addClass("error_bordered");
                            else
                                this_field.removeClass("notice_bordered").addClass("error_bordered");
                            if(this_field.attr("type") == "file")
                                str = "Provide a file to upload before proceeding";
                            else if(this_field.prop("tagName") == "SELECT")
                                str = "Make a selection before proceeding";
                            else if(this_field.attr("name") == "comment") {
                                str = "Required before submitting";
                                if($('div.centering:last').innerWidth() > 910) $("#"+this_field.attr("name")).css('font-size', '13px');
                            }
                            else
                                str = "Fill this field before proceeding";

                        if(this_field.attr("type") == "password")
                            $("#"+this_field.siblings("input").attr("name")).removeClass("notice_msg char_counter").addClass("error_msg").text(str);
                        else
                            $("#"+this_field.attr("name")).removeClass("notice_msg char_counter").addClass("error_msg").text(str);
                        this.record_errored_field(this_field);
                        }
                    }
                }
                return this.errors.length === 0 ? true:false;
            }, writable: true, enumerable: true, configurable: true
        },

        record_errored_field : {
            value: function(field) {
                var field_name = field.attr("name");
                if(this.errors.indexOf(field_name) === -1)
                    this.errors.push(field_name);
            }, writable: true, enumerable: true, configurable: true
        },

        remove_field_err_rec : {
            value: function(field) {
                var field_name = field.attr("name"), start_index = this.errors.indexOf(field_name);
                if(start_index !== -1)
                    this.errors.splice(start_index,1);
            }, writable: true, enumerable: true, configurable: true
        }
    });
    
    //Global variable for holding the Form instance
    Object.defineProperty(Object.prototype.westerb_sal,
    'form', // Define Object.prototype.westerb_sal.form
    { writable: true, enumerable: true, configurable: true, value: new westerb_sal.Form });
    
    $('body').on('submit', 'form.big_form', function(e) {
        if(westerb_sal.form.xhr_in_progress) {
            if($(this).hasClass('modal_dialog')) westerb_sal.please_wait_msg(e, true);
            else westerb_sal.please_wait_msg(e);
            return false;
        } else if (westerb_sal.form.validate()) {
            if((westerb_sal.cur_pg === 'list_albums' && westerb_sal.modal_caller_parent.hasClass('album'))
                || westerb_sal.cur_pg === 'list_photos' || westerb_sal.cur_pg === 'photo_upload') {
                for(h = 0; h < 10000; h++) window.clearInterval(h); //a HACK for clearing interval calls set during photo validation
                westerb_sal.photo_validation_sentinel = 0; //reset the sentinel so that the next focus on the file element kicks off of the interval calls to 'westerb_sal.validate_photo()' again
                westerb_sal.check_login_timer = window.setInterval(westerb_sal.check_login, 6000); //re-initiate the -interval login check as the HACK above is sure to clear them
            }
            westerb_sal.submit_form_data();
            if(typeof FormData === 'undefined' && typeof File === 'undefined' && !westerb_sal.blocking_login_dialog &&
                (westerb_sal.cur_pg === 'photo_upload' || (westerb_sal.cur_pg === 'list_albums' && westerb_sal.modal_caller_parent.hasClass('album')) ||
                westerb_sal.cur_pg === 'list_photos')) { //only in browsers that don't support the file upload APIs and if the current page requires/may require a file upload; but, still, whatever the current page is, the function should not return true if it was invoked as a result of a submission from the 'prompt_login' dialog
                return true;
            }
            else return false;
        } else return false; //form has errors; prevent default action
    });
});