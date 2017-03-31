/*!
 * Copyright (C) 2000-2017 Silverpeas
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
 * The chat client for Silverpeas.
 * It is based upon JSXC (https://www.jsxc.org/)
 */
var SilverChat = null;

(function($) {
  "use strict";

  if (typeof jsxc === 'undefined' || typeof Strophe === 'undefined') {
    throw new Error('SilverChat dependencies not defined: jsxc and Strophe');
  }

  if (window.webContext === null) {
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
      /**
       * The URL of the XMPP's BOSH service with which SilverChat communicates.
       * @type {string}
       */
      url : 'http://im.silverpeas.net:5280/http-bind/',

      /**
       * The definition of an ICE service to enable the video chat capability. It is defined by the
       * following object:
       * {
       *   server: {string}    the hostname or IP address of a ICE server with its port number.
       *                       (for example ice.silverpeas.net:80)
       *   auth: {boolean}     is an authentication must be performed to access the STUN service?
       *   user: {string}      the user identifier used to authenticate the client to the STUN
       *                       service. If missing and auth is true, then the current user
       *                       identifier is used. Optional.
       *   password: {string}  the password associated with the user identifier to authenticate the
       *                       the client to the STUN service. If user is set, this attribute is
       *                       mandatory. Optional.
       * }
       * If no such service is defined, then the video chat capability is disabled.
       */
      ice : null,

      /**
       * The user login to open a connection with the XMPP server.
       * @type {string}
       */
      id : '',

      /**
       * The user password to open a connection with the XMPP server.
       * @type {string}
       */
      password : '',

      /**
       * The XMPP domain (or Jabber domain) in which the user is.
       * @type {string}
       */
      domain : 'im.silverpeas.net',

      /**
       * The ISO 639-1 code of the language to use in the GUI localization. By default, in English.
       * @type {string}
       */
      language : '',

      /**
       * The path of the installation directory of SilverChat. By default, in the chat directory
       * relative to the web context (the web context is assumed to be defined in the webContext
       * variable).
       * @type {string}
       */
      path : chatPath,

      /**
       * The path of the directory containing the avatars of the user and of its buddies.
       * The path can be provided by a function that has to accept as argument the JID (Jabber
       * IDentifier) of the user for which the avatar is asked.
       * @type {string|function}
       */
      avatar : null,

      /**
       * A function to provide a custom and an external way to select a user with whom the current
       * user wish to chat. The selected user will be then added into the current user's roster
       * but no presence subscription will be performed.
       *
       * The function must accept as argument a callback to call with as parameters the JID of the
       * selected user and optionally the name (or alias) of the selected user.
       * If no function is set, then the user selection menu item is removed.
       * @type {function}
       */
      selectUser: null,

      /**
       * Switches SilverChat logs in the debug level for displaying debugging messages in the
       * Javascript console of the web browser. By default, false.
       * @type {boolean}
       */
      debug: false
    },

    /**
     * Initializes the silverpeas chat client. It bootstraps JSXC and its own customization of
     * JSXC.
     * @param options the options to override the default settings.
     * @return {SilverChat}
     */
    init : function(options) {
      this.settings = $.extend(true, this.settings, options);
      this.settings.path += '/jsxc';

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

      var jsxcOptions = {
        app_name : 'Silverpeas',
        logoutElement : $('#logout'),
        root : this.settings.path,
        numberOfMsg: 5000,
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
          resource : 'SilverChat',
          searchDomain: this.settings.searchDomain
        },
        favicon : {
          enable : false
        },
        defaultAvatar : jsxc.gui.avatar.getBuddyAvatar
      };

      if (SilverChat.settings.ice !== null) {
        jsxcOptions.RTCPeerConfig = {
          iceServers: [
            {
              urls: 'stun:' + SilverChat.settings.ice.server
            },
            {
              urls: 'turn:' + SilverChat.settings.ice.server
            }
          ]
        };
        if (SilverChat.settings.ice.auth) {
          var id = SilverChat.settings.id;
          var password = SilverChat.settings.password;
          if (SilverChat.settings.ice.user) {
            id = SilverChat.settings.ice.user;
            password = SilverChat.settings.ice.password;
          }
          jsxcOptions.RTCPeerConfig.iceServers[1].username = id;
          jsxcOptions.RTCPeerConfig.iceServers[1].credential = password;
          jsxcOptions.RTCPeerConfig.iceServers[1].credentialType = 'password';
        }
      }

      jsxc.init(jsxcOptions);

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
