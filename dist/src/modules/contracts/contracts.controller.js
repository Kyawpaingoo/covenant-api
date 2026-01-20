"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contracts_service_1 = require("./contracts.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../../common/decorators");
let ContractsController = class ContractsController {
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    create(user, createContractDto) {
        return this.contractsService.create(user.id, createContractDto);
    }
    findAll(user) {
        return this.contractsService.findAll(user.id);
    }
    findOne(user, id) {
        return this.contractsService.findOne(user.id, id);
    }
    update(user, id, updateContractDto) {
        return this.contractsService.update(user.id, id, updateContractDto);
    }
    remove(user, id) {
        return this.contractsService.remove(user.id, id);
    }
    findBySlug(slug, ip) {
        return this.contractsService.findBySlug(slug, ip);
    }
    signContract(slug, signContractDto, req) {
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';
        return this.contractsService.signContract(slug, signContractDto, ipAddress);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)('contracts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new contract' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contract created successfully' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('contracts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all contracts for authenticated developer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contracts retrieved successfully' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('contracts/:id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific contract by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('contracts/:id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a contract (increments version if content changes)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('contracts/:id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a contract' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('portal/contract/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get contract by public slug (no auth required)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)('portal/contract/:slug/sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign a contract (captures IP and timestamp)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contract signed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Contract already signed or voided' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Contract not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SignContractDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "signContract", null);
exports.ContractsController = ContractsController = __decorate([
    (0, swagger_1.ApiTags)('contracts'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map