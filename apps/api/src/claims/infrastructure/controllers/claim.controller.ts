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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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
import { ClaimSummaryDto } from '../../application/dtos/claim-summary.dto';

@ApiTags('Claims')
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
  @ApiOperation({ summary: 'Create a new claim' })
  @ApiResponse({
    status: 201,
    description: 'The claim has been successfully created.',
    type: ClaimSummaryDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateClaimDto) {
    const claim = await this.createClaimUseCase.execute(dto);
    return ClaimMapper.toResponse(claim);
  }

  @ApiTags('Damages')
  @Post(':id/damages')
  @ApiOperation({ summary: 'Add a damage to an existing claim' })
  @ApiParam({ name: 'id', description: 'The ID of the claim' })
  @ApiResponse({
    status: 201,
    description: 'The damage has been successfully added.',
    type: ClaimSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async addDamage(@Param('id') id: string, @Body() dto: AddDamageDto) {
    const claim = await this.addDamageUseCase.execute(id, dto);
    return ClaimMapper.toResponse(claim);
  }

  @ApiTags('Damages')
  @Patch(':id/damages/:damageId')
  @ApiOperation({ summary: 'Update a specific damage in a claim' })
  @ApiParam({ name: 'id', description: 'The ID of the claim' })
  @ApiParam({ name: 'damageId', description: 'The ID of the damage' })
  @ApiResponse({
    status: 200,
    description: 'The damage has been successfully updated.',
    type: ClaimSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Claim or Damage not found.' })
  async updateDamage(
    @Param('id') id: string,
    @Param('damageId') damageId: string,
    @Body() dto: UpdateDamageDto,
  ) {
    const claim = await this.updateDamageUseCase.execute(id, damageId, dto);
    return ClaimMapper.toResponse(claim);
  }

  @ApiTags('Damages')
  @Delete(':id/damages/:damageId')
  @ApiOperation({ summary: 'Remove a specific damage from a claim' })
  @ApiParam({ name: 'id', description: 'The ID of the claim' })
  @ApiParam({ name: 'damageId', description: 'The ID of the damage' })
  @ApiResponse({
    status: 204,
    description: 'The damage has been successfully removed.',
  })
  @ApiResponse({ status: 404, description: 'Claim or Damage not found.' })
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
  @ApiOperation({ summary: 'Update claim details or status' })
  @ApiParam({ name: 'id', description: 'The ID of the claim' })
  @ApiResponse({
    status: 200,
    description: 'The claim has been successfully updated.',
    type: ClaimSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async update(@Param('id') id: string, @Body() dto: UpdateClaimDto) {
    const claim = await this.updateClaimUseCase.execute(id, dto);
    return ClaimMapper.toResponse(claim);
  }

  @Get()
  @ApiOperation({ summary: 'Get all claims with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of claims retrieved successfully.',
    type: [ClaimSummaryDto],
  })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.claimRepository.findAll({
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @ApiTags('Damages')
  @Get(':id/damages')
  @ApiOperation({ summary: 'Get all damages of a specific claim' })
  @ApiParam({ name: 'id', description: 'The ID of the claim' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of damages retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async findDamages(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const claim = await this.getClaimByIdUseCase.execute(id);
    const l = limit ? parseInt(limit, 10) : 5;
    const o = offset ? parseInt(offset, 10) : 0;

    const allDamages = claim.damages.map((damage) => ({
      id: damage.id,
      part: damage.part,
      severity: damage.severity,
      imageUrl: damage.imageUrl,
      price: damage.price,
    }));

    const paginatedDamages = allDamages.slice(o, o + l);

    return {
      data: paginatedDamages,
      total: allDamages.length,
      limit: l,
      offset: o,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a claim by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the claim' })
  @ApiResponse({
    status: 200,
    description: 'The claim has been successfully retrieved.',
    type: ClaimSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async findOne(@Param('id') id: string) {
    const claim = await this.getClaimByIdUseCase.execute(id);
    return ClaimMapper.toResponse(claim);
  }
}
