import { Component, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { TestEntity } from '@demo/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BaseEntityListModalComponent } from '@rucken/web';
import { TestEntitiesGridComponent } from '../test-entities-grid/test-entities-grid.component';

@Component({
  selector: 'test-entities-grid-modal',
  templateUrl: './test-entities-grid-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEntitiesGridModalComponent extends BaseEntityListModalComponent <TestEntity> {

  @ViewChild('grid')
  grid: TestEntitiesGridComponent;
  @Input()
  apiUrl?: string;

  constructor(
    protected bsModalRef: BsModalRef
  ) {
    super(bsModalRef);
  }
}
