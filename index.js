/* eslint-disable no-console */
const fs = require('fs');
// const rl = require('readline');

const VARS_DIR = './node_modules/arui-feather/';
const VAR_RE = /(?:^|\n)\s+(--[-\w]+):\s*(.+?);/g;
const STYLE_RE = /^(\s+)([\w-]+):(.+)$/;

const STYLE = {
    CLEAR: '\x1b[0m',
    RED: '\x1b[0;31m',
    GRAY: '\x1b[2;37m',
    YELLOW: '\x1b[0;33m',
    GREEN: '\x1b[0;32m'
};

/*
const ifc = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

function Iterator(action, condition) {
    this.action = action;
    this.cond = condition;
}

Iterator.prototype.next = function () {
    if (this.cond.call(this)) {
        this.action.call(this);
    }
    return this;
};
Iterator.prototype.condition = function (condition) {
    this.cond = condition;
    return this;
};
*/

const ROOT = process.argv[2] || 'src';

const LF = '\n';
const SEPARATOR = '|';

const BORDERS = {
    ' ': null,
    ';': null
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

function write({ file, lines, line, replace }) {
    const stream = process.stdout;

    stream.write(LF + STYLE.GREEN + file + STYLE.CLEAR + LF);

    if (lines[line - 3] !== undefined) {
        stream.write(STYLE.YELLOW + (line - 2) + SEPARATOR + STYLE.CLEAR + lines[line - 3] + LF);
    }
    if (lines[line - 2] !== undefined) {
        stream.write(STYLE.YELLOW + (line - 1) + SEPARATOR + STYLE.CLEAR + lines[line - 2] + LF);
    }
    if (lines[line - 1] !== undefined) {
        stream.write(STYLE.YELLOW + line + SEPARATOR + STYLE.CLEAR + lines[line - 1] + LF);
    }
    stream.write(STYLE.GRAY + (line + 1) + SEPARATOR + lines[line] + STYLE.CLEAR + LF);
    stream.write(STYLE.YELLOW + (line + 1) + SEPARATOR + STYLE.CLEAR + replace + LF);
    if (lines[line + 1] !== undefined) {
        stream.write(STYLE.YELLOW + (line + 2) + SEPARATOR + STYLE.CLEAR + lines[line + 1] + LF);
    }
    if (lines[line + 2] !== undefined) {
        stream.write(STYLE.YELLOW + (line + 3) + SEPARATOR + STYLE.CLEAR + lines[line + 2] + LF);
    }
    if (lines[line + 3] !== undefined) {
        stream.write(STYLE.YELLOW + (line + 4) + SEPARATOR + STYLE.CLEAR + lines[line + 3] + LF);
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

function replaceRecurcively(file, line, hay, needle, variables, fromIndex = 0) {
    let result = hay;
    const index = hay.indexOf(needle, fromIndex);
    const variable = variables[0];

    if (index > -1) {
        const pre = hay[index - 1];
        const post = hay[index + needle.length];

        if (pre in BORDERS && post in BORDERS) {
            const start = hay.substr(0, index);
            const replacer = `var(${variable})`;
            const end = hay.substr(index + needle.length);
            result = `${start}${replacer}${end}`;
            const display = `${start}${STYLE.RED}${replacer}${STYLE.CLEAR}${end}`;
            write({
                file: file.name,
                lines: file.lines,
                line: line.index,
                replace: `${line.indent}${line.name}:${display}`
            });
            result = replaceRecurcively(file, line, result, needle, variables, fromIndex + variable.length);
        }
    }

    return result;
}

function findAndReplace(item, file, index) {
    const regMatch = STYLE_RE.exec(item);
    const vars = regMatch && varsByProps[regMatch[2]];

    if (vars) {
        const line = {
            indent: regMatch[1],
            name: regMatch[2],
            value: regMatch[3],
            index
        };
        let result = line.value;
        vars.forEach(function (group) {
            Object.keys(group).forEach(function (value) {
                result = replaceRecurcively(file, line, result, value, group[value]);
            });
        });
        if (result !== line.value) {
            return result;
        }
    }

    return null;
}

function scanDir(filename, callback) {
    fs.readdir(filename, function (error, files) {
        if (error) {
            return;
        }

        for (let index = 0; index < files.length; ++index) {
            let file = `${filename}/${files[index]}`;

            fs.stat(file, function (error, stats) {
                if (!error) {
                    if (stats.isDirectory()) {
                        scanDir(file, callback);
                    } else if (stats.isFile) {
                        callback(file);
                    }
                }
            });
        }
    });
}

scanDir(ROOT, function (file) {
    if (file.slice(-4) === '.css') {
        fs.readFile(file, function (error, data) {
            if (!error) {
                const content = data.toString().split('\n');
                const fileInfo = {
                    name: file,
                    lines: content,
                    line: 0
                };

                content.forEach(function (item, index) {
                    findAndReplace(item, fileInfo, index);
                });
            }
        });
    }
});
