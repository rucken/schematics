"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const fs_1 = require("fs");
const ast_utils_1 = require("../../utils/ast-utils");
const common_1 = require("../../utils/common");
const fileutils_1 = require("../../utils/fileutils");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function contentReplacer(options) {
    const toRemoveStrings = [
        `
import { DEFAULT_PROJECTS_CONFIG, PROJECTS_CONFIG_TOKEN, RuckenTodoCoreModule, TASKS_CONFIG_TOKEN } from '@rucken/todo-core';`,
        `
import { IONIC_DEFAULT_TASKS_CONFIG, ProjectsListFiltersModalModule, RuckenTodoIonicModule, TasksListFiltersModalModule } from '@rucken/todo-ionic';`,
        `,
    RuckenTodoCoreModule`,
        `,
    RuckenTodoIonicModule`,
        `,
    {
      provide: PROJECTS_CONFIG_TOKEN,
      useValue: {
        ...DEFAULT_PROJECTS_CONFIG,
        apiUrl: environment.apiUrl
      }
    },
    {
      provide: TASKS_CONFIG_TOKEN,
      useValue: {
        ...IONIC_DEFAULT_TASKS_CONFIG,
        apiUrl: environment.apiUrl
      }
    }`,
        `
import { PROJECTS_PAGE_ROUTES } from './pages/projects-page/projects-page.routes';`,
        `
    {
        path: 'projects',
        loadChildren: './pages/projects-page/projects-page.module#ProjectsPageModule',
        data: PROJECTS_PAGE_ROUTES[0].data
    },`,
        `
    ProjectsListFiltersModalModule.forRoot({
      usersRestProviderOptions: {
        apiUrl: environment.apiUrl + '/projects'
      },
      statusesRestProviderOptions: {
        apiUrl: environment.apiUrl + '/projects'
      }
    }),`,
        `
    TasksListFiltersModalModule.forRoot(),`
    ];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { 'EndyKaufman <admin@site15.ru>': options.fullAuthor, 'EndyKaufman': options.author, 'admin@site15.ru': options.email, 'http://rucken.io/': options.api, 'node_modules/@ionic/core/dist/ionic/svg': 'node_modules/ionicons/dist/ionicons/svg', '/apps/demo/src': '/src', 'http://localhost:5000/api': 'http://localhost:3000/api', 'io.rucken.android.todoionic': 'com.' + options.name.split('-').join(''), 'rucken-todo-ionic': options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.'), '/demo-todo/': '/' + options.name + '/', '/demo-todo': '/' + options.name, 'Rucken: Todo Ionic': strings_1.capitalize(options.name)
            .split('-')
            .join(' '), 'Rucken: Задачи': strings_1.capitalize(options.name)
            .split('-')
            .join(' '), 'rucken-todo': options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.'), 'https://todo-nestjs.rucken.io/api': options.api, 'http://todo-nestjs.rucken.io/api': options.api, 'demo-todo': options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.'), '/demo/': '/' + options.name + '/', '/demo': '/' + options.name, demo: options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.'), '/todo/': '/' + options.name + '/', '/todo': '/' + options.name, todo: options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.') });
}
function pathReplacer(options) {
    return {
        '/apps/demo': '/',
        '/demo-todo/': '/' + options.name + '/',
        '/demo-todo': '/' + options.name,
        'demo-todo': options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.'),
        '/demo/': '/' + options.name + '/',
        '/demo': '/' + options.name,
        demo: options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')
    };
}
function updateSourceFiles(path, content, options) {
    if (path === '/angular.json') {
        const angularJson = JSON.parse(content.split('apps/demo/').join(''));
        delete angularJson.projects['todo-ionic'];
        return fileutils_1.serializeJson(angularJson);
    }
    if (path === '/apps/demo/tsconfig.app.json') {
        let tsConfigJson = JSON.parse(content);
        tsConfigJson = {
            extends: './tsconfig.json',
            compilerOptions: {
                outDir: '../../dist/out-tsc/' + options.name,
                types: []
            },
            exclude: ['test.ts', '**/*.spec.ts'],
            include: ['**/*.ts']
        };
        return fileutils_1.serializeJson(tsConfigJson);
    }
    if (path === '/apps/demo/tsconfig.spec.json') {
        let tsConfigJson = JSON.parse(content);
        tsConfigJson = {
            extends: './tsconfig.json',
            compilerOptions: {
                outDir: '../../dist/out-tsc/' + options.name,
                types: ['jasmine', 'node']
            },
            files: ['src/test.ts', 'src/polyfills.ts'],
            include: ['**/*.spec.ts', '**/*.d.ts']
        };
        return fileutils_1.serializeJson(tsConfigJson);
    }
    if (path === '/tsconfig.json') {
        let tsConfigJson = JSON.parse(content);
        tsConfigJson = {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jasmine']
            },
            include: ['**/*.ts']
        };
        return fileutils_1.serializeJson(tsConfigJson);
    }
    if (path === '/package.json') {
        const packageJson = JSON.parse(content);
        packageJson['author'] = options.fullAuthorObject;
        delete packageJson['description'];
        delete packageJson['bugs'];
        delete packageJson['homepage'];
        delete packageJson['repository'];
        delete packageJson['maintainers'];
        delete packageJson.scripts['lib:build-ionic'];
        delete packageJson.scripts['doc:lib:ionic'];
        delete packageJson.dependencies['@rucken/todo-core'];
        packageJson.scripts['doc'] = packageJson.scripts['doc'].replace('doc:lib:ionic ', '');
        return fileutils_1.serializeJson(packageJson);
    }
    if (path === '/apps/demo/src/app/i18n/ru.po') {
        return 'export const RuI18n = {};';
    }
    if (path === `/apps/demo/src/app/index.ts`) {
        return `export * from './i18n/ru.i18n';`;
    }
    return undefined;
}
function filterFiles(path) {
    const ignoredPaths = [
        '/' +
            core_1.join(core_1.normalize('apps'), 'demo', 'src', 'app', 'pages', 'projects-page'),
        '/' + core_1.join(core_1.normalize('libs')),
        '/' + core_1.join(core_1.normalize('.git')) + '/',
        '/' + core_1.join(core_1.normalize('package-lock.json')),
        '/' + core_1.join(core_1.normalize('greenkeeper.json')),
        '/' + core_1.join(core_1.normalize('scripts'), 'publish.sh'),
        '/' + core_1.join(core_1.normalize('CHANGELOG.md')),
        '/' + core_1.join(core_1.normalize('README.md')),
        '/' + core_1.join(core_1.normalize('apps'), 'demo-e2e'),
        '/' + core_1.join(core_1.normalize('apps'), 'demo', 'src', 'app', 'i18n', 'ru.i18n.ts')
    ];
    return (ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
        0);
}
function templateSources(options) {
    return [
        `../../../files/rucken/todo-ionic`.replace('{basePath}', options.basePath)
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
            updatePackageJson(tree, options),
            updateScriptsPostinstallSh(options),
            updateScriptsPatchJs(options),
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
function updateScriptsPostinstallSh(options) {
    return ast_utils_1.updateFileInTree(core_1.join(core_1.normalize(options.workspace), 'scripts', 'postinstall.sh'), data => {
        const content = fs_1.readFileSync(`./files/rucken/todo-ionic/scripts/postinstall.sh`.replace('{localPath}', options.basePath)).toString();
        if (strings_1.clearText(data).indexOf(strings_1.clearText(content)) === -1) {
            data = data + '\n' + content;
        }
        return data;
    });
}
function updateScriptsPatchJs(options) {
    return ast_utils_1.updateFileInTree(core_1.join(core_1.normalize(options.workspace), 'scripts', 'patch.js'), data => {
        const original = fs_1.readFileSync(`./files/rucken/todo-ionic/scripts/patch.js`.replace('{localPath}', options.workspace)).toString();
        const content = '(function(){\n' + original + ';\n})();';
        if (original && strings_1.clearText(data).indexOf(strings_1.clearText(content)) === -1) {
            data = data + '\n' + content;
        }
        return data;
    });
}
function updatePackageJson(tree, options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.workspace), 'package.json'), packageJson => {
        const templatePackageJson = JSON.parse(fs_1.readFileSync(`./files/rucken/todo-ionic/package.json`.replace('{localPath}', options.basePath)).toString());
        packageJson.author = options.fullAuthorObject;
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
                },
                {
                    command: `cp -a ./node_modules/ionicons ${core_1.join(project.root, 'node_modules')}`
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
                {
                    glob: '**/*',
                    input: 'src/assets',
                    output: 'assets'
                },
                {
                    glob: '**/*.svg',
                    input: 'node_modules/ionicons/dist/ionicons/svg',
                    output: './svg'
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
            scripts: [],
            assets: [
                {
                    glob: '**/*',
                    input: 'src/assets',
                    output: 'assets'
                },
                {
                    glob: '**/*.svg',
                    input: 'node_modules/ionicons/dist/ionicons/svg',
                    output: './svg'
                }
            ],
            styles: [
                {
                    input: core_1.join(project.sourceRoot, 'theme', 'variables.scss')
                },
                {
                    input: core_1.join(project.sourceRoot, 'global.scss')
                }
            ]
        }
    };
}
//# sourceMappingURL=index.js.map