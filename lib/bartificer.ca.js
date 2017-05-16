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
* An object created using `{}` or `new Object()`. jQuery's `$.isPlainObject()` function is used to
* validate this datatype.
* @typedef {Object} PlainObject
*/

/**
* A jQuery object.
* @typedef {Object} jQueryObject
*/

/**
* A jQuery object representing exactly one `div`.
* @see jQueryObject
* @typedef {jQueryObject} jQuerySingleDiv
*/

/**
* A jQuery object representing exactly one table data cell (`td`).
* @see jQueryObject
* @typedef {jQueryObject} jQuerySingleTD
*/

/**
* An integer value greater than or equal to zero.
* @typedef {number} PositiveInteger
*/

/**
* An integer value greater than or equal to one.
* @typedef {number} GridDimension
*/

/**
* A valid cell state - a boolean, a number, or a string.
* @typedef {(boolean|number|string)} CellState
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
    * @param  {*} obj The value to test.
    * @return {boolean} `true` if the value is a reference to a plain object,
    * `false` otherwise.
    * @see plainObject
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
    * @param  {*} obj The value to test.
    * @return {boolean} `true` of the value is valid, `false` otherwise.
    * @see jQuerySingleDiv
    */
    function isJQuerySingleDiv(obj){
        if(typeof obj !== 'object'){
            return false;
        }
        if(!(obj instanceof $)){
            return false;
        }
        if(obj.length !== 1){
            return false;
        }
        return obj.is('div') ? true : false;
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
    * @see jQuerySingleTD
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
    * Test if a given value is a positive integer (greater than or equal to
    # zero).
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} n - The value to test.
    * @return {boolean} `true` if the value is a positive integer, `false` otherwise.
    * @see PositiveInteger
    */
    function isPositiveInteger(n){
        return String(n).match(/^\d+$/) ? true : false;
    };
    
    /**
    * Test if a given value is a valid grid dimension.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} gd The value to test.
    * @return {boolean} `true` if the value is a valid grid dimension, `false` otherwise.
    * @see GridDimension
    */
    function isGridDimension(gd){
        // make sure we have a positive integer
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
    * Test if a given value is a valid cell state (boolean, number, or string).
    *
    * @memberof bartificer
    * @inner
    * @private
    * @param  {*} s The value to test.
    * @return {boolean} `true` if the value is a valid cell state, `false` otherwise.
    * @see GridDimension
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
    * @param {PositiveInteger} x - the cell's x coordinate within the
    * automaton.
    * @param {PositiveInteger} y - the cell's y coordinate within the
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
        if(!isPositiveInteger(x)){
            throw new TypeError('the second argument must be a positive integer');
        }
        if(!isPositiveInteger(y)){
            throw new TypeError('the third argument must be a positive integer');
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
        * @type {PositiveInteger}
        */
        this._x = x;
        
        /**
        * The cell's y coordinate within the automaton.
        *
        * This property should be treated as read-only.
        *
        * @private
        * @type {PositiveInteger}
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
    * @throws {Error} An error is thrown if the accessor is called with arguments.
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
    * @returns {PositiveInteger}
    * @throws {Error} An error is thrown if the accessor is called with arguments.
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
    * @returns {PositiveInteger}
    * @throws {Error} An error is thrown if the accessor is called with arguments.
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
    * @returns {Array} An array of length two with the x coordinate as the first
    * value and the y coordinate as the second.
    * @throws {Error} An error is thrown if the accessor is called with arguments.
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
    * @throws {Error} An error is thrown if the accessor is called with arguments.
    */
    bartificer.ca.Cell.prototype.state = function(){
        if(arguments.length > 0){
            throw new Error('read-only acessor called with arguments');
        }
        return this._state;
    };
    
    /**
    * Accessor function for the cell's next state. Always returns the next stae
    * of the cell. If an argument is passed, the next state is updated to that
    * value and then returned.
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
    * An object containing metadata about each of the valid options an
    * automaton can accept.
    *
    * The keys of the object are the names of the options, and each points to
    * another plain object indexed by the following values:
    *
    * * `description` - a string containing a description of the data expected
    *   for the option which will be used in error messages.
    * * `default` - the default value for the option.
    * * `validator` - a reference to a function that accepts one argument,
    *   and returns a boolean. The function will be used to test if values are
    *   valid for the option
    * * `onChange` - (OPTIONAL) a reference to a function that will be called
    *   each time the option's value is set. When the function is called, the
    *   special `this` variable will be set to a reference to the Automaton
    *   object to which the option belongs, and the new value for the option
    *   will be passed as the first argument.
    *
    * @memberof bartificer
    * @inner
    * @private
    * @type {plainObject}
    */
    var optionDetails = {
        width: {
            description: 'the width of the automaton in cells as an integer with a value greater than or equal to one',
            default: 20,
            validator: isGridDimension
        },
        height: {
            description: 'the height of the automaton in cells as an integer with a value greater than or equal to one',
            default: 20,
            validator: isGridDimension
        }
    };
    
    /**
    * Transform a `div` into a Cellular Automaton and build an object to
    * represent it.
    *
    * When the transformation is compelte, the `div` will have the CSS class
    * `bartificer-ca-automaton` added to it. A reverence to the constructed
    * object will also be added into the element as the data element
    * `data-obj`.
    *
    * @constructor
    * @param  {jQuerySingleDiv} $container - A jQuery object representing
    * a single `div` element which will act as the container for the cellular
    * automaton. Note that the container will be emptied.
    * @param  {plainObject} [options={}] An optional plain object containing
    * configuration options. For each supported option, there is also a
    * matching data attribute which can be set on the container. Values passed
    * to the constructor take precedence over values specified with data
    * attributes.
    * @param {GridDimension} [options.width=20] The width of the automaton in
    * cells.
    * @param {GridDimension} [options.height=20] The height of the automaton in
    * cells.
    * @throws {TypeError} An error is thrown if the first argument is not
    * present and valid, and if the second argument is present but not valid.
    * @throws {Error} An error is thrown if the container has already been
    * initialised as an automaton.
    * @example
    * // convert the HTML element with the ID ca1 into a cellular automaton
    * // with all the default settings
    * var ca1 = new bartificer.ca.CelluarAutomaton($('#ca1'));
    *
    * // convert the HTML element with the ID ca2 into a cellular automaton
    * // with a width of 100 cells and a height of 50 cells
    * var ca2 = new bartificer.ca.CelluarAutomaton(
    *     $('#ca2'),
    *     {
    *         width: 100,
    *         height: 50
    *     }
    * );
    */
    bartificer.ca.Automaton = function($container, opts){
        // validate arguments
        if(!isJQuerySingleDiv($container)){
            throw new TypeError('the first argument must be a jQuery object representing exactly one div');
        }
        if(typeof opts !== 'undefined' && !isPlainObject(opts)){
            throw new TypeError("if present, the second argument must be a plain object");
        }
        
        // initialise all the options
        opts = opts ? opts : {};
        this._options = {};
        // LEFT OFF HERE
        
        // initialise the grid
        this._$container = $container.empty();
        this._grid = [];
    };
})(bartificer, jQuery);