import {
  IsDateString as DateStringValidator,
  IsEmail as EmailValidator,
  IsEnum as EnumValidator,
  IsOptional as OptionalValidator,
  IsPhoneNumber as PhoneNumberValidator,
  IsString as StringValidator,
  IsUrl as UrlValidator,
} from 'class-validator';

export class UpdateStudentDto {
  @OptionalValidator()
  @StringValidator()
  firstName?: string;

  @OptionalValidator()
  @StringValidator()
  lastName?: string;

  @OptionalValidator()
  @DateStringValidator()
  dob?: string;

  @OptionalValidator()
  @EnumValidator(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

  @OptionalValidator()
  @UrlValidator()
  photoUrl?: string;

  @OptionalValidator()
  @EmailValidator()
  email?: string;

  @OptionalValidator()
  @PhoneNumberValidator()
  phone?: string;

  @OptionalValidator()
  @StringValidator()
  address?: string;

  @OptionalValidator()
  @StringValidator()
  city?: string;

  @OptionalValidator()
  @StringValidator()
  postalCode?: string;

  @OptionalValidator()
  @StringValidator()
  country?: string;

  @OptionalValidator()
  @StringValidator()
  nationality?: string;

  @OptionalValidator()
  @StringValidator()
  emergencyContactName?: string;

  @OptionalValidator()
  @PhoneNumberValidator()
  emergencyContactPhone?: string;

  @OptionalValidator()
  @StringValidator()
  medicalInfo?: string;

  @OptionalValidator()
  @StringValidator()
  studentIdNumber?: string;

  @OptionalValidator()
  @StringValidator()
  className?: string;

  @OptionalValidator()
  @EnumValidator(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'TRANSFERRED';
}
