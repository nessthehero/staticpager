/* Alpha release of the static pager, developed and released by Jay Michael Del Greco, December 14, 2010.
Feel free to use and re-use it at will. Just give credit where it's due. Thanks. */
// Made even more amazing by Ian Moffitt - 03/2012
$.fn.superPager=function(settings){
	settings = $.extend({}, $.fn.superPager.defaults, settings);
	pageSize = settings.pageSize;
	topPaging = settings.topPaging;
	bottomPaging = settings.bottomPaging;
	nextText = settings.nextText;
	prevText = settings.prevText;
	pageStatus = settings.pageStatus;
	statusLocation = settings.statusLocation;
	showAll = settings.showAll;
	truncate = settings.truncate;
	
	if (pageCount <= 5) {
		truncate = false;
	}
	
	var resultCount = $(this).children('ul').children('li').length;
	var pageCount = Math.ceil(resultCount / pageSize);
	var pageIndex = 1; //We need to set a numeric value for this that will be changed dynamically when paginated, because the prev and next buttons weren't making integers of the values that I was pulling from the SPANs in IE7.
	//alert("pageSize is a "+typeof(pageSize)+" with a value of "+pageSize+". resultCount is a  "+typeof(resultCount)+" with a value of "+resultCount);
	
	var pageArray = [];
	
	$(this).children('ul').addClass('result-holder');
		
	//If the resultCount is greater than the pageSize we will need to PAGINATE this motherfucker!
	if (resultCount > pageSize){
		//Apply the appropriate grouping classes to the results
		for (var i=1; i<=resultCount; i++){
			if (i==1){
				$(this).children('ul').children('li:first').addClass('result').addClass('page1').attr('id','result1');
			} else {
				pageChecker = Math.ceil(i/pageSize);
				$(this).children('ul').children('li:eq('+(i-1)+')').addClass('result').addClass('page'+pageChecker).attr('id','result'+i);
			}
		}
		//Wrap paging ULs and LIs around the appropriate grouped results. The markup remains valid and semantically correct, as one giant nested un-ordered list.
		for (var i=1; i<=pageCount; i++){
			$('.page'+i).wrapAll('<li id="page'+i+'" class="pagingListItem"><ul id="page'+i+'List" class="pageList"></ul></li>');
			var itemCount = $('#page'+i+'List li').length;
			for (var z=1; z<=itemCount; z++){
				if (z==1){
				  $('#page'+i+'List li:first').addClass('odd');
				} else {
					if (z%2==0){
						$('#page'+i+'List li:eq('+(z-1)+')').addClass('even');
					} else {
						$('#page'+i+'List li:eq('+(z-1)+')').addClass('odd');
					}
				}
			}
		}
		
		var templateStatus = '<div class="leftSide">Page <span id="currentPage">'+pageIndex+'</span> of <span id="maxPage">'+pageCount+'</span>. Viewing results <span id="resultStart">'+1+'</span> thru <span id="resultEnd">'+pageSize+'</span> of '+resultCount+'.</div>';
		var templatePaging = '<div class="rightSide"><a href="#" class="prev">'+prevText+'</a></div>';
		
		var buildTopPager = $('<div id="topPaging" class="paging"></div>');
		var buildBottomPager = $('<div id="bottomPaging" class="paging"></div>');
		
		if (topPaging) {
			var tmpAppender = templatePaging;
			if (pageStatus && statusLocation == 'top') { tmpAppender += templateStatus; }
			buildTopPager.append(tmpAppender)
			$(this).prepend(buildTopPager);
		}
		
		if (bottomPaging) {
			var tmpAppender = templatePaging;
			if (pageStatus && statusLocation == 'bottom') { tmpAppender += templateStatus; }
			buildBottomPager.append(tmpAppender)
			$(this).append(buildBottomPager);
		}		
		
		// Show all?
		if (showAll) {
			$('#topPaging .leftSide, #bottomPaging .leftSide').append('<span><a href="javascript:;" class="showAllItems">Show All</a></span>');	
		}
		
		
		//Generate and hide the appropriate paging links, assuming of course that their paging containers exist. If their paging containers don't exist, jQuery just fails gracefully. No harm.
		for (var i=1; i<=pageCount; i++){	
			pageArray[i] = i;
					
			$('#topPaging .rightSide').append('<a href="#" id="tPager'+i+'" class="pager">'+i+'</a><span id="tInd'+i+'" class="tInd">'+i+'</span>');
			$('#bottomPaging .rightSide').append('<a href="#" id="bPager'+i+'" class="pager">'+i+'</a><span id="bInd'+i+'" class="bInd">'+i+'</span>');
			if (truncate && i == 2) {
				$('#topPaging .rightSide').append('<span id="top_fEllip">...</span>');
				$('#bottomPaging .rightSide').append('<span id="bot_fEllip">...</span>');		
			}
			console.log('truncate: ' + truncate + '; pageCount: ' + pageCount + '; i: ' + i);
			if (truncate && i == (pageCount-2)) {
				$('#topPaging .rightSide').append('<span id="top_lEllip">...</span>');
				$('#bottomPaging .rightSide').append('<span id="bot_lEllip">...</span>');		
			}
			
			//Since we are starting on page 1, we will hide all subsequent pages.
			if (i > 1){
				$('#page'+i).css('display','none');
			}
		}
		$('#tPager1, #bPager1, #top_fEllip, #bot_fEllip').css('display','none');//Since we are starting on page 1, we will hide the first paging links in both the top and bottom nav.
		$('#tInd1, #bInd1').css('display','inline');//Since we are starting on page 1, we will reveal the span tag for the first page status in both the top and bottom nav.
		
		$('#bottomPaging span[id^="bInd"]').each(function(index) {
			if (index != 0) {
				$(this).hide();	
			}
		});
		
		$('#topPaging span[id^="tInd"]').each(function(index) {
			if (index != 0) {
				$(this).hide();	
			}
		});
		
		$('.paging .rightSide').append('<a href="#" class="next">'+nextText+'</a>');//Stick a 'next' link on the end. This 1 line works for both top and bottom.
		
		$('.pagingListItem').css('display','none');//Hide every pagingListItem.
		$('#page'+pageIndex).css('display','block');//Reveal the desired pagingListItem.
		
		if (truncate) {			
			for (key in pageArray) {
				if (key > 2 && key < (pageCount - 1)) {
					$('#tPager'+key+',#tInd'+key+',#bPager'+key+',#bInd').css('display', 'none');
				}
			}		
		}		
		
	}
	//Paging Function
	$('.prev, .pager, .next').live("click", function() {
		if ($(this).attr('class').indexOf('prev') != -1){
			pageIndex = pageIndex-1;
		} else if ($(this).attr('class').indexOf('next') != -1){
			pageIndex = pageIndex+1;
		} else {
			pageIndex = parseInt($(this).text());
		}
		
		$('.pagingListItem').css('display','none');//Hide every pagingListItem.
		$('#page'+pageIndex).css('display','block');//Reveal the desired pagingListItem.
		$('#currentPage').text(pageIndex);
		$('#resultStart').text((pageIndex*pageSize)-(pageSize-1));
		if (pageIndex == pageCount){
			$('#resultEnd').text(resultCount);
		} else {
			$('#resultEnd').text(pageIndex*pageSize);
		}

		//Just some logic for handling the first and last pages.
		if (pageIndex == pageCount){
			$('.next').css('display','none');
			$('.prev').css('display','inline');
		} else if (pageIndex == 1){
			$('.next').css('display','inline');
			$('.prev').css('display','none');
		} else {
			$('.next').css('display','inline');
			$('.prev').css('display','inline');
		}
			
		if (!truncate) {
			$('.tInd, .bInd').hide();//.css('display','none');//Hide all spans.
			$('.pager').css('display','inline');//Reveal all links.
			$('#tPager'+pageIndex+', #bPager'+pageIndex).css('display','none');//Hide the page link for the newly exposed page.
			$('#tInd'+pageIndex+', #bInd'+pageIndex).css('display','inline');//Reveal the span for the newly exposed page.
		} else {		
			
			$('#top_fEllip, #bot_fEllip, #top_lEllip, #bot_lEllip, .pager, .tInd, .bInd').css('display','none');
			
			if (pageIndex > 3) {
				$('#top_fEllip, #bot_fEllip').css('display','inline');
			}
			
			if (pageIndex < (pageCount - 2)) {
				$('#top_lEllip, #bot_lEllip').css('display','inline');
			}
			
			for (var j = 1; j <= pageCount; j += 1) {
				if (j == pageIndex || j == (pageIndex-1) || j == (pageIndex+1) || j <= 1 || j >= (pageCount - 1)) {
					$('#bPager'+j+', #tPager'+j+'').css('display', 'inline');
				}
			}
			
			$('#tPager'+pageIndex+', #bPager'+pageIndex).css('display','none');//Hide the page link for the newly exposed page.
			$('#tInd'+pageIndex+', #bInd'+pageIndex).css('display','inline');//Reveal the span for the newly exposed page.

		}
		return false;		
	});
	
	$('.showAllItems').on('click', function() {
		$('.result').each(function(index) {
			$(this).appendTo($('.result-holder'));
		});
		$('#bottomPaging, #topPaging, .pagingListItem').remove();
	});
};

//Default values for the parameters in the extend.
$.fn.superPager.defaults = {
	pageSize			:	25,
	topPaging			:	true,
	bottomPaging		:	true,
	nextText			:   'next',
	prevText			:   'previous',
	pageStatus			:	true,
	statusLocation		:   'bottom',
	showAll				:   false,
	truncate			:   false	
};