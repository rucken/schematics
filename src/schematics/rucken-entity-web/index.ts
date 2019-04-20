import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, schematic, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { pluralize } from 'inflection';
import { offsetFromRoot } from '../../utils/common';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { camelize, classify, dasherize, underscore, capitalize } from '../../utils/strings';
import { Schema } from './schema';
import { existsSync } from 'fs';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
}
function contentReplacer(options: NormalizedSchema) {
  const toRemoveStrings = [
    `
            <div class="col-md-4">
                <form-group
                    [bindIO]
                    name="status"
                    [title]="strings.status">
                    <status-input
                        (select)="form.get('status').setValue($event)"
                        [project]="data.project"
                        [readonly]="readonly"
                        [apiUrl]="apiUrl">
                        <input
                            formControlName="status"
                            [readonly]="readonly">
                    </status-input>
                </form-group>
            </div>
            <div class="col-md-4">
                <form-group
                    [bindIO]
                    name="openAt"
                    [title]="strings.openAt">
                    <input
                        formControlName="openAt"
                        bsDatepicker
                        [isDisabled]="readonly"
                        [readonly]="readonly">
                </form-group>
            </div>
            <div class="col-md-4">
                <form-group
                    [bindIO]
                    name="closeAt"
                    [title]="strings.closeAt">
                    <input
                        formControlName="closeAt"
                        bsDatepicker
                        [isDisabled]="readonly"
                        [readonly]="readonly">
                </form-group>
            </div>`,
    `Project, `,
    `
  @Input()
  project: Project = undefined;`,
    `
          item.project = this.project;`,
    `
  onChangeFilter(filter?: IBaseEntityGridFilter) {
    filter = filter ? filter : {};
    if (this.project) {
      filter.project = this.project.id;
      this.mockedItems = undefined;
    } else {
      this.mockedItems = [];
    }
    this.ngOnInit();
    super.onChangeFilter(filter);
  }`,
    `
    item.project = this.project;`,
    `
import { StatusInputModule } from '../../statuses/status-input/status-input.module';
import { StatusSelectModule } from '../../statuses/status-select/status-select.module';`,
    `
    StatusInputModule,`,
    `, StatusSelectModule`
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    '\'title\',\'range\',\'status\',\'action\'': '\'title\',\'name\',\'action\'',
    'translate(\'Tasks': 'translate(\'' + capitalize(underscore(pluralize(options.name))).replace(new RegExp('_', 'g'), ' '),
    'translate(\'Task': 'translate(\'' + capitalize(underscore(options.name)).replace(new RegExp('_', 'g'), ' '),
    '"description"': '"name"',
    '.description"': '.name"',
    'add_tasks': `add_${pluralize(options.name)}`,
    'change_tasks': `change_${pluralize(options.name)}`,
    'delete_tasks': `delete_${pluralize(options.name)}`,
    'read_tasks': `read_${pluralize(options.name)}`,
    'add_task': `add_${options.name}`,
    'change_task': `change_${options.name}`,
    'delete_task': `delete_${options.name}`,
    'read_task': `read_${options.name}`,
    'TASKS': pluralize(underscore(options.name)).toUpperCase(),
    'TASK': underscore(options.name).toUpperCase(),
    'Tasks': classify(pluralize(options.name)),
    'Task': classify(options.name),
    'tasks-': pluralize(options.name) + '-',
    'task-': options.name + '-',
    '/tasks/': '/' + pluralize(options.name) + '/',
    '/tasks': '/' + pluralize(options.name),
    '/task/': '/' + options.name + '/',
    '/task': '/' + options.name,
    'tasks': camelize(pluralize(options.name)),
    'task': camelize(options.name),
    '@rucken/todo-core': '@' + options.org + '/' + options.entitiesLib
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/tasks/': '/' + pluralize(options.name) + '/',
    '/tasks': '/' + pluralize(options.name),
    '/task/': '/' + options.name + '/',
    '/task': '/' + options.name
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
  const ignoredPaths = [
  ];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/rucken/todo/libs/rucken/todo-web/src/lib/entities/tasks`.replace('{basePath}', options.basePath)
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
      /*schematic('rucken-lib', {
        name: options.lib,
        org: options.org
      }),*/
      ...(
        templateSources(options).map(templateSource =>
          addAppFiles(templateSource, tree, options)
        )
      ),
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
    ? `${toFileName(options.org)}/${toFileName(options.lib)}`
    : toFileName(options.lib);
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
    lib: toFileName(
      options.lib
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    entitiesLib: toFileName(
      options.entitiesLib
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    org: options.org,
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
      move(
        join(
          options.workspaceProjectRoot,
          'src',
          'lib',
          'entities',
          pluralize(options.name)
        )
      )
    ])
  );
}