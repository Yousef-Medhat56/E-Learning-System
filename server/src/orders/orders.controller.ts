import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/orders.dto';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthRequest,
  ) {
    const { id: userId } = req.user;
    const newOrder = await this.ordersService.create(userId, createOrderDto);
    return newOrder;
  }
}
