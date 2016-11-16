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
 * Overrides the initialization of the jsxc roster's GUI. The silverchat GUI is initialized here.
 */
jsxc.gui.roster.init = function() {
  $(jsxc.options.rosterAppend + ':first').append($(jsxc.gui.template.get('roster')));

  if (jsxc.options.get('hideOffline')) {
    $('#jsxc_buddylist').addClass('jsxc_hideOffline');
  }

  //jsxc.gui.settings.init();
  // init the GUI of SilverChat
  SilverChat.gui.init();

  /*$('#silverchat_roster .silverchat_settings').click(function() {
    jsxc.gui.showSettings();
  });*/

  // toggle the roster
  $('#silverchat_roster_header.silverchat_roster_toggle').click(function() {
    jsxc.gui.roster.toggle();
  });

  // change the presence according to the click on the presence item
  $('#jsxc_presence li').click(function() {
    var self = $(this);
    var pres = self.data('pres');

    if (pres === 'offline') {
      jsxc.xmpp.logout(false);
    } else {
      jsxc.gui.changePresence(pres);
    }
  });

  // scroll the content of the buddy list (chats)
  $('#jsxc_buddylist').slimScroll({
    distance: '3px',
    height: ($('#silverchat_roster').height() - 31) + 'px',
    width: $('#jsxc_buddylist').width() + 'px',
    color: '#fff',
    opacity: '0.5'
  });

  // toggle the list of presence actions
  $('#silverchat_roster > .jsxc_bottom > div').each(function() {
    jsxc.gui.toggleList.call($(this));
  });

  // status of the roster: displayed or not
  var rosterState = jsxc.storage.getUserItem('roster') || 'hidden';

  $('#silverchat_roster').addClass('jsxc_state_' + rosterState);
  $('#jsxc_windowList').addClass('jsxc_roster_' + rosterState);

  // presence of the current user
  var pres = jsxc.storage.getUserItem('presence') || 'online';
  $('#jsxc_presence > span').text($('#jsxc_presence .jsxc_' + pres).text());
  jsxc.gui.updatePresence('own', pres);

  jsxc.gui.tooltip('#silverchat_roster');

  // load the JSXC notification mechanism
  jsxc.notice.load();

  // trigger the event about the readiness of the SilverChat roster
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

/**
 * Shows in the buddy list of JSXC only the HTML element whose the data type is the specified one.
 * Others are hidden.
 * @param type the data type attached to the HTML element: either 'chat' for chats with a single
 * buddy or 'chatgroup' for chats with several buddies.
 */
jsxc.gui.showInBuddyList = function(type) {
  if (type !== 'groupchat' && type !== 'chat') {
    console.log('Unknown jsxc data type in buddy list:' + type);
    return;
  }

  $('#jsxc_buddylist li.jsxc_rosteritem').each(function() {
    if ($(this).data('type') === type) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
};