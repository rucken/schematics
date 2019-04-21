import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync, readFileSync } from 'fs';
import { updateJsonInTree } from '../../utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { classify, dasherize } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
}
function contentReplacer(options: NormalizedSchema) {
  const toRemoveStrings = [];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    '/demo-ionic/': '/' + options.name + '/',
    '/demo-ionic': '/' + options.name,
    DemoIonic: classify(options.name),
    'demo-ionic': options.name
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/demo-ionic/': '/' + options.name + '/',
    '/demo-ionic': '/' + options.name
  };
}
function updateSourceFiles(
  path: string,
  content: string,
  options: NormalizedSchema
): string {
  return undefined;
}
function filterFiles(path: Path) {
  const ignoredPaths = [];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/empty/apps/demo-ionic`.replace('{basePath}', options.basePath)
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
      updatePackageJson(tree, options),
      updateNxJson(options),
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
function updatePackageJson(tree: Tree, options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'package.json'), packageJson => {
    const templatePackageJson = JSON.parse(
      readFileSync(
        `${__dirname}/../../../files/empty/apps/demo-ionic/package.json`.replace('{localPath}', options.basePath)
      ).toString()
    );
    if (packageJson.dependencies && templatePackageJson.dependencies) {
      Object.keys(templatePackageJson.dependencies)
        .filter(key => key.indexOf('webpack') === -1 && packageJson.dependencies[key])
        .forEach(
          key =>
            (packageJson.dependencies[key] =
              templatePackageJson.dependencies[key])
        );
    }
    if (packageJson.devDependencies && templatePackageJson.devDependencies) {
      Object.keys(templatePackageJson.devDependencies)
        .filter(key => key.indexOf('webpack') === -1 && packageJson.devDependencies[key])
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
        join(project.sourceRoot, 'favicon.ico'),
        join(project.sourceRoot, 'assets'),
        {
          glob: '**/*.svg',
          input: 'node_modules/ionicons/dist/ionicons/svg',
          output: 'svg'
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
      styles: [
        {
          input: join(project.sourceRoot, 'theme', 'variables.scss')
        },
        {
          input: join(project.sourceRoot, 'global.scss')
        }
      ],
      scripts: [],
      assets: [
        join(project.sourceRoot, 'favicon.ico'),
        join(project.sourceRoot, 'assets'),
        {
          glob: '**/*.svg',
          input: 'node_modules/ionicons/dist/ionicons/svg',
          output: 'svg'
        }
      ]
    }
  };
}
