import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";

import { MongooseModule } from "@nestjs/mongoose";
import { AuthModelService } from "./services/auth-model.service";
import { AuthTokenModel, AuthTokenModelSchema } from "./models/auth-token.model";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JWTService } from "./services/jwt.service";
import {UserModule} from "../user/user.module";
import {UserPassService} from "./services/user-pass.service";
import {UserPassModel, UserPassSchema} from "./models/user-pass.model";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthModelService, JwtService, JWTService, UserPassService],
  imports: [
    UserModule,
    JwtModule,
    MongooseModule.forFeature([
      { name: AuthTokenModel.name, schema: AuthTokenModelSchema },
      { name: UserPassModel.name, schema: UserPassSchema }
    ])
  ]
})
export class AuthModule {
}
