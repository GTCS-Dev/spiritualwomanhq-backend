import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(username: string, password: string) {
    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (username !== adminUsername) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let passwordIsValid = false;

    if (adminPasswordHash) {
      passwordIsValid = await bcrypt.compare(password, adminPasswordHash);
    } else {
      passwordIsValid = password === adminPassword;
    }

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: 'admin',
      username,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
