'use strict';
/* globals document, requestAnimationFrame, CustomEvent */

(function() {

    /**
     * charMap is a private property that maps keys strokes to key chars,
     *
     * @property charMap
     * @type Array
     */
    var canvases = [];
    var paintLoopFunction = function(now) {
        for (var i = 0; i < canvases.length; i++) {
            try {
                canvases[i](now);
            } catch (e) {}
        }
        requestAnimationFrame(paintLoopFunction);
    };
    requestAnimationFrame(paintLoopFunction);

    var charMap = [];
    var empty = ['', ''];
    for (var i = 0; i < 256; i++) {
        charMap[i] = empty;
    }

    charMap[27] = ['ESC', 'ESCSHIFT'];
    charMap[192] = ['`', '~'];
    charMap[49] = ['1', '!'];
    charMap[50] = ['2', '@'];
    charMap[51] = ['3', '#'];
    charMap[52] = ['4', '$'];
    charMap[53] = ['5', '%'];
    charMap[54] = ['6', '^'];
    charMap[55] = ['7', '&'];
    charMap[56] = ['8', '*'];
    charMap[57] = ['9', '('];
    charMap[48] = ['0', ')'];
    charMap[189] = ['-', '_'];
    charMap[187] = ['=', '+'];
    charMap[8] = ['DELETE', 'DELETESHIFT'];
    charMap[9] = ['TAB', 'TABSHIFT'];
    charMap[81] = ['q', 'Q'];
    charMap[87] = ['w', 'W'];
    charMap[69] = ['e', 'E'];
    charMap[82] = ['r', 'R'];
    charMap[84] = ['t', 'T'];
    charMap[89] = ['y', 'Y'];
    charMap[85] = ['u', 'U'];
    charMap[73] = ['i', 'I'];
    charMap[79] = ['o', 'O'];
    charMap[80] = ['p', 'P'];
    charMap[219] = ['[', '{'];
    charMap[221] = [']', '}'];
    charMap[220] = ['\\', '|'];
    charMap[220] = ['CAPSLOCK', 'CAPSLOCKSHIFT'];
    charMap[65] = ['a', 'A'];
    charMap[83] = ['s', 'S'];
    charMap[68] = ['d', 'D'];
    charMap[70] = ['f', 'F'];
    charMap[71] = ['g', 'G'];
    charMap[72] = ['h', 'H'];
    charMap[74] = ['j', 'J'];
    charMap[75] = ['k', 'K'];
    charMap[76] = ['l', 'L'];
    charMap[186] = [';', ':'];
    charMap[222] = ['\'', '|'];
    charMap[13] = ['RETURN', 'RETURNSHIFT'];
    charMap[16] = ['SHIFT', 'SHIFT'];
    charMap[90] = ['z', 'Z'];
    charMap[88] = ['x', 'X'];
    charMap[67] = ['c', 'C'];
    charMap[86] = ['v', 'V'];
    charMap[66] = ['b', 'B'];
    charMap[78] = ['n', 'N'];
    charMap[77] = ['m', 'M'];
    charMap[188] = [',', '<'];
    charMap[190] = ['.', '>'];
    charMap[191] = ['/', '?'];
    charMap[16] = ['SHIFT', 'SHIFT'];
    charMap[17] = ['CTRL', 'CTRLSHIFT'];
    charMap[18] = ['ALT', 'ALTSHIFT'];
    charMap[91] = ['COMMANDLEFT', 'COMMANDLEFTSHIFT'];
    charMap[32] = ['SPACE', 'SPACESHIFT'];
    charMap[93] = ['COMMANDRIGHT', 'COMMANDRIGHTSHIFT'];
    charMap[18] = ['ALT', 'ALTSHIFT'];
    charMap[38] = ['UP', 'UPSHIFT'];
    charMap[37] = ['LEFT', 'LEFTSHIFT'];
    charMap[40] = ['DOWN', 'DOWNSHIFT'];
    charMap[39] = ['RIGHT', 'RIGHTSHIFT'];

    charMap[33] = ['PAGEUP', 'PAGEUPSHIFT'];
    charMap[34] = ['PAGEDOWN', 'PAGEDOWNSHIFT'];
    charMap[35] = ['PAGERIGHT', 'PAGERIGHTSHIFT'];
    charMap[36] = ['PAGELEFT', 'PAGELEFTSHIFT'];

    Polymer('fin-canvas', { /* jshint ignore:line */
        /**                                                             .
         * g is the [fin-rectangle](http://stevewirts.github.io/fin-rectangle/components/fin-rectangle/) factory for creating instances of rectangle and point
         *
         * @property g
         * @type fin-rectangle polymer-element
         */
        g: null,

        /**                                                             .
         * canvas is the actual rendering surface that bit-blit to from the buffer
         *
         * @property canvas
         * @type HTMLCanvasElement
         */
        canvas: null,

        /**                                                             .
         * canvasCTX is the cached graphics context from canvas we bit blit to
         *
         * @property canvasCTX
         * @type 2DRenderingContext
         */
        canvasCTX: null,

        /**                                                             .
         * focuser is a button element that is used to simulate proper focus semantics
         *
         * @property focuser
         * @type HTMLButtonElement
         */
        focuser: null,

        /**                                                             .
         * buffer is the offscreen canvas component we draw to that will eventually be bit blit to canvas
         *
         * @property buffer
         * @type HTMLCanvasElement
         */
        buffer: null,

        /**                                                             .
         * ctx is the offscreen cached graphics context from buffer that we draw to
         *
         * @property ctx
         * @type 2DRenderingContext
         */
        ctx: null,

        /**                                                             .
         * fps is how many times a second we check the repaint flag for redrawing
         *
         * @property fps
         * @type Number
         */
        fps: null,

        /**                                                             .
         * mouseLocation is the current position of the mouse pointer
         *
         * @property mouseLocation
         * @type point
         */
        mouseLocation: null,

        /**                                                             .
         * holdPulseCount is the number of times we've been holdpulsed at the same location for this event
         *
         * @property holdPulseCount
         * @type point
         */
        holdPulseCount: -1,

        /**                                                             .
         * dragstart is the origin of a drag region for the selection
         *
         * @property dragstart
         * @type point
         */
        dragstart: null,

        /**                                                             .
         * origin location of the top right corner of the grid according to [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect)
         *
         * @property origin
         * @type point
         */
        origin: null,

        /**                                                             .
         * bounds is a private property that maps keys strokes to key chars,
         *
         * @property bounds
         * @type Array
         */
        bounds: null,

        /**                                                             .
         * repaintNow is a private property that maps keys strokes to key chars,
         *
         * @property repaintNow
         * @type Array
         */
        repaintNow: false,

        /**                                                             .
         * size is a private property that maps keys strokes to key chars,
         *
         * @property size
         * @type Array
         */
        size: null,

        /**                                                             .
         * mousedown is a private property that maps keys strokes to key chars,
         *
         * @property mousedown
         * @type Array
         */
        mousedown: false,

        /**                                                             .
         * dragging is true if we are currently dragging
         *
         * @property dragging
         * @type boolean
         */
        dragging: false,

        /**                                                             .
         * focused is true if we currently have input focus
         *
         * @property focused
         * @type boolean
         */
        focused: false,

        /**                                                             .
         * repeatKeyCount is how many times we've recieved a key down event from the user holding a key down
         *
         * @property repeatKeyCount
         * @type Number
         */
        repeatKeyCount: 0,

        /**                                                             .
         * repeatKey is the key that is currently being held down
         *
         * @property repeatKey
         * @type char
         */
        repeatKey: null,

        /**                                                             .
         * repeatKeyStartTime is the start time in milliseconds of the initial keydown event of a key that is being held down
         *
         * @property repeatKeyStartTime
         * @type Number
         */
        repeatKeyStartTime: 0,

        /**                                                             .
         * currentKeys is an array of the all the keys that are currently being pressed
         *
         * @property currentKeys
         * @type Array
         */
        currentKeys: [],

        /**
         *                                                                      .
         *                                                                      .
         * is true if the mouse is currently hovering over me
         *
         * @attribute hasMouse
         * @default false
         * @type boolean
         */
        hasMouse: false,

        /**
         *                                                                      .
         *                                                                      .
         * counter to throttle size checking
         *
         * @attribute checkSizeCounter
         * @default 0
         * @type Number
         */
        checkSizeCounter: 0,

        /**
         *                                                                      .
         *                                                                      .
         * a polymer lifecycle callback to initialize the canvas
         *
         * @method ready()
         */
        ready: function() {

            var self = this;
            this.checkSizeCounter = 0;
            this.g = document.createElement('fin-rectangle');
            this.canvas = this.shadowRoot.querySelector('.canvas');
            this.focuser = this.shadowRoot.querySelector('button');
            this.canvasCTX = this.canvas.getContext('2d');

            this.buffer = document.createElement('canvas');
            this.bufferCTX = this.buffer.getContext('2d');

            this.fps = this.getAttribute('fps') || 60;

            this.mouseLocation = this.g.point.create(-1, -1);
            this.dragstart = this.g.point.create(-1, -1);
            //this.origin = this.g.point.create(0, 0);
            this.bounds = this.g.rectangle.create(0, 0, 0, 0);
            this.hasMouse = false;

            this.onmouseover = function() {
                self.hasMouse = true;
            };
            document.addEventListener('mousemove', function(e) {
                if (!self.hasMouse && !self.isDragging()) {
                    return;
                }
                self.finmousemove(e);
            });
            document.addEventListener('mouseup', function(e) {
                self.finmouseup(e);
            });
            document.addEventListener('wheel', function(e) {
                self.finwheelmoved(e);
            });

            this.focuser.addEventListener('focus', function(e) {
                self.finfocusgained(e);
            });
            this.focuser.addEventListener('blur', function(e) {
                self.finfocuslost(e);
            });
            this.addEventListener('mousedown', function(e) {
                self.finmousedown(e);
            });
            this.addEventListener('mouseout', function(e) {
                self.hasMouse = false;
                self.finmouseout(e);
            });
            document.addEventListener('keydown', function(e) {
                self.finkeydown(e);
            });
            document.addEventListener('keyup', function(e) {
                self.finkeyup(e);
            });
            this.addEventListener('click', function(e) {
                self.finclick(e);
            });
            this.addEventListener('dblclick', function(e) {
                self.findblclick(e);
            });

            this.resize();
            this.beginPainting();

        },

        detached: function() {
            this.stopPainting();
        },

        /**
         *                                                                      .
         *                                                                      .
         * return if I have the hidpi attribute set
         *
         * @method isHiDPI()
         */
        isHiDPI: function() {
            return this.getAttribute('hidpi') !== null;
        },

        /**
         *                                                                      .
         *                                                                      .
         * return if I have the bitblit attribute set
         *
         * @method useBitBlit()
         */
        useBitBlit: function() {
            return this.getAttribute('bitblit') !== 'false';
        },

        /**
         *                                                                      .
         *                                                                      .
         * return my one child fin-canvas-component
         *
         * @method getComponent()
         */
        getComponent: function() {
            var comp = this.children[0];
            return comp;
        },

        /**
         *                                                                      .
         *                                                                      .
         * start the paint loop at this.fps rate
         *
         * @method beginPainting()
         */
        beginPainting: function() {
            var self = this;
            this.repaintNow = true;
            this.tickPainter = function(now) {
                self.tickPaint(now);
            };
            canvases.push(this.tickPainter);
        },

        stopPainting: function() {
            canvases.splice(canvases.indexOf(this.tickPainter), 1);
        },

        tickPaint: function(now) {
            var interval = 1000 / this.fps;
            var lastRepaintTime = 0;
            this.checkSizeCounter++;
            if (this.checkSizeCounter < 3 || (this.checkSizeCounter % 45) === 0) {
                this.checksize();
            }
            var delta = now - lastRepaintTime;
            if (delta > interval && this.repaintNow) {
                lastRepaintTime = now - (delta % interval);
                this.paintNow();
            }
        },

        /**
         *                                                                      .
         *                                                                      .
         * check to see if my size has changed, if so notify myself
         *
         * @method checksize()
         */
        checksize: function() {

            //this is expensize lets do it at some modulo
            var sizeNow = this.getBoundingClientRect();
            if (sizeNow.width !== this.size.width || sizeNow.height !== this.size.height) {
                this.sizeChangedNotification();
            }
        },

        /**
         *                                                                      .
         *                                                                      .
         * my size has changed, lets resize
         *
         * @method sizeChangedNotification()
         */
        sizeChangedNotification: function() {
            this.resize();
        },

        /**
         *                                                                      .
         *                                                                      .
         * because HTMLCanvasElement doesn't obey normal HTML5 resize semantics, we need to update canvas and buffer sizes when our size changes
         *
         * @method resize()
         */
        resize: function() {
            this.size = this.getBoundingClientRect();

            this.canvas.width = this.clientWidth;
            this.canvas.height = this.clientHeight;

            this.buffer.width = this.clientWidth;
            this.buffer.height = this.clientHeight;

            //fix ala sir spinka, see
            //http://www.html5rocks.com/en/tutorials/canvas/hidpi/
            //just add 'hdpi' as an attribute to the fin-canvas tag
            var ratio = 1;
            var useBitBlit = this.useBitBlit();
            var isHIDPI = window.devicePixelRatio && this.isHiDPI();
            if (isHIDPI) {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = this.canvasCTX.webkitBackingStorePixelRatio ||
                    this.canvasCTX.mozBackingStorePixelRatio ||
                    this.canvasCTX.msBackingStorePixelRatio ||
                    this.canvasCTX.oBackingStorePixelRatio ||
                    this.canvasCTX.backingStorePixelRatio || 1;

                ratio = devicePixelRatio / backingStoreRatio;



                //this.canvasCTX.scale(ratio, ratio);
            }
            var width = this.canvas.getAttribute('width');
            var height = this.canvas.getAttribute('height');
            this.canvas.width = width * ratio;
            this.canvas.height = height * ratio;
            this.buffer.width = width * ratio;
            this.buffer.height = height * ratio;

            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            this.buffer.style.width = width + 'px';
            this.buffer.style.height = height + 'px';

            this.bufferCTX.scale(ratio, ratio);
            if (isHIDPI && !useBitBlit) {
                this.canvasCTX.scale(ratio, ratio);
            }

            //this.origin = this.g.point.create(Math.round(this.size.left), Math.round(this.size.top));
            this.bounds = this.g.rectangle.create(0, 0, this.size.width, this.size.height);
            //setTimeout(function() {
            var comp = this.getComponent();
            if (comp) {
                comp.setBounds(this.bounds);
            }
            this.resizeNotification();
            this.paintNow();
            //});
        },

        /**
         *                                                                      .
         *                                                                      .
         * my size has changed, lets resize
         *
         * @method sizeChangedNotification()
         */
        resizeNotification: function() {
            //to be overridden
        },

        /**
         *                                                                      .
         *                                                                      .
         * my bounds with origin 0,0 and width and height set according to [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect)
         *
         * @method getBounds()
         */
        getBounds: function() {
            return this.bounds;
        },

        /**
         *                                                                      .
         *                                                                      .
         * force a safe paint right now and then flush the buffer to the screen
         *
         * @method paintNow()
         */
        paintNow: function() {
            var self = this;
            this.safePaintImmediately(function(gc) {
                gc.clearRect(0, 0, self.canvas.width, self.canvas.height);
                self.paint(gc);
                self.repaintNow = false;
            });
        },

        safePaintImmediately: function(paintFunction) {
            var useBitBlit = this.useBitBlit();
            var gc = useBitBlit ? this.bufferCTX : this.canvasCTX;
            try {
                gc.save();
                paintFunction(gc);
            } finally {
                gc.restore();
            }
            if (useBitBlit) {
                this.flushBuffer();
            }
        },

        /**
         *                                                                      .
         *                                                                      .
         * render the buffered drawing to the screen
         *
         * @method flushBuffer()
         */
        flushBuffer: function() {
            if (this.buffer.width > 0 && this.buffer.height > 0) {
                this.canvasCTX.drawImage(this.buffer, 0, 0);
            }
        },

        /**
         *                                                                      .
         *                                                                      .
         * this is the entry point to the view-heirarchy sub-structure painting, passing in the graphics context gc
         *
         * @method paint(gc)
         */
        paint: function(gc) {
            var comp = this.getComponent();
            if (comp) {
                comp._paint(gc);
            }
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the mouse move event
         *
         * @method finmousemove(e)
         */

        finmousemove: function(e) {
            if (!this.isDragging() && this.mousedown) {
                this.beDragging();
                this.dispatchEvent(new CustomEvent('fin-dragstart', {
                    detail: {
                        mouse: this.mouseLocation,
                        keys: this.currentKeys
                    }
                }));
                this.dragstart = this.g.point.create(this.mouseLocation.x, this.mouseLocation.y);
            }
            this.mouseLocation = this.getLocal(e);
            if (this.isDragging()) {
                this.dispatchEvent(new CustomEvent('fin-drag', {
                    detail: {
                        mouse: this.mouseLocation,
                        dragstart: this.dragstart,
                        keys: this.currentKeys
                    }
                }));
            }
            if (this.bounds.contains(this.mouseLocation)) {
                this.dispatchEvent(new CustomEvent('fin-mousemove', {
                    detail: {
                        mouse: this.mouseLocation,
                        keys: this.currentKeys
                    }
                }));
            }
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the mouse down event
         *
         * @method finmousedown(e)
         */
        finmousedown: function(e) {

            this.mouseLocation = this.getLocal(e);
            this.mousedown = true;

            this.dispatchEvent(new CustomEvent('fin-mousedown', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
            this.takeFocus();

        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the mouse up event
         *
         * @method finmouseup(e)
         */
        finmouseup: function() {
            if (this.isDragging()) {
                this.dispatchEvent(new CustomEvent('fin-dragend', {
                    detail: {
                        mouse: this.mouseLocation,
                        dragstart: this.dragstart,
                        keys: this.currentKeys
                    }
                }));
                this.beNotDragging();
            }
            this.mousedown = false;
            this.mouseLocation = this.g.point.create(-1, -1);
            this.dispatchEvent(new CustomEvent('fin-mouseup', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the mouse out event
         *
         * @method finmouseout(e)
         */
        finmouseout: function() {
            if (!this.mousedown) {
                this.mouseLocation = this.g.point.create(-1, -1);
            }
            this.dispatchEvent(new CustomEvent('fin-mouseout', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the wheelmoved event
         *
         * @method finwheelmoved(e)
         */
        finwheelmoved: function(e) {
            if (this.isDragging() || !this.hasFocus()) {
                return;
            }
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('fin-wheelmoved', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys,
                    primitiveEvent: e
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the mouse click event
         *
         * @method finclick(e)
         */
        finclick: function(e) {
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-click', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the release event
         *
         * @method finrelease(e)
         */
        finrelease: function(e) {
            this.holdPulseCount = 0;
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-release', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the flick event
         *
         * @method finflick(e)
         */
        finflick: function(e) {
            if (!this.hasFocus()) {
                return;
            }
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-flick', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the tap event
         *
         * @method fintap(e)
         */
        fintap: function(e) {
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-tap', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the trackstart event
         *
         * @method fintap(e)
         */
        fintrackstart: function(e) {
            if (!this.hasFocus()) {
                return;
            }
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-trackstart', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys,
                    primitiveEvent: e
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the track event
         *
         * @method fintrack(e)
         */
        fintrack: function(e) {
            if (!this.hasFocus()) {
                return;
            }
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-track', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys,
                    primitiveEvent: e
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the trackend event
         *
         * @method fintrackend(e)
         */
        fintrackend: function(e) {
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-trackend', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys,
                    primitiveEvent: e
                }
            }));
        },
        /**
         *                                                                      .
         *                                                                      .
         * handle the hold event
         *
         * @method finhold(e)
         */
        finhold: function(e) {
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-hold', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the holdpulse event
         *
         * @method finholdpulse(e)
         */
        finholdpulse: function(e) {
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-holdpulse', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys,
                    count: this.holdPulseCount++
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the mouse double click event
         *
         * @method findblclick(e)
         */
        findblclick: function(e) {
            this.mouseLocation = this.getLocal(e);
            this.dispatchEvent(new CustomEvent('fin-dblclick', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the keydown event
         *
         * @method finkeydown(e)
         */
        finkeydown: function(e) {
            if (!this.hasFocus()) {
                return;
            }
            //e.preventDefault();
            var keyChar = e.shiftKey ? charMap[e.keyCode][1] : charMap[e.keyCode][0];
            if (e.repeat) {
                if (this.repeatKey === keyChar) {
                    this.repeatKeyCount++;
                } else {
                    this.repeatKey = keyChar;
                    this.repeatKeyStartTime = Date.now();
                }
            } else {
                this.repeatKey = null;
                this.repeatKeyCount = 0;
                this.repeatKeyStartTime = 0;
            }
            if (this.currentKeys.indexOf(keyChar) === -1) {
                this.currentKeys.push(keyChar);
            }
            //console.log(keyChar, e.keyCode);
            this.dispatchEvent(new CustomEvent('fin-keydown', {
                detail: {
                    alt: e.altKey,
                    ctrl: e.ctrlKey,
                    char: keyChar,
                    code: e.charCode,
                    key: e.keyCode,
                    meta: e.metaKey,
                    repeatCount: this.repeatKeyCount,
                    repeatStartTime: this.repeatKeyStartTime,
                    shift: e.shiftKey,
                    identifier: e.keyIdentifier,
                    currentKeys: this.currentKeys.slice(0)
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the keyup event
         *
         * @method finkeyup(e)
         */
        finkeyup: function(e) {
            var keyChar = e.shiftKey ? charMap[e.keyCode][1] : charMap[e.keyCode][0];
            this.currentKeys.splice(this.currentKeys.indexOf(keyChar), 1);
            if (!this.hasFocus()) {
                return;
            }
            this.repeatKeyCount = 0;
            this.repeatKey = null;
            this.repeatKeyStartTime = 0;
            this.dispatchEvent(new CustomEvent('fin-keyup', {
                detail: {
                    alt: e.altKey,
                    ctrl: e.ctrlKey,
                    char: keyChar,
                    code: e.charCode,
                    key: e.keyCode,
                    meta: e.metaKey,
                    repeat: e.repeat,
                    shift: e.shiftKey,
                    identifier: e.keyIdentifier,
                    currentKeys: this.currentKeys.slice(0)
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the focusgained event
         *
         * @method finfocusgained(e)
         */
        finfocusgained: function(e) {
            this.focused = true;
            this.dispatchEvent(new CustomEvent('fin-focus-gained', {
                detail: {
                    e: e
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * handle the focuslost event
         *
         * @method finfocuslost(e)
         */
        finfocuslost: function(e) {
            this.focused = false;
            this.dispatchEvent(new CustomEvent('fin-focus-lost', {
                detail: {
                    e: e
                }
            }));
        },

        /**
         *                                                                      .
         *                                                                      .
         * tickle the repaint flag to on
         *
         * @method repaint()
         */
        repaint: function() {
            this.repaintNow = true;
        },

        /**
         *                                                                      .
         *                                                                      .
         * getter accessor for the mouseLocation field
         *
         * @method getMouseLocation()
         */
        getMouseLocation: function() {
            return this.mouseLocation;
        },

        /**
         *                                                                      .
         *                                                                      .
         * getter accessor for the origin field
         *
         * @method getOrigin()
         */
        getOrigin: function() {
            var rect = this.getBoundingClientRect();
            var p = this.g.point.create(rect.left, rect.top);
            return p;
        },


        /**
         *                                                                      .
         *                                                                      .
         * getter accessor for the local point given a mouse event
         *
         * @method getLocal()
         */
        getLocal: function(e) {
            var rect = this.getBoundingClientRect();
            var p = this.g.point.create((e.x || e.clientX) - rect.left, (e.y || e.clientY) - rect.top);
            return p;
        },

        /**
         *                                                                      .
         *                                                                      .
         * answer if I have focus
         *
         * @method hasFocus()
         */
        hasFocus: function() {
            return this.focused;
        },

        /**
         *                                                                      .
         *                                                                      .
         * try to take global input focus
         *
         * @method takeFocus()
         */
        takeFocus: function() {
            var self = this;
            if (document.activeElement !== this.focuser) {
                setTimeout(function() {
                    self.focuser.focus();
                }, 10);
            }
        },

        beDragging: function() {
            this.dragging = true;
            this.disableDocumentElementSelection();
        },

        beNotDragging: function() {
            this.dragging = false;
            this.enableDocumentElementSelection();
        },

        isDragging: function() {
            return this.dragging;
        },

        disableDocumentElementSelection: function() {
            var style = document.body.style;
            style.cssText = style.cssText + '-webkit-user-select: none';
        },

        enableDocumentElementSelection: function() {
            var style = document.body.style;
            style.cssText = style.cssText.replace('-webkit-user-select: none', '');
        }

    });

})(); /* jslint ignore:line */
