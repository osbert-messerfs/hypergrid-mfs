'use strict';

(function() {

    Polymer({ /* jshint ignore:line */
        alias: 'readonly',

        beginEditAt: function(point) {
            noop(point);
            return;
        },

        readyInit: function() {
        },

        getEditorValue: function() {
        },

        setEditorValue: function(value) {
        },

        showEditor: function() {
        },

        hideEditor: function() {
        },

        takeFocus: function() {
        },

        selectAll: function() {

        },

        originOffset: function() {
            return [-2, -2];
        },

        setBounds: function(cellBounds) {
        }

    });

})(); /* jshint ignore:line */
