import { ChangeDetectionStrategy, Component, Inject, Input, isDevMode, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, BaseEntityListComponent, BasePromptFormModalComponent, ErrorsExtractor, IBaseEntityGridFilter, IBaseEntityModalOptions, interpolate, ModalsService, translate } from '@rucken/core';
import { EntityListComponent, IonicModalsService } from '@rucken/ionic';
import { PROJECTS_CONFIG_TOKEN } from '@rucken/todo-core';
import { BindIoInner } from 'ngx-bind-io';
import { DynamicRepository, IRestProviderOptions } from 'ngx-repository';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomProject } from '../../../models/custom-project';
import { ProjectModalComponent } from '../project-modal/project-modal.component';
import { ProjectsListFiltersModal } from './projects-list-filters-modal/projects-list-filters-modal';
import { ProjectsListFiltersModalComponent } from './projects-list-filters-modal/projects-list-filters-modal.component';
import { ProjectsListFiltersModalService } from './projects-list-filters-modal/projects-list-filters-modal.service';

@BindIoInner()
@Component({
  selector: 'projects-list',
  templateUrl: './projects-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsListComponent extends BaseEntityListComponent<CustomProject> implements OnInit, OnDestroy {

  @ViewChild('list')
  list: EntityListComponent<CustomProject>;
  @Input()
  modalItem: IBaseEntityModalOptions = {
    class: 'primary',
    component: ProjectModalComponent,
    initialState: {
      hideYes: true,
      hideNo: true
    }
  };
  @Input()
  modalView: IBaseEntityModalOptions = {
    class: 'medium',
    component: ProjectModalComponent,
    initialState: {
      noClass: 'medium',
      hideYes: true,
      hideNo: true
    }
  };
  @Input()
  title = translate('Projects');

  private _destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    modalsService: ModalsService,
    private _authService: AuthService,
    protected errorsExtractor: ErrorsExtractor,
    protected translateService: TranslateService,
    protected dynamicRepository: DynamicRepository,
    @Inject(PROJECTS_CONFIG_TOKEN) protected projectsConfig: IRestProviderOptions<CustomProject>,
    private _projectsListFiltersModalService: ProjectsListFiltersModalService
  ) {
    super(dynamicRepository.fork<CustomProject>(CustomProject), modalsService, CustomProject);
  }
  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
  ngOnInit() {
    if (!this.mockedItems) {
      this.useRest({
        apiUrl: this.apiUrl,
        infinity: true,
        ...this.projectsConfig,
        autoload: false
      });
    }
    if (this.mockedItems) {
      this.useMock({
        items: this.mockedItems,
        infinity: true,
        ...this.projectsConfig,
        autoload: false
      });
    }
    this._authService.current$.pipe(takeUntil(this._destroyed$)).subscribe(user =>
      this.onChangeFilter()
    );
  }

  setSearchText(event: { detail: { value: string } }) {
    this.list.searchField.setValue(
      event.detail.value
    );
  }
  async onDeleteClickAsync(item: CustomProject) {
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
  async createFiltersModal(item?: ProjectsListFiltersModal) {
    item = item || new ProjectsListFiltersModal();
    const modalRef = await this.modalsService.createAsync<ProjectsListFiltersModalComponent>(
      ProjectsListFiltersModalComponent,
      {
        class: 'secondary',
        initialState: {
          title: translate('Projects filters'),
          data: item
        }
      }
    );
    modalRef.instance.group(ProjectsListFiltersModal);
    modalRef.instance.data = item;
    return modalRef;
  }
  async onFilterClickAsync(data?: any) {
    const modalRef = await this.createFiltersModal(data);
    modalRef.instance.yes.subscribe((modal: ProjectsListFiltersModalComponent) => {
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
    const projectsListFiltersModal = this._projectsListFiltersModalService.getCurrent();
    if (projectsListFiltersModal.sortField) {
      filter['sort'] = projectsListFiltersModal.sortField.id;
    }
    if (projectsListFiltersModal.sortType) {
      filter['sort'] = (projectsListFiltersModal.sortType.id === 'asc' ? '' : '-') + filter['sort'];
    }
    if (projectsListFiltersModal.users) {
      filter['users'] = projectsListFiltersModal.users.map(user => user.id).join(',');
    }
    if (projectsListFiltersModal.statuses) {
      filter['statuses'] = projectsListFiltersModal.statuses.map(status => status.name).join(',');
    }
    super.onChangeFilter(filter);
  }

  async onUpdateClickAsync(item: CustomProject) {
    const useCustomModalComponent = this.modalUpdate.component || this.modalItem.component;
    let modalRef = !useCustomModalComponent ? await this.createUpdateModal(item) : undefined;
    if (!modalRef) {
      modalRef = await this.defaultCreateUpdateModal(item);
      if (isDevMode() && !useCustomModalComponent) {
        console.warn('Method "createUpdateModal" is not defined', this);
      }
    }
    modalRef.instance.yes.subscribe((modal: BasePromptFormModalComponent<CustomProject>) => {
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
