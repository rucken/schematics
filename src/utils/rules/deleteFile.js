"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
/**
 * Remove a file from the Virtual Schematic Tree
 */
function deleteFile(from) {
    return schematics_1.forEach((entry) => {
        return entry.path === from ? null : entry;
    });
}
exports.deleteFile = deleteFile;
//# sourceMappingURL=deleteFile.js.map