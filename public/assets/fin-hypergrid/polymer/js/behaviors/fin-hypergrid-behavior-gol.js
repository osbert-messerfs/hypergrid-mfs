/*jshint  bitwise: false */
'use strict';

(function() {

    var noop = function() {};

    var patterns = [
        [
            [false, true, true, true, false],
            [true, false, true, false, true],
            [false, false, true, false, false]
        ],
        [
            [false, true, false],
            [true, false, false],
            [true, true, true]
        ]
    ];
    var colors = ['#ffffff', '#ffffff', '#efefef', '#00e7e7', '#00dfdf', '#00d7d7', '#00cfcf', '#00c7c7'];

    Polymer({ /* jslint ignore:line */

        rows: 45,
        columns: 75,
        data: [],
        buffer: [],
        running: false,

        ready: function() {
            this.readyInit();
            this.rows = this.getAttribute('rows') || this.rows;
            this.columns = this.getAttribute('columns') || this.columns;
            this.resetPetriDish();
            this.running = false;
        },

        createCellProvider: function() {
            var provider = document.createElement('fin-hypergrid-cell-provider');
            provider.cellCache.simpleCellRenderer.paint = function(gc, x, y, width, height) {
                var weight = this.config.value[1];
                if (weight === 0) {
                    return;
                }
                var color = colors[weight];
                if (this.config.value[0]) {
                    color = this.config.fgColor;
                }

                gc.fillStyle = color;
                gc.fillRect(x, y, width, height);
            };
            return provider;
        },

        resetPetriDish: function() {
            this.data = [];
            this.buffer = [];
            this.initializeData(this.data);
            this.initializeData(this.buffer);
            this.populate();
            this.changed();
        },

        populate: function() {
            var x = 0;
            var y = 0;
            for (var i = 0; i < 15; i++) {
                y = Math.round(Math.random() * this.rows * 0.60);
                x = Math.round(Math.random() * this.columns * 0.60);
                this.applyPatternAt(this.data, x, y, patterns[i % 2], i % 4);
            }
        },

        initializeData: function(array2D) {
            for (var c = 0; c < this.columns; c++) {
                var col = [];
                array2D.push(col);
                for (var r = 0; r < this.rows; r++) {
                    col.push([false, 0]);
                }
            }
        },

        toggleRunning: function() {
            this.running = !this.running;
            if (this.running) {
                this.startLife();
            }
        },

        startLife: function() {
            if (!this.running) {
                return;
            }
            for (var c = 1; c < this.columns - 2; c++) {
                for (var r = 1; r < this.rows - 2; r++) {
                    this.computeLifeAt(c, r);
                }
            }
            var temp = this.buffer;
            this.buffer = this.data;
            this.data = temp;
            this.changed();
            setTimeout(this.startLife.bind(this), 125);
        },

        computeLifeAt: function(x, y) {
            var me = this._getValue(x, y);
            var total = this.getNeighborCount(x, y);
            me[1] = total;
            if (me[0]) {
                // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
                // Any live cell with two or three live neighbours lives on to the next generation.
                // Any live cell with more than three live neighbours dies, as if by overcrowding.
                if (total < 2) {
                    this.buffer[x][y] = [false, 0];
                } else if (total < 4) {
                    this.buffer[x][y] = [true, 1];
                } else {
                    this.buffer[x][y] = [false, 0];
                }
            } else {
                // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                this.buffer[x][y] = [(total === 3), total];
            }

        },

        getNeighborCount: function(x, y) {
            var data = this.data;
            var total = 0;
            if (data[x - 1][y - 1][0]) {
                total++;
            }
            if (data[x - 1][y][0]) {
                total++;
            }
            if (data[x - 1][y + 1][0]) {
                total++;
            }

            if (data[x][y - 1][0]) {
                total++;
            }
            if (data[x][y + 1][0]) {
                total++;
            }

            if (data[x + 1][y - 1][0]) {
                total++;
            }
            if (data[x + 1][y][0]) {
                total++;
            }
            if (data[x + 1][y + 1][0]) {
                total++;
            }

            return total;
        },


        _getNeighborCount: function(x, y) {
            var data = this.data;
            var sum = this.count3(data[x - 1], y) + this.count2(data[x], y) + this.count3(data[x + 1], y);
            return sum;
        },

        count3: function(row, offset) {
            var sum = 0;
            for (var i = offset - 1; i <= offset + 1; i++) {

                if (row[i][0]) {
                    sum++;

                }
            }
            return sum;
        },

        count2: function(row, offset) {
            var sum = 0;
            for (var i = offset - 1; i <= offset + 1; i++) {

                if ((i !== offset) && row[i][0]) {
                    sum++;

                }
            }
            return sum;
        },

        getValue: function(x, y) {
            return this.data[x][y];
        },

        setValue: function(x, y, value) {
            this.data[x][y] = value;
        },

        getFixedColumnValue: function(x, y) {
            return y;
        },

        getFixedRowValue: function(x, y) {
            noop(x, y);
            return '';
        },

        getFixedColumnCount: function() {
            return 0;
        },
        getFixedRowCount: function() {
            return 0;
        },

        getColumnCount: function() {
            return this.data.length;
        },

        getRowCount: function() {
            return this.data[0].length;
        },

        getRowHeight: function(y) {
            noop(y);
            return 10;
        },

        getColumnWidth: function(x) {
            noop(x);
            return 10;
        },

        getNextState: function() {
            if (this.running) {
                return 'pause';
            } else {
                return 'play';
            }
        },

        onTap: function(grid, mouse) {

            var mX = this.scrollPositionX + mouse.gridCell.x;
            var mY = this.scrollPositionY + mouse.gridCell.y;

            var v = this._getValue(mX, mY)[0];
            this._setValue(mX, mY, [!v, 1]);
            this.changed();
        },

        applyPatternAt: function(array, c, r, pattern, dir) {
            var w = pattern.length;
            var h = pattern[0].length;
            var x = 0;
            var y = 0;
            if (dir === 0) {
                for (x = 0; x < w; x++) {
                    for (y = 0; y < h; y++) {
                        array[x + c][y + r] = [pattern[w - x - 1][y], 1];
                    }
                }
            } else if (dir === 1) {
                for (x = 0; x < w; x++) {
                    for (y = 0; y < h; y++) {
                        array[x + c][y + r] = [pattern[x][y], 1];
                    }
                }
            } else if (dir === 2) {
                for (x = 0; x < w; x++) {
                    for (y = 0; y < h; y++) {
                        array[y + c][x + r] = [pattern[x][y], 1];
                    }
                }
            } else {
                for (x = 0; x < w; x++) {
                    for (y = 0; y < h; y++) {
                        array[y + c][x + r] = [pattern[w - x - 1][y], 1];
                    }
                }
            }
        }

    });

})(); /* jslint ignore:line */
