function addRow(panel, id, pars) {
  // Button.
  var buttond = document.createElement("button");
  buttond.innerHTML = "R";
  buttond.id = id + "_button";
  panel.appendChild(buttond).classname += "grid-item";

  // Label.
  let labeld = document.createElement("div");
  labeld.innerHTML = pars.label;
  labeld.id = id + "_label";
  panel.appendChild(labeld).className += "grid-item";

  // Slider.
  let sliderd = document.createElement("div");
  sliderd.id = id;
  createSlider(sliderd, pars.limits, pars.val, pars.precision, pars.snaps);
  panel.appendChild(sliderd).className += "grid-item";

  // Input(s).
  let inputs = createInput(sliderd);
  panel.appendChild(inputs).className += "grid-item";

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
  var inputs = document.createElement("span");
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

    inputs.appendChild(thisinput).className += "grid-item";
  });
  // Add input fields to span in grid cell.
  inputs.id = sliderd.id + "_input";

  return inputs;
}

function makeRange(sliders, id) {
  // Find range slider keys.
  const rangesliders = sliders.filter((slider) =>
    Array.isArray(slider.noUiSlider.options.start)
  );
  rangesliders.forEach(function (slider) {
    // Remake range sliders with a single handle.
    var ops = slider.noUiSlider.options;
    ops.start = slider.noUiSlider.get()[1];
    slider.noUiSlider.destroy();
    noUiSlider.create(slider, ops);
    // Remake input fields.
    let inputs = createInput(slider);
    document.getElementById(slider.id + "_input").replaceWith(inputs);
  });
  // Find the new range slider and remake it with two handles.
  const newrangeslider = sliders.find((slider) => slider.id == id);
  var ops = newrangeslider.noUiSlider.options;
  ops.start = [
    newrangeslider.noUiSlider.options.range["min"],
    newrangeslider.noUiSlider.get(),
  ];
  newrangeslider.noUiSlider.destroy();
  noUiSlider.create(newrangeslider, ops);
  // Remake input fields.
  let input = createInput(newrangeslider);
  document.getElementById(newrangeslider.id + "_input").replaceWith(input);
}
