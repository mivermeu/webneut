function lintraces(xvals, yvals) {
  let lintrace = (xv, yv, thisname, thiscolor) => ({
    mode: "lines",
    name: thisname,
    line: {
      color: thiscolor,
    },
    x: xv,
    y: yv,
  });

  return [
    lintrace(xvals, yvals[0], "\u03BD<sub>e</sub>", "green"),
    lintrace(xvals, yvals[1], "\u03BD<sub>\u03BC</sub>", "blue"),
    lintrace(xvals, yvals[2], "\u03BD<sub>\u03C4</sub>", "red"),
  ];
}

function makeTernAxis(title, tickangle) {
  return {
    title: title,
    titlefont: { size: 20 },
    tickangle: tickangle,
    tickfont: { size: 15 },
    tickcolor: "rgba(0,0,0,0)",
    ticklen: 5,
    showline: true,
    showgrid: true,
  };
}

// Function to create plot and change between plot types.
function createPlot(div, ptype, pars, xval, yval) {
  if (ptype == "Linear") {
    // Find range variable for label.
    let rangeID = "";
    for(let [key,par] of Object.entries(pars)) {
      if(Array.isArray(par.val)) {
        rangeID = key;
        break;
      }
    }
    const linlayout = {
      font: {
        family: "serif",
        serif: "times",
        size: 18,
      },
      xaxis: {
        title: {
          text: pars[rangeID].label,
          standoff: 100,
        },
      },
      yaxis: {
        title: "P(\u03BD\u2192\u03BD<sub>x</sub>)",
      },
      showlegend: true,
      margin: {
        b: 60,
        t: 20,
        pad: 5
      }
    };

    Plotly.newPlot(div, lintraces(xval, yval), linlayout);
  } else if (ptype == "Ternary") {
    const ternarytrace = {
      type: "scatterternary",
      mode: "lines",
      // It would be extremely nice to have a colour gradient in this line, but this is currently impossible in Plotly.
      // line: {
      //   color: xval
      // },

      a: yval[0],
      b: yval[1],
      c: yval[2],
    };

    const ternlayout = {
      ternary: {
        sum: 1,
        aaxis: makeTernAxis("\u03BD<sub>e</sub>", 0),
        baxis: makeTernAxis("\u03BD<sub>\u03BC</sub>", 45),
        caxis: makeTernAxis("\u03BD<sub>\u03C4</sub>", -45),
      },
      margin: {
        l: 40,
        r: 40,
        b: 50,
        t: 50,
      },
    };

    Plotly.newPlot(div, [ternarytrace], ternlayout);
  }
}
