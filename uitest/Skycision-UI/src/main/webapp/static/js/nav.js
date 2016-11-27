jQuery(document).ready(function(){
	//cache DOM elements
	var mainContent = $('.cd-main-content'),
		header = $('.cd-main-header'),
		sidebar = $('.cd-side-nav'),
		mblTabs = $('.nav-tabs'),
		sidebarTrigger = $('.cd-nav-trigger'),
		topNavigation = $('.cd-top-nav'),
		searchForm = $('.cd-search'),
		accountInfo = $('.account');
	    headerHeight = $('.cd-main-header').height();


	//on resize, move search and top nav position according to window width
	var resizing = false;
	moveNavigation();
	$(window).on('resize', function(){
		if( !resizing ) {
			(!window.requestAnimationFrame) ? setTimeout(moveNavigation, 150) : window.requestAnimationFrame(moveNavigation);
			resizing = true;
		}
	});

	//on window scrolling - fix sidebar nav
	/*var scrolling = false;
	checkScrollbarPosition();
	$(window).on('scroll', function(){
		if( !scrolling ) {
			(!window.requestAnimationFrame) ? setTimeout(checkScrollbarPosition, 300) : window.requestAnimationFrame(checkScrollbarPosition);
			scrolling = true;
		}
	});*/
	//mobile only - open sidebar when user clicks the hamburger menu
	sidebarTrigger.on('click', function(event){
		event.preventDefault();
		$([sidebar, sidebarTrigger]).toggleClass('nav-is-visible');
	});
	function closeMenu(){
		if ($(".nav-is-visible").length) {
			$([sidebar, sidebarTrigger]).toggleClass('nav-is-visible');
		}
	}

	
	//click on item and show submenu
	$('.has-children > a').on('click', function(event){
			var selectedItem = $(this);
			/*if($('.panel-body').hasClass('farm-edit')){
				$('.panel-body').addClass('selected');
			}*/
			//event.preventDefault();
			if( selectedItem.parent('li').hasClass('selected')) {
				selectedItem.parent('li').removeClass('selected');
			} else {
				sidebar.find('.has-children.selected ').removeClass('selected');
				accountInfo.removeClass('selected');
				selectedItem.parent('li').addClass('selected');
			}
	});

	
	$(document).on('click', function(event){
		var targetElm = $(event.target);
		if( !targetElm.is('.has-children a') ) {
			//sidebar.find('.has-children.selected').removeClass('selected');
			accountInfo.removeClass('selected');
		}
		if( targetElm.is('.has-children ul li > a') ||
				targetElm.is('.nav.nav-tabs li > a')) {
			closeMenu();
		}
	});

	
	/*function isMobile() {
		//check if mobile or desktop device
		var uaString = window.navigator.userAgent.toString();
		return uaString.indexOf("Mobile") != -1;
		//return window.getComputedStyle(document.querySelector('.cd-main-content'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
	}*/
	
	function isMobileResoultion(){
		var viewwidth = window.innerWidth || 
							document.body.clientWidth || 
							document.documentElement.clientWidth;
		var returnVal = false;
		if (viewwidth <= 768) {
			$("body").addClass("mobileResolution").removeClass("tabResolution");
			returnVal = true;
		} else if (viewwidth > 768 && viewwidth <= 1024) {
			$("body").addClass("tabResolution");
			//returnVal = true;
		} else {
			$("body").removeClass("mobileResolution").removeClass("tabResolution");
		}
		
		return returnVal;
	}

	function moveNavigation(){
		var mq = isMobileResoultion();
        if ( mq && topNavigation.parents('.cd-side-nav').length == 0 ) {
        	//detachElements();
        	
			topNavigation.appendTo(sidebar);
			searchForm.removeClass('is-hidden').prependTo(sidebar);
			mblTabs.addClass('nav-justified');
		} else if ( topNavigation.parents('.cd-side-nav').length > 0 ) {
			
			detachElements();
			searchForm.insertAfter(header.find('.cd-logo'));
			topNavigation.appendTo(header.find('.cd-nav'));
			mblTabs.removeClass('nav-justified');
		}else{
			
		}
		checkSelected(mq);
		resizing = false;
	}

	function detachElements() {
		topNavigation.detach();
		searchForm.detach();
	}

	function checkSelected(mq) {
		//on desktop, remove selected class from items selected on mobile/tablet version
		//alert("desk");
		//if( mq == 'desktop' ) $('.has-children.selected').removeClass('selected');
	}

	/*function checkScrollbarPosition() {
		var mq = isMobile();
		
		if( mq != 'mobile' ) {
			var sidebarHeight = sidebar.outerHeight(),
				windowHeight = $(window).height(),
				mainContentHeight = mainContent.outerHeight()
				//scrollTop = $(window).scrollTop();

			//( ( scrollTop + windowHeight > sidebarHeight ) && ( mainContentHeight - sidebarHeight != 0 ) ) ? sidebar.addClass('is-fixed').css('bottom', 0) : sidebar.removeClass('is-fixed').attr('style', '');
		}
		scrolling = false;
	}
	if ((screen.width=768) && (screen.height=1024)) {
		$('.cd-logo').removeClass('col-sm-2').addClass('col-sm-3');
		$('.col-sm-7 .cd-search').removeClass('col-sm-12').addClass('col-sm-10');
		$('.cd-search ul.nav-tabs').removeClass('col-sm-6').addClass('col-sm-12');
		$('#control-container #control-div').removeClass('col-xs-8').addClass('col-xs-12');
			
		
	}else{
		$('.cd-logo').removeClass('col-sm-3').addClass('col-sm-2');
		$('.col-sm-7 .cd-search').removeClass('col-sm-10').addClass('col-sm-12');
		$('.cd-search ul.nav-tabs').removeClass('col-sm-12').addClass('col-sm-6');
		$('.cd-nav.col-sm-3').removeClass('hide');
		$('#control-container #control-div').removeClass('col-xs-12').addClass('col-xs-8');
	}*/

});