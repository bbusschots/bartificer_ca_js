/**
* @overview A JavaScript API for creating Celluar Automata.
*     This API is entirely contained within the namespace {@link bartificer.ca}.
* @author Bart Busschots
* @license BSD-2-Clause
*/

//
// === Add needed JSDoc data type definitions ===
//

/**
* An object created using `{}` or `new Object()`. jQuery's `$.isPlainObject()`
* function is used to validate this datatype.
* @typedef {Object} PlainObject
*/

/**
* A jQuery object.
* @typedef {Object} jQueryObject
*/

/**
* A jQuery object representing exactly one element which can be used as a
* container for a cellular automaton. The following tags are premitted:
* * `div`
* * `p`
* * `main`
* * `section`
* @see jQueryObject
* @typedef {jQueryObject} jQuerySingleContainer
*/

/**
* A jQuery object representing exactly one table (`table`).
* @see jQueryObject
* @typedef {jQueryObject} jQuerySingleTable
*/

/**
* A jQuery object representing exactly one table data cell (`td`).
* @see jQueryObject
* @typedef {jQueryObject} jQuerySingleTD
*/

/**
* A number representing an x or y coordinate within a cellular automaton.
* Specifically, an integer number greater than or equal to zero.
* @typedef {number} GridCoordinate
*/

/**
* A number representing the total width or height of a cellular automaton as a
* number of cells. Specifically, an integer number greater than or equal to
* one.
* @typedef {number} GridDimension
*/

/**
* A valid cell state - a boolean, a number, or a string.
* @typedef {(boolean|number|string)} CellState
*/

/**
 * A step function is used to calcualte the next value of each cell for each
 * step the cellular automaton takes.
 *
 * @callback stepFunction
 * @param {CellState} currentState - the curent state of the cell.
 * @param {CellState[]} neighbourStates - the current state of each
 * neighbouring cell as an array with the cell at 12 o'clock at index zero, and
 * moving around the cell clockwise from there. If a cell is on an edge, there
 * will still be array elements representing the non-existent neighbours, but
 * they will have the valye `null`.
 * @returns {CellState} the next state for the cell.
 */

/**
 * A render function should style a table data cell so it represents a given
 * state. This function will be used to render each cell in a cellular
 * automaton.
 *
 * @callback renderFunction
 * @param {jQuerySingleTD} rFn - a jQuery object representing the table data
 * cell to be rendered.
 * @param {CellState} s - the state of the cell the table data cell represents.
 */

/**
 * An initialisation function is used to set the initial states of each cell in
 * a cellular automaton. The function will be called once for each cell, and it
 * will return an initial state for each.
 *
 * @callback initialisationFunction
 * @param {GridCoordinate} x - the zero-indexed X-coordinate of the cell being
 * initialised within the cellular automaton's grid.
 * @param {GridCoordinate} y - the zero-indexed Y-coordinate of the cell being
 * initialised within the cellular automaton's grid.
 * @returns {CellState} an initial state.
 */

// make sure the needed pre-requisites are installed.
if(typeof jQuery !== 'function'){
    throw new Error('jQuery is required but not loaded');
}

// init the bartificer namespace safely
var bartificer = bartificer ? bartificer : {};

// add all the API's functionality within a self-executing anonymous function
(function(bartificer, $, undefined){
    // initialise the bartificer.ca namespace
    /**
    * A JavaScript API for creating cellular automata.
    *
    * @requires jQuery
    * @namespace
    */
    bartificer.ca = {};
    
    //
    // --- Define Validation Functions ---
    //
    
    /**
    * Test if a given value is a plain object.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` if the value is a reference to a plain object,
    * `false` otherwise.
    * @see {@link PlainObject}
    */
    function isPlainObject(obj){
        return $.isPlainObject(obj) ? true : false;
    }
    
    /**
    * Validation function to check if a given value is a reference to a jQuery
    * object representing exactly one div.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` of the value is valid, `false` otherwise.
    * @see {@link jQuerySingleContainer}
    */
    function isJQuerySingleContainer(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('div, p, section, main') ? true : false;
    }
    
    /**
    * Validation function to check if a given value is a reference to a jQuery
    * object representing exactly one table.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` of the value is valid, `false` otherwise.
    * @see {@link jQuerySingleTable}
    */
    function isJQuerySingleTable(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('table') ? true : false;
    }
    
    /**
    * Validation function to check if a given value is a reference to a jQuery
    * object representing exactly one table data cell.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} obj - The value to test.
    * @return {boolean} `true` of the value is valid, `false` otherwise.
    * @see {@link jQuerySingleTD}
    */
    function isJQuerySingleTD(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('td') ? true : false;
    }
    
    /**
    * Test if a given value is a valid grid coordinate.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} n - The value to test.
    * @return {boolean} `true` if the value is a valid grid coordinate, `false`
    * otherwise.
    * @see {@link GridCoordinate}
    */
    function isGridCoordinate(n){
        return String(n).match(/^\d+$/) ? true : false;
    };
    
    /**
    * Test if a given value is a valid grid dimension.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} gd The value to test.
    * @return {boolean} `true` if the value is a valid grid dimension, `false`
    * otherwise.
    * @see {@link GridDimension}
    */
    function isGridDimension(gd){
        // make sure we have an integer that's not negative
        if(!String(gd).match(/^\d+$/)){
            return false;
        }
        
        // make sure the integer is at least one
        if(gd < 1){
            return false;
        }
        
        // if we got here all is well, so return true
        return true;
    };
    
    /**
    * Test if a given value is a valid cell state (a boolean, number, or
    * string).
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} s The value to test.
    * @return {boolean} `true` if the value is a valid cell state, `false`
    * otherwise.
    * @see {@link GridDimension}
    */
    function isCellState(s){
        var sType = typeof s;
        
        // accept booleans
        if(sType === 'boolean') return true;
        
        // accept numbers
        if(sType === 'number') return true;
        
        // accpet strings
        if(sType === 'string') return true;
        
        // reject all other types
        return false;
    };
    
    //
    // --- The bartificer.ca.Cell Prototype ---
    //
    
    /**
    * A prototype to represent a single cell within a cellular automaton. The
    * cell will be represented within the DOM by a single table data cell.
    *
    * The constructor expects to be passed a table data cell, and that cell
    * will be emptied of all content. The class `bartificer-ca-cell` will be
    * added to the data cell, and a reference to the constructed object will be
    * added to the data cell as the data attribute `data-bartificer-object`
    * (`bartificerObject` from JavaScipt's point of  view).
    *
    * @constructor
    * @param {jQuerySingleTD} $td - A jQuery object representing the table data
    * cell that will represent the new cell within the automaton.
    * @param {GridCoordinate} x - the cell's x coordinate within the
    * automaton.
    * @param {GridCoordinate} y - the cell's y coordinate within the
    * automaton.
    * @param {CellState} [s] - the cell's initial state.
    * @throws {TypeError} An error is thrown if the first three arguments are
    * not present and valid.
    * @throws {Error} An error is thrown if the table data cell has already
    * been initialised as a cell within an automaton.
    */
    bartificer.ca.Cell = function($td, x, y, s){
        // validate args
        if(!isJQuerySingleTD($td)){
            throw new TypeError('the first argument must be a jQuery object representing exactly one table data cell');
        }
        if(!isGridCoordinate(x)){
            throw new TypeError('the second argument must be a valid grid coordinate');
        }
        if(!isGridCoordinate(y)){
            throw new TypeError('the third argument must be a valid grid coordinate');
        }
        if(typeof s !== 'undefined' && !isCellState(s)){
            throw new TypeError('if present, the fourth argument must be a valid cell state (boolean, number, or string)');
        }
        
        // make sure the data cell has not been initialised into a Cell already
        if($td.hasClass('bartificer-ca-cell') || $td.data('bartificerObject')){
            throw new Error('cannot use the same table data cell to represent multiple Cell objects');
        }
        
        // initialise data attributes
        
        /**
        * A reference to a jQuery object representing the table data cell that
        * represents this cell in the DOM.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {jQuerySingleTD}
        */
        this._$td = $td.empty();
        
        /**
        * The cell's x coordinate within the automaton.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {GridCoordinate}
        */
        this._x = x;
        
        /**
        * The cell's y coordinate within the automaton.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {GridCoordinate}
        */
        this._y = y;
        
        /**
        * The cell's current state.
        *
        * This property should not be directly editable. It should only change
        * when the cell ticks forward to the next state.
        *
        * @private
        * @type {*}
        */
        this._state = s;
        
        /**
        * The cell's next state.
        *
        * @private
        * @type {*}
        */
        this._nextState = undefined;
        
        // add the class to the TD
        this._$td.addClass('bartificer-ca-cell');
        
        // add the data attribute to the TD
        this._$td.data('bartificerObject', this);
    };
    
    /**
    * A read-only accessor function to access a reference to the jQuery object
    * representing the table data cell that represents the cell within the DOM.
    *
    * @returns {jQuerySingleTD}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.$td = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._$td;
    };
    
    /**
    * A read-only accessor function to access the cell's x coordinate within
    * the automaton.
    *
    * @returns {GridCoordinate}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.x = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._x;
    };
    
    /**
    * A read-only accessor function to access the cell's y coordinate within
    * the automaton.
    *
    * @returns {GridCoordinate}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.y = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._y;
    };
    
    /**
    * A read-only accessor function to access the cell's x and y coordinates
    * within the automaton.
    *
    * @returns {Array} An array of length two with the x coordinate as the
    * first value and the y coordinate as the second.
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.coordinates = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return [this._x, this._y];
    };
    
    /**
    * A read-only accessor function to access the cell's current state, if any.
    *
    * @returns {(CellState|undefined)} When the cell has a current state that's
    * returned, otherwise `undefined` is returned.
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Cell.prototype.state = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._state;
    };
    
    /**
    * Accessor function for the cell's next state. Always returns the next
    * state of the cell. If an argument is passed, the next state is updated to
    * that value and then returned.
    *
    * @param {(CellState|undefined)} [ns] - if passed, the next state of the
    * cell is set to this value. `undefined` indicates that the cell has no
    * next state.
    * @returns {(CellState|undefined)} When the cell has a next state that's
    * returned, otherwise `undefined` is returned.
    * @throws {TypeError} If an argument is passed and it's not value, an error
    * is thrown.
    */
    bartificer.ca.Cell.prototype.nextState = function(ns){
        // if in setter mode, try set
        if(arguments.length >= 1){
            if(!(typeof ns === 'undefined' || isCellState(ns))){
                throw new TypeError('if present, the first argument must be a valid cell state (boolean, number, or sting), or the value undefined');
            }
            this._nextState = ns;
        }
        
        // always return the current next state
        return this._nextState;
    };
    
    /**
    * Function to determine whether or not the cell has a next state defined.
    * 
    * @returns {boolean} `true` if the cell has a next state defined, `false`
    * otherwise.
    */
    bartificer.ca.Cell.prototype.hasNextState = function(){
        return typeof this._nextState === 'undefined' ? false : true;
    };
    
    /**
    * Advance the cell to its next state.
    *
    * @returns a reference to self to facilitate function chaining.
    * @throws {Error} An error is thrown if an attempt is made to advance while
    * there is no next state defined.
    */
    bartificer.ca.Cell.prototype.advance = function(){
        // throw an error if there is no next state to advance to
        if(!this.hasNextState()){
            throw new Error("can't advance a cell while there is no next state defined");
        }
        
        // set the current state to the next state
        this._state = this._nextState;
        
        // blank the next state
        this._nextState = undefined;
        
        // return a reference to self
        return this;
    };
    
    //
    // --- The bartificer.ca.Automaton Prototype ---
    //
    
    /**
    * A prototype to represent a cellular automaton.
    *
    * The automaton uses a lower-right quadrant zero-indexed coordinate system.
    * The horizontal axis is labeled the *x axis* and numbered from left to
    * right in whole number increments. The vertical axis is labeled the
    * *y axis*, and numbered from top to bottom in whole-number increments.
    * When describing a cell it's x coordinate is specified first, and its y
    * coordinate second. Hence, the cell in the top-left corner has the
    * coordinates (0, 0), the second cell in the top row has the  coordiantes
    * (1, 0), and the cell in the second cell on the left-most column has the
    * coordinates (0, 1).
    *
    * The automaton will be represented within the DOM by an automatically
    * generated table, with the cells that make up the automaton as table
    * cells. The table will be generated within a given container.
    *
    * The constructor expects to be passed a jQuery object representing a sigle
    * container element. That element will be emptied, and the table
    * representing the automaton will then be added to it. The class
    * `bartificer-ca-container` will be added to the conainer, and the
    * generated table will have the class `bartificer-ca-automaton` added.
    * The table. A reference to the constructed object will be added to both 
    * the container and the table as the data attribute 
    * `data-bartificer-object` (`bartificerObject` from JavaScipt's point of
    * view).
    *
    * @constructor
    * @param {jQuerySingleContainer} $container - A jQuery object representing
    * the container that will be converted into the cellular automaton.
    * @param {GridDimension} rows - the number of rows to build the automaton
    * with.
    * @param {GridDimension} cols - the number of columns to build the
    * automaton with.
    * @param {stepFunction} stepFn - a callback that will be used to
    * calcualte the next state of each cell for each step the automaton takes.
    * it's next state.
    * @param {renderFunction} renderFn - a callback that will be used to render
    * the state of each cell.
    * @param {CellState|CellState[]|initialisationFunction} [s] - the automaton's
    * initial state. The state can be specified in three different ways:
    * 1. a single state - each cell in the automaton will be initialised with
    *    this state.
    * 2. an array of states. The array must have the same dimensions as the
    *    automaton.
    * 3. an intialisation callback. The callback will be used to calculate the
    *    initial state of each cell given its coordinates.
    * @throws {TypeError} An error is thrown if the first five arguments are
    * not present and valid, and if the sixth argument is present but not
    * valid.
    * @throws {Error} An error is thrown if the table has already been
    * initialised as an automaton.
    */
    bartificer.ca.Automaton = function($container, rows, cols, stepFn, renderFn, s){
        var x, y; // variables to be used in loops throughout this function
        
        // validate args
        if(!isJQuerySingleContainer($container)){
            throw new TypeError('the first argument must be a jQuery object representing exactly one valid container element');
        }
        
        if(!isGridDimension(rows)){
            throw new TypeError('the second argument must be a valid grid dimension');
        }
        if(!isGridDimension(cols)){
            throw new TypeError('the third argument must be a valid grid dimension');
        }
        if(typeof stepFn !== 'function'){
            throw new TypeError('the fourth argument must be a callback');
        }
        if(typeof renderFn !== 'function'){
            throw new TypeError('the fifth argument must be a callback');
        }
        if(typeof s !== 'undefined'){
            var msg = 'if present, the sixth argument must be a valid cell state (boolean, number, or string), an array of valid cell states with the same dimensions as the automaton, or, a callback';
            
            // check if we have a valid value
            var isValid = false;
            if(isCellState(s)){
                isValid = true;
            }else if($.isArray(s)){
                // make sure each element is a cell state, and that the dimensions match
                if(s.length != cols){
                    throw new TypeError('initial state array has invalid dimensions');
                }
                for(x = 0; x < cols; x++){
                    if(s[x].length != rows){
                        throw new TypeError('initial state array has invalid dimensions');
                    }
                    for(y = 0; y < rows; y++){
                        if(!isCellState()){
                            throw new TypeError('initial state array contains invalid value');
                        }
                    }
                }
                
                // if we made it here without throwing an error, the initial state is valid
                isValid = true;
            }else if(typeof s === 'function'){
                isValid = true;
            }
            
            // throw an eror if we got here and don't have a valid value
            if(!isValid){
                throw new Error(msg);
            }
        }
        
        // make sure the container has not been initialised into an Automaton already
        if($container.hasClass('bartificer-ca-container') || $container.data('bartificerObject')){
            throw new Error('cannot use the same container to represent multiple cellular automata');
        }
        
        // initialise the container
        $container.empty().addClass('bartificer-ca-container').data('bartificerObject', this);
        
        // save the passed properties
        
        /**
        * A jQuery object representing the container for the automaton.
        * @private
        * @type {jQuerySingleContainer}
        */
        this._$container = $container;
        
        /**
        * The number of rows in the automaton. This property is forced to be a
        * number before being stored.
        * @private
        * @type {GridDimension}
        */
        this._rows = parseInt(rows); // force to number
        
        /**
        * The number of columns in the automaton. This property is forced to be a
        * number before being stored.
        * @private
        * @type {GridDimension} 
        */
        this._cols = parseInt(cols); // force to number
        
        /**
        * The callback used to calculate the next state of each cell each time
        * the automaton steps forward.
        * @private
        * @type {stepFunction}
        */
        this._stepFn = stepFn;
        
        /**
        * The callback used to style a given cell so it represents the
        * appropriate state.
        * @private
        * @type {renderFunction}
        */
        this._renderFn = renderFn;
        
        // initialise the grid and table
        
        /**
        * A 2D array of bartificer.ca.Cell objects representing the cells in
        * the automaton.
        * @private
        * @type {bartificer.ca.Cell[][]}
        */
        this._grid = [];
        for(x = 0; x < this._cols; x++){
            this._grid[x] = [];
        }
        
        /**
        * A jQuery object representing the table that represents the automaton.
        * @private
        * @type {jQuerySingleTable}
        */
        this._$table = $('<table></table>').addClass('bartificer-ca-automaton');
        this._$table.data('bartificerObject', this);
        
        // actually build the table and grid together
        var $tbody = $('<tbody></tbody>');
        for(y = 0; y < this._rows; y++){
            var $row = $('<tr></tr>');
            for(x = 0; x < this._cols; x++){
                var $td = $('<td></td>');
                var initState = undefined;
                if(typeof s !== 'undefined'){
                    if($.isArray(s) && s[x] && isCellState(s[x][y])){
                        initState = s[x][y];
                    }else if(typeof s === 'function'){
                        initState = s(x, y);
                    }else if(isCellState(s)){
                        initState = s;
                    }
                }
                this._grid[x][y] = new bartificer.ca.Cell($td, x, y, initState);
                this._renderFn($td, this._grid[x][y].state());
                $row.append($td);
            }
            $tbody.append($row); // add the row into the table body
        }
        
        // inject the table into the DOM
        this._$table.append($tbody); // add the table body into the table
        this._$container.append(this._$table); // add the table into the container
    };
    
    /**
    * A read-only accessor function to access a reference to the jQuery object
    * representing the container that holds the table that represents the
    * automaton within the DOM.
    *
    * @returns {jQuerySingleContainer}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.$container = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._$container;
    };
    
    /**
    * A read-only accessor function to access a reference to the jQuery object
    * representing the table that represents the automaton within the DOM.
    *
    * @returns {jQuerySingleTable}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.$table = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._$table;
    };
    
    /**
    * A read-only accessor function to get the number of rows within the
    * automaton.
    *
    * @returns {GridDimension}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.rows = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._rows;
    };
    
    /**
    * A read-only accessor function to get the number of columns within the
    * automaton.
    *
    * @returns {GridDimension}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.cols = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._cols;
    };
    
    /**
    * A read-only accessor function to get a reference to the automaton's step
    * function.
    *
    * @returns {stepFunction}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.stepFunction = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._stepFn;
    };
    
    /**
    * A read-only accessor function to get a reference to the automaton's
    * render function.
    *
    * @returns {renderFunction}
    * @throws {Error} An error is thrown if the accessor is called with
    * arguments.
    */
    bartificer.ca.Automaton.prototype.renderFunction = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._renderFn;
    };
    
    /**
    * A function for accessing a given cell within the automaton.
    *
    * @param {GridCoordinate} x - the x coordinate of the requested cell.
    * @param {GridCoordinate} y - the y coordinate of the requested cell.
    * @returns {bartificer.ca.Cell} a reference to the object representing the
    * requested cell.
    * @throws {TypeError} A type error is thrown if invalid arguments are
    * passed.
    * @throws {RangeError} A range error is thrown if either of the coordinates
    * specify a cell who's coordiantes are beyond the edges of the automaton.
    */
    bartificer.ca.Automaton.prototype.cell = function(x, y){
        if(!(isGridCoordinate(x) && isGridCoordinate(y))){
            throw new TypeError('two valid grid coordinates are required');
        }
        if(x >= this._cols){
            throw new RangeError('x coordinate out of range');
        }
        if(y >= this._rows){
            throw new RangeError('y coordinate out of range');
        }
        return this._grid[x][y];
    };
})(bartificer, jQuery);