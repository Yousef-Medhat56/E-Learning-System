import { Role } from '@prisma/client';
import { CreateUserDto } from 'src/users/dto/users.dto';

export interface ActivationTokenPayload {
  user: CreateUserDto;
  activationCode: string;
}

// payload of access and refresh tokens
export interface AuthTokenPayload {
  id: string;
  role: Role;
}
export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}
