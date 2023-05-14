import {Body, Controller, Headers, HttpCode, HttpException, Post} from "@nestjs/common";
import {RequestUserDto} from "./dto/request-auth.dto";
import {AuthService} from "./services/auth.service";
import {CreateAuthDto, CreateAuthDtoGoogle} from "./dto/create-auth.dto";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthModel} from "./models/auth.model";
import {JWTService} from "./services/jwt.service";

import {RefreshDto} from "./dto/refresh.dto";
import {UserModel} from "../../models/user.model";
import {UsersService} from "../user/users.service";
import {UserPassService} from "./services/user-pass.service";

@ApiTags("Authorization")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService,
              private jwtService: JWTService,
              private usersService: UsersService,
              private userPassService: UserPassService,
  ) {
  }
  @HttpCode(201)
  @Post("forgot-pass")
  async changePassword(@Body() dto: {email:string, name: string, newPassword: string}) {
    const user = await this.usersService.getUser(dto.email);
    if (!user) {
      throw new HttpException("Неверный адрес электронной почты", 401);
    }

    if(user.name !== dto.name) {
      throw new HttpException("Неверное имя пользователя", 401);
    }
    const passwordHash = await this.usersService.hashPassword(dto.newPassword);

    await this.userPassService.update({passwordHash, _id: user._id});

    const updatedUser = await this.authService.login({password: dto.newPassword, email: dto.email});

    return {
      token: updatedUser.token
    };
  }

  @HttpCode(201)
  @Post("register")
  async registration(@Body() dto: CreateAuthDto) {
    const newUser = await this.authService.register(dto);
    if (!newUser) {
      throw new HttpException("Непредвиденная ошибка, попробуйте позже", 401);
    }
    return newUser;
  }
  @ApiResponse({ status: 201, type: UserModel })
  @HttpCode(201)
  @Post("login")
  async login(@Body() dto: RequestUserDto) {
    if (!dto.email || !dto.password) {
      throw new HttpException("Данные для входа в систему не были предоставлены", 401);
    }
    const user = await this.authService.login(dto);
    if (!user) {
      throw new HttpException("Неправильный логин или пароль", 401);
    }
    return user;
  }
  @ApiOperation({ summary: "New user register" })
  @ApiResponse({ status: 201, type: AuthModel })
  @HttpCode(201)
  @Post("register-google")
  async registrationGoogle(@Body() {email}: CreateAuthDtoGoogle) {
    const newUser = await this.authService.registerGoogle({email});
    if (!newUser) {
      throw new HttpException("Непредвиденная ошибка, попробуйте позже", 401);
    }
    return newUser;
  }
  @ApiOperation({ summary: "User login witch google" })
  @ApiResponse({ status: 201, type: UserModel })
  @HttpCode(201)
  @Post("login-google")
  async loginGoogle(@Body() {email}: {email: string}) {
    const user = await this.authService.loginGoogle(email);
    return user;
  }

  @ApiOperation({ summary: "Current user logging out" })
  @ApiResponse({ status: 201 })
  @Post("logout")
  @HttpCode(201)
  async logout(@Headers("authorization") jwt: string) {
    const [, token] = jwt.split(" ", 2);
    const jwtPayload = this.jwtService.checkTokenExpiry(token);
    if (!jwtPayload) {
      throw new HttpException("Срок действия вашего маркера истек", 400);
    } else {
      await this.authService.logout(jwtPayload._id);
      return 201;
    }
  }

  @ApiOperation({ summary: "Refresh expired token" })
  @ApiResponse({ status: 201, type: RefreshDto })
  @HttpCode(201)
  @Post("refresh")
  async refresh(@Headers("authorization") jwt: string) {
    const newToken = await this.authService.refreshToken(jwt);
    return { token: newToken };
  }
}
