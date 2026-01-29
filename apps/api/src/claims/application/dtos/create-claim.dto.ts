import { AddDamageDto } from './add-damage.dto';

export class CreateClaimDto {
  title: string;
  description: string;
  damages?: AddDamageDto[];
}
