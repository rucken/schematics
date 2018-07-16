import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestEntity } from '@demo/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BasePromptFormModalComponent } from '@rucken/web';

@Component({
  selector: 'test-entity-modal',
  templateUrl: './test-entity-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEntityModalComponent extends BasePromptFormModalComponent <TestEntity> {

  constructor(
    protected bsModalRef: BsModalRef
  ) {
    super(bsModalRef);
    this.group(TestEntity);
  }
}
