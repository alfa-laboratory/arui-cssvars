const BORDERS = {
    ' ': null,
    ';': null
};

function findInValue(haystack, needle, fromIndex) {
    const index = haystack.indexOf(needle, fromIndex);

    return (
        index > -1
        && haystack[index - 1] in BORDERS
        && haystack[index + needle.length] in BORDERS
    ) && index;
}

module.exports = findInValue;
