import { Body, Controller, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { ActivateUserDto, CreateUserDto, LoginUserDto } from './dto/users.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
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
          email: 'example@gmail.com',
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
  @ApiOperation({
    summary:
      'Authenticates a user, returning their user data, and setting access and refresh token cookies.',
  })
  @ApiResponse({
    status: 201,
    description: 'Authenicated',
  })
  @ApiResponse({ status: 400, description: 'Incorrect email or password' })
  @ApiResponse({ status: 404, description: "User doesn't exist" })
  @ApiBody({
    type: LoginUserDto,
    required: true,
    examples: {
      example: {
        value: {
          email: 'example@gmail.com',
          password: '123456',
        },
      },
    },
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.usersService.login(loginUserDto);

    res.cookie('access_token', accessToken, {
      maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE) * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookie('refresh_token', refreshToken, {
      maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE) * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return user;
  }
}
