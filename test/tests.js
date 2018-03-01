//
//=== Global Variables & Helper Funtions ======================================
//

// A library of dummy data and related functions to speed up data validation
// tests (values re-set for each test)
let DUMMY_DATA = {};
let DUMMY_BASIC_TYPES = {};
QUnit.testStart(()=>{
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
function dummyBasicTypesExcept(...excludeTypes){
    // build and exclusion lookup from the arguments
    const exclude_lookup = {};
    excludeTypes.forEach((et)=>{ exclude_lookup[et] = true; });
    
    // build the list of type names not excluded
    const ans = [];
    Object.keys(DUMMY_BASIC_TYPES).sort().forEach((tn)=>{
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

QUnit.test('namespace exists', (a)=>{
    a.expect(2);
    a.strictEqual(typeof bartificer, 'object', 'bartificer namespace exists');
    a.strictEqual(typeof bartificer.ca, 'object', 'bartificer.ca namespace exists');
});

//
// === The State Prototype ====================================================
//

QUnit.module('bartificer.ca.State prototype', {}, ()=>{
    //
    // --- The Constructor ---
    //
    QUnit.module('constructor', {}, ()=>{
        QUnit.test('function exists', (a)=>{
            a.strictEqual(typeof bartificer.ca.State, 'function', "has typeof 'function'");
        });
        
        QUnit.test('argument processing', (a)=>{
            a.expect(5);
            
            // make sure required arguments are indeed required
            a.throws(
                ()=>{ const s1 = new bartificer.ca.State(); },
                TypeError,
                'throws error when called with no arguments'
            );
            a.throws(
                ()=>{ const s1 = new bartificer.ca.State(true); },
                TypeError,
                'throws error when called without second argument'
            );
            
            // make sure valid values for all required arguments are allowed
            a.ok(new bartificer.ca.State(true, 'alive'), "valid arguments don't throw error");
            
            // make sure all values passed are properly stored
            const v = 'boogers';
            const l = 'Boogers';
            
            const s1 = new bartificer.ca.State(v, l);
            a.strictEqual(s1._value, v, 'the value was correctly stored within the object');
            a.strictEqual(s1._label, l, 'the label was correctly stored within the object');
        });
        
        QUnit.test('value validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('bool', 'num', 'str');
            
            a.expect(mustThrow.length);
            
            // make sure all the basic types except the primitives throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const s1 = new bartificer.ca.State(t.val, 'dummy value'); },
                    TypeError,
                    `value cannot be ${t.desc}`
                );
            });
        });
        
        QUnit.test('label validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('str');
            
            a.expect(mustThrow.length + 1);
            
            // make sure all the basic types except string throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const s1 = new bartificer.ca.State(true, t.val); },
                    TypeError,
                    `label cannot be ${t.desc}`
                );
            });
            
            // make sure an empty string throws an error
            a.throws(
                ()=>{ const s1 = new bartificer.ca.State(true, ''); },
                TypeError,
                'label cannot be an empty string'
            );
        });
    });
    
    QUnit.module(
        'read-only accessors',
        {
            beforeEach: function(){
                this.v = true;
                this.l = 'Alive';
                this.s1 = new bartificer.ca.State(this.v, this.l);
            }
        },
        ()=>{
            QUnit.test('.value()', function(a){
                a.expect(2);
                a.strictEqual(typeof this.s1.value, 'function', 'function exists');
                a.strictEqual(this.s1.value(), this.v, 'returns the expected value');
            });
            QUnit.test('.label()', function(a){
                a.expect(2);
                a.strictEqual(typeof this.s1.label, 'function', 'function exists');
                a.strictEqual(this.s1.label(), this.l, 'returns the expected value');
            });
        }
    );
    
    QUnit.test('.toString()', (a)=>{
        a.expect(2);
        a.strictEqual(typeof bartificer.ca.State.prototype.toString, 'function', 'function exists');
        const s1 = new bartificer.ca.State(true, 'Alive');
        a.strictEqual(s1.toString(), 'Alive (true)', 'returns expected value');
    });
    
    QUnit.test('.clone()', (a)=>{
        a.expect(4);
        a.strictEqual(typeof bartificer.ca.State.prototype.clone, 'function', 'function exists');
        const s1 = new bartificer.ca.State(true, 'Alive');
        const s2 = s1.clone();
        a.notStrictEqual(s1, s2, 'clone is not a reference to the original');
        a.strictEqual(s1._value, s2._value, 'value correctly cloned');
        a.strictEqual(s1._label, s2._label, 'label correctly cloned');
    });
    
    QUnit.test('.equals()', (a)=>{
        a.expect(9);
        a.strictEqual(typeof bartificer.ca.State.prototype.equals, 'function', 'function exists');
        const s1 = new bartificer.ca.State(true, 'Alive');
        a.strictEqual(s1.equals(), false, 'no arguments returns false');
        a.strictEqual(s1.equals(new Date()), false, 'non-State object not considered equal');
        a.strictEqual(s1.equals(new bartificer.ca.State(false, 'Dead')), false, 'different value and label not considered equal');
        a.strictEqual(s1.equals(new bartificer.ca.State(42, 'Alive')), false, 'different value but same label not considered equal');
        a.strictEqual(s1.equals(new bartificer.ca.State(true, 'very alive')), false, 'same value but different label not considered equal');
        a.strictEqual(s1.equals(new bartificer.ca.State('true', 'Alive')), false, 'different types of same and same label not considered equal');
        a.strictEqual(s1.equals(s1), true, 'reference to self considered equal to self');
        a.strictEqual(s1.equals(new bartificer.ca.State(true, 'Alive')), true, 'new State with same value and label considered equal');
    });
});

//
// === The Cell Prototype =====================================================
//

QUnit.module('bartificer.ca.Cell prototype', {}, ()=>{
    //
    // --- The Constructor ---
    //
    QUnit.module('constructor', {}, ()=>{
        QUnit.test('function exists', (a)=>{
            a.strictEqual(typeof bartificer.ca.Cell, 'function', "has typeof 'function'");
        });
        
        QUnit.test('argument processing', (a)=>{
            a.expect(10);
            
            // make sure required arguments are indeed required
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell(); },
                TypeError,
                'throws error when called with no arguments'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($('<td></td>')); },
                TypeError,
                'throws error when called without second argument'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($('<td></td>'), 10); },
                TypeError,
                'throws error when called without third argument'
            );
            
            // make sure valid values for all required arguments are allowed
            a.ok(new bartificer.ca.Cell($('<td></td>'), 10, 10), "valid arguments don't throw error");
            
            // make sure optional arguments are allowed
            a.ok(new bartificer.ca.Cell($('<td></td>'), 0, 0, new bartificer.ca.State(true, 'Alive')), 'presence of optional fourth argument does not trow an error');
            
            // make sure all values passed are properly stored
            const $td = $('<td></td>');
            const x = 0;
            const y = 0;
            const s = new bartificer.ca.State(true, 'Alive');
            const c1 = new bartificer.ca.Cell($td, x, y, s);
            a.strictEqual(c1._$td, $td, 'the first argument ($td) was correctly stored within the object');
            a.strictEqual(c1._x, x, 'the x coordinate was correctly stored within the object');
            a.strictEqual(c1._y, y, 'the y coordinate was correctly stored within the object');
            a.strictEqual(c1._state._value, s._value, 'the initial state was correctly stored within the object');
            a.strictEqual(c1._nextState, undefined, 'the next state is undefined');
        });
        
        QUnit.test('$td validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('obj');
            
            a.expect(mustThrow.length + 4);
            
            // make sure all the basic types except object throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const c1 = new bartificer.ca.Cell(t.val, 0, 0); },
                    TypeError,
                    `$td cannot be ${t.desc}`
                );
            });
            
            // make sure an object that is not a jQuery object throws an error
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell(DUMMY_DATA.obj_proto.val, 0, 0); },
                TypeError,
                '$td cannot be a reference to an object with a prototype other than jQuery'
            );
            
            // make sure an empty jQuery object is not accepted
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell(DUMMY_DATA.obj_jQuery_empty.val, 0, 0); },
                TypeError,
                '$td cannot be a reference to a empty jQuery object'
            );
            
            // make sure a jQuery object representing multiple elements will not be accepted
            const $multi = $().add($('<td></td>')).add($('<td></td>'));
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($multi, 0, 0); },
                TypeError,
                '$td cannot be a reference to a jQuery object representing multiple table data cells'
            );
            
            // make sure a jQuery object representing something other than a td throws an error
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($('<p></p>'), 0, 0); },
                TypeError,
                '$td cannot be a reference to a jQuery object representing a paragraph'
            );
        });
        
        QUnit.test('coordinate validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('num');
            
            a.expect((mustThrow.length * 2) + 6);
            
            const $td = $('<td></td>');
            
            // make sure all the basic types except number throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const c1 = new bartificer.ca.Cell($td, t.val, 0); },
                    TypeError,
                    `x coordinate cannot be ${t.desc}`
                );
                a.throws(
                    ()=>{ const c1 = new bartificer.ca.Cell($td, 0, t.val); },
                    TypeError,
                    `y coordinate cannot be ${t.desc}`
                );
            });
            
            // make sure negative numbers throw an error
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($td, -1, 0); },
                TypeError,
                'x coordinate cannot be negative'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($td, 0, -1); },
                TypeError,
                'y coordinate cannot be negative'
            );
            
            // make sure decimal numbers throw an error
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($td, Math.PI, 0); },
                TypeError,
                'x coordinate cannot be a non-integer number'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Cell($td, 0, Math.PI); },
                TypeError,
                'y coordinate cannot be a non-integer number'
            );
            
            // make sure 0 is allowed
            a.ok(new bartificer.ca.Cell($td, 0, 0), 'x and y coordiantes can be 0');
            
            // make sure positive numbers are allowed
            a.ok(new bartificer.ca.Cell($('<td></td>'), 42, 42), 'x and y coordiantes can be 42');
        });
        
        QUnit.test('check DOM alterations', (a)=>{
            a.expect(2);
            
            // create a table data cell
            const $td = $('<td></td>');
            
            // create a Cell
            const c1 = new bartificer.ca.Cell($td, 0, 0);
            
            // make sure the expect class was added
            a.ok($td.hasClass('bartificer-ca-cell'), "the class 'bartificer-ca-cell' was added");
            
            // make sure the data attribute was added
            a.strictEqual($td.data('bartificerObject'), c1, 'reference to object added as data attribute');
        });
        
        QUnit.test('reinitialisation prevented', (a)=>{
            const $td = $('<td></td>');
            const c1 = new bartificer.ca.Cell($td, 0, 0);
            
            // make sure an error is thrown if there is an attempt to re-use the same TD
            a.throws(
                ()=>{ const c2 = new bartificer.ca.Cell($td, 0, 1); },
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
        ()=>{
            QUnit.test('.$td()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.c1.$td, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.c1.$td(), this.$td, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    ()=>{ this.c1.$td($('<td></td>')); },
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
                    ()=>{ this.c1.x(30); },
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
                    ()=>{ this.c1.y(40); },
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
                    ()=>{ this.c1.coordinates([30, 40]); },
                    Error,
                    'attempt to set with one argumet throws error'
                );
                a.throws(
                    ()=>{ this.c1.coordinates(30, 40); },
                    Error,
                    'attempt to set with two argumets throws error'
                );
            });
        }
    );
    
    QUnit.module('state accessors and functions', {}, ()=>{
        QUnit.test('.state()', (a)=>{
            a.expect(4);
            
            const s = new bartificer.ca.State(true, 'Alive');
            const c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0, s);
            
            // make sure the accessor exists
            a.strictEqual(typeof c1.state, 'function', 'function exists');
            
            // make sure the accessor reads correctly
            a.strictEqual(c1.state()._value, s._value, 'returns the expected value when the cell has a current state');
            const c2 = new bartificer.ca.Cell($('<td></td>'), 0, 0);
            a.strictEqual(c2.state(), undefined, 'returns undefined value when the cell has no current state');
            
            // make sure attempts to set a value throw an Error
            a.throws(
                ()=>{ c1.state('snot'); },
                Error,
                'attempt to set throws error'
            );
        });
        
        QUnit.test('.nextState()', (a)=>{
            a.expect(5);
            
            const s = new bartificer.ca.State(true, 'Alive');
            const c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0);
            
            // make sure the accessor exists
            a.strictEqual(typeof c1.nextState, 'function', 'function exists');
            
            // check that the getter works when there is no next state
            a.strictEqual(c1.nextState(), undefined, 'get mode returns undefined when there is no next state');
            
            // set the next state to a value and make sure we get it back
            a.strictEqual(c1.nextState(s)._value, s._value, 'successfully set a next state');
            
            // check that the getter works when there is a next state
            a.strictEqual(c1.nextState()._value, s._value, 'get mode returns expected valuen when there is a next state');
            
            // check that the setter allows the next state to be set to undefined
            a.strictEqual(c1.nextState(undefined), undefined, 'successfully set a next state to undefined');
        });
        
        QUnit.test('.hasNextState()', (a)=>{
            a.expect(3);
            
            const c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0);
            
            // make sure the function exists
            a.strictEqual(typeof c1.hasNextState, 'function', 'function exists');
            
            // make sure false is returned when there is no next state defined
            a.strictEqual(c1.hasNextState(), false, 'false returned when the cell has no next state');
            
            // set a next state and make sure the function now returns true
            c1.nextState(new bartificer.ca.State(true, 'Alive'));
            a.strictEqual(c1.hasNextState(), true, 'true returned when the cell has a next state');
        });
        
        QUnit.test('.advance()', function(a){
            a.expect(5);
            
            const s1 = new bartificer.ca.State(true, 'Alive');
            const s2 = new bartificer.ca.State(false, 'Dead');
            const c1 = new bartificer.ca.Cell($('<td></td>'), 0, 0, s1);
            
            // make sure the function exists
            a.strictEqual(typeof c1.nextState, 'function', 'function exists');
            
            // make sure an error is thrown if there is an attempt to advance when there is no next state
            a.throws(
                ()=>{ c1.advance(); },
                Error,
                'an error is thrown when attempting to advance to an undefined next state'
            );
            
            // set a next state and make sure we advance to it correctly
            c1.nextState(s2);
            a.strictEqual(c1.advance(), c1, 'advanced and received reference to self as returned value');
            a.strictEqual(c1.state()._value, s2._value, 'cell has expected new state');
            a.strictEqual(c1.hasNextState(), false, 'cell has no next state');
        });
    });
});

//
// === The Automaton Prototype ================================================
//

QUnit.module('bartificer.ca.Automaton prototype', {}, ()=>{
    //
    // --- The Constructor ---
    //
    QUnit.module('constructor', {}, ()=>{
        QUnit.test('function exists', (a)=>{
            a.strictEqual(typeof bartificer.ca.Automaton, 'function', "has typeof 'function'");
        });
        
        QUnit.test('argument processing', (a)=>{
            a.expect(19);
            const sFn = ()=>{ return new bartificer.ca.State(true, 'Alive'); };
            
            // make sure required arguments are indeed required
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Automaton(); },
                TypeError,
                'throws error when called with no arguments'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Automaton($('<div></div>')); },
                TypeError,
                'throws error when called without second argument'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Automaton($('<div></div>'), 10); },
                TypeError,
                'throws error when called without third argument'
            );
            a.throws(
                ()=>{ const c1 = new bartificer.ca.Automaton($('<div></div>'), 10, 10); },
                TypeError,
                'throws error when called without fourth argument'
            );
            
            // make sure valid values for all required arguments are allowed
            a.ok(new bartificer.ca.Automaton($('<div></div>'), 10, 10, sFn), "valid arguments don't throw error");
            
            // make sure optional arguments are allowed
            a.ok(
                new bartificer.ca.Automaton(
                    $('<div></div>'),
                    10, 10,
                    sFn,
                    {
                        renderFn: ()=>{},
                        initState: new bartificer.ca.State(true, 'Alive'),
                        cellStates: [
                            new bartificer.ca.State('R', 'Red'),
                            new bartificer.ca.State('G', 'Green'),
                            new bartificer.ca.State('B', 'Blue')
                        ]
                    }
                ),
                'presence of optional arguments does not throw an error'
            );
            
            // make sure all values passed are properly stored
            const $div = $('<div></div>');
            const r = 10;
            const c = 10;
            const rFn = ()=>{};
            const cs = [
                new bartificer.ca.State('R', 'Red'),
                new bartificer.ca.State('G', 'Green'),
                new bartificer.ca.State('B', 'Blue')
            ];
            const ca1 = new bartificer.ca.Automaton($div, r, c, sFn, {renderFunction: rFn, initialState: cs[0], cellStates: cs});
            a.strictEqual(ca1._$container, $div, 'the container was correctly stored within the object');
            a.strictEqual(ca1._rows, r, 'the number of rows was correctly stored within the object');
            a.strictEqual(ca1._cols, c, 'the number of columns was correctly stored within the object');
            a.strictEqual(ca1._stepFn, sFn, 'the step function was correctly stored within the object');
            a.strictEqual(ca1._renderFn, rFn, 'the render function was correctly stored within the object');
            
            // make sure the optional initial state is properly applied
            let allCellsOK = true;
            for(let x = 0; x < c && allCellsOK; x++){
                for(let y = 0; y < r; y++){
                    if(ca1.cell(x, y).state()._value !== cs[0]._value) allCellsOK = false;
                }
            }
            a.ok(allCellsOK, 'single initial state correctly applied to all cells');
            const initStates = [
                [new bartificer.ca.State(1, '1'), new bartificer.ca.State(2, '2'), new bartificer.ca.State(3, '3')],
                [new bartificer.ca.State(4, '4'), new bartificer.ca.State(5, '5'), new bartificer.ca.State(6, '6')],
                [new bartificer.ca.State(7, '7'), new bartificer.ca.State(8, '8'), new bartificer.ca.State(9, '9')]
            ];
            const ca2 = new bartificer.ca.Automaton($('<div></div>'), 3, 3, sFn, {renderFunction: rFn, initialState: initStates});
            allCellsOK = true;
            for(let x = 0; x < 3 && allCellsOK; x++){
                for(let y = 0; y < 3; y++){
                    if(ca2.cell(x, y).state()._value !== initStates[x][y]._value) allCellsOK = false;
                }
            }
            a.ok(allCellsOK, '2D array of initial states correctly applied to all cells');
            const ca3 = new bartificer.ca.Automaton($('<div></div>'), 3, 3, sFn, {renderFunction: rFn, initialState: (x, y)=>{ return new bartificer.ca.State(`${x}, ${y}`, `${x}, ${y}`); }});
            allCellsOK = true;
            for(let x = 0; x < 3 && allCellsOK; x++){
                for(let y = 0; y < 3; y++){
                    if(ca3.cell(x, y).state()._value !== `${x}, ${y}`) allCellsOK = false;
                }
            }
            a.ok(allCellsOK, 'Initialisation function correctly applied to all cells');
            
            // make sure the set of cell states is properly stored and the lookup properly built
            let allStatesOK = true;
            for(let i = 0; i < cs.length; i++){
                if(!cs[i].equals(ca1._cellStates[i])){
                    allStatesOK = false;
                }
                if(!cs[i].equals(ca1._statesByValue[cs[i].value()])){
                    allStatesOK = false;
                }
            }
            a.ok(allStatesOK, 'All allowed cell states correctly stored, and the lookup table correctly built');
            
            // make sure the generation counter initialise to the expected initial value
            a.strictEqual(ca1._generation, 0, 'generation counter initialised to zero');
            
            // make sure the generation change event handler array initialised correctly
            a.deepEqual(ca1._generationChange, [], 'generation change event handler list initialised to empty array');
            
            // make sure the auto-step variables initialise to the expected default values
            a.strictEqual(ca1._autoStepID, 0, 'auto step timout ID initialised to zero');
            a.strictEqual(ca1._autoStepMS, 500, 'auto step timout initialised to 500MS');
        });
        
        QUnit.test('$container validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('obj');
            const okTags = ['div', 'p', 'main', 'section'];
            
            a.expect(mustThrow.length + okTags.length + 4);
            
            // make sure all the basic types except object throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const ca1 = new bartificer.ca.Automaton(t.val, 10, 10, ()=>{}); },
                    TypeError,
                    `$container cannot be ${t.desc}`
                );
            });
            
            // make sure an object that is not a jQuery object throws an error
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton(DUMMY_DATA.obj_proto.val, 10, 10, ()=>{}); },
                TypeError,
                '$container cannot be a reference to an object with a prototype other than jQuery'
            );
            
            // make sure an empty jQuery object is not accepted
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton(DUMMY_DATA.obj_jQuery_empty.val, 10, 10, ()=>{}); },
                TypeError,
                '$container cannot be a reference to a empty jQuery object'
            );
            
            // make sure a jQuery object representing multiple elements will not be accepted
            const $multi = $().add($('<div></div>')).add($('<div></div>'));
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($multi, 10, 10, ()=>{}); },
                TypeError,
                '$container cannot be a reference to a jQuery object representing multiple elements'
            );
            
            // make sure a jQuery object representing something other than a td throws an error
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<span></span>'), 10, 10, ()=>{}); },
                TypeError,
                '$container cannot be a reference to a jQuery object representing a span'
            );
            
            // make sure each acceptable element does not throw
            okTags.forEach((t)=>{
                a.ok(
                    new bartificer.ca.Automaton($(`<${t}></${t}>`), 10, 10, ()=>{}),
                    `$container can be a ${t}`
                );
            });
        });
        
        QUnit.test('grid dimension validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('num');
            
            a.expect((mustThrow.length * 2) + 8);
            
            const $div = $('<div></div>');
            const sFn = ()=>{};
            
            // make sure all the basic types except number throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const ca1 = new bartificer.ca.Automaton($div, t.val, 10, sFn); },
                    TypeError,
                    `number of rows cannot be ${t.desc}`
                );
                a.throws(
                    ()=>{ const ca1 = new bartificer.ca.Automaton($div, 10, t.val, sFn); },
                    TypeError,
                    `number of columns cannot be ${t.desc}`
                );
            });
            
            // make sure 0 throws an error
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($div, 0, 10, sFn); },
                TypeError,
                'number of rows cannot be zero'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($div, 10, 0, sFn); },
                TypeError,
                'number of columns cannot be zero'
            );
            
            // make sure negative numbers throw an error
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($div, -1, 10, sFn); },
                TypeError,
                'number of rows cannot be negative'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($div, 10, -1, sFn); },
                TypeError,
                'number of columns cannot be negative'
            );
            
            // make sure decimal numbers throw an error
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($div, Math.PI, 10, sFn); },
                TypeError,
                'number of rows cannot be a non-integer number'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($div, 10, Math.PI, sFn); },
                TypeError,
                'number of columns cannot be a non-integer number'
            );
            
            // make sure 1 is allowed
            a.ok(new bartificer.ca.Automaton($div, 1, 1, sFn), 'number or rows and columns can be 1');
            
            // make sure positive numbers are allowed
            a.ok(new bartificer.ca.Automaton($('<div></div>'), 42, 42, sFn), 'number of rows and columns can be 42');
        });
        
        QUnit.test('callback validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('fn');
            
            a.expect((mustThrow.length * 2) - 1); // render function can be undefined, hence the -1
            
            const $div = $('<div></div>');
            const r = 10;
            const c = 10;
            const fn = ()=>{};
            
            // make sure all the basic types except number throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const ca1 = new bartificer.ca.Automaton($div, r, c, t.val); },
                    TypeError,
                    `step function cannot be ${t.desc}`
                );
                // the render function can be undefined, so skip if needed
                if(t.val !== undefined){
                    a.throws(
                        ()=>{ const ca1 = new bartificer.ca.Automaton($div, r, c, fn, {renderFunction: t.val}); },
                        TypeError,
                        `render function cannot be ${t.desc}`
                    );
                }
            });
        });
        
        QUnit.test('initial state validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('arr', 'fn', 'undef');
            
            a.expect(mustThrow.length + 6);
            
            const r = 2;
            const c = 2;
            const fn = ()=>{};
            const alive = new bartificer.ca.State(true, 'Alive');
            
            // make sure all the disalowed basic types throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: t.val}); },
                    TypeError,
                    `initial state cannot be ${t.desc}`
                );
            });
            
            // make sure State objects don't throw
            a.ok(
                new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: alive}),
                `initial state can be a bartificer.ca.State object`
            );
            
            // make sure callbacks don't throw
            a.ok(
                new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: ()=>{ return alive; }}),
                `initial state can be a callback`
            );
            
            // make sure arrays of the wrong dimension throw
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: [alive, alive, alive]}); },
                TypeError,
                'initial state cannot be a 1D array'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: [[alive], [alive], [alive]]}); },
                TypeError,
                'initial state cannot be a 2D array of the wrong dimensions'
            );
            
            // make sure arrays containing even one invalid value throw
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: [[alive, alive], [[], alive]]}); },
                TypeError,
                'initial state cannot be a 2D array of the correct dimension containing an invalid value'
            );
            
            // make sure arrays with the correct dimension and no invalid data do not throw
            a.ok(
                new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: [[alive, alive], [alive, alive]]}),
                'initial state can be a 2D array with the correct dimensions and all valid data'
            );
        });
        
        QUnit.test('allowed states validation', (a)=>{
            const mustThrow = dummyBasicTypesExcept('arr', 'undef');
            
            a.expect(mustThrow.length + 4);
            
            const r = 2;
            const c = 2;
            const fn = ()=>{};
            const cs = [
                new bartificer.ca.State('R', 'Red'),
                new bartificer.ca.State('G', 'Green'),
                new bartificer.ca.State('B', 'Blue')
            ];
            
            // make sure all the disalowed basic types throw an error
            mustThrow.forEach((tn)=>{
                const t = DUMMY_BASIC_TYPES[tn];
                a.throws(
                    ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {cellStates: t.val}); },
                    TypeError,
                    `allowed cell states cannot be ${t.desc}`
                );
            });
            
             // make sure empty arrays and single-value arrays throw
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {cellStates: []}); },
                TypeError,
                'allowed cell states cannot be an empty array'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {cellStates: [cs[0]]}); },
                TypeError,
                'allowed cell states cannot be an single-entry array'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {cellStates: [cs[0], cs[0].clone()]});  console.log(ca1); },
                TypeError,
                'allowed cell states cannot be two states with the same value'
            );
            a.throws(
                ()=>{ const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {cellStates: [cs[0], cs[1], cs[1].clone()]}); },
                TypeError,
                'duplicate states throw error'
            );
        });
        
        QUnit.test('grid was correctly initialised', (a)=>{
            const r = 2;
            const c = 2;
            const fn = ()=>{};
            const alive = new bartificer.ca.State(true, 'Alive');
            a.expect(5);
            
            // build a sample CA
            const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: alive});
            
            // make sure the grid has the right shape
            let shapeOK = true;
            for(let x = 0; x < c && shapeOK; x++){
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
            let allCellProtosOK = true;
            for(let x = 0; x < c && allCellProtosOK; x++){
                for(let y = 0; y < r && allCellProtosOK; y++){
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
            let singleStateOK = true;
            for(let x = 0; x < c && singleStateOK; x++){
                for(let y = 0; y < r && singleStateOK; y++){
                    if(ca1._grid[x][y].state()._value !== true){
                        singleStateOK = false;
                    }
                }
            }
            a.ok(singleStateOK, 'All cells in CA created with single-value initial state have the expected state');
            
            // check initialation with array of states
            const stateArray = [[new bartificer.ca.State(1, '1'), new bartificer.ca.State(2, '2')], [new bartificer.ca.State(3, '3'), new bartificer.ca.State(4, '4')]];
            const ca2 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: stateArray});
            let stateArrayOK = true;
            for(let x = 0; x < c && stateArrayOK; x++){
                for(let y = 0; y < r && stateArrayOK; y++){
                    if(ca2._grid[x][y].state()._value !== stateArray[x][y]._value){
                        stateArrayOK = false;
                    }
                }
            }
            a.ok(stateArrayOK, 'All cells in CA created with an array of initial states have the expected state');
            
            // check initialisation with function
            const stateCB = (x, y)=>{ return new bartificer.ca.State(`x=${x} & y=${y}`, `x=${x} & y=${y}`); };
            const ca3 = new bartificer.ca.Automaton($('<div></div>'), r, c, fn, {initialState: stateCB});
            let stateCBOK = true;
            for(let x = 0; x < c && stateCBOK; x++){
                for(let y = 0; y < r && stateCBOK; y++){
                    if(ca3._grid[x][y].state()._value !== stateCB(x, y)._value){
                        stateCBOK = false;
                    }
                }
            }
            a.ok(stateCBOK, 'All cells in CA created with an initial state function have the expected state');
        });
        
        QUnit.test('table was correctly generated', (a)=>{
            a.expect(2);
            const r = 4;
            const c = 4;
            const ca1 = new bartificer.ca.Automaton($('<div></div>'), r, c, ()=>{});
            a.equal($('table', ca1.$container()).length, 1, 'exactly one table in container');
            a.equal($('td', ca1.$container()).length, r * c, 'correct number of table data cells in container');
        });
        
        QUnit.test('check DOM alterations', (a)=>{
            a.expect(4);
            
            const $div = $('<div></div>');
            const r = 4;
            const c = 4;
            
            // create an automaton
            const ca1 = new bartificer.ca.Automaton($div, r, c, ()=>{});
            
            // make sure the expect class was added to the container & table
            a.ok($div.hasClass('bartificer-ca-container'), "the class 'bartificer-ca-container' was added to the container");
            a.ok(ca1.$table().hasClass('bartificer-ca-automaton'), "the class 'bartificer-ca-automaton' was added to the generated table");
            
            // make sure the data attribute was added to the container & table
            a.strictEqual($div.data('bartificerObject'), ca1, 'reference to object added as data attribute on container');
            a.strictEqual(ca1.$table().data('bartificerObject'), ca1, 'reference to object added as data attribute on generated table');
        });
        
        QUnit.test('reinitialisation prevented', (a)=>{
            const $div = $('<div></div>');
            const r = 4;
            const c = 4;
            const ca1 = new bartificer.ca.Automaton($div, r, c, ()=>{});
            
            // make sure an error is thrown if there is an attempt to re-use the same div
            a.throws(
                ()=>{ const c2 = new bartificer.ca.Automaton($div, r, c, ()=>{}); },
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
                this.cs = [
                    new bartificer.ca.State('R', 'Red'),
                    new bartificer.ca.State('G', 'Green'),
                    new bartificer.ca.State('B', 'Blue')
                ];
                this.s = this.cs[0].clone();
                this.sFn = ()=>{ return this.s; };
                this.rFn = ()=>{};
                this.ca1 = new bartificer.ca.Automaton(this.$div, this.r, this.c, this.sFn, {renderFunction: this.rFn, initialState: this.s, cellStates: this.cs});
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
                    ()=>{ this.ca1.$container($('<p></p>')); },
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
                    ()=>{ this.ca1.rows(5); },
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
                    ()=>{ this.ca1.cols(5); },
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
                    ()=>{ this.ca1.dimensions([3, 5]); },
                    Error,
                    'attempt to set with one argumet throws error'
                );
                a.throws(
                    ()=>{ this.ca1.dimensions(3, 5); },
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
                    ()=>{ this.ca1.stepFunction(()=>{}); },
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
                    ()=>{ this.ca1.renderFunction(()=>{}); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.cellStates()', function(a){
                a.expect(4);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.cellStates, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                const testVal = this.ca1.cellStates();
                a.ok($.isArray(testVal) && testVal.length === this.cs.length, 'returns array of expected length');
                let allStatesOK = true;
                for(let i = 0; i < this.cs.length; i++){
                    if(!this.cs[i].equals(testVal[i])){
                        allStatesOK = false;
                    }
                }
                a.ok(allStatesOK, 'returns the expected values');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    ()=>{ this.ca1.cellStates([this.cs[0], this.cs[1]]); },
                    Error,
                    'attempt to set throws error'
                );
            });
            QUnit.test('.stateFromValue()', function(a){
                const mustThrow = dummyBasicTypesExcept('bool', 'num', 'str');
                a.expect(mustThrow.length + 3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.stateFromValue, 'function', 'function exists');
                
                // check parameter validation
                mustThrow.forEach((tn)=>{
                    const t = DUMMY_BASIC_TYPES[tn];
                    a.throws(
                        ()=>{ this.caa.stateFromValue(t.val); },
                        TypeError,
                        `first argument can't be ${t.desc}`
                    );
                });
                
                // make sure a state that exists is returned
                a.ok(this.ca1.stateFromValue(this.cs[0].value()).equals(this.cs[0]), 'defined state is returned');
                
                // make sure undefined is returned for a state that doesn't exist
                a.ok(typeof this.ca1.stateFromValue('boogers') === 'undefined', 'undefined is returned for a value with no matchign state');
            });
            QUnit.test('.hasState()', function(a){
                const mustReturnFalse = dummyBasicTypesExcept('bool', 'num', 'str');
                a.expect(mustReturnFalse.length + 5);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.hasState, 'function', 'function exists');
                
                // make sure a state that exists is found via both a primitive value and a state
                a.strictEqual(this.ca1.hasState('R'), true, 'state found when passed as a primitive value');
                a.strictEqual(this.ca1.hasState(this.cs[0]), true, 'state found when passed as an object ');
                
                // make sure a state that doesn't exist is not found when specified as a primitive or a state
                a.strictEqual(this.ca1.hasState('boogers'), false, 'non-existent state not found when passed as a primitive value');
                a.strictEqual(this.ca1.hasState(new bartificer.ca.State('boogers', 'Boogers')), false, 'non-existent state not found when passed as an object');
                
                // make sure invalid arguments return false
                mustReturnFalse.forEach((tn)=>{
                    const t = DUMMY_BASIC_TYPES[tn];
                    a.strictEqual(this.ca1.hasState(t.val), false, `${t.desc} returns false`);
                });
            });
            QUnit.test('.generation()', function(a){
                a.expect(3);
            
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.generation, 'function', 'function exists');
            
                // make sure the accessor returns the correct value
                a.strictEqual(this.ca1.generation(), 0, 'returns the expected value');
                
                // make sure attempts to set a value throw an Error
                a.throws(
                    ()=>{ this.ca1.generation(5); },
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
                const initStates = [[new bartificer.ca.State(1, '1'), new bartificer.ca.State(2, '2')], [new bartificer.ca.State(3, '3'), new bartificer.ca.State(4, '4')]];
                const ca2 = new bartificer.ca.Automaton($('<div></div>'), 2, 2, this.sFn, {initialState: initStates});
                a.strictEqual(ca2.cellState(0, 1)._value, initStates[0][1]._value, 'returns the expected value');
            });
            QUnit.test('.cellNeighbourStates()', function(a){
                a.expect(6);
                
                // make sure the accessor exists
                a.strictEqual(typeof this.ca1.cellNeighbourStates, 'function', 'function exists');
                
                // build a CA to test against
                const dummyStates = [];
                for(let i = 1; i <= 20; i++){
                    dummyStates[i] = new bartificer.ca.State(i, `${i}`);
                }
                const stateArray = [
                    [dummyStates[1],  dummyStates[6], dummyStates[11], dummyStates[16]],
                    [dummyStates[2],  dummyStates[7], dummyStates[12], dummyStates[17]],
                    [dummyStates[3],  dummyStates[8], dummyStates[13], dummyStates[18]],
                    [dummyStates[4],  dummyStates[9], dummyStates[14], dummyStates[19]],
                    [dummyStates[5], dummyStates[10], dummyStates[15], dummyStates[20]]
                ];
                // above represents grid:
                //  1  2  3  4  5
                //  6  7  8  9 10
                // 11 12 13 14 15
                // 16 17 18 19 20
                const ca = new bartificer.ca.Automaton($('<div></div>'), 4, 5, this.sFn, {initialState: stateArray, cellStates: dummyStates.slice(1)});
                
                // check an internal cell
                a.deepEqual(ca.cellNeighbourStates(3, 2), [dummyStates[9], dummyStates[10], dummyStates[15], dummyStates[20], dummyStates[19], dummyStates[18], dummyStates[13], dummyStates[8]], 'internal cell OK');
                
                // check the four corners
                a.deepEqual(ca.cellNeighbourStates(0, 0), [null, null, dummyStates[2], dummyStates[7], dummyStates[6], null, null, null], 'top-left corner OK');
                a.deepEqual(ca.cellNeighbourStates(4, 0), [null, null, null, null, dummyStates[10], dummyStates[9], dummyStates[4], null], 'top-right corner OK');
                a.deepEqual(ca.cellNeighbourStates(4, 3), [dummyStates[15], null, null, null, null, null, dummyStates[19], dummyStates[14]], 'bottom-right corner OK');
                a.deepEqual(ca.cellNeighbourStates(0, 3), [dummyStates[11], dummyStates[12], dummyStates[17], null, null, null, null, null], 'bottom-left corner OK');
            });
            QUnit.test('.step()', function(a){
                a.expect(2);
                
                // create a CA with a step function that increments the state by 1
                const dummyStates = [];
                for(let i = 1; i <= 26; i++){
                    dummyStates[i] = new bartificer.ca.State(i, `${i}`);
                }
                const stateArrayPre = [
                    [dummyStates[1],  dummyStates[6], dummyStates[11], dummyStates[16], dummyStates[21]],
                    [dummyStates[2],  dummyStates[7], dummyStates[12], dummyStates[17], dummyStates[22]],
                    [dummyStates[3],  dummyStates[8], dummyStates[13], dummyStates[18], dummyStates[23]],
                    [dummyStates[4],  dummyStates[9], dummyStates[14], dummyStates[19], dummyStates[24]],
                    [dummyStates[5], dummyStates[10], dummyStates[15], dummyStates[20], dummyStates[25]]
                ];
                const stateArrayPost = [
                    [dummyStates[2],  dummyStates[7], dummyStates[12], dummyStates[17], dummyStates[22]],
                    [dummyStates[3],  dummyStates[8], dummyStates[13], dummyStates[18], dummyStates[23]],
                    [dummyStates[4],  dummyStates[9], dummyStates[14], dummyStates[19], dummyStates[24]],
                    [dummyStates[5], dummyStates[10], dummyStates[15], dummyStates[20], dummyStates[25]],
                    [dummyStates[6], dummyStates[11], dummyStates[16], dummyStates[21], dummyStates[26]]
                ];
                const ca1 = new bartificer.ca.Automaton($('<div></div>'), 5, 5, function(s){ return dummyStates[s.value() + 1]; }, {initialState: stateArrayPre, cellStates: dummyStates.slice(1)});
                
                // step the CA
                ca1.step();
                
                // make sure each state was incremented by 1
                let allOK = true;
                for(let x = 0; x < 5; x++){
                    for(let y = 0; y < 5; y++){
                        if(ca1.cellState(x, y)._value !== stateArrayPost[x][y]._value) allOK = false;
                    }
                }
                a.ok(allOK, 'all cells were stepped correctly with step function that returns State object');
                
                // make sure state coercion works as expected
                const ca2 = new bartificer.ca.Automaton($('<div></div>'), 5, 5, function(s){ return s.value() + 1; }, {initialState: stateArrayPre, cellStates: dummyStates.slice(1)});
                ca2.step();
                allOK = true;
                for(let x = 0; x < 5; x++){
                    for(let y = 0; y < 5; y++){
                        if(ca2.cellState(x, y)._value !== stateArrayPost[x][y]._value) allOK = false;
                    }
                }
                a.ok(allOK, 'all cells were stepped correctly with step function that returns primitive values that needed to be coerced');
            });
        }
    );
    
    QUnit.test('Generation Counting', (a)=>{
        a.expect(3);
        
        const ca = new bartificer.ca.Automaton($('<div></div>'), 3, 3, ()=>{ return new bartificer.ca.State(true, 'Alive'); }, {initialState: new bartificer.ca.State(true, 'Alive')});
        
        // make sure the count starts at zero
        a.strictEqual(ca.generation(), 0, 'Automaton starts at generation zero');
        
        // step forward three times
        ca.step().step().step();
        
        // make sure the generation is now three
        a.strictEqual(ca.generation(), 3, 'generation correctly incremented');
        
        // set to a new state
        ca.setState(new bartificer.ca.State(false, 'Dead'));
        
        // make sure the counter was re-set to zero
         a.strictEqual(ca.generation(), 0, 'Setting new state re-sets the generation to zero');
    });
    
    QUnit.test('Generation Change Event Handling', (a)=>{
        const mustThrow = dummyBasicTypesExcept('fn', 'undef');
        a.expect(mustThrow.length + 8);
        
        const ca = new bartificer.ca.Automaton($('<div></div>'), 3, 3, ()=>{ return new bartificer.ca.State(true, 'Alive'); }, {initialState: new bartificer.ca.State(true, 'Alive')});
        
        // make sure the function exists
        a.ok(typeof ca.generationChange === 'function', 'the .generationChange() function exists');
        
        // make sure running the function with no parameters when there are no registered handlers does not throw an error
        a.ok(ca.generationChange(), 'execution when no handlers are added does not throw an error');
        
        // make sure adding handlers works
        let cb1Execed = false;
        let cb2Execed = false;
        const cb1 = ()=>{ cb1Execed = true; };
        const cb2 = ()=>{ cb2Execed = true; };
        ca.generationChange(cb1);
        ca.generationChange(cb2);
        a.deepEqual(ca._generationChange, [cb1, cb2], 'callbacks successfully registered');
        
        // check parameter validation
        mustThrow.forEach((tn)=>{
            const t = DUMMY_BASIC_TYPES[tn];
            a.throws(
                ()=>{ ca.generationChange(t.val); },
                TypeError,
                `generation change callback can't be ${t.desc}`
            );
        });
        
        // make sure direct execution of all callbacks works
        ca.generationChange();
        a.ok(cb1Execed && cb2Execed, 'direct execution of generation change callbacks works as expected');
        
        // make sure execution via the step function works
        cb1Execed = false;
        cb2Execed = false;
        ca.step();
        a.ok(cb1Execed && cb2Execed, '.step() calls the generation change callbacks');
        
        // make sure execution via .setState() works
        cb1Execed = false;
        cb2Execed = false;
        ca.setState(new bartificer.ca.State(true, 'Alive'));
        a.ok(cb1Execed && cb2Execed, '.setState() calls the generation change callbacks');
        
        // make sure a reference to self is returne for function chaining
        a.strictEqual(ca.generationChange(), ca, 'returns reference to self when executing registered callbacks');
        a.strictEqual(ca.generationChange(()=>{}), ca, 'returns reference to self when adding a callback');
    });
    
    QUnit.test('.setState()', (a)=>{
        a.expect(3);
        const $div = $('<div></div>');
        const r = 3;
        const c = 3;
        const sFn = ()=>{ return new bartificer.ca.State(true, 'Alive'); };
        let allCellsOK = true;
        const ca = new bartificer.ca.Automaton($div, r, c, sFn, {initialState: new bartificer.ca.State(true, 'Alive')});
        
        // test when given a single state
        ca.setState(new bartificer.ca.State(true, 'Alive'));
        for(let x = 0; x < c && allCellsOK; x++){
            for(let y = 0; y < r; y++){
                if(ca.cell(x, y).state()._value !== true) allCellsOK = false;
            }
        }
        a.ok(allCellsOK, 'single initial state correctly applied to all cells');
        
        // test when given a grid of states
        const initStates = [
            [new bartificer.ca.State(1, '1'), new bartificer.ca.State(2, '2'), new bartificer.ca.State(3, '3')],
            [new bartificer.ca.State(4, '4'), new bartificer.ca.State(5, '5'), new bartificer.ca.State(6, '6')],
            [new bartificer.ca.State(7, '7'), new bartificer.ca.State(8, '8'), new bartificer.ca.State(9, '9')]
        ];
        ca.setState(initStates);
        allCellsOK = true;
        for(let x = 0; x < c && allCellsOK; x++){
            for(let y = 0; y < r; y++){
                if(ca.cell(x, y).state()._value !== initStates[x][y]._value) allCellsOK = false;
            }
        }
        a.ok(allCellsOK, '2D array of initial states correctly applied to all cells');
        
        // test when given a callback
        ca.setState((x, y)=>{ return new bartificer.ca.State(`${x}, ${y}`, `${x}, ${y}`); });
        allCellsOK = true;
        for(let x = 0; x < 3 && allCellsOK; x++){
            for(let y = 0; y < 3; y++){
                if(ca.cell(x, y).state()._value !== `${x}, ${y}`) allCellsOK = false;
            }
        }
        a.ok(allCellsOK, 'Initialisation function correctly applied to all cells');
    });
    
    QUnit.test('.autoStepIntervalMS()', (a)=>{
        const mustThrow = dummyBasicTypesExcept('num');
        a.expect(7 + mustThrow.length);
            
        const ca = new bartificer.ca.Automaton($('<div></div>'), 5, 5, (s)=>{ return s; });
            
        // make sure the accessor exists
        a.strictEqual(typeof ca.autoStepIntervalMS, 'function', 'function exists');
            
        // check that the getter fetches the default value
        a.strictEqual(ca.autoStepIntervalMS(), 500, 'get mode returns expected default value');
            
        // set a new valid interval and make sure we get it back
        a.strictEqual(ca.autoStepIntervalMS(100), 100, 'successfully set a new interval');
            
        // make sure all the disalowed basic types throw an error
        mustThrow.forEach((tn)=>{
            const t = DUMMY_BASIC_TYPES[tn];
            a.throws(
                ()=>{ ca.autoStepIntervalMS(t); },
                TypeError,
                `interval cannot be ${t.desc}`
            );
        });
        
        // make sure non-integers throw an error
        a.throws(
            ()=>{ ca.autoStepIntervalMS(Math.PI); },
            TypeError,
            'interval cannot be a non-integer'
        );
        
        // make sure negative numbers throw an error
        a.throws(
            ()=>{ ca.autoStepIntervalMS(-1); },
            TypeError,
            'interval cannot be negative'
        );
        
        // make sure zero throws an error
        a.throws(
            ()=>{ ca.autoStepIntervalMS(0); },
            TypeError,
            'interval cannot be zero'
        );
        
        // make sure one doesn't throw an error
        a.ok(ca.autoStepIntervalMS(1), 'interval can be one');
    });
});