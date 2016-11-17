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
 * The GUI of the chat client of Silverpeas.
 * @type {object}
 */
SilverChat.gui = {
  /**
   * Initializes the GUI of the chat client.
   * It is actually invoked by the jsxc roster UI initialization.
   */
  init : function() {
    if (SilverChat.settings.forceGroupChats) {
      $(document).on('ready.roster.jsxc', function() {
        jsxc.debug('Force to load group chats from remote');
        jsxc.xmpp.bookmarks.loadFromRemote();
      });
    }

    $(document).on('cloaded.roster.jsxc', function() {
      // select by default the buddies tab if no tab were previously retained
      var previous = jsxc.storage.getUserItem('roster_content');
      if (previous) {
        SilverChat.gui.selectTab(previous);
      } else {
        SilverChat.gui.selectTab('buddies');
      }
    });

    // menu toggling
    $('#silverchat_roster_menu_toggle').click(function() {
      if ($('.silverchat_roster_content.jsxc_state_shown').attr('id') ===
          'silverchat_roster_menu') {
        var previous = jsxc.storage.getUserItem('roster_content');
        SilverChat.gui.selectTab(previous);
      } else {
        SilverChat.gui.switchContentTo('#silverchat_roster_menu');
      }
    });

    // buddies tab displaying
    $('#silverchat_buddies_filter').click(function() {
      SilverChat.gui.selectTab('buddies');
    });

    // group chats tab displaying
    $('#silverchat_groupchats_filter').click(function() {
      SilverChat.gui.selectTab('groupchats');
    });
  },

  /**
   * Selects the specified tab. The content of the selected tab is then rendered and replaces the
   * previous content.
   * @param tab either 'buddies' or 'talks' for respectively the tab with the
   * buddies of the current user or the tab with the talks in which is implied the current user.
   */
  selectTab : function(tab) {
    var currentElt, otherElt;
    switch (tab) {
      case 'buddies':
        currentElt = '#silverchat_buddies_filter';
        otherElt = '#silverchat_groupchats_filter';
        break;
      case 'groupchats':
        currentElt = '#silverchat_groupchats_filter';
        otherElt = '#silverchat_buddies_filter';
        break;
      default:
        jsxc.error('Unknown roster tab:' + tab);
        return;
    }
    jsxc.storage.setUserItem('roster_content', tab);
    $(currentElt).addClass('selected');
    $(otherElt).removeClass('selected');
    SilverChat.gui.filter(tab);
    SilverChat.gui.switchContentTo('#silverchat_roster_chats');
  },

  /**
   * Switch the displaying of the specified roster's tab content.
   * @param elt {string} elt the CSS class or the identifier of an HTML element embedding a
   * tab content.
   */
  switchContentTo : function(elt) {
    $('.silverchat_roster_content').removeClass('jsxc_state_shown').addClass('jsxc_state_hidden');
    $(elt).removeClass('jsxc_state_hidden').addClass('jsxc_state_shown');
  },

  /**
   * Filters the specified content type in the roster content: only the items of the specified
   * content type will be displayed whereas the items of the others content type will be hidden.
   * @param contentType the content type of the items to display.
   */
  filter: function(contentType) {
    jsxc.gui.showInBuddyList(contentType === 'buddies' ? 'chat':'groupchat');
  }
};