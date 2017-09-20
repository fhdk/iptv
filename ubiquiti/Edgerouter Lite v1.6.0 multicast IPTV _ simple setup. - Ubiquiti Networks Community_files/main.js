(function($) {

    $(function() {
        $('.search-granularity').chosen({
            disable_search: true
        }).change(function(event) {
            toggleSearchInput($(this).val());
        });

        // add placeholders for search inputs
        $('.lia-component-common-widget-search-bar .lia-search-input-message').attr('placeholder', 'Search');
        $('.lia-component-common-widget-search-bar .lia-search-input-tkb-article').attr('placeholder', 'Search Knowledge Base');
        $('.lia-component-common-widget-search-bar .lia-search-input-user').attr('placeholder', 'Search Users');

        toggleSearchInput($('#searchGranularity').val());
        $('#searchautocompletetoggle').show();
    });

    function toggleSearchInput(value) {
        $('.lia-component-common-widget-search-bar  .search-input').hide().addClass('lia-js-hidden');
        switch (value) {
            case 'tkb|tkb':
                $('.lia-component-common-widget-search-bar .lia-search-input-tkb-article').show().removeClass('lia-js-hidden');
            break;

            case 'user|user':
                $('.lia-component-common-widget-search-bar .lia-search-input-user').show().removeClass('lia-js-hidden');
            break;

            case 'ubnt|community':
                $('.lia-component-common-widget-search-bar .lia-search-input-message').show().removeClass('lia-js-hidden');
            break;

            default:
                $('.lia-component-common-widget-search-bar .lia-search-input-message').show().removeClass('lia-js-hidden');
            break;
        }
    }

    function showUserPopover() {
        var popup = $('.ubnt-popover');
        popup.show();
        return false;
    }

    function hideUserPopover() {
        var popup = $('.ubnt-popover');
        popup.hide();
    }

    $('.ubnt-popover').click( function(e) {
        e.stopPropagation();
    });

    $('.ubnt-user-button').click(showUserPopover);
    $(window).click(hideUserPopover);

    // Disable first and last name profile fields
    $('#profilename_first').attr('readonly', true);
    $('#profilename_last').attr('readonly', true);

    if ($('.mark-community-read-link').length > 0) {
        var forumread = $('.mark-community-read-link').attr('href');
        $('.ubnt-markallread').attr('href',forumread);
    } else {
        $('.ubnt-toolbar-markread').addClass('disabled');
    }
    if ($('body').hasClass('CategoryPage')) {
        var categoryread = $('.mark-category-read-link').attr('href');
        $('.ubnt-markcategoryread').attr('href',categoryread);
    }

    // to the top
    var $topButton = $('#ToTheTopButton');
    var $document = $(document);
    $document.scroll(toggleTopButton);

    function toggleTopButton() {
        $topButton.toggleClass('visible', ($document.scrollTop() > $(window).height() * 0.2));
    }

    toggleTopButton();

    $topButton.on('click', function(e){
        e.preventDefault();
        $('html, body').stop(true, true).animate({ scrollTop: 0 }, 500);
    });

    // Google Analytics event tracking (use data-ga-* attributes on anchors)
    window._gaq = typeof window._gaq !== 'undefined' ? window._gaq : [];

    $('a[data-ga-category][data-ga-action]').on('click', function (event) {
        var $this = $(this);
        window._gaq.push(['_trackEvent', $this.data('ga-category'), $this.data('ga-action'), $this.data('ga-label'), $this.data('ga-value')]);

        // This implementation is specified in the GA docs for outbound links
        // https://support.google.com/analytics/answer/1136920?hl=en
        setTimeout(function () {
            document.location.href = $this.attr('href');
        });
        return false;
    });

    // Add Kudos to message
    $('.ubnt-kudos-give').click( function() {
        var $this = $(this);
        var id = $this.attr('id');
        var url = "/restapi/vc/messages/id/" + id + "/kudos/give";
        var request = $.ajax({
            // type: "POST",
            url: url,
            success: function() {
                var $current_kudos = $('.ubnt-kudos-count');
                $('.ubnt-kudos-count').text( Number($current_kudos.html()) + 1 );
                $('.ubnt-kudos-give-container').html('<span class="ubnt-kudos-give-disabled">Kudos Given!</span>');
            }
        });

    });

    //Platform Selector

    var forumListVisible = false;
    $('body').bind('click',function(e) {
        if ($(e.target).attr('data-toggle') == 'ubntForumList' || $(e.target).parent().attr('data-toggle') == 'ubntForumList') {
            e.preventDefault();
            togglePlatformList();
        } else {
            closePlatformList();
        }
    });

    var $ubntForumList = $('#ubntForumList');

    function togglePlatformList() {
        if(!forumListVisible) {
            $ubntForumList.addClass('is-visible');
            forumListVisible = true;
        } else {
            closePlatformList();
        }
    }
    function closePlatformList() {
        $ubntForumList.removeClass('is-visible');
        forumListVisible = false;
    }

    $('[data-toggle="qtip--right"]').each(function() {
        $(this).qtip({
            prerender: true,
            style: {
                classes: 'qtip-menu'
            },
            content: {
                text: $(this).parent().find('.comQtip')
            },
            position: {
                my: 'top right',
                at: 'bottom right'
            },
            show: {
                solo: true,
                effect: function (offset) {
                    $(this).slideDown(300);
                }
            },
            hide: {
                fixed: true,
                event: 'unfocus',
                effect: function (offset) {
                    $(this).fadeOut(300);
                }
            },
            events: {
                show: function (event, api) {
                    api.elements.target.parent().addClass('is-nav-item-selected');
                },
                hide: function (event, api) {
                    api.elements.target.parent().removeClass('is-nav-item-selected');
                }
            }
        })
    });
    $('[data-toggle="qtip"]').each(function() {
        $(this).qtip({
            prerender: true,
            style: {
                classes: 'qtip-menu'
            },
            content: {
                text: $(this).parent().find('.comQtip')
            },
            position: {
                my: 'top left',
                at: 'bottom left'
            },
            show: {
                solo: true,
                effect: function (offset) {
                    $(this).slideDown(300);
                }
            },
            hide: {
                fixed: true,
                event: 'unfocus',
                effect: function (offset) {
                    $(this).fadeOut(300);
                }
            },
            events: {
                show: function (event, api) {
                    api.elements.target.parent().addClass('is-nav-item-selected');
                },
                hide: function (event, api) {
                    api.elements.target.parent().removeClass('is-nav-item-selected');
                }
            }
        })
    });


    // Kudo Bar Options
    var kudoBarOptions = {
        duration: 1000,
        reset: true,
        origin: 'left',
        rotate: { x: 0, y: 90, z: 0 },
        distance: '100px'
    };

    //Top Kudoed Authors
    if(typeof topAuthorsMaxKudos != 'undefined') {
        var targetAuthors = $('.comSection--topItems.topAuthors [data-kudo]');
        $.each(targetAuthors, function() {
            var el = $(this);
            el.width( el.attr("data-kudo") * 100 / topAuthorsMaxKudos + '%' );
        });
        sr.reveal(targetAuthors, kudoBarOptions, 50);
    }

    //Top Kudoed Posts
    if(typeof topPostsMaxKudos != 'undefined') {
        var targetPosts = $('.comSection--topItems.topPosts [data-kudo]');
        $.each(targetPosts, function() {
            var el = $(this);
            el.width( el.attr("data-kudo") * 100 / topPostsMaxKudos + '%' );
        });
        sr.reveal(targetPosts, kudoBarOptions, 50);
    }

    // Make avatars rounded (in CSS) and centered
    $('.UserAvatar .lia-user-avatar-profile, .UserAvatar .lia-user-avatar-message').each(function() {
        var th = $(this).parent().height(),
            tw = $(this).parent().width(),
            im = $(this),
            ih = im.height(),
            iw = im.width();
        if (ih>iw) {
            im.addClass('img--tall');
        } else {
            im.addClass('img--wide');
        }
        var nh = im.height(),
            nw = im.width(),
            hd = (nh-th)/2,
            wd = (nw-tw)/2;
        if (nh<nw) {
            im.css({marginLeft: '-'+wd+'px', marginTop: 0});
        } else {
            im.css({marginTop: '-'+hd+'px', marginLeft: 0});
        }
    });

})(jQuery);