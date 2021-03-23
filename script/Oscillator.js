function makeParMap() {
  return {
    nsteps: {
      val: 500,
      label: "Number of points",
      snaps: [],
      precision: 0,
      limits: [1, 1000],
    },
    nu: {
      val: 1,
      label: "Neutrino flavour",
      snaps: [],
      precision: 0,
      limits: [0, 2],
    },
    anti: {
      val: 1,
      label: "Chirality",
      snaps: [],
      precision: 0,
      limits: [-1, 1],
    },
    E: {
      val: 1,
      label: "Energy [GeV]",
      snaps: [],
      precision: 3,
      limits: [0.3, 20],
    },
    L: {
      val: [0, 33060],
      label: "Path length [km]",
      snaps: [],
      precision: 0,
      limits: [0, 40000],
    },
    th12: {
      val: 0.5843,
      label: "\u03b8<sub>12</sub> [rad]",
      snaps: [0.5843, 3.14159265 / 2],
      precision: 4,
      limits: [0, 3.1416],
    },
    th23: {
      val: 0.738,
      label: "\u03b8<sub>23</sub> [rad]",
      snaps: [0.738, 3.14159265 / 2],
      precision: 4,
      limits: [0, 3.1416],
    },
    th13: {
      val: 0.148,
      label: "\u03b8<sub>13</sub> [rad]",
      snaps: [0.148, 3.14159265 / 2, 3.14159265, (3.14159265 / 2) * 3],
      precision: 4,
      limits: [0, 2 * 3.1416],
    },
    Dm21sq: {
      val: 7.5,
      label:
        "\u0394m<sup>2</sup><sub>21</sub> [10<sup>-5</sup> eV<sup>2</sup>]",
      snaps: [7.5],
      precision: 4,
      limits: [0, 10],
    },
    Dm31sq: {
      val: 2.457,
      label:
        "\u0394m<sup>2</sup><sub>31</sub> [10<sup>-5</sup> eV<sup>2</sup>]",
      snaps: [2.457, 0, -2.457],
      precision: 4,
      limits: [-5, 5],
    },
    dCP: {
      val: 0,
      label: "\u03b4<sub>CP</sub> [rad]",
      snaps: [-0.62 * 3.14159265, 0, 3.14159265 / 2, -3.14159265 / 2],
      precision: 4,
      limits: [-3.1416, 3.1416],
    },
    rho: {
      val: 0,
      label: "\u03c1 [kg/m<sup>3</sup>]",
      snaps: [2600],
      precision: 0,
      limits: [0, 10000],
    },
  };
}

class Matrices {
  constructor(pars) {
    // Save a copy of the initial parameter set
    this.pars = _.cloneDeep(pars);

    const s12 = math.sin(pars.th12.val);
    const s23 = math.sin(pars.th23.val);
    const s13 = math.sin(pars.th13.val);
    const c12 = math.cos(pars.th12.val);
    const c23 = math.cos(pars.th23.val);
    const c13 = math.cos(pars.th13.val);

    this.ch = pars.anti.val;

    this.edcp = math.exp(math.complex(0, this.ch * pars.dCP.val));
    this.emdcp = math.pow(this.edcp, -1);

    // Construct oscillation matrix.
    this.U1 = math.matrix([
      [1, 0, 0],
      [0, c23, s23],
      [0, -s23, c23],
    ]);

    this.U2 = math.matrix([
      [c13, 0, math.multiply(s13, this.emdcp)],
      [0, 1, 0],
      [math.multiply(-s13, this.edcp), 0, c13],
    ]);

    this.U3 = math.matrix([
      [c12, s12, 0],
      [-s12, c12, 0],
      [0, 0, 1],
    ]);

    this.U = math.multiply(this.U1, this.U2, this.U3);
    this.Ud = math.ctranspose(this.U);

    // Hamiltonian.
    this.H = math.matrix([
      [0, 0, 0],
      [0, pars.Dm21sq.val * 1e-5, 0],
      [0, 0, pars.Dm31sq.val * 1e-3],
    ]);

    const Gf = 4.54164e-37; // Reduced Fermi constant * (c*hbar)^2 in m^2.
    const Ne = pars.rho.val / 1.672e-27 / 2; // Electron number density in m^-3.
    this.V = math.matrix([
      [this.ch * 1.41421356237 * Gf * Ne * 1e3, 0, 0], // Multiply and convert to km^-1. (1.41... = sqrt(2))
      [0, 0, 0],
      [0, 0, 0],
    ]);
  };

  update = function (pars) {
    // Find all differing keys and update only those parameters that have changed.
    for (const key in this.pars) {
      if (
        this.pars[key].val != pars[key].val &&
        !Array.isArray(pars[key].val)
      ) {
        this.updateFuncs(key, pars[key].val);
        this.pars[key].val = pars[key].val;
      }
    }
  };

  // Specific update functions to avoid having to recreate all matrices on every update.
  updateFuncs = function (key, newval) {
    switch (key) {
      case "th12":
        const s12 = math.sin(newval);
        const c12 = math.cos(newval);
        this.U3._data[0][0] = c12;
        this.U3._data[1][1] = c12;
        this.U3._data[0][1] = s12;
        this.U3._data[1][0] = -s12;
        this.U = math.multiply(this.U1, this.U2, this.U3);
        this.Ud = math.ctranspose(this.U);
        break;
      case "th23":
        const s23 = math.sin(newval);
        const c23 = math.cos(newval);
        this.U1._data[1][1] = c23;
        this.U1._data[1][2] = s23;
        this.U1._data[2][2] = c23;
        this.U1._data[2][1] = -s23;
        this.U = math.multiply(this.U1, this.U2, this.U3);
        this.Ud = math.ctranspose(this.U);
        break;
      case "th13":
        const s13 = math.sin(newval);
        const c13 = math.cos(newval);
        this.U2._data[0][0] = c13;
        this.U2._data[2][2] = c13;
        this.U2._data[0][2] = math.multiply(s13, this.emdcp);
        this.U2._data[2][0] = math.multiply(-s13, this.edcp);
        this.U = math.multiply(this.U1, this.U2, this.U3);
        this.Ud = math.ctranspose(this.U);
        break;
      case "Dm21sq":
        this.H._data[1][1] = newval * 1e-5;
        break;
      case "Dm31sq":
        this.H._data[2][2] = newval * 1e-3;
        break;
      case "anti":
        this.ch = newval;
        this.updateFuncs("dCP", this.pars.dCP.val);
        this.updateFuncs("rho", this.pars.rho.val);
        break;
      case "dCP":
        const sin13 = math.sin(this.pars.th13.val);
        this.edcp = math.exp(math.complex(0, this.ch * newval));
        this.emdcp = math.pow(this.edcp, -1);
        this.U2._data[0][2] = math.multiply(sin13, this.emdcp);
        this.U2._data[2][0] = math.multiply(-sin13, this.edcp);
        this.U = math.multiply(this.U1, this.U2, this.U3);
        this.Ud = math.ctranspose(this.U);
        break;
      case "rho":
        const Gf = 4.54164e-37; // Reduced Fermi constant * (c*hbar)^2 in m^2.
        const Ne = newval / 1.672e-27 / 2; // Electron number density in m^-3.
        this.V._data[0][0] = this.ch * 1.41421356237 * Gf * Ne * 1e3;
        break;
      default:
        break;
    }
  };
}

function oscillateRange(xv, p, m) {
  // Use a temporary non-range parameter map to get oscillation results.
  let tmppars = JSON.parse(JSON.stringify(pars));
  for (let x of xv) {
    tmppars[thisArrID].val = x;
    if (rangeVarIsMixingPar) {
      mat.update(tmppars);
    }
    yValues.push(oscillate(tmppars, mat));
  }
  yValues = math.transpose(yValues);
}

function oscillate(p, m, use_exp = false) {
  if (Array.isArray(p.rho.val) || p.rho.val != 0) {
    return use_exp ? transmatexp(p, m) : transmat(p, m);
  } else {
    return transvac(p, m);
  }
}

function transvac(p, m) {
  var nu = [0, 0, 0];
  nu[p.nu.val] = 1;
  const conv = 1e-6 / ((2 * 1.0545718e-34 * 299792458) / 1.602e-19); // Conversion factor from natural to useful units.
  var Hexp = math.multiply(
    math.complex(0, 1),
    (-conv * p.L.val) / p.E.val,
    m.H
  );
  for (var j = 0; j < 3; ++j) Hexp._data[j][j] = math.exp(Hexp.get([j, j]));
  const UHUdnu = math.multiply(m.U, Hexp, m.Ud, nu);
  return math.re(math.dotMultiply(UHUdnu, math.conj(UHUdnu))).valueOf();
}

function transmat(p, m) {
  var nu = [0, 0, 0];
  nu[p.nu.val] = 1;

  const conv = 1e-6 / ((2 * 1.0545718e-34 * 299792458) / 1.602e-19); // Conversion factor from natural to useful units.
  const N = 128; // Large enough N for Lie product formula.
  // Temporary Hamiltonian to component-wise exponentiate.
  var Hexp = math.multiply(
    math.complex(0, 1),
    (-1 * conv * p.L.val) / p.E.val / N,
    m.H
  );
  for (var j = 0; j < 3; ++j) Hexp._data[j][j] = math.exp(Hexp.get([j, j]));
  var Vexp = math.multiply(math.complex(0, 1), m.V, (-1 * p.L.val) / N);
  Vexp._data[0][0] = math.exp(Vexp.get([0, 0]));
  Vexp._data[1][1] = 1;
  Vexp._data[2][2] = 1;
  // Slow matrix power. Better than exponential...
  const HUdVUpow = math.pow(math.multiply(Hexp, m.Ud, Vexp, m.U), N);
  const UHUdnu = math.multiply(m.U, HUdVUpow, m.Ud, nu);
  return math.re(math.dotMultiply(UHUdnu, math.conj(UHUdnu))).valueOf();
}

function transmatexp(p, m) {
  var nu = [0, 0, 0];
  nu[p.nu.val] = 1;

  const conv = 1e-6 / ((2 * 1.0545718e-34 * 299792458) / 1.602e-19); // Conversion factor from natural to useful units.
  const Htmp = math.multiply(
    math.complex(0, -1),
    m.H,
    (conv * p.L.val) / p.E.val
  );
  const Vtmp = math.multiply(math.complex(0, -1), m.V, p.L.val);
  const Hmat = math.add(Htmp, math.multiply(m.Ud, Vtmp, m.U));
  const UHUdnu = math.multiply(m.U, math.expm(Hmat), m.Ud, nu);
  return math.re(math.dotMultiply(UHUdnu, math.conj(UHUdnu))).valueOf();
}
