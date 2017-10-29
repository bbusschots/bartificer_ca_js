# bartificer.ca.js

A JavaScript API for creating [Cellular Automata](https://en.wikipedia.org/wiki/Cellular_automaton).

This API requires [jQuery](http://jquery.com).

The constructor for the `bartificer.ca.Automaton` prototype builds a table to
reprsent a Cellular Automaton (CA), and injects it into a given container. The
table will contain a cell for each cell in the CA.

As well as the container to inject the table into, the constructor also expects
to be passed a number of rows and columns, two callbacks, and optionally an
initial state for each cell in the automaton.

The first of the expected callbacks is the so-called *step function*, which
will be used to calculate the next state of each cell given the cell's current
state and the current state of all it's neighbours

The second expected callback is the so-called *render function*, which will be
used to alter the content and style of each table cell so it reflects the
current state of the matching cell in the CA.

Finally, the constructor accepts an optional initial state for each cell in the
automaton as a single state to be applied to all cells, a 2D array of states
for each cell, or a callback that should return the state for each cell given
its `x` and `y` coordinate as input.

## Include into Page from CDN

You can download the code into your own project, or, include it directly from
a CDN:

```
<!-- Import jQuery (required by bartificer.ca) -->
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha256-k2WSCIexGzOj3Euiig+TlR8gA0EmPjuc79OEeY5L45g=" crossorigin="anonymous"></script>

<!-- Import bartificer.ca -->
<script src="https://rawgit.com/bbusschots/bartificer_ca_js/master/lib/bartificer.ca.js"></script>
```

## API Documentation

Full documentation for the public API can be found at [bbusschots.github.io/…](https://bbusschots.github.io/bartificer_ca_js/).

Those wishing to contribute to the project can generate developer documentation
which includes internal private symbols by downloading or checking out the code
from [github.com/…](https://github.com/bbusschots/bartificer_ca_js/) and then
running the commands:

```
npm install
npm generate-docs-dev
```

## Example

An HTML page that implements [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life)
using the `bartificer.ca.Automaton` prototype:

```
<!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8" />
    <title>bartificer.ca.Automaton Example - Conway's Game of Life</title>
    
    <!-- Import jQuery (required by bartificer.ca) -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha256-k2WSCIexGzOj3Euiig+TlR8gA0EmPjuc79OEeY5L45g=" crossorigin="anonymous"></script>
    
    <!-- Import bartificer.ca -->
    <script src="https://rawgit.com/bbusschots/bartificer_ca_js/master/lib/bartificer.ca.js"></script>
    
    <!-- Add the JavaScript code to initialise a Cellular Automaton -->
    <script type="text/javascript">
        // a globally scoped variable to hold the automaton object
        var ConwayGOLCA;
        
        // a step function that implements Conway's game of life
        function lifeStep(currentState, neighbourStates){
            // calcualte the number of live neighbours
            var numLiveNeighbours = 0;
            neighbourStates.forEach(function(s){
                if(s == true) numLiveNeighbours++;
            });
            
            // apply the rules based on the current state
            if(currentState == true){
                // currently alive - apply rules 1 to 3
                
                // rule 1
                if(numLiveNeighbours < 2) return false;
                
                // rule 3
                if(numLiveNeighbours > 3) return false;
            }else{
                // currently dead - apply rule 4
                if(numLiveNeighbours === 3) return true;
            }
            
            // default to no change (incorporates rule 2)
            return currentState;
        }
        
        // a render function to render live cells green and dead cells red
        function renderRedGreen($td, s){
            // render a true state as green, and false as red
            if(s == true){
                $td.css('background-color', 'Green');
            }else{
                $td.css('background-color', 'Red');
            }
        }
        
        // an initialisation function to randomly set each cell to true or false
        function randomBoolean(){
            return Math.random() < 0.5 ? true : false;
        }
        
        // add a document ready event handler to initialise the CA
        $(function(){
            // use the constructor to build an automaton
            ConwayGOLCA = new bartificer.ca.Automaton(
                $('main'), // use the main tag as the container
                50, 100, // 50 rows and 100 cols
                lifeStep, // pass the game of life step function
                renderRedGreen, // pass our red/green render function
                randomBoolean // initialise each cell to a random boolean
            );
            
            // start an interval that will advance the CA every quarter second
            window.setInterval(function(){ ConwayGOLCA.step(); }, 250);
        });
    </script>
    
    <!-- Stype the Automaton -->
    <style type="text/css">
        /* style the cells in the automaton */
        td.bartificer-ca-cell{
            width: 10px;
            height: 10px;
        }
    </style>
</head>
<body>
<header><h1>Conway's Game of Life</h1></header>
<main></main>
</body>
</html>
```