import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-responce.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserIdDto } from './dto/user-id.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { plainToClass } from 'class-transformer';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const user = await this.userService.createUser(createUserDto);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roleId: user.roleId,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserById(@Param() params: UserIdDto): Promise<UserDto> {
    return this.userService.getUserById(params.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get()
  async getAllUsers(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() UserDto: Prisma.UserUpdateInput,
  ): Promise<UserDto> {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userService.updateUser(userId, UserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserDto> {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new NotFoundException('Invalid user ID');
    }
    return this.userService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserDto> {
    return this.userService.getUserByEmail(email);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string): Promise<UserDto> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  // TODO

  /* @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @Roles(2)
  async changePassword(req: any, @Body('newPassword') newPassword: string) {
    const username = req.user.username;
    return this.userService.changeUserPassword(username, newPassword);
  } */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Patch('password')
  async changePasswordByAdmin(
    @Body() body: { id: number; newPassword: string },
  ): Promise<UserDto> {
    const { id, newPassword } = body;

    const user = await this.userService.changeUserPassword(id, newPassword);
    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  // fix

  /* @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @Roles(1)
  async changePassword(
    @Req()
    @Body()
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userService.getUserById(Req.arguments.user.id);

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Incorrect old password');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userService.updateUserPassword(user.id, hashedPassword);
  }*/
}
