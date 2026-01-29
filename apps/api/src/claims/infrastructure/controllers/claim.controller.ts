import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseFilters,
} from '@nestjs/common';
import { CreateClaimUseCase } from '../../application/use-cases/create-claim.use-case';
import { AddDamageUseCase } from '../../application/use-cases/add-damage.use-case';
import { TransitionStatusUseCase } from '../../application/use-cases/transition-status.use-case';
import { CreateClaimDto } from '../../application/dtos/create-claim.dto';
import { AddDamageDto } from '../../application/dtos/add-damage.dto';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';
import { DomainExceptionFilter } from '../filters/domain-exceptions.filter';
import type { IClaimRepository } from '../../domain/repositories/claim.repository.interface';

@Controller('claims')
@UseFilters(DomainExceptionFilter)
export class ClaimController {
  constructor(
    private readonly createClaimUseCase: CreateClaimUseCase,
    private readonly addDamageUseCase: AddDamageUseCase,
    private readonly transitionStatusUseCase: TransitionStatusUseCase,
    @Inject('IClaimRepository')
    private readonly claimRepository: IClaimRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateClaimDto) {
    return await this.createClaimUseCase.execute(dto);
  }

  @Post(':id/damages')
  async addDamage(@Param('id') id: string, @Body() dto: AddDamageDto) {
    return await this.addDamageUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ClaimStatus,
  ) {
    return await this.transitionStatusUseCase.execute(id, status);
  }

  @Get()
  async findAll() {
    return await this.claimRepository.findAll({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.claimRepository.findById(id);
  }
}
