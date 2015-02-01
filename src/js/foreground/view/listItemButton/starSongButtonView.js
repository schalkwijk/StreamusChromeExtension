define([
    'foreground/view/listItemButton/ListItemButtonView',
    'text!template/listItemButton/starListItemButton.html'
], function(ListItemButtonView, StarListItemButtonTemplate) {
    'use strict';

    var StarSongButtonView = ListItemButtonView.extend({
        template: _.template(StarListItemButtonTemplate),

        initialize: function() {
            this.playlists = Streamus.backgroundPage.signInManager.get('signedInUser').get('playlists');
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        doOnClickAction: function() {
          var starredPlaylist = this.playlists.findWhere({ title: "Starred" });
          if (!starredPlaylist) {
            starredPlaylist = this.playlists.addPlaylistWithSongs("Starred", this.model.get("song"));
          } else {
            starredPlaylist.get('items').addSongs([this.model.get("song")]);
          }
        }
    });

    return StarSongButtonView;
})
