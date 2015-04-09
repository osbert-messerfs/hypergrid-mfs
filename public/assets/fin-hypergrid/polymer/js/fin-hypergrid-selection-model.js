'use strict';

(function() {

    //We represent selections as a list of rectangles because large areas can be represented and tested against quickly with a minimal amount of memory usage. Also we need to maintain the selection rectangles flattened counter parts so we can test for single dimension contains.  This is how we know to highlight the fixed regions on the edges of the grid.

    Polymer({ /* jslint ignore:line */
        ready: function() {

            this.rectangles = document.createElement('fin-rectangle');
            this.selections = [];
            this.flattenedX = [];
            this.flattenedY = [];
        },
        getGrid: function() {
            return null;
        },
        //select a rectangle
        select: function(ox, oy, ex, ey) {

            var newSelection = this.rectangles.rectangle.create(ox, oy, ex, ey);
            this.selections.push(newSelection);
            this.flattenedX.push(newSelection.flattenXAt(0));
            this.flattenedY.push(newSelection.flattenYAt(0));
        },

        //remove the last selection that was created
        clearMostRecentSelection: function() {
            this.selections.length = Math.max(0, this.selections.length - 1);
            this.flattenedX.length = Math.max(0, this.flattenedX.length - 1);
            this.flattenedY.length = Math.max(0, this.flattenedY.length - 1);
        },

        getSelections: function() {
            return this.selections;
        },

        hasSelections: function() {
            return this.selections.length !== 0;
        },

        //answer if a point is selected
        isSelected: function(x, y) {
            return this._isSelected(this.selections, x, y);
        },

        //answer if we have a selection covering a specific column
        isFixedRowCellSelected: function(col) {
            return this._isSelected(this.flattenedY, col, 0);
        },

        //answer if we have a selection covering a specific row
        isFixedColumnCellSelected: function(row) {
            return this._isSelected(this.flattenedX, 0, row);
        },

        //general selection query function
        _isSelected: function(selections, x, y) {
            for (var i = 0; i < selections.length; i++) {
                var each = selections[i];
                if (this.rectangles.rectangle.contains(each, x, y)) {
                    return true;
                }
            }
            return false;
        },

        //empty out all our state
        clear: function() {
            this.selections.length = 0;
            this.flattenedX.length = 0;
            this.flattenedY.length = 0;
        }

    });

})(); /* jslint ignore:line */
