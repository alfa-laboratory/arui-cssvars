const getVarsFromCSS = require('./utils.js').getVarsFromCSS;

module.exports = function getVarsByProps () {
  const vars = {
      gaps: getVarsFromCSS('vars.css'),
      fonts: getVarsFromCSS('vars/font.css'),
      opacity: getVarsFromCSS('vars/opacity.css'),
      colors: getVarsFromCSS('vars/primitive-colors.css')
  };

  /* eslint-disable quote-props */
  return {
      'margin': [vars.gaps],
      'margin-top': [vars.gaps],
      'margin-right': [vars.gaps],
      'margin-bottom': [vars.gaps],
      'margin-left': [vars.gaps],
      'padding': [vars.gaps],
      'padding-top': [vars.gaps],
      'padding-right': [vars.gaps],
      'padding-bottom': [vars.gaps],
      'padding-left': [vars.gaps],
      'font': [vars.fonts],
      'font-size': [vars.fonts],
      'font-weight': [vars.fonts],
      'line-height': [vars.fonts],
      'opacity': [vars.opacity],
      'color': [vars.colors],
      'background-color': [vars.colors],
      'background': [vars.colors],
      'box-shadow': [vars.colors],
      'border': [vars.colors],
      'border-top': [vars.colors],
      'border-right': [vars.colors],
      'border-bottom': [vars.colors],
      'border-left': [vars.colors]
  };
  /* eslint-enable quote-props */
};
