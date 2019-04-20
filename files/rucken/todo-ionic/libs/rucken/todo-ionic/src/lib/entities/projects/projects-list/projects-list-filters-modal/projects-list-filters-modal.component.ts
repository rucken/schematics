import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BasePromptFormModalComponent } from '@rucken/core';
import { CustomUser } from '@rucken/ionic';
import { BindIoInner } from 'ngx-bind-io';
import { Observable } from 'rxjs';
import { ProjectsListFiltersModal } from './projects-list-filters-modal';
import { ProjectsListFiltersModalService } from './projects-list-filters-modal.service';
import { Status } from '@rucken/todo-core';

@BindIoInner()
@Component({
  selector: 'projects-list-filters-modal',
  templateUrl: './projects-list-filters-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsListFiltersModalComponent extends
  BasePromptFormModalComponent<ProjectsListFiltersModal> implements OnInit {
  @Input()
  class: string = undefined;
  sortTypes = ProjectsListFiltersModal.sortTypes;
  sortFields = ProjectsListFiltersModal.sortFields;
  users$: Observable<CustomUser[]>;
  statuses$: Observable<Status[]>;

  constructor(
    private _projectsListFiltersModalService: ProjectsListFiltersModalService
  ) {
    super();
    this.group(ProjectsListFiltersModal);
    this.users$ = this._projectsListFiltersModalService.users$;
    this.statuses$ = this._projectsListFiltersModalService.statuses$;
  }
  ngOnInit() {
    this.data = this._projectsListFiltersModalService.getCurrent();
    this.hideYes = true;
  }
  onYesClick(data?: any) {
    this._projectsListFiltersModalService.setCurrent(
      this.data
    );
    super.onYesClick(data);
  }
}
