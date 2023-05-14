import { ApiProperty } from "@nestjs/swagger";
import { mailExample, passExample } from "../constants";

export class CreateAuthDto {
  @ApiProperty(mailExample)
  readonly email: string;
  @ApiProperty(passExample)
  readonly password: string;
  @ApiProperty({ example: "Jack", description: "User name", required: false })
  readonly name: string;
}
export class CreateAuthDtoGoogle {
  @ApiProperty(mailExample)
  readonly email: string;
}
