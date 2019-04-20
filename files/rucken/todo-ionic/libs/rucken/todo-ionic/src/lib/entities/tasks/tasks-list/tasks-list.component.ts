import { ChangeDetectionStrategy, Component, Inject, Input, isDevMode, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseEntityListComponent, BasePromptFormModalComponent, ErrorsExtractor, IBaseEntityGridFilter, IBaseEntityModalOptions, interpolate, ModalsService, translate, UserPermPipe } from '@rucken/core';
import { EntityListComponent, IonicModalsService } from '@rucken/ionic';
import { TASKS_CONFIG_TOKEN } from '@rucken/todo-core';
import { BindIoInner } from 'ngx-bind-io';
import { DynamicRepository, IRestProviderOptions } from 'ngx-repository';
import { map } from 'rxjs/operators';
import { CustomProject } from '../../../models/custom-project';
import { CustomTask } from '../../../models/custom-task';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TasksListFiltersModal } from './tasks-list-filters-modal/tasks-list-filters-modal';
import { TasksListFiltersModalComponent } from './tasks-list-filters-modal/tasks-list-filters-modal.component';
import { TasksListFiltersModalService } from './tasks-list-filters-modal/tasks-list-filters-modal.service';

@BindIoInner()
@Component({
  selector: 'tasks-list',
  templateUrl: './tasks-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent extends BaseEntityListComponent<CustomTask> implements OnInit, OnChanges {

  @ViewChild('list')
  list: EntityListComponent<CustomTask>;
  @Input()
  modalItem: IBaseEntityModalOptions = {
    class: 'primary',
    component: TaskModalComponent,
    initialState: {
      hideYes: true,
      hideNo: true
    }
  };
  @Input()
  modalView: IBaseEntityModalOptions = {
    class: 'medium',
    component: TaskModalComponent,
    initialState: {
      noClass: 'medium',
      hideYes: true,
      hideNo: true
    }
  };
  @Input()
  title = translate('Tasks');
  @Input()
  project: CustomProject;

  constructor(
    modalsService: ModalsService,
    protected errorsExtractor: ErrorsExtractor,
    protected translateService: TranslateService,
    protected dynamicRepository: DynamicRepository,
    @Inject(TASKS_CONFIG_TOKEN) protected tasksConfig: IRestProviderOptions<CustomTask>,
    private _tasksListFiltersModalService: TasksListFiltersModalService,
    private _userPermPipe: UserPermPipe
  ) {
    super(dynamicRepository.fork<CustomTask>(CustomTask), modalsService, CustomTask);
  }
  ngOnInit() {
    if (!this.mockedItems) {
      this.useRest({
        apiUrl: this.apiUrl,
        infinity: true,
        ...this.tasksConfig,
        autoload: false
      });
    }
    if (this.mockedItems) {
      this.useMock({
        items: this.mockedItems,
        infinity: true,
        ...this.tasksConfig,
        autoload: false
      });
    }
    this.items$ = this.repository.items$.pipe(
      map(
        items => items.map(
          item => {
            item.project = this.project;
            return item;
          }
        )
      )
    );
    this.onChangeFilter();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.project) {
      this.onChangeFilter();
    }
  }
  setSearchText(event: { detail: { value: string } }) {
    this.list.searchField.setValue(
      event.detail.value
    );
  }
  onViewClick(item: CustomTask) {
    if (this._userPermPipe.transform(item.project)) {
      this.onUpdateClick(item);
    } else {
      super.onViewClick(item);
    }
  }
  async onDeleteClickAsync(item: CustomTask) {
    const title = interpolate(this.translateService.instant(this.strings.deleteTitle), item);
    const message = interpolate(this.translateService.instant(this.strings.deleteMessage), item);
    try {
      const result = await (this.modalsService as IonicModalsService).confirmAsync({
        title,
        message
      });
      if (result) {
        this.repository.delete(item.id).subscribe(
          deletedItem => {
            if (this.mockedItems) {
              this.mockedItems = this.repository.items;
              this.mockedItemsChange.emit(this.mockedItems);
            }
          },
          error => this.onError(error)
        );
      }
    } catch (error) {
      throw error;
    }
  }
  async createFiltersModal(item?: TasksListFiltersModal) {
    item = item || new TasksListFiltersModal();
    const modalRef = await this.modalsService.createAsync<TasksListFiltersModalComponent>(
      TasksListFiltersModalComponent,
      {
        class: 'secondary',
        initialState: {
          title: translate('Tasks filters'),
          data: item,
          project: this.project
        }
      }
    );
    modalRef.instance.group(TasksListFiltersModal);
    modalRef.instance.data = item;
    return modalRef;
  }
  async onFilterClickAsync(data?: any) {
    const modalRef = await this.createFiltersModal(data);
    modalRef.instance.yes.subscribe((modal: TasksListFiltersModalComponent) => {
      modal.hide();
      this.onChangeFilter();
    });
  }
  onFilterClick(data?: any): void {
    this.onFilterClickAsync(data).then();
  }
  onChangeFilter(filter?: IBaseEntityGridFilter) {
    if (!filter) {
      filter = {};
    }
    const tasksListFiltersModal = this._tasksListFiltersModalService.getCurrent();
    if (tasksListFiltersModal.sortField) {
      filter['sort'] = tasksListFiltersModal.sortField.id;
    }
    if (tasksListFiltersModal.sortType) {
      filter['sort'] = (tasksListFiltersModal.sortType.id === 'asc' ? '' : '-') + filter['sort'];
    }
    if (tasksListFiltersModal.users) {
      filter['users'] = tasksListFiltersModal.users.map(user => user.id).join(',');
    }
    if (tasksListFiltersModal.statuses) {
      filter['statuses'] = tasksListFiltersModal.statuses.map(status => status.name).join(',');
    }
    if (this.project) {
      filter['project'] = this.project.id;
      super.onChangeFilter(filter);
    }
  }

  async onCreateClickAsync(item?: CustomTask) {
    item = item || new CustomTask();
    item.project = this.project;
    return super.onCreateClickAsync(item);
  }
  async onUpdateClickAsync(item: CustomTask) {
    item.project = this.project;
    const useCustomModalComponent = this.modalUpdate.component || this.modalItem.component;
    let modalRef = !useCustomModalComponent ? await this.createUpdateModal(item) : undefined;
    if (!modalRef) {
      modalRef = await this.defaultCreateUpdateModal(item);
      if (isDevMode() && !useCustomModalComponent) {
        console.warn('Method "createUpdateModal" is not defined', this);
      }
    }
    modalRef.instance.yes.subscribe((modal: BasePromptFormModalComponent<CustomTask>) => {
      modal.processing = true;
      this.repository.update(item.id, modal.getData()).subscribe(
        updatedItem => {
          modal.processing = false;
          if (this.mockedItems) {
            this.mockedItems = this.repository.items;
            this.mockedItemsChange.emit(this.mockedItems);
          }
          modal.hide();
        },
        error => this.onUpdateError(modal, error)
      );
    });
  }
}
