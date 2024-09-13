import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ActivateUserDto, CreateUserDto, LoginUserDto } from './dto/users.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  @ApiOperation({
    summary:
      'Return activation code and token, and send activation email to the user',
  })
  @ApiResponse({
    status: 201,
    description: 'Activation email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({
    type: CreateUserDto,
    required: true,
    examples: {
      example: {
        value: {
          name: 'Yousef Medhat',
          email: 'yousef.medhat564@gmail.com',
          password: '123456',
        },
      },
    },
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.signup(createUserDto);
    return user;
  }

  @Post('/activate')
  @ApiOperation({
    summary: 'Activate the user account and add him to the database',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({
    type: ActivateUserDto,
    required: true,
    examples: {
      example: {
        value: {
          activationCode: '5618',
          activationToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJNZWRoYXQiLCJlbWFpbCI6InlvdXNlZjVAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmIkMTAkdUE2bGlzdXNzVTBHUFdYNU5XaDZYT3VHYmd2NFlTT2hlbjgvZUVXRGlIekdrbUN3YW9ZanUifSwiYWN0aXZhdGlvbkNvZGUiOiI3MjEwIiwiaWF0IjoxNzI2MTMwMDU0LCJleHAiOjE3MjYxMzM2NTR9.zuNuqtLRZ7z-pJG3tJ95xSXNeQN39R4fDZ3JD4Ob5O0',
        },
      },
    },
  })
  async activate(@Body() activateUserDto: ActivateUserDto) {
    const user = await this.usersService.activate(activateUserDto);
    return user;
  }

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.login(loginUserDto);
    return user;
  }
}
