"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const fs_1 = require("fs");
const ast_utils_1 = require("../../utils/ast-utils");
const common_1 = require("../../utils/common");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function contentReplacer(options) {
    const toRemoveStrings = [];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { '/demo-nestjs/': '/' + options.name + '/', '/demo-nestjs': '/' + options.name, 'Demo nestjs': strings_1.capitalize(options.name)
            .split('-')
            .join(' '), 'demo-nestjs': options.name });
}
function pathReplacer(options) {
    return {
        '/demo-nestjs/': '/' + options.name + '/',
        '/demo-nestjs': '/' + options.name
    };
}
function updateSourceFiles(path, content, options) {
    return undefined;
}
function filterFiles(path) {
    const ignoredPaths = [];
    return (ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
        0);
}
function templateSources(options) {
    return [
        `../../../files/empty/apps/demo-nestjs`.replace('{basePath}', options.basePath)
    ];
}
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        const appProjectRootPath = core_1.join(core_1.normalize(options.basePath), options.workspaceProjectRoot);
        return schematics_1.chain([
            ...(!fs_1.existsSync(appProjectRootPath) ?
                templateSources(options).map(templateSource => addAppFiles(templateSource, tree, options)) :
                []),
            updateAngularJson(options),
            updateNxJson(options),
            format_files_1.formatFiles()
        ])(tree, context);
    };
}
exports.default = default_1;
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
function normalizeOptions(tree, options) {
    const basePath = tree._backend._root;
    const appDirectory = options.org
        ? `${name_utils_1.toFileName(options.org)}/${name_utils_1.toFileName(options.name)}`
        : name_utils_1.toFileName(options.name);
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), core_1.normalize('apps'), appDirectory);
    const appProject = core_1.join(core_1.normalize('apps'), appDirectory);
    return Object.assign({}, options, { name: name_utils_1.toFileName(options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), appDirectory, workspaceProjectRoot: appProjectRoot, projectRoot: appProject, basePath });
}
function addAppFiles(templateSource, tree, options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url(templateSource), [
        schematics_1.filter(path => filterFiles(path)),
        schematics_1.template({
            tmpl: '',
            name: options.name,
            root: options.projectRoot,
            offset: common_1.offsetFromRoot(options.projectRoot)
        }),
        schematics_1.forEach((fileEntry) => {
            return updateFileFileEntry(tree, fileEntry, options);
        }),
        schematics_1.move(options.workspaceProjectRoot)
    ]));
}
function updateNxJson(options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'nx.json'), nxJson => {
        if (!nxJson) {
            nxJson = {};
        }
        if (!nxJson.projects) {
            nxJson.projects = {};
        }
        const name = options.name;
        nxJson.projects[name] = {
            tags: ['nestjs', 'server', 'application', name]
        };
        return nxJson;
    });
}
function updateAngularJson(options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'angular.json'), angularJson => {
        const project = {
            root: options.projectRoot,
            sourceRoot: core_1.join(options.projectRoot, 'src'),
            projectType: 'application',
            prefix: '',
            schematics: {},
            architect: {}
        };
        project.architect.build = getBuildConfig(project, options);
        project.architect.serve = getServeConfig(options);
        project.architect.lint = getLintConfig(project);
        project.architect.test = getTestConfig(project);
        angularJson.projects[options.name] = project;
        return angularJson;
    });
}
function getBuildConfig(project, options) {
    return {
        builder: '@nrwl/builders:node-build',
        options: {
            outputPath: core_1.join(core_1.normalize('dist'), options.appDirectory),
            main: core_1.join(project.sourceRoot, 'main.ts'),
            tsConfig: core_1.join(project.root, 'tsconfig.app.json'),
            assets: [core_1.join(project.sourceRoot, '/assets')]
        },
        configurations: {
            production: {
                optimization: false,
                extractLicenses: true,
                inspect: false,
                fileReplacements: [
                    {
                        replace: core_1.join(project.sourceRoot, 'environments', 'environment.ts'),
                        with: core_1.join(project.sourceRoot, 'environments', 'environment.prod.ts')
                    }
                ]
            }
        }
    };
}
function getLintConfig(project) {
    return {
        builder: '@angular-devkit/build-angular:tslint',
        options: {
            tsConfig: [
                core_1.join(project.root, 'tsconfig.app.json'),
                core_1.join(project.root, 'tsconfig.spec.json')
            ],
            exclude: ['**/node_modules/**']
        }
    };
}
function getServeConfig(options) {
    return {
        builder: '@nrwl/builders:node-execute',
        options: {
            buildTarget: `${options.name}:build`
        }
    };
}
function getTestConfig(project) {
    return {
        builder: '@nrwl/builders:jest',
        options: {
            jestConfig: core_1.join(project.root, 'jest.config.js'),
            tsConfig: core_1.join(project.root, 'tsconfig.spec.json')
        }
    };
}
//# sourceMappingURL=index.js.map