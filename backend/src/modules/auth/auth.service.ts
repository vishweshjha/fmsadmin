import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminUserRole } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginResponseDto, UserResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(userId: string) {
    return this.prisma.adminUser.findUnique({ where: { id: userId } });
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.adminUser.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    const updatedUser = await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '24h');

    return {
      success: true,
      user: this.toUserResponse(updatedUser),
      token,
      expiresIn: this.parseExpiresIn(expiresIn),
    };
  }

  async signup(signupDto: SignupDto): Promise<LoginResponseDto> {
    const existingUser = await this.prisma.adminUser.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const savedUser = await this.prisma.adminUser.create({
      data: {
        ...signupDto,
        password: hashedPassword,
      },
    });

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '24h');

    return {
      success: true,
      user: this.toUserResponse(savedUser),
      token,
      expiresIn: this.parseExpiresIn(expiresIn),
    };
  }

  private toUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AdminUserRole,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    // Convert "24h" to seconds
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 3600;
    }
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 86400;
    }
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    return 86400; // default 24 hours
  }
}
