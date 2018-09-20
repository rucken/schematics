import { ChangeDetectionStrategy, Inject, Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsExtractor, translate } from '@rucken/core';
import { TestEntity, TEST_ENTITIES_CONFIG_TOKEN } from '@demo/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicRepository, IRestProviderOptions } from 'ngx-repository';
import { BaseEntityListComponent } from '@rucken/web';
import { MessageModalService } from '@rucken/web';
import { TestEntityModalComponent } from '../test-entity-modal/test-entity-modal.component';


@Component({
  selector: 'test-entities-grid',
  templateUrl: './test-entities-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEntitiesGridComponent extends BaseEntityListComponent <TestEntity> implements OnInit {
  @Input()
  modalItemComponent = TestEntityModalComponent;
  @Input()
  title = translate('Test entities');
  constructor(
    public modalService: BsModalService,
    protected errorsExtractor: ErrorsExtractor,
    protected translateService: TranslateService,
    protected dynamicRepository: DynamicRepository,
    protected messageModalService: MessageModalService,
    @Inject(TEST_ENTITIES_CONFIG_TOKEN) protected testEntitiesConfig: IRestProviderOptions<TestEntity>
  ) {
    super(
      dynamicRepository.fork <TestEntity> (TestEntity),
      modalService,
      TestEntity
    );
  }
  ngOnInit() {
    if (!this.mockedItems) {
      this.useRest({
        apiUrl: this.apiUrl,
        ...this.testEntitiesConfig
      });
    }
    if (this.mockedItems) {
      this.useMock({
        items: this.mockedItems,
        ...this.testEntitiesConfig
      });
    }
  }
  /*
  createDeleteModal(item: TestEntity): BsModalRef {
    return this.modalService.show(TestEntityModalComponent, {
      class: 'modal-md',
      initialState: {
        title: this.strings.deleteTitle,
        message: this.strings.deleteMessage,
        yesTitle: translate('Delete'),
        data: item,
        apiUrl: this.apiUrl
      }
    });
  }
  createCreateModal(): BsModalRef {
    const item = new TestEntity();
    return this.modalService.show(TestEntityModalComponent, {
      class: 'modal-md',
      initialState: {
        title: this.strings.createTitle,
        yesTitle: translate('Create'),
        data: item,
        apiUrl: this.apiUrl
      }
    });
  }
  createUpdateModal(item?: TestEntity): BsModalRef {
    return this.modalService.show(TestEntityModalComponent, {
      class: 'modal-md',
      initialState: {
        title: this.strings.updateTitle,
        yesTitle: translate('Save'),
        data: item,
        apiUrl: this.apiUrl
      }
    });
  }
  createViewModal(item?: TestEntity): BsModalRef {
    return this.modalService.show(TestEntityModalComponent, {
      class: 'modal-md',
      initialState: {
        title: this.strings.viewTitle,
        noTitle: translate('Close'),
        readonly: true,
        data: item,
        apiUrl: this.apiUrl
      }
    });
  }
  */
}
