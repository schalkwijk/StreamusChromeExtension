define(function () {
    'use strict';

    var TitleArea = Backbone.Model.extend({
        initialize: function () {
          this.set("title", this.get("song").get("title"));
        }
    });

    return TitleArea;
});
