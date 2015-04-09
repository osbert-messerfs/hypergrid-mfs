'use strict';

(function() {

    var noop = function() {};

    Polymer({ /* jshint ignore:line */

        isEditing: false,
        editorPoint: null,
        checkEditorPositionFlag: false,
        input: null,
        alias: 'base',
        grid: null,

        //Currently the only CellEditor is an input field.  The structure is in place for handling the CellEditor during focus change and grid scrolling.
        //TODO:Generalize the cell editing functionality to delegate through the behvior objects and then through the cell editors.  Add more general CellEditor types/drop down/button/calendar/spinner/etc...
        ready: function() {
            this.readyInit();
        },

        readyInit: function() {

        },

        getBehavior: function() {
            return this.grid.getBehavior();
        },

        gridRenderedNotification: function() {
            this.checkEditor();
        },

        scrollValueChangedNotification: function() {
            this.setCheckEditorPositionFlag();
        },

        setCheckEditorPositionFlag: function() {
            this.checkEditorPositionFlag = true;
        },

        beginEditAt: function(point) {
            this.setEditorPoint(point);
            var model = this.getBehavior();
            var value = model._getValue(point.x, point.y);
            this.setEditorValue(value);
            this.isEditing = true;
            this.setCheckEditorPositionFlag();
            this.checkEditor();
        },

        setEditorValue: function(value) {
            noop(value);
        },

        getEditorPoint: function() {
            return this.editorPoint;
        },

        setEditorPoint: function(point) {
            this.editorPoint = point;
        },

        showEditor: function() {},

        hideEditor: function() {},

        stopEditing: function() {
            if (!this.isEditing) {
                return;
            }
            this.saveEditorValue();
            this.isEditing = false;
            this.hideEditor();
        },

        saveEditorValue: function() {
            var point = this.getEditorPoint();
            var value = this.getEditorValue();
            this.getBehavior()._setValue(point.x, point.y, value);
        },

        getEditorValue: function() {

        },

        takeFocus: function() {

        },

        moveEditor: function() {
            var model = this.getBehavior();
            var numFixedColumns = model.getFixedColumnCount();
            var numFixedRows = model.getFixedRowCount();
            var vScroll = this.grid.getVScrollValue();
            var hScroll = this.grid.getHScrollValue();
            var editorPoint = this.getEditorPoint();
            var x = editorPoint.x + numFixedColumns - hScroll;
            var y = editorPoint.y + numFixedRows - vScroll;
            var eb = this.grid.getBoundsOfCell(this.rectangles.point.create(x, y));
            var db = this.grid.getDataBounds();
            var cellBounds = eb.intersect(db);
            this.setBounds(cellBounds);
            this.takeFocus();
        },

        setBounds: function(rectangle) {
            noop(rectangle);
        },

        checkEditor: function() {
            if (!this.checkEditorPositionFlag) {
                return;
            } else {
                this.checkEditorPositionFlag = false;
            }
            if (!this.isEditing) {
                return;
            }
            var editorPoint = this.getEditorPoint();
            if (this.grid.isDataVisible(editorPoint.x, editorPoint.y)) {
                this.moveEditor();
                this.showEditor();
            } else {
                this.hideEditor();
            }
        }

    });

})(); /* jshint ignore:line */
