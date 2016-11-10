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
  var jsxcPath = window.webContext + '/chat/jsxc';

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
      url : "https://im.silverpeas.net/http-bind/", /* BOSH url */
      id : '', /* chat user id */
      password : '', /* chat user password */
      domain : "im.silverpeas.net", /* chat service domain */
      language : '', path : jsxcPath
    },

    /**
     * Initializes the silverpeas chat client.
     * @param options the options to override the default settings.
     * @return {SilverChat}
     */
    init : function(options) {
      if (options) {
        if (options.path) {
          options.path += '/jsxc';
        }
        this.settings = $.extend(true, this.settings, options);
      }

      window.addEventListener("beforeunload", function() {
        jsxc.xmpp.logout(false);

        // here we call directly this method to be sure it have time to execute
        jsxc.xmpp.disconnected();

        // TODO: try to send "presence=unaivalable" from here?
        jsxc.error("Disconnected before leaving page");

      }, false);

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
          domain : this.settings.domain, overwrite : true, /* user can overwrite XMPP settings */
          resource : 'SilverChat'
        },
        favicon : {
          enable : false
        }

      });

      return this;
    },

    /**
     * Starts the chat client.
     * @returns {SilverChat}
     */
    start : function() {
      jsxc.start(this.settings.id + '@' + this.settings.domain, this.settings.password);
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

  /**
   * The GUI of the chat client of Silverpeas.
   * @type {object}
   */
  SilverChat.gui = {
    /**
     * Initializes the GUI of the chat client.
     * It is actually invoked by the roster UI initialization.
     */
    init : function() {
      $('#silverchat_roster_menu_toggle').click(function() {
        if ($('.silverchat_roster_content.jsxc_state_shown').attr('id') ===
            'silverchat_roster_menu') {
          var previous = jsxc.storage.getUserItem('roster_content');
          SilverChat.gui.switchContentTo(previous);
        } else {
          SilverChat.gui.switchContentTo('#silverchat_roster_menu');
        }
      });
    },

    /**
     * Switch the displaying of the specified roster's tab content/
     * @param elt {string} elt the CSS class or the identifier of an HTML element representing
     * a setting.
     */
    switchContentTo : function(elt) {
      $('.silverchat_roster_content').removeClass('jsxc_state_shown').addClass('jsxc_state_hidden');
      if (elt !== '#silverchat_roster_menu') {
        jsxc.storage.setUserItem('roster_content', elt);
      }
      $(elt).removeClass('jsxc_state_hidden').addClass('jsxc_state_shown');
    }
  };

  //Silverchat GUI templates

  //JSXC functions modification

  //Silverchat locales

})(jQuery);
