import { CreateUserDto } from 'src/users/dto/users.dto';

export interface ActivationTokenPayload {
  user: CreateUserDto;
  activationCode: string;
}

export interface AuthRequest extends Request {
  user?: { id: string };
}
