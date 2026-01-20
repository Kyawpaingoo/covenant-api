import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() createClientDto: CreateClientDto,
  ) {
    return this.clientsService.create(user.id, createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for authenticated developer' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.clientsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.clientsService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(user.id, id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.clientsService.remove(user.id, id);
  }
}
