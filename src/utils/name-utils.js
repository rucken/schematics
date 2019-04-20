"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
/**
 * Build dictionary of names:
 */
function names(name) {
    return {
        name,
        className: toClassName(name),
        propertyName: toPropertyName(name),
        fileName: toFileName(name)
    };
}
exports.names = names;
/**
 * hypenated to UpperCamelCase
 */
function toClassName(str) {
    return toCapitalCase(toPropertyName(str));
}
exports.toClassName = toClassName;
/**
 * Hypenated to lowerCamelCase
 */
function toPropertyName(s) {
    return s
        .replace(/(-|_|\.|\s)+(.)?/g, (_, __, chr) => chr ? chr.toUpperCase() : '')
        .replace(/^([A-Z])/, m => m.toLowerCase());
}
exports.toPropertyName = toPropertyName;
/**
 * Upper camelCase to lowercase, hypenated
 */
function toFileName(s) {
    return s
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[ _]/g, '-');
}
exports.toFileName = toFileName;
function toCapitalCase(s) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}
/**
 * Determine the parent directory for the ngModule specified
 * in the full-path option 'module'
 */
function findModuleParent(modulePath) {
    return path.dirname(modulePath);
}
exports.findModuleParent = findModuleParent;
//# sourceMappingURL=name-utils.js.map