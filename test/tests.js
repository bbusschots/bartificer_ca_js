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