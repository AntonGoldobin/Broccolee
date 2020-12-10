var jsFrontend = {
  debug: !1,
  current: {},
  init: function() {
    jsFrontend.current.language = jsFrontend.data.get("LANGUAGE");
    jsFrontend.initAjax();
    jsFrontend.addModalEvents();
    jsFrontend.cookieBar.init();
    jsFrontend.controls.init();
    jsFrontend.forms.init();
    jsFrontend.gravatar.init();
    jsFrontend.statistics.init();
    jsFrontend.twitter.init();
  },
  addModalEvents: function() {
    var $modals = $("[role=dialog].modal");
    if ($modals.length === 0) {
      return;
    }
    $modals.on("shown.bs.modal", function() {
      $(this).attr("aria-hidden", "false");
    });
    $modals.on("hide.bs.modal", function() {
      $(this).attr("aria-hidden", "true");
    });
  },
  initAjax: function() {
    $.ajaxSetup({
      url: "/frontend/ajax",
      cache: !1,
      type: "POST",
      dataType: "json",
      timeout: 10000,
      data: { fork: { module: null, action: null, language: jsFrontend.current.language } },
    });
  },
};
jsFrontend.controls = {
  init: function() {
    jsFrontend.controls.bindTargetBlank();
    jsFrontend.controls.toggleCollapse();
  },
  bindTargetBlank: function() {
    $("a.targetBlank").attr("target", "_blank");
  },
  toggleCollapse: function() {
    var $navToggle = $(".navbar-toggle");
    if ($navToggle.length === 0) {
      return;
    }
    $navToggle
      .on("click", function() {
        var $button = $(this);
        $button
          .find("[data-role=label]")
          .text(jsFrontend.locale.lbl($button.hasClass("collapsed") ? "CloseNavigation" : "OpenNavigation"));
      })
      .find("[data-role=label]")
      .text(jsFrontend.locale.lbl($navToggle.hasClass("collapsed") ? "CloseNavigation" : "OpenNavigation"));
  },
};
jsFrontend.cookieBar = {
  init: function() {
    if ($("#cookie-bar").length === 0) return;
    var $cookieBar = $("#cookie-bar");
    if (utils.cookies.readCookie("cookie_bar_hide") === "b%3A1%3B") {
      $cookieBar.hide();
    }
    $cookieBar.on("click", '[data-role="cookie-bar-button"]', function(e) {
      e.preventDefault();
      if ($(e.currentTarget).data("action") === "agree") {
        utils.cookies.setCookie("cookie_bar_agree", "Y");
        utils.cookies.setCookie("cookie_bar_hide", "Y");
      } else {
        utils.cookies.setCookie("cookie_bar_agree", "N");
        utils.cookies.setCookie("cookie_bar_hide", "Y");
      }
      $cookieBar.hide();
    });
  },
};
jsFrontend.data = {
  initialized: !1,
  data: {},
  init: function() {
    if (typeof jsData === "undefined") throw new Error("jsData is not available");
    jsFrontend.data.data = jsData;
    jsFrontend.data.initialized = !0;
  },
  exists: function(key) {
    return typeof jsFrontend.data.data[key] !== "undefined";
  },
  get: function(key) {
    if (!jsFrontend.data.initialized) jsFrontend.data.init();
    var keys = key.split(".");
    var data = jsFrontend.data.data;
    for (var i = 0; i < keys.length; i++) {
      data = data[keys[i]];
    }
    return data;
  },
};
jsFrontend.facebook = {
  afterInit: function() {
    if (typeof _gaq === "object") {
      FB.Event.subscribe("edge.create", function(targetUrl) {
        _gaq.push([ "_trackSocial", "facebook", "like", targetUrl ]);
      });
      FB.Event.subscribe("edge.remove", function(targetUrl) {
        _gaq.push([ "_trackSocial", "facebook", "unlike", targetUrl ]);
      });
      FB.Event.subscribe("message.send", function(targetUrl) {
        _gaq.push([ "_trackSocial", "facebook", "send", targetUrl ]);
      });
    } else if (typeof ga === "object") {
      FB.Event.subscribe("edge.create", function(targetUrl) {
        ga("send", "social", "facebook", "like", targetUrl);
      });
      FB.Event.subscribe("edge.remove", function(targetUrl) {
        ga("send", "social", "facebook", "unlike", targetUrl);
      });
      FB.Event.subscribe("message.send", function(targetUrl) {
        ga("send", "social", "facebook", "send", targetUrl);
      });
    }
  },
};
jsFrontend.forms = {
  init: function() {
    jsFrontend.forms.placeholders();
    jsFrontend.forms.datefields();
    jsFrontend.forms.validation();
    jsFrontend.forms.filled();
    jsFrontend.forms.datePicker();
  },
  filled: function() {
    $(document).on("blur", "form input, form textarea, form select", function() {
      if ($(this).val() === "") {
        $(this).removeClass("filled");
      } else {
        $(this).addClass("filled");
      }
    });
  },
  datefields: function() {
    var $inputDateType = $("input.inputDatefield");
    if ($inputDateType.length) {
      if ($inputDateType.get(0).type !== "date") {
        $inputDateType.addClass("inputDatefieldNormal");
      }
    }
    var $inputDatefields = $(".inputDatefieldNormal, .inputDatefieldFrom, .inputDatefieldTill, .inputDatefieldRange");
    var $inputDatefieldNormal = $(".inputDatefieldNormal");
    var $inputDatefieldFrom = $(".inputDatefieldFrom");
    var $inputDatefieldTill = $(".inputDatefieldTill");
    var $inputDatefieldRange = $(".inputDatefieldRange");
    if ($inputDatefields.length > 0) {
      var dayNames = [
        jsFrontend.locale.loc("DayLongSun"),
        jsFrontend.locale.loc("DayLongMon"),
        jsFrontend.locale.loc("DayLongTue"),
        jsFrontend.locale.loc("DayLongWed"),
        jsFrontend.locale.loc("DayLongThu"),
        jsFrontend.locale.loc("DayLongFri"),
        jsFrontend.locale.loc("DayLongSat"),
      ];
      var dayNamesMin = [
        jsFrontend.locale.loc("DayShortSun"),
        jsFrontend.locale.loc("DayShortMon"),
        jsFrontend.locale.loc("DayShortTue"),
        jsFrontend.locale.loc("DayShortWed"),
        jsFrontend.locale.loc("DayShortThu"),
        jsFrontend.locale.loc("DayShortFri"),
        jsFrontend.locale.loc("DayShortSat"),
      ];
      var dayNamesShort = [
        jsFrontend.locale.loc("DayShortSun"),
        jsFrontend.locale.loc("DayShortMon"),
        jsFrontend.locale.loc("DayShortTue"),
        jsFrontend.locale.loc("DayShortWed"),
        jsFrontend.locale.loc("DayShortThu"),
        jsFrontend.locale.loc("DayShortFri"),
        jsFrontend.locale.loc("DayShortSat"),
      ];
      var monthNames = [
        jsFrontend.locale.loc("MonthLong1"),
        jsFrontend.locale.loc("MonthLong2"),
        jsFrontend.locale.loc("MonthLong3"),
        jsFrontend.locale.loc("MonthLong4"),
        jsFrontend.locale.loc("MonthLong5"),
        jsFrontend.locale.loc("MonthLong6"),
        jsFrontend.locale.loc("MonthLong7"),
        jsFrontend.locale.loc("MonthLong8"),
        jsFrontend.locale.loc("MonthLong9"),
        jsFrontend.locale.loc("MonthLong10"),
        jsFrontend.locale.loc("MonthLong11"),
        jsFrontend.locale.loc("MonthLong12"),
      ];
      var monthNamesShort = [
        jsFrontend.locale.loc("MonthShort1"),
        jsFrontend.locale.loc("MonthShort2"),
        jsFrontend.locale.loc("MonthShort3"),
        jsFrontend.locale.loc("MonthShort4"),
        jsFrontend.locale.loc("MonthShort5"),
        jsFrontend.locale.loc("MonthShort6"),
        jsFrontend.locale.loc("MonthShort7"),
        jsFrontend.locale.loc("MonthShort8"),
        jsFrontend.locale.loc("MonthShort9"),
        jsFrontend.locale.loc("MonthShort10"),
        jsFrontend.locale.loc("MonthShort11"),
        jsFrontend.locale.loc("MonthShort12"),
      ];
      if ($.isFunction($.fn.datepicker)) {
        $inputDatefieldNormal.each(function() {
          var clone = $(this).clone();
          clone.insertAfter(this);
          clone.hide();
          $(this).attr("id", $(this).attr("id") + "-display");
          $(this).attr("name", $(this).attr("name") + "-display");
          $(this).on("change", function(event) {
            if ($(this).val() === "") {
              clone.val("");
            }
          });
        });
        $inputDatefields.datepicker({
          dayNames: dayNames,
          dayNamesMin: dayNamesMin,
          dayNamesShort: dayNamesShort,
          hideIfNoPrevNext: !0,
          monthNames: monthNames,
          monthNamesShort: monthNamesShort,
          nextText: jsFrontend.locale.lbl("Next"),
          prevText: jsFrontend.locale.lbl("Previous"),
          showAnim: "slideDown",
        });
        $inputDatefieldNormal.each(function() {
          var data = $(this).data();
          var phpDate = new Date(data.year, data.month, data.day, 0, 0, 0);
          var value = $(this).val() !== "" ? $.datepicker.formatDate(data.mask, phpDate) : "";
          $(this)
            .datepicker("option", {
              dateFormat: data.mask,
              firstDay: data.firstday,
              altField: "#" + $(this).attr("id").replace("-display", ""),
              altFormat: "yy-mm-dd",
            })
            .datepicker("setDate", value);
        });
        $inputDatefieldFrom.each(function() {
          var data = $(this).data();
          var value = $(this).val();
          $(this)
            .datepicker("option", {
              dateFormat: data.mask,
              firstDay: data.firstday,
              minDate: new Date(
                parseInt(data.startdate.split("-")[0], 10),
                parseInt(data.startdate.split("-")[1], 10) - 1,
                parseInt(data.startdate.split("-")[2], 10),
              ),
            })
            .datepicker("setDate", value);
        });
        $inputDatefieldTill.each(function() {
          var data = $(this).data();
          var value = $(this).val();
          $(this)
            .datepicker("option", {
              dateFormat: data.mask,
              firstDay: data.firstday,
              maxDate: new Date(
                parseInt(data.enddate.split("-")[0], 10),
                parseInt(data.enddate.split("-")[1], 10) - 1,
                parseInt(data.enddate.split("-")[2], 10),
              ),
            })
            .datepicker("setDate", value);
        });
        $inputDatefieldRange.each(function() {
          var data = $(this).data();
          var value = $(this).val();
          $(this)
            .datepicker("option", {
              dateFormat: data.mask,
              firstDay: data.firstday,
              minDate: new Date(
                parseInt(data.startdate.split("-")[0], 10),
                parseInt(data.startdate.split("-")[1], 10) - 1,
                parseInt(data.startdate.split("-")[2], 10),
                0,
                0,
                0,
                0,
              ),
              maxDate: new Date(
                parseInt(data.enddate.split("-")[0], 10),
                parseInt(data.enddate.split("-")[1], 10) - 1,
                parseInt(data.enddate.split("-")[2], 10),
                23,
                59,
                59,
              ),
            })
            .datepicker("setDate", value);
        });
      }
    }
  },
  validation: function() {
    $("input, textarea, select").each(function() {
      var $input = $(this);
      var options = {};
      $.each($input.data(), function(key, value) {
        if (key.indexOf("error") < 0) return;
        key = key.replace("error", "").toLowerCase();
        options[key] = value;
      });
      $input.html5validation(options);
    });
  },
  placeholders: function() {
    jQuery.support.placeholder = "placeholder" in document.createElement("input");
    if (!jQuery.support.placeholder) {
      $("input[placeholder], textarea[placeholder]").on("focus", function() {
        var input = $(this);
        if (input.val() === input.attr("placeholder")) {
          input.val("");
          input.removeClass("placeholder");
        }
      });
      $("input[placeholder], textarea[placeholder]").on("blur", function() {
        var input = $(this);
        if (input.val() === "" || input.val() === input.attr("placeholder")) {
          input.val(input.attr("placeholder"));
          input.addClass("placeholder");
        }
      });
      $("input[placeholder], textarea[placeholder]").blur();
      $("input[placeholder], textarea[placeholder]").parents("form").submit(function() {
        $(this).find("input[placeholder]").each(function() {
          var input = $(this);
          if (input.val() === input.attr("placeholder")) input.val("");
        });
      });
    }
  },
  datePicker: function() {
    $('input[data-role="fork-datepicker"]').each(function(index, datePickerElement) {
      $(datePickerElement).datepicker();
    });
  },
};
jsFrontend.gravatar = {
  init: function() {
    $(".replaceWithGravatar").each(function() {
      var element = $(this);
      var gravatarId = element.data("gravatarId");
      var size = element.attr("height");
      if (gravatarId !== "") {
        var url = "https://www.gravatar.com/avatar/" + gravatarId + "?r=g&d=404";
        if (size !== "") url += "&s=" + size;
        var gravatar = new Image();
        gravatar.src = url;
        gravatar.onload = function() {
          element.attr("src", url).addClass("gravatarLoaded");
        };
      }
    });
  },
};
jsFrontend.locale = {
  initialized: !1,
  data: {},
  init: function() {
    $.ajax({
      url: "/src/Frontend/Cache/Locale/" + jsFrontend.current.language + ".json",
      type: "GET",
      dataType: "json",
      async: !1,
      success: function(data) {
        jsFrontend.locale.data = data;
        jsFrontend.locale.initialized = !0;
      },
      error: function(jqXHR, textStatus, errorThrown) {
      },
    });
  },
  get: function(type, key) {
    if (!jsFrontend.locale.initialized) jsFrontend.locale.init();
    if (typeof jsFrontend.locale.data[type][key] === "undefined") return "{$" + type + key + "}";
    return jsFrontend.locale.data[type][key];
  },
  act: function(key) {
    return jsFrontend.locale.get("act", key);
  },
  err: function(key) {
    return jsFrontend.locale.get("err", key);
  },
  lbl: function(key) {
    return jsFrontend.locale.get("lbl", key);
  },
  loc: function(key) {
    return jsFrontend.locale.get("loc", key);
  },
  msg: function(key) {
    return jsFrontend.locale.get("msg", key);
  },
};
jsFrontend.statistics = {
  init: function() {
    jsFrontend.statistics.trackOutboundLinks();
  },
  trackOutboundLinks: function() {
    if (typeof _gaq === "object" || typeof ga === "function") {
      $.expr[":"].external = function(obj) {
        return typeof obj.href !== "undefined" && obj.hostname !== window.location.hostname;
      };
      $(document).on("click", "a:external:not(.noTracking)", function(e) {
        var hasTarget = typeof $(this).attr("target") !== "undefined";
        if (!hasTarget) e.preventDefault();
        var link = $(this).attr("href");
        var type = "Outbound Links";
        var pageView = "/Outbound Links/" + link;
        if (link.match(/^mailto:/)) {
          type = "Mailto";
          pageView = "/Mailto/" + link.substring(7);
        }
        if (link.match(/^#/)) {
          type = "Anchors";
          pageView = "/Anchor/" + link.substring(1);
        }
        if (typeof _gaq === "object") {
          _gaq.push([ "_trackEvent", type, pageView ]);
        } else {
          ga("send", "event", type, pageView);
        }
        if (!hasTarget)
          setTimeout(function() {
            document.location.href = link;
          }, 100);
      });
    }
  },
};
jsFrontend.twitter = {
  init: function() {
    if (typeof twttr === "object" && (typeof _gaq === "object" || typeof ga === "object")) {
      twttr.events.on("tweet", function(e) {
        if (e) {
          var targetUrl = null;
          if (e.target && e.target.nodeName === "IFRAME")
            targetUrl = utils.url.extractParamFromUri(e.target.src, "url");
          if (typeof _gaq === "object") {
            _gaq.push([ "_trackSocial", "twitter", "tweet", targetUrl ]);
          } else {
            ga("send", "social", "twitter", "tweet", targetUrl);
          }
        }
      });
    }
  },
};
$(jsFrontend.init);
