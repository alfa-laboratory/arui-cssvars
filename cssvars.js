/* eslint-disable no-console */
const fs = require('fs');
const getVarsByProps = require('./variables.js');
const findInValue = require('./utils.js').findInValue;
const STYLE = require('./format.js');
// const rl = require('readline');

const STYLE_RE = /^(\s+)([\w-]+):(.+)$/;

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

const LF = '\n';
const SEPARATOR = '|';
const COLON = ':';

function write({ file, lines, line, replace }) {
    const stream = process.stdout;

    const extraLines = 3;

    let totalLines = extraLines * 2 + 1;
    let currentLine;

    stream.write(LF + STYLE.GREEN + file + COLON + (line + 1) + STYLE.CLEAR + LF);

    while (totalLines--) {
        currentLine = line - totalLines + extraLines + 1;
        if (totalLines === extraLines) {
            stream.write(STYLE.GRAY + (currentLine) + SEPARATOR + lines[currentLine - 1] + STYLE.CLEAR + LF);
            stream.write(STYLE.YELLOW + (currentLine) + SEPARATOR + STYLE.CLEAR + replace + LF);
        } else if (lines[currentLine] !== undefined) {
            stream.write(STYLE.YELLOW + (currentLine) + SEPARATOR + STYLE.CLEAR + lines[currentLine - 1] + LF)
        }
    }
}

function replaceRecurcively(file, line, hay, needle, variables, fromIndex = 0) {
    let result = hay;
    const index = findInValue(hay, needle, fromIndex);
    const variable = variables[0];

    if (index !== false) {
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

    return result;
}

function findAndReplace(item, file, index, varsByProps) {
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

module.exports = function (directory) {
    let totalFiles = 0;

    const varsByProps = getVarsByProps();

    scanDir(directory, function (file) {
        let hasErrors = false;
        if (file.slice(-4) === '.css') {
            ++totalFiles;
            fs.readFile(file, function (error, data) {
                --totalFiles;
                if (!error) {
                    const content = data.toString().split('\n');
                    const fileInfo = {
                        name: file,
                        lines: content,
                        line: 0
                    };

                    content.forEach(function (item, index) {
                        const errors = !!findAndReplace(item, fileInfo, index, varsByProps);
                        hasErrors = hasErrors || errors; 
                    });

                    if (totalFiles === 0 && hasErrors) {
                      process.exit(1);
                    }
                }
            });
        }
    });
}
