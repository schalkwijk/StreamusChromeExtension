define([
    'foreground/view/listItemButton/ListItemButtonView',
    'text!template/listItemButton/starListItemButton.html'
], function(ListItemButtonView, StarListItemButtonTemplate) {
    'use strict';

    var StarSongButtonView = ListItemButtonView.extend({
        template: _.template(StarListItemButtonTemplate),

        doOnClickAction: function() {
        }
    });

    return StarSongButtonView;
})
