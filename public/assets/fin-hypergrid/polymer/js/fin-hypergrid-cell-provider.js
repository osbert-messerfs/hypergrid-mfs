'use strict';

var noop = function() {};

(function() {

    var underline = function(ctx, text, x, y, thickness) {
        var width = ctx.measureText(text).width;

        switch (ctx.textAlign) {
            case 'center':
                x -= (width / 2);
                break;
            case 'right':
                x -= width;
                break;
        }

        //ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.moveTo(x + 0.5, y + 0.5);
        ctx.lineTo(x + width + 0.5, y + 0.5);
    };
    //DefaultCellProvider is the cache for cell renderers.  A CellRenderer is an object with a single function 'paint'.
    //There should only be a single reused CellRenderer object created for each type of CellRenderer.

    //Custom CellRenderers can be attached to myCellProvider.cellCache and then referenced through the getCell function that is overridden in your implementation.  Make sure to attach the config argument to the cell renderer that is returne

    //override [createCellProvider](DefaultGridBehavior.html) creating an instance of thisobject.  Override members of this object per your specific needs.
    //see [QGridBehavior.createCellProvider](QGridBehavior.html) for an example of overriding createCellProvider.

    //emersons utility function for rendering a rounded corner rectangle
    //<br>TODO:this should be moved to a graphics rendering lib
    var roundRect = function(ctx, x, y, width, height, radius, fill, stroke) {
        if (!stroke) {
            stroke = true;
        }
        if (!radius) {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
        ctx.closePath();
    };


    Polymer({ /* jslint ignore:line */

        created: function() {
            this.cellCache = {};
            this.initializeCells();
        },

        //replace this function in on your instance of cellProvider
        getCell: function(config) {
            var cell = this.cellCache.simpleCellRenderer;
            cell.config = config;
            return cell;
        },

        //replace this function in on your instance of cellProvider
        getTopLeftCell: function(config) {
            var cell = this.cellCache.emptyCellRenderer;
            cell.config = config;
            return cell;
        },

        //return the cellRenderer instance for renderering fixed col cells
        getFixedColumnCell: function(config) {
            var cell = this.cellCache.simpleCellRenderer;
            cell.config = config;
            return cell;
        },

        //return the cellRenderer instance for renderering fixed row cells
        getFixedRowCell: function(config) {
            var cell = this.cellCache.simpleCellRenderer;
            cell.config = config;
            return cell;
        },
        //This is the default cell rendering function for rendering a vanilla cell. Great care was taken in crafting this function as it needs to perform extremely fast. Reads on the gc object are expensive but not quite as expensive as writes to it. We do our best to avoid writes, then avoid reads. Clipping bounds are not set here as this is also an expensive operation. Instead, we truncate overflowing text and content by filling a rectangle with background color column by column instead of cell by cell.  This column by column fill happens higher up on the stack in a calling function from OFGridRenderer.  Take note we do not do cell by cell border renderering as that is expensive.  Instead we render many fewer gridlines after all cells are rendered.
        defaultCellPaint: function(gc, x, y, width, height, isLink) {

            isLink = isLink || false;
            var colHEdgeOffset = this.config.properties.cellPadding,
                halignOffset = 0,
                valignOffset = this.config.voffset,
                halign = this.config.halign,
                isHovered = this.config.isHovered,
                size,
                textWidth;

            //setting gc properties are expensive, lets not do it unnecessarily

            var fontMetrics = this.config.getTextHeight(this.config.font);

            if (gc.font !== this.config.font) {
                gc.font = this.config.font;
            }
            if (gc.textAlign !== 'left') {
                gc.textAlign = 'left';
            }
            if (gc.textBaseline !== 'middle') {
                gc.textBaseline = 'middle';
            }

            //don't measure the text if we don't have to as it is very expensive
            if (halign === 'right') {
                size = gc.measureText(this.config.value);
                textWidth = size.width;
                halignOffset = width - colHEdgeOffset - textWidth;
            } else if (halign === 'center') {
                size = gc.measureText(this.config.value);
                textWidth = size.width;
                halignOffset = (width - textWidth) / 2;
            } else if (halign === 'left') {
                halignOffset = colHEdgeOffset;
            }

            halignOffset = Math.max(0, halignOffset);
            valignOffset = valignOffset + Math.ceil(height / 2);

            //fill background only if our bgColor is populated or we are a selected cell
            if (this.config.bgColor || this.config.isSelected) {
                gc.fillStyle = this.config.isSelected ? this.config.bgSelColor : this.config.bgColor;
                gc.fillRect(x, y, width, height);
            }

            //draw text
            var theColor = this.config.isSelected ? this.config.fgSelColor : this.config.fgColor;
            if (gc.fillStyle !== theColor) {
                gc.fillStyle = theColor;
            }
            gc.fillText(this.config.value, x + halignOffset, y + valignOffset);

            if (isHovered) {
                gc.beginPath();
                if (isLink) {
                    underline(gc, this.config.value, x + halignOffset, y + valignOffset + Math.floor(fontMetrics.height / 2), 1);
                } else {
                    gc.rect(x + 2, y + 2, width - 3, height - 3);
                }
                gc.stroke();
                gc.closePath();
            }
        },

        //emersons paint function for a slider button. currently the user cannot interact with it
        paintSlider: function(ctx, x, y, width, height) {
            ctx.strokeStyle = 'white';
            var val = this.config.value;
            var radius = height / 2;
            var offset = width * val;
            var bgColor = this.config.isSelected ? this.config.bgSelColor : '#333333';
            var btnGradient = ctx.createLinearGradient(x, y, x, y + height);
            btnGradient.addColorStop(0, bgColor);
            btnGradient.addColorStop(1, '#666666');
            var arcGradient = ctx.createLinearGradient(x, y, x, y + height);
            arcGradient.addColorStop(0, '#aaaaaa');
            arcGradient.addColorStop(1, '#777777');
            ctx.fillStyle = btnGradient;
            roundRect(ctx, x, y, width, height, radius, btnGradient);
            if (val < 1.0) {
                ctx.fillStyle = arcGradient;
            } else {
                ctx.fillStyle = '#eeeeee';
            }
            ctx.beginPath();
            ctx.arc(x + Math.max(offset - radius, radius), y + radius, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        },

        //simple implementation of a sparkline.  see [Edward Tufte sparkline](http://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0001OR)
        paintSparkbar: function(ctx, x, y, width, height) {
            ctx.beginPath();
            var val = this.config.value;
            if (!val || !val.length) {
                return;
            }
            var count = val.length;
            var eWidth = width / count;
            var fgColor = this.config.isSelected ? this.config.fgSelColor : this.config.fgColor;
            if (this.config.bgColor || this.config.isSelected) {
                ctx.fillStyle = this.config.isSelected ? this.config.bgSelColor : this.config.bgColor;
                ctx.fillRect(x, y, width, height);
            }
            ctx.fillStyle = fgColor;
            for (var i = 0; i < val.length; i++) {
                var barheight = val[i] / 110 * height;
                ctx.fillRect(x + 5, y + height - barheight, eWidth * 0.6666, barheight);
                x = x + eWidth;
            }
            ctx.closePath();

        },

        //simple implementation of a sparkline, because it's a barchart we've changed the name ;).  see [Edward Tufte sparkline](http://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0001OR)
        paintSparkline: function(ctx, x, y, width, height) {
            ctx.beginPath();
            var val = this.config.value;
            if (!val || !val.length) {
                return;
            }
            var count = val.length;
            var eWidth = width / count;

            var fgColor = this.config.isSelected ? this.config.fgSelColor : this.config.fgColor;
            if (this.config.bgColor || this.config.isSelected) {
                ctx.fillStyle = this.config.isSelected ? this.config.bgSelColor : this.config.bgColor;
                ctx.fillRect(x, y, width, height);
            }
            ctx.strokeStyle = fgColor;
            ctx.fillStyle = fgColor;
            ctx.beginPath();
            var prev;
            for (var i = 0; i < val.length; i++) {
                var barheight = val[i] / 110 * height;
                if (!prev) {
                    prev = barheight;
                }
                ctx.lineTo(x + 5, y + height - barheight);
                ctx.arc(x + 5, y + height - barheight, 1, 0, 2 * Math.PI, false);
                x = x + eWidth;
            }
            ctx.stroke();
            ctx.closePath();
        },

        //simple implementation of a tree cell
        treeCellRenderer: function(gc, x, y, width, height) {
            var val = this.config.value.data;
            var indent = this.config.value.indent;
            var icon = this.config.value.icon;

            //fill background only if our bgColor is populated or we are a selected cell
            if (this.config.bgColor || this.config.isSelected) {
                gc.fillStyle = this.config.isSelected ? this.config.bgSelColor : this.config.bgColor;
                gc.fillRect(x, y, width, height);
            }

            if (!val || !val.length) {
                return;
            }
            var valignOffset = Math.ceil(height / 2);

            gc.fillStyle = this.config.isSelected ? this.config.fgSelColor : this.config.fgColor;
            gc.fillText(icon + val, x + indent, y + valignOffset);

        },

        //do nothing
        emptyCellRenderer: function(gc, x, y, width, height) {
            noop(gc, x, y, width, height);
        },

        //default cellRenderers are initialized here.  you can augment the visible on your cellProvider instance: field ```myCellProviderInstance.cellCache.myCellRendererName = myCellRenderer```
        initializeCells: function() {
            var self = this;
            this.cellCache.simpleCellRenderer = {
                paint: this.defaultCellPaint
            };
            this.cellCache.sliderCellRenderer = {
                paint: this.paintSlider
            };
            this.cellCache.sparkbarCellRenderer = {
                paint: this.paintSparkbar
            };
            this.cellCache.sparklineCellRenderer = {
                paint: this.paintSparkline
            };
            this.cellCache.treeCellRenderer = {
                paint: this.treeCellRenderer
            };
            this.cellCache.emptyCellRenderer = {
                paint: this.emptyCellRenderer
            };
            this.cellCache.linkCellRenderer = {
                paint: function(gc, x, y, width, height) {
                    self.config = this.config;
                    self.defaultCellPaint(gc, x, y, width, height, true);
                },
            };
        },

    });
})(); /* jslint ignore:line */
