(function($) {
	common = {
		profileCard: function(){

			if ( window.location.host == 'community-stage.ubnt.com' ) {
                var userApiUrl = '/ubnt/plugins/custom/ubiquiti/ubnt/v2profilehovercard?user_id=';
            } else {
                var userApiUrl = '/ubnt/plugins/custom/ubiquiti/ubnt/v2profilehovercard?user_id=';
            }

			if ( $('.hover-card-container').length < 1 ) {
				$('body').append('<div class="hover-card-container"></div>');
			}
			var cardWrapper = $('.hover-card-container');
			var error = false;
			var thisUserID = '';
			var timeout;

			var xhr;

			var wheresel = '' +
				'a.comAvatar[href*="/user-id/"],' +
				'.comSection__item__details a[href*="/user-id/"],' +
				'a.comUser__name[href*="/user-id/"],' +
				'a.comUser[href*="/user-id/"],' +
				'.ubnt-story-author a[href*="/user-id/"],' +
				'.authors a[href*="/user-id/"],' +
				'.messageauthorusername a[href*="/user-id/"],' +
				'a.lia-user-name-link[href*="/user-id/"],' +
				'.js-latest-post-by-from a[href*="/user-id/"],' +
				'.user-online-list li a[href*="/user-id/"],' +
				'a.UserAvatar[href*="/user-id/"],' +
				'.ViewProfilePage img.lia-user-avatar-profile,' +
				'.customUsersOnline a[href*="/user-id/"],' +
				'#authors a[href*="/user-id/"],' +
				'.topAuthors a.comSection__item__link[href*="/user-id/"]';

			$(document)
			.on('mouseenter', wheresel, function(e) {
                //e.preventDefault();
				var thisEl = $(this);
				var docWidth = $(document).width();
				var rightSide = false;
				var userLink = thisEl.attr('href');
				if (typeof userLink !== typeof undefined && userLink !== false) {

					if ( $('.ViewProfilePage').length && $('img.lia-user-avatar-profile',thisEl).length ) {
						var userLink = document.location.href;
					} else if( thisEl.attr('href')=='#' ) {
						return false;
					}

					var thisLen = (userLink).split('/');
					thisUserID = (thisLen)[thisLen.length-1];
					var thisCard = $('.profileCard[data-user='+thisUserID+']',cardWrapper);

					var thisElLeftOffset = Math.round(thisEl.offset().left+(thisEl.width()));
					var thisElTopOffset = Math.round(thisEl.offset().top+(thisEl.height()/2)-94);

					if((thisElLeftOffset+460)>=docWidth){
						//hover card is too far to the right of the screen
						var thisElLeftOffset = Math.round(thisEl.offset().left-460);
						rightSide = true;
					}

					if( thisCard.length && $('.profileCard[data-user='+thisUserID+'] .preloader',cardWrapper).length < 1 ){
						$('.profileCard',cardWrapper).removeClass('el-visible');
						rightSide?thisCard.addClass('rightArrow'):thisCard.removeClass('rightArrow');
						clearTimeout(timeout);
                        timeout = setTimeout(function(){
							thisCard.css({ 'top' : thisElTopOffset, 'left' : thisElLeftOffset }).addClass('el-visible');
						}, 800);

					} else {
						var ajaxReturn = '';
						thisCard.remove();

						var rightArrowClass = rightSide?'rightArrow':'';
						var profileCardHtml = $('<div class="profileCard ' + rightArrowClass + '" style="top:' + thisElTopOffset + 'px; left:' + thisElLeftOffset + 'px;" data-user="' + thisUserID + '"></div>');

						$.when(
                            xhr = $.ajax({
								type: 'GET',
								url: userApiUrl+thisUserID,
								dataType: 'html',
								success: function(data) {
									$('.profileCard',cardWrapper).removeClass('el-visible');
									ajaxReturn = data;
								}
							})
						)
						.done(function(){
							if ( $('.profileCard[data-user='+thisUserID+']').length < 1 ) {
                                cardWrapper.append(profileCardHtml);
                                var ell = profileCardHtml.html(ajaxReturn);
                                clearTimeout(timeout);
                                timeout = setTimeout(function() {
                                    ell.addClass('el-visible');
                                }, 800);
                                if( $('.profileCard[data-user='+thisUserID+'] .preloader',cardWrapper).length ) {
                                    $('.profileCard[data-user='+thisUserID+'] .preloader',cardWrapper).parents('div.profileCard').remove();
                                }
							}
						})
						.fail(function(){
							$('.profileCard',cardWrapper).removeClass('el-visible');
						});
					}

				}
			})
			.on('mouseleave', wheresel, function(e) {
                $('.profileCard[data-user='+thisUserID+']',cardWrapper).removeClass('el-visible');
                if ( xhr ) {
                    xhr.abort();
				}
                clearTimeout(timeout);
			})
			.on('mouseover', '.profileCard ', function(e) {
				var self = $(this);
				self.addClass('el-visible');
			})
			.on('mouseout', '.profileCard ', function(e) {
				var self = $(this);
				self.removeClass('el-visible');
                clearTimeout(timeout);
			});


		}
	};
	window.common = common;
	jQuery(document).ready(function() {
		common.profileCard();
	});
})(jQuery);
