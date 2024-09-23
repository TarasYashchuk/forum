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
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-responce.dto';

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
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new NotFoundException('Invalid user ID');
    }
    return this.userService.getUserById(userId);
  }

  @Get()
  async getAllUsers(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
  }

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

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserDto> {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new NotFoundException('Invalid user ID');
    }
    return this.userService.deleteUser(userId);
  }

  @Get('search')
  async searchUsers(@Query('query') query: string): Promise<User[]> {
    return this.userService.searchUsers(query);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserDto> {
    return this.userService.getUserByEmail(email);
  }
}
