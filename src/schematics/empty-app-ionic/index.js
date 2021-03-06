"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const fs_1 = require("fs");
const versions_1 = require("../../utils/versions");
const ast_utils_1 = require("../../utils/ast-utils");
const common_1 = require("../../utils/common");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function contentReplacer(options) {
    const toRemoveStrings = [];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { '/demo-ionic/': '/' + options.name + '/', '/demo-ionic': '/' + options.name, DemoIonic: strings_1.classify(options.name), 'demo-ionic': options.name });
}
function pathReplacer(options) {
    return {
        '/demo-ionic/': '/' + options.name + '/',
        '/demo-ionic': '/' + options.name
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
        `../../../files/empty/apps/demo-ionic`.replace('{basePath}', options.basePath)
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
            updatePackageJson(tree, options),
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
function updatePackageJson(tree, options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'package.json'), packageJson => {
        const templatePackageJson = JSON.parse(fs_1.readFileSync(`${__dirname}/../../../files/empty/apps/demo-ionic/package.json`.replace('{localPath}', options.basePath)).toString());
        if (packageJson.dependencies && templatePackageJson.dependencies) {
            Object.keys(templatePackageJson.dependencies)
                .filter(key => key.indexOf('webpack') === -1 && packageJson.dependencies[key])
                .forEach(key => (packageJson.dependencies[key] = versions_1.vlatest([
                packageJson.dependencies[key],
                templatePackageJson.dependencies[key]
            ])));
        }
        if (packageJson.devDependencies && templatePackageJson.devDependencies) {
            Object.keys(templatePackageJson.devDependencies)
                .filter(key => key.indexOf('webpack') === -1 && !packageJson.dependencies[key])
                .forEach(key => (packageJson.devDependencies[key] = versions_1.vlatest([
                packageJson.devDependencies[key],
                templatePackageJson.devDependencies[key]
            ])));
        }
        return packageJson;
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
            tags: ['angular', 'client', 'application', 'ionic', name]
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
            schematics: {
                '@nrwl/schematics:component': {
                    style: 'scss'
                },
                '@ionic/angular-toolkit:component': {
                    styleext: 'scss'
                },
                '@ionic/angular-toolkit:page': {
                    styleext: 'scss'
                }
            },
            architect: {}
        };
        project.architect['android-prepare'] = getAndroidPreapre(project, options);
        project.architect['android-build'] = getAndroidBuild(project, options);
        project.architect['android-serve'] = getAndroidServe(project, options);
        project.architect.build = getBuildConfig(project, options);
        project.architect.serve = getServeConfig(options);
        project.architect['extract-i18n'] = getLintExtracti18n(options);
        project.architect.test = getTestConfig(project);
        project.architect.lint = getLintConfig(project);
        angularJson.projects[options.name] = project;
        return angularJson;
    });
}
function getAndroidPreapre(project, options) {
    return {
        builder: '@nrwl/builders:run-commands',
        options: {
            commands: [
                {
                    command: `chmod +x ./${core_1.join(project.root, 'scripts', 'prepare-android.sh')}`
                },
                {
                    command: `./${core_1.join(project.root, 'scripts', 'prepare-android.sh')} ./${project.root}`
                }
            ],
            parallel: false
        }
    };
}
function getAndroidBuild(project, options) {
    return {
        builder: '@nrwl/builders:run-commands',
        options: {
            commands: [
                {
                    command: `chmod +x ./${core_1.join(project.root, 'scripts', 'build-android.sh')}`
                },
                {
                    command: `./${core_1.join(project.root, 'scripts', 'build-android.sh')} ./${project.root} ./${core_1.join(core_1.normalize('dist'), options.appDirectory, options.name)}.apk`
                }
            ],
            parallel: false
        }
    };
}
function getAndroidServe(project, options) {
    return {
        builder: '@nrwl/builders:run-commands',
        options: {
            commands: [
                {
                    command: `chmod +x ./${core_1.join(project.root, 'scripts', 'serve-android.sh')}`
                },
                {
                    command: `./${core_1.join(project.root, 'scripts', 'serve-android.sh')} ./${project.root}`
                }
            ],
            parallel: false
        }
    };
}
function getBuildConfig(project, options) {
    return {
        builder: '@angular-devkit/build-angular:browser',
        options: {
            outputPath: core_1.join(core_1.normalize('dist'), options.appDirectory),
            index: core_1.join(project.sourceRoot, 'index.html'),
            main: core_1.join(project.sourceRoot, 'main.ts'),
            polyfills: core_1.join(project.sourceRoot, 'polyfills.ts'),
            tsConfig: core_1.join(project.root, 'tsconfig.app.json'),
            assets: [
                core_1.join(project.sourceRoot, 'favicon.ico'),
                core_1.join(project.sourceRoot, 'assets'),
                {
                    glob: '**/*.svg',
                    input: 'node_modules/ionicons/dist/ionicons/svg',
                    output: 'svg'
                }
            ],
            styles: [
                {
                    input: core_1.join(project.sourceRoot, 'theme', 'variables.scss')
                },
                {
                    input: core_1.join(project.sourceRoot, 'global.scss')
                }
            ],
            scripts: [],
            es5BrowserSupport: true
        },
        configurations: {
            production: {
                fileReplacements: [
                    {
                        replace: core_1.join(project.sourceRoot, 'environments', 'environment.ts'),
                        with: core_1.join(project.sourceRoot, 'environments', 'environment.prod.ts')
                    }
                ],
                optimization: false,
                outputHashing: 'all',
                sourceMap: false,
                extractCss: true,
                namedChunks: false,
                aot: true,
                extractLicenses: true,
                vendorChunk: false,
                buildOptimizer: false,
                budgets: [
                    {
                        type: 'initial',
                        maximumWarning: '2mb',
                        maximumError: '5mb'
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
        builder: '@angular-devkit/build-angular:dev-server',
        options: {
            browserTarget: `${options.name}:build`
        },
        configurations: {
            production: {
                browserTarget: `${options.name}:build:production`
            }
        }
    };
}
function getLintExtracti18n(options) {
    return {
        builder: '@angular-devkit/build-angular:extract-i18n',
        options: {
            browserTarget: `${options.name}:build`
        }
    };
}
function getTestConfig(project) {
    return {
        builder: '@angular-devkit/build-angular:karma',
        options: {
            main: core_1.join(project.sourceRoot, 'test.ts'),
            polyfills: core_1.join(project.sourceRoot, 'polyfills.ts'),
            tsConfig: core_1.join(project.root, 'tsconfig.spec.json'),
            karmaConfig: core_1.join(project.root, 'karma.conf.js'),
            styles: [
                {
                    input: core_1.join(project.sourceRoot, 'theme', 'variables.scss')
                },
                {
                    input: core_1.join(project.sourceRoot, 'global.scss')
                }
            ],
            scripts: [],
            assets: [
                core_1.join(project.sourceRoot, 'favicon.ico'),
                core_1.join(project.sourceRoot, 'assets'),
                {
                    glob: '**/*.svg',
                    input: 'node_modules/ionicons/dist/ionicons/svg',
                    output: 'svg'
                }
            ]
        }
    };
}
//# sourceMappingURL=index.js.map