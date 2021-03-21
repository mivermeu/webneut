function addRow(id, pars) {
  // Label.
  let labeld = document.getElementById(id+"_label");
  labeld.innerHTML = pars.label;

  // Slider.
  let sliderd = document.getElementById(id+"_slider");
  createSlider(sliderd, pars.limits, pars.val, pars.precision, pars.snaps);

  // Input(s).
  document.getElementById(id+"_inputs").replaceWith(createInput(sliderd));

  return sliderd;
}

function createSlider(el, slimits, sstart, precision, snaps = []) {
  noUiSlider.create(el, {
    start: sstart,
    orientation: "horizontal",
    connect: true,
    animate: false,
    // behaviour: 'snap',
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
    thisinput.style.width = "100px";

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
  inputs.id = sliderd.id.substr(0, sliderd.id.indexOf("_")) + "_input";

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
    // Remake input fields.
    let inputs = createInput(slider);
    document.getElementById(key + "_input").replaceWith(inputs);
  });
  // Find the new range slider and remake it with two handles.
  const newrangeslider = sliders.find((slider) => slider.id == id+"_slider");
  var ops = newrangeslider.noUiSlider.options;
  ops.start = [
    newrangeslider.noUiSlider.options.range["min"],
    newrangeslider.noUiSlider.get(),
  ];
  newrangeslider.noUiSlider.destroy();
  noUiSlider.create(newrangeslider, ops);
  // Remake input fields.
  let input = createInput(newrangeslider);
  document.getElementById(id + "_input").replaceWith(input);
}
