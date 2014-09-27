(function($) {
	/*
		======== A Handy Little QUnit Reference ========
		http://api.qunitjs.com/

		Test methods:
			module(name, {[setup][ ,teardown]})
			test(name, callback)
			expect(numberOfAssertions)
			stop(increment)
			start(decrement)
		Test assertions:
			ok(value, [message])
			equal(actual, expected, [message])
			notEqual(actual, expected, [message])
			deepEqual(actual, expected, [message])
			notDeepEqual(actual, expected, [message])
			strictEqual(actual, expected, [message])
			notStrictEqual(actual, expected, [message])
			throws(block, [expected], [message])
	*/

	module("Pager", {
		setup: function() {

			this.settings = {
				pageSize: 2
			};

			this.pagerReference = $('#pager').pager(this.settings);

			this.pIndex = 1;
		}
	});

	test("initial setup detection", function() {

		notEqual($('#pager').length, 0, "Detect paging container");
		equal($('.pageList').length, 4, "Has four pages");

		ok(window.pager, "Seeing the global pager object");

		ok(window.pager[0], "Global pager object has stuff");

		ok(window.pager[0].p, "Found a pager in the global object");

		ok(window.pager[0].p.$el.is(this.pagerReference), "It's the pager we're using!");

	});

	test("prev/next buttons exist", function() {

		if ($('#topPaging').length === 1) {
			equal($('#pager #topPaging .prev').length, 1, "Has top previous button");
			equal($('#pager #topPaging .next').length, 1, "Has top next button");
		}

		if ($('#bottomPaging').length === 1) {
			equal($('#pager #bottomPaging .prev').length, 1, "Has bottom previous button");
			equal($('#pager #bottomPaging .next').length, 1, "Has bottom next button");
		}

	});

	test("prev/next paging works", function() {
		var r;

		$('#topPaging .next').click();
		equal($('#page2').css('display'), 'block', "Page 2 is showing.");

		r = true;
		$('.result-holder > li:not(#page2)').each(function () {
			if ($(this).css('display') !== 'none') {
				r = false;
			}
		});

		ok(r, "No other page is showing");

		equal($('#pager #topPaging .prev').css('display'), 'inline', 'Prev button has display:inline');
		equal($('#pager #topPaging .prev').css('visibility'), 'visible', 'Prev button is visible');

		$('#topPaging .prev').click();

		equal($('#page1').css('display'), 'block', "Page 1 is showing.");

		r = true;
		$('.result-holder > li:not(#page1)').each(function () {
			if ($(this).css('display') !== 'none') {
				r = false;
			}
		});

		ok(r, "No other page is showing");

	});

	test("specific page works", function() {
		var r;

		$('#topPaging #tPager4').click();

		equal($('#page4').css('display'), 'block', "Page 4 is showing.");

		r = true;
		$('.result-holder > li:not(#page4)').each(function () {
			if ($(this).css('display') !== 'none') {
				r = false;
			}
		});

		ok(r, "No other page is showing");

	});

	module("Pager w/ Callbacks", {
		setup: function() {

			this.settings = {
				pageSize: 2,
				start: function() {
					$('#pager').addClass('prebuild');
				},
				end: function() {
					$('#pager').addClass('postbuild');
				},
				before: function() {
					$('#pager').addClass('prepage');
				},
				after: function() {
					$('#pager').addClass('postpage');
				}
			};

			$('#pager').pager(this.settings);

			$('.next').click();

			this.pIndex = 1;
		}

	});

	test("start()", function() {

		ok($('#pager').hasClass('prebuild'), "start ran correctly");

	});

	test("end()", function() {

		ok($('#pager').hasClass('postbuild'), "end ran correctly");

	});

	test("before()", function() {

		ok($('#pager').hasClass('prepage'), "before ran correctly");

	});

	test("after()", function() {

		ok($('#pager').hasClass('postpage'), "after ran correctly");

	});


	module("Filtering", {
		setup: function () {

			this.settings = {
				pageSize: 2
			};

			$('#pager').pager(this.settings);

			this.pagerReference = $('#pager').pager(this.settings);

			this.pIndex = 1;
		}
	});

	test("Applying filter", function () {

		equal($('.pageList').length, 4, "Has four pages");

		ok(window.pager[0].p.$el.is(this.pagerReference), "It's the pager we're using!");

		var p = window.pager[0].p;

		p.filter(["2"]);

		equal($('.pageList').length, 2, "Has two pages");

		p.filter(["2", "3"]);

		equal($('.pageList').length, 0, "Has no pages");

	});



	// module("Extra Paging stuff", {
	//   setup: function() {

	//     this.settings = {
	//       pageSize: 2
	//     }

	//     $('#pager').pager(this.settings);

	//     this.pIndex = 1;
	//   }
	// });

	// test("method calls", function() {

	// });

}(jQuery));
