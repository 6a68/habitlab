"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.expand=expand,exports.parse=parse,exports.compile=compile;var _immutable=require("immutable"),_shiftReducer=require("shift-reducer"),_shiftReducer2=_interopRequireDefault(_shiftReducer),_parseReducer=require("./parse-reducer"),_parseReducer2=_interopRequireDefault(_parseReducer),_shiftCodegen=require("shift-codegen"),_shiftCodegen2=_interopRequireDefault(_shiftCodegen),_bindingMap=require("./binding-map.js"),_bindingMap2=_interopRequireDefault(_bindingMap),_terms=require("./terms"),_terms2=_interopRequireDefault(_terms),_modules=require("./modules");function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function expand(a){let b=1>=arguments.length||arguments[1]===void 0?{}:arguments[1],d=new _bindingMap2.default,e=new _modules.Modules({bindings:d,cwd:b.cwd||process.cwd(),filename:b.filename,transform:b.transform||function(h){return{code:h}}}),f=e.compileEntrypoint(a,b.filename,b.enforcePragma),g=f.importEntries.filter(h=>!e.has(h.moduleSpecifier.val()));return new _terms2.default("Module",{directives:(0,_immutable.List)(),items:g.concat(f.body).concat(f.exportEntries.interpose(new _terms2.default("EmptyStatement",{})))})}function parse(a,b){let d=2>=arguments.length||arguments[2]===void 0||arguments[2];return(0,_shiftReducer2.default)(new _parseReducer2.default({phase:0}),expand(a,b).gen(d))}function compile(a){let b=1>=arguments.length||arguments[1]===void 0?{}:arguments[1],d=parse(a,b,b.includeImports),e=(0,_shiftCodegen2.default)(d,new _shiftCodegen.FormattedCodeGen);return{code:e}}

