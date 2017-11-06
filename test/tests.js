//
//=== Global Variables & Helper Funtions ======================================
//

// A library of dummy data and related functions to speed up data validation
// tests (values re-set for each test)
var DUMMY_DATA = {};
var DUMMY_BASIC_TYPES = {};
QUnit.testStart(function() {
    DUMMY_DATA = {
        undef: {
            desc: 'undefined',
            val: undefined
        },
        bool: {
            desc: 'a boolean',
            val: true
        },
        num: {
            desc: 'a number',
            val: 42,
        },
        str_empty: {
            desc: 'an empty string',
            val: ''
        },
        str: {
            desc: 'a generic string',
            val: 'boogers!'
        },
        arr_empty: {
            desc: 'an emptyy array',
            val: [],
        },
        arr: {
            desc: 'an array',
            val: [1, 2, 3],
        },
        obj_empty: {
            desc: 'an empty plain object',
            val: {},
        },
        obj: {
            desc: 'a plain object',
            val: {b: 'boogers'}
        },
        obj_proto: {
            desc: 'a prototyped object',
            val: new Error('dummy error object')
        },
        obj_jQuery_empty: {
            desc: 'an empty jQuery object',
            val: $()
        },
        fn: {
            desc: 'a function object',
            val: function(a,b){ return a + b; }
        }
    };
    DUMMY_BASIC_TYPES = {
        undef: DUMMY_DATA.undef, 
        bool: DUMMY_DATA.bool,
        num: DUMMY_DATA.num,
        str: DUMMY_DATA.str,
        arr: DUMMY_DATA.arr,
        obj: DUMMY_DATA.obj,
        fn: DUMMY_DATA.fn
    };
});

// -- Function --
// Purpose    : return the names of all dummy basic types not explicitly
//              excluded as an array.
// Returns    : An array of strings.
// Arguments  : 1..n) OPTIONAL - names to exclude from the returned array
// Throws     : NOTHING
// Notes      :
// See Also   :
function dummyBasicTypesExcept(){
    // build and exclusion lookup from the arguments
    var exclude_lookup = {};
    for(var i = 0; i < arguments.length; i++){
        exclude_lookup[arguments[i]] = true;
    }
    
    // build the list of type names not excluded
    var ans = [];
    Object.keys(DUMMY_BASIC_TYPES).sort().forEach(function(tn){
        if(!exclude_lookup[tn]){
            ans.push(tn); // save the type name if not excluded
        }
    });
    
    // return the calculated list
    return ans;
}

//
// === General Tests ==========================================================
//

QUnit.test('namespace exists', function(a){
    a.expect(2);
    a.strictEqual(typeof bartificer, 'object', 'bartificer namespace exists');
    a.strictEqual(typeof bartificer.ca, 'object', 'bartificer.ca namespace exists');
});

//
// === The Cell Prototype =====================================================
//

QUnit.module('bartificer.ca.Cell prototype', {}, function(){
    //
    // --- The Constructor ---
    //
    QUnit.module('constructor', {}, function(){
        QUnit.test('function exists', function(a){
            a.strictEqual(typeof bartificer.ca.Cell, 'function', "has typeof 'function'");
        });
        
        QUnit.test('argument processing', function(a){
            a.expect(10);
            
            // make sure required arguments are indeed required
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell();
                },
                TypeError,
                'throws error when called with no arguments'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($('<td></td>'));
                },
                TypeError,
                'throws error when called without second argument'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($('<td></td>'), 10);
                },
                TypeError,
                'throws error when called without third argument'
            );
            
            // make sure valid values for all required arguments are allowed
            a.ok(new bartificer.ca.Cell($('<td></td>'), 10, 10), "valid arguments don't throw error");
            
            // make sure optional arguments are allowed
            a.ok(new bartificer.ca.Cell($('<td></td>'), 0, 0, true), 'presence of optional fourth argument does not trow an error');
            
            // make sure all values passed are properly stored
            var $td = $('<td></td>');
            var x = 0;
            var y = 0;
            var s = 'boogers';
            var c1 = new bartificer.ca.Cell($td, x, y, s);
            a.strictEqual(c1._$td, $td, 'the first argument ($td) was correctly stored within the object');
            a.strictEqual(c1._x, x, 'the x coordinate was correctly stored within the object');
            a.strictEqual(c1._y, y, 'the y coordinate was correctly stored within the object');
            a.strictEqual(c1._state, s, 'the initial state was correctly stored within the object');
            a.strictEqual(c1._nextState, undefined, 'the next state is undefined');
        });
        
        QUnit.test('$td validation', function(a){
            var mustThrow = dummyBasicTypesExcept('obj');
            
            a.expect(mustThrow.length + 4);
            
            // make sure all the basic types except object throw an error
            mustThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    function(){
                        var c1 = new bartificer.ca.Cell(t.val, 0, 0);
                    },
                    TypeError,
                    '$td cannot be ' + t.desc
                );
            });
            
            // make sure an object that is not a jQuery object throws an error
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell(DUMMY_DATA.obj_proto.val, 0, 0);
                },
                TypeError,
                '$td cannot be a reference to an object with a prototype other than jQuery'
            );
            
            // make sure an empty jQuery object is not accepted
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell(DUMMY_DATA.obj_jQuery_empty.val, 0, 0);
                },
                TypeError,
                '$td cannot be a reference to a empty jQuery object'
            );
            
            // make sure a jQuery object representing multiple elements will not be accepted
            var $multi = $().add($('<td></td>')).add($('<td></td>'));
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($multi, 0, 0);
                },
                TypeError,
                '$td cannot be a reference to a jQuery object representing multiple table data cells'
            );
            
            // make sure a jQuery object representing something other than a td throws an error
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($('<p></p>'), 0, 0);
                },
                TypeError,
                '$td cannot be a reference to a jQuery object representing a paragraph'
            );
        });
        
        QUnit.test('coordinate validation', function(a){
            var mustThrow = dummyBasicTypesExcept('num');
            
            a.expect((mustThrow.length * 2) + 6);
            
            var $td = $('<td></td>');
            
            // make sure all the basic types except number throw an error
            mustThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    function(){
                        var c1 = new bartificer.ca.Cell($td, t.val, 0);
                    },
                    TypeError,
                    'x coordinate cannot be ' + t.desc
                );
                a.throws(
                    function(){
                        var c1 = new bartificer.ca.Cell($td, 0, t.val);
                    },
                    TypeError,
                    'y coordinate cannot be ' + t.desc
                );
            });
            
            // make sure negative numbers throw an error
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($td, -1, 0);
                },
                TypeError,
                'x coordinate cannot be negative'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($td, 0, -1);
                },
                TypeError,
                'y coordinate cannot be negative'
            );
            
            // make sure decimal numbers throw an error
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($td, Math.PI, 0);
                },
                TypeError,
                'x coordinate cannot be a non-integer number'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Cell($td, 0, Math.PI);
                },
                TypeError,
                'y coordinate cannot be a non-integer number'
            );
            
            // make sure 0 is allowed
            a.ok(new bartificer.ca.Cell($td, 0, 0), 'x and y coordiantes can be 0');
            
            // make sure positive numbers are allowed
            a.ok(new bartificer.ca.Cell($('<td></td>'), 42, 42), 'x and y coordiantes can be 42');
        });
        
        QUnit.test('check DOM alterations', function(a){
            a.expect(2);
            
            // create a table data cell
            var $td = $('<td></td>');
            
            // create a Cell
            var c1 = new bartificer.ca.Cell($td, 0, 0);
            
            // make sure the expect class was added
            a.ok($td.hasClass('bartificer-ca-cell'), "the class 'bartificer-ca-cell' was added");
            
            // make sure the data attribute was added
            a.strictEqual($td.data('bartificerObject'), c1, 'reference to object added as data attribute');
        });
        
        QUnit.test('reinitialisation prevented', function(a){
            var $td = $('<td></td>');
            var c1 = new bartificer.ca.Cell($td, 0, 0);
            
            // make sure an error is thrown if there is an attempt to re-use the same TD
            a.throws(
                function(){ var c2 = new bartificer.ca.Cell($td, 0, 1); },
                Error,
                'an error is thrown if an attempt is made to use the same table data cell for a second Cell object'
            );
        });
    });
    
    QUnit.module(
        'read-only accessors',
        {
            beforeEach: function(){
                this.$td = $('<td></td>');
                this.x = 10;
                this.y = 20;
                this.c1 = new bartificer.ca.Cell(this.$td, this.x, this.y);
            }
        },
        function(){
            QUnit.test('.$td()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.c1.$td, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.c1.$td(), this.$td, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.c1.$td($('<td></td>')); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.x()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.c1.x, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.c1.x(), this.x, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.c1.x(30); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.y()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.c1.y, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.c1.y(), this.y, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.c1.y(40); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.coordinates()', function(a){
                a.expect(4);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.c1.coordinates, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.deepEqual(this.c1.coordinates(), [this.x, this.y], 'returns the expected value');
                
                // make sure attempts to set values throw a Errors
                a.throws(
                    function(){ this.c1.coordinates([30, 40]); },
                    Error,
                    'attempt to set with one argumet throws error'
                );
                a.throws(
                    function(){ this.c1.coordinates(30, 40); },
                    Error,
                    'attempt to set with two argumets throws error'
                );
            });
        }
    );
    
    QUnit.module('state accessors and functions', {}, function(){
        QUnit.test('.state()', function(a){
            a.expect(4);
            
            var s = 'boogers';
            var c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0, s);
            
            // make sure the accessor exists
            a.strictEqual(typeof c1.state, 'function', 'function exists');
            
            // make sure the accessor reads correctly
            a.strictEqual(c1.state(), s, 'returns the expected value when the cell has a current state');
            var c2 = new bartificer.ca.Cell($('<td></td>'), 0, 0);
            a.strictEqual(c2.state(), undefined, 'returns undefined value when the cell has no current state');
            
            // make sure attempts to set a value throw an Error
            a.throws(
                function(){ c1.state('snot'); },
                Error,
                'attempt to set throws error'
            );
        });
        
        QUnit.test('.nextState()', function(a){
            a.expect(5);
            
            var s = 'boogers';
            var c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0);
            
            // make sure the accessor exists
            a.strictEqual(typeof c1.nextState, 'function', 'function exists');
            
            // check that the getter works when there is no next state
            a.strictEqual(c1.nextState(), undefined, 'get mode returns undefined when there is no next state');
            
            // set the next state to a value and make sure we get it back
            a.strictEqual(c1.nextState(s), s, 'successfully set a next state');
            
            // check that the getter works when there is a next state
            a.strictEqual(c1.nextState(), s, 'get mode returns expected valuen when there is a next state');
            
            // check that the setter allows the next state to be set to undefined
            a.strictEqual(c1.nextState(undefined), undefined, 'successfully set a next state to undefined');
        });
        
        QUnit.test('.hasNextState()', function(a){
            a.expect(3);
            
            var c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0);
            
            // make sure the function exists
            a.strictEqual(typeof c1.hasNextState, 'function', 'function exists');
            
            // make sure false is returned when there is no next state defined
            a.strictEqual(c1.hasNextState(), false, 'false returned when the cell has no next state');
            
            // set a next state and make sure the function now returns true
            c1.nextState('boogers');
            a.strictEqual(c1.hasNextState(), true, 'true returned when the cell has a next state');
        });
        
        QUnit.test('.advance()', function(a){
            a.expect(5);
            
            var s1 = 'boogers';
            var s2 = 'snot';
            var c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0, s1);
            
            // make sure the function exists
            a.strictEqual(typeof c1.nextState, 'function', 'function exists');
            
            // make sure an error is thrown if there is an attempt to advance when there is no next state
            a.throws(
                function(){
                    c1.advance();
                },
                Error,
                'an error is thrown when attempting to advance to an undefined next state'
            );
            
            // set a next state and make sure we advance to it correctly
            c1.nextState(s2);
            a.strictEqual(c1.advance(), c1, 'advanced and received reference to self as returned value');
            a.strictEqual(c1.state(), s2, 'cell has expected new state');
            a.strictEqual(c1.hasNextState(), false, 'cell has no next state');
        });
    });
});

//
// === The Automaton Prototype ================================================
//

QUnit.module('bartificer.ca.Automaton prototype', {}, function(){
    //
    // --- The Constructor ---
    //
    QUnit.module('constructor', {}, function(){
        QUnit.test('function exists', function(a){
            a.strictEqual(typeof bartificer.ca.Automaton, 'function', "has typeof 'function'");
        });
        
        QUnit.test('argument processing', function(a){
            a.expect(17);
            
            // make sure required arguments are indeed required
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Automaton();
                },
                TypeError,
                'throws error when called with no arguments'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Automaton($('<div></div>'));
                },
                TypeError,
                'throws error when called without second argument'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Automaton($('<div></div>'), 10);
                },
                TypeError,
                'throws error when called without third argument'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Automaton($('<div></div>'), 10, 10);
                },
                TypeError,
                'throws error when called without fourth argument'
            );
            a.throws(
                function(){
                    var c1 = new bartificer.ca.Automaton($('<div></div>'), 10, 10, function(){});
                },
                TypeError,
                'throws error when called without fifth argument'
            );
            
            // make sure valid values for all required arguments are allowed
            a.ok(new bartificer.ca.Automaton($('<div></div>'), 10, 10, function(){}, function(){}), "valid arguments don't throw error");
            
            // make sure optional arguments are allowed
            a.ok(new bartificer.ca.Automaton($('<div></div>'), 10, 10, function(){}, function(){}, true), 'presence of optional sixth argument does not trow an error');
            
            // make sure all values passed are properly stored
            var $div = $('<div></div>');
            var r = 10;
            var c = 10;
            var sFn = function(){ return true; };
            var rFn = function(){};
            var s = true;
            var ca1 = new bartificer.ca.Automaton($div, r, c, sFn, rFn, s);
            a.strictEqual(ca1._$container, $div, 'the container was correctly stored within the object');
            a.strictEqual(ca1._rows, r, 'the number of rows was correctly stored within the object');
            a.strictEqual(ca1._cols, c, 'the number of columns was correctly stored within the object');
            a.strictEqual(ca1._stepFn, sFn, 'the step function was correctly stored within the object');
            a.strictEqual(ca1._renderFn, rFn, 'the render function was correctly stored within the object');
            
            // make sure the optional initial state is properly applied
            var allCellsOK = true;
            var x, y;
            for(x = 0; x < c && allCellsOK; x++){
                for(y = 0; y < r; y++){
                    if(ca1.cell(x, y).state() !== s) allCellsOK = false;
                }
            }
            a.ok(allCellsOK, 'single initial state correctly applied to all cells');
            var initStates = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 8]
            ];
            var ca2 = new bartificer.ca.Automaton($('<div></div>'), 3, 3, sFn, rFn, initStates);
            allCellsOK = true;
            for(x = 0; x < 3 && allCellsOK; x++){
                for(y = 0; y < 3; y++){
                    if(ca2.cell(x, y).state() !== initStates[x][y]) allCellsOK = false;
                }
            }
            a.ok(allCellsOK, '2D array of initial states correctly applied to all cells');
            var ca3 = new bartificer.ca.Automaton($('<div></div>'), 3, 3, sFn, rFn, function(x, y){
                return x + ', ' + y;
            });
            allCellsOK = true;
            for(x = 0; x < 3 && allCellsOK; x++){
                for(y = 0; y < 3; y++){
                    if(ca3.cell(x, y).state() !== x + ', ' + y) allCellsOK = false;
                }
            }
            a.ok(allCellsOK, 'Initialisation function correctly applied to all cells');
            
            // make sure the auto-step variables initialise to the expected default values
            a.strictEqual(ca1._autoStepID, 0, 'auto step timout ID initialised to zero');
            a.strictEqual(ca1._autoStepMS, 500, 'auto step timout initialised to 500MS');
        });
        
        QUnit.test('$container validation', function(a){
            var mustThrow = dummyBasicTypesExcept('obj');
            var okTags = ['div', 'p', 'main', 'section'];
            
            a.expect(mustThrow.length + okTags.length + 4);
            
            // make sure all the basic types except object throw an error
            mustThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    function(){
                        var ca1 = new bartificer.ca.Automaton(t.val, 10, 10, function(){}, function(){});
                    },
                    TypeError,
                    '$container cannot be ' + t.desc
                );
            });
            
            // make sure an object that is not a jQuery object throws an error
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton(DUMMY_DATA.obj_proto.val, 10, 10, function(){}, function(){});
                },
                TypeError,
                '$container cannot be a reference to an object with a prototype other than jQuery'
            );
            
            // make sure an empty jQuery object is not accepted
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton(DUMMY_DATA.obj_jQuery_empty.val, 10, 10, function(){}, function(){});
                },
                TypeError,
                '$container cannot be a reference to a empty jQuery object'
            );
            
            // make sure a jQuery object representing multiple elements will not be accepted
            var $multi = $().add($('<div></div>')).add($('<div></div>'));
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($multi, 10, 10, function(){}, function(){});
                },
                TypeError,
                '$container cannot be a reference to a jQuery object representing multiple elements'
            );
            
            // make sure a jQuery object representing something other than a td throws an error
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($('<span></span>'), 10, 10, function(){}, function(){});
                },
                TypeError,
                '$container cannot be a reference to a jQuery object representing a span'
            );
            
            // make sure each acceptable element does not throw
            okTags.forEach(function(t){
                a.ok(
                    new bartificer.ca.Automaton($('<' + t + '></' + t + '>'), 10, 10, function(){}, function(){}),
                    '$container can be a ' + t
                );
            });
        });
        
        QUnit.test('grid dimension validation', function(a){
            var mustThrow = dummyBasicTypesExcept('num');
            
            a.expect((mustThrow.length * 2) + 8);
            
            var $div = $('<div></div>');
            var sFn = function(){};
            var rFn = function(){};
            
            // make sure all the basic types except number throw an error
            mustThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    function(){
                        var ca1 = new bartificer.ca.Automaton($div, t.val, 10, sFn, rFn);
                    },
                    TypeError,
                    'number of rows cannot be ' + t.desc
                );
                a.throws(
                    function(){
                        var ca1 = new bartificer.ca.Automaton($div, 10, t.val, sFn, rFn);
                    },
                    TypeError,
                    'number of columns cannot be ' + t.desc
                );
            });
            
            // make sure 0 throws an error
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($div, 0, 10, sFn, rFn);
                },
                TypeError,
                'number of rows cannot be zero'
            );
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($div, 10, 0, sFn, rFn);
                },
                TypeError,
                'number of columns cannot be zero'
            );
            
            // make sure negative numbers throw an error
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($div, -1, 10, sFn, rFn);
                },
                TypeError,
                'number of rows cannot be negative'
            );
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($div, 10, -1, sFn, rFn);
                },
                TypeError,
                'number of columns cannot be negative'
            );
            
            // make sure decimal numbers throw an error
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($div, Math.PI, 10, sFn, rFn);
                },
                TypeError,
                'number of rows cannot be a non-integer number'
            );
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($div, 10, Math.PI, sFn, rFn);
                },
                TypeError,
                'number of columns cannot be a non-integer number'
            );
            
            // make sure 1 is allowed
            a.ok(new bartificer.ca.Automaton($div, 1, 1, sFn, rFn), 'number or rows and columns can be 1');
            
            // make sure positive numbers are allowed
            a.ok(new bartificer.ca.Automaton($('<div></div>'), 42, 42, sFn, rFn), 'number of rows and columns can be 42');
        });
        
        QUnit.test('callback validation', function(a){
            var mustThrow = dummyBasicTypesExcept('fn');
            
            a.expect(mustThrow.length * 2);
            
            var $div = $('<div></div>');
            var r = 10;
            var c = 10;
            var fn = function(){};
            
            // make sure all the basic types except number throw an error
            mustThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    function(){
                        var ca1 = new bartificer.ca.Automaton($div, r, c, t.val, fn);
                    },
                    TypeError,
                    'step function cannot be ' + t.desc
                );
                a.throws(
                    function(){
                        var ca1 = new bartificer.ca.Automaton($div, r, c, fn, t.val);
                    },
                    TypeError,
                    'render function cannot be ' + t.desc
                );
            });
        });
        
        QUnit.test('initial state validation', function(a){
            var mustThrow = dummyBasicTypesExcept('bool', 'num', 'str', 'arr', 'fn', 'undef');
            var mustNotThrow = ['bool', 'num', 'str', 'fn'];
            
            a.expect(mustThrow.length + mustNotThrow.length + 4);
            
            var r = 2;
            var c = 2;
            var fn = function(){};
            
            // make sure all the disalowed basic types throw an error
            mustThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    function(){
                        var ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, t.val);
                    },
                    TypeError,
                    'initial state cannot be ' + t.desc
                );
            });
            
            // make sure allowed basic types don't throw (except array which is a little more complex)
            mustNotThrow.forEach(function(tn){
                var t = DUMMY_BASIC_TYPES[tn];
                a.ok(
                    new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, t.val),
                    'initial state can be ' + t.desc
                );
            });
            
            // make sure arrays of the wrong dimension throw
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, [true, true, true]);
                },
                TypeError,
                'initial state cannot be a 1D array'
            );
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, [[true], [true], [true]]);
                },
                TypeError,
                'initial state cannot be a 2D array of the wrong dimensions'
            );
            
            // make sure arrays containing even one invalid value throw
            a.throws(
                function(){
                    var ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, [[true, true], [[], true]]);
                },
                TypeError,
                'initial state cannot be a 2D array of the correct dimension containing an invalid value'
            );
            
            // make sure arrays with the correct dimension and no invalid data do not throw
            a.ok(
                new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, [[true, true], [true, true]]),
                'initial state can be a 2D array with the correct dimensions and all valid data'
            );
        });
        
        QUnit.test('grid was correctly initialised', function(a){
            var r = 2;
            var c = 2;
            var fn = function(){};
            a.expect(5);
            
            // build a sample CA
            var ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, true);
            
            // looping variables
            var x;
            var y;
            
            // make sure the grid has the right shape
            var shapeOK = true;
            for(x = 0; x < c && shapeOK; x++){
                // make sure top-level element is an array
                if($.isArray(ca1._grid[x])){
                    if(!ca1._grid[x].length === c){
                        shapeOK = false;
                    }
                }else{
                    shapeOK = false;
                }
            }
            a.ok(shapeOK, 'grid shape OK');
            if(!shapeOK){
                throw new Error('cannot continue with mis-shapen grid');
            }
            
            // make sure each element in the grid is a cell
            var allCellProtosOK = true;
            for(x = 0; x < c && allCellProtosOK; x++){
                for(y = 0; y < r && allCellProtosOK; y++){
                    if(!(ca1._grid[x][y] instanceof bartificer.ca.Cell)){
                        allCellProtosOK = false;
                    }
                }
            }
            a.ok(allCellProtosOK, 'all cells have prototype bartificer.ca.Cell');
            if(!allCellProtosOK){
                throw new Error('cannot continue with improperly initialised grid');
            }
            
            // check initialisation with single state
            var singleStateOK = true;
            for(x = 0; x < c && singleStateOK; x++){
                for(y = 0; y < r && singleStateOK; y++){
                    if(ca1._grid[x][y].state() !== true){
                        singleStateOK = false;
                    }
                }
            }
            a.ok(singleStateOK, 'All cells in CA created with single-value initial state have the expected state');
            
            // check initialation with array of states
            var stateArray = [['1', '2'], ['3', '4']];
            var ca2 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, stateArray);
            var stateArrayOK = true;
            for(x = 0; x < c && stateArrayOK; x++){
                for(y = 0; y < r && stateArrayOK; y++){
                    if(ca2._grid[x][y].state() !== stateArray[x][y]){
                        stateArrayOK = false;
                    }
                }
            }
            a.ok(stateArrayOK, 'All cells in CA created with an array of initial states have the expected state');
            
            // check initialisation with function
            var stateCB = function(x, y){
                return 'x=' + x + ' & y=' + y;
            };
            var ca3 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn, stateCB);
            var stateCBOK = true;
            for(x = 0; x < c && stateCBOK; x++){
                for(y = 0; y < r && stateCBOK; y++){
                    if(ca3._grid[x][y].state() !== stateCB(x, y)){
                        stateCBOK = false;
                    }
                }
            }
            a.ok(stateCBOK, 'All cells in CA created with an initial state function have the expected state');
        });
        
        QUnit.test('table was correctly generated', function(a){
            a.expect(2);
            var r = 4;
            var c = 4;
            var fn = function(){};
            var ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, fn);
            a.equal($('table', ca1.$container()).length, 1, 'exactly one table in container');
            a.equal($('td', ca1.$container()).length, r * c, 'correct number of table data cells in container');
        });
        
        QUnit.test('check DOM alterations', function(a){
            a.expect(4);
            
            var $div = $('<div></div>');
            var r = 4;
            var c = 4;
            var fn = function(){};
            
            // create an automaton
            var ca1 = new bartificer.ca.Automaton($div, r, c, fn, fn);
            
            // make sure the expect class was added to the container & table
            a.ok($div.hasClass('bartificer-ca-container'), "the class 'bartificer-ca-container' was added to the container");
            a.ok(ca1.$table().hasClass('bartificer-ca-automaton'), "the class 'bartificer-ca-automaton' was added to the generated table");
            
            // make sure the data attribute was added to the container & table
            a.strictEqual($div.data('bartificerObject'), ca1, 'reference to object added as data attribute on container');
            a.strictEqual(ca1.$table().data('bartificerObject'), ca1, 'reference to object added as data attribute on generated table');
        });
        
        QUnit.test('reinitialisation prevented', function(a){
            var $div = $('<div></div>');
            var r = 4;
            var c = 4;
            var fn = function(){};
            var ca1 = new bartificer.ca.Automaton($div, r, c, fn, fn);
            
            // make sure an error is thrown if there is an attempt to re-use the same div
            a.throws(
                function(){ var c2 = new bartificer.ca.Automaton($div, r, c, fn, fn); },
                Error,
                'an error is thrown if an attempt is made to use the same div for a second Automaton object'
            );
        });
    });
    
    QUnit.module(
        'read-only accessors',
        {
            beforeEach: function(){
                this.$div = $('<div></div>');
                this.r = 4;
                this.c = 2;
                this.sFn = function(){ return true; };
                this.rFn = function(){};
                this.ca1 = new bartificer.ca.Automaton(this.$div, this.r, this.c, this.sFn, this.rFn, true);
            }
        },
        function(){
            QUnit.test('.$container()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.$container, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.$container(), this.$div, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.ca1.$container($('<p></p>')); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.rows()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.rows, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.rows(), this.r, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.ca1.rows(5); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.cols()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.cols, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.cols(), this.c, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.ca1.cols(5); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.dimensions()', function(a){
                a.expect(4);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.dimensions, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.deepEqual(this.ca1.dimensions(), [this.c, this.r], 'returns the expected value');
                
                // make sure attempts to set values throw a Errors
                a.throws(
                    function(){ this.ca1.dimensions([3, 5]); },
                    Error,
                    'attempt to set with one argumet throws error'
                );
                a.throws(
                    function(){ this.ca1.dimensions(3, 5); },
                    Error,
                    'attempt to set with two argumets throws error'
                );
            });
            QUnit.test('.stepFunction()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.stepFunction, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.stepFunction(), this.sFn, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.ca1.stepFunction(function(){}); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.renderFunction()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.renderFunction, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.renderFunction(), this.rFn, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    function(){ this.ca1.renderFunction(function(){}); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.cell()', function(a){
                a.expect(2);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.cell, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.cell(1, 2), this.ca1._grid[1][2], 'returns the expected value');
            });
            QUnit.test('.cellState()', function(a){
                a.expect(2);
                
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.cellState, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                var initStates = [[1, 2], [3, 4]];
                var ca2 = new bartificer.ca.Automaton($('<div></div>'), 2, 2, this.sFn, this.rFn, initStates);
                a.strictEqual(ca2.cellState(0, 1), initStates[0][1], 'returns the expected value');
            });
            QUnit.test('.cellNeighbourStates()', function(a){
                a.expect(6);
                
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.cellNeighbourStates, 'function', 'function exists');
                
                // build a CA to test against
                var stateArray = [
                    [1,  6, 11, 16],
                    [2,  7, 12, 17],
                    [3,  8, 13, 18],
                    [4,  9, 14, 19],
                    [5, 10, 15, 20]
                ];
                // above represents grid:
                //  1  2  3  4  5
                //  6  7  8  9 10
                // 11 12 13 14 15
                // 16 17 18 19 20
                var ca = new bartificer.ca.Automaton($('<div></div>'), 4, 5, this.sFn, this.rFn, stateArray);
                
                // check an internal cell
                a.deepEqual(ca.cellNeighbourStates(3, 2), [9, 10, 15, 20, 19, 18, 13, 8], 'internal cell OK');
                
                // check the four corners
                a.deepEqual(ca.cellNeighbourStates(0, 0), [null, null, 2, 7, 6, null, null, null], 'top-left corner OK');
                a.deepEqual(ca.cellNeighbourStates(4, 0), [null, null, null, null, 10, 9, 4, null], 'top-right corner OK');
                a.deepEqual(ca.cellNeighbourStates(4, 3), [15, null, null, null, null, null, 19, 14], 'bottom-right corner OK');
                a.deepEqual(ca.cellNeighbourStates(0, 3), [11, 12, 17, null, null, null, null, null], 'bottom-left corner OK');
            });
            QUnit.test('.step()', function(a){
                a.expect(1);
                
                // create a CA with a step function that increments the state by 1
                var stateArrayPre = [
                    [1,  6, 11, 16, 21],
                    [2,  7, 12, 17, 22],
                    [3,  8, 13, 18, 23],
                    [4,  9, 14, 19, 24],
                    [5, 10, 15, 20, 25]
                ];
                var stateArrayPost = [
                    [2,  7, 12, 17, 22],
                    [3,  8, 13, 18, 23],
                    [4,  9, 14, 19, 24],
                    [5, 10, 15, 20, 25],
                    [6, 11, 16, 21, 26]
                ];
                var ca = new bartificer.ca.Automaton($('<div></div>'), 5, 5, function(s){ return s + 1; }, function(){ }, stateArrayPre);
                
                // step the CA
                ca.step();
                
                // make sure each state was incremented by 1
                var allOK = true;
                for(var x = 0; x < 5; x++){
                    for(var y = 0; y < 5; y++){
                        if(ca.cellState(x, y) !== stateArrayPost[x][y]) allOK = false;
                    }
                }
                a.ok(allOK, 'all cells were stepped correctly');
            });
        }
    );
    
    QUnit.test('.setState()', function(a){
        a.expect(3);
        var $div = $('<div></div>');
        var r = 3;
        var c = 3;
        var sFn = function(){ return true; };
        var rFn = function(){};
        var allCellsOK = true;
        var x, y;
        var ca = new bartificer.ca.Automaton($div, r, c, sFn, rFn, true);
        
        // test when given a single state
        ca.setState('boogers');
        for(x = 0; x < c && allCellsOK; x++){
            for(y = 0; y < r; y++){
                if(ca.cell(x, y).state() !== 'boogers') allCellsOK = false;
            }
        }
        a.ok(allCellsOK, 'single initial state correctly applied to all cells');
        
        // test when given a grid of states
        var initStates = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 8]
        ];
        ca.setState(initStates);
        allCellsOK = true;
        for(x = 0; x < c && allCellsOK; x++){
            for(y = 0; y < r; y++){
                if(ca.cell(x, y).state() !== initStates[x][y]) allCellsOK = false;
            }
        }
        a.ok(allCellsOK, '2D array of initial states correctly applied to all cells');
        
        // test when given a callback
        ca.setState(function(x, y){    
            return x + ', ' + y;
        });
        allCellsOK = true;
        for(x = 0; x < 3 && allCellsOK; x++){
            for(y = 0; y < 3; y++){
                if(ca.cell(x, y).state() !== x + ', ' + y) allCellsOK = false;
            }
        }
        a.ok(allCellsOK, 'Initialisation function correctly applied to all cells');
    });
    
    QUnit.test('.autoStepIntervalMS()', function(a){
        var mustThrow = dummyBasicTypesExcept('num');
        a.expect(7 + mustThrow.length);
            
        var ca = new bartificer.ca.Automaton($('<div></div>'), 5, 5, function(s){ return s + 1; }, function(){ });
            
        // make sure the accessor exists
        a.strictEqual(typeof ca.autoStepIntervalMS, 'function', 'function exists');
            
        // check that the getter fetches the default value
        a.strictEqual(ca.autoStepIntervalMS(), 500, 'get mode returns expected default value');
            
        // set a new valid interval and make sure we get it back
        a.strictEqual(ca.autoStepIntervalMS(100), 100, 'successfully set a new interval');
            
        // make sure all the disalowed basic types throw an error
        mustThrow.forEach(function(tn){
            var t = DUMMY_BASIC_TYPES[tn];
            a.throws(
                function(){
                    ca.autoStepIntervalMS(t);
                },
                TypeError,
                'interval cannot be ' + t.desc
            );
        });
        
        // make sure non-integers throw an error
        a.throws(
            function(){
                ca.autoStepIntervalMS(Math.PI);
            },
            TypeError,
            'interval cannot be a non-integer'
        );
        
        // make sure negative numbers throw an error
        a.throws(
            function(){
                ca.autoStepIntervalMS(-1);
            },
            TypeError,
            'interval cannot be negative'
        );
        
        // make sure zero throws an error
        a.throws(
            function(){
                ca.autoStepIntervalMS(0);
            },
            TypeError,
            'interval cannot be zero'
        );
        
        // make sure one doesn't throw an error
        a.ok(ca.autoStepIntervalMS(1), 'interval can be one');
    });
});