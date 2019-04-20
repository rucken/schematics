import { Test, TestingModule } from '@nestjs/testing';
import { CoreNestjsService } from './core-nestjs.service';

describe('CoreNestjsService', () => {
  let service: CoreNestjsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreNestjsService]
    }).compile();
    service = module.get<CoreNestjsService>(CoreNestjsService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
