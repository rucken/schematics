import { join, normalize, Path } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { readIntoSourceFile } from '../../utils/ast-utils';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { classify, dasherize } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
  org: string;
  app: string;
}
export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const options = normalizeOptions(tree, schema);
    return chain([
      importToModule(options),
      formatFiles()
    ])(tree, context);
  };
}
function normalizeOptions(tree: Tree, options: Schema): NormalizedSchema {
  const basePath = (<any>tree)._backend._root;

  const appDirectory = options.org
    ? `${toFileName(options.org)}/${toFileName(options.name)}`
    : toFileName(options.name);

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

  const appProjectRoot = join(
    normalize(options.workspace),
    normalize('libs'),
    appDirectory
  );
  const appProject = join(
    normalize('libs'),
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
    app: options.app,
    org: options.org,
    appDirectory,
    workspaceProjectRoot: appProjectRoot,
    projectRoot: appProject,
    basePath
  };
}
function importToModule(options: NormalizedSchema): Rule {
  const appModuleFileName = toFileName('app.module');
  const libModuleName = classify(options.org) + classify(options.name) + 'Module';
  const libName = '@' + options.org + '/' + options.name;
  const appModuleFileSrc = join(
    normalize(options.workspace),
    'apps',
    options.app,
    'src',
    'app',
    appModuleFileName
  );
  return (host: Tree) => {
    const source = readIntoSourceFile(host, `/${appModuleFileSrc}.ts`);
    const declarationChanges = addImportToModule(
      source,
      `/${appModuleFileSrc}.ts`,
      libModuleName,
      libName);
    const declarationRecorder = host.beginUpdate(`/${appModuleFileSrc}.ts`);
    for (const change of declarationChanges) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);
    return host;
  };
}
