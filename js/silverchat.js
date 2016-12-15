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
 * The chat client of Silverpeas.
 */
var SilverChat = null;

(function($) {
  "use strict";

  if (typeof jsxc === 'undefined' || jsxc === null) {
    return;
  }

  if (!window.webContext) {
    window.webContext = '.';
  }
  var chatPath = window.webContext + '/chat';

  /**
   * The chat client of Silverpeas.
   * @type {object}
   */
  SilverChat = {

    /**
     * The settings of the chat client. They define the parameters to communicate with the chat
     * server and to parameterize the UI. The settings can be overridden when initializing the chat
     * client.
     */
    settings : {
      url : 'https://im.silverpeas.net/http-bind/', /* BOSH url */
      id : '', /* chat user id */
      password : '', /* chat user password */
      domain : 'im.silverpeas.net', /* chat service domain */
      language : '', /* the language to use. By default English */
      path : chatPath, /* the path of the silverchat installation */
      avatar : null, /* the path of the directory with avatars or a function that returns the avatar by a jid (jabber identifier) */
      forceRemote: false, /* force to access the remote XMPP server for group chats (for buggy chat servers) */
      debug: false /* debug mode to display debugging messages in the console */
    },

    /**
     * Initializes the silverpeas chat client.
     * @param options the options to override the default settings.
     * @return {SilverChat}
     */
    init : function(options) {
      if (options) {
        this.settings = $.extend(true, this.settings, options);
        this.settings.path += '/jsxc';
      }

      window.top.addEventListener("beforeunload", function() {
        jsxc.gui.changePresence('offline', true);
        setTimeout(function() {
          jsxc.xmpp.logout(true);

          // here we call directly this method to be sure it have time to execute
          jsxc.xmpp.disconnected();

          jsxc.error("Disconnected before leaving page");
        }, 0);

      }, false);

      jsxc.storage.setItem("debug", this.settings.debug);

      if (SilverChat.settings.forceRemote) {
        // we overrides some functions of the bookmark object to ensure it works directly with
        // the remote XMPP service instead of the local bookmark in the case the bookmarking support
        // of XMPP server is enabled but buggy (like with OpenFire).
        jsxc.xmpp.bookmarks.load = function() {
          jsxc.debug('Force to load group chats from remote');
          jsxc.xmpp.bookmarks.loadFromRemote();
        };

        jsxc.xmpp.bookmarks.add = function(room, alias, nick, autojoin) {
          jsxc.debug('Force to add group chat to remote');
          jsxc.xmpp.bookmarks.addToRemote(room, alias, nick, autojoin);
        };
      }

      jsxc.init({
        app_name : 'Silverpeas',
        logoutElement : $('#logout'),
        root : this.settings.path,
        autoLang : this.settings.language.length === 0,
        defaultLang : (this.settings.language.length > 0 ? this.settings.language :
            jsxc.options.defaultLang),
        otr : {
          enable : false
        },
        xmpp : {
          url : this.settings.url, /* BOSH url */
          domain : this.settings.domain,
          overwrite : true, /* user can overwrite XMPP settings */
          resource : 'SilverChat'
        },
        favicon : {
          enable : false
        },
        defaultAvatar : function(jid) {
          var el = $(this);

          var avatar = new Image();
          avatar.onerror = function() {
            jsxc.gui.avatarPlaceholder(el.find('.jsxc_avatar'), jid);
          };
          avatar.onload = function() {
            el.find('.jsxc_avatar').removeAttr('style');
            el.find('.jsxc_avatar').css({
              'background-image': 'url(' + avatar.src + ')',
              'text-indent': '999px'
            });
          };

          if (typeof SilverChat.settings.avatar === 'function') {
            avatar.src = SilverChat.settings.avatar.call(jid);
          } else if (typeof SilverChat.settings.avatar === 'string') {
            avatar.src = SilverChat.settings.avatar + '/' + Strophe.getNodeFromJid(jid) + '.jpg';
          } else {
            avatar.onerror();
          }
        }
      });

      return this;
    },

    /**
     * Starts the chat client. The current user is connected to the remote chat server.
     * @returns {SilverChat}
     */
    start : function() {
      jsxc.start(this.settings.id + '@' + this.settings.domain, this.settings.password);
      return this;
    },

    /**
     * Connects to the remote chat server. To be used when the SilverChat is already started and
     * the current user is disconnected.
     * @return {SilverChat}
     */
    connect : function() {
      jsxc.xmpp.login(this.settings.id + '@' + this.settings.domain, this.settings.password);
      return this;
    },

    /**
     * Disconnects from the remote chat server. To be used when the SilverChat is already started
     * and the current user is yet connected.
     * @return {SilverChat}
     */
    disconnect : function() {
      jsxc.gui.changePresence('offline', true);
      setTimeout(function() {
        jsxc.xmpp.logout(false);
      });
      return this;
    },

    /**
     * Is the chat client connected to a remote chat server?
     * @return {boolean} true if the client is connected to a chat server, false otherwise.
     */
    isConnected : function() {
      return jsxc.xmpp.conn !== null;
    }
  };

  //Silverchat GUI

  //Silverchat GUI templates

  //JSXC functions modification

  //Silverchat locales

})(jQuery);
