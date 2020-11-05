const stylelint = require('stylelint');
const getVarsByProps = require('../variables.js');
const findInValue = require('../utils.js').findInValue;

const ruleName = 'arui-cssvars/use-variables';
const formatVar = variable => `var(${variable})`;
const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: function (variable, value) {
        return `Use variable '${formatVar(variable)}' instead of plain value '${value}'`;
    }
});

function find(value, group) {
    for (let index = 0 ; index < group.length ; ++index) {
        for (key in group[index]) {
            const valueIndex = findInValue(value, key);
            if (valueIndex !== false) {
                return {
                    value: key,
                    valueIndex,
                    variable: group[index][key],
                };
            }
        }
    }
}

module.exports = stylelint.createPlugin(ruleName, function (enabled, _, context) {
    if (!enabled) {
        return function () {
            return null;
        }
    }

    const varsByProps = getVarsByProps();

    return function (root, result) {
        root.walkDecls(function (decl) {
            if (decl.prop in varsByProps) {
                let { value } = decl;
                let substitution;
                const previousValues = [];
                while ((substitution = find(value, varsByProps[decl.prop]))) {
                    const fixedValue = formatVar(substitution.variable);
                    value = value.replace(substitution.value, fixedValue);
                    if (context.fix) {
                        decl.value = value;
                    } else {
                        const originalValueIndex = previousValues.reduce((acc, sub) => acc > sub.valueIndex + sub.diff
                            ? acc - sub.diff
                            : acc, substitution.valueIndex);
                        stylelint.utils.report({
                            result,
                            ruleName,
                            message: messages.expected(substitution.variable, substitution.value),
                            node: decl,
                            word: decl.value,
                            index: originalValueIndex + decl.prop.length + decl.raws.between.length,
                        });
                        previousValues.unshift({...substitution, diff: fixedValue.length - substitution.value.length});
                    }
                }
            }
        });
    };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
