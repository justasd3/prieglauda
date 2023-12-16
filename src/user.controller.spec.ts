import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { AppService } from './user.service';

describe('AppController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [AppService],
    }).compile();

    userController = app.get<UserController>(UserController);
  });
});
