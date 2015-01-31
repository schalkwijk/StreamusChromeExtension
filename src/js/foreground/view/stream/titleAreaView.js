define(function(require) {
    'use strict';

    var ListItemView = require('foreground/view/listItemView');
    var StarSongButtonView = require('foreground/view/listItemButton/starSongButtonView');
    var TitleAreaTemplate = require('text!template/stream/titleArea.html');

    var TitleAreaView = ListItemView.extend({
        id: 'titleArea',
        className: ListItemView.prototype.className + ' title-area listItem--tiny listItem--hasButtons listItem--selectable',
        template: _.template(TitleAreaTemplate),

        buttonViews: [StarSongButtonView],

        showContextMenu: function() {
        }
    });

    return TitleAreaView;
});
