$(function() {
//window.onresize = function() { console.log(this.innerWidth) }
//
//
//
//
//
//
//
//

//Define a single global 'name-space object' for holding all Salon helper functions and variables, instead of cluttering up the global name space with each indivudually
    Object.defineProperty(Object.prototype,
            'westerb_sal', // Define Object.prototype.westerb_sal
            {writable: true, enumerable: false, configurable: false, value: Object.create(null)});

//Global variable (suppossed to be a constant, really) used to store the absolute URL path to the Public directory
    Object.defineProperty(Object.prototype.westerb_sal,
            'HOME', // Define Object.prototype.westerb_sal.HOME
            {writable: false, enumerable: true, configurable: true, value: window.location.host === 'localhost' ? 'http://localhost/westerb_sal/public/' : 'http://thesalonproject.com/'});

//Global variable for keeping track of the current page; it will, on initial application loading/any page refresh, be calculated and set, but can also be "manually" set with every hash change, to maintain the same code behaviour in flow-controll structures that rely on it's value
    Object.defineProperty(Object.prototype.westerb_sal,
            'cur_pg', // Define Object.prototype.westerb_sal.cur_pg
            {writable: true, enumerable: true, configurable: true, value: ''});

//The function that computes and "initiates" the value for the 'westerb_sal.cur_pg' variable
    (function() {
        var cur_url = location.href;
        if (/(public\/|thesalonproject.com\/)(?!admin)(index.php)?/i.test(cur_url))
            westerb_sal.cur_pg = 'public_index';
        else if (/admin\/(#)?(index.php(#)?)?$/i.test(cur_url))
            westerb_sal.cur_pg = 'admin_index';
        else if (/admin\/list_albums.php/i.test(cur_url))
            westerb_sal.cur_pg = 'list_albums';
        else if (/admin\/list_photos.php/i.test(cur_url))
            westerb_sal.cur_pg = 'list_photos';
        else if (/admin\/create_album.php/i.test(cur_url))
            westerb_sal.cur_pg = 'create_album';
        else if (/admin\/photo_upload.php/i.test(cur_url))
            westerb_sal.cur_pg = 'photo_upload';
        else if (/admin\/login.php/i.test(cur_url))
            westerb_sal.cur_pg = 'login';
        else if (/admin\/add_user.php/i.test(cur_url))
            westerb_sal.cur_pg = 'add_user';
        else if (/admin\/list_users.php/i.test(cur_url))
            westerb_sal.cur_pg = 'list_users';
        else if (/admin\/logfile.php/i.test(cur_url))
            westerb_sal.cur_pg = 'logfile';
    })();

//Helper function for querying the current scrollbar offsets as the x and y properties of an object
    Object.defineProperty(Object.prototype.westerb_sal,
            'getScrollOffsets', // Define Object.prototype.westerb_sal.getScrollOffsets
            {writable: false, enumerable: true, configurable: true,
                value: function(w) {
                    // Use the specified window or the current window if no argument
                    w = w || window;
                    // This works for all browsers except IE versions 8 and before
                    if (w.pageXOffset != null)
                        return {x: w.pageXOffset, y: w.pageYOffset};
                    // For IE (or any browser) in Standards mode
                    var d = w.document;
                    if (document.compatMode == "CSS1Compat")
                        return {x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop};
                    // For browsers in Quirks mode
                    return {x: d.body.scrollLeft, y: d.body.scrollTop};
                }
            });

//Helper function for scrolling the document to bring the blocking dialog into view
    Object.defineProperty(Object.prototype.westerb_sal,
            'scroll_to_dialog', // Define Object.prototype.westerb_sal.scroll_to_dialog
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    if ($('#blinker').size() === 1)
                        $('#blinker').get(0).scrollIntoView();
                    else if ($('#login_prompt_wrapper') === 1)
                        $('#login_prompt_wrapper').get(0).scrollIntoView();
                }
            });

//Global variable for checking whether or not there is a blocking dialog box before deciding on action to take
    Object.defineProperty(Object.prototype.westerb_sal,
            'blocking_dialog', // Define Object.prototype.westerb_sal.blocking_dialog
            {writable: true, enumerable: true, configurable: true, value: false});

//Global variable for keeping track of the user's login status; it's initiated to false, and will be updated on initial application loading, on every page refresh, and after every 6000ms after the user has logged in
    Object.defineProperty(Object.prototype.westerb_sal,
            'is_logged_in', // Define Object.prototype.westerb_sal.is_logged_in
            {writable: true, enumerable: true, configurable: true, value: false});

//This value will be set to true whenever the login modal is displayed in order to prevent 'westerb_sal.prompt_login' from being called again and again while the box is alredy displayed
    Object.defineProperty(Object.prototype.westerb_sal,
            'blocking_login_dialog', {// Define Object.prototype.westerb_sal.blocking_login_dialog
                value: false, writable: true, enumerable: true, configurable: false
            });

//Helper function for recalibrating elements on 'public_index.php' when it's not "the gallery" that's on display, as the browser scales
    Object.defineProperty(Object.prototype.westerb_sal,
            'readjust_general_public_elems', {// Define Object.prototype.westerb_sal.readjust_general_public_elems
                value: function() {
                    var outer_wrapper_width = $('#outer_wrapper').innerWidth(), nm_dt_ownr_width = outer_wrapper_width / 3.05, //based on the 270px to 795px ratio of the adjusted elements' width to the '#outer_wrapper' div's in the maximized Chrome browser
                            shw_prvws_width = outer_wrapper_width / 4.91, //based on the 162px to 795px ratio of a '.show_prevs' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            shw_prvws_pos = outer_wrapper_width / 7.64, //based on the 104px to 795px ratio of a '.show_prevs' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            a_prvws_wrapper_height = outer_wrapper_width / 2.966, //based on the 268px to 795px ratio of a '.album_preview' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            prevs_div_height = outer_wrapper_width / 3.34, //based on the 238px to 795px ratio of a '.previews_available' element width to the '#outer_wrapper' div's in the maximized Chrome browser

                            no_cvr_msg_width = outer_wrapper_width / 3.7, //based on the 215px to 795px ratio of a '.no_cover_message' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            no_cvr_msg_pos = outer_wrapper_width / 24.1, //based on the 33px to 795px ratio of a '.no_cover_message' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            no_cvr_msg_font = outer_wrapper_width / 33.125, //based on the 24px to 795px ratio of a '.no_cover_message' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            prvw_img_dimensions = outer_wrapper_width / 13.55, //based on the 60px to 795px ratio of a '.a_preview_img' element width to the '#outer_wrapper' div's in the maximized Chrome browser
                            prvw_img_r_margin = outer_wrapper_width / 162, //based on 5px:795px
                            prvw_img_b_margin = outer_wrapper_width / 36.3, //based on 22px:795px
                            img_dimensions = outer_wrapper_width / ($('#outer_wrapper').hasClass('selected_album_wrapper') ? 3.5 : 2.94); //based on the 227px/270px to 795px ratio of an album/album group image (on 'public_index.php') width to the '#outer_wrapper' div's in the maximized Chrome browser

                    $('.public_unit_img').css({'width': img_dimensions, 'height': img_dimensions});
                    $('#unit_wrapper').css('min-height', (2 * img_dimensions) + (outer_wrapper_width / 19.7)); //(795/40 = 19.7); the 40 is for a little padding at the bottom
                    $('#unit_info').css('width', outer_wrapper_width / 2.2); //based on the 405px to 795px ratio of the '#unit_info' div width to the '#outer_wrapper' div's in the maximized Chrome browser
                    $('.album_preview').css('height', a_prvws_wrapper_height);
                    $('.previews_available, .no_previews').css('height', prevs_div_height);
                    $('.a_preview_img').css({'width': prvw_img_dimensions, 'height': prvw_img_dimensions, 'margin-right': prvw_img_r_margin, 'margin-bottom': prvw_img_b_margin});
                    $('.absolute_pos.name, .absolute_pos.date_owner').css('width', nm_dt_ownr_width);
                    $('.absolute_pos.show_prevs').css({'width': shw_prvws_width, 'left': shw_prvws_pos});
                    $('.absolute_pos.no_cover_message').css({'width': no_cvr_msg_width, 'left': no_cvr_msg_pos, 'font-size': no_cvr_msg_font});
                }, writable: true, enumerable: true, configurable: true
            });

//Global variable for storing a '#on_display_gallery_img' image's natural width as set and obtained in the markup loaded from the server, used to calculate the scalling ratio (with respect to the '.centering' div's width in a maximized Chrome browser) for the image
    Object.defineProperty(Object.prototype.westerb_sal,
            'on_display_img_natural_width', {// Define Object.prototype.westerb_sal.on_display_img_natural_width
                value: 0, writable: true, enumerable: true, configurable: false
            });

//Used in repositioning the '#gallery_thumbs_wrapper' div
    Object.defineProperty(Object.prototype.westerb_sal,
            'on_display_img_natural_height', {// Define Object.prototype.westerb_sal.on_display_img_natural_height
                value: 0, writable: true, enumerable: true, configurable: false
            });

//Helper function for recalibrating elements on 'public_index.php' when "the gallery" is on display, as the browser scales
    Object.defineProperty(Object.prototype.westerb_sal,
            'readjust_gallery_elems', {// Define Object.prototype.westerb_sal.readjust_gallery_elems
                value: function() {//console.log('readjust_gallery_elems() runs');
                    var outer_wrapper = $('#outer_wrapper'), centering_div = $('div.centering:last'), centering_div_width = centering_div.innerWidth(),
                            thumbs_wrapper = $('#gallery_thumbs_wrapper'), /*thumbs_dimensions = centering_div_width/10.66,*/ //based on the 109px to 1162px ratio of a '.gallery_thumb' image width to the '.centering' div's in the maximized Chrome browser
                            on_display_img = $('#on_display_gallery_img'), adjusted_on_display_img_width = centering_div_width / (1162 / westerb_sal.on_display_img_natural_width),
                            txt_inpt_width = centering_div_width / 7.2, //based on the 185px to 1162px ratio of the input element's width to the '.centering' div's in the maximized Chrome browser
                            font_resize_elems = $('#post_comment #author.char_counter, #post_comment input[name=submit], #post_comment #comment.field_msg'),
                            u_info_elems = $('#loaded_info, #photo_info'), no_unt_dt_elems = $('#loaded_info .no_unit_data'),
                            p_info_elem_h = parseInt($('#photo_info').css('height'), 10), on_display_img_h = (westerb_sal.on_display_img_natural_height * centering_div_width) / 1162;
                    //console.log(p_info_elem_h);
                    if (westerb_sal.on_display_img_natural_width < 340)
                        on_display_img.css('width', 340); //if the image's natural width is already below the '#outer_wrapper' div's 340 min-width, increase it to 340px and maintain it there
                    else {
                        on_display_img.css('width', adjusted_on_display_img_width);
                        if (parseInt(on_display_img.css('width'), 10) < 340)
                            on_display_img.css('width', 340); //if, while scaling, the image's calculated width drops below the '#outer_wrapper' div's 340 min-width, increase it and maintain it at 340px
                    }
                    $('#unit_info').css('width', centering_div_width / 3.32); //based on the 350px to 1162px ratio of the '#unit_info' element's width to the '.centering' div's in the maximized Chrome browser
                    $('#post_comment input[name=submit]').css({'margin-left': centering_div_width / 46.48/*, 'padding': centering_div_width/387.33*/}); //based on the 25px/3px to 1162px ratio of the input element's left margin/padding to the '.centering' div's in the maximized Chrome browser
                    $('#post_comment input[name=author]').css({'width': txt_inpt_width, 'min-width': txt_inpt_width});
                    //$('#post_comment #comment.char_counter').css('left', centering_div_width/4.4); //based on the 273px to 1162px ratio of the character counter span element's left offset to the '.centering' div's in the maximized Chrome browser

                    if (centering_div_width < 910) {
                        font_resize_elems.css('font-size', '12px');
                        no_unt_dt_elems.css('font-size', '13px');
                    }
                    else {
                        font_resize_elems.css('font-size', (font_resize_elems.eq(2).hasClass('error_msg') || font_resize_elems.eq(2).hasClass('notice_msg')) ? '13px' : '16px');
                        no_unt_dt_elems.css('font-size', '14px');
                    }
                    if (centering_div_width < 1140 && u_info_elems.eq(0).css('max-height') != '430px')
                        u_info_elems.css('max-height', '-=65'); //prevents the '#unit_info' div from overlapping with the '#gallery_thumbs_wrapper' div as the window scales
                    else if (centering_div_width > 1140 && u_info_elems.eq(0).css('max-height') != '495px')
                        u_info_elems.css('max-height', '+=65');
                    //$('img.gallery_thumb').css({'width':thumbs_dimensions, 'height': thumbs_dimensions});
                    outer_wrapper.css('margin-left', (centering_div_width - (outer_wrapper.innerWidth() + $('#unit_info').innerWidth())) / 2);
                    thumbs_wrapper.css('margin-left', (centering_div_width - thumbs_wrapper.innerWidth()) / 2);
                    if ($('#u_count').text() != '') {
                        if (p_info_elem_h < 335 && on_display_img_h < 355 && parseInt(on_display_img.css('height')) > 370 && centering_div_width < 710)
                            centering_div.css('min-height', '630px');
                        else if (p_info_elem_h < 335 && on_display_img_h < 355)
                            centering_div.css('min-height', '560px'); //from 590
                        else if (p_info_elem_h < 375) {
                            if (on_display_img_h < 435)
                                centering_div.css('min-height', '630px'); //from 600
                            else if (on_display_img_h < 475)
                                centering_div.css('min-height', '670px'); //from 700
                            else
                                centering_div.css('min-height', (48/*'#title' height*/ + 10/*account for image's border width*/ + on_display_img_h + 100/*account for the '.for_margin_div'*/ + 30/*the "padding" between the image and the thumbs wrapper*/) + 'px'); //only the image's height is now the determining parameter
                        }
                        else if (p_info_elem_h < 415) {
                            if (on_display_img_h < 475)
                                centering_div.css('min-height', '670px'); //from 700
                            else if (on_display_img_h < 520)
                                centering_div.css('min-height', '700px'); //from 730
                            else
                                centering_div.css('min-height', (48/*'#title' height*/ + 10/*account for image's border width*/ + on_display_img_h + 100/*account for the '.for_margin_div'*/ + 30/*the "padding" between the image and the thumbs wrapper*/) + 'px'); //only the image's height is now the determining parameter
                        }
                        else if (p_info_elem_h < 460) {
                            if (on_display_img_h < 520)
                                centering_div.css('min-height', '700px'); //from 730
                            if (on_display_img_h < 555)
                                centering_div.css('min-height', '720px'); //from 750
                            else
                                centering_div.css('min-height', (48/*'#title' height*/ + 10/*account for image's border width*/ + on_display_img_h + 100/*account for the '.for_margin_div'*/ + 30/*the "padding" between the image and the thumbs wrapper*/) + 'px'); //only the image's height is now the determining parameter
                        }
                        else if (p_info_elem_h < 500) { //at this point the '#photo_info' div ceases to be a factor as it's max-height is 495px
                            if (on_display_img_h < 555)
                                centering_div.css('min-height', '750px'); //from 780
                            else
                                centering_div.css('min-height', (48/*'#title' height*/ + 10/*account for image's border width*/ + on_display_img_h + 100/*account for the '.for_margin_div'*/ + 30/*the "padding" between the image and the thumbs wrapper*/) + 'px'); //only the image's height is now the determining parameter
                        }
                    }
                }, writable: true, enumerable: true, configurable: true
            });

//Helper function for repositioning a modal dialog box while it's being displayed
    Object.defineProperty(Object.prototype.westerb_sal,
            'reposition_modal_box', {// Define Object.prototype.westerb_sal.reposition_modal_box
                value: function() {
                    var box = $('#modal_dialog');
                    box.parent('div').css({'top': ((window.innerHeight - (parseInt(box.css('height'), 10))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(box.css('width'), 10))) / 2) + westerb_sal.getScrollOffsets().x});
                }, writable: true, enumerable: true, configurable: true
            });

    Object.defineProperty(Object.prototype.westerb_sal,
            'prompt_login', {// Define Object.prototype.westerb_sal.prompt_login
                value: function() {

                    $('#main_ui_msg_dialog_wrapper').remove(); //in the off chance that the 'main_ui_dialog_msg' is displayed, remove it first

                    westerb_sal.blocking_login_dialog = westerb_sal.blocking_dialog = true;

                    $('body').append("<div class='login_dialog' id='login_prompt_wrapper' style='position: absolute; max-width: 700px; border: 5px dotted rgba(29, 29, 29, .8); background-color: rgba(35, 197, 197, .65); padding: 2px; border-radius: 5px; z-index: 5001; '><div class='login_dialog' id='login_prompt_dialog' style='background-color: rgba(245, 245, 245, .9); padding: 10px 15px 15px; box-sizing: border-box; '></div></div>");
                    var content = "<div class='login_dialog' style='color: #333; font-weight: bold; font-size: 13px; line-height: 18px; '>You appear to be logged out. Please sign in to continue browsing The S<span class='a'>a</span><span class='l'>l</span><span class='o'>o</span><span class='n'>n</span> Admin area</div>";
                    content += "<form id='login_form' class='modal_dialog big_form' action='" +
                            westerb_sal.HOME + "admin/login.php' method='post'>" +
                            "<p><span class='label' id='for_username'>Username</span><input class='" +
                            "p_holder has_pword form_field validate_on_sub reqrd msg_span' " +
                            "type='text' name='username' value='' maxlength='50'></p>" +
                            "<p class='pass_text'><span class='label'>Password</span><input " +
                            "class='form_field reqrd validate_on_sub' " +
                            "type='password' name='password' value='' maxlength='40'>" +
                            "<input class='form_field msg_span' type='text' value='' name='" +
                            "password_placeholder' maxlength='40'></p>" +
                            "<div><input id='login' class='form_field ui_button' type='submit' name='submit' " +
                            "value='LOGIN'><div id='modal_processing_msg' style='position: absolute; top: " +
                            "8px; left: 85px; width: 125px; color: #333; font-weight: bold; '></div><div " +
                            "id='msg_wrapper' style='position: absolute; top: 6px; left: 200px; width: 440px; " +
                            "z-index: 100; '></div></div></form>" +
                            "<script src='" + westerb_sal.HOME + "js/includes/form_min.js'></script>";

                    var box = $('#login_prompt_dialog');
                    box.parent('div').css('visibility', 'hidden');
                    box.html(content);
                    box.parent('div').css({'top': ((window.innerHeight - (parseInt(box.css('height'), 10))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(box.css('width'), 10))) / 2) + westerb_sal.getScrollOffsets().x}).hide().css('visibility', 'visible').fadeIn(200);

                    $(document).scroll(westerb_sal.reposition_modal_box);
                    $(window).resize(westerb_sal.reposition_modal_box);
                }, writable: false, enumerable: true, configurable: true
            });

//Helper function for checking the user's login status
    Object.defineProperty(Object.prototype.westerb_sal,
            'check_login', {// Define Object.prototype.westerb_sal.check_login
                value: function() {
                    $.get(westerb_sal.HOME + 'ajax/misc_calls.php', 'is_logged_in', function(responseText, $_status, xhr) {
                        westerb_sal.is_logged_in = $.trim(responseText) === 'true' ? true : false;
                        if (!westerb_sal.is_logged_in && !westerb_sal.blocking_login_dialog &&
                                westerb_sal.cur_pg !== 'public_index' && westerb_sal.cur_pg !== 'login') //no need to prompt login if the user is on the public area or is alredy on the login page
                            westerb_sal.prompt_login();
                        else if (westerb_sal.is_logged_in && westerb_sal.blocking_login_dialog) { //if the user signs in on another tab, for example, while the 'login_prompt' is already being displayed and enforced on another, there's no longer the need to do so
                            $('#login_prompt_dialog').parent('div').remove();
                            $(document).unbind('scroll', westerb_sal.reposition_modal_box);
                            $(window).unbind('resize', westerb_sal.reposition_modal_box);
                            westerb_sal.blocking_login_dialog = westerb_sal.blocking_dialog = false;
                        }
                    });
                }, writable: true, enumerable: true, configurable: true
            });

//Global variable for storing the reference to the 6000ms-timer set after the user has logged in, for calling 'westerb_sal.check_login()', to be cleared on logout
    Object.defineProperty(Object.prototype.westerb_sal,
            'check_login_timer', // Define Object.prototype.westerb_sal.check_login_timer
            {writable: true, enumerable: true, configurable: true, value: null});

//Check status at every page refresh
    westerb_sal.check_login();
//Wait 1000ms for the server to make the login check, and if the user is logged in, kickoff the regular login status checking, otherwise a simple page refresh would be enough to bypass the whole thing
    window.setTimeout(function() {
        if (westerb_sal.is_logged_in)
            westerb_sal.check_login_timer = window.setInterval(westerb_sal.check_login, 6000); //Check login status every 6000ms, and store the timer reference so that it can be cleared on logout
    }, 1000);

    jQuery.ajaxSetup({
        timeout: 20000 // abort all Ajax requests after 15 seconds
                //cache: false // defeat browser cache by adding a timestamp to the URL
    });

    $(".hover_triggered").hide(); //hide all elements whose display is going to be triggered by 'hover_triggers'

    /*
     * Add a nonenumerable extend() method to Object.prototype.westerb_sal.
     * This method extends the object on which it is called by copying properties
     * from the object passed as its argument. All property attributes are
     * copied, not just the property value. All own properties (even non-
     * enumerable ones) of the argument object are copied unless a property
     * with the same name already exists in the target object.
     */
    Object.defineProperty(Object.prototype.westerb_sal,
            'extend', // Define Object.prototype.westerb_sal.extend
            {writable: true, enumerable: true, configurable: true,
                value: function(o) { // Get all own props, even nonenumerable ones
                    var names = Object.getOwnPropertyNames(o);
                    // Loop through them
                    for (var i = 0; i < names.length; i++) {
                        // Skip props already in this object
                        if (names[i] in this)
                            continue;
                        // Get property description from o
                        var desc = Object.getOwnPropertyDescriptor(o, names[i]);
                        // Use it to create property on this
                        Object.defineProperty(this, names[i], desc);
                    }
                }
            });

//Helper function for repositioning (centering it) the main processing message div element right before the message is displayed
    Object.defineProperty(Object.prototype.westerb_sal,
            'reposition_main_p_msg', // Define Object.prototype.westerb_sal.reposition_main_p_msg
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    var main_p_msg = $('#main_processing_msg');
                    main_p_msg.css({'top': ((window.innerHeight - (parseInt(main_p_msg.css('height'), 10))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(main_p_msg.css('width'), 10))) / 2) + westerb_sal.getScrollOffsets().x});
                }
            });

    $('body').append("<div id='main_processing_msg' class='hash_change_removable' style='width: 210px; height: 40px; position: absolute; font-weight: bold; z-index: -1; '></div>");
    var main_p_msg = $('#main_processing_msg');
    main_p_msg.css({'top': ((window.innerHeight - (parseInt(main_p_msg.css('height'), 10))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(main_p_msg.css('width'), 10))) / 2) + westerb_sal.getScrollOffsets().x});

    $(window).resize(westerb_sal.reposition_main_p_msg);

//Helper function for POSTing multipart/form-data request bodies in browsers that support the XHR2 FormData object
    if (typeof FormData !== 'undefined') {
        Object.defineProperty(Object.prototype.westerb_sal,
                'post_FormData', // Define Object.prototype.westerb_sal.post_FormData
                {writable: false, enumerable: true, configurable: true,
                    value: function(xhr) {
                        var formdata = new FormData(), this_field;
                        for (var name in westerb_sal.form.fields) {
                            this_field = westerb_sal.form.fields[name];
                            if (name === 'submit')
                                continue; //irrelevant here
                            var value = this_field.val();
                            if (this_field.attr('type') === 'file') { //for File types, the value ought to be the corresponding File object-- not the value of the value property
                                value = this_field.prop('files')[0]; //assuming a sigle file upload
                            }
                            if (this_field.hasClass('radios')) { //if the 'field' represents a group of radio buttons
                                westerb_sal.form[name].forEach(function(e, i, a) { //check in the array (which is a property of the Form instance, bearing the same name as the value of the name attribute of this radios 'field') storing this group of radio butons
                                    if (e.is(':checked')) {
                                        name = e.attr('name');
                                        value = e.val();
                                    }
                                })
                            }
                            formdata.append(name, value); //add name/value as one part
                        }
                        //send the name/value pairs in a multipart/form-data request body. Each
                        //pair is one part of the request. Note that send automatically sets
                        //the Content-Type header when you pass it a FormData object
                        xhr.send(formdata);
                    }
                });
    }

//Helper function for generating pseudo random numbers between 1 and a provide max value
    Object.defineProperty(Object.prototype.westerb_sal,
            'rand', // Define Object.prototype.westerb_sal.rand
            {writable: false, enumerable: true, configurable: true,
                value: function(max) {
                    if (!max)
                        max = 5;
                    return Math.ceil(Math.random() * max);
                }
            });

//Helper function for reading url parameter values
    Object.defineProperty(Object.prototype.westerb_sal,
            'get_url_param_value', // Define Object.prototype.westerb_sal.get_url_param_value
            {writable: false, enumerable: true, configurable: true,
                value: function(param_name) {
                    var query_str = window.location.search.slice(1), param_value_pairs = query_str.split('&'),
                            this_param_value_pair = param_val = null;
                    param_value_pairs.forEach(function(e, i, a) {
                        this_param_value_pair = e.split('=');
                        if (this_param_value_pair[0] === param_name)
                            param_val = this_param_value_pair[1];
                    })
                    return param_val; //if, after the iteration above, no 'param_name' parameter is found in the query portion of the URL, the function will return NULL as the variable was initiated
                }
            });

//Helper function for creating new instances of the XMLHTTPRequest object
    Object.defineProperty(Object.prototype.westerb_sal,
            'create_xhr', // Define Object.prototype.westerb_sal.create_xhr
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    if (XMLHttpRequest)
                        return new XMLHttpRequest;
                    else {
                        try { // Use the latest version of the ActiveX object if available
                            return new ActiveXObject('Msxml2.XMLHTTP.6.0');
                        } catch (e1) {
                            try { // Otherwise fall back on an older version
                                return new ActiveXObject('Msxml2.XMLHTTP.3.0');
                            } catch (e2) { // Otherwise, throw an error
                                throw new Error('An error occurred: XMLHttpRequest is not supported  by this browser');
                            }
                        }
                    }
                }
            });

//Helper function for putting the browers into full screen (equivalent to pressing the F11 key on Windows)
//(a specific element can be provided, and that will be displayed in full screen, else the body element will.)
//the body element will also be put to full screen regardless of the element provided in browsers that don't support full screen mode for individual elements (e.g IE < 10)
    Object.defineProperty(Object.prototype.westerb_sal,
            'full_screen_mode', // Define Object.prototype.westerb_sal.full_screen_mode
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    var elem = $('#body').get(0);
                    var fs = elem.requestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullScreen ||
                            elem.msRequestFullScreen || elem.oRequestFullScreen;
                    if (fs)
                        fs.call(elem);
                    else if (window.ActiveXObject) {
                        try {
                            var wscript = new ActiveXObject('WScript.Shell');
                            wscript.SendKeys('{F11}');
                            alert('a_x');
                        } catch (e) { /*alert(e.toString())*/
                        } //The user's security settings are preventing full screen access; they have to manually press the F11 key
                    }
                }
            });

//Helper function for putting the browers out of full screen mode
    Object.defineProperty(Object.prototype.westerb_sal,
            'exit_full_screen_mode', // Define Object.prototype.westerb_sal.exit_full_screen_mode
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    var e_fs = document.exitFullscreen || document.cancelFullscreen || document.mozCancelFullScreen ||
                            document.webkitCancelFullScreen || document.msCancelFullScreen || document.oCancelFullScreen;
                    if (e_fs)
                        e_fs.call(document);
//    else if(window.ActiveXObject) {
//        try{
//            var wscript = new ActiveXObject('WScript.Shell');
//            wscript.SendKeys('{F11}');alert('a_x');
//        } catch(e) { /*alert(e.toString())*/ } //The user's security settings are preventing full screen access; they have to manually press the F11 key
//    }
                }
            });

//Helper function for checking if the browers is in full screen mode
    Object.defineProperty(Object.prototype.westerb_sal,
            'is_full_screen', // Define Object.prototype.westerb_sal.is_full_screen
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    return document.fullScreen || document.mozfullScreen || document.webkitIsFullScreen ||
                            window.fullScreen;
                }
            });
//Helper function for logging Guest actions during simulations that don't go to the server
    Object.defineProperty(Object.prototype.westerb_sal,
            'log_action', // Define Object.prototype.westerb_sal.log_action
            {writable: false, enumerable: true, configurable: true,
                value: function(action) {
                    $.get(westerb_sal.HOME + 'ajax/misc_calls.php', {'log_action': action});
                }
            });

//Helper function for counting remaining characters while typing in form text fields that have a "maxlength" attribute set
    Object.defineProperty(Object.prototype.westerb_sal,
            'count', // Define Object.prototype.westerb_sal.count
            {writable: false, enumerable: true, configurable: true,
                value: function(e) {
                    txt_len = $(this).val().length;
                    if (txt_len > e.data.max_len) {
                        $(this).val($(this).val().substring(0, e.data.max_len));
                        txt_len = e.data.max_len;
                    }
                    $(this).siblings("div").children("span").text(e.data.max_len - txt_len);
                }
            });

//Global variable for temporarily storing references to timers set by 'Element.processing_msg()'
    Object.defineProperty(Object.prototype.westerb_sal,
            'p_timers', // Define Object.prototype.westerb_sal.p_timers
            {writable: true, enumerable: true, configurable: true, value: []
            });

//Helper function for alerting the user of ongoing process
    Object.defineProperty(Element.prototype,
            'processing_msg', // Define Element.prototype.processing_msg
            {writable: false, enumerable: true, configurable: true,
                value: function(msg) {
                    if (!msg)
                        msg = ''; //if no specific message is provided, only the ellipsis will be shown and animated
                    var elem = $(this); //wrap in jQuery for more convenient API
                    elem.html(msg);
                    westerb_sal.p_timers[0] = window.setTimeout(function() {
                        elem.append("<span id=\"b_dot\" class=\"processing_ellipsis\">&bull;</span>")
                    }, 200);
                    westerb_sal.p_timers[1] = window.setTimeout(function() {
                        elem.append("<span id=\"r_dot\" class=\"processing_ellipsis\">&bull;</span>")
                    }, 420);
                    westerb_sal.p_timers[2] = window.setTimeout(function() {
                        elem.append("<span id=\"y_dot\" class=\"processing_ellipsis\">&bull;</span>")
                    }, 670);
                    westerb_sal.p_timers[3] = window.setTimeout(function() {
                        elem.append("<span id=\"g_dot\" class=\"processing_ellipsis\">&bull;</span>")
                    }, 920);
                    westerb_sal.p_timers[4] = window.setTimeout(function() {
                        elem.get(0).processing_msg(msg)
                    }, 1120); //animate by calling recursively
                }
            });

//Helper function for preventing further animation of the 'processing message'
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_p_timers', // Define Object.prototype.westerb_sal.clear_p_timers
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    for (i = 0, len = westerb_sal.p_timers.length; i < len; i++)
                        window.clearTimeout(westerb_sal.p_timers[i]);
                }
            });

//Helper function for checking pre-existence of a prop in objects,
//but only if there isn't a native method with the same name
    Object.defineProperty(Object.prototype.westerb_sal,
            'prop_exists', // Define Object.prototype.westerb_sal.prop_exists
            {writable: false, enumerable: true, configurable: true,
                value: function(p_name) {
                    return this[p_name] ? true : false;
                }
            });

//Helper function for setting 'page objects' for storing the main navigation 'set' states on different pages
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_page', // Define Object.prototype.westerb_sal.store_page
            {writable: false, enumerable: true, configurable: true,
                value: function(p_name, val) {
                    sessionStorage.setItem(p_name, JSON.stringify(val));
                }
            });

//session-store objects that will hold the navigational 'set states' in different pages
    if (!sessionStorage.getItem('public_index'))
        westerb_sal.store_page('public_index', Object.create(null));
    if (!sessionStorage.getItem('list_albums'))
        westerb_sal.store_page('list_albums', Object.create(null));
    if (!sessionStorage.getItem('list_photos'))
        westerb_sal.store_page('list_photos', Object.create(null));

//Helper function for storing the main navigation 'set' states, stored in the 'current page' object as created once per page by, e.g, 'westerb_sal.store_page('public_index', Object.create(null))' for the 'public_index' page
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_set', // Define Object.prototype.westerb_sal.store_set
            {writable: false, enumerable: true, configurable: true,
                value: function(s_name, s_val) {
                    var o = JSON.parse(sessionStorage.getItem(westerb_sal.cur_pg)) //destringify the current page object value
                    Object.defineProperty(o, s_name, {writable: true, enumerable: true, configurable: true, value: s_val});
                    westerb_sal.store_page(westerb_sal.cur_pg, o) //re-store the object that represents the page state
                }
            });

//Helper function for retrieving the main navigation 'set' states
    Object.defineProperty(Object.prototype.westerb_sal,
            'retrieve_set', // Define Object.prototype.westerb_sal.retrieve_set
            {writable: false, enumerable: true, configurable: true,
                value: function(s_name) {
                    return JSON.parse(sessionStorage.getItem(westerb_sal.cur_pg))[s_name]; //destringify the current page object value and access and return the set
                }
            });

//Helper function for deleting/forgetting the main navigation 'set' states; if no particular page is passed in the argument, the sets held in the object for the current page will be cleared
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_sets', // Define Object.prototype.westerb_sal.clear_sets
            {writable: false, enumerable: true, configurable: true,
                value: function(pg_name) {
                    if (!pg_name)
                        pg_name = westerb_sal.cur_pg;
                    sessionStorage.setItem(pg_name, JSON.stringify(Object.create(null)));
                }
            });

//Helper function for deleting/forgetting the a specific main navigation 'set' state; if no particular "set name" is passed in the argument, the current set will be cleared
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_set', // Define Object.prototype.westerb_sal.clear_set
            {writable: false, enumerable: true, configurable: true,
                value: function(s_name) {
                    if (!s_name)
                        s_name = westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set;
                    westerb_sal.store_set(s_name, ''); //restore the set with the falsy value of empty string
                }
            });

//alert(new Date().getMilliseconds())
//Helper function for storing the state of a given 'outer_wrapper' div which wraps all other elements of a set of album/a set of photos/a selected photo, so that it can be restored as needed
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_outer_wrapper_state', // Define Object.prototype.westerb_sal.store_outer_wrapper_state
            {writable: false, enumerable: true, configurable: true,
                value: function(o_w_s_name, o_w_s_val) {
//    if(o_w_s_val) {
//        console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The clicked/selected album\'s o_w_s is being stored with the name: '+o_w_s_name+', and the markup: \n'+o_w_s_val);
//    }
                    if (!o_w_s_val) {
                        $('.hover_triggered').hide(); //hide the 'hover_triggered' elements of the clicked album that must have shown before storing the state
                        $('.album_preview').css({'width': 0, 'display': 'none'}); //also hide any album previews that might be open, otherwise it'd just look weird everytime the 'outer_wrapper' state for the album group is restored
                        o_w_s_val = $('.centering:last').html();
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The current album group\'s o_w_s is being stored with the name: '+o_w_s_name+', and the markup: \n'+o_w_s_val);
                    }
                    sessionStorage.setItem(o_w_s_name, o_w_s_val);
                }
            });

//Helper function for retrieving the state of a given 'outer_wrapper' div for restoration
    Object.defineProperty(Object.prototype.westerb_sal,
            'retrieve_outer_wrapper_state', // Define Object.prototype.westerb_sal.retrieve_outer_wrapper_state
            {writable: false, enumerable: true, configurable: true,
                value: function(st_name) {
                    return sessionStorage.getItem(st_name);
                }
            });

//Helper function for deleting/forgetting the state of a given 'outer_wrapper' div, which might be the need when the user posts a new comment, for example
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_outer_wrapper_state', // Define Object.prototype.westerb_sal.clear_outer_wrapper_state
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    //////////////////////////////////////////////////////////////
                    ////////////////sessionStorage.removeItem('list_photos_pc_id='+p_id);
                }
            });

//Helper function for storing the state of a given '#main' div which wraps all other visible elements of a page, bar the header and footer
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_main_page_state', // Define Object.prototype.westerb_sal.store_main_page_state
            {writable: false, enumerable: true, configurable: true,
                value: function(p_name, p_val) {
                    sessionStorage.setItem(p_name, JSON.stringify(p_val));
                }
            });

//Helper function for retrieving the state of a given '#main' div for restoration
    Object.defineProperty(Object.prototype.westerb_sal,
            'retrieve_main_page_state', // Define Object.prototype.westerb_sal.retrieve_main_page_state
            {writable: false, enumerable: true, configurable: true,
                value: function(p_name) {
                    var s = sessionStorage.getItem(p_name)
                    return typeof s === 'string' ? JSON.parse(s) : null; //destringify and return the html string
                }
            });

//Helper function for deleting/forgetting the state of a given '#main' div, which might be the need when certain visual updates following certain actions (like deleting albums/photos/comments) are made, for example
//if the page name is not provided, the current page's #main' div state-- according to the hash value in the URL-- is cleared
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_main_page_state', // Define Object.prototype.westerb_sal.clear_main_page_state
            {writable: false, enumerable: true, configurable: true,
                value: function(p_name) {
                    if (!p_name)
                        p_name = window.location.hash;
                    sessionStorage.removeItem(p_name);
                }
            });

//Helper function for storing comments of a specific photo
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_comments', // Define Object.prototype.westerb_sal.store_comments
            {writable: false, enumerable: true, configurable: true,
                value: function(c_name, c_val) {
                    sessionStorage.setItem(c_name, JSON.stringify(c_val));
                }
            });

//Helper function for storing comments of a specific photo
    Object.defineProperty(Object.prototype.westerb_sal,
            'retrieve_comments', // Define Object.prototype.westerb_sal.store_comments
            {writable: false, enumerable: true, configurable: true,
                value: function(c_name) {
                    var s = sessionStorage.getItem(c_name)
                    return typeof s === "string" ? JSON.parse(s) : null; //destringify and return the html string
                }
            });

//Helper function for deleting/forgetting the main navigation 'set' states
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_comments', // Define Object.prototype.westerb_sal.clear_comments
            {writable: false, enumerable: true, configurable: true,
                value: function(p_id) {
                    sessionStorage.removeItem('list_photos_pc_id=' + p_id);
                }
            });

//Helper function for storing the albums of a specific owner on 'list_albums.php'
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_albums', // Define Object.prototype.westerb_sal.store_albums
            {writable: false, enumerable: true, configurable: true,
                value: function(name, val) {
                    sessionStorage.setItem(name, JSON.stringify(val));
                }
            });

//Helper function for getting the albums of a specific owner on 'list_albums.php'
    Object.defineProperty(Object.prototype.westerb_sal,
            'retrieve_albums', // Define Object.prototype.westerb_sal.retrieve_albums
            {writable: false, enumerable: true, configurable: true,
                value: function(name) {
                    var s = sessionStorage.getItem(name)
                    return typeof s === "string" ? JSON.parse(s) : null; //destringify and return the html string
                }
            });

//Helper function for deleting/forgetting the albums of a specific owner on 'list_albums.php'
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_albums', // Define Object.prototype.westerb_sal.clear_albums
            {writable: false, enumerable: true, configurable: true,
                value: function(ao_id) {
                    sessionStorage.removeItem('list_albums_ao_id=' + ao_id);
                }
            });

//Helper function for storing comments of a specific photo
    Object.defineProperty(Object.prototype.westerb_sal,
            'store_notes', // Define Object.prototype.westerb_sal.store_notes
            {writable: false, enumerable: true, configurable: true,
                value: function(name, val) {
                    sessionStorage.setItem(name, JSON.stringify(val));
                }
            });

//Helper function for storing comments of a specific photo
    Object.defineProperty(Object.prototype.westerb_sal,
            'retrieve_notes', // Define Object.prototype.westerb_sal.retrieve_notes
            {writable: false, enumerable: true, configurable: true,
                value: function(name) {
                    var s = sessionStorage.getItem(name)
                    return typeof s === "string" ? JSON.parse(s) : null; //destringify and return the html string
                }
            });

//Helper function for deleting/forgetting the main navigation 'set' states
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_notes', // Define Object.prototype.westerb_sal.clear_notes
            {writable: false, enumerable: true, configurable: true,
                value: function(a_id) {
                    sessionStorage.removeItem('list_albums_an_id=' + a_id);
                }
            });

//Global variable for keeping references to the most recent Timeout for removing UI messages, so they can easily be cleared
    Object.defineProperty(Object.prototype.westerb_sal,
            'msg_remove_timer', // Define Object.prototype.westerb_sal.msg_remove_timer
            {writable: true, enumerable: true, configurable: true, value: false});

//The general helper function for displaying UI messages
    Object.defineProperty(Object.prototype.westerb_sal,
            'display_msg', // Define Object.prototype.westerb_sal.display_msg
            {writable: false, enumerable: true, configurable: true,
                value: function(msg, type, duration, modal) { //REVISIT THE modal ARGUMENT IDEA
                    window.clearTimeout(westerb_sal.msg_remove_timer);
                    $('div.message_wrapper').remove() //start by removing any message that was there
                    if (!msg)
                        msg = 'Something went wrong. Refresh the page and try again.';
                    if (!type)
                        type = 'error';
                    if (!duration)
                        duration = 4000;
                    var slide_progress = false, slide_progress_elem = $('#upload_progress_percent');
                    if ((westerb_sal.cur_pg === 'photo_upload' || window.location.hash === '#photo_upload') && westerb_sal.progress_events)
                        slide_progress = true;
                    if (slide_progress) {
                        var i = 0;
                        function slide_progress_down() {
                            if (i === 0) {
                                slide_progress_elem.css('top', '85px');
                                i++;
                            }
                            slide_progress_elem.css('top', (parseInt(slide_progress_elem.css('top'), 10) + 5) + 'px');
                            if (parseInt(slide_progress_elem.css('top'), 10) < 135)
                                window.setTimeout(slide_progress_down, 0);
                        }

                        function slide_progress_up() {
                            slide_progress_elem.css('top', (parseInt(slide_progress_elem.css('top'), 10) - 5) + 'px');
                            if (parseInt(slide_progress_elem.css('top'), 10) > 85)
                                window.setTimeout(slide_progress_up, 0);
                        }
                    }
                    $(document).scrollTop(0);
                    $('#main h2:first').after("<div style='display: none; " + (westerb_sal.cur_pg === 'public_index' ? 'line-height: 15px; ' : '') + (westerb_sal.cur_pg === 'photo_upload' ? 'margin-bottom: 12px; ' : (westerb_sal.cur_pg === 'public_index' ? 'margin-bottom: 10px; ' : '')) + "z-index: 1000;' class='message_wrapper'><div class='alertBox " + type + "'>" + msg + "</div></div>");
                    if (slide_progress)
                        slide_progress_down();
                    $('div.message_wrapper').slideDown(300);
                    westerb_sal.msg_remove_timer = window.setTimeout(function() {
                        if (slide_progress)
                            slide_progress_up();
                        $('div.message_wrapper').slideUp(300, function() {
                            $(this).remove()
                        });
                    }, duration + 300);
                    westerb_sal.request_done = true;
                    $('#wait_msg').fadeOut(10, function() {
                        $(this).remove();
                    });
                }
            });

//The general helper function for displaying UI messages in a modal dialog
    Object.defineProperty(Object.prototype.westerb_sal,
            'display_dialog_msg', // Define Object.prototype.westerb_sal.display_dialog_msg
            {writable: false, enumerable: true, configurable: true,
                value: function(msg, type) {
                    westerb_sal.request_done = true;
                    $('#wait_msg').fadeOut(10, function() {
                        $(this).remove();
                    });
                    $('#temp_content_holder').remove(); //remove the temporary div elements in case--which is mostly the case-- the function is invoked after jQuery '.load()' method's response handler function handles a case that's not "success"

                    if (!msg)
                        msg = 'Something went wrong while performing your request. Please refresh the page and try again';
                    if (!type)
                        type = 'error'
                    $('body').append("<div class='main_dialog' id='main_ui_msg_dialog_wrapper' style='position: absolute; max-width: 485px; border: 5px dotted rgba(29, 29, 29, .8); background-color: rgba(" + (type === 'error' ? '162, 25, 31' : (type === 'notice' ? '195, 101, 0' : (type === 'info' ? '35, 197, 197' : '147, 165, 11'))) + ", ." + (type === 'error' ? '7' : '65') + "); padding: 2px; border-radius: 5px; z-index: 5000; '><div class='main_dialog' id='main_ui_msg_dialog' style='background-color: rgba(245, 245, 245, .9); padding: 4px 8px; box-sizing: border-box; '></div></div>");
                    var content = "<div class='main_dialog' style='color: #333; font-weight: bold; font-size: 15px; line-height: 18px; '>" + msg + "</div>";
                    content += "<div class='main_dialog' style='text-align: center; margin: 15px 0 4px; '>";
                    content += "<div id='main_dialog_ok' style='display: inline-block; padding: 10px; ' class='ui_button main_dialog dialog_choice'>ALRIGHT</div>";
                    //content += "<div id='main_dialog_cancel' style='display: inline-block; margin-left: 20px' class='ui_button blocking_dialog dialog_choice'>CANCEL</div>";
                    content += "</div>";

                    var box = $('#main_ui_msg_dialog');
                    box.parent('div').css('visibility', 'hidden');
                    box.html(content);
                    box.parent('div').css({'top': ((window.innerHeight - (parseInt(box.css('height'), 10))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(box.css('width'), 10))) / 2) + westerb_sal.getScrollOffsets().x}).hide().css('visibility', 'visible').fadeIn(200);

                    function reposition_box() {
                        box.parent('div').css({'top': ((window.innerHeight - (parseInt(box.css('height'), 10))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(box.css('width'), 10))) / 2) + westerb_sal.getScrollOffsets().x});
                    }

                    $(document).scroll(westerb_sal.reposition_modal_box);
                    $(window).resize(westerb_sal.reposition_modal_box);

                    function close_box() {
                        box.parent('div').fadeOut(200, function() {
                            $(this).remove();
                        });
                        $('div').not('div.main_dialog').unbind('click', close_box);
                        $(document).unbind('scroll', westerb_sal.reposition_modal_box);
                        $(window).unbind('resize', westerb_sal.reposition_modal_box);
                    }
                    $('.dialog_choice').click(close_box);

                    $('div').not('div.main_dialog').bind('click', close_box);
                }
            });

//Helper function for displaying UI messages within a modal box
    Object.defineProperty(Object.prototype.westerb_sal,
            'display_modal_msg', // Define Object.prototype.westerb_sal.display_modal_msg
            {writable: false, enumerable: true, configurable: true,
                value: function(message, type, duration) {
                    if (!message)
                        message = 'Something went wrong. Refresh the page and try again.';
                    if (!type)
                        type = 'error';
                    if (!duration)
                        duration = 3500;
                    var b_color = color = '';
                    switch (type) {
                        case('error'):
                            b_color = '#F9E5E6';
                            color = '#AA1221';
                            break;
                        case('notice'):
                            b_color = '#F7F0CB';
                            color = '#C46600';
                            break;
                        case('info'):
                            b_color = '#D8ECF5';
                            color = '#2E81A8';
                            break;
                        case('success'):
                            b_color = '#E6F0C2';
                            color = '#967B35';
                            break;
                        default:
                            break;
                    }
                    window.clearTimeout(westerb_sal.msg_remove_timer);
                    $('#msg_wrapper #modal_msg').remove(); //start by removing any message that was already there
                    $('#msg_wrapper').append("<div id='modal_msg' style='position: absolute; padding: 4px; font-weight: bold; background-color: " + b_color + "; color: " + color + "; border-radius: 3px; z-index: 1001;'></div>");
                    $('#modal_msg').hide().text(message).fadeIn(200, function() {
                        westerb_sal.msg_remove_timer = window.setTimeout(function() {
                            $('#modal_msg').fadeOut(200, function() {
                                $(this).remove();
                            })
                        }, duration);
                    });
                    westerb_sal.request_done = true;
                    westerb_sal.form.xhr_in_progress = false;
                }
            });

//UI Helper function for gently asking for user patience in the midst of asynchronous server requests
    Object.defineProperty(Object.prototype.westerb_sal,
            'please_wait_msg', // Define Object.prototype.westerb_sal.please_wait_msg
            {writable: false, enumerable: true, configurable: true,
                value: function(e, modal_dialog) { //if the second argument is passed as "true", the function was invoked from a modal dialog and the element where the message is to be displayed needs to be changed accordingly

                    if (modal_dialog) {
                        $('#msg_wrapper #modal_msg').remove();
                        $('#msg_wrapper').append("<div id='modal_msg' style='position: absolute; padding: 4px; font-weight: bold; background-color: #F7F0CB; color: #C46600; border-radius: 3px; z-index: 1001;'></div>");
                        $('#modal_msg').hide().text('Please wait a moment...').fadeIn(200);
                        window.setTimeout(function() {
                            $('#modal_msg').fadeOut(200, function() {
                                $(this).remove();
                            })
                        }, 2400);
                    }

                    else {
                        if (e.type == 'submit')
                            westerb_sal.display_msg('Please wait a moment...', 'notice', 2400);
                        else {
                            $('#wait_msg').remove();
                            $('body').append("<div id='wait_msg' style='position: absolute; padding: 4px; font-weight: bold; background-color: #F7F0CB; color: #C46600; border-radius: 3px; z-index: 1001;'></div>");
                            $('#wait_msg').css({'top': e.pageY - 7, 'left': e.pageX + 20}).hide().html('Please wait...').fadeIn(200);
                            window.setTimeout(function() {
                                $('#wait_msg').fadeOut(200, function() {
                                    $(this).remove();
                                })
                            }, 1900);
                        }
                    }
                }
            });

    /********************************************
     *Scroll Pagination class for monitoring units
     *called via AJAX while scrolling down the viewport
     *********************************************/
    Object.defineProperty(Object.prototype.westerb_sal,
            'Scroll_Pagination', // Define Object.prototype.westerb_sal.Scroll_Pagination
            {writable: true, enumerable: true, configurable: true,
                value: function() {
                    this.current_set = 1;
                    this.units_per_set = parseInt($('div.u_wrapper').attr('scroll_per_set'), 10);
                    this.unit_count = this.calc_unit_count;
                    this.set_count = this.calc_set_count;
                    this.next_set = this.next_page;
                    this.offset = this.calc_offset;
                }
            });
//extending the Scroll_Pagination class
    Object.defineProperties(westerb_sal.Scroll_Pagination.prototype, {
        next_page: {
            value: function() {
                var next;
                if ((next = this.current_set + 1) > this.set_count())
                    return false;
                return next;
            }, writable: true, enumerable: true, configurable: true
        },
        calc_offset: {
            value: function() {
                return this.units_per_set * (this.current_set - 1);
            }, writable: true, enumerable: true, configurable: true
        },
        calc_unit_count: {
            value: function() {
                if (westerb_sal.cur_pg === 'list_photos')
                    return parseInt($('.clicked').attr('u_count'), 10);
                else if (westerb_sal.cur_pg === 'list_albums')
                    return parseInt($('.clicked_o_name').attr('u_count'), 10);
                else if (westerb_sal.cur_pg === 'public_index')
                    return parseInt($('#c_count').children('span').text(), 10);
            }, writable: true, enumerable: true, configurable: true
        },
        calc_set_count: {
            value: function() {
                return Math.ceil(this.unit_count() / this.units_per_set);
            }, writable: true, enumerable: true, configurable: true
        }
    });

//The general XHR object for getting unit sets with the general pagination object
    Object.defineProperty(Object.prototype.westerb_sal,
            'xhr_for_units', // Define Object.prototype.westerb_sal.xhr_for_units
            {writable: false, enumerable: true, configurable: true, value: westerb_sal.create_xhr()});

//Timer used in animating the get-units process
    Object.defineProperty(Object.prototype.westerb_sal,
            'get_units_animation_timer', // Define Object.prototype.westerb_sal.get_units_animation_timer
            {writable: true, enumerable: true, configurable: true, value: null});

//The callback function for handling responses by the 'xhr_for_units' object
    Object.defineProperty(Object.prototype.westerb_sal,
            'handle_xhr_for_units_response', // Define Object.prototype.westerb_sal.handle_xhr_for_units_response
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    if (westerb_sal.xhr_for_units.readyState === 4) {
                        window.clearTimeout(westerb_sal.get_units_animation_timer);
                        westerb_sal.clear_p_timers(); //to prevent the possibility of the content from 'responseText'/'status' that's about to be appended from being overwritten
                        if (westerb_sal.xhr_for_units.status === 200) {
                            westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set, westerb_sal.xhr_for_units.responseText);
                            if (westerb_sal.cur_pg === 'list_photos') {
                                if (/Error:/.test(westerb_sal.xhr_for_units.responseText)) {
                                    $('table tbody').attr('remaining_u_count', $('tbody tr').size());
                                    if (($('table tbody').attr('remaining_u_count') == 0 || $('table tbody').attr('remaining_u_count') == 1) && westerb_sal.pagination.current_set != 1) {
                                        westerb_sal.pagination.current_set--;
                                        westerb_sal.xhr_for_units.open('get', westerb_sal.HOME + 'ajax/list_photos_u_retrieve.php?u_per_set=' + westerb_sal.pagination.units_per_set + '&offset=' + westerb_sal.pagination.offset() + '&o_id=' + westerb_sal.pagination.albums_owner + '&a_id=' + westerb_sal.pagination.album_selected, true);
                                        westerb_sal.xhr_for_units.send(null);
                                    } else {
                                        $("#ajax_loading_pholder").html(westerb_sal.xhr_for_units.responseText.replace('Error:', ''));
                                    }
                                    westerb_sal.clear_sets();
                                }
                                else {
                                    $("#ajax_loading_pholder").html('');
                                    $('table tbody').html(westerb_sal.xhr_for_units.responseText);
                                    $('form.mini_form').find('span.char_counter').each(function() {
                                        var edit_field = $(this).parents('form.mini_form').find('.mini_form_edit_field');
                                        $(this).text(parseInt(edit_field.attr('maxlength'), 10) - edit_field.val().length);
                                    });
                                    $('table tbody').attr('remaining_u_count', $('tbody tr').size());
                                    westerb_sal.pagination.adjust_prev_and_next();
                                }
                                if (westerb_sal.perms != 1) //for Guest on 'list_photos.php', this update is done in the form.js module
                                    $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                            }
                            else {
                                $('div.movable').html(westerb_sal.xhr_for_units.responseText);
                                westerb_sal.readjust_general_public_elems();
                            }
                            westerb_sal.request_done = true;
                        } else {
                            if (westerb_sal.cur_pg === 'list_photos') {
                                $('table thead').hide();
                                $("#ajax_loading_pholder").html('failure: ' + westerb_sal.xhr_for_units.status);
                            }
                            else
                                $('div.movable').html("<div id='pholder_f_msg'>failure: " + westerb_sal.xhr_for_units.status + "</div>"); /////////////////////////
                            westerb_sal.request_done = true;
                        }
                    }
                }
            });
    westerb_sal.xhr_for_units.onreadystatechange = westerb_sal.handle_xhr_for_units_response; //finally, link the two properties above by binding the XHR's 'onreadystatechange' event to the handler

//Handlers the diaplaying of a gallery set unit and the animation that goes with it
    Object.defineProperty(Object.prototype.westerb_sal,
            'display_gallery_unit', {// Define Object.prototype.westerb_sal.display_gallery_unit
                value: function() {
                    $('#temp_content_holder').children('img, #loaded_info').css('display', 'none');
                    var unit_img = $('#temp_content_holder').children('img'),
                            unit_loaded_info = $('#temp_content_holder').children('#loaded_info');
                    $('#temp_content_holder').remove();
                    $('#outer_wrapper').find('#unit_wrapper img, #loaded_info').fadeOut(300, function() {
                        if ($(this).attr('id') === 'loaded_info') {
                            $(this).replaceWith(unit_loaded_info);
                            $('#photo_info').children('#loaded_info').fadeIn(300);
                            if (parseInt($('#c_count').children('span').text()) > 8)
                                $('#loaded_info').scroll(westerb_sal.load_more_public_comments);
                        }
                        else {
                            $(this).parent('#unit_wrapper').html(unit_img).children('img').fadeIn(310, function() {
                                //the current o_w_s immediately after the gallery unit (the image, and, by extension, the '#loaded info'-- the 10ms fadeIn() time difference ensures that the former always fades in last) has finished fading is already representative of the o_w_s for the photo
                                //so, if the state wasn't already stored (which would be the case for all units that were yet to be called via being selected from an album or album group), store it
                                if (!westerb_sal.retrieve_outer_wrapper_state('photo_wrapper_pa_id_' + $('#unit_wrapper').attr('pa_id') + '_s_' + westerb_sal.pagination.current_set))
                                    westerb_sal.store_outer_wrapper_state('photo_wrapper_pa_id_' + $('#unit_wrapper').attr('pa_id') + '_s_' + westerb_sal.pagination.current_set, $('.centering:last').html());
                            });
                            westerb_sal.on_display_img_natural_width = parseInt($('#on_display_gallery_img').attr('natural_width'), 10); //used to calculate the scalling ratio (with respect to the '.centering' div's width in a maximized Chrome browser) for the image
                            westerb_sal.on_display_img_natural_height = parseInt($('#on_display_gallery_img').attr('natural_height'), 10) //used in repositioning the '#gallery_thumbs_wrapper' div
                            westerb_sal.readjust_gallery_elems();
                            westerb_sal.request_done = true;
                            $('#wait_msg').fadeOut(10, function() {
                                $(this).remove();
                            });
                            $('form.big_form').attr('p_id', $('#unit_wrapper img').attr('p_id')) //though it's not necessary to create a new Form instance everytime a new gallery unit is called and displayed, it's still necessary to update the 'p_id' attribute of the form element so that when/if comments are posted, they are posted to the currently displayed photo
                            if ($('#unit_wrapper img').hasClass('comments_locked')) {//console.log('comments Locked for this photo')  //allow comments for the photo if they aren't locked for the user yet
                                $('input[name=author], input[name=submit], textarea').attr('disabled', 'disabled');
                            } else {//console.log('comments UNlocked for this photo')
                                $('input[name=author], input[name=submit], textarea').removeAttr('disabled');
                            }
                        }
                    });
                    if ($('.field_msg#comment').hasClass('notice_msg') || $('.field_msg#comment').hasClass('error_msg')) { //if for some reason a notice or error message was displayed, clear it
                        $('textarea').removeClass('notice_bordered error_bordered');
                        $('.field_msg#comment').removeClass('notice_msg error_msg').addClass('char_counter').text($('textarea').attr('maxlength'));
                    }
                    var cur_thumb = $('img.gallery_thumb.current'), next_cur_thumb = $('img.gallery_thumb[s_no=' + westerb_sal.pagination.current_set + ']');
                    cur_thumb.removeClass('current').wrap("<a href='" + westerb_sal.HOME + "index.php?" + westerb_sal.pagination.set_group + "&c_set=" + cur_thumb.attr('s_no') + "' class='scriptable_gen_link gallery_thumb_link'></a>");
                    next_cur_thumb.addClass('current').parent('a').replaceWith(next_cur_thumb);
                    westerb_sal.pagination.adjust_prev_and_next();
                }, writable: false, enumerable: true, configurable: true
            });

//The callback function for handling responses from the ajax call for retrieving photo units
    Object.defineProperty(Object.prototype.westerb_sal,
            'handle_get_photo_unit_response', {// Define Object.prototype.westerb_sal.handle_get_photo_unit_response
                value: function(response, $_status_code, xhr) {
                    westerb_sal.clear_p_timers();
                    $('#main_processing_msg').css('z-index', '-1').html('');
                    switch ($_status_code) {
                        case 'error':
                            //CONSIDER CHECKING THE RESPONSE/XHR ARGUMENT FOR MORE DETAILS ON THE ERROR (response/xhr.status)--for 'dev_mode' especially???????????????????????
                            westerb_sal.display_dialog_msg();
                            break;
                        case 'timeout':
                            westerb_sal.display_dialog_msg('The request is taking too long. Please refresh the page and try again', 'notice');
                            break;
                        case 'success':
                            westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set, $('#temp_content_holder').html());
                            westerb_sal.display_gallery_unit();
                            break;
                    }
                }, writable: false, enumerable: true, configurable: true
            });

//The function for fetching the previous set of unit when the previous link of the general navigation is clicked
    Object.defineProperty(Object.prototype.westerb_sal,
            'get_previous_set', // Define Object.prototype.westerb_sal.get_previous_set
            {writable: false, enumerable: true, configurable: true,
                value: function(e) {
                    if (!westerb_sal.pagination.previous_set())
                        ;
                    else if (westerb_sal.blocking_dialog)
                        westerb_sal.scroll_to_dialog();
                    else if (!westerb_sal.request_done)
                        westerb_sal.please_wait_msg(e);
                    //else if((westerb_sal.cur_pg === 'list_photos' || window.location.hash === '#list_photos') && !westerb_sal.request_done) westerb_sal.please_wait_msg(e);
                    else {
                        try {
                            westerb_sal.pagination.current_set--;
                            var pre_stored_set = westerb_sal.retrieve_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set);
                            if (!pre_stored_set) {
                                westerb_sal.request_done = false;
                                if (westerb_sal.cur_pg === 'list_photos') {
                                    westerb_sal.get_units_animation_timer = window.setTimeout(function() {
                                        $('table tbody').children().css('visibility', 'hidden');
                                    }, 90);
                                    $('#ajax_loading_pholder').html("<div id='pholder_msg'></div>");
                                    $('#pholder_msg').get(0).processing_msg('Loading');
                                }
                                else if ($('#outer_wrapper').hasClass('selected_photo_wrapper') /*westerb_sal.cur_pg === 'public_index' && /pa_id/.test(westerb_sal.pagination.set_group)*/) {
                                    westerb_sal.reposition_main_p_msg(); //center the element first
                                    $('#main_processing_msg').css('z-index', '5000').get(0).processing_msg();
                                }
                                else {
                                    westerb_sal.get_units_animation_timer = window.setTimeout(function() {
                                        $('div.movable').html("<div id='pholder_p_msg'></div>");
                                        $('#pholder_p_msg').get(0).processing_msg('Loading');
                                    }, 150) //for visual effects (delaying message while "sweeping")
                                }

                                if ($('#outer_wrapper').hasClass('selected_photo_wrapper') /*westerb_sal.cur_pg === 'public_index' && /pa_id/.test(westerb_sal.pagination.set_group)*/) {
                                    $('#main').append("<div style='display: none; ' id='temp_content_holder'></div>"); //append a temporary div for storing the URL-fetched HTML string
                                    $('#temp_content_holder').load(westerb_sal.HOME + 'index.php?' + westerb_sal.pagination.set_group + '&c_set=' + westerb_sal.pagination.current_set + '&ajax' + ' #unit_wrapper img, #loaded_info', westerb_sal.handle_get_photo_unit_response);
                                }
                                else {
                                    westerb_sal.xhr_for_units.open('get', westerb_sal.HOME + 'ajax/' + westerb_sal.cur_pg + '_u_retrieve.php?u_per_set=' + westerb_sal.pagination.units_per_set + '&offset=' + westerb_sal.pagination.offset() + '&o_id=' + westerb_sal.pagination.albums_owner + '&a_id=' + westerb_sal.pagination.album_selected + ($(this).hasClass('mini_full_screen') ? '&mini_full_screen' : ''), true);
                                    westerb_sal.xhr_for_units.send(null);
                                }
                            } else {
                                if (westerb_sal.cur_pg === 'list_photos') {
                                    window.setTimeout(function() {
                                        $('table tbody').html(pre_stored_set);
                                        $('form.mini_form').find('span.char_counter').each(function() {
                                            var edit_field = $(this).parents('form.mini_form').find('.mini_form_edit_field');
                                            $(this).text(parseInt(edit_field.attr('maxlength'), 10) - edit_field.val().length);
                                        });
                                        $('table tbody').attr('remaining_u_count', $('tbody tr').size());
                                    }, 210);
                                }
                                else if ($('#outer_wrapper').hasClass('selected_photo_wrapper')) {
                                    $('#main').append("<div style='display: none; ' id='temp_content_holder'></div>"); //append a temporary div for storing the pre-stored HTML string, so that the 'westerb_sal.display_gallery_unit' function can easily work with both cases (when ther's pre-stored content and when there isn't any)
                                    $('#temp_content_holder').html(pre_stored_set);
                                    westerb_sal.display_gallery_unit();
                                }
                                else
                                    window.setTimeout(function() {
                                        $('div.movable').html(pre_stored_set);
                                        westerb_sal.readjust_general_public_elems();
                                    }, 230);
                            }
                            var sweep_distance = westerb_sal.is_full_screen() ? 602 : 582;
                            if ($('#next').hasClass('inactive'))
                                $("#next").removeClass("inactive");
                            if (!westerb_sal.pagination.previous_set())
                                $(this).children('#prev').addClass('inactive');
                            $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                            if (westerb_sal.cur_pg === 'list_photos') {
                                $('table thead').show();
                                $('table tbody').fadeOut(150, function() {
                                    if (westerb_sal.cur_pg === 'list_photos')
                                        $('table tbody').fadeIn(500);
                                    else {
                                        $('div.movable').css('top', -sweep_distance + 'px');
                                        $('div.movable').animate({'top': 0}, 300, 'linear');
                                    }
                                });
                            }
                            else {
                                $('div.movable').animate({'top': sweep_distance}, 220, 'linear', function() {
                                    if (westerb_sal.cur_pg === 'list_photos')
                                        $('table tbody').fadeIn(500);
                                    else {
                                        $('div.movable').css('top', -sweep_distance + 'px');
                                        $('div.movable').animate({'top': 0}, 300, 'linear');
                                    }
                                });
                            }
                        } catch (e) {
                            westerb_sal.pagination.current_set++; //restore current_set state first
                            alert('Failed to connect to server:\n' + e.toString()) ///////////////////////
                        }
                    }
                    return false;
                }
            });

//The function for fetching the previous set of unit when the previous link of the general navigation is clicked
    Object.defineProperty(Object.prototype.westerb_sal,
            'get_next_set', // Define Object.prototype.westerb_sal.get_next_set
            {writable: false, enumerable: true, configurable: true,
                value: function(e) {
                    if (!westerb_sal.pagination.next_set() && !$(this).hasClass('gallery_thumb_link'))
                        ;
                    else if (westerb_sal.blocking_dialog)
                        westerb_sal.scroll_to_dialog();
                    else if (!westerb_sal.request_done)
                        westerb_sal.please_wait_msg(e);
                    //else if((westerb_sal.cur_pg === 'list_photos' || window.location.hash === '#list_photos') && !westerb_sal.request_done) westerb_sal.please_wait_msg(e);
                    else {
                        try {
                            if ($(this).hasClass('gallery_thumb_link')) //if increment is not prevented, it intereferes with retrieval and storage of sets fetched by '.gallery_thumb_link' links
                                westerb_sal.pagination.current_set = parseInt($(this).children('img.gallery_thumb').attr('s_no'), 10);
                            else
                                westerb_sal.pagination.current_set++;
                            var pre_stored_set = westerb_sal.retrieve_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set);
                            if (!pre_stored_set) {
                                westerb_sal.request_done = false;
                                if (westerb_sal.cur_pg === 'list_photos') {
                                    westerb_sal.get_units_animation_timer = window.setTimeout(function() {
                                        $('table tbody').children().css('visibility', 'hidden');
                                    }, 90);
                                    $('#ajax_loading_pholder').html("<div id='pholder_msg'></div>");
                                    $('#pholder_msg').get(0).processing_msg('Loading');
                                }
                                else if ($('#outer_wrapper').hasClass('selected_photo_wrapper')) { /*westerb_sal.cur_pg === 'public_index' && /pa_id/.test(westerb_sal.pagination.set_group)*/
                                    westerb_sal.reposition_main_p_msg(); //center the element first
                                    $('#main_processing_msg').css('z-index', '5000').get(0).processing_msg();
                                }
                                else {
                                    westerb_sal.get_units_animation_timer = window.setTimeout(function() {
                                        $('div.movable').html("<div id='pholder_p_msg'></div>");
                                        $('#pholder_p_msg').get(0).processing_msg('Loading');
                                    }, 150) //for visual effects (delaying message while "sweeping")
                                }

                                if ($('#outer_wrapper').hasClass('selected_photo_wrapper') /*westerb_sal.cur_pg === 'public_index' && /pa_id/.test(westerb_sal.pagination.set_group)*/) {
                                    $('#main').append("<div style='display: none; ' id='temp_content_holder'></div>"); //append a temporary div for storing the URL-fetched HTML string
                                    $('#temp_content_holder').load(westerb_sal.HOME + 'index.php?' + westerb_sal.pagination.set_group + '&c_set=' + westerb_sal.pagination.current_set + '&ajax' + ' #unit_wrapper img, #loaded_info', westerb_sal.handle_get_photo_unit_response);
                                }
                                else {
                                    westerb_sal.xhr_for_units.open('get', westerb_sal.HOME + 'ajax/' + westerb_sal.cur_pg + '_u_retrieve.php?u_per_set=' + westerb_sal.pagination.units_per_set + '&offset=' + westerb_sal.pagination.offset() + '&o_id=' + westerb_sal.pagination.albums_owner + '&a_id=' + westerb_sal.pagination.album_selected + ($(this).hasClass('mini_full_screen') ? '&mini_full_screen' : ''), true);
                                    westerb_sal.xhr_for_units.send(null);
                                }
                            } else {
                                if (westerb_sal.cur_pg === 'list_photos') {
                                    window.setTimeout(function() {
                                        $('table tbody').html(pre_stored_set);
                                        $('form.mini_form').find('span.char_counter').each(function() {
                                            var edit_field = $(this).parents('form.mini_form').find('.mini_form_edit_field');
                                            $(this).text(parseInt(edit_field.attr('maxlength'), 10) - edit_field.val().length);
                                        });
                                        $('table tbody').attr('remaining_u_count', $('tbody tr').size());
                                    }, 210);
                                }
                                else if ($('#outer_wrapper').hasClass('selected_photo_wrapper')) {
                                    $('#main').append("<div style='display: none; ' id='temp_content_holder'></div>"); //append a temporary div for storing the pre-stored HTML string, so that the 'westerb_sal.display_gallery_unit' function can easily work with both cases (when ther's pre-stored content and when there isn't any)
                                    $('#temp_content_holder').html(pre_stored_set);
                                    westerb_sal.display_gallery_unit();
                                }
                                else
                                    window.setTimeout(function() {
                                        $('div.movable').html(pre_stored_set);
                                        westerb_sal.readjust_general_public_elems();
                                    }, 230);
                            }
                            var sweep_distance = westerb_sal.is_full_screen() ? 602 : 582;
                            if ($('#prev').hasClass('inactive'))
                                $('#prev').removeClass('inactive');
                            if (!westerb_sal.pagination.next_set())
                                $(this).children('#next').addClass('inactive');
                            $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                            if (westerb_sal.cur_pg === 'list_photos') {
                                $('table thead').show();
                                $('table tbody').fadeOut(150, function() {
                                    if (westerb_sal.cur_pg === 'list_photos')
                                        $('table tbody').fadeIn(500);
                                    else {
                                        $('div.movable').css('top', sweep_distance + 'px');
                                        $('div.movable').animate({'top': 0}, 300, 'linear');
                                    }
                                });
                            }
                            else {
                                $('div.movable').animate({'top': -sweep_distance}, 220, 'linear', function() {
                                    if (westerb_sal.cur_pg === 'list_photos')
                                        $('table tbody').fadeIn(500);
                                    else {
                                        $('div.movable').css('top', sweep_distance + 'px');
                                        $('div.movable').animate({'top': 0}, 300, 'linear');
                                    }
                                });
                            }
                        } catch (e) {
                            westerb_sal.pagination.current_set--; //restore current_set state first
                            alert('Failed to connect to server:\n' + e.toString()) ////////////////////////
                        }
                    }
                    return false;
                }
            });

//Global variable for keeping track of user permissions
    Object.defineProperty(Object.prototype.westerb_sal,
            'perms', // Define Object.prototype.westerb_sal.perms
            {writable: true, enumerable: true, configurable: true, value: $('#main').attr('u_p')});

//Global variable for storing the id of the current user
    Object.defineProperty(Object.prototype.westerb_sal,
            'cur_u_id', // Define Object.prototype.westerb_sal.cur_u_id
            {writable: true, enumerable: true, configurable: true, value: $('#main').attr('cur_u_id')});

//Global variable for temporarily storing instance of "Scroll_Pagination" responsible for different unit sets
    Object.defineProperty(Object.prototype.westerb_sal,
            's_pag_instances', // Define Object.prototype.westerb_sal.s_pag_instances
            {writable: true, enumerable: true, configurable: true, value: Object.create(null)});

//Global variable for keeping track of when or not there is an on-going AJAX request being carried out by the code
    Object.defineProperty(Object.prototype.westerb_sal,
            'request_done', // Define Object.prototype.westerb_sal.request_done
            {writable: true, enumerable: true, configurable: true, value: true});

//Global variable for checking whether or not there is some "blocking" animation going on before deciding on action to take
    Object.defineProperty(Object.prototype.westerb_sal,
            'animating', // Define Object.prototype.westerb_sal.animating
            {writable: true, enumerable: true, configurable: true, value: false});

//Global variable for keeping references to the most recent Timeout for removing UI messages, so they can easily be cleared
    Object.defineProperty(Object.prototype.westerb_sal,
            'msg_remove_timer', // Define Object.prototype.westerb_sal.msg_remove_timer
            {writable: true, enumerable: true, configurable: true, value: null});

//Global variable for remembering if the browser supports HTTP Progress Events
    Object.defineProperty(Object.prototype.westerb_sal,
            'progress_events', // Define Object.prototype.westerb_sal.progress_events
            {writable: false, enumerable: true, configurable: true, value: ('onprogress' in westerb_sal.create_xhr()) ? true : false});

//Global variable used for allowing/disallowing certain features contingent upon whether the application is being viewed in development/production
    Object.defineProperty(Object.prototype.westerb_sal,
            'dev_mode', // Define Object.prototype.westerb_sal.dev_mode
            {writable: false, enumerable: true, configurable: true, value: /*window.location.host==='localhost'?true:false*/true});

//Helper function for animating the removal of '.hash_change_removed_n' elements, where n = 1,2,3,4... as passed in the data object
    Object.defineProperty(Object.prototype.westerb_sal,
            'remove_hash_removed_elems', // Define Object.prototype.westerb_sal.remove_hash_removed_elems
            {writable: false, enumerable: true, configurable: true,
                value: function(e) {
                    var hide_duration = (westerb_sal.cur_pg === 'list_albums' || westerb_sal.cur_pg === 'add_user' ||
                            westerb_sal.cur_pg === 'photo_upload' || westerb_sal.cur_pg === 'create_album' ||
                            westerb_sal.cur_pg === 'login') ? 100 : ((westerb_sal.cur_pg === 'public_index') ? 50 : 800), fade_duration = 100,
                            stall_duration = 20, cur_class_number = e.data.class_number,
                            elems = $('.hash_change_removed_' + cur_class_number).toArray(), elem_count = elems.length, cur_elem = null;
                    (function remove_elem() {
                        cur_elem = $(elems[elem_count - 1]); //start with the last in the array for visual effects
                        if (cur_elem.hasClass('faded'))
                            cur_elem.fadeOut((cur_elem.hasClass('field_msg')) ? 1 : fade_duration, function() {
                                $(this).remove();
                                elem_count-- //decrement count to animate the next element, if there is one
                                if (elem_count !== 0)
                                    setTimeout(remove_elem, stall_duration); //there is/are more elements to animate; call the function again in stall_duration ms
                                else if (elem_count === 0) { //there are no more elements of the class to animate
                                    if ($('.hash_change_removed_' + (cur_class_number + 1)).size() !== 0) //if there are '.hash_change_removed_n+1' elemets, remove those next by broadcasting the event that calls the function to animate and remove them
                                        $('body').trigger('class' + (cur_class_number + 1) + '_removal');
                                    else
                                        $('#main').trigger('elems_remaval_complete'); //trigger the event that lets '#main' know that it's now time to remove the itself and replace with the new '#main' div content
                                }
                            });
                        else if (cur_elem.hasClass('slided'))
                            cur_elem.hide((cur_elem.attr('id') === 'nav' || cur_elem.attr('id') === 'photos_wrapper') ? 200 : hide_duration, function() {
                                $(this).remove();
                                elem_count-- //decrement count to animate the next element, if there is one
                                if (elem_count !== 0)
                                    setTimeout(remove_elem, stall_duration); //there is/are more elements to animate; call the function again in stall_duration ms
                                else if (elem_count === 0) { //there are no more elements of the class to animate
                                    if ($('.hash_change_removed_' + (cur_class_number + 1)).size() !== 0) //if there are '.hash_change_removed_n+1' elemets, remove those next by broadcasting the event that calls the function to animate and remove them
                                        $('body').trigger('class' + (cur_class_number + 1) + '_removal');
                                    else
                                        $('#main').trigger('elems_remaval_complete'); //trigger the event that lets '#main' know that it's now time to remove the itself and replace with the new '#main' div content
                                }
                            });
                    })();
                }
            });

//Helper function for sanitizing and freeing up memory before the 'next' requested page is appended, and kickoff the chain of animations for clearing up of the current page
    Object.defineProperty(Object.prototype.westerb_sal,
            'clear_cur_page_for_next', // Define Object.prototype.westerb_sal.clear_cur_page_for_next
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    $('*', $('#main')).unbind(); //clear all event handlers bound on all elements within the '#main' div context, to free memory
                    $('div.message_wrapper').slideUp(10, function() {
                        $(this).remove();
                    });
                    $('#wait_msg').fadeOut(10, function() {
                        $(this).remove();
                    });
                    $('body').trigger('class1_removal'); //kickoff animations for clearing the current page
                }
            });

//Helper function for handling the hashchange event triggered by 'scriptable_hash_changer' links
    Object.defineProperty(Object.prototype.westerb_sal,
            'handle_hash_change', {// Define Object.prototype.westerb_sal.handle hash change
                value: function(e) {
                    if (window.location.hash === '' || window.location.hash === '#')
                        ; //prevent regular page refreshes form effeting any change
                    else {
                        var requested_pg_content = $('#temp_content_holder').html(); //get the content that was retrieved from the server or the pre-stored state for the requested page that's temporarily appended in the temporary div so that it can replace the current '#main' div
                        $('#temp_content_holder').remove();

                        westerb_sal.clear_cur_page_for_next();

                        //binding a custom event on the current '#main' div that, upon being triggered, will finally call the function that appends and shows the content for the requested page
                        $('#main').bind('elems_remaval_complete', function() {
                            $(this).unbind('elems_remaval_complete').replaceWith(requested_pg_content);
                            try { //REVISIT THE DECISION TO UPDATE CERTAIN VISUAL ELEMENTS ONLY AFTER THE SCRIPTS ARE DONE DOWNLOADING (CONSIDER THE CASE WHEN CONNECTION IS VERY SLOW...)
                                switch (window.location.hash) {
                                    case('#login'):
                                        westerb_sal.cur_pg = 'login'; //lets scripts that depend on this value in their flow-controls know that the page has for all intents and purposes changed
                                        westerb_sal.form = new westerb_sal.Form;
                                        $('#main').fadeTo(50, 1, function() {
                                            $('a#home h1').css('width', '360');
                                            $('a#home span#logo_suffix').text(': Login');
                                            $('#gologin').replaceWith("<a class='scriptable_hash_changer scriptable_header_link' id='gopublic' href='" + westerb_sal.HOME + "'><div class='ui_button ui_button_white'>PUBLIC AREA</div></a>");
                                            $('#gopublic').addClass('stnd_alone');
                                            $('a#home').attr('href', westerb_sal.HOME + 'admin');
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#public_index'): //the 'logout' and the 'gopublic' changers all require the same "public_index" page on change
                                    case('#pst_lgout'):
                                        westerb_sal.cur_pg = 'public_index';
                                        if ($('.clicked_hash_changer').attr('id') === 'logout' || ($('.show_prevs').size() === 0)) //if set by the 'logout' changer (or the '.show_prevs' elements are missing for any other reason, as is the case when the login action cleared the pre-stored '#main' page state for 'public_index.php')
                                            $("#unit_wrapper .album").append("<div style='display: none; ' class='absolute_pos show_prevs hover_triggered'>See photo previews</div>"); //appended the '.show_prevs' elements as the content was loaded fresh from the server
                                        westerb_sal.readjust_general_public_elems();
                                        westerb_sal.pagination = new westerb_sal.Pagination;
                                        westerb_sal.pagination.current_set = 1; //initiate it to 1 in case a URL 'c_set' was set-- though unlikely
                                        $('.hover_triggered').hide(); //in case they are displayed-- as is the case after loging out-- hide all elements whose display is going to be triggered by 'hover_triggers'
                                        $('#main').fadeTo(50, 1, function() {
                                            $('a#home h1').css('width', '265');
                                            $('a#home span#logo_suffix').html(' &TRADE;');
                                            if ($('.clicked_hash_changer').attr('id') === 'logout') { //if set by the 'logout' changer
                                                $('.clicked_hash_changer').hide(100, function() {
                                                    $('#gopublic').addClass('stnd_alone');
                                                    $(this).remove();
                                                });
                                                $('#gopublic, #gostaff').replaceWith("<a class='scriptable_hash_changer scriptable_header_link' id='gologin' href='" + westerb_sal.HOME + "admin/login.php'><div class='ui_button ui_button_white'>USER LOGIN</div></a>");
                                                window.clearInterval(westerb_sal.check_login_timer);
                                                westerb_sal.is_logged_in = false;
                                            } else {
                                                if (westerb_sal.is_logged_in)
                                                    $('#gopublic').replaceWith("<a class='scriptable_hash_changer scriptable_header_link' id='gostaff' href='" + westerb_sal.HOME + "admin/'><div class='ui_button ui_button_white'>" + (westerb_sal.perms == 2 ? 'PRIVATE' : 'ADMIN') + " AREA</div></a>");
                                                else
                                                    $('#gopublic').replaceWith("<a class='scriptable_hash_changer scriptable_header_link' id='gologin' href='" + westerb_sal.HOME + "admin/login.php'><div class='ui_button ui_button_white'>USER LOGIN</div></a>");
                                            }
                                            $('a#home').attr('href', westerb_sal.HOME);
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#admin_index'): //this hash is set by either the 'login', the 'gostaff', the 'to_admin_home' or the 'home' changer (when the current # value !== 'admin_index')
                                        var prev_cur_pg = westerb_sal.cur_pg; //used to determine if the URL fragment identifier was set by the login changer (this indirect reference is necessary because at this point the login button would have already been removed from the DOM and the $('.clicked_hash_changer') selection would be useless)
                                        westerb_sal.cur_pg = 'admin_index';
                                        $('#main').fadeTo(50, 1, function() {
                                            $('a#home h1').css('width', '360');
                                            $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                            if ($('.clicked_hash_changer').attr('id') === 'gostaff') //if set by the 'gostaff' changer
                                                $('#gostaff').replaceWith("<a class='scriptable_hash_changer scriptable_header_link' id='gopublic' href='" + westerb_sal.HOME + "'><div class='ui_button ui_button_white'>PUBLIC AREA</div></a>");
                                            else if (prev_cur_pg === 'login') {
                                                $('#gopublic').removeClass('stnd_alone');
                                                $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                $('#logout').show(100);
                                            }
                                            $('a#home').attr('href', westerb_sal.HOME + 'admin/');
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#photo_upload'):
                                        westerb_sal.cur_pg = 'photo_upload';
                                        westerb_sal.form = new westerb_sal.Form;
                                        $('#main').fadeTo(50, 1, function() {
                                            if (westerb_sal.get_url_param_value('to') === 'photo_upload') { //if the page was loaded after login as a result of the 'to' URL parameter being set
                                                $('a#home h1').css('width', '360');
                                                $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                $('#gopublic').removeClass('stnd_alone');
                                                $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                $('#logout').show(100);
                                            }
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#create_album'):
                                        westerb_sal.cur_pg = 'create_album';
                                        westerb_sal.form = new westerb_sal.Form;
                                        $('#main').fadeTo(50, 1, function() {
                                            if (westerb_sal.get_url_param_value('to') === 'create_album') {
                                                $('a#home h1').css('width', '360');
                                                $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                $('#gopublic').removeClass('stnd_alone');
                                                $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                $('#logout').show(100);
                                            }
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#add_user'):
                                        westerb_sal.cur_pg = 'add_user';
                                        westerb_sal.form = new westerb_sal.Form;
                                        $('#main').fadeTo(50, 1, function() {
                                            if (westerb_sal.get_url_param_value('to') === 'add_user') {
                                                $('a#home h1').css('width', '360');
                                                $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                $('#gopublic').removeClass('stnd_alone');
                                                $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                $('#logout').show(100);
                                            }
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#list_users'):
                                        westerb_sal.cur_pg = 'list_users';
                                        $('#main').fadeTo(50, 1, function() {
                                            if (westerb_sal.get_url_param_value('to') === 'list_users') {
                                                $('a#home h1').css('width', '360');
                                                $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                $('#gopublic').removeClass('stnd_alone');
                                                $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                $('#logout').show(100);
                                            }
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                    case('#list_albums'):
                                        westerb_sal.cur_pg = 'list_albums';
                                        if (westerb_sal.perms != 2)
                                            westerb_sal.exec_code_for_admin_list_albums();
                                        if ((westerb_sal.perms == 2)) { //for Normal user, the Pagination instance will be required to navigate the albums
                                            westerb_sal.pagination = new westerb_sal.Pagination;
                                            westerb_sal.pagination.current_set = 1; //initiate it to 1 in case a URL 'c_set' was set-- though unlikely
                                            $('#main').fadeTo(50, 1, function() {
                                                if (westerb_sal.get_url_param_value('to') === 'list_albums') {
                                                    $('a#home h1').css('width', '360');
                                                    $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                    $('#gopublic').removeClass('stnd_alone');
                                                    $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                    $('#logout').show(100);
                                                }
                                                westerb_sal.request_done = true;
                                            });
                                        } else {
                                            $('#main').fadeTo(50, 1, function() {
                                                if (westerb_sal.get_url_param_value('to') === 'list_albums') {
                                                    $('a#home h1').css('width', '360');
                                                    $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                    $('#gopublic').removeClass('stnd_alone');
                                                    $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                    $('#logout').show(100);
                                                }
                                                westerb_sal.request_done = true;
                                            });
                                        }
                                        break;
                                    case('#list_photos'):
                                        if (westerb_sal.get_url_param_value('to') === 'list_photos') { //if the page is being dispalyed after a login that had the 'to' URL parameter set, it will be redirected to 'list_albums.php'; execute the appropriate scripts for the page
                                            westerb_sal.cur_pg = 'list_albums';
                                            if (westerb_sal.perms != 2)
                                                westerb_sal.exec_code_for_admin_list_albums();
                                            if ((westerb_sal.perms == 2)) { //for Normal user, the Pagination instance will be required to navigate the albums
                                                westerb_sal.pagination = new westerb_sal.Pagination;
                                                westerb_sal.pagination.current_set = 1; //initiate it to 1 in case a URL 'c_set' was set-- though unlikely
                                            }
                                            $('#main').fadeTo(50, 1, function() {
                                                setTimeout(function() {
                                                    $('div.message_wrapper').slideUp(300, function() {
                                                        $(this).remove();
                                                    }); //hide the Notice message that will be sent along
                                                }, 3000);
                                                westerb_sal.request_done = true;
                                            });
                                        } else {
                                            westerb_sal.cur_pg = 'list_photos';
                                            $('form.mini_form').find('span.char_counter').each(function() {
                                                var edit_field = $(this).parents('form.mini_form').find('.mini_form_edit_field');
                                                $(this).text(parseInt(edit_field.attr('maxlength'), 10) - edit_field.val().length);
                                            });

                                            $('#photos_wrapper').css({'min-width': '1012px', 'min-height': '473px'}); //preventing the nav from moving around too much
                                            //REVISIT: DOESN'T THIS NOT CAUSE THE ELEMENTS TO BE APPENDED MULTIPLE TIMES EVERYTIME THE 'list_photos.php' PAGE IS CALLED????
                                            $('#photos_wrapper').append("<div id='ajax_loading_pholder'><div id='pholder_msg'></div></div>");
                                            westerb_sal.pagination = new westerb_sal.Pagination;
                                            westerb_sal.pagination.current_set = 1; //initiate it to 1 in case a URL 'c_set' was set-- though unlikely
                                            $('#main').fadeTo(50, 1, function() {
                                                westerb_sal.request_done = true;
                                            });
                                        }
                                        break;
                                    case('#logfile'):
                                        westerb_sal.cur_pg = 'logfile';
                                        //REVISIT: DOESN'T THIS NOT CAUSE THE ELEMENTS TO BE APPENDED MULTIPLE TIMES EVERYTIME THE 'logfile.php' PAGE IS CALLED????
                                        $('h2:first').after("<div id='progress_wrapper' style='width: 0; overflow: hidden; display: none; height: 5px; '></div>");
                                        var p_bar_str = "<div class='pregress_info' id='upload_progress_bar' style='position: absolute; top: -8px; left: 0; width: 400px; border-radiu: 30px; overflow: hidden; z-index: 3000; '>";
                                        p_bar_str += "<div style='display: inline-block; border-top-left-radius: 35px; border-bottom-left-radius: 35px; width: 100px; height: 5px; background-color: #1C6487; '></div>";
                                        p_bar_str += "<div style='display: inline-block; width: 100px; height: 5px; background-color: #A20910; '></div>";
                                        p_bar_str += "<div style='display: inline-block; width: 100px; height: 5px; background-color: #C36500; '></div>";
                                        p_bar_str += "<div style='display: inline-block; width: 100px; border-top-right-radius: 35px; border-bottom-right-radius: 35px; height: 5px; background-color: #93A50B; '></div>";
                                        p_bar_str += "</div>";
                                        $('div#progress_wrapper').append(p_bar_str).after("<span class='pregress_info' id='upload_progress_percent' style='color: #222; font-weight: bold; font-size: 12px; position: absolute; top: 56px; left: 4px; z-index: 3000; display: none; '></span>");
                                        $('#main').fadeTo(50, 1, function() {
                                            if (westerb_sal.get_url_param_value('to') === 'logfile') {
                                                $('a#home h1').css('width', '360');
                                                $('a#home span#logo_suffix').html(westerb_sal.perms == 2 ? ' &TRADE;' : ': Admin');
                                                $('#gopublic').removeClass('stnd_alone');
                                                $('#gopublic').after("<a style='display: none; ' class='scriptable_hash_changer scriptable_header_link' id='logout' href='" + westerb_sal.HOME + "admin/logout.php'><div class='ui_button ui_button_white'>LOGOUT</div></a>");
                                                $('#logout').show(100);
                                            }
                                            westerb_sal.request_done = true;
                                        });
                                        break;
                                }
                            }
                            catch (e) {
                            }
                            finally { //a couple of values absolutely need resetting at every "page refresh"
                                westerb_sal.perms = $('#main').attr('u_p');
                                westerb_sal.cur_u_id = $('#main').attr('cur_u_id');
                                westerb_sal.msg_remove_timer = westerb_sal.get_units_animation_timer = null;
                                if (window.location.hash === '#pst_lgout') {
                                    sessionStorage.clear(); //delete every stored state and value as it's technically the end of a session

                                    //re- session-store objects that will hold the navigational 'set states' in different pages
                                    westerb_sal.store_page('public_index', Object.create(null));
                                    westerb_sal.store_page('list_albums', Object.create(null));
                                    westerb_sal.store_page('list_photos', Object.create(null));

//                        westerb_sal.clear_main_page_state('#admin_index');
//                        westerb_sal.clear_main_page_state('#photo_upload');
//                        westerb_sal.clear_main_page_state('#create_album');
//                        westerb_sal.clear_main_page_state('#add_user');
//                        westerb_sal.clear_main_page_state('#list_users');
//                        westerb_sal.clear_main_page_state('#list_albums');
//                        westerb_sal.clear_main_page_state('#logfile');
//                        //REVISIT: These remain uncleared:
//                        //--"#list_photos_..." "#main" page states
//                        //--"login" "#main" page state (does it need to be cleared???)
//                        //--"public_index" "#main" page state (does it need to be cleared???)
//                        //--all outer wrapper stetes
//                        //--all comments
//                        //--all notes
//                        westerb_sal.clear_sets('public_index');
//                        westerb_sal.clear_sets('list_albums'); //relevant to Normal's "list_albums.php"
//                        westerb_sal.clear_sets('list_photos');
//                        //REVISIT IMPLEMENTATION OF THE NEXT FIVE LINES
//                        westerb_sal.clear_albums('a'); //relevant to Admin's "list_albums.php"
//                        westerb_sal.clear_albums(1); //""
//                        westerb_sal.clear_albums(2); //""
//                        westerb_sal.clear_albums(3); //""
//                        westerb_sal.clear_albums(4); //""
                                }
                            }
                        });
                    }
                    return false;
                }, writable: false, enumerable: true, configurable: true
            });

//Helper function for changing the URL fragment identifier according to the triggering target 'scriptable_hash_changer' link
    Object.defineProperty(Object.prototype.westerb_sal,
            'change_hash', {// Define Object.prototype.westerb_sal.change_hash
                value: function(store) {
                    var changer = $('.clicked_hash_changer'), requested_pg_content = $('#temp_content_holder').html(); //get the content that was retrieved from the server and temporarily appended in the temporary div so that it can be stored
                    if (changer.attr('id') === 'home') {
                        //the '#main' div state for the 'public_index' page is stored during initial application loading (in 'js/public_index.js') and during a 'logout' request;
                        //the '#main' div state for the 'admin_index' page is stored after login (if the 'to' URL parameter isn't set), during a 'gostaff' request and a 'to_admin_home' request;
                        window.location.hash = (westerb_sal.cur_pg === 'public_index') ? 'public_index' : 'admin_index'; //FOR NOW AT LEAST, all public home "pages"-- as rendered contingent upon the URL parameters c_set, o_id, a_id, and p_id--evaluate 'westerb_sal.cur_pg' to 'public_index'; this fact is crucial to this line of code-- MIGHT NEED REFACTORING LATER
                    }

                    else if (changer.attr('id') === 'gologin') {
                        if (store)
                            westerb_sal.store_main_page_state('#login', requested_pg_content);
                        window.location.hash = 'login';
                    }

                    else if (changer.attr('id') === 'login') {
                        if (store)
                            westerb_sal.store_main_page_state('#' + (westerb_sal.get_url_param_value('to') || 'admin_index'), requested_pg_content);
                        window.location.hash = westerb_sal.get_url_param_value('to') || 'admin_index';
                    }

                    else if (changer.attr('id') === 'gopublic') {
                        if (store)
                            westerb_sal.store_main_page_state('#public_index', requested_pg_content);
                        window.location.hash = 'public_index';
                    }

                    else if (changer.attr('id') === 'gostaff') {
                        if (store)
                            westerb_sal.store_main_page_state('#admin_index', requested_pg_content);
                        window.location.hash = 'admin_index';
                    }

                    else if (changer.attr('id') === 'to_admin_home') {
                        if (store)
                            westerb_sal.store_main_page_state('#admin_index', requested_pg_content);
                        window.location.hash = 'admin_index';
                    }

                    else if (changer.attr('id') === 'to_albums') {
                        if (store)
                            westerb_sal.store_main_page_state('#list_albums', requested_pg_content);
                        window.location.hash = 'list_albums';
                    }

                    else if (changer.attr('id') === 'logout') {
                        //REVISIT STORING LOGIC
                        //westerb_sal.store_main_page_state('#admin_index', requested_pg_content); //the (302) redirect to the public index on the 'admin/logout.php' page will return a response that's the most recent copy of the '#main' div state for 'public_index'; always allow this markup to be (re)stored so that if the user made any changes that affect the 'public_index' page while they were logged in, the page will reflect the changes
                        window.location.hash = 'pst_lgout';
                    }

                    else if (changer.text() === 'Upload a new photo') {
                        if (store)
                            westerb_sal.store_main_page_state('#photo_upload', requested_pg_content);
                        window.location.hash = 'photo_upload';
                    }

                    else if (changer.text() === 'Create a new album') {
                        if (store)
                            westerb_sal.store_main_page_state('#create_album', requested_pg_content);
                        window.location.hash = 'create_album';
                    }

                    else if (changer.text() === 'Add a new user') {
                        if (store)
                            westerb_sal.store_main_page_state('#add_user', requested_pg_content);
                        window.location.hash = 'add_user';
                    }

                    else if (changer.text() === 'List users') {
                        if (store)
                            westerb_sal.store_main_page_state('#list_users', requested_pg_content);
                        window.location.hash = 'list_users';
                    }

                    else if (/to_list_photos_/.test(changer.attr('id'))) {
                        if (store)
                            westerb_sal.store_main_page_state('#list_photos_' + changer.parent('div.album').attr('a_id'), requested_pg_content);
                        window.location.hash = 'list_photos';
                    }

                    else if (changer.text() === 'List albums') {
                        if (store)
                            westerb_sal.store_main_page_state('#list_albums', requested_pg_content);
                        window.location.hash = 'list_albums';
                    }

                    else if (changer.text() === 'View log file') {
                        if (store)
                            westerb_sal.store_main_page_state('#logfile', requested_pg_content);
                        window.location.hash = 'logfile';
                    }
                    return false;
                }, writable: false, enumerable: true, configurable: true
            });

//Call back for the HTTP request made in 'westerb_sal.get_hash_changer_requested_content()'
    Object.defineProperty(Object.prototype.westerb_sal,
            'handle_get_changer_content_response', {// Define Object.prototype.westerb_sal.handle_get_changer_content_response
                value: function(response, $_status_code, xhr) {
                    westerb_sal.clear_p_timers();
                    $('#main_processing_msg').css('z-index', '-1').html('');
                    switch ($_status_code) {
                        case 'error':
                            //CONSIDER CHECKING THE RESPONSE/XHR ARGUMENT FOR MORE DETAILS ON THE ERROR (response/xhr.status)--for 'dev_mode' especially???????????????????????
                            westerb_sal.display_dialog_msg();
                            break;
                        case 'timeout':
                            westerb_sal.display_dialog_msg('The request is taking too long. Please refresh the page and try again', 'notice');
                            break;
                        case 'success': //now it's OK to change the URL fragment identifier because the application has successfully loaded the requested page
                            westerb_sal.change_hash(true); //tells the function to store the response (representing the '#main' div state for the requested page) that's just been fetched
                            break;
                    }
                }, writable: false, enumerable: true, configurable: true
            });

//Helper function for getting the page content being requested by a 'scriptable_hash_changer' link before changing the URL fragment identifier, according to the triggering target link, upon a successful GET request
    Object.defineProperty(Object.prototype.westerb_sal,
            'get_hash_changer_requested_content', {// Define Object.prototype.westerb_sal.get_hash_changer_requested_content
                value: function(e) {
                    if (!westerb_sal.request_done)
                        westerb_sal.please_wait_msg(e);
                    else if (westerb_sal.blocking_dialog)
                        westerb_sal.scroll_to_dialog();
                    //REVISIT THE else if LOGIC BELOW
                    else if ($.trim($(this).text()) !== 'The Salon ™' && $(this).attr('id') !== 'gologin' &&
                            $(this).attr('id') !== 'gopublic' && $(this).attr('id') !== 'logout' && westerb_sal.cur_pg !== 'login' &&
                            $(this).attr('id') !== 'login' && !westerb_sal.is_logged_in)
                        westerb_sal.prompt_login(); //if the request is for going to any other page than the 'login' or 'public_index' pages, or to perform the actual login or logout, and the user is somehow logged out, prompt them to login first before continuing
                    else {
                        $('.clicked_hash_changer').removeClass('clicked_hash_changer');
                        $(this).addClass('clicked_hash_changer'); //will be used to reference the most recently clicked 'scriptable_hash_changer' link
                        var url = requested_pg_name = '';

                        if ($(this).attr('id') === 'home') {
                            //REFINE THE CASE WHEN IT'S STILL 'public_index' but 'a_id'/'o_id'/'p_id/c_set are set??????????????
                            if (westerb_sal.perms == 2) {
                                url = $('#gopublic').size() === 1 ? westerb_sal.HOME + 'admin/' : westerb_sal.HOME; //if the 'gopublic' link is present on the page, this is an Admi page
                                requested_pg_name = $('#gopublic').size() === 1 ? 'admin_index' : 'public_index';
                            } else {
                                url = $.trim($(this).text()) === 'The Salon: Login' ? westerb_sal.HOME + 'admin/login.php' : $.trim($(this).text()) === 'The Salon: Admin' ? westerb_sal.HOME + 'admin/' : westerb_sal.HOME;
                                requested_pg_name = $.trim($(this).text()) === 'The Salon: Login' ? 'login' : $.trim($(this).text()) === 'The Salon: Admin' ? 'admin_index' : 'public_index';
                            }
                        }

                        else if ($(this).attr('id') === 'gologin') {
                            url = westerb_sal.HOME + 'admin/login.php';
                            requested_pg_name = 'login';
                        }

                        else if ($(this).attr('id') === 'login') {
                            var after_login_pg = westerb_sal.get_url_param_value('to') || 'admin_index';
                            url = westerb_sal.HOME + 'admin/' + (after_login_pg === 'admin_index' ? 'index' : after_login_pg) + '.php';
                            requested_pg_name = after_login_pg;
                        } //request content from the page the user tried to access before logging in-- as determined by the'to' URL parameter-- or, by default, from 'admin/index.php' because after login, the application needs to "redirect" to the Admin home page; the request will go through because at this point the user is already logged in-- the event that invokes this function call is triggered only when the login is successful

                        else if ($(this).attr('id') === 'gopublic') {
                            url = westerb_sal.HOME;
                            requested_pg_name = 'public_index';
                        }

                        else if ($(this).attr('id') === 'gostaff') {
                            url = westerb_sal.HOME + 'admin/';
                            requested_pg_name = 'admin_index';
                        }

                        else if ($(this).attr('id') === 'to_admin_home') {
                            url = westerb_sal.HOME + 'admin/';
                            requested_pg_name = 'admin_index';
                        }
                        //
                        //
                        //
                        //
                        else if ($(this).attr('id') === 'to_albums') {
                            url = westerb_sal.HOME + 'admin/list_albums.php';
                            requested_pg_name = 'list_albums';
                        }
                        //
                        //
                        //
                        //
                        else if ($(this).attr('id') === 'logout') {
                            url = westerb_sal.HOME + 'admin/logout.php';
                            requested_pg_name = 'logout';
                        }

                        else if ($(this).text() === 'Upload a new photo') {
                            url = westerb_sal.HOME + 'admin/photo_upload.php';
                            requested_pg_name = 'photo_upload';
                        }

                        else if ($(this).text() === 'Create a new album') {
                            url = westerb_sal.HOME + 'admin/create_album.php';
                            requested_pg_name = 'create_album'
                        }

                        else if ($(this).text() === 'Add a new user') {
                            url = westerb_sal.HOME + 'admin/add_user.php';
                            requested_pg_name = 'add_user'
                        }

                        else if ($(this).text() === 'List users') {
                            url = westerb_sal.HOME + 'admin/list_users.php';
                            requested_pg_name = 'list_users'
                        }

                        else if ($(this).text() === 'List albums') {
                            url = westerb_sal.HOME + 'admin/list_albums.php';
                            requested_pg_name = 'list_albums'
                        }

                        else if (/to_list_photos_/.test($(this).attr('id'))) {
                            url = westerb_sal.HOME + 'admin/list_photos.php?a_id=' + $(this).parent('div.album').attr('a_id');
                            requested_pg_name = 'list_photos'
                        }

                        else if ($(this).text() === 'View log file') {
                            url = westerb_sal.HOME + 'admin/logfile.php';
                            requested_pg_name = 'logfile'
                        }

                        var pre_stored_page_state = westerb_sal.retrieve_main_page_state(requested_pg_name === 'list_photos' ? ('#' + requested_pg_name + '_' + $(this).parent('div.album').attr('a_id')) : ('#' + requested_pg_name));
                        //REFINE THE CASE WHEN IT'S STILL 'public_index' but 'a_id'/'o_id'/'p_id/c_set are set??????????????
                        if (window.location.hash === '#' + requested_pg_name || ($(this).attr('id') === 'home' && westerb_sal.cur_pg === 'public_index' &&
                                (!westerb_sal.get_url_param_value('o_id') && !westerb_sal.get_url_param_value('c_set') &&
                                        !westerb_sal.get_url_param_value('a_id') && !westerb_sal.get_url_param_value('p_id'))))
                            ; //no need to 'refresh' the page if the request is for the page that's already on display (will especially help prevent unnecessary "for-home" hash changes)
                        else {
                            $('#main').append("<div style='display: none; ' id='temp_content_holder'></div>"); //append a temporary div for storing the URL-fetched/pre_stored string to be appended to the DOM later
                            westerb_sal.request_done = false;
                            if (pre_stored_page_state) {
                                $('#temp_content_holder').html(pre_stored_page_state);
                                westerb_sal.change_hash();
                            }
                            else {
                                westerb_sal.reposition_main_p_msg(); //center the element first
                                $('#main_processing_msg').css('z-index', '5000').get(0).processing_msg();
                                $('#temp_content_holder').load(url + ' #main', 'hash_change_pg_call', westerb_sal.handle_get_changer_content_response);
                            }
                        }
                    }
                    return false;
                }, writable: false, enumerable: true, configurable: true
            });

//extending "Object.prototype.westerb_sal" with helper functions relevant for to the 'public_index.php' page
    Object.defineProperties(Object.prototype.westerb_sal, {
        xhr_switch_owner: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        handle_switch_owner_response: {
            value: function() {
                if (westerb_sal.xhr_switch_owner.readyState === 4) {
                    westerb_sal.clear_p_timers(); //to prevent the possibility of the content from 'responseText'/'status' that's about to be appended from being overwritten
                    if (westerb_sal.xhr_switch_owner.status === 200) {
                        westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_s' + westerb_sal.pagination.current_set, westerb_sal.xhr_switch_owner.responseText);
                        $('div.movable').hide().html(westerb_sal.xhr_switch_owner.responseText).fadeIn(600);
                        westerb_sal.readjust_general_public_elems();
                    } else {
                        $('div.movable').html("<div id='pholder_f_msg'>failure: " + westerb_sal.xhr_switch_owner.status + "</div>"); /////////////////////////
                    }
                }
            }, writable: true, enumerable: true, configurable: true
        },
        switch_owner: {
            value: function() {
                if ($(this).hasClass('current'))
                    ;
                else {
                    $('.public_albums_nav_link').each(function() {
                        $(this).removeClass('current');
                    })
                    $(this).addClass('current');
                    $('#s_group_id').attr('s_group', 'o_id=' + $(this).attr('o_id'));
                    $('#by').text($(this).attr('o_id') === 'all' ? 'All albums' : 'Albums by' + $(this).text().replace('By', ''));
                    $('#u_count').text($(this).attr('u_count'));
                    westerb_sal.pagination.current_set = 1;
                    westerb_sal.pagination.set_group = 'o_id=' + $(this).attr('o_id');
                    westerb_sal.pagination.albums_owner = $(this).attr('o_id');
                    $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                    westerb_sal.pagination.adjust_prev_and_next();

                    $('div.movable').children().fadeOut(200);
                    var pre_stored_set = westerb_sal.retrieve_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_s' + westerb_sal.pagination.current_set);
                    if (!pre_stored_set) {
                        $('div.movable').html("<div id='pholder_p_msg'></div>");
                        $('#pholder_p_msg').get(0).processing_msg('Loading');
                        westerb_sal.xhr_switch_owner.open('get', westerb_sal.HOME + 'ajax/' + westerb_sal.cur_pg + '_u_retrieve.php?u_per_set=' + westerb_sal.pagination.units_per_set + '&offset=' + westerb_sal.pagination.offset() + '&o_id=' + westerb_sal.pagination.albums_owner + '&a_id=' + westerb_sal.pagination.album_selected, true);
                        westerb_sal.xhr_switch_owner.send(null);
                    } else {
                        $('div.movable').hide().html(pre_stored_set).fadeIn(600);
                        westerb_sal.readjust_general_public_elems();
                    }
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        clear_small_screen_for_full: {
            value: function() {
                $('#header').slideUp(500, function() {
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': Header just finished sliding up');
                });
                $('#footer').slideUp(500, function() {
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': Footer just finished sliding up');
                });
                $('#outer_wrapper').fadeOut(80, function() {
                    $(this).remove();
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The album group\'s outer wrapper just removed from the DOM');
                });
                var opacity = 0;
                (function increment_opacity() {
                    $('body').css('background-color', 'rgba(170, 170, 170, ' + opacity + ')');
                    opacity = opacity + .1;
                    if (opacity <= 1)
                        setTimeout(increment_opacity, 80);
                    if (opacity === 1) {
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The background color is now fully opaque');
                    }
                })();
            }, writable: true, enumerable: true, configurable: true
        },
        clear_full_screen_for_small: {
            value: function(e) {
                $('#outer_wrapper, #big_error_report').fadeOut(80, function() {
                    $(this).parent('div.centering').html('').removeClass('mini_full_screen');
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The album\'s outer wrapper just removed from the DOM');
                });
                var opacity = 1;
                (function decrement_opacity() {
                    $('body').css('background-color', 'rgba(170, 170, 170, ' + opacity + ')');
                    opacity = opacity - .1;
                    if (opacity > .1)
                        setTimeout(decrement_opacity, 80);
                    if (opacity < .1) {
                        $('body').css('background-color', 'transparent');
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The background color is now fully transparent');
                    }
                })();
                $('#header').slideDown(400, function() {
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': Header just finished sliding down');
                });
                $('#footer').slideDown(400, function() {
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': Footer just finished sliding down');
                });
            }, writable: true, enumerable: true, configurable: true
        },
        restore_prev_state: {
            value: function(e) {
                var to_main_home = ($(this).text() == 'BACK TO ALBUMS') ? true : false, /*stall_time = to_main_home?150:150,*/
                        prev_o_w_s_name = to_main_home ? westerb_sal.prev_albums_o_w_st_name : westerb_sal.prev_album_o_w_st_name,
                        prev_o_w_s_set_no = to_main_home ? westerb_sal.prev_albums_o_w_st_set_no : westerb_sal.prev_album_o_w_st_set_no;
                //if($(this).text() == 'BACK TO ALBUMS') {
                //console.log(Date().slice(16,24)+':'+new Date().getMilliseconds()+': "restore_prev_state()" has just been called');
                if (to_main_home)
                    westerb_sal.clear_full_screen_for_small();
                else {
                    $('#outer_wrapper, #big_error_report').fadeOut(80, function() {
                        $(this).parent('div.centering').html('');
                    });
                }
                setTimeout(function() { //delay for 'clear_full_screen_for_small' to finish animating
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The centering div is now being hidden, the markup for the previous album group\'s o_w_s appended, and starting to fade in');
                    $('div.centering:last').hide().append(westerb_sal.retrieve_outer_wrapper_state(prev_o_w_s_name)).fadeIn(200, function() {
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The centering div has just finished to fade in');
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The o_w_s name that was passed to retrieve the o_w_s for restoration is: '+$('.centering:last').data('prev_albums_state_name'));
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The o_w_s markup that was returned and appended to the centering div is: '+westerb_sal.retrieve_outer_wrapper_state($('.centering:last').data('prev_albums_state_name')));
                    }); //restore the 'outer wrapper' state for the album/group of albums that was/were there when the photo/album was clicked and displayed
                    westerb_sal.pagination = new westerb_sal.Pagination; //reset the pagination instance so that it knows which set group it's working with
                    westerb_sal.pagination.current_set = prev_o_w_s_set_no; //also, let it know what the current set
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The pagination current_set property is now: '+$('.centering:last').data('prev_albums_state_set#'));
                }, 150/*stall_time*/);
                //}
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        apply_mini_full_screen_styles: {
            value: function() {
                $('.centering, .photo img, .u_wrapper.non_photo, #title h2, #title #ux_nav_guide, .scriptable_gen_nav_link, #unit_info, #album_info, .no_content, #big_error_report, #big_error_report #msg, #big_error_report #exit, #outer_wrapper + #for_margin').addClass('mini_full_screen');
                $('#outer_wrapper').hasClass('selected_photo_wrapper') ? westerb_sal.readjust_gallery_elems() : westerb_sal.readjust_general_public_elems();
            }, writable: true, enumerable: true, configurable: true
        },
        display_album: {
            value: function(pre_stored_album_wrapper_state) {
                stall_time = (pre_stored_album_wrapper_state) ? 200 : 120;
                setTimeout(function() {
                    var content = pre_stored_album_wrapper_state || westerb_sal.xhr_get_album_for_display.responseText;
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': After the '+stall_time+'ms stall, the centering div is being appended the markup: \n'+content);
                    $('div.centering:last').append(content);
                    westerb_sal.apply_mini_full_screen_styles();
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The selected album is starting to fade in');
                    $('#outer_wrapper').fadeIn(200, function() {
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The selected album has finished to fade in');
                    });
                    var photo = $('.unit.photo').toArray(), photo_count = photo.length, i = 0, duration = 300;
                    if (photo_count !== 0) { //there is at least one 'photo' to animate
                        (function fade_in_photo() {
                            $(photo[i]).show(duration, function() {
                                i++;
                                duration = duration - 50;
                                if (i < photo_count)
                                    fade_in_photo();
//                            if(i === photo_count)
//                                console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The last photo in the album set being animated...');
                            });
                        })();
                    }
                    westerb_sal.pagination = new westerb_sal.Pagination; //reset the pagination instance so that it now knows it's working with the photo sets of the selected album
                    westerb_sal.pagination.current_set = 1; //with each selected and now displayed album, the pagination will always start counting from set number 1
                }, stall_time); //wait for the 'outer_wrapper' for the albums content to completely fadeOut and be removed first
            }, writable: true, enumerable: true, configurable: true
        },
        display_photo: {
            value: function(pre_stored_photo_wrapper_state) {
                stall_time = (pre_stored_photo_wrapper_state) ? 200 : 120;
                setTimeout(function() {
                    var content = pre_stored_photo_wrapper_state || $('#temp_content_holder').html();
                    $('#temp_content_holder').remove();
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': After the '+stall_time+'ms stall, the centering div is being appended the markup: \n'+content);
                    $('div.centering:last').append(content);
                    if (westerb_sal.selected_from_album)
                        $('#to_albums_nav').removeClass('fullscreen_closer').text('BACK TO ALBUM');
                    else
                        $('#to_albums_nav').addClass('fullscreen_closer').text('BACK TO ALBUMS');
                    westerb_sal.apply_mini_full_screen_styles();
                    //if($('#unit_wrapper img').hasClass('comments_locked')) //if the photo in the o_w_s already has the class, it means it'd already been commented on by the user and the '.field_msg.char_counter' span elements were saved into the o_w_s when the state was re-stored; remove them first because they're going to be appended again with the new instance of Form
                    $('.field_msg.char_counter').remove(); //always remove the '.field_msg.char_counter' span elements in case they were saved into the o_w_s because they're going to be appended again with the new instance of Form
                    westerb_sal.form = new westerb_sal.Form;
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The selected album is starting to fade in');
                    $('#outer_wrapper').fadeIn(200, function() {
                        //westerb_sal.readjust_gallery_elems();
                        //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The selected album has finished to fade in');
                    });
                    if (parseInt($('#c_count').children('span').text()) > 8)
                        $('#loaded_info').scroll(westerb_sal.load_more_public_comments);
                    westerb_sal.pagination = new westerb_sal.Pagination; //reset the pagination instance so that it now knows it's working with the photo set
                    westerb_sal.pagination.current_set = parseInt($('#on_display_gallery_img').attr('c_set')); //with each selected and now displayed photo, the pagination should always start counting from whatever set number the photo unit represents
                }, stall_time); //wait for the 'outer_wrapper' for the album content to completely fadeOut and be removed first
            }, writable: true, enumerable: true, configurable: true
        },
        xhr_get_album_for_display: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        handle_get_album_for_display_error: {
            value: function() { //GET ERROR MESSAGE MORE ARBITRARILY THROUGH SERVER's RESPONSE EVEN IN PRODUCTION??????????????
                var str = westerb_sal.dev_mode ? westerb_sal.xhr_get_album_for_display.status : 'Oops! Something went wrong while loading the album'
                $('div.centering:last').append("<div style='display: none; ' id='big_error_report'>" +
                        "<div id='msg'>" + str + "</div>" +
                        "<div id='exit' class='ui_button'><a style='text-decoration: none; " +
                        "display: block; color: #fff; height: 100%; width: 97%; padding: 5% 1.5%; " +
                        "' href='.' class='fullscreen_closer scriptable_prev_state_restorer'>BACK TO ALBUMS" +
                        "</a></div>" +
                        "</div>");
                westerb_sal.apply_mini_full_screen_styles();
                $('#big_error_report').fadeIn(250);
            }, writable: true, enumerable: true, configurable: true
        },
        clicked_album_id: {
            value: '', writable: true, enumerable: true, configurable: true
        },
        clicked_photo_suffix_info: {
            value: '', writable: true, enumerable: true, configurable: true
        },
        prev_albums_o_w_st_name: {
            value: '', writable: true, enumerable: true, configurable: true
        },
        prev_albums_o_w_st_set_no: {
            value: '', writable: true, enumerable: true, configurable: true
        },
        prev_album_o_w_st_name: {
            value: '', writable: true, enumerable: true, configurable: true
        },
        prev_album_o_w_st_set_no: {
            value: '', writable: true, enumerable: true, configurable: true
        },
        selected_from_album: {
            value: false, writable: true, enumerable: true, configurable: true
        },
        handle_get_album_for_display_response: {
            value: function() {
                if (westerb_sal.xhr_get_album_for_display.readyState === 4) {
                    westerb_sal.clear_p_timers();
                    $('#main_processing_msg').html('').css('z-index', '-1');
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': The album to display has finished fetching');
                    if (westerb_sal.xhr_get_album_for_display.status === 200) {
                        if (/Error|Warning|Notice/i.test(westerb_sal.xhr_get_album_for_display.responseText))
                            westerb_sal.handle_get_album_for_display_error();
                        else {
                            westerb_sal.display_album();
                            westerb_sal.store_outer_wrapper_state('album_wrapper_a_id_' + westerb_sal.clicked_album_id + '_set1', westerb_sal.xhr_get_album_for_display.responseText);
                        }
                    } else
                        westerb_sal.handle_get_album_for_display_error();
                }
            }, writable: true, enumerable: true, configurable: true
        },
        handle_get_photo_for_display_response: {
            value: function(response, $_status_code, xhr) {
                westerb_sal.clear_p_timers();
                $('#main_processing_msg').css('z-index', '-1').html('');
                switch ($_status_code) {
                    case 'error':
                        //CONSIDER CHECKING THE RESPONSE/XHR ARGUMENT FOR MORE DETAILS ON THE ERROR (response/xhr.status)--for 'dev_mode' especially???????????????????????
                        westerb_sal.display_dialog_msg();
                        break;
                    case 'timeout':
                        westerb_sal.display_dialog_msg('The request is taking too long. Please refresh the page and try again', 'notice');
                        break;
                    case 'success':
                        westerb_sal.display_photo();
                        westerb_sal.store_outer_wrapper_state('photo_wrapper_pa_id_' + westerb_sal.clicked_photo_suffix_info, response);
                        break;
                }
            }, writable: true, enumerable: true, configurable: true
        },
        get_album_for_display: {
            value: function(e) {
                var pre_stored_album_wrapper_state = westerb_sal.retrieve_outer_wrapper_state('album_wrapper_a_id_' + $(this).parent('div.album').attr('a_id') + '_set1'),
                        cur_albums_state_name = 'albums_wrapper_' + $('.public_albums_nav_link.current').text() + '_set' + westerb_sal.pagination.current_set;
                westerb_sal.prev_albums_o_w_st_name = cur_albums_state_name; //used to let 'BACK TO ALBUMS' know what previous 'outer_wrapper' state for albums to revert to
                westerb_sal.prev_albums_o_w_st_set_no = westerb_sal.pagination.current_set; //when the 'outer_wrapper' state for the current album group is later restored, this will be used to let the application know at what set number the navigation was left off
                if (pre_stored_album_wrapper_state) { //if Session already has stored an 'outer_wrapper' state for the album that's just clicked/selected, restore it from local memory, instead of fetching from the server
                    //console.log(Date().slice(16,24)+':'+new Date().getMilliseconds()+': Loading the prestored album wrapper: '+'album_wrapper_a_id_'+$(this).parent('div.album').attr('a_id'));
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': BACK TO ALBUMS will return to: '+cur_albums_state_name+', and the pagination current_set will be set to: '+westerb_sal.pagination.current_set);
                    westerb_sal.store_outer_wrapper_state(cur_albums_state_name) //store the current 'outer wrapper' state for the albums before all else, 'coz just because the 'outer_wrapper' state for the clicked/selected album was already pre-stored, doesn't neccessarily mean the same is true for the album group (the same album can be clicked/selected from different sets of two different album groups-- by "All" or by a specific owner)
                    westerb_sal.clear_small_screen_for_full();
                    westerb_sal.display_album(pre_stored_album_wrapper_state);
                } else {
                    //console.log(Date().slice(16,24)+':'+new Date().getMilliseconds()+': Loading a fresh album wrapper: '+'album_wrapper_a_id_'+$(this).parent('div.album').attr('a_id'));
                    westerb_sal.clicked_album_id = $(this).parent('div.album').attr('a_id'); //used to reference the most recently clicked/selected album
                    westerb_sal.store_outer_wrapper_state(cur_albums_state_name) //store the current 'outer wrapper' state for the albums before all else, taking into account the 'albums by' and 'current_set' information in the state name
                    westerb_sal.reposition_main_p_msg(); //center the element first
                    $('#main_processing_msg').css('z-index', '5000').get(0).processing_msg();
                    westerb_sal.clear_small_screen_for_full();
                    westerb_sal.xhr_get_album_for_display.open('get', westerb_sal.HOME + 'index.php?a_id=' + $(this).parent('div.album').attr('a_id') + '&ajax', true);
                    westerb_sal.xhr_get_album_for_display.send(null);
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        get_photo_for_display: {
            value: function(e) {
                var pre_stored_photo_wrapper_state = westerb_sal.retrieve_outer_wrapper_state('photo_wrapper_pa_id_' + $(this).parents('[a_id]').attr('a_id') + '_s_' + $(this).attr('s_no')),
                        cur_o_w_s_name = $('#outer_wrapper').hasClass('selected_album_wrapper') ? ('album_wrapper_a_id_' + $(this).parents('[a_id]').attr('a_id') + '_set' + westerb_sal.pagination.current_set) : ('albums_wrapper_' + $('.public_albums_nav_link.current').text() + '_set' + westerb_sal.pagination.current_set);
                //The following four assignments will be used to let 'BACK TO ALBUM/BACK TO ALBUMS' know what previous 'outer_wrapper' state to revert to
                //and when the 'outer_wrapper' state for the current album/album group is later restored, the second assignments in the conditionals  will be used to let the application know at what set number the navigation was left off
                if ($('#outer_wrapper').hasClass('selected_album_wrapper')) {
                    westerb_sal.prev_album_o_w_st_name = cur_o_w_s_name;
                    westerb_sal.prev_album_o_w_st_set_no = westerb_sal.pagination.current_set;
                    westerb_sal.selected_from_album = true; //to ensure that the '#to_albums_nav' link doesn't behave erratically (because, for example, if there's a pre-stored photo o_w_s that got stored when it was selected form an album, the link would have been stored as 'BACK TO ALBUM', and selecting the same photo from "previews" in an album in an album group would still restore the same o_w_s and the link would still be 'BACK TO ALBUM' and navigational chaos ensues)
                } else {
                    westerb_sal.prev_albums_o_w_st_name = cur_o_w_s_name;
                    westerb_sal.prev_albums_o_w_st_set_no = westerb_sal.pagination.current_set;
                    westerb_sal.selected_from_album = false;
                }
                if (pre_stored_photo_wrapper_state) { //if Session already has stored an 'outer_wrapper' state for the photo that's just been clicked/selected, restore it from local memory, instead of fetching from the server
                    //console.log(Date().slice(16,24)+':'+new Date().getMilliseconds()+': Loading the prestored album wrapper: '+'album_wrapper_a_id_'+$(this).parent('div.album').attr('a_id'));
                    //console.log('\n\n'+Date().slice(16,24)+':'+new Date().getMilliseconds()+': BACK TO ALBUMS will return to: '+cur_albums_state_name+', and the pagination current_set will be set to: '+westerb_sal.pagination.current_set);
                    //if(!$('#outer_wrapper').hasClass('selected_album_wrapper')) //if the photo is selected from the "album previews" on an album in the current album group
                    westerb_sal.store_outer_wrapper_state(cur_o_w_s_name) //store the current 'outer wrapper' state for the albums/album before all else, 'coz just because the 'outer_wrapper' state for the clicked/selected photo was already pre-stored, doesn't neccessarily mean the same is true for the album group (the same photo can be clicked/selected from different sets of two different album groups-- by "All" or by a specific owner), and, for the album, the 'outer wrapper' state for the clicked/selected photo could have been stored through navigating the gallery, but that wouldn't mean the album's o_w_s was already stored
                    westerb_sal.clear_small_screen_for_full();
                    westerb_sal.display_photo(pre_stored_photo_wrapper_state);
                } else {
                    //console.log(Date().slice(16,24)+':'+new Date().getMilliseconds()+': Loading a fresh album wrapper: '+'album_wrapper_a_id_'+$(this).parent('div.album').attr('a_id'));
                    westerb_sal.clicked_photo_suffix_info = $(this).parents('[a_id]').attr('a_id') + '_s_' + $(this).attr('s_no'); //used to reference the most recently clicked/selected photo's o_w_s_name suffix information so that it can easily be stored later
                    westerb_sal.store_outer_wrapper_state(cur_o_w_s_name) //store the current 'outer wrapper' state for the album/albums before all else; for the case it's an album, storing it here may be redundant since it's o_w_s is stored when the album is selected from an albums group, but this is precautionary-- in case the album was accessed through the URL, as opposed to being clicked/selected (REVISIT: MIGHT NEED TO GO IF RESTRICTION OF NAVIGATION THROUGH THE URL IS IMPLEMENTED)
                    westerb_sal.reposition_main_p_msg(); //center the element first
                    $('#main_processing_msg').css('z-index', '5000').get(0).processing_msg();
                    westerb_sal.clear_small_screen_for_full();
                    $('#main').append("<div style='display: none; ' id='temp_content_holder'></div>"); //append a temporary div for storing the URL-fetched HTML string
                    $('#temp_content_holder').load($(this).attr('href') + '&ajax', westerb_sal.handle_get_photo_for_display_response);
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        scroll_thumbs_wrapper_timer: {
            value: null, writable: true, enumerable: true, configurable: true
        },
        scroll_thumbs_wrapper: {
            value: function() {
                var scrolled_wrapper = $('#gallery_thumbs_wrapper')
                scrolled_wrapper.scrollLeft(scrolled_wrapper.scrollLeft() + 1);
                if (scrolled_wrapper.scrollLeft() < scrolled_wrapper.prop('scrollWidth') - Math.ceil(scrolled_wrapper.innerWidth()))
                    westerb_sal.scroll_thumbs_wrapper_timer = window.setTimeout(westerb_sal.scroll_thumbs_wrapper, 20);
                else {
                    westerb_sal.scroll_thumbs_wrapper_timer = window.setTimeout(function() {
                        scrolled_wrapper.scrollLeft(0);
                        westerb_sal.scroll_thumbs_wrapper();
                    }, 600);
                }
            }, writable: true, enumerable: true, configurable: true
        },
        stop_thumbs_wrapper_scroll: {
            value: function() {
                window.clearTimeout(westerb_sal.scroll_thumbs_wrapper_timer);
            }, writable: true, enumerable: true, configurable: true
        },
        load_more_public_comments: {
            value: function(e) {
                //console.log('scroll top: '+$(this).scrollTop());
                //console.log('scroll height: '+$(this).prop('scrollHeight'));
                //console.log('inner height: '+$(this).innerHeight());
                if ($(this).scrollTop() === $(this).prop('scrollHeight') - Math.ceil($(this).innerHeight())) {//console.log('at the bottom of scroll...');
                    if (westerb_sal.request_done) {
                        if (westerb_sal.blocking_dialog) {
                            westerb_sal.scroll_to_dialog();
                            westerb_sal.highlight_dialog(e);
                        }
                        else {
                            var s_pagination = new westerb_sal.Scroll_Pagination,
                                    cur_set = parseInt($(this).attr('cur_set'), 10);
                            westerb_sal.request_done = false;
                            s_pagination.current_set = cur_set;
                            //console.log('Current set: '+s_pagination.current_set);console.log('Comment count: '+s_pagination.unit_count());
                            if (!s_pagination.next_set())
                                westerb_sal.request_done = true;
                            else {
                                $(this).append("<div id='temp_a_processing_msg' style='position: absolute; top: " + ($(this).prop('scrollHeight') - 40) + "px; left: " + (($(this).innerWidth() - 178) / 2) + "px; font-weight: bold; font-size: 19px'></div>");
                                $('#temp_a_processing_msg').get(0).processing_msg('Loading more');
                                s_pagination.current_set++;
                                $('#main').append("<div style='display: none; ' id='temsp_content_holder'></div>");
                                //console.log('requested URL: '+westerb_sal.HOME+'ajax/misc_calls.php?pc_id='+$('#unit_wrapper img').attr('p_id')+'&u_per_set='+s_pagination.units_per_set+'&offset='+s_pagination.offset()+'&public_comments')
                                $('#temp_content_holder').load(westerb_sal.HOME + 'ajax/misc_calls.php?pc_id=' + $('#unit_wrapper img').attr('p_id') + '&u_per_set=' + s_pagination.units_per_set + '&offset=' + s_pagination.offset() + '&public_comments', function(response, $_status_code, xhr) {
                                    //console.log('The reponse status: '+xhr.status)
                                    //console.log('The reponse HTML: '+response)
                                    switch ($_status_code) {
                                        case 'error':
                                            //CONSIDER CHECKING THE RESPONSE/XHR ARGUMENT FOR MORE DETAILS ON THE ERROR (response/xhr.status)--for 'dev_mode' especially???????????????????????
                                            westerb_sal.display_dialog_msg('Something went wrong while loading more comments. You can try again later', 'error');
                                            break;
                                        case 'timeout':
                                            westerb_sal.display_dialog_msg('Loading more comments is taking too long. Please try again', 'notice');
                                            break;
                                        case 'success'://console.log('successful loading of more comments')
                                            westerb_sal.clear_p_timers();
                                            $(this).children('#comments').append($('#temp_content_holder').html());
                                            $('#temp_content_holder, #temp_a_processing_msg').remove();
                                            $('#loaded_info').attr('cur_set', parseInt($(this).attr('cur_set'), 10) + 1); //increment the 'cur_set' value so that the next 'load_more' fetches the right set
                                            westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set, $('#unit_wrapper').html() + '<div id=\'loaded_info\' cur_set=\'' + $('#loaded_info').attr('cur_set') + '\'>' + $('#loaded_info').html() + '</div>');
                                            if ($('#unit_wrapper').attr('pa_id') + '_s_' + $(this).attr('s_no') === westerb_sal.clicked_photo_suffix_info) { //if this photo is the photo that was most recently clicked from an album/album group, restore it's o_w_s too so that the changes are reflected next time it's clicked and loaded locally
                                                $('input[name=author], textarea').blur() //sanitize the comment form section firt before storage so that next time the o_w_s is restored from local storage it still looks the way the whole page looks when eveything was loaded fresh from the server; if, however, there's some user input, it'll be stored as part of the state
                                                if ($('.field_msg#comment').hasClass('notice_msg') || $('.field_msg#comment').hasClass('error_msg')) { //if for some reason a notice or error message was displayed, clear it
                                                    $('textarea').removeClass('notice_bordered error_bordered');
                                                    $('.field_msg#comment').removeClass('notice_msg error_msg').addClass('char_counter').text($('textarea').attr('maxlength'));
                                                }
                                                westerb_sal.store_outer_wrapper_state('photo_wrapper_pa_id_' + westerb_sal.clicked_photo_suffix_info, $('.centering:last').html());
                                            }
                                            westerb_sal.request_done = true;
                                            $('#wait_msg').fadeOut(10, function() {
                                                $(this).remove();
                                            });
                                            break;
                                    }
                                });
                            }
                        }
                    } else
                        ;
                }
            }, writable: true, enumerable: true, configurable: true
        }
    });
    westerb_sal.xhr_switch_owner.onreadystatechange = westerb_sal.handle_switch_owner_response;
    westerb_sal.xhr_get_album_for_display.onreadystatechange = westerb_sal.handle_get_album_for_display_response;

//extending "Object.prototype.westerb_sal" with helper functions relevant for to the 'list_albums.php' page (Admin and Normal) and the 'list_photos.php' page
    Object.defineProperties(Object.prototype.westerb_sal, {
        clicked_input_parent: {
            value: null, writable: true, enumerable: true, configurable: true
        },
        highlight_dialog: {
            value: function(e) {
                if (!westerb_sal.animating) {
                    westerb_sal.animating = true;
                    var box_id = '', colours = ['35, 197, 197, ', '', '162, 25, 31, ', '', '195, 101, 0, ', '', '147, 165, 11, '];
                    //if(!e.data) box_id = 'blinker';
                    //else box_id = e.data.box_id;
                    box_id = 'blinker';
                    var i = 0;
//                        $('#'+box_id).css({'border-color':'transparent', 'background-color':'transparent'}).fadeIn(150).
//                        fadeOut(150).css({'border-color':'rgba('+colours[i]+')', 'background-color':'rgba('+colours[i++]+')'}).
//                        fadeIn(150).fadeOut(150).css({'border-color':'rgba('+colours[i]+')', 'background-color':'rgba('+colours[i++]+')'}).
//                        fadeIn(150).fadeOut(150).css({'border-color':'rgba('+colours[i]+')', 'background-color':'rgba('+colours[i++]+')'}).
//                        fadeIn(150).fadeOut(150).fadeIn();
                    (function animate() {
                        $('#' + box_id).css({'border-color': 'transparent', 'background-color': 'transparent'});

                        for (var j = 0; j <= .8; j += .1) {
                            $('#' + box_id).css({'border-color': 'rgba(' + colours[i] + j + ')', 'background-color': 'rgba(' + colours[i] + j + ')'});
                        }
                        i++;
                        if (i < 7)
                            window.setTimeout(animate, 150);
                    })();
                    window.setTimeout(function() {
                        $('#' + box_id).css({'border-color': 'transparent', 'background-color': 'transparent'});
                        for (var i = 0; i <= .8; i += .1) {
                            $('#' + box_id).css({'border-color': 'rgba(' + i + ')', 'background-color': 'rgba(' + i + ')'});
                        }
                    }, 1050);
                    window.setTimeout(function() {
                        $('#' + box_id).css({'border-color': 'transparent', 'background-color': 'transparent'});
                        for (var j = 0; j <= .8; j += .1) {
                            $('#' + box_id).css({'border-color': 'rgba(29, 29, 29, ' + j + ')', 'background-color': 'rgba(96, 96, 96, ' + j + ')'});
                        }
                        westerb_sal.animating = false;
                    }, 1200);
                    $('#blocking_modal_alert').get(0).play();
                } else
                    ;
            }, writable: true, enumerable: true, configurable: true
        },
        confirm_del: {
            value: function(e) {
                if (!westerb_sal.blocking_dialog) {
                    if (westerb_sal.request_done) {
                        if ($(this).children('div').hasClass('delete') && parseInt($(this).siblings('div.date_owner').children('div:last').text()) == 0)
                            westerb_sal.del_album_on_list_albums($(this).parent('div.album'));
                        else {
                            if ($(this).parent('span').hasClass('del_coms_parent') ||
                                    $(this).parent('span').hasClass('del_albums_parent') ||
                                    $(this).parent('div').hasClass('album')) {
                                $('.active').removeClass('active');
                                $(this).parent('div').hasClass('album') ? $(this).parent('div').addClass('active') : $(this).parent('span').addClass('active');
                            }
                            westerb_sal.blocking_dialog = true;
                            westerb_sal.confirm_del_dialog(e, $(this));
                        }
                    } else
                        westerb_sal.please_wait_msg(e);
                } else
                    westerb_sal.scroll_to_dialog();
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        xhr_del_all: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        confirm_del_dialog: {
            value: function(evt, trigger) {
                $("body").append("<div class='blocking_dialog' id='blinker' style='position: absolute; max-width: 320px; border: 3px dotted rgba(29, 29, 29, .8); background-color: rgba(96, 96, 96, .8); padding: 2px; border-radius: 5px; z-index: 2000; '><div class='blocking_dialog' id='del_confirm_dialog' style='background-color: rgba(245, 245, 245, .9); padding: 4px 8px; box-sizing: border-box; '></div></div>");
                var confirm_msg = callback = what = d_trigger_parent = a_by = '', count = 0;
                switch (trigger.text()) {
                    case('Delete all photos'):
                        confirm_msg = 'Are you sure you want to delete all photos on this album?';
                        callback = westerb_sal.del_all_photos;
                        what = 'photos';
                        d_trigger_parent = $('span.del_all_photos');
                        break;
                    case('Delete album'):
                        confirm_msg = "Are you sure you want to delete this album from The S<span class='a'>a</span><span class='l'>l</span><span class='o'>o</span><span class='n'>n</span>?";
                        callback = westerb_sal.del_album;
                        what = 'album';
                        d_trigger_parent = $('span.del_album');
                        break;
                    case('Delete all comments'):
                        confirm_msg = 'Are you sure you want to delete all comments on this photo?';
                        callback = westerb_sal.del_all_comments;
                        what = 'comments';
                        d_trigger_parent = $('span.del_coms_parent.active');
                        break;
                    case('Delete all albums'):
                        a_by = trigger.parent('span.del_albums_parent').parent('p').parent('div.inner_a_wrapper').parent('div.albums').siblings('div.o_name').attr('by');
                        count = parseInt(trigger.parent('span.del_albums_parent').siblings('span').text());
                        confirm_msg = a_by == 'All albums' ? "Are you sure you want to delete all " + count + " albums on The S<span class='a'>a</span><span class='l'>l</span><span class='o'>o</span><span class='n'>n</span>?" : "Are you sure you want to delete all " + count + " albums by " + (a_by.replace('By ', ''));
                        callback = del_all_albums; //////////////////////////////////////??????????????????
                        what = 'albums';
                        d_trigger_parent = $('span.del_albums_parent.active');
                        break;
                    default:
                        count = parseInt(trigger.siblings('div.date_owner').children('div:last').text());
                        confirm_msg = 'Are you sure you want to delete this album and the ' + count + ' photo' + (count == 1 ? '' : 's') + ' in it?';
                        callback = westerb_sal.del_album_on_list_albums;
                        what = 'album_on_list_albums';
                        d_trigger_parent = $('div.album.active');
                        break;
                }
                var content = "<div class='blocking_dialog' style='color: #333; font-weight: bold; font-size: 15px; line-height: 18px; '>" + confirm_msg + "</div>";
                content += "<div class='blocking_dialog' style='text-align: center; margin: 15px 0 4px; '>";
                content += "<div id='confirm_dialog_ok'style='display: inline-block' class='ui_button blocking_dialog dialog_choice'>DELETE</div>";
                content += "<div id='confirm_dialog_cancel' style='display: inline-block; margin-left: 20px' class='ui_button blocking_dialog dialog_choice'>CANCEL</div>";
                content += "</div>";

                var box = $("#del_confirm_dialog");
                box.parent("div").css("visibility", "hidden");
                box.html(content);
                box.parent("div").css({"top": evt.pageY - (parseInt(box.css("height")) / 2), "left": evt.pageX + 30}).hide().css("visibility", "visible").fadeIn(200);
                $(".dialog_choice").click(function() {
                    box.parent('div').fadeOut(200, function() {
                        $(this).remove();
                    });
                    westerb_sal.blocking_dialog = westerb_sal.animating = false;
                    $('a').unbind("click", westerb_sal.highlight_dialog);
                    $('div').not('div.blocking_dialog').unbind("click", westerb_sal.scroll_to_dialog);
                    $('div').not('div.blocking_dialog').unbind("click", westerb_sal.highlight_dialog);
                })

                $("#confirm_dialog_ok").bind('click', function() {
                    if (what !== 'album_on_list_albums') {
                        d_trigger_parent.css('width', '120px');
                        d_trigger_parent.get(0).processing_msg('Deleting');
                    }

                    function handle_del_all_response() {
                        if (westerb_sal.xhr_del_all.readyState === 4) {
                            if (westerb_sal.xhr_del_all.status === 200) {
                                switch (what) {
                                    case('photos'):
                                    case('album'):
                                        westerb_sal.visualize_all_photos_or_album_deletion(d_trigger_parent, what);
                                        break;
                                    case('comments'):
                                        westerb_sal.visualize_all_comments_deletion(d_trigger_parent);
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (what) {
                                    case('photos'):
                                    case('album'):
                                    case('comments'):
                                        westerb_sal.clear_p_timers();
                                        if (what === 'photos')
                                            d_trigger_parent.html("<a id='del_all' href='confirm_deletion.php?a_id=" + d_trigger_parent.attr('a_id') + "' class='scriptable_gen_link confirm_del'>Delete all photos</a>");
                                        else if (what === 'album')
                                            d_trigger_parent.html("<a id='del_album' href='confirm_deletion.php?da_id=" + d_trigger_parent.attr('a_id') + "' class='scriptable_gen_link confirm_del'>Delete album</a>");
                                        else
                                            d_trigger_parent.css('width', '160px').html("<a href='delete_comment.php?p_id=" + d_trigger_parent.parent('p').parent('div').parent('td').parent('tr').prev('tr').attr('p_id') + "' class='scriptable_gen_link confirm_del'>Delete all comments</a>");
                                        westerb_sal.display_tiny_msg("Failure: " + westerb_sal.xhr_del_all.status, "error", 4000) /////////////////////////////////////////
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                    westerb_sal.xhr_del_all.onreadystatechange = handle_del_all_response;
                    callback(d_trigger_parent, what);
                })

                $('a').bind('click', westerb_sal.highlight_dialog);
                $('div').not('div.blocking_dialog').bind('click', westerb_sal.scroll_to_dialog);
                $('div').not('div.blocking_dialog').bind('click', westerb_sal.highlight_dialog);
            }, writable: true, enumerable: true, configurable: true
        },
        modal_caller_parent: {
            value: null, writable: true, enumerable: true, configurable: true
        },
        modal_dialog: {
            value: function(evt, target, url) {
                westerb_sal.request_done = false; //OR FORM'S XHR BUSY????
                westerb_sal.modal_caller_parent = target.parent('div').hasClass('album') ? target.parent('div.album') : target.parent('span.modal_caller_parent');
                if (target.parent('div').hasClass('album'))
                    target.children('div.upload').css({'font-size': '12px', 'padding': '5px 0 5px 5px', 'text-align': 'left'}).get(0).processing_msg('Loading');
                else
                    westerb_sal.modal_caller_parent.get(0).processing_msg('Loading');

                var xhr_get_url_content = westerb_sal.create_xhr();

                function handle_get_url_content_response() {
                    if (xhr_get_url_content.readyState === 4) {
                        westerb_sal.clear_p_timers();
                        if (westerb_sal.modal_caller_parent.hasClass('album'))
                            target.children('div.upload').css({'font-size': '14px', 'padding': '5px 2px', 'text-align': 'center'}).text('Upload a photo');
                        else {
                            westerb_sal.modal_caller_parent.hasClass('new_photo') ? westerb_sal.modal_caller_parent.html("<a href='photo_upload.php?a_id=" + westerb_sal.modal_caller_parent.attr('a_id') + "' class='scriptable_gen_link photo_upload'>Upload a new photo</a>") : westerb_sal.modal_caller_parent.html("<a href='create_album.php' class='new_album_modal scriptable_gen_link'>Create a new album</a>");
                        }
                        if (xhr_get_url_content.status === 200) {
                            westerb_sal.blocking_dialog = true;

                            var str = "<div class='blocking_dialog' id='blinker' style='position: absolute; ";
                            str += "width: 815px; border: 3px dotted rgba(29, 29, 29, .8); background-color: ";
                            str += "rgba(96, 96, 96, .8); padding: 2px; border-radius: 5px; z-index: 2000; '><div id='title_bar' class='blocking_dialog' ";
                            str += "style='background-color: rgba(195, 195, 195, 0.9); padding: 5px 7px; font-weight: bold; '>";
                            str += "<span style='font-size: 14px; color: #222; '>" + ((westerb_sal.modal_caller_parent.hasClass('album') || westerb_sal.modal_caller_parent.hasClass('new_photo')) ? "Upload a new photo" : "Create a new album") + "</span><div ";
                            str += "class='blocking_dialog' id='close_dialog' style='position: absolute; top: 0; right: 0; font-size: ";
                            str += "18px; padding: 5px; background-color: rgba(19, 17, 17, 0.3); color: #fff; ";
                            str += "text-align: center; transition: .3s; cursor: pointer'>&#x2717;</div>";
                            str += "<div id='modal_processing_msg' class='blocking_dialog' style='position: absolute; top: 305px; left: 120px; width: 140px; ";
                            str += "z-index: 100; color: #222; '></div><div id='msg_wrapper' class='blocking_dialog' style='position: absolute; top: 2px; ";
                            str += "left: 220px; width: 422px; z-index: 100; '></div></div><div ";
                            str += "class='blocking_dialog' id='modal_dialog' style='background-color: rgba(245, 245, 245, .9); ";
                            str += "padding: 15px 8px; box-sizing: border-box; '></div></div>";
                            $("body").append(str);

                            var box = $('#modal_dialog');
                            box.parent('div').css('visibility', 'hidden');
                            box.html(xhr_get_url_content.responseText);
                            westerb_sal.form = new westerb_sal.Form;
                            box.parent('div').css({'top': ((window.innerHeight - (parseInt(box.css('height')))) / 2) + westerb_sal.getScrollOffsets().y, 'left': ((window.innerWidth - (parseInt(box.css('width')))) / 2) + westerb_sal.getScrollOffsets().x}).hide().css('visibility', 'visible').fadeIn(200, function() {
                                $('#wait_msg').fadeOut(10, function() {
                                    $(this).remove();
                                });
                                westerb_sal.request_done = true;
                            });

                            $(document).scroll(westerb_sal.reposition_modal_box);
                            $(window).resize(westerb_sal.reposition_modal_box);

                            function close_box() {
                                if (westerb_sal.modal_caller_parent.hasClass('album') || westerb_sal.modal_caller_parent.hasClass('new_photo')) //if it's a photo upload modal, clear interval calls incase a photo was selected but not uploaded before the modal is closed
                                    for (h = 0; h < 10000; h++)
                                        window.clearInterval(h); //a HACK for clearing interval calls set during photo validation
                                box.parent('div').fadeOut(200, function() {
                                    $(this).remove();
                                    westerb_sal.blocking_dialog = westerb_sal.animating = false;
                                });
                                $('a').unbind('click', westerb_sal.highlight_dialog);
                                $('div').not('div.blocking_dialog').unbind('click', westerb_sal.scroll_to_dialog);
                                $('div').not('div.blocking_dialog').unbind('click', westerb_sal.highlight_dialog);
                                $(document).unbind('scroll', westerb_sal.reposition_modal_box);
                                $(window).unbind('resize', westerb_sal.reposition_modal_box);
                            }

                            $('#close_dialog').click(function(e) {
                                if (!westerb_sal.request_done || westerb_sal.form.xhr_in_progress)
                                    westerb_sal.please_wait_msg(e, true);
                                else
                                    close_box();
                            })

                            $('#close_dialog').hover(function() {
                                $(this).css('background-color', 'rgba(19, 17, 17, 0.6)')
                            }, function() {
                                $(this).css('background-color', 'rgba(19, 17, 17, 0.3)')
                            });
                            //$('span#photo').css('top','20px');

                            $('a').bind('click', westerb_sal.highlight_dialog);
                            $('div').not('div.blocking_dialog').bind('click', westerb_sal.scroll_to_dialog);
                            $('div').not('div.blocking_dialog').bind('click', westerb_sal.highlight_dialog);
                        } else
                            westerb_sal.display_msg('Failure: ' + xhr_get_url_content.status, 'error') /////////////////////////////////////////
                    }
                }
                xhr_get_url_content.onreadystatechange = handle_get_url_content_response;

                xhr_get_url_content.open('get', url, true);
                xhr_get_url_content.send(null);
            }, writable: true, enumerable: true, configurable: true
        },
        upload_photo_by_modal: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.modal_dialog(e, $(this), westerb_sal.HOME + 'ajax/misc_calls.php?new_photo_modal=' + (westerb_sal.cur_pg === 'list_albums' ? $(this).parent('div').attr('a_id') : $(this).parent('span').attr('a_id')));
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        exec_code_for_album_group: {
            value: function() {
                $('.hover_triggered').each(function() {
                    if ($(this).parents('div.albums').siblings('div.o_name').hasClass('clicked_o_name'))
                        $(this).hide();
                });

                var u_count = parseInt($('.clicked_o_name').siblings('div.albums').children('div.inner_a_wrapper').children('div.sect_head').children('span:first').text(), 10);
                if (u_count > 8) { //prevents creation of a new instance of 'Scroll_pagination' unless the album count is high enough to warrant the new instance
                    westerb_sal.s_pag_instances['o_id_' + $('.clicked_o_name').parent('div').attr('id')] = new westerb_sal.Scroll_Pagination;
                    $('.clicked_o_name').siblings('div.albums').bind('scroll', westerb_sal.load_more_albums);
                    $('.clicked_o_name').bind('click', {'s_pag_instance_id': 'o_id_' + $('.clicked_o_name').parent('div').attr('id'), 'this_o_name_div': $('.clicked_o_name')}, westerb_sal.destroy_s_pag_instance);
                }
            }, writable: true, enumerable: true, configurable: true
        },
        destroy_s_pag_instance: {
            value: function(e) {
                if (westerb_sal.cur_pg === 'list_albums') {
                    if (!westerb_sal.blocking_dialog) {
                        window.setTimeout(function() {
                            if (westerb_sal.request_done) {
                                delete westerb_sal.s_pag_instances[e.data.s_pag_instance_id]; //deletes the 'scroll_pagination' instance for the album group, freeing up memory
                                e.data.this_o_name_div.siblings('div.albums').html('') //clears references to objects, aiding in GC(Garbage Collection)
                                e.data.this_o_name_div.unbind('click', westerb_sal.destroy_s_pag_instance);
                            }
                        }, 820); //wait for the section to finish sliding up. If sliding up goes through successfull, 'request_done' will be set to true and the code will run; if, otherwise, for some reason 'request_done' !== true (which can mean that the section wasn't slid up), it won't execute
                    } else
                        ;
                } else {
                    if (westerb_sal.request_done && !westerb_sal.blocking_dialog) {
                        delete westerb_sal.s_pag_instances[e.data.s_pag_instance_id]; //deletes the 'scroll_pagination' instance for the photo's comments, freeing up memory
                        e.data.this_o_name_div.unbind('click', westerb_sal.destroy_s_pag_instance);
                    } else
                        ;
                }
            }, writable: true, enumerable: true, configurable: true
        },
        exec_code_for_admin_list_albums: {
            value: function() {
                var xhr_get_albums = null, albums_wrapper = $('#albums_wrapper'), content = '';

                westerb_sal.opened_album_groups = new westerb_sal.Opened_Album_Groups;

                $('#to_admin_home').text('<< Back home'); //for consistency with the rest of the admin pages when they are navigated with the hash-change-based AJAX navigation
                albums_wrapper.before("<div name='for_block_effect'></div>");
                albums_wrapper.css({'min-width': '170px', 'display': 'inline-block'});

                $('a.album_by_owner').each(function() {
                    content = '';
                    content += "<div class='albums_by hash_change_removed_3 slided' id='";
                    content += $(this).attr('href').split('=')[1];
                    content += "'>";
                    content += "<div class='processing_msg'></div>";
                    content += "<div u_count='" + $(this).attr('u_count') + "' by='" + $(this).text() + "' class='o_name'>"
                    content += $(this).text() + "</div>";
                    content += "<div class='albums'></div>"
                    content += "</div>";
                    $(this).remove();
                    albums_wrapper.append(content);
                });

                var name_div = $('div.o_name');
                name_div.hover(function() {
                    $(this).css("opacity", "1")
                },
                        function() {
                            $(this).css("opacity", ".8")
                        })

                name_div.bind('click', function(e) {
                    if (westerb_sal.request_done)
                        $(this).toggleClass('clicked'); //only toggle when "loading" of albums is complete, to prevent cutting the process mid-way
                    if (westerb_sal.blocking_dialog)
                        westerb_sal.scroll_to_dialog();
                    else if (!westerb_sal.request_done)
                        westerb_sal.please_wait_msg(e);
                    else if ($(this).hasClass('clicked')) {
                        westerb_sal.request_done = false;
                        $('.clicked_o_name').removeClass('clicked_o_name');
                        $(this).addClass('clicked_o_name');
                        pre_stored_albums = westerb_sal.retrieve_albums('list_albums_ao_id=' + $(this).parent('div').attr('id'));
                        if (!pre_stored_albums) {
                            $(this).text('');
                            $(this).siblings('.processing_msg').css({'margin-top': '7px', 'left': westerb_sal.opened_album_groups.opened_count != 0 ? '45%' : '22%', 'z-index': '1000'}).get(0).processing_msg('Loading');
                            xhr_get_albums.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?ao_id=' + $(this).parent('div').attr('id') + '&u_per_set=' + parseInt($('div.u_wrapper').attr('scroll_per_set'), 10) + '&offset=' + 0, true);
                            xhr_get_albums.send(null);
                        } else {
                            westerb_sal.opened_album_groups.add_record($(this));
                            if (westerb_sal.opened_album_groups.opened_count == 1) {
                                albums_wrapper.animate({'width': '1050px', 'min-width': ''}, 200, 'linear', function() {
                                    $('.clicked_o_name').siblings('div.albums').hide().html(pre_stored_albums);
                                    westerb_sal.exec_code_for_album_group();
                                    $('.clicked_o_name').siblings('div.albums').slideDown(800, function() {
                                        $('#wait_msg').fadeOut(10, function() {
                                            $(this).remove();
                                        });
                                        westerb_sal.request_done = true;
                                    });
                                });
                                $('div.message_wrapper').slideUp(100);
                            } else {
                                $(this).siblings('div.albums').hide().html(pre_stored_albums);
                                westerb_sal.exec_code_for_album_group();
                                $(this).siblings('div.albums').slideDown(800, function() {
                                    $('#wait_msg').fadeOut(10, function() {
                                        $(this).remove();
                                    });
                                    westerb_sal.request_done = true;
                                });
                            }
                        }
                    } else {
                        if (westerb_sal.blocking_dialog)
                            westerb_sal.scroll_to_dialog();
                        else if (!westerb_sal.request_done)
                            westerb_sal.please_wait_msg(e);
                        else {
                            westerb_sal.request_done = false;
                            westerb_sal.opened_album_groups.remove_record($(this));
                            if (westerb_sal.opened_album_groups.opened_count == 0)
                                albums_wrapper.animate({'width': '', 'min-width': '180px'}, 200, 'linear');
                            $(this).siblings("div.albums").slideUp(800, function() {
                                $('#wait_msg').fadeOut(10, function() {
                                    $(this).remove();
                                });
                                westerb_sal.request_done = true;
                            });
                        }
                    }
                });

                xhr_get_albums = westerb_sal.create_xhr();
                function handle_response() {
                    if (xhr_get_albums.readyState === 4) {
                        clicked_o_name = $('.clicked_o_name');
                        westerb_sal.clear_p_timers();
                        clicked_o_name.siblings('.processing_msg').html('').css('z-index', '0');
                        clicked_o_name.text(clicked_o_name.attr('by'));
                        if (xhr_get_albums.status === 200) {
                            westerb_sal.opened_album_groups.add_record(clicked_o_name);
                            if (westerb_sal.opened_album_groups.opened_count == 1) {
                                albums_wrapper.animate({'width': '1050px', 'min-width': ''}, 200, 'linear', function() {
                                    clicked_o_name.siblings('div.albums').hide().html(xhr_get_albums.responseText);
                                    westerb_sal.exec_code_for_album_group();
                                    clicked_o_name.siblings('div.albums').slideDown(800, function() {
                                        $('#wait_msg').fadeOut(10, function() {
                                            $(this).remove();
                                        });
                                        westerb_sal.request_done = true;
                                    });
                                });
                                $('div.message_wrapper').slideUp(100);
                            } else {
                                clicked_o_name.siblings('div.albums').hide().html(xhr_get_albums.responseText);
                                westerb_sal.exec_code_for_album_group();
                                clicked_o_name.siblings('div.albums').slideDown(800, function() {
                                    $('#wait_msg').fadeOut(10, function() {
                                        $(this).remove();
                                    });
                                    westerb_sal.request_done = true;
                                });
                            }
                            westerb_sal.store_albums("list_albums_ao_id=" + clicked_o_name.parent('div').attr('id'), xhr_get_albums.responseText);
                        } else {
                            clicked_o_name.removeClass('clicked');
                            westerb_sal.display_msg("Failure: " + xhr_get_albums.status, "error") /////////////////////////////////////////
                        }
                    }
                }
                xhr_get_albums.onreadystatechange = handle_response;
            }, writable: false, enumerable: true, configurable: true
        },
        a_name_edit_mode: {
            value: function(e) {
                if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else {
                    var content = "<form class='mini_form a_name_edit' method='post' action='edit_aname.php?enma_id=";
                    content += $(this).parent('.name_edit_save').parent('.album').attr('a_id') + "'>";
                    content += "<input class='mini_form_edit_field' name='a_name' type='text' maxlength='100' value='";
                    var unedited_str = $(this).siblings('.name').text(), cur_album = $(this).parents('div.album');
                    content += unedited_str + "'>";
                    content += "<div class='cancel_counter'>";
                    content += "<a href='list_albums.php?o_id=";
                    content += cur_album.attr('name');
                    content += "' class='scriptable_gen_link cancel_name_edit'>Cancel editing</a>";
                    content += "<span class='char_counter'>" + (100 - $(this).siblings('.name').text().length) + "</span>";
                    content += "</div>";
                    content += "<input class='save_a_name_edit scriptable_gen_link' type='submit' value='' title='Update changes'>";
                    content += "</form>";
                    $(this).parent('.name_edit_save').html(content);

                    function cancel_name_edit_mode() {
                        if (!westerb_sal.request_done)
                            westerb_sal.please_wait_msg(e);
                        else if (westerb_sal.blocking_dialog)
                            westerb_sal.scroll_to_dialog();
                        else {
                            content = "<span class='name'>";
                            content += unedited_str + "</span>";
                            content += "<a href='list_albums.php?o_id=";
                            content += $(this).parent('.cancel_counter').parent('form').parent('.name_edit_save').parent('.album').attr('name') + "&enma_id=";
                            content += $(this).parent('.cancel_counter').parent('form').parent('.name_edit_save').parent('.album').attr('a_id');
                            content += "' class='edit edit_a_name scriptable_gen_link' title='Edit album name'></a>";
                            cur_album.find('a.cancel_name_edit').unbind('click', cancel_name_edit_mode); //free up memory
                            $(this).parent('.cancel_counter').parent('form').parent('.name_edit_save').html(content);
                        }
                        return false;
                    }
                    $('a.cancel_name_edit', cur_album).click(cancel_name_edit_mode);
                    cur_album.find('input.save_a_name_edit').data('unedited_a_name', unedited_str); //data will be used to reference the current album's unedited name when the current '.save_a_name_edit' element's click event is fired, bubbles up and handled where it's delegated (the '#albums_wrapper' div)
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        display_albums_section_msg: {
            value: function(sect_id, msg, type, duration) {
                if (!msg)
                    msg = 'Something went wrong while updating the name. Refresh the page and try again.';
                if (!type)
                    type = 'error';
                if (!duration)
                    duration = 4000;

                var msg_wrapper = $('.albums_by#' + sect_id).find('div.section_ui_msg_wrapper'), b_color = color = '';
                window.clearTimeout(westerb_sal.msg_remove_timer);
                msg_wrapper.html(''); //remove any message that might have previously been there
                $('.albums_by#' + sect_id).find('div.albums').scrollTop(0); //so that the message can be brought into view

                switch (type) {
                    case('error'):
                        b_color = '#F9E5E6';
                        color = '#AA1221';
                        break;
                    case('notice'):
                        b_color = '#F7F0CB';
                        color = '#C46600';
                        break;
                    case('info'):
                        b_color = '#D8ECF5';
                        color = '#2E81A8';
                        break;
                    case('success'):
                        b_color = '#E6F0C2';
                        color = '#967B35';
                        break;
                    default:
                        break;
                }
                msg_wrapper.append("<div id='sect_msg' style='position: absolute; padding: 4px; font-weight: bold; background-color: " + b_color + "; color: " + color + "; border-radius: 3px; z-index: 1001;'></div>");
                $('#sect_msg').hide().text(msg).fadeIn(200, function() {
                    westerb_sal.msg_remove_timer = window.setTimeout(function() {
                        $('#sect_msg').fadeOut(200, function() {
                            $(this).remove();
                        })
                    }, duration);
                });
                if (type === 'error' || type === 'success')
                    westerb_sal.request_done = true;
            }, writable: true, enumerable: true, configurable: true
        },
        construct_notes_box: {
            value: function(a_id, notes_len, see) { //if "see" is true, the call was from "See notes"-- not "Add notes" and the box is adjusted accordingly
                if (see == null)
                    see = false;
                if (notes_len == null)
                    notes_len = 0;
                var str = '';
                str += "<div class='a_notes_wrapper ajax_called'>";
                str += "<form class='mini_form' action='edit_notes.php?a_notes=" + a_id + "' method='post'>";
                str += "<textarea sentry='0' name='a_notes' class='anotes ajax_called mini_form_edit_field' maxlength='3000'></textarea>";
                str += "<div class='notes_edit'><a class='close_notes' style='margin-left: 2px; font-weight: bold; font-size: 12px;' href='#'>";
                str += see ? "Close notes" : "Cancel";
                str += "</a>";
                str += "<span class='char_counter'>";
                str += see ? 3000 - notes_len : '3000';
                str += "</span>";
                if (see) {
                    str += "<a class='del_notes' href='edit_notes.php?da_notes=" + a_id;
                    str += "' title='Delete album notes'><div class='absolute_pos delete ajax_called'>&#x2717;</div></a>";
                }
                str += "</div></form>";
                str += "</div>";
                return str;
            }, writable: true, enumerable: true, configurable: true
        },
        xhr_update_notes: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        handle_update_notes_response: {
            value: function() {
                if (westerb_sal.xhr_update_notes.readyState === 4) {
                    westerb_sal.clear_p_timers();
                    var new_notes_post = /Adding/.test(westerb_sal.clicked_input_parent.text()) ? true : false;
                    if (westerb_sal.xhr_update_notes.status === 200) {
                        var response = $.trim(westerb_sal.xhr_update_notes.responseText.replace(' target="_blank"', '', 'gm'));
                        if (westerb_sal.clicked_input_parent.hasClass('deleting_notes')) {
                            $('.album[a_id=' + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id') + ']').each(function() {
                                $(this).children('a.notes').children('div.notes').text('Add notes'); //update on-screen information on all relevant albums in different opened sections
                                $(this).children('div.a_notes_wrapper').slideUp(400, function() {
                                    $(this).remove();
                                }); //slide off the screen the notes box on all relevant albums in different opened sections
                            });
                            westerb_sal.clear_notes(westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id')); //free memory and so that next time (after they've been added) the notes are retrieved from the server, not local storage
                            westerb_sal.clear_albums(westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('o_id')); //clear the album set containing the affected album so that it's loaded fresh from the server next time
                            westerb_sal.clear_albums('a'); //also clear the 'All albums' group, since this will always be affected when any album's notes are modified somehow
                            window.setTimeout(function() {
                                westerb_sal.display_msg('Notes succesfully deleted', 'success', 2500);
                            }, 430);
                        } else {
                            $('.album[a_id=' + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id') + ']').each(function() {
                                $(this).children('div.a_notes_wrapper').children('form').children('.mini_form_edit_field').val(response).text(response); //update on-screen information on all relevant albums in different opened sections
                                $(this).children('div.a_notes_wrapper').children('form').children('textarea').attr('sentry', '0'); //reset the sentry to 0 to begin 'real text input change watch'
                                $(this).children('div.a_notes_wrapper').children('form').children('textarea').unbind('keyup', westerb_sal.toggle_cancel).bind('keyup', {'initial_val': response, 'see': true}, westerb_sal.toggle_cancel); //rebind 'toggle_cancel' to restart the watch
                                $(this).children('div.a_notes_wrapper').children('form').children('div.notes_edit').html("<a class='close_notes' style='margin-left: 2px; font-weight: bold; font-size: 12px;' href='#'>Close notes</a><span class='char_counter'>" + (3000 - westerb_sal.clicked_input_parent.parent('form').children('textarea').val().length) + "</span><a class='del_notes' href='edit_notes.php?da_notes=" + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id') + "' title='Delete album notes'><div class='absolute_pos delete ajax_called'>&#x2717;</div></a>");
                                $(this).children('div.a_notes_wrapper').children('form').children('div.notes_edit').children('a.close_notes').unbind('click', westerb_sal.close_notes_box).click(westerb_sal.close_notes_box);
                                $(this).children('div.a_notes_wrapper').children('form').children('div.notes_edit').children('a.del_notes').unbind('click', westerb_sal.update_notes).click(westerb_sal.update_notes);
                            });
                            if (new_notes_post) {
                                $('.album[a_id=' + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id') + ']').each(function() {
                                    $(this).children('a.notes').children('div.notes').text('See notes'); //update on-screen information on all relevant albums from different opened sections
                                });
                                westerb_sal.clear_albums(westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('o_id')); //clear the album set containing the affected album so that it's loaded fresh from the server next time
                                westerb_sal.clear_albums('a'); //also clear the 'All albums' group, since this will always be affected when any album's notes are modified somehow
                            }
                            westerb_sal.store_notes('list_albums_an_id=' + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id'), response); //re-storing the notes
                            window.setTimeout(function() {
                                westerb_sal.display_msg('Notes updated successfully', 'success', 2500);
                            }, 30);
                        }
                    } else {
                        var to_restore = new_notes_post ? "<input type='submit' value='Add album notes' class='update_notes'><span class='char_counter'>" + (3000 - westerb_sal.clicked_input_parent.parent('form').children('textarea').val().length) + "</span>" : "<input type='submit' value='Update changes' class='update_notes'><span class='char_counter'>" + (3000 - westerb_sal.clicked_input_parent.parent('form').children('textarea').val().length) + "</span><a class='del_notes' href='edit_notes.php?da_notes=" + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id') + "' title='Delete album notes'><div class='absolute_pos delete ajax_called'>&#x2717;</div></a>";
                        westerb_sal.clicked_input_parent.html(to_restore);
                        westerb_sal.display_msg("Failure: " + westerb_sal.xhr_update_notes.status, "error") /////////////////////////////////////////
                        westerb_sal.clicked_input_parent.children('input.update_notes').click(westerb_sal.update_notes);
                        westerb_sal.clicked_input_parent.children('a.del_notes').click(westerb_sal.update_notes);
                    }
                }
            }, writable: true, enumerable: true, configurable: true
        },
        update_notes: {
            value: function(e) {
                if (westerb_sal.blocking_dialog) {
                    westerb_sal.scroll_to_dialog();
                    westerb_sal.highlight_dialog(e);
                }
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.request_done = false;
                    westerb_sal.clicked_input_parent = $(this).parent('div.notes_edit');
                    $(this).hasClass('del_notes') ? westerb_sal.clicked_input_parent.addClass('deleting_notes') : westerb_sal.clicked_input_parent.removeClass('deleting_notes');
                    if (westerb_sal.perms == 1) {
                        var what = '';
                        if (westerb_sal.clicked_input_parent.hasClass('deleting_notes'))
                            what = 'delete';
                        else
                            what = $(this).val() == 'Update changes' ? 'edit' : 'add';
                        westerb_sal.display_msg('As a guest, you do not have sufficient privileges to ' + what + ' album notes', 'notice');
                    } else {
                        if (westerb_sal.clicked_input_parent.hasClass('deleting_notes'))
                            westerb_sal.clicked_input_parent.get(0).processing_msg('Deleting');
                        else
                            $(this).val() == 'Update changes' ? westerb_sal.clicked_input_parent.get(0).processing_msg('Updating') : westerb_sal.clicked_input_parent.get(0).processing_msg('Adding');
                        westerb_sal.xhr_update_notes.open('post', westerb_sal.HOME + 'ajax/misc_calls.php?a_notes=' + westerb_sal.clicked_input_parent.parent('form').parent('div.a_notes_wrapper').parent('div.album').attr('a_id'), true);
                        westerb_sal.xhr_update_notes.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        westerb_sal.xhr_update_notes.send('a_notes=' + (westerb_sal.clicked_input_parent.hasClass('deleting_notes') ? '' : encodeURIComponent(westerb_sal.clicked_input_parent.parent('form').children('textarea').val().replace(' ', '+', 'gm'))));
                    }
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        close_notes_box: {
            value: function(e) {
                if (westerb_sal.blocking_dialog) {
                    westerb_sal.scroll_to_dialog();
                    westerb_sal.highlight_dialog(e);
                }
                else
                    $(this).parent('div.notes_edit').parent('form').parent('div.a_notes_wrapper').slideUp(400, function() {
                        $(this).remove()
                    });
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        toggle_cancel: {
            value: function(e) {
                if ($(this).attr('sentry') == 0 && $.trim($(this).val()) != e.data.initial_val) {
                    $(this).siblings('div.notes_edit').children('a.close_notes').remove();
                    if (e.data.see)
                        $(this).siblings('div.notes_edit').children('span.char_counter').before("<input type='submit' value='Update changes' class='update_notes'>");
                    else
                        $(this).siblings('div.notes_edit').children('span.char_counter').before("<input type='submit' value='Add album notes' class='update_notes'>");
                    $(this).siblings('div.notes_edit').children('input.update_notes').click(westerb_sal.update_notes);
                    //if(westerb_sal.blocking_dialog)
                    //  $(this).siblings('div.notes_edit').children('input.update_notes').click(westerb_sal.highlight_dialog);
                    $(this).attr('sentry', '1');
                }
                else if ($(this).attr('sentry') == 1 && $.trim($(this).val()) == e.data.initial_val) {
                    $(this).siblings('div.notes_edit').children('input.update_notes').remove();
                    $(this).siblings('div.notes_edit').children('span.char_counter').before("<a class='close_notes' style='margin-left: 3px; font-weight: bold; font-size: 12px;' href='#'>" + (e.data.see ? "Close notes" : "Cancel") + "</a>");
                    $(this).siblings('div.notes_edit').children('a.close_notes').click(westerb_sal.close_notes_box);
                    $(this).attr('sentry', '0');
                }
            }, writable: true, enumerable: true, configurable: true
        },
        xhr_get_notes: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        handle_get_notes_response: {
            value: function() {
                if (westerb_sal.xhr_get_notes.readyState === 4) {
                    clicked_see_notes = $('.clicked_see_notes');
                    westerb_sal.clear_p_timers();
                    clicked_see_notes.children('div.notes').css({'font-size': '14px', 'padding': '5px 2px', 'text-align': 'center'}).text('See notes');
                    if (westerb_sal.xhr_get_notes.status === 200) {
                        var notes = $.trim(westerb_sal.xhr_get_notes.responseText.replace(' target="_blank"', '', 'gm'));
                        clicked_see_notes.parent('div.album').append(westerb_sal.construct_notes_box(clicked_see_notes.parent('div.album').attr('a_id'), notes.length, true));
                        clicked_see_notes.parent('div.album').children('div.a_notes_wrapper').children('form').children('textarea').val(notes);
                        clicked_see_notes.parent('div.album').children('div.a_notes_wrapper').children('form').children('textarea').bind('keyup', {'initial_val': notes, 'see': true}, westerb_sal.toggle_cancel);
                        //clicked_see_notes.parent('div.album').children('div.a_notes_wrapper').children('form').children('textarea').bind('keyup', {'max_len':3000}, westerb_sal.count);
                        clicked_see_notes.parent('div.album').children('div.a_notes_wrapper').children('form').children('div.notes_edit').children('a.close_notes').click(westerb_sal.close_notes_box);
                        clicked_see_notes.parent('div.album').children('div.a_notes_wrapper').children('form').children('div.notes_edit').children('a.del_notes').click(westerb_sal.update_notes);
                        clicked_see_notes.parent('div.album').children('div.a_notes_wrapper').slideDown(400, function() {
                            $('#wait_msg').fadeOut(10, function() {
                                $(this).remove();
                            });
                            westerb_sal.request_done = true;
                        });
                        westerb_sal.store_notes('list_albums_an_id=' + clicked_see_notes.parent('div.album').attr('a_id'), notes);
                    } else
                        westerb_sal.display_msg("Failure: " + westerb_sal.xhr_get_notes.status, "error") /////////////////////////////////////////
                }
            }, writable: true, enumerable: true, configurable: true
        },
        add_notes: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else {
                    if ($(this).children('div.notes').text() === 'See notes') {
                        pre_stored_notes = westerb_sal.retrieve_notes('list_albums_an_id=' + $(this).parent('div.album').attr('a_id'));
                        if (!pre_stored_notes) {
                            if (!westerb_sal.request_done)
                                westerb_sal.please_wait_msg(e);
                            else {
                                westerb_sal.request_done = false;
                                $('.clicked_see_notes').removeClass('clicked_see_notes');
                                $(this).addClass('clicked_see_notes'); //for reference in the "xhr_get_notes" handler
                                $(this).children('div.notes').css({'font-size': '12px', 'padding': '5px 0 5px 5px', 'text-align': 'left'}).get(0).processing_msg('Loading');
                                westerb_sal.xhr_get_notes.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?an_id=' + $(this).parent('div.album').attr('a_id'), true);
                                westerb_sal.xhr_get_notes.send(null);
                            }
                        } else {
                            if (westerb_sal.request_done) {
                                westerb_sal.request_done = false;
                                $(this).parent('div.album').append(westerb_sal.construct_notes_box($(this).parent('div.album').attr('a_id'), pre_stored_notes.length, true));
                                var form = $(this).parent('div.album').children('div.a_notes_wrapper').children('form');
                                form.children('textarea').val(pre_stored_notes);
                                form.children('textarea').bind('keyup', {'initial_val': pre_stored_notes, 'see': true}, westerb_sal.toggle_cancel);
                                //form.children('textarea').bind('keyup', {'max_len':3000}, westerb_sal.count);
                                form.children('div.notes_edit').children('a.close_notes').click(westerb_sal.close_notes_box);
                                form.children('div.notes_edit').children('a.del_notes').click(westerb_sal.update_notes);
                                $(this).parent('div.album').children('div.a_notes_wrapper').slideDown(400, function() {
                                    westerb_sal.request_done = true;
                                });
                            } else
                                ;
                        }
                    }
                    else if ($(this).children('div.notes').text() === 'Add notes') {
                        if (westerb_sal.request_done) {
                            westerb_sal.request_done = false;
                            $(this).parent('div.album').append(westerb_sal.construct_notes_box($(this).parent('div.album').attr('a_id')));
                            var form = $(this).parent('div.album').children('div.a_notes_wrapper').children('form');
                            form.children('textarea').bind('keyup', {'initial_val': '', 'see': false}, westerb_sal.toggle_cancel);
                            //form.children('textarea').bind('keyup', {'max_len':3000}, westerb_sal.count);
                            form.children('div.notes_edit').children('a.close_notes').click(westerb_sal.close_notes_box);
                            $(this).parent('div.album').children('div.a_notes_wrapper').slideDown(400, function() {
                                westerb_sal.request_done = true;
                            });
                        } else
                            ;
                    }
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        visualize_del_album_on_list_albums: {
            value: function(album) {
                var inner_a_wrapper = album.parent('div.inner_a_wrapper');
                var remaining_albums = 0;
                if (westerb_sal.opened_album_groups.is_opened('a')) {
                    remaining_albums = parseInt(inner_a_wrapper.children('p').children('span:first').text()) - 1;
                    inner_a_wrapper.children('p').children('span:first').text(remaining_albums + (remaining_albums == 1 ? ' album' : ' albums'));
                    if (remaining_albums === 1)
                        inner_a_wrapper.children('p').children('span:last').fadeOut(250, function() {
                            $(this).remove()
                        });
                    ////
                    album.slideUp(350, function() {
                        $(this).remove();
                        if (parseInt(inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').children('td.see_close_coms').attr('u_count'), 10) > 8 && clicked_parent_parent.children('div').size() == 0) {
                            var this_album_group_s_pag = westerb_sal.s_pag_instances['p_id_' + inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')];
                            this_album_group_s_pag.current_set = parseInt(inner_a_wrapper.parent('div').attr('cur_set'), 10);
                            if (!this_album_group_s_pag.next_set())
                                ;
                            else {
                                westerb_sal.request_done = false;
                                $('.clicked').removeClass('clicked');
                                inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').children('td.see_close_coms').addClass('clicked');
                                $('.clicked').removeClass('create_new_s_pag'); //prevents creation of a new instance of 'Scroll_pagination' since one will already have been created each time 'See comments' is clicked
                                inner_a_wrapper.parent('div').parent('td').children('div.load_more_msg').css('margin-top', '6px').get(0).processing_msg('Please wait');
                                this_album_group_s_pag.current_set++;
                                xhr_get_more_comments.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?pc_id=' + inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').attr('p_id') + '&u_per_set=' + this_album_group_s_pag.units_per_set + '&offset=' + this_album_group_s_pag.offset(), true);
                                xhr_get_more_comments.send(null);
                            }
                        }
                    });
                }
                //var remaining_comments = parseInt(inner_a_wrapper.siblings('p').children('span:first').text()) - 1;
                //inner_a_wrapper.siblings('p').children('span:first').text(remaining_comments+(remaining_comments==1?' Comment':' Comments'));
                //if(remaining_comments === 1) inner_a_wrapper.siblings('p').children('span:last').fadeOut(250, function() { $(this).remove() });
//                album.slideUp(350, function() {
//                    $(this).remove();
//                    if(parseInt(inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').children('td.see_close_coms').attr('u_count'),10) > 8 && clicked_parent_parent.children('div').size() == 0) {
//                        var this_photo_s_pag = westerb_sal.s_pag_instances['p_id_'+inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')];
//                        this_photo_s_pag.current_set = parseInt(inner_a_wrapper.parent('div').attr('cur_set'),10);
//                        if(!this_photo_s_pag.next_set()) ;
//                        else {
//                            westerb_sal.request_done = false;
//                            $('.clicked').removeClass('clicked');
//                            inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').children('td.see_close_coms').addClass('clicked');
//                            $('.clicked').removeClass('create_new_s_pag'); //prevents creation of a new instance of 'Scroll_pagination' since one will already have been created each time 'See comments' is clicked
//                            inner_a_wrapper.parent('div').parent('td').children('div.load_more_msg').css('margin-top','6px').get(0).processing_msg('Please wait');
//                            this_photo_s_pag.current_set++;
//                            xhr_get_more_comments.open('get', westerb_sal.HOME+'ajax/misc_calls.php?pc_id='+inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')+'&u_per_set='+this_photo_s_pag.units_per_set+'&offset='+this_photo_s_pag.offset(), true);
//                            xhr_get_more_comments.send(null);
//                        }
//                    }
//                });
                if (remaining_albums === 0) {
                    inner_a_wrapper.parent('div').parent('td').parent('tr').slideUp(360, function() {
                        westerb_sal.clear_sets(); //this change visually affects the current set and it needs to be cleared (unfortunately, at the expense of others as well 'coz it's the most elegant solution for now)
                        westerb_sal.clear_comments(inner_a_wrapper.parent('div').parent("td").parent("tr").prev("tr").attr("p_id")); //free up memory, and to prevent loading from local storage when new comments come in, because local storage will only show there aren't any comments
                        $(this).remove();
                    });
                    inner_a_wrapper.parent('div').parent('td').parent('tr').prev('tr').children('.see_close_coms').text('No comments');
                }
                $('#wait_msg').fadeOut(10, function() {
                    $(this).remove();
                });
                westerb_sal.clear_comments(inner_a_wrapper.parent('div').parent("td").parent("tr").prev("tr").attr("p_id")); //whenever a comment is deleted, the best course is to clear the pre-stored comments and load afresh next time "See comments" is clicked
                westerb_sal.request_done = true;
            }, writable: true, enumerable: true, configurable: true
        },
        xhr_del_album_on_list_albums: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        handle_del_album_on_list_albums_response: {
            value: function() {
                if (westerb_sal.xhr_del_album_on_list_albums.readyState === 4) {
                    westerb_sal.clear_p_timers();
                    $('#temp_a_processing_msg').remove();
                    album = $('.deleted_album');
                    if (westerb_sal.xhr_del_album_on_list_albums.status === 200)
                        westerb_sal.visualize_del_album_on_list_albums(album);
                    else
                        westerb_sal.display_albums_section_msg(album.parents('div.albums_by').attr('id'), 'Something went wrong while deleting the album. Refresh the page and try again.');
                }
            }, writable: true, enumerable: true, configurable: true
        },
        del_album_on_list_albums: {
            value: function(album) {
                westerb_sal.request_done = false;
                album.append("<div id='temp_a_processing_msg' style='position: absolute; top: 118px; left: 83px; '></div>");
                $('#temp_a_processing_msg').get(0).processing_msg();
                if (westerb_sal.perms == 1) {
                    setTimeout(function() {
                        westerb_sal.clear_p_timers();
                        $('#temp_a_processing_msg').remove();
                        westerb_sal.visualize_del_album_on_list_albums(album);
                    }, 3000);
                } else {
                    $('.deleted_album').removeClass('deleted_album');
                    album.addClass("deleted_album"); //for reference in the handle_response function
                    westerb_sal.xhr_del_album_on_list_albums.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?da_id=' + album.attr('a_id'), true);
                    westerb_sal.xhr_del_album_on_list_albums.send(null);
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        },
        xhr_get_more_albums: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        handle_get_more_albums_response: {
            value: function() {
                if (westerb_sal.xhr_get_more_albums.readyState === 4) {
                    clicked_o_name = $('.clicked_o_name');
                    westerb_sal.clear_p_timers();
                    clicked_o_name.siblings('.processing_msg').html('').css('z-index', '0');
                    if (westerb_sal.xhr_get_more_albums.status === 200) {
                        var inner_wrapper = clicked_o_name.siblings('div.albums').children('div.inner_a_wrapper');
                        inner_wrapper.append(westerb_sal.xhr_get_more_albums.responseText);
                        inner_wrapper.children('div.album').children('div.hover_triggered').hide();
                        inner_wrapper.children('div.album').children('a').children('div.hover_triggered').hide();
                        inner_wrapper.attr('cur_set', parseInt(inner_wrapper.attr('cur_set'), 10) + 1); //increment the 'cur_set' value so that the next 'load_more' fetches the right set, even if the albums were closed and re-opened from local storage
                        westerb_sal.store_albums('list_albums_ao_id=' + clicked_o_name.parent('div.albums_by').attr('id'), clicked_o_name.siblings('div.albums').html()); //re-storing the albums so that next time they're loaded from local storage, the appended albums are also loaded
                        westerb_sal.request_done = true;
                        $('#wait_msg').fadeOut(10, function() {
                            $(this).remove();
                        });
                    } else
                        westerb_sal.display_msg("Failure: " + westerb_sal.xhr_get_more_albums.status, "error") /////////////////////////////////////////
                }
            }, writable: true, enumerable: true, configurable: true
        },
        load_more_albums: {
            value: function(e) {
                if ($(this).scrollTop() === $(this).prop('scrollHeight') - 400) {
                    if (westerb_sal.request_done) {
                        if (westerb_sal.blocking_dialog) {
                            westerb_sal.scroll_to_dialog();
                            westerb_sal.highlight_dialog(e);
                        }
                        else {
                            $('.clicked_o_name').removeClass('clicked_o_name');
                            $(this).siblings('div.o_name').addClass('clicked_o_name');
                            var s_pagination = westerb_sal.s_pag_instances['o_id_' + $('.clicked_o_name').parent('div').attr('id')], cur_set = parseInt($(this).children('div.inner_a_wrapper').attr('cur_set'), 10);
                            westerb_sal.request_done = false;
                            s_pagination.current_set = cur_set;
                            if (!s_pagination.next_set())
                                westerb_sal.request_done = true;
                            else {
                                $(this).siblings('div.processing_msg').css({'margin-top': '415px', 'left': '45%', 'z-index': '1000'}).get(0).processing_msg('Loading more');
                                s_pagination.current_set++;
                                westerb_sal.xhr_get_more_albums.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?ao_id=' + $(this).parent('div.albums_by').attr('id') + '&u_per_set=' + s_pagination.units_per_set + "&offset=" + s_pagination.offset(), true);
                                westerb_sal.xhr_get_more_albums.send(null);
                            }
                        }
                    } else
                        ;
                }
            }, writable: true, enumerable: true, configurable: true
        }
    });
    westerb_sal.xhr_update_notes.onreadystatechange = westerb_sal.handle_update_notes_response;
    westerb_sal.xhr_get_notes.onreadystatechange = westerb_sal.handle_get_notes_response;
    westerb_sal.xhr_del_album_on_list_albums.onreadystatechange = westerb_sal.handle_del_album_on_list_albums_response;
    westerb_sal.xhr_get_more_albums.onreadystatechange = westerb_sal.handle_get_more_albums_response;
    /*************************************************
     *Opened_Album_Groups class for keeping track of
     *opened sections(album groups) so that information
     *is properly updated on all opened sections when
     *need be
     **************************************************/
    Object.defineProperty(Object.prototype.westerb_sal,
            "Opened_Album_Groups", // Define Object.prototype.westerb_sal.Opened_Album_Groups
            {writable: false, enumerable: true, configurable: true,
                value: function() {
                    this.opened = {};
                    this.opened_count = 0;
                }
            });
//extending the Opened_Album_Groups class
    Object.defineProperties(westerb_sal.Opened_Album_Groups.prototype, {
        add_record: {
            value: function(o_name_div) {
                this.opened[o_name_div.parent('div.albums_by').attr('id')] = o_name_div; //the property name (which is the group name) is that album group's owner id (=a if the opened group is 'All albums')
                this.opened_count++;
            }, writable: false, enumerable: true, configurable: true
        },
        remove_record: {
            value: function(o_name_div) {
                delete this.opened[o_name_div.parent('div.albums_by').attr('id')];
                this.opened_count--;
            }, writable: false, enumerable: true, configurable: true
        }

//        is_opened : {
//            value: function(o_id) {
//                return this.opened.westerb_sal.prop_exists(o_id);
//            }, writable: false, enumerable: true, configurable: true
//        }
    });
//Global variable for holding the Opened_Album_Groups instance
    Object.defineProperty(Object.prototype.westerb_sal,
            'opened_album_groups', // Define Object.prototype.westerb_sal.opened_album_groups
            {writable: true, enumerable: true, configurable: true, value: new westerb_sal.Opened_Album_Groups
            });

//extending "Object.prototype.westerb_sal" with helper functions relevant for to 'list_photos.php' page
    Object.defineProperties(Object.prototype.westerb_sal, {
        display_tiny_msg: {
            value: function(message, type, duration) {
                var msg = $('#ajax_msg');
                window.clearTimeout(westerb_sal.msg_remove_timer);
                msg.fadeOut(10) //start by hiding any message that was already there
                if (!message)
                    message = 'Success';
                var len = message.length;
                if (len < 35) {
                    if (!type)
                        type = 'success';
                    if (!duration)
                        duration = 1900;
                    if (len > 26)
                        msg.attr('colspan', '3');
                    else if (len > 15)
                        msg.attr('colspan', '2');
                    else
                        msg.attr('colspan', '1');
                    $(document).scrollTop(0);
                    msg.removeClass('success notice info error').addClass(type).html(message).fadeIn(50, function() {
                        westerb_sal.msg_remove_timer = window.setTimeout(function() {
                            msg.fadeOut(400)
                        }, duration)
                    });
                    westerb_sal.request_done = true;
                    $('#wait_msg').fadeOut(10, function() {
                        $(this).remove();
                    });
                } else
                    westerb_sal.display_msg(message, type, 6400);
            }, writable: false, enumerable: true, configurable: true
        },
        xhr_make_cover: {
            value: westerb_sal.create_xhr(), writable: false, enumerable: true, configurable: true
        },
        handle_cover_change_response: {
            value: function() {
                if (westerb_sal.xhr_make_cover.readyState === 4) {
                    var clicked_parent = $('.clicked');
                    westerb_sal.clear_p_timers();
                    if (westerb_sal.xhr_make_cover.status === 200) {
                        var cur_cover = $('#current_cover');
                        cur_cover.removeAttr('id').html("<a href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "&mkcover=" + cur_cover.parent('tr').attr('p_id') + "' class='scriptable_table_link change_cover'>Make cover photo</a>");
                        clicked_parent.attr('id', 'current_cover').html('Current album cover');
                        westerb_sal.display_tiny_msg();
                        westerb_sal.clear_sets(); //incase the change (visually) affets (and needs to update) other previously stored sets
                    } else {
                        clicked_parent.html("<a href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "&mkcover=" + clicked_parent.parent('tr').attr('p_id') + "' class='scriptable_table_link change_cover'>Make cover photo</a>");
                        westerb_sal.display_tiny_msg('Failure: ' + westerb_sal.xhr_make_cover.status, 'error', 4000) /////////////////////////////////////////
                    }
                }
            }, writable: false, enumerable: true, configurable: true
        },
        make_cover: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.request_done = false;
                    $('.clicked').removeClass('clicked');
                    $(this).parent('td').addClass('clicked'); //for reference in the handle_response function
                    $(this).parent('td').get(0).processing_msg('Changing');
                    westerb_sal.xhr_make_cover.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?mkcover=' + $('.clicked').parent('tr').attr('p_id'), true);
                    westerb_sal.xhr_make_cover.send(null);
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        xhr_get_comments: {
            value: westerb_sal.create_xhr(), writable: false, enumerable: true, configurable: true
        },
        handle_get_comments_response: {
            value: function() {
                if (westerb_sal.xhr_get_comments.readyState === 4) {
                    var clicked_parent = $('.clicked');
                    var comments_td = clicked_parent.parent('tr').next('tr').children('td');
                    westerb_sal.clear_p_timers();
                    comments_td.children('div.load_more_msg').html('');
                    if (westerb_sal.xhr_get_comments.status === 200) {
                        clicked_parent.parent('tr').after("<tr class='p_comments'><td colspan='8' class='p_comments'></td></tr>");
                        clicked_parent.parent('tr').next('tr').hide().children('td').html(westerb_sal.xhr_get_comments.responseText);
                        clicked_parent.parent('tr').next('tr').children('td').children('div.comments_wrapper').hide();
                        clicked_parent.parent('tr').next('tr').show();
                        clicked_parent.parent('tr').next('tr').children('td').children('div.comments_wrapper').slideDown(500);
                        clicked_parent.html("<a href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "' class='scriptable_table_link hide_comments'>Close comments</a>");
                        westerb_sal.store_comments('list_photos_pc_id=' + clicked_parent.parent('tr').attr('p_id'), westerb_sal.xhr_get_comments.responseText);
                        westerb_sal.request_done = true;
                    } else {
                        clicked_parent.html("<a u_count='" + parseInt(clicked_parent.attr('u_count'), 10) + "' href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "&pc_id=" + clicked_parent.parent('tr').attr('p_id') + "' class='scriptable_table_link'>See comments</a>");
                        westerb_sal.display_tiny_msg('Failure: ' + westerb_sal.xhr_get_comments.status, 'error', 4000) /////////////////////////////////////////
                    }
                }
            }, writable: false, enumerable: true, configurable: true
        },
        see_comments: {
            value: function(e) {
                var pre_stored_comments = westerb_sal.retrieve_comments('list_photos_pc_id=' + $(this).parent('td').parent('tr').attr('p_id'));
                if (!pre_stored_comments) {
                    if (westerb_sal.blocking_dialog)
                        westerb_sal.scroll_to_dialog();
                    else if (!westerb_sal.request_done)
                        westerb_sal.please_wait_msg(e);
                    else { //only when the xhr object/server isn't busy or there's no "blocking"
                        westerb_sal.request_done = false;
                        $('.clicked').removeClass('clicked');
                        $(this).parent('td').addClass('clicked'); //for reference in the handle_response function
                        $('.clicked').addClass('create_new_s_pag'); //this will serve as a signal to the application, telling it to create/not a new instance of 'Scroll_Pagination', contingent on 'initial-upload'/'loading-more'
                        $('.clicked').get(0).processing_msg('Loading');
                        westerb_sal.xhr_get_comments.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?pc_id=' + $('.clicked').parent('tr').attr('p_id') + '&u_per_set=' + parseInt($('div.u_wrapper').attr('scroll_per_set'), 10) + '&offset=' + 0, true);
                        westerb_sal.xhr_get_comments.send(null);
                    }
                } else {
                    if (westerb_sal.blocking_dialog)
                        westerb_sal.scroll_to_dialog();
                    else if (!westerb_sal.request_done)
                        westerb_sal.please_wait_msg(e);
                    else { //allow code to run only once until "See comments"  has been replaced with "Close comments" to safeguard against multiple clicks that would break the code
                        westerb_sal.request_done = false;
                        $('.clicked').removeClass('clicked');
                        $(this).parent('td').addClass('clicked'); //so that a new instance of 'Scroll_Pagination' can be created even when loading from loacal storage
                        $('.clicked').addClass('create_new_s_pag'); //this will serve as a signal to the application, telling it to create/not a new instance of 'Scroll_Pagination', contingent on 'initial-upload'/'loading-more'
                        var clicked_parent = $('.clicked'), tr_ancestor = clicked_parent.parent('tr');
                        tr_ancestor.after("<tr class='p_comments'><td colspan='8' class='p_comments'></td></tr>");
                        tr_ancestor.next('tr').hide().children('td').html(pre_stored_comments);
                        tr_ancestor.next('tr').children('td').children('div.comments_wrapper').hide();
                        tr_ancestor.next('tr').show();
                        tr_ancestor.next('tr').children('td').children('div.comments_wrapper').slideDown(500, function() {
                            clicked_parent.html("<a href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "' class='scriptable_table_link hide_comments'>Close comments</a>");
                            $('#wait_msg').fadeOut(10, function() {
                                $(this).remove();
                            });
                            westerb_sal.request_done = true;
                        });
                    }
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        close_comments: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done && $(this).hasClass('del_in_progress'))
                    westerb_sal.please_wait_msg(e); //incase deletion of comments is in progress when closing attempt is made
                else {
                    var clicked_parent = $(this).parent('td'), tr_ancestor = clicked_parent.parent('tr');
                    tr_ancestor.next('tr').children('td').children('div.comments_wrapper').slideUp(500, function() {
                        tr_ancestor.next('tr').remove();
                        clicked_parent.html("<a u_count='" + parseInt(clicked_parent.attr('u_count'), 10) + "' href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "&pc_id=" + tr_ancestor.attr('p_id') + "' class='scriptable_table_link display_comments'>See comments</a>");
                    });
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        xhr_add_capt: {
            value: westerb_sal.create_xhr(), writable: false, enumerable: true, configurable: true
        },
        add_capt: {
            value: function(e) {
                if (westerb_sal.request_done && !westerb_sal.blocking_dialog) {
                    westerb_sal.request_done = false;
                    if (e.data.c_parent.children('form').children('.mini_form_edit_field').val() == '') {
                        westerb_sal.display_tiny_msg('You can not add an empty caption', 'notice', 4000);
                    } else {
                        if (westerb_sal.perms == 1)
                            westerb_sal.display_msg('As a guest, you do not have sufficient privileges to add photo captions', 'notice');
                        else {
                            westerb_sal.clicked_input_parent = $(this).parent('div');
                            westerb_sal.clicked_input_parent.get(0).processing_msg('Adding');
                            westerb_sal.xhr_add_capt.open('post', westerb_sal.HOME + 'ajax/misc_calls.php?p_cap=' + westerb_sal.clicked_input_parent.parent('form').parent('td').parent('tr').attr('p_id'), true);
                            westerb_sal.xhr_add_capt.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                            westerb_sal.xhr_add_capt.send('p_cap=' + encodeURIComponent(westerb_sal.clicked_input_parent.parent('form').children('.mini_form_edit_field').val().replace(' ', '+', 'gm')));
                        }
                    }
                } else
                    westerb_sal.please_wait_msg(e);
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        update_capt_changes: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.request_done = false;
                    $(this).children('div').hasClass('delete_cap') ? $(this).parent('div').addClass('deleting_capt') : $(this).parent('div').removeClass('deleting_capt');
                    if (westerb_sal.perms == 1)
                        westerb_sal.display_msg('As a guest, you do not have sufficient privileges to edit photo captions', 'notice');
                    else {
                        westerb_sal.clicked_input_parent = $(this).parent('div');
                        var p_message, val = '';
                        if ($(this).children('div').hasClass('delete')) {
                            p_message = 'Deleting';
                            val = ''
                        }
                        else {
                            p_message = 'Updating';
                            val = encodeURIComponent(westerb_sal.clicked_input_parent.parent('form').children('.mini_form_edit_field').val().replace(' ', '+', 'gm'))
                        }
                        westerb_sal.clicked_input_parent.get(0).processing_msg(p_message);
                        westerb_sal.xhr_add_capt.open('post', westerb_sal.HOME + 'ajax/misc_calls.php?p_cap=' + westerb_sal.clicked_input_parent.parent('form').parent('td').parent('tr').attr('p_id'), true);
                        westerb_sal.xhr_add_capt.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        westerb_sal.xhr_add_capt.send('p_cap=' + val);
                    }
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        show_add_capt_input: {
            value: function(e) {
                if (!westerb_sal.blocking_dialog) {
                    var clicked_parent = $(this).parent('td'), content = "<form class='mini_form' action='misc_calls.php?p_cap=" + clicked_parent.parent('tr').attr('p_id') + "' method='post'>";
                    content += "<textarea name='p_cap' class='fcapt mini_form_edit_field' maxlength='4000'></textarea>";
                    content += "<div class='capt_edit new_capt'><input type='submit' value='Add caption' class='scriptable_table_link show_capt_input'>";
                    content += "<span class='char_counter'>" + 4000 + "</span>";
                    content += "</div></form>";
                    clicked_parent.html(content);
                    clicked_parent.children('form').children('.capt_edit').children('input').bind('click', {'c_parent': clicked_parent}, westerb_sal.add_capt);
                } else
                    westerb_sal.scroll_to_dialog();
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        handle_add_capt_response: {
            value: function() {
                if (westerb_sal.xhr_add_capt.readyState === 4) {
                    westerb_sal.clear_p_timers();
                    if (westerb_sal.xhr_add_capt.status === 200) {
                        var response = $.trim(westerb_sal.xhr_add_capt.responseText.replace(' target="_blank"', '', 'gm'));
                        if (westerb_sal.clicked_input_parent.hasClass('deleting_capt')) {
                            //var add_capt_td_elem = westerb_sal.clicked_input_parent.parent('form').parent('td'); //because once the html content is inserted, the reference to 'clicked_input_parent' disappears and it wouldn't be easily possible to bind 'show_add_capt_input' to the a element
                            westerb_sal.clicked_input_parent.parent('form').parent('td').html("<a class='scriptable_table_link show_capt_input' href='list_photos.php?a_id=" + westerb_sal.pagination.album_selected + "&pcap_id=" + westerb_sal.clicked_input_parent.parent('form').parent('td').parent('tr').attr('p_id') + "'>Add caption</a>");
                            westerb_sal.display_tiny_msg();
                            westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set, $('table tbody').html()); //re-storing the set 'coz the change will visually affect the pre-stored set
                        } else {
                            if (/Notice:/.test(response))
                                westerb_sal.display_tiny_msg(response.replace('Notice:', ''), 'notice', 4000);
                            else {
                                westerb_sal.clicked_input_parent.parent('form').children('.mini_form_edit_field').val(response).text(response);
                                westerb_sal.display_tiny_msg();
                            }
                            westerb_sal.clicked_input_parent.removeClass('new_capt');
                            westerb_sal.clicked_input_parent.html("<input type='submit' value='Update changes' class='scriptable_table_link edit_caption'><span class='char_counter'>" + (4000 - westerb_sal.clicked_input_parent.parent('form').children('.mini_form_edit_field').val().length) + "</span><a class='scriptable_table_link' href='edit_capt.php?dp_cap=" + westerb_sal.clicked_input_parent.parent('form').parent('td').parent('tr').attr('p_id') + "' title='Delete caption'><div class='absolute_pos delete delete_cap'>&#x2717;</div></a>");
                            if (!/Notice:/.test(response)) { //only when there was actually a change made in the text
                                westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_' + 's' + westerb_sal.pagination.current_set, $('table tbody').html()); //re-storing the set 'coz the change will visually affect the pre-stored set
                            }
                        }
                    } else {
                        var to_restore = westerb_sal.clicked_input_parent.hasClass('new_capt') ? "<input type='submit' value='Add caption' class='scriptable_table_link show_capt_input'><span class='char_counter'>" + (4000 - westerb_sal.clicked_input_parent.parent('form').children('.mini_form_edit_field').val().length) + "</span>" : "<input type='submit' value='Update changes' class='scriptable_table_link edit_caption'><span class='char_counter'>" + (4000 - westerb_sal.clicked_input_parent.parent('form').children('.mini_form_edit_field').val().length) + "</span><a class='scriptable_table_link' href='edit_capt.php?dp_cap=" + westerb_sal.clicked_input_parent.parent('form').parent('td').parent('tr').attr('p_id') + "' title='Delete caption'><div class='absolute_pos delete delete_cap'>&#x2717;</div></a>";
                        westerb_sal.clicked_input_parent.html(to_restore);
                        westerb_sal.display_tiny_msg('Failure: ' + westerb_sal.xhr_add_capt.status, 'error', 4000) /////////////////////////////////////////
                        if (westerb_sal.clicked_input_parent.hasClass('new_capt'))
                            westerb_sal.clicked_input_parent.children('input').bind('click', {'c_parent': westerb_sal.clicked_input_parent.parent('form').parent('td')}, westerb_sal.add_capt);
                    }
                }
            }, writable: false, enumerable: true, configurable: true
        },
        xhr_del_photo: {
            value: westerb_sal.create_xhr(), writable: false, enumerable: true, configurable: true
        },
        del_photo: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.request_done = false;
                    if (westerb_sal.perms == 1)
                        westerb_sal.display_msg('As a guest, you do not have sufficient privileges to delete photos', 'notice');
                    else {
                        $('.clicked').removeClass('clicked');
                        $(this).parent('td').addClass('clicked'); //for reference in the handle_response function
                        $(this).parent('td').get(0).processing_msg();
                        westerb_sal.xhr_del_photo.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?del_p_id=' + $('.clicked').parent('tr').attr('p_id'), true);
                        westerb_sal.xhr_del_photo.send(null);
                    }
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        handle_del_photo_response: {
            value: function() {
                if (westerb_sal.xhr_del_photo.readyState === 4) {
                    var clicked_parent = $('.clicked');
                    westerb_sal.clear_p_timers();
                    if (westerb_sal.xhr_del_photo.status === 200) {
                        clicked_parent.parent('tr').slideUp(400, function() {
                            $(this).remove();
                        });
                        var after_del_u_count = parseInt($("#u_count").text(), 10) - 1;
                        $("#u_count").text(after_del_u_count);
                        westerb_sal.clear_sets();
                        westerb_sal.clear_albums('a'); //clears the 'All albums' group in 'list_albums.php'
                        westerb_sal.clear_albums($('#photos_wrapper').attr('ao_id')); //the change will also affect the album group other than "All albums" to which the current album affected by the photo deletion belongs; clearing ensures everything is loaded fresh from the server again
                        westerb_sal.clear_main_page_state('#list_photos_' + $('span.modal_caller_parent.new_photo').attr('a_id')); //clear the '#main' div state for the current page too

                        if (after_del_u_count == 1) {
                            $('#plural_s').text('');
                            $('#del_all').parent('span').prev().fadeOut(300, function() {
                                $(this).remove()
                            });
                            $('#del_all').parent('span').fadeOut(300, function() {
                                $(this).remove()
                            });
                        }
                        if (after_del_u_count == 0) {
                            $('#plural_s').text('s');
                            $('#del_album').parent('span').prev().fadeOut(300, function() {
                                $(this).remove()
                            });
                            $('#del_album').parent('span').fadeOut(300, function() {
                                $(this).remove()
                            });
                            window.setTimeout(function() { //wait for the last tr element to slide up first
                                $('table').replaceWith("<div id='no_photos_alert'>There are currently no photos in this album</div>");
                            }, 400);
                        } else {
                            if (after_del_u_count <= 4) {
                                if ($("#u_count").text() == 4) {
                                    $('#nav').remove();
                                    $('#ux_nav_guide').hide();
                                    if (westerb_sal.pagination.current_set != 1)
                                        westerb_sal.pagination.current_set--;
                                    westerb_sal.get_units_animation_timer = window.setTimeout(function() {
                                        $('table tbody').children().css('visibility', 'hidden');
                                    }, 90);
                                    $("#ajax_loading_pholder").html("<div id='pholder_msg'></div>");
                                    $('#pholder_msg').get(0).processing_msg('Loading');
                                    westerb_sal.xhr_for_units.open('get', westerb_sal.HOME + 'ajax/list_photos_u_retrieve.php?u_per_set=' + westerb_sal.pagination.units_per_set + '&offset=' + westerb_sal.pagination.offset() + '&o_id=' + westerb_sal.pagination.albums_owner + '&a_id=' + westerb_sal.pagination.album_selected, true);
                                    westerb_sal.xhr_for_units.send(null);
                                }
                            } else {
                                westerb_sal.get_units_animation_timer = window.setTimeout(function() {
                                    $('table tbody').children().css('visibility', 'hidden');
                                }, 90);
                                $("#ajax_loading_pholder").html("<div id='pholder_msg'></div>");
                                $('#pholder_msg').get(0).processing_msg('Loading');
                                westerb_sal.xhr_for_units.open('get', westerb_sal.HOME + 'ajax/list_photos_u_retrieve.php?u_per_set=' + westerb_sal.pagination.units_per_set + '&offset=' + westerb_sal.pagination.offset() + '&o_id=' + westerb_sal.pagination.albums_owner + '&a_id=' + westerb_sal.pagination.album_selected, true);
                                westerb_sal.xhr_for_units.send(null);
                            }
                        }
                        westerb_sal.request_done = true;
                    } else {
                        clicked_parent.html("<a href='delete_photo.php?p_id=" + clicked_parent.parent('tr').attr('p_id') + "' class='scriptable_table_link photo_delete'>Delete</a>");
                        westerb_sal.display_tiny_msg('Failure: ' + westerb_sal.xhr_del_photo.status, 'error', 4000) /////////////////////////////////////////
                    }
                }
            }, writable: false, enumerable: true, configurable: true
        },
        restore_pre_simulation_state: {
            value: function(e) {  //used when the user is Guest to restore the correct photo count and ux_nav_guide numbers when the next/prev link is clicked
                if ($(this).children('div').hasClass('inactive')) //if the current page is 1 ('previous link' would be inactive in this case) or there are no more sets to fetch ('next link' would be inactive in this case)
                    $('tr.simulation_row').fadeOut(400, function() {
                        $(this).remove();
                    }) //remove the simulation rows, if the link happens to be clicked
                westerb_sal.pagination.adjust_prev_and_next();
                $('#u_count').text($('#u_count').attr('p_count_before_simulation_starts'));
                if ($('#u_count').attr('p_count_before_simulation_starts') == 0) {
                    $('span.del_album').prev('span.link_separator').fadeOut(400, function() {
                        $(this).next('span.del_album').fadeOut(400, function() {
                            $(this).remove();
                        });
                        $(this).remove();
                    })
                    $('span.del_all_photos').prev('span.link_separator').fadeOut(450, function() {
                        $(this).next('span.del_all_photos').fadeOut(450, function() {
                            $(this).remove();
                        });
                        $(this).remove();
                    })
                    $('#ux_nav_guide').text('0 of 0');
                    $('#plural_s').text('s');
                }
                else
                    $('#ux_nav_guide').text(westerb_sal.pagination.ux_nav_guide());
                if ($('#u_count').attr('p_count_before_simulation_starts') == 1) {
                    $('span.del_all_photos').prev('span.link_separator').fadeOut(450, function() {
                        $(this).next('span.del_all_photos').fadeOut(450, function() {
                            $(this).remove();
                        });
                        $(this).remove();
                    })
                    $('#plural_s').text('');
                }
            }, writable: false, enumerable: true, configurable: true
        },
        xhr_get_more_comments: {
            value: westerb_sal.create_xhr(), writable: false, enumerable: true, configurable: true
        },
        handle_get_more_comments_response: {
            value: function() {
                if (westerb_sal.xhr_get_more_comments.readyState === 4) {
                    var clicked_parent = $('.clicked'), comments_td = clicked_parent.parent('tr').next('tr').children('td'),
                            elems = '';
                    westerb_sal.clear_p_timers();
                    comments_td.children('div.load_more_msg').html('');
                    if (westerb_sal.xhr_get_more_comments.status === 200) {
                        comments_td.children('div.comments_wrapper').children('div.comments').append(westerb_sal.xhr_get_more_comments.responseText);
                        elems = comments_td.children('div.comments_wrapper').children('div.comments').children('div.comment').children('a.del_com');
                        elems.each(function() {
                            if (!$(this).hasClass('bound'))
                                $(this).click(westerb_sal.del_com).addClass('bound');
                        });
                        comments_td.children('div.comments_wrapper').attr('cur_set', parseInt(comments_td.children('div.comments_wrapper').attr('cur_set'), 10) + 1); //increment the 'cur_set' value so that the next 'load_more' fetches the right set, even if the comments were closed and re-opened from local storage
                        westerb_sal.store_comments('list_photos_pc_id=' + clicked_parent.parent('tr').attr('p_id'), clicked_parent.parent('tr').next('tr').children('td').html()); //re-storing the comments so that next time they're loaded from local storage, the appended comments are also loaded
                        westerb_sal.request_done = true;
                    } else
                        westerb_sal.display_tiny_msg('Failure: ' + westerb_sal.xhr_get_more_comments.status) /////////////////////////////////////////
                }
            }, writable: false, enumerable: true, configurable: true
        },
        load_more_comments: {
            value: function(e) {
                if ($(this).scrollTop() === $(this).prop("scrollHeight") - 280) {
                    if (westerb_sal.request_done) {
                        if (westerb_sal.blocking_dialog) {
                            westerb_sal.scroll_to_dialog();
                            westerb_sal.highlight_dialog(e);
                        }
                        else {
                            $('.clicked').removeClass('clicked');
                            $(this).parent('td').parent('tr').prev('tr').children('td.see_close_coms').addClass('clicked');
                            var s_pagination = westerb_sal.s_pag_instances['p_id_' + $('.clicked').parent('tr').attr('p_id')],
                                    cur_set = parseInt($(this).attr('cur_set'), 10);
                            westerb_sal.request_done = false;
                            s_pagination.current_set = cur_set;
                            if (!s_pagination.next_set())
                                westerb_sal.request_done = true;
                            else {
                                $('.clicked').removeClass('create_new_s_pag'); //prevents creation of a new instance of 'Scroll_pagination' since one will already have been created each time 'See comments' is clicked
                                $(this).parent('td').children('div.load_more_msg').css('margin-top', '245px').get(0).processing_msg("Loading more");
                                s_pagination.current_set++;
                                westerb_sal.xhr_get_more_comments.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?pc_id=' + $(this).parent('td').parent('tr').prev('tr').attr('p_id') + '&u_per_set=' + s_pagination.units_per_set + '&offset=' + s_pagination.offset(), true);
                                westerb_sal.xhr_get_more_comments.send(null);
                            }
                        }
                    } else
                        ;
                }
            }, writable: false, enumerable: true, configurable: true
        },
        xhr_del_com: {
            value: westerb_sal.create_xhr(), writable: false, enumerable: true, configurable: true
        },
        visualize_comment_deletion: {
            value: function() {
                var clicked_parent = $('.clicked'), clicked_parent_parent = clicked_parent.parent('div'),
                        remaining_comments = parseInt(clicked_parent_parent.siblings('p').children('span:first').text(), 10) - 1;

                westerb_sal.clear_p_timers();
                clicked_parent_parent.parent('div').siblings('.load_more_msg').html('');

                clicked_parent_parent.siblings('p').children('span:first').text(remaining_comments + (remaining_comments == 1 ? ' comment' : ' comments'));
                if (remaining_comments === 1)
                    clicked_parent_parent.siblings('p').children('span:last').fadeOut(250, function() {
                        $(this).remove()
                    });
                clicked_parent.slideUp(350, function() {
                    $(this).remove();
                    if (parseInt(clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').children('td.see_close_coms').attr('u_count'), 10) > 8 && clicked_parent_parent.children('div').size() == 0) {
                        var this_photo_s_pag = westerb_sal.s_pag_instances['p_id_' + clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')];
                        this_photo_s_pag.current_set = parseInt(clicked_parent_parent.parent('div').attr('cur_set'), 10);
                        $('.clicked').removeClass('clicked');
                        clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').children('td.see_close_coms').addClass('clicked');
                        if (!this_photo_s_pag.next_set())
                            ;
                        else {
                            westerb_sal.request_done = false;
                            $('.clicked').removeClass('create_new_s_pag'); //prevents creation of a new instance of 'Scroll_pagination' since one will already have been created each time 'See comments' is clicked
                            clicked_parent_parent.parent('div').parent('td').children('div.load_more_msg').css('margin-top', '6px').get(0).processing_msg('Please wait');
                            this_photo_s_pag.current_set++;
                            westerb_sal.xhr_get_more_comments.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?pc_id=' + clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').attr('p_id') + '&u_per_set=' + this_photo_s_pag.units_per_set + '&offset=' + this_photo_s_pag.offset(), true);
                            westerb_sal.xhr_get_more_comments.send(null);
                        }
                    }
                });
                if (remaining_comments === 0) {
                    clicked_parent_parent.parent('div').parent('td').parent('tr').slideUp(360, function() {
                        westerb_sal.clear_sets(); //this change visually affects the current set and it needs to be cleared (unfortunately, at the expense of others as well 'coz it's the most elegant solution for now)
                        //westerb_sal.clear_comments(clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')); //free up memory, and to prevent loading from local storage when new comments come in, because local storage will only show there aren't any comments
                        if (westerb_sal.s_pag_instances['p_id_' + clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')])
                            delete westerb_sal.s_pag_instances['p_id_' + clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')]; //house cleaning
                        $(this).remove();
                    });
                    clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').children('.see_close_coms').text('No comments');
                }
                $('#wait_msg').fadeOut(10, function() {
                    $(this).remove();
                });
                westerb_sal.clear_comments(clicked_parent_parent.parent('div').parent('td').parent('tr').prev('tr').attr('p_id')); //whenever a comment is deleted, the best course is to clear the pre-stored comments and load afresh next time "See comments" is clicked
                westerb_sal.request_done = true;
            }, writable: false, enumerable: true, configurable: true
        },
        del_com: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.request_done = false;
                    $('.clicked').removeClass('clicked');
                    $(this).parent('div').addClass('clicked'); //for reference in the handle_response function
                    $(this).parent('div').parent('div').parent('div').siblings('.load_more_msg').css('margin-top', '22px').get(0).processing_msg('Deleting');
                    if (westerb_sal.perms == 1) {
                        setTimeout(function() { //simulate a server delay of 1000ms
                            westerb_sal.visualize_comment_deletion();
                        }, 1000);
                    } else {
                        westerb_sal.xhr_del_com.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?dc_id=' + $('.clicked').attr('c_id'), true);
                        westerb_sal.xhr_del_com.send(null);
                    }
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        handle_del_com_response: {
            value: function() {
                if (westerb_sal.xhr_del_com.readyState === 4) {
                    if (westerb_sal.xhr_del_com.status === 200) {
                        westerb_sal.visualize_comment_deletion();
                    } else
                        westerb_sal.display_tiny_msg('Failure: ' + westerb_sal.xhr_del_com.status) /////////////////////////////////////////
                }
            }, writable: false, enumerable: true, configurable: true
        },
        visualize_all_photos_or_album_deletion: {
            value: function(d_trigger_parent, what) {
                var rows = [], h = 0, row = null, u_count = $('#u_count');
                function album_erase() {
                    $('tr').each(function() {
                        rows.push($(this));
                    });
                    h = rows.length - 1;
                    (function remove_photo() {
                        row = rows[h];
                        row.fadeOut(450, function() {
                            row.remove()
                        });
                        h--;
                        if (h >= 0) {
                            if (row.attr('p_id')) //only if the removed row was a photo row ( and not a comments row)
                                window.setTimeout(function() {
                                    u_count.text(parseInt(u_count.text(), 10) - 1);
                                    $('#plural_s').text(h === 1 ? '' : 's');
                                }, 450);
                            window.setTimeout(remove_photo, 470);
                            if (h === 0)
                                window.setTimeout(function() {
                                    westerb_sal.clear_sets(); //just to free memory and incase the freakish accident of album with same id created again
                                    if (what === 'photos') {
                                        westerb_sal.clear_p_timers();
                                        var del_all = $('span.del_confirm_parent:first'), del_album = $('#del_album')
                                        $('span.link_separator:last').remove();
                                        del_album.fadeOut(300, function() {
                                            del_album.remove()
                                        });
                                        del_all.prev().remove();
                                        del_all.fadeOut(400, function() {
                                            del_all.remove()
                                        });
                                        $('table').replaceWith("<div id='no_photos_alert'></div>");
                                        $('#no_photos_alert').hide().text('There are currently no photos in this album').fadeIn(500);
                                    } else {
                                        westerb_sal.clear_p_timers();
                                        d_trigger_parent.get(0).processing_msg('Redirecting');
                                        window.setTimeout(function() {
                                            westerb_sal.clear_p_timers();
                                            location = 'list_albums.php';
                                        }, 2000);
                                    }
                                    westerb_sal.request_done = true;
                                }, 700);
                        }
                    })();
                }
                if (parseInt(u_count.text(), 10) > 4) {
                    $('#nav').fadeOut(400, function() {
                        $('#ux_nav_guide').fadeOut(400, function() {
                            u_count.text('4');
                            album_erase();
                        })
                    });
                } else {
                    u_count.text('4');
                    album_erase();
                }
            }, writable: false, enumerable: true, configurable: true
        },
        del_all_photos: {
            value: function(d_trigger_parent, what) {
                westerb_sal.request_done = false;
                if (westerb_sal.perms == 1)
                    westerb_sal.visualize_all_photos_or_album_deletion(d_trigger_parent, what);
                else {
                    westerb_sal.xhr_del_all.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?dpa_id=' + d_trigger_parent.attr('a_id'), true);
                    westerb_sal.xhr_del_all.send(null);
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        del_album: {
            value: function(d_trigger_parent, what) {
                westerb_sal.request_done = false;
                if (westerb_sal.perms == 1)
                    westerb_sal.visualize_all_photos_or_album_deletion(d_trigger_parent, what);
                else {
                    westerb_sal.xhr_del_all.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?da_id=' + d_trigger_parent.attr('a_id'), true);
                    westerb_sal.xhr_del_all.send(null);
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        },
        visualize_all_comments_deletion: {
            value: function(d_trigger_parent) {
                var comments = [], i = 0, comment = null;
                d_trigger_parent.parent('p').parent('div').children('.comments').children('div').each(function() {
                    comments.push($(this));
                })
                i = comments.length - 1;
                (function remove_comment() {
                    comment = comments[i];
                    comment.slideUp(300, function() {
                        comment.remove()
                    });
                    i--;
                    if (i >= 0) {
                        window.setTimeout(function() {
                            d_trigger_parent.parent('p').children('span:first').text(i + (i === 1 ? ' comment' : ' comments'));
                        }, 300);
                        window.setTimeout(remove_comment, 310);
                        if (i === 0) {
                            window.setTimeout(function() {
                                westerb_sal.clear_p_timers();
                                var tr_ancestor = d_trigger_parent.parent('p').parent('div').parent('td').parent('tr');
                                tr_ancestor.fadeOut(500, function() {
                                    westerb_sal.clear_comments(tr_ancestor.prev('tr').attr('p_id')); //free up memory, and to prevent loading from local storage when new comments come in
                                    tr_ancestor.remove()
                                });
                                westerb_sal.display_tiny_msg();
                                tr_ancestor.prev('tr').children('.see_close_coms').text('No comments');
                                window.setTimeout(function() {
                                    westerb_sal.store_set(westerb_sal.cur_pg + '_' + westerb_sal.pagination.set_group + '_s' + westerb_sal.pagination.current_set, $('table tbody').html()); //re-storing the set 'coz the change will visually affect the pre-stored set
                                }, 550)
                            }, 500);
                        }
                    }
                })();
            }, writable: false, enumerable: true, configurable: true
        },
        del_all_comments: {
            value: function(d_trigger_parent) {
                westerb_sal.request_done = false;
                if (westerb_sal.perms == 1)
                    westerb_sal.visualize_all_comments_deletion(d_trigger_parent);
                else {
                    d_trigger_parent.parent('p').parent('div').parent('td').parent('tr').prev('tr').children('.see_close_coms').children('a').addClass('del_in_progress');
                    westerb_sal.xhr_del_all.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?del_pc_id=' + d_trigger_parent.parent('p').parent('div').parent('td').parent('tr').prev('tr').attr('p_id'), true);
                    westerb_sal.xhr_del_all.send(null);
                }
                return false;
            }, writable: false, enumerable: true, configurable: true
        }
    })
    westerb_sal.xhr_make_cover.onreadystatechange = westerb_sal.handle_cover_change_response;
    westerb_sal.xhr_get_comments.onreadystatechange = westerb_sal.handle_get_comments_response;
    westerb_sal.xhr_add_capt.onreadystatechange = westerb_sal.handle_add_capt_response;
    westerb_sal.xhr_del_photo.onreadystatechange = westerb_sal.handle_del_photo_response;
    westerb_sal.xhr_del_com.onreadystatechange = westerb_sal.handle_del_com_response;
    westerb_sal.xhr_get_more_comments.onreadystatechange = westerb_sal.handle_get_more_comments_response;

//extending "Object.prototype.westerb_sal" with helper functions relevant for to the 'list_users.php' page
    Object.defineProperties(Object.prototype.westerb_sal, {
        xhr_del_user: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        visualize_user_deletion: {
            value: function() {
                $('.clicked').slideUp(150, function() {
                    $(this).prev('td').slideUp(150, function() {
                        $(this).prev('td').slideUp(150, function() {
                            $(this).prev('td').slideUp(150, function() {
                                $(this).prev('td').slideUp(150, function() {
                                    $(this).parent('tr').slideUp(100, function() {
                                        var deleted_u_id = $(this).attr('u_id');
                                        $(this).remove();
                                        $('#u_count').text(parseInt($('#u_count').text()) - 1);
                                        if (deleted_u_id === westerb_sal.cur_u_id) { //if the user is deleting herself
                                            westerb_sal.display_msg('You successfully deleted yourself from The Salon', 'success', 4000);
                                            westerb_sal.request_done = false; //to prevent any further action from the user before the redirect happens
                                            window.setTimeout(function() {
                                                window.location = '..';
                                            }, 4300);
                                        } else
                                            westerb_sal.display_msg('The user was successfully deleted', 'success', 4000);
                                    });
                                });
                            });
                        });
                    });
                });
            }, writable: true, enumerable: true, configurable: true
        },
        handle_del_user_response: {
            value: function() {
                if (westerb_sal.xhr_del_user.readyState === 4) {
                    westerb_sal.clear_p_timers();
                    if (westerb_sal.xhr_del_user.status === 200) {
                        if (westerb_sal.perms != 1)
                            westerb_sal.clear_main_page_state(); //clear the '#main' div state for the 'list_users.php' page only if the current user isn't Guest (Guest's actions have no consequences)
                        westerb_sal.visualize_user_deletion();
                    }
                    else {
                        var clicked_parent = $('.clicked');
                        clicked_parent.css('font-size', '13px').html("<a href='delete_user.php?u_id=" + clicked_parent.parent('tr').attr('u_id') + "' class='scriptable_table_link user_delete'>Delete user</a>");
                        westerb_sal.display_msg('Failure: ' + westerb_sal.xhr_del_user.status); /////////////////////////////////////////
                    }
                }
            }, writable: true, enumerable: true, configurable: true
        },
        del_user: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    westerb_sal.request_done = false;
                    $('.clicked').removeClass('clicked');
                    $(this).parent('td').addClass('clicked'); //for reference in the handle_response function
                    $(this).parent('td').css('font-size', '12px').get(0).processing_msg();
                    if (westerb_sal.perms == 1)
                        window.setTimeout(westerb_sal.visualize_user_deletion, 2000); //delay a bit to simulate a 'busy deleting' state
                    else {
                        westerb_sal.xhr_del_user.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?du_id=' + $('.clicked').parent('tr').attr('u_id'), true);
                        westerb_sal.xhr_del_user.send(null);
                    }
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        }
    });
    westerb_sal.xhr_del_user.onreadystatechange = westerb_sal.handle_del_user_response;
//westerb_sal.xhr_update_perms.onreadystatechange = westerb_sal.handle_update_perms_response;
//westerb_sal.xhr_change_password.onreadystatechange = westerb_sal.handle_change_password_response;
//westerb_sal.xhr_change_username.onreadystatechange = westerb_sal.handle_username_password_response;

//extending "Object.prototype.westerb_sal" with helper functions relevant for to the 'list_users.php' page
    Object.defineProperties(Object.prototype.westerb_sal, {
        xhr_clear_log: {
            value: westerb_sal.create_xhr(), writable: true, enumerable: true, configurable: true
        },
        visualize_log_clearing: {
            value: function() {
                var clicked_parent = $('.clicked'), entries = $('tr.log_entry').toArray(), entry = null;
                entry_count = entries.length, i = entry_count - 1, linear_increment = Math.ceil(400 / entry_count),
                        percent_increment = Math.ceil(100 / entry_count), p_wrapper = $('#progress_wrapper'),
                        p_percent = $('#upload_progress_percent'), slideup_duration = entry_count <= 15 ? 50 : 20;
                clicked_parent.get(0).processing_msg('Clearing logs');
                p_wrapper.css('width', '0px').show();
                p_percent.css('left', '4px').show().text('0%');
                (function remove_entry() {
                    entry = $(entries[i]);
                    entry.children('td:last').slideUp(slideup_duration, function() {
                        $(this).prev('td').slideUp(slideup_duration, function() {
                            $(this).prev('td').slideUp(slideup_duration, function() {
                                $(this).prev('td').slideUp(slideup_duration, function() {
                                    $(this).parent('tr').slideUp(slideup_duration, function() {
                                        $(this).remove();
                                        p_wrapper.width(function(i, cur_val) {
                                            if (parseInt(cur_val) + linear_increment > 400)
                                                return 400;
                                            else
                                                return parseInt(cur_val) + linear_increment;
                                        }); //
                                        p_percent.css('left', function(i, cur_val) {
                                            if (parseInt(cur_val) + linear_increment > 404)
                                                return 404;
                                            else
                                                return parseInt(cur_val) + linear_increment;
                                        }); //""
                                        if (parseInt(p_percent.text()) + percent_increment > 100)
                                            p_percent.text('100%');
                                        else
                                            p_percent.text(parseInt(p_percent.text()) + percent_increment + '%');
                                    });
                                });
                            });
                        });
                    });
                    --i;
                    if (i > 0) {
                        window.setTimeout(remove_entry, 5 * slideup_duration);
                    }
                    if (i === 0) {
                        remove_entry();
                        window.setTimeout(function() {
                            westerb_sal.clear_p_timers();
                            clicked_parent.html("<a id='clear_logs' href='" + westerb_sal.HOME + "admin/logfile.php?clear=true' class='scriptable_gen_link'>Clear log file</a>");
                            var today = new Date;
                            $('tbody').append(westerb_sal.perms == 1 ? '<tr style=\'display: none; \' class=\'log_entry\'><td>Clear logs simulation</td><td>Welcomed Guest</td><td>' + (((today.getDate() < 10 ? '0' : '') + today.getDate()) + '-' + ((today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1)) + '-' + today.getFullYear()) + '</td><td>' + (((today.getHours() < 10 ? '0' : '') + today.getHours()) + ':' + ((today.getMinutes() < 10 ? '0' : '') + (today.getMinutes())) + ':' + ((today.getSeconds() < 10 ? '0' : '') + (today.getSeconds()))) + '</td></tr>' : $.trim(westerb_sal.xhr_clear_log.responseText));
                            $('tr.log_entry').fadeIn(1500);
                            p_percent.fadeOut(1500);
                            p_wrapper.fadeOut(1500, function() {
                                westerb_sal.display_msg('Logs successfully cleared', 'success', 4000);
                            })
                        }, 5 * slideup_duration);
                    }
                })();
            }, writable: true, enumerable: true, configurable: true
        },
        handle_clear_log_response: {
            value: function() {
                if (westerb_sal.xhr_clear_log.readyState === 4) {
                    westerb_sal.clear_p_timers();
                    if (westerb_sal.xhr_clear_log.status === 200) {
                        westerb_sal.clear_main_page_state(); //clear the '#main' div state for the current page incase the state was already stored, so that next time the page is called, fresh markup is retrieved from the server
                        westerb_sal.visualize_log_clearing();
                    }
                    else {
                        var clicked_parent = $('.clicked');
                        clicked_parent.html("<a id='clear_logs' href='" + westerb_sal.HOME + "admin/logfile.php?clear=true' class='scriptable_gen_link'>Clear log file</a>");
                        westerb_sal.display_msg('Failure: ' + westerb_sal.xhr_clear_log.status); /////////////////////////////////////////
                    }
                }
            }, writable: true, enumerable: true, configurable: true
        },
        clear_logs: {
            value: function(e) {
                if (westerb_sal.blocking_dialog)
                    westerb_sal.scroll_to_dialog();
                else if (!westerb_sal.request_done)
                    westerb_sal.please_wait_msg(e);
                else { //only when the xhr object/server isn't busy or there's no "blocking"
                    if ($('tr.log_entry').size() === 1)
                        westerb_sal.display_msg('There is nothing to clear at the moment', 'notice', 4000);
                    else {
                        westerb_sal.request_done = false;
                        $('.clicked').removeClass('clicked');
                        $(this).parent('span').addClass('clicked'); //for reference in the handle_response function
                        $(this).parent('span').get(0).processing_msg('Please wait');
                        if (westerb_sal.perms == 1) {
                            window.setTimeout(function() {
                                westerb_sal.clear_p_timers();
                                westerb_sal.visualize_log_clearing();
                            }, 2000); //delay a bit to simulate a 'busy initiating clearing' state
                            westerb_sal.log_action('Clear logs simulation');
                            westerb_sal.clear_main_page_state(); //clear the '#main' div state for the current page incase the state was already stored, so that next time the page is called, fresh markup is retrieved from the server and Guest can see their activity has also just been logged
                        }
                        else {
                            westerb_sal.xhr_clear_log.open('get', westerb_sal.HOME + 'ajax/misc_calls.php?clearlogs', true);
                            westerb_sal.xhr_clear_log.send(null);
                        }
                    }
                }
                return false;
            }, writable: true, enumerable: true, configurable: true
        }
    })
    westerb_sal.xhr_clear_log.onreadystatechange = westerb_sal.handle_clear_log_response;

    window.location.hash = ''; //always reset the fragment identifier on initial page load and subsequent reloads so that the 'hashchange' event fires as expected

//Reposition and resize "gallery elements" with respect to screen size information
    $(window).resize(function() {
        if ($('#outer_wrapper').hasClass('selected_photo_wrapper'))
            westerb_sal.readjust_gallery_elems();
    });

//Reposition and resize certain design elements on 'public_index.php' with respect to screen size information, as long as it's not "the gallery"
    $(window).resize(function() {
        if (!$('#outer_wrapper').hasClass('selected_photo_wrapper'))
            westerb_sal.readjust_general_public_elems();
    });

//for preventing multiple, concurrent calls on the scrolling function triggered by different hover events on the element-- as sometimes happens when the gallery is navigated through "the thumbs"
    $('body').on('mouseenter', '#gallery_thumbs_wrapper', westerb_sal.stop_thumbs_wrapper_scroll);
//for scrolling the '#gallery_thumbs_wrapper' element
    $('body').on('mouseenter', '#gallery_thumbs_wrapper', westerb_sal.scroll_thumbs_wrapper);

//for stoping scrolling the '#gallery_thumbs_wrapper' element
    $('body').on('mouseleave', '#gallery_thumbs_wrapper', westerb_sal.stop_thumbs_wrapper_scroll);

//for hiding and showing '.hover_triggered' elements
    $('body').on('mouseenter', '.hover_trigger', function() {
        $(this).children('.hover_triggered').fadeIn(10);
        $(this).children("a").children(".hover_triggered").fadeIn(10);
    });

    $('body').on('mouseleave', '.hover_trigger', function() {
        $(this).children('.hover_triggered').fadeOut(5);
        $(this).children("a").children('.hover_triggered').fadeOut(5);
    });

//delegating the click event on the '.scriptable_gen_nav_link.prev_set' element to the body element
    $('body').on('click', '.scriptable_gen_nav_link.prev_set', westerb_sal.get_previous_set);
//delegating the click event on the '.scriptable_gen_nav_link.next_set' and '.scriptable_gen_link.gallery_thumb_link' elementents to the body element
    $('body').on('click', '.scriptable_gen_nav_link.next_set, .scriptable_gen_link.gallery_thumb_link', westerb_sal.get_next_set);
    $('body').on('click', '.scriptable_gen_nav_link.prev_set, .scriptable_gen_nav_link.next_set', function() {
        if (westerb_sal.cur_pg === 'list_photos' && westerb_sal.perms == 1)
            westerb_sal.restore_pre_simulation_state();
    });

//delegating the click event on the '.scriptable_header_link' elements to the body element, to prevent further action when there is a blocking dialog or the application is busy with some request
    $('body').on('click', '.scriptable_header_link', function(e) {
        if (westerb_sal.blocking_dialog) {
            e.stopImmediatePropagation(); //prevents the event from propagating to 'body' and trigger the 'westerb_sal.get_hash_changer_requested_content' handler
            e.preventDefault();
            westerb_sal.scroll_to_dialog();
        }
        else if (!westerb_sal.request_done) {
            e.stopImmediatePropagation();
            e.preventDefault();
            westerb_sal.please_wait_msg(e);
        }
    });

//delegating the click event on any '.scriptable_hash_changer' element to the body element
    $('body').on('click', '.scriptable_hash_changer', westerb_sal.get_hash_changer_requested_content);

//delegating the click event on any 'fullscreen_closer' to the body element, making the event handler 'live'
    $('body').on('click', '.fullscreen_closer', westerb_sal.exit_full_screen_mode);

//delegating the click event on any 'scriptable_hash_changer' to the body element
    $('body').on('click', '.scriptable_prev_state_restorer', westerb_sal.restore_prev_state);

//delegating the click event on any '.public_albums_nav_link' element to the body element
    $('body').on('click', '.public_albums_nav_link', westerb_sal.switch_owner);

//binding a number of custom events on the body that will be triggered to call specific functions for animating the removal of '.hash_change_removed' elements
    $('body').bind('class1_removal', {'class_number': 1}, westerb_sal.remove_hash_removed_elems).bind('class2_removal', {'class_number': 2}, westerb_sal.remove_hash_removed_elems).bind('class3_removal', {'class_number': 3}, westerb_sal.remove_hash_removed_elems).bind('class4_removal', {'class_number': 4}, westerb_sal.remove_hash_removed_elems);

//listen to the hashchange event on the Window object
    $(window).bind('hashchange', westerb_sal.handle_hash_change);

    if (westerb_sal.dev_mode) {
        //alert uncaught exceptions during development mode
        window.onerror = function(msg, url, line) {
            alert('Error: ' + msg + '\n\n' + 'URL: ' + url + '\n\n' + 'Line number: ' + line);
            return false;
        }
    } else {
        $(document).contextmenu(function(e) {
            //a convenient way to hide my code

            //REVISIT: CONSTRUCT A CUSTOM CONTEXT MENU. POSSIBLE MENU ITEMS:
            //1.Back, 2.Forward, 3.Reload, 4.Bookmark page, 5.Login, 6.Logout,
            //7.Open link in new tab, 8.Open link in new window, 9.Bookmark link, 10.Copy link location
            //if($(e.target).is('a')) {
            //alert(e.target);
            //}
            e.preventDefault();
        });
    }

//delegating the click, mouseenter and mouseleave events on a number of elements on "public_index.php", and other elements that never get replaced across pages, to the body element
    $('body').on('click', '.to_album', westerb_sal.get_album_for_display);
    $('body').on('click', '.to_album', westerb_sal.full_screen_mode);
    $('body').on('click', '.preview_photo, .a_photo', westerb_sal.get_photo_for_display);
    $('body').on('click', '.preview_photo, .a_photo', westerb_sal.full_screen_mode);
    $('body').on('mouseenter', '.show_prevs', function() {
        var prev_count = $(this).siblings('div.album_preview').attr('count');
        $(this).parent('div.album').children('div.album_preview').css('display', 'inline-block');
        $(this).parent('div.album').children('div.album_preview').animate({'width': prev_count == 0 ? 122 : ($('#outer_wrapper').innerWidth() / 5.68)}, 100, 'linear');
    });
    $('body').on('mouseleave', '.show_prevs', function() {
        var prev_count = $(this).siblings('div.album_preview').attr('count');
        if (prev_count == 0) {
            $(this).parent('div.album').children('div.album_preview').animate({'width': 0}, 100, 'linear', function() {
                $(this).css('display', 'none');
            });
        } else
            ;
    });
    $('body').on('mouseleave', '.album', function() {
        var prev_count = $(this).children('div.album_preview').attr('count');
        if (prev_count != 0) {
            $(this).children('div.album_preview').animate({'width': 0}, 100, 'linear', function() {
                $(this).css('display', 'none');
            });
        } else
            ;
    });

//delegating the click event on a number of elements on "list_albums.php" and "list_photos.php" to the body element
    $('body').on('click', '.scriptable_gen_link.edit_a_name', westerb_sal.a_name_edit_mode);
    $('body').on('click', '.scriptable_gen_link.notes', westerb_sal.add_notes);
    $('body').on('click', '.scriptable_gen_link.photo_upload', westerb_sal.upload_photo_by_modal);
    $('body').on('click', '.scriptable_gen_link.confirm_del', westerb_sal.confirm_del);
    $('body').on('click', 'a.new_album_modal', function(e) {
        if (westerb_sal.blocking_dialog)
            westerb_sal.scroll_to_dialog();
        else if (!westerb_sal.request_done)
            westerb_sal.please_wait_msg(e);
        else //only when the xhr object/server isn't busy or there's no "blocking"
            westerb_sal.modal_dialog(e, $(this), westerb_sal.HOME + 'ajax/misc_calls.php?new_album_modal');
        return false;
    });
    $('body').on('click', '.save_a_name_edit', function(e) { //REVISIT: WHAT ARE THE IMPLICATIONS OF BINDING 'click' INSTEAD OF 'submit' here?????
        if (!westerb_sal.request_done)
            westerb_sal.please_wait_msg(e);
        else if (westerb_sal.blocking_dialog)
            westerb_sal.scroll_to_dialog();
        else {
            if ($.trim($(this).data('unedited_a_name')) === $.trim($(this).siblings('input.mini_form_edit_field').val())) {
                if (westerb_sal.perms == 2)
                    westerb_sal.display_msg('You did  not make any changes. Nothing to  update', 'notice', 2500);
                else
                    westerb_sal.display_albums_section_msg($(this).parents('div.albums_by').attr('id'), 'You did  not make any changes. Nothing to  update', 'notice', 2500);
            }
            else if (westerb_sal.perms == 1)
                westerb_sal.display_albums_section_msg($(this).parents('div.albums_by').attr('id'), 'As a guest, you do not have sufficient privileges to edit album names', 'notice', 3000);
            else {
                westerb_sal.request_done = false;
                var cur_album = $(this).parents('div.album'), sect_id = $(this).parents('div.albums_by').attr('id');
                cur_album.append("<div id='temp_a_processing_msg' style='position: absolute; top: 118px; left: 83px; '></div>");
                $('#temp_a_processing_msg').get(0).processing_msg();
                $.post(westerb_sal.HOME + 'ajax/misc_calls.php?enma_id=' + cur_album.attr('a_id'), {a_name: $(this).siblings('input.mini_form_edit_field').val()}).success(function(responseText, $_status, xhr) {
                    westerb_sal.clear_p_timers();
                    $('#temp_a_processing_msg').remove();
                    content = "<span class='name'>";
                    content += responseText + "</span>";
                    content += "<a href='list_albums.php?o_id=";
                    content += cur_album.attr('name') + "&enma_id=";
                    content += cur_album.attr('a_id');
                    content += "' class='edit edit_a_name scriptable_gen_link' title='Edit album name'></a>";
                    $('.album[a_id=' + cur_album.attr('a_id') + ']').each(function() {
                        $(this).find('a.cancel_name_edit').unbind('click'); //free up memory
                        $(this).find('div.name_edit_save').html(content);
                    });
                    westerb_sal.clear_albums('a');
                    westerb_sal.clear_albums(cur_album.attr('o_id'));
                    westerb_sal.clear_main_page_state('#list_albums'); //Particularily crucial for Normal's 'list_albums' page
                    westerb_sal.clear_main_page_state('#photo_upload'); //the list of albums by the user in the select options will need to update since a name in the list has now changed
                    westerb_sal.clear_main_page_state('#list_photos_' + cur_album.attr('a_id')); //the title of the album in the H2 element on the 'list_photos' page for the album will need to update since as the name has now changed

                    if (westerb_sal.perms == 2)
                        westerb_sal.display_msg('The album name was successfully updated', 'success', 2500);
                    else
                        westerb_sal.display_albums_section_msg(sect_id, 'The album name was successfully updated', 'success', 2500);
                }).error(function(xhr, $_status) {
                    westerb_sal.clear_p_timers();
                    $('#temp_a_processing_msg').remove();
                    if ($_status === 'timeout') {
                        if (westerb_sal.perms == 2)
                            westerb_sal.display_msg('The request is taking too long. Please refresh the page and try again', 'notice', 3000);
                        else
                            westerb_sal.display_albums_section_msg(sect_id, 'The request is taking too long. Please refresh the page and try again', 'notice', 3000);
                        westerb_sal.request_done = true;
                    }
                    else if ($_status === 'error')
                        if (westerb_sal.perms == 2)
                            westerb_sal.display_msg('Something went wrong while updating the name. Refresh the page and try again.');
                        else
                            westerb_sal.display_albums_section_msg(sect_id);
                });
            }
        }
        return false;
    });
    $('body').on('keyup', '.mini_form_edit_field', function(e) {
        var cur_counter = $(this).parents('form.mini_form').find('span.char_counter'), txt_len = $(this).val().length,
                max_len = parseInt($(this).attr('maxlength'), 10);

        if (txt_len > max_len) {
            $(this).val($(this).val().substring(0, max_len));
            txt_len = max_len;
        }
        cur_counter.text(max_len - txt_len);
    });

//delegating the click event on a number of elements on "list_photos.php" to the body element
    $('body').on('click', '.scriptable_table_link.change_cover', westerb_sal.make_cover);
    $('body').on('click', '.scriptable_table_link.display_comments', westerb_sal.see_comments);
    $('body').on('click', '.scriptable_table_link.hide_comments', westerb_sal.close_comments);
    $('body').on('click', '.scriptable_table_link.edit_caption, .scriptable_table_link.delete_cap', westerb_sal.update_capt_changes);
    $('body').on('click', '.scriptable_table_link.show_capt_input', westerb_sal.show_add_capt_input);
    $('body').on('click', '.scriptable_table_link.photo_delete', westerb_sal.del_photo);

//delegating the click event on a number of elements on "list_users.php" to the body element
    $('body').on('click', '.scriptable_table_link.user_delete', westerb_sal.del_user);

//delegating the click event on the '#clear_logs' element on "logfile.php" to the body element
    $('body').on('click', '.scriptable_gen_link#clear_logs', westerb_sal.clear_logs);

////Helper function for checking pre-existence of cookies
//Object.defineProperty(Object.prototype.westerb_sal,
//'cookie_exists', // Define Object.prototype.westerb_sal.cookie_exists
//{ writable: false, enumerable: true, configurable: true,
//value: function(name) {
//    var pairs = document.cookie.split("; "), name_val, c_exists = false;
//    pairs.forEach(function(e,i,a) {
//        name_val = e.split("=");
//        if(name_val[0] === name) c_exists = true;
//    })
//    return c_exists;
//}
//});
//
////Helper function for setting cookies
//Object.defineProperty(Object.prototype.westerb_sal,
//'set_cookie', // Define Object.prototype.westerb_sal.set_cookie
//{ writable: false, enumerable: true, configurable: true,
//value: function(name, val) {
//    var exp_date = new Date();
//    exp_date.setMonth(exp_date.getMonth()+2);
//    if(typeof val === "object")
//        document.cookie = ""+name+"="+JSON.stringify(val)+";expire="+exp_date.toGMTString()+";path=/";
//    else
//        document.cookie = ""+name+"="+val+";expire="+exp_date.toGMTString()+";path=/";
//}
//});
//
////Helper function for reading cookies
//Object.defineProperty(Object.prototype.westerb_sal,
//'read_cookie', // Define Object.prototype.westerb_sal.read_cookie
//{ writable: false, enumerable: true, configurable: true,
//value: function(name) {
//    var pairs = document.cookie.split("; "), name_val, val = false;
//    pairs.forEach(function(e,i,a) {
//        name_val = e.split("=");
//        if(name_val[0] === name) val = name_val[1];
//    })
//    return val;
//}
//});
//
////Helper function for adding properties to object cookies
//Object.defineProperty(Object.prototype.westerb_sal,
//'add_prop_to_cookie', // Define Object.prototype.westerb_sal.add_prop_to_cookie
//{ writable: false, enumerable: true, configurable: true,
//value: function(c_name, p_name, p_val) {
//    var o = JSON.parse(read_cookie(c_name)) //destringify the cookie value
//    if(typeof p_val === "object") {
//        if(!o.westerb_sal.prop_exists(p_name) || JSON.stringify(p_val) !== o[p_name] /*if the added value does not equal the pre-existing value, the state of the object had changed*/)
//            Object.defineProperty(o, p_name, {writable: false, enumerable: true, configurable: true, value: JSON.stringify(p_val)});
//        else ;
//    }
//    else {
//        if(!o.westerb_sal.prop_exists(p_name))
//            Object.defineProperty(o, p_name, {writable: false, enumerable: true, configurable: true, value: p_val});
//        else ;
//    }
//    if(!o.westerb_sal.prop_exists(p_name))
//        set_cookie(c_name, o); //reset the cookie
//}
//});
//
////Helper function for reading properties of object cookies
//Object.defineProperty(Object.prototype.westerb_sal,
//'read_prop_of_cookie', // Define Object.prototype.westerb_sal.read_prop_of_cookie
//{ writable: false, enumerable: true, configurable: true,
//value: function(c_name, p_name) {
//    var o = JSON.parse(read_cookie(c_name)) //destringify the cookie value
//    if(typeof o[p_name] === "string") {
//        try{
//            return JSON.parse(o[p_name]);
//        } catch(e) {
//            alert("Trying to retrieve a regular string, not JSON"); ////////MIGHT NEED TO GO
//        }
//    }
//    else
//        return o[p_name];
//}
//});
})