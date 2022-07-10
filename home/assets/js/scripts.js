$(document).ready(function () {

    "use strict";

    /*
     ----------------------------------------------------------------------
     Preloader
     ----------------------------------------------------------------------
     */
    $(window).on('load', function () {
        var $preloader = $('#page-preloader'),
            $spinner = $preloader.find('.spinner');
        $spinner.fadeOut();
        $preloader.delay(350).fadeOut('slow');
    });

    /*
     ----------------------------------------------------------------------
     Scroll to top
     ----------------------------------------------------------------------
     */
    //Check to see if the window is top if not then display button
    jQuery(window).scroll(function () {
        if (jQuery(this).scrollTop() > 400) {
            jQuery('.scroll-to-top').fadeIn();
        } else {
            jQuery('.scroll-to-top').fadeOut();
        }
    });
    //Click event to scroll to top
    jQuery('.scroll-to-top').on('click', function () {
        jQuery('html, body').animate({scrollTop: 0}, 800);
        return false;
    });

    /*
     ----------------------------------------------------------------------
     Full-page scroll
     ----------------------------------------------------------------------
     */
    $('#fullpage').fullpage({
            menu: '#menu',
            anchors: ['about-data', 'prising-data', 'portfolio-data', 'contact-data'],
            navigation: true,
            navigationPosition: 'right',
            showActiveTooltip: true,
            slidesNavigation: true,
            slidesNavPosition: 'bottom',
            responsiveWidth: (992)
        }
    );

    /*
     ----------------------------------------------------------------------
     Magnific Popup
     ----------------------------------------------------------------------
     */
    if ($("#container-portfolio").length) {
        $('#container-portfolio').mixItUp({load: {filter: '.design'}});
    } else if ($("#container-portfolio-page").length) {
        $('#container-portfolio-page').mixItUp();
    }

    /*
     ----------------------------------------------------------------------
     Prise tab
     ----------------------------------------------------------------------
     */
    $('ul.tabs__caption').on('click', 'li:not(.active)', function () {
        $(this)
            .addClass('active').siblings().removeClass('active')
            .closest('div.tabs').find('div.tabs__content').removeClass('active').eq($(this).index()).addClass('active');
    });

    /*
     ----------------------------------------------------------------------
     Portfolio
     ----------------------------------------------------------------------
     */
    $('.popup-gallery').magnificPopup({
        delegate: ".popup-content",
        type: 'inline',
        midClick: true,
        gallery: {
            enabled: true, // set to true to enable gallery
            preload: [0, 2], // read about this option in next Lazy-loading section
            navigateByImgClick: true,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>', // markup of an arrow button
            tPrev: 'Previous (Left arrow key)', // title for left button
            tNext: 'Next (Right arrow key)', // title for right button
            tCounter: '<span class="mfp-counter">%curr% of %total%</span>' // markup of counter
        }

    });


    /*
     ----------------------------------------------------------------------
     Mobile-Menu
     ----------------------------------------------------------------------
     */

    var link = $(".menu-open"),
        popup = $("body"),
        close = $(".close");

    link.on("click", function (event) {
        event.preventDefault();
        popup.addClass("open");
    });
    close.on("click", function (event) {
        event.preventDefault();
        popup.removeClass("open");
    });

    if ($(".order-btn-wrap").length > 0) {
        var role = $(".order-btn-wrap"),
            profile = $(".profile-image"),
            close = $(".img-form-close");

        role.on("click", function (event) {
            event.preventDefault();
            profile.addClass("open-img");
        });
        close.on("click", function (event) {
            event.preventDefault();
            profile.removeClass("open-img");
        });
    }


    /*
     ----------------------------------------------------------------------
     Filters
     ----------------------------------------------------------------------
     */
    var arr = new Array();
    $(".filter").each(function () {
        arr = $(this).attr("data-filter").slice();
        $(this).children(".cat-count").text($(arr).length);
    });

    $(".all").children(".cat-count").text($('.mix').length);


    /*
     ----------------------------------------------------------------------
     Form
     ----------------------------------------------------------------------
     */
    var wrapper = $(".file_upload"),
        inp = wrapper.find("input"),
        btn = wrapper.find("button"),
        lbl = wrapper.find("div");

    btn.focus(function () {
        inp.focus()
    });

    // Crutches for the :focus style:
    inp.focus(function () {
        wrapper.addClass("focus");
    }).blur(function () {
        wrapper.removeClass("focus");
    });

    var file_api = ( window.File && window.FileReader && window.FileList && window.Blob ) ? true : false;

    inp.change(function () {
        var file_name;
        if (file_api && inp[0].files[0])
            file_name = inp[0].files[0].name;
        else
            file_name = inp.val().replace("C:\\fakepath\\", '');

        if (!file_name.length)
            return;

        if (lbl.is(":visible")) {
            lbl.text(file_name);

        } else
            btn.text(file_name);
    }).change();

    $(window).resize(function () {
        $(".file_upload input").triggerHandler("change");
    });


});