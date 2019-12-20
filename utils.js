const fs = require('fs');

const STYLE = require('./format.js');

const FEATHER_PACKAGE_NAME = 'arui-feather';
const VAR_RE = /(?:^|\n)\s+(--[-\w]+):\s*(.+?);/g;
const STYLE_RE = /^(\s+)([\w-]+):(.+)$/;

const BORDERS = {
    ' ': null,
    ';': null,
    'undefined': null
};

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
            const gaps = fs.readFileSync(require.resolve(`${FEATHER_PACKAGE_NAME}/${args[index]}`)).toString();

            regMatch = VAR_RE.exec(gaps);
            while (regMatch) {
                save(result, regMatch[2], regMatch[1]);
                regMatch = VAR_RE.exec(gaps);
            }
        } catch (error) {
            if (error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND') {
                process.stderr.write(
                    `${STYLE.GREEN}WARNING: ${STYLE.CLEAR}Module not found: ${STYLE.RED}${FEATHER_PACKAGE_NAME}/${args[index]}${STYLE.CLEAR}\n`
                );
            } else {
                console.log(error);
            }
        }
    }

    return result;
}

function findInValue(haystack, needle, fromIndex) {
    const index = haystack.indexOf(needle, fromIndex);

    return (
        index > -1
        && haystack[index - 1] in BORDERS
        && haystack[index + needle.length] in BORDERS
    ) && index;
}

module.exports.getVarsFromCSS = getVarsFromCSS;
module.exports.findInValue = findInValue;
