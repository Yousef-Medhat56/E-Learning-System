import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';

export const extendCreateQuery = () => {
  return new PrismaService().$extends({
    query: {
      user: {
        async create({ args, query }) {
          const password = args.data.password;

          //check if the password is defined
          if (password) {
            //hash the password
            args.data.password = await bcrypt.hash(password, 10);
          }
          return query(args);
        },
      },
    },
  });
};
