import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync, readFileSync } from 'fs';
import { updateFileInTree, updateJsonInTree } from '../../utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { serializeJson } from '../../utils/fileutils';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { capitalize, clearText, dasherize } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
  fullAuthor: string;
  fullAuthorObject: {
    name: string,
    email: string
  };
}
function contentReplacer(options: NormalizedSchema) {
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
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'EndyKaufman <admin@site15.ru>': options.fullAuthor,
    'EndyKaufman': options.author,
    'admin@site15.ru': options.email,
    'http://rucken.io/': options.api,
    'node_modules/@ionic/core/dist/ionic/svg':
      'node_modules/ionicons/dist/ionicons/svg',
    '/apps/demo/src': '/src',
    'http://localhost:5000/api': 'http://localhost:3000/api',
    'io.rucken.android.todoionic': 'com.' + options.name.split('-').join(''),
    'rucken-todo-ionic': options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    '/demo-todo/': '/' + options.name + '/',
    '/demo-todo': '/' + options.name,
    'Rucken: Todo Ionic': capitalize(options.name)
      .split('-')
      .join(' '),
    'Rucken: Задачи': capitalize(options.name)
      .split('-')
      .join(' '),
    'rucken-todo': options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    'https://todo-nestjs.rucken.io/api': options.api,
    'http://todo-nestjs.rucken.io/api': options.api,
    'demo-todo': options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    '/demo/': '/' + options.name + '/',
    '/demo': '/' + options.name,
    demo: options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    '/todo/': '/' + options.name + '/',
    '/todo': '/' + options.name,
    todo: options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.')
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/apps/demo': '/',
    '/demo-todo/': '/' + options.name + '/',
    '/demo-todo': '/' + options.name,
    'demo-todo': options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    '/demo/': '/' + options.name + '/',
    '/demo': '/' + options.name,
    demo: options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.')
  };
}
function updateSourceFiles(
  path: string,
  content: string,
  options: NormalizedSchema
): string {
  if (path === '/angular.json') {
    const angularJson = JSON.parse(content.split('apps/demo/').join(''));
    delete angularJson.projects['todo-ionic'];
    return serializeJson(angularJson);
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
    return serializeJson(tsConfigJson);
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
    return serializeJson(tsConfigJson);
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
    return serializeJson(tsConfigJson);
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

    packageJson.scripts['doc'] = packageJson.scripts['doc'].replace(
      'doc:lib:ionic ',
      ''
    );
    return serializeJson(packageJson);
  }
  if (path === '/apps/demo/src/app/i18n/ru.po') {
    return 'export const RuI18n = {};';
  }
  if (path === `/apps/demo/src/app/index.ts`) {
    return `export * from './i18n/ru.i18n';`
  }
  return undefined;
}
function filterFiles(path: Path) {
  const ignoredPaths = [
    '/' +
    join(normalize('apps'), 'demo', 'src', 'app', 'pages', 'projects-page'),
    '/' + join(normalize('libs')),
    '/' + join(normalize('.git')) + '/',
    '/' + join(normalize('package-lock.json')),
    '/' + join(normalize('greenkeeper.json')),
    '/' + join(normalize('scripts'), 'publish.sh'),
    '/' + join(normalize('CHANGELOG.md')),
    '/' + join(normalize('README.md')),
    '/' + join(normalize('apps'), 'demo-e2e'),
    '/' + join(normalize('apps'), 'demo', 'src', 'app', 'i18n', 'ru.i18n.ts')
  ];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/rucken/todo-ionic`.replace('{basePath}', options.basePath)
  ];
}
export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const options = normalizeOptions(tree, schema);
    const appProjectRootPath = join(
      normalize(options.basePath),
      options.workspaceProjectRoot
    );
    return chain([
      ...(
        !existsSync(appProjectRootPath) ?
          templateSources(options).map(templateSource =>
            addAppFiles(templateSource, tree, options)
          ) :
          []
      ),
      updateAngularJson(options),
      updateNxJson(options),
      updatePackageJson(tree, options),
      updateScriptsPostinstallSh(options),
      updateScriptsPatchJs(options),
      formatFiles()
    ])(tree, context);
  };
}
function updateFileFileEntry(
  tree: Tree,
  fileEntry: FileEntry,
  options: NormalizedSchema
): FileEntry {
  let contentReplaced = false,
    pathReplaced = false,
    content = fileEntry.content.toString(),
    path = fileEntry.path.toString();
  const updatedContent = updateSourceFiles(path, content, options);
  const contentReplacerResult = contentReplacer(options),
    pathReplacerResult = pathReplacer(options);
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
    return <FileEntry>{ path: path, content: Buffer.from(content) };
  }
  return fileEntry;
}
function normalizeOptions(tree: Tree, options: Schema): NormalizedSchema {
  const basePath = (<any>tree)._backend._root;

  const appDirectory = options.org
    ? `${toFileName(options.org)}/${toFileName(options.name)}`
    : toFileName(options.name);

  const appProjectRoot = join(
    normalize(options.workspace),
    normalize('apps'),
    appDirectory
  );
  const appProject = join(
    normalize('apps'),
    appDirectory
  );

  return {
    ...options,
    fullAuthorObject: {
      name: options.author,
      email: options.email
    },
    fullAuthor: (options.author && options.email) ? `${options.author} <${options.email}>` : '',
    name: toFileName(
      options.name
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    appDirectory,
    workspaceProjectRoot: appProjectRoot,
    projectRoot: appProject,
    basePath
  };
}
function addAppFiles(
  templateSource: string,
  tree: Tree,
  options: NormalizedSchema
): Rule {
  return mergeWith(
    apply(url(templateSource), [
      filter(path => filterFiles(path)),
      template({
        tmpl: '',
        name: options.name,
        root: options.projectRoot,
        offset: offsetFromRoot(options.projectRoot)
      }),
      forEach((fileEntry: FileEntry) => {
        return updateFileFileEntry(tree, fileEntry, options);
      }),
      move(options.workspaceProjectRoot)
    ])
  );
}
function updateScriptsPostinstallSh(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'scripts', 'postinstall.sh'), data => {
    const content = readFileSync(
      `./files/rucken/todo-ionic/scripts/postinstall.sh`.replace('{localPath}', options.basePath)
    ).toString();
    if (clearText(data).indexOf(clearText(content)) === -1) {
      data = data + '\n' + content;
    }
    return data;
  });
}
function updateScriptsPatchJs(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'scripts', 'patch.js'), data => {
    const original = readFileSync(
      `./files/rucken/todo-ionic/scripts/patch.js`.replace('{localPath}', options.workspace)
    ).toString();
    const content = '(function(){\n' + original + ';\n})();';
    if (original && clearText(data).indexOf(clearText(content)) === -1) {
      data = data + '\n' + content;
    }
    return data;
  });
}
function updatePackageJson(tree: Tree, options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'package.json'), packageJson => {
    const templatePackageJson = JSON.parse(
      readFileSync(
        `./files/rucken/todo-ionic/package.json`.replace('{localPath}', options.basePath)
      ).toString()
    );
    packageJson.author = options.fullAuthorObject;
    if (packageJson.dependencies && templatePackageJson.dependencies) {
      Object.keys(templatePackageJson.dependencies)
        .filter(key => key.indexOf('webpack') === -1)
        .forEach(
          key =>
            (packageJson.dependencies[key] =
              templatePackageJson.dependencies[key])
        );
    }
    if (packageJson.devDependencies && templatePackageJson.devDependencies) {
      Object.keys(templatePackageJson.devDependencies)
        .filter(key => key.indexOf('webpack') === -1)
        .forEach(
          key =>
            (packageJson.devDependencies[key] =
              templatePackageJson.devDependencies[key])
        );
    }
    return packageJson;
  });
}
function updateNxJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'nx.json'), nxJson => {
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
function updateAngularJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'angular.json'), angularJson => {
    const project = {
      root: options.projectRoot,
      sourceRoot: join(options.projectRoot, 'src'),
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
      architect: <any>{}
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
function getAndroidPreapre(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:run-commands',
    options: {
      commands: [
        {
          command: `chmod +x ./${join(
            project.root,
            'scripts',
            'prepare-android.sh'
          )}`
        },
        {
          command: `./${join(
            project.root,
            'scripts',
            'prepare-android.sh'
          )} ./${project.root}`
        },
        {
          command: `cp -a ./node_modules/ionicons ${join(
            project.root,
            'node_modules'
          )}`
        }
      ],
      parallel: false
    }
  };
}
function getAndroidBuild(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:run-commands',
    options: {
      commands: [
        {
          command: `chmod +x ./${join(
            project.root,
            'scripts',
            'build-android.sh'
          )}`
        },
        {
          command: `./${join(project.root, 'scripts', 'build-android.sh')} ./${
            project.root
            } ./${join(
              normalize('dist'),
              options.appDirectory,
              options.name
            )}.apk`
        }
      ],
      parallel: false
    }
  };
}
function getAndroidServe(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:run-commands',
    options: {
      commands: [
        {
          command: `chmod +x ./${join(
            project.root,
            'scripts',
            'serve-android.sh'
          )}`
        },
        {
          command: `./${join(project.root, 'scripts', 'serve-android.sh')} ./${
            project.root
            }`
        }
      ],
      parallel: false
    }
  };
}
function getBuildConfig(project: any, options: NormalizedSchema) {
  return {
    builder: '@angular-devkit/build-angular:browser',
    options: {
      outputPath: join(normalize('dist'), options.appDirectory),
      index: join(project.sourceRoot, 'index.html'),
      main: join(project.sourceRoot, 'main.ts'),
      polyfills: join(project.sourceRoot, 'polyfills.ts'),
      tsConfig: join(project.root, 'tsconfig.app.json'),
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
          input: join(project.sourceRoot, 'theme', 'variables.scss')
        },
        {
          input: join(project.sourceRoot, 'global.scss')
        }
      ],
      scripts: [],
      es5BrowserSupport: true
    },
    configurations: {
      production: {
        fileReplacements: [
          {
            replace: join(project.sourceRoot, 'environments', 'environment.ts'),
            with: join(
              project.sourceRoot,
              'environments',
              'environment.prod.ts'
            )
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

function getLintConfig(project: any) {
  return {
    builder: '@angular-devkit/build-angular:tslint',
    options: {
      tsConfig: [
        join(project.root, 'tsconfig.app.json'),
        join(project.root, 'tsconfig.spec.json')
      ],
      exclude: ['**/node_modules/**']
    }
  };
}
function getServeConfig(options: NormalizedSchema) {
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
function getLintExtracti18n(options: NormalizedSchema) {
  return {
    builder: '@angular-devkit/build-angular:extract-i18n',
    options: {
      browserTarget: `${options.name}:build`
    }
  };
}
function getTestConfig(project: any) {
  return {
    builder: '@angular-devkit/build-angular:karma',
    options: {
      main: join(project.sourceRoot, 'test.ts'),
      polyfills: join(project.sourceRoot, 'polyfills.ts'),
      tsConfig: join(project.root, 'tsconfig.spec.json'),
      karmaConfig: join(project.root, 'karma.conf.js'),
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
          input: join(project.sourceRoot, 'theme', 'variables.scss')
        },
        {
          input: join(project.sourceRoot, 'global.scss')
        }
      ]
    }
  };
}
