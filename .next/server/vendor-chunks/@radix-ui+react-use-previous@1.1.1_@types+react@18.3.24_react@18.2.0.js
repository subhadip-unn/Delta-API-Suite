"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.24_react@18.2.0";
exports.ids = ["vendor-chunks/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.24_react@18.2.0"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.24_react@18.2.0/node_modules/@radix-ui/react-use-previous/dist/index.mjs":
/*!**********************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.24_react@18.2.0/node_modules/@radix-ui/react-use-previous/dist/index.mjs ***!
  \**********************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   usePrevious: () => (/* binding */ usePrevious)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@14.0.4_react-dom@18.2.0_react@18.2.0__react@18.2.0/node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n// packages/react/use-previous/src/use-previous.tsx\n\nfunction usePrevious(value) {\n    const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef({\n        value,\n        previous: value\n    });\n    return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(()=>{\n        if (ref.current.value !== value) {\n            ref.current.previous = ref.current.value;\n            ref.current.value = value;\n        }\n        return ref.current.previous;\n    }, [\n        value\n    ]);\n}\n //# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91c0AxLjEuMV9AdHlwZXMrcmVhY3RAMTguMy4yNF9yZWFjdEAxOC4yLjAvbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC11c2UtcHJldmlvdXMvZGlzdC9pbmRleC5tanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtREFBbUQ7QUFDcEI7QUFDL0IsU0FBU0MsWUFBWUMsS0FBSztJQUN4QixNQUFNQyxNQUFNSCx5Q0FBWSxDQUFDO1FBQUVFO1FBQU9HLFVBQVVIO0lBQU07SUFDbEQsT0FBT0YsMENBQWEsQ0FBQztRQUNuQixJQUFJRyxJQUFJSSxPQUFPLENBQUNMLEtBQUssS0FBS0EsT0FBTztZQUMvQkMsSUFBSUksT0FBTyxDQUFDRixRQUFRLEdBQUdGLElBQUlJLE9BQU8sQ0FBQ0wsS0FBSztZQUN4Q0MsSUFBSUksT0FBTyxDQUFDTCxLQUFLLEdBQUdBO1FBQ3RCO1FBQ0EsT0FBT0MsSUFBSUksT0FBTyxDQUFDRixRQUFRO0lBQzdCLEdBQUc7UUFBQ0g7S0FBTTtBQUNaO0FBR0UsQ0FDRixrQ0FBa0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kZWx0YS1hcGktc3VpdGUvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91c0AxLjEuMV9AdHlwZXMrcmVhY3RAMTguMy4yNF9yZWFjdEAxOC4yLjAvbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC11c2UtcHJldmlvdXMvZGlzdC9pbmRleC5tanM/NDVhOCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBwYWNrYWdlcy9yZWFjdC91c2UtcHJldmlvdXMvc3JjL3VzZS1wcmV2aW91cy50c3hcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuZnVuY3Rpb24gdXNlUHJldmlvdXModmFsdWUpIHtcbiAgY29uc3QgcmVmID0gUmVhY3QudXNlUmVmKHsgdmFsdWUsIHByZXZpb3VzOiB2YWx1ZSB9KTtcbiAgcmV0dXJuIFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIGlmIChyZWYuY3VycmVudC52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgIHJlZi5jdXJyZW50LnByZXZpb3VzID0gcmVmLmN1cnJlbnQudmFsdWU7XG4gICAgICByZWYuY3VycmVudC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVmLmN1cnJlbnQucHJldmlvdXM7XG4gIH0sIFt2YWx1ZV0pO1xufVxuZXhwb3J0IHtcbiAgdXNlUHJldmlvdXNcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwXG4iXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VQcmV2aW91cyIsInZhbHVlIiwicmVmIiwidXNlUmVmIiwicHJldmlvdXMiLCJ1c2VNZW1vIiwiY3VycmVudCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.24_react@18.2.0/node_modules/@radix-ui/react-use-previous/dist/index.mjs\n");

/***/ })

};
;