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
    const toRemoveStrings = [
        `
import { RuckenTodoModule } from '@rucken/todo-nestjs';`,
        `
        RuckenTodoModule.forRoot(options),`
    ];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { 'EndyKaufman <admin@site15.ru>': options.fullAuthor, 'EndyKaufman': options.author, 'admin@site15.ru': options.email, '/demo/': '/' + options.name + '/', '/demo': '/' + options.name, "'demo'": "'" + options.name + "'", Demo: strings_1.classify(options.name) });
}
function pathReplacer(options) {
    return {
        '/demo/': '/' + options.name + '/',
        '/demo': '/' + options.name
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
        `../../../files/rucken/todo-nestjs/apps/demo`.replace('{basePath}', options.basePath)
    ];
}
function updateScriptsPostinstallSh(options) {
    return ast_utils_1.updateFileInTree(core_1.join(core_1.normalize(options.workspace), 'scripts', 'postinstall.sh'), data => {
        const content = fs_1.readFileSync(`${__dirname}/../../../files/rucken/todo-nestjs/scripts/postinstall.sh`.replace('{localPath}', options.basePath)).toString();
        if (strings_1.clearText(data).indexOf(strings_1.clearText(content)) === -1) {
            data = data + '\n' + content;
        }
        return data;
    });
}
function updateScriptsPreinstallSh(options) {
    return ast_utils_1.updateFileInTree(core_1.join(core_1.normalize(options.workspace), 'scripts', 'preinstall.sh'), data => {
        const content = fs_1.readFileSync(`${__dirname}/../../../files/rucken/todo-nestjs/scripts/preinstall.sh`.replace('{localPath}', options.basePath)).toString();
        if (strings_1.clearText(data).indexOf(strings_1.clearText(content)) === -1) {
            data = data + '\n' + content;
        }
        return data;
    });
}
function updateScriptsPatchJs(options) {
    return ast_utils_1.updateFileInTree(core_1.join(core_1.normalize(options.workspace), 'scripts', 'patch.js'), data => {
        const original = fs_1.readFileSync(`${__dirname}/../../../files/rucken/todo-nestjs/scripts/patch.js`.replace('{localPath}', options.basePath)).toString();
        const content = '(function(){\n' + original + ';\n})();';
        if (original && strings_1.clearText(data).indexOf(strings_1.clearText(content)) === -1) {
            data = data + '\n' + content;
        }
        return data;
    });
}
function updateDevelopEnv(options) {
    return ast_utils_1.updateFileInTree(core_1.join(core_1.normalize(options.workspace), 'scripts', 'develop._env'), data => {
        const content = fs_1.readFileSync(`${__dirname}/../../../files/rucken/todo-nestjs/develop._env`.replace('{localPath}', options.basePath)).toString();
        return content;
    });
}
function updatePackageJson(tree, options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'package.json'), packageJson => {
        const templatePackageJson = JSON.parse(fs_1.readFileSync(`${__dirname}/../../../files/rucken/todo-nestjs/package.json`.replace('{localPath}', options.basePath)).toString());
        packageJson.author = options.fullAuthorObject;
        packageJson.externalLibs = templatePackageJson.externalLibs.filter(lib => lib !== './dist/rucken/todo-nestjs');
        if (packageJson.scripts && templatePackageJson.scripts) {
            Object.keys(templatePackageJson.scripts)
                .filter(key => key.indexOf('typeorm') !== -1 || key.indexOf('migrate') !== -1)
                .forEach(key => (packageJson.scripts[key] = templatePackageJson.scripts[key]));
        }
        if (packageJson.dependencies && templatePackageJson.dependencies) {
            Object.keys(templatePackageJson.dependencies)
                .filter(key => key.indexOf('webpack') === -1)
                .forEach(key => (packageJson.dependencies[key] =
                templatePackageJson.dependencies[key]));
        }
        if (packageJson.devDependencies && templatePackageJson.devDependencies) {
            Object.keys(templatePackageJson.devDependencies)
                .filter(key => key.indexOf('webpack') === -1)
                .forEach(key => (packageJson.devDependencies[key] =
                templatePackageJson.devDependencies[key]));
        }
        return packageJson;
    });
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
            updatePackageJson(tree, options),
            updateScriptsPostinstallSh(options),
            updateScriptsPreinstallSh(options),
            updateScriptsPatchJs(options),
            updateDevelopEnv(options),
            updateTsConfigAppJson(options),
            format_files_1.formatFiles()
        ])(tree, context);
    };
}
exports.default = default_1;
function updateTsConfigAppJson(options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspaceProjectRoot), 'tsconfig.app.json'), tsConfigJson => {
        if (!tsConfigJson) {
            tsConfigJson = {};
        }
        if (!tsConfigJson.compilerOptions) {
            tsConfigJson.compilerOptions = {};
        }
        if (!tsConfigJson.compilerOptions.paths) {
            tsConfigJson.compilerOptions = Object.assign({ sourceMap: true, inlineSources: true, declaration: false, moduleResolution: 'node', emitDecoratorMetadata: true, experimentalDecorators: true, importHelpers: true, lib: ['es5', 'es6'], target: 'es6', module: 'commonjs', typeRoots: ['node_modules/@types'], baseUrl: '.' }, tsConfigJson.compilerOptions);
        }
        return tsConfigJson;
    });
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
function normalizeOptions(tree, options) {
    const basePath = tree._backend._root;
    const appDirectory = options.org
        ? `${name_utils_1.toFileName(options.org)}/${name_utils_1.toFileName(options.name)}`
        : name_utils_1.toFileName(options.name);
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), core_1.normalize('apps'), appDirectory);
    const appProject = core_1.join(core_1.normalize('apps'), appDirectory);
    return Object.assign({}, options, { fullAuthorObject: {
            name: options.author,
            email: options.email
        }, fullAuthor: (options.author && options.email) ? `${options.author} <${options.email}>` : '', name: name_utils_1.toFileName(options.name
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
        project.architect.serve = getServeConfig(project, options);
        project.architect.lint = getLintConfig(project);
        project.architect.test = getTestConfig(project);
        angularJson.projects[options.name] = project;
        angularJson.defaultProject = options.name;
        return angularJson;
    });
}
function getBuildConfig(project, options) {
    return {
        builder: '@nrwl/builders:run-commands',
        options: {
            outputPath: 'dist/demo',
            commands: [
                {
                    command: `del-cli ./${core_1.join(core_1.normalize('dist'), options.appDirectory)}`
                },
                {
                    command: `tsc --project ./${core_1.join(project.root, 'tsconfig.app.json')} --outDir ./${core_1.join(core_1.normalize('dist'), options.appDirectory)}`
                }
            ],
            parallel: false
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
function getServeConfig(project, options) {
    return {
        builder: '@nrwl/builders:run-commands',
        options: {
            commands: [
                {
                    command: './node_modules/.bin/rucken prepare -m dev'
                },
                {
                    command: `./node_modules/.bin/nodemon --ext 'ts' --watch 'apps' --watch 'libs' --ignore 'apps/**/*.spec.ts' --ignore 'libs/**/*.spec.ts' --exec ts-node -r tsconfig-paths/register ./${core_1.join(project.sourceRoot, 'main.ts')}`
                }
            ],
            parallel: false
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