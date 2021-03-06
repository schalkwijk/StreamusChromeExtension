﻿define(function (require) {
    'use strict';
    
    var AppBarRegion = require('foreground/view/appBar/appBarRegion');
    var ContextMenuRegion = require('foreground/view/contextMenu/contextMenuRegion');
    var DialogRegion = require('foreground/view/dialog/dialogRegion');
    var SpinnerView = require('foreground/view/element/spinnerView');
    var LeftPaneRegion = require('foreground/view/leftPane/leftPaneRegion');
    var NotificationRegion = require('foreground/view/notification/notificationRegion');
    var PlaylistsAreaRegion = require('foreground/view/playlist/playlistsAreaRegion');
    var SaveSongsRegion = require('foreground/view/saveSongs/saveSongsRegion');
    var SearchAreaRegion = require('foreground/view/search/searchAreaRegion');
    var StreamRegion = require('foreground/view/stream/streamRegion');
    var ForegroundAreaTemplate = require('text!template/foregroundArea.html');

    var ForegroundAreaView = Marionette.LayoutView.extend({
        id: 'foregroundArea',
        className: 'flexColumn u-fullHeight',
        template: _.template(ForegroundAreaTemplate),
        
        templateHelpers: function () {
            return {
                loadingYouTubeMessage: chrome.i18n.getMessage('loadingYouTube'),
                loadingYouTubeFailedMessage: chrome.i18n.getMessage('loadingYouTubeFailed'),
                reloadMessage: chrome.i18n.getMessage('reload'),
                loadAttemptMessage: this._getLoadAttemptMessage()
            };
        },

        events: {
            'mousedown': '_onMouseDown',
            'click': '_onClick',
            'contextmenu': '_onContextMenu',
            'click @ui.reloadLink': '_onClickReloadLink'
        },
        
        ui: function () {
            return {
                loadingMessage: '#' + this.id + '-loadingMessage',
                loadingFailedMessage: '#' + this.id + '-loadingFailedMessage',
                reloadLink: '.' + this.id + '-reloadLink',
                loadAttemptMessage: '#' + this.id + '-loadAttemptMessage'
            };
        },

        regions: function () {
            return {
                spinnerRegion: '#' + this.id + '-spinnerRegion',
                appBarRegion: {
                    selector: '#' + this.id + '-appBarRegion',
                    regionClass: AppBarRegion
                },
                dialogRegion: {
                    selector: '#' + this.id + '-dialogRegion',
                    regionClass: DialogRegion
                },
                notificationRegion: {
                    selector: '#' + this.id + '-notificationRegion',
                    regionClass: NotificationRegion
                },
                contextMenuRegion: {
                    selector: '#' + this.id + '-contextMenuRegion',
                    regionClass: ContextMenuRegion
                },
                leftPaneRegion: {
                    selector: '#' + this.id + '-leftPaneRegion',
                    regionClass: LeftPaneRegion
                },
                searchAreaRegion: {
                    selector: '#' + this.id + '-searchAreaRegion',
                    regionClass: SearchAreaRegion
                },
                saveSongsRegion: {
                    selector: '#' + this.id + '-saveSongsRegion',
                    regionClass: SaveSongsRegion
                },
                playlistsAreaRegion: {
                    selector: '#' + this.id + '-playlistsAreaRegion',
                    regionClass: PlaylistsAreaRegion
                },
                streamRegion: {
                    selector: '#' + this.id + '-streamRegion',
                    regionClass: StreamRegion
                }
            };
        },
        
        player: null,
        settings: null,

        initialize: function () {
            this.player = Streamus.backgroundPage.player;
            this.settings = Streamus.backgroundPage.settings;

            this.listenTo(this.player, 'change:loading', this._onPlayerChangeLoading);
            this.listenTo(this.player, 'change:currentLoadAttempt', this._onPlayerChangeCurrentLoadAttempt);
            window.onunload = this._onWindowUnload.bind(this);
            window.onresize = this._onWindowResize.bind(this);
            window.onerror = this._onWindowError.bind(this);
        },
        
        onRender: function () {
            this.spinnerRegion.show(new SpinnerView());
            this._checkPlayerLoading();
            
            Streamus.channels.foregroundArea.vent.trigger('rendered');
        },

        //  Announce the jQuery target of element clicked so multi-select collections can decide if they should de-select their child views
        _onClick: function (event) {
            Streamus.channels.element.vent.trigger('click', event);
        },

        _onContextMenu: function (event) {
            Streamus.channels.element.vent.trigger('contextMenu', event);
        },

        _onMouseDown: function () {
            Streamus.channels.element.vent.trigger('mouseDown', event);
        },

        _onClickReloadLink: function () {
            chrome.runtime.reload();
        },
        
        _onWindowResize: function () {
            Streamus.channels.window.vent.trigger('resize', {
                height: this.$el.height(),
                width: this.$el.width()
            });
        },

        //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
        _onWindowUnload: function () {
            Streamus.channels.foreground.vent.trigger('beginUnload');
            Streamus.backgroundChannels.foreground.vent.trigger('beginUnload');
            this.destroy();
            Streamus.channels.foreground.vent.trigger('endUnload');
            Streamus.backgroundChannels.foreground.vent.trigger('endUnload');
        },

        _onWindowError: function (message, url, lineNumber, columnNumber, error) {
            Streamus.backgroundChannels.error.vent.trigger('windowError', message, url, lineNumber, columnNumber, error);
        },

        _onPlayerChangeLoading: function (model, loading) {
            if (loading) {
                this._startLoading();
            } else {
                this._stopLoading();
            }
        },

        _onPlayerChangeCurrentLoadAttempt: function () {
            this.ui.loadAttemptMessage.text(this._getLoadAttemptMessage());
        },
        
        _startLoading: function () {
            this.$el.addClass('is-showingSpinner');
            this.ui.loadingFailedMessage.addClass('is-hidden');
            this.ui.loadingMessage.removeClass('is-hidden');
        },
        
        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        _stopLoading: function () {
            this.ui.loadingMessage.addClass('is-hidden');

            if (this.player.get('ready')) {
                this.$el.removeClass('is-showingSpinner');
                this.ui.loadingFailedMessage.addClass('is-hidden');
            } else {
                this.ui.loadingFailedMessage.removeClass('is-hidden');
            }
        },

        _checkPlayerLoading: function () {
            if (this.player.get('loading')) {
                this._startLoading();
            }
        },
        
        _getLoadAttemptMessage: function() {
            return chrome.i18n.getMessage('loadAttempt', [this.player.get('currentLoadAttempt'), this.player.get('maxLoadAttempts')]);
        }
    });

    return ForegroundAreaView;
});