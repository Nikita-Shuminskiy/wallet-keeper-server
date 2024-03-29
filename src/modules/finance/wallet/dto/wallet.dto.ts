import {Transform, Type} from "class-transformer";
import {Types} from "mongoose";
import {IsNotEmpty} from "class-validator";
import {toMongoObjectId} from "../../../../common/helpers/handlers/userIdHandler";


export class Wallet {
  @IsNotEmpty()
  @Type(() => String)
  icon: string;
  @IsNotEmpty()
  @Type(() => String)
  name: string;
  @IsNotEmpty()
  @Type(() => Number)
  balance: number;
  @IsNotEmpty()
  @Type(() => String)
  currency: string;
  @Type(() => String)
  totalSpends: string;
  @Type(() => String)
  totalIncome: string;
}

export class getAllWalletsDto {
  // @Type(() => Types.ObjectId)
  // @Transform(toMongoObjectId)
  // userId: string;
}

export class getWalletDto {
  // @Type(() => Types.ObjectId)
  // @Transform(toMongoObjectId)
  // userId: string;
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  walletId: string;
}


export class deleteWalletDto {
  // @Type(() => Types.ObjectId)
  // @Transform(toMongoObjectId)
  // userId: string;
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  walletId: string;
}

export class addWalletDto {
  // @Type(() => Types.ObjectId)
  // @Transform(toMongoObjectId)
  // @IsNotEmpty()
  // userId: string;
  @IsNotEmpty()
  wallet : Wallet;
}


export class updateWalletDto {
  @Type(() => Types.ObjectId)
  @IsNotEmpty()
  @Transform(toMongoObjectId)
  walletId: string;
  wallet : Wallet;
}


export class updateWalletBalanceDto {
  @Type(() => Types.ObjectId)
  @IsNotEmpty()
  @Transform(toMongoObjectId)
  walletId: string;

  @Type(() => Number)
  balance: number;
  @Type(() => Number)
  totalSpends?: number;
  @Type(() => Number)
  totalIncome?: number;
}



