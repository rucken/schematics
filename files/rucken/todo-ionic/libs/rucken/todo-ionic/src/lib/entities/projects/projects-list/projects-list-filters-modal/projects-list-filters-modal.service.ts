import { Inject, Injectable, OnDestroy } from '@angular/core';
import { AuthService, IStorage, STORAGE_CONFIG_TOKEN } from '@rucken/core';
import { CustomUser } from '@rucken/ionic';
import { Status } from '@rucken/todo-core';
import { BindObservable } from 'bind-observable';
import { classToPlain, plainToClass } from 'class-transformer';
import { DynamicRepository, Repository } from 'ngx-repository';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsListFiltersModal } from './projects-list-filters-modal';
import { DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG, IProjectsListFiltersModalConfig, PROJECTS_LIST_FILTERS_MODAL_CONFIG_TOKEN } from './projects-list-filters-modal.config';

export function projectsListFiltersModalServiceInitializeApp(
  projectsListFiltersModalService: ProjectsListFiltersModalService
) {
  return () => projectsListFiltersModalService.initializeApp();
}

@Injectable()
export class ProjectsListFiltersModalService implements OnDestroy {
  @BindObservable()
  current: ProjectsListFiltersModal = undefined;
  current$: Observable<ProjectsListFiltersModal>;
  users$: Observable<CustomUser[]>;
  statuses$: Observable<Status[]>;

  storageKeyName = 'projects-list-filters-modal';

  private _usersRepository: Repository<CustomUser>;
  private _statusesRepository: Repository<Status>;
  private _destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _authService: AuthService,
    private _dynamicRepository: DynamicRepository,
    @Inject(PROJECTS_LIST_FILTERS_MODAL_CONFIG_TOKEN) private _projectsListFiltersModalConfig: IProjectsListFiltersModalConfig,
    @Inject(STORAGE_CONFIG_TOKEN) private _storage: IStorage,
  ) {
    this.current = this.getDefault();
    this._usersRepository = this._dynamicRepository.fork<CustomUser>(CustomUser);
    this._usersRepository.useRest({
      ...DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.usersRestProviderOptions,
      ...this._projectsListFiltersModalConfig.usersRestProviderOptions
    });
    this._statusesRepository = this._dynamicRepository.fork<Status>(Status);
    this._statusesRepository.useRest({
      ...DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG.statusesRestProviderOptions,
      ...this._projectsListFiltersModalConfig.statusesRestProviderOptions
    });
    this.users$ = this._usersRepository.items$;
    this.statuses$ = this._statusesRepository.items$;
    this._authService.current$.pipe(
      takeUntil(this._destroyed$)
    ).subscribe(user => {
      this._usersRepository.reloadAll();
      this._statusesRepository.reloadAll();
    });
  }
  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
  getDefault() {
    return plainToClass(
      ProjectsListFiltersModal,
      {
        ...DEFAULT_PROJECTS_LIST_FILTERS_MODAL_CONFIG,
        ...this._projectsListFiltersModalConfig
      },
      {
        groups: ['manual']
      }
    );
  }
  getCurrent() {
    return this.current;
  }
  setCurrent(value: ProjectsListFiltersModal) {
    this._storage.setItem(
      this.storageKeyName, JSON.stringify(
        classToPlain(
          !value ? this.getDefault() : value,
          { groups: ['manual'] }
        )
      )
    ).then(_ =>
      this.current = value
    );
  }
  initCurrent() {
    return new Promise<ProjectsListFiltersModal>((resolve) => {
      this._storage.getItem(this.storageKeyName).then((data: string) => {
        if (data && data !== 'undefined') {
          try {
            resolve(
              plainToClass(
                ProjectsListFiltersModal,
                JSON.parse(data) as Object,
                { groups: ['manual'] }
              )
            );
          } catch (error) {
            resolve(this.getCurrent());
          }
        } else {
          resolve(this.getCurrent());
        }
      });
    });
  }
  initializeApp() {
    return new Promise((resolve) => {
      this.initCurrent().then(value => {
        this.setCurrent(value);
        resolve();
      });
    });
  }
}
