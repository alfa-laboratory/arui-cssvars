arui-cssvars
============

Humble utility to suggest CSS variables from 'alfa-laboratory/arui-feather' for Project's CSS
files, if Project uses one.

Installation
------------

```
npm install -D arui-cssvars
```
or
```
yarn add --dev arui-cssvars
```

How to use it?
--------------

*arui-feather should be in project dependencies!*

`node node_modules/arui-cssvars/index.js [dir]`

This command scans './src/' (or provided by `dir` argument) directory for .css files and try to suggest variables
from installed version of `arui-feather` to use instead of according hard-coded numbers.
