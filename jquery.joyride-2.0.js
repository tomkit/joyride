/*
 * jQuery Foundation Joyride Plugin 2.0
 * http://foundation.zurb.com
 * Copyright 2012, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

/*jslint unparam: true, browser: true, indent: 2 */

// TODO: skip functionality, modal bg issues, top mobile positioning issues

;(function ($, window, undefined) {
  'use strict';

  var defaults = {
      'version'              : '2.0',
      'highlight'            : false,     // @Thomas: FORKED
      'highlightColor'       : 'red',     // @Thomas: FORKED
      'highlightDuration'    : 500,       // @Thomas: FORKED
      'tipLocation'          : 'bottom',  // 'top' or 'bottom' in relation to parent
      'nubPosition'          : 'auto',    // override on a per tooltip bases 
      'scrollSpeed'          : 300,       // Page scrolling speed in milliseconds
      'timer'                : 0,         // 0 = no timer , all other numbers = timer in milliseconds
      'startTimerOnClick'    : true,      // true or false - true requires clicking the first button start the timer
      'startOffset'          : 0,         // the index of the tooltip you want to start on (index of the li)
      'nextButton'           : true,      // true or false to control whether a next button is used
      'tipAnimation'         : 'fade',    // 'pop' or 'fade' in each tip
      'pauseAfter'           : [],        // array of indexes where to pause the tour after
      'tipAnimationFadeSpeed': 300,       // when tipAnimation = 'fade' this is speed in milliseconds for the transition
      'cookieMonster'        : false,     // true or false to control whether cookies are used
      'cookieName'           : 'joyride', // Name the cookie you'll use
      'cookieDomain'         : false,     // Will this cookie be attached to a domain, ie. '.notableapp.com'
      'tipContainer'         : 'body',    // Where will the tip be attached
      'postRideCallback'     : $.noop,    // A method to call once the tour closes (canceled or complete)
      'postStepCallback'     : $.noop,    // A method to call after each step
      'template' : { // HTML segments for tip layout
        'link'    : '<a href="#close" class="joyride-close-tip">X</a>',
        'timer'   : '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
        'tip'     : '<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',
        'wrapper' : '<div class="joyride-content-wrapper"></div>',
        'button'  : '<a href="#" class="joyride-next-tip"></a>'
      }
    },

    Modernizr = Modernizr || false,

    settings = {},

    methods = {

      init : function (opts) {
        return this.each(function () {

          settings = $.extend(defaults, opts);

          // non configureable settings
          settings.document = window.document;
          settings.$document = $(settings.document);
          settings.$window = $(window);
          settings.$content_el = $(this);
          settings.body_offset = $(settings.tipContainer).position();
          settings.$tip_content = $('li', settings.$content_el);
          settings.paused = false;
          settings.attempts = 0;

          settings.tipLocationPatterns = {
            top: ['bottom', 'right', 'left'],
            bottom: [],
            left: ['right', 'top', 'bottom'],
            right: ['left', 'top', 'bottom']
          };

          // are we using jQuery 1.7+
          methods.jquery_check();

          // can we create cookies?
          if (!$.isFunction($.cookie)) {
            settings.cookieMonster = false;
          }

          // generate the tips and insert into dom.
          if (!settings.cookieMonster || !$.cookie(settings.cookieName)) {

            settings.$tip_content.each(function (index) {
              methods.create({$li : $(this), index : index});
            });

            // show first tip
            if (!settings.startTimerOnClick && settings.timer > 0) {
              methods.show('init');
              methods.startTimer();
            } else {
              methods.show('init');
            }

          }

          settings.$document.on('click.joyride', '.joyride-next-tip, .joyride-modal-bg', function (e) {
            e.preventDefault();

            methods.next(); // @Thomas: FORKED

          });

          $('.joyride-close-tip').on('click.joyride', function (e) {
            e.preventDefault();
            methods.end();
          });

          settings.$window.on('resize.joyride', function (e) {
            if (methods.is_phone()) {
              methods.pos_phone();
            } else {
              methods.pos_default();
            }
          });

        });
      },
      
      // @Thomas: FORKED
      next : function() {
        if (settings.$li.next().length < 1) {
            methods.end();
          } else if (settings.timer > 0) {
            clearTimeout(settings.automate);
            methods.hide();
            methods.show();
            methods.startTimer();
          } else {
            methods.hide();
            methods.show();
          }
      },
      
      previous : function() {
          if (settings.timer > 0) {
              clearTimeout(settings.automate);
              methods.hide();
              methods.show(undefined, true);
              methods.startTimer();
            } else {
              methods.hide();
              methods.show(undefined ,true);
            }
      },

      // call this method when you want to resume the tour
      resume : function () {
        methods.set_li();
        methods.show();
      },
      
      /*@Thomas: FORKED*/
      resumeBackwards : function() {
        methods.set_li(undefined, true, true);
        methods.show(undefined, true);
        settings.postStepCallback(settings.$li.index()-1, settings.$current_tip, 'hide' /*@Thomas:FORKED*/); // @Thomas: FORKED. Force postStepCallback 
      },

      tip_template : function (opts) {
        var $blank, content;

        opts.tip_class = opts.tip_class || '';

        $blank = $(settings.template.tip).addClass(opts.tip_class);
        content = $.trim($(opts.li).html()) +
          (opts.button_step_enabled ? methods.button_text(opts.button_text) : '' ) + //@Thomas: FORKED
          (opts.link_step_enabled ? settings.template.link : '') + // @Thomas: FORKED
          methods.timer_instance(opts.index);

        $blank.append($(settings.template.wrapper));
        $blank.first().attr('data-index', opts.index);
        $('.joyride-content-wrapper', $blank).append(content);

        return $blank[0];
      },

      timer_instance : function (index) {
        var txt;

        if ((index === 0 && settings.startTimerOnClick && settings.timer > 0) || settings.timer === 0) {
          txt = '';
        } else {
          txt = methods.outerHTML($(settings.template.timer)[0]);
        }
        return txt;
      },

      button_text : function (txt) {
        if (settings.nextButton) {
          txt = $.trim(txt) || 'Next';
          txt = methods.outerHTML($(settings.template.button).append(txt)[0]);
        } else {
          txt = '';
        }
        return txt;
      },

      create : function (opts) {
        // backwards compatability with data-text attribute
        var buttonText = opts.$li.attr('data-button') || opts.$li.attr('data-text'),
        buttonStepEnabled = (opts.$li.attr('data-button-enabled') ? opts.$li.attr('data-button-enabled') === 'true' : settings.nextButton), // @Thomas: FORKED
        linkStepEnabled = (opts.$li.attr('data-link-enabled') ? opts.$li.attr('data-link-enabled') === 'true' : true), // @Thomas: FORKED
          tipClass = opts.$li.attr('class'),
          $tip_content = $(methods.tip_template({
            tip_class : tipClass,
            index : opts.index,
            button_text : buttonText,
            button_step_enabled : buttonStepEnabled,
            link_step_enabled : linkStepEnabled, // @Thomas: FORKED
            li : opts.$li
          }));

        $(settings.tipContainer).append($tip_content);
      },

      show : function (init, isBackwards /*@Thomas: FORKED*/) {
        var opts = {}, ii, opts_arr = [], opts_len = 0,
            $timer = null;

        // are we paused?
        if (settings.$li === undefined || ($.inArray(settings.$li.index(), settings.pauseAfter) === -1) || isBackwards) {

          // don't go to the next li if the tour was paused
          if (settings.paused) {
            settings.paused = false;
          } else {
            methods.set_li(init);
          }

          settings.attempts = 0;

          if (settings.$li.length) {
            opts_arr = (settings.$li.data('options') || ':').split(';');
            opts_len = opts_arr.length;

            // parse options
            for (ii = opts_len - 1; ii >= 0; ii--) {
              var p = opts_arr[ii].split(':');

              if (p.length === 2) {
                opts[$.trim(p[0])] = $.trim(p[1]);
              }
            }

            settings.tipSettings = $.extend({}, settings, opts);

            settings.tipSettings.tipLocationPattern = settings.tipLocationPatterns[settings.tipSettings.tipLocation];

            // scroll if not modal
            if (!/body/i.test(settings.$target.selector)) {
              methods.scroll_to();
            }

            if (methods.is_phone()) {
              methods.pos_phone(true);
            } else {
              methods.pos_default(true);
            }

            $timer = $('.joyride-timer-indicator', settings.$next_tip);

            if (/pop/i.test(settings.tipAnimation)) {

              $timer.outerWidth(0);

              if (settings.timer > 0) {

                settings.$next_tip.show();
                $timer.animate({
                  width: $('.joyride-timer-indicator-wrap', settings.$next_tip).outerWidth()
                }, settings.timer);

              } else {

                settings.$next_tip.show();

              }


            } else if (/fade/i.test(settings.tipAnimation)) {

              $timer.outerWidth(0);

              if (settings.timer > 0) {

                settings.$next_tip.fadeIn(settings.tipAnimationFadeSpeed);

                settings.$next_tip.show();
                $timer.animate({
                  width: $('.joyride-timer-indicator-wrap', settings.$next_tip).outerWidth()
                }, settings.timer);

              } else {

                settings.$next_tip.fadeIn(settings.tipAnimationFadeSpeed);

              }
            }

            settings.$current_tip = settings.$next_tip;
            
            // @Thomas: FORK
            if(settings.highlight) {
                var originalColor = settings.$target.css('backgroundColor');
                settings.$target.animate({
                    backgroundColor : settings.highlightColor
                }, settings.highlightDuration, function() {
                    settings.$target.animate({
                        backgroundColor : originalColor
                    }, settings.highlightDuration);
                });
            }
            

          } else {

            methods.end();

          }
        } else {

          settings.paused = true;

        }

      },

      // detect phones with media queries if supported.
      is_phone : function () {
        if (Modernizr) {
          return Modernizr.mq('only screen and (max-width: 767px)');
        }
        
        return (settings.$window.width() < 767) ? true : false;
      },

      hide : function () {
        settings.postStepCallback(settings.$li.index(), settings.$current_tip, 'hide' /*@Thomas:FORKED*/);
        $('.joyride-modal-bg').hide();
        settings.$current_tip.hide();
      },

      set_li : function (init, isBackwards /*@Thomas: FORKED*/, isResumeBackwards /*@Thomas:FORKED*/) {
        if (init) {
          settings.$li = settings.$tip_content.eq(settings.startOffset);
          methods.set_next_tip();
          settings.$current_tip = settings.$next_tip;
        } else if(isBackwards) { /*@Thomas:FORKED*/
          if(!isResumeBackwards) {
              settings.$li = settings.$li.prev();
          } else {
              settings.$li = settings.$li.prev().next();
          }       
          methods.set_next_tip();
        } else {
          settings.$li = settings.$li.next();
          methods.set_next_tip();
        }

        methods.set_target();
      },

      set_next_tip : function () {
        settings.$next_tip = $('.joyride-tip-guide[data-index=' + settings.$li.index() + ']');
      },

      set_target : function () {
        var cl = settings.$li.attr('data-class'),
            id = settings.$li.attr('data-id'),
            $sel = function () {
              if (id) {
                return $(settings.document.getElementById(id));
              } else if (cl) {
                return $('.' + cl).first();
              } else {
                return $('body');
              }
            };

        settings.$target = $sel();
      },

      scroll_to : function () {
        var window_half, tipOffset,
            visible = function () {
              var v = methods.visible(methods.corners(settings.$target));

              if (methods.is_phone()) {
                return !v;
              }
              
              return !v;
            };

        // only scroll if target if off screen
        // if (visible()) {
          window_half = settings.$window.height() / 2;
          tipOffset = Math.ceil(settings.$target.offset().top - window_half + settings.$next_tip.outerHeight());

          $("html, body").stop().animate({
            scrollTop: tipOffset
          }, settings.scrollSpeed);
        // }
      },

      paused : function () {
        if (($.inArray((settings.$li.index() + 1), settings.pauseAfter) === -1)) {
          return true;
        }
        
        return false;
      },

      destroy : function () {
        settings.$document.off('.joyride');
        $(window).off('.joyride');
        $('.joyride-close-tip, .joyride-next-tip, .joyride-modal-bg').off('.joyride');
        $('.joyride-tip-guide, .joyride-modal-bg').remove();
        settings = {};
      },

      restart : function () {
        methods.hide();
        settings.$li = undefined;
        methods.show('init');
      },

      pos_default : function (init) {
        var half_fold = Math.ceil(settings.$window.height() / 2),
            tip_position = settings.$next_tip.offset(),
            $nub = $('.joyride-nub', settings.$next_tip),
            nub_height = Math.ceil($nub.outerHeight() / 2),
            toggle = init || false;

        // tip must not be "display: none" to calculate position
        if (toggle) {
          settings.$next_tip.css('visibility', 'hidden');
          settings.$next_tip.show();
        }

        if (!/body/i.test(settings.$target.selector)) {

            if (methods.bottom()) {
              settings.$next_tip.css({
                top: (settings.$target.offset().top + nub_height + settings.$target.outerHeight()),
                left: settings.$target.offset().left});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'top');

            } else if (methods.top()) {

              settings.$next_tip.css({
                top: (settings.$target.offset().top - settings.$next_tip.outerHeight() - nub_height),
                left: settings.$target.offset().left});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'bottom');

            } else if (methods.right()) {

              settings.$next_tip.css({
                top: settings.$target.offset().top,
                left: (settings.$target.outerWidth() + settings.$target.offset().left)});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'left');

            } else if (methods.left()) {

              settings.$next_tip.css({
                top: settings.$target.offset().top - settings.$target.outerHeight(),
                left: (settings.$target.offset().left - settings.$next_tip.outerWidth() - nub_height)});

              methods.nub_position($nub, settings.tipSettings.nubPosition, 'right');

            }

            if (!methods.visible(methods.corners(settings.$next_tip)) && settings.attempts < settings.tipSettings.tipLocationPattern.length) {

              $nub.removeClass('bottom')
                .removeClass('top')
                .removeClass('right')
                .removeClass('left');

              settings.tipSettings.tipLocation = settings.tipSettings.tipLocationPattern[settings.attempts];

              settings.attempts++;

              methods.pos_default(true);

            }

        } else if (settings.$li.length) {
          
          methods.pos_modal($nub);

        }

        if (toggle) {
          settings.$next_tip.hide();
          settings.$next_tip.css('visibility', 'visible');
        }

      },

      pos_phone : function (init) {
        var tip_height = settings.$next_tip.outerHeight(),
            tip_offset = settings.$next_tip.offset(),
            target_height = settings.$target.outerHeight(),
            $nub = $('.joyride-nub', settings.$next_tip),
            nub_height = Math.ceil($nub.outerHeight() / 2),
            toggle = init || false;

        $nub.removeClass('bottom')
          .removeClass('top')
          .removeClass('right')
          .removeClass('left');

        if (toggle) {
          settings.$next_tip.css('visibility', 'hidden');
          settings.$next_tip.show();
        }

        if (!/body/i.test(settings.$target.selector)) {

          if (methods.top()) {

              settings.$next_tip.offset({top: settings.$target.offset().top - tip_height - nub_height});
              $nub.addClass('bottom');

          } else {

            settings.$next_tip.offset({top: settings.$target.offset().top + target_height + nub_height});
            $nub.addClass('top');

          }

        } else if (settings.$li.length) {
          
          methods.pos_modal($nub);

        }

        if (toggle) {
          settings.$next_tip.hide();
          settings.$next_tip.css('visibility', 'visible');
        }
      },

      pos_modal : function ($nub) {
        methods.center();
        $nub.hide();

        // TODO: bg not working on mobile
        if ($('.joyride-modal-bg').length < 1) {
          $('body').append('<div class="joyride-modal-bg">').show();
        }

        if (/pop/i.test(settings.tipAnimation)) {
          $('.joyride-modal-bg').show();
        } else {
          $('.joyride-modal-bg').fadeIn(settings.tipAnimationFadeSpeed);
        }
      },

      center : function () {
        var $w = settings.$window;

        settings.$next_tip.css({
          top : ((($w.height() - settings.$next_tip.outerHeight()) / 2) + $w.scrollTop()),
          left : ((($w.width() - settings.$next_tip.outerWidth()) / 2) + $w.scrollLeft())
        });

        return true;
      },

      bottom : function () {
        return /bottom/i.test(settings.tipSettings.tipLocation);
      },

      top : function () {
        return /top/i.test(settings.tipSettings.tipLocation);
      },

      right : function () {
        return /right/i.test(settings.tipSettings.tipLocation);
      },

      left : function () {
        return /left/i.test(settings.tipSettings.tipLocation);
      },

      corners : function (el) {
        var w = settings.$window,
            right = w.outerWidth() + w.scrollLeft(),
            bottom = w.outerWidth() + w.scrollTop();

        return [
          el.offset().top <= w.scrollTop(),
          right <= el.offset().left + el.outerWidth(),
          bottom <= el.offset().top + el.outerHeight(),
          w.scrollLeft() >= el.offset().left
        ];
      },

      visible : function (hidden_corners) {
        var i = hidden_corners.length;

        while (i--) {
          if (hidden_corners[i]) return false;
        }

        return true;
      },

      nub_position : function (nub, pos, def) {
        if (pos === 'auto') {
          nub.addClass(def);
        } else {
          nub.addClass(pos);
        }
      },

      startTimer : function () {
        if (settings.$li.length) {
          settings.automate = setTimeout(function () {
            methods.hide();
            methods.show();
            methods.startTimer();
          }, settings.timer);
        } else {
          clearTimeout(settings.automate);
        }
      },

      end : function () {
        if (settings.cookieMonster) {
          $.cookie(settings.cookieName, 'ridden', { expires: 365, domain: settings.cookieDomain });
        }

        $('.joyride-modal-bg').hide();
        settings.$current_tip.hide();
        settings.postStepCallback(settings.$li.index(), settings.$current_tip, 'end' /*@Thomas:FORKED*/);
        settings.postRideCallback(settings.$li.index(), settings.$current_tip, 'end'/*@Thomas:FORKED*/);
      },

      jquery_check : function () {
        // define on() and off() for older jQuery
        if (!$.isFunction($.fn.on)) {
          
          $.fn.on = function(types, sel, fn) {
            
            return this.delegate(sel, types, fn);
            
          };
          
          $.fn.off = function(types, sel, fn) {
            
            return this.undelegate(sel, types, fn);
            
          };
    
          return false;
        }
        
        return true;
      },

      outerHTML : function (el) {
        // support FireFox < 11
        return el.outerHTML || new XMLSerializer().serializeToString(el);
      },

      version : function () {
        return settings.version;
      }

    };

  $.fn.joyride = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.joyride');
    }
  };

}(jQuery, this));
