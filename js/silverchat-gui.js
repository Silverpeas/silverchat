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
   * The roster.
   */
  roster : {
    /**
     * Identifier of the tab in which are rendered the buddies in the roster.
     */
    BUDDIES : 1,

    /**
     * Identifier of the tab in which are rendered the talks (group chats) in the roster.
     */
    TALKS : 2,

    /**
     * A mask to apply in order to hide the menu's content.
     */
    NO_MENU : 3,

    /**
     * A mask to apply in order to show the menu's content.
     * @private
     */
    _MENU : 4,

    /**
     * Identifier of the tab to select by default when no one was registered into the user
     * session.
     */
    DEFAULT : 1, // by default, render the buddies

    /**
     * Toggle the menu. If the menu is already displayed, then hide it and the content of the
     * selected tab is shown, otherwise the content of the menu replace the content of the
     * selected tab.
     */
    toggleMenu : function() {
      var actual = jsxc.storage.getUserItem('roster_content');
      if (actual > this._MENU) {
        // the menu is shown, then hide it
        this.selectTab(this.NO_MENU);
      } else {
        // the menu is hidden, then show it
        actual = this._maskOnceMenuIsShown(actual);
        this._switchContentTo('#silverchat_roster_menu');
        jsxc.storage.setUserItem('roster_content', actual);
      }
    },

    /**
     * Selects either the specified tab or the one that was selected in the last user session.
     * The content of the selected tab is then shown and replaces the previous content in the
     * tab.
     * @param tab an identifier of the tab or NO_MENU to show the previous content but by ensuring
     * to hide the menu (in the case it was shown over the content of the selected tab).
     */
    selectTab : function() {
      var toTab = jsxc.storage.getUserItem('roster_content');
      if (!toTab) {
        toTab = this.DEFAULT;
      }
      if (arguments.length > 0) {
        toTab = (arguments[0] === this.NO_MENU ? this._maskOnceMenuIsHidden(toTab) : arguments[0]);
      }

      var currentElt, otherElt;
      switch (toTab) {
        case this.BUDDIES:
          // select only the buddies
          currentElt = '#silverchat_buddies_filter';
          otherElt = '#silverchat_groupchats_filter';
          break;
        case this.TALKS:
          // select only the talks
          currentElt = '#silverchat_groupchats_filter';
          otherElt = '#silverchat_buddies_filter';
          break;
        default:
          jsxc.error('Unknown roster tab:' + toTab);
          toTab = this.DEFAULT;
          this.selectTab(toTab);
          break;
      }

      $(currentElt).addClass('selected');
      $(otherElt).removeClass('selected');
      this._filter(toTab);
      this._switchContentTo('#silverchat_roster_chats');
      jsxc.storage.setUserItem('roster_content', toTab);
    },

    /**
     * Masks the specified tab identifier in order to get the selected tab.
     * @param id an identifier of a tab whose the content is overlaid by the menu's content.
     * @return {number} the identifier of the selected mask.
     * @private
     */
    _maskOnceMenuIsHidden : function(id) {
      return id & this.NO_MENU;
    },

    /**
     * Masks the specified identifier of the selected tab in order to get the identifier of this
     * tab with the menu's content overlaying its content.
     * @param id the identifier of the selected tab.
     * @return {number} the identifier a tab on which is overlaid the menu's content.
     * @private
     */
    _maskOnceMenuIsShown : function(id) {
      return id | this._MENU;
    },

    /**
     * Switch the displaying of the specified roster's tab content.
     * @param elt {string} elt the CSS class or the identifier of an HTML element embedding a
     * tab content.
     * @private
     */
    _switchContentTo : function(elt) {
      $('.silverchat_roster_content').removeClass('jsxc_state_shown').addClass('jsxc_state_hidden');
      $(elt).removeClass('jsxc_state_hidden').addClass('jsxc_state_shown');
    },

    /**
     * Filters the specified content type in the roster content: only the items of the specified
     * content type will be displayed whereas the items of the others content type will be hidden.
     * @param contentType the content type of the items to display.
     * @private
     */
    _filter : function(contentType) {
      jsxc.gui.showInBuddyList(
          contentType === this.BUDDIES ? 'chat' : 'groupchat');
    }
  },

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

    $(document).on('add.roster.jsxc', function() {
      // select either the default tab or the one that was selected in the previous user session.
      SilverChat.gui.roster.selectTab(SilverChat.gui.roster.NO_MENU);
    });

    // menu toggling
    $('#silverchat_roster_menu_toggle').click(function() {
      SilverChat.gui.roster.toggleMenu();
    });

    // buddies tab displaying
    $('#silverchat_buddies_filter').click(function() {
      SilverChat.gui.roster.selectTab(SilverChat.gui.roster.BUDDIES);
    });

    // group chats tab displaying
    $('#silverchat_groupchats_filter').click(function() {
      SilverChat.gui.roster.selectTab(SilverChat.gui.roster.TALKS);
    });
  }
};