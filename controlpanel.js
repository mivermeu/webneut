function addRow(panel, id, pars) {
  // // Radio button.
  // let buttond = document.createElement("div");
  // buttond.innerText = "Hello there.";
  // panel.appendChild(buttond).className += "grid-item";

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
  sstart = sliderd.noUiSlider.options.start;
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

function setPars(newPars, sliders) {
  for (const key in newPars) {
    sliders.forEach(function (slider) {
      if (key == slider.id) {
        slider.noUiSlider.set(newPars[key]);
      }
    });
  }
}

function makeRange(sliders, id) {
  sliders.forEach(function (slider) {
    // Find the (and any) previous range slider and remake it with a single handle.
    if (Array.isArray(slider.noUiSlider.options.start)) {
      var ops = slider.noUiSlider.options;
      ops.start = slider.noUiSlider.get()[1];
      slider.noUiSlider.destroy();
      noUiSlider.create(slider, ops);
      // Remake input fields.
      let inputs = createInput(slider);
      document.getElementById(slider.id + "_input").replaceWith(inputs);
    }
    // Find the new range slider and remake it with two handles.
    if (slider.id == id) {
      var ops = slider.noUiSlider.options;
      ops.start = [
        slider.noUiSlider.options.range["min"],
        slider.noUiSlider.get(),
      ];
      slider.noUiSlider.destroy();
      noUiSlider.create(slider, ops);
      // Remake input fields.
      let input = createInput(slider);
      document.getElementById(slider.id + "_input").replaceWith(input);
    }
  });
}

function mapCheckAndSetEqual(a, b) {
  if (a.size != b.size) {
    return false;
  }

  for (var key in a) {
    for(var kkey in a[key]) {
      if (a[key][kkey] != b[key][kkey]) {
        // Sets the value of the differing key to be equal between maps!
        b[key][kkey] = a[key][kkey];
        return false;
      }
    }
  }

  return true;
}
