import { Controller} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('admin/users')
@ApiTags('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UserService) {}

}
