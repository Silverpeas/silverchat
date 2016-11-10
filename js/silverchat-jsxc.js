/*!
 * Copyright (C) 2000-2016 Silverpeas
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * As a special exception to the terms and conditions of version 3.0 of
 * the GPL, you may redistribute this Program in connection with Writer Free/Libre
 * Open Source Software ("FLOSS") applications as described in Silverpeas's
 * FLOSS exception.  You should have recieved a copy of the text describing
 * the FLOSS exception, and it is also available here:
 * "http://www.silverpeas.org/legal/licensing"
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * The GUI of the chat client's settings popup.
 * @type {{init: jsxc.gui.settings.init, switchState: jsxc.gui.settings.switchState}}
 */
jsxc.gui.settings = {
  /**
   * Initializes the GUI of the settings.
   */
  init: function() {
    if (jsxc.options.get('muteNotification')) {
      jsxc.notification.muteSound();
      this.switchState($('.jsxc_muteNotification .silverchat_stateIndicator'), 'on');
    } else {
      jsxc.notification.unmuteSound();
      this.switchState($('.jsxc_muteNotification .silverchat_stateIndicator'), 'off');
    }

    $('.jsxc_muteNotification').click(function() {
      if (jsxc.storage.getUserItem('presence') === 'dnd') {
        return;
      }

      // invert current choice
      var mute = !jsxc.options.get('muteNotification');
      if (mute) {
        this.switchState($('.jsxc_muteNotification .silverchat_stateIndicator'), 'on');
        jsxc.notification.muteSound();
      } else {
        this.switchState($('.jsxc_muteNotification .silverchat_stateIndicator'), 'off');
        jsxc.notification.unmuteSound();
      }
    });
  },

  /**
   * Switches the state of a setting representing by the specified element.
   * @param {string} elt the CSS class or the identifier of an HTML element representing a setting.
   * @param {string} newState the new state of the setting: either 'on' or 'off'.
   */
  switchState: function(elt, newState) {
    switch (newState) {
      case 'on':
        elt.removeClass('.jsxc_disabled')
            .addClass('.jsxc_enabled');
        break;
      case 'off':
        elt.removeClass('.jsxc_enabled')
            .addClass('.jsxc_disabled');
        break;
    }
  }
};

/**
 * Overrides the initialization of the jsxc roster's GUI. The silverchat GUI is initialized here.
 */
jsxc.gui.roster.init = function() {
  $(jsxc.options.rosterAppend + ':first').append($(jsxc.gui.template.get('roster')));

  if (jsxc.options.get('hideOffline')) {
    $('#jsxc_buddylist').addClass('jsxc_hideOffline');
  }

  jsxc.gui.settings.init();
  SilverChat.gui.init();

  $('#silverchat_roster .silverchat_settings').click(function() {
    jsxc.gui.showSettings();
  });

  $('#silverchat_roster_toggle').click(function() {
    jsxc.gui.roster.toggle();
  });

  $('#jsxc_buddylist').slimScroll({
    distance: '3px',
    height: ($('#silverchat_roster').height() - 31) + 'px',
    width: $('#jsxc_buddylist').width() + 'px',
    color: '#fff',
    opacity: '0.5'
  });

  var rosterState = jsxc.storage.getUserItem('roster') || 'hidden';

  $('#silverchat_roster').addClass('jsxc_state_' + rosterState);
  $('#jsxc_windowList').addClass('jsxc_roster_' + rosterState);

  var pres = jsxc.storage.getUserItem('presence') || 'online';
  $('#jsxc_presence > span').text($('#jsxc_presence .jsxc_' + pres).text());
  jsxc.gui.updatePresence('own', pres);

  jsxc.gui.tooltip('#silverchat_roster');

  jsxc.notice.load();

  jsxc.gui.roster.ready = true;
  $(document).trigger('ready.roster.jsxc');
};

/**
 * Overrides the roster toggling to take in charge the specific GUI of SilverChat.
 * @param state the state to which the roster has to been toggled.
 * @return {number|*} the duration of the transition between the previous state of the roster GUI
 * to the new one.
 */
jsxc.gui.roster.toggle = function(state) {
  var duration;

  var roster = $('#silverchat_roster');
  var wl = $('#jsxc_windowList');

  if (!state) {
    state = (jsxc.storage.getUserItem('roster') === jsxc.CONST.HIDDEN) ? jsxc.CONST.SHOWN : jsxc.CONST.HIDDEN;
  }

  jsxc.storage.setUserItem('roster', state);

  roster.removeClass('jsxc_state_hidden jsxc_state_shown').addClass('jsxc_state_' + state);
  wl.removeClass('jsxc_roster_hidden jsxc_roster_shown').addClass('jsxc_roster_' + state);

  duration = parseFloat(roster.css('transitionDuration') || 0) * 1000;

  setTimeout(function() {
    jsxc.gui.updateWindowListSB();
  }, duration);

  $(document).trigger('toggle.roster.jsxc', [state, duration]);

  return duration;
};