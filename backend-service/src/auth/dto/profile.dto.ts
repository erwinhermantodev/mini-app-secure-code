import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(8, 64)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'Password too weak',
    },
  )
  password?: string;

  @Exclude()
  @IsOptional()
  currentPassword?: string;
}

export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;
}
