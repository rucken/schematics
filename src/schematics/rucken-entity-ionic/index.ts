import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { pluralize } from 'inflection';
import { offsetFromRoot } from '../../utils/common';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { camelize, capitalize, classify, dasherize, underscore } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
}
function contentReplacer(options: NormalizedSchema) {
  const toRemoveStrings = [
    `
            <form-group
                [bindIO]
                name="openAt"
                [title]="strings.openAt">
                <ion-datetime
                    [cancelText]="'Cancel'|translate"
                    [doneText]="'OK'|translate"
                    display-format="DD.MM.YYYY"
                    formControlName="openAt"
                    [disableControl]="readonly"></ion-datetime>
            </form-group>
            <form-group
                [bindIO]
                name="closeAt"
                [title]="strings.closeAt">
                <ion-datetime
                    [cancelText]="'Cancel'|translate"
                    [doneText]="'OK'|translate"
                    display-format="DD.MM.YYYY"
                    formControlName="closeAt"
                    [disableControl]="readonly"></ion-datetime>
            </form-group>`,
    `
            <form-group
                [bindIO]
                name="status"
                [title]="strings.status">
                <select-input
                    [items]="data.project.statuses"
                    formControlName="status"
                    [disableControl]="readonly">
                </select-input>
            </form-group>
            <form-group
                [bindIO]
                name="users"
                [title]="strings.assignedUser">
                <select-input
                    titleField="username"
                    [items]="data.project.users"
                    formControlName="assignedUser"
                    [disableControl]="readonly">
                </select-input>
            </form-group>`,
    `
import { CustomProject } from '../../../models/custom-project';`,
    `
  @Input()
  project: CustomProject = undefined;`,
    `
            <form-group
                [bindIO]
                name="users"
                [title]="strings.users">
                <select-input
                    titleField="username"
                    [items]="project.users"
                    formControlName="users"
                    [yesTitle]="'OK'|translate"
                    [multiple]="true"
                    [disableControl]="readonly">
                </select-input>
            </form-group>
            <form-group
                [bindIO]
                name="statuses"
                [title]="strings.statuses">
                <select-input
                    [items]="project.statuses"
                    formControlName="statuses"
                    [yesTitle]="'OK'|translate"
                    [multiple]="true"
                    [disableControl]="readonly">
                </select-input>
            </form-group>`,
    `
import { CustomProject } from '../../../../models/custom-project';`,
    `
  @Input()
  project: CustomProject = undefined;`,
    `
    users?: number[];
    statuses?: string[];`,
    `,
    users: [],
    statuses: []`,
    `,
            users: (options && options.users)
              ? options.users
              : DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG.users,
            statuses: (options && options.statuses)
              ? options.statuses
              : DEFAULT_TASKS_LIST_FILTERS_MODAL_CONFIG.statuses`,
    `,
        users: translate('Users'),
        statuses: translate('Statuses')`,
    `,
        { id: 'description', title: translate('Description') },
        { id: 'openAt', title: translate('Open date') },
        { id: 'closeAt', title: translate('Close date') },
        { id: 'createdUser', title: translate('Created user') },
        { id: 'updatedUser', title: translate('Updated user') }`,
    `
    @Type(serializeModel(CustomUser))
    @Transform(
        serializeIdToObject(CustomUser, true),
        { toClassOnly: true, groups: ['manual'] }
    )
    @Transform(
        serializeObjectToId(CustomUser, true),
        { toPlainOnly: true, groups: ['manual'] }
    )
    users: CustomUser[] = undefined;

    @Type(serializeModel(Status))
    @Transform(
        serializeIdToObject(Status, true, 'name'),
        { toClassOnly: true, groups: ['manual'] }
    )
    @Transform(
        serializeObjectToId(Status, true, 'name'),
        { toPlainOnly: true, groups: ['manual'] }
    )
    statuses: Status[] = undefined;`,
    `
    [gridCellActionContent]="gridCellActionContent"
    [itemLabelTemplate]="itemLabelTemplate"`,
    `
<ng-template
    let-ctx
    #itemLabelTemplate>
    <ion-label text-wrap>
        <ng-container *ngIf="(list.filtredColumns$ | async) as columns">
            <h2>
                <ion-icon [name]="(ctx.item.openAt && ctx.item.closeAt)?'checkbox':'checkbox-outline'"></ion-icon>
                {{ctx.item}}
            </h2>
            <p text-wrap>
                <ion-badge
                    color="unread"
                    style="margin-right:5px;">
                    {{strings['status']|translate}}:
                </ion-badge>
                <ion-badge color="medium">{{ctx.item.status}}</ion-badge>
            </p>
            <p
                text-wrap
                *ngIf="ctx.item.assignedUser">
                <ion-badge
                    color="unread"
                    style="margin-right:5px;">
                    {{strings['assignedUser']|translate}}:
                </ion-badge>
                <ion-badge color="medium">{{ctx.item.assignedUser.username}}</ion-badge>
            </p>
            <p
                text-wrap
                *ngIf="ctx.item.range">
                <ion-badge
                    color="unread"
                    style="margin-right:5px;">
                    {{strings['range']|translate}}:
                </ion-badge>
                <ion-badge color="medium">{{ctx.item.range}}</ion-badge>
            </p>
        </ng-container>
    </ion-label>
</ng-template>
<ng-template
    #gridCellActionContent
    let-ctx>
    <ng-container *ngIf="(list.notReadonlyAndEnableUpdate$ | async) && (ctx.item.project|userPerm)">
        <ion-item-option
            color="primary"
            (click)="ctx.slidingItem.close();list.onUpdate(ctx.item)"
            *ngIf="list.updateLink===undefined">
            <ion-icon
                slot="icon-only"
                name="create">
            </ion-icon>
        </ion-item-option>
        <ion-item-option
            color="primary"
            *ngIf="list.updateLink!==undefined"
            (click)="ctx.slidingItem.close()"
            [routerLink]="[list.updateLink+'/'+ctx.item.id]">
            <ion-icon
                slot="icon-only"
                name="create">
            </ion-icon>
        </ion-item-option>
    </ng-container>
    <ng-container *ngIf="(list.notReadonlyAndEnableDelete$ | async) && (ctx.item.project|userPerm)">
        <ion-item-option
            color="danger"
            (click)="ctx.slidingItem.close();list.onDelete(ctx.item)"
            *ngIf="list.deleteLink===undefined">
            <ion-icon
                slot="icon-only"
                name="trash">
            </ion-icon>
        </ion-item-option>
        <ion-item-option
            color="danger"
            *ngIf="list.deleteLink!==undefined"
            (click)="ctx.slidingItem.close()"
            [routerLink]="[list.deleteLink+'/'+ctx.item.id]">
            <ion-icon
                slot="icon-only"
                name="trash">
            </ion-icon>
        </ion-item-option>
    </ng-container>
</ng-template>`,
    `
import { CustomProject } from '../../../models/custom-project';`,
    `,
    private _userPermPipe: UserPermPipe`,
    `
  ngOnChanges(changes: SimpleChanges) {
    if (changes.project) {
      this.onChangeFilter();
    }
  }`,
    `
  onViewClick(item: CustomTask) {
    if (this._userPermPipe.transform(item.project)) {
      this.onUpdateClick(item);
    } else {
      super.onViewClick(item);
    }
  }`,
    `, UserPermPipe`,
    `,
          project: this.project`,
    `
    if (tasksListFiltersModal.users) {
      filter['users'] = tasksListFiltersModal.users.map(user => user.id).join(',');
    }
    if (tasksListFiltersModal.statuses) {
      filter['statuses'] = tasksListFiltersModal.statuses.map(status => status.name).join(',');
    }`,
    `
  async onCreateClickAsync(item?: CustomTask) {
    item = item || new CustomTask();
    item.project = this.project;
    return super.onCreateClickAsync(item);
  }`,
    `
    item.project = this.project;`,
    `
      filter['project'] = this.project.id;`,
    `
  @Input()
  project: CustomProject;`,
    `
    this.items$ = this.repository.items$.pipe(
      map(
        items => items.map(
          item => {
            item.project = this.project;
            return item;
          }
        )
      )
    );`,
    `
import { Status } from '@rucken/todo-core';`
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    '\'description\', \'title\', \'action\'': '\'title\', \'name\', \'action\'',
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
    'TasksListComponent extends BaseEntityListComponent<CustomTask> implements OnInit, OnChanges':
      'TasksListComponent extends BaseEntityListComponent<CustomTask> implements OnInit',
    'import { CustomTask } from \'../../../models/custom-task\';':
      `import { ${classify(options.name)} } from '@rucken/todo-core';`,
    'tasksList': camelize(pluralize(options.name)) + 'List',
    'TasksList': classify(pluralize(options.name)) + 'List',
    'taskList': camelize(options.name) + 'List',
    'TaskList': classify(options.name) + 'List',
    'if (this.project) {': 'if (true) {',
    'TASKS': pluralize(underscore(options.name)).toUpperCase(),
    'TASK': underscore(options.name).toUpperCase(),
    'Tasks': classify(pluralize(options.name)),
    'CustomTask': classify(options.name),
    'Task': classify(options.name),
    'tasks-': pluralize(options.name) + '-',
    'task-': options.name + '-',
    '/tasks/': '/' + pluralize(options.name) + '/',
    '/tasks': '/' + pluralize(options.name),
    '/task/': '/' + options.name + '/',
    '/task': '/' + options.name,
    'tasks': camelize(pluralize(options.name)),
    'task': camelize(options.name),
    '@rucken/todo-core': '@' + (options.entitiesLibOrg || options.org) + '/' + (options.entitiesLib || options.lib)
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
    `../../../files/rucken/todo-ionic/libs/rucken/todo-ionic/src/lib/entities/tasks`.replace('{basePath}', options.basePath)
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
      (options.entitiesLib || options.lib)
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    org: options.org,
    entitiesLibOrg: toFileName(
      (options.entitiesLibOrg || options.org)
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
