import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/orders.dto';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a new order',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'You already purchased this course',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthRequest,
  ) {
    const { id: userId } = req.user;
    const newOrder = await this.ordersService.create(userId, createOrderDto);
    return newOrder;
  }
}
