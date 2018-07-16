import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsExtractor } from '@rucken/core';
import { TestEntity, TestEntitiesConfig } from '@demo/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DynamicRepository } from 'ngx-repository';
import { MessageModalService } from '@rucken/web';
import { TestEntitiesGridComponent } from '../test-entities-grid/test-entities-grid.component';


@Component({
  selector: 'test-entity-select',
  templateUrl: './test-entity-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEntitySelectComponent extends TestEntitiesGridComponent implements OnInit {

  @Input()
  searchField: FormControl = new FormControl();

  nameField = 'name';

  constructor(
    public modalService: BsModalService,
    protected errorsExtractor: ErrorsExtractor,
    protected translateService: TranslateService,
    protected dynamicRepository: DynamicRepository,
    protected testEntitiesConfig: TestEntitiesConfig,
    protected messageModalService: MessageModalService
  ) {
    super(
      modalService,
      errorsExtractor,
      translateService,
      dynamicRepository,
      testEntitiesConfig,
      messageModalService
    );
  }
  ngOnInit() {
    if (!this.mockedItems) {
      this.repository.useRest({
        apiUrl: this.apiUrl,
        ...this.testEntitiesConfig,
        paginationMeta: { perPage: 1000 }
      });
    }
    if (this.mockedItems) {
      this.repository.useMock({
        items: this.mockedItems,
        ...this.testEntitiesConfig
      });
    }
  }
  checkChange(value: any, item: any) {
    return item instanceof TestEntity;
  }
}
