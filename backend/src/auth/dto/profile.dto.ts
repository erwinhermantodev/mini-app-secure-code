import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

// DTO for updating profile
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

// Role DTO nested within Profile Response
export class RoleDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

// Updated Profile Response DTO
export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => RoleDto)
  role: RoleDto;

  @Expose()
  createdAt: Date;
}
