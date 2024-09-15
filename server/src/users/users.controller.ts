import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ActivateUserDto,
  CreateUserDto,
  LoginUserDto,
  SocialSignupUserDto,
} from './dto/users.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth.interface';
import { UpstashRedisService } from 'nestjs-upstash-redis';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private redisService: UpstashRedisService,
  ) {}

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

  @Post('/logout')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Logout the user',
  })
  logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const { id } = req.user;

    // delete user from cache
    this.redisService.del(id);
    res.cookie('access_token', '', {
      maxAge: 1,
    });
    res.cookie('refresh_token', '', {
      maxAge: 1,
    });
  }

  @Post('/refresh')
  @ApiOperation({
    summary: 'Refresh tokens',
  })
  @ApiResponse({ status: 201, description: 'Tokens updated successfully' })
  @ApiResponse({ status: 404, description: 'Forbidden' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // get refresh_Token from the cookie
    const oldRefreshToken = req.cookies.refresh_token as string;
    // the new tokens
    const { accessToken, refreshToken } =
      await this.usersService.refresh(oldRefreshToken);

    // send new tokens to cookies
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
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get info of the current authinticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Authenicated',
  })
  @ApiResponse({ status: 401, description: 'Not valid access token' })
  @ApiResponse({ status: 404, description: "User doesn't exist" })
  async me(@Req() req: AuthRequest) {
    // user id
    const { id } = req.user;
    const user = await this.usersService.getUserById(id);
    return user;
  }

  @Post('/social-signup')
  async socialSignup(
    @Body() createUserDto: SocialSignupUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.usersService.socialSignup(createUserDto);

    // send new tokens to cookies
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
