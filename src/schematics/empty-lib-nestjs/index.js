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
    return Object.assign({}, toRemoveObject, { '/org/core-nestjs': '/' + options.org + '/' + options.name, '@org/core-nestjs': '@' + options.org + '/' + options.name, '/core-nestjs/': '/' + options.name + '/', '/core-nestjs': '/' + options.name, CoreNestjs: strings_1.classify(options.name), 'Core nestjs': strings_1.capitalize(options.name)
            .split('-')
            .join(' '), coreNestjs: strings_1.camelize(options.name), CORE_NESTJS: strings_1.underscore(options.name).toUpperCase(), 'core-nestjs': options.name, '/org/': '/' + options.org + '/', '@org/': '@' + options.org + '/', Org: strings_1.classify(options.org), 'org-': options.org + '-', org: strings_1.camelize(options.org), ORG_: strings_1.underscore(options.org).toUpperCase() + '_' });
}
function pathReplacer(options) {
    return {
        '/core-nestjs/': '/' + options.name + '/',
        '/core-nestjs': '/' + options.name,
        '/org/core-nestjs/': '/' + options.org + '/' + options.name + '/',
        '/org/core-nestjs': '/' + options.org + '/' + options.name
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
        `../../../files/empty/libs/org/core-nestjs`.replace('{basePath}', options.basePath)
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
            updateTsConfigJson(options),
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
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), core_1.normalize('libs'), appDirectory);
    const appProject = core_1.join(core_1.normalize('libs'), appDirectory);
    return Object.assign({}, options, { name: name_utils_1.toFileName(options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), org: options.org, appDirectory, workspaceProjectRoot: appProjectRoot, projectRoot: appProject, basePath });
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
function updateAngularJson(options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'angular.json'), angularJson => {
        const project = {
            root: options.projectRoot,
            sourceRoot: core_1.join(options.projectRoot, 'src'),
            projectType: 'library',
            prefix: '',
            schematics: {},
            architect: {}
        };
        project.architect.build = getBuildConfig(project, options);
        project.architect.serve = getServeConfig(project, options);
        project.architect.lint = getLintConfig(project);
        project.architect.test = getTestConfig(project);
        angularJson.projects[options.name] = project;
        return angularJson;
    });
}
function updateTsConfigJson(options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'tsconfig.json'), tsConfigJson => {
        const name = '@' + options.org + '/' + options.name;
        if (!tsConfigJson) {
            tsConfigJson = {};
        }
        if (!tsConfigJson.compilerOptions) {
            tsConfigJson.compilerOptions = {};
        }
        if (!tsConfigJson.compilerOptions.paths) {
            tsConfigJson.compilerOptions.paths = {};
        }
        tsConfigJson.compilerOptions.paths[name] = [
            core_1.join(options.projectRoot, 'src')
        ];
        tsConfigJson.compilerOptions.paths[name + '/*'] = [
            core_1.join(options.projectRoot, 'src', '/*')
        ];
        return tsConfigJson;
    });
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
            tags: ['nestjs', 'server', 'library', name, options.org]
        };
        return nxJson;
    });
}
function getBuildConfig(project, options) {
    return {
        builder: '@nrwl/builders:run-commands',
        options: {
            commands: [
                {
                    command: `del-cli ./${core_1.join(core_1.normalize('dist'), options.appDirectory)}`
                },
                {
                    command: `tsc --project ./${core_1.join(project.root, 'tsconfig.lib.json')} --outDir ./${core_1.join(core_1.normalize('dist'), options.appDirectory)}`
                }
            ],
            parallel: false
        }
    };
}
function getServeConfig(project, options) {
    return {
        builder: '@nrwl/builders:node-execute',
        options: {
            buildTarget: `${options.name}:build`
        }
    };
}
function getLintConfig(project) {
    return {
        builder: '@angular-devkit/build-angular:tslint',
        options: {
            tsConfig: [
                core_1.join(project.root, 'tsconfig.lib.json'),
                core_1.join(project.root, 'tsconfig.spec.json')
            ],
            exclude: ['**/node_modules/**']
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