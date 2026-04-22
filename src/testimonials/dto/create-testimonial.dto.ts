import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

const MAX_TESTIMONIAL_WORDS = 23;

@ValidatorConstraint({ name: 'maxWords', async: false })
class MaxWordsConstraint implements ValidatorConstraintInterface {
  validate(value: string | undefined, args: ValidationArguments) {
    if (typeof value !== 'string') return false;

    const maxWords = Number(args.constraints[0]);
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    return wordCount <= maxWords;
  }

  defaultMessage(args: ValidationArguments) {
    return `quote must not exceed ${Number(args.constraints[0])} words`;
  }
}

export class CreateTestimonialDto {
  @IsString()
  @Validate(MaxWordsConstraint, [MAX_TESTIMONIAL_WORDS])
  quote: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  role: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
