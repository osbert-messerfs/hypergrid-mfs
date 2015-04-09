/*jshint  bitwise: false */
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

    //helper function for randomizing data
    function rnd(max) {
        return Math.floor(Math.random() * max);
    }

    //helper data for efficient randomization of the data under the sparkline/bar charts
    var barRandomOffsets = [];
    for (var i = 0; i < 20; i++) {
        barRandomOffsets.push([]);
        for (var r = 0; r < 10; r++) {
            barRandomOffsets[i].push(10 - rnd(20));
        }
    }

    //This is a very rough in memory data source example.  InMemoryGridBehavior is a more traditional gridmodel
    //where all data and its analytics, sorting, aggregation happen in the same process.
    //<br>much of this is loosely based on emerson's original grid POC
    //<br>TODO:needs alot of work/bug-fixing/feature completion/tests/cleanup/commenting here...

    Polymer({ /* jslint ignore:line */

        ready: function() {

            this.rows = 5000;
            this.columns = 100;

            //milliseconds pause inbetween sweeps of random updates
            this.readyInit();
            this.tableState.columnWidths = [50, 150, 80, 90, 80, 150, 100, 80, 80, 100];
            this.tableState.fixedColumnWidths = [120];
            this.tableState.sorts = [];
            this.tableState.sortLookup = {};
            this.tableState.sorted = {};
            this.sortStates = [' -', ' ^', ' v'];

            this.permuteInterval = 250;
            this.values = new Array(this.rows * this.columns);
            this.order = [];

            this.createSort(0, 2);
            this.createSort(0, 14);
            this.createSort(0, 22);
            this.initOrder();
            this.initialize();
            this.permute();
            this.reorder();
        },

        //default to left halign for rendering performance improvement
        //<br>and make columns 3, 23, 41 use special cell renderers
        createCellProvider: function() {
            //var self = this;
            var provider = document.createElement('fin-hypergrid-cell-provider');
            provider.getCell = function(config) {
                var renderer = provider.cellCache.simpleCellRenderer;
                config.halign = 'left';
                var x = config.x;
                if (x === 41) {
                    renderer = provider.cellCache.sliderCellRenderer;
                } else if (x === 23) {
                    renderer = provider.cellCache.sparkbarCellRenderer;
                } else if (x === 3) {
                    renderer = provider.cellCache.sparklineCellRenderer;
                } else if (x === 2) {
                    var hex = Math.floor(Math.max(config.value, 30) * 255 / 100).toString(16);
                    if (hex.length < 1) {
                        hex = '0' + hex;
                    }
                    var bgColor = '#' + '00' + hex + '00';
                    config.bgColor = bgColor;
                }
                renderer.config = config;
                return renderer;
            };
            return provider;
        },

        setValues: function(c) {
            var self = this;
            for (var x = c.xstart; x < c.xstop; x = x + c.xinc) {
                for (var y = c.ystart; y < c.ystop; y = y + c.yinc) {
                    this.setRandomValue(x, y, c.cutoff);
                }
            }
            self.changed();
        },

        //fill in random data
        initialize: function() {
            var config = {
                xstart: 0,
                xstop: this._getColumnCount(),
                xinc: 1,
                ystart: 0,
                ystop: this.getRowCount(),
                yinc: 1,
                cutoff: 2
            };
            this.setValues(config);
        },

        //kick off randomizing data every 200ms,
        //<br>simulate data streaming in...
        permute: function() {
            var self = this;
            var config = {
                xstart: this.scrollPositionX,
                xstop: this.scrollPositionX + this.renderedWidth,
                xinc: 1,
                ystart: this.scrollPositionY,
                ystop: this.scrollPositionY + this.renderedHeight,
                yinc: 1,
                cutoff: 0.05
            };
            this.setValues(config);
            setTimeout(function() {
                self.permute();
            }, self.permuteInterval);
        },

        getCellEditorAt: function(x, y) {
            var type = x !== 9 ? 'textfield' : this.editorTypes[y % this.editorTypes.length];
            var cellEditor = this.grid.resolveCellEditor(type);
            return cellEditor;
        },

        getColumnCount: function() {
            return this.columns;
        },

        //set a random value into col/row, cutoff is the threshold to exit if the random value is outside
        setRandomValue: function(col, row, cutoff) {
            var rand = Math.random();
            var val = this.getValue(col, row);
            var rndV;
            if (rand > cutoff) {
                return;
            }
            if (col === 13) {
                val = rand < 0.1 ? true : false;
                this.setValue(col, row, val);
            } else if (col === 23) {
                if (!val) {
                    val = [rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100)];
                } else {
                    rndV = Math.floor(60 * rand);
                    if (rndV > 19) {
                        return;
                    }
                    var rndOffsets = barRandomOffsets[rndV];
                    for (var i = 0; i < rndOffsets.length; i++) {
                        val[i] = Math.min(Math.max(0, val[i] + rndOffsets[i]), 100);
                    }
                }
                this.setValue(col, row, val);
            } else if (col === 3) {
                if (!val) {
                    val = [rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100), rnd(100)];
                } else {
                    rndV = Math.floor(8000 * rand);
                    if (rndV > 99) {
                        return;
                    }
                    if (val.shift) {
                        val.shift();
                        val.push(rndV);
                    }
                }
                this.setValue(col, row, val);
            } else if (col % 10 === 0) {
                val = [rand < 0.1 ? false : true, 1.0];
                this.setValue(col, row, val);
            } else if (col === 9) {
                if (val) {
                    return; // only set this onece
                }
                var hex = row.toString(16).toUpperCase();
                while (hex.length < 6) {
                    hex = '0' + hex;
                }
                val = '0x' + hex;
                this.setValue(col, row, val);
            } else if (col % 6 === 0) {
                if (val) {
                    return; // only set this onece
                }
                var profound = 'Quidquid latine dictum sit, altum sonatur.';
                this.setValue(col, row, profound);
            } else if (col % 4 === 0) {
                var ipsum = 'Lorem ipsum dolor sit amet, malis repudiare mei in. Cu munere expetendis mea, affert aliquid definiebas at nam. Te scripta delectus singulis mel, et vidit error legere eum, ea latine feugait ponderum vix. Ius ei electram patrioque, et eum propriae deseruisse necessitatibus. Epicurei adipisci ex duo. Quidam iudicabit ullamcorper ex vel, per quot ipsum ad, libris quaeque iudicabit et usu. Ut postea nominavi cum, id eius porro mundi qui. Nec ex altera dolorum definiebas, consul viderer ex est. ';
                var index = Math.max(0, (rand * ipsum.length) - 20);
                val = ipsum.slice(index, index + 20).toUpperCase();
                this.setValue(col, row, val);
            } else if (col === 2 || col === 14 || col === 22) {
                var v = Math.min(Math.floor(rand * 2000), 100);
                this.setValue(col, row, Math.max(v));
            } else if (col === 41) {
                this.setValue(col, row, Math.random());
            } else {
                this.setValue(col, row, rand);
            }
        },

        //int vector indirection layer so sorting doesn't actually move items around
        indexOf: function(row, col) {
            var index = (col * this.rows) + row;
            return index;
        },

        //create a sort object per column we consider sortable
        //TODO:rethink sorting encapsulation
        createSort: function(type, col) {
            var self = this;
            var that = {};
            that.type = type;
            that.col = col;
            that.value = function(array, index) {
                return array[self.indexOf(self.order[index], col)];
            };

            that.compare = function(array, first, last) {

                var x = that.value(array, first),
                    y = that.value(array, last);
                if (typeof(x) === 'number') {
                    // Numbers are compared by subtraction
                    if (that.type === 1) {
                        if (!y) {
                            return -1;
                        }
                        return x - y;
                    } else {
                        if (!y) {
                            return 1;
                        }
                        return y - x;
                    }
                } else {
                    // Anything not a number gets compared using the relational operators
                    if (that.type === 1) {
                        if (!y) {
                            return -1;
                        }
                        return x < y ? -1 : 1;
                    } else {
                        if (!y) {
                            return 1;
                        }
                        return y < x ? -1 : 1;
                    }
                }
                return 0;
            };
            this.tableState.sorts.push(that);
            this.tableState.sortLookup[col] = that;
        },

        swap: function(array, x, y) {
            var tmp = this.order[x];
            this.order[x] = this.order[y];
            this.order[y] = tmp;
        },

        compare: function(array, first, last) {
            var comp = 0;
            for (var i = 0; i < this.tableState.sorts.length; ++i) {
                var sort = this.tableState.sorts[i];
                if (sort.type !== 0) {
                    comp = sort.compare(array, first, last);
                    if (comp === 0) {
                        continue;
                    }
                    break;
                }
            }
            return comp;
        },

        //initialize int vector indirection to ascending integers 0 through row count
        initOrder: function() {
            this.order = [];
            // Re-initialise the row order, as this is what we sort, not the actual data.
            for (var i = 0; i < this.rows; ++i) {
                this.order[i] = i;
            }
        },

        //emersons stable quicksort algorithm, hacked up by me
        //<br>TODO: this needs serious attention, could be exposed as part of a bowerized sorting lib
        quicksort: function(array, first, last, depth) {
            // In place quickstort, stable.  We cant use the inbuilt Array.tableState.sort() since its a hybrid sort
            // potentially and may not be stable (non quicksort) on small sizes.
            if (depth > 1000) {
                console.log('sort aborted!');
                return;
            }
            var pivot = 0;
            if (depth === 0) {
                // Is there something to sort ??
                if (this.tableState.sorts.length <= 0) {
                    return;
                }
                // Optimise for null trailing nulls.
                var sort = this.tableState.sorts[0];
                while (!sort.value(array, last) && last > first) {
                    --last;
                }
                // Test for worst case already sorted list...
                var sorted = true;
                for (pivot = first; pivot < last; ++pivot) {
                    if (this.compare(array, pivot, pivot + 1) > 0) {
                        sorted = false;
                        break;
                    }
                }
                if (sorted) {
                    return;
                }
            }
            while (first < last) {
                var right = last;
                var left = first;
                pivot = (first + last) >> 1;
                if (pivot < 0 || pivot >= last) {
                    break;
                }
                while (right >= left) {
                    while (left <= right && this.compare(array, left, pivot) <= 0) {
                        ++left;
                    }
                    while (left <= right && this.compare(array, right, pivot) > 0) {
                        --right;
                    }
                    if (left > right) {
                        break;
                    }
                    this.swap(array, left, right);
                    if (pivot === right) {
                        pivot = left;
                    }
                    left++;
                    right--;
                }
                this.swap(array, pivot, right);
                right--;
                // Use recursion to sort the smallest partition, this increases performance.
                if (Math.abs(right - first) > Math.abs(last - left)) {
                    if (left < last) {
                        this.quicksort(array, left, last, depth + 1);
                    }
                    last = right;
                } else {
                    if (first < right) {
                        this.quicksort(array, first, right, depth + 1);
                    }
                    first = left;
                }
            }
        },

        //invoke the sorting
        reorder: function() {
            this.initOrder();
            this.quicksort(this.values, 0, this.rows - 1, 0);
        },

        //give me the indirect sorted index of the data I'm looking for
        orderOf: function(y) {
            // Provide indirection of indexing for row/col so that we can use sort and or alternate between
            // coloumn and row oriented sotrage.  For example to maximise performance we currently paint by
            // column then row, so it makes sense that the data is stored as column contiguous, but that could
            // be changed if filters or some other feature required it.  Also at the moment sorting is faster
            // if we can just copy a contigious section of the values array, and we sort on columns.
            var row = this.order[y];
            return row;
        },

        //set value through the sorted indirection
        setValue: function(col, y, value) {
            var row = this.orderOf(y);
            var index = this.indexOf(row, col);
            this.values[index] = value;
        },

        // get value through the sorted indirection
        getValue: function(col, y) {
            var row = this.orderOf(y);
            var index = this.indexOf(row, col);
            return this.values[index];
        },

        getRowCount: function() {
            return this.rows;
        },

        getFixedRowValue: function(x /*, y*/ ) {
            var sortIndicator = '';
            if (this.tableState.sortLookup[x] && !this.tableState.sorted[x]) {
                this.tableState.sorted[x] = 0;
                sortIndicator = this.sortStates[this.tableState.sorted[x]];
            }
            if (this.tableState.sorted[x]) {
                sortIndicator = this.sortStates[this.tableState.sorted[x]];
            }
            return alphaFor(x) + sortIndicator;
        },

        //columns 2, 14, 22 are sortable
        fixedRowClicked: function(grid, mouse) {
            if ([2, 14, 22].indexOf(mouse.gridCell.x) === -1) {
                return;
            }
            this.toggleSort(mouse.gridCell.x);
        },

        toggleSort: function(columnIndex) {
            var current = this.tableState.sorted[columnIndex];
            var stateCount = this.sortStates.length;
            var sortStateIndex = (current + 1) % stateCount;
            this.tableState.sorted[columnIndex] = sortStateIndex;
            this.tableState.sortLookup[columnIndex].type = sortStateIndex;
            this.reorder();
            this.changed();
        }

    });

})(); /* jslint ignore:line */
