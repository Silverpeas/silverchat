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
   * The roster in the SilverChat GUI.
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
        if (bid) {
          for (var i = 0; i < this.buddies.length; i++) {
            if (this.buddies[i] === bid) {
              this.buddies.splice(i, 1);
              if (callback) {
                callback();
              }
              break;
            }
          }
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
     * Toggles the menu. If the menu is already displayed, then hides it and the content of the
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
        if (jsxc.options.get('muteNotification')) {
          $('#manage_notifications').addClass('mute');
        } else {
          $('#manage_notifications').removeClass('mute');
        }
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
   * It is actually invoked by the jsxc roster UI initialization.
   */
  init : function() {
    function clearSelection() {
      SilverChat.gui.roster.selection.remove();
      $('.jsxc_rosteritem.selected').removeClass('selected');
      $('#new_talk').addClass('jsxc_disabled');
    }

    // once the roster is ready to be rendered we perform some predefined actions according to
    // the user preferences and to the SilverChat settings.
    $(document).on('ready.roster.jsxc', function() {
      if (jsxc.notification.isNotificationEnabled()) {
        $('#manage_notifications').removeClass('mute');
      } else {
        $('#manage_notifications').addClass('mute');
      }

      if (typeof SilverChat.settings.selectUser !== 'function') {
        $('#search_user').remove();
      }

      // select the default tab or the one selected in a previous session
      SilverChat.gui.roster.selectTab(SilverChat.gui.roster.NO_MENU);
    });

    // for each item added into the buddy list, we customize its displaying and we set our own click
    // handler.
    $(document).on('add.roster.jsxc', function(event, bid, buddy, rosteritem) {
      jsxc.debug('A new ' + buddy.type + ' is added in the roster', buddy.jid);
      if (buddy.type !== 'groupchat') {
        if (buddy.sub !== 'none') {
          // the buddy is a Silverpeas contact: the buddy deletion must be done directly in
          // Silverpeas
          rosteritem.find('.jsxc_delete').remove();
        }
        rosteritem.off('click'); // remove the previous click handler defined by JSXC itself
        rosteritem.click(function(event) {
          // when the CTRL key is pressed while clicking on the buddy item, then the item is
          // just selected for further action. Otherwise the chat window is simply opened.
          if (event.ctrlKey) {
            var data = jsxc.storage.getUserItem('buddy', bid);
            if (data === null || data.sub === 'none') {
              // no subscription. Peculiar case of a buddy was added in the roster without any
              // subscription (used for chatting with users that aren't friends)
              return;
            }
            if (rosteritem.hasClass('selected')) {
              if (SilverChat.gui.roster.selection.remove(bid, function() {
                    rosteritem.removeClass('selected');
                  }).empty()) {
                $('#new_talk').addClass('jsxc_disabled');
                $('.silverchat_invite').parent().addClass('jsxc_disabled');
              }
            } else {
              if (SilverChat.gui.roster.selection.add(bid, function() {
                    rosteritem.addClass('selected');
                  }).size() === 1) {
                $('#new_talk').removeClass('jsxc_disabled');
                $('.silverchat_invite').parent().removeClass('jsxc_disabled');
              }
            }
          } else {
            clearSelection();
            jsxc.gui.window.open(bid);
          }
        });
      }
      // a chat or a group chat is added: hide the menu and render the content of the actual tab
      SilverChat.gui.roster.selectTab(SilverChat.gui.roster.NO_MENU);
    });

    // invitation for a group chat is received from a buddy.
    $(document).on('receive.invitation.silverchat', function(event, buddy, roomjid, subject) {
      var name = Strophe.getNodeFromJid(roomjid);
      jsxc.debug('Invation to ' + name + ' received from ' + buddy + ' for "' + subject + '"');

      jsxc.gui.window.clear(roomjid);
      jsxc.storage.setUserItem('member', roomjid, {});

      jsxc.muc.join(roomjid, Strophe.getNodeFromJid(jsxc.xmpp.conn.jid), null, name, subject, true,
          true);

      jsxc.gui.window.open(roomjid);

      jsxc.notification.notify({
       title : $.t('New_invitation', {sender : buddy, room : name}),
       msg : subject || '',
       source : buddy
       });
    });

    // a chat window is initialized: attach to it a key handler for composing notification
    $(document).on('init.window.jsxc', function(event, chatWindow) {
      var type = chatWindow.hasClass('jsxc_groupchat') ? 'groupchat' : 'chat';

      if (type === 'groupchat') {
        chatWindow.find('.jsxc_menu ul').prepend(
            $('<li>').append($('<a>').attr('href', '#').addClass('jsxc_disabled').click(function() {
              if (!$(this).hasClass('jsxc_disabled')) {
                var room = chatWindow.data('bid');
                var roomdata = jsxc.storage.getUserItem('buddy', room);
                jsxc.muc.invite(SilverChat.gui.roster.selection.buddies, room,
                    roomdata.subject || '');
                clearSelection();
              }
            }).append($('<span>').addClass('silverchat_invite').text($.t('Invite_To_Talk')))));
      }

      chatWindow.find('.jsxc_textinput').keyup(function() {
        if (jsxc.xmpp.conn) {
          var now = new Date().getTime();
          var last = chatWindow.data('composing-timestamp');

          // send only every 9000ms interval
          if (!last || (now - last) > 900) {
            var bid = chatWindow.attr('data-bid');
            jsxc.xmpp.conn.chatstates.sendComposing(bid, type);
            chatWindow.data('composing-timestamp', now);
          }
        }
      });
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

    // notification management
    $('#manage_notifications').click(function() {
      if (jsxc.storage.getUserItem('presence') === 'dnd') {
        return;
      }

      if (window.Notification.permission !== 'granted') {
        window.Notification.requestPermission().then(function(status) {
          switch(status) {
            case 'granted':
              jsxc.notification.enableNotification();
              break;
            case 'denied':
              jsxc.notification.disableNotification();
              break;
          }
        });
      } else {
        if (jsxc.notification.isNotificationEnabled()) {
          jsxc.notification.disableNotification();
        } else {
          jsxc.notification.enableNotification();
        }
      }
    });

    // search a user and open a chat with him
    $('#search_user').click(function() {
      SilverChat.settings.selectUser(function(jid, alias) {
        jsxc.debug('Add user ' + jid + ' into my roster');
        var bid = jsxc.jidToBid(jid);
        if (jsxc.storage.getUserItem('buddylist').indexOf(bid) < 0) {
          if (jsxc.master) {
            // add buddy to roster (trigger onRosterChanged)
            var iq = $iq({
              type: 'set'
            }).c('query', {
              xmlns: 'jabber:iq:roster'
            }).c('item', {
              jid: jid,
              name: alias || Strophe.getNodeFromJid(jid)
            }).c('group').t('xmpp');
            jsxc.xmpp.conn.sendIQ(iq);

            jsxc.storage.removeUserItem('add_' + bid);
          } else {
            jsxc.storage.setUserItem('add_' + bid, {
              username: jid,
              alias: alias || Strophe.getNodeFromJid(jid)
            });
          }
        } else {
          jsxc.gui.window.open(bid);
        }

      });
    });

    // open a new group chat and invite to that group the previously selected buddies
    $('#new_talk').click(function() {
      if (!$(this).hasClass('jsxc_disabled')) {
        var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('chatroom'));
        var $room = dialog.find('#jsxc_room');
        $room.attr('title', $.t('Chat_room_name_pattern')).focus();
        $('#new_talk_form').submit(function(event) {
          event.preventDefault();
          var name = $room.val() ||
              Strophe.getNodeFromJid(jsxc.xmpp.conn.jid) + '_' + new Date().getTime();
          var subject = $('#jsxc_dialog #jsxc_subject').val() || '';

          var room = jsxc.muc.newRoom(name, subject, true);

          jsxc.muc.invite(SilverChat.gui.roster.selection.buddies, room, subject);

          clearSelection();
        });
      }
    });
  }
};