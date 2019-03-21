const fs = require('fs');
const STYLE = require('./format.js');

const VARS_DIR = './node_modules/arui-feather/';
const VAR_RE = /(?:^|\n)\s+(--[-\w]+):\s*(.+?);/g;
const STYLE_RE = /^(\s+)([\w-]+):(.+)$/;

function save(object, key, value) {
    switch (typeof object[key]) {
        case 'undefined':
            object[key] = [value];
            break;
        default:
            object[key].push(value);
            break;
    }
}


function getVarsFromCSS(...args) {
    let regMatch;
    const result = {};

    for (let index = 0; index < args.length; ++index) {
        try {
            const gaps = fs.readFileSync(VARS_DIR + args[index]).toString();

            regMatch = VAR_RE.exec(gaps);
            while (regMatch) {
                save(result, regMatch[2], regMatch[1]);
                regMatch = VAR_RE.exec(gaps);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                process.stderr.write(
                    `${STYLE.GREEN}WARNING: ${STYLE.CLEAR}Module not found: ${STYLE.RED}${args[index]}${STYLE.CLEAR}\n`
                );
            } else {
                console.log(error);
            }
        }
    }

    return result;
}

const vars = {
    gaps: getVarsFromCSS('vars.css'),
    fonts: getVarsFromCSS('vars/font.css'),
    opacity: getVarsFromCSS('vars/opacity.css'),
    colors: getVarsFromCSS('vars/primitive-colors.css')
};
/* eslint-disable quote-props */
const varsByProps = {
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

module.exports = varsByProps;
