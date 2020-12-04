/*
 * Pager
 * https://github.com/nessthehero/Pager
 *
 * Copyright (c) 2012 Ian Moffitt
 * Licensed under the MIT license.
 *
 * Passes JSLint!
 */

(function ($) {
	'use strict';

	// Tweet sized templating (the JSLinted version)
	// http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
	function t(s, d) {
		var p;
		for (p in d) {
			if (d.hasOwnProperty(p)) {
				s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
			}
		}
		return s;
	}

	/* IndexOf polyfill */
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement, fromIndex) {
			if (this === undefined || this === null) {
				throw new TypeError('"this" is null or not defined');
			}

			var length = this.length >>> 0; // Hack to convert object.length to a UInt32

			fromIndex = +fromIndex || 0;

			if (Math.abs(fromIndex) === Infinity) {
				fromIndex = 0;
			}

			if (fromIndex < 0) {
				fromIndex += length;
				if (fromIndex < 0) {
					fromIndex = 0;
				}
			}

			for (; fromIndex < length; fromIndex += 1) {
				if (this[fromIndex] === searchElement) {
					return fromIndex;
				}
			}

			return -1;
		};
	}

	$.pager = function (el, options) {

		var base = this,
			i = 0,
			j = 0,
			stamp = (new Date()).getTime(),
			savePoint;

		base.$el = $(el);
		base.el = el;

		base.$el.data('pager', stamp);
		window.staticpager = [];
		savePoint = {
			'id': stamp,
			'p': base
		};
		window.staticpager.push(savePoint);

		base.options = $.extend({}, $.pager.defaultOptions, options);

		base.init = function (cat) {

			base.templates = {
				'shortStatus': '<div class="leftSide"><span id="resultSpan"><span id="resultStart">{resultStart}</span>-<span id="resultEnd">{resultEnd}</span></span> of {resultCount}</div>',
				'shortStatusOne': '<div class="leftSide"><span id="resultSpan"><span id="resultStart">{resultStart}</span></span> of {resultCount}</div>',
				'status': '<div class="leftSide">Page <span id="currentPage">{pageIndex}</span> of <span id="maxPage">{pageCount}</span>. Viewing results <span id="resultSpan"><span id="resultStart">{resultStart}</span> thru <span id="resultEnd">{resultEnd}</span></span> of {resultCount}.</div>',
				'statusOne': '<div class="leftSide">Page <span id="currentPage">{pageIndex}</span> of <span id="maxPage">{pageCount}</span>. Viewing result <span id="resultSpan"><span id="resultStart">{resultStart}</span></span> of {resultCount}.</div>',
				'pageList': '<li id="page{pageNum}" class="pagingListItem"><ul id="page{pageNum}List" class="pageList"></ul></li>',
				'pager': '<div class="rightSide"><a href="javascript:;" class="prev">{prevText}</a></div>',
				'top': '<div id="topPaging" class="paging"></div>',
				'bottom': '<div id="bottomPaging" class="paging"></div>',
				'showAll': '<span><a href="javascript:;" class="showAllItems">Show All</a></span>'
			};

			base.cache = base.$el.html();

			if (cat && cat.length && cat.length !== 0) {
				base.$el.find('li').each(function () {

					if ($(this).attr('data-filter') !== null && typeof $(this).attr('data-filter') !== 'undefined' && $(this).attr('data-filter') !== '') {

						var tax = $(this).attr('data-filter').split(base.options.delimiter);
						var found = false;

						for (var j in tax) {
							if (tax.hasOwnProperty(j)) {
								for (var k in cat) {
									if (cat.hasOwnProperty(k)) {
										if (cat[k] === tax[j]) {
											found = true;
										}
									}
								}
							}
						}

						if (!found) {
							$(this).remove();
						}

					}

				});
			}

			base.count = {};
			base.count.results = base.$el.find('li').length;
			base.count.pages = Math.ceil(base.count.results / base.options.pageSize);

			base.pIndex = 1; // TODO make this work based on Hash or options. #HASH
			base.pages = [];

			// Render caching
			base.render = {};
			base.render.pager = t(base.templates.pager, {
				prevText: base.options.prevText
			});
			base.render.top = t(base.templates.top, {});
			base.render.bottom = t(base.templates.bottom, {});
			base.render.showall = t(base.templates.showAll, {});

			if (base.count.results > base.options.pageSize) {

				base.build();

				// TODO: Make this a bit better. I'm just kindof assuming we're on page 1 when we start.
				// If I ever want to add in some sort of hash based page jumping, I'll need to improve this.
				// $('.next', base.$el).css('visibility', 'visible');
				$('.prev', base.$el).addClass('sp-hidden'); // css('visibility', 'hidden');

				// Watch for events
				$('.prev, .pager, .next', base.$el).on('click', function () {

					base.options.before($(this).selector, base);

					if ($(this).attr('class').indexOf('prev') !== -1) {
						base.pIndex -= 1;
					} else if ($(this).attr('class').indexOf('next') !== -1) {
						base.pIndex += 1;
					} else {
						base.pIndex = parseInt($(this).text(), 10);
					}

					$('.pagingListItem', base.$el).css('display', 'none'); //Hide every pagingListItem.
					$('#page' + base.pIndex, base.$el).css('display', 'block'); //Reveal the desired pagingListItem.
					$('#currentPage', base.$el).text(base.pIndex);

					var resultStart = (base.pIndex * base.options.pageSize) - (base.options.pageSize - 1);
					var resultEnd = resultStart;
					if (base.pIndex === base.count.pages) {
						resultEnd = base.count.results;
					} else {
						resultEnd = base.pIndex * base.options.pageSize;
					}

					$('#resultStart', base.$el).text(resultStart);
					$('#resultEnd', base.$el).text(resultEnd);

					//Just some logic for handling the first and last pages.
					if (base.pIndex === base.count.pages) {
						$('.next', base.$el).addClass('sp-hidden'); //.css('visibility', 'hidden');
						$('.prev', base.$el).removeClass('sp-hidden'); //.css('visibility', 'visible');
					} else if (base.pIndex === 1) {
						$('.next', base.$el).removeClass('sp-hidden'); //.css('visibility', 'visible');
						$('.prev', base.$el).addClass('sp-hidden'); //.css('visibility', 'hidden');
					} else {
						$('.next', base.$el).removeClass('sp-hidden'); //.css('visibility', 'visible');
						$('.prev', base.$el).removeClass('sp-hidden'); //.css('visibility', 'visible');
					}

					if (!base.options.truncate) {
						$('.tInd, .bInd', base.$el).addClass('sp-hidden'); //.hide(); //.css('display','none');//Hide all spans.
						$('.pager', base.$el).removeClass('sp-hidden'); //.css('display', 'inline'); //Reveal all links.
						$('#tPager' + base.pIndex + ', #bPager' + base.pIndex, base.$el).addClass('sp-hidden'); //.css('display', 'none'); //Hide the page link for the newly exposed page.
						$('#tInd' + base.pIndex + ', #bInd' + base.pIndex, base.$el).removeClass('sp-hidden'); //.css('display', 'inline'); //Reveal the span for the newly exposed page.
					} else {

						$('#top_fEllip, #bot_fEllip, #top_lEllip, #bot_lEllip, .pager, .tInd, .bInd', base.$el).addClass('sp-hidden'); //.css('display', 'none');

						if (base.pIndex > 4) {
							$('#top_fEllip, #bot_fEllip', base.$el).removeClass('sp-hidden'); //.css('display', 'inline');
						}

						// Show ellipses if NOT on 4th to last page or greater
						// This is so we get
						//         prev 1 2 ... 45 '46' 47 48 49 next
						// and not
						//         prev 1 2 ... 45 '46' 47 ... 48 49 next
						if (base.pIndex < (base.count.pages - 3)) {
							$('#top_lEllip, #bot_lEllip', base.$el).removeClass('sp-hidden'); //.css('display', 'inline');
						}

						for (j = 1; j <= base.count.pages; j += 1) {
							// this page               last page              next page           2 or less             last 2 pages
							if (j === base.pIndex || j === (base.pIndex - 1) || j === (base.pIndex + 1) || j <= 2 || j >= (base.count.pages - 1)) {
								$('#bPager' + j + ', #tPager' + j, base.$el).removeClass('sp-hidden'); //.css('display', 'inline');
							}
						}

						$('#tPager' + base.pIndex + ', #bPager' + base.pIndex, base.$el).addClass('sp-hidden'); //.css('display', 'none'); //Hide the page link for the newly exposed page.
						$('#tInd' + base.pIndex + ', #bInd' + base.pIndex, base.$el).removeClass('sp-hidden'); //.css('display', 'inline'); //Reveal the span for the newly exposed page.
					}

					base.options.after($(this).selector, base);

					return false;

				});

				$('.showAllItems', base.$el).on('click', function () {
					/*$('.result', base.$el).each(function(index) {
					$(this, base.$el).appendTo($('.result-holder'));
				});
				$('#bottomPaging, #topPaging, .pagingListItem', base.$el).remove();*/

					base.destroy();
				});

			} else {

				if (base.options.evenodd) {
					$('li:even', base.$el).addClass('even');
					$('li:odd', base.$el).addClass('odd');
				}

			}

		};

		base.build = function () {

			var pageChecker, itemCount, status, z, topPager, bottomPager, key;

			base.options.start();

			// Store a reference to this entire plugin in the dom object's data.
			base.$el.data('pager.ref', base);

			base.$el.find('ul').addClass('result-holder');

			//Apply the appropriate grouping classes to the results
			for (i = 1; i <= base.count.results; i += 1) {

				pageChecker = Math.ceil(i / base.options.pageSize);
				$('ul li:eq(' + (i - 1) + ')', base.$el).addClass('result page' + pageChecker).attr('id', 'result' + i);

			}

			//Wrap paging ULs and LIs around the appropriate grouped results. The markup remains valid and semantically correct, as one giant nested un-ordered list.
			for (i = 1; i <= base.count.pages; i += 1) {
				$('.page' + i, base.$el).wrapAll('<li id="page' + i + '" class="pagingListItem"><ul id="page' + i + 'List" class="pageList"></ul></li>');
				itemCount = $('#page' + i + 'List li', base.$el).length;

				if (base.options.evenodd) {
					for (z = 1; z <= itemCount; z += 1) {

						if (z % 2 === 0) {
							$('#page' + i + 'List li:eq(' + (z - 1) + ')').addClass('even');
						} else {
							$('#page' + i + 'List li:eq(' + (z - 1) + ')').addClass('odd');
						}

					}
				}

			}

			// Prepare the paging status in case it is needed. We are also turning it into a jQuery object.
			if (base.options.short) {

				if (base.options.pageSize === 1) {

					status = $(t(base.templates.shortStatusOne, {
						pageIndex: base.pIndex,
						pageCount: base.count.pages,
						resultStart: 1, // #HASH: Will change based on Hash or options. Set to Hash or option's value.
						resultCount: base.count.results
					}));

				} else {

					status = $(t(base.templates.shortStatus, {
						pageIndex: base.pIndex,
						pageCount: base.count.pages,
						resultStart: 1, // #HASH: Will change based on Hash or options. Set to Hash or option's value.
						resultEnd: base.options.pageSize, // #HASH: Will change based on Hash or options. Multiplied by Hash/option value and self
						resultCount: base.count.results
					}));

				}

			} else {

				if (base.options.pageSize === 1) {

					status = $(t(base.templates.statusOne, {
						pageIndex: base.pIndex,
						pageCount: base.count.pages,
						resultStart: 1, // #HASH: Will change based on Hash or options. Set to Hash or option's value.
						resultCount: base.count.results
					}));

				} else {

					status = $(t(base.templates.status, {
						pageIndex: base.pIndex,
						pageCount: base.count.pages,
						resultStart: 1, // #HASH: Will change based on Hash or options. Set to Hash or option's value.
						resultEnd: base.options.pageSize, // #HASH: Will change based on Hash or options. Multiplied by Hash/option value and self
						resultCount: base.count.results
					}));

				}

			}

			// Attach paging to top
			if (base.options.top) {
				topPager = $(base.render.top);
				topPager.append($(base.render.pager));

				if ((base.options.status) && (base.options.statusLocation === 'top')) {
					topPager.append(status);
				}

				//Attach showall
				if (base.options.showAll) {
					$('.leftSide', topPager).append(base.render.showall);
				}

				base.$el.prepend(topPager);
			}

			// Attach paging to bottom
			if (base.options.bottom) {
				bottomPager = $(base.render.bottom);
				bottomPager.append($(base.render.pager));

				if (base.options.status && base.options.statusLocation === 'bottom') {
					bottomPager.append(status);
				}

				//Attach showall
				if (base.options.showAll) {
					$('.leftSide', bottomPager).append(base.render.showall);
				}

				base.$el.append(bottomPager);
			}

			//Generate and hide the appropriate paging links, assuming of course that their paging containers exist. If their paging containers don't exist, jQuery just fails gracefully. No harm.
			for (i = 1; i <= base.count.pages; i += 1) {
				base.pages[i] = i;

				$('#topPaging .rightSide', base.$el).append('<a href="#" id="tPager' + i + '" class="pager">' + i + '</a><span id="tInd' + i + '" class="tInd">' + i + '</span>');
				$('#bottomPaging .rightSide', base.$el).append('<a href="#" id="bPager' + i + '" class="pager">' + i + '</a><span id="bInd' + i + '" class="bInd">' + i + '</span>');
				if (base.options.truncate && i === 2) {
					$('#topPaging .rightSide', base.$el).append('<span id="top_fEllip">...</span>');
					$('#bottomPaging .rightSide', base.$el).append('<span id="bot_fEllip">...</span>');
				}

				if (base.options.truncate && i === (base.count.pages - 2)) {
					$('#topPaging .rightSide', base.$el).append('<span id="top_lEllip">...</span>');
					$('#bottomPaging .rightSide', base.$el).append('<span id="bot_lEllip">...</span>');
				}

				//Since we are starting on page 1, we will hide all subsequent pages.
				if (i > 1) {
					$('#page' + i).css('display', 'none');
				}
			}
			$('#tPager1, #bPager1, #top_fEllip, #bot_fEllip', base.$el).addClass('sp-hidden'); //.css('display', 'none'); //Since we are starting on page 1, we will hide the first paging links in both the top and bottom nav.
			$('#tInd1, #bInd1', base.$el).removeClass('sp-hidden'); //.css('display', 'inline'); //Since we are starting on page 1, we will reveal the span tag for the first page status in both the top and bottom nav.
			$('#bottomPaging span[id^="bInd"]', base.$el).each(function (index) {
				if (index !== 0) {
					$(this).addClass('sp-hidden'); //.hide();
				}
			});

			$('#topPaging span[id^="tInd"]', base.$el).each(function (index) {
				if (index !== 0) {
					$(this).addClass('sp-hidden'); //.hide();
				}
			});

			$('.paging .rightSide', base.$el).append('<a href="#" class="next">' + base.options.nextText + '</a>'); //Stick a 'next' link on the end. This 1 line works for both top and bottom.
			$('.pagingListItem', base.$el).css('display', 'none'); //Hide every pagingListItem.
			$('#page' + base.pIndex, base.$el).css('display', 'block'); //Reveal the desired pagingListItem.
			if (base.options.truncate) {
				for (key in base.pages) {
					if (base.pages.hasOwnProperty(key)) {
						if (key > 3 && key < (base.count.pages - 1)) {
							$('#tPager' + key + ',#tInd' + key + ',#bPager' + key + ',#bInd').addClass('sp-hidden'); //.css('display', 'none');
						}
					}
				}
			}

			base.options.end();

		};

		base.destroy = function () {

			base.$el.html(base.cache);

		};

		base.filter = function (cat) {

			base.destroy();

			base.init(cat);

		};

		if (base.options.filter !== '') {
			base.init(base.options.filter);
		} else {
			base.init();
		}

		return base;

	};

	$.pager.defaultOptions = {
		pageSize: 25,
		top: true,
		bottom: true,
		nextText: 'next',
		prevText: 'prev',
		status: true,
		statusLocation: 'bottom',
		showAll: false,
		truncate: false,
		evenodd: true,
		filter: [],
		delimiter: '|',
		start: function () {
		},
		// Before build
		end: function () {
		},
		// After build
		before: function () {
		},
		// Before page turn
		after: function () {
		} // After page turn
	};

	var methods = {

		init: function (options) {
			return this.each(function () {
				var t = new $.pager(this, options);
				return t;
			});
		},

		destroy: function () {
			if (window.staticpager) {
				for (var p in window.staticpager) {
					if (window.staticpager.hasOwnProperty(p)) {
						if ($(this).is(window.staticpager[p].p.$el)) {
							window.staticpager[p].p.destroy();
						}
					}
				}
			}
		},

		update: function (filter) {
			if (window.staticpager) {
				for (var p in window.staticpager) {
					if (window.staticpager.hasOwnProperty(p)) {
						if ($(this).is(window.staticpager[p].p.$el)) {
							window.staticpager[p].p.filter(filter);
						}
					}
				}
			}
		}

	};

	$.fn.pager = function (methodOrOptions) {
		if (methods[methodOrOptions]) {
			return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
			// Default to "init"
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + methodOrOptions + ' does not exist on jQuery.pager');
		}
	};

}(jQuery));
