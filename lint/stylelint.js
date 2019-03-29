const stylelint = require('stylelint');
const varsByProps = require('../variables.js');
const findInValue = require('../utils.js').findInValue;

const ruleName = 'arui-cssvars/use-variables';
const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: function (variable, value) {
        return `Use variable 'var(${variable})' instead of plain value '${value}'`;
    }
});

function find(value, group) {
    for (let index = 0 ; index < group.length ; ++index) {
        for (key in group[index]) {
            if (findInValue(value, key) !== false) {
                return {
                    value: key,
                    variable: group[index][key]
                };
            }
        }
    }
}

module.exports = stylelint.createPlugin(ruleName, function (enabled) {
    if (!enabled) {
        return function () {
            return null; 
        }
    }

    return function (root, result) {
        root.walkDecls(function (decl) {
            if (decl.prop in varsByProps) {
                const substitution = find(decl.value, varsByProps[decl.prop]);
                if (substitution) {
                    stylelint.utils.report({
                        result,
                        ruleName,
                        message: messages.expected(substitution.variable, substitution.value),
                        node: decl,
                        word: decl.value
                    });
                }
            }
        });
    };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
