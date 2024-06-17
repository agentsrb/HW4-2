$(function() {
    // initialize tabs
    var tabCount = 1;
    $("#tabs").tabs();

    /**
     * function to generate table using user inputs
     * @param inputs    array       array of integers to be used as matrix bounds
     * @param tabCount  integer     tab number to generate the table matrix under
     * @return          none */
    function generateTableMatrix(inputs, tabCount) {
        // find starting values for matrix axis as the min value for that axis
        // matrix will always be 'counting up'
        var x_start = Math.min(inputs[0], inputs[1]);
        var x_end = Math.max(inputs[0], inputs[1]);
        var y_start = Math.min(inputs[2], inputs[3]);
        var y_end = Math.max(inputs[2], inputs[3]);
    
        // create table
        let table = $("<table>").addClass("table table-bordered");

        // generate first row (headers) and append to table
        let header = $("<tr>").addClass("display-above").appendTo(table);
        // add empty cell for symmetry
        header.append($("<th>"));

        // generate column headers
        for (let c = x_start; c <= x_end; c++) {
            // top row of table
            header.append($("<th>").text(c));
        }

        // generate rows
        for (let r = y_start; r <= y_end; r++) {
            // create row
            let row = $("<tr>").appendTo(table);
            // first cell is always a header
            row.append($("<th>").text(r));
            // generate cells in row
            for (let c = x_start; c <= x_end; c++) {
                // content is product of row * col
                let cell = $("<td>").text(r * c).appendTo(row);
                // highlight every other row for readability
                if (r % 2 == 0) cell.addClass("active");
            }
        }

        // clear table and update
        $("#tableContainer-" + tabCount).empty().append(table);
    }


    /** two way binding for sliders and input fields
    * @param inputId   string      id of input field
    * @param sliderId  string      id of slider field
    * @param minimum   int         minimum allowed  value for slider
    * @param maximum   int         maximum allowed  value for slider */
    function bindSlider(inputId, sliderId, minimum, maximum){
        var $input = $(inputId);
        var $slider = $(sliderId);

        // sync input and slider
        // validate inputs and update table
        function update() {
            // parse base10 int from input or default to 0
            var value = parseInt($input.val(), 10) || 0;
            // sync slider to input field
            $slider.slider("value", value);
            $("#validate").validate().element($input);
            updateTableMatrix();
        }

        // initialize slider
        $slider.slider({
            range: "min",
            max: maximum,
            min: minimum,
            // set value to base10 input or default to 0
            value: parseInt($input.val(), 10) || 0,
            // on slider move
            slide: function(event, ui) {
                // sync input with slider
                $input.val(ui.value);
                // run update function
                update();
            }
        });

        // set default input value
        // input event listener to update function
        $input.val($slider.slider("value")).on("input", update);
    }

    // form and input validation prior to table matrix generation
    function updateTableMatrix(){
        // chek if inputs are valid
        if ($("#validate").valid()) {
            // create array for matrix generation
            // parse base10 number from input fields
            var inputs = [$("#number_1"), $("#number_2"), $("#number_3"), $("#number_4")].map($input => parseInt($input.val(), 10));
            //only update the preview table on tab 0
            generateTableMatrix(inputs, 0);
        }
    }

    // validation function to check range between 2 inputs
    $.validator.addMethod("rangeConstraint", function(value, element, params) {
        // get base 10 numbers from arg
        var number_1 = parseInt($(params.firstElement).val(), 10);
        var number_2 = parseInt($(params.secondElement).val(), 10);
        // returns true if fields are not required
        // returns true if first 2 elements are no more than maxDifference units apart
        return this.optional(element) || Math.abs(number_1 - number_2) <= params.maxDifference;
    }, function(params)  {
        // message if validation fails
        return "The numbers must not be more than " + params.maxDifference + " apart.";
    });

    // get form by id
    $("#validate").validate({
        // validation rules
        // all inputs must exist
        // all inputs must be a number
        // all numbers must be  between -1000 and 1000
        rules: {
            // multiplier start
            input_1: { required: true, number: true, max: 1000, min: -1000 },
            // multiplier end
            input_2: { required: true, number: true, max: 1000, min: -1000, rangeConstraint: { 
                // constrain the range between number_1 and number_2 to a max of 200
                firstElement: "#number_1", secondElement: "#number_2", maxDifference: 200 } 
            },
            // multiplicand start
            input_3: { required: true, number: true, max: 1000, min: -1000 },
            // multiplicand end
            input_4: { required: true, number: true, max: 1000, min: -1000, rangeConstraint: { 
                // constrain the range between number_3 and number_4 to a max of 200
                firstElement: "#number_3", secondElement: "#number_4", maxDifference: 200 } 
            }
        },
        messages: {
            // error messages displayed when rule evaluates false
            input_2: { rangeConstraint: "The difference between Multipliers must not exceed 200." },
            input_4: { rangeConstraint: "The difference between Multiplicands must not exceed 200." }
        },
        submitHandler: function(form, event) {
            // disable default form submit
            event.preventDefault();
            // get values from inputs
            var inputs = [
                parseInt($("#number_1").val(), 10),
                parseInt($("#number_2").val(), 10),
                parseInt($("#number_3").val(), 10),
                parseInt($("#number_4").val(), 10)
            ];

            // generate tab name
            var tabName = "["+inputs[0]+"]["+inputs[1]+"]x["+inputs[2]+"]["+inputs[3]+"]";
            if (tabName) {
                // create new  tab
                addTab(tabName);
                // generate table under tab
                generateTableMatrix(inputs, tabCount);
            }
        }
    });

    /**
     * function to add a new tab
     * @param tabName   integer     name to be displayed ontab title
     * @return          none */
    function addTab(tabName) {
        // increment tabs
        tabCount++;
        // create unique tab id
        var newTabId = "tabs-" + tabCount;
        var tabTitle = $("<li><a href='#" + newTabId + "'>" + tabName + "</a><span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>");
        // place table structure in tab
        var tabContent = $("<div id='" + newTabId + "'>" +
            "<div class='row'>" +
                "<div class='col-md-12 table-group'>" +
                    // table container gets unique id so generateTableMatrix can target it
                    "<div class='scrollable' id='tableContainer-" + tabCount + "'></div>" +
                "</div>" +
            "</div>" +
        "</div>");
        
        // add tab to tab list
        $("#tabs").find(".ui-tabs-nav").append(tabTitle);
        $("#tabs").append(tabContent);
        // update tabs
        $("#tabs").tabs("refresh");
    }

    // function to delete a tab
    function deleteTab(tabId) {
        // remove tab content
        $("#" + tabId).remove();
        // update tabs
        $("#tabs").tabs("refresh");
    }

    // event for tab close buttons
    $("#tabs").on("click", ".ui-icon-close", function() {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        deleteTab(panelId);
    });

    //  bind sliders to input fields
    bindSlider("#number_1", "#slider_1", -1000, 1000);
    bindSlider("#number_2", "#slider_2", -1000, 1000);
    bindSlider("#number_3", "#slider_3", -1000, 1000);
    bindSlider("#number_4", "#slider_4", -1000, 1000);

});

// function to delete all tabs excluding tab 0
function deleteAllTabs() {
    // for all of the  tabs except tab 0
    $("#tabs > div:gt(0)").each(function() {
        var tabId = this.id;
        // remove tab content
        $("#" + tabId).remove();
    });

    // remove tabs from list except for tab 0
    $("#tabs ul li:gt(0)").remove();

    // update tabs
    $("#tabs").tabs("refresh");
}