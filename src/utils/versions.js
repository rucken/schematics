"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const latestSemver = require('latest-semver');
function vlatest(versions) {
    return latestSemver(versions.filter(version => version).map(version => version.split('=').join('')
        .split('<').join('')
        .split('>').join('')
        .split('~').join('')
        .split('^').join('')));
}
exports.vlatest = vlatest;
//# sourceMappingURL=versions.js.map