/* StayPicker: measured raster trajectories, dependency-free WAAPI implementation. */
(() => {
'use strict';
// Horizontal fits: corrected broad-photo detector; all four edges in data/repair/expand-edges.csv.
const MEASURED = Object.freeze({
  // f0210..f0233; x0 residual 2.6505px.
  'expand-team': {"duration":766.6666666666666,"ease":[0.497385,0.0,0.095491,0.960471],"rmse":2.6505},
  // f0268..f0290; x0 residual 2.4684px.
  'collapse-team': {"duration":733.3333333333334,"ease":[0.890518,0.078534,0.487593,1.0],"rmse":2.4684},
  // f0326..f0349; x0 residual 1.9013px.
  'expand-story': {"duration":766.6666666666666,"ease":[0.449967,0.0,0.101048,0.955444],"rmse":1.9013},
  // f0383..f0406; x0 residual 1.9274px.
  'collapse-story': {"duration":766.6666666666666,"ease":[0.89867,0.04399,0.550928,1.0],"rmse":1.9274},
  // f0442..f0465; x1 residual 1.9274px.
  'expand-technology': {"duration":766.6666666666666,"ease":[0.449074,0.0,0.10135,0.956055],"rmse":1.9274},
  // f0499..f0522; x1 residual 1.8736px.
  'collapse-technology': {"duration":766.6666666666666,"ease":[0.900048,0.044601,0.549393,1.0],"rmse":1.8736},
  // f0559..f0582; x1 residual 2.4737px.
  'expand-approach': {"duration":766.6666666666666,"ease":[0.450338,0.0,0.098644,0.95111],"rmse":2.4737},
  // f0616..f0639; x1 residual 2.5315px.
  'collapse-approach': {"duration":766.6666666666666,"ease":[0.899977,0.047782,0.550254,1.0],"rmse":2.5315},
  // f0035..f0062; y0 residual 0.7164px.
  'hover-enter': {"duration":900.0,"ease":[0.417875,0.063378,0.231709,0.942504],"rmse":0.7164},
  // f0074..f0101; y1 residual 0.9905px.
  'hover-exit': {"duration":900.0,"ease":[0.406905,0.06161,0.221735,0.974059],"rmse":0.9905},
  // f0080..f0107; y0 residual 0.7005px.
  'technology-enter': {"duration":900.0,"ease":[0.414555,0.059534,0.2366,0.950926],"rmse":0.7005},
  // f0126..f0153; y0 residual 0.7868px.
  'story-enter': {"duration":900.0,"ease":[0.419129,0.065329,0.230339,0.939929],"rmse":0.7868},
  // f0177..f0204; y0 residual 0.7254px.
  'team-enter': {"duration":900.0,"ease":[0.418523,0.064294,0.230709,0.940925],"rmse":0.7254},
});
const GEOMETRY = {"expand-team":[[0.748457,0.0,1.0,1.0],[0.748457,0.0,1.0,1.0],[0.746914,0.0,1.0,1.0],[0.734568,0.0,1.0,1.0],[0.71142,0.0,1.0,1.0],[0.669753,0.0,1.0,1.0],[0.598765,0.0,1.0,1.0],[0.492284,0.0,1.0,1.0],[0.382716,0.0,1.0,1.0],[0.294753,0.0,1.0,1.0],[0.228395,0.0,1.0,1.0],[0.179012,0.0,1.0,1.0],[0.138889,0.0,1.0,1.0],[0.108025,0.0,1.0,1.0],[0.083333,0.0,1.0,1.0],[0.061728,0.0,1.0,1.0],[0.044753,0.0,1.0,1.0],[0.032407,0.0,1.0,1.0],[0.021605,0.0,1.0,1.0],[0.012346,0.0,1.0,1.0],[0.006173,0.0,1.0,1.0],[0.001543,0.0,1.0,1.0],[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0]],"collapse-team":[[0.0,0.0,1.0,1.0],[0.001543,0.0,1.0,1.0],[0.006173,0.0,1.0,1.0],[0.012346,0.0,1.0,1.0],[0.020062,0.0,1.0,1.0],[0.032407,0.0,1.0,1.0],[0.044753,0.0,1.0,1.0],[0.061728,0.0,1.0,1.0],[0.08179,0.0,1.0,1.0],[0.108025,0.0,1.0,1.0],[0.138889,0.0,1.0,1.0],[0.179012,0.0,1.0,1.0],[0.228395,0.0,1.0,1.0],[0.294753,0.0,1.0,1.0],[0.382716,0.0,1.0,1.0],[0.492284,0.0,1.0,1.0],[0.598765,0.0,1.0,1.0],[0.669753,0.0,1.0,1.0],[0.71142,0.0,1.0,1.0],[0.734568,0.0,1.0,1.0],[0.74537,0.0,1.0,1.0],[0.748457,0.0,1.0,1.0],[0.748457,0.0,1.0,1.0]],"expand-story":[[0.498457,0.0,0.751543,1.0],[0.498457,0.0,0.751543,1.0],[0.496914,0.0,0.753086,1.0],[0.487654,0.0,0.763889,1.0],[0.466049,0.0,0.783951,1.0],[0.427469,0.0,0.822531,1.0],[0.368827,0.0,0.881173,1.0],[0.29784,0.0,0.953704,1.0],[0.234568,0.0,1.0,1.0],[0.185185,0.0,1.0,1.0],[0.146605,0.0,1.0,1.0],[0.115741,0.0,1.0,1.0],[0.091049,0.0,1.0,1.0],[0.070988,0.0,1.0,1.0],[0.055556,0.0,1.0,1.0],[0.041667,0.0,1.0,1.0],[0.030864,0.0,1.0,1.0],[0.021605,0.0,1.0,1.0],[0.015432,0.0,1.0,1.0],[0.009259,0.0,1.0,1.0],[0.00463,0.0,1.0,1.0],[0.001543,0.0,1.0,1.0],[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0]],"collapse-story":[[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0],[0.001543,0.0,1.0,1.0],[0.00463,0.0,1.0,1.0],[0.009259,0.0,1.0,1.0],[0.015432,0.0,1.0,1.0],[0.021605,0.0,1.0,1.0],[0.030864,0.0,1.0,1.0],[0.041667,0.0,1.0,1.0],[0.055556,0.0,1.0,1.0],[0.070988,0.0,1.0,1.0],[0.091049,0.0,1.0,1.0],[0.115741,0.0,1.0,1.0],[0.145062,0.0,1.0,1.0],[0.185185,0.0,1.0,1.0],[0.234568,0.0,1.0,1.0],[0.29784,0.0,0.953704,1.0],[0.367284,0.0,0.881173,1.0],[0.427469,0.0,0.822531,1.0],[0.466049,0.0,0.783951,1.0],[0.487654,0.0,0.763889,1.0],[0.496914,0.0,0.753086,1.0],[0.498457,0.0,0.751543,1.0],[0.498457,0.0,0.751543,1.0]],"expand-technology":[[0.248457,0.0,0.501543,1.0],[0.248457,0.0,0.501543,1.0],[0.246914,0.0,0.503086,1.0],[0.236111,0.0,0.512346,1.0],[0.216049,0.0,0.533951,1.0],[0.177469,0.0,0.572531,1.0],[0.118827,0.0,0.632716,1.0],[0.046296,0.0,0.70216,1.0],[0.0,0.0,0.765432,1.0],[0.0,0.0,0.814815,1.0],[0.0,0.0,0.854938,1.0],[0.0,0.0,0.884259,1.0],[0.0,0.0,0.908951,1.0],[0.0,0.0,0.929012,1.0],[0.0,0.0,0.944444,1.0],[0.0,0.0,0.958333,1.0],[0.0,0.0,0.969136,1.0],[0.0,0.0,0.978395,1.0],[0.0,0.0,0.984568,1.0],[0.0,0.0,0.990741,1.0],[0.0,0.0,0.99537,1.0],[0.0,0.0,0.998457,1.0],[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0]],"collapse-technology":[[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0],[0.0,0.0,0.998457,1.0],[0.0,0.0,0.99537,1.0],[0.0,0.0,0.990741,1.0],[0.0,0.0,0.984568,1.0],[0.0,0.0,0.978395,1.0],[0.0,0.0,0.969136,1.0],[0.0,0.0,0.958333,1.0],[0.0,0.0,0.944444,1.0],[0.0,0.0,0.929012,1.0],[0.0,0.0,0.908951,1.0],[0.0,0.0,0.884259,1.0],[0.0,0.0,0.854938,1.0],[0.0,0.0,0.814815,1.0],[0.0,0.0,0.765432,1.0],[0.046296,0.0,0.70216,1.0],[0.118827,0.0,0.631173,1.0],[0.177469,0.0,0.572531,1.0],[0.216049,0.0,0.533951,1.0],[0.236111,0.0,0.512346,1.0],[0.24537,0.0,0.503086,1.0],[0.248457,0.0,0.501543,1.0],[0.248457,0.0,0.501543,1.0]],"expand-approach":[[0.0,0.0,0.251543,1.0],[0.0,0.0,0.251543,1.0],[0.0,0.0,0.25463,1.0],[0.0,0.0,0.270062,1.0],[0.0,0.0,0.300926,1.0],[0.0,0.0,0.358025,1.0],[0.0,0.0,0.445988,1.0],[0.0,0.0,0.552469,1.0],[0.0,0.0,0.648148,1.0],[0.0,0.0,0.722222,1.0],[0.0,0.0,0.780864,1.0],[0.0,0.0,0.825617,1.0],[0.0,0.0,0.862654,1.0],[0.0,0.0,0.891975,1.0],[0.0,0.0,0.916667,1.0],[0.0,0.0,0.936728,1.0],[0.0,0.0,0.95216,1.0],[0.0,0.0,0.966049,1.0],[0.0,0.0,0.976852,1.0],[0.0,0.0,0.984568,1.0],[0.0,0.0,0.992284,1.0],[0.0,0.0,0.996914,1.0],[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0]],"collapse-approach":[[0.0,0.0,1.0,1.0],[0.0,0.0,1.0,1.0],[0.0,0.0,0.996914,1.0],[0.0,0.0,0.992284,1.0],[0.0,0.0,0.984568,1.0],[0.0,0.0,0.976852,1.0],[0.0,0.0,0.966049,1.0],[0.0,0.0,0.953704,1.0],[0.0,0.0,0.936728,1.0],[0.0,0.0,0.916667,1.0],[0.0,0.0,0.891975,1.0],[0.0,0.0,0.862654,1.0],[0.0,0.0,0.825617,1.0],[0.0,0.0,0.779321,1.0],[0.0,0.0,0.722222,1.0],[0.0,0.0,0.648148,1.0],[0.0,0.0,0.552469,1.0],[0.0,0.0,0.445988,1.0],[0.0,0.0,0.358025,1.0],[0.0,0.0,0.300926,1.0],[0.0,0.0,0.270062,1.0],[0.0,0.0,0.25463,1.0],[0.0,0.0,0.251543,1.0],[0.0,0.0,0.251543,1.0]]};
// SIFT f0042..0070: parallax .500325, residual .337px; f0076..0090: .499640, .227px.
// SIFT f0210..0240: image scale 1→2.25094; width-derived scale residual .005739.
// Label OUR template f0210..0233: 1→1.425; opening model RMSE .267–.443px; weak crossfade frames excluded, see label-model.json.
// Circle Hough: 58 settled observations, center (558.5,359.5), radius59.9, SD <.67px. Fixed, not a follower.
const MOTION = Object.freeze({reveal:900,exit:900,parallax:.5,imageScale:2.25094,imagePivot:(438.894-158)/405,labelScale:1.425,thumbX:(558.5-36)/648,thumbY:(359.5-158)/405,thumbRatio:119.8/648,fade:160,detailsHold:500});
// Thumbnail growth f0226..0248, Hough radius; onset bracket f0223..0226, interpolated gaps.
const THUMB = [{"offset":0.0,"opacity":"1","transform":"scale(0.000000)"},{"offset":0.04,"opacity":"1","transform":"scale(0.058333)"},{"offset":0.08,"opacity":"1","transform":"scale(0.116667)"},{"offset":0.12,"opacity":"1","transform":"scale(0.175000)"},{"offset":0.16,"opacity":"1","transform":"scale(0.248333)"},{"offset":0.2,"opacity":"1","transform":"scale(0.335000)"},{"offset":0.24,"opacity":"1","transform":"scale(0.418333)"},{"offset":0.28,"opacity":"1","transform":"scale(0.498333)"},{"offset":0.32,"opacity":"1","transform":"scale(0.566667)"},{"offset":0.36,"opacity":"1","transform":"scale(0.630000)"},{"offset":0.4,"opacity":"1","transform":"scale(0.670000)"},{"offset":0.44,"opacity":"1","transform":"scale(0.715000)"},{"offset":0.48,"opacity":"1","transform":"scale(0.756667)"},{"offset":0.52,"opacity":"1","transform":"scale(0.794167)"},{"offset":0.56,"opacity":"1","transform":"scale(0.831667)"},{"offset":0.6,"opacity":"1","transform":"scale(0.851667)"},{"offset":0.64,"opacity":"1","transform":"scale(0.870000)"},{"offset":0.68,"opacity":"1","transform":"scale(0.888333)"},{"offset":0.72,"opacity":"1","transform":"scale(0.906667)"},{"offset":0.76,"opacity":"1","transform":"scale(0.926667)"},{"offset":0.8,"opacity":"1","transform":"scale(0.945000)"},{"offset":0.84,"opacity":"1","transform":"scale(0.963333)"},{"offset":0.88,"opacity":"1","transform":"scale(0.981667)"},{"offset":0.92,"opacity":"1","transform":"scale(0.980000)"},{"offset":0.96,"opacity":"1","transform":"scale(0.980000)"},{"offset":1.0,"opacity":"1","transform":"scale(1.000000)"}];
// Word ink bounds/contrast: f0025..0066, detected starts 25/32/39/45/52; source frame interval 33.333ms; no inferred CSS blur.
const INTRO = [{"delay":0,"duration":466.6666666666667,"frames":[{"offset":0,"y":88.0,"angle":0.0,"opacity":0},{"offset":0.07142857142857142,"y":78.0,"angle":0.0,"opacity":0.34897021276595747},{"offset":0.14285714285714285,"y":61.0,"angle":0.0,"opacity":0.5064191489361702},{"offset":0.21428571428571427,"y":48.0,"angle":0.0,"opacity":0.5957234042553192},{"offset":0.2857142857142857,"y":39.0,"angle":0.0,"opacity":0.685136170212766},{"offset":0.35714285714285715,"y":31.0,"angle":0.0,"opacity":0.7546914893617022},{"offset":0.42857142857142855,"y":25.0,"angle":0.0,"opacity":0.8042808510638298},{"offset":0.5,"y":20.0,"angle":0.0,"opacity":0.8425851063829788},{"offset":0.5714285714285714,"y":15.0,"angle":0.0,"opacity":0.8935851063829788},{"offset":0.6428571428571429,"y":12.0,"angle":0.0,"opacity":0.9276574468085107},{"offset":0.7142857142857143,"y":9.0,"angle":0.0,"opacity":0.9318893617021278},{"offset":0.7857142857142857,"y":6.0,"angle":0.0,"opacity":0.9574978723404255},{"offset":0.8571428571428571,"y":4.0,"angle":0.0,"opacity":0.993631914893617},{"offset":0.9285714285714286,"y":3.0,"angle":0.0,"opacity":0.9787659574468086},{"offset":1.0,"y":2.0,"angle":0.0,"opacity":0.9701936170212767}]},{"delay":233.33333333333334,"duration":466.6666666666667,"frames":[{"offset":0,"y":87.0,"angle":0.0,"opacity":0},{"offset":0.07142857142857142,"y":77.0,"angle":0.0,"opacity":0.35710714285714285},{"offset":0.14285714285714285,"y":60.0,"angle":0.0,"opacity":0.5042142857142857},{"offset":0.21428571428571427,"y":47.0,"angle":0.0,"opacity":0.592392857142857},{"offset":0.2857142857142857,"y":38.0,"angle":0.0,"opacity":0.6806785714285714},{"offset":0.35714285714285715,"y":30.0,"angle":0.0,"opacity":0.7478571428571428},{"offset":0.42857142857142855,"y":24.0,"angle":0.0,"opacity":0.8025},{"offset":0.5,"y":19.0,"angle":0.0,"opacity":0.8445},{"offset":0.5714285714285714,"y":15.0,"angle":0.0,"opacity":0.8951785714285715},{"offset":0.6428571428571429,"y":11.0,"angle":0.0,"opacity":0.924},{"offset":0.7142857142857143,"y":9.0,"angle":0.0,"opacity":0.9590357142857143},{"offset":0.7857142857142857,"y":6.0,"angle":0.0,"opacity":0.9537857142857142},{"offset":0.8571428571428571,"y":4.0,"angle":0.0,"opacity":0.9496071428571429},{"offset":0.9285714285714286,"y":3.0,"angle":0.0,"opacity":0.9706071428571429},{"offset":1.0,"y":1.0,"angle":0.0,"opacity":0.9999642857142857}]},{"delay":466.6666666666667,"duration":466.6666666666667,"frames":[{"offset":0,"y":86.0,"angle":0.0,"opacity":0},{"offset":0.07142857142857142,"y":76.0,"angle":0.0,"opacity":0.36404184100418413},{"offset":0.14285714285714285,"y":59.0,"angle":0.0,"opacity":0.4936757322175732},{"offset":0.21428571428571427,"y":48.0,"angle":0.0,"opacity":0.610826359832636},{"offset":0.2857142857142857,"y":38.0,"angle":0.0,"opacity":0.6819916317991632},{"offset":0.35714285714285715,"y":31.0,"angle":0.0,"opacity":0.7259497907949791},{"offset":0.42857142857142855,"y":25.0,"angle":0.0,"opacity":0.7866589958158995},{"offset":0.5,"y":20.0,"angle":0.0,"opacity":0.8242154811715481},{"offset":0.5714285714285714,"y":15.0,"angle":-0.9710000000000036,"opacity":0.8535564853556485},{"offset":0.6428571428571429,"y":12.0,"angle":0.0,"opacity":0.9162928870292887},{"offset":0.7142857142857143,"y":9.0,"angle":0.0,"opacity":0.9414728033472803},{"offset":0.7857142857142857,"y":6.0,"angle":0.0,"opacity":0.9581171548117156},{"offset":0.8571428571428571,"y":4.0,"angle":0.0,"opacity":0.9740146443514645},{"offset":0.9285714285714286,"y":3.0,"angle":0.0,"opacity":0.9832970711297071},{"offset":1.0,"y":2.0,"angle":0.0,"opacity":0.9623849372384937}]},{"delay":666.6666666666666,"duration":466.6666666666667,"frames":[{"offset":0,"y":112.0,"angle":0,"opacity":0},{"offset":0.07142857142857142,"y":102.0,"angle":0,"opacity":0.12348168654173768},{"offset":0.14285714285714285,"y":74.0,"angle":0.9879999999999995,"opacity":0.38271720613287913},{"offset":0.21428571428571427,"y":57.0,"angle":0.0,"opacity":0.506850511073254},{"offset":0.2857142857142857,"y":45.0,"angle":0.0,"opacity":0.6217525553662693},{"offset":0.35714285714285715,"y":37.0,"angle":0.0,"opacity":0.691041311754685},{"offset":0.42857142857142855,"y":29.0,"angle":0.0,"opacity":0.8007304088586032},{"offset":0.5,"y":23.0,"angle":0.9710000000000036,"opacity":0.8007304088586032},{"offset":0.5714285714285714,"y":18.0,"angle":-0.894999999999996,"opacity":0.8389586882453154},{"offset":0.6428571428571429,"y":14.0,"angle":0.0,"opacity":0.9071614139693359},{"offset":0.7142857142857143,"y":11.0,"angle":0.0,"opacity":0.9326831345826238},{"offset":0.7857142857142857,"y":8.0,"angle":0.0,"opacity":0.9412627768313461},{"offset":0.8571428571428571,"y":5.0,"angle":0.0,"opacity":0.9880706984667805},{"offset":0.9285714285714286,"y":3.0,"angle":0.0,"opacity":0.9923062180579219},{"offset":1.0,"y":2.0,"angle":0.0,"opacity":0.9752555366269168}]},{"delay":900.0,"duration":500.0,"frames":[{"offset":0,"y":110.0,"angle":-0.8810000000000002,"opacity":0},{"offset":0.06666666666666667,"y":100.0,"angle":-0.8810000000000002,"opacity":0.1393094262295082},{"offset":0.13333333333333333,"y":74.0,"angle":0.0,"opacity":0.37298975409836066},{"offset":0.2,"y":58.0,"angle":0.0,"opacity":0.5122991803278688},{"offset":0.26666666666666666,"y":46.0,"angle":0.0,"opacity":0.5983094262295082},{"offset":0.3333333333333333,"y":37.0,"angle":0.0,"opacity":0.6827520491803278},{"offset":0.4,"y":30.0,"angle":0.0,"opacity":0.7336475409836065},{"offset":0.4666666666666667,"y":24.0,"angle":0.0,"opacity":0.7622827868852459},{"offset":0.5333333333333333,"y":19.0,"angle":0.0,"opacity":0.8196577868852458},{"offset":0.6,"y":15.0,"angle":0.0,"opacity":0.860625},{"offset":0.6666666666666666,"y":11.0,"angle":0.0,"opacity":0.9043094262295082},{"offset":0.7333333333333333,"y":9.0,"angle":0.0,"opacity":0.9139241803278688},{"offset":0.8,"y":6.0,"angle":0.0,"opacity":0.9276147540983606},{"offset":0.8666666666666667,"y":4.0,"angle":0.0,"opacity":0.9467397540983606},{"offset":0.9333333333333333,"y":3.0,"angle":0.0,"opacity":0.9712991803278688},{"offset":1.0,"y":2.0,"angle":0.0,"opacity":0.9676413934426229}]}];
let serial=0, modalOwner=null;
const mounts=new WeakMap();
const clamp=v=>Math.max(0,Math.min(1,v));
const easeString=a=>`cubic-bezier(${a.join(',')})`;
function mount(el,options={}) {
  const REST=Number.isFinite(options.rest)?Math.min(.9,Math.max(.05,options.rest)):null; // Þurranes
  if(!(el instanceof HTMLElement))throw new TypeError('mount needs an element');
  const units=options.units;
  if(!Array.isArray(units)||units.length<2||units.length>6)throw new RangeError('Provide 2 to 6 units');
  if(new Set(units.map(u=>u.id)).size!==units.length)throw new Error('Unit ids must be unique');
  const url=s=>{const u=new URL(s,location.href);if(!['http:','https:'].includes(u.protocol))throw new TypeError('Only HTTP(S) URLs supported');return u.href};
  for(const u of units){for(const k of ['id','name','image','imageAlt','href'])if(typeof u[k]!=='string')throw new TypeError(`Unit ${k} must be a string`);url(u.image);url(u.href);if(u.focus!==undefined&&(!/^\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%$/.test(u.focus)||u.focus.split(/\s+/).some(v=>parseFloat(v)>100)))throw new TypeError('Unit focus must be two percentages from 0% to 100%')}
  mounts.get(el)?.destroy();
  const original=[...el.childNodes],originalClass=el.className,originalStyle=el.getAttribute('style'),id=`stay-picker-${++serial}`,historyKey=`__${id}`;
  const abort=new AbortController(),animations=new Map(),reduce=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:768px), (hover:none) and (pointer:coarse)');
  let dead=false,state='closed',active=-1,hovered=-1,epoch=0,width=0,height=0,locked=null,ignoreFocus=false,historyEntry=false,historyBase=null;
  const inertRecords=new Map(),layers=[],buttons=[],baseLabels=[],photoLabels=[];
  const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n};
  const on=(n,e,fn)=>n.addEventListener(e,fn,{signal:abort.signal});
  const isMobile=()=>!options.desktopProof&&mobile.matches;
  const setState=s=>{state=s;el.dataset.state=s};
  el.replaceChildren();el.classList.add('sp');el.style.setProperty('--count',units.length);
  const grid=node('div','sp-grid'),base=node('div','sp-base-labels'),brand=node('div','sp-brand',options.brand||'FIELD / STAYS'),head=node('header','sp-head'),h=node('h1','');base.setAttribute('aria-hidden','true'); // Þurranes: labels hold per-letter twins for the hover roll; the buttons carry the names
  
  for(const line of options.headline||['ELEVATING COMFORT','WITH EVERY STAY']){const l=node('span','sp-line');for(const word of line.split(/\s+/)){const w=node('span','sp-word',word);l.append(w,document.createTextNode(' '))}h.append(l)}head.append(h);
  el.append(base,grid,brand,head);
  // Þurranes: every letter carries a twin below it, so hover can roll the name (CSS, staggered by --k).
  function roll(text,start){const line=node('span','');[...text].forEach((c,k)=>{const ch=node('span','sp-ch');ch.style.setProperty('--k',start+k);const t=c===' '?'\u00a0':c;ch.append(node('span','',t),node('span','',t));line.append(ch)});return line}
  function makeLabel(u,cls){const l=node('div',cls),parts=u.name.trim().split(/\s+/);if(parts.length>1){const last=parts.pop(),first=parts.join(' ');l.append(roll(first,0),roll(last,first.length))}else l.append(roll(u.name,0));if(u.sub){const sub=node('span','sp-sub');sub.append(node('span','',u.sub),node('span','',u.subHot||u.sub));l.append(sub)}return l}
  units.forEach((u,i)=>{
    const b=node('button','sp-unit');b.type='button';b.tabIndex=i? -1:0;b.setAttribute('aria-label',`${options.exploreLabel||'Explore'} ${u.name}`);b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',id);grid.append(b);buttons.push(b);
    const label=makeLabel(u,'sp-label');base.append(label);baseLabels.push(label);
    const layer=node('div','sp-photo');layer.setAttribute('aria-hidden','true');const image=node('img','sp-image');image.src=url(u.image);image.style.objectPosition=u.focus||'50% 50%';image.alt='';image.loading='lazy';image.decoding='async';layer.append(image);
    const white=makeLabel(u,'sp-photo-label');layer.append(white);photoLabels.push(white);el.append(layer);layers.push({el:layer,image,version:0,rect:[i/units.length,1,(i+1)/units.length,1],visible:false});
  });
  const panel=node('section','sp-panel');panel.id=id;panel.hidden=true;panel.tabIndex=-1;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',(options.labels||{}).details||'Stay details');
  const controls=node('div','sp-controls'),prev=node('button','',(options.labels||{}).previous||'Previous'),next=node('button','',(options.labels||{}).next||'Next'),close=node('button','',(options.labels||{}).close||'Close'); /* Þurranes: localized */for(const b of [prev,next,close]){b.type='button';controls.append(b)}
  const details=node('div','sp-details'),title=node('h2','sp-title'),kicker=node('p','sp-kicker'),meta=node('ul','sp-meta'),desc=node('p','sp-description'),book=node('a','sp-book');const tbox=node('div',''),cbox=node('div','');tbox.append(kicker,title);cbox.append(meta,desc,book);details.append(tbox,cbox);panel.append(details,controls);
  const thumb=node('div','sp-thumb'),thumbImage=node('img','');thumbImage.alt='';thumb.append(thumbImage);thumb.setAttribute('aria-hidden','true');const cursor=node('div','sp-cursor','✱');cursor.setAttribute('aria-hidden','true');el.append(panel,thumb,cursor);
  const light=node('div','sp-chrome-light');light.setAttribute('aria-hidden','true');light.append(head.cloneNode(true),brand.cloneNode(true));el.append(light);
  function cancel(n){const a=animations.get(n);if(a){const cs=getComputedStyle(n);for(const key of a._props)n.style[key]=cs[key];a.cancel();animations.delete(n)}}
  function animate(n,frames,duration,delay=0,easing='linear'){
    cancel(n);const keys=Object.keys(frames[0]).filter(k=>k!=='offset'&&k!=='easing');Object.assign(n.style,Object.fromEntries(keys.map(k=>[k,frames.at(-1)[k]])));
    const a=n.animate(frames,{duration,delay,easing,fill:'both'});
    // Start every coupled layer on this document frame, not a later pending-play frame.
    // Respect externally paused animations (the deterministic proof clock).
    if(a.playState!=='paused')a.startTime=document.timeline.currentTime;
    a._props=keys;animations.set(n,a);
    return a.finished.then(()=>{if(animations.get(n)===a){Object.assign(n.style,Object.fromEntries(keys.map(k=>[k,frames.at(-1)[k]])));a.cancel();animations.delete(n)}return true},()=>false);
  }
  function fade(n,to,ms=MOTION.fade,delay=0){const from=getComputedStyle(n).opacity;return animate(n,[{opacity:from},{opacity:String(to)}],ms,delay)}
  function baseRect(i){if(isMobile()){const top=156/height,band=(1-top)/units.length;return [0,top+i*band,1,top+(i+1)*band]}return [i/units.length,0,(i+1)/units.length,1]}
  const clip=r=>`inset(${r[1]*100}% ${(1-r[2])*100}% ${(1-r[3])*100}% ${r[0]*100}%)`;
  function currentRect(i){const v=getComputedStyle(layers[i].el).clipPath.match(/-?[\d.]+/g)?.map(Number);if(!v||v.length<4)return layers[i].rect;return [v[3]/100,v[0]/100,1-v[1]/100,1-v[2]/100]}
  function progress(i,r){const b=baseRect(i);return isMobile()?clamp(((r[3]-r[1])-(b[3]-b[1]))/(1-(b[3]-b[1]))):clamp(((r[2]-r[0])-(b[2]-b[0]))/(1-(b[2]-b[0])))}
  function imageTransform(i,r){
    if(isMobile()){
      // Center the chosen vertical focal point inside a resting band. Clamp at
      // the mask edges so full bleed always covers the viewport without gaps.
      const fy=parseFloat((units[i].focus||'50% 50%').split(/\s+/)[1])/100;
      const dy=Math.max((r[3]-1)*height,Math.min(r[1]*height,((r[1]+r[3])/2-fy)*height))-(units[i].openY!=null?progress(i,r)*Math.min(.4,Math.max(0,units[i].openY-.3))*height:0); // Þurranes: lift the house above the details sheet when open
      return `translateX(-50%) translateY(${dy}px)`;
    }
    const b=baseRect(i),initial=b[2]-b[0],p=clamp(((r[2]-r[0])-initial)/(1-initial));
    const dx=((r[0]+r[2])/2-.5)*width,d=r[1]+r[3]-1,dy=(REST!=null?Math.max(0,d-REST):d)*height*MOTION.parallax; // Þurranes: no parallax drop at rest
    return `translateX(-50%) translate(${dx}px,${dy}px) scale(${1+(MOTION.imageScale-1)*p})`;
  }
  function labelTransform(i,r){const b=baseRect(i),p=progress(i,r),scale=1+(MOTION.labelScale-1)*p;
    const inset=isMobile()?20:width*(18/648);const x=(isMobile()?0:r[0]*width)+inset;
    const y=isMobile()?((1-p)*((b[1]+b[3])/2*height-22)+p*(height-92)):(height*(343/405)-p*height*(14/405));
    return `translate(${x}px,${y}px) scale(${scale})`;
  }
  function put(i,r,visible=true){const l=layers[i];l.rect=r;l.visible=visible;l.el.style.clipPath=clip(r);l.el.style.opacity=visible?'1':'0';l.image.style.transform=imageTransform(i,r);photoLabels[i].style.transform=labelTransform(i,r)}
  function stopLayer(i){const l=layers[i];l.version++;if(i===active)cancel(light);for(const n of [l.el,l.image,photoLabels[i]])cancel(n)}
  // Þurranes: `rest` (0..1) keeps every desktop photo visible from that height down, so the closed picker reads as
  // four houses. Hover rises rest -> full column on the measured ease and settles back; open/collapse are unchanged.
  function restRect(i){const b=baseRect(i);return [b[0],REST,b[2],1]}
  function hide(i){stopLayer(i);const b=baseRect(i);if(REST!=null&&!isMobile()){put(i,restRect(i));return}put(i,[b[0],b[3],b[2],b[3]],false)}
  function run(i,path,duration,{easing='linear',done}={}){
    const l=layers[i];stopLayer(i);const token=l.version;l.visible=true;l.rect=path.at(-1);l.el.style.opacity='1';
    if(reduce.matches){put(i,path.at(-1));fade(l.el,1);return Promise.resolve().then(()=>{if(token===l.version)done?.()})}
    const keys=path.map((r,j)=>({clipPath:clip(r),offset:j/(path.length-1)}));
    if(i===active&&state!=='closed')animate(light,keys,duration,0,easing);
    animate(l.image,path.map((r,j)=>({transform:imageTransform(i,r),offset:j/(path.length-1)})),duration,0,easing);
    animate(photoLabels[i],path.map((r,j)=>({transform:labelTransform(i,r),offset:j/(path.length-1)})),duration,0,easing);
    return animate(l.el,keys,duration,0,easing).then(ok=>{if(ok&&token===l.version)done?.()});
  }
  function preload(i){for(const j of [i,(i+1)%units.length])layers[j].image.loading='eager'}
  function hover(i){if(dead||state!=='closed'||isMobile()||i===hovered)return;const old=hovered;hovered=i;
    photoLabels.forEach((n,j)=>n.classList.toggle('is-hot',j===i)); // Þurranes
    if(old>=0&&old!==i&&layers[old].visible){const r=currentRect(old),end=REST!=null?restRect(old):[r[0],0,r[2],0];run(old,[r,end],MOTION.exit,{easing:easeString(MEASURED['hover-exit'].ease),done:()=>{if(hovered!==old)hide(old)}})}
    if(i<0)return;preload(i);const b=baseRect(i),l=layers[i];const start=l.visible?currentRect(i):[b[0],b[3],b[2],b[3]];
    if(reduce.matches){stopLayer(i);put(i,b);if(REST==null){l.el.style.opacity='0';fade(l.el,1)}return}
    run(i,[start,b],MOTION.reveal,{easing:easeString(MEASURED['hover-enter'].ease)});
  }
  function trajectory(i,kind,current){
    const j=units.length===4?i:Math.round(i/(units.length-1)*3),name=`${kind}-${['approach','technology','story','team'][j]}`,raw=GEOMETRY[name],b=baseRect(i);
    let path;
    if(!isMobile()&&units.length===4)path=raw.map(r=>r.map(clamp));
    else {const rb=GEOMETRY[`expand-${['approach','technology','story','team'][j]}`][0],rw=rb[2]-rb[0];path=raw.map(r=>{const p=clamp(((r[2]-r[0])-rw)/(1-rw));if(isMobile())return [b[0]*(1-p),b[1]*(1-p),b[2]+(1-b[2])*p,b[3]+(1-b[3])*p];const max=Math.max(b[0],1-b[2]),delta=p*max;return [Math.max(0,b[0]-delta),0,Math.min(1,b[2]+delta),1]})}
    // Preserve rendered geometry during reversal. The correction disappears at the destination.
    const first=path[0];path=path.map((r,k)=>r.map((v,d)=>v+(current[d]-first[d])*(1-k/(path.length-1))));
    path[path.length-1]=kind==='expand'?[0,0,1,1]:b;
    return {path,duration:MEASURED[name].duration};
  }
  function lock(){
    if(locked)return;if(modalOwner&&modalOwner!==api)modalOwner.close({immediate:true});modalOwner=api;
    const body=document.body;locked={x:scrollX,y:scrollY,styles:{}};for(const k of ['position','top','left','width','overflow'])locked.styles[k]=body.style[k];
    body.style.position='fixed';body.style.top=`-${locked.y}px`;body.style.left=`-${locked.x}px`;body.style.width='100%';body.style.overflow='hidden';
    let cur=el;while(cur&&cur!==document.body){for(const s of cur.parentElement?.children||[])if(s!==cur&&!['SCRIPT','STYLE','LINK'].includes(s.tagName)){inertRecords.set(s,s.inert);s.inert=true}cur=cur.parentElement}
  }
  function unlock(){if(!locked)return;const saved=locked;locked=null;for(const [s,value] of inertRecords)if(s.isConnected)s.inert=value;inertRecords.clear();Object.assign(document.body.style,saved.styles);window.scrollTo(saved.x,saved.y);if(modalOwner===api)modalOwner=null}
  function marker(unit){if(options.history===false)return;const s=history.state&&typeof history.state==='object'?{...history.state}:{};s[historyKey]={unit};if(!Object.prototype.hasOwnProperty.call(history.state||{},historyKey)){historyBase=history.state;history.pushState(s,'')}else history.replaceState(s,'');historyEntry=true}
  function removeMarker(){const s=history.state;if(s&&Object.prototype.hasOwnProperty.call(s,historyKey)){const copy={...s};delete copy[historyKey];history.replaceState(Object.keys(copy).length?copy:(historyBase??null),'')}historyEntry=false}
  function populate(i){const u=units[i];panel.setAttribute('aria-label',u.name);title.textContent=u.name;kicker.textContent=u.kicker||'Your stay';desc.textContent=u.description||'Settle in and make this place your own.';meta.replaceChildren(...(u.meta||[]).slice(0,3).map(s=>node('li','',s)));book.href=url(u.href);book.textContent=u.bookLabel||options.bookLabel||'Book this cottage';thumbImage.src=url(units[(i+1)%units.length].image);thumbImage.style.objectPosition=units[(i+1)%units.length].focus||'50% 50%'}
  function open(i,{keyboard=false,history:useHistory=true}={}){photoLabels.forEach(n=>n.classList.remove('is-hot')); // Þurranes
    
    if(dead||!Number.isInteger(i)||i<0||i>=units.length)return;
    if(active===i&&(state==='open'||state==='opening'))return;
    const token=++epoch;let current=layers[i].visible?currentRect(i):baseRect(i);active=i;hovered=i;preload(i);
    for(let j=0;j<units.length;j++){buttons[j].setAttribute('aria-expanded',String(i===j));if(j!==i)hide(j);layers[j].el.style.zIndex=j===i?'2':'1'}
    lock();grid.inert=true;panel.hidden=false;populate(i);setState('opening');el.classList.add('is-expanded');light.style.opacity='1';light.style.clipPath=clip(current);
    if(isMobile()){const box=el.getBoundingClientRect();width=box.width;height=box.height;current=baseRect(i)}
    cancel(controls);controls.style.opacity='0';controls.inert=true;
    cancel(details);details.style.opacity='0';details.inert=true;cancel(thumb);thumb.style.opacity='0';thumb.style.transform='scale(0)';
    if(useHistory)marker(units[i].id);panel.focus({preventScroll:true});
    const {path,duration}=trajectory(i,'expand',current);const ms=reduce.matches?MOTION.fade:duration;
    for(let j=0;j<units.length;j++)if(j!==i){if(reduce.matches){cancel(baseLabels[j]);fade(baseLabels[j],0)}else animate(baseLabels[j],[{transform:getComputedStyle(baseLabels[j]).transform,opacity:getComputedStyle(baseLabels[j]).opacity},{transform:labelTransform(j,baseRect(j))+` translateY(${height*.12}px)`,opacity:'0'}],reduce.matches?MOTION.fade:duration*.6);}
    if(reduce.matches){light.style.clipPath=clip([0,0,1,1]);put(i,[0,0,1,1]);layers[i].el.style.opacity='0';fade(layers[i].el,1,ms).then(finish)}else run(i,path,ms,{done:finish});
    function finish(){if(token!==epoch)return;setState('open');controls.inert=false;fade(controls,1);if(keyboard)close.focus({preventScroll:true});else if(!panel.contains(document.activeElement))panel.focus({preventScroll:true})}
    animate(details,[{opacity:'0'},{opacity:'1'}],MOTION.fade,reduce.matches?0:duration+MOTION.detailsHold).then(ok=>{if(ok&&token===epoch)details.inert=false});
    if(!reduce.matches&&!isMobile())animate(thumb,THUMB,25*1000/30,13*1000/30);
  }
  function collapse({fromPop=false,immediate=false}={}){
    if(dead||state==='closed')return;if(state==='closing'&&!immediate)return;const token=++epoch,i=active;setState('closing');cancel(controls);controls.style.opacity='0';controls.inert=true;panel.focus({preventScroll:true});details.inert=true;cancel(details);fade(details,0,reduce.matches?MOTION.fade:100);cancel(thumb);if(reduce.matches)fade(thumb,0,100);else animate(thumb,[{opacity:getComputedStyle(thumb).opacity,transform:getComputedStyle(thumb).transform},{opacity:'0',transform:`translateX(${width*.2}px) scale(1)`}],200);
    // Re-enable the real grid while the exit remains visible; new input redirects through open().
    grid.inert=false;buttons.forEach(b=>b.setAttribute('aria-expanded','false'));ignoreFocus=true;buttons[i].focus({preventScroll:true});ignoreFocus=false;
    if(!fromPop&&historyEntry)marker(null);
    baseLabels.forEach((n,j)=>{if(reduce.matches){cancel(n);n.style.transform=labelTransform(j,baseRect(j));fade(n,1)}else animate(n,[{transform:getComputedStyle(n).transform,opacity:getComputedStyle(n).opacity},{transform:labelTransform(j,baseRect(j)),opacity:'1'}],reduce.matches?MOTION.fade:400,reduce.matches?0:300)});
    const current=currentRect(i),{path,duration}=trajectory(i,'collapse',current);
    function finish(){if(token!==epoch)return;panel.hidden=true;grid.inert=false;light.style.opacity='0';el.classList.remove('is-expanded');buttons.forEach(b=>b.setAttribute('aria-expanded','false'));setState('closed');active=-1;hovered=i;stopLayer(i);put(i,baseRect(i));unlock();if(isMobile())layout();ignoreFocus=true;buttons[i].focus({preventScroll:true});ignoreFocus=false}
    if(immediate){stopLayer(i);finish()}else if(reduce.matches){fade(layers[i].el,0).then(()=>{if(token===epoch)finish()})}else run(i,path,duration,{done:finish});
  }
  function switchUnit(delta){if(active<0)return;const i=(active+delta+units.length)%units.length;++epoch;for(let j=0;j<units.length;j++){if(i!==j)hide(j);buttons[j].setAttribute('aria-expanded',String(i===j))}active=hovered=i;preload(i);populate(i);put(i,[0,0,1,1]);layers[i].el.style.zIndex='2';layers[i].el.style.opacity='0';fade(layers[i].el,1,220);setState('open');cancel(controls);controls.style.opacity='1';controls.inert=false;cancel(light);light.style.clipPath=clip([0,0,1,1]);cancel(details);details.style.opacity='1';details.inert=false;if(historyEntry)marker(units[i].id)}
  function layout(){el.classList.toggle('is-mobile',isMobile());const r=el.getBoundingClientRect();width=r.width;height=r.height;el.classList.toggle('is-mobile',isMobile());el.style.setProperty('--image-pivot',`${MOTION.imagePivot*100}%`);el.style.setProperty('--thumb-size',`${Math.min(160,width*MOTION.thumbRatio)}px`);thumb.style.left=`${MOTION.thumbX*100}%`;thumb.style.top=`${MOTION.thumbY*100}%`;
    for(let i=0;i<units.length;i++){baseLabels[i].style.transform=labelTransform(i,baseRect(i));stopLayer(i);if(state!=='closed'&&i===active)put(i,[0,0,1,1]);else if(isMobile()||i===hovered)put(i,baseRect(i));else hide(i)}
    if(state==='closing'){collapse({immediate:true});return}if(state==='opening'){setState('open');controls.inert=false;fade(controls,1)}if(state==='open'){cancel(light);light.style.clipPath=clip([0,0,1,1])}if(reduce.matches){baseLabels.forEach((n,j)=>{cancel(n);n.style.transform=labelTransform(j,baseRect(j));n.style.opacity=state==='closed'?'1':'0'});if(state==='open'){cancel(details);details.style.opacity='1';details.inert=false}cancel(thumb);thumb.style.opacity='0';for(const n of head.querySelectorAll('.sp-word')){cancel(n);n.style.transform='none';n.style.opacity='1'}}
  }
  buttons.forEach((b,i)=>{on(b,'pointerenter',()=>hover(i));on(b,'focus',()=>{buttons.forEach((x,j)=>x.tabIndex=j===i?0:-1);if(!ignoreFocus&&document.documentElement.dataset.input==='key')hover(i)});on(b,'click',e=>open(i,{keyboard:e.detail===0}));on(b,'keydown',e=>{const keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];if(!keys.includes(e.key))return;e.preventDefault();let j=e.key==='Home'?0:e.key==='End'?units.length-1:(i+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+units.length)%units.length;buttons[j].focus()})});
  on(panel,'pointerdown',e=>{if(!e.target.closest('button,a,input,textarea,select')){e.preventDefault();panel.focus({preventScroll:true})}});
  on(close,'click',()=>collapse());on(prev,'click',()=>switchUnit(-1));on(next,'click',()=>switchUnit(1));
  on(panel,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();collapse()}if(e.key==='Tab'){const f=[...panel.querySelectorAll('button,a')].filter(n=>!n.closest('[inert]')),index=f.indexOf(document.activeElement);if(!f.length){e.preventDefault();return}if(e.shiftKey&&index<=0){e.preventDefault();f.at(-1).focus()}else if(!e.shiftKey&&(index===-1||index===f.length-1)){e.preventDefault();f[0].focus()}}});
  on(document,'focusin',e=>{if(locked&&!panel.contains(e.target)&&!(state==='closing'&&grid.contains(e.target)))panel.focus({preventScroll:true})});
  on(window,'popstate',()=>{const value=history.state?.[historyKey];historyEntry=!!value;if(value?.unit){const i=units.findIndex(u=>u.id===value.unit);if(i>=0)open(i,{history:false})}else if(state!=='closed')collapse({fromPop:true})});
  on(el,'pointermove',e=>{if(isMobile()||reduce.matches||e.pointerType==='touch')return;const r=el.getBoundingClientRect();el.classList.add('has-pointer');cursor.style.transform=`translate(${e.clientX-r.left-10}px,${e.clientY-r.top-12}px)`});
  on(el,'pointerleave',()=>{el.classList.remove('has-pointer');if(state==='closed')hover(-1)});
  on(window,'resize',layout);on(mobile,'change',layout);on(reduce,'change',layout);
  layout();
  if(options.intro!==false){const words=[...head.querySelectorAll('.sp-word')];words.forEach((n,i)=>{const m=INTRO[Math.min(i,INTRO.length-1)];const ratio=height/405;const frames=reduce.matches?[{opacity:'0'},{opacity:'1'}]:m.frames.map(f=>({offset:f.offset,opacity:String(f.opacity),transform:`translateY(${f.y*ratio}px) rotate(${f.angle||0}deg)`}));animate(n,frames,reduce.matches?MOTION.fade:m.duration,reduce.matches?0:m.delay).then(ok=>{if(ok){n.style.transform='none';n.style.opacity='1'}})});baseLabels.forEach((n,i)=>{n.style.opacity='0';fade(n,1,500,i*233)});
    // Þurranes: resting photos rise into place on the same 233ms steps.
    if(REST!=null&&!isMobile()&&!reduce.matches)layers.forEach((l,i)=>{const b=baseRect(i);animate(l.el,[{clipPath:clip([b[0],1,b[2],1])},{clipPath:clip(restRect(i))}],MOTION.reveal,i*233,easeString(MEASURED['hover-enter'].ease))});}
  const api={open,close:collapse,next:()=>switchUnit(1),previous:()=>switchUnit(-1),hover,get state(){return state},get activeIndex(){return active},destroy(){if(dead)return;++epoch;dead=true;abort.abort();for(const a of animations.values())a.cancel();animations.clear();unlock();removeMarker();el.replaceChildren(...original);el.className=originalClass;if(originalStyle===null)el.removeAttribute('style');else el.setAttribute('style',originalStyle);delete el.dataset.state;mounts.delete(el)}};
  mounts.set(el,api);return api;
}
window.StayPicker=Object.freeze({mount,MOTION,MEASURED});
})();
