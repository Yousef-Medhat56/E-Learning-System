import { CreateUserDto } from 'src/users/dto/users.dto';

export interface ActivationTokenPayload {
  user: CreateUserDto;
  activationCode: string;
}
