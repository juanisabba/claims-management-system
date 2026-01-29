import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseFilters,
} from '@nestjs/common';
import { CreateClaimUseCase } from '../../application/use-cases/create-claim.use-case';
import { AddDamageUseCase } from '../../application/use-cases/add-damage.use-case';
import { UpdateClaimUseCase } from '../../application/use-cases/update-claim.use-case';
import { GetClaimByIdUseCase } from '../../application/use-cases/get-claim-by-id.use-case';
import { CreateClaimDto } from '../../application/dtos/create-claim.dto';
import { AddDamageDto } from '../../application/dtos/add-damage.dto';
import { UpdateClaimDto } from '../../application/dtos/update-claim.dto';
import { DomainExceptionFilter } from '../filters/domain-exceptions.filter';
import { ClaimMapper } from '../persistence/mappers/claim.mapper';
import type { IClaimRepository } from '../../domain/repositories/claim.repository.interface';
import { UpdateDamageUseCase } from 'src/claims/application/use-cases/update-damage.use-case';
import { RemoveDamageUseCase } from 'src/claims/application/use-cases/remove-damage.use-case';
import { UpdateDamageDto } from 'src/claims/application/dtos/update-damage.dto';

@Controller('claims')
@UseFilters(DomainExceptionFilter)
export class ClaimController {
  constructor(
    private readonly createClaimUseCase: CreateClaimUseCase,
    private readonly addDamageUseCase: AddDamageUseCase,
    private readonly updateClaimUseCase: UpdateClaimUseCase,
    private readonly getClaimByIdUseCase: GetClaimByIdUseCase,
    private readonly updateDamageUseCase: UpdateDamageUseCase,
    private readonly removeDamageUseCase: RemoveDamageUseCase,
    @Inject('IClaimRepository')
    private readonly claimRepository: IClaimRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateClaimDto) {
    const claim = await this.createClaimUseCase.execute(dto);
    return ClaimMapper.toResponse(claim);
  }

  @Post(':id/damages')
  async addDamage(@Param('id') id: string, @Body() dto: AddDamageDto) {
    const claim = await this.addDamageUseCase.execute(id, dto);
    return ClaimMapper.toResponse(claim);
  }

  @Patch(':id/damages/:damageId')
  async updateDamage(
    @Param('id') id: string,
    @Param('damageId') damageId: string,
    @Body() dto: UpdateDamageDto,
  ) {
    const claim = await this.updateDamageUseCase.execute(id, damageId, dto);
    return ClaimMapper.toResponse(claim);
  }

  @Delete(':id/damages/:damageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDamage(
    @Param('id') id: string,
    @Param('damageId') damageId: string,
  ) {
    const claim = await this.removeDamageUseCase.execute(id, damageId);
    return ClaimMapper.toResponse(claim);
  }

  // ------------------------

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    const claim = await this.updateClaimUseCase.execute(id, dto);
    return ClaimMapper.toResponse(claim);
  }

  @Get()
  async findAll() {
    const claims = await this.claimRepository.findAll({});
    return claims.map((claim) => ClaimMapper.toResponse(claim));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const claim = await this.getClaimByIdUseCase.execute(id);
    return ClaimMapper.toResponse(claim);
  }
}
