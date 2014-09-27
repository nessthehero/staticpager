[![Build Status](https://travis-ci.org/nessthehero/staticpager.svg?branch=master)](https://travis-ci.org/nessthehero/staticpager)

# Static Pager

Use static paging for unordered lists of content

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/nessthehero/jquery-staticpager/master/dist/jquery.staticpager.min.js
[max]: https://raw.github.com/nessthehero/jquery-staticpager/master/dist/jquery.staticpager.js

In your web page:

```html
<div id="pager">
    <ul>
        <li data-filter="2">Item 1</li>
        <li data-filter="2|3">Item 2</li>
        <li data-filter="4|6">Item 3</li>
        <li data-filter="7">Item 4</li>
        <li data-filter="">Item 5</li>
        <li data-filter="8">Item 6</li>
        <li data-filter="2">Item 7</li>
    </ul>
</div>

<script src="jquery.js"></script>
<script src="staticpager.min.js"></script>
<script>
    jQuery(function($) {
      $("#pager").pager();
      // target a container that contains an unordered list
    });
</script>
```

## Documentation

### Options:

- **pageSize**: Amount of items to display per page. (Default: 25)
- **top**: Show paging above results (Default: true)
- **bottom**: Show paging below results (Default: true)
- **nextText**: Text for next button (Default: 'next')
- **prevText**: Text for previous button (Default: 'prev')
- **status**: Show status of paging, such as 'X of Y results' (Default: true)
- **statusLocation**: Where to display paging status (Default: 'bottom')
- **showAll**: Show a link to expand to all results and disable paging (Default: false)
- **truncate**: Truncate the page numbers to only show approximately 7 pages instead of all pages. Useful for large amounts of items. (Default: false)
- **evenodd**: Add classes to distinguish even and odd items (Default: true)
- **filter**: An array of strings to filter results, based on the `data-filter` attribute on each list item. Can be declared on load but also can be passed via a method for later sorting (Default: [])
- **delimiter**: Separator between each filter item in data attribute. (Default "|")
- **start**: Callback function fired before pager is built.
- **end**: Callback function fired after pager is built.
- **before**: Callback function before page is changed.
- **after**: Callback function after page is changed.

### Methods:

#### Destroy

Unset pager, remove any paging in place, and restore markup to original state.

```javascript
$("#pager").destroy();
```

#### Update

Pass an array of strings to the pager to filter it based on the data-filter attribute on each list item.

```javascript
$("#pager").update(["2", "4"]);
```

## Release History

### 1.0.0

Release of pager enhanced by Grunt, backed by Unit Tests, with enhanced functionality.

### Older

Original plugin written by Jay Del Greco
