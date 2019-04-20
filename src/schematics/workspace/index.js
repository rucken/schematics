"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const fileutils_1 = require("../../utils/fileutils");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function contentReplacer(options) {
    const toRemoveStrings = [];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { 'nx-rucken': options.name, 'NxRucken': strings_1.classify(options.name) });
}
function pathReplacer(options) {
    return {};
}
function updateSourceFiles(path, content, options) {
    let text;
    if (path === `/.gitignore`) {
        content = content
            .replace('/node_modules', 'node_modules');
        text = `

# Credentials
.travis/*.key
.travis/*.key.pub

# config
*.env

deploy
vendors
/schematics/src/**/*.js
/schematics/src/**/*.js.map`;
        content = content
            .replace(text, '') + text;
        return content;
    }
    if (path === '/.prettierignore') {
        text = `
*platform*
*plugin*
*www*`;
        content = content
            .replace(text, '') + text;
        return content;
    }
    if (path === `/tsconfig.json`) {
        const original = JSON.parse(content);
        if (!original.exclude) {
            original.exclude = ["scripts", "node_modules", "tmp"];
        }
        if (original.exclude.indexOf('scripts') === -1) {
            original.exclude = [
                'scripts',
                ...original.exclude
            ];
        }
        original.module = 'commonjs';
        return fileutils_1.serializeJson(original);
    }
    if (path === `/package.json`) {
        const original = JSON.parse(content);
        original.engines = {
            "node": ">=11",
            "npm": ">=6.5.0"
        };
        original.author = options.fullAuthorObject;
        original.scripts["affected:dev"] = "rucken prepare -m dev";
        original.scripts["affected:prod"] = "rucken prepare -m prod";
        original.scripts["postinstall"] = "sh ./scripts/postinstall.sh";
        original.scripts["typeorm"] = "./node_modules/.bin/ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js";
        original.scripts["migrate:create"] = "npm run typeorm migration:create";
        original.scripts["migrate:generate"] = "npm run typeorm migration:generate";
        original.scripts["migrate:prod"] = "cross-env MIGRATIONS=true NODE_ENV=production npm run typeorm migration:run";
        original.scripts["migrate"] = "cross-env MIGRATIONS=true npm run typeorm migration:run";
        return fileutils_1.serializeJson(original);
    }
}
function filterFiles(path) {
    const ignoredPaths = [];
    return (ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
        0);
}
function templateSources(options) {
    return [
        `../../../files/workspace`.replace('{basePath}', options.basePath)
    ];
}
function updateFileFileEntry(tree, fileEntry, options) {
    let contentReplaced = false, pathReplaced = false, content = fileEntry.content.toString(), path = fileEntry.path.toString();
    const updatedContent = updateSourceFiles(path, content, options);
    const contentReplacerResult = contentReplacer(options), pathReplacerResult = pathReplacer(options);
    if (updatedContent !== undefined) {
        content = updatedContent;
        contentReplaced = true;
    }
    Object.keys(contentReplacerResult).forEach(word => {
        if (content.indexOf(word) !== -1) {
            content = content.split(word).join(contentReplacerResult[word]);
            contentReplaced = true;
        }
    });
    Object.keys(pathReplacerResult).forEach(word => {
        if (path.indexOf(word) !== -1) {
            path = path.split(word).join(pathReplacerResult[word]);
            pathReplaced = true;
        }
    });
    if (contentReplaced || pathReplaced) {
        return { path: path, content: Buffer.from(content) };
    }
    return fileEntry;
}
function addAppFiles(templateSource, tree, options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url(templateSource), [
        schematics_1.filter(path => filterFiles(path)),
        schematics_1.template({
            name: options.name
        }),
        schematics_1.forEach((fileEntry) => {
            return updateFileFileEntry(tree, fileEntry, options);
        }),
        schematics_1.move(options.workspace)
    ]));
}
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        return schematics_1.chain([
            ...(templateSources(options).map(templateSource => addAppFiles(templateSource, tree, options))),
            format_files_1.formatFiles()
        ])(tree, context);
    };
}
exports.default = default_1;
function normalizeOptions(tree, options) {
    const basePath = tree._backend._root;
    return Object.assign({}, options, { fullAuthorObject: {
            name: options.author,
            email: options.email
        }, name: name_utils_1.toFileName(options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), basePath });
}
//# sourceMappingURL=index.js.map