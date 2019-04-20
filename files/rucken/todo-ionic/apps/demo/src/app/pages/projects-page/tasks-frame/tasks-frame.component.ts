import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PROJECTS_CONFIG_TOKEN } from '@rucken/todo-core';
import { CustomProject } from '@rucken/todo-ionic';
import { BindIoInner } from 'ngx-bind-io';
import { DynamicRepository, IRestProviderOptions, Repository } from 'ngx-repository';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@BindIoInner()
@Component({
  selector: 'tasks-frame',
  templateUrl: './tasks-frame.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksFrameComponent {
  apiUrl = environment.apiUrl;
  title$: Observable<string>;
  id$: Observable<number>;
  project$: Observable<CustomProject>;

  private _repository: Repository<CustomProject>;

  constructor(
    public activatedRoute: ActivatedRoute,
    private _dynamicRepository: DynamicRepository,
    @Inject(PROJECTS_CONFIG_TOKEN) private _projectsConfig: IRestProviderOptions<CustomProject>,
  ) {
    this.title$ = activatedRoute.data.pipe(
      map(data => data && data.meta && data.meta.title)
    );
    this._repository = this._dynamicRepository.fork<CustomProject>(CustomProject);
    this._repository.useRest({
      apiUrl: this.apiUrl,
      ...this._projectsConfig,
      autoload: false
    });
    this.id$ = activatedRoute.params.pipe(
      map(params => params.id)
    );
    this.project$ = this.id$.pipe(
      concatMap(id => this._repository.load(id))
    );
  }
}
