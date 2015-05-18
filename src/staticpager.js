/*
 * Pager
 * https://github.com/nessthehero/Pager
 *
 * Copyright (c) 2012 Ian Moffitt
 * Licensed under the MIT license.
 *
 * Passes JSLint!
 */

(function($) {
	"use strict";

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

	// Hash parsing
	function h() {

		var vars = [],
			grabUrl = window.location.hash,
			parts,
			pieces,
			qs = '';

		if (typeof arguments[0] === 'string') {
			qs = arguments[0];
		}

		if (typeof grabUrl !== 'undefined' && grabUrl !== '') {
			grabUrl = grabUrl.replace('#', '');
			parts = grabUrl.split('&');
			for (var j in parts) {
				if (parts.hasOwnProperty(j)) {
					pieces = parts[j].split('=');
					if (vars.length !== 0) {
						var found = false;
						for (var i in vars) {
							if (vars.hasOwnProperty(i)) {

								if (vars[i].name === pieces[0].toString()) {
									found = true;
								}
							}
						}
						if (found) {
							vars[i].values.push(pieces[1]);
						} else {
							vars.push({ 'name' : pieces[0].toString(), 'values' : [pieces[1]] });
						}
					} else {
						vars.push({ 'name' : pieces[0].toString(), 'values' : [pieces[1]] });
					}
				}
			}
			if (qs !== '') {
				for (var b in vars) {
					if (vars.hasOwnProperty(b)) {
						if (vars[b].name === qs) {
							return vars[b].values;
						}
					}
				}
				return ['-1'];
			}
			return vars;
		} else {
			return [];
		}

	}

	function tH(hashObject) {

		var h = hashObject,
			b = '',
			c = 0,
			cc = 0;

		for (var j in h) {
			if (h.hasOwnProperty(j)) {
				c += 1;

				var name = h[j].name,
					vals = h[j].values;

					cc = 0;

				for (var k in vals) {
					if (vals.hasOwnProperty(k)) {
						cc += 1;
						b += name + "=" + vals[k];

						if (cc !== vals.length) {
							b += "&amp;";
						}
					}
				}

				if (c !== h.length) {
					b += "&amp;";
				}

			}
		}

		return b;

	}

	/* IndexOf polyfill */
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(searchElement, fromIndex) {
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

	$.pager = function(el, options) {

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
			"id": stamp,
			"p": base
		};
		window.staticpager.push(savePoint);

		base.options = $.extend({}, $.pager.defaultOptions, options);

		base.init = function(cat) {

			base.templates = {
				"status": '<div class="leftSide">Page <span id="currentPage">{pageIndex}</span> of <span id="maxPage">{pageCount}</span>. Viewing results <span id="resultStart">{resultStart}</span> thru <span id="resultEnd">{resultEnd}</span> of {resultCount}.</div>',
				"pageList": '<li id="page{pageNum}" class="pagingListItem"><ul id="page{pageNum}List" class="pageList"></ul></li>',
				"pager": '<div class="rightSide"><a href="javascript:;" class="prev">{prevText}</a></div>',
				"top": '<div id="topPaging" class="paging"></div>',
				"bottom": '<div id="bottomPaging" class="paging"></div>',
				"showAll": '<span><a href="javascript:;" class="showAllItems">Show All</a></span>'
			};

			base.cache = base.$el.html();

			if (cat && cat.length && cat.length !== 0) {
				base.$el.find('li').each(function() {

					if ($(this).attr('data-filter') !== null && typeof $(this).attr('data-filter') !== "undefined" && $(this).attr('data-filter') !== "") {

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

			if (h(base.options.hashQuery).length > 0) {
				base.pIndex = parseInt(h(base.options.hashQuery)[0], 10);
			} else {
				base.pIndex = 1;
			}

			if (base.pIndex == 1) {
				if (base.options.pageStart !== 1) {
					base.pIndex = parseInt(base.options.pageStart, 10);
				}
			}

			if (base.pIndex > base.count.pages) {
				base.pIndex = base.count.pages;
			}

			if (base.pIndex < 1) {
				base.pIndex = 1;
			}

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

				// Watch for events
				$('.prev, .pager, .next', base.$el).on("click", function() {

					base.options.before($(this).selector, base);

					if ($(this).attr('class').indexOf('prev') !== -1) {
						base.pIndex -= 1;
					} else if ($(this).attr('class').indexOf('next') !== -1) {
						base.pIndex += 1;
					} else {
						base.pIndex = parseInt($(this).text(), 10);
					}

					base.pageState();

					base.options.after($(this).selector, base);

					return false;

				});

				$('.showAllItems', base.$el).on('click', function() {
					base.destroy();
				});

			} else {

				if (base.options.evenodd) {
					$('li:even', base.$el).addClass('even');
					$('li:odd', base.$el).addClass('odd');
				}

			}

		};

		base.build = function() {

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
			status = $(t(base.templates.status, {
				pageIndex: base.pIndex,
				pageCount: base.count.pages,
				resultStart: base.pIndex, // #HASH: Will change based on Hash or options. Set to Hash or option's value.
				resultEnd: base.options.pageSize, // #HASH: Will change based on Hash or options. Multiplied by Hash/option value and self
				resultCount: base.count.results
			}));

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

			}

			$('.paging .rightSide', base.$el).append('<a href="#" class="next">' + base.options.nextText + '</a>');

			base.pageState();

			base.options.end();

		};

		base.pageState = function() {

			$('.pagingListItem', base.$el).css('display', 'none'); //Hide every pagingListItem.
			$('#page' + base.pIndex, base.$el).css('display', 'block'); //Reveal the desired pagingListItem.
			$('#currentPage', base.$el).text(base.pIndex);
			$('#resultStart', base.$el).text((base.pIndex * base.options.pageSize) - (base.options.pageSize - 1));
			if (base.pIndex === base.count.pages) {
				$('#resultEnd', base.$el).text(base.count.results);
			} else {
				$('#resultEnd', base.$el).text(base.pIndex * base.options.pageSize);
			}

			//Just some logic for handling the first and last pages.
			if (base.pIndex === base.count.pages) {
				$('.next', base.$el).css('visibility', 'hidden');
				$('.prev', base.$el).css('visibility', 'visible');
			} else if (base.pIndex === 1) {
				$('.next', base.$el).css('visibility', 'visible');
				$('.prev', base.$el).css('visibility', 'hidden');
			} else {
				$('.next', base.$el).css('visibility', 'visible');
				$('.prev', base.$el).css('visibility', 'visible');
			}

			window.location.hash = base.options.hashQuery + "=" + base.pIndex;

			if (!base.options.truncate) {
				$('.tInd, .bInd', base.$el).hide(); //.css('display','none');//Hide all spans.
				$('.pager', base.$el).css('display', 'inline'); //Reveal all links.
				$('#tPager' + base.pIndex + ', #bPager' + base.pIndex, base.$el).css('display', 'none'); //Hide the page link for the newly exposed page.
				$('#tInd' + base.pIndex + ', #bInd' + base.pIndex, base.$el).css('display', 'inline'); //Reveal the span for the newly exposed page.
			} else {

				$('#top_fEllip, #bot_fEllip, #top_lEllip, #bot_lEllip, .pager, .tInd, .bInd', base.$el).css('display', 'none');

				if (base.pIndex > 4) {
					$('#top_fEllip, #bot_fEllip', base.$el).css('display', 'inline');
				}

				// Show ellipses if NOT on 4th to last page or greater
				// This is so we get
				//         prev 1 2 ... 45 '46' 47 48 49 next
				// and not
				//         prev 1 2 ... 45 '46' 47 ... 48 49 next
				if (base.pIndex < (base.count.pages - 3)) {
					$('#top_lEllip, #bot_lEllip', base.$el).css('display', 'inline');
				}

				for (j = 1; j <= base.count.pages; j += 1) {
					// this page               last page              next page           2 or less             last 2 pages
					if (j === base.pIndex || j === (base.pIndex - 1) || j === (base.pIndex + 1) || j <= 2 || j >= (base.count.pages - 1)) {
						$('#bPager' + j + ', #tPager' + j, base.$el).css('display', 'inline');
					}
				}

				$('#tPager' + base.pIndex + ', #bPager' + base.pIndex, base.$el).css('display', 'none'); //Hide the page link for the newly exposed page.
				$('#tInd' + base.pIndex + ', #bInd' + base.pIndex, base.$el).css('display', 'inline'); //Reveal the span for the newly exposed page.
			}

		}

		base.destroy = function() {

			base.$el.html(base.cache);

		};

		base.filter = function(cat) {

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
		pageStart: 1,
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
		delimiter: "|",
		hash: true,
		hashQuery: "page",
		start: function() {}, // Before build
		end: function() {},	// After build
		before: function() {}, // Before page turn
		after: function() {} // After page turn
	};

	var methods = {

		init: function(options) {
			return this.each(function() {
				var t = new $.pager(this, options);
				return t;
			});
		},

		destroy: function() {
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

		update: function(filter) {
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

	$.fn.pager = function(methodOrOptions) {
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
