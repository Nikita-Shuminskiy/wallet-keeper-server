import {Global, Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {MongooseModule} from "@nestjs/mongoose";
import {getMongoConfig} from "./configs/mongo.config";
import {UserModule} from "./modules/user/user.module";
import {FinanceModule} from "./modules/finance/financeModule";
import {AuthModule} from "./modules/authentication/auth.module";
import {JWTService} from "./modules/authentication/services/jwt.service";



@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMongoConfig
        }),
        JwtModule,
        FinanceModule,
        AuthModule,
        UserModule,
    ],
    controllers: [
        AppController,
    ],
    providers: [
         AppService,
         JWTService
    ],
    exports: [
        JwtModule, JWTService
    ],
})
export class AppModule {
}
