"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const inflection_1 = require("inflection");
const dot = require('dot-object');
const gitEmail = require('git-user-email');
const gitUsername = require('git-username');
// Instead of `any`, it would make sense here to get a schema-to-dts package and output the
// interfaces so you get type-safe options.
function default_1(options) {
    const root = options.root;
    const name = options.name;
    const gitInfo = { username: options.username || gitUsername(), email: options.email || gitEmail() };
    const templateSource = schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template(Object.assign({}, core_1.strings, { humanize: (str, low_first_letter) => inflection_1.humanize(inflection_1.underscore(str).replace(new RegExp('-', 'g'), ' '), low_first_letter), pluralize: inflection_1.pluralize, name: name, root: root, gitInfo: gitInfo }, dot.dot({ gitInfo: gitInfo }), { ts: 'ts', json: 'json', env: 'env' })),
        schematics_1.move('.'),
    ]);
    // The chain rule allows us to chain multiple rules and apply them one after the other.
    return schematics_1.chain([
        schematics_1.mergeWith(templateSource, schematics_1.MergeStrategy.Overwrite)
    ]);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map