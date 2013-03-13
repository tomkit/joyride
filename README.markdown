## Forked:

To support granular adding/removing of the Next button and the close button on a step-by-step basis:
<pre>
data-button-enabled="false" to remove a button in a step
data-link-enabled="false" to remove the [x] button in a step
</pre>

Also supporting highlighting of the container the tip is referencing via the global options:
<pre>
highlight : false // [true|false]
highlightColor : 'red' // some css color
highlightDuration : 500 // any number in milliseconds
</pre>

Supports going backwards in time. Added the following methods to joyride('some_method'):
<pre>
previous : goes to a previous li step // Untested.
resumeBackwards : same as resuming after a pause, but goes to the previous li step instead. does the appropriate things such as executing the poststepcallback function. // Tested
</pre>
<br/>
<br/>
<br/>
<br/>
=====================

Welcome to Joyride
=====================

Joyride is an easy to configure jQuery site tour wizard.

Installation Guide:      http://www.zurb.com/playground/jquery-joyride-feature-tour-plugin

Joyride is MIT-licensed and absolutely free to use.

New in 2.0.3
* Better screen edge detection
* Source documentation updates

New in 2.0.2
* Fix for off-screen detection in auto tooltip positioning
* Fix for older versions of jQuery back to 1.4.3
* jQuery 1.4.2 is no longer supported as it has issues with window resize
* Support lists in tooltip content
* Fix for reinitialization of plugin.

New in 2.0.1
* Skip missing tooltip targets

New in 2.0
* remove counters in favor of jQuery's in-built .next() method
* button text is now defined with a data-button attribute, data-text will be deprecated in 3.0
* edge-aware tooltips that reposition based on proximity to edge of screen (thanks to Jason from Hugo4GL for help with this)
* support for pause, resume, restart, and destroy; ex. https://gist.github.com/3430584
* support for jQuery 1.8.2, and 1.4.2+
* modal style tooltips (li elements without data-id or data-class)
* move tooltip templating to settings
* make cookie support an option
* you can now specify a `startOffset` for the index of the tooltip you want the tour to start on
* better support for right and left aligned tooltips
* override nub position on a per tooltip bases
* deprecate inline positioning of tooltips
* support for class based targeting with `data-class`
* both `postStepCallback` and `postRideCallback` now return a reference to the last tip index and jquery object
* more functionality, same size compressed (~12kb)

Documentation
==============

Comprehensive documentation is available on the Joyride homepage listed above.

Repo Contents
=============

* README
* DEMO - Demo specific files, not necessary to use the plugin
* joyride-2.0.3.css - Default Joyride styles, required
* jquery-1.8.3.js - A version of jQuery, required, 1.4.3+ is required
* jquery.joyride-2.0.3.js - The heart of Joyride, required
* modernizr.mq.js - A custom build of Modernizr with just mediaqueries
* jquery.cookie.js - required for cookie support.
* .gitignore - Those pesky DS_Store files...this is not part of the plugin

ZURB
====

Joyride was made by [ZURB](http://www.zurb.com), a product design company in Campbell, CA.

If Joyride knocks your socks off the way we hope it does and you want more, why not check out [our jobs](http://www.zurb.com/talent/jobs)?

MIT Open Source License
=======================

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
