/********************************************
*Module for animating The Salon logo
*********************************************/

$(function() {
    var sal_letter = $('.sal_letter'), sal_a = $('h1 .a.sal_letter'), sal_l = $('h1 .l.sal_letter'),
    sal_o = $("h1 .o.sal_letter"), sal_n = $("h1 .n.sal_letter"), logo = $("#header h1");
    logo.hover(function() {
                    $(this).animate({'opacity':'1'}, 200);
                    sal_letter.css('color','#fff')
                    window.setTimeout(function() { sal_a.css('color','#1C6487') }, 100);
                    window.setTimeout(function() { sal_l.css('color','#A20910') }, 200);
                    window.setTimeout(function() { sal_o.css('color','#C36500') }, 300);
                    window.setTimeout(function() { sal_n.css('color','#93A50B') }, 400);
                        },
                function() {
                    sal_letter.css('color','#fff')
                    window.setTimeout(function() { sal_a.css('color','#1C6487') }, 400);
                    window.setTimeout(function() { sal_l.css('color','#A20910') }, 300);
                    window.setTimeout(function() { sal_o.css('color','#C36500') }, 200);
                    window.setTimeout(function() { sal_n.css('color','#93A50B') }, 100);
                    $(this).animate({'opacity':'.7'}, 300);
                        });
});