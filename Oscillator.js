// // A struct to hold neutrino oscillation parameters.
// var makeParStruct = ({
//   nu = 1, // Initial neutrino flavour. 0=e, 1=mu, 2=tau
//   anti = false, // Antineutrino or not.
//   E = 1, // In GeV.
//   L = 33060.7 * E, // PI / (1.267*Dm21sq) * E (Full Dm12sq period.) In km.
//   th12 = 0.5843,
//   th23 = 0.738,
//   th13 = 0.148,
//   Dm21sq = 7.5, // In 10^-5 eV^2
//   Dm31sq = 2.457, // In 10^-3 eV^2
//   dCP = 1.38 * 3.14159265,
//   rho = 0, // In kg/m^3
// } = {}) => ({
//   nu,
//   anti,
//   E,
//   L,
//   th12,
//   th23,
//   th13,
//   Dm21sq,
//   Dm31sq,
//   dCP,
//   rho,
// });

// function makeParMap() {
//   var pars = new Map();

//   pars.set("nsteps", 300); // Initial neutrino flavour. 0=e, 1=mu, 2=tau
//   pars.set("nu", 1); // Initial neutrino flavour. 0=e, 1=mu, 2=tau
//   pars.set("anti", false); // Antineutrino or not.
//   pars.set("E", 1); // In GeV.
//   pars.set("L", [0, 33060.7]); // PI / (1.267*Dm21sq) * 1 (Full Dm12sq period.) In km.
//   pars.set("th12", 0.5843);
//   pars.set("th23", 0.738);
//   pars.set("th13", 0.148);
//   pars.set("Dm21sq", 7.5); // In 10^-5 eV^2
//   pars.set("Dm31sq", 2.457); // In 10^-3 eV^2
//   pars.set("dCP", 1.38 * 3.14159265);
//   pars.set("rho", 0); // In kg/m^3

//   return pars;
// }

function makeParMap() {
  var pars = {};

  pars["nsteps"] = 300; // Initial neutrino flavour. 0=e, 1=mu, 2=tau
  pars["nu"] = 1; // Initial neutrino flavour. 0=e, 1=mu, 2=tau
  pars["anti"] = false; // Antineutrino or not.
  pars["E"] = 1; // In GeV.
  pars["L"] = [0, 33060.7]; // PI / (1.267*Dm21sq) * 1 (Full Dm12sq period.) In km.
  pars["th12"] = 0.5843;
  pars["th23"] = 0.738;
  pars["th13"] = 0.148;
  pars["Dm21sq"] = 7.5; // In 10^-5 eV^2
  pars["Dm31sq"] = 2.457; // In 10^-3 eV^2
  pars["dCP"] = 1.38 * 3.14159265;
  pars["rho"] = 0; // In kg/m^3

  return pars;
}

function Matrices(pars) {
  this.s12 = math.sin(pars["th12"]);
  this.s23 = math.sin(pars["th23"]);
  this.s13 = math.sin(pars["th13"]);
  this.c12 = math.cos(pars["th12"]);
  this.c23 = math.cos(pars["th23"]);
  this.c13 = math.cos(pars["th13"]);

  this.ch = 1;
  if (pars["anti"]) this.ch = -1;

  this.edcp = math.exp(math.complex(0, this.ch * pars["dCP"]));
  this.emdcp = math.pow(this.edcp, -1);

  // Construct oscillation matrix.
  this.U1 = math.matrix([
    [1, 0, 0],
    [0, this.c23, this.s23],
    [0, -this.s23, this.c23],
  ]);

  this.U2 = math.matrix([
    [this.c13, 0, math.multiply(this.s13, this.emdcp)],
    [0, 1, 0],
    [math.multiply(-this.s13, this.edcp), 0, this.c13],
  ]);

  this.U3 = math.matrix([
    [this.c12, this.s12, 0],
    [-this.s12, this.c12, 0],
    [0, 0, 1],
  ]);

  this.U = math.multiply(this.U1, this.U2, this.U3);
  this.Ud = math.ctranspose(this.U);

  // Hamiltonian.
  this.H = math.matrix([
    [0, 0, 0],
    [0, pars["Dm21sq"] * 1e-5, 0],
    [0, 0, pars["Dm31sq"] * 1e-3],
  ]);
}

function oscillate(p, m) {
  var nu = [0, 0, 0];
  nu[p["nu"]] = 1;
  // const conv = 2.534; // Conversion factor from natural to useful units.
  const conv = 1e-6 / ((2 * 1.0545718e-34 * 299792458) / 1.602e-19); // Conversion factor from natural to useful units.
  var Hexp = math.multiply(
    math.complex(0, 1),
    (-conv * p["L"]) / p["E"],
    m.H
  );
  for (var j = 0; j < 3; ++j) Hexp._data[j][j] = math.exp(Hexp.get([j, j]));
  const UHUdnu = math.multiply(m.U, Hexp, m.Ud, nu);
  return math.re(math.dotMultiply(UHUdnu, math.conj(UHUdnu))).valueOf();
}

// class Oscillator {
//   private:
// 	// Neutrino oscillation parameter struct.
//   OscPars op;

//   // Oscillation matrix.
//   Eigen::Matrix3cd U;
//   Eigen::Matrix3cd Ud;
//   // Hamiltonian and matter potential.
//   Eigen::Matrix3cd H;
//   Eigen::Matrix3cd V;
//   Eigen::Matrix3cd Hexp;
//   Eigen::Matrix3cd Vexp;
//   // Mass difference matrix.
//   Eigen::Matrix3d Dmsq;

//   public:
//   Oscillator() {
//     update();
//   } // Oscillator::Oscillator

//   void update() {
//     const double s12 = sin(op.th12);
//     const double s23 = sin(op.th23);
//     const double s13 = sin(op.th13);
//     const double c12 = cos(op.th12);
//     const double c23 = cos(op.th23);
//     const double c13 = cos(op.th13);

//     // Chirality
//     const double ch = (int)op.anti * -2 + 1; // (-)1 if (anti)neutrino

//     // Construct mixing matrix.
//     Eigen::Matrix3cd U1;
//     U1 << 1, 0, 0,
//           0, c23, s23,
//           0, -s23, c23;
//     Eigen::Matrix3cd U2;
//     U2 << c13, 0, s13*exp(-If*ch*op.dCP),
//           0, 1, 0,
//           -s13*exp(If*ch*op.dCP), 0, c13;
//     Eigen::Matrix3cd U3;
//     U3 << c12, s12, 0,
//           -s12, c12, 0,
//           0, 0, 1;
//     U = U1*U2*U3;
//     Ud = U.adjoint();

//     // Hamiltonian and matter potential.
//     H << 0, 0, 0,
//          0, op.Dm21sq, 0,
//          0, 0, op.Dm31sq;

//     const double Gf = 4.54164e-37; // Reduced Fermi constant * (c*hbar)^2 in m^2.
//     const double Ne = op.rho/(1.672e-27)/2; // Electron number density in m^-3.
//     V(0,0) = ch*sqrt(2)*Gf*Ne * 1e3; // Multiply and convert to km^-1.

//   } // Oscillator::update()

//   // Expose the neutrino oscillation parameter set to mess with it.
//   OscPars& pars() { return op; }

//   // General transformation function that decides between vacuum and matter oscillation.
//   Eigen::Vector3d trans(bool using_exp = false) const {
//     if(op.rho==0) {
//       return transvac();
//     }
//     return using_exp? transmatexp(): transmat();
//   } // Oscillator::trans()

//   // Analytical determination of neutrino oscillation using Hamiltonian.
//   Eigen::Vector3d transvac() const {
//     Eigen::Vector3cd nu(0,0,0);
//     nu(op.nu) = 1;
//     const double conv = 2.534; // Conversion factor from natural to useful units.
//     Eigen::Matrix3cd Hexp = -If*H/op.E*conv*op.L; // Temporary Hamiltonian to component-wise exponentiate.
//     for(int j=0; j<3; ++j) Hexp(j,j) = exp(Hexp(j,j));
//     return (U*Hexp*Ud*nu).cwiseAbs2();
//   } // Oscillator::transvac()

//   // Analytical neutrino oscillation in matter using Hamiltonian.
//   Eigen::Vector3d transmat() const {
//     Eigen::Vector3cd nu(0,0,0);
//     nu(op.nu) = 1;
//     // Propagate.
//     const double conv = 2.534; // Conversion factor from natural to useful units.
//     const int N = 128; // Large enough N for Lie product formula.
//     Eigen::Matrix3cd Hexp = -If*H/op.E*conv*op.L/N; // Temporary Hamiltonian to component-wise exponentiate.
//     for(int j=0; j<3; ++j) Hexp(j,j) = exp(Hexp(j,j));
//     Eigen::Matrix3cd Vexp = -If*V*op.L/N; // Temporary matter potential to component-wise exponentiate.
//     for(int j=0; j<3; ++j) Vexp(j,j) = exp(Vexp(j,j));
//     // Slow matrix power. Better than exponential...
//     Eigen::MatrixPower<Eigen::Matrix3cd> Apow(Hexp*Ud*Vexp*U);
//     return (U*Apow(N)*Ud*nu).cwiseAbs2();
//   } // Oscillator::transmat()

//   // Analytical neutrino oscillation in matter using Hamiltonian, using matrix exponential.
//   Eigen::Vector3d transmatexp() const {
//     Eigen::Vector3cd nu(0,0,0);
//     nu(op.nu) = 1;
//     // Propagate.
//     const double conv = 2.534; // Conversion factor from natural to useful units.
//     const Eigen::Matrix3cd Htmp = -If*H/op.E*conv*op.L; // Temporary Hamiltonian.
//     const Eigen::Matrix3cd Vtmp = -If*V*op.L; // Temporary matter potential.
//     return (U*(Htmp+Ud*Vtmp*U).exp()*Ud*nu).cwiseAbs2();
//   } // Oscillator::transmat()
// }; // class Oscillator

// // Function to export neutrino oscillation data to csv.
// void exportData(const std::vector<Eigen::Vector3d>& probs, const double final) {
//   const std::string filename = "nu.csv";
//   std::ofstream ofile(filename);
//   if(!ofile.is_open()) {
//     std::cout << "Couldn't create file " << filename << ".\n";
//     return;
//   }

//   // Header.
//   ofile << "x,nue,numu,nutau\n";
//   // Record probabilities as function of variable x, either E or L.
//   for(double i = 0; i < probs.size(); ++i) {
//     ofile << i*(final/probs.size()) << ',' << probs[i](0) << ',' << probs[i](1) << ',' << probs[i](2) << '\n';
//   }
//   std::cout << "Saving to " << filename << ".\n";
//   ofile.close();
// }

// // Function to obtain a range of neutrino oscillation probabilities vs a parameter.
// std::vector<Eigen::Vector3d> oscillate(neutosc::Oscillator& osc, double& par, int numsteps = 1000, bool using_exp = false) {
//   const double initial = par;
//   const double step = initial/numsteps;
//   std::vector<Eigen::Vector3d> result(numsteps+1);
//   // Propagate.
//   for(int i=0; i<result.size(); ++i) {
//     par = i*step;
//     osc.update();
//     result[i] = osc.trans(using_exp);
//   }
//   // Reset to original parameter value to avoid rounding errors.
//   par = initial;
//   return result;
// } // std::vector<Eigen::Vector3d> oscillate()
