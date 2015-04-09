'use strict';

(function() {
    var alphaFor = function(i) {
        // Name the column headers in A, .., AA, AB, AC, .., AZ format
        // quotient/remainder
        //var quo = Math.floor(col/27);
        var quo = Math.floor((i) / 26);
        var rem = (i) % 26;
        var code = '';
        if (quo > 0) {
            code += String.fromCharCode('A'.charCodeAt(0) + quo - 1);
        }
        code += String.fromCharCode('A'.charCodeAt(0) + rem);
        return code;
    };
    //var noop = function() {};
    var a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    Polymer({ /* jslint ignore:line */
        data: [],
        headers: [],
        fields: [],

        ready: function() {
            this.readyInit();
            // Get data from upper element 
            var rawData = angular.element(this).parent().scope().$eval('data');
            this.setData(rawData);
            this.tableState.sorted = [];
            this.sortStates = [' ', ' \u2191', ' \u2193'];
        },

        isValidIdentifer: function(string) {
            return 0 === (string + '').search(validIdentifierMatch);
        },

        setHeaders: function(headerLabels) {
            this.headers = headerLabels;
        },

        getHeaders: function() {
            if (this.headers.length === 0) {
                this.setHeaders(this.getDefaultHeaders());
            }
            return this.headers;
        },
        getHeader: function(x /*, y*/ ) {
            return this.headers[x];
        },
        getDefaultHeaders: function() {
            var self = this;
            var fields = this.getFields();
            if (fields.length === 0) {
                return [];
            }
            var headers = fields.map(function(e) {
                return self.headerify(e);
            });
            return headers;
        },

        headerify: function(string) {
            var pieces = string.replace(/[_-]/g, ' ').replace(/[A-Z]/g, ' $&').split(' ').map(function(s) {
                return s.charAt(0).toUpperCase() + s.slice(1);
            });
            return pieces.join(' ');
        },

        setFields: function(fieldNames) {
            this.fields = fieldNames;
        },

        getFields: function() {
            if (this.fields.length === 0) {
                this.setFields(this.getDefaultFields());
            }
            return this.fields;
        },

        getDefaultFields: function() {
            if (this.data && this.data.length === 0) {
                return [];
            }
            var fields = Object.getOwnPropertyNames(this.data[0]).filter(function(e) {
                return e.substr(0, 2) !== '__';
            });
            return fields;
        },

        setData: function(jsonData) {
            this.data = jsonData;
            this.initDataIndexes();
            this.initColumnIndexes();
            this.changed();
        },

        getData: function() {
            return this.data;
        },

        setColumns: function(columnDefinitions) {
            var fields = new Array(columnDefinitions.length);
            var headers = new Array(columnDefinitions.length);
            for (var i = 0; i < columnDefinitions.length; i++) {
                var each = columnDefinitions[i];
                fields[i] = each.field;
                headers[i] = each.title;
            }
            this.setFields(fields);
            this.setHeaders(headers);
        },

        initDataIndexes: function() {
            //initialize the indexe cache
            for (var i = 0; i < this.data.length; i++) {
                this.data[i].__si = i;
                this.data[i].__i = i;
            }
        },

        getValue: function(x, y) {
            var fields = this.getFields();
            return this.data[y][fields[x]];
        },

        setValue: function(x, y, value) {
            var fields = this.getFields();
            this.data[y][fields[x]] = value;
        },

        getFixedRowValue: function(x, y) {
            var headers = this.getHeaders();
            noop(y);
            var sortIndex = this.tableState.sorted[x] || 0;
            return headers[x] + this.sortStates[sortIndex];
        },

        getFixedColumnCount: function() {
            return 1;
        },

        getRowCount: function() {
            return this.data.length;
        },

        getColumnCount: function() {
            var fields = this.getFields();
            return fields.length - this.tableState.hiddenColumns.length;
        },

        setState: function(state) {
            this.tableState = state;
            this.applySorts();
            this.changed();
        },

        applySorts: function() {
            var state = this.getState();
            var sorts = state.sorted;
            var colIndexes = state.columnIndexes;
            if (!sorts) {
                return;
            }
            //remove any sorts
            var newData = new Array(this.data.length);
            var i;
            for (i = 0; i < this.data.length; i++) {
                var each = this.data[i];
                newData[each.__si] = each;
            }
            this.data = newData;

            //apply the sort
            for (i = 0; i < sorts.length; i++) {
                if (sorts[i] > 0) {
                    var actualCol = i;
                    for (i = 0; i < colIndexes.length; i++) {
                        if (colIndexes[i] === actualCol) {
                            this.toggleSort(i, 0);
                            if (sorts[i] === 2) {
                                this.data.reverse();
                            }
                            return;
                        }
                    }
                }
            }
        },

        toggleSort: function(columnIndex, incrementIt) {
            if (incrementIt === undefined) {
                incrementIt = 1;
            }
            this.grid.clearSelections();
            var fields = this.getFields();
            if (columnIndex >= fields.length) {
                return;
            }
            var current = this.tableState.sorted[columnIndex] || 0;
            var stateCount = this.sortStates.length;
            var sortStateIndex = (current + incrementIt) % stateCount;
            var i = 0;
            for (; i < fields.length; i++) {
                this.tableState.sorted[i] = 0;
            }
            this.tableState.sorted[columnIndex] = sortStateIndex;
            var colName = fields[columnIndex];
            if (sortStateIndex === 0) {
                var newData = new Array(this.data.length);
                for (i = 0; i < this.data.length; i++) {
                    var each = this.data[i];
                    newData[each.__si] = each;
                }
                this.data = newData;
            } else if (sortStateIndex === 1) {
                //var start = Date.now();
                // uncomment this to use javascript native sorting
                // this is also a stable sort

                if (this.isValidIdentifer(colName)) {
                    var theSorter = eval('(function (a, b) {' + /* jshint ignore:line  */
                        '  if (a.' + colName + ' === b.' + colName + ')' +
                        '    return a.__i - b.__i;' +
                        '  if (a.' + colName + ' < b.' + colName + ')' +
                        '    return -1;' +
                        '  return 1;' +
                        '})');
                    this.data.sort(theSorter);
                } else {
                    this.data.sort(function(a, b) {
                        if (a[colName] === b[colName]) {
                            return a.__i - b.__i;
                        }
                        if (a[colName] < b[colName]) {
                            return -1;
                        }
                        return 1;
                    });
                }
            } else {
                this.data = this.data.reverse();
            }
            for (i = 0; i < this.data.length; i++) {
                this.data[i].__i = i;
            }
            this.changed();
        }
    });

})(); /* jslint ignore:line */
