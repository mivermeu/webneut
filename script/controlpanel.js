function addRow(id, pars) {
  // Range button.
  let buttond = document.getElementById(id + "_button");
  buttond.innerHTML = "Range";
  // If pars designates this value as a range, disable range button.
  if (Array.isArray(pars.val)) {
    buttond.disabled = true;
  }

  // Animate button.
  let animated = document.getElementById(id + "_animate");
  animated.innerHTML = "Animate";
  // If pars designates this value as a range, disable range button.
  if (Array.isArray(pars.val)) {
    animated.disabled = true;
  }

  // Label.
  let labeld = document.getElementById(id + "_label");
  labeld.innerHTML = pars.label;

  // Slider.
  let sliderd = document.getElementById(id + "_slider");
  createSlider(sliderd, pars.limits, pars.val, pars.precision, pars.snaps);

  // Input(s).
  document.getElementById(id + "_inputs").replaceWith(createInput(sliderd));

  return sliderd;
}

function createSlider(el, slimits, sstart, precision, snaps = []) {
  noUiSlider.create(el, {
    start: sstart,
    orientation: "horizontal",
    connect: true,
    animate: false,
    keyboardSupport: false,
    behaviour: "snap-drag",
    range: {
      min: slimits[0],
      max: slimits[1],
    },
    format: {
      to: function (value) {
        return value.toFixed(precision);
      },
      from: Number,
    },
    pips: {
      mode: "values",
      values: snaps,
      density: -1,
      format: 0,
    },
  });
}

function createInput(sliderd) {
  // Get slider start points.
  let sstart = sliderd.noUiSlider.options.start;
  // Create as many input fields as slider knobs.
  if (sstart.constructor != Array) sstart = [sstart];
  var inputs = document.createElement("div");
  sstart.forEach(function (_, handle) {
    let thisinput = document.createElement("input");
    // thisinput.style.width = "100px";
    thisinput.className = "slider-input";

    // Update input field on slider change.
    sliderd.noUiSlider.on("update", function (value) {
      thisinput.value = value[handle];
    });

    // Update slider on input field change.
    thisinput.addEventListener("change", function () {
      var values = [null, null];
      values[handle] = thisinput.value;
      sliderd.noUiSlider.set(values);
    });

    thisinput.addEventListener("keydown", function (e) {
      if (e == 13) {
        sliderd.noUiSlider.set(this.value);
      }
    });

    inputs.appendChild(thisinput);
  });
  // Add input fields to span in grid cell.
  inputs.id = sliderd.id.substr(0, sliderd.id.indexOf("_")) + "_inputs";
  inputs.className += "slider-inputs";

  return inputs;
}

function makeRange(sliders, id) {
  // Find range slider keys.
  const rangesliders = sliders.filter((slider) =>
    Array.isArray(slider.noUiSlider.options.start)
  );
  rangesliders.forEach(function (slider) {
    const key = slider.id.substr(0, slider.id.indexOf("_"));
    // Remake range sliders with a single handle.
    var ops = slider.noUiSlider.options;
    ops.start = slider.noUiSlider.get()[1];
    slider.noUiSlider.destroy();
    noUiSlider.create(slider, ops);
    // Remake input fields and enable button.
    let inputs = createInput(slider);
    document.getElementById(key + "_inputs").replaceWith(inputs);
    document.getElementById(key + "_button").disabled = false;
    document.getElementById(key + "_animate").disabled = false;
  });
  // Find the new range slider and remake it with two handles.
  const newrangeslider = sliders.find((slider) => slider.id == id + "_slider");
  var ops = newrangeslider.noUiSlider.options;
  ops.start = [
    newrangeslider.noUiSlider.options.range["min"],
    newrangeslider.noUiSlider.get(),
  ];
  newrangeslider.noUiSlider.destroy();
  noUiSlider.create(newrangeslider, ops);
  // Remake input fields.
  let input = createInput(newrangeslider);
  document.getElementById(id + "_inputs").replaceWith(input);
  document.getElementById(id + "_button").disabled = true;
  if(animating==id) {
    animate(id);
  }
  document.getElementById(id + "_animate").disabled = true;
}

function addListeners(slider_arr, pars) {
  // Check for changes in sliders. Change parameters
  slider_arr.forEach(function (slider) {
    // Update parameter values when slider value changes.
    slider.noUiSlider.on("update", function (valuestrings) {
      // Convert slider value(s) to numbers.
      const vals = valuestrings.map(Number);
      const key = slider.id.substr(0, slider.id.indexOf("_"));

      // Change parameter map to reflect slider.
      vals.length == 1 ? (pars[key].val = vals[0]) : (pars[key].val = vals);

      // Make exceptions for parameters that don't update the data.
      if(key != "animspeed") {
        updateGraph(key);
      }
    });

    // Slider snapping.
    slider.noUiSlider.on("slide", function (valuestrings) {
      // Determine snap range in value units.
      const srange = slider.noUiSlider.options.range;
      const snapfrac = 0.02; // Snap range as fraction of slider range.
      const snaprange = (srange["max"] - srange["min"]) * snapfrac;
      // Convert slider value(s) to numbers.
      const vals = valuestrings.map(Number);
      const key = slider.id.substr(0, slider.id.indexOf("_"));

      vals.forEach(function (v, i) {
        pars[key].snaps.forEach(function (snapval) {
          if (math.abs(v - snapval) < snaprange && snap) {
            vals[i] = snapval;
            var tmpvals = [null, null];
            tmpvals[i] = snapval;
            // Use update guard to avoid update on set causing infinite loop.
            slider.noUiSlider.set(tmpvals, false, false);
          }
        });
      });
    });
  });
}
