import {Body, Controller, Get, Headers, HttpException, HttpStatus, Post, Put, UseGuards} from "@nestjs/common";
import {UsersService} from "./users.service";
import {UserModel} from "../../models/user.model";
import {User} from "../../common/decarators/user.decarator";
import {setFirstEnterDto} from "./dto/user.dto";
import {JWTService} from "../authentication/services/jwt.service";
import {AuthGuard} from "../authentication/guards/auth.guard";
import {AuthService, JwtPayload} from "../authentication/services/auth.service";
import {UserPassService} from "../authentication/services/user-pass.service";
import {AuthModelService} from "../authentication/services/auth-model.service";

@Controller("user")
export class UserController {
  constructor(private usersService: UsersService,
              private jwtService: JWTService,
              private userPassService: UserPassService,
              private authModelService: AuthModelService,
              private authService: AuthService,

  ) {
  }
  @Post("update-pass")
  async updatePassword(@Body() dto: {newPassword: string, userId: string, email: string}) {
    const passwordHash = await this.usersService.hashPassword(dto.newPassword);

    await this.userPassService.update({passwordHash, _id: dto.userId});

    const user = await this.authService.login({password: dto.newPassword, email: dto.email});

    return {
      token: user.token
    };
  }
  @UseGuards(AuthGuard)
  @Get()
  getUserById(@Headers("authorization") token: string): Promise<UserModel | null> {
    const jwtPayload = this.jwtService.decodeToken<JwtPayload>(token);
    if (jwtPayload) {
      const { _id } = jwtPayload;
      return this.usersService.getUserById(_id);
    }
    if(!jwtPayload) {
      throw new HttpException('Не предвиденная ошибка, попробуйте позже', HttpStatus.NOT_MODIFIED);
    }
  }

  @UseGuards(AuthGuard)
  @Put("/setFirstEnter")
  async setFirstEnter(@Body() body : setFirstEnterDto, @User('_id') userId: string) {
    const updateUser = await this.usersService.setFirstEnter(userId,body.isFirstEnter)
    if (!updateUser){
      throw new HttpException('Не предвиденная ошибка, попробуйте позже', HttpStatus.NOT_MODIFIED);
    }
    return updateUser
  }

}
