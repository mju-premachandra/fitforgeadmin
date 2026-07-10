import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const defaultEmail = (
      this.config.get<string>('DEFAULT_ADMIN_EMAIL') ?? 'admin@fitforge.com'
    ).toLowerCase();
    const defaultPassword =
      this.config.get<string>('DEFAULT_ADMIN_PASSWORD') ?? 'admin1234';
    const defaultName =
      this.config.get<string>('DEFAULT_ADMIN_NAME') ?? 'Administrator';

    if (email === defaultEmail && dto.password === defaultPassword) {
      return {
        user: {
          id: 'default-admin',
          name: defaultName,
          email: defaultEmail,
          role: 'OWNER',
        },
      };
    }

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid email or password');

    const valid = await compare(dto.password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return {
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
