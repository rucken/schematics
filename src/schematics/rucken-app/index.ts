import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync, readFileSync } from 'fs';
import { vlatest } from '../../utils/versions';
import { updateFileInTree, updateJsonInTree } from '../../utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { capitalize, classify, clearText, dasherize } from '../../utils/strings';
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
import { RuckenTodoCoreModule } from '@rucken/todo-core';`,
    `
import { RuckenTodoWebModule } from '@rucken/todo-web';`,
    `,
    RuckenTodoCoreModule`,
    `,
    RuckenTodoWebModule`,
    `import { PROJECTS_PAGE_ROUTES } from './pages/projects-page/projects-page.routes';`,
    `
  {
    path: 'projects',
    loadChildren: './pages/projects-page/projects-page.module#ProjectsPageModule',
    data: PROJECTS_PAGE_ROUTES[0].data
  },`,
    `
import { PROJECTS_FRAME_ROUTES } from './projects-frame/projects-frame.routes';
import { STATUSES_FRAME_ROUTES } from './statuses-frame/statuses-frame.routes';
import { TASKS_FRAME_ROUTES } from './tasks-frame/tasks-frame.routes';`,
    `,
  {
    path: 'projects',
    loadChildren: './projects-frame/projects-frame.module#ProjectsFrameModule',
    data: PROJECTS_FRAME_ROUTES[0].data
  },
  {
    path: 'tasks',
    loadChildren: './tasks-frame/tasks-frame.module#TasksFrameModule',
    data: TASKS_FRAME_ROUTES[0].data
  },
  {
    path: 'statuses',
    loadChildren: './statuses-frame/statuses-frame.module#StatusesFrameModule',
    data: STATUSES_FRAME_ROUTES[0].data
  }`
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'EndyKaufman <admin@site15.ru>': options.fullAuthor,
    'EndyKaufman': options.author,
    'admin@site15.ru': options.email,
    'http://rucken.io/': options.api,
    'http://localhost:5000/api': 'http://localhost:3000/api',
    '/demo-web/': '/' + options.name + '/',
    '/demo-web': '/' + options.name,
    'demo-web': options.name,
    '/demo/': '/' + options.name + '/',
    '/demo': '/' + options.name,
    'todo-demo': options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    'rucken-todo': options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.'),
    'https://todo-nestjs.rucken.io/api': options.api,
    'http://todo-nestjs.rucken.io/api': options.api,
    'Rucken: Todo': capitalize(options.name)
      .split('-')
      .join(' '),
    DemoWeb: classify(options.name)
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/demo-web/': '/' + options.name + '/',
    '/demo-web': '/' + options.name,
    '/demo/': '/' + options.name + '/',
    '/demo': '/' + options.name
  };
}
function updateSourceFiles(
  path: string,
  content: string,
  options: NormalizedSchema
): string {
  if (path === '/src/app/i18n/ru.po') {
    return 'export const RuI18n = {};';
  }
  if (path === `/src/app/index.ts`) {
    return `export * from './i18n/ru.i18n';`;
  }
  return undefined;
}
function filterFiles(path: Path) {
  const ignoredPaths = [
    '/' + join(normalize('src'), 'app', 'pages', 'projects-page'),
    '/' +
    join(normalize('src'), 'app', 'pages', 'entities-page', 'projects-frame'),
    '/' +
    join(normalize('src'), 'app', 'pages', 'entities-page', 'statuses-frame'),
    '/' +
    join(normalize('src'), 'app', 'pages', 'entities-page', 'tasks-frame'),
    '/' + join(normalize('src'), 'app', 'i18n', 'ru.i18n.ts')
  ];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/rucken/todo/apps/demo`.replace('{basePath}', options.basePath).replace('{basePath}', options.basePath)
  ];
}
function updateScriptsPostinstallSh(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'scripts', 'postinstall.sh'), data => {
    const content = readFileSync(
      `${__dirname}/../../../files/rucken/todo/scripts/postinstall.sh`.replace('{localPath}', options.basePath)
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
      `${__dirname}/../../../files/rucken/todo/scripts/patch.js`.replace('{localPath}', options.basePath)
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
        `${__dirname}/../../../files/rucken/todo/package.json`.replace('{localPath}', options.basePath)
      ).toString()
    );
    packageJson.author = options.fullAuthorObject;
    if (packageJson.dependencies && templatePackageJson.dependencies) {
      Object.keys(templatePackageJson.dependencies)
        .filter(key => key.indexOf('webpack') === -1)
        .forEach(
          key =>
            (packageJson.dependencies[key] = vlatest(
              [
                packageJson.dependencies[key],
                templatePackageJson.dependencies[key]
              ]
            ))
        );
    }
    if (packageJson.devDependencies && templatePackageJson.devDependencies) {
      Object.keys(templatePackageJson.devDependencies)
        .filter(key => key.indexOf('webpack') === -1 && !packageJson.dependencies[key])
        .forEach(
          key =>
            (packageJson.devDependencies[key] = vlatest(
              [
                packageJson.devDependencies[key],
                templatePackageJson.devDependencies[key]
              ]
            ))
        );
    }
    delete packageJson.dependencies['@rucken/todo-core'];
    return packageJson;
  });
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

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

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
      forEach((fileEntry: FileEntry) =>
        updateFileFileEntry(tree, fileEntry, options)
      ),
      move(options.workspaceProjectRoot)
    ])
  );
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
      tags: ['angular', 'client', 'application', name]
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
        }
      },
      architect: <any>{}
    };

    project.architect.build = getBuildConfig(project, options);
    project.architect.serve = getServeConfig(options);
    project.architect['extract-i18n'] = getLintExtracti18n(options);
    project.architect.test = getTestConfig(project);
    project.architect.lint = getLintConfig(project);
    angularJson.projects[options.name] = project;
    angularJson.defaultProject = options.name;

    return angularJson;
  });
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
        join(project.sourceRoot, 'favicon.ico'),
        join(project.sourceRoot, 'assets')
      ],
      styles: [join(project.sourceRoot, 'styles.scss')],
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
      styles: [join(project.sourceRoot, 'styles.scss')],
      scripts: [],
      assets: [
        join(project.sourceRoot, 'favicon.ico'),
        join(project.sourceRoot, 'assets')
      ]
    }
  };
}
