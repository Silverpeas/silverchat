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

// ensures all the dependencies are correctly defined
if (typeof SilverChat === 'undefined' || typeof jsxc === 'undefined' ||
    typeof $iq === 'undefined' || typeof Strophe === 'undefined') {
  throw new Error('SilverChat or JSXC not defined!');
}

/**
 * The GUI of the chat client of Silverpeas.
 * @type {object}
 */
SilverChat.gui = {

  /**
   * The roster in the SilverChat GUI.
   */
  roster : {
    /**
     * Identifier of the tab in which are rendered the buddies in the roster.
     */
    BUDDIES : 1,

    /**
     * Identifier of the tab in which are rendered the group chats in the roster.
     */
    GROUP_CHATS : 2,

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
    DEFAULT : 1, // by default, render the buddies,

    /**
     * selection of the buddies to invite into a group chat.
     */
    selection : {
      buddies : [],

      add : function(bid, callback) {
        for (var i = 0; i < this.buddies.length; i++) {
          if (this.buddies[i] === bid) {
            return this;
          }
        }
        this.buddies.push(bid);
        if (callback) {
          callback();
        }
        return this;
      },

      remove : function(bid, callback) {
        function deleteBuddy() {
          for (var i = 0; i < this.buddies.length; i++) {
            if (this.buddies[i] === bid) {
              this.buddies.splice(i, 1);
              if (callback) {
                callback();
              }
              break;
            }
          }
        }

        if (bid) {
          deleteBuddy.call(this);
        } else {
          this.buddies.length = 0;
          if (callback) {
            callback();
          }
        }
        return this;
      },

      size : function() {
        return this.buddies.length;
      },

      empty : function() {
        return this.buddies.length === 0;
      }
    },

    /**
     * Initializes the roster GUI of SilverChat. All actions related to the roster are set up here.
     */
    init: function() {

      // toggle the menu to display the events
      $('#silverchat_notice').click(function(event) {
        event.stopPropagation();
        jsxc.gui.roster.toggle(jsxc.CONST.SHOWN);
        SilverChat.gui.roster.toggleMenu(jsxc.CONST.SHOWN);
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
        SilverChat.gui.roster.selectTab(SilverChat.gui.roster.GROUP_CHATS);
      });

      // search a user and open a chat with him
      $('#search_user').click(function() {
        SilverChat.settings.selectUser(SilverChat.gui.openChatWindow);
      });

      // init or not the functionality to create a groupchat
      if (SilverChat.settings.acl.groupchat.creation) {
        jsxc.debug("Allow groupchat creation and invitation");
        // open a new group chat and invite to that group the previously selected buddies
        $('#new_group_chat, #create_group_chat').click(function() {
          if (!$(this).hasClass('jsxc_disabled')) {
            var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('chatroom'));
            var $room = dialog.find('#jsxc_room');
            $room.attr('title', $.t('Chat_room_name_pattern')).focus();
            $('#new_group_chat_form, #create_group_chat').submit(function(event) {
              event.preventDefault();
              var name = $room.val() || Strophe.getNodeFromJid(jsxc.xmpp.conn.jid) + '_' +
                  new Date().getTime();
              var subject = $('#jsxc_dialog #jsxc_subject').val() || '';

              var room = jsxc.muc.newRoom(name, subject, true);

              jsxc.muc.invite(SilverChat.gui.roster.selection.buddies, room, subject);

              SilverChat.gui.roster.clearSelection();
            });
          }
        });
      } else {
        jsxc.debug("Disallow groupchat creation and invitation");
        $('#new_group_chat, #create_group_chat').remove();
        $('.silverchat_invite').remove();
      }
    },

    clearSelection: function() {
      SilverChat.gui.roster.selection.remove();
      $('.jsxc_rosteritem.selected').removeClass('selected');
      $('#new_group_chat, #create_group_chat').addClass('jsxc_disabled');
    },

    /**
     * Toggles the menu. If the menu is already displayed, then hides it and the content of the
     * selected tab is shown, otherwise the content of the menu replace the content of the
     * selected tab.
     * @param state {string} the state of the menu to force to: either jsxc.CONST.HIDDEN or
     * jsxc.CONST.SHOWN. Optional.
     */
    toggleMenu : function(state) {
      var actual = jsxc.storage.getUserItem('roster_content');
      if ((actual > this._MENU && state === jsxc.CONST.SHOWN) || (actual <= this._MENU &&
          state === jsxc.CONST.HIDDEN)) {
        return;
      }
      if (actual > this._MENU || state === jsxc.CONST.HIDDEN) {
        // the menu is shown, then hide it
        this.selectTab(this.NO_MENU);
      } else {
        actual = this._maskOnceMenuIsShown(actual);
        this._switchContentTo('#silverchat_roster_menu');
        jsxc.storage.setUserItem('roster_content', actual);
      }
    },

    /**
     * Selects either the specified tab or the one that was selected in the last user session.
     *
     * If no tab identifier is specified, then the tab that was previously selected in the
     * user session is rendered. If no tab was previously selected, then the default one is
     * taken.
     * If the NO_MENU mask is passed, then the menu is hidden and the content of the previous
     * selected tab in the user session is displayed.
     * The content of the selected tab is then shown and replaces the previous content in the
     * tab.
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
          $('#silverchat_roster_new_group_chat').hide();
          break;
        case this.GROUP_CHATS:
          // select only the talks
          currentElt = '#silverchat_groupchats_filter';
          otherElt = '#silverchat_buddies_filter';
          $('#silverchat_roster_new_group_chat').show();
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
     * Switches the displaying of the specified roster's tab content.
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
   * It is actually invoked once the JSXC roster initialization is performed; triggered by the
   * 'ready.roster.jsxc' event.
   * All the actions related to the GUI of SilverChat are initialized and defined here.
   */
  init : function() {

    jsxc.debug('Init SilverChat GUI');

    // initializes the roster of our own.
    SilverChat.gui.roster.init();

    if (typeof SilverChat.settings.selectUser !== 'function') {
      $('#search_user').remove();
    }

    // select the default tab or the one selected in a previous session
    SilverChat.gui.roster.selectTab(SilverChat.gui.roster.NO_MENU);
  },

  /**
   * Opens a chat window with the specified user. In the case the user isn't in the buddies list of
   * the current user, he's added in the roster (but without any subscriptions for status event from
   * this user).
   * @param {String} jid the unique identifier of the user in the remote chat server.
   * @param {String} alias an alias to map with the jid above in the case of a chat with a user that
   * isn't yet a buddy.
   */
  openChatWindow : function(jid, alias) {
    var bid = jsxc.jidToBid(jid);
    if (jsxc.storage.getUserItem('buddylist').indexOf(bid) < 0) {
      jsxc.debug('Add user ' + jid + ' into my roster');
      if (jsxc.master) {
        // add buddy to roster: this will trigger onRosterChanged in JSXC which at his turn will
        // indirect fire the event add.roster.jsxc
        var unknown = jsxc.storage.getUserItem('unknown') || [];
        unknown.push(bid);
        jsxc.storage.setUserItem('unknown', unknown);

        var iq = $iq({
          type : 'set'
        }).c('query', {
          xmlns : 'jabber:iq:roster'
        }).c('item', {
          jid : jid, name : alias || Strophe.getNodeFromJid(jid)
        }).c('group').t('xmpp');
        jsxc.xmpp.conn.sendIQ(iq);

        jsxc.storage.removeUserItem('add_' + bid);
      } else {
        jsxc.storage.setUserItem('add_' + bid, {
          username : jid, alias : alias || Strophe.getNodeFromJid(jid)
        });
      }
    } else {
      jsxc.gui.window.open(bid);
    }
  },

  _selectBuddy : function(bid, buddy, rosteritem) {
    var data = jsxc.storage.getUserItem('buddy', bid);
    if (data === null || data.sub === 'none') {
      // no subscription (peculiar case of a buddy was added in the roster without any
      // subscription (used for chatting with users that aren't friends)
      return;
    }

    if (rosteritem.hasClass('selected')) {
      SilverChat.gui.roster.selection.remove(bid, function() {
        rosteritem.removeClass('selected');
        rosteritem.find('#silverchat_select_text').text($.t('Select_Buddy'));
      });
    } else {
      SilverChat.gui.roster.selection.add(bid, function() {
        rosteritem.addClass('selected');
        rosteritem.find('#silverchat_select_text').text($.t('Unselect_Buddy'));
      });
    }
    if (SilverChat.gui.roster.selection.empty()) {
      $('#new_group_chat, #create_group_chat').addClass('jsxc_disabled');
      $('.silverchat_invite').parent().addClass('jsxc_disabled');
    } else if (SilverChat.gui.roster.selection.size() === 1) {
      $('#new_group_chat, #create_group_chat').removeClass('jsxc_disabled');
      $('.silverchat_invite').parent().removeClass('jsxc_disabled');
    }
  },

  /**
   * Sets the actions on the specified roster item representing a buddy with the specified buddy
   * identifier.
   * @param bid a buddy identifier
   * @param buddy information about the buddy itself (subscription, name, ...)
   * @param rosteritem the GUI item in the roster representing the buddy.
   * @private
   */
  _setRosterBuddyActions : function(bid, buddy, rosteritem) {
    if (buddy.sub !== 'none') {
      // the buddy is a Silverpeas contact: the buddy deletion must be done directly in
      // Silverpeas
      rosteritem.find('.jsxc_delete').remove();
    }

    // invitation of a buddy to a groupchat by drag&drop or by selection is disabled if the
    // corresponding ACL isn't allowed.
    if (SilverChat.settings.acl.groupchat.creation) {
      rosteritem.attr('draggable', true).on('dragstart', function(e) {
        e.originalEvent.dataTransfer.setData('text/plain', bid);
      });

      rosteritem.find('div.jsxc_menu ul').append($('<li>').append(
          $('<a>').attr('href', '#').addClass('silverchat_select').click(function(event) {
            event.stopPropagation();
            SilverChat.gui._selectBuddy(bid, buddy, rosteritem);
            rosteritem.find('div.jsxc_menu').removeClass('jsxc_open');
          }).append($('<span>').addClass('jsxc_icon jsxc_bookmarkicon').text('')).append(
              $('<span>').attr('id', 'silverchat_select_text').text($.t('Select_Buddy')))));

      rosteritem.off('click'); // remove the previous click handler defined by JSXC itself
      rosteritem.click(function(event) {
        // when the CTRL key is pressed while clicking on the buddy item, then the item is
        // just selected for further action. Otherwise the chat window is simply opened.
        if (!event.ctrlKey) {
          SilverChat.gui.roster.clearSelection();
          jsxc.gui.window.open(bid);
          return;
        }

        SilverChat.gui._selectBuddy(bid, buddy, rosteritem);
      });
    }
  }
};

/**
 * A new item is added into the roster: either a buddy, a room or an unknown user (a user that is
 * not a buddy of the current user).
 */
$(document).on('add.roster.jsxc', function(event, bid, buddy, rosteritem) {
  jsxc.debug('A new ' + buddy.type + ' is added in the roster as ' + buddy.jid);
  if (buddy.type === 'chat') {
    SilverChat.gui._setRosterBuddyActions(bid, buddy, rosteritem);

    var unknown = jsxc.storage.getUserItem('unknown') || [];
    jsxc.storage.removeUserItem('unknown');
    for (var i = 0; i < unknown.length; i++) {
      jsxc.gui.window.open(unknown[i]);
    }
  }
  // a chat or a group chat is added: hide the menu and render the content of the actual tab
  SilverChat.gui.roster.selectTab(SilverChat.gui.roster.NO_MENU);
});

// Direct invitation for a group chat is received from a buddy. Automatically join to this room.
$(document).on('receive.invitation.silverchat', function(event, buddy, roomjid, subject) {
  var name = Strophe.getNodeFromJid(roomjid);
  jsxc.debug('Invation to ' + name + ' received from ' + buddy + ' for "' + subject + '"');

  jsxc.storage.setUserItem('member', roomjid, {});

  jsxc.muc.join(roomjid, Strophe.getNodeFromJid(jsxc.xmpp.conn.jid), null, name, subject, true,
      true);

  // doesn't open the window as once jsxc is started, automatically any room in which the user
  // is member is then opened (indeed, his invitation is renewed at each connection)
  //jsxc.gui.window.open(roomjid);

  jsxc.notification.notify({
    title : $.t('New_invitation', {sender : buddy, room : name}),
    msg : subject || '',
    source : buddy
  });
});

// A chat window is initialized: customizes its behaviour for SilverChat.
$(document).on('init.window.jsxc', function(event, chatWindow) {
  var data = chatWindow.data();
  var bid = jsxc.jidToBid(data.jid);
  var roomdata = jsxc.storage.getUserItem('buddy', bid);
  if (roomdata.type === 'groupchat' && roomdata.owner) {
    chatWindow.on('dragover', function(e) {
      // required to enable the drop of draggable elements
      e.preventDefault();
    }).on('drop', function(e) {
      e.preventDefault();
      var bid = e.originalEvent.dataTransfer.getData('text/plain');
      var room = chatWindow.data('bid');
      jsxc.muc.invite([bid], room, roomdata.subject || '');
    });
    chatWindow.find('div.jsxc_menu ul').prepend(
        $('<li>').append($('<a>').attr('href', '#').addClass('jsxc_disabled').click(function() {
          if (!$(this).hasClass('jsxc_disabled')) {
            var room = chatWindow.data('bid');
            var roomdata = jsxc.storage.getUserItem('buddy', room);
            jsxc.muc.invite(SilverChat.gui.roster.selection.buddies, room, roomdata.subject || '');
            SilverChat.gui.roster.clearSelection();
          }
        }).append(
            $('<span>').addClass('silverchat_invite').attr('title', $.t('Help_Invite')).text(
                $.t('Invite_To_Group_Chat')))));
  }
});

// At disconnection, we clean up the roster.
$(document).on('disconnected.jsxc', function() {
  $(document).off('disconnected.jsxc', this);
  if (jsxc.triggeredFromElement) {
    $('#silverchat_roster').remove();
    setTimeout(function() {
      $(document).trigger('SilverChat.stopped');
    }, 0);
  }
});
