import { AddDamageDto } from './add-damage.dto';

export class CreateClaimDto {
  description: string;
  damages?: AddDamageDto[];
}
