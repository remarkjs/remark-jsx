# remark-jsx
[![npm version](https://badge.fury.io/js/%40dumpster%2Fremark-custom-element-to-hast.svg)](https://badge.fury.io/js/%40dumpster%2Fremark-custom-element-to-hast)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/fazouane-marouane/remark-jsx/blob/master/packages/remark-custom-element-to-hast/LICENSE)

This project is an attempt at a remark plugin that can enable users using React inside their markdown.

The plugin for now, consists of two packages:
* [**@dumpster/remark-custom-element-to-hast**](https://github.com/fazouane-marouane/remark-jsx/tree/master/packages/remark-custom-element-to-hast): which uses `remark` to compile markdown that contain calls to custom elements into complete HAST.
* [**@dumpster/hast-react-renderer**](https://github.com/fazouane-marouane/remark-jsx/tree/master/packages/hast-react-renderer): Transforms a HAST into a usable `react` component.
